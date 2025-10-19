import { injectable } from 'inversify';
import { IValidationService, ValidationResult, AddressValidation, TransactionValidation } from '../../domain/services/IValidationService';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, ValidationError } from '../../shared/errors/DomainError';
import DOMPurify from 'dompurify';

@injectable()
export class ValidationService implements IValidationService {
  private readonly rateLimitStore = new Map<string, { count: number; resetTime: Date }>();
  private readonly maxAttempts = 10;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  async validateAddress(address: string, network: 'mainnet' | 'testnet' = 'mainnet'): Promise<Result<AddressValidation, DomainError>> {
    try {
      if (!address || typeof address !== 'string') {
        return ResultUtils.success({
          isValid: false,
          errors: ['Address must be a non-empty string'],
          warnings: []
        });
      }

      const sanitizedAddress = address.trim();
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic length check
      if (sanitizedAddress.length < 25 || sanitizedAddress.length > 62) {
        errors.push('Address length must be between 25 and 62 characters');
      }

      // Address type detection and validation
      let addressType: 'p2pkh' | 'p2sh' | 'bech32' | 'bech32m' | undefined;
      let detectedNetwork: 'mainnet' | 'testnet' = network;

      // P2PKH (starts with 1 for mainnet, m/n for testnet)
      if (/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(sanitizedAddress)) {
        addressType = 'p2pkh';
        detectedNetwork = 'mainnet';
      } else if (/^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(sanitizedAddress)) {
        addressType = 'p2pkh';
        detectedNetwork = 'testnet';
      }
      // P2SH (starts with 3 for mainnet, 2 for testnet)
      else if (/^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(sanitizedAddress)) {
        addressType = 'p2sh';
        detectedNetwork = 'mainnet';
      } else if (/^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(sanitizedAddress)) {
        addressType = 'p2sh';
        detectedNetwork = 'testnet';
      }
      // Bech32 (starts with bc1 for mainnet, tb1 for testnet)
      else if (/^bc1[a-z0-9]{39,59}$/.test(sanitizedAddress)) {
        addressType = 'bech32';
        detectedNetwork = 'mainnet';
      } else if (/^tb1[a-z0-9]{39,59}$/.test(sanitizedAddress)) {
        addressType = 'bech32';
        detectedNetwork = 'testnet';
      }
      // Bech32m (Taproot)
      else if (/^bc1p[a-z0-9]{58}$/.test(sanitizedAddress)) {
        addressType = 'bech32m';
        detectedNetwork = 'mainnet';
      } else if (/^tb1p[a-z0-9]{58}$/.test(sanitizedAddress)) {
        addressType = 'bech32m';
        detectedNetwork = 'testnet';
      } else {
        errors.push('Invalid Bitcoin address format');
      }

      // Network mismatch warning
      if (addressType && detectedNetwork !== network) {
        warnings.push(`Address appears to be for ${detectedNetwork} but ${network} was expected`);
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({
        isValid,
        errors,
        warnings,
        addressType,
        network: detectedNetwork
      });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Address validation failed', { error }));
    }
  }

  async validateAmount(amount: string | number | bigint): Promise<Result<ValidationResult, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (amount === null || amount === undefined) {
        errors.push('Amount is required');
        return ResultUtils.success({ isValid: false, errors, warnings });
      }

      let amountValue: bigint;

      try {
        if (typeof amount === 'bigint') {
          amountValue = amount;
        } else if (typeof amount === 'number') {
          if (!Number.isFinite(amount)) {
            errors.push('Amount must be a finite number');
            return ResultUtils.success({ isValid: false, errors, warnings });
          }
          amountValue = BigInt(Math.floor(amount));
        } else {
          // String
          const cleanAmount = amount.toString().trim();
          if (!/^\d+(\.\d+)?$/.test(cleanAmount)) {
            errors.push('Amount must be a valid number');
            return ResultUtils.success({ isValid: false, errors, warnings });
          }

          const floatAmount = parseFloat(cleanAmount);
          amountValue = BigInt(Math.floor(floatAmount * 100000000)); // Convert to satoshis
        }
      } catch {
        errors.push('Invalid amount format');
        return ResultUtils.success({ isValid: false, errors, warnings });
      }

      // Validation checks
      if (amountValue < 0n) {
        errors.push('Amount cannot be negative');
      }

      if (amountValue === 0n) {
        errors.push('Amount must be greater than zero');
      }

      // Dust limit check (546 satoshis)
      if (amountValue > 0n && amountValue < 546n) {
        errors.push('Amount is below dust limit (546 satoshis)');
      }

      // Maximum Bitcoin supply check (21M BTC = 2.1e15 sats)
      const maxSatoshis = 2100000000000000n;
      if (amountValue > maxSatoshis) {
        errors.push('Amount exceeds maximum Bitcoin supply');
      }

      // Warning for large amounts
      if (amountValue > 100000000n) { // 1 BTC
        warnings.push('Large amount detected - please verify carefully');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({ isValid, errors, warnings });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Amount validation failed', { error }));
    }
  }

  async validateTransaction(
    inputs: Array<{ txHash: string; outputIndex: number; amount: bigint }>,
    outputs: Array<{ address: string; amount: bigint }>,
    feeRate?: number
  ): Promise<Result<TransactionValidation, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic structure validation
      if (!Array.isArray(inputs) || inputs.length === 0) {
        errors.push('Transaction must have at least one input');
      }

      if (!Array.isArray(outputs) || outputs.length === 0) {
        errors.push('Transaction must have at least one output');
      }

      // Validate inputs
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];

        if (!input.txHash || typeof input.txHash !== 'string') {
          errors.push(`Input ${i}: Invalid transaction hash`);
        } else if (!/^[a-fA-F0-9]{64}$/.test(input.txHash)) {
          errors.push(`Input ${i}: Transaction hash must be 64 character hex string`);
        }

        if (typeof input.outputIndex !== 'number' || input.outputIndex < 0) {
          errors.push(`Input ${i}: Invalid output index`);
        }

        if (typeof input.amount !== 'bigint' || input.amount <= 0n) {
          errors.push(`Input ${i}: Invalid amount`);
        }
      }

      // Validate outputs
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];

        const addressValidation = await this.validateAddress(output.address);
        if (!addressValidation.success || !addressValidation.value.isValid) {
          errors.push(`Output ${i}: Invalid address`);
        }

        if (typeof output.amount !== 'bigint' || output.amount <= 0n) {
          errors.push(`Output ${i}: Invalid amount`);
        }

        // Check dust limit
        if (output.amount > 0n && output.amount < 546n) {
          errors.push(`Output ${i}: Amount below dust limit`);
        }
      }

      // Calculate totals
      const totalInput = inputs.reduce((sum, input) => sum + input.amount, 0n);
      const totalOutput = outputs.reduce((sum, output) => sum + output.amount, 0n);
      const estimatedFee = totalInput - totalOutput;

      // Fee validation
      if (estimatedFee < 0n) {
        errors.push('Transaction outputs exceed inputs');
      }

      if (estimatedFee === 0n) {
        warnings.push('Zero fee transactions may not be accepted by the network');
      }

      // Estimate transaction size (simplified)
      const estimatedSize = (inputs.length * 148) + (outputs.length * 34) + 10;
      const estimatedVirtualSize = estimatedSize; // Simplified, real calculation depends on witness data

      // Fee rate validation
      let actualFeeRate = 0;
      if (estimatedFee > 0n && estimatedVirtualSize > 0) {
        actualFeeRate = Number(estimatedFee) / estimatedVirtualSize;
      }

      if (feeRate && Math.abs(actualFeeRate - feeRate) > 1) {
        warnings.push(`Actual fee rate (${actualFeeRate.toFixed(2)}) differs from expected (${feeRate})`);
      }

      if (actualFeeRate < 1) {
        warnings.push('Low fee rate may result in slow confirmation');
      }

      if (actualFeeRate > 100) {
        warnings.push('High fee rate - please verify amount');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({
        isValid,
        errors,
        warnings,
        estimatedFee: estimatedFee > 0n ? estimatedFee : undefined,
        feeRate: actualFeeRate,
        size: estimatedSize,
        virtualSize: estimatedVirtualSize
      });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Transaction validation failed', { error }));
    }
  }

  async sanitizeInput(input: string, type: 'text' | 'address' | 'amount' | 'hex'): Promise<Result<string, DomainError>> {
    try {
      if (typeof input !== 'string') {
        return ResultUtils.failure(new ValidationError('Input must be a string'));
      }

      let sanitized = input;

      switch (type) {
        case 'text':
          // Remove HTML and dangerous characters
          sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
          sanitized = sanitized.replace(/[<>'"&]/g, '');
          break;

        case 'address':
          // Keep only valid address characters
          sanitized = input.replace(/[^a-zA-Z0-9]/g, '');
          break;

        case 'amount':
          // Keep only numbers and decimal point
          sanitized = input.replace(/[^0-9.]/g, '');
          // Ensure only one decimal point
          const parts = sanitized.split('.');
          if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
          }
          break;

        case 'hex':
          // Keep only hex characters
          sanitized = input.replace(/[^a-fA-F0-9]/g, '');
          break;

        default:
          return ResultUtils.failure(new ValidationError('Invalid sanitization type'));
      }

      return ResultUtils.success(sanitized);

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Input sanitization failed', { error }));
    }
  }

  async validateMnemonic(mnemonic: string): Promise<Result<ValidationResult, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!mnemonic || typeof mnemonic !== 'string') {
        errors.push('Mnemonic must be a non-empty string');
        return ResultUtils.success({ isValid: false, errors, warnings });
      }

      const words = mnemonic.trim().toLowerCase().split(/\s+/);

      // Check word count
      const validCounts = [12, 15, 18, 21, 24];
      if (!validCounts.includes(words.length)) {
        errors.push('Mnemonic must contain 12, 15, 18, 21, or 24 words');
      }

      // Check for duplicate words
      const uniqueWords = new Set(words);
      if (uniqueWords.size !== words.length) {
        errors.push('Mnemonic cannot contain duplicate words');
      }

      // Basic word validation (simplified - real implementation would use BIP39 wordlist)
      const hasInvalidWords = words.some(word =>
        word.length < 3 || word.length > 8 || !/^[a-z]+$/.test(word)
      );

      if (hasInvalidWords) {
        errors.push('Mnemonic contains invalid words');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({ isValid, errors, warnings });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Mnemonic validation failed', { error }));
    }
  }

  async validatePrivateKey(privateKey: string): Promise<Result<ValidationResult, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!privateKey || typeof privateKey !== 'string') {
        errors.push('Private key must be a non-empty string');
        return ResultUtils.success({ isValid: false, errors, warnings });
      }

      const cleanKey = privateKey.trim();

      // Check format (64 character hex string)
      if (!/^[a-fA-F0-9]{64}$/.test(cleanKey)) {
        errors.push('Private key must be a 64 character hexadecimal string');
      }

      // Check if key is not zero
      if (cleanKey === '0'.repeat(64)) {
        errors.push('Private key cannot be zero');
      }

      // Check if key is within valid range (less than secp256k1 order)
      const maxKey = 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140';
      if (cleanKey.toLowerCase() > maxKey) {
        errors.push('Private key exceeds maximum valid value');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({ isValid, errors, warnings });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Private key validation failed', { error }));
    }
  }

  async validateSignature(signature: string, message: string, publicKey: string): Promise<Result<ValidationResult, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!signature || typeof signature !== 'string') {
        errors.push('Signature is required');
      }

      if (!message || typeof message !== 'string') {
        errors.push('Message is required');
      }

      if (!publicKey || typeof publicKey !== 'string') {
        errors.push('Public key is required');
      }

      // Validate signature format (simplified)
      if (signature && !/^[a-fA-F0-9]+$/.test(signature)) {
        errors.push('Signature must be hexadecimal');
      }

      // Validate public key format
      if (publicKey && !/^[02|03][a-fA-F0-9]{64}$/.test(publicKey)) {
        errors.push('Invalid public key format');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({ isValid, errors, warnings });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Signature validation failed', { error }));
    }
  }

  async validateNetwork(network: string): Promise<Result<ValidationResult, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      const validNetworks = ['mainnet', 'testnet', 'regtest'];

      if (!network || typeof network !== 'string') {
        errors.push('Network must be specified');
      } else if (!validNetworks.includes(network.toLowerCase())) {
        errors.push('Network must be one of: mainnet, testnet, regtest');
      }

      if (network === 'regtest') {
        warnings.push('Regtest network is for development only');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({ isValid, errors, warnings });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Network validation failed', { error }));
    }
  }

  async validateUrl(url: string, allowedDomains?: string[]): Promise<Result<ValidationResult, DomainError>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!url || typeof url !== 'string') {
        errors.push('URL is required');
        return ResultUtils.success({ isValid: false, errors, warnings });
      }

      try {
        const urlObj = new URL(url);

        // Must be HTTPS
        if (urlObj.protocol !== 'https:') {
          errors.push('URL must use HTTPS protocol');
        }

        // Check allowed domains
        if (allowedDomains && allowedDomains.length > 0) {
          const isAllowed = allowedDomains.some(domain =>
            urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
          );

          if (!isAllowed) {
            errors.push('URL domain is not in allowed list');
          }
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
          /bit\.ly|tinyurl|goo\.gl/i, // URL shorteners
          /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP addresses
          /xn--/i // Punycode (potential IDN homograph attack)
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(urlObj.hostname))) {
          warnings.push('URL appears suspicious - please verify carefully');
        }

      } catch {
        errors.push('Invalid URL format');
      }

      const isValid = errors.length === 0;

      return ResultUtils.success({ isValid, errors, warnings });

    } catch (error) {
      return ResultUtils.failure(new ValidationError('URL validation failed', { error }));
    }
  }

  async checkRateLimit(identifier: string, action: string, window: number, maxRequests: number): Promise<Result<boolean, DomainError>> {
    try {
      const key = `${identifier}:${action}`;
      const now = new Date();
      const resetTime = new Date(now.getTime() + window);

      const existing = this.rateLimitStore.get(key);

      if (!existing || existing.resetTime < now) {
        // Create new or reset expired entry
        this.rateLimitStore.set(key, { count: 1, resetTime });
        return ResultUtils.success(true);
      }

      if (existing.count >= maxRequests) {
        return ResultUtils.success(false);
      }

      // Increment count
      existing.count++;
      return ResultUtils.success(true);

    } catch (error) {
      return ResultUtils.failure(new ValidationError('Rate limit check failed', { error }));
    }
  }
}
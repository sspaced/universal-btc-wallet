import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AddressValidation extends ValidationResult {
  addressType?: 'p2pkh' | 'p2sh' | 'bech32' | 'bech32m';
  network?: 'mainnet' | 'testnet';
}

export interface TransactionValidation extends ValidationResult {
  estimatedFee?: bigint;
  feeRate?: number;
  size?: number;
  virtualSize?: number;
}

export interface IValidationService {
  // Address validation
  validateAddress(address: string, network?: 'mainnet' | 'testnet'): Promise<Result<AddressValidation, DomainError>>;

  // Amount validation
  validateAmount(amount: string | number | bigint): Promise<Result<ValidationResult, DomainError>>;

  // Transaction validation
  validateTransaction(
    inputs: Array<{ txHash: string; outputIndex: number; amount: bigint }>,
    outputs: Array<{ address: string; amount: bigint }>,
    feeRate?: number
  ): Promise<Result<TransactionValidation, DomainError>>;

  // Input sanitization
  sanitizeInput(input: string, type: 'text' | 'address' | 'amount' | 'hex'): Promise<Result<string, DomainError>>;

  // Mnemonic validation
  validateMnemonic(mnemonic: string): Promise<Result<ValidationResult, DomainError>>;

  // Private key validation
  validatePrivateKey(privateKey: string): Promise<Result<ValidationResult, DomainError>>;

  // Signature validation
  validateSignature(signature: string, message: string, publicKey: string): Promise<Result<ValidationResult, DomainError>>;

  // Network validation
  validateNetwork(network: string): Promise<Result<ValidationResult, DomainError>>;

  // URL validation
  validateUrl(url: string, allowedDomains?: string[]): Promise<Result<ValidationResult, DomainError>>;

  // Rate limiting validation
  checkRateLimit(identifier: string, action: string, window: number, maxRequests: number): Promise<Result<boolean, DomainError>>;
}
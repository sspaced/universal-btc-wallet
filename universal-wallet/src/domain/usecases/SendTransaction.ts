import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, ValidationError, BusinessRuleViolation, SecurityError } from '../../shared/errors/DomainError';
import { Transaction, TransactionId, TransactionInput, TransactionOutput } from '../entities/Transaction';
import { WalletId } from '../entities/Wallet';
import { BitcoinAddress, Amount, TransactionHash } from '../../shared/types/ValueObject';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { IWalletRepository } from '../repositories/IWalletRepository';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { ICryptoService } from '../services/ICryptoService';
import { IValidationService } from '../services/IValidationService';
import { ISecurityService } from '../services/ISecurityService';

export interface SendTransactionRequest {
  walletId: WalletId;
  fromAddress: BitcoinAddress;
  toAddress: BitcoinAddress;
  amount: Amount;
  feeRate?: number; // sats per byte
  memo?: string;
  password: string;
}

export interface SendTransactionResponse {
  transaction: Transaction;
  txHash?: string;
  estimatedConfirmationTime: number; // minutes
}

export class SendTransaction {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly cryptoService: ICryptoService,
    private readonly validationService: IValidationService,
    private readonly securityService: ISecurityService
  ) {}

  async execute(request: SendTransactionRequest): Promise<Result<SendTransactionResponse, DomainError>> {
    try {
      // Validate request
      const validationResult = await this.validateRequest(request);
      if (!validationResult.success) {
        return validationResult;
      }

      // Check wallet exists and is unlocked
      const walletResult = await this.walletRepository.findById(request.walletId);
      if (!walletResult.success) {
        return walletResult;
      }

      if (!walletResult.value) {
        return ResultUtils.failure(new ValidationError('Wallet not found'));
      }

      const wallet = walletResult.value;
      if (wallet.isLocked()) {
        return ResultUtils.failure(new SecurityError('Wallet is locked'));
      }

      // Find account for from address
      const accountResult = await this.accountRepository.findByAddress(request.fromAddress);
      if (!accountResult.success) {
        return accountResult;
      }

      if (!accountResult.value) {
        return ResultUtils.failure(new ValidationError('Account not found for address'));
      }

      const account = accountResult.value;

      // Check sufficient balance
      const totalAmount = request.amount.add(new Amount(BigInt(request.feeRate || 1000), 'sats'));
      if (account.getBalance().getValue() < totalAmount.getValue()) {
        return ResultUtils.failure(new BusinessRuleViolation('Insufficient balance'));
      }

      // Validate addresses
      const fromAddressValidation = await this.validationService.validateAddress(request.fromAddress.toString());
      if (!fromAddressValidation.success || !fromAddressValidation.value.isValid) {
        return ResultUtils.failure(new ValidationError('Invalid from address'));
      }

      const toAddressValidation = await this.validationService.validateAddress(request.toAddress.toString());
      if (!toAddressValidation.success || !toAddressValidation.value.isValid) {
        return ResultUtils.failure(new ValidationError('Invalid to address'));
      }

      // Check for self-transfer
      if (request.fromAddress.equals(request.toAddress)) {
        return ResultUtils.failure(new BusinessRuleViolation('Cannot send to same address'));
      }

      // Create transaction inputs and outputs
      const fee = new Amount(BigInt(request.feeRate || 1000), 'sats');

      // Simplified UTXO selection (in real implementation, implement proper UTXO selection)
      const inputs: TransactionInput[] = [{
        txHash: new TransactionHash('0'.repeat(64)), // Placeholder
        outputIndex: 0,
        address: request.fromAddress,
        amount: totalAmount
      }];

      const outputs: TransactionOutput[] = [{
        address: request.toAddress,
        amount: request.amount
      }];

      // Add change output if necessary
      const changeAmount = account.getBalance().subtract(totalAmount);
      if (changeAmount.getValue() > 0n) {
        outputs.push({
          address: request.fromAddress, // Send change back to sender
          amount: changeAmount
        });
      }

      // Validate transaction
      const txValidation = await this.validationService.validateTransaction(
        inputs.map(input => ({
          txHash: input.txHash.toString(),
          outputIndex: input.outputIndex,
          amount: input.amount.getValue()
        })),
        outputs.map(output => ({
          address: output.address.toString(),
          amount: output.amount.getValue()
        })),
        request.feeRate
      );

      if (!txValidation.success || !txValidation.value.isValid) {
        return ResultUtils.failure(new ValidationError('Invalid transaction'));
      }

      // Create transaction entity
      const transactionId: TransactionId = { value: crypto.randomUUID() };
      const transaction = new Transaction({
        id: transactionId,
        type: 'send',
        status: 'pending',
        inputs,
        outputs,
        fee,
        confirmations: 0,
        createdAt: new Date(),
        memo: request.memo
      });

      // Save transaction
      const saveResult = await this.transactionRepository.save(transaction);
      if (!saveResult.success) {
        return saveResult;
      }

      // Update account balance (optimistic update)
      const updatedAccount = account.updateBalance(
        account.getBalance().subtract(totalAmount)
      );
      await this.accountRepository.save(updatedAccount);

      // Update wallet balance
      const updatedWallet = wallet.updateBalance(
        wallet.getBalance().subtract(totalAmount)
      );
      await this.walletRepository.save(updatedWallet);

      // Log security event
      await this.securityService.logSecurityEvent({
        type: 'transaction_sent',
        severity: 'medium',
        details: {
          walletId: request.walletId.value,
          transactionId: transactionId.value,
          amount: request.amount.getValue().toString(),
          toAddress: request.toAddress.toString(),
          fee: fee.getValue().toString()
        }
      });

      // Estimate confirmation time based on fee rate
      const estimatedConfirmationTime = this.estimateConfirmationTime(request.feeRate || 1);

      return ResultUtils.success({
        transaction,
        estimatedConfirmationTime
      });

    } catch (error) {
      await this.securityService.logSecurityEvent({
        type: 'transaction_send_error',
        severity: 'high',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          walletId: request.walletId.value,
          amount: request.amount.getValue().toString()
        }
      });

      return ResultUtils.failure(new DomainError('Failed to send transaction', { error }));
    }
  }

  private async validateRequest(request: SendTransactionRequest): Promise<Result<void, DomainError>> {
    if (!request.walletId?.value) {
      return ResultUtils.failure(new ValidationError('Wallet ID is required'));
    }

    if (!request.fromAddress) {
      return ResultUtils.failure(new ValidationError('From address is required'));
    }

    if (!request.toAddress) {
      return ResultUtils.failure(new ValidationError('To address is required'));
    }

    if (!request.amount || request.amount.getValue() <= 0n) {
      return ResultUtils.failure(new ValidationError('Amount must be positive'));
    }

    // Check minimum amount (dust limit)
    const dustLimit = 546n; // 546 sats
    if (request.amount.getValue() < dustLimit) {
      return ResultUtils.failure(new ValidationError('Amount below dust limit'));
    }

    // Check maximum amount (safety limit)
    const maxAmount = 21000000n * 100000000n; // 21M BTC in sats
    if (request.amount.getValue() > maxAmount) {
      return ResultUtils.failure(new ValidationError('Amount exceeds maximum Bitcoin supply'));
    }

    if (request.feeRate && (request.feeRate < 1 || request.feeRate > 1000)) {
      return ResultUtils.failure(new ValidationError('Fee rate must be between 1 and 1000 sats/byte'));
    }

    if (request.memo && request.memo.length > 200) {
      return ResultUtils.failure(new ValidationError('Memo cannot exceed 200 characters'));
    }

    if (!request.password) {
      return ResultUtils.failure(new ValidationError('Password is required'));
    }

    return ResultUtils.success(undefined);
  }

  private estimateConfirmationTime(feeRate: number): number {
    // Simplified confirmation time estimation based on fee rate
    if (feeRate >= 50) return 10; // ~10 minutes for high fee
    if (feeRate >= 20) return 30; // ~30 minutes for medium fee
    if (feeRate >= 10) return 60; // ~1 hour for low fee
    return 180; // ~3 hours for very low fee
  }
}
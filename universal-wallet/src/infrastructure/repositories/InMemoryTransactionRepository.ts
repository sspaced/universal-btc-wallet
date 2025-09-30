import { injectable } from 'inversify';
import { ITransactionRepository, TransactionQuery } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionId, TransactionStatus } from '../../domain/entities/Transaction';
import { WalletId } from '../../domain/entities/Wallet';
import { BitcoinAddress, TransactionHash } from '../../shared/types/ValueObject';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, NotFoundError } from '../../shared/errors/DomainError';

@injectable()
export class InMemoryTransactionRepository implements ITransactionRepository {
  private readonly transactions = new Map<string, Transaction>();

  async save(transaction: Transaction): Promise<Result<void, DomainError>> {
    try {
      const id = transaction.getId().value;
      this.transactions.set(id, transaction);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to save transaction', { error }));
    }
  }

  async findById(id: TransactionId): Promise<Result<Transaction | null, DomainError>> {
    try {
      const transaction = this.transactions.get(id.value) || null;
      return ResultUtils.success(transaction);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find transaction', { error }));
    }
  }

  async findByHash(hash: TransactionHash): Promise<Result<Transaction | null, DomainError>> {
    try {
      for (const transaction of this.transactions.values()) {
        if (transaction.getHash()?.equals(hash)) {
          return ResultUtils.success(transaction);
        }
      }
      return ResultUtils.success(null);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find transaction by hash', { error }));
    }
  }

  async findByWallet(walletId: WalletId): Promise<Result<Transaction[], DomainError>> {
    try {
      const transactions: Transaction[] = [];

      // This is simplified - in a real implementation, you'd need to track wallet-transaction relationships
      for (const transaction of this.transactions.values()) {
        // For now, return all transactions (in real implementation, filter by wallet)
        transactions.push(transaction);
      }

      return ResultUtils.success(transactions);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find transactions by wallet', { error }));
    }
  }

  async findByAddress(address: BitcoinAddress): Promise<Result<Transaction[], DomainError>> {
    try {
      const transactions: Transaction[] = [];

      for (const transaction of this.transactions.values()) {
        const inputs = transaction.getInputs();
        const outputs = transaction.getOutputs();

        const hasAddress = inputs.some(input => input.address.equals(address)) ||
                          outputs.some(output => output.address.equals(address));

        if (hasAddress) {
          transactions.push(transaction);
        }
      }

      return ResultUtils.success(transactions);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find transactions by address', { error }));
    }
  }

  async findPending(): Promise<Result<Transaction[], DomainError>> {
    try {
      const pendingTransactions: Transaction[] = [];

      for (const transaction of this.transactions.values()) {
        if (transaction.isPending()) {
          pendingTransactions.push(transaction);
        }
      }

      return ResultUtils.success(pendingTransactions);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find pending transactions', { error }));
    }
  }

  async query(params: TransactionQuery): Promise<Result<Transaction[], DomainError>> {
    try {
      let transactions = Array.from(this.transactions.values());

      // Filter by wallet ID
      if (params.walletId) {
        // Simplified filtering - in real implementation, use proper wallet-transaction mapping
        transactions = transactions;
      }

      // Filter by address
      if (params.address) {
        transactions = transactions.filter(tx => {
          const inputs = tx.getInputs();
          const outputs = tx.getOutputs();

          return inputs.some(input => input.address.equals(params.address!)) ||
                 outputs.some(output => output.address.equals(params.address!));
        });
      }

      // Filter by status
      if (params.status) {
        transactions = transactions.filter(tx => tx.getStatus() === params.status);
      }

      // Filter by date range
      if (params.startDate) {
        transactions = transactions.filter(tx => tx.getCreatedAt() >= params.startDate!);
      }

      if (params.endDate) {
        transactions = transactions.filter(tx => tx.getCreatedAt() <= params.endDate!);
      }

      // Sort by creation date (newest first)
      transactions.sort((a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime());

      // Apply pagination
      if (params.offset) {
        transactions = transactions.slice(params.offset);
      }

      if (params.limit) {
        transactions = transactions.slice(0, params.limit);
      }

      return ResultUtils.success(transactions);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to query transactions', { error }));
    }
  }

  async delete(id: TransactionId): Promise<Result<void, DomainError>> {
    try {
      const existed = this.transactions.delete(id.value);
      if (!existed) {
        return ResultUtils.failure(new NotFoundError('Transaction not found'));
      }
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to delete transaction', { error }));
    }
  }

  async updateStatus(id: TransactionId, status: TransactionStatus): Promise<Result<void, DomainError>> {
    try {
      const transaction = this.transactions.get(id.value);
      if (!transaction) {
        return ResultUtils.failure(new NotFoundError('Transaction not found'));
      }

      let updatedTransaction: Transaction;

      switch (status) {
        case 'confirmed':
          // This is simplified - in real implementation, you'd need more data for confirmation
          const mockHash = new TransactionHash('a'.repeat(64));
          updatedTransaction = transaction.confirm(700000, mockHash);
          break;
        case 'failed':
          updatedTransaction = transaction.fail();
          break;
        case 'cancelled':
          updatedTransaction = transaction.cancel();
          break;
        default:
          return ResultUtils.failure(new DomainError('Invalid status transition'));
      }

      this.transactions.set(id.value, updatedTransaction);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to update transaction status', { error }));
    }
  }
}
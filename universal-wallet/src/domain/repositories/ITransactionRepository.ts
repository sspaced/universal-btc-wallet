import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';
import { Transaction, TransactionId, TransactionStatus } from '../entities/Transaction';
import { WalletId } from '../entities/Wallet';
import { BitcoinAddress, TransactionHash } from '../../shared/types/ValueObject';

export interface TransactionQuery {
  walletId?: WalletId;
  address?: BitcoinAddress;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<Result<void, DomainError>>;
  findById(id: TransactionId): Promise<Result<Transaction | null, DomainError>>;
  findByHash(hash: TransactionHash): Promise<Result<Transaction | null, DomainError>>;
  findByWallet(walletId: WalletId): Promise<Result<Transaction[], DomainError>>;
  findByAddress(address: BitcoinAddress): Promise<Result<Transaction[], DomainError>>;
  findPending(): Promise<Result<Transaction[], DomainError>>;
  query(params: TransactionQuery): Promise<Result<Transaction[], DomainError>>;
  delete(id: TransactionId): Promise<Result<void, DomainError>>;
  updateStatus(id: TransactionId, status: TransactionStatus): Promise<Result<void, DomainError>>;
}
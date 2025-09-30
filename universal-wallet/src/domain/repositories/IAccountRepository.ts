import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';
import { Account, AccountId, AccountType } from '../entities/Account';
import { WalletId } from '../entities/Wallet';
import { BitcoinAddress } from '../../shared/types/ValueObject';

export interface IAccountRepository {
  save(account: Account): Promise<Result<void, DomainError>>;
  findById(id: AccountId): Promise<Result<Account | null, DomainError>>;
  findByWallet(walletId: WalletId): Promise<Result<Account[], DomainError>>;
  findByAddress(address: BitcoinAddress): Promise<Result<Account | null, DomainError>>;
  findByType(walletId: WalletId, type: AccountType): Promise<Result<Account[], DomainError>>;
  findActive(walletId: WalletId): Promise<Result<Account[], DomainError>>;
  findUnused(walletId: WalletId): Promise<Result<Account[], DomainError>>;
  delete(id: AccountId): Promise<Result<void, DomainError>>;
  getNextDerivationIndex(walletId: WalletId, type: AccountType): Promise<Result<number, DomainError>>;
}
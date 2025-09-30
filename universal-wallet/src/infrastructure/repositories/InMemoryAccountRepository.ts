import { injectable } from 'inversify';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account, AccountId, AccountType } from '../../domain/entities/Account';
import { WalletId } from '../../domain/entities/Wallet';
import { BitcoinAddress } from '../../shared/types/ValueObject';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, NotFoundError } from '../../shared/errors/DomainError';

@injectable()
export class InMemoryAccountRepository implements IAccountRepository {
  private readonly accounts = new Map<string, Account>();

  async save(account: Account): Promise<Result<void, DomainError>> {
    try {
      const id = account.getId().value;
      this.accounts.set(id, account);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to save account', { error }));
    }
  }

  async findById(id: AccountId): Promise<Result<Account | null, DomainError>> {
    try {
      const account = this.accounts.get(id.value) || null;
      return ResultUtils.success(account);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find account', { error }));
    }
  }

  async findByWallet(walletId: WalletId): Promise<Result<Account[], DomainError>> {
    try {
      const accounts: Account[] = [];

      for (const account of this.accounts.values()) {
        if (account.getWalletId().value === walletId.value) {
          accounts.push(account);
        }
      }

      return ResultUtils.success(accounts);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find accounts by wallet', { error }));
    }
  }

  async findByAddress(address: BitcoinAddress): Promise<Result<Account | null, DomainError>> {
    try {
      for (const account of this.accounts.values()) {
        if (account.getAddress().equals(address)) {
          return ResultUtils.success(account);
        }
      }
      return ResultUtils.success(null);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find account by address', { error }));
    }
  }

  async findByType(walletId: WalletId, type: AccountType): Promise<Result<Account[], DomainError>> {
    try {
      const accounts: Account[] = [];

      for (const account of this.accounts.values()) {
        if (account.getWalletId().value === walletId.value && account.getType() === type) {
          accounts.push(account);
        }
      }

      return ResultUtils.success(accounts);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find accounts by type', { error }));
    }
  }

  async findActive(walletId: WalletId): Promise<Result<Account[], DomainError>> {
    try {
      const accounts: Account[] = [];

      for (const account of this.accounts.values()) {
        if (account.getWalletId().value === walletId.value && account.isActive()) {
          accounts.push(account);
        }
      }

      return ResultUtils.success(accounts);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find active accounts', { error }));
    }
  }

  async findUnused(walletId: WalletId): Promise<Result<Account[], DomainError>> {
    try {
      const accounts: Account[] = [];

      for (const account of this.accounts.values()) {
        if (account.getWalletId().value === walletId.value && !account.hasBeenUsed()) {
          accounts.push(account);
        }
      }

      return ResultUtils.success(accounts);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find unused accounts', { error }));
    }
  }

  async delete(id: AccountId): Promise<Result<void, DomainError>> {
    try {
      const existed = this.accounts.delete(id.value);
      if (!existed) {
        return ResultUtils.failure(new NotFoundError('Account not found'));
      }
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to delete account', { error }));
    }
  }

  async getNextDerivationIndex(walletId: WalletId, type: AccountType): Promise<Result<number, DomainError>> {
    try {
      let highestIndex = -1;

      for (const account of this.accounts.values()) {
        if (account.getWalletId().value === walletId.value && account.getType() === type) {
          const index = account.getDerivationIndex();
          if (index > highestIndex) {
            highestIndex = index;
          }
        }
      }

      return ResultUtils.success(highestIndex + 1);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to get next derivation index', { error }));
    }
  }
}
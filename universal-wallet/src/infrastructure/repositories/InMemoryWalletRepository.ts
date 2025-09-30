import { injectable } from 'inversify';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { Wallet, WalletId } from '../../domain/entities/Wallet';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, NotFoundError } from '../../shared/errors/DomainError';

@injectable()
export class InMemoryWalletRepository implements IWalletRepository {
  private readonly wallets = new Map<string, Wallet>();

  async save(wallet: Wallet): Promise<Result<void, DomainError>> {
    try {
      const id = wallet.getId().value;
      this.wallets.set(id, wallet);
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to save wallet', { error }));
    }
  }

  async findById(id: WalletId): Promise<Result<Wallet | null, DomainError>> {
    try {
      const wallet = this.wallets.get(id.value) || null;
      return ResultUtils.success(wallet);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find wallet', { error }));
    }
  }

  async findAll(): Promise<Result<Wallet[], DomainError>> {
    try {
      const wallets = Array.from(this.wallets.values());
      return ResultUtils.success(wallets);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find wallets', { error }));
    }
  }

  async delete(id: WalletId): Promise<Result<void, DomainError>> {
    try {
      const existed = this.wallets.delete(id.value);
      if (!existed) {
        return ResultUtils.failure(new NotFoundError('Wallet not found'));
      }
      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to delete wallet', { error }));
    }
  }

  async exists(id: WalletId): Promise<Result<boolean, DomainError>> {
    try {
      const exists = this.wallets.has(id.value);
      return ResultUtils.success(exists);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to check wallet existence', { error }));
    }
  }

  async findByName(name: string): Promise<Result<Wallet | null, DomainError>> {
    try {
      for (const wallet of this.wallets.values()) {
        if (wallet.getName() === name) {
          return ResultUtils.success(wallet);
        }
      }
      return ResultUtils.success(null);
    } catch (error) {
      return ResultUtils.failure(new DomainError('Failed to find wallet by name', { error }));
    }
  }
}
import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';
import { Wallet, WalletId } from '../entities/Wallet';

export interface IWalletRepository {
  save(wallet: Wallet): Promise<Result<void, DomainError>>;
  findById(id: WalletId): Promise<Result<Wallet | null, DomainError>>;
  findAll(): Promise<Result<Wallet[], DomainError>>;
  delete(id: WalletId): Promise<Result<void, DomainError>>;
  exists(id: WalletId): Promise<Result<boolean, DomainError>>;
  findByName(name: string): Promise<Result<Wallet | null, DomainError>>;
}
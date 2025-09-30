import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';
import { Wallet, WalletId } from '../../domain/entities/Wallet';
import { CreateWallet, CreateWalletRequest, CreateWalletResponse } from '../../domain/usecases/CreateWallet';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { ICryptoService } from '../../domain/services/ICryptoService';
import { ISecurityService } from '../../domain/services/ISecurityService';

export interface WalletSummary {
  id: string;
  name: string;
  balance: string;
  balanceUnit: 'BTC' | 'sats';
  addressCount: number;
  isLocked: boolean;
  lastAccessedAt: string;
}

export class WalletService {
  private readonly createWalletUseCase: CreateWallet;

  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly cryptoService: ICryptoService,
    private readonly securityService: ISecurityService
  ) {
    this.createWalletUseCase = new CreateWallet(
      walletRepository,
      accountRepository,
      cryptoService,
      securityService
    );
  }

  async createWallet(request: CreateWalletRequest): Promise<Result<CreateWalletResponse, DomainError>> {
    return await this.createWalletUseCase.execute(request);
  }

  async getWallet(walletId: WalletId): Promise<Result<Wallet | null, DomainError>> {
    return await this.walletRepository.findById(walletId);
  }

  async getAllWallets(): Promise<Result<WalletSummary[], DomainError>> {
    const walletsResult = await this.walletRepository.findAll();
    if (!walletsResult.success) {
      return walletsResult;
    }

    const summaries: WalletSummary[] = walletsResult.value.map(wallet => ({
      id: wallet.getId().value,
      name: wallet.getName(),
      balance: wallet.getBalance().getValue().toString(),
      balanceUnit: wallet.getBalance().getUnit(),
      addressCount: wallet.getAddresses().length,
      isLocked: wallet.isLocked(),
      lastAccessedAt: wallet.getLastAccessedAt().toISOString()
    }));

    return ResultUtils.success(summaries);
  }

  async lockWallet(walletId: WalletId): Promise<Result<void, DomainError>> {
    const walletResult = await this.walletRepository.findById(walletId);
    if (!walletResult.success) {
      return walletResult;
    }

    if (!walletResult.value) {
      return ResultUtils.failure(new DomainError('Wallet not found'));
    }

    const lockedWallet = walletResult.value.lock();
    const saveResult = await this.walletRepository.save(lockedWallet);

    if (saveResult.success) {
      await this.securityService.logSecurityEvent({
        type: 'wallet_locked',
        severity: 'low',
        details: { walletId: walletId.value }
      });
    }

    return saveResult;
  }

  async unlockWallet(walletId: WalletId, password: string): Promise<Result<void, DomainError>> {
    // Verify password (simplified - in real implementation, verify against stored hash)
    const authResult = await this.securityService.authenticate({ password });
    if (!authResult.success || !authResult.value.isAuthenticated) {
      await this.securityService.logSecurityEvent({
        type: 'wallet_unlock_failed',
        severity: 'medium',
        details: { walletId: walletId.value }
      });
      return ResultUtils.failure(new DomainError('Invalid password'));
    }

    const walletResult = await this.walletRepository.findById(walletId);
    if (!walletResult.success) {
      return walletResult;
    }

    if (!walletResult.value) {
      return ResultUtils.failure(new DomainError('Wallet not found'));
    }

    const unlockedWallet = walletResult.value.unlock();
    const saveResult = await this.walletRepository.save(unlockedWallet);

    if (saveResult.success) {
      await this.securityService.logSecurityEvent({
        type: 'wallet_unlocked',
        severity: 'low',
        details: { walletId: walletId.value }
      });
    }

    return saveResult;
  }

  async renameWallet(walletId: WalletId, newName: string): Promise<Result<void, DomainError>> {
    const walletResult = await this.walletRepository.findById(walletId);
    if (!walletResult.success) {
      return walletResult;
    }

    if (!walletResult.value) {
      return ResultUtils.failure(new DomainError('Wallet not found'));
    }

    const renamedWallet = walletResult.value.rename(newName);
    return await this.walletRepository.save(renamedWallet);
  }

  async deleteWallet(walletId: WalletId): Promise<Result<void, DomainError>> {
    // First verify wallet exists
    const walletResult = await this.walletRepository.findById(walletId);
    if (!walletResult.success) {
      return walletResult;
    }

    if (!walletResult.value) {
      return ResultUtils.failure(new DomainError('Wallet not found'));
    }

    // Delete all associated accounts first
    const accountsResult = await this.accountRepository.findByWallet(walletId);
    if (!accountsResult.success) {
      return accountsResult;
    }

    for (const account of accountsResult.value) {
      const deleteAccountResult = await this.accountRepository.delete(account.getId());
      if (!deleteAccountResult.success) {
        return deleteAccountResult;
      }
    }

    // Delete the wallet
    const deleteResult = await this.walletRepository.delete(walletId);

    if (deleteResult.success) {
      await this.securityService.logSecurityEvent({
        type: 'wallet_deleted',
        severity: 'medium',
        details: {
          walletId: walletId.value,
          walletName: walletResult.value.getName()
        }
      });
    }

    return deleteResult;
  }

  async getWalletExists(walletId: WalletId): Promise<Result<boolean, DomainError>> {
    return await this.walletRepository.exists(walletId);
  }
}
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, ValidationError, CryptoError } from '../../shared/errors/DomainError';
import { Wallet, WalletId } from '../entities/Wallet';
import { Account, AccountId } from '../entities/Account';
import { BitcoinAddress, Amount } from '../../shared/types/ValueObject';
import { IWalletRepository } from '../repositories/IWalletRepository';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { ICryptoService } from '../services/ICryptoService';
import { ISecurityService } from '../services/ISecurityService';

export interface CreateWalletRequest {
  name: string;
  mnemonic?: string;
  password: string;
}

export interface CreateWalletResponse {
  wallet: Wallet;
  mainAccount: Account;
  mnemonic: string;
  seedPhrase: string[];
}

export class CreateWallet {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly cryptoService: ICryptoService,
    private readonly securityService: ISecurityService
  ) {}

  async execute(request: CreateWalletRequest): Promise<Result<CreateWalletResponse, DomainError>> {
    try {
      // Validate input
      const validationResult = await this.validateRequest(request);
      if (!validationResult.success) {
        return validationResult;
      }

      // Check password strength
      const passwordCheck = await this.securityService.checkPasswordStrength(request.password);
      if (!passwordCheck.success) {
        return passwordCheck;
      }

      if (passwordCheck.value.score < 60) {
        return ResultUtils.failure(new ValidationError('Password does not meet security requirements'));
      }

      // Check if wallet name already exists
      const existingWallet = await this.walletRepository.findByName(request.name);
      if (!existingWallet.success) {
        return existingWallet;
      }

      if (existingWallet.value) {
        return ResultUtils.failure(new ValidationError('Wallet name already exists'));
      }

      // Create HD wallet
      const hdWalletResult = await this.cryptoService.createHDWallet(request.mnemonic);
      if (!hdWalletResult.success) {
        return hdWalletResult;
      }

      const hdWallet = hdWalletResult.value;

      // Generate wallet ID
      const walletId: WalletId = { value: crypto.randomUUID() };

      // Derive main account key pair
      const mainAccountPath = "m/44'/0'/0'/0/0";
      const keyPairResult = await this.cryptoService.deriveKeyPair(hdWallet.rootKey, mainAccountPath);
      if (!keyPairResult.success) {
        return keyPairResult;
      }

      const keyPair = keyPairResult.value;

      // Generate Bitcoin address
      const addressResult = await this.cryptoService.generateAddress(keyPair.publicKey);
      if (!addressResult.success) {
        return addressResult;
      }

      const address = new BitcoinAddress(addressResult.value);

      // Create main account
      const accountId: AccountId = { value: crypto.randomUUID() };
      const mainAccount = new Account({
        id: accountId,
        walletId,
        name: 'Main Account',
        type: 'main',
        derivationPath: mainAccountPath,
        publicKey: keyPair.publicKey,
        address,
        balance: new Amount(0n, 'sats'),
        isActive: true,
        createdAt: new Date()
      });

      // Create wallet
      const wallet = new Wallet({
        id: walletId,
        name: request.name,
        addresses: [address],
        balance: new Amount(0n, 'sats'),
        isLocked: false,
        createdAt: new Date(),
        lastAccessedAt: new Date()
      });

      // Save wallet and account
      const saveWalletResult = await this.walletRepository.save(wallet);
      if (!saveWalletResult.success) {
        return saveWalletResult;
      }

      const saveAccountResult = await this.accountRepository.save(mainAccount);
      if (!saveAccountResult.success) {
        return saveAccountResult;
      }

      // Log security event
      await this.securityService.logSecurityEvent({
        type: 'wallet_created',
        severity: 'low',
        details: {
          walletId: walletId.value,
          walletName: request.name,
          timestamp: new Date().toISOString()
        }
      });

      return ResultUtils.success({
        wallet,
        mainAccount,
        mnemonic: hdWallet.mnemonic,
        seedPhrase: hdWallet.mnemonic.split(' ')
      });

    } catch (error) {
      await this.securityService.logSecurityEvent({
        type: 'wallet_creation_error',
        severity: 'high',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          walletName: request.name
        }
      });

      return ResultUtils.failure(new CryptoError('Failed to create wallet', { error }));
    }
  }

  private async validateRequest(request: CreateWalletRequest): Promise<Result<void, DomainError>> {
    if (!request.name || request.name.trim().length === 0) {
      return ResultUtils.failure(new ValidationError('Wallet name is required'));
    }

    if (request.name.length > 50) {
      return ResultUtils.failure(new ValidationError('Wallet name cannot exceed 50 characters'));
    }

    if (!request.password) {
      return ResultUtils.failure(new ValidationError('Password is required'));
    }

    if (request.password.length < 8) {
      return ResultUtils.failure(new ValidationError('Password must be at least 8 characters'));
    }

    if (request.password.length > 128) {
      return ResultUtils.failure(new ValidationError('Password cannot exceed 128 characters'));
    }

    // Validate mnemonic if provided
    if (request.mnemonic) {
      const mnemonicValidation = await this.cryptoService.validateMnemonic(request.mnemonic);
      if (!mnemonicValidation.success) {
        return mnemonicValidation;
      }

      if (!mnemonicValidation.value) {
        return ResultUtils.failure(new ValidationError('Invalid mnemonic phrase'));
      }
    }

    return ResultUtils.success(undefined);
  }
}
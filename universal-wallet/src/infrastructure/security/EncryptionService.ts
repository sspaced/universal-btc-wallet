import { ICryptoService, KeyPair, HDWallet, EncryptedData, SignatureData } from '../../domain/services/ICryptoService';
import { Result, ResultUtils } from '../../shared/types/Result';
import { DomainError, CryptoError, ValidationError } from '../../shared/errors/DomainError';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as crypto from 'crypto';
import { payments, networks } from 'bitcoinjs-lib';

export class EncryptionService implements ICryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 32;
  private readonly tagLength = 16;
  private readonly iterations = 100000;

  async generateSecureRandom(bytes: number): Promise<Result<Buffer, DomainError>> {
    try {
      if (bytes <= 0 || bytes > 1024) {
        return ResultUtils.failure(new ValidationError('Invalid byte length'));
      }
      const randomBytes = crypto.randomBytes(bytes);
      return ResultUtils.success(randomBytes);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to generate secure random bytes', { error }));
    }
  }

  async generateMnemonic(strength: 128 | 160 | 192 | 224 | 256 = 256): Promise<Result<string, DomainError>> {
    try {
      const validStrengths = [128, 160, 192, 224, 256];
      if (!validStrengths.includes(strength)) {
        return ResultUtils.failure(new ValidationError('Invalid mnemonic strength'));
      }

      const mnemonic = bip39.generateMnemonic(strength);
      return ResultUtils.success(mnemonic);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to generate mnemonic', { error }));
    }
  }

  async createHDWallet(mnemonic?: string): Promise<Result<HDWallet, DomainError>> {
    try {
      if (!mnemonic) {
        const mnemonicResult = await this.generateMnemonic();
        if (!mnemonicResult.success) {
          return mnemonicResult;
        }
        mnemonic = mnemonicResult.value;
      }

      const validationResult = await this.validateMnemonic(mnemonic);
      if (!validationResult.success || !validationResult.value) {
        return ResultUtils.failure(new ValidationError('Invalid mnemonic phrase'));
      }

      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const rootKey = bip32.fromSeed(seed, networks.bitcoin).toBase58();

      return ResultUtils.success({
        mnemonic,
        seed,
        rootKey
      });
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to create HD wallet', { error }));
    }
  }

  async deriveKeyPair(rootKey: string, derivationPath: string): Promise<Result<KeyPair, DomainError>> {
    try {
      // Validate derivation path format
      const pathRegex = /^m(\/\d+'?)*$/;
      if (!pathRegex.test(derivationPath)) {
        return ResultUtils.failure(new ValidationError('Invalid derivation path format'));
      }

      const node = bip32.fromBase58(rootKey, networks.bitcoin);
      const child = node.derivePath(derivationPath);

      if (!child.privateKey || !child.publicKey) {
        return ResultUtils.failure(new CryptoError('Failed to derive key pair'));
      }

      return ResultUtils.success({
        privateKey: child.privateKey.toString('hex'),
        publicKey: child.publicKey.toString('hex')
      });
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to derive key pair', { error }));
    }
  }

  async validateMnemonic(mnemonic: string): Promise<Result<boolean, DomainError>> {
    try {
      if (!mnemonic || typeof mnemonic !== 'string') {
        return ResultUtils.success(false);
      }

      const isValid = bip39.validateMnemonic(mnemonic.trim());
      return ResultUtils.success(isValid);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to validate mnemonic', { error }));
    }
  }

  async encrypt(data: string, password: string): Promise<Result<EncryptedData, DomainError>> {
    try {
      if (!data || !password) {
        return ResultUtils.failure(new ValidationError('Data and password are required'));
      }

      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Derive key using PBKDF2
      const key = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');

      // Encrypt data
      const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      return ResultUtils.success({
        data: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex')
      });
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to encrypt data', { error }));
    }
  }

  async decrypt(encryptedData: EncryptedData, password: string): Promise<Result<string, DomainError>> {
    try {
      if (!encryptedData.data || !password) {
        return ResultUtils.failure(new ValidationError('Encrypted data and password are required'));
      }

      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');

      // Derive key using same parameters
      const key = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');

      // Decrypt data
      const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return ResultUtils.success(decrypted);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to decrypt data', { error }));
    }
  }

  async deriveKey(password: string, salt: Buffer, iterations: number): Promise<Result<Buffer, DomainError>> {
    try {
      if (!password || !salt || iterations < 1000) {
        return ResultUtils.failure(new ValidationError('Invalid key derivation parameters'));
      }

      const key = crypto.pbkdf2Sync(password, salt, iterations, this.keyLength, 'sha256');
      return ResultUtils.success(key);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to derive key', { error }));
    }
  }

  async sign(message: string, privateKey: string): Promise<Result<SignatureData, DomainError>> {
    try {
      if (!message || !privateKey) {
        return ResultUtils.failure(new ValidationError('Message and private key are required'));
      }

      const keyBuffer = Buffer.from(privateKey, 'hex');
      const messageHash = crypto.createHash('sha256').update(message).digest();

      // Create ECDSA signature (simplified implementation)
      const signature = crypto.sign('sha256', messageHash, {
        key: keyBuffer,
        type: 'sec1',
        format: 'der'
      });

      return ResultUtils.success({
        signature: signature.toString('hex'),
        recovery: 0 // Simplified, in real implementation you'd calculate recovery ID
      });
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to sign message', { error }));
    }
  }

  async verify(message: string, signature: string, publicKey: string): Promise<Result<boolean, DomainError>> {
    try {
      if (!message || !signature || !publicKey) {
        return ResultUtils.failure(new ValidationError('Message, signature and public key are required'));
      }

      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      const signatureBuffer = Buffer.from(signature, 'hex');
      const messageHash = crypto.createHash('sha256').update(message).digest();

      const isValid = crypto.verify('sha256', messageHash, {
        key: pubKeyBuffer,
        type: 'spki',
        format: 'der'
      }, signatureBuffer);

      return ResultUtils.success(isValid);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to verify signature', { error }));
    }
  }

  async sha256(data: Buffer): Promise<Result<Buffer, DomainError>> {
    try {
      const hash = crypto.createHash('sha256').update(data).digest();
      return ResultUtils.success(hash);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to compute SHA256', { error }));
    }
  }

  async ripemd160(data: Buffer): Promise<Result<Buffer, DomainError>> {
    try {
      const hash = crypto.createHash('ripemd160').update(data).digest();
      return ResultUtils.success(hash);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to compute RIPEMD160', { error }));
    }
  }

  async hash160(data: Buffer): Promise<Result<Buffer, DomainError>> {
    try {
      const sha256Result = await this.sha256(data);
      if (!sha256Result.success) {
        return sha256Result;
      }

      const ripemd160Result = await this.ripemd160(sha256Result.value);
      return ripemd160Result;
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to compute HASH160', { error }));
    }
  }

  async generateAddress(publicKey: string, network: 'mainnet' | 'testnet' = 'mainnet'): Promise<Result<string, DomainError>> {
    try {
      if (!publicKey) {
        return ResultUtils.failure(new ValidationError('Public key is required'));
      }

      const pubKeyBuffer = Buffer.from(publicKey, 'hex');
      const bitcoinNetwork = network === 'testnet' ? networks.testnet : networks.bitcoin;

      // Generate P2WPKH (Bech32) address
      const { address } = payments.p2wpkh({
        pubkey: pubKeyBuffer,
        network: bitcoinNetwork
      });

      if (!address) {
        return ResultUtils.failure(new CryptoError('Failed to generate address'));
      }

      return ResultUtils.success(address);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to generate address', { error }));
    }
  }

  async secureCompare(a: Buffer, b: Buffer): Promise<Result<boolean, DomainError>> {
    try {
      if (a.length !== b.length) {
        return ResultUtils.success(false);
      }

      const isEqual = crypto.timingSafeEqual(a, b);
      return ResultUtils.success(isEqual);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to compare buffers', { error }));
    }
  }

  async secureWipe(data: Buffer): Promise<Result<void, DomainError>> {
    try {
      // Fill buffer with random data multiple times
      for (let i = 0; i < 3; i++) {
        crypto.randomFillSync(data);
      }
      // Final fill with zeros
      data.fill(0);

      return ResultUtils.success(undefined);
    } catch (error) {
      return ResultUtils.failure(new CryptoError('Failed to securely wipe data', { error }));
    }
  }
}
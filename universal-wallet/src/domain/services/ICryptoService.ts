import { Result } from '../../shared/types/Result';
import { DomainError } from '../../shared/errors/DomainError';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface HDWallet {
  mnemonic: string;
  seed: Buffer;
  rootKey: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  tag: string;
}

export interface SignatureData {
  signature: string;
  recovery: number;
}

export interface ICryptoService {
  // Random generation
  generateSecureRandom(bytes: number): Promise<Result<Buffer, DomainError>>;
  generateMnemonic(strength?: 128 | 160 | 192 | 224 | 256): Promise<Result<string, DomainError>>;

  // HD Wallet operations
  createHDWallet(mnemonic?: string): Promise<Result<HDWallet, DomainError>>;
  deriveKeyPair(rootKey: string, derivationPath: string): Promise<Result<KeyPair, DomainError>>;
  validateMnemonic(mnemonic: string): Promise<Result<boolean, DomainError>>;

  // Encryption/Decryption
  encrypt(data: string, password: string): Promise<Result<EncryptedData, DomainError>>;
  decrypt(encryptedData: EncryptedData, password: string): Promise<Result<string, DomainError>>;

  // Key derivation
  deriveKey(password: string, salt: Buffer, iterations: number): Promise<Result<Buffer, DomainError>>;

  // Signing
  sign(message: string, privateKey: string): Promise<Result<SignatureData, DomainError>>;
  verify(message: string, signature: string, publicKey: string): Promise<Result<boolean, DomainError>>;

  // Hash functions
  sha256(data: Buffer): Promise<Result<Buffer, DomainError>>;
  ripemd160(data: Buffer): Promise<Result<Buffer, DomainError>>;
  hash160(data: Buffer): Promise<Result<Buffer, DomainError>>;

  // Address generation
  generateAddress(publicKey: string, network?: 'mainnet' | 'testnet'): Promise<Result<string, DomainError>>;

  // Security utilities
  secureCompare(a: Buffer, b: Buffer): Promise<Result<boolean, DomainError>>;
  secureWipe(data: Buffer): Promise<Result<void, DomainError>>;
}
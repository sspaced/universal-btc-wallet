import { ValidationError, BusinessRuleViolation } from '../../shared/errors/DomainError';
import { BitcoinAddress, Amount } from '../../shared/types/ValueObject';
import { WalletId } from './Wallet';

export interface AccountId {
  value: string;
}

export type AccountType = 'main' | 'receiving' | 'change';

export interface AccountProps {
  id: AccountId;
  walletId: WalletId;
  name: string;
  type: AccountType;
  derivationPath: string;
  publicKey: string;
  address: BitcoinAddress;
  balance: Amount;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export class Account {
  private readonly props: AccountProps;

  constructor(props: AccountProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: AccountProps): void {
    if (!props.id?.value) {
      throw new ValidationError('Account ID is required');
    }

    if (!props.walletId?.value) {
      throw new ValidationError('Wallet ID is required');
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Account name is required');
    }

    if (props.name.length > 30) {
      throw new ValidationError('Account name cannot exceed 30 characters');
    }

    if (!props.type || !['main', 'receiving', 'change'].includes(props.type)) {
      throw new ValidationError('Valid account type is required');
    }

    if (!props.derivationPath) {
      throw new ValidationError('Derivation path is required');
    }

    // Validate BIP44 derivation path format
    const derivationPathRegex = /^m\/44'\/0'\/\d+'\/[01]\/\d+$/;
    if (!derivationPathRegex.test(props.derivationPath)) {
      throw new ValidationError('Invalid BIP44 derivation path format');
    }

    if (!props.publicKey) {
      throw new ValidationError('Public key is required');
    }

    // Validate public key format (compressed public key is 66 chars hex)
    const publicKeyRegex = /^(02|03)[a-fA-F0-9]{64}$/;
    if (!publicKeyRegex.test(props.publicKey)) {
      throw new ValidationError('Invalid public key format');
    }

    if (!props.address) {
      throw new ValidationError('Address is required');
    }

    if (!props.balance) {
      throw new ValidationError('Balance is required');
    }

    if (!props.createdAt || !(props.createdAt instanceof Date)) {
      throw new ValidationError('Created date is required');
    }

    if (props.lastUsedAt && !(props.lastUsedAt instanceof Date)) {
      throw new ValidationError('Last used date must be a valid date');
    }
  }

  public getId(): AccountId {
    return this.props.id;
  }

  public getWalletId(): WalletId {
    return this.props.walletId;
  }

  public getName(): string {
    return this.props.name;
  }

  public getType(): AccountType {
    return this.props.type;
  }

  public getDerivationPath(): string {
    return this.props.derivationPath;
  }

  public getPublicKey(): string {
    return this.props.publicKey;
  }

  public getAddress(): BitcoinAddress {
    return this.props.address;
  }

  public getBalance(): Amount {
    return this.props.balance;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getCreatedAt(): Date {
    return new Date(this.props.createdAt);
  }

  public getLastUsedAt(): Date | undefined {
    return this.props.lastUsedAt ? new Date(this.props.lastUsedAt) : undefined;
  }

  public updateBalance(newBalance: Amount): Account {
    return new Account({
      ...this.props,
      balance: newBalance,
      lastUsedAt: new Date()
    });
  }

  public activate(): Account {
    return new Account({
      ...this.props,
      isActive: true
    });
  }

  public deactivate(): Account {
    return new Account({
      ...this.props,
      isActive: false
    });
  }

  public rename(newName: string): Account {
    if (!newName || newName.trim().length === 0) {
      throw new ValidationError('Account name cannot be empty');
    }

    if (newName.length > 30) {
      throw new ValidationError('Account name cannot exceed 30 characters');
    }

    return new Account({
      ...this.props,
      name: newName.trim()
    });
  }

  public markAsUsed(): Account {
    return new Account({
      ...this.props,
      lastUsedAt: new Date()
    });
  }

  public hasBeenUsed(): boolean {
    return this.props.lastUsedAt !== undefined;
  }

  public isMainAccount(): boolean {
    return this.props.type === 'main';
  }

  public isReceivingAccount(): boolean {
    return this.props.type === 'receiving';
  }

  public isChangeAccount(): boolean {
    return this.props.type === 'change';
  }

  public getDerivationIndex(): number {
    const parts = this.props.derivationPath.split('/');
    return parseInt(parts[parts.length - 1], 10);
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      walletId: this.props.walletId.value,
      name: this.props.name,
      type: this.props.type,
      derivationPath: this.props.derivationPath,
      publicKey: this.props.publicKey,
      address: this.props.address.toString(),
      balance: this.props.balance.getValue().toString(),
      balanceUnit: this.props.balance.getUnit(),
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      lastUsedAt: this.props.lastUsedAt?.toISOString()
    };
  }

  public static fromJSON(data: Record<string, unknown>): Account {
    return new Account({
      id: { value: data.id as string },
      walletId: { value: data.walletId as string },
      name: data.name as string,
      type: data.type as AccountType,
      derivationPath: data.derivationPath as string,
      publicKey: data.publicKey as string,
      address: new BitcoinAddress(data.address as string),
      balance: new Amount(BigInt(data.balance as string), data.balanceUnit as 'BTC' | 'sats'),
      isActive: data.isActive as boolean,
      createdAt: new Date(data.createdAt as string),
      lastUsedAt: data.lastUsedAt ? new Date(data.lastUsedAt as string) : undefined
    });
  }
}
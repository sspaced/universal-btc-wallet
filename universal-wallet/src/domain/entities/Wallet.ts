import { ValidationError, BusinessRuleViolation } from '../../shared/errors/DomainError';
import { BitcoinAddress, Amount } from '../../shared/types/ValueObject';

export interface WalletId {
  value: string;
}

export interface WalletProps {
  id: WalletId;
  name: string;
  addresses: BitcoinAddress[];
  balance: Amount;
  isLocked: boolean;
  createdAt: Date;
  lastAccessedAt: Date;
}

export class Wallet {
  private readonly props: WalletProps;
  private readonly maxAddresses = 100;

  constructor(props: WalletProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: WalletProps): void {
    if (!props.id?.value) {
      throw new ValidationError('Wallet ID is required');
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Wallet name is required');
    }

    if (props.name.length > 50) {
      throw new ValidationError('Wallet name cannot exceed 50 characters');
    }

    if (!Array.isArray(props.addresses)) {
      throw new ValidationError('Addresses must be an array');
    }

    if (props.addresses.length > this.maxAddresses) {
      throw new BusinessRuleViolation(`Wallet cannot have more than ${this.maxAddresses} addresses`);
    }

    if (!props.balance) {
      throw new ValidationError('Balance is required');
    }

    if (!props.createdAt || !(props.createdAt instanceof Date)) {
      throw new ValidationError('Created date is required');
    }

    if (!props.lastAccessedAt || !(props.lastAccessedAt instanceof Date)) {
      throw new ValidationError('Last accessed date is required');
    }
  }

  public getId(): WalletId {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  public getAddresses(): BitcoinAddress[] {
    return [...this.props.addresses];
  }

  public getBalance(): Amount {
    return this.props.balance;
  }

  public isLocked(): boolean {
    return this.props.isLocked;
  }

  public getCreatedAt(): Date {
    return new Date(this.props.createdAt);
  }

  public getLastAccessedAt(): Date {
    return new Date(this.props.lastAccessedAt);
  }

  public addAddress(address: BitcoinAddress): Wallet {
    if (this.props.addresses.length >= this.maxAddresses) {
      throw new BusinessRuleViolation(`Cannot add more than ${this.maxAddresses} addresses to wallet`);
    }

    // Check if address already exists
    const addressExists = this.props.addresses.some(existing => existing.equals(address));
    if (addressExists) {
      throw new BusinessRuleViolation('Address already exists in wallet');
    }

    const newAddresses = [...this.props.addresses, address];
    return new Wallet({
      ...this.props,
      addresses: newAddresses
    });
  }

  public updateBalance(newBalance: Amount): Wallet {
    return new Wallet({
      ...this.props,
      balance: newBalance,
      lastAccessedAt: new Date()
    });
  }

  public lock(): Wallet {
    return new Wallet({
      ...this.props,
      isLocked: true,
      lastAccessedAt: new Date()
    });
  }

  public unlock(): Wallet {
    return new Wallet({
      ...this.props,
      isLocked: false,
      lastAccessedAt: new Date()
    });
  }

  public rename(newName: string): Wallet {
    if (!newName || newName.trim().length === 0) {
      throw new ValidationError('Wallet name cannot be empty');
    }

    if (newName.length > 50) {
      throw new ValidationError('Wallet name cannot exceed 50 characters');
    }

    return new Wallet({
      ...this.props,
      name: newName.trim(),
      lastAccessedAt: new Date()
    });
  }

  public updateLastAccessed(): Wallet {
    return new Wallet({
      ...this.props,
      lastAccessedAt: new Date()
    });
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      name: this.props.name,
      addresses: this.props.addresses.map(addr => addr.toString()),
      balance: this.props.balance.getValue().toString(),
      balanceUnit: this.props.balance.getUnit(),
      isLocked: this.props.isLocked,
      createdAt: this.props.createdAt.toISOString(),
      lastAccessedAt: this.props.lastAccessedAt.toISOString()
    };
  }

  public static fromJSON(data: Record<string, unknown>): Wallet {
    return new Wallet({
      id: { value: data.id as string },
      name: data.name as string,
      addresses: (data.addresses as string[]).map(addr => new BitcoinAddress(addr)),
      balance: new Amount(BigInt(data.balance as string), data.balanceUnit as 'BTC' | 'sats'),
      isLocked: data.isLocked as boolean,
      createdAt: new Date(data.createdAt as string),
      lastAccessedAt: new Date(data.lastAccessedAt as string)
    });
  }
}
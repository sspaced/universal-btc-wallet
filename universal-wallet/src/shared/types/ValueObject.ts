import { ValidationError } from '../errors/DomainError';

export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = props;
    Object.freeze(this);
  }

  public equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (other.constructor.name !== this.constructor.name) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  protected abstract validate(props: T): void;
}

export class BitcoinAddress extends ValueObject<{ value: string }> {
  constructor(address: string) {
    super({ value: address });
    this.validate(this.props);
  }

  protected validate(props: { value: string }): void {
    const { value } = props;

    if (!value || typeof value !== 'string') {
      throw new ValidationError('Address must be a non-empty string');
    }

    // Basic Bitcoin address validation (simplified)
    const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    if (!addressRegex.test(value)) {
      throw new ValidationError('Invalid Bitcoin address format', { address: value });
    }
  }

  public toString(): string {
    return this.props.value;
  }

  public getValue(): string {
    return this.props.value;
  }
}

export class Amount extends ValueObject<{ value: bigint; unit: 'BTC' | 'sats' }> {
  constructor(value: bigint, unit: 'BTC' | 'sats' = 'sats') {
    super({ value, unit });
    this.validate(this.props);
  }

  protected validate(props: { value: bigint; unit: 'BTC' | 'sats' }): void {
    const { value } = props;

    if (typeof value !== 'bigint') {
      throw new ValidationError('Amount value must be a bigint');
    }

    if (value < 0n) {
      throw new ValidationError('Amount cannot be negative', { value: value.toString() });
    }

    // Maximum Bitcoin supply is 21 million BTC = 2.1e15 satoshis
    const MAX_SATOSHIS = 2100000000000000n;
    if (value > MAX_SATOSHIS) {
      throw new ValidationError('Amount exceeds maximum Bitcoin supply', { value: value.toString() });
    }
  }

  public getValue(): bigint {
    return this.props.value;
  }

  public getUnit(): 'BTC' | 'sats' {
    return this.props.unit;
  }

  public toSats(): Amount {
    if (this.props.unit === 'sats') {
      return this;
    }
    return new Amount(this.props.value * 100000000n, 'sats');
  }

  public toBTC(): Amount {
    if (this.props.unit === 'BTC') {
      return this;
    }
    return new Amount(this.props.value / 100000000n, 'BTC');
  }

  public add(other: Amount): Amount {
    const thisSats = this.toSats();
    const otherSats = other.toSats();
    return new Amount(thisSats.getValue() + otherSats.getValue(), 'sats');
  }

  public subtract(other: Amount): Amount {
    const thisSats = this.toSats();
    const otherSats = other.toSats();
    const result = thisSats.getValue() - otherSats.getValue();
    return new Amount(result, 'sats');
  }
}

export class TransactionHash extends ValueObject<{ value: string }> {
  constructor(hash: string) {
    super({ value: hash });
    this.validate(this.props);
  }

  protected validate(props: { value: string }): void {
    const { value } = props;

    if (!value || typeof value !== 'string') {
      throw new ValidationError('Transaction hash must be a non-empty string');
    }

    // Bitcoin transaction hash is 64 character hex string
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(value)) {
      throw new ValidationError('Invalid transaction hash format', { hash: value });
    }
  }

  public toString(): string {
    return this.props.value;
  }

  public getValue(): string {
    return this.props.value;
  }
}
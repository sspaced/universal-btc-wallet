import { ValidationError, BusinessRuleViolation } from '../../shared/errors/DomainError';
import { BitcoinAddress, Amount, TransactionHash } from '../../shared/types/ValueObject';

export interface TransactionId {
  value: string;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';
export type TransactionType = 'send' | 'receive' | 'swap' | 'inscription';

export interface TransactionInput {
  txHash: TransactionHash;
  outputIndex: number;
  address: BitcoinAddress;
  amount: Amount;
  scriptSig?: string;
}

export interface TransactionOutput {
  address: BitcoinAddress;
  amount: Amount;
  scriptPubKey?: string;
}

export interface TransactionProps {
  id: TransactionId;
  hash?: TransactionHash;
  type: TransactionType;
  status: TransactionStatus;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  fee: Amount;
  blockHeight?: number;
  confirmations: number;
  createdAt: Date;
  confirmedAt?: Date;
  memo?: string;
}

export class Transaction {
  private readonly props: TransactionProps;

  constructor(props: TransactionProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: TransactionProps): void {
    if (!props.id?.value) {
      throw new ValidationError('Transaction ID is required');
    }

    if (!props.type || !['send', 'receive', 'swap', 'inscription'].includes(props.type)) {
      throw new ValidationError('Valid transaction type is required');
    }

    if (!props.status || !['pending', 'confirmed', 'failed', 'cancelled'].includes(props.status)) {
      throw new ValidationError('Valid transaction status is required');
    }

    if (!Array.isArray(props.inputs)) {
      throw new ValidationError('Inputs must be an array');
    }

    if (!Array.isArray(props.outputs)) {
      throw new ValidationError('Outputs must be an array');
    }

    if (props.outputs.length === 0) {
      throw new ValidationError('Transaction must have at least one output');
    }

    if (!props.fee) {
      throw new ValidationError('Transaction fee is required');
    }

    if (props.confirmations < 0) {
      throw new ValidationError('Confirmations cannot be negative');
    }

    if (!props.createdAt || !(props.createdAt instanceof Date)) {
      throw new ValidationError('Created date is required');
    }

    if (props.status === 'confirmed' && !props.confirmedAt) {
      throw new ValidationError('Confirmed transactions must have a confirmation date');
    }

    if (props.memo && props.memo.length > 200) {
      throw new ValidationError('Memo cannot exceed 200 characters');
    }

    // Validate inputs
    props.inputs.forEach((input, index) => {
      if (!input.txHash) {
        throw new ValidationError(`Input ${index}: Transaction hash is required`);
      }
      if (typeof input.outputIndex !== 'number' || input.outputIndex < 0) {
        throw new ValidationError(`Input ${index}: Valid output index is required`);
      }
      if (!input.address) {
        throw new ValidationError(`Input ${index}: Address is required`);
      }
      if (!input.amount) {
        throw new ValidationError(`Input ${index}: Amount is required`);
      }
    });

    // Validate outputs
    props.outputs.forEach((output, index) => {
      if (!output.address) {
        throw new ValidationError(`Output ${index}: Address is required`);
      }
      if (!output.amount) {
        throw new ValidationError(`Output ${index}: Amount is required`);
      }
    });
  }

  public getId(): TransactionId {
    return this.props.id;
  }

  public getHash(): TransactionHash | undefined {
    return this.props.hash;
  }

  public getType(): TransactionType {
    return this.props.type;
  }

  public getStatus(): TransactionStatus {
    return this.props.status;
  }

  public getInputs(): TransactionInput[] {
    return [...this.props.inputs];
  }

  public getOutputs(): TransactionOutput[] {
    return [...this.props.outputs];
  }

  public getFee(): Amount {
    return this.props.fee;
  }

  public getBlockHeight(): number | undefined {
    return this.props.blockHeight;
  }

  public getConfirmations(): number {
    return this.props.confirmations;
  }

  public getCreatedAt(): Date {
    return new Date(this.props.createdAt);
  }

  public getConfirmedAt(): Date | undefined {
    return this.props.confirmedAt ? new Date(this.props.confirmedAt) : undefined;
  }

  public getMemo(): string | undefined {
    return this.props.memo;
  }

  public isConfirmed(): boolean {
    return this.props.status === 'confirmed' && this.props.confirmations > 0;
  }

  public isPending(): boolean {
    return this.props.status === 'pending';
  }

  public isFailed(): boolean {
    return this.props.status === 'failed';
  }

  public getTotalInputAmount(): Amount {
    return this.props.inputs.reduce(
      (total, input) => total.add(input.amount),
      new Amount(0n, 'sats')
    );
  }

  public getTotalOutputAmount(): Amount {
    return this.props.outputs.reduce(
      (total, output) => total.add(output.amount),
      new Amount(0n, 'sats')
    );
  }

  public confirm(blockHeight: number, hash: TransactionHash): Transaction {
    if (this.props.status !== 'pending') {
      throw new BusinessRuleViolation('Only pending transactions can be confirmed');
    }

    if (blockHeight <= 0) {
      throw new ValidationError('Block height must be positive');
    }

    return new Transaction({
      ...this.props,
      hash,
      status: 'confirmed',
      blockHeight,
      confirmations: 1,
      confirmedAt: new Date()
    });
  }

  public updateConfirmations(confirmations: number): Transaction {
    if (this.props.status !== 'confirmed') {
      throw new BusinessRuleViolation('Only confirmed transactions can have confirmations updated');
    }

    if (confirmations < 0) {
      throw new ValidationError('Confirmations cannot be negative');
    }

    return new Transaction({
      ...this.props,
      confirmations
    });
  }

  public fail(): Transaction {
    if (this.props.status === 'confirmed') {
      throw new BusinessRuleViolation('Cannot fail a confirmed transaction');
    }

    return new Transaction({
      ...this.props,
      status: 'failed'
    });
  }

  public cancel(): Transaction {
    if (this.props.status !== 'pending') {
      throw new BusinessRuleViolation('Only pending transactions can be cancelled');
    }

    return new Transaction({
      ...this.props,
      status: 'cancelled'
    });
  }

  public addMemo(memo: string): Transaction {
    if (memo.length > 200) {
      throw new ValidationError('Memo cannot exceed 200 characters');
    }

    return new Transaction({
      ...this.props,
      memo: memo.trim()
    });
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.props.id.value,
      hash: this.props.hash?.toString(),
      type: this.props.type,
      status: this.props.status,
      inputs: this.props.inputs.map(input => ({
        txHash: input.txHash.toString(),
        outputIndex: input.outputIndex,
        address: input.address.toString(),
        amount: input.amount.getValue().toString(),
        amountUnit: input.amount.getUnit(),
        scriptSig: input.scriptSig
      })),
      outputs: this.props.outputs.map(output => ({
        address: output.address.toString(),
        amount: output.amount.getValue().toString(),
        amountUnit: output.amount.getUnit(),
        scriptPubKey: output.scriptPubKey
      })),
      fee: this.props.fee.getValue().toString(),
      feeUnit: this.props.fee.getUnit(),
      blockHeight: this.props.blockHeight,
      confirmations: this.props.confirmations,
      createdAt: this.props.createdAt.toISOString(),
      confirmedAt: this.props.confirmedAt?.toISOString(),
      memo: this.props.memo
    };
  }

  public static fromJSON(data: Record<string, unknown>): Transaction {
    return new Transaction({
      id: { value: data.id as string },
      hash: data.hash ? new TransactionHash(data.hash as string) : undefined,
      type: data.type as TransactionType,
      status: data.status as TransactionStatus,
      inputs: (data.inputs as any[]).map(input => ({
        txHash: new TransactionHash(input.txHash),
        outputIndex: input.outputIndex,
        address: new BitcoinAddress(input.address),
        amount: new Amount(BigInt(input.amount), input.amountUnit),
        scriptSig: input.scriptSig
      })),
      outputs: (data.outputs as any[]).map(output => ({
        address: new BitcoinAddress(output.address),
        amount: new Amount(BigInt(output.amount), output.amountUnit),
        scriptPubKey: output.scriptPubKey
      })),
      fee: new Amount(BigInt(data.fee as string), data.feeUnit as 'BTC' | 'sats'),
      blockHeight: data.blockHeight as number | undefined,
      confirmations: data.confirmations as number,
      createdAt: new Date(data.createdAt as string),
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt as string) : undefined,
      memo: data.memo as string | undefined
    });
  }
}
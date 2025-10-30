import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { User } from '../users/user.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRADE_BUY = 'trade_buy',
  TRADE_SELL = 'trade_sell',
  SETTLEMENT = 'settlement',
  FEE = 'fee',
  REFUND = 'refund',
  BONUS = 'bonus',
}

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ name: 'balance_before', type: 'bigint' })
  balanceBefore: string;

  @Column({ name: 'balance_after', type: 'bigint' })
  balanceAfter: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'payment_provider', nullable: true })
  paymentProvider: string;

  @Column({ name: 'payment_reference', nullable: true })
  paymentReference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'balance_available', type: 'bigint', default: 0 })
  balanceAvailable: string;

  @Column({ name: 'balance_locked', type: 'bigint', default: 0 })
  balanceLocked: string;

  @Column({ name: 'daily_deposit_limit', type: 'bigint', nullable: true })
  dailyDepositLimit: string;

  @Column({ name: 'monthly_deposit_limit', type: 'bigint', nullable: true })
  monthlyDepositLimit: string;

  @Column({ name: 'daily_withdrawal_limit', type: 'bigint', nullable: true })
  dailyWithdrawalLimit: string;

  @Column({ name: 'monthly_withdrawal_limit', type: 'bigint', nullable: true })
  monthlyWithdrawalLimit: string;

  @Column({ name: 'total_deposits', type: 'bigint', default: 0 })
  totalDeposits: string;

  @Column({ name: 'total_withdrawals', type: 'bigint', default: 0 })
  totalWithdrawals: string;

  @Column({ name: 'total_trades', type: 'bigint', default: 0 })
  totalTrades: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

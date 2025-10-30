import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Market } from '../markets/market.entity';
import { User } from '../users/user.entity';

export enum OrderSide {
  YES = 'yes',
  NO = 'no',
}

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'market_id' })
  marketId: string;

  @ManyToOne(() => Market)
  @JoinColumn({ name: 'market_id' })
  market: Market;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @Column({
    type: 'enum',
    enum: OrderSide,
  })
  side: OrderSide;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'quantity_filled', default: 0 })
  quantityFilled: number;

  @Column({ name: 'amount_locked', type: 'bigint' })
  amountLocked: string;

  @Column({ name: 'amount_filled', type: 'bigint', default: 0 })
  amountFilled: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'filled_at', nullable: true })
  filledAt: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;
}

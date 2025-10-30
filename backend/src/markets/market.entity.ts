import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum MarketCategory {
  MACROECONOMICS = 'macroeconomics',
  CAPITAL_MARKETS = 'capital_markets',
  PUBLIC_POLICY = 'public_policy',
  CORPORATE_EVENTS = 'corporate_events',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
  OTHER = 'other',
}

export enum MarketStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export enum ResolutionOutcome {
  YES = 'yes',
  NO = 'no',
  INVALID = 'invalid',
}

@Entity('markets')
export class Market {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'market_code', unique: true })
  marketCode: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: MarketCategory,
  })
  category: MarketCategory;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'open_at' })
  openAt: Date;

  @Column({ name: 'close_at' })
  closeAt: Date;

  @Column({ name: 'resolution_deadline', nullable: true })
  resolutionDeadline: Date;

  @Column({
    type: 'enum',
    enum: MarketStatus,
    default: MarketStatus.DRAFT,
  })
  status: MarketStatus;

  @Column({ name: 'status_reason', nullable: true })
  statusReason: string;

  @Column({ name: 'min_trade_amount', type: 'bigint', default: 100 })
  minTradeAmount: number;

  @Column({ name: 'max_trade_amount', type: 'bigint', default: 10000000 })
  maxTradeAmount: number;

  @Column({ name: 'resolution_source', nullable: true })
  resolutionSource: string;

  @Column({
    type: 'enum',
    enum: ResolutionOutcome,
    name: 'resolution_outcome',
    nullable: true,
  })
  resolutionOutcome: ResolutionOutcome;

  @Column({ name: 'resolution_notes', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @Column({ name: 'total_volume', type: 'bigint', default: 0 })
  totalVolume: number;

  @Column({ name: 'yes_volume', type: 'bigint', default: 0 })
  yesVolume: number;

  @Column({ name: 'no_volume', type: 'bigint', default: 0 })
  noVolume: number;

  @Column({ name: 'unique_traders', default: 0 })
  uniqueTraders: number;

  @Column({ name: 'last_yes_price', nullable: true })
  lastYesPrice: number;

  @Column({ name: 'last_no_price', nullable: true })
  lastNoPrice: number;

  @Column({ name: 'last_trade_at', nullable: true })
  lastTradeAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum KycTier {
  TIER_0 = 'tier_0',
  TIER_1 = 'tier_1',
  TIER_2 = 'tier_2',
  TIER_3 = 'tier_3',
}

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: KycTier,
    name: 'kyc_tier',
    default: KycTier.TIER_0,
  })
  kycTier: KycTier;

  @Column({
    type: 'enum',
    enum: KycStatus,
    name: 'kyc_status',
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @Column({ name: 'bvn_hash', nullable: true })
  bvnHash: string;

  @Column({ name: 'nin_hash', nullable: true })
  ninHash: string;

  @Column({ name: 'kyc_verified_at', nullable: true })
  kycVerifiedAt: Date;

  @Column({ type: 'jsonb', name: 'kyc_data', nullable: true })
  kycData: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'two_fa_enabled', default: false })
  twoFaEnabled: boolean;

  @Column({ name: 'two_fa_secret', nullable: true })
  twoFaSecret: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'inet', name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}

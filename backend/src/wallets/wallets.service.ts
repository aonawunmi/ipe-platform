import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './wallet.entity';
import { LedgerEntry, TransactionType } from './ledger-entry.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    return wallet;
  }

  /**
   * Get wallet balance (available + locked)
   */
  async getBalance(userId: string): Promise<{
    available: string;
    locked: string;
    total: string;
  }> {
    const wallet = await this.getWalletByUserId(userId);

    const available = BigInt(wallet.balanceAvailable);
    const locked = BigInt(wallet.balanceLocked);
    const total = available + locked;

    return {
      available: available.toString(),
      locked: locked.toString(),
      total: total.toString(),
    };
  }

  /**
   * Get transaction history for user
   */
  async getTransactionHistory(
    userId: string,
    filters?: {
      type?: TransactionType;
      limit?: number;
      offset?: number;
    },
  ): Promise<LedgerEntry[]> {
    const query = this.ledgerRepository
      .createQueryBuilder('entry')
      .where('entry.userId = :userId', { userId });

    if (filters?.type) {
      query.andWhere('entry.transactionType = :type', { type: filters.type });
    }

    query
      .orderBy('entry.createdAt', 'DESC')
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);

    return query.getMany();
  }

  /**
   * Deposit funds into wallet
   */
  async deposit(
    userId: string,
    amount: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<{
    wallet: Wallet;
    ledgerEntry: LedgerEntry;
  }> {
    return await this.dataSource.transaction(async (manager) => {
      // Lock wallet for update
      const wallet = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.userId = :userId', { userId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Validate amount
      const depositAmount = BigInt(amount);
      if (depositAmount <= 0) {
        throw new BadRequestException('Deposit amount must be positive');
      }

      // Calculate new balance
      const balanceBefore = BigInt(wallet.balanceAvailable);
      const balanceAfter = balanceBefore + depositAmount;

      // Update wallet
      wallet.balanceAvailable = balanceAfter.toString();
      wallet.totalDeposits = (
        BigInt(wallet.totalDeposits) + depositAmount
      ).toString();
      await manager.save(wallet);

      // Create ledger entry
      const ledgerEntry = manager.create(LedgerEntry, {
        walletId: wallet.id,
        userId,
        transactionType: TransactionType.DEPOSIT,
        amount: amount,
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString(),
        description: description || 'Deposit',
        metadata,
      });

      await manager.save(ledgerEntry);

      return { wallet, ledgerEntry };
    });
  }

  /**
   * Withdraw funds from wallet
   */
  async withdraw(
    userId: string,
    amount: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<{
    wallet: Wallet;
    ledgerEntry: LedgerEntry;
  }> {
    return await this.dataSource.transaction(async (manager) => {
      const wallet = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.userId = :userId', { userId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const withdrawAmount = BigInt(amount);
      if (withdrawAmount <= 0) {
        throw new BadRequestException('Withdrawal amount must be positive');
      }

      const balanceBefore = BigInt(wallet.balanceAvailable);

      // Check sufficient balance
      if (balanceBefore < withdrawAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      const balanceAfter = balanceBefore - withdrawAmount;

      // Update wallet
      wallet.balanceAvailable = balanceAfter.toString();
      wallet.totalWithdrawals = (
        BigInt(wallet.totalWithdrawals) + withdrawAmount
      ).toString();
      await manager.save(wallet);

      // Create ledger entry (negative amount for withdrawal)
      const ledgerEntry = manager.create(LedgerEntry, {
        walletId: wallet.id,
        userId,
        transactionType: TransactionType.WITHDRAWAL,
        amount: (-withdrawAmount).toString(),
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString(),
        description: description || 'Withdrawal',
        metadata,
      });

      await manager.save(ledgerEntry);

      return { wallet, ledgerEntry };
    });
  }

  /**
   * Lock funds for order placement
   */
  async lockFunds(
    userId: string,
    amount: string,
    orderId: string,
  ): Promise<Wallet> {
    return await this.dataSource.transaction(async (manager) => {
      const wallet = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.userId = :userId', { userId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const lockAmount = BigInt(amount);
      const balanceAvailable = BigInt(wallet.balanceAvailable);

      if (balanceAvailable < lockAmount) {
        throw new BadRequestException('Insufficient available balance');
      }

      wallet.balanceAvailable = (balanceAvailable - lockAmount).toString();
      wallet.balanceLocked = (
        BigInt(wallet.balanceLocked) + lockAmount
      ).toString();

      await manager.save(wallet);

      return wallet;
    });
  }

  /**
   * Unlock funds when order is cancelled
   */
  async unlockFunds(
    userId: string,
    amount: string,
    orderId: string,
  ): Promise<Wallet> {
    return await this.dataSource.transaction(async (manager) => {
      const wallet = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.userId = :userId', { userId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const unlockAmount = BigInt(amount);

      wallet.balanceLocked = (
        BigInt(wallet.balanceLocked) - unlockAmount
      ).toString();
      wallet.balanceAvailable = (
        BigInt(wallet.balanceAvailable) + unlockAmount
      ).toString();

      await manager.save(wallet);

      return wallet;
    });
  }

  /**
   * Create wallet for new user
   */
  async createWallet(userId: string): Promise<Wallet> {
    const existing = await this.walletsRepository.findOne({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    const wallet = this.walletsRepository.create({
      userId,
      balanceAvailable: '0',
      balanceLocked: '0',
      totalDeposits: '0',
      totalWithdrawals: '0',
      totalTrades: '0',
    });

    return await this.walletsRepository.save(wallet);
  }
}

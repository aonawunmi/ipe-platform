import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market, MarketStatus, MarketCategory } from './market.entity';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private marketsRepository: Repository<Market>,
  ) {}

  /**
   * Get all active markets
   */
  async findAll(filters?: {
    category?: MarketCategory;
    status?: MarketStatus;
  }): Promise<Market[]> {
    const query = this.marketsRepository.createQueryBuilder('market');

    if (filters?.category) {
      query.andWhere('market.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.status) {
      query.andWhere('market.status = :status', { status: filters.status });
    } else {
      // By default, only show active markets
      query.andWhere('market.status = :status', {
        status: MarketStatus.ACTIVE,
      });
    }

    query.orderBy('market.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Get market by ID
   */
  async findById(id: string): Promise<Market> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`Market with ID ${id} not found`);
    }
    return market;
  }

  /**
   * Get market by code
   */
  async findByCode(marketCode: string): Promise<Market> {
    const market = await this.marketsRepository.findOne({
      where: { marketCode },
    });
    if (!market) {
      throw new NotFoundException(`Market with code ${marketCode} not found`);
    }
    return market;
  }

  /**
   * Create a new market (admin only)
   */
  async create(marketData: {
    title: string;
    description: string;
    category: MarketCategory;
    tags?: string[];
    openAt: Date;
    closeAt: Date;
    resolutionDeadline?: Date;
    resolutionSource?: string;
    minTradeAmount?: number;
    maxTradeAmount?: number;
    createdBy: string;
  }): Promise<Market> {
    const market = this.marketsRepository.create({
      ...marketData,
      status: MarketStatus.DRAFT,
    });

    return this.marketsRepository.save(market);
  }

  /**
   * Update market status (admin only)
   */
  async updateStatus(
    id: string,
    status: MarketStatus,
    reason?: string,
  ): Promise<Market> {
    const market = await this.findById(id);
    market.status = status;
    if (reason) {
      market.statusReason = reason;
    }
    return this.marketsRepository.save(market);
  }

  /**
   * Get market statistics
   */
  async getStats(id: string): Promise<{
    totalVolume: number;
    yesVolume: number;
    noVolume: number;
    uniqueTraders: number;
    lastYesPrice: number;
    lastNoPrice: number;
    lastTradeAt: Date;
  }> {
    const market = await this.findById(id);
    return {
      totalVolume: market.totalVolume,
      yesVolume: market.yesVolume,
      noVolume: market.noVolume,
      uniqueTraders: market.uniqueTraders,
      lastYesPrice: market.lastYesPrice || 5000,
      lastNoPrice: market.lastNoPrice || 5000,
      lastTradeAt: market.lastTradeAt,
    };
  }
}

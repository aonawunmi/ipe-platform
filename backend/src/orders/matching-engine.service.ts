import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderSide, OrderStatus } from './order.entity';
import { Market } from '../markets/market.entity';

interface Trade {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  amount: string;
}

@Injectable()
export class MatchingEngineService {
  private readonly logger = new Logger(MatchingEngineService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Market)
    private marketsRepository: Repository<Market>,
    private dataSource: DataSource,
  ) {}

  /**
   * Match a newly placed order against existing orders in the order book
   */
  async matchOrder(orderId: string): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order || order.status !== OrderStatus.PENDING) {
      return;
    }

    this.logger.log(
      `Matching order ${order.orderNumber} - ${order.side} at ${order.price} for ${order.quantity} shares`,
    );

    // Start a transaction for atomic matching
    await this.dataSource.transaction(async (manager) => {
      // Get matching orders from the opposite side
      // YES orders match with NO orders where YES price + NO price >= 10000
      const matchingOrders = await this.findMatchingOrders(order, manager);

      if (matchingOrders.length === 0) {
        // No matches found, set order to OPEN
        order.status = OrderStatus.OPEN;
        await manager.save(order);
        this.logger.log(`No matches found for order ${order.orderNumber}`);
        return;
      }

      // Execute trades with matching orders
      let remainingQuantity = order.quantity - order.quantityFilled;

      for (const matchingOrder of matchingOrders) {
        if (remainingQuantity <= 0) break;

        const matchQuantity = Math.min(
          remainingQuantity,
          matchingOrder.quantity - matchingOrder.quantityFilled,
        );

        // Execute the trade
        await this.executeTrade(
          order,
          matchingOrder,
          matchQuantity,
          order.price,
          manager,
        );

        remainingQuantity -= matchQuantity;

        this.logger.log(
          `Matched ${matchQuantity} shares between ${order.orderNumber} and ${matchingOrder.orderNumber}`,
        );
      }

      // Update order status based on filled quantity
      if (order.quantityFilled === order.quantity) {
        order.status = OrderStatus.FILLED;
        order.filledAt = new Date();
      } else if (order.quantityFilled > 0) {
        order.status = OrderStatus.PARTIALLY_FILLED;
      } else {
        order.status = OrderStatus.OPEN;
      }

      await manager.save(order);

      // Update market statistics
      await this.updateMarketStats(order.marketId, manager);
    });
  }

  /**
   * Find orders that can match with the given order
   */
  private async findMatchingOrders(
    order: Order,
    manager: any,
  ): Promise<Order[]> {
    // For binary prediction markets:
    // YES buyers match with NO sellers where YES price + NO price >= 10000
    // This ensures both sides agree on the probability split

    if (order.side === OrderSide.YES) {
      // Find NO orders where NO price <= (10000 - YES price)
      // This means: YES price + NO price <= 10000
      return await manager
        .createQueryBuilder(Order, 'order')
        .where('order.marketId = :marketId', { marketId: order.marketId })
        .andWhere('order.side = :side', { side: OrderSide.NO })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED],
        })
        .andWhere('order.price <= :maxPrice', {
          maxPrice: 10000 - order.price,
        })
        .andWhere('order.id != :orderId', { orderId: order.id })
        .orderBy('order.price', 'ASC') // Best NO prices first (lowest)
        .addOrderBy('order.createdAt', 'ASC') // Time priority
        .getMany();
    } else {
      // Find YES orders where YES price <= (10000 - NO price)
      return await manager
        .createQueryBuilder(Order, 'order')
        .where('order.marketId = :marketId', { marketId: order.marketId })
        .andWhere('order.side = :side', { side: OrderSide.YES })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED],
        })
        .andWhere('order.price <= :maxPrice', {
          maxPrice: 10000 - order.price,
        })
        .andWhere('order.id != :orderId', { orderId: order.id })
        .orderBy('order.price', 'DESC') // Best YES prices first (highest)
        .addOrderBy('order.createdAt', 'ASC') // Time priority
        .getMany();
    }
  }

  /**
   * Execute a trade between two matched orders
   */
  private async executeTrade(
    order1: Order,
    order2: Order,
    quantity: number,
    price: number,
    manager: any,
  ): Promise<void> {
    // Calculate trade amount
    // For YES: amount = (price * quantity) / 10000
    // For NO: amount = ((10000 - price) * quantity) / 10000
    const tradeAmount = Math.floor((price * quantity) / 10000);

    // Update order 1
    order1.quantityFilled += quantity;
    order1.amountFilled = String(
      parseInt(order1.amountFilled) + tradeAmount,
    );

    if (order1.quantityFilled === order1.quantity) {
      order1.status = OrderStatus.FILLED;
      order1.filledAt = new Date();
    } else {
      order1.status = OrderStatus.PARTIALLY_FILLED;
    }

    // Update order 2
    const order2Amount = Math.floor(((10000 - price) * quantity) / 10000);
    order2.quantityFilled += quantity;
    order2.amountFilled = String(
      parseInt(order2.amountFilled) + order2Amount,
    );

    if (order2.quantityFilled === order2.quantity) {
      order2.status = OrderStatus.FILLED;
      order2.filledAt = new Date();
    } else {
      order2.status = OrderStatus.PARTIALLY_FILLED;
    }

    await manager.save(order1);
    await manager.save(order2);

    // TODO: Create trade record in trades table
    // await this.createTradeRecord(order1, order2, quantity, price, manager);
  }

  /**
   * Update market statistics after trades
   */
  private async updateMarketStats(
    marketId: string,
    manager: any,
  ): Promise<void> {
    // Calculate aggregate statistics from filled orders
    const stats = await manager
      .createQueryBuilder(Order, 'order')
      .select('SUM(order.amountFilled)', 'totalVolume')
      .addSelect(
        'SUM(CASE WHEN order.side = :yesSide THEN order.amountFilled ELSE 0 END)',
        'yesVolume',
      )
      .addSelect(
        'SUM(CASE WHEN order.side = :noSide THEN order.amountFilled ELSE 0 END)',
        'noVolume',
      )
      .addSelect('COUNT(DISTINCT order.userId)', 'uniqueTraders')
      .where('order.marketId = :marketId', { marketId })
      .andWhere('order.quantityFilled > 0')
      .setParameters({ yesSide: OrderSide.YES, noSide: OrderSide.NO })
      .getRawOne();

    // Get latest YES and NO prices separately
    const latestYesOrder = await manager
      .createQueryBuilder(Order, 'order')
      .where('order.marketId = :marketId', { marketId })
      .andWhere('order.side = :side', { side: OrderSide.YES })
      .andWhere('order.quantityFilled > 0')
      .orderBy('order.updatedAt', 'DESC')
      .getOne();

    const latestNoOrder = await manager
      .createQueryBuilder(Order, 'order')
      .where('order.marketId = :marketId', { marketId })
      .andWhere('order.side = :side', { side: OrderSide.NO })
      .andWhere('order.quantityFilled > 0')
      .orderBy('order.updatedAt', 'DESC')
      .getOne();

    // Build update object with only defined values
    const updateData: any = {
      totalVolume: stats.totalVolume || '0',
      yesVolume: stats.yesVolume || '0',
      noVolume: stats.noVolume || '0',
      uniqueTraders: parseInt(stats.uniqueTraders) || 0,
    };

    // Only update prices if we have both (constraint requires they add to 10000)
    if (latestYesOrder && latestNoOrder) {
      updateData.lastYesPrice = latestYesOrder.price;
      updateData.lastNoPrice = latestNoOrder.price;
      updateData.lastTradeAt = new Date();
    }

    // Update market
    await manager
      .createQueryBuilder()
      .update(Market)
      .set(updateData)
      .where('id = :marketId', { marketId })
      .execute();

    this.logger.log(`Updated market ${marketId} statistics`);
  }

  /**
   * Cancel expired orders (run periodically via cron)
   */
  async cancelExpiredOrders(): Promise<void> {
    const expiredOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.expiresAt < :now', { now: new Date() })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED],
      })
      .getMany();

    for (const order of expiredOrders) {
      order.status = OrderStatus.EXPIRED;
      await this.ordersRepository.save(order);
      this.logger.log(`Expired order ${order.orderNumber}`);
    }
  }
}

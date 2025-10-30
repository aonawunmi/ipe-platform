import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MatchingEngineService } from './matching-engine.service';
import { MarketsModule } from '../markets/markets.module';
import { WalletsModule } from '../wallets/wallets.module';
import { Market } from '../markets/market.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Market]),
    MarketsModule,
    WalletsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, MatchingEngineService],
  exports: [OrdersService, MatchingEngineService, TypeOrmModule],
})
export class OrdersModule {}

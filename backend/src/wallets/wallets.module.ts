import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { LedgerEntry } from './ledger-entry.entity';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, LedgerEntry])],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService, TypeOrmModule],
})
export class WalletsModule {}

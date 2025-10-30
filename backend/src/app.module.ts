import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MarketsModule } from './markets/markets.module';
import { OrdersModule } from './orders/orders.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database Configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Support both DATABASE_URL (Railway/Heroku) and individual vars
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'ipe_platform',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Never true in production! Use migrations instead
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    MarketsModule,
    OrdersModule,
    WalletsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

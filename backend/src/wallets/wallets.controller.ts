import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { TransactionType } from './ledger-entry.entity';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns wallet balance (available, locked, total)',
  })
  async getBalance(@CurrentUser() user: User) {
    return this.walletsService.getBalance(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Returns transaction history',
  })
  async getTransactionHistory(
    @CurrentUser() user: User,
    @Query('type') type?: TransactionType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.walletsService.getTransactionHistory(user.id, {
      type,
      limit,
      offset,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deposit funds into wallet' })
  @ApiResponse({
    status: 201,
    description: 'Deposit successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid deposit parameters',
  })
  async deposit(
    @CurrentUser() user: User,
    @Body() depositDto: { amount: string; description?: string },
  ) {
    return this.walletsService.deposit(
      user.id,
      depositDto.amount,
      depositDto.description,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid withdrawal parameters or insufficient balance',
  })
  async withdraw(
    @CurrentUser() user: User,
    @Body() withdrawDto: { amount: string; description?: string },
  ) {
    return this.walletsService.withdraw(
      user.id,
      withdrawDto.amount,
      withdrawDto.description,
    );
  }
}

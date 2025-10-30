import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MarketsService } from './markets.service';
import { Market, MarketCategory, MarketStatus } from './market.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('markets')
@Controller('markets')
export class MarketsController {
  constructor(private marketsService: MarketsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all markets' })
  @ApiResponse({
    status: 200,
    description: 'List of markets',
  })
  async findAll(
    @Query('category') category?: MarketCategory,
    @Query('status') status?: MarketStatus,
  ): Promise<Market[]> {
    return this.marketsService.findAll({ category, status });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get market by ID' })
  @ApiResponse({
    status: 200,
    description: 'Market details',
  })
  @ApiResponse({
    status: 404,
    description: 'Market not found',
  })
  async findOne(@Param('id') id: string): Promise<Market> {
    return this.marketsService.findById(id);
  }

  @Public()
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get market statistics' })
  @ApiResponse({
    status: 200,
    description: 'Market statistics',
  })
  async getStats(@Param('id') id: string) {
    return this.marketsService.getStats(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new market (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Market created successfully',
  })
  async create(
    @Body() createMarketDto: any,
    @CurrentUser() user: User,
  ): Promise<Market> {
    return this.marketsService.create({
      ...createMarketDto,
      createdBy: user.id,
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order, OrderSide, OrderStatus } from './order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async placeOrder(
    @Body()
    placeOrderDto: {
      marketId: string;
      side: OrderSide;
      price: number;
      quantity: number;
    },
    @CurrentUser() user: User,
  ): Promise<Order> {
    console.log('Place order request:', { user: user?.id, body: placeOrderDto });

    return this.ordersService.placeOrder({
      marketId: placeOrderDto.marketId,
      side: placeOrderDto.side,
      price: placeOrderDto.price,
      quantity: placeOrderDto.quantity,
      userId: user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
  })
  async getMyOrders(
    @CurrentUser() user: User,
    @Query('marketId') marketId?: string,
    @Query('status') status?: OrderStatus,
  ): Promise<Order[]> {
    return this.ordersService.getUserOrders(user.id, { marketId, status });
  }

  @Public()
  @Get('orderbook/:marketId')
  @ApiOperation({ summary: 'Get order book for a market' })
  @ApiResponse({
    status: 200,
    description: 'Order book data',
  })
  async getOrderBook(@Param('marketId') marketId: string) {
    return this.ordersService.getOrderBook(marketId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be cancelled',
  })
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Order> {
    return this.ordersService.cancelOrder(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findById(id);
  }
}

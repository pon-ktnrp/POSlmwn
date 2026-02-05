import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate totals (Preview before Create)' })
  @ApiResponse({ status: 200, description: 'Returns calculated subtotal, tax, discount, and total' })
  calculate(@Body() createOrderDto: CreateOrderDto) {
    // This calls the shared logic but does NOT save to the database
    return this.ordersService.calculateSummary(createOrderDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order (Transaction)' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders history' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order receipt details' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/advance')
  @ApiOperation({ summary: 'Auto-advance order to next status' })
  advanceStatus(@Param('id') id: string) {
    return this.ordersService.advanceStatus(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
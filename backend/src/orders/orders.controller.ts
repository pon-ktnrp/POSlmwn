import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
  @ApiOperation({ summary: 'Auto-advance order to next status (e.g. OPEN -> CONFIRMED)' })
  advanceStatus(@Param('id') id: string) {
    return this.ordersService.advanceStatus(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
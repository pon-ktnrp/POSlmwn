import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discount code' })
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all discount codes' })
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of one code' })
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount code' })
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete (Disable) a code' })
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Generate dummy data (Dev Only)' })
  seed() {
    return this.discountsService.seed();
  }
}
import { Controller, Post } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Generate dummy discount codes (Dev Only)' })
  seed() {
    return this.discountsService.seed();
  }
}
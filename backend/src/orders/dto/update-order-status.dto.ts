import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../orders.enums';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: 'COMPLETED' })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
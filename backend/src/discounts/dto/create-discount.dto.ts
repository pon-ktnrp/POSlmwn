import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { DiscountType } from '../discounts.enums';

export class CreateDiscountDto {
  @ApiProperty({ example: 'WINTER2026' })
  @IsString()
  code: string;

  @ApiProperty({ enum: DiscountType, example: 'PERCENTAGE' })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({ example: 10, description: 'Percentage (10) or Amount in Satang (5000)' })
  @IsInt()
  @Min(0)
  value: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
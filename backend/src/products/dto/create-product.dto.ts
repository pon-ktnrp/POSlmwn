import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Fried Rice' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 8000, description: 'Price in satang (100 = 1 baht)' })
  @IsInt()
  @Min(0)
  priceInt: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'https://example.com/food.jpg', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './entities/discount.entity';
import { DiscountType } from '../orders/orders.enums';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountsRepository: Repository<Discount>,
  ) {}

  // 1. Seed Logic (Create 2 Rules)
  async seed() {
    const count = await this.discountsRepository.count();
    if (count > 0) return { message: 'Discounts already exist. Skipping.' };

    const rules = [
      {
        code: 'IwantInternship',
        type: DiscountType.PERCENTAGE,
        value: 98, // 98%
        isActive: true,
      }
      {
        code: 'SUMMER10',
        type: DiscountType.PERCENTAGE,
        value: 10, // 10%
        isActive: true,
      },
      {
        code: 'WELCOME50',
        type: DiscountType.FIXED_AMOUNT,
        value: 5000, // 50.00 Baht (in Satang)
        isActive: true,
      },
      {
        code: 'EXPIRED',
        type: DiscountType.FIXED_AMOUNT,
        value: 10000,
        isActive: false, // Disabled
      }
    ];

    await this.discountsRepository.save(rules);
    return { message: 'Seeding complete! Added 3 discount codes.' };
  }

  // 2. The Strategy Logic (The Brain)
  async validateAndCalculate(code: string, subtotalInt: number) {
    // A. Find the Rule
    const discount = await this.discountsRepository.findOne({ where: { code } });

    // B. Validation
    if (!discount) {
      throw new NotFoundException(`Discount code "${code}" not found`);
    }
    if (!discount.isActive) {
      throw new BadRequestException(`Discount code "${code}" is no longer active`);
    }

    // C. Calculation Strategy
    let deductionInt = 0;

    if (discount.type === DiscountType.PERCENTAGE) {
      // Math: (Subtotal * Percentage) / 100
      // Example: 10000 Satang * 10 / 100 = 1000 Satang
      deductionInt = Math.floor((subtotalInt * discount.value) / 100);
    } else if (discount.type === DiscountType.FIXED_AMOUNT) {
      // Math: Direct subtraction
      deductionInt = discount.value;
    }

    // D. Safety Check (Discount cannot exceed Subtotal)
    if (deductionInt > subtotalInt) {
      deductionInt = subtotalInt;
    }

    return {
      discountEntity: discount,
      deductionInt: deductionInt,
    };
  }
}
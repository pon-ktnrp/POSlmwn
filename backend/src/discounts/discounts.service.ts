import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './entities/discount.entity';
import { DiscountType } from './discounts.enums';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountsRepository: Repository<Discount>,
  ) {}

  // 1. Create (Admin Manual Entry)
  async create(createDiscountDto: CreateDiscountDto) {

    const code = createDiscountDto.code.trim().toUpperCase(); // ← Normalize
    createDiscountDto.code = code;
    // Check for duplicates
    const existing = await this.discountsRepository.findOne({ 
      where: { code: createDiscountDto.code } 
    });
    if (existing) {
      throw new ConflictException(`Discount code ${createDiscountDto.code} already exists`);
    }

    const discount = this.discountsRepository.create(createDiscountDto);
    return this.discountsRepository.save(discount);
  }

  // 2. Find All (For Admin Dashboard)
  async findAll() {
    return this.discountsRepository.find({
      order: { isActive: 'DESC', createdAt: 'DESC' }, // Active ones first
    });
  }

  // 3. Find One (For Edit Form)
  async findOne(id: string) {
    const discount = await this.discountsRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    return discount;
  }

  // 4. Update (e.g., Disable a code, change value)
  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.findOne(id);
    const updated = this.discountsRepository.merge(discount, updateDiscountDto);
    return this.discountsRepository.save(updated);
  }

  // 5. Soft Delete (Disable it)
  async remove(id: string) {
    const discount = await this.findOne(id);
    discount.isActive = false;
    return this.discountsRepository.save(discount);
  }

  async seed() {
    const count = await this.discountsRepository.count();
    if (count > 0) return { message: 'Discounts already exist. Skipping.' };

    const rules = [
      {
        code: 'INTERNPLS',
        type: DiscountType.PERCENTAGE,
        value: 98, // 98%
        isActive: true,
      },
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
    return { message: `Seeding complete! Added ${rules.length} discount codes.` };
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
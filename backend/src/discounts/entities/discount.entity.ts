import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, UpdateDateColumn } from 'typeorm';
import { DiscountType } from '../discounts.enums';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) // Prevent duplicate codes
  @Column()
  code: string; // e.g. "SUMMER10"

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  type: DiscountType;

  @Column({ 
    type: 'int', 
    comment: 'For PERCENTAGE: 10 means 10%. For FIXED_AMOUNT: 5000 means 50 baht in satang' 
  })
  value: number;

  @Column({ default: true, comment: 'Set to false to disable the code' })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
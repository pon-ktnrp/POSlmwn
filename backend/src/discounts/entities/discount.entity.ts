import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { DiscountType } from '../../orders/orders.enums';

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

  @Column({ type: 'int' })
  value: number; // 10 (percent) or 5000 (satang)

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
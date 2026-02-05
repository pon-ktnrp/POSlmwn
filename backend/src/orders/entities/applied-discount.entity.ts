import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { Discount } from '../../discounts/entities/discount.entity';

@Entity('applied_discounts')
export class AppliedDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.appliedDiscounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  // CHANGE: New Nullable FK. 
  // If the original discount is deleted, this becomes NULL (SET NULL), 
  // but the record stays for the audit.
  @Column({ type: 'uuid', nullable: true })
  discountId: string;

  @ManyToOne(() => Discount, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'discountId' })
  discount: Discount;

  @Column({ type: 'varchar', length: 200 }) // CHANGE: Safe length
  codeSnapshot: string; 

  @Column({ type: 'int' })
  amountDeductedInt: number;
}
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

  @Column({ type: 'uuid', nullable: true })
  discountId?: string | null;

  @ManyToOne(() => Discount, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'discountId' })
  discount?: Discount | null;

  @Column({ type: 'varchar', length: 200 }) 
  codeSnapshot: string; 

  @Column({ type: 'int' })
  amountDeductedInt: number;
}
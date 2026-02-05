import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany, 
  Index 
} from 'typeorm';
import { OrderStatus } from '../orders.enums';
import { OrderItem } from './order-item.entity';
import { AppliedDiscount } from './applied-discount.entity';

@Entity('orders')
// OPTIMIZATION: High-performance index for "Get Daily Report" queries
// It groups orders by status first, then sorts them by date instantly.
@Index('idx_orders_status_createdat', ['status', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Removed @Index() here because the composite index above covers it.
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
  status: OrderStatus;

  @Column({ type: 'int' }) 
  subtotalInt: number;

  @Column({ type: 'int' }) 
  discountInt: number;

  @Column({ type: 'int' }) 
  taxInt: number;

  @Column({ type: 'int' }) 
  finalTotalInt: number;

  // Keep this index for generic "Audit Log" queries that ignore status
  @Index() 
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations (No Cascade - we save manually in Transactions)
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => AppliedDiscount, (ad) => ad.order)
  appliedDiscounts: AppliedDiscount[];
}
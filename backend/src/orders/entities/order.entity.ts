import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { OrderStatus } from '../orders.enums';
import { OrderItem } from './order-item.entity';
import { AppliedDiscount } from './applied-discount.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() // KEEP THIS: Critical for "Show Active Orders"
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
  status: OrderStatus;

  @Column({ type: 'int' }) subtotalInt: number;
  @Column({ type: 'int' }) discountInt: number;
  @Column({ type: 'int' }) taxInt: number;
  @Column({ type: 'int' }) finalTotalInt: number;

  @Index() // KEEP THIS: Critical for "Daily Reports"
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // CHANGE: Removed { cascade: true }. 
  // We will save these manually in the Transaction for safety.
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => AppliedDiscount, (ad) => ad.order)
  appliedDiscounts: AppliedDiscount[];
}
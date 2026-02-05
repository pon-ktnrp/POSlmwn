import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  // RESTRICT: Prevents deleting a Product if it has been sold. 
  // This safeguards data integrity.
  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  // SNAPSHOT: The price at the moment of sale
  @Column({ type: 'int' })
  unitPriceSnapshotInt: number;

  @Column({ length: 200 })
  productNameSnapshot: string;

  @Column({ type: 'int' })
  lineTotalInt: number;
}
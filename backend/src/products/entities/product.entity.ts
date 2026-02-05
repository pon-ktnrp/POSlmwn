import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index() 
  @Column({ length: 200 })
  name: string;

  @Column({ type: 'int', comment: 'Price in satang (100 satang = 1 baht)' })
  priceInt: number;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  // CHANGE: Length 500 because AWS/Firebase URLs are long
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
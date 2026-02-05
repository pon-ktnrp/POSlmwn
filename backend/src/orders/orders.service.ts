import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm'; 
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderStatus } from './orders.enums';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { AppliedDiscount } from './entities/applied-discount.entity';
import { DiscountsService } from '../discounts/discounts.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // Define the workflow map
  private readonly NEXT_STEP: Partial<Record<OrderStatus, OrderStatus>> = {
    [OrderStatus.OPEN]: OrderStatus.CONFIRMED,
    [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
    [OrderStatus.PREPARING]: OrderStatus.READY,
    [OrderStatus.READY]: OrderStatus.COMPLETED,
  };

  constructor(
    private dataSource: DataSource, 
    private discountsService: DiscountsService, 
  ) {}

  // --- 1. CORE CALCULATION ENGINE (Shared Logic) ---
  // This calculates totals without saving anything. Used by 'Preview' and 'Create'.
  async calculateSummary(createOrderDto: CreateOrderDto) {
    if (!createOrderDto.items?.length) {
      throw new BadRequestException('Order must have at least 1 item');
    }

    // A. Fetch Products
    const productIds = [...new Set(createOrderDto.items.map(i => i.productId))];
    const products = await this.dataSource.getRepository(Product).find({ 
      where: { id: In(productIds), isActive: true } 
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are missing or inactive');
    }

    const productsMap = new Map(products.map((p) => [p.id, p]));

    // B. Calculate Items & Subtotal
    let subtotalInt = 0;
    const itemDetails = [];

    for (const itemDto of createOrderDto.items) {
      const product = productsMap.get(itemDto.productId);
      const lineTotal = product.priceInt * itemDto.quantity;
      subtotalInt += lineTotal;

      itemDetails.push({
        product,
        quantity: itemDto.quantity,
        lineTotalInt: lineTotal,
      });
    }

    // C. Calculate Discount
    let discountInt = 0;
    let discountEntity = null;

    if (createOrderDto.discountCode) {
      const code = createOrderDto.discountCode.trim().toUpperCase();
      const result = await this.discountsService.validateAndCalculate(code, subtotalInt);
      
      discountInt = result.deductionInt;
      discountEntity = result.discountEntity;
    }

    // D. Calculate Tax & Final Total
    const taxBaseInt = subtotalInt - discountInt;
    if (taxBaseInt < 0) throw new BadRequestException('Discount exceeds subtotal');

    const taxInt = Math.floor((taxBaseInt * 7) / 100);
    const finalTotalInt = taxBaseInt + taxInt;

    // Return everything needed for the UI or the DB Save
    return {
      subtotalInt,
      discountInt,
      taxInt,
      finalTotalInt,
      discountEntity,
      itemDetails, // Contains the actual Product entities
    };
  }

  // --- 2. CREATE ORDER (Transactional) ---
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(`Starting Order Transaction for ${createOrderDto.items?.length} items...`);

    // 1. Run the calculation FIRST to ensure validity
    const calculation = await this.calculateSummary(createOrderDto);

    return this.dataSource.transaction(async (manager) => {
      // 2. Save Order Header
      const order = new Order();
      order.status = OrderStatus.OPEN;
      order.subtotalInt = calculation.subtotalInt;
      order.discountInt = calculation.discountInt;
      order.taxInt = calculation.taxInt;
      order.finalTotalInt = calculation.finalTotalInt;

      const savedOrder = await manager.save(Order, order);

      // 3. Save Order Items (Using the product entities we already fetched)
      const orderItems = calculation.itemDetails.map((detail) => {
        const item = new OrderItem();
        item.orderId = savedOrder.id;
        item.productId = detail.product.id;
        item.quantity = detail.quantity;
        item.unitPriceSnapshotInt = detail.product.priceInt;
        item.productNameSnapshot = detail.product.name;
        item.lineTotalInt = detail.lineTotalInt;
        return item;
      });
      await manager.save(OrderItem, orderItems);

      // 4. Save Discount Usage
      if (calculation.discountEntity) {
        const appliedDiscount = new AppliedDiscount();
        appliedDiscount.orderId = savedOrder.id;
        appliedDiscount.discountId = calculation.discountEntity.id;
        appliedDiscount.codeSnapshot = calculation.discountEntity.code;
        appliedDiscount.amountDeductedInt = calculation.discountInt;
        await manager.save(AppliedDiscount, appliedDiscount);
      }

      this.logger.log(`Order Created: ID ${savedOrder.id} | Total: ${order.finalTotalInt}`);

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'appliedDiscounts'],
      });
    });
  }

  // --- 3. OTHER METHODS (FindAll, FindOne, Advance, Cancel) ---
  
  async findAll() {
    return this.dataSource.getRepository(Order).find({
      order: { createdAt: 'DESC' },
      relations: ['items', 'appliedDiscounts'],
    });
  }

  async findOne(id: string) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id },
      relations: ['items', 'appliedDiscounts'], 
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async advanceStatus(id: string) {
    const order = await this.findOne(id);
    const nextStatus = this.NEXT_STEP[order.status];

    if (!nextStatus) {
      throw new BadRequestException(`Order is already ${order.status} and cannot be advanced.`);
    }

    order.status = nextStatus;
    return this.dataSource.getRepository(Order).save(order);
  }

  async cancel(id: string) {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(`Cannot cancel an order that is ${order.status}`);
    }
    order.status = OrderStatus.CANCELLED;
    return this.dataSource.getRepository(Order).save(order);
  }
}
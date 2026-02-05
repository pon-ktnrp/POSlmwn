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
  // 1. Initialize Logger
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private dataSource: DataSource, 
    private discountsService: DiscountsService, 
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(`Starting Order Transaction for ${createOrderDto.items?.length} items...`);

    return this.dataSource.transaction(async (manager) => {
      if (!createOrderDto.items?.length) {
        throw new BadRequestException('Order must have at least 1 item');
      }

      const productIds = [...new Set(createOrderDto.items.map(i => i.productId))];

      const productRepo = manager.getRepository(Product);
      const products = await productRepo.find({ 
        where: { id: In(productIds), isActive: true } 
      });

      if (products.length !== new Set(productIds).size) {
        this.logger.error(`Order failed: Products missing or inactive. Requested: ${productIds.join(', ')}`);
        throw new NotFoundException('One or more products not found');
      }

      const productsMap = new Map(products.map((p) => [p.id, p]));

      let subtotalInt = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = productsMap.get(itemDto.productId);
        // Double check existence (Typescript safety)
        if (!product) throw new NotFoundException(`Product ID ${itemDto.productId} not found`);
        
        const lineTotal = product.priceInt * itemDto.quantity;
        subtotalInt += lineTotal;

        const orderItem = new OrderItem();
        orderItem.productId = product.id;
        orderItem.quantity = itemDto.quantity;
        orderItem.unitPriceSnapshotInt = product.priceInt;
        orderItem.productNameSnapshot = product.name;
        orderItem.lineTotalInt = lineTotal;

        orderItems.push(orderItem);
      }

      let discountInt = 0;
      let appliedDiscountEntity: AppliedDiscount | null = null;

      if (createOrderDto.discountCode) {
        const code = createOrderDto.discountCode.trim().toUpperCase();
        this.logger.debug(`Attempting to apply discount code: ${code}`);

        const { discountEntity, deductionInt } =
          await this.discountsService.validateAndCalculate(
            code,
            subtotalInt,
          );

        discountInt = deductionInt;

        appliedDiscountEntity = new AppliedDiscount();
        appliedDiscountEntity.discountId = discountEntity.id;
        appliedDiscountEntity.codeSnapshot = discountEntity.code;
        appliedDiscountEntity.amountDeductedInt = deductionInt;
        
        this.logger.log(`Discount applied: ${code} (-${deductionInt})`);
      }

      const taxBaseInt = subtotalInt - discountInt;
      if (taxBaseInt < 0) {
        this.logger.warn(`Calculation Error: Discount exceeded subtotal. Sub: ${subtotalInt}, Disc: ${discountInt}`);
        throw new BadRequestException('Discount exceeds subtotal');
      }

      const taxInt = Math.floor((taxBaseInt * 7) / 100);
      const finalTotalInt = taxBaseInt + taxInt;

      // Save Order Header
      const order = new Order();
      order.status = OrderStatus.OPEN;
      order.subtotalInt = subtotalInt;
      order.discountInt = discountInt;
      order.taxInt = taxInt;
      order.finalTotalInt = finalTotalInt;

      const savedOrder = await manager.save(Order, order);

      // Save Items
      for (const item of orderItems) {
        item.orderId = savedOrder.id;
      }
      await manager.save(OrderItem, orderItems);

      // Save Discount audit
      if (appliedDiscountEntity) {
        appliedDiscountEntity.orderId = savedOrder.id;
        await manager.save(AppliedDiscount, appliedDiscountEntity);
      }

      this.logger.log(`Order Created Successfully: ID ${savedOrder.id} | Total: ${finalTotalInt}`);

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'appliedDiscounts'],
      });
    });
  }

  async findAll() {
    this.logger.log('Fetching all orders history');
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

    if (!order) {
      this.logger.warn(`Order Lookup Failed: ID ${id} not found`);
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

// 1. Define the Strict Linear Workflow
  // This map tells the system: "If I am X, the ONLY next step is Y"
  private readonly NEXT_STEP: Partial<Record<OrderStatus, OrderStatus>> = {
    [OrderStatus.OPEN]: OrderStatus.CONFIRMED,
    [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
    [OrderStatus.PREPARING]: OrderStatus.READY,
    [OrderStatus.READY]: OrderStatus.COMPLETED,
    // COMPLETED and CANCELLED have no "next" step.
  };

  // 2. The New "Auto-Advance" Method (No 'newStatus' parameter needed!)
  async advanceStatus(id: string) {
    const order = await this.findOne(id);
    const nextStatus = this.NEXT_STEP[order.status];

    // Validation: Are we at the end of the line?
    if (!nextStatus) {
      this.logger.warn(`Order ${id} is already ${order.status}. Cannot advance further.`);
      throw new BadRequestException(`Order is already ${order.status} and cannot be advanced.`);
    }

    this.logger.log(`Advancing Order ${id}: ${order.status} -> ${nextStatus}`);

    order.status = nextStatus;
    const result = await this.dataSource.getRepository(Order).save(order);

    this.logger.log(`Order ${id} successfully moved to ${nextStatus}`);
    return result;
  }

  // Keep 'cancel' exactly as it is! It's the "Emergency Stop" button.
  async cancel(id: string) {
    this.logger.log(`Request to CANCEL Order ID: ${id}`);
    const order = await this.findOne(id);
    
    // Ensure we aren't cancelling something already done
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(`Cannot cancel an order that is ${order.status}`);
    }
    
    order.status = OrderStatus.CANCELLED;
    return this.dataSource.getRepository(Order).save(order);
  }
}
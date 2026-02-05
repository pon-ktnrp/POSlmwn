import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { DiscountsService } from '../discounts/discounts.service';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from './orders.enums';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';

// --- MOCK DATA ---
const mockProduct = {
  id: 'prod-1',
  name: 'Test Product',
  priceInt: 10000,
  isActive: true,
} as Product;

const mockOrder = {
  id: 'order-1',
  status: OrderStatus.OPEN,
  subtotalInt: 10000,
  items: [],
} as unknown as Order;

describe('OrdersService', () => {
  let service: OrdersService;
  let dataSource: DataSource;

  // Mock DiscountsService
  const mockDiscountsService = {
    validateAndCalculate: jest.fn(),
  };

  // Mock the Transaction Manager (The "fake" database connection)
  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn().mockResolvedValue([mockProduct]),
    }),
    findBy: jest.fn().mockResolvedValue([mockProduct]),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ ...entity, id: 'saved-id' })),
    findOne: jest.fn().mockResolvedValue(mockOrder),
  };

  // Mock the DataSource
  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: DiscountsService, useValue: mockDiscountsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const dto = { items: [{ productId: 'prod-1', quantity: 1 }] };
      
      await service.create(dto);

      // Verify transaction started
      expect(dataSource.transaction).toHaveBeenCalled();
      // Verify save was called
      expect(mockEntityManager.save).toHaveBeenCalled();
    });
  });

  describe('advanceStatus', () => {
    it('should correctly advance from OPEN to CONFIRMED', async () => {
      // Mock finding an OPEN order
      mockDataSource.getRepository().findOne.mockResolvedValue({ 
        ...mockOrder, 
        status: OrderStatus.OPEN 
      });
      // Mock the save
      mockDataSource.getRepository().save.mockImplementation((order) => Promise.resolve(order));

      const result = await service.advanceStatus('order-1');

      // Assert status changed
      expect(result.status).toEqual(OrderStatus.CONFIRMED);
      expect(mockDataSource.getRepository().save).toHaveBeenCalled();
    });

    it('should correctly advance from READY to COMPLETED', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue({ 
        ...mockOrder, 
        status: OrderStatus.READY 
      });
      mockDataSource.getRepository().save.mockImplementation((order) => Promise.resolve(order));

      const result = await service.advanceStatus('order-1');
      expect(result.status).toEqual(OrderStatus.COMPLETED);
    });

    it('should throw error if trying to advance COMPLETED order', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue({ 
        ...mockOrder, 
        status: OrderStatus.COMPLETED 
      });

      // Should fail
      await expect(service.advanceStatus('order-1'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
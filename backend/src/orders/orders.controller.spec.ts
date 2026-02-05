import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  // 1. Create the Fake Service
  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    advanceStatus: jest.fn(), // Make sure this matches your new method name!
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      // 2. Provide the Fake instead of the Real
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // 3. Test that Controller calls the Service
  it('should call advanceStatus', async () => {
    const id = 'order-123';
    await controller.advanceStatus(id);
    expect(service.advanceStatus).toHaveBeenCalledWith(id);
  });

  it('should call cancel', async () => {
    const id = 'order-123';
    await controller.cancel(id);
    expect(service.cancel).toHaveBeenCalledWith(id);
  });
});
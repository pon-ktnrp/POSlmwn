import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    seed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clean up mocks between tests
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        { id: '1', name: 'Pad Thai', priceInt: 8000, isActive: true },
        { id: '2', name: 'Tom Yum', priceInt: 15000, isActive: true },
      ];
      
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();
      
      expect(result).toEqual(mockProducts);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const mockProduct = { id: '123', name: 'Pad Thai', priceInt: 8000 };
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('123');
      
      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const dto: CreateProductDto = {
        name: 'Green Curry',
        priceInt: 12000,
        isActive: true,
      };
      
      const mockCreated = { id: 'new-id', ...dto };
      mockProductsService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(dto);
      
      expect(result).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const id = '123';
      const dto: UpdateProductDto = { priceInt: 9000 };
      const mockUpdated = { id, name: 'Pad Thai', priceInt: 9000 };
      
      mockProductsService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update(id, dto);
      
      expect(result).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const id = '123';
      const mockDeleted = { id, name: 'Pad Thai', isActive: false };
      
      mockProductsService.remove.mockResolvedValue(mockDeleted);

      const result = await controller.remove(id);
      
      expect(result).toEqual(mockDeleted);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('seed', () => {
    it('should seed the database', async () => {
      const mockResponse = { message: 'Seeding complete! Added 5 products.' };
      mockProductsService.seed.mockResolvedValue(mockResponse);

      const result = await controller.seed();
      
      expect(result).toEqual(mockResponse);
      expect(service.seed).toHaveBeenCalled();
    });
  });
});
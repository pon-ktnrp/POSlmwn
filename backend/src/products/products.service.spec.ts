import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of active products with metadata', async () => {
      const mockProducts = [
        { id: '1', name: 'Pad Thai', priceInt: 8000, isActive: true },
        { id: '2', name: 'Tom Yum', priceInt: 15000, isActive: true },
      ];
      
      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findAll();
      
      // ✅ Test the new structure
      expect(result).toEqual({
        data: mockProducts,
        count: 2,
        message: 'Active products retrieved successfully',
      });
      
      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    });

    it('should return empty data if no active products', async () => {
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      
      // ✅ Test the new structure
      expect(result).toEqual({
        data: [],
        count: 0,
        message: 'Active products retrieved successfully',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const mockProduct = { id: '123', name: 'Pad Thai', priceInt: 8000 };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('123');
      
      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Product with ID invalid-id not found',
      );
    });
  });

  describe('create', () => {
    it('should create and save a new product', async () => {
      const dto: CreateProductDto = {
        name: 'Green Curry',
        priceInt: 12000,
      };
      
      const mockProduct = { id: 'new-id', ...dto, isActive: true };
      
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(dto);
      
      expect(result).toEqual(mockProduct);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const id = '123';
      const dto: UpdateProductDto = { priceInt: 9000 };
      
      const existingProduct = { id, name: 'Pad Thai', priceInt: 8000, isActive: true };
      const updatedProduct = { ...existingProduct, priceInt: 9000 };
      
      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.merge.mockReturnValue(updatedProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(id, dto);
      
      expect(result).toEqual(updatedProduct);
      expect(repository.merge).toHaveBeenCalledWith(existingProduct, dto);
      expect(repository.save).toHaveBeenCalledWith(updatedProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove (soft delete)', () => {
    it('should set isActive to false', async () => {
      const id = '123';
      const existingProduct = { id, name: 'Pad Thai', priceInt: 8000, isActive: true };
      const deletedProduct = { ...existingProduct, isActive: false };
      
      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(deletedProduct);

      const result = await service.remove(id);
      
      expect(result.isActive).toBe(false);
      expect(repository.save).toHaveBeenCalledWith(deletedProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('seed', () => {
    it('should skip seeding if products already exist', async () => {
      mockProductRepository.count.mockResolvedValue(5);

      const result = await service.seed();
      
      expect(result.message).toContain('already exist');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should seed products if database is empty', async () => {
      const mockProducts = [
        { name: 'Pad Thai', priceInt: 8000 },
        { name: 'Tom Yum', priceInt: 15000 },
      ];
      
      mockProductRepository.count.mockResolvedValue(0);
      mockProductRepository.create.mockReturnValue(mockProducts);
      mockProductRepository.save.mockResolvedValue(mockProducts);

      const result = await service.seed();
      
      expect(result.message).toContain('Seeding complete');
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
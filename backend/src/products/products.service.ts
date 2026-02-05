import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll() {
    const products = await this.productsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return {
      data: products,
      count: products.length,
      message: 'Active products retrieved successfully',
    };
  }

  async create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  // --- NEW CRUD LOGIC STARTS HERE ---

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id); // Re-use findOne to check existence
    const updated = this.productsRepository.merge(product, updateProductDto);
    return this.productsRepository.save(updated);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    product.isActive = false; // Soft Delete
    return this.productsRepository.save(product);
  }

  // --- SEED LOGIC ---
  async seed() {
    const count = await this.productsRepository.count();
    if (count > 0) return { message: 'Products already exist. Skipping seed.' };

  const dummyProducts = [
    { 
      name: 'Pad Thai', 
      priceInt: 8000, 
      imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e'
    },
    { 
      name: 'Tom Yum Kung', 
      priceInt: 15000, 
      imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853' 
    },
    { 
      name: 'Green Curry', 
      priceInt: 12000, 
      imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd' 
    },
    { 
      name: 'Coke Zero', 
      priceInt: 2500, 
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' 
    },
    { 
      name: 'Mango Sticky Rice', 
      priceInt: 9000, 
      imageUrl: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7' 
    },
  ];

    const entities = this.productsRepository.create(dummyProducts);
    await this.productsRepository.save(entities);

    return { message: 'Seeding complete! Added 5 products.' };
  }
}
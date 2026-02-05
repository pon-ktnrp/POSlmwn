import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReportsModule } from './reports/reports.module';
import { DiscountsModule } from './discounts/discounts.module';


@Module({
  imports: [
    // 1. Load the .env file globally
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere without importing it
    }),

    // 2. Configure TypeORM asynchronously (wait for Config to load first)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        
        // AUTO LOAD: Finds all files ending in .entity.ts
        autoLoadEntities: true, 

        // SYNCHRONIZE: Automatically creates tables based on Entities.
        // WARNING: Set to 'false' in production to avoid accidental data loss.
        synchronize: true, 
      }),
    }),

    ProductsModule,

    OrdersModule,

    ReportsModule,

    DiscountsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
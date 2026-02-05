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
        // 1. USE THE URL: NestJS parses the long string automatically
        url: configService.get<string>('DATABASE_URL'), 
        
        // 2. REQUIRED FOR CLOUD: Cloud DBs reject non-SSL connections
        ssl: {
          rejectUnauthorized: false, 
        },

        autoLoadEntities: true,
        synchronize: true, // This will auto-create your 5 tables in the cloud!
        // ADD THIS if you use "Transaction Pooler" (Port 6543)
      extra: {
        max: 10, // connection pool size
      }
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
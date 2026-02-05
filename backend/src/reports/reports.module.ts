import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
// IMPORT: We need access to Orders to generate reports
import { Order } from '../orders/entities/order.entity'; 

@Module({
  // REGISTER: Give ReportsService access to the Order table
  imports: [TypeOrmModule.forFeature([Order])], 
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
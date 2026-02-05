import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Report for a time period: summary + paginated orders list' })
  @ApiQuery({ name: 'from', required: true, example: '2026-02-05' })
  @ApiQuery({ name: 'to', required: true, example: '2026-03-07' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  getReport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reportsService.getReport(from, to, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }
}

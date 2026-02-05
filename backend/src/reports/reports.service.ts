import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

function parseRange(from: string, to: string) {
  const start = new Date(from);
  const endInclusive = new Date(to);

  if (Number.isNaN(start.getTime()) || Number.isNaN(endInclusive.getTime())) {
    throw new BadRequestException('Invalid date format. Use YYYY-MM-DD for from/to');
  }

  start.setHours(0, 0, 0, 0);

  const endExclusive = new Date(endInclusive);
  endExclusive.setHours(0, 0, 0, 0);
  endExclusive.setDate(endExclusive.getDate() + 1);

  if (endExclusive <= start) {
    throw new BadRequestException('"to" must be the same day or after "from"');
  }

  return { start, endExclusive };
}

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

  async getReport(from: string, to: string, page = 1, pageSize = 20) {
    const { start, endExclusive } = parseRange(from, to);

    if (!Number.isFinite(page) || page < 1) throw new BadRequestException('page must be >= 1');
    if (!Number.isFinite(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new BadRequestException('pageSize must be between 1 and 100');
    }

    const offset = (page - 1) * pageSize;

    // 1) SUMMARY (fast, aggregated)
    const summarySql = `
      SELECT
        COUNT(*)::int AS "orderCount",
        COALESCE(SUM(o."subtotalInt"), 0)::int AS "grossSalesInt",
        COALESCE(SUM(o."discountInt"), 0)::int AS "discountsInt",
        COALESCE(SUM(o."taxInt"), 0)::int AS "taxInt",
        COALESCE(SUM(o."finalTotalInt"), 0)::int AS "finalSalesInt"
      FROM orders o
      WHERE o."createdAt" >= $1
        AND o."createdAt" < $2
        AND o.status <> 'CANCELLED'
    `;

    // 2) TOTAL COUNT (for pagination)
    const countSql = `
      SELECT COUNT(*)::int AS "total"
      FROM orders o
      WHERE o."createdAt" >= $1
        AND o."createdAt" < $2
        AND o.status <> 'CANCELLED'
    `;

    // 3) ORDERS PAGE (light fields only)
    const ordersSql = `
      SELECT
        o.id,
        o.status,
        o."createdAt",
        o."subtotalInt",
        o."discountInt",
        o."taxInt",
        o."finalTotalInt"
      FROM orders o
      WHERE o."createdAt" >= $1
        AND o."createdAt" < $2
        AND o.status <> 'CANCELLED'
      ORDER BY o."createdAt" DESC
      LIMIT $3 OFFSET $4
    `;

    const [summaryRows, countRows, orders] = await Promise.all([
      this.dataSource.query(summarySql, [start.toISOString(), endExclusive.toISOString()]),
      this.dataSource.query(countSql, [start.toISOString(), endExclusive.toISOString()]),
      this.dataSource.query(ordersSql, [start.toISOString(), endExclusive.toISOString(), pageSize, offset]),
    ]);

    const s = summaryRows[0];
    const total = countRows[0].total;

    const netSalesInt = s.grossSalesInt - s.discountsInt;
    const avgOrderValueInt = s.orderCount > 0 ? Math.floor(s.finalSalesInt / s.orderCount) : 0;

    // 4) Batch load items + discounts for the orders on this page (no N+1)
    const orderIds: string[] = orders.map((o: any) => o.id);

    let items: any[] = [];
    let appliedDiscounts: any[] = [];

    if (orderIds.length) {
      const itemsSql = `
        SELECT
          oi."orderId",
          oi."productNameSnapshot" AS "productName",
          oi.quantity,
          oi."unitPriceSnapshotInt",
          oi."lineTotalInt"
        FROM order_items oi
        WHERE oi."orderId" = ANY($1)
        ORDER BY oi."orderId"
      `;

      const discountsSql = `
        SELECT
          ad."orderId",
          ad."codeSnapshot",
          ad."amountDeductedInt"
        FROM applied_discounts ad
        WHERE ad."orderId" = ANY($1)
      `;

      [items, appliedDiscounts] = await Promise.all([
        this.dataSource.query(itemsSql, [orderIds]),
        this.dataSource.query(discountsSql, [orderIds]),
      ]);
    }

    // Attach
    const itemsByOrder = new Map<string, any[]>();
    for (const it of items) {
      const arr = itemsByOrder.get(it.orderId) ?? [];
      arr.push(it);
      itemsByOrder.set(it.orderId, arr);
    }

    const discountsByOrder = new Map<string, any[]>();
    for (const d of appliedDiscounts) {
      const arr = discountsByOrder.get(d.orderId) ?? [];
      arr.push(d);
      discountsByOrder.set(d.orderId, arr);
    }

    const enrichedOrders = orders.map((o: any) => ({
      ...o,
      items: itemsByOrder.get(o.id) ?? [],
      appliedDiscounts: discountsByOrder.get(o.id) ?? [],
    }));

    return {
      period: { from, to },
      summary: {
        orderCount: s.orderCount,
        grossSalesInt: s.grossSalesInt,
        discountsInt: s.discountsInt,
        netSalesInt,
        taxInt: s.taxInt,
        finalSalesInt: s.finalSalesInt,
        avgOrderValueInt,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      orders: enrichedOrders,
    };
  }
}

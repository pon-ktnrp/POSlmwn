import axios from 'axios';

// Ensure this matches your NestJS port
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; 

export const api = axios.create({
  baseURL: API_URL,
});

export interface Product {
  id: string;
  name: string;
  priceInt: number; // Stored in Satang/Cents
  isActive: boolean;
  imageUrl?: string; 
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: OrderItem[];
  discountCode?: string;
}

export interface OrderCalculation {
  subtotalInt: number;
  discountInt: number;
  taxInt: number;
  finalTotalInt: number;
  // backend might return discountEntity or itemDetails too
}

export const fetcher = (url: string) => 
  api.get(url).then((res) => {
    // Adapter if backend wraps in { data: ... }
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  });

// --- 1. PREVIEW TOTALS (The Calculator) ---
export const calculateOrder = async (dto: CreateOrderDto): Promise<OrderCalculation> => {
  const { data } = await api.post('/orders/calculate', dto);
  return data;
};
  
// --- 2. SUBMIT ORDER (The Transaction) ---
export const createOrder = async (dto: CreateOrderDto) => {
  const { data } = await api.post('/orders', dto);
  return data;
};

export interface Order {
  id: string;
  status: 'OPEN' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  finalTotalInt: number;
  createdAt: string;
  items: {
    id: string;
    productNameSnapshot: string;
    quantity: number;
    lineTotalInt: number;
  }[];
}

// --- ORDERS API ---

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders');
  return data;
};

export const advanceOrderStatus = async (id: string) => {
  const { data } = await api.patch(`/orders/${id}/advance`);
  return data;
};

export const cancelOrder = async (id: string) => {
  const { data } = await api.patch(`/orders/${id}/cancel`);
  return data;
};

export interface ReportSummary {
  orderCount: number;
  grossSalesInt: number;
  discountsInt: number;
  netSalesInt: number;
  taxInt: number;
  finalSalesInt: number;
  avgOrderValueInt: number;
}

export interface ReportResponse {
  period: { from: string; to: string };
  summary: ReportSummary;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  orders: any[]; // Or reuse your Order interface
}

export const getReport = async (from: string, to: string, page = 1) => {
  // Assuming controller is @Get('reports')
  const { data } = await api.get('/reports', {
    params: { from, to, page, pageSize: 10 }
  });
  return data;
};
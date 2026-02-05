'use client';

import useSWR, { mutate } from 'swr';
import { getOrders, advanceOrderStatus, cancelOrder, Order } from '@/lib/api';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import OrderTable from '@/components/orders/OrderTable';

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useSWR<Order[]>('/orders', getOrders, {
    refreshInterval: 5000, 
  });

  const handleAdvance = async (id: string) => {
    try {
      await advanceOrderStatus(id);
      mutate('/orders'); 
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(id);
      mutate('/orders');
    } catch (err) {
      alert('Failed to cancel order');
    }
  };

  if (isLoading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">Failed to load orders.</Alert></Box>;

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Orders List</Typography>
        <Button startIcon={<RefreshIcon />} onClick={() => mutate('/orders')}>Refresh</Button>
      </Box>

      <OrderTable 
        orders={orders || []} 
        onAdvance={handleAdvance} 
        onCancel={handleCancel} 
      />
    </Box>
  );
}
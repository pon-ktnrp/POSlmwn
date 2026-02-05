'use client';

import useSWR, { mutate } from 'swr';
import { getOrders, advanceOrderStatus, cancelOrder, Order } from '@/lib/api';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, IconButton, CircularProgress, Alert, Tooltip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
// If you don't have date-fns, just use new DateString()

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useSWR<Order[]>('/orders', getOrders, {
    refreshInterval: 5000, // Auto-refresh every 5 seconds
  });

  const handleAdvance = async (id: string) => {
    try {
      await advanceOrderStatus(id);
      mutate('/orders'); // Refresh list immediately
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

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'info';
      case 'CONFIRMED': return 'secondary';
      case 'PREPARING': return 'warning';
      case 'READY': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  // Helper to determine next step label
  const getNextStepLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Confirm Order';
      case 'CONFIRMED': return 'Start Cooking';
      case 'PREPARING': return 'Mark Ready';
      case 'READY': return 'Complete';
      default: return null;
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

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#eee' }}>
            <TableRow>
              <TableCell><strong>Order ID</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Items</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No orders found</TableCell>
              </TableRow>
            ) : (
              orders?.map((order) => {
                const nextStep = getNextStepLabel(order.status);
                const isFinal = order.status === 'COMPLETED' || order.status === 'CANCELLED';

                return (
                  <TableRow key={order.id} hover>
                    {/* ID */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">#{order.id.slice(0, 8)}</Typography>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      {/* Use simple JS date if you don't have date-fns */}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>

                    {/* Items List */}
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {order.items.map((item) => (
                          <Typography key={item.id} variant="body2">
                            <b>{item.quantity}x</b> {item.productNameSnapshot}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>

                    {/* Total */}
                    <TableCell>
                      <Typography fontWeight="bold">
                        ฿{(order.finalTotalInt / 100).toFixed(2)}
                      </Typography>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell align="right">
                      {!isFinal && (
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          {/* Cancel Button */}
                          <Tooltip title="Cancel Order">
                            <IconButton color="error" size="small" onClick={() => handleCancel(order.id)}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>

                          {/* Advance Status Button */}
                          {nextStep && (
                            <Button 
                              variant="contained" 
                              size="small" 
                              color="primary"
                              endIcon={<ArrowForwardIcon />}
                              onClick={() => handleAdvance(order.id)}
                              sx={{ minWidth: 140 }}
                            >
                              {nextStep}
                            </Button>
                          )}
                        </Box>
                      )}
                      
                      {order.status === 'COMPLETED' && (
                        <Typography variant="caption" color="success.main" display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          <CheckCircleIcon fontSize="small" /> Done
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
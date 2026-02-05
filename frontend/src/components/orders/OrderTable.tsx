'use client';

import { 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, IconButton, Box, Typography, Tooltip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Order } from '@/lib/api';

interface Props {
  orders: Order[];
  onAdvance: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function OrderTable({ orders, onAdvance, onCancel }: Props) {
  
  // Helper: Status Color
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

  // Helper: Next Step Label
  const getNextStepLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Confirm Order';
      case 'CONFIRMED': return 'Start Cooking';
      case 'PREPARING': return 'Mark Ready';
      case 'READY': return 'Complete';
      default: return null;
    }
  };

  return (
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
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No orders found</TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const nextStep = getNextStepLabel(order.status);
              const isFinal = order.status === 'COMPLETED' || order.status === 'CANCELLED';

              return (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">#{order.id.slice(0, 8)}</Typography>
                  </TableCell>

                  <TableCell>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>

                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {order.items.map((item) => (
                        <Typography key={item.id} variant="body2">
                          <b>{item.quantity}x</b> {item.productNameSnapshot}
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight="bold">
                      ฿{(order.finalTotalInt / 100).toFixed(2)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any} 
                      size="small" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    {!isFinal && (
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Tooltip title="Cancel Order">
                          <IconButton color="error" size="small" onClick={() => onCancel(order.id)}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>

                        {nextStep && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="primary"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => onAdvance(order.id)}
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
  );
}
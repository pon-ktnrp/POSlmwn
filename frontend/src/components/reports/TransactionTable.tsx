'use client';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Chip, Stack, Box, Pagination 
} from '@mui/material';
import { fmtCurrency } from '@/lib/utils'; // Or paste helper here

interface Props {
  orders: any[];
  pagination: { totalPages: number; page: number };
  onPageChange: (page: number) => void;
}

export default function TransactionTable({ orders, pagination, onPageChange }: Props) {
  return (
    <TableContainer component={Paper} elevation={2}>
      <Box p={2} borderBottom="1px solid #eee">
        <Typography variant="h6" fontWeight="bold">Transaction History</Typography>
      </Box>
      <Table>
        <TableHead sx={{ bgcolor: '#fafafa' }}>
          <TableRow>
            <TableCell><strong>Time</strong></TableCell>
            <TableCell><strong>Order ID</strong></TableCell>
            <TableCell><strong>Items</strong></TableCell>
            <TableCell align="right"><strong>Subtotal</strong></TableCell>
            <TableCell align="right"><strong>Discount</strong></TableCell>
            <TableCell align="right"><strong>Total</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length === 0 ? (
             <TableRow>
               <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No transactions found for this period</TableCell>
             </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    size="small" 
                    color={order.status === 'COMPLETED' ? 'success' : 'default'} 
                    variant="outlined" 
                    sx={{ mb: 0.5 }} 
                  />
                  <Typography variant="caption" display="block">#{order.id.slice(0, 8)}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="column" spacing={0.5}>
                    {order.items.map((item: any, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <b>{item.quantity}x</b> {item.productName}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="right">{fmtCurrency(order.subtotalInt)}</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  {order.discountInt > 0 ? `-${fmtCurrency(order.discountInt)}` : '-'}
                  {order.appliedDiscounts.length > 0 && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      ({order.appliedDiscounts[0].codeSnapshot})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{fmtCurrency(order.finalTotalInt)}</Typography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination Control */}
      <Box p={2} display="flex" justifyContent="center">
        <Pagination 
          count={pagination.totalPages} 
          page={pagination.page} 
          onChange={(_, p) => onPageChange(p)} 
          color="primary"
        />
      </Box>
    </TableContainer>
  );
}
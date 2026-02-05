'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getReport, ReportResponse } from '@/lib/api';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, Button, 
  CircularProgress, Alert, Pagination, Chip, Stack, Divider 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default function ReportPage() {
  // Default to Today
  const today = new Date().toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ from: today, to: today });
  const [page, setPage] = useState(1);

  // Fetch Data
  const { data, error, isLoading } = useSWR<ReportResponse>(
    ['/reports', dateRange.from, dateRange.to, page],
    () => getReport(dateRange.from, dateRange.to, page)
  );

  const fmtCurrency = (val: number) => `฿${(val / 100).toFixed(2)}`;

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      
      {/* 1. Header & Controls */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Typography variant="h4" fontWeight="bold">Sales Report</Typography>
        
        <Box display="flex" gap={2} bgcolor="white" p={2} borderRadius={2} boxShadow={1}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Button 
            variant="contained" 
            onClick={() => setPage(1)} // Reset to page 1 on new search
          >
            Filter
          </Button>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error">Failed to load report</Alert>
      ) : isLoading || !data ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : (
        <>
          {/* 2. Summary Cards */}
          <Grid container spacing={3} mb={4}>
            <SummaryCard 
              title="Total Sales" 
              value={fmtCurrency(data.summary.finalSalesInt)} 
              icon={<AttachMoneyIcon fontSize="large" color="primary" />} 
            />
            <SummaryCard 
              title="Total Orders" 
              value={data.summary.orderCount.toString()} 
              icon={<ReceiptIcon fontSize="large" color="info" />} 
            />
            <SummaryCard 
              title="Discounts Given" 
              value={`-${fmtCurrency(data.summary.discountsInt)}`} 
              icon={<LocalOfferIcon fontSize="large" color="error" />} 
              textColor="error.main"
            />
            <SummaryCard 
              title="Avg Order Value" 
              value={fmtCurrency(data.summary.avgOrderValueInt)} 
              icon={<TrendingUpIcon fontSize="large" color="success" />} 
            />
          </Grid>

          {/* 3. Detailed Table */}
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
                {data.orders.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No transactions found for this period</TableCell>
                   </TableRow>
                ) : (
                  data.orders.map((order: any) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={order.status} size="small" color={order.status === 'COMPLETED' ? 'success' : 'default'} variant="outlined" sx={{ mb: 0.5 }} />
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
                count={data.pagination.totalPages} 
                page={page} 
                onChange={(_, p) => setPage(p)} 
                color="primary"
              />
            </Box>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

// Simple Sub-component for Dashboard Cards
function SummaryCard({ title, value, icon, textColor = 'inherit' }: any) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box mr={2}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" fontWeight="bold" color={textColor}>{value}</Typography>
        </Box>
      </Paper>
    </Grid>
  );
}
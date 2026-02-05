'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getReport, ReportResponse } from '@/lib/api';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

// Import the new components
import ReportControls from '@/components/reports/ReportControls';
import ReportSummaryGrid from '@/components/reports/ReportSummaryGrid';
import TransactionTable from '@/components/reports/TransactionTable';

export default function ReportPage() {
  const today = new Date().toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ from: today, to: today });
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR<ReportResponse>(
    ['/reports', dateRange.from, dateRange.to, page],
    () => getReport(dateRange.from, dateRange.to, page)
  );

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      
      {/* Header & Controls */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Typography variant="h4" fontWeight="bold">Sales Report</Typography>
        
        <ReportControls 
            dateRange={dateRange}
            onDateChange={(field, value) => setDateRange(prev => ({ ...prev, [field]: value }))}
            onFilter={() => setPage(1)}
        />
      </Box>

      {/* Content Area */}
      {error ? (
        <Alert severity="error">Failed to load report</Alert>
      ) : isLoading || !data ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : (
        <>
          <ReportSummaryGrid summary={data.summary} />
          
          <TransactionTable 
            orders={data.orders} 
            pagination={{ totalPages: data.pagination.totalPages, page: page }}
            onPageChange={setPage}
          />
        </>
      )}
    </Box>
  );
}
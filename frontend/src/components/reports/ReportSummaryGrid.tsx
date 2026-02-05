'use client';
import { Grid, Paper, Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { ReportSummary } from '@/lib/api';
import { fmtCurrency } from '@/lib/utils'; // Or paste the helper function here

interface Props {
  summary: ReportSummary;
}

export default function ReportSummaryGrid({ summary }: Props) {
  return (
    <Grid container spacing={3} mb={4}>
      <SummaryCard 
        title="Total Sales" 
        value={fmtCurrency(summary.finalSalesInt)} 
        icon={<AttachMoneyIcon fontSize="large" color="primary" />} 
      />
      <SummaryCard 
        title="Total Orders" 
        value={summary.orderCount.toString()} 
        icon={<ReceiptIcon fontSize="large" color="info" />} 
      />
      <SummaryCard 
        title="Discounts Given" 
        value={`-${fmtCurrency(summary.discountsInt)}`} 
        icon={<LocalOfferIcon fontSize="large" color="error" />} 
        textColor="error.main"
      />
      <SummaryCard 
        title="Avg Order Value" 
        value={fmtCurrency(summary.avgOrderValueInt)} 
        icon={<TrendingUpIcon fontSize="large" color="success" />} 
      />
    </Grid>
  );
}

// Sub-component (Internal)
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
'use client';

import useSWR from 'swr';
import { fetcher, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import { Grid, Box, Typography, CircularProgress, Alert } from '@mui/material';

export default function Home() {
  const { data: products, error, isLoading } = useSWR<Product[]>('/products', fetcher);

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box p={4}><Alert severity="error">Failed to load menu. Is the backend running?</Alert></Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
      
      {/* LEFT: Menu Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f5f5f5' }}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold">POS Order</Typography>
        </Box>

        <Grid container spacing={3}>
          {products?.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* RIGHT: Cart Sidebar */}
      <Box sx={{ width: { xs: '100%', md: '400px' }, borderLeft: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Box sx={{ height: '100%' }}>
            <CartSidebar /> 
        </Box>
      </Box>

    </Box>
  );
}
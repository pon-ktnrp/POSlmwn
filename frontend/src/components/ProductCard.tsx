'use client';

import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Product } from '@/lib/api';
import { useCartStore } from '@/lib/store';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
      }}
    >
      {!product.isActive && (
        <Chip 
          label="Sold Out" 
          color="error" 
          size="small" 
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} 
        />
      )}

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#f9f9f9' }}>
        <Box 
          component="img"
          src={product.imageUrl || 'https://placehold.co/200x200?text=No+Image'} 
          alt={product.name}
          sx={{ 
            width: 140, 
            height: 140, 
            borderRadius: '50%', 
            objectFit: 'cover',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Typography variant="h6" component="div" fontWeight="bold" noWrap>
          {product.name}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {/* Convert Satang to Baht */}
            ฿{(product.priceInt / 100).toFixed(2)}
          </Typography>
          
          <IconButton 
            color="primary" 
            onClick={() => addToCart(product)} 
            disabled={!product.isActive}
            size="large"
          >
            <AddCircleIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
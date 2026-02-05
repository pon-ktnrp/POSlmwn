'use client';

import { 
  Box, Typography, Button, IconButton, Stack, TextField, InputAdornment, 
  CircularProgress, Alert, Snackbar 
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/lib/store';
import { calculateOrder, createOrder, CreateOrderDto, OrderCalculation } from '@/lib/api';

export default function CartSidebar() {
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCartStore();
  
  // Local State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  
  const [totals, setTotals] = useState<OrderCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Helper: Format integer (Satang) to Currency
  const fmt = (val: number) => `฿${(val / 100).toFixed(2)}`;

  // --- 1. SYNC WITH BACKEND ---
  const fetchTotals = useCallback(async () => {
    if (items.length === 0) {
      setTotals(null);
      return;
    }

    setLoading(true);
    // REMOVED: setErrorMsg('') -- We don't auto-clear errors here anymore. 
    // This prevents the error from disappearing when the cart refreshes after a failed code.
    
    try {
      const dto: CreateOrderDto = {
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        discountCode: appliedCode || undefined
      };
      
      const result = await calculateOrder(dto);
      setTotals(result);
    } catch (err: any) {
      // If code is invalid, backend throws 404 or 400
      if (appliedCode) {
        setErrorMsg('Invalid Code'); 
        setAppliedCode(''); // Reset invalid code so the cart recalculates normally
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [items, appliedCode]);

  // Trigger calculation automatically when cart changes
  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);


  // --- 2. HANDLERS ---
  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    setErrorMsg(''); // Clear error when user explicitly tries again
    setAppliedCode(promoCodeInput); 
  };

  const handlePromoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeInput(e.target.value);
    if (errorMsg) setErrorMsg(''); // Clear error as soon as user types
  };

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
       const dto: CreateOrderDto = {
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        discountCode: appliedCode || undefined
      };
      await createOrder(dto);
      
      // Success!
      setSuccessMsg('Order placed successfully!');
      clearCart();
      setAppliedCode('');
      setPromoCodeInput('');
      setTotals(null);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      
      {/* HEADER */}
      <Box mb={2}>
        <Typography variant="h5" fontWeight="bold">Current Order</Typography>
        <Typography variant="body2" color="text.secondary">
          {items.length} items
        </Typography>
      </Box>

      {/* ITEMS LIST */}
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        {items.length === 0 ? (
          <Box display="flex" height="50%" alignItems="center" justifyContent="center" color="text.secondary">
            <Typography>Cart is empty</Typography>
          </Box>
        ) : (
          items.map(({ product, quantity }) => (
            <Box key={product.id} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box sx={{ maxWidth: '40%' }}>
                <Typography fontWeight="medium" noWrap>{product.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {fmt(product.priceInt)}
                </Typography>
              </Box>
              
              {/* Qty Controls */}
              <Box display="flex" alignItems="center" bgcolor="#f5f5f5" borderRadius={1}>
                <IconButton size="small" onClick={() => decreaseQuantity(product.id)}>
                   {quantity === 1 ? <DeleteOutlineIcon fontSize="small" color="error"/> : <RemoveIcon fontSize="small"/>}
                </IconButton>
                <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{quantity}</Typography>
                <IconButton size="small" onClick={() => addToCart(product)}>
                  <AddIcon fontSize="small"/>
                </IconButton>
              </Box>

              <Typography fontWeight="bold" sx={{ minWidth: 60, textAlign: 'right' }}>
                {fmt(product.priceInt * quantity)}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* PROMO INPUT */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Promo Code"
          value={promoCodeInput}
          disabled={items.length === 0}
          onChange={handlePromoChange}
          error={!!errorMsg} // Turns the input red
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><LocalOfferIcon color="action" fontSize="small"/></InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button 
                  size="small" 
                  onClick={handleApplyPromo}
                  disabled={!promoCodeInput || loading}
                  sx={{ fontWeight: 'bold' }}
                >
                  Apply
                </Button>
              </InputAdornment>
            ),
          }}
        />
        {appliedCode && <Typography variant="caption" color="success.main">Code "{appliedCode}" applied!</Typography>}
        {errorMsg && <Typography variant="caption" color="error">{errorMsg}</Typography>}
      </Box>

      {/* TOTALS (From Backend) */}
      <Stack spacing={1} mb={3} sx={{ borderTop: '1px solid #eee', pt: 2 }}>
        {totals ? (
          <>
            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight="medium">{fmt(totals.subtotalInt)}</Typography>
            </Box>
            
            {/* Show Discount only if it exists */}
            {totals.discountInt > 0 && (
              <Box display="flex" justifyContent="space-between" color="success.main">
                <Typography>Discount</Typography>
                <Typography fontWeight="bold">-{fmt(totals.discountInt)}</Typography>
              </Box>
            )}

            <Box display="flex" justifyContent="space-between">
              <Typography color="text.secondary">Tax (7%)</Typography>
              <Typography fontWeight="medium">{fmt(totals.taxInt)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {fmt(totals.finalTotalInt)}
              </Typography>
            </Box>
          </>
        ) : (
           <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold">฿0.00</Typography>
            </Box>
        )}
      </Stack>

      {/* SUBMIT BUTTON */}
      <Button 
        variant="contained" 
        fullWidth 
        size="large" 
        onClick={handlePlaceOrder}
        disabled={items.length === 0 || loading}
        sx={{ py: 1.5, borderRadius: 2 }}
      >
        {loading ? <CircularProgress size={24} color="inherit"/> : 'Place Order'}
      </Button>

      {/* SUCCESS POPUP */}
      <Snackbar 
        open={!!successMsg} 
        autoHideDuration={4000} 
        onClose={() => setSuccessMsg('')}
      >
        <Alert severity="success" variant="filled">{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
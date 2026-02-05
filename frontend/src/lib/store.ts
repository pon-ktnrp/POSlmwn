import { create } from 'zustand';
import { Product } from './api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addToCart: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },

  decreaseQuantity: (productId) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return {
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
          ),
        };
      }
      return {
        items: state.items.filter((i) => i.product.id !== productId),
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },

  clearCart: () => set({ items: [] }),
}));
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  namebn?: string;
  price: number;
  quantity: number;
  variant?: any;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, variant?: any) => void;
  updateQuantity: (id: number, variant: any, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(item => 
          item.id === newItem.id && JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
        );

        if (existingItemIndex !== -1) {
          return {
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          };
        }

        return {
          items: [...state.items, newItem]
        };
      }),

      removeFromCart: (id, variant) => set((state) => ({
        items: state.items.filter(item => 
          !(item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant))
        )
      })),

      updateQuantity: (id, variant, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(item => 
              !(item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant))
            )
          };
        }

        return {
          items: state.items.map(item =>
            item.id === id && JSON.stringify(item.variant) === JSON.stringify(variant) 
              ? { ...item, quantity } 
              : item
          )
        };
      }),

      clearCart: () => set(() => ({ items: [] })),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  namebn: string;
  price: number;
  quantity: number;
  variant?: any;
  imageUrl?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  deliveryLocation?: string;
  paymentMethod: string;
  specialInstructions?: string;
  promoCode?: string;
}

interface CartStore {
  items: CartItem[];
  customerInfo: CustomerInfo;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  getTotalItems: () => number;
  setCustomerInfo: (info: CustomerInfo) => void;
  createOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      customerInfo: {
        name: '',
        phone: '',
        email: '',
        address: '',
        deliveryLocation: '',
        paymentMethod: 'cash_on_delivery',
        specialInstructions: '',
        promoCode: ''
      },

      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.id === newItem.id);

        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          };
        }

        return {
          items: [...state.items, newItem]
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(item => item.id !== id)
          };
        }

        return {
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        };
      }),

      clearCart: () => set(() => ({
        items: [],
        customerInfo: {
          name: '',
          phone: '',
          email: '',
          address: '',
          deliveryLocation: '',
          paymentMethod: 'cash_on_delivery',
          specialInstructions: '',
          promoCode: ''
        }
      })),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotal: () => {
        const { items } = get();
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const deliveryFee = 6000; // 60 BDT in paisa
        return subtotal + deliveryFee;
      },

      getTotalPrice: () => {
        return get().getTotal();
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getTotalItems: () => {
        return get().getItemCount();
      },

      toggleCart: () => set((state) => ({
        isOpen: !state.isOpen
      })),

      openCart: () => set(() => ({
        isOpen: true
      })),

      closeCart: () => set(() => ({
        isOpen: false
      })),

      setCustomerInfo: (info) => set(() => ({
        customerInfo: info
      })),

      createOrder: async () => {
        const { items, customerInfo, clearCart } = get();

        if (items.length === 0) {
          return { success: false, error: 'Cart is empty' };
        }

        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
          return { success: false, error: 'Missing required customer information' };
        }

        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const deliveryFee = 6000; // 60 BDT in paisa
        const finalAmount = subtotal + deliveryFee;

        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerName: customerInfo.name,
              customerPhone: customerInfo.phone,
              customerEmail: customerInfo.email || null,
              customerAddress: customerInfo.address,
              deliveryLocation: customerInfo.deliveryLocation || null,
              paymentMethod: customerInfo.paymentMethod,
              specialInstructions: customerInfo.specialInstructions || null,
              promoCode: customerInfo.promoCode || null,
              items: items,
              subtotal: subtotal,
              totalAmount: subtotal,
              deliveryFee: deliveryFee,
              discountAmount: 0,
              finalAmount: finalAmount
            }),
          });

          const result = await response.json();

          if (result.success) {
            clearCart();
            return { success: true, orderId: result.orderId };
          } else {
            return { success: false, error: result.error || 'Failed to create order' };
          }

        } catch (error) {
          console.error('Order creation error:', error);
          return { success: false, error: 'Network error occurred' };
        }
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from './config';

export interface CartItem {
  id: number;
  name: string;
  namebn?: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
  deliveryLocation?: string;
  paymentMethod?: string;
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
        address: '',
        email: '',
        deliveryLocation: '',
        paymentMethod: 'cash',
        specialInstructions: '',
        promoCode: ''
      },

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => 
            item.id === newItem.id && 
            JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
          );

          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === newItem.id && 
                JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            };
          } else {
            return {
              items: [...state.items, newItem]
            };
          }
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
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
        });
      },

      clearCart: () => {
        set(() => ({
          items: [],
          customerInfo: {
            name: '',
            phone: '',
            address: '',
            email: '',
            deliveryLocation: '',
            paymentMethod: 'cash',
            specialInstructions: '',
            promoCode: ''
          }
        }));
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = subtotal > 100000 ? 0 : 6000; // Free delivery over 1000 BDT
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
        const { items, customerInfo, getTotal, clearCart } = get();
        
        if (items.length === 0) {
          return { success: false, error: 'Cart is empty' };
        }

        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
          return { success: false, error: 'Please fill in all required fields' };
        }

        try {
          const orderData = {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerAddress: customerInfo.address,
            customerEmail: customerInfo.email || '',
            deliveryLocation: customerInfo.deliveryLocation || '',
            paymentMethod: customerInfo.paymentMethod || 'cash',
            specialInstructions: customerInfo.specialInstructions || '',
            promoCode: customerInfo.promoCode || '',
            items: items.map(item => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              variant: item.variant || {}
            })),
            totalAmount: getTotal(),
            discountAmount: 0,
            deliveryFee: getTotal() - get().getSubtotal(),
            finalAmount: getTotal()
          };

          const response = await fetch(getApiUrl('api/orders'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success) {
            clearCart();
            return { success: true, orderId: result.orderId };
          } else {
            return { success: false, error: result.error || 'Failed to create order' };
          }
        } catch (error) {
          console.error('Error creating order:', error);
          return { success: false, error: 'Network error. Please try again.' };
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        customerInfo: state.customerInfo,
      }),
    }
  )
);

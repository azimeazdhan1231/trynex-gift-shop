import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, DeliveryZone, PaymentMethod } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  deliveryZone: string;
  paymentMethod: string;
  promoCode: string;
  promoDiscount: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setDeliveryZone: (zone: string) => void;
  setPaymentMethod: (method: string) => void;
  setPromoCode: (code: string, discount: number) => void;
  
  // Getters
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const deliveryZones: DeliveryZone[] = [
  { id: 'dhaka-inside', name: 'Inside Dhaka', namebn: 'ঢাকার ভিতরে', fee: 70 },
  { id: 'dhaka-outside', name: 'Outside Dhaka', namebn: 'ঢাকার বাইরে', fee: 120 },
  { id: 'outside-50km', name: '50km+ Outside', namebn: '50km+ বাইরে', fee: 150 }
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'bkash', name: 'bKash', namebn: 'বিকাশ', icon: 'mobile-payment' },
  { id: 'nagad', name: 'Nagad', namebn: 'নগদ', icon: 'mobile-payment' },
  { id: 'rocket', name: 'Rocket', namebn: 'রকেট', icon: 'mobile-payment' }
];

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      deliveryZone: 'dhaka-inside',
      paymentMethod: 'bkash',
      promoCode: '',
      promoDiscount: 0,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }]
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === id
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({
          items: [],
          promoCode: '',
          promoDiscount: 0
        });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      setDeliveryZone: (zone) => {
        set({ deliveryZone: zone });
      },

      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      setPromoCode: (code, discount) => {
        set({ promoCode: code, promoDiscount: discount });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getDeliveryFee: () => {
        const zone = deliveryZones.find(z => z.id === get().deliveryZone);
        return zone ? zone.fee : 80;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const discount = (subtotal * get().promoDiscount) / 100;
        return subtotal + deliveryFee - discount;
      }
    }),
    {
      name: 'trynex-cart',
      partialize: (state) => ({
        items: state.items,
        deliveryZone: state.deliveryZone,
        paymentMethod: state.paymentMethod,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount
      })
    }
  )
);

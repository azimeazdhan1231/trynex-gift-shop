import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@/hooks/use-toast";
import { getApiUrl } from "./config";

export interface CartItem {
  id: number;
  name: string;
  namebn: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variant?: { size?: string; color?: string; [key: string]: any };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;

  // Cart actions
  addItem: (product: any, quantity?: number, variant?: any) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;

  // Order actions
  placeOrder: (orderDetails: any) => Promise<{ success: boolean; orderId?: string; error?: string }>;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      addItem: (product, quantity = 1, variant = null) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === product.id && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            return { items: updatedItems };
          } else {
            const newItem: CartItem = {
              id: product.id,
              name: product.name,
              namebn: product.namebn,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity,
              variant
            };
            return { items: [...state.items, newItem] };
          }
        });

        toast({
          title: "Added to cart",
          description: `${product.namebn || product.name} has been added to your cart.`,
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }));

        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart.",
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      placeOrder: async (orderDetails) => {
        console.log("🛒 Starting order placement process...");
        set({ isLoading: true });

        try {
          const { items } = get();

          if (items.length === 0) {
            throw new Error("Cart is empty");
          }

          // Validate required fields
          if (!orderDetails.customerName || !orderDetails.customerPhone || !orderDetails.customerAddress) {
            throw new Error("Missing required fields: name, phone, and address are required");
          }

          // Calculate totals
          const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const deliveryFee = orderDetails.deliveryFee || 12000; // 120 BDT in paisa
          const discountAmount = orderDetails.discountAmount || 0;
          const totalAmount = subtotal + deliveryFee - discountAmount;

          // Generate order ID
          const orderId = `TXR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

          const orderData = {
            id: crypto.randomUUID(),
            orderId: orderId,
            customerName: orderDetails.customerName.trim(),
            customerPhone: orderDetails.customerPhone.trim(),
            customerAddress: orderDetails.customerAddress.trim(),
            customerEmail: orderDetails.customerEmail?.trim() || null,
            deliveryLocation: orderDetails.deliveryLocation?.trim() || null,
            paymentMethod: orderDetails.paymentMethod || 'cash_on_delivery',
            specialInstructions: orderDetails.specialInstructions?.trim() || null,
            promoCode: orderDetails.promoCode?.trim() || null,
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              namebn: item.namebn,
              price: item.price,
              quantity: item.quantity,
              variant: item.variant || null
            })),
            subtotal,
            deliveryFee,
            discountAmount,
            totalAmount,
            finalAmount: totalAmount,
            status: 'pending'
          };

          console.log("📦 Placing order with data:", orderData);

          const response = await fetch(getApiUrl('/api/orders'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(orderData)
          });

          console.log("📡 Order API response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Order API error response:", errorText);

            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // If it's not JSON, use the text as error message
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const result = await response.json();
          console.log("✅ Order API success response:", result);

          if (result.success && result.orderId) {
            // Clear cart on successful order
            get().clearCart();

            toast({
              title: "Order placed successfully! 🎉",
              description: `Your order ${result.orderId} has been placed successfully. You will receive a confirmation call soon.`,
            });

            return { success: true, orderId: result.orderId };
          } else {
            throw new Error(result.error || "Order placement failed");
          }

        } catch (error) {
          console.error("❌ Error placing order:", error);

          const errorMessage = error.message || "Failed to place order. Please try again.";

          toast({
            title: "Order failed ❌",
            description: errorMessage,
            variant: "destructive",
          });

          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },

      getTotal: () => {
        return get().getTotalPrice();
      },

      getSubtotal: () => {
        return get().getTotalPrice();
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
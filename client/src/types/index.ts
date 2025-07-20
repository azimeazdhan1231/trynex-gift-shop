export interface CartItem {
  id: number;
  name: string;
  namebn: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  namebn: string;
  fee: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  namebn: string;
  icon: string;
}

export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryLocation: string;
  paymentMethod: string;
  specialInstructions?: string;
  promoCode?: string;
}

export interface FlashSale {
  discount: number;
  endsAt: Date;
  minOrder: number;
}

export interface Category {
  id: string;
  name: string;
  namebn: string;
  icon: string;
  minPrice: number;
}

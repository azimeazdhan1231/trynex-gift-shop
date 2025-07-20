
export interface CartItem {
  id: number;
  name: string;
  namebn: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  namebn: string;
  description: string;
  descriptionbn: string;
  price: number;
  category: string;
  categorybn: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  variants: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  deliveryLocation: string;
  specialInstructions: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  specialInstructions?: string;
}

export interface Category {
  id: string;
  name: string;
  namebn: string;
  icon: string;
}

import { useState } from "react";
import { ShoppingCart, Plus, Minus, X, Truck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useCartStore } from "../lib/cart-store";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const deliveryLocations = [
  { name: "Dhaka", fee: 60 },
  { name: "Chittagong", fee: 120 },
  { name: "Rajshahi", fee: 100 },
  { name: "Khulna", fee: 100 },
  { name: "Barisal", fee: 120 },
  { name: "Sylhet", fee: 120 },
  { name: "Rangpur", fee: 120 },
  { name: "Mymensingh", fee: 100 }
];

export function CartPage() {
  const { toast } = useToast();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getItemCount } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const selectedLocation = deliveryLocations.find(loc => loc.name === deliveryLocation);
  const deliveryFee = selectedLocation ? selectedLocation.fee * 100 : 6000;
  const subtotal = getTotalPrice();
  const finalAmount = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Successful!",
        description: `Your order has been placed. Order ID: ${data.order_id}`,
        variant: "default",
      });
      clearCart();
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setDeliveryLocation("");
      setSpecialInstructions("");
    },
    onError: (error) => {
      console.error("Order creation error:", error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePlaceOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim() || !deliveryLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: customerAddress.trim(),
      deliveryLocation,
      paymentMethod,
      specialInstructions: specialInstructions.trim() || undefined,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        namebn: item.namebn || item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant
      })),
      subtotal,
      deliveryFee,
      discountAmount: 0,
      totalAmount: subtotal,
      finalAmount
    };

    createOrderMutation.mutate(orderData);
  };

  const formatPrice = (price: number) => {
    return `৳${(price / 100).toFixed(0)}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to get started!</p>
            <Button onClick={() => window.location.href = '/products'}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({getItemCount()} items)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.variant)}`} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.namebn && <p className="text-sm text-gray-500">{item.namebn}</p>}
                    <p className="text-sm text-green-600 font-medium">{formatPrice(item.price)}</p>
                    {item.variant && (
                      <p className="text-xs text-gray-500">
                        {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.variant, Math.max(0, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="ml-2 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input 
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01xxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input 
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea 
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House/Road, Area, Thana, District"
                  required
                />
              </div>

              <div>
                <Label htmlFor="delivery">Delivery District *</Label>
                <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryLocations.map((location) => (
                      <SelectItem key={location.name} value={location.name}>
                        {location.name} (৳{location.fee})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="upay">Upay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea 
                  id="instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requirements"
                />
              </div>

              {/* Order Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(finalAmount)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Placing Order..." : `Place Order - ${formatPrice(finalAmount)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Plus, Minus, ShoppingBag, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/lib/cart-store";
import { useMutation } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [orderData, setOrderData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerEmail: "",
    deliveryLocation: "",
    paymentMethod: "cash_on_delivery",
    specialInstructions: "",
    promoCode: ""
  });
  const [orderId, setOrderId] = useState("");
  const { toast } = useToast();

  const deliveryFee = 60 * 100; // 60 BDT in paisa
  const subtotal = getTotalPrice();
  const finalTotal = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setStep("success");
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Your order ID is ${data.orderId}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderData.customerName || !orderData.customerPhone || !orderData.customerAddress) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      namebn: item.namebn,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      variant: item.variant
    }));

    const orderPayload = {
      ...orderData,
      items: orderItems,
      subtotal: subtotal,
      totalAmount: subtotal,
      discountAmount: 0,
      deliveryFee: deliveryFee,
      finalAmount: finalTotal
    };

    createOrderMutation.mutate(orderPayload);
  };

  const formatPrice = (price: number) => `৳${(price / 100).toFixed(0)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2 text-red-600" />
              {step === "cart" ? "Your Cart" : step === "checkout" ? "Checkout" : "Order Confirmed"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "cart" && (
            <div>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 font-bengali">আপনার কার্ট খালি</p>
                </div>
              ) : (
                <div>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`} 
                           className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500 font-bengali">{item.namebn}</p>
                          {item.selectedSize && (
                            <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>
                          )}
                          {item.selectedColor && (
                            <p className="text-xs text-gray-400">Color: {item.selectedColor}</p>
                          )}
                          <p className="font-bold text-red-600">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          Delivery:
                        </span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xl font-bold text-gray-800">
                          <span>Total:</span>
                          <span className="text-red-600">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setStep("checkout")}
                      className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold py-3 rounded-full"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "checkout" && (
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>{getTotalItems()} items</span>
                  <span className="font-bold">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={orderData.customerName}
                    onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
                    placeholder="আপনার পূর্ণ নাম"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={orderData.customerPhone}
                    onChange={(e) => setOrderData({...orderData, customerPhone: e.target.value})}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerAddress">Full Address *</Label>
                  <Textarea
                    id="customerAddress"
                    value={orderData.customerAddress}
                    onChange={(e) => setOrderData({...orderData, customerAddress: e.target.value})}
                    placeholder="আপনার সম্পূর্ণ ঠিকানা"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={orderData.customerEmail}
                    onChange={(e) => setOrderData({...orderData, customerEmail: e.target.value})}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={orderData.paymentMethod}
                    onValueChange={(value) => setOrderData({...orderData, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash_on_delivery">
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          Cash on Delivery
                        </div>
                      </SelectItem>
                      <SelectItem value="bkash">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          bKash
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    value={orderData.specialInstructions}
                    onChange={(e) => setOrderData({...orderData, specialInstructions: e.target.value})}
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("cart")}
                  className="flex-1"
                >
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
                >
                  {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Your order ID is: <span className="font-bold text-red-600">{orderId}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6 font-bengali">
                আপনার অর্ডারটি সফলভাবে প্লেস হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
              </p>
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "@/hooks/use-toast";

export default function CartModal() {
  const {
    items,
    isOpen,
    isLoading,
    setIsOpen,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems,
    placeOrder
  } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerEmail: "",
    deliveryLocation: "dhaka-inside",
    paymentMethod: "cash_on_delivery",
    specialInstructions: "",
    promoCode: ""
  });

  const deliveryFees = {
    "dhaka-inside": 12000, // 120 BDT
    "dhaka-outside": 20000, // 200 BDT
  };

  const subtotal = getTotalPrice();
  const deliveryFee = deliveryFees[orderForm.deliveryLocation] || 12000;
  const totalAmount = subtotal + deliveryFee;

  const formatPrice = (price: number) => `৳${(price / 100).toFixed(0)}`;

  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart first.",
        variant: "destructive"
      });
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.customerAddress) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const result = await placeOrder({
      ...orderForm,
      deliveryFee,
      discountAmount: 0
    });

    if (result.success) {
      setShowCheckout(false);
      setIsOpen(false);
      setOrderForm({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        customerEmail: "",
        deliveryLocation: "dhaka-inside",
        paymentMethod: "cash_on_delivery",
        specialInstructions: "",
        promoCode: ""
      });

      toast({
        title: "Order placed successfully!",
        description: `Your order ${result.orderId} has been placed. You will receive a confirmation call soon.`,
      });
    }
  };

  if (showCheckout) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Checkout - Order Summary
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Order Items</h3>
              {items.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.variant)}`} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-medium">{item.namebn || item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Customer Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                    required
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customerAddress">Full Address *</Label>
                <Textarea
                  id="customerAddress"
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm({...orderForm, customerAddress: e.target.value})}
                  required
                  placeholder="House/Flat, Road, Area, Thana, District"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({...orderForm, customerEmail: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryLocation">Delivery Location</Label>
                  <Select
                    value={orderForm.deliveryLocation}
                    onValueChange={(value) => setOrderForm({...orderForm, deliveryLocation: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhaka-inside">Inside Dhaka (৳120)</SelectItem>
                      <SelectItem value="dhaka-outside">Outside Dhaka (৳200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={orderForm.paymentMethod}
                    onValueChange={(value) => setOrderForm({...orderForm, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  value={orderForm.specialInstructions}
                  onChange={(e) => setOrderForm({...orderForm, specialInstructions: e.target.value})}
                  placeholder="Any special requests or delivery instructions..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckout(false)}
                className="flex-1"
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Placing Order..." : `Place Order (${formatPrice(totalAmount)})`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shopping Cart ({getTotalItems()})
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
              <p className="text-sm text-gray-500 font-bengali">আপনার কার্ট খালি</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.variant)}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.namebn || item.name}</h4>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                    {item.variant && (
                      <p className="text-xs text-gray-500">
                        {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total: {formatPrice(getTotalPrice())}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
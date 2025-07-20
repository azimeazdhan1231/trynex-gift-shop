import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, X, ShoppingBag, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/config";

export default function CartModal() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    clearCart,
    getSubtotal,
    getDeliveryFee,
    getTotal
  } = useCartStore();

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'cash_on_delivery',
    specialInstructions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { toast } = useToast();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handleSubmitOrder = async () => {
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.customerAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart first",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          namebn: item.namebn,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: orderForm.paymentMethod,
        deliveryLocation: 'dhaka',
        specialInstructions: orderForm.specialInstructions
      };

      console.log('🛒 Submitting order:', orderData);

      const response = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Order submission failed:', errorData);
        throw new Error(`Order failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Order created:', result);

      setOrderId(result.orderId);
      setOrderSuccess(true);
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Order ID: ${result.orderId}`,
        duration: 5000
      });

    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Order Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setOrderSuccess(false);
    setOrderId('');
    setOrderForm({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      paymentMethod: 'cash_on_delivery',
      specialInstructions: ''
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={toggleCart}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {orderSuccess ? 'Order Confirmed!' : 'Shopping Cart'}
          </DialogTitle>
        </DialogHeader>

        {orderSuccess ? (
          <div className="text-center space-y-4 p-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold text-green-600">Order Placed Successfully!</h3>
            <p className="text-gray-600">Your Order ID: <strong>{orderId}</strong></p>
            <p className="text-sm text-gray-500">We'll call you soon to confirm your order.</p>
            <Button onClick={() => { resetModal(); toggleCart(); }} className="w-full">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">{item.namebn}</p>
                      <p className="font-semibold text-red-600">৳{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>৳{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>৳{total}</span>
              </div>
            </div>

            <Separator />

            {/* Order Form */}
            <div className="space-y-3">
              <h4 className="font-semibold">Customer Information</h4>

              <Input
                placeholder="Full Name *"
                value={orderForm.customerName}
                onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />

              <Input
                placeholder="Phone Number *"
                value={orderForm.customerPhone}
                onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
              />

              <Textarea
                placeholder="Full Address *"
                value={orderForm.customerAddress}
                onChange={(e) => setOrderForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                required
              />

              <select
                className="w-full p-2 border rounded"
                value={orderForm.paymentMethod}
                onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
              </select>

              <Textarea
                placeholder="Special Instructions (Optional)"
                value={orderForm.specialInstructions}
                onChange={(e) => setOrderForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
              />

              <Button 
                onClick={handleSubmitOrder}
                className="w-full"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? 'Placing Order...' : `Place Order (৳${total})`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryLocation: string;
  paymentMethod: string;
  specialInstructions: string;
}

export default function CartModal() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    deliveryZone,
    setDeliveryZone,
    paymentMethod,
    setPaymentMethod,
    getTotal
  } = useCartStore();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    deliveryLocation: deliveryZone,
    paymentMethod: paymentMethod,
    specialInstructions: ""
  });

  const [currentStep, setCurrentStep] = useState<"cart" | "form" | "confirmation">("cart");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { toast } = useToast();

  // Update form when store values change
  useState(() => {
    setOrderForm(prev => ({
      ...prev,
      deliveryLocation: deliveryZone,
      paymentMethod: paymentMethod
    }));
  });

  const deliveryFee = deliveryZone === "inside" ? 70 : 120;
  const subtotal = getTotal();
  const total = subtotal + deliveryFee;

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: "প্রোমো কোড প্রয়োজন",
        description: "অনুগ্রহ করে একটি প্রোমো কোড লিখুন",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/promo-codes/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "প্রোমো কোড প্রয়োগ হয়েছে!",
          description: `${data.discount}% ছাড় পেয়েছেন`,
        });
      } else {
        toast({
          title: "অবৈধ প্রোমো কোড",
          description: "এই প্রোমো কোড টি বৈধ নয়",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast({
        title: "ত্রুটি",
        description: "প্রোমো কোড প্রয়োগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!orderForm.customerName.trim() || !orderForm.customerPhone.trim() || !orderForm.customerAddress.trim()) {
      toast({
        title: "সব তথ্য পূরণ করুন",
        description: "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingOrder(true);

    try {
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          namebn: item.namebn,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          image: item.image
        })),
        customer: {
          name: orderForm.customerName,
          phone: orderForm.customerPhone,
          address: orderForm.customerAddress
        },
        deliveryLocation: orderForm.deliveryLocation,
        paymentMethod: orderForm.paymentMethod,
        specialInstructions: orderForm.specialInstructions,
        subtotal,
        deliveryFee,
        total
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentStep("confirmation");
        clearCart();
        toast({
          title: "অর্ডার সফল হয়েছে!",
          description: `আপনার অর্ডার আইডি: ${result.orderId}`,
        });
      } else {
        throw new Error("Order submission failed");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "অর্ডার করতে সমস্যা",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleClose = () => {
    closeCart();
    setCurrentStep("cart");
    setOrderForm({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      deliveryLocation: deliveryZone,
      paymentMethod: paymentMethod,
      specialInstructions: ""
    });
  };

  const proceedToForm = () => {
    if (items.length === 0) {
      toast({
        title: "কার্ট খালি",
        description: "অনুগ্রহ করে প্রোডাক্ট যোগ করুন",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("form");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🛒 Shopping Cart
          </DialogTitle>
        </DialogHeader>

        {currentStep === "cart" && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-center py-8 text-gray-500">আপনার কার্ট খালি</p>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.namebn}</p>
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
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="প্রোমো কোড লিখুন... Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                  />
                  <Button onClick={handleApplyPromoCode}>Apply</Button>
                </div>

                <Separator />

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

                <Button 
                  onClick={proceedToForm} 
                  className="w-full"
                  disabled={items.length === 0}
                >
                  অর্ডার করুন / Proceed to Order
                </Button>
              </>
            )}
          </div>
        )}

        {currentStep === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <h3 className="font-semibold">Customer Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="নাম / Name *"
                value={orderForm.customerName}
                onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
              <Input
                placeholder="ফোন নম্বর / Phone *"
                value={orderForm.customerPhone}
                onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
              />
            </div>

            <Textarea
              placeholder="সম্পূর্ণ ঠিকানা / Complete Address *"
              value={orderForm.customerAddress}
              onChange={(e) => setOrderForm(prev => ({ ...prev, customerAddress: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Location</label>
              <Select 
                value={deliveryZone} 
                onValueChange={(value) => {
                  setDeliveryZone(value as "inside" | "outside");
                  setOrderForm(prev => ({ ...prev, deliveryLocation: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inside">ঢাকার ভিতরে - ৳70</SelectItem>
                  <SelectItem value="outside">ঢাকার বাইরে - ৳120</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "bkash", label: "বিকাশ", icon: "💳" },
                  { value: "nagad", label: "নগদ", icon: "💳" },
                  { value: "rocket", label: "রকেট", icon: "💳" }
                ].map((method) => (
                  <Button
                    key={method.value}
                    type="button"
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    onClick={() => {
                      setPaymentMethod(method.value);
                      setOrderForm(prev => ({ ...prev, paymentMethod: method.value }));
                    }}
                    className="flex flex-col items-center p-4"
                  >
                    <span className="text-2xl mb-1">{method.icon}</span>
                    <span className="text-sm">{method.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="কোন বিশেষ নির্দেশনা... Any special requests"
              value={orderForm.specialInstructions}
              onChange={(e) => setOrderForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
            />

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep("cart")}
                className="flex-1"
              >
                Back to Cart
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessingOrder}
                className="flex-1"
              >
                {isProcessingOrder ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </form>
        )}

        {currentStep === "confirmation" && (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-6xl">✓</div>
            <h3 className="text-xl font-bold">অর্ডার সফল হয়েছে!</h3>
            <p className="text-gray-600">
              আপনার অর্ডার গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
            </p>
            <Button onClick={handleClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
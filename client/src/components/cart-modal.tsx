import { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCartStore, deliveryZones, paymentMethods } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { OrderFormData } from "@/types";

export default function CartModal() {
  const {
    items,
    isOpen,
    deliveryZone,
    paymentMethod,
    promoCode,
    promoDiscount,
    toggleCart,
    updateQuantity,
    removeItem,
    clearCart,
    setDeliveryZone,
    setPaymentMethod,
    setPromoCode,
    getSubtotal,
    getDeliveryFee,
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
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setOrderForm(prev => ({
      ...prev,
      deliveryLocation: deliveryZone,
      paymentMethod: paymentMethod
    }));
  }, [deliveryZone, paymentMethod]);

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;

    try {
      const response = await apiRequest("GET", `/api/promo-codes/${promoCodeInput}`);
      const promoData = await response.json();
      
      if (promoData && promoData.isActive) {
        const subtotal = getSubtotal();
        if (subtotal >= promoData.minOrder) {
          setPromoCode(promoCodeInput, promoData.discount);
          toast({
            title: "প্রোমো কোড প্রয়োগ হয়েছে!",
            description: `${promoData.discount}% ছাড় পেয়েছেন!`,
          });
        } else {
          toast({
            title: "ত্রুটি",
            description: `ন্যূনতম অর্ডার ৳${promoData.minOrder} হতে হবে`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "অবৈধ প্রোমো কোড",
        description: "এই প্রোমো কোডটি বৈধ নয় বা মেয়াদ শেষ হয়ে গেছে",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppOrder = () => {
    const orderDetails = items.map(item => 
      `${item.namebn} - ৳${item.price} x ${item.quantity}`
    ).join('\n');
    
    const message = `নতুন অর্ডার:
${orderDetails}

নাম: ${orderForm.customerName}
ফোন: ${orderForm.customerPhone}
ঠিকানা: ${orderForm.customerAddress}
ডেলিভারি: ${deliveryZones.find(z => z.id === deliveryZone)?.namebn}
পেমেন্ট: ${paymentMethods.find(p => p.id === paymentMethod)?.namebn}

সাবটোটাল: ৳${getSubtotal()}
ডেলিভারি ফি: ৳${getDeliveryFee()}
মোট: ৳${getTotal()}

${orderForm.specialInstructions ? `বিশেষ নির্দেশনা: ${orderForm.specialInstructions}` : ''}`;

    const whatsappUrl = `https://wa.me/8801747292277?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProcessOrder = async () => {
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.customerAddress) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingOrder(true);
    
    try {
      const orderData = {
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        items: items,
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        total: getTotal(),
        paymentMethod: paymentMethod,
        deliveryLocation: deliveryZone,
        specialInstructions: orderForm.specialInstructions || null
      };

      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();

      toast({
        title: "অর্ডার সফল! ✅",
        description: `আপনার অর্ডার ID: ${order.orderId}`,
      });

      // Clear cart and close modal
      clearCart();
      toggleCart();
      
      // Reset form
      setOrderForm({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        deliveryLocation: deliveryZone,
        paymentMethod: paymentMethod,
        specialInstructions: ""
      });

    } catch (error) {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const formatPrice = (price: number) => `৳${price}`;

  return (
    <Dialog open={isOpen} onOpenChange={toggleCart}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>🛒 Shopping Cart</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 max-h-64 overflow-y-auto custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Your cart is empty</p>
                <p className="text-sm font-bengali">আপনার কার্ট খালি</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border-b border-gray-100 cart-item-enter">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600 font-bengali">{item.namebn}</p>
                      <p className="text-red-600 font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <>
              {/* Promo Code */}
              <div className="py-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <Input
                    placeholder="প্রোমো কোড লিখুন... Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline"
                    onClick={handleApplyPromoCode}
                    disabled={!promoCodeInput.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {promoCode && (
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      {promoCode} - {promoDiscount}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="py-4 border-t border-gray-100 space-y-4">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="নাম / Name"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                  <Input
                    placeholder="ফোন নম্বর / Phone"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                </div>
                <Textarea
                  placeholder="ঠিকানা / Address"
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                  className="h-16 resize-none"
                />
              </div>

              {/* Delivery Options */}
              <div className="py-4 border-t border-gray-100">
                <h3 className="font-semibold mb-3">Delivery Location</h3>
                <Select value={deliveryZone} onValueChange={setDeliveryZone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.namebn} - ৳{zone.fee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Methods */}
              <div className="py-4 border-t border-gray-100">
                <h3 className="font-semibold mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      className="p-3 h-auto flex flex-col items-center space-y-1"
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        💳
                      </div>
                      <span className="text-xs">{method.namebn}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="py-4 border-t border-gray-100">
                <Textarea
                  placeholder="কোন বিশেষ নির্দেশনা... Any special requests"
                  value={orderForm.specialInstructions}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  className="h-16 resize-none"
                />
              </div>

              {/* Cart Footer */}
              <div className="pt-4 border-t bg-gray-50 -m-6 mt-4 p-6 rounded-b-lg">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>{formatPrice(getDeliveryFee())}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({promoDiscount}%):</span>
                      <span>-{formatPrice((getSubtotal() * promoDiscount) / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-red-600">{formatPrice(getTotal())}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleWhatsAppOrder}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold whatsapp-pulse"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                    </svg>
                    WhatsApp Order
                  </Button>
                  <Button
                    onClick={handleProcessOrder}
                    disabled={isProcessingOrder}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    {isProcessingOrder ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

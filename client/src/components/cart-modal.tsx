
import { useState } from "react";
import { X, Plus, Minus, ShoppingCart, Truck, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useCartStore } from "../lib/cart-store";
import { useMutation } from "@tanstack/react-query";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Districts and their delivery fees
const deliveryLocations = [
  { name: "Dhaka", fee: 60, feeText: "৬০ টাকা" },
  { name: "Chittagong", fee: 120, feeText: "১২০ টাকা" },
  { name: "Rajshahi", fee: 100, feeText: "১০০ টাকা" },
  { name: "Khulna", fee: 100, feeText: "১০০ টাকা" },
  { name: "Barisal", fee: 120, feeText: "১২০ টাকা" },
  { name: "Sylhet", fee: 120, feeText: "১২০ টাকা" },
  { name: "Rangpur", fee: 120, feeText: "১২০ টাকা" },
  { name: "Mymensingh", fee: 100, feeText: "১০০ টাকা" }
];

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getItemCount } = useCartStore();
  
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  const selectedLocation = deliveryLocations.find(loc => loc.name === deliveryLocation);
  const deliveryFee = selectedLocation ? selectedLocation.fee * 100 : 6000; // Convert to paisa
  const subtotal = getTotalPrice();
  const discountAmount = Math.round((subtotal * promoDiscount) / 100);
  const totalAmount = subtotal + deliveryFee;
  const finalAmount = totalAmount - discountAmount;

  // Check promo code
  const checkPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsCheckingPromo(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/promo-codes/${promoCode}`);
      if (response.ok) {
        const promoData = await response.json();
        setPromoDiscount(promoData.discountPercentage);
      } else {
        setPromoDiscount(0);
        alert("Invalid or expired promo code");
      }
    } catch (error) {
      console.error("Error checking promo code:", error);
      setPromoDiscount(0);
      alert("Error checking promo code");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  // Create order mutation
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
      alert(`অর্ডার সফলভাবে তৈরি হয়েছে! অর্ডার ID: ${data.orderId}`);
      clearCart();
      onClose();
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setDeliveryLocation("");
      setSpecialInstructions("");
      setPromoCode("");
      setPromoDiscount(0);
    },
    onError: (error) => {
      console.error("Order creation error:", error);
      alert("অর্ডার তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  });

  const handlePlaceOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim() || !deliveryLocation) {
      alert("সব প্রয়োজনীয় তথ্য পূরণ করুন");
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
      promoCode: promoCode.trim() || undefined,
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
      discountAmount,
      totalAmount,
      finalAmount
    };

    createOrderMutation.mutate(orderData);
  };

  const formatPrice = (price: number) => {
    return `৳${(price / 100).toFixed(0)}`;
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              শপিং কার্ট
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">আপনার কার্ট খালি</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            শপিং কার্ট ({getItemCount()} টি পণ্য)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
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
          </div>

          {/* Customer Information Form */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">গ্রাহকের তথ্য</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">নাম *</Label>
                <Input 
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">ফোন *</Label>
                <Input 
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
              <Input 
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
              <Textarea 
                id="address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="বাড়ি/রাস্তা, এলাকা, থানা, জেলা"
                required
              />
            </div>

            <div>
              <Label htmlFor="delivery">ডেলিভারি জেলা *</Label>
              <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryLocations.map((location) => (
                    <SelectItem key={location.name} value={location.name}>
                      <div className="flex justify-between items-center w-full">
                        <span>{location.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({location.feeText})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment">পেমেন্ট পদ্ধতি</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_on_delivery">ক্যাশ অন ডেলিভারি</SelectItem>
                  <SelectItem value="bkash">বিকাশ</SelectItem>
                  <SelectItem value="nagad">নগদ</SelectItem>
                  <SelectItem value="upay">উপায়</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="instructions">বিশেষ নির্দেশনা (ঐচ্ছিক)</Label>
              <Textarea 
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="কোন বিশেষ প্রয়োজন থাকলে লিখুন"
              />
            </div>

            {/* Promo Code */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="promo">প্রমো কোড (ঐচ্ছিক)</Label>
                <Input 
                  id="promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="প্রমো কোড লিখুন"
                />
              </div>
              <Button 
                type="button" 
                variant="outline"
                onClick={checkPromoCode}
                disabled={isCheckingPromo || !promoCode.trim()}
                className="mt-6"
              >
                <Tag className="h-4 w-4 mr-2" />
                {isCheckingPromo ? "চেক করা হচ্ছে..." : "প্রয়োগ করুন"}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              অর্ডার সামারি
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>সাবটোটাল:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ডিসকাউন্ট ({promoDiscount}%):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>সর্বমোট:</span>
                <span>{formatPrice(finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <Button 
            onClick={handlePlaceOrder}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? "অর্ডার করা হচ্ছে..." : `অর্ডার করুন - ${formatPrice(finalAmount)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

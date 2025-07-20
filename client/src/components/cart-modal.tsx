import { getApiUrl } from "@/lib/config";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  thana: string;
  paymentMethod: string;
  specialInstructions: string;
}

// Bangladesh Districts and their major thanas
const bangladeshLocations = {
  "dhaka": {
    name: "ঢাকা",
    thanas: [
      "দোহার", "সাভার", "ধামরাই", "নবাবগঞ্জ", "কেরানীগঞ্জ", "রমনা", "তেজগাঁও", "মতিঝিল", "গুলশান", 
      "ধানমন্ডি", "উত্তরা", "মিরপুর", "পল্লবী", "শাহআলী", "তুরাগ", "দক্ষিণখান", "উত্তরখান"
    ],
    fee: 70
  },
  "chittagong": {
    name: "চট্টগ্রাম",
    thanas: [
      "চট্টগ্রাম সদর", "হাটহাজারী", "রাউজান", "ফটিকছড়ি", "সীতাকুণ্ড", "মীরসরাই", "সন্দ্বীপ", 
      "বাঁশখালী", "বোয়ালখালী", "আনোয়ারা", "চন্দনাইশ", "লোহাগাড়া", "পতেঙ্গা", "পাহাড়তলী"
    ],
    fee: 120
  },
  "sylhet": {
    name: "সিলেট",
    thanas: [
      "সিলেট সদর", "বিয়ানীবাজার", "বালাগঞ্জ", "বিশ্বনাথ", "কোম্পানীগঞ্জ", "ফেঞ্চুগঞ্জ", 
      "গোলাপগঞ্জ", "গোয়াইনঘাট", "জৈন্তাপুর", "কানাইঘাট", "ওসমানীনগর", "জকিগঞ্জ"
    ],
    fee: 120
  },
  "rajshahi": {
    name: "রাজশাহী",
    thanas: [
      "রাজশাহী সদর", "বাগমারা", "চারঘাট", "দুর্গাপুর", "গোদাগাড়ী", "মোহনপুর", "পুঠিয়া", 
      "তানোর", "বাগাতিপাড়া", "পাবা"
    ],
    fee: 120
  },
  "khulna": {
    name: "খুলনা",
    thanas: [
      "খুলনা সদর", "বটিয়াঘাটা", "দাকোপ", "ডুমুরিয়া", "ফকিরহাট", "কয়রা", "পাইকগাছা", 
      "ফুলতলা", "রূপসা", "তেরখাদা"
    ],
    fee: 120
  },
  "rangpur": {
    name: "রংপুর",
    thanas: [
      "রংপুর সদর", "বদরগঞ্জ", "গঙ্গাচড়া", "কাউনিয়া", "মিঠাপুকুর", "পীরগঞ্জ", "পীরগাছা", 
      "তারাগঞ্জ"
    ],
    fee: 150
  },
  "barisal": {
    name: "বরিশাল",
    thanas: [
      "বরিশাল সদর", "আগৈলঝাড়া", "বাবুগঞ্জ", "বাকেরগঞ্জ", "বানারীপাড়া", "গৌরনদী", 
      "হিজলা", "মেহেন্দিগঞ্জ", "মুলাদী", "উজিরপুর"
    ],
    fee: 150
  },
  "mymensingh": {
    name: "ময়মনসিংহ",
    thanas: [
      "ময়মনসিংহ সদর", "ভালুকা", "ফুলবাড়িয়া", "গফরগাঁও", "গৌরীপুর", "হালুয়াঘাট", 
      "ঈশ্বরগঞ্জ", "মুক্তাগাছা", "নান্দাইল", "ফুলপুর", "ত্রিশাল", "তারাকান্দা"
    ],
    fee: 120
  }
};

export default function CartModal() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    paymentMethod,
    setPaymentMethod,
    getTotal
  } = useCartStore();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(70);

  const [orderForm, setOrderForm] = useState<OrderFormData>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    district: "",
    thana: "",
    paymentMethod: paymentMethod,
    specialInstructions: ""
  });

  const [currentStep, setCurrentStep] = useState<"cart" | "form" | "confirmation">("cart");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const { toast } = useToast();

  // Update delivery fee when district changes
  useEffect(() => {
    if (selectedDistrict && bangladeshLocations[selectedDistrict]) {
      setDeliveryFee(bangladeshLocations[selectedDistrict].fee);
    }
  }, [selectedDistrict]);

  const subtotal = getTotal();
  const advancePayment = 100;
  const remainingAmount = subtotal + deliveryFee - advancePayment;
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
      const response = await fetch(getApiUrl("/api/promo-codes/validate"), {
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
    if (!orderForm.customerName.trim() || !orderForm.customerPhone.trim() || 
        !orderForm.customerAddress.trim() || !selectedDistrict || !selectedThana) {
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
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerAddress: `${orderForm.customerAddress}, ${selectedThana}, ${bangladeshLocations[selectedDistrict].name}`,
        district: selectedDistrict,
        thana: selectedThana,
        deliveryLocation: `${selectedThana}, ${bangladeshLocations[selectedDistrict].name}`,
        paymentMethod: orderForm.paymentMethod,
        specialInstructions: orderForm.specialInstructions,
        subtotal: subtotal * 100, // Convert to paisa
        deliveryFee: deliveryFee * 100,
        total: total * 100
      };

      const response = await fetch(getApiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setConfirmedOrderId(result.orderId);
        setCurrentStep("confirmation");
        clearCart();
        toast({
          title: "অর্ডার সফল হয়েছে!",
          description: `আপনার অর্ডার আইডি: ${result.orderId}`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Order submission failed");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "অর্ডার করতে সমস্যা",
        description: error.message || "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleClose = () => {
    closeCart();
    setCurrentStep("cart");
    setSelectedDistrict("");
    setSelectedThana("");
    setDeliveryFee(70);
    setOrderForm({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      district: "",
      thana: "",
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
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">🛒 Shopping Cart</span>
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
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee:</span>
                    <span>Based on location selection</span>
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
              placeholder="বিস্তারিত ঠিকানা / Detailed Address *"
              value={orderForm.customerAddress}
              onChange={(e) => setOrderForm(prev => ({ ...prev, customerAddress: e.target.value }))}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">জেলা / District *</label>
                <Select 
                  value={selectedDistrict} 
                  onValueChange={(value) => {
                    setSelectedDistrict(value);
                    setSelectedThana(""); // Reset thana when district changes
                    setOrderForm(prev => ({ ...prev, district: value, thana: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(bangladeshLocations).map(([key, location]) => (
                      <SelectItem key={key} value={key}>
                        {location.name} - ৳{location.fee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">থানা / Thana *</label>
                <Select 
                  value={selectedThana} 
                  onValueChange={(value) => {
                    setSelectedThana(value);
                    setOrderForm(prev => ({ ...prev, thana: value }));
                  }}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="থানা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDistrict && bangladeshLocations[selectedDistrict]?.thanas.map((thana) => (
                      <SelectItem key={thana} value={thana}>
                        {thana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { 
                    value: "bkash", 
                    label: "বিকাশ",
                    color: "bg-pink-600 hover:bg-pink-700" 
                  },
                  { 
                    value: "nagad", 
                    label: "নগদ",
                    color: "bg-red-600 hover:bg-red-700" 
                  },
                  { 
                    value: "upay", 
                    label: "উপায়",
                    color: "bg-blue-600 hover:bg-blue-700" 
                  }
                ].map((method) => (
                  <Button
                    key={method.value}
                    type="button"
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    onClick={() => {
                      setPaymentMethod(method.value);
                      setOrderForm(prev => ({ ...prev, paymentMethod: method.value }));
                    }}
                    className={`flex flex-col items-center p-4 h-16 ${
                      paymentMethod === method.value ? method.color : ''
                    }`}
                  >
                    <span className="text-sm font-medium">{method.label}</span>
                  </Button>
                ))}
              </div>

              {/* Payment Instructions */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm space-y-2">
                  <p className="font-medium text-blue-800">💰 Payment Instructions:</p>
                  <p className="text-blue-700">• Send ৳{advancePayment} advance to: <span className="font-bold">01747292277</span></p>
                  <p className="text-blue-700">• This secures your order booking</p>
                  <p className="text-blue-700">• 100% refundable if any issues occur</p>
                  <p className="text-blue-700">• Remaining ৳{remainingAmount} on delivery</p>
                </div>
              </div>
            </div>

            <Textarea
              placeholder="কোন বিশেষ নির্দেশনা... Any special requests"
              value={orderForm.specialInstructions}
              onChange={(e) => setOrderForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
            />

            {/* Order Summary */}
            {selectedDistrict && (
              <div className="p-3 bg-gray-50 border rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery ({bangladeshLocations[selectedDistrict]?.name}):</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>৳{total}</span>
                  </div>
                </div>
              </div>
            )}

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
            <h3 className="text-xl font-bold text-green-600">অর্ডার সফল হয়েছে!</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <p className="font-medium text-green-800">
                আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
              </p>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Order ID:</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{confirmedOrderId}</span></p>
                <p><span className="font-medium">Advance Payment:</span> ৳{advancePayment} to 01747292277</p>
                <p><span className="font-medium">Remaining:</span> ৳{remainingAmount} (Cash on Delivery)</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>📱 We'll contact you within 1 hour to confirm</p>
              <p>🚚 Delivery within 1-3 working days</p>
              <p>💸 100% refundable advance payment</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => window.open('/track-order', '_blank')} 
                variant="outline" 
                className="w-full"
              >
                Track Your Order
              </Button>
              <Button onClick={handleClose} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
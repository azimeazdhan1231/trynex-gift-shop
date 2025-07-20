import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const { toast } = useToast();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order", searchOrderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${searchOrderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: !!searchOrderId,
    retry: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast({
        title: "অর্ডার ID প্রয়োজন",
        description: "দয়া করে একটি বৈধ অর্ডার ID দিন",
        variant: "destructive"
      });
      return;
    }
    setSearchOrderId(orderId.trim());
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `h-6 w-6 ${isActive ? "text-green-600" : "text-gray-400"}`;
    
    switch (status) {
      case "pending":
        return <Clock className={iconClass} />;
      case "processing":
        return <Package className={iconClass} />;
      case "shipped":
        return <Truck className={iconClass} />;
      case "delivered":
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return { en: "Order Confirmed", bn: "অর্ডার নিশ্চিত" };
      case "processing":
        return { en: "Processing", bn: "প্রক্রিয়াকরণ" };
      case "shipped":
        return { en: "Shipped", bn: "পাঠানো হয়েছে" };
      case "delivered":
        return { en: "Delivered", bn: "ডেলিভার করা হয়েছে" };
      default:
        return { en: "Unknown", bn: "অজানা" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatPrice = (price: number) => `৳${price}`;
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const orderStatuses = ["pending", "processing", "shipped", "delivered"];
  const currentStatusIndex = order ? orderStatuses.indexOf(order.status) : -1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Track Your Order</h1>
        <p className="text-lg font-bengali text-gray-600">আপনার অর্ডারের অবস্থা জানুন</p>
      </div>

      {/* Search Form */}
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-center">Enter Order ID</CardTitle>
          <CardDescription className="text-center font-bengali">
            অর্ডার ID লিখুন (যেমন: TXR-20250118-001)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="TXR-20250118-001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="text-center py-6">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Order Not Found</h3>
            <p className="text-gray-600 font-bengali">
              এই অর্ডার ID টি খুঁজে পাওয়া যায়নি। দয়া করে সঠিক ID দিয়ে আবার চেষ্টা করুন।
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {order && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">Order #{order.orderId}</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.createdAt!)}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-white px-4 py-2`}>
                  {getStatusText(order.status).en} / {getStatusText(order.status).bn}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Order Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
              <CardDescription className="font-bengali">অর্ডারের অগ্রগতি</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orderStatuses.map((status, index) => {
                  const isActive = index <= currentStatusIndex;
                  const statusInfo = getStatusText(status);
                  
                  return (
                    <div key={status} className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        {getStatusIcon(status, isActive)}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isActive ? "text-green-600" : "text-gray-500"}`}>
                          {statusInfo.en}
                        </h3>
                        <p className={`text-sm font-bengali ${isActive ? "text-green-600" : "text-gray-500"}`}>
                          {statusInfo.bn}
                        </p>
                        {isActive && index === currentStatusIndex && (
                          <p className="text-xs text-gray-500 mt-1">
                            Updated: {formatDate(order.updatedAt!)}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-600">Customer Name</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.customerPhone}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{order.customerAddress}</p>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <Badge variant="outline" className="capitalize">
                    {order.paymentMethod}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Location:</span>
                  <span className="capitalize">{order.deliveryLocation}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-red-600">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription className="font-bengali">অর্ডারকৃত পণ্যসমূহ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=100&q=80"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600 font-bengali">{item.namebn}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-500">per item</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
                <CardDescription className="font-bengali">বিশেষ নির্দেশনা</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.specialInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Support */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-blue-600 mb-4 font-bengali">
                  কোন সমস্যা হলে আমাদের সাথে যোগাযোগ করুন
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => window.open("https://wa.me/8801940689487", "_blank")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                    </svg>
                    WhatsApp Support
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call: 01940689487
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sample Order IDs (for demo) */}
      {!order && !error && !isLoading && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Sample Order IDs</CardTitle>
            <CardDescription className="text-center font-bengali">
              টেস্ট করার জন্য এই অর্ডার ID গুলো ব্যবহার করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-center">
              <Button
                variant="outline"
                onClick={() => setOrderId("TXR-20250118-001")}
                className="w-full"
              >
                TXR-20250118-001
              </Button>
              <Button
                variant="outline"
                onClick={() => setOrderId("TXR-20250118-002")}
                className="w-full"
              >
                TXR-20250118-002
              </Button>
              <Button
                variant="outline"
                onClick={() => setOrderId("TXR-20250118-003")}
                className="w-full"
              >
                TXR-20250118-003
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

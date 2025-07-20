import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getApiUrl } from "@/lib/config";
import type { Order } from "@/types";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order", searchOrderId],
    queryFn: async () => {
      if (!searchOrderId) return null;
      const response = await fetch(getApiUrl(`/api/orders/${searchOrderId}`));
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: !!searchOrderId
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSearchOrderId(orderId.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID to track your package</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Order ID</CardTitle>
            <CardDescription>Enter the order ID you received after placing your order</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="TXR-1234567890-ABC123"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!orderId.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p>Searching for your order...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                <p className="font-medium">Order not found</p>
                <p className="text-sm mt-2">Please check your order ID and try again</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  Order Status: {order.status.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-medium">{order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium text-red-600">৳{order.total}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600 mb-2">Delivery Information</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  <p className="text-sm">{order.customerAddress}</p>
                </div>

                {order.specialInstructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Special Instructions</p>
                      <p className="text-sm">{order.specialInstructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>📞 Call us: 01747292277</p>
                  <p>📧 Email: support@trynex.com</p>
                  <p>🕒 Support Hours: 9 AM - 9 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
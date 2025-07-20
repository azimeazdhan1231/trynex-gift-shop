import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Package, ShoppingCart, Tag, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import type { Product, Order, PromoCode, InsertProduct, InsertPromoCode } from "@shared/schema";

interface ProductFormData extends Omit<InsertProduct, 'variants'> {
  variants: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    namebn: "",
    description: "",
    descriptionbn: "",
    price: 0,
    category: "",
    categorybn: "",
    imageUrl: "",
    stock: 100,
    isActive: true,
    isFeatured: false,
    tags: [],
    variants: ""
  });
  const [promoForm, setPromoForm] = useState<InsertPromoCode>({
    code: "",
    discount: 0,
    minOrder: 0,
    isActive: true,
    expiresAt: null
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/products'));
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/orders'));
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  const { data: promoCodes, isLoading: promoCodesLoading, refetch: refetchPromoCodes } = useQuery<PromoCode[]>({
    queryKey: ["promo-codes"],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/promo-codes'));
      if (!response.ok) throw new Error('Failed to fetch promo codes');
      return response.json();
    }
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast({ title: "Product created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductDialogOpen(false);
      resetProductForm();
      setEditingProduct(null);
      toast({ title: "Product updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  });

  const createPromoMutation = useMutation({
    mutationFn: async (data: InsertPromoCode) => {
      const response = await apiRequest("POST", "/api/promo-codes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsPromoDialogOpen(false);
      resetPromoForm();
      toast({ title: "Promo code created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create promo code", variant: "destructive" });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order status updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    }
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      namebn: "",
      description: "",
      descriptionbn: "",
      price: 0,
      category: "",
      categorybn: "",
      imageUrl: "",
      stock: 100,
      isActive: true,
      isFeatured: false,
      tags: [],
      variants: ""
    });
  };

  const resetPromoForm = () => {
    setPromoForm({
      code: "",
      discount: 0,
      minOrder: 0,
      isActive: true,
      expiresAt: null
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: InsertProduct = {
      ...productForm,
      price: productForm.price * 100, // Convert to paisa
      tags: productForm.tags,
      variants: productForm.variants ? JSON.parse(productForm.variants) : null
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      price: product.price / 100, // Convert from paisa
      variants: product.variants ? JSON.stringify(product.variants) : ""
    });
    setIsProductDialogOpen(true);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const promoData: InsertPromoCode = {
      ...promoForm,
      minOrder: promoForm.minOrder * 100 // Convert to paisa
    };

    createPromoMutation.mutate(promoData);
  };

  const formatPrice = (price: number) => `৳${price / 100}`;
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();

  // Dashboard stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const pendingOrders = orders?.filter(order => order.status === "pending").length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your e-commerce store</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Products</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="promos" className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Promo Codes</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Active products in store
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingOrders} pending orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <span className="h-4 w-4 text-muted-foreground">৳</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From all orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promo Codes</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promoCodes?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active promotions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt!)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Products Management</h2>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700" onClick={resetProductForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name (English)</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="namebn">Product Name (Bengali)</Label>
                      <Input
                        id="namebn"
                        value={productForm.namebn}
                        onChange={(e) => setProductForm({...productForm, namebn: e.target.value})}
                        required
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (English)</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="descriptionbn">Description (Bengali)</Label>
                    <Textarea
                      id="descriptionbn"
                      value={productForm.descriptionbn}
                      onChange={(e) => setProductForm({...productForm, descriptionbn: e.target.value})}
                      required
                      className="font-bengali"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (BDT)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category (English)</Label>
                      <Input
                        id="category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="categorybn">Category (Bengali)</Label>
                      <Input
                        id="categorybn"
                        value={productForm.categorybn}
                        onChange={(e) => setProductForm({...productForm, categorybn: e.target.value})}
                        required
                        className="font-bengali"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="variants">Variants (JSON format)</Label>
                    <Textarea
                      id="variants"
                      value={productForm.variants}
                      onChange={(e) => setProductForm({...productForm, variants: e.target.value})}
                      placeholder='{"sizes": ["S", "M", "L"], "colors": ["red", "blue"]}'
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={productForm.isActive}
                        onCheckedChange={(checked) => setProductForm({...productForm, isActive: checked})}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={productForm.isFeatured}
                        onCheckedChange={(checked) => setProductForm({...productForm, isFeatured: checked})}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      {editingProduct ? "Update" : "Create"} Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 font-bengali">{product.namebn}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.categorybn}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {product.isActive && <Badge variant="default">Active</Badge>}
                          {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Orders Management</h2>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <div>{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerAddress}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.customerPhone}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateOrderStatusMutation.mutate({ orderId: order.orderId, status })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt!)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Promo Codes Management</h2>
            <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700" onClick={resetPromoForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Promo Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePromoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Promo Code</Label>
                    <Input
                      id="code"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                      placeholder="SAVE20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={promoForm.discount}
                        onChange={(e) => setPromoForm({...promoForm, discount: Number(e.target.value)})}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minOrder">Minimum Order (BDT)</Label>
                      <Input
                        id="minOrder"
                        type="number"
                        value={promoForm.minOrder}
                        onChange={(e) => setPromoForm({...promoForm, minOrder: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      onChange={(e) => setPromoForm({...promoForm, expiresAt: e.target.value ? new Date(e.target.value) : null})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={promoForm.isActive}
                      onCheckedChange={(checked) => setPromoForm({...promoForm, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPromoDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      Create Promo Code
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes?.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">{promo.code}</TableCell>
                      <TableCell>{promo.discount}%</TableCell>
                      <TableCell>{formatPrice(promo.minOrder)}</TableCell>
                      <TableCell>
                        <Badge variant={promo.isActive ? "default" : "secondary"}>
                          {promo.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {promo.expiresAt ? formatDate(promo.expiresAt) : "Never"}
                      </TableCell>
                      <TableCell>{formatDate(promo.createdAt!)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Customer Management</h2>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Customer Management</h3>
                <p className="text-gray-500">Customer data will be available once orders are processed.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
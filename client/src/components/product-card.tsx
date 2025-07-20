import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  namebn?: string;
  description?: string;
  descriptionbn?: string;
  price: number;
  category: string;
  categorybn?: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  variants?: any;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<any>({});
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      namebn: product.namebn,
      price: product.price,
      quantity,
      variant: selectedVariant,
      imageUrl: product.imageUrl
    };

    addToCart(cartItem);

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "default",
    });
  };

  const formatPrice = (price: number) => {
    return `৳${(price / 100).toFixed(0)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-red-600">
            Featured
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button size="sm" variant="outline" className="p-2 bg-white/90">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="p-2 bg-white/90">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">
          {product.name}
        </h3>
        {product.namebn && (
          <p className="text-sm text-gray-500 mb-2">{product.namebn}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-500 ml-1">4.5</span>
          </div>
        </div>

        {/* Variants */}
        {product.variants && Object.keys(product.variants).length > 0 && (
          <div className="mb-3">
            {Object.entries(product.variants).map(([key, values]) => (
              <div key={key} className="mb-2">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key}:
                </label>
                <select
                  className="ml-2 text-sm border rounded px-2 py-1"
                  onChange={(e) => setSelectedVariant({
                    ...selectedVariant,
                    [key]: e.target.value
                  })}
                >
                  <option value="">Select {key}</option>
                  {Array.isArray(values) && values.map((value: string) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Quantity & Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2"
            >
              -
            </Button>
            <span className="px-3 py-1 text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2"
            >
              +
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>

        {/* Stock Info */}
        <p className="text-xs text-gray-500 mt-2">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  );
}
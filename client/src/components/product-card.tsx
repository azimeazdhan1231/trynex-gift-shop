import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      namebn: product.namebn,
      price: product.price,
      imageUrl: product.imageUrl
    });

    toast({
      title: "পণ্য যোগ করা হয়েছে!",
      description: `${product.namebn} কার্টে যোগ করা হয়েছে`,
      duration: 2000
    });
  };

  const formatPrice = (price: number) => {
    return `৳${price}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border product-card ${className}`}>
      <div className="relative">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-xl">
          {!imageLoaded && (
            <div className="w-full h-48 bg-gray-200 animate-pulse skeleton"></div>
          )}
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className={`w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2">
            {product.isFeatured && (
              <Badge className="bg-orange-500 text-white text-xs font-bold">
                🆕 Featured
              </Badge>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col space-y-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 rounded-full bg-white shadow-md hover:bg-pink-50"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} 
              />
            </Button>
          </div>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-t-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-gray-800 font-medium transform scale-95 group-hover:scale-100 transition-transform"
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-xl">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-1 font-bengali">
            {product.namebn}
          </p>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600">(4.{Math.floor(Math.random() * 9) + 1})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            
            {/* Category Badge */}
            <Badge variant="outline" className="text-xs">
              {product.categorybn}
            </Badge>
          </div>

          {/* Variants */}
          {product.variants && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs text-gray-600">Options:</span>
              <div className="flex space-x-1">
                {Object.entries(product.variants as any).slice(0, 3).map(([key, value], index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {value as string}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}

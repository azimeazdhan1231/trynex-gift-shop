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
    <div className={`bg-white rounded-2xl shadow-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] group border-0 overflow-hidden backdrop-blur-sm bg-white/95 ${className}`}>
      <div className="relative">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-64 md:h-72 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
          )}
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className={`w-full h-64 md:h-72 object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10">
            {product.isFeatured && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg animate-pulse">
                ⭐ Featured
              </Badge>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 p-0 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-pink-50 hover:scale-110 transition-all duration-300"
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

        {/* Product Info - Enhanced Professional Design */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-base text-gray-600 font-bengali mt-2 opacity-80">
                {product.namebn}
              </p>
            </div>
            <div className="text-right ml-4">
              <div className="flex items-center space-x-1 text-sm text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">4.8</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">(127 reviews)</p>
            </div>
          </div>

          {/* Price - Enhanced with Better Typography */}
          <div className="flex items-end justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-red-600 tracking-tight">
                {formatPrice(product.price)}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-500 line-through opacity-75">
                  {formatPrice(product.price + 200)}
                </span>
                <span className="text-sm text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                  -12%
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-green-700 font-bold bg-green-200 px-3 py-2 rounded-full animate-pulse">
                Save ৳200
              </span>
            </div>
          </div>

          {/* Category & Features */}
          <div className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-2 rounded-full text-sm font-semibold">
              {product.category}
            </span>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                In Stock
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed bg-gray-50 p-3 rounded-xl">
              {product.description}
            </p>
          )}

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🚚 Fast Delivery</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">💝 Gift Wrap</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✅ Premium Quality</span>
          </div>

          {/* Add to Cart Button - Ultra Professional */}
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-red-600 via-red-700 to-orange-600 hover:from-red-700 hover:via-red-800 hover:to-orange-700 text-white font-bold py-4 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 shadow-2xl hover:shadow-3xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 mr-3 group-hover:animate-bounce" />
              <span className="text-lg">{product.stock === 0 ? 'স্টক নেই' : 'কার্টে যোগ করুন'}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

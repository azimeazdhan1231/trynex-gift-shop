import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";

interface HeaderProps {
  onCartClick?: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount } = useCartStore();

  const navigation = [
    { name: "Home", href: "/", namebn: "হোম" },
    { name: "Products", href: "/products", namebn: "পণ্য" },
    { name: "Track Order", href: "/track-order", namebn: "অর্ডার ট্র্যাক" },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                +8801700000000
              </span>
              <span>Free delivery on orders over ৳1000</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Follow us on social media</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600">TryNex</span>
                <span className="text-lg text-gray-600 ml-1">Gift Shop</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Navigation & Cart */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  location === item.href ? "text-red-600" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}

            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-red-600 ${
                    location === item.href ? "text-red-600" : "text-gray-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <Link href="/cart">
                <Button variant="outline" size="sm" className="relative w-full mt-4">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({getItemCount()})
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
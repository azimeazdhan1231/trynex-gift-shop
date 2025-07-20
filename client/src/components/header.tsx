import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { getItemCount, toggleCart } = useCartStore();

  const navigation = [
    { name: "হোম", nameEn: "Home", href: "/" },
    { name: "পণ্যসমূহ", nameEn: "Products", href: "/products" },
    { name: "অর্ডার ট্র্যাক", nameEn: "Track Order", href: "/track-order" },
    { name: "যোগাযোগ", nameEn: "Contact", href: "#contact" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
        <div className="animate-pulse">
          🎉 মেগা অফার! ১৫০০৳+ অর্ডারে ফ্রি ডেলিভারি! | আজই অর্ডার করুন! 📞 01940689487
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-2xl sticky top-0 z-50 border-b-2 border-red-600">
        <div className="container mx-auto px-4">
          {/* Top Header */}
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-600 to-orange-500 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  TryneX <span className="text-red-600">Lifestyle</span>
                </h1>
                <p className="text-xs text-gray-600 font-bengali">বাংলাদেশের #১ লাইফস্টাইল ব্র্যান্ড</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন... Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 rounded-full focus:border-red-600"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1 bg-red-600 hover:bg-red-700 rounded-full"
                >
                  খুঁজুন
                </Button>
              </form>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* WhatsApp */}
              <a 
                href="https://wa.me/8801940689487" 
                className="hidden md:flex items-center text-green-600 hover:text-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              
              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {getItemCount()}
                  </span>
                )}
              </Button>

              {/* Call Button */}
              <a 
                href="tel:01940689487"
                className="hidden md:flex items-center text-red-600 hover:text-red-700 transition-colors"
              >
                <Phone className="h-4 w-4 mr-1" />
                <span className="text-sm">Call</span>
              </a>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-gray-700 hover:text-red-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center justify-between py-2 border-t border-gray-100">
            <div className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-gray-700 hover:text-red-600 font-medium transition-colors border-b-2 border-transparent hover:border-red-600 pb-1 ${
                    location === item.href ? 'text-red-600 border-red-600' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">🏆 BANGLADESH'S #1 LIFESTYLE BRAND</span>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2">
              <form onSubmit={handleSearch} className="mb-4">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full focus:border-red-600"
                />
              </form>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <a
                  href="https://wa.me/8801940689487"
                  className="block py-2 text-green-600 hover:text-green-700 font-medium"
                >
                  WhatsApp
                </a>
                <a
                  href="tel:01940689487"
                  className="block py-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Call Now
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

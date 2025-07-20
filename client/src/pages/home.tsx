import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart, Search, ArrowRight, Gift, Truck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { getApiUrl } from "@/lib/config";
import CategoryGrid from "@/components/category-grid";
import HeroSlider from "@/components/hero-slider";
import ProductCard from "@/components/product-card";
import type { Product } from "@shared/schema";
import type { Category } from "@/types";

export default function Home() {
  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading, error: featuredError } = useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const url = getApiUrl('/api/products?featured=true');
      if (import.meta.env.DEV) {
        console.log('🎯 Fetching featured products from:', url);
      }
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to fetch featured products:', response.status, response.statusText);
        }
        throw new Error('Failed to fetch featured products');
      }
      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('✅ Featured products fetched successfully:', data?.length, 'products');
      }
      return data;
    },
    enabled: typeof window !== 'undefined',
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: latestProducts, isLoading: latestLoading, error: latestError } = useQuery<Product[]>({
    queryKey: ["products", "latest"],
    queryFn: async () => {
      const url = getApiUrl('/api/products?limit=8');
      if (import.meta.env.DEV) {
        console.log('🎯 Fetching latest products from:', url);
      }
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to fetch latest products:', response.status, response.statusText);
        }
        throw new Error('Failed to fetch latest products');
      }
      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('✅ Latest products fetched successfully:', data?.length, 'products');
      }
      return data;
    },
    enabled: typeof window !== 'undefined',
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Fetch all products for categories
  const { data: allProducts, isLoading: allProductsLoading, error: allProductsError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const url = getApiUrl('/api/products');
      if (import.meta.env.DEV) {
        console.log('🎯 Fetching all products from:', url);
      }
      const response = await fetch(url);
      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to fetch all products:', response.status, response.statusText);
        }
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('✅ All products fetched successfully:', data?.length, 'products');
      }
      return data;
    },
    enabled: typeof window !== 'undefined' // Only run in browser, not during SSR
  });

  // Flash Sale Timer - Set to 24 hours from now
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    // Set flash sale end time to 24 hours from now
    const saleEndTime = new Date();
    saleEndTime.setHours(saleEndTime.getHours() + 24);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const saleEnd = saleEndTime.getTime();
      const distance = saleEnd - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        // Reset timer when it reaches zero
        const newSaleEnd = new Date();
        newSaleEnd.setHours(newSaleEnd.getHours() + 24);
        saleEndTime.setTime(newSaleEnd.getTime());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Flash Sale Banner - Ultra Modern */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-pink-600 text-white py-8 md:py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-orange-500/90 to-pink-600/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-3xl md:text-4xl font-bold mb-2 animate-bounce">⚡ Flash Sale - 30% OFF</h3>
              <p className="font-bengali text-lg md:text-xl opacity-90">সীমিত সময়ের অফার! তাড়াতাড়ি করুন!</p>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 bg-white/20 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold animate-pulse">{timeLeft.hours}</div>
                <div className="text-xs md:text-sm opacity-80">HOURS</div>
              </div>
              <div className="text-2xl md:text-3xl animate-pulse">:</div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold animate-pulse">{timeLeft.minutes}</div>
                <div className="text-xs md:text-sm opacity-80">MINS</div>
              </div>
              <div className="text-2xl md:text-3xl animate-pulse">:</div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold animate-pulse">{timeLeft.seconds}</div>
                <div className="text-xs md:text-sm opacity-80">SECS</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 md:px-6 py-2 md:py-3 text-sm md:text-base hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                💝 ফ্রি গিফট র‍্যাপিং
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 md:px-6 py-2 md:py-3 text-sm md:text-base hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                🚚 ২৪ ঘন্টায় ডেলিভারি
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Arrivals - Professional Design */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent text-lg font-semibold tracking-wide uppercase">New Collection</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Latest Arrivals
            </h2>
            <p className="text-lg font-bengali text-gray-600">
              ✨ নতুন এবং ট্রেন্ডিং প্রোডাক্ট ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {latestLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-6 rounded w-20"></div>
                </div>
              ))
            ) : latestError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-500">Failed to load latest products. Please try again later.</p>
              </div>
            ) : latestProducts && latestProducts.length > 0 ? (
              latestProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No products available at the moment.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-3 rounded-full font-bold btn-hover"
            >
              View All New Products
            </Button>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg font-bengali text-gray-600">
              🛍️ আপনার পছন্দের ক্যাটেগরি বেছে নিন 🛍️
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-lg font-bengali text-gray-600">
              ✨ আমাদের বিশেষ নির্বাচিত প্রোডাক্ট ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-6 rounded w-20"></div>
                </div>
              ))
            ) : featuredError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-500">Failed to load featured products. Please try again later.</p>
              </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No featured products available at the moment.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-3 rounded-full font-bold btn-hover"
            >
              Load More Products
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-3">
              <div className="text-3xl text-green-500">🛡️</div>
              <h3 className="font-bold">Secure Payment</h3>
              <p className="text-sm text-gray-300">SSL Encrypted</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl text-green-500">🚚</div>
              <h3 className="font-bold">Fast Delivery</h3>
              <p className="text-sm text-gray-300">24 Hours</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl text-green-500">↩️</div>
              <h3 className="font-bold">Easy Return</h3>
              <p className="text-sm text-gray-300">7 Days Policy</p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl text-green-500">🎧</div>
              <h3 className="font-bold">24/7 Support</h3>
              <p className="text-sm text-gray-300">Always Here</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                About TryneX Lifestyle
              </h2>
              <p className="text-gray-600 mb-6">
                We are passionate about bringing you premium lifestyle products that enhance your daily experiences. From beautifully crafted mugs to comfortable apparel, our curated collection represents quality, style, and functionality.
              </p>
              <p className="text-gray-600 mb-6">
                Based in Bangladesh, we understand the local market needs and source products that resonate with modern lifestyle preferences while maintaining affordability and quality.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-green-500 text-2xl mb-2">🚚</div>
                  <h4 className="font-bold text-sm">Fast Delivery</h4>
                  <p className="text-xs text-gray-600">Quick delivery across Bangladesh</p>
                </div>
                <div className="text-center">
                  <div className="text-blue-500 text-2xl mb-2">✅</div>
                  <h4 className="font-bold text-sm">Quality Guarantee</h4>
                  <p className="text-xs text-gray-600">Premium quality products</p>
                </div>
                <div className="text-center">
                  <div className="text-purple-500 text-2xl mb-2">🎧</div>
                  <h4 className="font-bold text-sm">24/7 Support</h4>
                  <p className="text-xs text-gray-600">Customer support via WhatsApp</p>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="About us"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Get in Touch</h2>
            <p className="text-lg font-bengali text-gray-600">আমাদের সাথে যোগাযোগ করুন</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-green-500 text-3xl mb-4">📱</div>
              <h4 className="font-bold mb-2">WhatsApp</h4>
              <p className="text-gray-600">+880 1940 689487</p>
              <Button className="mt-4 bg-green-500 hover:bg-green-600">
                Message Now
              </Button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-blue-500 text-3xl mb-4">✉️</div>
              <h4 className="font-bold mb-2">Email</h4>
              <p className="text-gray-600">info@trynexlifestyle.com</p>
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                Send Email
              </Button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-red-500 text-3xl mb-4">📍</div>
              <h4 className="font-bold mb-2">Location</h4>
              <p className="text-gray-600">Dhaka, Bangladesh</p>
              <Button className="mt-4 bg-red-500 hover:bg-red-600">
                View Location
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
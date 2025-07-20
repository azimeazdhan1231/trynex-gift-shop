import { useQuery } from "@tanstack/react-query";
import HeroSlider from "@/components/hero-slider";
import ProductCard from "@/components/product-card";
import CategoryGrid from "@/components/category-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/config";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: featuredProducts } = useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/products?featured=true'));
      if (!response.ok) throw new Error('Failed to fetch featured products');
      return response.json();
    }
  });

  const { data: latestProducts } = useQuery<Product[]>({
    queryKey: ["products", "latest"],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/products?limit=8'));
      if (!response.ok) throw new Error('Failed to fetch latest products');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Flash Sale Banner */}
      <section className="flash-sale text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold">⚡ Flash Sale - 30% OFF</h3>
              <p className="font-bengali">সীমিত সময়ের অফার! তাড়াতাড়ি করুন!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs">HOURS</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-2xl font-bold">34</div>
                <div className="text-xs">MINS</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-2xl font-bold">56</div>
                <div className="text-xs">SECS</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-white text-orange-500 px-4 py-2">
                💝 ফ্রি গিফট র‍্যাপিং
              </Badge>
              <Badge className="bg-white text-orange-500 px-4 py-2">
                🚚 ২৪ ঘন্টায় ডেলিভারি
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              🌟 Latest Arrivals 🌟
            </h2>
            <p className="text-lg font-bengali text-gray-600">
              ✨ নতুন এবং ট্রেন্ডিং প্রোডাক্ট ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {latestProducts?.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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

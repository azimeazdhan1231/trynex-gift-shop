import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  image: string;
  backgroundColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Premium Lifestyle Products",
    titleBn: "প্রিমিয়াম লাইফস্টাইল প্রোডাক্ট",
    subtitle: "Perfect Gifts for Your Loved Ones",
    subtitleBn: "আপনার প্রিয়জনের জন্য নিখুঁত উপহার",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    backgroundColor: "from-purple-600 via-pink-500 to-red-500"
  },
  {
    id: 2,
    title: "Birthday Special Collection",
    titleBn: "জন্মদিনের বিশেষ সংগ্রহ",
    subtitle: "Make Every Birthday Memorable",
    subtitleBn: "প্রতিটি জন্মদিনকে করুন স্মরণীয়",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&h=600",
    backgroundColor: "from-orange-400 via-red-500 to-pink-500"
  },
  {
    id: 3,
    title: "Anniversary Gift Sets",
    titleBn: "বার্ষিকী উপহার সেট",
    subtitle: "Celebrate Love & Togetherness",
    subtitleBn: "ভালোবাসা ও একসাথের উৎসব",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&h=600",
    backgroundColor: "from-blue-600 via-purple-500 to-pink-500"
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="hero-slider relative h-[500px] md:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-r ${slide.backgroundColor} transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="container mx-auto px-4 h-full flex items-center relative z-10">
              <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                <div className="text-white space-y-6">
                  <h2 className="text-4xl md:text-6xl font-bold leading-tight animate-slide-up">
                    {slide.title}
                  </h2>
                  <p className="text-xl md:text-2xl font-bengali opacity-90 animate-slide-up">
                    {slide.subtitleBn}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm animate-fade-in">
                    <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur">
                      🌟 Exclusive Collection
                    </span>
                    <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur">
                      100% Original Products
                    </span>
                    <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur">
                      Fast Delivery
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      size="lg"
                      className="bg-white text-gray-800 hover:bg-gray-100 font-bold px-8 py-3 rounded-full btn-hover"
                    >
                      SHOP NOW
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="border-2 border-white text-white hover:bg-white hover:text-gray-800 font-bold px-8 py-3 rounded-full"
                    >
                      View Collection
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-auto rounded-2xl shadow-2xl animate-float"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full backdrop-blur z-20 transition-all"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full backdrop-blur z-20 transition-all"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Offer Banners */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-600 text-white p-4 rounded-lg text-center backdrop-blur bg-opacity-90">
            <div className="text-2xl font-bold">30% OFF</div>
            <div className="text-sm">🔥 Flash Sale</div>
            <div className="text-xs">Starting ৳390</div>
          </div>
          <div className="bg-green-600 text-white p-4 rounded-lg text-center backdrop-blur bg-opacity-90">
            <div className="text-lg font-bold">FREE DELIVERY</div>
            <div className="text-sm">On Orders Above ৳1500</div>
            <div className="text-xs">Save ৳120</div>
          </div>
          <div className="bg-purple-600 text-white p-4 rounded-lg text-center backdrop-blur bg-opacity-90">
            <div className="text-lg font-bold">CASH ON DELIVERY</div>
            <div className="text-sm">Pay When You Receive</div>
            <div className="text-xs">No Advance Payment</div>
          </div>
        </div>
      </div>
    </section>
  );
}

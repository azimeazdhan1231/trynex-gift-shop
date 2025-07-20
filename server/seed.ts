
import { storage } from "./storage";

const sampleProducts = [
  {
    name: "Classic Ceramic Mug",
    name_bn: "ক্লাসিক সিরামিক মগ",
    description: "Perfect for your morning coffee or tea",
    description_bn: "আপনার সকালের কফি বা চায়ের জন্য আদর্শ",
    price: 55000,
    category: "mugs",
    category_bn: "মগ",
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80",
    stock: 100,
    is_active: true,
    is_featured: true,
    tags: ["ceramic", "coffee", "tea"],
    variants: { colors: ["white", "black", "blue"], sizes: ["small", "medium", "large"] }
  },
  {
    name: "Premium Cotton T-Shirt",
    name_bn: "প্রিমিয়াম কটন টি-শার্ট",
    description: "Comfortable and stylish t-shirt for everyday wear",
    description_bn: "দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং স্টাইলিশ টি-শার্ট",
    price: 55000,
    category: "tshirts",
    category_bn: "টি-শার্ট",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
    stock: 150,
    is_active: true,
    is_featured: true,
    tags: ["cotton", "casual", "comfortable"],
    variants: { sizes: ["S", "M", "L", "XL"], colors: ["white", "black", "navy", "red"] }
  },
  {
    name: "Birthday Celebration Package",
    name_bn: "জন্মদিন উৎসব প্যাকেজ",
    description: "Complete birthday celebration set with decorations",
    description_bn: "সাজসজ্জা সহ সম্পূর্ণ জন্মদিন উৎসব সেট",
    price: 160000,
    category: "gift-packages",
    category_bn: "গিফট প্যাকেজ",
    image_url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80",
    stock: 50,
    is_active: true,
    is_featured: true,
    tags: ["birthday", "celebration", "package"],
    variants: { themes: ["colorful", "elegant", "kids"] }
  },
  {
    name: "Water Bottle",
    name_bn: "পানির বোতল",
    description: "Stainless steel water bottle",
    description_bn: "স্টেইনলেস স্টিল পানির বোতল",
    price: 80000,
    category: "bottles",
    category_bn: "বোতল",
    image_url: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80",
    stock: 200,
    is_active: true,
    is_featured: false,
    tags: ["water", "bottle", "steel"],
    variants: { sizes: ["500ml", "750ml", "1L"], colors: ["silver", "black", "blue"] }
  }
];

const samplePromoCodes = [
  {
    code: "WELCOME10",
    discount_percentage: 10,
    is_active: true,
    expires_at: new Date('2025-12-31')
  },
  {
    code: "SAVE20",
    discount_percentage: 20,
    is_active: true,
    expires_at: new Date('2025-06-30')
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if products already exist
    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      console.log("📦 Adding sample products...");
      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }
      console.log(`✅ Added ${sampleProducts.length} products`);
    } else {
      console.log(`📦 Found ${existingProducts.length} existing products, skipping product seeding`);
    }

    // Check if promo codes already exist
    const existingPromoCodes = await storage.getPromoCodes();
    if (existingPromoCodes.length === 0) {
      console.log("🎫 Adding sample promo codes...");
      for (const promoCode of samplePromoCodes) {
        await storage.createPromoCode(promoCode);
      }
      console.log(`✅ Added ${samplePromoCodes.length} promo codes`);
    } else {
      console.log(`🎫 Found ${existingPromoCodes.length} existing promo codes, skipping promo code seeding`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };


import { storage } from "./storage";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Sample products data
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
        variants: { colors: ["red", "blue", "green"], sizes: ["S", "M", "L", "XL"] }
      },
      {
        name: "Birthday Celebration Package",
        name_bn: "জন্মদিন উৎসব প্যাকেজ",
        description: "Complete birthday celebration set with decorations",
        description_bn: "সাজসজ্জা সহ সম্পূর্ণ জন্মদিন উৎসব সেট",
        price: 180000,
        category: "packages",
        category_bn: "প্যাকেজ",
        image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=80",
        stock: 25,
        is_active: true,
        is_featured: true,
        tags: ["birthday", "celebration", "package"],
        variants: { themes: ["elegant", "colorful", "premium"], sizes: ["small", "medium", "large"] }
      },
      {
        name: "Personalized Keychain",
        name_bn: "ব্যক্তিগতকৃত চাবির চেইন",
        description: "Custom keychain with your name or message",
        description_bn: "আপনার নাম বা বার্তা সহ কাস্টম কীচেইন",
        price: 30000,
        category: "keychains",
        category_bn: "চাবির চেইন",
        image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
        stock: 200,
        is_active: true,
        is_featured: false,
        tags: ["personalized", "custom", "gift"],
        variants: { materials: ["metal", "leather", "plastic"] }
      },
      {
        name: "Elegant Wall Clock",
        name_bn: "মার্জিত দেয়াল ঘড়ি",
        description: "Modern wall clock to enhance your home decor",
        description_bn: "আপনার ঘরের সাজসজ্জা বাড়ানোর জন্য আধুনিক দেয়াল ঘড়ি",
        price: 120000,
        category: "decor",
        category_bn: "সাজসজ্জা",
        image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=500&q=80",
        stock: 50,
        is_active: true,
        is_featured: true,
        tags: ["wall", "clock", "modern", "decor"],
        variants: { styles: ["minimalist", "vintage", "modern"], colors: ["black", "white", "wood"] }
      }
    ];

    // Insert products using storage methods
    console.log("📦 Adding products...");
    for (const product of sampleProducts) {
      try {
        await storage.addProduct(product);
        console.log(`✅ Added product: ${product.name}`);
      } catch (error) {
        console.error(`❌ Error adding product ${product.name}:`, error);
      }
    }

    // Add promo codes using storage methods
    const promoCodes = [
      { code: "WELCOME10", discount_percentage: 10, is_active: true },
      { code: "FIRST20", discount_percentage: 20, is_active: true },
      { code: "SAVE15", discount_percentage: 15, is_active: true },
      { code: "NEWUSER25", discount_percentage: 25, is_active: true },
      { code: "SPECIAL30", discount_percentage: 30, is_active: true }
    ];

    console.log("🎟️ Adding promo codes...");
    for (const promo of promoCodes) {
      try {
        const result = await storage.addPromoCode(promo);
        if (result) {
          console.log(`✅ Added promo code: ${promo.code}`);
        }
      } catch (error) {
        // Check if it's a duplicate key error
        if (error.code === '23505') {
          console.log(`⚠️ Promo code ${promo.code} already exists, skipping`);
        } else {
          console.error(`❌ Error adding promo code ${promo.code}:`, error);
        }
      }
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

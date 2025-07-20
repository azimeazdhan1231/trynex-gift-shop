import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, adminUsers } from "../shared/schema";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

if (!connectionString) {
  throw new Error("DATABASE_URL (Supabase connection string) is required");
}

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(client);

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await db.delete(products);
    await db.delete(adminUsers);

    // Insert sample products
    const sampleProducts = [
      {
        name: "Classic Ceramic Mug",
        namebn: "ক্লাসিক সিরামিক মগ",
        description: "Perfect for your morning coffee or tea",
        descriptionbn: "আপনার সকালের কফি বা চায়ের জন্য আদর্শ",
        price: 55000, // 550 BDT in paisa
        category: "mugs",
        categorybn: "মগ",
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80",
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ["ceramic", "coffee", "tea"],
        variants: { colors: ["white", "black", "blue"], sizes: ["small", "medium", "large"] }
      },
      {
        name: "Premium Cotton T-Shirt",
        namebn: "প্রিমিয়াম কটন টি-শার্ট",
        description: "Comfortable and stylish t-shirt for everyday wear",
        descriptionbn: "দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং স্টাইলিশ টি-শার্ট",
        price: 55000, // 550 BDT
        category: "tshirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        stock: 150,
        isActive: true,
        isFeatured: true,
        tags: ["cotton", "casual", "comfortable"],
        variants: { sizes: ["S", "M", "L", "XL"], colors: ["white", "black", "navy", "red"] }
      },
      {
        name: "Birthday Celebration Package",
        namebn: "জন্মদিন উৎসব প্যাকেজ",
        description: "Complete birthday celebration set with decorations",
        descriptionbn: "সাজসজ্জা সহ সম্পূর্ণ জন্মদিন উৎসব সেট",
        price: 160000, // 1600 BDT
        category: "gift-packages",
        categorybn: "গিফট প্যাকেজ",
        imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80",
        stock: 50,
        isActive: true,
        isFeatured: true,
        tags: ["birthday", "celebration", "package"],
        variants: { themes: ["colorful", "elegant", "kids"] }
      },
      {
        name: "Personalized Photo Frame",
        namebn: "ব্যক্তিগত ফটো ফ্রেম",
        description: "Custom photo frame with your favorite memories",
        descriptionbn: "আপনার প্রিয় স্মৃতি সহ কাস্টম ফটো ফ্রেম",
        price: 75000, // 750 BDT
        category: "gifts",
        categorybn: "উপহার",
        imageUrl: "https://images.unsplash.com/photo-1582142306909-195724d33d0b?auto=format&fit=crop&w=500&q=80",
        stock: 80,
        isActive: true,
        isFeatured: false,
        tags: ["photo", "frame", "personalized"],
        variants: { sizes: ["4x6", "5x7", "8x10"], materials: ["wood", "metal", "plastic"] }
      },
      {
        name: "Premium Water Bottle",
        namebn: "প্রিমিয়াম পানির বোতল",
        description: "Stainless steel water bottle with custom design",
        descriptionbn: "কাস্টম ডিজাইন সহ স্টেইনলেস স্টিল পানির বোতল",
        price: 95000, // 950 BDT
        category: "bottles",
        categorybn: "পানির বোতল",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80",
        stock: 60,
        isActive: true,
        isFeatured: true,
        tags: ["water", "bottle", "stainless", "eco"],
        variants: { colors: ["silver", "black", "blue", "pink"], sizes: ["500ml", "750ml", "1L"] }
      },
      {
        name: "Custom Keychain Set",
        namebn: "কাস্টম চাবির চেইন সেট",
        description: "Personalized keychain set with names or initials",
        descriptionbn: "নাম বা আদ্যক্ষর সহ ব্যক্তিগতকৃত চাবির চেইন সেট",
        price: 35000, // 350 BDT
        category: "keychains",
        categorybn: "চাবির চেইন",
        imageUrl: "https://images.unsplash.com/photo-1556306535-38febf6782e7?auto=format&fit=crop&w=500&q=80",
        stock: 200,
        isActive: true,
        isFeatured: false,
        tags: ["keychain", "personalized", "custom"],
        variants: { materials: ["metal", "leather", "acrylic"], shapes: ["round", "square", "heart"] }
      }
    ];

    await db.insert(products).values(sampleProducts);

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({
      username: "admin",
      password: hashedPassword,
      email: "admin@trynex.com"
    });

    console.log("✅ Database seeded successfully!");
    console.log("🔑 Admin credentials: username: admin, password: admin123");
    console.log(`📦 Inserted ${sampleProducts.length} sample products`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
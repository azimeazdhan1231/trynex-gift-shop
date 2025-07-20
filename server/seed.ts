
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, adminUsers } from "../shared/schema";
import bcrypt from "bcryptjs";

const connectionString = "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

if (!connectionString) {
  throw new Error("DATABASE_URL (Supabase connection string) is required");
}

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(client);

const sampleProducts = [
  {
    name: "Classic Ceramic Mug",
    namebn: "ক্লাসিক সিরামিক মগ",
    description: "Perfect for your morning coffee or tea. Made from high-quality ceramic with a comfortable handle.",
    descriptionbn: "আপনার সকালের কফি বা চায়ের জন্য আদর্শ। উচ্চ মানের সিরামিক দিয়ে তৈরি।",
    price: 55000, // 550 BDT in paisa
    category: "mugs",
    categorybn: "মগ",
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80",
    stock: 100,
    isActive: true,
    isFeatured: true,
    tags: ["ceramic", "coffee", "tea", "kitchen"],
    variants: { 
      colors: ["white", "black", "blue", "red"], 
      sizes: ["small", "medium", "large"] 
    }
  },
  {
    name: "Premium Cotton T-Shirt",
    namebn: "প্রিমিয়াম কটন টি-শার্ট",
    description: "Comfortable and stylish t-shirt made from 100% premium cotton. Perfect for everyday wear.",
    descriptionbn: "১০০% প্রিমিয়াম কটন দিয়ে তৈরি আরামদায়ক এবং স্টাইলিশ টি-শার্ট।",
    price: 75000, // 750 BDT
    category: "tshirts",
    categorybn: "টি-শার্ট",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
    stock: 150,
    isActive: true,
    isFeatured: true,
    tags: ["cotton", "casual", "comfortable", "fashion"],
    variants: { 
      sizes: ["S", "M", "L", "XL", "XXL"], 
      colors: ["white", "black", "navy", "red", "green"] 
    }
  },
  {
    name: "Birthday Celebration Package",
    namebn: "জন্মদিন উৎসব প্যাকেজ",
    description: "Complete birthday celebration set with balloons, decorations, and party supplies.",
    descriptionbn: "বেলুন, সাজসজ্জা এবং পার্টি সরবরাহ সহ সম্পূর্ণ জন্মদিন উৎসব সেট।",
    price: 160000, // 1600 BDT
    category: "gift-packages",
    categorybn: "গিফট প্যাকেজ",
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80",
    stock: 50,
    isActive: true,
    isFeatured: true,
    tags: ["birthday", "celebration", "package", "party"],
    variants: { 
      themes: ["colorful", "elegant", "kids", "adult"],
      sizes: ["small", "medium", "large"]
    }
  },
  {
    name: "Designer Coffee Cup Set",
    namebn: "ডিজাইনার কফি কাপ সেট",
    description: "Elegant set of 4 designer coffee cups with matching saucers.",
    descriptionbn: "ম্যাচিং সেঁসার সহ ৪টি ডিজাইনার কফি কাপের মার্জিত সেট।",
    price: 120000, // 1200 BDT
    category: "mugs",
    categorybn: "মগ",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
    stock: 75,
    isActive: true,
    isFeatured: false,
    tags: ["coffee", "designer", "set", "elegant"],
    variants: { 
      patterns: ["floral", "geometric", "minimalist"],
      colors: ["white", "cream", "blue"]
    }
  },
  {
    name: "Casual Polo Shirt",
    namebn: "ক্যাজুয়াল পোলো শার্ট",
    description: "Classic polo shirt perfect for casual outings and semi-formal occasions.",
    descriptionbn: "ক্যাজুয়াল এবং আধা-আনুষ্ঠানিক অনুষ্ঠানের জন্য আদর্শ ক্লাসিক পোলো শার্ট।",
    price: 95000, // 950 BDT
    category: "tshirts",
    categorybn: "টি-শার্ট",
    imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=500&q=80",
    stock: 120,
    isActive: true,
    isFeatured: false,
    tags: ["polo", "casual", "semi-formal", "cotton"],
    variants: { 
      sizes: ["S", "M", "L", "XL"], 
      colors: ["navy", "white", "black", "maroon", "olive"] 
    }
  }
];

async function seed() {
  try {
    console.log("🌱 Seeding database with products...");

    // Clear existing products (optional)
    // await db.delete(products);

    // Insert products
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({
      username: "admin",
      password: hashedPassword,
      email: "admin@trynex.com",
      name: "Admin User"
    }).onConflictDoNothing();

    console.log("✅ Database seeded successfully!");
    console.log(`📦 Added ${sampleProducts.length} products`);
    console.log("🔑 Admin credentials: username: admin, password: admin123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seed();

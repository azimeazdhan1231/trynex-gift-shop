
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
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await db.delete(products);
    await db.delete(adminUsers);

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({
      username: "admin",
      password: hashedPassword,
      email: "admin@trynex.com"
    });

    // Insert comprehensive product data
    console.log("📦 Inserting products...");
    const sampleProducts = [
      {
        name: "Classic White Ceramic Mug",
        namebn: "ক্লাসিক সাদা সিরামিক মগ",
        description: "Perfect ceramic mug for your morning coffee or tea",
        descriptionbn: "আপনার সকালের কফি বা চায়ের জন্য নিখুঁত সিরামিক মগ",
        price: 55000, // 550 BDT in paisa
        category: "mugs",
        categorybn: "মগ",
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80",
        stock: 50,
        isActive: true,
        isFeatured: true,
        tags: ["ceramic", "coffee", "tea", "classic"],
        variants: { colors: ["white", "black", "blue"], sizes: ["300ml", "400ml"] }
      },
      {
        name: "Premium Cotton T-Shirt",
        namebn: "প্রিমিয়াম কটন টি-শার্ট",
        description: "Comfortable 100% cotton t-shirt perfect for everyday wear",
        descriptionbn: "দৈনন্দিন পরিধানের জন্য আরামদায়ক ১০০% কটন টি-শার্ট",
        price: 35000, // 350 BDT
        category: "tshirts",
        categorybn: "টি-শার্ট",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ["cotton", "casual", "comfortable", "unisex"],
        variants: { sizes: ["S", "M", "L", "XL"], colors: ["white", "black", "navy", "red"] }
      },
      {
        name: "Personalized Keychain",
        namebn: "ব্যক্তিগতকৃত চাবির চেইন",
        description: "Custom engraved keychain with your name or message",
        descriptionbn: "আপনার নাম বা বার্তা সহ কাস্টম খোদাইকৃত চাবির চেইন",
        price: 30000, // 300 BDT
        category: "keychains",
        categorybn: "চাবির চেইন",
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=500&q=80",
        stock: 200,
        isActive: true,
        isFeatured: false,
        tags: ["personalized", "custom", "metal", "gift"],
        variants: { materials: ["metal", "leather", "wood"], colors: ["silver", "gold", "black"] }
      },
      {
        name: "Stainless Steel Water Bottle",
        namebn: "স্টেইনলেস স্টিল পানির বোতল",
        description: "Insulated water bottle keeps drinks hot or cold for hours",
        descriptionbn: "ইনসুলেটেড পানির বোতল ঘন্টার পর ঘন্টা পানীয় গরম বা ঠান্ডা রাখে",
        price: 80000, // 800 BDT
        category: "bottles",
        categorybn: "পানির বোতল",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80",
        stock: 75,
        isActive: true,
        isFeatured: true,
        tags: ["stainless", "insulated", "eco-friendly", "sports"],
        variants: { sizes: ["500ml", "750ml", "1000ml"], colors: ["silver", "black", "blue", "pink"] }
      },
      {
        name: "Gift Box for Him",
        namebn: "তার জন্য গিফট বক্স",
        description: "Curated gift box with premium items for men",
        descriptionbn: "পুরুষদের জন্য প্রিমিয়াম আইটেম সহ সংগৃহীত গিফট বক্স",
        price: 120000, // 1200 BDT
        category: "gift-him",
        categorybn: "তার জন্য গিফট",
        imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80",
        stock: 30,
        isActive: true,
        isFeatured: true,
        tags: ["gift", "men", "premium", "box"],
        variants: { themes: ["classic", "modern", "sporty"] }
      },
      {
        name: "Gift Box for Her",
        namebn: "তার জন্য গিফট বক্স",
        description: "Beautiful gift box with elegant items for women",
        descriptionbn: "মহিলাদের জন্য মার্জিত আইটেম সহ সুন্দর গিফট বক্স",
        price: 150000, // 1500 BDT
        category: "gift-her",
        categorybn: "তার জন্য গিফট",
        imageUrl: "https://images.unsplash.com/photo-1511612679463-6c8b24ff6a1f?auto=format&fit=crop&w=500&q=80",
        stock: 25,
        isActive: true,
        isFeatured: true,
        tags: ["gift", "women", "elegant", "beautiful"],
        variants: { themes: ["elegant", "romantic", "trendy"] }
      },
      {
        name: "Parents Special Gift Set",
        namebn: "মা-বাবার বিশেষ গিফট সেট",
        description: "Thoughtful gift set perfect for parents",
        descriptionbn: "মা-বাবার জন্য নিখুঁত চিন্তাশীল গিফট সেট",
        price: 100000, // 1000 BDT
        category: "gift-parents",
        categorybn: "মা-বাবার জন্য",
        imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=80",
        stock: 40,
        isActive: true,
        isFeatured: false,
        tags: ["parents", "family", "thoughtful", "love"],
        variants: { occasions: ["anniversary", "birthday", "general"] }
      },
      {
        name: "Baby Gift Bundle",
        namebn: "শিশুর গিফট বান্ডেল",
        description: "Adorable gift bundle for babies and toddlers",
        descriptionbn: "শিশু এবং ছোট বাচ্চাদের জন্য মনোরম গিফট বান্ডেল",
        price: 70000, // 700 BDT
        category: "gift-babies",
        categorybn: "শিশুদের জন্য",
        imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80",
        stock: 60,
        isActive: true,
        isFeatured: false,
        tags: ["baby", "soft", "safe", "cute"],
        variants: { ages: ["0-6 months", "6-12 months", "1-2 years"] }
      },
      {
        name: "Couple's Anniversary Set",
        namebn: "দম্পতির বার্ষিকী সেট",
        description: "Romantic gift set perfect for couples",
        descriptionbn: "দম্পতিদের জন্য নিখুঁত রোমান্টিক গিফট সেট",
        price: 110000, // 1100 BDT
        category: "couple",
        categorybn: "কাপলের জন্য",
        imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80",
        stock: 35,
        isActive: true,
        isFeatured: true,
        tags: ["couple", "romantic", "love", "anniversary"],
        variants: { occasions: ["anniversary", "valentine", "engagement"] }
      },
      {
        name: "Premium Luxury Hamper",
        namebn: "প্রিমিয়াম লাক্সারি হ্যাম্পার",
        description: "Exclusive luxury hamper with premium gifts",
        descriptionbn: "প্রিমিয়াম গিফট সহ এক্সক্লুসিভ লাক্সারি হ্যাম্পার",
        price: 250000, // 2500 BDT
        category: "hampers",
        categorybn: "প্রিমিয়াম হ্যাম্পার",
        imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=500&q=80",
        stock: 15,
        isActive: true,
        isFeatured: true,
        tags: ["luxury", "premium", "exclusive", "hamper"],
        variants: { sizes: ["medium", "large", "extra-large"] }
      },
      {
        name: "Chocolate & Flower Combo",
        namebn: "চকলেট ও ফুলের কম্বো",
        description: "Beautiful combination of fresh flowers and premium chocolates",
        descriptionbn: "তাজা ফুল এবং প্রিমিয়াম চকলেটের সুন্দর সমন্বয়",
        price: 130000, // 1300 BDT
        category: "chocolates-flowers",
        categorybn: "চকলেট ও ফুল",
        imageUrl: "https://images.unsplash.com/photo-1518057111178-9a47d0a990e7?auto=format&fit=crop&w=500&q=80",
        stock: 20,
        isActive: true,
        isFeatured: true,
        tags: ["chocolate", "flowers", "romantic", "sweet"],
        variants: { flower_types: ["roses", "mixed", "tulips"], chocolate_types: ["dark", "milk", "white"] }
      },
      // Additional products to make the catalog richer
      {
        name: "Designer Photo Frame",
        namebn: "ডিজাইনার ছবির ফ্রেম",
        description: "Elegant photo frame for your precious memories",
        descriptionbn: "আপনার মূল্যবান স্মৃতির জন্য মার্জিত ছবির ফ্রেম",
        price: 45000, // 450 BDT
        category: "gift-parents",
        categorybn: "মা-বাবার জন্য",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=500&q=80",
        stock: 80,
        isActive: true,
        isFeatured: false,
        tags: ["photo", "frame", "memory", "elegant"],
        variants: { sizes: ["5x7", "8x10", "11x14"], materials: ["wood", "metal", "acrylic"] }
      },
      {
        name: "Customized Notebook Set",
        namebn: "কাস্টমাইজড নোটবুক সেট",
        description: "Personalized notebook set for office or personal use",
        descriptionbn: "অফিস বা ব্যক্তিগত ব্যবহারের জন্য ব্যক্তিগতকৃত নোটবুক সেট",
        price: 65000, // 650 BDT
        category: "gift-him",
        categorybn: "তার জন্য গিফট",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80",
        stock: 90,
        isActive: true,
        isFeatured: false,
        tags: ["notebook", "custom", "professional", "writing"],
        variants: { covers: ["leather", "hardcover", "spiral"], colors: ["black", "brown", "blue"] }
      },
      {
        name: "Aromatic Candle Set",
        namebn: "সুগন্ধি মোমবাতি সেট",
        description: "Set of aromatic candles for relaxation and ambiance",
        descriptionbn: "শিথিলতা এবং পরিবেশের জন্য সুগন্ধি মোমবাতির সেট",
        price: 85000, // 850 BDT
        category: "gift-her",
        categorybn: "তার জন্য গিফট",
        imageUrl: "https://images.unsplash.com/photo-1583225214464-9670147d2d50?auto=format&fit=crop&w=500&q=80",
        stock: 45,
        isActive: true,
        isFeatured: false,
        tags: ["candle", "aromatic", "relaxation", "ambiance"],
        variants: { scents: ["vanilla", "lavender", "rose", "jasmine"], sizes: ["small", "medium", "large"] }
      },
      {
        name: "Sports Water Bottle",
        namebn: "স্পোর্টস পানির বোতল",
        description: "Ergonomic sports bottle with leak-proof design",
        descriptionbn: "লিক-প্রুফ ডিজাইন সহ এরগোনমিক স্পোর্টস বোতল",
        price: 60000, // 600 BDT
        category: "bottles",
        categorybn: "পানির বোতল",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80",
        stock: 120,
        isActive: true,
        isFeatured: false,
        tags: ["sports", "ergonomic", "leak-proof", "fitness"],
        variants: { capacities: ["600ml", "800ml", "1000ml"], colors: ["blue", "red", "green", "black"] }
      }
    ];

    await db.insert(products).values(sampleProducts);

    console.log("✅ Database seeded successfully!");
    console.log(`📦 Inserted ${sampleProducts.length} products`);
    console.log("🔑 Admin credentials: username: admin, password: admin123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

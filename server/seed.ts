
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

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  try {
    await db.insert(adminUsers).values({
      username: "admin",
      password: hashedPassword
    }).onConflictDoNothing();
  } catch (error) {
    console.log("Admin user already exists or error:", error);
  }

  // Sample products
  const sampleProducts = [
    {
      name: "Classic Coffee Mug",
      namebn: "ক্লাসিক কফি মগ",
      description: "Premium ceramic coffee mug perfect for your morning coffee",
      descriptionbn: "আপনার সকালের কফির জন্য নিখুঁত প্রিমিয়াম সিরামিক কফি মগ",
      price: 55000, // 550 BDT in paisa
      category: "mugs",
      categorybn: "মগ",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93d?w=500",
      stock: 100,
      isFeatured: true,
      tags: ["coffee", "ceramic", "daily-use"]
    },
    {
      name: "Cotton T-Shirt",
      namebn: "কটন টি-শার্ট",
      description: "Comfortable 100% cotton t-shirt for everyday wear",
      descriptionbn: "দৈনন্দিন পরিধানের জন্য আরামদায়ক ১০০% কটন টি-শার্ট",
      price: 45000, // 450 BDT in paisa
      category: "t-shirts",
      categorybn: "টি-শার্ট",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      stock: 50,
      isFeatured: true,
      tags: ["cotton", "comfortable", "casual"]
    },
    {
      name: "Designer Mug",
      namebn: "ডিজাইনার মগ",
      description: "Beautiful designer mug with unique patterns",
      descriptionbn: "অনন্য নকশা সহ সুন্দর ডিজাইনার মগ",
      price: 75000, // 750 BDT in paisa
      category: "mugs",
      categorybn: "মগ",
      imageUrl: "https://images.unsplash.com/photo-1572119005087-715842c33ddb?w=500",
      stock: 30,
      isFeatured: false,
      tags: ["designer", "unique", "gift"]
    },
    {
      name: "Premium Polo Shirt",
      namebn: "প্রিমিয়াম পোলো শার্ট",
      description: "High-quality polo shirt for formal and casual occasions",
      descriptionbn: "আনুষ্ঠানিক এবং নৈমিত্তিক অনুষ্ঠানের জন্য উচ্চ মানের পোলো শার্ট",
      price: 85000, // 850 BDT in paisa
      category: "t-shirts",
      categorybn: "টি-শার্ট",
      imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
      stock: 25,
      isFeatured: false,
      tags: ["premium", "polo", "formal"]
    }
  ];

  for (const product of sampleProducts) {
    try {
      await db.insert(products).values(product).onConflictDoNothing();
    } catch (error) {
      console.log("Product insert error:", error);
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("🔑 Admin credentials: username: admin, password: admin123");
  
  await client.end();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});

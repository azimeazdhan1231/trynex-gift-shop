import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

if (!DATABASE_URL) {
  throw new Error("VITE_DATABASE_URL is required");
}

// Create the connection
const client = postgres(DATABASE_URL);
export const db = drizzle(client);

// Supabase configuration
export const supabaseConfig = {
  url: "https://wifsqonbnfmwtqvupqbk.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnNxb25ibmZtd3RxdnVwcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODAyNjMsImV4cCI6MjA2NzE1NjI2M30.A7o3vhEaNZb9lmViHA_KQrwzKJTBWpsD6KbHqkkput0"
};

// Helper function to initialize sample data
export async function initializeSampleData() {
  // This would be called on first app load to populate sample products
  const sampleProducts = [
    {
      name: "Classic Ceramic Mug",
      namebn: "ক্লাসিক সিরামিক মগ",
      description: "Perfect for your morning coffee or tea",
      descriptionbn: "আপনার সকালের কফি বা চায়ের জন্য আদর্শ",
      price: 55000, // in paisa (550 BDT)
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
    }
  ];

  return sampleProducts;
}

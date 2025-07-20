import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, orders, promoCodes, adminUsers, type Product, type InsertProduct, type Order, type InsertOrder, type PromoCode, type InsertPromoCode, type AdminUser, type InsertAdminUser } from "@shared/schema";
import { eq, desc, like, and, or } from "drizzle-orm";

// Use the provided Supabase connection string
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

if (!connectionString) {
  throw new Error("DATABASE_URL (Supabase connection string) is required");
}

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client);

// Test database connection
client`SELECT 1`.then(() => {
  console.log("✅ Database connected successfully");
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
});

export const storage = {
  // Product methods
  async getProducts(category?: string, search?: string, featured?: boolean): Promise<Product[]> {
    try {
      let query = db.select().from(products).where(eq(products.isActive, true));

      if (category) {
        query = query.where(eq(products.category, category));
      }

      if (search) {
        query = query.where(
          or(
            like(products.name, `%${search}%`),
            like(products.namebn, `%${search}%`)
          )
        );
      }

      if (featured) {
        query = query.where(eq(products.isFeatured, true));
      }

      const result = await query.orderBy(desc(products.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  async getProduct(id: number): Promise<Product | null> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },

  async createProduct(data: InsertProduct): Promise<Product> {
    try {
      const result = await db.insert(products).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | null> {
    try {
      const result = await db.update(products).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(products.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating product:", error);
      return null;
    }
  },

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },

  // Order methods
  getOrders: async () => {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  },

  // Get single order by ID
  getOrder: async (id: string) => {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new Error("Failed to fetch order");
    }
  },

  // Get order by order ID (for tracking)
  getOrderByOrderId: async (orderId: string) => {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId));
      return order;
    } catch (error) {
      console.error("Error fetching order by order ID:", error);
      throw new Error("Failed to fetch order");
    }
  },

  // Create order
  createOrder: async (orderData: any) => {
    try {
      console.log("Creating order with data:", orderData);
      const [order] = await db.insert(orders).values(orderData).returning();
      console.log("Order created successfully:", order);
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order: " + error.message);
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    try {
      const result = await db.update(orders).set({
        status,
        updatedAt: new Date()
      }).where(eq(orders.orderId, orderId)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating order status:", error);
      return null;
    }
  },

  // Promo code methods
  async getPromoCodes(): Promise<PromoCode[]> {
    try {
      const result = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      return [];
    }
  },

  async getPromoCode(code: string): Promise<PromoCode | null> {
    try {
      const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching promo code:", error);
      return null;
    }
  },

  async createPromoCode(data: InsertPromoCode): Promise<PromoCode> {
    try {
      const result = await db.insert(promoCodes).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating promo code:", error);
      throw error;
    }
  },

  async updatePromoCode(id: number, data: Partial<InsertPromoCode>): Promise<PromoCode | null> {
    try {
      const result = await db.update(promoCodes).set(data).where(eq(promoCodes.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating promo code:", error);
      return null;
    }
  },

  async deletePromoCode(id: number): Promise<boolean> {
    try {
      const result = await db.delete(promoCodes).where(eq(promoCodes.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting promo code:", error);
      return false;
    }
  },

  // Admin user methods
  async getAdminUser(username: string): Promise<AdminUser | null> {
    try {
      const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching admin user:", error);
      return null;
    }
  },

  async createAdminUser(data: InsertAdminUser): Promise<AdminUser> {
    try {
      const result = await db.insert(adminUsers).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }
};

// Initialize sample data
async function initializeSampleData() {
  try {
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      console.log("🌱 Initializing sample products...");

      const sampleProducts = [
        {
          name: "Classic Coffee Mug",
          namebn: "ক্লাসিক কফি মগ",
          description: "Premium ceramic coffee mug perfect for your morning coffee",
          descriptionbn: "আপনার সকালের কফির জন্য নিখুঁত প্রিমিয়াম সিরামিক কফি মগ",
          price: 55000,
          category: "mugs",
          categorybn: "মগ",
          imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93d?w=500",
          stock: 100,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["coffee", "ceramic", "daily-use"])
        },
        {
          name: "Cotton T-Shirt",
          namebn: "কটন টি-শার্ট",
          description: "Comfortable 100% cotton t-shirt for everyday wear",
          descriptionbn: "দৈনন্দিন পরিধানের জন্য আরামদায়ক ১০০% কটন টি-শার্ট",
          price: 45000,
          category: "tshirts",
          categorybn: "টি-শার্ট",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
          stock: 50,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["cotton", "comfortable", "casual"])
        },
        {
          name: "Designer Mug",
          namebn: "ডিজাইনার মগ",
          description: "Beautiful designer mug with unique patterns",
          descriptionbn: "অনন্য নকশা সহ সুন্দর ডিজাইনার মগ",
          price: 65000,
          category: "mugs",
          categorybn: "মগ",
          imageUrl: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500",
          stock: 75,
          isActive: true,
          isFeatured: false,
          tags: JSON.stringify(["designer", "ceramic", "gift"])
        },
        {
          name: "Premium Keychain",
          namebn: "প্রিমিয়াম চাবির চেইন",
          description: "High-quality metal keychain with custom design",
          descriptionbn: "কাস্টম ডিজাইন সহ উচ্চ মানের ধাতব চাবির চেইন",
          price: 30000,
          category: "keychains",
          categorybn: "চাবির চেইন",
          imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
          stock: 200,
          isActive: true,
          isFeatured: false,
          tags: JSON.stringify(["metal", "custom", "durable"])
        },
        {
          name: "Water Bottle",
          namebn: "পানির বোতল",
          description: "Insulated stainless steel water bottle",
          descriptionbn: "ইনসুলেটেড স্টেইনলেস স্টিল পানির বোতল",
          price: 80000,
          category: "bottles",
          categorybn: "পানির বোতল",
          imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500",
          stock: 60,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["stainless-steel", "insulated", "eco-friendly"])
        },
        {
          name: "Gift Hamper for Him",
          namebn: "তার জন্য গিফট হ্যাম্পার",
          description: "Premium gift hamper with mug, t-shirt and accessories",
          descriptionbn: "মগ, টি-শার্ট এবং আনুষাঙ্গিক সহ প্রিমিয়াম গিফট হ্যাম্পার",
          price: 120000,
          category: "gift-him",
          categorybn: "তার জন্য গিফট",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
          stock: 30,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["gift", "hamper", "premium"])
        },
        {
          name: "Gift Hamper for Her",
          namebn: "তার জন্য গিফট হ্যাম্পার",
          description: "Elegant gift hamper with beautiful accessories",
          descriptionbn: "সুন্দর আনুষাঙ্গিক সহ মার্জিত গিফট হ্যাম্পার",
          price: 150000,
          category: "gift-her",
          categorybn: "তার জন্য গিফট",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
          stock: 25,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["gift", "elegant", "accessories"])
        },
        {
          name: "Baby Gift Set",
          namebn: "শিশুর গিফট সেট",
          description: "Adorable gift set for babies with soft toys",
          descriptionbn: "নরম খেলনা সহ শিশুদের জন্য আদরণীয় গিফট সেট",
          price: 70000,
          category: "gift-babies",
          categorybn: "শিশুদের জন্য",
          imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
          stock: 40,
          isActive: true,
          isFeatured: false,
          tags: JSON.stringify(["baby", "soft", "cute"])
        },
        {
          name: "Couple Set",
          namebn: "কাপল সেট",
          description: "Matching mugs and t-shirts for couples",
          descriptionbn: "কাপলদের জন্য ম্যাচিং মগ এবং টি-শার্ট",
          price: 110000,
          category: "couple",
          categorybn: "কাপলের জন্য",
          imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500",
          stock: 35,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["couple", "matching", "romantic"])
        },
        {
          name: "Luxury Gift Hamper",
          namebn: "লাক্সারি গিফট হ্যাম্পার",
          description: "Premium luxury hamper with exclusive items",
          descriptionbn: "এক্সক্লুসিভ আইটেম সহ প্রিমিয়াম লাক্সারি হ্যাম্পার",
          price: 250000,
          category: "hampers",
          categorybn: "প্রিমিয়াম হ্যাম্পার",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
          stock: 15,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["luxury", "premium", "exclusive"])
        }
      ];

      for (const product of sampleProducts) {
        await db.insert(products).values(product);
      }

      console.log("✅ Sample products initialized successfully!");
    }
  } catch (error) {
    console.error("❌ Error initializing sample data:", error);
  }
}

// Initialize on startup
initializeSampleData();
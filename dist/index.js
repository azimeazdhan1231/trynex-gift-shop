// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namebn: text("name_bn").notNull(),
  description: text("description").notNull(),
  descriptionbn: text("description_bn").notNull(),
  price: integer("price").notNull(),
  // in paisa/cents
  category: text("category").notNull(),
  categorybn: text("category_bn").notNull(),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").default(100),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  tags: text("tags").array(),
  variants: jsonb("variants"),
  // for size, color options
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  // TXR-20250118-001 format
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  items: jsonb("items").notNull(),
  // array of cart items
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  // bkash, nagad, upay
  deliveryLocation: text("delivery_location").notNull(),
  // district, thana info
  specialInstructions: text("special_instructions"),
  status: text("status").default("pending"),
  // pending, processing, shipped, delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: integer("discount").notNull(),
  // percentage
  minOrder: integer("min_order").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true
});
var insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true
});

// server/storage.ts
import { eq, desc, like, and, or } from "drizzle-orm";
var connectionString = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
if (!connectionString) {
  throw new Error("DATABASE_URL (Supabase connection string) is required");
}
var client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }
});
var db = drizzle(client);
var DatabaseStorage = class {
  // Products
  async getProducts(category, search, featured) {
    const conditions = [eq(products.isActive, true)];
    if (category) {
      conditions.push(eq(products.category, category));
    }
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.namebn, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }
    if (featured !== void 0) {
      conditions.push(eq(products.isFeatured, featured));
    }
    return await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }
  async getProduct(id) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  async createProduct(product) {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  async updateProduct(id, product) {
    const result = await db.update(products).set({
      ...product,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id) {
    const result = await db.update(products).set({
      isActive: false,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, id));
    return result.rowCount > 0;
  }
  // Orders
  async getOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrder(orderId) {
    const result = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
    return result[0];
  }
  async createOrder(order) {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }
  async updateOrderStatus(orderId, status) {
    const result = await db.update(orders).set({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(orders.orderId, orderId)).returning();
    return result[0];
  }
  // Promo Codes
  async getPromoCodes() {
    return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }
  async getPromoCode(code) {
    const result = await db.select().from(promoCodes).where(
      and(
        eq(promoCodes.code, code),
        eq(promoCodes.isActive, true)
      )
    ).limit(1);
    return result[0];
  }
  async createPromoCode(promoCode) {
    const result = await db.insert(promoCodes).values(promoCode).returning();
    return result[0];
  }
  async updatePromoCode(id, promoCode) {
    const result = await db.update(promoCodes).set(promoCode).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }
  async deletePromoCode(id) {
    const result = await db.delete(promoCodes).where(eq(promoCodes.id, id));
    return result.rowCount > 0;
  }
  // Admin Users
  async getAdminUser(username) {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }
  async createAdminUser(adminUser) {
    const result = await db.insert(adminUsers).values(adminUser).returning();
    return result[0];
  }
};
async function initializeSampleData() {
  try {
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length === 0) {
      console.log("\u{1F331} Initializing sample products...");
      const sampleProducts = [
        {
          name: "Classic Coffee Mug",
          namebn: "\u0995\u09CD\u09B2\u09BE\u09B8\u09BF\u0995 \u0995\u09AB\u09BF \u09AE\u0997",
          description: "Premium ceramic coffee mug perfect for your morning coffee",
          descriptionbn: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u0995\u09BE\u09B2\u09C7\u09B0 \u0995\u09AB\u09BF\u09B0 \u099C\u09A8\u09CD\u09AF \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B8\u09BF\u09B0\u09BE\u09AE\u09BF\u0995 \u0995\u09AB\u09BF \u09AE\u0997",
          price: 55e3,
          category: "mugs",
          categorybn: "\u09AE\u0997",
          imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93d?w=500",
          stock: 100,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["coffee", "ceramic", "daily-use"])
        },
        {
          name: "Cotton T-Shirt",
          namebn: "\u0995\u099F\u09A8 \u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F",
          description: "Comfortable 100% cotton t-shirt for everyday wear",
          descriptionbn: "\u09A6\u09C8\u09A8\u09A8\u09CD\u09A6\u09BF\u09A8 \u09AA\u09B0\u09BF\u09A7\u09BE\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09B0\u09BE\u09AE\u09A6\u09BE\u09AF\u09BC\u0995 \u09E7\u09E6\u09E6% \u0995\u099F\u09A8 \u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F",
          price: 45e3,
          category: "tshirts",
          categorybn: "\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
          stock: 50,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["cotton", "comfortable", "casual"])
        },
        {
          name: "Designer Mug",
          namebn: "\u09A1\u09BF\u099C\u09BE\u0987\u09A8\u09BE\u09B0 \u09AE\u0997",
          description: "Beautiful designer mug with unique patterns",
          descriptionbn: "\u0985\u09A8\u09A8\u09CD\u09AF \u09A8\u0995\u09B6\u09BE \u09B8\u09B9 \u09B8\u09C1\u09A8\u09CD\u09A6\u09B0 \u09A1\u09BF\u099C\u09BE\u0987\u09A8\u09BE\u09B0 \u09AE\u0997",
          price: 65e3,
          category: "mugs",
          categorybn: "\u09AE\u0997",
          imageUrl: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500",
          stock: 75,
          isActive: true,
          isFeatured: false,
          tags: JSON.stringify(["designer", "ceramic", "gift"])
        },
        {
          name: "Premium Keychain",
          namebn: "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u099A\u09BE\u09AC\u09BF\u09B0 \u099A\u09C7\u0987\u09A8",
          description: "High-quality metal keychain with custom design",
          descriptionbn: "\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09A1\u09BF\u099C\u09BE\u0987\u09A8 \u09B8\u09B9 \u0989\u099A\u09CD\u099A \u09AE\u09BE\u09A8\u09C7\u09B0 \u09A7\u09BE\u09A4\u09AC \u099A\u09BE\u09AC\u09BF\u09B0 \u099A\u09C7\u0987\u09A8",
          price: 3e4,
          category: "keychains",
          categorybn: "\u099A\u09BE\u09AC\u09BF\u09B0 \u099A\u09C7\u0987\u09A8",
          imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
          stock: 200,
          isActive: true,
          isFeatured: false,
          tags: JSON.stringify(["metal", "custom", "durable"])
        },
        {
          name: "Water Bottle",
          namebn: "\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AC\u09CB\u09A4\u09B2",
          description: "Insulated stainless steel water bottle",
          descriptionbn: "\u0987\u09A8\u09B8\u09C1\u09B2\u09C7\u099F\u09C7\u09A1 \u09B8\u09CD\u099F\u09C7\u0987\u09A8\u09B2\u09C7\u09B8 \u09B8\u09CD\u099F\u09BF\u09B2 \u09AA\u09BE\u09A8\u09BF\u09B0 \u09AC\u09CB\u09A4\u09B2",
          price: 8e4,
          category: "bottles",
          categorybn: "\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AC\u09CB\u09A4\u09B2",
          imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500",
          stock: 60,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["stainless-steel", "insulated", "eco-friendly"])
        },
        {
          name: "Gift Hamper for Him",
          namebn: "\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09BF\u09AB\u099F \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
          description: "Premium gift hamper with mug, t-shirt and accessories",
          descriptionbn: "\u09AE\u0997, \u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F \u098F\u09AC\u0982 \u0986\u09A8\u09C1\u09B7\u09BE\u0999\u09CD\u0997\u09BF\u0995 \u09B8\u09B9 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0997\u09BF\u09AB\u099F \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
          price: 12e4,
          category: "gift-him",
          categorybn: "\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09BF\u09AB\u099F",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
          stock: 30,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["gift", "hamper", "premium"])
        },
        {
          name: "Gift Hamper for Her",
          namebn: "\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09BF\u09AB\u099F \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
          description: "Elegant gift hamper with beautiful accessories",
          descriptionbn: "\u09B8\u09C1\u09A8\u09CD\u09A6\u09B0 \u0986\u09A8\u09C1\u09B7\u09BE\u0999\u09CD\u0997\u09BF\u0995 \u09B8\u09B9 \u09AE\u09BE\u09B0\u09CD\u099C\u09BF\u09A4 \u0997\u09BF\u09AB\u099F \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
          price: 15e4,
          category: "gift-her",
          categorybn: "\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09BF\u09AB\u099F",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
          stock: 25,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["gift", "elegant", "accessories"])
        },
        {
          name: "Baby Gift Set",
          namebn: "\u09B6\u09BF\u09B6\u09C1\u09B0 \u0997\u09BF\u09AB\u099F \u09B8\u09C7\u099F",
          description: "Adorable gift set for babies with soft toys",
          descriptionbn: "\u09A8\u09B0\u09AE \u0996\u09C7\u09B2\u09A8\u09BE \u09B8\u09B9 \u09B6\u09BF\u09B6\u09C1\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09A6\u09B0\u09A3\u09C0\u09AF\u09BC \u0997\u09BF\u09AB\u099F \u09B8\u09C7\u099F",
          price: 7e4,
          category: "gift-babies",
          categorybn: "\u09B6\u09BF\u09B6\u09C1\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF",
          imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
          stock: 40,
          isActive: true,
          isFeatured: false,
          tags: JSON.stringify(["baby", "soft", "cute"])
        },
        {
          name: "Couple Set",
          namebn: "\u0995\u09BE\u09AA\u09B2 \u09B8\u09C7\u099F",
          description: "Matching mugs and t-shirts for couples",
          descriptionbn: "\u0995\u09BE\u09AA\u09B2\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AE\u09CD\u09AF\u09BE\u099A\u09BF\u0982 \u09AE\u0997 \u098F\u09AC\u0982 \u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F",
          price: 11e4,
          category: "couple",
          categorybn: "\u0995\u09BE\u09AA\u09B2\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF",
          imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500",
          stock: 35,
          isActive: true,
          isFeatured: true,
          tags: JSON.stringify(["couple", "matching", "romantic"])
        },
        {
          name: "Luxury Gift Hamper",
          namebn: "\u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF \u0997\u09BF\u09AB\u099F \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
          description: "Premium luxury hamper with exclusive items",
          descriptionbn: "\u098F\u0995\u09CD\u09B8\u0995\u09CD\u09B2\u09C1\u09B8\u09BF\u09AD \u0986\u0987\u099F\u09C7\u09AE \u09B8\u09B9 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
          price: 25e4,
          category: "hampers",
          categorybn: "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0",
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
      console.log("\u2705 Sample products initialized successfully!");
    }
  } catch (error) {
    console.error("\u274C Error initializing sample data:", error);
  }
}
initializeSampleData();
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, search, featured } = req.query;
      const products2 = await storage.getProducts(
        category,
        search,
        featured === "true"
      );
      res.json(products2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      const orderCount = (await storage.getOrders()).length + 1;
      const orderId = `TXR-${today}-${String(orderCount).padStart(3, "0")}`;
      const orderData = {
        orderId,
        customerName: req.body.customer.name,
        customerPhone: req.body.customer.phone,
        customerAddress: req.body.customer.address,
        items: req.body.items,
        subtotal: req.body.subtotal,
        deliveryFee: req.body.deliveryFee,
        total: req.body.total,
        paymentMethod: req.body.paymentMethod,
        deliveryLocation: req.body.deliveryLocation,
        specialInstructions: req.body.specialInstructions || "",
        status: "pending"
      };
      const validatedOrder = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrder);
      res.json({ ...order, orderId });
    } catch (error) {
      console.error("Order creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:orderId/status", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body;
      if (!status || !["pending", "processing", "shipped", "delivered"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const order = await storage.updateOrderStatus(orderId, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app2.get("/api/promo-codes", async (req, res) => {
    try {
      const promoCodes2 = await storage.getPromoCodes();
      res.json(promoCodes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });
  app2.get("/api/promo-codes/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const promoCode = await storage.getPromoCode(code);
      if (!promoCode) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json(promoCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo code" });
    }
  });
  app2.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      const promoCode = await storage.getPromoCode(code);
      if (!promoCode) {
        return res.status(404).json({ error: "Invalid promo code" });
      }
      const now = /* @__PURE__ */ new Date();
      if (!promoCode.isActive || promoCode.expiresAt && new Date(promoCode.expiresAt) < now) {
        return res.status(400).json({ error: "Promo code has expired" });
      }
      res.json({
        code: promoCode.code,
        discount: promoCode.discountPercentage,
        message: "Promo code applied successfully"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });
  app2.post("/api/promo-codes", async (req, res) => {
    try {
      const promoCodeData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(promoCodeData);
      res.json(promoCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid promo code data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });
  app2.put("/api/promo-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const promoCodeData = insertPromoCodeSchema.partial().parse(req.body);
      const promoCode = await storage.updatePromoCode(id, promoCodeData);
      if (!promoCode) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json(promoCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid promo code data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });
  app2.delete("/api/promo-codes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePromoCode(id);
      if (!success) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promo code" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    const categories = [
      { id: "mugs", name: "Mugs", namebn: "\u09AE\u0997", icon: "fa-mug-hot", minPrice: 550 },
      { id: "tshirts", name: "T-Shirts", namebn: "\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F", icon: "fa-tshirt", minPrice: 350 },
      { id: "keychains", name: "Keychains", namebn: "\u099A\u09BE\u09AC\u09BF\u09B0 \u099A\u09C7\u0987\u09A8", icon: "fa-key", minPrice: 300 },
      { id: "bottles", name: "Water Bottles", namebn: "\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AC\u09CB\u09A4\u09B2", icon: "fa-wine-bottle", minPrice: 800 },
      { id: "gift-him", name: "Gift for Him", namebn: "\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09BF\u09AB\u099F", icon: "fa-male", minPrice: 1200 },
      { id: "gift-her", name: "Gift for Her", namebn: "\u09A4\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0997\u09BF\u09AB\u099F", icon: "fa-female", minPrice: 1500 },
      { id: "gift-parents", name: "Gift for Parents", namebn: "\u09AE\u09BE-\u09AC\u09BE\u09AC\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF", icon: "fa-heart", minPrice: 1e3 },
      { id: "gift-babies", name: "Gifts for Babies", namebn: "\u09B6\u09BF\u09B6\u09C1\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF", icon: "fa-baby", minPrice: 700 },
      { id: "couple", name: "For Couple", namebn: "\u0995\u09BE\u09AA\u09B2\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF", icon: "fa-heart", minPrice: 1100 },
      { id: "hampers", name: "Premium Luxury Gift Hampers", namebn: "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B9\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BE\u09B0", icon: "fa-gift", minPrice: 2500 },
      { id: "chocolates-flowers", name: "Chocolates & Flowers", namebn: "\u099A\u0995\u09B2\u09C7\u099F \u0993 \u09AB\u09C1\u09B2", icon: "fa-heart", minPrice: 1300 }
    ];
    res.json(categories);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function getViteConfig() {
  const { defineConfig } = await import("vite");
  const react = await import("@vitejs/plugin-react").then((m) => m.default);
  async function getReplitPlugins() {
    if (process.env.NODE_ENV === "production" || !process.env.REPL_ID) {
      return [];
    }
    try {
      const [errorModal, cartographer] = await Promise.all([
        import("@replit/vite-plugin-runtime-error-modal").then((m) => m.default()),
        import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())
      ]);
      return [errorModal, cartographer];
    } catch (error) {
      console.warn("Replit plugins not available:", error);
      return [];
    }
  }
  const replitPlugins = await getReplitPlugins();
  return defineConfig({
    plugins: [
      react(),
      ...replitPlugins
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "..", "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "..", "shared"),
        "@assets": path.resolve(import.meta.dirname, "..", "attached_assets")
      }
    },
    root: path.resolve(import.meta.dirname, "..", "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "..", "dist/public"),
      emptyOutDir: true
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"]
      }
    }
  });
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const viteConfig = await getViteConfig();
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const dist = path.resolve(import.meta.dirname, "..", "dist");
  const publicPath = path.join(dist, "public");
  if (fs.existsSync(publicPath)) {
    app2.use(express.static(publicPath));
    app2.get("*", (_req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }
}

// server/index.ts
var app = express2();
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://trynex-gift-shop.netlify.app",
    "http://localhost:5000",
    "https://replit.dev",
    "https://*.replit.dev",
    process.env.FRONTEND_URL
  ].filter(Boolean);
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const port = parseInt(process.env.PORT || "5000", 10);
  const server = await registerRoutes(app);
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      server.listen(port + 1, "0.0.0.0", () => {
        console.log(`\u{1F680} Server running on http://0.0.0.0:${port + 1}`);
        console.log(`\u{1F4CA} Database connected successfully`);
        console.log(`\u{1F310} API endpoints available at http://0.0.0.0:${port + 1}/api`);
      });
    } else {
      console.error("Server error:", err);
    }
  });
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on http://0.0.0.0:${port}`);
    log(`API available at http://0.0.0.0:${port}/api`);
  });
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();

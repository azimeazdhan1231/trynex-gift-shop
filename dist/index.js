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
  // bkash, nagad, rocket
  deliveryLocation: text("delivery_location").notNull(),
  // dhaka, outside
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
      const orderData = insertOrderSchema.parse({
        ...req.body,
        orderId
      });
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
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
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
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
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
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
      const clientTemplate = path2.resolve(
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
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
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
  const server = await registerRoutes(app);
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
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

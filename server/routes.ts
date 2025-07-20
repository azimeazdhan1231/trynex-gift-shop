
import type { Express } from "express";
import { createServer, type Server } from "http";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, orders, promoCodes } from "../shared/schema.js";
import { eq, desc, like, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { insertProductSchema, insertOrderSchema, insertPromoCodeSchema } from "@shared/schema";
import { z } from "zod";

// Supabase connection with improved configuration
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

console.log('🔗 Connecting to Supabase...');

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 10,
  connection: {
    application_name: 'trynex_backend'
  },
  onnotice: () => {}, // Suppress notices
});

const db = drizzle(client);

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('📋 Setting up API routes...');

  // Add CORS headers for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    console.log('✅ Health check accessed');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      version: '1.0.0'
    });
  });

  // Test database connection
  app.get('/api/test-db', async (req, res) => {
    try {
      console.log('🧪 Testing database connection...');
      const count = await db.select().from(products).limit(1);
      console.log('✅ Database test successful');
      res.json({ 
        status: 'Database connected', 
        products_available: count.length > 0,
        connection: 'Supabase PostgreSQL'
      });
    } catch (error) {
      console.error('❌ Database test error:', error);
      res.status(500).json({ 
        error: 'Database connection failed', 
        details: error.message 
      });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      console.log('📦 Fetching products...');
      const { category, search, featured } = req.query;
      
      let query = db.select().from(products).where(eq(products.isActive, true));
      
      if (category && category !== 'all') {
        query = query.where(eq(products.category, category as string));
      }
      
      if (search) {
        query = query.where(ilike(products.name, `%${search as string}%`));
      }
      
      if (featured === 'true') {
        query = query.where(eq(products.isFeatured, true));
      }
      
      const allProducts = await query;
      console.log(`✅ Found ${allProducts.length} products`);
      res.json(allProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error.message 
      });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      console.log('⭐ Fetching featured products...');
      const featuredProducts = await db.select()
        .from(products)
        .where(eq(products.isFeatured, true))
        .limit(12);
      console.log(`✅ Found ${featuredProducts.length} featured products`);
      res.json(featuredProducts);
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      res.status(500).json({ error: 'Failed to fetch featured products' });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const product = await db.select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      
      if (product.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product[0]);
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await db.insert(products).values(productData).returning();
      console.log('✅ Product created:', newProduct[0].name);
      res.status(201).json(newProduct[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      console.error('❌ Error adding product:', error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      console.log('🔄 Updating product:', req.params.id, req.body);
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Transform the data to match database schema
      const productData = {
        name: req.body.name,
        namebn: req.body.namebn,
        description: req.body.description,
        descriptionbn: req.body.descriptionbn,
        price: parseInt(req.body.price) * 100, // Convert BDT to paisa
        category: req.body.category,
        categorybn: req.body.categorybn,
        imageUrl: req.body.imageUrl,
        stock: parseInt(req.body.stock),
        isActive: req.body.isActive,
        isFeatured: req.body.isFeatured,
        tags: req.body.tags || [],
        variants: req.body.variants || {},
        updatedAt: new Date()
      };
      
      const updatedProduct = await db.update(products)
        .set(productData)
        .where(eq(products.id, id))
        .returning();
      
      if (updatedProduct.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      console.log('✅ Product updated:', updatedProduct[0].name);
      res.json(updatedProduct[0]);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      res.status(500).json({ 
        error: "Failed to update product",
        details: error.message 
      });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const deletedProduct = await db.update(products)
        .set({ isActive: false })
        .where(eq(products.id, id))
        .returning();
      
      if (deletedProduct.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      console.log('✅ Product deleted:', deletedProduct[0].name);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      console.log('📋 Fetching orders...');
      const allOrders = await db.select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
      console.log(`✅ Found ${allOrders.length} orders`);
      res.json(allOrders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await db.select()
        .from(orders)
        .where(eq(orders.orderId, orderId))
        .limit(1);
      
      if (order.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order[0]);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      console.log('🛒 Creating new order...', req.body);
      const {
        customerName,
        customerPhone,
        customerAddress,
        items,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        deliveryLocation,
        specialInstructions
      } = req.body;

      // Validation
      if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
        console.log('❌ Missing required fields:', { customerName, customerPhone, customerAddress, items });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate unique order ID
      const orderId = `TXR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${nanoid(6).toUpperCase()}`;

      console.log('📝 Creating order:', orderId);

      const orderData = {
        orderId,
        customerName,
        customerPhone,
        customerAddress,
        items: JSON.stringify(items),
        subtotal: parseInt(subtotal) || 0,
        deliveryFee: parseInt(deliveryFee) || 0,
        total: parseInt(total) || 0,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        deliveryLocation: deliveryLocation || 'dhaka',
        specialInstructions: specialInstructions || '',
        status: 'pending'
      };

      const newOrder = await db.insert(orders).values(orderData).returning();

      console.log('✅ Order created successfully:', newOrder[0].orderId);
      res.status(201).json(newOrder[0]);
    } catch (error) {
      console.error('❌ Order creation error:', error);
      res.status(500).json({ 
        error: "Failed to create order",
        details: error.message 
      });
    }
  });

  app.put("/api/orders/:orderId/status", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body;

      if (!status || !['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedOrder = await db.update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.orderId, orderId))
        .returning();
      
      if (updatedOrder.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      console.log('✅ Order status updated:', orderId, status);
      res.json(updatedOrder[0]);
    } catch (error) {
      console.error('❌ Error updating order:', error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Categories route
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await db.select({
        category: products.category,
        categorybn: products.categorybn
      }).from(products)
      .where(eq(products.isActive, true))
      .groupBy(products.category, products.categorybn);
      
      res.json(categories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Promo codes routes
  app.get("/api/promo-codes", async (req, res) => {
    try {
      const promoCodes = await db.select()
        .from(promoCodes)
        .orderBy(desc(promoCodes.createdAt));
      res.json(promoCodes);
    } catch (error) {
      console.error('❌ Error fetching promo codes:', error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/promo-codes", async (req, res) => {
    try {
      const promoData = insertPromoCodeSchema.parse(req.body);
      const newPromo = await db.insert(promoCodes).values(promoData).returning();
      console.log('✅ Promo code created:', newPromo[0].code);
      res.status(201).json(newPromo[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid promo data", details: error.errors });
      }
      console.error('❌ Error creating promo code:', error);
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  console.log('✅ All routes registered successfully');
  const httpServer = createServer(app);
  return httpServer;
}

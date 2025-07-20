
import type { Express } from "express";
import { createServer, type Server } from "http";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, orders, promoCodes } from "../shared/schema.js";
import { eq, desc, like, ilike } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { insertProductSchema, insertOrderSchema, insertPromoCodeSchema } from "@shared/schema";
import { z } from "zod";

// Supabase connection
const connectionString = "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const client = postgres(connectionString, {
  ssl: 'prefer',
  max: 10,
  connection: {
    application_name: 'trynex_backend'
  }
});
const db = drizzle(client);

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('Setting up API routes...');

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    console.log('Health check accessed');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  });

  // Test database connection
  app.get('/api/test-db', async (req, res) => {
    try {
      console.log('Testing database connection...');
      const count = await db.select().from(products).limit(1);
      console.log('Database test successful');
      res.json({ 
        status: 'Database connected', 
        products_available: count.length > 0 
      });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      console.log('Fetching products...');
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
      console.log(`Found ${allProducts.length} products`);
      res.json(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error.message 
      });
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
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await db.insert(products).values(productData).returning();
      res.status(201).json(newProduct[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      console.error('Error adding product:', error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      
      const updatedProduct = await db.update(products)
        .set({ ...productData, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      
      if (updatedProduct.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(updatedProduct[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      console.error('Error updating product:', error);
      res.status(500).json({ error: "Failed to update product" });
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
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await db.select()
        .from(orders)
        .orderBy(desc(orders.createdAt));
      res.json(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      console.error('Error fetching order:', error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Order tracking endpoint
  app.get("/api/orders/track/:orderId", async (req, res) => {
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
      console.error('Error fetching order:', error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      console.log('Creating new order...');
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
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate unique order ID
      const orderId = `TXR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${nanoid(6).toUpperCase()}`;

      console.log('Creating order:', orderId);

      const newOrder = await db.insert(orders).values({
        orderId,
        customerName,
        customerPhone,
        customerAddress,
        items: JSON.stringify(items),
        subtotal: subtotal || 0,
        deliveryFee: deliveryFee || 0,
        total: total || 0,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        deliveryLocation: deliveryLocation || 'dhaka',
        specialInstructions,
        status: 'pending'
      }).returning();

      console.log('Order created successfully:', newOrder[0].orderId);
      res.status(201).json(newOrder[0]);
    } catch (error) {
      console.error('Order creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
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
      
      res.json(updatedOrder[0]);
    } catch (error) {
      console.error('Error updating order:', error);
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
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Featured products - moved to prevent route conflict
  app.get('/api/products/featured', async (req, res) => {
    try {
      const featuredProducts = await db.select()
        .from(products)
        .where(eq(products.isFeatured, true))
        .limit(12);
      console.log(`Found ${featuredProducts.length} featured products`);
      res.json(featuredProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({ error: 'Failed to fetch featured products' });
    }
  });

  console.log('All routes registered successfully');
  const httpServer = createServer(app);
  return httpServer;
}

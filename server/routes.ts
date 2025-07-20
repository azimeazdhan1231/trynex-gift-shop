
import type { Express } from "express";
import { createServer, type Server } from "http";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, orders, orderItems, promoCodes } from "../shared/schema.js";
import { eq, desc, like, ilike, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { insertProductSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import cors from 'cors';

// Supabase connection
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

console.log('🔗 Connecting to Supabase...');

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 10,
  connection: {
    application_name: 'trynex_backend'
  },
  onnotice: () => {},
});

const db = drizzle(client);

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('📋 Setting up API routes...');

  // CORS configuration
  app.use(cors({
    origin: ['https://trynex-gift-shop.netlify.app', 'http://localhost:5173', 'https://localhost:5173', /\.replit\.dev$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
  }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    console.log('✅ Health check accessed');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      version: '2.0.0'
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
      const { category, search, featured, limit } = req.query;

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

      if (limit) {
        query = query.limit(parseInt(limit as string));
      }

      const allProducts = await query.orderBy(desc(products.createdAt));
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
        .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
        .limit(12)
        .orderBy(desc(products.createdAt));
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
        .where(and(eq(products.id, productId), eq(products.isActive, true)))
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
      console.log('🔄 Updating product:', req.params.id);
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const productData = {
        name: req.body.name,
        namebn: req.body.namebn,
        description: req.body.description,
        descriptionbn: req.body.descriptionbn,
        price: parseInt(req.body.price),
        category: req.body.category,
        categorybn: req.body.categorybn,
        imageUrl: req.body.imageUrl,
        stock: parseInt(req.body.stock),
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : false,
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

      // Get order items
      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      res.json({
        ...order[0],
        items: items
      });
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
        customerEmail,
        customerAddress,
        items,
        subtotal,
        deliveryFee = 6000,
        totalAmount,
        paymentMethod = 'cash_on_delivery',
        deliveryLocation = 'dhaka',
        specialInstructions,
        promoCode
      } = req.body;

      // Validation
      if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate unique order ID
      const orderId = `TXR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${nanoid(6).toUpperCase()}`;

      console.log('📝 Creating order:', orderId);

      // Create order
      const orderData = {
        orderId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        customerAddress,
        deliveryLocation,
        paymentMethod,
        specialInstructions: specialInstructions || null,
        promoCode: promoCode || null,
        subtotal: parseInt(subtotal) || 0,
        deliveryFee: parseInt(deliveryFee),
        discountAmount: 0,
        totalAmount: parseInt(totalAmount),
        status: 'pending'
      };

      const newOrder = await db.insert(orders).values(orderData).returning();

      // Create order items
      for (const item of items) {
        const orderItemData = {
          orderId,
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        };

        await db.insert(orderItems).values(orderItemData);
      }

      console.log('✅ Order created successfully:', newOrder[0].orderId);
      res.status(201).json({
        success: true,
        orderId: newOrder[0].orderId,
        message: 'Order placed successfully!',
        order: newOrder[0]
      });
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

      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
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
      const codes = await db.select()
        .from(promoCodes)
        .where(eq(promoCodes.isActive, true))
        .orderBy(desc(promoCodes.createdAt));
      res.json(codes);
    } catch (error) {
      console.error('❌ Error fetching promo codes:', error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }

      const promoCode = await db.select()
        .from(promoCodes)
        .where(and(eq(promoCodes.code, code), eq(promoCodes.isActive, true)))
        .limit(1);

      if (promoCode.length === 0) {
        return res.status(404).json({ error: "Invalid promo code" });
      }

      const promo = promoCode[0];

      // Check if expired
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return res.status(400).json({ error: "Promo code has expired" });
      }

      // Check minimum order amount
      if (orderAmount < promo.minOrderAmount) {
        return res.status(400).json({ 
          error: `Minimum order amount is ৳${promo.minOrderAmount / 100} to use this promo code` 
        });
      }

      // Calculate discount
      let discountAmount = Math.floor((orderAmount * promo.discountPercentage) / 100);
      
      // Apply maximum discount limit if set
      if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
        discountAmount = promo.maxDiscountAmount;
      }

      res.json({
        valid: true,
        discountPercentage: promo.discountPercentage,
        discountAmount,
        code: promo.code
      });
    } catch (error) {
      console.error('❌ Error validating promo code:', error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  console.log('✅ All routes registered successfully');
  const httpServer = createServer(app);
  return httpServer;
}

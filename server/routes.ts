import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertPromoCodeSchema } from "@shared/schema";
import { z } from "zod";
import { eq, desc, like, and, sql } from "drizzle-orm";
import express, {  } from "express";
import { Router } from "express";

const appRouter = Router();

// Handle preflight requests for all routes
appRouter.options("*", (req, res) => {
  res.status(200).end();
});

// Products endpoints
appRouter.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getProducts();
    // Map database fields to frontend expected format
    const mappedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      namebn: product.name_bn,
      description: product.description,
      descriptionbn: product.description_bn,
      price: product.price,
      category: product.category,
      categorybn: product.category_bn,
      imageUrl: product.image_url,
      stock: product.stock,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      tags: product.tags,
      variants: product.variants,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
    res.json(mappedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

appRouter.get("/api/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Map database fields to frontend expected format
    const mappedProduct = {
      id: product.id,
      name: product.name,
      namebn: product.name_bn,
      description: product.description,
      descriptionbn: product.description_bn,
      price: product.price,
      category: product.category,
      categorybn: product.category_bn,
      imageUrl: product.image_url,
      stock: product.stock,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      tags: product.tags,
      variants: product.variants,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    res.json(mappedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Orders endpoints
const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerAddress: z.string().min(1),
  deliveryLocation: z.string().optional(),
  paymentMethod: z.string().default("cash_on_delivery"),
  specialInstructions: z.string().optional(),
  promoCode: z.string().optional(),
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    namebn: z.string().optional(),
    price: z.number(),
    quantity: z.number().min(1),
    variant: z.any().optional()
  })),
  subtotal: z.number(),
  deliveryFee: z.number().default(6000),
  discountAmount: z.number().default(0),
  totalAmount: z.number(),
  finalAmount: z.number()
});

appRouter.post("/api/orders", async (req, res) => {
  try {
    console.log("📦 Creating order with data:", JSON.stringify(req.body, null, 2));
    
    const validatedData = createOrderSchema.parse(req.body);
    console.log("✅ Data validation passed");

    // Map frontend fields to database fields
    const orderData = {
      customer_name: validatedData.customerName,
      customer_phone: validatedData.customerPhone,
      customer_email: validatedData.customerEmail || null,
      customer_address: validatedData.customerAddress,
      delivery_location: validatedData.deliveryLocation || null,
      payment_method: validatedData.paymentMethod,
      special_instructions: validatedData.specialInstructions || null,
      promo_code: validatedData.promoCode || null,
      items: validatedData.items.map(item => ({
        id: item.id,
        name: item.name,
        name_bn: item.namebn || item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant || {}
      })),
      subtotal: validatedData.subtotal,
      delivery_fee: validatedData.deliveryFee,
      discount_amount: validatedData.discountAmount,
      total_amount: validatedData.totalAmount,
      final_amount: validatedData.finalAmount
    };

    console.log("🔄 Creating order in database...");
    const order = await storage.createOrder(orderData);
    console.log("✅ Order created successfully:", order.order_id);

    // Map database fields back to frontend expected format
    const mappedOrder = {
      id: order.id,
      orderId: order.order_id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      customerAddress: order.customer_address,
      deliveryLocation: order.delivery_location,
      paymentMethod: order.payment_method,
      specialInstructions: order.special_instructions,
      promoCode: order.promo_code,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      finalAmount: order.final_amount,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.status(201).json(mappedOrder);
  } catch (error) {
    console.error("❌ Error creating order:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'Unknown error');
    
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        error: "Invalid order data", 
        details: error.errors,
        receivedData: req.body
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create order",
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

appRouter.get("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await storage.getOrderByOrderId(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Map database fields to frontend expected format
    const mappedOrder = {
      id: order.id,
      orderId: order.order_id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      customerAddress: order.customer_address,
      deliveryLocation: order.delivery_location,
      paymentMethod: order.payment_method,
      specialInstructions: order.special_instructions,
      promoCode: order.promo_code,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      finalAmount: order.final_amount,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.json(mappedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Promo codes endpoint
appRouter.get("/api/promo-codes/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const promoCode = await storage.getPromoCode(code);

    if (!promoCode || !promoCode.is_active || (promoCode.expires_at && promoCode.expires_at < new Date())) {
      return res.status(404).json({ error: "Promo code not found or expired" });
    }

    // Map database fields to frontend expected format
    const mappedPromoCode = {
      id: promoCode.id,
      code: promoCode.code,
      discountPercentage: promoCode.discount_percentage,
      isActive: promoCode.is_active,
      expiresAt: promoCode.expires_at,
      createdAt: promoCode.created_at,
      updatedAt: promoCode.updated_at
    };

    res.json(mappedPromoCode);
  } catch (error) {
    console.error("Error fetching promo code:", error);
    res.status(500).json({ error: "Failed to fetch promo code" });
  }
});

// Health check endpoint
appRouter.get("/api/health", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json({ 
      status: "healthy", 
      database: "connected",
      productsCount: products.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "unhealthy", 
      database: "error",
      error: error.message 
    });
  }
});

// Categories route (static data)
appRouter.get("/api/categories", async (req, res) => {
  const categories = [
    { id: "mugs", name: "Mugs", namebn: "মগ", icon: "fa-mug-hot", minPrice: 550 },
    { id: "tshirts", name: "T-Shirts", namebn: "টি-শার্ট", icon: "fa-tshirt", minPrice: 350 },
    { id: "keychains", name: "Keychains", namebn: "চাবির চেইন", icon: "fa-key", minPrice: 300 },
    { id: "bottles", name: "Water Bottles", namebn: "পানির বোতল", icon: "fa-wine-bottle", minPrice: 800 },
    { id: "gift-him", name: "Gift for Him", namebn: "তার জন্য গিফট", icon: "fa-male", minPrice: 1200 },
    { id: "gift-her", name: "Gift for Her", namebn: "তার জন্য গিফট", icon: "fa-female", minPrice: 1500 },
    { id: "gift-parents", name: "Gift for Parents", namebn: "মা-বাবার জন্য", icon: "fa-heart", minPrice: 1000 },
    { id: "gift-babies", name: "Gifts for Babies", namebn: "শিশুদের জন্য", icon: "fa-baby", minPrice: 700 },
    { id: "couple", name: "For Couple", namebn: "কাপলের জন্য", icon: "fa-heart", minPrice: 1100 },
    { id: "hampers", name: "Premium Luxury Gift Hampers", namebn: "প্রিমিয়াম হ্যাম্পার", icon: "fa-gift", minPrice: 2500 },
    { id: "chocolates-flowers", name: "Chocolates & Flowers", namebn: "চকলেট ও ফুল", icon: "fa-heart", minPrice: 1300 }
  ];
  res.json(categories);
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(appRouter)
  const httpServer = createServer(app);
  return httpServer;
}
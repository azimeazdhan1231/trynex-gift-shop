import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertPromoCodeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, featured } = req.query;
      const products = await storage.getProducts(
        category as string,
        search as string,
        featured === 'true'
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
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

  app.post("/api/products", async (req, res) => {
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

  app.put("/api/products/:id", async (req, res) => {
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

  app.delete("/api/products/:id", async (req, res) => {
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

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:orderId", async (req, res) => {
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

  app.post("/api/orders", async (req, res) => {
    try {
      // Generate unique order ID
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderCount = (await storage.getOrders()).length + 1;
      const orderId = `TXR-${today}-${String(orderCount).padStart(3, '0')}`;

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

  app.put("/api/orders/:orderId/status", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body;
      
      if (!status || !['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
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

  // Promo codes routes
  app.get("/api/promo-codes", async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.get("/api/promo-codes/:code", async (req, res) => {
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

  app.post("/api/promo-codes", async (req, res) => {
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

  app.put("/api/promo-codes/:id", async (req, res) => {
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

  app.delete("/api/promo-codes/:id", async (req, res) => {
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

  // Categories route (static data)
  app.get("/api/categories", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}

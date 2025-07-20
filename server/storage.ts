import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, orders, promoCodes } from "@shared/schema";
import type { InsertProduct, Product, InsertOrder, Order, InsertPromoCode, PromoCode } from "@shared/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";

// Supabase connection
const DATABASE_URL = "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const client = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 20,
});

export const db = drizzle(client);

class Storage {
  // Products
  async getProducts(category?: string, search?: string, featured?: boolean): Promise<Product[]> {
    try {
      let query = db.select().from(products);
      const conditions = [];

      if (category) {
        conditions.push(eq(products.category, category));
      }
      if (search) {
        conditions.push(like(products.name, `%${search}%`));
      }
      if (featured !== undefined) {
        conditions.push(eq(products.isFeatured, featured));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query.orderBy(desc(products.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<Product | null> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      const result = await db.insert(products).values({
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | null> {
    try {
      const result = await db.update(products)
        .set({ ...productData, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      const result = await db.select().from(orders).orderBy(desc(orders.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async getOrderByOrderId(orderId: string): Promise<Order | null> {
    try {
      const result = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching order by orderId:", error);
      throw error;
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      console.log("Creating order in database:", orderData);
      const result = await db.insert(orders).values({
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      console.log("Order created successfully:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating order in database:", error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    try {
      const result = await db.update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.orderId, orderId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    try {
      const result = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      throw error;
    }
  }

  async getPromoCode(code: string): Promise<PromoCode | null> {
    try {
      const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching promo code:", error);
      throw error;
    }
  }

  async createPromoCode(promoCodeData: InsertPromoCode): Promise<PromoCode> {
    try {
      const result = await db.insert(promoCodes).values({
        ...promoCodeData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating promo code:", error);
      throw error;
    }
  }

  async updatePromoCode(id: number, promoCodeData: Partial<InsertPromoCode>): Promise<PromoCode | null> {
    try {
      const result = await db.update(promoCodes)
        .set({ ...promoCodeData, updatedAt: new Date() })
        .where(eq(promoCodes.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error("Error updating promo code:", error);
      throw error;
    }
  }

  async deletePromoCode(id: number): Promise<boolean> {
    try {
      await db.delete(promoCodes).where(eq(promoCodes.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting promo code:", error);
      return false;
    }
  }
}

export const storage = new Storage();
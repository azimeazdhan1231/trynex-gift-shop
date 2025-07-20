import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, orders, promoCodes } from "@shared/schema";
import type { InsertProduct, Product, InsertOrder, Order, InsertPromoCode, PromoCode } from "@shared/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";

// Your Supabase connection string
const DATABASE_URL = "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const client = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 20,
});

export const db = drizzle(client);

// Storage interface
export const storage = {
  // Products
  async getProducts(options: { 
    limit?: number; 
    category?: string; 
    search?: string; 
    featured?: boolean;
    active?: boolean;
  } = {}): Promise<Product[]> {
    const { limit, category, search, featured, active = true } = options;

    let query = db.select().from(products);

    const conditions = [eq(products.isActive, active)];

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    if (search) {
      conditions.push(
        sql`(${products.name} ILIKE ${`%${search}%`} OR ${products.description} ILIKE ${`%${search}%`})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(products.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return query.execute();
  },

  async getProductById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1).execute();
    return result[0] || null;
  },

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning().execute();
    return result[0];
  },

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | null> {
    const result = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()
      .execute();
    return result[0] || null;
  },

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).execute();
    return result.count > 0;
  },

  // Orders
  async getOrders(options: { limit?: number } = {}): Promise<Order[]> {
    const { limit } = options;

    let query = db.select().from(orders).orderBy(desc(orders.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return query.execute();
  },

  async getOrderById(id: string): Promise<Order | null> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1).execute();
    return result[0] || null;
  },

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning().execute();
    return result[0];
  },

  async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning()
      .execute();
    return result[0] || null;
  },

  // Promo codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).where(eq(promoCodes.isActive, true)).execute();
  },

  async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    const result = await db.select().from(promoCodes)
      .where(and(eq(promoCodes.code, code), eq(promoCodes.isActive, true)))
      .limit(1)
      .execute();
    return result[0] || null;
  },

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await db.insert(promoCodes).values(promoCode).returning().execute();
    return result[0];
  }
};
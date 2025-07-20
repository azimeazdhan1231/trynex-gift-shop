import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Supabase connection string from environment
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
import { products, orders, promoCodes, adminUsers, type Product, type InsertProduct, type Order, type InsertOrder, type PromoCode, type InsertPromoCode, type AdminUser, type InsertAdminUser } from "@shared/schema";
import { eq, desc, like, and, or } from "drizzle-orm";

if (!connectionString) {
  throw new Error("DATABASE_URL (Supabase connection string) is required");
}

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(client);

export interface IStorage {
  // Products
  getProducts(category?: string, search?: string, featured?: boolean): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(orderId: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;

  // Admin Users
  getAdminUser(username: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(category?: string, search?: string, featured?: boolean): Promise<Product[]> {
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
        )!
      );
    }
    if (featured !== undefined) {
      conditions.push(eq(products.isFeatured, featured));
    }

    return await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set({
      ...product,
      updatedAt: new Date()
    }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.update(products).set({
      isActive: false,
      updatedAt: new Date()
    }).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({
      status,
      updatedAt: new Date()
    }).where(eq(orders.orderId, orderId)).returning();
    return result[0];
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const result = await db.select().from(promoCodes).where(
      and(
        eq(promoCodes.code, code),
        eq(promoCodes.isActive, true)
      )
    ).limit(1);
    return result[0];
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await db.insert(promoCodes).values(promoCode).returning();
    return result[0];
  }

  async updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const result = await db.update(promoCodes).set(promoCode).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  async deletePromoCode(id: number): Promise<boolean> {
    const result = await db.delete(promoCodes).where(eq(promoCodes.id, id));
    return result.rowCount > 0;
  }

  // Admin Users
  async getAdminUser(username: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }

  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(adminUsers).values(adminUser).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
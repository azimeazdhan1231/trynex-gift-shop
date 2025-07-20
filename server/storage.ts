import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, orders, promo_codes } from "@shared/schema";
import type { InsertProduct, Product, InsertOrder, Order, InsertPromoCode, PromoCode } from "@shared/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";

// Updated Supabase connection
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:AZim345670@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const client = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 20,
});

// Test connection
export async function testConnection() {
  try {
    const result = await client`SELECT COUNT(*) FROM products`;
    console.log('✅ Database connected! Found', result[0].count, 'products');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export const db = drizzle(client);

class Storage {
  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.created_at));
  }

  async getProduct(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0] || null;
  }

  async createProduct(data: Omit<InsertProduct, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await db.insert(products).values({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    return result[0];
  }

  async updateProduct(id: number, data: Partial<Omit<InsertProduct, 'id' | 'created_at'>>): Promise<Product | null> {
    const result = await db.update(products)
      .set({ ...data, updated_at: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.created_at));
  }

  async getOrder(id: string): Promise<Order | null> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0] || null;
  }

  async getOrderByOrderId(orderId: string): Promise<Order | null> {
    const result = await db.select().from(orders).where(eq(orders.order_id, orderId)).limit(1);
    return result[0] || null;
  }

  async createOrder(data: Omit<InsertOrder, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const orderId = this.generateOrderId();
    const id = this.generateUniqueId();

    const result = await db.insert(orders).values({
      id,
      order_id: orderId,
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();

    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    const result = await db.update(orders)
      .set({ status, updated_at: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0] || null;
  }

  // Promo code methods
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promo_codes).orderBy(desc(promo_codes.created_at));
  }

  async getPromoCode(code: string): Promise<PromoCode | null> {
    const result = await db.select().from(promo_codes).where(eq(promo_codes.code, code)).limit(1);
    return result[0] || null;
  }

  async createPromoCode(data: Omit<InsertPromoCode, 'id' | 'created_at' | 'updated_at'>): Promise<PromoCode> {
    const result = await db.insert(promo_codes).values({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    return result[0];
  }

  // Helper methods
  private generateOrderId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TXR-${year}${month}${day}-${random}`;
  }

  private generateUniqueId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const storage = new Storage();

export async function getProducts(options: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<Product[]> {
  try {
    let query = client`SELECT * FROM products WHERE is_active = true`;

    if (options.category) {
      query = client`SELECT * FROM products WHERE is_active = true AND category = ${options.category}`;
    }

    if (options.featured !== undefined) {
      if (options.category) {
        query = client`SELECT * FROM products WHERE is_active = true AND category = ${options.category} AND is_featured = ${options.featured}`;
      } else {
        query = client`SELECT * FROM products WHERE is_active = true AND is_featured = ${options.featured}`;
      }
    }

    if (options.limit) {
      query = client`SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT ${options.limit}`;
    } else {
      query = client`SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC`;
    }

    const data = await query;
    return data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function createOrder(orderData: any): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [order] = await client`
      INSERT INTO orders (
        id, order_id, customer_name, customer_phone, customer_email, customer_address,
        delivery_location, payment_method, special_instructions, promo_code, items,
        subtotal, delivery_fee, discount_amount, total_amount, final_amount, status
      ) VALUES (
        ${orderId}, ${orderId}, ${orderData.customerName}, ${orderData.customerPhone}, ${orderData.customerEmail || null},
        ${orderData.customerAddress}, ${orderData.deliveryLocation || null}, ${orderData.paymentMethod || 'cash_on_delivery'},
        ${orderData.specialInstructions || null}, ${orderData.promoCode || null}, ${JSON.stringify(orderData.items)},
        ${orderData.subtotal}, ${orderData.deliveryFee}, ${orderData.discountAmount || 0}, 
        ${orderData.totalAmount}, ${orderData.finalAmount}, 'pending'
      ) RETURNING *
    `;

    return { success: true, orderId: order.order_id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function getPromoCode(code: string): Promise<PromoCode | null> {
  try {
    const [data] = await client`
      SELECT * FROM promo_codes 
      WHERE code = ${code} AND is_active = true 
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    return data ? (data as PromoCode) : null;
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return null;
  }
}
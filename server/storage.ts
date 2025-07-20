
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  boolean, 
  timestamp, 
  jsonb, 
  decimal 
} from "drizzle-orm/pg-core";
import { eq, desc, like, and, sql } from "drizzle-orm";

// Database URL
const DATABASE_URL = "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

// Initialize postgres client
const client = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60
});

// Initialize drizzle
const db = drizzle(client);

// Define tables
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  name_bn: text('name_bn'),
  description: text('description'),
  description_bn: text('description_bn'),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  category_bn: text('category_bn'),
  image_url: text('image_url'),
  stock: integer('stock').default(0),
  is_active: boolean('is_active').default(true),
  is_featured: boolean('is_featured').default(false),
  tags: jsonb('tags'),
  variants: jsonb('variants'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  order_id: text('order_id').notNull().unique(),
  customer_name: text('customer_name').notNull(),
  customer_phone: text('customer_phone').notNull(),
  customer_email: text('customer_email'),
  customer_address: text('customer_address').notNull(),
  delivery_location: text('delivery_location'),
  payment_method: text('payment_method').default('cash_on_delivery'),
  special_instructions: text('special_instructions'),
  promo_code: text('promo_code'),
  items: jsonb('items').notNull(),
  subtotal: integer('subtotal').notNull(),
  delivery_fee: integer('delivery_fee').default(6000),
  discount_amount: integer('discount_amount').default(0),
  total_amount: integer('total_amount').notNull(),
  final_amount: integer('final_amount').notNull(),
  status: text('status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discount_percentage: integer('discount_percentage').notNull(),
  is_active: boolean('is_active').default(true),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

class Storage {
  async init() {
    try {
      console.log('🔄 Testing database connection...');
      
      // Test connection
      const result = await db.execute(sql`SELECT 1 as test`);
      console.log('✅ Database connection test successful');

      // Create tables if they don't exist
      await this.createTables();
      
      // Seed data if needed
      await this.seedData();
      
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      console.log('🔄 Creating tables...');
      
      // Create products table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          name_bn TEXT,
          description TEXT,
          description_bn TEXT,
          price INTEGER NOT NULL,
          category TEXT NOT NULL,
          category_bn TEXT,
          image_url TEXT,
          stock INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          tags JSONB,
          variants JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create orders table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_id TEXT NOT NULL UNIQUE,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          customer_address TEXT NOT NULL,
          delivery_location TEXT,
          payment_method TEXT DEFAULT 'cash_on_delivery',
          special_instructions TEXT,
          promo_code TEXT,
          items JSONB NOT NULL,
          subtotal INTEGER NOT NULL,
          delivery_fee INTEGER DEFAULT 6000,
          discount_amount INTEGER DEFAULT 0,
          total_amount INTEGER NOT NULL,
          final_amount INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create promo_codes table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS promo_codes (
          id SERIAL PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          discount_percentage INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log('✅ Tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  async seedData() {
    try {
      // Check if products already exist
      const existingProducts = await db.select().from(products).limit(1);
      if (existingProducts.length > 0) {
        console.log('📊 Products already exist, skipping seed');
        return;
      }

      console.log('🌱 Seeding initial data...');

      const sampleProducts = [
        {
          name: "Classic Ceramic Mug",
          name_bn: "ক্লাসিক সিরামিক মগ",
          description: "Perfect for your morning coffee or tea",
          description_bn: "আপনার সকালের কফি বা চায়ের জন্য আদর্শ",
          price: 55000,
          category: "mugs",
          category_bn: "মগ",
          image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80",
          stock: 100,
          is_active: true,
          is_featured: true,
          tags: ["ceramic", "coffee", "tea"],
          variants: { colors: ["white", "black", "blue"], sizes: ["small", "medium", "large"] }
        },
        {
          name: "Premium Cotton T-Shirt",
          name_bn: "প্রিমিয়াম কটন টি-শার্ট",
          description: "Comfortable and stylish t-shirt for everyday wear",
          description_bn: "দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং স্টাইলিশ টি-শার্ট",
          price: 55000,
          category: "tshirts",
          category_bn: "টি-শার্ট",
          image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
          stock: 150,
          is_active: true,
          is_featured: true,
          tags: ["cotton", "casual", "comfortable"],
          variants: { colors: ["red", "blue", "green"], sizes: ["S", "M", "L", "XL"] }
        },
        {
          name: "Personalized Keychain",
          name_bn: "ব্যক্তিগতকৃত চাবির চেইন",
          description: "Custom keychain with your name or message",
          description_bn: "আপনার নাম বা বার্তা সহ কাস্টম কীচেইন",
          price: 30000,
          category: "keychains",
          category_bn: "চাবির চেইন",
          image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
          stock: 200,
          is_active: true,
          is_featured: false,
          tags: ["personalized", "custom", "gift"],
          variants: { materials: ["metal", "leather", "plastic"] }
        }
      ];

      await db.insert(products).values(sampleProducts);
      console.log('✅ Sample products seeded successfully');

      // Seed a promo code
      await db.insert(promoCodes).values({
        code: "WELCOME30",
        discount_percentage: 30,
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      console.log('✅ Sample promo code seeded successfully');

    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  }

  async getProducts(options: {
    category?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
  } = {}) {
    try {
      let query = db.select().from(products).where(eq(products.is_active, true));

      if (options.category) {
        query = query.where(eq(products.category, options.category));
      }

      if (options.search) {
        query = query.where(
          sql`${products.name} ILIKE ${`%${options.search}%`} OR ${products.name_bn} ILIKE ${`%${options.search}%`}`
        );
      }

      if (options.featured) {
        query = query.where(eq(products.is_featured, true));
      }

      query = query.orderBy(desc(products.created_at));

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(id: number) {
    try {
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async createOrder(orderData: any) {
    try {
      const orderId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const result = await db.insert(orders).values({
        order_id: orderId,
        ...orderData
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderByOrderId(orderId: string) {
    try {
      const result = await db.select().from(orders).where(eq(orders.order_id, orderId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getPromoCode(code: string) {
    try {
      const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching promo code:', error);
      throw error;
    }
  }

  async addProduct(productData: any) {
    try {
      const result = await db.insert(products).values(productData).returning();
      return result[0];
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async addPromoCode(promoData: any) {
    try {
      // Check if promo code already exists
      const existing = await this.getPromoCode(promoData.code);
      if (existing) {
        console.log(`⚠️ Promo code ${promoData.code} already exists, skipping`);
        return existing;
      }
      
      const result = await db.insert(promoCodes).values(promoData).returning();
      return result[0];
    } catch (error) {
      console.error('Error adding promo code:', error);
      throw error;
    }
  }

  async getPromoCodes() {
    try {
      return await db.select().from(promoCodes).orderBy(desc(promoCodes.created_at));
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      throw error;
    }
  }

  async createPromoCode(promoData: any) {
    try {
      const result = await db.insert(promoCodes).values(promoData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  }

  async updatePromoCode(id: number, promoData: any) {
    try {
      const result = await db.update(promoCodes)
        .set({ ...promoData, updated_at: new Date() })
        .where(eq(promoCodes.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating promo code:', error);
      throw error;
    }
  }

  async deletePromoCode(id: number) {
    try {
      await db.delete(promoCodes).where(eq(promoCodes.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting promo code:', error);
      return false;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const result = await db.update(orders)
        .set({ status, updated_at: new Date() })
        .where(eq(orders.order_id, orderId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrders() {
    try {
      return await db.select().from(orders).orderBy(desc(orders.created_at));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async clearAllData() {
    try {
      console.log('🗑️ Clearing all existing data...');
      await db.delete(orders);
      await db.delete(promoCodes);
      await db.delete(products);
      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

export const storage = new Storage();
export { db };

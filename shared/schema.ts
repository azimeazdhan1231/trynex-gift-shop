
import { pgTable, text, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  name_bn: text("name_bn"),
  description: text("description"),
  description_bn: text("description_bn"),
  price: integer("price").notNull(), // Price in paisa
  category: text("category").notNull(),
  category_bn: text("category_bn"),
  image_url: text("image_url"),
  stock: integer("stock").default(100),
  is_active: boolean("is_active").default(true),
  is_featured: boolean("is_featured").default(false),
  tags: jsonb("tags").$type<string[]>(),
  variants: jsonb("variants").$type<any>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Orders table
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  order_id: text("order_id").notNull().unique(),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_email: text("customer_email"),
  customer_address: text("customer_address").notNull(),
  delivery_location: text("delivery_location"),
  payment_method: text("payment_method").default("cash_on_delivery"),
  special_instructions: text("special_instructions"),
  promo_code: text("promo_code"),
  items: jsonb("items").notNull().$type<Array<{
    id: number;
    name: string;
    name_bn: string;
    price: number;
    quantity: number;
    variant?: any;
  }>>(),
  subtotal: integer("subtotal").notNull(),
  delivery_fee: integer("delivery_fee").default(6000),
  discount_amount: integer("discount_amount").default(0),
  total_amount: integer("total_amount").notNull(),
  final_amount: integer("final_amount").notNull(),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Promo codes table
export const promo_codes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount_percentage: integer("discount_percentage").notNull(),
  is_active: boolean("is_active").default(true),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Admin users table
export const admin_users = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Create schemas for validation
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export const insertPromoCodeSchema = createInsertSchema(promo_codes);
export const selectPromoCodeSchema = createSelectSchema(promo_codes);

// Export types
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof selectOrderSchema>;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = z.infer<typeof selectPromoCodeSchema>;

import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  namebn: text("name_bn").notNull(),
  description: text("description").notNull(),
  descriptionbn: text("description_bn").notNull(),
  price: integer("price").notNull(), // in paisa/cents
  category: text("category").notNull(),
  categorybn: text("category_bn").notNull(),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").default(100),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  tags: text("tags").array(),
  variants: jsonb("variants"), // for size, color options
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderId: text("orderId").notNull().unique(), // TXR-20250118-001 format
  customerName: text("customerName").notNull(),
  customerPhone: text("customerPhone").notNull(),
  customerAddress: text("customerAddress").notNull(),
  customerEmail: text("customerEmail"),
  deliveryLocation: text("deliveryLocation"),
  paymentMethod: text("paymentMethod").default("cash_on_delivery"),
  specialInstructions: text("specialInstructions"),
  promoCode: text("promoCode"),
  items: jsonb("items").notNull(), // array of cart items
  subtotal: integer("subtotal").notNull(),
  totalAmount: integer("totalAmount").notNull(),
  discountAmount: integer("discountAmount").default(0),
  deliveryFee: integer("deliveryFee").default(0),
  finalAmount: integer("finalAmount").notNull(),
  status: text("status").default("pending"), // pending, processing, shipped, delivered
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: integer("discount").notNull(), // percentage
  minOrder: integer("min_order").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  createdAt: true,
  updatedAt: true
}).extend({
  id: z.string().optional(),
  orderId: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerAddress: z.string().min(1),
  customerEmail: z.string().nullable().optional(),
  deliveryLocation: z.string().optional(),
  paymentMethod: z.string().default("cash_on_delivery"),
  specialInstructions: z.string().nullable().optional(),
  promoCode: z.string().nullable().optional(),
  items: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    namebn: z.string().optional(),
    price: z.number(),
    quantity: z.number(),
    category: z.string().optional(),
    image: z.string().optional()
  })).default([]),
  subtotal: z.number().int().min(0).default(0),
  totalAmount: z.number().int().min(0),
  discountAmount: z.number().int().min(0).default(0),
  deliveryFee: z.number().int().min(0).default(0),
  finalAmount: z.number().int().min(0),
  status: z.string().default("pending")
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  namebn: text('name_bn'),
  description: text('description'),
  descriptionbn: text('description_bn'),
  price: integer('price').notNull(), // in paisa
  category: text('category').notNull(),
  categorybn: text('category_bn'),
  imageUrl: text('image_url'),
  stock: integer('stock').default(100),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  tags: text('tags'), // JSON string
  variants: jsonb('variants'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address').notNull(),
  items: text('items').notNull(), // JSON string
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  specialInstructions: text('special_instructions'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discount: integer('discount').notNull(),
  minOrder: integer('min_order').notNull(),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  orderId: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerAddress: z.string().min(1),
  totalAmount: z.number().min(0),
  finalAmount: z.number().min(0),
  items: z.array(z.any()).optional()
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
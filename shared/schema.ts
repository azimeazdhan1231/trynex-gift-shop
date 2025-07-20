
import { pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  namebn: varchar('name_bn', { length: 255 }),
  description: text('description'),
  descriptionbn: text('description_bn'),
  price: integer('price').notNull(), // Price in paisa
  category: varchar('category', { length: 100 }).notNull(),
  categorybn: varchar('category_bn', { length: 100 }),
  imageUrl: varchar('image_url', { length: 500 }),
  stock: integer('stock').default(100),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  tags: jsonb('tags').default([]),
  variants: jsonb('variants').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 50 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerAddress: text('customer_address').notNull(),
  deliveryLocation: varchar('delivery_location', { length: 255 }).default('dhaka'),
  paymentMethod: varchar('payment_method', { length: 100 }).default('cash_on_delivery'),
  specialInstructions: text('special_instructions'),
  promoCode: varchar('promo_code', { length: 50 }),
  subtotal: integer('subtotal').notNull().default(0),
  deliveryFee: integer('delivery_fee').default(6000),
  discountAmount: integer('discount_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 50 }).notNull(),
  productId: integer('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Promo codes table
export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountPercentage: integer('discount_percentage').notNull(),
  minOrderAmount: integer('min_order_amount').default(0),
  maxDiscountAmount: integer('max_discount_amount'),
  isActive: boolean('is_active').default(true),
  usageCount: integer('usage_count').default(0),
  maxUsage: integer('max_usage'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Zod schemas for validation
export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders, {
  orderId: z.string().min(1, "Order ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerAddress: z.string().min(1, "Customer address is required"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  orderId: z.string().min(1, "Order ID is required"),
  productId: z.number().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  totalPrice: z.number().min(0, "Total price cannot be negative"),
}).omit({
  id: true,
  createdAt: true
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes, {
  code: z.string().min(1, "Promo code is required"),
  discountPercentage: z.number().min(0).max(100, "Discount must be between 0-100%"),
  minOrderAmount: z.number().min(0, "Minimum order amount cannot be negative"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAdminUserSchema = createInsertSchema(adminUsers, {
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Type exports
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

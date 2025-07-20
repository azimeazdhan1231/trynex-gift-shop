import { pgTable, text, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Products table
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  namebn: text("name_bn").notNull(),
  description: text("description"),
  descriptionbn: text("description_bn"),
  price: integer("price").notNull(), // Price in paisa
  category: text("category").notNull(),
  categorybn: text("category_bn"),
  imageUrl: text("image_url"),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  tags: json("tags").$type<string[]>(),
  variants: text("variants"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Orders table
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address").notNull(),
  deliveryLocation: text("delivery_location"),
  paymentMethod: text("payment_method").default("cash_on_delivery"),
  specialInstructions: text("special_instructions"),
  promoCode: text("promo_code"),
  items: json("items").notNull().$type<Array<{
    id: number;
    name: string;
    namebn: string;
    price: number;
    quantity: number;
    variant?: any;
  }>>(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").default(0),
  discountAmount: integer("discount_amount").default(0),
  totalAmount: integer("total_amount").notNull(),
  finalAmount: integer("final_amount").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Promo codes table
export const promoCodes = pgTable("promo_codes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  code: text("code").notNull().unique(),
  discountPercentage: integer("discount_percentage").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Schemas
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export const insertPromoCodeSchema = createInsertSchema(promoCodes);
export const selectPromoCodeSchema = createSelectSchema(promoCodes);

// Types
export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = z.infer<typeof selectOrderSchema> & { total: number };
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type PromoCode = z.infer<typeof selectPromoCodeSchema>;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
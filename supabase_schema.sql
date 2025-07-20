
-- TryneX Gift Shop Database Schema
-- Clean setup for Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop all existing tables if they exist (clean slate)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255),
  description TEXT,
  description_bn TEXT,
  price INTEGER NOT NULL, -- Price in paisa (55000 paisa = 550 BDT)
  category VARCHAR(100) NOT NULL,
  category_bn VARCHAR(100),
  image_url VARCHAR(500),
  stock INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT NOT NULL,
  delivery_location VARCHAR(255) DEFAULT 'dhaka',
  payment_method VARCHAR(100) DEFAULT 'cash_on_delivery',
  special_instructions TEXT,
  promo_code VARCHAR(50),
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER DEFAULT 6000, -- 60 BDT in paisa
  discount_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- bcrypt hashed
  email VARCHAR(255),
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_expires_at ON promo_codes(expires_at);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password, email, full_name) VALUES 
('admin', '$2a$10$rZYlRQUzd1r8.5Q8gVZo6eK6xW9aG4qh7pU4p0nE.fH2qL5yS9nxO', 'admin@trynex.com', 'System Administrator');

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percentage, min_order_amount, max_discount_amount, is_active, expires_at) VALUES
('WELCOME10', 10, 50000, 10000, true, NOW() + INTERVAL '30 days'),
('FIRST20', 20, 100000, 20000, true, NOW() + INTERVAL '60 days'),
('SAVE15', 15, 75000, 15000, true, NOW() + INTERVAL '45 days'),
('NEWYEAR25', 25, 150000, 30000, true, NOW() + INTERVAL '90 days');

-- Insert sample products
INSERT INTO products (name, name_bn, description, description_bn, price, category, category_bn, image_url, stock, is_active, is_featured, tags, variants) VALUES
('Classic Ceramic Mug', 'ক্লাসিক সিরামিক মগ', 'Perfect for your morning coffee or tea with elegant design', 'আপনার সকালের কফি বা চায়ের জন্য মার্জিত ডিজাইনের আদর্শ মগ', 55000, 'mugs', 'মগ', 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80', 100, true, true, '["ceramic", "coffee", "tea", "kitchen"]'::jsonb, '{"colors": ["white", "black", "blue", "red"], "sizes": ["250ml", "350ml", "500ml"]}'::jsonb),

('Premium Cotton T-Shirt', 'প্রিমিয়াম কটন টি-শার্ট', 'Comfortable and stylish 100% cotton t-shirt for everyday wear', 'দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং স্টাইলিশ ১০০% কটন টি-শার্ট', 85000, 'tshirts', 'টি-শার্ট', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80', 150, true, true, '["cotton", "casual", "comfortable", "fashion"]'::jsonb, '{"sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["white", "black", "navy", "red", "gray"]}'::jsonb),

('Personalized Water Bottle', 'ব্যক্তিগতকৃত পানির বোতল', 'Eco-friendly stainless steel water bottle with custom engraving', 'কাস্টম খোদাই সহ পরিবেশ বান্ধব স্টেইনলেস স্টিল পানির বোতল', 75000, 'bottles', 'পানির বোতল', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80', 80, true, false, '["water", "custom", "eco-friendly", "steel"]'::jsonb, '{"colors": ["silver", "black", "blue", "green"], "sizes": ["500ml", "750ml", "1L"]}'::jsonb),

('Custom Photo Frame', 'কাস্টম ফটো ফ্রেম', 'Beautiful wooden photo frame with personalized engraving for memories', 'স্মৃতির জন্য ব্যক্তিগতকৃত খোদাই সহ সুন্দর কাঠের ফটো ফ্রেম', 95000, 'frames', 'ফ্রেম', 'https://images.unsplash.com/photo-1582045012394-78ebc24e7bca?auto=format&fit=crop&w=500&q=80', 60, true, true, '["wood", "custom", "photo", "memory"]'::jsonb, '{"sizes": ["4x6", "5x7", "8x10", "11x14"], "materials": ["oak", "pine", "mahogany", "bamboo"]}'::jsonb),

('Metal Keychain', 'ব্যক্তিগতকৃত চাবির চেইন', 'Durable metal keychain with custom text or logo engraving', 'কাস্টম টেক্সট বা লোগো খোদাই সহ টেকসই মেটাল চাবির চেইন', 35000, 'keychains', 'চাবির চেইন', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80', 200, true, false, '["metal", "custom", "keychain", "durable"]'::jsonb, '{"materials": ["stainless", "brass", "aluminum"], "shapes": ["round", "square", "heart", "rectangle"]}'::jsonb),

('Birthday Gift Package', 'জন্মদিনের গিফট প্যাকেজ', 'Complete birthday celebration package with decorations and accessories', 'সাজসজ্জা এবং আনুষাঙ্গিক সহ সম্পূর্ণ জন্মদিন উৎসব প্যাকেজ', 160000, 'gift-packages', 'গিফট প্যাকেজ', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80', 50, true, true, '["birthday", "celebration", "package", "decorations"]'::jsonb, '{"themes": ["colorful", "elegant", "kids", "adult"], "sizes": ["basic", "premium", "deluxe"]}'::jsonb),

('Couple Gift Set', 'রোমান্টিক কাপল গিফট সেট', 'Perfect romantic gift set for couples with matching items and accessories', 'ম্যাচিং আইটেম এবং আনুষাঙ্গিক সহ কাপলদের জন্য নিখুঁত রোমান্টিক গিফট সেট', 120000, 'couple', 'কাপলের জন্য', 'https://images.unsplash.com/photo-1549890762-1c0bb4fd425e?auto=format&fit=crop&w=500&q=80', 35, true, true, '["couple", "romantic", "gift", "matching"]'::jsonb, '{"themes": ["romantic", "cute", "elegant", "modern"], "occasions": ["anniversary", "valentine", "engagement"]}'::jsonb),

('Premium Gift Hamper', 'প্রিমিয়াম গিফট হ্যাম্পার', 'Luxury gift hamper with assorted premium items in elegant packaging', 'মার্জিত প্যাকেজিং এ বিভিন্ন প্রিমিয়াম আইটেম সহ বিলাসবহুল গিফট হ্যাম্পার', 250000, 'hampers', 'হ্যাম্পার', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=80', 25, true, true, '["luxury", "hamper", "premium", "assorted"]'::jsonb, '{"themes": ["corporate", "personal", "festival"], "sizes": ["small", "medium", "large", "xl"]}'::jsonb);

-- Enable Row Level Security (optional for public e-commerce)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions for public access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully! 🎉' as status;

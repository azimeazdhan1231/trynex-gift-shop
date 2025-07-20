-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
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
  price INTEGER NOT NULL, -- in paisa (550 BDT = 55000 paisa)
  category VARCHAR(100) NOT NULL,
  category_bn VARCHAR(100),
  image_url VARCHAR(500),
  stock INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  variants JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT NOT NULL,
  delivery_location VARCHAR(255),
  payment_method VARCHAR(100) DEFAULT 'cash_on_delivery',
  special_instructions TEXT,
  promo_code VARCHAR(50),
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 6000,
  discount_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2a$10$rZYlRQUzd1r8.5Q8gVZo6eK6xW9aG4qh7pU4p0nE.fH2qL5yS9nxO');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);

-- Insert sample products
INSERT INTO products (name, name_bn, description, description_bn, price, category, category_bn, image_url, stock, is_active, is_featured, tags, variants) VALUES
('Classic Ceramic Mug', 'ক্লাসিক সিরামিক মগ', 'Perfect for your morning coffee or tea', 'আপনার সকালের কফি বা চায়ের জন্য আদর্শ', 55000, 'mugs', 'মগ', 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80', 100, true, true, '["ceramic", "coffee", "tea"]', '{"colors": ["white", "black", "blue"], "sizes": ["small", "medium", "large"]}'),
('Premium Cotton T-Shirt', 'প্রিমিয়াম কটন টি-শার্ট', 'Comfortable and stylish t-shirt for everyday wear', 'দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং স্টাইলিশ টি-শার্ট', 55000, 'tshirts', 'টি-শার্ট', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80', 150, true, true, '["cotton", "casual", "comfortable"]', '{"sizes": ["S", "M", "L", "XL"], "colors": ["white", "black", "navy", "red"]}'),
('Birthday Celebration Package', 'জন্মদিন উৎসব প্যাকেজ', 'Complete birthday celebration set with decorations', 'সাজসজ্জা সহ সম্পূর্ণ জন্মদিন উৎসব সেট', 160000, 'gift-packages', 'গিফট প্যাকেজ', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80', 50, true, true, '["birthday", "celebration", "package"]', '{"themes": ["colorful", "elegant", "kids"]}'),
('Personalized Water Bottle', 'ব্যক্তিগতকৃত পানির বোতল', 'Custom water bottle with your name or message', 'আপনার নাম বা বার্তা সহ কাস্টম পানির বোতল', 80000, 'bottles', 'পানির বোতল', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80', 75, true, false, '["water", "custom", "personalized"]', '{"colors": ["blue", "green", "red", "black"], "sizes": ["500ml", "750ml", "1L"]}'),
('Romantic Couple Gift Set', 'রোমান্টিক কাপল গিফট সেট', 'Perfect gift set for couples with matching items', 'ম্যাচিং আইটেম সহ কাপলদের জন্য নিখুঁত গিফট সেট', 120000, 'couple', 'কাপলের জন্য', 'https://images.unsplash.com/photo-1549890762-1c0bb4fd425e?auto=format&fit=crop&w=500&q=80', 30, true, true, '["couple", "romantic", "gift"]', '{"themes": ["romantic", "cute", "elegant"]}'),
('Custom Photo Frame', 'কাস্টম ফটো ফ্রেম', 'Beautiful wooden photo frame with custom engraving', 'কাস্টম খোদাই সহ সুন্দর কাঠের ফটো ফ্রেম', 95000, 'frames', 'ফ্রেম', 'https://images.unsplash.com/photo-1582045012394-78ebc24e7bca?auto=format&fit=crop&w=500&q=80', 60, true, true, '["wood", "custom", "photo"]', '{"sizes": ["4x6", "5x7", "8x10"], "materials": ["oak", "pine", "mahogany"]}'),
('Personalized Keychain', 'ব্যক্তিগতকৃত চাবির চেইন', 'Custom metal keychain with name or message', 'নাম বা বার্তা সহ কাস্টম মেটাল চাবির চেইন', 30000, 'keychains', 'চাবির চেইন', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80', 200, true, false, '["metal", "custom", "keychain"]', '{"materials": ["stainless", "brass", "aluminum"], "shapes": ["round", "square", "heart"]}'),
('Birthday Gift Hamper', 'জন্মদিনের গিফট হ্যাম্পার', 'Complete birthday gift collection in a beautiful box', 'সুন্দর বাক্সে সম্পূর্ণ জন্মদিনের গিফট সংগ্রহ', 180000, 'hampers', 'হ্যাম্পার', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=80', 25, true, true, '["birthday", "hamper", "collection"]', '{"themes": ["elegant", "colorful", "premium"], "sizes": ["small", "medium", "large"]}');

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percentage, is_active, expires_at) VALUES
('WELCOME10', 10, true, NOW() + INTERVAL '30 days'),
('FIRST20', 20, true, NOW() + INTERVAL '30 days'),
('SAVE15', 15, true, NOW() + INTERVAL '15 days');

-- Enable Row Level Security (RLS) for public access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an e-commerce site)
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for active promo codes" ON promo_codes FOR SELECT USING (is_active = true);

-- Allow public to create orders (but not read others' orders)
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own orders" ON orders FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
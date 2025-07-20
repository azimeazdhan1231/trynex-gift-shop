
-- Complete database setup for TryneX E-commerce
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (be careful!)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
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
  tags JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
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

-- Insert sample products
INSERT INTO products (name, name_bn, description, description_bn, price, category, category_bn, image_url, stock, is_active, is_featured, tags, variants) VALUES
('Classic Ceramic Mug', 'ক্লাসিক সিরামিক মগ', 'Perfect for your morning coffee or tea', 'আপনার সকালের কফি বা চায়ের জন্য আদর্শ', 55000, 'mugs', 'মগ', 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=500&q=80', 100, true, true, '["ceramic", "coffee", "tea"]'::jsonb, '{"colors": ["white", "black", "blue"], "sizes": ["small", "medium", "large"]}'::jsonb),

('Premium Cotton T-Shirt', 'প্রিমিয়াম কটন টি-শার্ট', 'Comfortable and stylish t-shirt for everyday wear', 'দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং স্টাইলিশ টি-শার্ট', 55000, 'tshirts', 'টি-শার্ট', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80', 150, true, true, '["cotton", "casual", "comfortable"]'::jsonb, '{"sizes": ["S", "M", "L", "XL"], "colors": ["white", "black", "navy", "red"]}'::jsonb),

('Birthday Celebration Package', 'জন্মদিন উৎসব প্যাকেজ', 'Complete birthday celebration set with decorations', 'সাজসজ্জা সহ সম্পূর্ণ জন্মদিন উৎসব সেট', 180000, 'packages', 'প্যাকেজ', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=500&q=80', 25, true, true, '["birthday", "celebration", "package"]'::jsonb, '{"themes": ["elegant", "colorful", "premium"], "sizes": ["small", "medium", "large"]}'::jsonb),

('Personalized Keychain', 'ব্যক্তিগতকৃত চাবির চেইন', 'Custom keychain with your name or message', 'আপনার নাম বা বার্তা সহ কাস্টম কীচেইন', 30000, 'keychains', 'চাবির চেইন', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80', 200, true, false, '["personalized", "custom", "gift"]'::jsonb, '{"materials": ["metal", "leather", "plastic"]}'::jsonb),

('Elegant Wall Clock', 'মার্জিত দেয়াল ঘড়ি', 'Modern wall clock to enhance your home decor', 'আপনার ঘরের সাজসজ্জা বাড়ানোর জন্য আধুনিক দেয়াল ঘড়ি', 120000, 'decor', 'সাজসজ্জা', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=500&q=80', 50, true, true, '["wall", "clock", "modern", "decor"]'::jsonb, '{"styles": ["minimalist", "vintage", "modern"], "colors": ["black", "white", "wood"]}'::jsonb),

('Premium Notebook Set', 'প্রিমিয়াম নোটবুক সেট', 'High-quality notebook set for office and personal use', 'অফিস এবং ব্যক্তিগত ব্যবহারের জন্য উচ্চ মানের নোটবুক সেট', 75000, 'stationery', 'স্টেশনারি', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80', 80, true, false, '["notebook", "stationery", "office"]'::jsonb, '{"sizes": ["A4", "A5", "pocket"], "colors": ["black", "brown", "blue"]}'::jsonb),

('Luxury Gift Box', 'লাক্সারি গিফট বক্স', 'Elegant gift box perfect for special occasions', 'বিশেষ অনুষ্ঠানের জন্য আদর্শ মার্জিত গিফট বক্স', 95000, 'gifts', 'উপহার', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80', 30, true, true, '["luxury", "gift", "premium"]'::jsonb, '{"sizes": ["small", "medium", "large"], "themes": ["wedding", "birthday", "anniversary"]}'::jsonb),

('Custom Photo Frame', 'কাস্টম ফটো ফ্রেম', 'Personalized photo frame for your precious memories', 'আপনার মূল্যবান স্মৃতির জন্য ব্যক্তিগতকৃত ফটো ফ্রেম', 65000, 'frames', 'ফ্রেম', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=500&q=80', 75, true, false, '["photo", "frame", "custom", "memory"]'::jsonb, '{"sizes": ["4x6", "5x7", "8x10"], "materials": ["wood", "metal", "acrylic"]}'::jsonb);

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percentage, is_active, expires_at) VALUES
('WELCOME10', 10, true, NOW() + INTERVAL '30 days'),
('FIRST20', 20, true, NOW() + INTERVAL '45 days'),
('SAVE15', 15, true, NOW() + INTERVAL '60 days'),
('NEWUSER25', 25, true, NOW() + INTERVAL '30 days'),
('SPECIAL30', 30, true, NOW() + INTERVAL '15 days'),
('STUDENT15', 15, true, NOW() + INTERVAL '90 days');

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password, email) VALUES
('admin', '$2b$10$8K1p/a0drtLzaIU1VfVfsOJHu/MZ3nqKCtqt7K6n9/QQPdTKhK.Vm', 'admin@trynex.com');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);

-- Success message
SELECT 'Database setup completed successfully! ✅' as result;

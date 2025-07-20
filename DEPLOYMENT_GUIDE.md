
# Deployment Guide - TryneX Lifestyle E-Commerce

## Tech Stack
- **Frontend**: HTML + CSS + JS (React compiled to static files)
- **Backend**: Node.js + Express (Lightweight API)
- **Database**: Supabase (Free, secure, real-time PostgreSQL)
- **Hosting**: Netlify (Frontend) + Render (Backend) - Free combo

---

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Choose organization and name your project (e.g., "trynex-ecommerce")
4. Set database password (save this!)
5. Choose region closest to your users
6. Wait for project to be ready (2-3 minutes)

### 1.2 Get Database Connection String
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** under "Connection parameters"
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. Save this connection string - you'll need it for both local development and deployment

Example connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.wifsqonbnfmwtqvupqbk.supabase.co:5432/postgres
```

### 1.3 Setup Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query and run this SQL to create your tables:

```sql
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
  tags TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_email VARCHAR(255),
  delivery_location VARCHAR(255),
  payment_method VARCHAR(100),
  special_instructions TEXT,
  promo_code VARCHAR(50),
  total_amount INTEGER NOT NULL, -- in paisa
  discount_amount INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  final_amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(20) REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- in paisa
  total INTEGER NOT NULL -- quantity * price
);

-- Create promo_codes table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount INTEGER NOT NULL, -- percentage (e.g., 10 = 10%)
  min_order INTEGER DEFAULT 0, -- minimum order amount in paisa
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- bcrypt hashed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2a$10$rZYlRQUz7ZKy.OhVOV3Lp.d7CyGhqYpY9wgCjKzBkjKa6lXZQa5YO');
```

3. Click "Run" to execute the SQL

---

## Step 2: Local Development Setup

### 2.1 Configure Environment Variables
1. In your project, copy `.env.example` to `.env`
2. Update with your Supabase connection string:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.wifsqonbnfmwtqvupqbk.supabase.co:5432/postgres

# Development
NODE_ENV=development
PORT=5000

# Production API URL (update this after backend deployment)
VITE_API_URL=http://localhost:5000
```

### 2.2 Test Database Connection
1. Run the seeding script to add sample products:

```bash
npx tsx server/seed.ts
```

2. If successful, you'll see:
```
🌱 Seeding database...
✅ Database seeded successfully!
🔑 Admin credentials: username: admin, password: admin123
```

---

## Step 3: Backend Deployment (Render)

### 3.1 Prepare for Render
1. Make sure your code is pushed to GitHub
2. Ensure all build dependencies are in the dependencies section (already fixed)
3. Your `package.json` should have these scripts:
```json
{
  "scripts": {
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### 3.2 Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `trynex-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### 3.3 Add Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.wifsqonbnfmwtqvupqbk.supabase.co:5432/postgres
```

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your backend will be available at: `https://trynex-backend.onrender.com`
4. Test it: Visit `https://trynex-backend.onrender.com/api/products`

---

## Step 4: Frontend Deployment (Netlify)

### 4.1 Update API URL
1. Update your `.env` file:
```env
VITE_API_URL=https://trynex-backend.onrender.com
```

2. Build your frontend:
```bash
npm run build
```

### 4.2 Deploy to Netlify

**Option A: Drag & Drop (Quickest)**
1. Go to [netlify.com](https://netlify.com)
2. Drag your `dist` folder to the deploy area
3. Your site will be live instantly!

**Option B: GitHub Integration (Recommended)**
1. Go to [netlify.com](https://netlify.com) and login
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**: 
     ```
     VITE_API_URL=https://trynex-backend.onrender.com
     ```

### 4.3 Configure Domain (Optional)
1. In Netlify dashboard, go to "Domain settings"
2. You can use the free `.netlify.app` domain or add custom domain

---

## Step 5: Test Your Live Website

### 5.1 Verify Everything Works
1. **Frontend**: Visit your Netlify URL
2. **Products**: Check if products are loading
3. **Cart**: Add products to cart
4. **Admin**: Go to `/admin` and login with `admin` / `admin123`
5. **Orders**: Place a test order
6. **Admin Panel**: Check if orders appear in admin panel

### 5.2 Admin Panel Access
- URL: `https://your-site.netlify.app/admin`
- Username: `admin`
- Password: `admin123`

---

## Step 6: Post-Deployment Configuration

### 6.1 Add More Products
1. Login to admin panel
2. Go to "Products" tab
3. Click "Add Product"
4. Fill in product details with both English and Bengali names
5. Use Unsplash URLs for images

### 6.2 Configure Promo Codes
1. In admin panel, go to "Promo Codes"
2. Create promo codes like:
   - `WELCOME10` - 10% off
   - `FIRST20` - 20% off first order

### 6.3 Monitor Performance
- **Backend**: Check Render dashboard for performance
- **Frontend**: Netlify provides analytics
- **Database**: Monitor usage in Supabase dashboard

---

## Step 7: Real-time Updates

✅ **Your website is now live with real-time capabilities!**

- **Add products** → Instantly visible on website
- **Update prices** → Changes reflect immediately  
- **Manage orders** → Real-time order tracking
- **Update stock** → Live inventory management

### Free Tier Limits
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Render**: 750 hours/month (sleeps after 15 min inactivity)
- **Netlify**: 100GB bandwidth, 300 build minutes/month

---

## Troubleshooting

### Backend Issues
- Check Render deployment logs
- Verify DATABASE_URL is correct
- Test API endpoints directly

### Frontend Issues  
- Check browser console for errors
- Verify VITE_API_URL points to your Render backend
- Rebuild and redeploy if needed

### Database Issues
- Verify connection string in Supabase
- Check if tables exist in SQL Editor
- Test database connection locally first

---

## 🎉 Congratulations!

Your TryneX Lifestyle e-commerce website is now live with:
- ✅ Real-time product management
- ✅ Live order processing  
- ✅ Admin panel for content management
- ✅ Mobile-responsive design
- ✅ Bengali + English support
- ✅ Free hosting with professional URLs

**Frontend**: https://your-site.netlify.app  
**Backend API**: https://trynex-backend.onrender.com  
**Admin Panel**: https://your-site.netlify.app/admin

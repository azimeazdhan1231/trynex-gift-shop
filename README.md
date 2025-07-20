# TryneX Gift Shop - E-Commerce Platform

A modern, full-stack e-commerce platform for lifestyle products with multi-language support (English/Bengali).

## 🚀 Live Demo

- **Frontend**: Deployed on Netlify
- **Backend API**: https://trynex-gift-shop-1.onrender.com
- **Admin Panel**: `/admin` (username: `admin`, password: `admin123`)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand + TanStack Query
- **Build Tool**: Vite

## 📁 Project Structure

```
├── client/             # React frontend
├── server/             # Express backend
├── shared/             # Shared schemas and types
├── dist/               # Build output
├── DEPLOYMENT_CHECKLIST.md  # Step-by-step deployment guide
└── package.json        # Dependencies and scripts
```

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone [your-repo-url]
   cd trynex-gift-shop
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update .env with your Supabase credentials
   ```

3. **Initialize Database**
   ```bash
   npm run seed
   ```

4. **Development**
   ```bash
   npm run dev
   ```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only
- `npm run start` - Start production server
- `npm run seed` - Initialize database with sample data

## 🌐 Deployment

This project is configured for free deployment using:
- **Frontend**: Netlify
- **Backend**: Render  
- **Database**: Supabase

Follow the `DEPLOYMENT_CHECKLIST.md` for detailed deployment instructions.

## 🔑 Admin Access

- URL: `/admin`
- Username: `admin`
- Password: `admin123`

## 📄 License

MIT License
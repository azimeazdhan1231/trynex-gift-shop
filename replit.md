# E-Commerce Platform - TryneX Lifestyle

## Overview

This is a full-stack e-commerce platform built for selling lifestyle products (mugs, t-shirts, keychains, etc.) with a focus on the Bangladeshi market. The application features a modern React frontend with TypeScript, an Express.js backend, and uses PostgreSQL with Drizzle ORM for data management. The platform includes comprehensive shopping cart functionality, order management, admin panel, and multi-language support (English/Bengali).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 20, 2025 - Deployment Fixes
- Fixed deployment issues for Render hosting platform
- Moved build dependencies (autoprefixer, postcss, tailwindcss, drizzle-kit) from devDependencies to dependencies
- Updated build scripts for proper frontend/backend separation
- Created deployment configuration files:
  - `render.yaml` for backend deployment
  - `netlify.toml` for frontend deployment
  - `.env.example` for environment setup
- Added comprehensive deployment guide in `DEPLOYMENT_CHECKLIST.md`
- Fixed PostCSS configuration issues that were causing build failures

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for cart state management
- **Routing**: Wouter for client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure
- **Middleware**: Custom logging, JSON parsing, error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Type-safe database schemas with Zod validation

## Key Components

### Frontend Components
1. **Layout Components**
   - Header with navigation, search, and cart toggle
   - Footer with company info and links
   - Hero slider for promotional content

2. **Product Components**
   - Product cards with cart functionality
   - Category grid for product browsing
   - Product filtering and search

3. **E-commerce Features**
   - Shopping cart modal with quantity management
   - Order tracking system
   - Admin panel for product and order management

4. **UI Components**
   - Complete shadcn/ui component library
   - Custom styled components with Tailwind
   - Responsive design for mobile and desktop

### Backend Components
1. **API Routes**
   - Products CRUD operations
   - Orders management
   - Promo codes system
   - Admin functionality

2. **Storage Layer**
   - Database abstraction with TypeScript interfaces
   - Product, order, and promo code operations
   - Admin user management

3. **Development Tools**
   - Vite integration for development
   - Hot module replacement
   - Error handling and logging

## Data Flow

### Product Management
1. Admin creates/updates products through admin panel
2. Products stored in PostgreSQL with multilingual support
3. Frontend fetches products via REST API
4. Products displayed with filtering, search, and categorization

### Shopping Experience
1. Users browse products and add to cart (Zustand store)
2. Cart persisted in local storage
3. Checkout process collects customer information
4. Order submitted to backend with unique order ID generation
5. Order stored in database with status tracking

### Order Processing
1. Orders created with unique TXR-format IDs
2. Admin can view and update order status
3. Customers can track orders using order ID
4. Real-time status updates through admin panel

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand with persistence
- **HTTP Client**: Native fetch with TanStack Query
- **Routing**: Wouter (lightweight router)
- **Form Handling**: React Hook Form with Zod validation

### Backend Dependencies
- **Server**: Express.js with TypeScript
- **Database**: Drizzle ORM with Neon PostgreSQL
- **Validation**: Zod schemas
- **Development**: tsx for TypeScript execution

### Build Tools
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for production bundling
- **Development**: Hot reload with Vite middleware

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx with file watching for auto-restart
- **Database**: Neon PostgreSQL serverless database
- **Environment**: Replit-optimized with custom plugins

### Production Build
- **Frontend**: Static build output to `dist/public`
- **Backend**: Bundled with esbuild to `dist/index.js`
- **Database**: Production PostgreSQL with connection pooling
- **Deployment**: Express serves both API and static files

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Seeding**: Manual data initialization through admin panel
- **Backup**: Managed through hosting provider

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared types and schemas
2. **Type Safety**: End-to-end TypeScript with shared schema validation
3. **Modern Stack**: React 18, Express, and PostgreSQL for reliability
4. **Responsive Design**: Mobile-first approach with Tailwind CSS
5. **Internationalization**: Built-in Bengali/English support for local market
6. **State Management**: Client-side cart state with server-side order persistence
7. **API Design**: RESTful endpoints with consistent error handling
8. **Development Experience**: Hot reload, TypeScript, and modern tooling
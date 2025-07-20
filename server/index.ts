
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add CORS headers for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const port = parseInt(process.env.PORT ?? "5000", 10);
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  try {
    console.log("🚀 Starting server...");

    // Test database connection
    console.log("🔗 Testing Supabase database connection...");
    try {
      const testProducts = await storage.getProducts();
      console.log(`✅ Supabase connected! Found ${testProducts.length} products`);
    } catch (dbError) {
      console.log("⚠️ Database connection test failed, but continuing...", dbError);
    }

    // Register routes
    const server = await registerRoutes(app);

    if (isProduction) {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }

    server.listen(port, "0.0.0.0", () => {
      const formattedTime = new Date().toLocaleString();
      console.log(`✅ Server running on http://0.0.0.0:${port} at ${formattedTime}`);
      console.log(`🌐 External access: https://trynex-backend-32fp.onrender.com`);
      if (!isProduction) {
        console.log(`🔧 Development mode - Vite dev server active`);
      }
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

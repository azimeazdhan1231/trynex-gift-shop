import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import { testConnection } from "./storage";
import { seedDatabase } from "./seed";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();
const server: Server = createServer(app);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://trynex-gift-shop.netlify.app',
    'https://trynex-backend-32fp.onrender.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
await registerRoutes(app);

// Serve static files
const clientPath = resolve(__dirname, "../client");
app.use(express.static(join(clientPath, "dist")));

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log("🚀 Starting server...");

  // Setup Vite in development mode
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
    console.log("🔧 Development mode - Vite dev server active");
  }

  // Test database connection and seed if needed
  console.log("🔗 Testing database connection...");
  try {
    const connected = await testConnection();

    if (connected) {
      // Check if we need to seed
      const { getProducts } = await import("./storage");
      const products = await getProducts({ limit: 1 });

      if (products.length === 0) {
        console.log("🌱 Database appears empty, seeding with sample data...");
        await seedDatabase();
      }
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }

  // Start the server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 CORS enabled for: trynex-gift-shop.netlify.app`);
    console.log(`🔄 NODE_ENV: ${process.env.NODE_ENV}`);
  });
}

startServer().catch(console.error);
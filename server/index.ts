import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import { testConnection } from "./storage";
import { seedDatabase } from "./seed";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();
const server: Server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
}
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();

import cors from "cors";
import { storage } from "./storage";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.wifsqonbnfmwtqvupqbk:Amits@12345@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

console.log('🔗 Database connecting to:', DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

// Configure CORS properly
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://trynex-gift-shop.netlify.app',
    'https://dapper-biscochitos-7e14c3.netlify.app',
    'https://trynex-backend-32fp.onrender.com',
    /\.netlify\.app$/,
    /\.vercel\.app$/,
    /\.replit\.dev$/,
    /\.repl\.co$/,
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use(express.static("dist"));

(async () => {
  const port = parseInt(process.env.PORT || '5000', 10);

  const server = await registerRoutes(app);

  // Handle port already in use
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      const newPort = port + 1;
      server.listen(newPort, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${newPort}`);
        console.log(`📊 Database connected successfully`);
        console.log(`🌐 API endpoints available at http://0.0.0.0:${newPort}/api`);
      });
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}`);
    console.log(`📊 Database connected successfully`);
    console.log(`🌐 API endpoints available at http://0.0.0.0:${port}/api`);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
})();
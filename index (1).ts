import express from 'express';
import cors from "cors";
import { registerRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting TryneX Backend Server...');
console.log('🔗 Database: Supabase PostgreSQL');
console.log('🌐 CORS: Configured for all origins');

// CORS configuration - Allow all origins for now
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Register routes and start server
async function startServer() {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('❌ Unhandled error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Handle 404
    app.use('*', (req, res) => {
      console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ error: 'Route not found' });
    });

    // Handle port conflicts
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${parseInt(PORT) + 1}...`);
        const newPort = parseInt(PORT) + 1;
        server.listen(newPort, '0.0.0.0', () => {
          console.log(`🚀 Server running on port ${newPort}`);
          console.log(`📡 API available at http://0.0.0.0:${newPort}/api`);
          console.log(`🔗 Health check: http://0.0.0.0:${newPort}/api/health`);
          console.log(`🔗 Test DB: http://0.0.0.0:${newPort}/api/test-db`);
          console.log(`🔗 Products: http://0.0.0.0:${newPort}/api/products`);
        });
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

    // Start the server on 0.0.0.0 for external access
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`🔗 Test DB: http://0.0.0.0:${PORT}/api/test-db`);
      console.log(`🔗 Products: http://0.0.0.0:${PORT}/api/products`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
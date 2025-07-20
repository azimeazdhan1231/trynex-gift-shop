
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://trynex-gift-shop.netlify.app',
    'https://main--trynex-gift-shop.netlify.app',
    /^https:\/\/deploy-preview-\d+--trynex-gift-shop\.netlify\.app$/,
    /^https:\/\/.*--trynex-gift-shop\.netlify\.app$/,
    /^https:\/\/.*\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ]
}));

// Additional middleware for better handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Register routes and start server
async function startServer() {
  try {
    console.log('Registering routes...');
    const server = await registerRoutes(app);
    
    console.log('Routes registered successfully');
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
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

    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

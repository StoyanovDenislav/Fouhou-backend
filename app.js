const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: true, // Allow all origins for API
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')} - User-Agent: ${req.get('User-Agent')}`);
  next();
});

// Import and use API routes
const scoreRoutes = require('./api/scoreAPI');
app.use('/api', scoreRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Game Scores API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    protocol: req.protocol,
    host: req.get('host'),
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Server configuration
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 9000;

let server;

if (isDev) {
  // Use HTTP for development
  console.log("🔧 Starting Game Scores API server in DEVELOPMENT mode (HTTP)");
  server = http.createServer(app);
} else {
  // Use HTTPS for production
  console.log("🔒 Starting Game Scores API server in PRODUCTION mode (HTTPS)");
  try {
    // Load SSL certificates
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || "./certs/privkey.pem"),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || "./certs/fullchain.pem"),
    };
    
    console.log("✅ SSL certificates loaded successfully");
    server = https.createServer(sslOptions, app);
  } catch (error) {
    console.error("❌ Error loading SSL certificates:", error.message);
    console.error("💡 Make sure your certificate paths are correct in .env file");
    console.error("💡 Falling back to HTTP mode for safety");
    server = http.createServer(app);
  }
}

// Start server
server.listen(PORT, () => {
  const protocol = isDev ? 'http' : 'https';
  const host = process.env.HOST || 'localhost';
  
  console.log(`🚀 Game Scores API server running on port ${PORT} in ${isDev ? 'development' : 'production'} mode`);
  console.log(`📊 Health check: ${protocol}://${host}:${PORT}/api/health`);
  console.log(`🌐 Root endpoint: ${protocol}://${host}:${PORT}/`);
  console.log(`📈 Scores API: ${protocol}://${host}:${PORT}/api/scores`);
  console.log(`🔧 Test DB: ${protocol}://${host}:${PORT}/api/test-db`);
  
  if (!isDev) {
    console.log(`🌍 Public HTTPS URL: https://api.fouhou.stoyanography.com:${PORT}/`);
  }
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Game Scores API server gracefully terminated');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forcing exit after 10 seconds...');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
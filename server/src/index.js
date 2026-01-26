/**
 * Server entry point.
 * Starts the Express server and handles graceful shutdown.
 */

import app from './app.js';
import config from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// Initialize database connection
try {
  await connectDatabase();
} catch (error) {
  // In development, continue without database
  if (config.env !== 'development') {
    throw error;
  }
}

const server = app.listen(config.port, () => {
  console.log(`
  ┌───────────────────────────────────────────────┐
  │                                               │
  │   🚀  Radius API Server                       │
  │                                               │
  │   Environment: ${config.env.padEnd(28)}│
  │   Port:        ${String(config.port).padEnd(28)}│
  │   Health:      http://localhost:${config.port}/api/${config.apiVersion}/health  │
  │                                               │
  └───────────────────────────────────────────────┘
  `);
});

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    // Close database connection
    await disconnectDatabase();
    
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

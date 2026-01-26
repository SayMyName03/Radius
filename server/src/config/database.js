/**
 * MongoDB Database Connection
 * Handles connection lifecycle and error handling
 */

import mongoose from 'mongoose';
import config from './index.js';

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
export const connectDatabase = async () => {
  try {
    // Mongoose connection options
    const options = {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      
      // SSL/TLS settings
      tls: true,
      tlsAllowInvalidCertificates: false,
      
      // Automatically handle reconnection
      autoIndex: config.isDevelopment, // Only build indexes in development
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(config.mongodbUri, options);

    console.log(`
  ┌───────────────────────────────────────────────┐
  │   ✓  MongoDB Connected                        │
  │   Host: ${conn.connection.host.padEnd(31)}│
  │   DB:   ${conn.connection.name.padEnd(31)}│
  └───────────────────────────────────────────────┘
    `);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully.');
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    
    // In development, warn but don't crash
    if (config.isDevelopment) {
      console.warn('\n⚠️  Running in DEVELOPMENT mode WITHOUT database connection');
      console.warn('   Some features may not work. To fix:');
      console.warn('   1. Install MongoDB locally, OR');
      console.warn('   2. Whitelist your IP in MongoDB Atlas\n');
      return; // Continue without database
    }
    
    // Exit process with failure in production
    if (config.isProduction) {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Get connection status
 * @returns {String}
 */
export const getConnectionStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState];
};

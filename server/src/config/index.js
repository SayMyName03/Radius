/**
 * Centralized configuration module.
 * All environment variables are validated and exported from here.
 */

import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  // API
  apiVersion: process.env.API_VERSION || 'v1',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/radius',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-dev-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Gemini / LLM
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Feature flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;

/**
 * Express application configuration.
 * Middleware, routes, and error handlers are configured here.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import config from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import { configureGoogleStrategy } from './config/passport.js';

const app = express();

// ─────────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────────
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// ─────────────────────────────────────────────────────────────
// Request Parsing
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Parse cookies

// ─────────────────────────────────────────────────────────────
// Authentication Setup
// ─────────────────────────────────────────────────────────────
app.use(passport.initialize());
configureGoogleStrategy(); // Configure Google OAuth

// ─────────────────────────────────────────────────────────────
// Logging (development only)
// ─────────────────────────────────────────────────────────────
if (config.isDevelopment) {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use(`/api/${config.apiVersion}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Radius API',
    version: config.apiVersion,
    docs: `/api/${config.apiVersion}/health`,
  });
});

// ─────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

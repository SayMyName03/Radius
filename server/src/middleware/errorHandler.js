/**
 * Centralized error handling middleware.
 * Catches all errors and returns a consistent JSON response.
 */

import config from '../config/index.js';

const errorHandler = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development: send full error details
  if (config.isDevelopment) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production: send sanitized error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown errors: don't leak details
  console.error('ERROR 💥:', err);
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

export default errorHandler;

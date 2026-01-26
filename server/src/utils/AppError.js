/**
 * Custom application error class.
 * Extends the native Error with HTTP status codes and operational flags.
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

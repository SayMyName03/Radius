/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 * 
 * Purpose:
 * - Verify user is authenticated before accessing protected routes
 * - Extract user information from JWT
 * - Attach user to request object for use in controllers
 * 
 * Usage in routes:
 *   router.get('/protected-route', protect, controller);
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token is valid and not expired
 * 3. Look up user in database
 * 4. Attach user to req.user
 * 5. Continue to next middleware/controller
 */

import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { verifyToken, extractTokenFromHeader } from '../utils/jwtUtils.js';

/**
 * Protect middleware - Verify user is authenticated
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * What it does:
 * - Checks for valid JWT token
 * - Verifies token hasn't expired
 * - Loads user from database
 * - Attaches user to req.user
 * 
 * If authentication fails:
 * - Returns 401 Unauthorized error
 * - Does not proceed to next middleware
 */
export const protect = async (req, res, next) => {
  try {
    // Step 1: Extract token from Authorization header
    // Expected format: "Authorization: Bearer <token>"
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new AppError('No token provided. Please log in to access this resource.', 401);
    }

    // Step 2: Verify token is valid and decode payload
    // This will throw an error if token is invalid or expired
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      throw new AppError(`Authentication failed: ${error.message}`, 401);
    }

    // Step 3: Look up user in database
    // We need to verify the user still exists and is active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User no longer exists. Please log in again.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // Step 4: Attach user to request object
    // Now any route handler can access req.user
    req.user = user;

    // Step 5: Continue to next middleware or route handler
    next();
  } catch (error) {
    // Pass error to error handling middleware
    next(error);
  }
};

/**
 * Optional auth middleware - Attach user if token exists, but don't require it
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Use case:
 * - Routes that work for both authenticated and unauthenticated users
 * - Example: Public content with extra features for logged-in users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    // If no token, just continue without user
    if (!token) {
      return next();
    }

    // Try to verify token and load user
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors in optional auth
      console.warn('Optional auth - invalid token:', error.message);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict to specific auth providers
 * 
 * @param  {...string} providers - Allowed providers ('local', 'google')
 * @returns {Function} - Middleware function
 * 
 * Usage:
 *   router.put('/password', protect, restrictTo('local'), changePassword);
 * 
 * Why:
 * - Some operations only make sense for certain auth types
 * - Example: Changing password only works for local auth users
 */
export const restrictTo = (...providers) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource', 401));
    }

    if (!providers.includes(req.user.authProvider)) {
      return next(
        new AppError(
          `This operation is only available for ${providers.join(' or ')} authentication`,
          403
        )
      );
    }

    next();
  };
};

export default {
  protect,
  optionalAuth,
  restrictTo,
};

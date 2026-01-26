/**
 * Authentication Controller
 * Handles all authentication-related HTTP requests
 * 
 * Endpoints:
 * - POST /auth/register - Create new local account
 * - POST /auth/login - Login with email/password
 * - GET /auth/google - Initiate Google OAuth
 * - GET /auth/google/callback - Handle Google OAuth callback
 * - GET /auth/me - Get current user info
 * 
 * Security principles applied:
 * - Input validation
 * - Password hashing (in User model)
 * - JWT tokens (stateless auth)
 * - Error messages don't leak information
 */

import { validationResult } from 'express-validator';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { generateTokenResponse } from '../utils/jwtUtils.js';

/**
 * Register new user with email and password
 * POST /api/v1/auth/register
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} req.body.name - User's full name
 * 
 * Flow:
 * 1. Validate input
 * 2. Check if email already exists
 * 3. Create user (password automatically hashed in model)
 * 4. Generate JWT
 * 5. Return token and user info
 */
export const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`,
        400
      );
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Create new user
    // Password will be automatically hashed in User model pre-save hook
    const user = await User.create({
      email,
      password,
      name,
      authProvider: 'local',
    });

    console.log(`[Auth] New user registered: ${user.email}`);

    // Generate JWT and prepare response
    const tokenResponse = generateTokenResponse(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: tokenResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login with email and password
 * POST /api/v1/auth/login
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * 
 * Flow:
 * 1. Validate input
 * 2. Find user by email
 * 3. Check password matches (using bcrypt)
 * 4. Generate JWT
 * 5. Return token and user info
 * 
 * Security notes:
 * - Don't reveal whether email or password was wrong
 * - Use generic error message
 * - Prevents email enumeration attacks
 */
export const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`,
        400
      );
    }

    const { email, password } = req.body;

    // Find user and include password field
    // (password is excluded by default in User model)
    const user = await User.findOne({ email }).select('+password');

    // If user doesn't exist or password is wrong, return generic error
    // Why generic? Prevents attackers from knowing which emails exist
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is using Google OAuth
    if (user.authProvider === 'google' && !user.password) {
      throw new AppError(
        'This account uses Google login. Please sign in with Google.',
        401
      );
    }

    // Compare password using bcrypt
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    console.log(`[Auth] User logged in: ${user.email}`);

    // Generate JWT and prepare response
    const tokenResponse = generateTokenResponse(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: tokenResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle successful Google OAuth callback
 * GET /api/v1/auth/google/callback
 * 
 * Called by Passport after Google authentication succeeds
 * User is already authenticated and attached to req.user by Passport
 * 
 * Flow:
 * 1. Passport handles OAuth with Google
 * 2. User is attached to req.user
 * 3. Generate JWT
 * 4. Redirect to frontend with token
 * 
 * Why redirect instead of JSON response?
 * - OAuth callback is a browser redirect from Google
 * - Can't return JSON in a redirect
 * - Send token as URL parameter for frontend to grab
 */
export const googleCallback = async (req, res, next) => {
  try {
    // User should be attached by Passport middleware
    if (!req.user) {
      throw new AppError('Google authentication failed', 401);
    }

    const user = req.user;

    console.log(`[Auth] Google OAuth callback for user: ${user.email}`);

    // Generate JWT
    const tokenResponse = generateTokenResponse(user);

    // Redirect to frontend with token
    // Frontend will:
    // 1. Extract token from URL
    // 2. Store in memory/secure storage
    // 3. Use for authenticated requests
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${tokenResponse.token}`;

    res.redirect(redirectUrl);
  } catch (error) {
    // Redirect to frontend with error
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const errorUrl = `${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
  }
};

/**
 * Get current user info
 * GET /api/v1/auth/me
 * 
 * Protected route - requires valid JWT
 * User is attached to req.user by protect middleware
 * 
 * Use cases:
 * - Check if user is still logged in
 * - Get fresh user data
 * - Verify token is still valid
 */
export const getMe = async (req, res, next) => {
  try {
    // User should be attached by protect middleware
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          avatar: req.user.avatar,
          authProvider: req.user.authProvider,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (client-side operation with JWT)
 * POST /api/v1/auth/logout
 * 
 * Note: With JWT, logout is primarily client-side
 * - Client removes token from storage
 * - No server-side session to destroy
 * 
 * This endpoint exists for:
 * - Consistency with traditional auth
 * - Future server-side logout logic (token blacklist, etc.)
 * - Logging/analytics
 */
export const logout = async (req, res, next) => {
  try {
    // With JWT, actual logout happens on client side
    // This endpoint is mainly for logging/consistency

    if (req.user) {
      console.log(`[Auth] User logged out: ${req.user.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  googleCallback,
  getMe,
  logout,
};

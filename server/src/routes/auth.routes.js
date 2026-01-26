/**
 * Authentication Routes
 * Define all auth-related endpoints
 * 
 * Routes:
 * - POST /api/v1/auth/register - Local registration
 * - POST /api/v1/auth/login - Local login
 * - GET /api/v1/auth/google - Initiate Google OAuth
 * - GET /api/v1/auth/google/callback - Google OAuth callback
 * - GET /api/v1/auth/me - Get current user (protected)
 * - POST /api/v1/auth/logout - Logout (protected)
 * 
 * Validation:
 * - Uses express-validator for input validation
 * - Validates before reaching controller
 * - Returns clear error messages
 */

import express from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Validation rules for registration
 * 
 * Checks:
 * - Email is valid format
 * - Email is not empty
 * - Password is at least 6 characters
 * - Name is provided and reasonable length
 */
const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];

/**
 * Validation rules for login
 * 
 * Checks:
 * - Email is provided and valid format
 * - Password is provided
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * POST /api/v1/auth/register
 * Register new user with email and password
 * 
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword",
 *   "name": "John Doe"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Registration successful",
 *   "data": {
 *     "token": "jwt_token_here",
 *     "user": { ... }
 *   }
 * }
 */
router.post('/register', registerValidation, authController.register);

/**
 * POST /api/v1/auth/login
 * Login with email and password
 * 
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "token": "jwt_token_here",
 *     "user": { ... }
 *   }
 * }
 */
router.post('/login', loginValidation, authController.login);

/**
 * GET /api/v1/auth/google
 * Initiate Google OAuth flow
 * 
 * What happens:
 * 1. User clicks "Sign in with Google" on frontend
 * 2. Frontend redirects to this endpoint
 * 3. Passport redirects to Google's login page
 * 4. User authorizes on Google
 * 5. Google redirects to /auth/google/callback
 * 
 * Scopes requested:
 * - profile: Basic profile info (name, photo)
 * - email: User's email address
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false, // We're using JWT, not sessions
  })
);

/**
 * GET /api/v1/auth/google/callback
 * Google OAuth callback endpoint
 * 
 * What happens:
 * 1. Google redirects here after user authorizes
 * 2. Passport exchanges code for user profile
 * 3. Find or create user in database
 * 4. Generate JWT
 * 5. Redirect to frontend with token
 * 
 * This URL must be registered in Google Cloud Console
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
  }),
  authController.googleCallback
);

/**
 * GET /api/v1/auth/me
 * Get current user information
 * 
 * Protected route - requires JWT in Authorization header
 * Header: Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { ... }
 *   }
 * }
 * 
 * Use cases:
 * - Check if user is logged in
 * - Get updated user info
 * - Verify token validity
 */
router.get('/me', protect, authController.getMe);

/**
 * POST /api/v1/auth/logout
 * Logout current user
 * 
 * Protected route - requires JWT
 * 
 * Note: With JWT, logout is primarily client-side
 * Client should remove token from storage
 */
router.post('/logout', protect, authController.logout);

export default router;

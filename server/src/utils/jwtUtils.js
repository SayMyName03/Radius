/**
 * JWT Utility Functions
 * Handles token generation and verification
 * 
 * JWT (JSON Web Token):
 * - Stateless authentication mechanism
 * - Contains user info encoded in the token itself
 * - Signed with a secret key to prevent tampering
 * - No database lookups needed to verify (fast!)
 * 
 * Token Structure:
 * - Header: Algorithm and token type
 * - Payload: User data (id, email, etc.)
 * - Signature: Ensures token hasn't been tampered with
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Generate JWT token for a user
 * 
 * @param {Object} user - User document from database
 * @returns {string} - Signed JWT token
 * 
 * Payload includes:
 * - id: User's database ID
 * - email: User's email
 * - name: User's name
 * 
 * Why not include password?
 * - Tokens can be decoded by anyone
 * - Never put sensitive data in JWT payload
 */
export const generateToken = (user) => {
  // Create payload with user data
  // Only include non-sensitive information
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  // Sign the token with secret key
  // expiresIn: Token becomes invalid after this time
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });

  return token;
};

/**
 * Verify and decode JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded payload if valid
 * @throws {Error} - If token is invalid or expired
 * 
 * Verification checks:
 * - Signature is valid (token hasn't been tampered)
 * - Token hasn't expired
 * - Token was signed with our secret
 */
export const verifyToken = (token) => {
  try {
    // jwt.verify throws error if token is invalid/expired
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Extract token from request headers
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} - Token if found, null otherwise
 * 
 * Expects token in Authorization header:
 * Format: "Bearer <token>"
 */
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Remove "Bearer " prefix and return token
  return authHeader.substring(7);
};

/**
 * Generate token response object
 * 
 * @param {Object} user - User document
 * @returns {Object} - Token and user info
 * 
 * Standard response format for login/register endpoints
 */
export const generateTokenResponse = (user) => {
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      authProvider: user.authProvider,
    },
  };
};

export default {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateTokenResponse,
};

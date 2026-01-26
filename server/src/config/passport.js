/**
 * Passport Configuration for Google OAuth 2.0
 * 
 * What is Passport?
 * - Authentication middleware for Node.js
 * - Supports multiple authentication strategies
 * - We're using passport-google-oauth20 for Google login
 * 
 * OAuth Flow:
 * 1. User clicks "Sign in with Google"
 * 2. Redirect to Google's login page
 * 3. User authorizes app
 * 4. Google redirects back with authorization code
 * 5. We exchange code for user profile
 * 6. Find or create user in database
 * 7. Generate JWT and log user in
 * 
 * Security Notes:
 * - Never expose GOOGLE_CLIENT_SECRET to frontend
 * - Callback URL must be registered in Google Console
 * - Profile data comes from Google (already verified)
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import config from '../config/index.js';

/**
 * Configure Google OAuth Strategy
 * 
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: From Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: From Google Cloud Console
 * - API_BASE_URL: Your backend URL (for callback)
 * 
 * Setup instructions:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 * 2. Create new project or select existing
 * 3. Enable Google+ API
 * 4. Create OAuth 2.0 credentials
 * 5. Add callback URL: {API_BASE_URL}/auth/google/callback
 */
export const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        // Client ID from Google Cloud Console
        clientID: config.googleClientId,

        // Client Secret from Google Cloud Console (keep secret!)
        clientSecret: config.googleClientSecret,

        // Callback URL - where Google redirects after authentication
        // Must match the URL registered in Google Cloud Console
        callbackURL: `${config.apiBaseUrl}/auth/google/callback`,

        // What data we want from Google
        scope: ['profile', 'email'],
      },
      /**
       * Verify callback - Called after Google authentication succeeds
       * 
       * @param {string} accessToken - Token to access Google APIs
       * @param {string} refreshToken - Token to refresh access
       * @param {Object} profile - User's Google profile data
       * @param {Function} done - Callback to pass control back to Passport
       * 
       * Profile contains:
       * - id: Google user ID
       * - emails: Array of email objects
       * - displayName: User's full name
       * - photos: Array of profile picture URLs
       */
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('\n[Google OAuth] Authentication successful');
          console.log(`[Google OAuth] User: ${profile.displayName} (${profile.emails[0]?.value})`);

          // Find or create user in database
          // This method handles all the logic:
          // - Check if user exists by Google ID
          // - Check if email already exists (link accounts)
          // - Create new user if needed
          const user = await User.findOrCreateGoogleUser(profile);

          console.log(`[Google OAuth] User ${user._id} logged in successfully\n`);

          // Pass user to next middleware
          // done(error, user)
          // error = null means success
          // user will be available in route handler
          done(null, user);
        } catch (error) {
          console.error('[Google OAuth] Error:', error);
          done(error, null);
        }
      }
    )
  );
};

/**
 * Serialize user for session (not used with JWT, but required by Passport)
 * 
 * Why include if using JWT?
 * - Passport requires these methods
 * - We're not actually using sessions (stateless JWT instead)
 * - These are here for Passport compatibility
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * Deserialize user from session (not used with JWT)
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

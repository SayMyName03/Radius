/**
 * User Model
 * Handles user authentication data and methods
 * 
 * Authentication Providers:
 * - local: Email + password authentication
 * - google: Google OAuth authentication
 * 
 * Security Notes:
 * - Passwords are automatically hashed before saving using bcrypt
 * - Password field is excluded from queries by default (select: false)
 * - Never store passwords in plain text
 * - Use comparePassword method to verify credentials
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // User's email address (required, unique)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true, // Store in lowercase for consistency
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    // User's full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },

    // Hashed password (only for local auth)
    // select: false means password won't be returned in queries by default
    password: {
      type: String,
      required: function () {
        // Password is only required for local authentication
        return this.authProvider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },

    // Authentication method used (local or google)
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    // Google OAuth ID (only for Google auth)
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },

    // User's profile picture URL (optional)
    avatar: {
      type: String,
      default: null,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

/**
 * Pre-save middleware: Hash password before saving
 * 
 * Why: Passwords should never be stored in plain text
 * When: Runs automatically before saving a user document
 * How: Uses bcrypt to generate a secure hash
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt (random data to make hash unique)
    // Salt rounds: 10 is a good balance between security and performance
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: Compare password for login
 * 
 * @param {string} candidatePassword - Password provided by user
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 * 
 * Usage:
 *   const user = await User.findOne({ email }).select('+password');
 *   const isMatch = await user.comparePassword(enteredPassword);
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // bcrypt.compare securely compares plain text with hashed password
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Instance method: Get user data without sensitive fields
 * 
 * @returns {Object} - Safe user object for API responses
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  
  // Remove sensitive fields before sending to client
  delete user.password;
  delete user.__v;
  
  return user;
};

/**
 * Static method: Find or create user for Google OAuth
 * 
 * @param {Object} profile - Google profile data
 * @returns {Promise<Object>} - User document
 * 
 * Flow:
 * 1. Check if user exists with this Google ID
 * 2. If exists, return user
 * 3. If not, check if email exists (link accounts)
 * 4. If email exists, update with Google ID
 * 5. If completely new, create new user
 */
userSchema.statics.findOrCreateGoogleUser = async function (profile) {
  const { id: googleId, emails, displayName, photos } = profile;
  const email = emails[0]?.value;

  if (!email) {
    throw new Error('No email provided by Google');
  }

  try {
    // Try to find user by Google ID
    let user = await this.findOne({ googleId });

    if (user) {
      console.log('Found existing user by Google ID');
      return user;
    }

    // Try to find user by email (account linking)
    user = await this.findOne({ email });

    if (user) {
      console.log('Found existing user by email, linking Google account');
      
      // Link Google account to existing user
      user.googleId = googleId;
      user.authProvider = 'google';
      
      // Update avatar if not set
      if (!user.avatar && photos && photos.length > 0) {
        user.avatar = photos[0].value;
      }
      
      await user.save();
      return user;
    }

    // Create new user
    console.log('Creating new Google user');
    user = await this.create({
      email,
      name: displayName,
      googleId,
      authProvider: 'google',
      avatar: photos && photos.length > 0 ? photos[0].value : null,
    });

    return user;
  } catch (error) {
    console.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;

/**
 * Lead Model
 * Schema for storing lead/contact information
 */

import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
      index: true, // For search/sort operations
    },
    
    // Email field - NOT globally unique because different users can
    // have leads with the same email. Uniqueness is enforced per-user
    // via a compound index on (createdBy, email).
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true, // For lookups
    },
    
    phone: {
      type: String,
      trim: true,
      maxlength: [50, 'Phone cannot exceed 50 characters'],
    },
    
    // Company Information
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true, // For filtering by company
    },
    
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    
    // Lead Status & Source
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'converted', 'disqualified'],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
      index: true, // Frequently filtered field
    },
    
    source: {
      type: String,
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters'],
      index: true, // For analytics and filtering
    },
    
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: [2000, 'Source URL cannot exceed 2000 characters'],
    },
    
    // Metadata
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScrapeJob',
      index: true, // Link to scraping job
    },
    
    // ─────────────────────────────────────────────────────────────
    // USER OWNERSHIP - Critical for data isolation
    // ─────────────────────────────────────────────────────────────
    // Each lead MUST be associated with the user who created/scraped it.
    // This enables user-level data isolation where users can only see
    // their own leads. Without this field, all users would see all leads
    // which is a security and privacy concern.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must belong to a user'],
      index: true, // Indexed for fast user-scoped queries
    },
    
    // Additional structured data (flexible for future extensions)
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    
    // Notes and tracking
    notes: {
      type: String,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    
    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    // Automatic timestamps
    timestamps: true,
    
    // Optimize for JSON responses
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    
    toObject: {
      virtuals: true,
    },
  }
);

// ─────────────────────────────────────────────────────────────
// Compound Indexes for Common Queries
// ─────────────────────────────────────────────────────────────

// Filter by status + sort by date (most common query)
leadSchema.index({ status: 1, createdAt: -1 });

// Filter by source + sort by date
leadSchema.index({ source: 1, createdAt: -1 });

// Get leads by job
leadSchema.index({ jobId: 1, createdAt: -1 });

// User-scoped queries - CRITICAL for data isolation
// All lead queries should be scoped by user (createdBy)
leadSchema.index({ createdBy: 1, createdAt: -1 });
leadSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
leadSchema.index({ createdBy: 1, source: 1, createdAt: -1 });

// Unique email per user - prevents duplicate leads for the same user
// Different users CAN have leads with the same email
leadSchema.index({ createdBy: 1, email: 1 }, { unique: true });

// Text search on name, email, company
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

// Filter non-deleted leads (for soft delete pattern)
leadSchema.index({ isDeleted: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────
// Pre-save Middleware (placeholder for future logic)
// ─────────────────────────────────────────────────────────────

leadSchema.pre('save', function (next) {
  // TODO: Add any pre-save transformations
  // e.g., normalize phone numbers, validate data
  next();
});

export default mongoose.model('Lead', leadSchema);

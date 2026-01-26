/**
 * ScrapeJob Model
 * Schema for storing scraping job configuration and status
 */

import mongoose from 'mongoose';

const scrapeJobSchema = new mongoose.Schema(
  {
    // Job Configuration
    name: {
      type: String,
      required: [true, 'Job name is required'],
      trim: true,
      maxlength: [200, 'Job name cannot exceed 200 characters'],
      index: true,
    },
    
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
      trim: true,
      maxlength: [2000, 'URL cannot exceed 2000 characters'],
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid HTTP/HTTPS URL',
      ],
    },
    
    keywords: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: 'Cannot have more than 50 keywords',
      },
    },
    
    maxPages: {
      type: Number,
      default: 5,
      min: [1, 'Max pages must be at least 1'],
      max: [100, 'Max pages cannot exceed 100'],
    },
    
    // Job Status & Execution
    status: {
      type: String,
      enum: {
        values: ['pending', 'running', 'completed', 'stopped', 'failed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true, // Frequently queried
    },
    
    // Execution tracking
    startedAt: {
      type: Date,
      index: true,
    },
    
    completedAt: {
      type: Date,
      index: true,
    },
    
    // Progress tracking
    progress: {
      currentPage: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalPages: {
        type: Number,
        default: 0,
        min: 0,
      },
      leadsFound: {
        type: Number,
        default: 0,
        min: 0,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    
    // Scheduling
    schedule: {
      enabled: {
        type: Boolean,
        default: false,
      },
      cron: {
        type: String,
        trim: true,
      },
      nextRun: {
        type: Date,
        index: true, // For scheduler queries
      },
      lastRun: {
        type: Date,
      },
    },
    
    // Results & Statistics
    results: {
      totalLeads: {
        type: Number,
        default: 0,
        min: 0,
      },
      duplicates: {
        type: Number,
        default: 0,
        min: 0,
      },
      errors: {
        type: Number,
        default: 0,
        min: 0,
      },
      duration: {
        type: Number, // in seconds
        default: 0,
        min: 0,
      },
    },
    
    // Error tracking
    errors: [
      {
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        page: Number,
      },
    ],
    
    // Configuration options (flexible)
    config: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Soft delete
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
        // Don't expose full error stack in API responses
        if (ret.errors && ret.errors.length > 10) {
          ret.errors = ret.errors.slice(0, 10);
        }
        return ret;
      },
    },
    
    toObject: {
      virtuals: true,
    },
  }
);

// ─────────────────────────────────────────────────────────────
// Compound Indexes for Performance
// ─────────────────────────────────────────────────────────────

// Filter by status + sort by creation date (most common)
scrapeJobSchema.index({ status: 1, createdAt: -1 });

// Get scheduled jobs that need to run
scrapeJobSchema.index({ 'schedule.enabled': 1, 'schedule.nextRun': 1 });

// Filter non-deleted + sort by date
scrapeJobSchema.index({ isDeleted: 1, createdAt: -1 });

// Get jobs by completion time (for analytics)
scrapeJobSchema.index({ completedAt: -1 });

// ─────────────────────────────────────────────────────────────
// Virtual Fields
// ─────────────────────────────────────────────────────────────

scrapeJobSchema.virtual('isRunning').get(function () {
  return this.status === 'running';
});

scrapeJobSchema.virtual('isComplete').get(function () {
  return ['completed', 'stopped', 'failed'].includes(this.status);
});

// ─────────────────────────────────────────────────────────────
// Pre-save Middleware
// ─────────────────────────────────────────────────────────────

scrapeJobSchema.pre('save', function (next) {
  // Auto-calculate progress percentage
  if (this.progress.totalPages > 0) {
    this.progress.percentage = Math.floor(
      (this.progress.currentPage / this.progress.totalPages) * 100
    );
  }
  
  // Calculate duration if completed
  if (this.isComplete && this.startedAt && this.completedAt) {
    this.results.duration = Math.floor(
      (this.completedAt - this.startedAt) / 1000
    );
  }
  
  next();
});

export default mongoose.model('ScrapeJob', scrapeJobSchema);

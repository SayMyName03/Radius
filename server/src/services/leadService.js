/**
 * Lead Service
 * Business logic for lead management
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * USER DATA ISOLATION
 * ─────────────────────────────────────────────────────────────────────────────
 * All lead operations are scoped to the authenticated user. This ensures:
 * 1. Users can only see their own leads (privacy)
 * 2. Users cannot access or modify other users' data (security)
 * 3. Lead counts and statistics are per-user (accuracy)
 * 
 * CRITICAL: Always pass userId from the authenticated request (req.user.id).
 * Never trust client-provided user IDs for data isolation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Lead from '../models/Lead.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

class LeadService {
  /**
   * Find all leads for a specific user with filtering and pagination
   * 
   * @param {Object} filters - { userId, status, source, search, page, limit }
   * @param {String} filters.userId - REQUIRED: The authenticated user's ID for data isolation
   * @param {String} [filters.status] - Optional status filter
   * @param {String} [filters.source] - Optional source filter
   * @param {String} [filters.search] - Optional search term
   * @param {Number} [filters.page=1] - Page number
   * @param {Number} [filters.limit=20] - Results per page
   * @returns {Promise<Object>} - { leads, total }
   * 
   * SECURITY: This method enforces user-level data isolation by always
   * filtering by createdBy. Users can only retrieve their own leads.
   */
  async findAll(filters = {}) {
    try {
      const { userId, status, source, search, page = 1, limit = 20 } = filters;
      
      // SECURITY CHECK: userId is required for data isolation
      // This prevents accidentally returning all leads
      if (!userId) {
        throw new AppError('User ID is required for lead queries (data isolation)', 500);
      }
      
      // Build query - ALWAYS scope by user
      // This is the core of user-level data isolation
      const query = {
        createdBy: userId, // CRITICAL: Only return leads owned by this user
      };
      
      if (status) {
        query.status = status;
      }
      
      if (source) {
        query.source = source;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ];
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Fetch leads - query already scoped by user
      const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      // Get total count - also scoped by user
      const total = await Lead.countDocuments(query);
      
      return {
        leads,
        total,
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  /**
   * Find single lead by ID with ownership verification
   * 
   * @param {String} id - Lead ID
   * @param {String} userId - REQUIRED: The authenticated user's ID for ownership check
   * @returns {Promise<Object>} - Lead document
   * @throws {AppError} - If lead not found or user doesn't own it
   * 
   * SECURITY: This method verifies ownership before returning the lead.
   * Users cannot access leads they don't own, even if they know the ID.
   */
  async findById(id, userId) {
    if (!userId) {
      throw new AppError('User ID is required for lead queries (data isolation)', 500);
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid lead ID format', 400);
    }
    
    const lead = await Lead.findById(id).lean();
    
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    
    // SECURITY: Verify ownership - users can only access their own leads
    // This prevents ID guessing attacks where a user might try random IDs
    if (lead.createdBy.toString() !== userId.toString()) {
      // Return generic "not found" to avoid revealing lead existence
      throw new AppError('Lead not found', 404);
    }
    
    return lead;
  }

  /**
   * Create new lead with user ownership
   * 
   * @param {Object} data - Lead data including createdBy
   * @param {String} data.createdBy - REQUIRED: User ID who owns this lead
   * @returns {Promise<Object>} - Created lead
   * 
   * SECURITY: The createdBy field must come from req.user.id (server-side),
   * never from client input. This ensures leads are always properly attributed.
   */
  async create(data) {
    try {
      // SECURITY CHECK: createdBy is required
      if (!data.createdBy) {
        throw new AppError('User ownership (createdBy) is required when creating leads', 500);
      }
      
      // Check if lead already exists by email FOR THIS USER
      // Different users can have leads with the same email
      if (data.email) {
        const existing = await Lead.findOne({ 
          email: data.email,
          createdBy: data.createdBy, // Scope duplicate check to user
        });
        if (existing) {
          console.log(`Lead with email ${data.email} already exists for this user`);
          return existing;
        }
      }
      
      // Set default status if not provided
      if (!data.status) {
        data.status = 'new';
      }
      
      // Create new lead with ownership
      const lead = await Lead.create(data);
      return lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Update existing lead with ownership verification
   * 
   * @param {String} id - Lead ID
   * @param {Object} updates - Fields to update
   * @param {String} userId - REQUIRED: The authenticated user's ID for ownership check
   * @returns {Promise<Object>} - Updated lead
   * @throws {AppError} - If lead not found or user doesn't own it
   * 
   * SECURITY: Verifies ownership before allowing updates.
   * Users cannot modify leads they don't own.
   */
  async update(id, updates, userId) {
    if (!userId) {
      throw new AppError('User ID is required for lead updates (data isolation)', 500);
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid lead ID format', 400);
    }
    
    // First verify ownership
    const lead = await Lead.findById(id);
    
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    
    // SECURITY: Verify ownership before allowing update
    if (lead.createdBy.toString() !== userId.toString()) {
      throw new AppError('Lead not found', 404); // Generic message for security
    }
    
    // Prevent updating ownership (security measure)
    delete updates.createdBy;
    
    // Apply updates
    Object.assign(lead, updates);
    await lead.save();
    
    return lead;
  }

  /**
   * Delete lead with ownership verification
   * 
   * @param {String} id - Lead ID
   * @param {String} userId - REQUIRED: The authenticated user's ID for ownership check
   * @returns {Promise<void>}
   * @throws {AppError} - If lead not found or user doesn't own it
   * 
   * SECURITY: Verifies ownership before allowing deletion.
   * Users cannot delete leads they don't own.
   */
  async delete(id, userId) {
    if (!userId) {
      throw new AppError('User ID is required for lead deletion (data isolation)', 500);
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid lead ID format', 400);
    }
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    
    // SECURITY: Verify ownership before allowing delete
    if (lead.createdBy.toString() !== userId.toString()) {
      throw new AppError('Lead not found', 404); // Generic message for security
    }
    
    await Lead.findByIdAndDelete(id);
  }

  /**
   * Bulk import leads from scraped jobs with user ownership
   * 
   * @param {Array} leads - Array of lead objects
   * @param {String} userId - REQUIRED: The user who owns these leads
   * @returns {Promise<Object>} - Import statistics
   * 
   * SECURITY: The userId must come from req.user.id (server-side).
   * All imported leads will be owned by this user.
   */
  async bulkImport(leads, userId) {
    // SECURITY CHECK: userId is required for all bulk imports
    if (!userId) {
      throw new AppError('User ID is required for bulk import (data isolation)', 500);
    }
    
    const results = {
      imported: 0,
      duplicates: 0,
      errors: 0,
      details: [],
    };
    
    for (const leadData of leads) {
      try {
        // Skip if no email
        if (!leadData.email) {
          results.errors++;
          continue;
        }
        
        // Check for duplicate - scoped to this user only
        // Different users can have leads with the same email
        const existing = await Lead.findOne({ 
          email: leadData.email,
          createdBy: userId, // CRITICAL: Scope duplicate check to user
        });
        if (existing) {
          results.duplicates++;
          continue;
        }
        
        // Create lead with ownership
        await Lead.create({
          ...leadData,
          status: leadData.status || 'new',
          createdBy: userId, // CRITICAL: Assign ownership
        });
        
        results.imported++;
      } catch (error) {
        console.error('Error importing lead:', error.message);
        results.errors++;
      }
    }
    
    return results;
  }
  
  /**
   * Convert scraped jobs to lead format
   * @param {Array} jobs - Array of scraped job objects
   * @param {Object} metadata - { source, keywords }
   * @returns {Array} - Array of lead objects
   */
  convertJobsToLeads(jobs, metadata = {}) {
    return jobs.map(job => ({
      name: job.title || 'Unknown Position',
      email: this.generatePlaceholderEmail(job),
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      source: metadata.source || 'Indeed',
      status: 'new',
      jobTitle: job.title,
      jobUrl: job.jobUrl,
      salary: job.salary,
      description: job.snippet,
      tags: metadata.keywords ? [metadata.keywords] : [],
      notes: `Scraped from Indeed. Job ID: ${job.jobId || 'N/A'}`,
      metadata: {
        jobId: job.jobId,
        scrapedAt: job.scrapedAt || new Date().toISOString(),
        originalData: job,
      },
    }));
  }
  
  /**
   * Generate a placeholder email for jobs without email
   * @param {Object} job - Job object
   * @returns {String} - Email address
   */
  generatePlaceholderEmail(job) {
    // Try to create a reasonable email from company name
    if (job.company) {
      const companySlug = job.company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .substring(0, 20);
      
      // Add job ID for uniqueness
      const uniqueId = job.jobId || Math.random().toString(36).substring(7);
      return `hiring.${uniqueId}@${companySlug}.jobs`;
    }
    
    // Fallback
    return `job.${Date.now()}@indeed.placeholder`;
  }

  /**
   * Get lead statistics for a specific user
   * 
   * @param {String} userId - REQUIRED: The authenticated user's ID
   * @returns {Promise<Object>} - User's lead statistics
   * 
   * SECURITY: Statistics are scoped to the user's own leads only.
   * Each user sees their own stats, not global stats.
   */
  async getStats(userId) {
    try {
      // SECURITY CHECK: userId is required
      if (!userId) {
        throw new AppError('User ID is required for statistics (data isolation)', 500);
      }
      
      // All aggregations are scoped to this user's leads
      const userFilter = { createdBy: new mongoose.Types.ObjectId(userId) };
      
      const total = await Lead.countDocuments(userFilter);
      
      // Group by status - scoped to user
      const byStatus = await Lead.aggregate([
        { $match: userFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      
      // Group by source - scoped to user
      const bySource = await Lead.aggregate([
        { $match: userFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]);
      
      // Get new leads count (last 7 days) - scoped to user
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newLeads = await Lead.countDocuments({ 
        ...userFilter,
        createdAt: { $gte: sevenDaysAgo } 
      });
      
      // Get converted count - scoped to user
      const converted = await Lead.countDocuments({ 
        ...userFilter,
        status: 'converted' 
      });
      
      return {
        total,
        newLeads,
        converted,
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        bySource: Object.fromEntries(bySource.map(s => [s._id, s.count])),
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Search leads by text
   * @param {String} query - Search term
   * @returns {Promise<Array>}
   */
  async search(query) {
    // TODO: Full-text search on name, email, company
    // TODO: Return ranked results
    return [];
  }
}

export default new LeadService();

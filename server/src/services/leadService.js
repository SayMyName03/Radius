/**
 * Lead Service
 * Business logic for lead management
 */

import Lead from '../models/Lead.js';
import mongoose from 'mongoose';

class LeadService {
  /**
   * Find all leads with filtering and pagination
   * @param {Object} filters - { status, source, search, page, limit }
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    try {
      const { status, source, search, page = 1, limit = 20 } = filters;
      
      // Build query
      const query = {};
      
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
      
      // Fetch leads
      const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      // Get total count
      const total = await Lead.countDocuments(query);
      
      return {
        leads,
        total,
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      return {
        leads: [],
        total: 0,
      };
    }
  }

  /**
   * Find single lead by ID
   * @param {String} id - Lead ID
   * @returns {Promise<Object>}
   */
  async findById(id) {
    // TODO: Query database by ID
    // TODO: Throw error if not found
    return null;
  }

  /**
   * Create new lead
   * @param {Object} data - { name, email, company, phone, source }
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      // Check if lead already exists by email
      if (data.email) {
        const existing = await Lead.findOne({ email: data.email });
        if (existing) {
          console.log(`Lead with email ${data.email} already exists`);
          return existing;
        }
      }
      
      // Set default status if not provided
      if (!data.status) {
        data.status = 'new';
      }
      
      // Create new lead
      const lead = await Lead.create(data);
      return lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Update existing lead
   * @param {String} id - Lead ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    // TODO: Find lead by ID
    // TODO: Apply updates
    // TODO: Save to database
    // TODO: Return updated lead
    return { id, ...updates };
  }

  /**
   * Delete lead
   * @param {String} id - Lead ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    // TODO: Find lead by ID
    // TODO: Delete from database
    // TODO: Delete associated data (notes, activities)
  }

  /**
   * Bulk import leads from scraped jobs
   * @param {Array} leads - Array of lead objects
   * @returns {Promise<Object>}
   */
  async bulkImport(leads) {
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
        
        // Check for duplicate
        const existing = await Lead.findOne({ email: leadData.email });
        if (existing) {
          results.duplicates++;
          continue;
        }
        
        // Create lead
        await Lead.create({
          ...leadData,
          status: leadData.status || 'new',
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
   * Get lead statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const total = await Lead.countDocuments();
      
      // Group by status
      const byStatus = await Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      
      // Group by source
      const bySource = await Lead.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]);
      
      // Get new leads count (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newLeads = await Lead.countDocuments({ 
        createdAt: { $gte: sevenDaysAgo } 
      });
      
      // Get converted count
      const converted = await Lead.countDocuments({ status: 'converted' });
      
      return {
        total,
        newLeads,
        converted,
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        bySource: Object.fromEntries(bySource.map(s => [s._id, s.count])),
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        newLeads: 0,
        converted: 0,
        byStatus: {},
        bySource: {},
      };
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

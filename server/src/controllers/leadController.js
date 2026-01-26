/**
 * Lead Controller
 * Handles HTTP requests for lead management
 */

import AppError from '../utils/AppError.js';
import leadService from '../services/leadService.js';

export const leadController = {
  /**
   * Get all leads with filtering and pagination
   * GET /api/v1/leads?status=new&source=LinkedIn&page=1&limit=20
   */
  getAllLeads: async (req, res, next) => {
    try {
      // Extract query parameters
      const { status, source, search, page = 1, limit = 20 } = req.query;

      // Light validation
      if (page < 1 || limit < 1 || limit > 100) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      // Call service layer
      const result = await leadService.findAll({ status, source, search, page, limit });

      res.status(200).json({
        success: true,
        data: {
          leads: result.leads,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
          filters: { status, source },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single lead by ID
   * GET /api/v1/leads/:id
   */
  getLeadById: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Lead ID is required', 400);
      }

      // Call service layer
      // const lead = await leadService.findById(id);
      const lead = { 
        id, 
        name: 'John Doe', 
        email: 'john@example.com',
        status: 'new',
      }; // Placeholder

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new lead
   * POST /api/v1/leads
   */
  createLead: async (req, res, next) => {
    try {
      const leadData = req.body;

      // Basic validation
      if (!leadData.name || !leadData.email) {
        throw new AppError('Name and email are required', 400);
      }

      // Call service layer
      const lead = await leadService.create(leadData);

      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get lead statistics
   * GET /api/v1/leads/stats
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await leadService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update lead
   * PATCH /api/v1/leads/:id
   */
  updateLead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        throw new AppError('Lead ID is required', 400);
      }

      // Validate status if provided
      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'disqualified'];
      if (updates.status && !validStatuses.includes(updates.status)) {
        throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
      }

      // Call service layer
      // const lead = await leadService.update(id, updates);
      const lead = { id, ...updates, updatedAt: new Date() }; // Placeholder

      res.status(200).json({
        success: true,
        data: lead,
        message: 'Lead updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete lead
   * DELETE /api/v1/leads/:id
   */
  deleteLead: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Lead ID is required', 400);
      }

      // Call service layer
      // await leadService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

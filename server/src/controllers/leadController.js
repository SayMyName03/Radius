/**
 * Lead Controller
 * Handles HTTP requests for lead management
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * USER DATA ISOLATION
 * ─────────────────────────────────────────────────────────────────────────────
 * All lead operations are scoped to the authenticated user (req.user).
 * This ensures users can only access, modify, and delete their own leads.
 * 
 * The auth middleware (protect) MUST be applied to all routes before these
 * controller methods are called. This guarantees req.user is populated.
 * 
 * NEVER trust client-provided user IDs. Always use req.user.id from the
 * authenticated session.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AppError from '../utils/AppError.js';
import leadService from '../services/leadService.js';

export const leadController = {
  /**
   * Get all leads for the authenticated user with filtering and pagination
   * GET /api/v1/leads?status=new&source=LinkedIn&page=1&limit=20
   * 
   * SECURITY: Only returns leads where createdBy === req.user.id
   */
  getAllLeads: async (req, res, next) => {
    try {
      // Extract query parameters
      const { status, source, search, page = 1, limit = 20 } = req.query;

      // Light validation
      if (page < 1 || limit < 1 || limit > 100) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      // Call service layer with user ID for data isolation
      // CRITICAL: Pass req.user.id to ensure user only sees their own leads
      const result = await leadService.findAll({ 
        userId: req.user.id, // User ID from authenticated session
        status, 
        source, 
        search, 
        page, 
        limit 
      });

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
   * Get single lead by ID (with ownership verification)
   * GET /api/v1/leads/:id
   * 
   * SECURITY: Only returns the lead if it belongs to req.user
   */
  getLeadById: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Lead ID is required', 400);
      }

      // Call service layer with user ID for ownership verification
      // CRITICAL: Service will verify the lead belongs to this user
      const lead = await leadService.findById(id, req.user.id);

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new lead (owned by authenticated user)
   * POST /api/v1/leads
   * 
   * SECURITY: Lead is automatically assigned to req.user
   */
  createLead: async (req, res, next) => {
    try {
      const leadData = req.body;

      // Basic validation
      if (!leadData.name || !leadData.email) {
        throw new AppError('Name and email are required', 400);
      }

      // Call service layer with createdBy set to authenticated user
      // CRITICAL: Never trust client-provided createdBy - always use req.user.id
      const lead = await leadService.create({
        ...leadData,
        createdBy: req.user.id, // Assign ownership to authenticated user
      });

      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get lead statistics for the authenticated user
   * GET /api/v1/leads/stats
   * 
   * SECURITY: Only returns stats for leads owned by req.user
   */
  getStats: async (req, res, next) => {
    try {
      // Call service layer with user ID for data isolation
      // CRITICAL: Stats are scoped to user's own leads only
      const stats = await leadService.getStats(req.user.id);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update lead (with ownership verification)
   * PATCH /api/v1/leads/:id
   * 
   * SECURITY: Only allows update if lead belongs to req.user
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

      // Call service layer with user ID for ownership verification
      // CRITICAL: Service will verify the lead belongs to this user
      const lead = await leadService.update(id, updates, req.user.id);

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
   * Delete lead (with ownership verification)
   * DELETE /api/v1/leads/:id
   * 
   * SECURITY: Only allows deletion if lead belongs to req.user
   */
  deleteLead: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Lead ID is required', 400);
      }

      // Call service layer with user ID for ownership verification
      // CRITICAL: Service will verify the lead belongs to this user
      await leadService.delete(id, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

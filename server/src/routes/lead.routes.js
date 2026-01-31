/**
 * Lead Routes
 * Endpoints for lead management
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTHENTICATION & DATA ISOLATION
 * ─────────────────────────────────────────────────────────────────────────────
 * All routes are protected by the 'protect' middleware which:
 * 1. Verifies the JWT token is valid
 * 2. Loads the authenticated user from the database
 * 3. Attaches the user to req.user
 * 
 * This enables user-level data isolation where each user can only
 * access their own leads. The controller and service layers use
 * req.user.id to scope all database queries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { leadController } from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// All lead routes require authentication
// This ensures req.user is always available in controllers
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/leads/stats - Get lead statistics (user's own leads only)
router.get('/stats', protect, leadController.getStats);

// GET /api/v1/leads - Get all leads (user's own leads only)
router.get('/', protect, leadController.getAllLeads);

// GET /api/v1/leads/:id - Get single lead (with ownership verification)
router.get('/:id', protect, leadController.getLeadById);

// POST /api/v1/leads - Create new lead (assigned to authenticated user)
router.post('/', protect, leadController.createLead);

// PATCH /api/v1/leads/:id - Update lead (with ownership verification)
router.patch('/:id', protect, leadController.updateLead);

// DELETE /api/v1/leads/:id - Delete lead (with ownership verification)
router.delete('/:id', protect, leadController.deleteLead);

export default router;

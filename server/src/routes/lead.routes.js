/**
 * Lead Routes
 * Endpoints for lead management
 */

import { Router } from 'express';
import { leadController } from '../controllers/leadController.js';

const router = Router();

// GET /api/v1/leads/stats - Get lead statistics
router.get('/stats', leadController.getStats);

// GET /api/v1/leads - Get all leads
router.get('/', leadController.getAllLeads);

// GET /api/v1/leads/:id - Get single lead
router.get('/:id', leadController.getLeadById);

// POST /api/v1/leads - Create new lead
router.post('/', leadController.createLead);

// PATCH /api/v1/leads/:id - Update lead
router.patch('/:id', leadController.updateLead);

// DELETE /api/v1/leads/:id - Delete lead
router.delete('/:id', leadController.deleteLead);

export default router;

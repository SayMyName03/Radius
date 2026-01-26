/**
 * System Routes
 * Endpoints for system monitoring and management
 */

import { Router } from 'express';
import { systemController } from '../controllers/systemController.js';

const router = Router();

// GET /api/v1/system/stats - Get system statistics
router.get('/stats', systemController.getStats);

// GET /api/v1/system/logs - Get system logs
router.get('/logs', systemController.getLogs);

// POST /api/v1/system/cleanup - Run cleanup tasks
router.post('/cleanup', systemController.cleanup);

export default router;

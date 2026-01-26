/**
 * Route aggregator.
 * All API routes are registered here and prefixed accordingly.
 */

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import leadRoutes from './lead.routes.js';
import jobRoutes from './job.routes.js';
import systemRoutes from './system.routes.js';
import devRoutes from './dev.routes.js';
import authRoutes from './auth.routes.js';
import preparationRoutes from './preparation.routes.js';
import config from '../config/index.js';

const router = Router();

// Health check (no version prefix for easy access)
router.use('/health', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Core API routes
router.use('/leads', leadRoutes);
router.use('/jobs', jobRoutes);
router.use('/system', systemRoutes);
router.use('/preparation', preparationRoutes);

// Development routes (only in development mode)
if (config.isDevelopment) {
  router.use('/dev', devRoutes);
  console.log('⚠️  Dev routes enabled at /api/v1/dev/*');
}

export default router;

/**
 * Job Routes
 * Endpoints for scraping job management
 */

import { Router } from 'express';
import { jobController } from '../controllers/jobController.js';

const router = Router();

// GET /api/v1/jobs - Get all jobs
router.get('/', jobController.getAllJobs);

// GET /api/v1/jobs/:id - Get single job
router.get('/:id', jobController.getJobById);

// POST /api/v1/jobs - Create new job
router.post('/', jobController.createJob);

// POST /api/v1/jobs/:id/start - Start a job
router.post('/:id/start', jobController.startJob);

// POST /api/v1/jobs/:id/stop - Stop a job
router.post('/:id/stop', jobController.stopJob);

// DELETE /api/v1/jobs/:id - Delete job
router.delete('/:id', jobController.deleteJob);

export default router;

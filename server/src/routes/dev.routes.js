/**
 * DEV ROUTES (Temporary/Development Only)
 * These routes should be disabled in production
 */

import express from 'express';
import * as devController from '../controllers/devController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Temporary scraping endpoints for testing - Protected with JWT
router.post('/scrape/indeed', protect, devController.triggerIndeedScrape);
router.post('/scrape/naukri', protect, devController.triggerNaukriScrape);

export default router;

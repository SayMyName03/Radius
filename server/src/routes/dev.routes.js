/**
 * DEV ROUTES (Temporary/Development Only)
 * These routes should be disabled in production
 */

import express from 'express';
import * as devController from '../controllers/devController.js';

const router = express.Router();

// Temporary scraping endpoint for testing
router.post('/scrape/indeed', devController.triggerIndeedScrape);

export default router;

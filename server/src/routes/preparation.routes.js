import { Router } from 'express';
import { preparationController } from '../controllers/index.js';
import { protect } from '../middleware/auth.js';

const router = Router();

/**
 * All preparation routes require authentication
 */
router.use(protect);

/**
 * @route   POST /api/preparation/generate
 * @desc    Generate interview preparation guide for a job lead
 * @access  Private
 * @body    { leadId: string } OR { jobData: { title, company, description, location?, skills?, salary? } }
 */
router.post('/generate', preparationController.generatePrepGuide);

/**
 * @route   GET /api/preparation/history
 * @desc    Get preparation guide generation history
 * @access  Private
 */
router.get('/history', preparationController.getPrepGuideHistory);

export default router;

import { preparationService } from '../services/index.js';
import AppError from '../utils/AppError.js';
import Lead from '../models/Lead.js';

/**
 * Generate interview preparation guide for a job lead
 * POST /api/preparation/generate
 */
export const generatePrepGuide = async (req, res, next) => {
  try {
    const { leadId, jobData } = req.body;

    let jobInfo;

    // Option 1: Generate from existing lead in database
    if (leadId) {
      const lead = await Lead.findById(leadId);
      
      if (!lead) {
        return next(new AppError('Lead not found', 404));
      }

      jobInfo = {
        title: lead.title,
        company: lead.company,
        description: lead.description,
        location: lead.location,
        skills: lead.skills || [],
        salary: lead.salary,
      };
    }
    // Option 2: Generate from provided job data
    else if (jobData) {
      const { title, company, description, location, skills, salary } = jobData;

      if (!title || !company || !description) {
        return next(
          new AppError(
            'Missing required fields: title, company, and description are required',
            400
          )
        );
      }

      jobInfo = { title, company, description, location, skills, salary };
    }
    // Neither option provided
    else {
      return next(
        new AppError(
          'Either leadId or jobData must be provided',
          400
        )
      );
    }

    // Generate the preparation guide using LLM
    const result = await preparationService.generatePreparationGuide(jobInfo);

    res.status(200).json({
      success: true,
      data: result.data,
      metadata: result.metadata,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get preparation guide generation status/history (for future enhancement)
 * GET /api/preparation/history
 */
export const getPrepGuideHistory = async (req, res, next) => {
  try {
    // This is a placeholder for future enhancement
    // Could track generated guides, save them to database, etc.
    res.status(200).json({
      success: true,
      data: {
        message: 'Prep guide history feature coming soon',
        guides: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const preparationController = {
  generatePrepGuide,
  getPrepGuideHistory,
};

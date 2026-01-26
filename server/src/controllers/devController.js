/**
 * Development Controller
 * Temporary endpoints for testing and development
 * 
 * WARNING: These endpoints should be disabled in production
 */

import { executeJob } from '../jobs/scrapeJobRunner.js';
import leadService from '../services/leadService.js';

/**
 * Trigger Indeed scraping job
 * POST /api/v1/dev/scrape/indeed
 * 
 * @param {Object} req.body
 * @param {string} req.body.keyword - Search keyword
 * @param {string} req.body.location - Search location
 * @param {number} [req.body.maxPages=3] - Maximum pages to scrape
 * @param {boolean} [req.body.usePlaywright=false] - Use Playwright browser automation
 * @param {boolean} [req.body.headless=true] - Run browser in headless mode (Playwright only)
 */
export const triggerIndeedScrape = async (req, res, next) => {
  try {
    const { keyword, location, maxPages = 3, usePlaywright = false, headless = true } = req.body;
    
    // Validate input
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'keyword is required and must be a string',
      });
    }
    
    if (!location || typeof location !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'location is required and must be a string',
      });
    }
    
    // Limit pages for dev endpoint
    const limitedPages = Math.min(maxPages, 5);
    
    console.log(`\n[DEV] Triggering Indeed scrape: "${keyword}" in "${location}"`);
    console.log(`[DEV] Using: ${usePlaywright ? 'Playwright browser automation' : 'axios + cheerio'}`);
    
    // Execute scraping job
    const result = await executeJob({
      name: `Dev Scrape: ${keyword}`,
      targetUrl: 'https://in.indeed.com',
      keywords: [keyword],
      location,
      maxPages: limitedPages,
      usePlaywright,
      headless,
      continueOnError: true,
    });
    
    // Convert scraped jobs to leads and save to database
    let importResults = null;
    if (result.jobs && result.jobs.length > 0) {
      console.log(`\n[DEV] Converting ${result.jobs.length} jobs to leads...`);
      
      const leads = leadService.convertJobsToLeads(result.jobs, {
        source: 'Indeed',
        keywords: keyword,
      });
      
      importResults = await leadService.bulkImport(leads);
      
      console.log(`[DEV] Import results:`, importResults);
      console.log(`  ✓ Imported: ${importResults.imported}`);
      console.log(`  ⊘ Duplicates: ${importResults.duplicates}`);
      console.log(`  ✗ Errors: ${importResults.errors}`);
    }
    
    // Return results
    res.status(200).json({
      success: result.status === 'completed',
      message: result.status === 'completed' 
        ? 'Scraping completed successfully' 
        : 'Scraping completed with errors',
      data: {
        jobName: result.jobName,
        status: result.status,
        duration: result.duration,
        stats: {
          totalJobs: result.results.totalJobs,
          pagesScraped: result.results.pagesScraped,
          requestsMade: result.results.requestsMade,
          successfulRequests: result.results.successfulRequests,
          failedRequests: result.results.failedRequests,
          errors: result.results.errors.length,
        },
        jobs: result.jobs, // Full job data
        import: importResults, // Import statistics
      },
      warning: 'This is a temporary dev endpoint and will be removed in production',
    });
    
  } catch (error) {
    console.error('[DEV] Scrape failed:', error);
    next(error);
  }
};

export default {
  triggerIndeedScrape,
};

/**
 * Development Controller
 * Temporary endpoints for testing and development
 * 
 * WARNING: These endpoints should be disabled in production
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * USER DATA ISOLATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Scraping endpoints require authentication (via protect middleware).
 * All scraped leads are automatically assigned to the authenticated user
 * who triggered the scrape. This ensures:
 * 1. Users can only see leads they scraped
 * 2. Leads are never created without ownership
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { executeJob } from '../jobs/scrapeJobRunner.js';
import leadService from '../services/leadService.js';

/**
 * Trigger Indeed scraping job
 * POST /api/v1/dev/scrape/indeed
 * 
 * SECURITY: This endpoint is protected by auth middleware.
 * All scraped leads will be owned by req.user.
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
    
    // SECURITY: Get user ID from authenticated session
    // This is set by the protect middleware and cannot be forged
    const userId = req.user.id;
    
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
    console.log(`[DEV] User: ${req.user.email} (${userId})`);
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
    
    // Convert scraped jobs to leads and save to database WITH USER OWNERSHIP
    let importResults = null;
    if (result.jobs && result.jobs.length > 0) {
      console.log(`\n[DEV] Converting ${result.jobs.length} jobs to leads...`);
      console.log(`[DEV] Assigning leads to user: ${req.user.email}`);
      
      const leads = leadService.convertJobsToLeads(result.jobs, {
        source: 'Indeed',
        keywords: keyword,
      });
      
      // CRITICAL: Pass userId to bulkImport for data isolation
      // All imported leads will be owned by the authenticated user
      importResults = await leadService.bulkImport(leads, userId);
      
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

/**
 * Trigger Naukri.com scraping job
 * POST /api/v1/dev/scrape/naukri
 * 
 * SECURITY: This endpoint is protected by auth middleware.
 * All scraped leads will be owned by req.user.
 * 
 * @param {Object} req.body
 * @param {string} req.body.keyword - Search keyword
 * @param {string} req.body.location - Search location
 * @param {number} [req.body.maxPages=3] - Maximum pages to scrape
 * @param {boolean} [req.body.usePlaywright=false] - Use Playwright browser automation
 * @param {boolean} [req.body.headless=true] - Run browser in headless mode (Playwright only)
 */
export const triggerNaukriScrape = async (req, res, next) => {
  try {
    const { keyword, location, maxPages = 3, usePlaywright = false, headless = true } = req.body;
    
    // SECURITY: Get user ID from authenticated session
    const userId = req.user.id;
    
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
    
    console.log(`\n[DEV] Triggering Naukri scrape: "${keyword}" in "${location}"`);
    console.log(`[DEV] User: ${req.user.email} (${userId})`);
    console.log(`[DEV] Using: ${usePlaywright ? 'Playwright browser automation' : 'axios + cheerio'}`);
    
    // Execute scraping job
    const result = await executeJob({
      name: `Dev Scrape: ${keyword} (Naukri)`,
      targetUrl: 'https://www.naukri.com',
      keywords: [keyword],
      location,
      maxPages: limitedPages,
      usePlaywright,
      headless,
      continueOnError: true,
    });
    
    // Convert scraped jobs to leads and save to database WITH USER OWNERSHIP
    let importResults = null;
    if (result.jobs && result.jobs.length > 0) {
      console.log(`\n[DEV] Converting ${result.jobs.length} jobs to leads...`);
      console.log(`[DEV] Assigning leads to user: ${req.user.email}`);
      
      const leads = leadService.convertJobsToLeads(result.jobs, {
        source: 'Naukri',
        keywords: keyword,
      });
      
      // CRITICAL: Pass userId to bulkImport for data isolation
      importResults = await leadService.bulkImport(leads, userId);
      
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
        jobs: result.jobs,
        import: importResults,
      },
      warning: 'This is a temporary dev endpoint and will be removed in production',
    });
    
  } catch (error) {
    console.error('[DEV] Naukri scrape failed:', error);
    next(error);
  }
};

export default {
  triggerIndeedScrape,
  triggerNaukriScrape,
};

/**
 * Scrape Job Runner
 * Executes scraping jobs and manages their lifecycle
 */

import { IndeedScraper } from '../scrapers/IndeedScraper.js';
import { PlaywrightIndeedScraper } from '../scrapers/PlaywrightIndeedScraper.js';
import { NaukriScraper } from '../scrapers/NaukriScraper.js';
import { PlaywrightNaukriScraper } from '../scrapers/PlaywrightNaukriScraper.js';

/**
 * Execute a scraping job
 * @param {Object} jobConfig - Scraping job configuration
 * @param {string} jobConfig.name - Job name/identifier
 * @param {string} jobConfig.targetUrl - Target URL (determines scraper type)
 * @param {Array<string>} jobConfig.keywords - Search keywords
 * @param {number} jobConfig.maxPages - Maximum pages to scrape
 * @param {boolean} [jobConfig.usePlaywright=false] - Use Playwright browser automation
 * @param {boolean} [jobConfig.headless=true] - Run browser in headless mode (Playwright only)
 * @param {Function} [jobConfig.onProgress] - Progress callback
 * @returns {Promise<Object>} - Execution result
 */
export async function executeJob(jobConfig) {
  const startTime = Date.now();
  
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Starting Job: ${jobConfig.name}`);
  console.log(`═══════════════════════════════════════\n`);
  
  const result = {
    jobName: jobConfig.name,
    status: 'pending',
    startedAt: new Date(),
    completedAt: null,
    duration: 0,
    results: {
      totalJobs: 0,
      pagesScraped: 0,
      errors: [],
    },
    jobs: [],
  };
  
  try {
    // Determine scraper based on targetUrl and options
    const scraper = selectScraper(jobConfig.targetUrl, {
      usePlaywright: jobConfig.usePlaywright,
      headless: jobConfig.headless,
    });
    
    if (!scraper) {
      throw new Error(`No scraper available for URL: ${jobConfig.targetUrl}`);
    }
    
    console.log(`Using scraper: ${scraper.name}\n`);
    
    // Build scraping parameters
    const scrapeParams = {
      keyword: jobConfig.keywords?.join(' ') || '',
      location: jobConfig.location || 'United States',
      maxPages: jobConfig.maxPages || 5,
      onProgress: (progress) => {
        result.results.pagesScraped = progress.currentPage;
        result.results.totalJobs = progress.jobsFound || 0;
        
        console.log(`Progress: Page ${progress.currentPage}/${progress.totalPages} - ${progress.jobsFound} jobs found`);
        
        // Forward progress to external callback
        if (jobConfig.onProgress) {
          jobConfig.onProgress({
            ...progress,
            status: 'running',
            jobName: jobConfig.name,
          });
        }
      },
    };
    
    // Validate parameters
    const validation = scraper.validateParams(scrapeParams);
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }
    
    // Execute scraping
    result.status = 'running';
    const jobs = await scraper.scrape(scrapeParams);
    
    // Update result
    result.jobs = jobs;
    result.results.totalJobs = jobs.length;
    result.status = 'completed';
    
    // Get scraper stats
    const stats = scraper.getStats();
    result.results.errors = stats.errors || [];
    result.results.requestsMade = stats.requestsMade;
    result.results.successfulRequests = stats.successfulRequests;
    result.results.failedRequests = stats.failedRequests;
    
    console.log(`\n✓ Job completed successfully`);
    console.log(`  Total jobs extracted: ${result.results.totalJobs}`);
    console.log(`  Pages scraped: ${result.results.pagesScraped}`);
    console.log(`  Requests made: ${result.results.requestsMade}`);
    console.log(`  Errors: ${result.results.errors.length}`);
    
  } catch (error) {
    result.status = 'failed';
    result.results.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });
    
    console.error(`\n✗ Job failed: ${error.message}`);
    
    // Re-throw if it's a critical error
    if (!jobConfig.continueOnError) {
      throw error;
    }
  } finally {
    result.completedAt = new Date();
    result.duration = Math.floor((Date.now() - startTime) / 1000);
    
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  Job Duration: ${result.duration}s`);
    console.log(`═══════════════════════════════════════\n`);
  }
  
  return result;
}

/**
 * Select appropriate scraper based on target URL and options
 * @param {string} targetUrl - Target website URL
 * @param {Object} options - Scraper options
 * @param {boolean} options.usePlaywright - Use Playwright browser automation
 * @param {boolean} options.headless - Run browser in headless mode (Playwright only)
 * @returns {Object|null} - Scraper instance or null
 */
function selectScraper(targetUrl, options = {}) {
  const url = targetUrl.toLowerCase();
  const { usePlaywright = false, headless = true } = options;
  
  // Indeed scraper
  if (url.includes('indeed.com')) {
    // Detect Indian Indeed
    const baseUrl = url.includes('in.indeed.com') 
      ? 'https://in.indeed.com' 
      : 'https://www.indeed.com';
    
    // Use Playwright if requested (better for JavaScript-heavy pages)
    if (usePlaywright) {
      console.log('Using Playwright browser automation');
      return new PlaywrightIndeedScraper({
        baseUrl,
        headless,
        timeout: 60000,
        delayBetweenRequests: 2000,
      });
    }
    
    // Default: Use axios + cheerio (faster, simpler)
    console.log('Using axios + cheerio scraper');
    return new IndeedScraper({
      baseUrl,
      timeout: 30000,
      maxRetries: 3,
      delayBetweenRequests: 2000,
    });
  }
  
  // Naukri.com scraper
  if (url.includes('naukri.com')) {
    const baseUrl = 'https://www.naukri.com';
    
    // Use Playwright if requested (better for JavaScript-heavy pages)
    if (usePlaywright) {
      console.log('Using Playwright browser automation for Naukri');
      return new PlaywrightNaukriScraper({
        baseUrl,
        headless,
        timeout: 60000,
        delayBetweenRequests: 2000,
      });
    }
    
    // Default: Use axios + cheerio (faster, simpler)
    console.log('Using axios + cheerio scraper for Naukri');
    return new NaukriScraper({
      baseUrl,
      timeout: 30000,
      maxRetries: 3,
      delayBetweenRequests: 2000,
    });
  }
  
  // Future scrapers
  // if (url.includes('linkedin.com')) {
  //   return new LinkedInScraper();
  // }
  
  return null;
}

/**
 * Execute multiple scraping jobs sequentially
 * @param {Array<Object>} jobConfigs - Array of job configurations
 * @param {Object} [options] - Execution options
 * @param {boolean} [options.stopOnError=false] - Stop all jobs if one fails
 * @returns {Promise<Array<Object>>} - Array of job results
 */
export async function executeMultipleJobs(jobConfigs, options = {}) {
  const { stopOnError = false } = options;
  const results = [];
  
  console.log(`\nExecuting ${jobConfigs.length} jobs...\n`);
  
  for (let i = 0; i < jobConfigs.length; i++) {
    const jobConfig = jobConfigs[i];
    
    try {
      const result = await executeJob(jobConfig);
      results.push(result);
      
      if (result.status === 'failed' && stopOnError) {
        console.error('Stopping execution due to job failure.');
        break;
      }
      
    } catch (error) {
      results.push({
        jobName: jobConfig.name,
        status: 'failed',
        error: error.message,
      });
      
      if (stopOnError) {
        console.error('Stopping execution due to error.');
        break;
      }
    }
    
    // Delay between jobs (if not last job)
    if (i < jobConfigs.length - 1) {
      console.log('\nWaiting 5 seconds before next job...\n');
      await delay(5000);
    }
  }
  
  // Summary
  const successful = results.filter(r => r.status === 'completed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n${'='.repeat(40)}`);
  console.log(`  Execution Summary`);
  console.log(`${'='.repeat(40)}`);
  console.log(`  Total jobs: ${results.length}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${failed}`);
  console.log(`${'='.repeat(40)}\n`);
  
  return results;
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  executeJob,
  executeMultipleJobs,
};

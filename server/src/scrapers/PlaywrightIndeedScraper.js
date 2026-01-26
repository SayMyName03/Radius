/**
 * Playwright-Based Indeed Job Scraper (Educational)
 * 
 * Purpose: Learn how to use Playwright for browser automation to scrape
 * JavaScript-rendered job listings from Indeed.com
 * 
 * This is for educational purposes only. Always respect robots.txt and
 * website Terms of Service in production environments.
 * 
 * What is Playwright?
 * - A Node.js library to automate Chromium, Firefox, and WebKit browsers
 * - Allows programmatic control of real browsers (not just HTTP requests)
 * - Essential for scraping sites that render content with JavaScript
 * 
 * When to use Playwright vs. axios/cheerio?
 * - Use Playwright when: Site uses JavaScript to render content (React, Vue, etc.)
 * - Use axios/cheerio when: Site serves complete HTML from the server
 */

import { chromium } from 'playwright';
import { buildIndeedSearchUrl, calculateStartIndex } from '../utils/indeedUrlBuilder.js';
import { processJobs } from '../utils/jobProcessor.js';

export class PlaywrightIndeedScraper {
  constructor(config = {}) {
    this.name = 'PlaywrightIndeedScraper';
    this.baseUrl = config.baseUrl || 'https://in.indeed.com';
    this.config = {
      headless: config.headless !== false, // Default to headless
      timeout: config.timeout || 180000, // 3 minutes for browser operations
      delayBetweenRequests: config.delayBetweenRequests || 2000,
      ...config,
    };
    
    // Track scraping statistics
    this.stats = {
      requestsMade: 0,
      successfulRequests: 0,
      failedRequests: 0,
      leadsExtracted: 0,
      errors: [],
    };
    
    // Browser and page instances
    this.browser = null;
    this.page = null;
  }

  /**
   * STEP 1: Initialize the browser
   * 
   * Learning Notes:
   * - chromium.launch() starts a new browser instance
   * - headless: true means no visible window (faster)
   * - headless: false opens a real browser (useful for debugging)
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log(`[${this.name}] Launching Chromium browser...`);
      
      // Launch a new browser instance
      // Browser options:
      // - headless: Run without GUI (true) or with visible window (false)
      // - slowMo: Add delay between actions (useful for debugging)
      this.browser = await chromium.launch({
        headless: this.config.headless,
        // slowMo: 100, // Uncomment to slow down actions for visibility
      });
      
      console.log(`[${this.name}] Browser launched successfully`);
      
      // Create a new browser context (like an incognito window)
      // Contexts are isolated - cookies, storage, etc. don't mix
      const context = await this.browser.newContext({
        // Set viewport size (affects responsive rendering)
        viewport: { width: 1280, height: 720 },
        
        // Set user agent (identifies your browser to the server)
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      
      // Create a new page (tab) in the browser
      this.page = await context.newPage();
      
      // Set default timeout for all operations
      this.page.setDefaultTimeout(this.config.timeout);
      
      console.log(`[${this.name}] Browser context and page ready`);
      
    } catch (error) {
      console.error(`[${this.name}] Failed to initialize browser:`, error);
      throw error;
    }
  }

  /**
   * STEP 2: Navigate to search URL
   * 
   * Learning Notes:
   * - page.goto() loads a URL (like clicking a link)
   * - waitUntil options:
   *   - 'load': Wait for page load event (default)
   *   - 'domcontentloaded': Wait for DOM to be ready (faster)
   *   - 'networkidle': Wait for no network requests (best for JS-heavy sites, but slower)
   * 
   * @param {string} url - Target URL to visit
   * @returns {Promise<void>}
   */
  async navigateToUrl(url) {
    try {
      console.log(`[${this.name}] Navigating to: ${url}`);
      this.stats.requestsMade++;
      
      // Navigate to the URL and wait for the page to load
      // Using 'domcontentloaded' is faster and more reliable than 'networkidle'
      // The page content will be available even if some background requests are still loading
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded', // Wait for DOM to be ready (faster than networkidle)
        timeout: this.config.timeout,
      });
      
      // Give JavaScript a moment to render dynamic content
      await this.page.waitForTimeout(2000);
      
      this.stats.successfulRequests++;
      console.log(`[${this.name}] Page loaded successfully`);
      
    } catch (error) {
      this.stats.failedRequests++;
      this.stats.errors.push({
        url,
        message: error.message,
        timestamp: new Date(),
      });
      console.error(`[${this.name}] Navigation failed:`, error.message);
      throw error;
    }
  }

  /**
   * STEP 3: Wait for content to appear
   * 
   * Learning Notes:
   * - page.waitForSelector() waits for an element to appear in the DOM
   * - Critical for JavaScript-rendered pages where content appears after load
   * - timeout prevents infinite waiting if element never appears
   * 
   * @param {string} selector - CSS selector to wait for
   * @param {number} timeout - Max wait time in milliseconds
   * @returns {Promise<boolean>}
   */
  async waitForJobListings(selector = '.jobsearch-SerpJobCard, .job_seen_beacon, .resultContent', timeout = 30000) {
    try {
      console.log(`[${this.name}] Waiting for job listings to appear...`);
      
      // Wait for job card elements to appear in the page
      // This ensures JavaScript has finished rendering the content
      await this.page.waitForSelector(selector, {
        state: 'visible', // Wait for element to be visible (not just in DOM)
        timeout: timeout,
      });
      
      console.log(`[${this.name}] Job listings detected on page`);
      return true;
      
    } catch (error) {
      console.warn(`[${this.name}] Timeout waiting for job listings:`, error.message);
      return false;
    }
  }

  /**
   * STEP 4: Extract data from the page
   * 
   * Learning Notes:
   * - page.evaluate() runs JavaScript in the browser context
   * - The function runs in the PAGE, not Node.js (different environment!)
   * - Can access document, window, and all DOM APIs
   * - Returns serialized data (not DOM elements) back to Node.js
   * 
   * @returns {Promise<Array<Object>>} Array of job objects
   */
  async extractJobListings() {
    try {
      console.log(`[${this.name}] Extracting job data from page...`);
      
      // Execute JavaScript in the browser page to extract data
      // IMPORTANT: This code runs in the browser, not Node.js!
      const jobs = await this.page.evaluate(() => {
        // Array to store extracted job data
        const jobsData = [];
        
        // Try multiple selectors to find job cards
        // Different Indeed layouts use different CSS classes
        const selectors = [
          '.jobsearch-SerpJobCard',
          '.job_seen_beacon',
          '.resultContent',
          '.cardOutline',
          '[data-jk]',
        ];
        
        let jobCards = [];
        
        // Find the first selector that returns elements
        for (const selector of selectors) {
          jobCards = document.querySelectorAll(selector);
          if (jobCards.length > 0) {
            console.log(`Found ${jobCards.length} jobs with selector: ${selector}`);
            break;
          }
        }
        
        // Loop through each job card and extract data
        jobCards.forEach((card, index) => {
          try {
            // Extract job ID from data attribute
            const jobId = card.getAttribute('data-jk') || 
                         card.getAttribute('data-job-id') || 
                         card.getAttribute('id') || 
                         null;
            
            // Extract job title
            // querySelector finds the first matching element
            const titleElement = card.querySelector('.jobTitle, h2.jobTitle, .jcs-JobTitle, [data-testid="job-title"]');
            const title = titleElement ? titleElement.textContent.trim() : null;
            
            // Extract company name
            const companyElement = card.querySelector('.companyName, [data-testid="company-name"], .company');
            const company = companyElement ? companyElement.textContent.trim() : null;
            
            // Extract location
            const locationElement = card.querySelector('.companyLocation, [data-testid="text-location"], .location');
            const location = locationElement ? locationElement.textContent.trim() : null;
            
            // Extract job URL
            let jobUrl = null;
            const linkElement = card.querySelector('a.jcs-JobTitle, h2.jobTitle a, a[data-jk]');
            if (linkElement) {
              const href = linkElement.getAttribute('href');
              if (href) {
                // Convert relative URLs to absolute
                jobUrl = href.startsWith('http') ? href : window.location.origin + href;
              }
            } else if (jobId) {
              // Fallback: construct URL from job ID
              jobUrl = `${window.location.origin}/viewjob?jk=${jobId}`;
            }
            
            // Extract salary (if available)
            const salaryElement = card.querySelector('.salary-snippet, .salaryText, [data-testid="salary-snippet"]');
            const salary = salaryElement ? salaryElement.textContent.trim() : null;
            
            // Extract job description snippet
            const snippetElement = card.querySelector('.job-snippet, [data-testid="job-snippet"], .summary');
            const snippet = snippetElement ? snippetElement.textContent.trim() : null;
            
            // Only include jobs with minimum required data
            if (title && company) {
              jobsData.push({
                jobId,
                title,
                company,
                location,
                jobUrl,
                salary,
                snippet,
                scrapedAt: new Date().toISOString(),
              });
            }
            
          } catch (error) {
            console.error(`Error extracting job ${index}:`, error.message);
          }
        });
        
        // Return data back to Node.js
        return jobsData;
      });
      
      console.log(`[${this.name}] Extracted ${jobs.length} job listings`);
      this.stats.leadsExtracted += jobs.length;
      
      return jobs;
      
    } catch (error) {
      console.error(`[${this.name}] Failed to extract jobs:`, error);
      throw error;
    }
  }

  /**
   * STEP 5: Take a screenshot (useful for debugging)
   * 
   * Learning Notes:
   * - page.screenshot() captures the current page view
   * - Useful for debugging when scraping fails
   * - Can save as PNG or JPEG
   * 
   * @param {string} path - File path to save screenshot
   * @returns {Promise<void>}
   */
  async takeScreenshot(path = './screenshot.png') {
    try {
      await this.page.screenshot({ path, fullPage: true });
      console.log(`[${this.name}] Screenshot saved to: ${path}`);
    } catch (error) {
      console.error(`[${this.name}] Failed to take screenshot:`, error);
    }
  }

  /**
   * STEP 6: Close the browser
   * 
   * Learning Notes:
   * - ALWAYS close the browser when done
   * - Prevents memory leaks and zombie processes
   * - Use try/finally to ensure cleanup even if scraping fails
   * 
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log(`[${this.name}] Browser closed successfully`);
      
    } catch (error) {
      console.error(`[${this.name}] Error during cleanup:`, error);
    }
  }

  /**
   * Main scraping method - orchestrates all steps
   * 
   * This is the public API that the job runner will call
   * 
   * @param {Object} params - Scraping parameters
   * @param {string} params.keyword - Job search keyword
   * @param {string} params.location - Job location
   * @param {number} params.maxPages - Number of pages to scrape
   * @param {Function} params.onProgress - Progress callback
   * @returns {Promise<Array<Object>>} Array of all scraped jobs
   */
  async scrape(params) {
    const { keyword, location, maxPages = 1, onProgress } = params;
    
    console.log(`\n[${this.name}] Starting scrape job`);
    console.log(`  Keyword: ${keyword}`);
    console.log(`  Location: ${location}`);
    console.log(`  Max Pages: ${maxPages}\n`);
    
    const allJobs = [];
    
    try {
      // Initialize browser once for all pages
      await this.initialize();
      
      // Loop through each page
      for (let page = 0; page < maxPages; page++) {
        console.log(`\n--- Scraping Page ${page + 1}/${maxPages} ---`);
        
        // Build search URL for this page
        const start = calculateStartIndex(page + 1);
        const url = buildIndeedSearchUrl({
          keyword,
          location,
          start,
        });
        
        // Navigate to the page
        await this.navigateToUrl(url);
        
        // Wait for job listings to render
        const found = await this.waitForJobListings();
        
        if (!found) {
          console.warn(`[${this.name}] No job listings found on page ${page + 1}`);
          
          // Take a screenshot for debugging
          await this.takeScreenshot(`./debug-page-${page + 1}.png`);
          
          continue;
        }
        
        // Extract job data
        const jobs = await this.extractJobListings();
        
        // Add page number to each job
        jobs.forEach(job => {
          job.page = page + 1;
        });
        
        allJobs.push(...jobs);
        
        // Report progress
        if (onProgress) {
          onProgress({
            currentPage: page + 1,
            totalPages: maxPages,
            jobsFound: allJobs.length,
          });
        }
        
        // Delay between pages (be respectful to the server)
        if (page < maxPages - 1) {
          console.log(`[${this.name}] Waiting ${this.config.delayBetweenRequests}ms before next page...`);
          await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenRequests));
        }
      }
      
      console.log(`\n[${this.name}] Scraping completed`);
      console.log(`  Total jobs extracted: ${allJobs.length}`);
      
      return allJobs;
      
    } catch (error) {
      console.error(`[${this.name}] Scraping failed:`, error);
      throw error;
      
    } finally {
      // CRITICAL: Always close the browser, even if scraping fails
      await this.cleanup();
    }
  }

  /**
   * Validate scraping parameters
   * 
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParams(params) {
    const errors = [];
    
    if (!params.keyword || typeof params.keyword !== 'string') {
      errors.push('keyword is required and must be a string');
    }
    
    if (!params.location || typeof params.location !== 'string') {
      errors.push('location is required and must be a string');
    }
    
    if (params.maxPages && (typeof params.maxPages !== 'number' || params.maxPages < 1)) {
      errors.push('maxPages must be a positive number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get scraping statistics
   * 
   * @returns {Object} Statistics object
   */
  getStats() {
    return { ...this.stats };
  }
}

/**
 * Playwright-Based Naukri.com Job Scraper
 * 
 * Purpose: Use Playwright for browser automation to scrape JavaScript-rendered
 * job listings from Naukri.com
 * 
 * When to use this vs. NaukriScraper:
 * - Use this when Naukri.com heavily relies on JavaScript to render content
 * - Use NaukriScraper (axios/cheerio) when server-side HTML is sufficient
 */

import { chromium } from 'playwright';
import { processJobs } from '../utils/jobProcessor.js';

export class PlaywrightNaukriScraper {
  constructor(config = {}) {
    this.name = 'PlaywrightNaukriScraper';
    this.baseUrl = config.baseUrl || 'https://www.naukri.com';
    this.config = {
      headless: config.headless !== false,
      timeout: config.timeout || 180000,
      navigationTimeout: config.navigationTimeout || 30000,
      evaluateTimeout: config.evaluateTimeout || 60000,
      delayBetweenRequests: config.delayBetweenRequests || 2000,
      ...config,
    };
    
    this.stats = {
      requestsMade: 0,
      successfulRequests: 0,
      failedRequests: 0,
      leadsExtracted: 0,
      errors: [],
    };
    
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize the browser
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log(`[${this.name}] Launching Chromium browser...`);
      
      this.browser = await chromium.launch({
        headless: this.config.headless,
      });
      
      console.log(`[${this.name}] Browser launched successfully`);
      
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      
      this.page = await context.newPage();
      this.page.setDefaultTimeout(this.config.timeout);
      
      console.log(`[${this.name}] Browser context and page ready`);
      
    } catch (error) {
      console.error(`[${this.name}] Failed to initialize browser:`, error);
      throw error;
    }
  }

  /**
   * Build search URL for Naukri.com
   * @param {Object} params - Search parameters
   * @returns {string} - Constructed URL
   */
  buildSearchUrl(params) {
    const { keyword, location, page = 1 } = params;
    
    const keywordSlug = keyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const locationSlug = location.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const baseSearchUrl = `${this.baseUrl}/${keywordSlug}-jobs-in-${locationSlug}`;
    
    const queryParams = new URLSearchParams({
      k: keyword,
      l: location,
      pageNo: page.toString(),
    });
    
    return `${baseSearchUrl}?${queryParams.toString()}`;
  }

  /**
   * Navigate to URL and wait for content
   * @param {string} url - Target URL
   * @returns {Promise<void>}
   */
  async navigateToPage(url) {
    this.stats.requestsMade++;
    
    try {
      console.log(`[${this.name}] Navigating to: ${url}`);
      
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.navigationTimeout,
      });
      
      // Wait for job listings to appear
      try {
        await this.page.waitForSelector('article.jobTuple, .jobTuple, article[data-job-id]', {
          timeout: 10000,
          state: 'visible',
        });
        console.log(`[${this.name}] Job listings loaded`);
      } catch (e) {
        console.warn(`[${this.name}] Job selector not found - page might be empty or structure changed`);
      }
      
      this.stats.successfulRequests++;
      
    } catch (error) {
      this.stats.failedRequests++;
      this.stats.errors.push({
        url,
        message: error.message,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Extract job listings from current page using browser context
   * @returns {Promise<Array<Object>>} - Parsed job listings
   */
  async extractJobs() {
    try {
      const jobs = await this.page.evaluate(() => {
        const jobCards = document.querySelectorAll('article.jobTuple, .jobTuple, article[data-job-id]');
        const extractedJobs = [];

        jobCards.forEach((card) => {
          // Extract job ID
          const jobId = card.getAttribute('data-job-id') || 
                        card.getAttribute('data-jobid') || 
                        null;

          // Extract title
          const titleEl = card.querySelector('.title, .jobTuple-title, a.title, .job-title');
          const title = titleEl ? titleEl.textContent.trim() : null;

          // Extract company
          const companyEl = card.querySelector('.compName, .company-name, .subTitle, .comp-name');
          const company = companyEl ? companyEl.textContent.trim() : null;

          // Extract location
          const locationEl = card.querySelector('.location, .locWdth, .loc, .job-location');
          const location = locationEl ? locationEl.textContent.trim() : null;

          // Extract job URL
          let jobUrl = null;
          const linkEl = card.querySelector('a.title, .jobTuple-title a, a.job-title-link');
          if (linkEl) {
            const href = linkEl.getAttribute('href');
            if (href) {
              jobUrl = href.startsWith('http') ? href : `https://www.naukri.com${href}`;
            }
          }

          // Extract salary
          const salaryEl = card.querySelector('.salary, .salaryRange, .sal');
          const salary = salaryEl ? salaryEl.textContent.trim() : null;

          // Extract experience
          const expEl = card.querySelector('.experience, .expwdth, .exp');
          const experience = expEl ? expEl.textContent.trim() : null;

          // Extract skills
          const skills = [];
          card.querySelectorAll('.tags, .tag-li, .skill, .skillSet li').forEach((skillEl) => {
            const skill = skillEl.textContent.trim();
            if (skill) skills.push(skill);
          });

          // Extract snippet
          const snippetEl = card.querySelector('.job-description, .desc, .job-details, .ellipsis');
          const snippet = snippetEl ? snippetEl.textContent.trim() : null;

          if (title || company) {
            extractedJobs.push({
              jobId,
              title,
              company,
              location,
              jobUrl,
              salary,
              experience,
              skills: skills.length > 0 ? skills : null,
              snippet,
              source: 'Naukri',
              scrapedAt: new Date().toISOString(),
            });
          }
        });

        return extractedJobs;
      });

      return jobs;
      
    } catch (error) {
      console.error(`[${this.name}] Error extracting jobs:`, error);
      return [];
    }
  }

  /**
   * Validate scraping parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  validateParams(params) {
    const errors = [];
    
    if (!params.keyword || typeof params.keyword !== 'string') {
      errors.push('keyword is required and must be a string');
    }
    
    if (!params.location || typeof params.location !== 'string') {
      errors.push('location is required and must be a string');
    }
    
    if (params.maxPages !== undefined) {
      const maxPages = parseInt(params.maxPages);
      if (isNaN(maxPages) || maxPages < 1 || maxPages > 20) {
        errors.push('maxPages must be a number between 1 and 20');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Main scraping method
   * @param {Object} params - Scraping parameters
   * @returns {Promise<Array<Object>>} - Array of extracted job listings
   */
  async scrape(params) {
    const { keyword, location, maxPages = 5, onProgress } = params;
    
    const allJobs = [];
    let currentPage = 1;
    
    console.log(`[${this.name}] Starting scrape for "${keyword}" in "${location}"`);
    console.log(`[${this.name}] Max pages: ${maxPages}`);
    
    try {
      await this.initialize();
      
      for (currentPage = 1; currentPage <= maxPages; currentPage++) {
        console.log(`\n[${this.name}] ──────────────────────────────────────`);
        console.log(`[${this.name}] Scraping page ${currentPage}/${maxPages}`);
        
        const url = this.buildSearchUrl({ keyword, location, page: currentPage });
        
        try {
          await this.navigateToPage(url);
          
          // Small delay for dynamic content
          await this.delay(1000);
          
          const jobs = await this.extractJobs();
          
          console.log(`[${this.name}] Found ${jobs.length} jobs on this page`);
          
          allJobs.push(...jobs);
          this.stats.leadsExtracted += jobs.length;
          
          if (onProgress) {
            onProgress({
              currentPage,
              totalPages: maxPages,
              jobsFound: allJobs.length,
              status: 'scraping',
            });
          }
          
          if (jobs.length === 0) {
            console.log(`[${this.name}] No jobs found on page ${currentPage}. Stopping.`);
            break;
          }
          
          if (currentPage < maxPages) {
            console.log(`[${this.name}] Waiting ${this.config.delayBetweenRequests}ms before next request...`);
            await this.delay(this.config.delayBetweenRequests);
          }
          
        } catch (pageError) {
          console.error(`[${this.name}] Error scraping page ${currentPage}:`, pageError.message);
        }
      }
      
      const processedJobs = processJobs(allJobs);
      
      console.log(`\n[${this.name}] ══════════════════════════════════════`);
      console.log(`[${this.name}] Scraping completed`);
      console.log(`[${this.name}] Total jobs extracted: ${processedJobs.length}`);
      console.log(`[${this.name}] ══════════════════════════════════════\n`);
      
      return processedJobs;
      
    } catch (error) {
      console.error(`[${this.name}] Scraping failed:`, error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    console.log(`[${this.name}] Browser closed and cleanup complete`);
  }

  /**
   * Get scraping statistics
   * @returns {Object} - Statistics object
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

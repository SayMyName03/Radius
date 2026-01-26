/**
 * Indeed Job Listings Scraper
 * 
 * Purpose: Extract job listings and contact information from Indeed.com
 * Architecture: Pluggable adapter pattern for job runner integration
 */

import { buildIndeedSearchUrl, calculateStartIndex } from '../utils/indeedUrlBuilder.js';
import { fetchHtml, getRandomUserAgent } from '../utils/httpClient.js';
import { parseHtml, queryStructured } from '../utils/htmlParser.js';
import { processJobs } from '../utils/jobProcessor.js';

export class IndeedScraper {
  constructor(config = {}) {
    this.name = 'IndeedScraper';
    this.baseUrl = config.baseUrl || 'https://in.indeed.com';
    this.config = {
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      delayBetweenRequests: config.delayBetweenRequests || 2000,
      userAgent: config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...config,
    };
    
    this.stats = {
      requestsMade: 0,
      successfulRequests: 0,
      failedRequests: 0,
      leadsExtracted: 0,
      errors: [],
    };
  }

  /**
   * Initialize scraper resources
   * @returns {Promise<void>}
   */
  async initialize() {
    // TODO: Initialize HTTP client, proxy rotation, captcha solver, etc.
    console.log(`[${this.name}] Initializing scraper...`);
  }

  /**
   * Build search URL with parameters
   * @param {Object} params - Search parameters
   * @param {string} params.keyword - Job title or keyword
   * @param {string} params.location - Location/city
   * @param {number} params.page - Page number (0-indexed)
   * @returns {string} - Constructed URL
   */
  buildSearchUrl(params) {
    const { keyword, location, page = 0 } = params;
    
    const start = calculateStartIndex(page + 1); // Convert 0-indexed to 1-indexed
    
    return buildIndeedSearchUrl({
      keyword,
      location,
      start,
      filters: this.config.filters || {},
    });
  }

  /**
   * Fetch HTML content from URL
   * @param {string} url - Target URL
   * @returns {Promise<string>} - Raw HTML content
   */
  async fetchPage(url) {
    this.stats.requestsMade++;
    
    try {
      const html = await fetchHtml(url, {
        timeout: this.config.timeout,
        userAgent: this.config.userAgent || getRandomUserAgent(),
        maxRetries: this.config.maxRetries,
        retryDelay: 2000,
      });
      
      this.stats.successfulRequests++;
      return html;
      
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
   * Extract job listings from HTML
   * @param {string} html - Raw HTML content
   * @returns {Array<Object>} - Parsed job listings
   */
  parseJobListings(html) {
    const $ = parseHtml(html);
    const jobs = [];

    // Indeed job cards - selectors may vary based on Indeed's current structure
    // Common container selectors: .job_seen_beacon, .jobsearch-SerpJobCard, .slider_item, .resultContent
    const jobCardSelectors = [
      '.jobsearch-SerpJobCard',
      '.job_seen_beacon',
      '.resultContent',
      '[data-jk]',
      '.cardOutline',
    ];

    let $jobCards = $();
    
    // Try each selector until we find job cards
    for (const selector of jobCardSelectors) {
      $jobCards = $(selector);
      if ($jobCards.length > 0) break;
    }

    $jobCards.each((index, card) => {
      const $card = $(card);

      // Extract job ID (used for building job URL)
      const jobId = $card.attr('data-jk') || 
                    $card.attr('data-job-id') || 
                    $card.attr('id') || 
                    null;

      // Extract title
      // Common selectors: .jobTitle, h2.jobTitle a, .jcs-JobTitle
      const title = $card.find('.jobTitle, h2.jobTitle, .jcs-JobTitle, [data-testid="job-title"]')
                          .first()
                          .text()
                          .trim() || null;

      // Extract company name
      // Common selectors: .companyName, [data-testid="company-name"], .company
      const company = $card.find('.companyName, [data-testid="company-name"], .company, .companyInfo .companyName')
                            .first()
                            .text()
                            .trim() || null;

      // Extract location
      // Common selectors: .companyLocation, [data-testid="text-location"], .location
      const location = $card.find('.companyLocation, [data-testid="text-location"], .location, .companyInfo .companyLocation')
                             .first()
                             .text()
                             .trim() || null;

      // Extract job URL
      // Indeed URLs typically: /rc/clk?jk=<jobId> or /viewjob?jk=<jobId>
      let jobUrl = null;
      
      const $link = $card.find('a.jcs-JobTitle, h2.jobTitle a, a[data-jk], a[id^="job_"]').first();
      if ($link.length > 0) {
        const href = $link.attr('href');
        if (href) {
          jobUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
        }
      } else if (jobId) {
        // Fallback: construct URL from job ID
        jobUrl = `${this.baseUrl}/viewjob?jk=${jobId}`;
      }

      // Extract salary if available
      const salary = $card.find('.salary-snippet, .salaryText, [data-testid="salary-snippet"]')
                           .first()
                           .text()
                           .trim() || null;

      // Extract job snippet/description preview
      const snippet = $card.find('.job-snippet, [data-testid="job-snippet"], .summary')
                            .first()
                            .text()
                            .trim() || null;

      // Only add jobs with at least title and company
      if (title || company) {
        jobs.push({
          jobId,
          title,
          company,
          location,
          jobUrl,
          salary,
          snippet,
          rawHtml: $card.html(), // Keep raw HTML for debugging
        });
      }
    });

    return jobs;
  }

  /**
   * Fetch and parse job detail page
   * @param {string} jobUrl - URL to job posting
   * @returns {Promise<Object>} - Detailed job information
   */
  async fetchJobDetails(jobUrl) {
    // TODO: Fetch full job description and extract:
    // - Full job description
    // - Requirements
    // - Benefits
    // - Application URL/email
    
    throw new Error('fetchJobDetails not implemented');
  }

  /**
   * Extract contact information from job posting
   * @param {Object} jobData - Job listing data
   * @returns {Object} - Extracted contact/lead information
   */
  extractLeadInfo(jobData) {
    // TODO: Extract lead information:
    // - Company name
    // - Email addresses (from description)
    // - Phone numbers
    // - Website
    // - LinkedIn profile
    
    const lead = {
      name: null,
      email: null,
      phone: null,
      company: null,
      location: null,
      source: 'Indeed',
      sourceUrl: null,
      metadata: {},
    };
    
    return lead;
  }

  /**
   * Main scraping method - orchestrates the entire process
   * @param {Object} params - Scraping parameters
   * @param {string} params.keyword - Search keyword
   * @param {string} params.location - Search location
   * @param {number} params.maxPages - Maximum pages to scrape
   * @param {Function} [params.onProgress] - Progress callback
   * @returns {Promise<Array<Object>>} - Array of extracted job listings
   */
  async scrape(params) {
    const { keyword, location, maxPages = 5, onProgress } = params;
    
    const allJobs = [];
    let consecutiveEmptyPages = 0;
    
    try {
      await this.initialize();
      
      console.log(`[${this.name}] Starting scrape: "${keyword}" in "${location}" (max ${maxPages} pages)`);
      
      for (let page = 0; page < maxPages; page++) {
        console.log(`[${this.name}] Fetching page ${page + 1}/${maxPages}...`);
        
        // Build search URL for current page
        const url = this.buildSearchUrl({ keyword, location, page });
        
        try {
          // Fetch page HTML
          const html = await this.fetchPage(url);
          
          // Parse job listings from HTML
          const jobs = this.parseJobListings(html);
          
          console.log(`[${this.name}] Found ${jobs.length} jobs on page ${page + 1}`);
          
          // Check if page is empty
          if (jobs.length === 0) {
            consecutiveEmptyPages++;
            
            // Stop if we hit 2 consecutive empty pages (likely end of results)
            if (consecutiveEmptyPages >= 2) {
              console.log(`[${this.name}] No more results found. Stopping pagination.`);
              break;
            }
          } else {
            consecutiveEmptyPages = 0; // Reset counter
            allJobs.push(...jobs);
          }
          
          // Report progress
          if (onProgress) {
            onProgress({
              currentPage: page + 1,
              totalPages: maxPages,
              jobsFound: allJobs.length,
              percentage: Math.floor(((page + 1) / maxPages) * 100),
            });
          }
          
          // Add delay between requests (except on last page)
          if (page < maxPages - 1) {
            console.log(`[${this.name}] Waiting ${this.config.delayBetweenRequests}ms before next request...`);
            await this.delay(this.config.delayBetweenRequests);
          }
          
        } catch (error) {
          console.error(`[${this.name}] Error on page ${page + 1}:`, error.message);
          
          // Record error but continue to next page
          this.stats.errors.push({
            page: page + 1,
            message: error.message,
            timestamp: new Date(),
          });
          
          // Stop if too many consecutive errors
          consecutiveEmptyPages++;
          if (consecutiveEmptyPages >= 3) {
            console.error(`[${this.name}] Too many errors. Stopping pagination.`);
            break;
          }
        }
      }
      
      this.stats.successfulRequests = this.stats.requestsMade - this.stats.failedRequests;
      
      console.log(`[${this.name}] Processing ${allJobs.length} raw jobs...`);
      
      // Process jobs: clean, deduplicate, validate
      const result = processJobs(allJobs, {
        baseUrl: this.baseUrl,
        dedupeBy: 'jobId',
        removeInvalid: true,
      });
      
      console.log(`[${this.name}] Processing stats:`, result.stats);
      console.log(`[${this.name}] Scraping completed. Final jobs: ${result.jobs.length}`);
      
      return result.jobs;
      
    } catch (error) {
      console.error(`[${this.name}] Scraping failed:`, error);
      this.stats.errors.push({
        message: error.message,
        timestamp: new Date(),
      });
      throw error;
    } finally {
      await this.cleanup();
    }
    
    return allJobs;
  }

  /**
   * Validate scraping parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} - Validation result
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
   * Get scraper statistics
   * @returns {Object} - Scraping statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset scraper statistics
   */
  resetStats() {
    this.stats = {
      requestsMade: 0,
      successfulRequests: 0,
      failedRequests: 0,
      leadsExtracted: 0,
      errors: [],
    };
  }

  /**
   * Delay execution (for rate limiting)
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    // TODO: Close HTTP client, browser instances, proxy connections, etc.
    console.log(`[${this.name}] Cleaning up resources...`);
  }

  /**
   * Check if scraper is healthy and operational
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    // TODO: Verify scraper can connect to Indeed and basic functionality works
    return true;
  }
}

export default IndeedScraper;

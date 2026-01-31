/**
 * Naukri.com Job Listings Scraper
 * 
 * Purpose: Extract job listings from Naukri.com (India's leading job portal)
 * Architecture: Pluggable adapter pattern for job runner integration
 */

import { fetchHtml, getRandomUserAgent } from '../utils/httpClient.js';
import { parseHtml } from '../utils/htmlParser.js';
import { processJobs } from '../utils/jobProcessor.js';

export class NaukriScraper {
  constructor(config = {}) {
    this.name = 'NaukriScraper';
    this.baseUrl = config.baseUrl || 'https://www.naukri.com';
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
    console.log(`[${this.name}] Initializing scraper...`);
  }

  /**
   * Build search URL with parameters for Naukri.com
   * 
   * Naukri URL structure:
   * https://www.naukri.com/{keyword}-jobs-in-{location}?k={keyword}&l={location}&pageNo={page}
   * 
   * @param {Object} params - Search parameters
   * @param {string} params.keyword - Job title or keyword
   * @param {string} params.location - Location/city
   * @param {number} params.page - Page number (1-indexed)
   * @returns {string} - Constructed URL
   */
  buildSearchUrl(params) {
    const { keyword, location, page = 1 } = params;
    
    // Sanitize and format keyword and location for URL
    const keywordSlug = keyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const locationSlug = location.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Naukri.com uses a combination of slug-based URLs and query parameters
    const baseSearchUrl = `${this.baseUrl}/${keywordSlug}-jobs-in-${locationSlug}`;
    
    const queryParams = new URLSearchParams({
      k: keyword,
      l: location,
      pageNo: page.toString(),
    });
    
    return `${baseSearchUrl}?${queryParams.toString()}`;
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
   * Extract job listings from Naukri.com HTML
   * 
   * Naukri.com structure notes:
   * - Job cards are typically in article.jobTuple or div.jobTuple
   * - Each card contains: title, company, location, salary, experience, skills
   * 
   * @param {string} html - Raw HTML content
   * @returns {Array<Object>} - Parsed job listings
   */
  parseJobListings(html) {
    const $ = parseHtml(html);
    const jobs = [];

    // Naukri job card selectors
    // Common selectors: article.jobTuple, .jobTuple, [data-job-id]
    const jobCardSelectors = [
      'article.jobTuple',
      '.jobTuple',
      'article[data-job-id]',
      '.srp-jobtuple-wrapper',
    ];

    let $jobCards = $();
    
    // Try each selector until we find job cards
    for (const selector of jobCardSelectors) {
      $jobCards = $(selector);
      if ($jobCards.length > 0) {
        console.log(`[${this.name}] Found ${$jobCards.length} jobs using selector: ${selector}`);
        break;
      }
    }

    if ($jobCards.length === 0) {
      console.warn(`[${this.name}] No job cards found. Page structure may have changed.`);
    }

    $jobCards.each((index, card) => {
      const $card = $(card);

      // Extract job ID
      const jobId = $card.attr('data-job-id') || 
                    $card.attr('data-jobid') || 
                    $card.find('[data-job-id]').attr('data-job-id') ||
                    null;

      // Extract title
      // Common selectors: .jobTuple-title, .title, a.title
      const title = $card.find('.title, .jobTuple-title, a.title, .job-title')
                          .first()
                          .text()
                          .trim() || null;

      // Extract company name
      // Common selectors: .compName, .company-name, .subTitle
      const company = $card.find('.compName, .company-name, .subTitle, .comp-name')
                            .first()
                            .text()
                            .trim() || null;

      // Extract location
      // Common selectors: .location, .locWdth, .loc
      const location = $card.find('.location, .locWdth, .loc, .job-location')
                             .first()
                             .text()
                             .trim() || null;

      // Extract job URL
      let jobUrl = null;
      const $link = $card.find('a.title, .jobTuple-title a, a.job-title-link').first();
      if ($link.length > 0) {
        const href = $link.attr('href');
        if (href) {
          jobUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
        }
      } else if (jobId) {
        // Fallback: construct URL from job ID
        jobUrl = `${this.baseUrl}/job-listings-${jobId}`;
      }

      // Extract salary if available
      const salary = $card.find('.salary, .salaryRange, .sal')
                           .first()
                           .text()
                           .trim() || null;

      // Extract experience required
      const experience = $card.find('.experience, .expwdth, .exp')
                              .first()
                              .text()
                              .trim() || null;

      // Extract skills/tags
      const skills = [];
      $card.find('.tags, .tag-li, .skill, .skillSet li').each((i, el) => {
        const skill = $(el).text().trim();
        if (skill) skills.push(skill);
      });

      // Extract job snippet/description preview
      const snippet = $card.find('.job-description, .desc, .job-details, .ellipsis')
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
          experience,
          skills: skills.length > 0 ? skills : null,
          snippet,
          source: 'Naukri',
          scrapedAt: new Date().toISOString(),
        });
      }
    });

    return jobs;
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
   * Main scraping method - orchestrates the entire process
   * 
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
    let currentPage = 1;
    
    console.log(`[${this.name}] Starting scrape for "${keyword}" in "${location}"`);
    console.log(`[${this.name}] Max pages: ${maxPages}`);
    
    try {
      // Initialize if needed
      await this.initialize();
      
      // Scrape each page
      for (currentPage = 1; currentPage <= maxPages; currentPage++) {
        console.log(`\n[${this.name}] ──────────────────────────────────────`);
        console.log(`[${this.name}] Scraping page ${currentPage}/${maxPages}`);
        
        // Build URL for this page
        const url = this.buildSearchUrl({ keyword, location, page: currentPage });
        console.log(`[${this.name}] URL: ${url}`);
        
        try {
          // Fetch HTML
          const html = await this.fetchPage(url);
          
          // Parse jobs
          const jobs = this.parseJobListings(html);
          
          console.log(`[${this.name}] Found ${jobs.length} jobs on this page`);
          
          // Add to collection
          allJobs.push(...jobs);
          this.stats.leadsExtracted += jobs.length;
          
          // Report progress
          if (onProgress) {
            onProgress({
              currentPage,
              totalPages: maxPages,
              jobsFound: allJobs.length,
              status: 'scraping',
            });
          }
          
          // If no jobs found, might have reached the end
          if (jobs.length === 0) {
            console.log(`[${this.name}] No jobs found on page ${currentPage}. Stopping.`);
            break;
          }
          
          // Delay before next request (be respectful to the server)
          if (currentPage < maxPages) {
            console.log(`[${this.name}] Waiting ${this.config.delayBetweenRequests}ms before next request...`);
            await this.delay(this.config.delayBetweenRequests);
          }
          
        } catch (pageError) {
          console.error(`[${this.name}] Error scraping page ${currentPage}:`, pageError.message);
          // Continue to next page even if one fails
        }
      }
      
      // Process and normalize jobs
      const processedJobs = processJobs(allJobs);
      
      console.log(`\n[${this.name}] ══════════════════════════════════════`);
      console.log(`[${this.name}] Scraping completed`);
      console.log(`[${this.name}] Total jobs extracted: ${processedJobs.length}`);
      console.log(`[${this.name}] ══════════════════════════════════════\n`);
      
      return processedJobs;
      
    } catch (error) {
      console.error(`[${this.name}] Scraping failed:`, error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    console.log(`[${this.name}] Cleanup complete`);
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

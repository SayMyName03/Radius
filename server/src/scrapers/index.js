/**
 * SCRAPERS
 * 
 * Purpose: Web scraping modules for lead generation
 * Responsibilities:
 * - Target-specific scraping logic (LinkedIn, job boards, etc.)
 * - HTML parsing and data extraction
 * - Rate limiting and retry logic
 * - Anti-bot detection handling
 * - Data normalization before storage
 * 
 * Technologies to integrate:
 * - Puppeteer (headless browser)
 * - Cheerio (HTML parsing)
 * - Playwright (modern alternative to Puppeteer)
 * - Axios (HTTP requests)
 * 
 * Available scrapers:
 * - IndeedScraper.js              → Indeed job listings scraper (axios + cheerio)
 * - PlaywrightIndeedScraper.js    → Indeed scraper using Playwright browser automation
 */

export { IndeedScraper } from './IndeedScraper.js';
export { PlaywrightIndeedScraper } from './PlaywrightIndeedScraper.js';

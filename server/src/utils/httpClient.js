/**
 * HTTP Client for Web Scraping
 * Handles HTTP requests with realistic headers and error handling
 */

import axios from 'axios';

/**
 * Fetch HTML content from a URL
 * @param {string} url - Target URL to fetch
 * @param {Object} [options] - Request options
 * @param {number} [options.timeout=30000] - Request timeout in milliseconds
 * @param {string} [options.userAgent] - Custom User-Agent string
 * @param {Object} [options.headers] - Additional headers
 * @param {number} [options.maxRetries=0] - Number of retry attempts
 * @param {number} [options.retryDelay=1000] - Delay between retries in ms
 * @returns {Promise<string>} - Raw HTML content
 * @throws {Error} - If request fails after all retries
 */
export async function fetchHtml(url, options = {}) {
  const {
    timeout = 30000,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    headers = {},
    maxRetries = 0,
    retryDelay = 1000,
  } = options;

  // Build request configuration
  const config = {
    method: 'GET',
    url,
    timeout,
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      ...headers, // Allow overriding defaults
    },
    validateStatus: null, // Don't throw on any status code
  };

  let lastError;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await axios(config);

      // Handle non-2xx status codes
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      // Handle specific error codes
      if (response.status === 404) {
        throw new Error(`Page not found: ${url} (404)`);
      }

      if (response.status === 403) {
        throw new Error(`Access forbidden: ${url} (403) - Possible bot detection`);
      }

      if (response.status === 429) {
        throw new Error(`Rate limited: ${url} (429) - Too many requests`);
      }

      if (response.status >= 500) {
        throw new Error(`Server error: ${url} (${response.status})`);
      }

      // Other non-2xx status
      throw new Error(`HTTP ${response.status}: ${url}`);

    } catch (error) {
      lastError = error;

      // Handle axios-specific errors
      if (error.code === 'ECONNABORTED') {
        lastError = new Error(`Request timeout after ${timeout}ms: ${url}`);
      } else if (error.code === 'ENOTFOUND') {
        lastError = new Error(`Domain not found: ${url}`);
      } else if (error.code === 'ECONNREFUSED') {
        lastError = new Error(`Connection refused: ${url}`);
      }

      // Retry logic
      if (attempt < maxRetries) {
        attempt++;
        await delay(retryDelay);
        continue;
      }

      // No more retries, throw error
      break;
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Fetch multiple URLs concurrently with rate limiting
 * @param {Array<string>} urls - Array of URLs to fetch
 * @param {Object} [options] - Fetch options (same as fetchHtml)
 * @param {number} [options.concurrency=3] - Max concurrent requests
 * @param {number} [options.delayBetween=1000] - Delay between batches in ms
 * @returns {Promise<Array<{url: string, html: string|null, error: Error|null}>>}
 */
export async function fetchMultiple(urls, options = {}) {
  const {
    concurrency = 3,
    delayBetween = 1000,
    ...fetchOptions
  } = options;

  const results = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (url) => {
      try {
        const html = await fetchHtml(url, fetchOptions);
        return { url, html, error: null };
      } catch (error) {
        return { url, html: null, error };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay before next batch (except for last batch)
    if (i + concurrency < urls.length) {
      await delay(delayBetween);
    }
  }

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

/**
 * Generate random User-Agent string
 * @returns {string} - Random User-Agent
 */
export function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export default {
  fetchHtml,
  fetchMultiple,
  getRandomUserAgent,
};

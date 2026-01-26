/**
 * HTML Parser Utility
 * Provides DOM-like querying capabilities for HTML strings
 */

import * as cheerio from 'cheerio';

/**
 * Parse HTML string into queryable DOM structure
 * @param {string} html - Raw HTML content
 * @param {Object} [options] - Cheerio options
 * @returns {Object} - Cheerio instance with query methods
 */
export function parseHtml(html, options = {}) {
  if (!html || typeof html !== 'string') {
    throw new Error('HTML must be a non-empty string');
  }

  const defaultOptions = {
    xml: false,
    decodeEntities: true,
    ...options,
  };

  return cheerio.load(html, defaultOptions);
}

/**
 * Query HTML and extract text content
 * @param {string} html - Raw HTML content
 * @param {string} selector - CSS selector
 * @returns {Array<string>} - Array of text content from matching elements
 */
export function queryText(html, selector) {
  const $ = parseHtml(html);
  const results = [];

  $(selector).each((i, element) => {
    const text = $(element).text().trim();
    if (text) {
      results.push(text);
    }
  });

  return results;
}

/**
 * Query HTML and extract attribute values
 * @param {string} html - Raw HTML content
 * @param {string} selector - CSS selector
 * @param {string} attribute - Attribute name to extract
 * @returns {Array<string>} - Array of attribute values
 */
export function queryAttribute(html, selector, attribute) {
  const $ = parseHtml(html);
  const results = [];

  $(selector).each((i, element) => {
    const value = $(element).attr(attribute);
    if (value) {
      results.push(value);
    }
  });

  return results;
}

/**
 * Query HTML and extract structured data
 * @param {string} html - Raw HTML content
 * @param {string} selector - CSS selector for container elements
 * @param {Object} schema - Schema defining what to extract
 * @param {Object} schema.[field] - Field name and CSS selector
 * @returns {Array<Object>} - Array of extracted objects
 * 
 * @example
 * queryStructured(html, '.job-card', {
 *   title: { selector: '.job-title', type: 'text' },
 *   url: { selector: 'a.job-link', type: 'attr', attr: 'href' }
 * })
 */
export function queryStructured(html, selector, schema) {
  const $ = parseHtml(html);
  const results = [];

  $(selector).each((i, container) => {
    const $container = $(container);
    const item = {};

    for (const [field, config] of Object.entries(schema)) {
      const $element = config.selector ? $container.find(config.selector) : $container;

      if (config.type === 'text') {
        item[field] = $element.text().trim() || null;
      } else if (config.type === 'html') {
        item[field] = $element.html() || null;
      } else if (config.type === 'attr') {
        item[field] = $element.attr(config.attr) || null;
      } else if (config.type === 'exists') {
        item[field] = $element.length > 0;
      }
    }

    results.push(item);
  });

  return results;
}

/**
 * Check if selector exists in HTML
 * @param {string} html - Raw HTML content
 * @param {string} selector - CSS selector
 * @returns {boolean} - True if selector matches at least one element
 */
export function exists(html, selector) {
  const $ = parseHtml(html);
  return $(selector).length > 0;
}

/**
 * Count matching elements
 * @param {string} html - Raw HTML content
 * @param {string} selector - CSS selector
 * @returns {number} - Number of matching elements
 */
export function count(html, selector) {
  const $ = parseHtml(html);
  return $(selector).length;
}

/**
 * Extract all links from HTML
 * @param {string} html - Raw HTML content
 * @param {string} [baseUrl] - Base URL for resolving relative links
 * @returns {Array<string>} - Array of absolute URLs
 */
export function extractLinks(html, baseUrl) {
  const $ = parseHtml(html);
  const links = [];

  $('a[href]').each((i, element) => {
    let href = $(element).attr('href');
    
    if (href) {
      // Resolve relative URLs if baseUrl provided
      if (baseUrl && !href.startsWith('http')) {
        try {
          href = new URL(href, baseUrl).toString();
        } catch (e) {
          // Invalid URL, skip
          return;
        }
      }
      
      links.push(href);
    }
  });

  return [...new Set(links)]; // Remove duplicates
}

/**
 * Remove unwanted elements from HTML
 * @param {string} html - Raw HTML content
 * @param {Array<string>} selectors - CSS selectors to remove
 * @returns {string} - Cleaned HTML
 */
export function removeElements(html, selectors) {
  const $ = parseHtml(html);
  
  selectors.forEach(selector => {
    $(selector).remove();
  });
  
  return $.html();
}

/**
 * Extract all text content (strips HTML tags)
 * @param {string} html - Raw HTML content
 * @param {Array<string>} [ignoreSelectors] - Selectors to exclude
 * @returns {string} - Plain text content
 */
export function extractText(html, ignoreSelectors = []) {
  let cleanedHtml = html;
  
  if (ignoreSelectors.length > 0) {
    cleanedHtml = removeElements(html, ignoreSelectors);
  }
  
  const $ = parseHtml(cleanedHtml);
  return $('body').text().replace(/\s+/g, ' ').trim();
}

export default {
  parseHtml,
  queryText,
  queryAttribute,
  queryStructured,
  exists,
  count,
  extractLinks,
  removeElements,
  extractText,
};

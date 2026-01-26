/**
 * Job Data Processing Utility
 * Cleans, normalizes, and deduplicates job data
 */

/**
 * Trim and normalize string fields
 * @param {string|null} value - String value to normalize
 * @returns {string|null} - Normalized string or null
 */
function normalizeString(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  return value
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with space
    || null;
}

/**
 * Normalize company name
 * @param {string|null} company - Company name
 * @returns {string|null} - Normalized company name
 */
function normalizeCompanyName(company) {
  if (!company) return null;
  
  return normalizeString(company)
    ?.replace(/\(.*?\)/g, '') // Remove text in parentheses like "(123 reviews)"
    .trim() || null;
}

/**
 * Normalize location string
 * @param {string|null} location - Location string
 * @returns {string|null} - Normalized location
 */
function normalizeLocation(location) {
  if (!location) return null;
  
  let normalized = normalizeString(location);
  
  // Common patterns to clean
  if (normalized) {
    normalized = normalized
      .replace(/^in\s+/i, '') // Remove "in " prefix
      .replace(/•/g, ',') // Replace bullet points with comma
      .trim();
  }
  
  return normalized;
}

/**
 * Ensure URL is absolute
 * @param {string|null} url - Relative or absolute URL
 * @param {string} baseUrl - Base URL to resolve against
 * @returns {string|null} - Absolute URL or null
 */
function absoluteUrl(url, baseUrl = 'https://www.indeed.com') {
  if (!url) return null;
  
  try {
    // Already absolute
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Relative URL
    const absolute = new URL(url, baseUrl);
    return absolute.toString();
  } catch (error) {
    return null;
  }
}

/**
 * Clean a single job object
 * @param {Object} job - Raw job object
 * @param {Object} [options] - Processing options
 * @param {string} [options.baseUrl] - Base URL for resolving relative URLs
 * @returns {Object} - Cleaned job object
 */
export function cleanJob(job, options = {}) {
  const { baseUrl = 'https://www.indeed.com' } = options;
  
  return {
    jobId: normalizeString(job.jobId),
    title: normalizeString(job.title),
    company: normalizeCompanyName(job.company),
    location: normalizeLocation(job.location),
    jobUrl: absoluteUrl(job.jobUrl, baseUrl),
    salary: normalizeString(job.salary),
    snippet: normalizeString(job.snippet),
    // Preserve additional fields if any
    ...Object.keys(job).reduce((acc, key) => {
      if (!['jobId', 'title', 'company', 'location', 'jobUrl', 'salary', 'snippet', 'rawHtml'].includes(key)) {
        acc[key] = job[key];
      }
      return acc;
    }, {}),
  };
}

/**
 * Clean multiple job objects
 * @param {Array<Object>} jobs - Array of raw job objects
 * @param {Object} [options] - Processing options
 * @returns {Array<Object>} - Array of cleaned job objects
 */
export function cleanJobs(jobs, options = {}) {
  if (!Array.isArray(jobs)) {
    throw new Error('jobs must be an array');
  }
  
  return jobs.map(job => cleanJob(job, options));
}

/**
 * Remove duplicate jobs based on job ID or URL
 * @param {Array<Object>} jobs - Array of job objects
 * @param {string} [dedupeBy='jobId'] - Field to deduplicate by ('jobId', 'jobUrl', or 'both')
 * @returns {Array<Object>} - Array without duplicates
 */
export function removeDuplicates(jobs, dedupeBy = 'jobId') {
  if (!Array.isArray(jobs)) {
    throw new Error('jobs must be an array');
  }
  
  const seen = new Set();
  const unique = [];
  
  for (const job of jobs) {
    let key;
    
    if (dedupeBy === 'jobId') {
      key = job.jobId;
    } else if (dedupeBy === 'jobUrl') {
      key = job.jobUrl;
    } else if (dedupeBy === 'both') {
      key = `${job.jobId}|${job.jobUrl}`;
    } else {
      key = job.jobId || job.jobUrl;
    }
    
    if (!key || seen.has(key)) {
      continue;
    }
    
    seen.add(key);
    unique.push(job);
  }
  
  return unique;
}

/**
 * Filter out invalid jobs
 * @param {Array<Object>} jobs - Array of job objects
 * @returns {Array<Object>} - Array of valid job objects
 */
export function filterValidJobs(jobs) {
  if (!Array.isArray(jobs)) {
    throw new Error('jobs must be an array');
  }
  
  return jobs.filter(job => {
    // Must have at least title and company
    if (!job.title && !job.company) {
      return false;
    }
    
    // Must have a valid job URL or job ID
    if (!job.jobUrl && !job.jobId) {
      return false;
    }
    
    return true;
  });
}

/**
 * Process job data: clean, deduplicate, and validate
 * @param {Array<Object>} jobs - Array of raw job objects
 * @param {Object} [options] - Processing options
 * @param {string} [options.baseUrl] - Base URL for resolving relative URLs
 * @param {string} [options.dedupeBy='jobId'] - Field to deduplicate by
 * @param {boolean} [options.removeInvalid=true] - Remove invalid jobs
 * @returns {Object} - Processing result with cleaned jobs and stats
 */
export function processJobs(jobs, options = {}) {
  const {
    baseUrl = 'https://www.indeed.com',
    dedupeBy = 'jobId',
    removeInvalid = true,
  } = options;
  
  const originalCount = jobs.length;
  
  // Step 1: Clean jobs
  let processed = cleanJobs(jobs, { baseUrl });
  
  // Step 2: Remove duplicates
  const beforeDedup = processed.length;
  processed = removeDuplicates(processed, dedupeBy);
  const duplicatesRemoved = beforeDedup - processed.length;
  
  // Step 3: Filter invalid jobs
  let invalidCount = 0;
  if (removeInvalid) {
    const beforeFilter = processed.length;
    processed = filterValidJobs(processed);
    invalidCount = beforeFilter - processed.length;
  }
  
  return {
    jobs: processed,
    stats: {
      original: originalCount,
      duplicates: duplicatesRemoved,
      invalid: invalidCount,
      final: processed.length,
    },
  };
}

/**
 * Sort jobs by relevance or date
 * @param {Array<Object>} jobs - Array of job objects
 * @param {string} [sortBy='title'] - Field to sort by
 * @param {string} [order='asc'] - Sort order ('asc' or 'desc')
 * @returns {Array<Object>} - Sorted array
 */
export function sortJobs(jobs, sortBy = 'title', order = 'asc') {
  if (!Array.isArray(jobs)) {
    throw new Error('jobs must be an array');
  }
  
  const sorted = [...jobs].sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    
    if (typeof aVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
  
  return sorted;
}

export default {
  cleanJob,
  cleanJobs,
  removeDuplicates,
  filterValidJobs,
  processJobs,
  sortJobs,
};

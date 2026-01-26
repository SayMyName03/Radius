/**
 * Indeed URL Builder Utility
 * Constructs valid Indeed search URLs with proper encoding
 */

/**
 * Build Indeed job search URL
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Job title or search keyword
 * @param {string} params.location - City, state, or zip code
 * @param {number} [params.start=0] - Start index for pagination (0, 10, 20, ...)
 * @param {Object} [params.filters] - Additional filters
 * @param {string} [params.filters.radius] - Search radius in miles
 * @param {string} [params.filters.jobType] - Job type (fulltime, parttime, contract, etc.)
 * @param {string} [params.filters.experience] - Experience level
 * @param {string} [params.filters.datePosted] - Date posted filter (1, 3, 7, 14)
 * @returns {string} - Constructed Indeed search URL
 */
export function buildIndeedSearchUrl(params) {
  const {
    keyword,
    location,
    start = 0,
    filters = {},
  } = params;

  // Validate required parameters
  if (!keyword || typeof keyword !== 'string') {
    throw new Error('keyword is required and must be a string');
  }

  if (!location || typeof location !== 'string') {
    throw new Error('location is required and must be a string');
  }

  // Base URL - defaults to Indian Indeed
  const baseUrl = filters.baseUrl || 'https://in.indeed.com/jobs';
  const url = new URL(baseUrl);

  // Core search parameters
  url.searchParams.set('q', keyword.trim());
  url.searchParams.set('l', location.trim());

  // Pagination (Indeed uses 10 results per page)
  if (start > 0) {
    url.searchParams.set('start', start.toString());
  }

  // Optional filters
  if (filters.radius) {
    url.searchParams.set('radius', filters.radius);
  }

  if (filters.jobType) {
    url.searchParams.set('jt', filters.jobType);
  }

  if (filters.experience) {
    url.searchParams.set('explvl', filters.experience);
  }

  if (filters.datePosted) {
    url.searchParams.set('fromage', filters.datePosted);
  }

  // Sort by date (most recent first)
  url.searchParams.set('sort', 'date');

  return url.toString();
}

/**
 * Build Indeed company page URL
 * @param {string} companyName - Company name
 * @returns {string} - Indeed company page URL
 */
export function buildIndeedCompanyUrl(companyName) {
  if (!companyName || typeof companyName !== 'string') {
    throw new Error('companyName is required and must be a string');
  }

  const baseUrl = 'https://www.indeed.com/cmp';
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseUrl}/${encodeURIComponent(slug)}`;
}

/**
 * Calculate pagination start index
 * @param {number} page - Page number (1-indexed)
 * @param {number} [resultsPerPage=10] - Results per page
 * @returns {number} - Start index for API
 */
export function calculateStartIndex(page, resultsPerPage = 10) {
  if (typeof page !== 'number' || page < 1) {
    throw new Error('page must be a positive number');
  }

  return (page - 1) * resultsPerPage;
}

/**
 * Parse Indeed job ID from URL
 * @param {string} url - Indeed job URL
 * @returns {string|null} - Job ID or null if not found
 */
export function extractJobId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Indeed job URLs typically: /viewjob?jk=<jobId> or /rc/clk?jk=<jobId>
  const match = url.match(/[?&]jk=([a-f0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Build full Indeed job URL from job ID
 * @param {string} jobId - Indeed job ID
 * @returns {string} - Full job URL
 */
export function buildJobUrl(jobId) {
  if (!jobId || typeof jobId !== 'string') {
    throw new Error('jobId is required and must be a string');
  }

  return `https://www.indeed.com/viewjob?jk=${encodeURIComponent(jobId)}`;
}

export default {
  buildIndeedSearchUrl,
  buildIndeedCompanyUrl,
  calculateStartIndex,
  extractJobId,
  buildJobUrl,
};

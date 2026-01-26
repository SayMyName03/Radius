/**
 * ROUTES
 * 
 * Purpose: Define API endpoints and map them to controllers
 * Responsibilities:
 * - Define HTTP methods and paths
 * - Apply route-specific middleware (auth, validation)
 * - Group related endpoints
 * - API versioning
 * 
 * Already includes:
 * - index.js              → Route aggregator
 * - health.routes.js      → Health check endpoint
 * 
 * Future additions:
 * - lead.routes.js        → /api/v1/leads
 * - job.routes.js         → /api/v1/jobs (scraping jobs)
 * - auth.routes.js        → /api/v1/auth
 * 
 * Pattern:
 * Route → Middleware → Controller → Service → Model
 */

// This file serves as documentation.
// Existing route files are in this directory.

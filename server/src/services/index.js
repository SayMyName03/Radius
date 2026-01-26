/**
 * SERVICES
 * 
 * Purpose: Business logic layer
 * Responsibilities:
 * - Implement core business rules
 * - Interact with models (database)
 * - Coordinate between different data sources
 * - Transform and validate data
 * - Reusable across controllers and jobs
 * 
 * Services are called by:
 * - Controllers (for HTTP requests)
 * - Jobs (for background tasks)
 * - Other services
 * 
 * Available services:
 * - leadService.js        → Lead CRUD and business logic
 * - jobService.js         → Scraping job management
 * - systemService.js      → System operations and monitoring
 * - preparationService.js → LLM-powered interview prep guide generation
 */

export { default as leadService } from './leadService.js';
export { default as jobService } from './jobService.js';
export { default as systemService } from './systemService.js';
export { default as preparationService } from './preparationService.js';

/**
 * MODELS
 * 
 * Purpose: Database schema definitions and data access layer
 * Responsibilities:
 * - Define data structure and validation rules
 * - Database interactions (CRUD operations)
 * - Schema methods and virtuals
 * - Pre/post hooks for data lifecycle
 * - Relationships between entities
 * 
 * Available models:
 * - User.js              → User authentication and profile data
 * - Lead.js              → Lead/contact data schema
 * - ScrapeJob.js         → Scraping job configuration schema
 */

export { default as User } from './User.js';
export { default as Lead } from './Lead.js';
export { default as ScrapeJob } from './ScrapeJob.js';

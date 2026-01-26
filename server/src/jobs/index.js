/**
 * JOBS (Background Tasks)
 * 
 * Purpose: Execute long-running or scheduled tasks outside HTTP lifecycle
 * Responsibilities:
 * - Scheduled scraping jobs (cron-like)
 * - Data processing pipelines
 * - Cleanup/maintenance tasks
 * - Email queue processing
 * - Report generation
 * 
 * Technologies to integrate:
 * - node-cron (for scheduling)
 * - Bull/BullMQ (for queue management)
 * - Agenda (MongoDB-backed job scheduler)
 * 
 * Available job runners:
 * - scrapeJobRunner.js    → Execute scraping jobs with progress tracking
 */

export { executeJob, executeMultipleJobs } from './scrapeJobRunner.js';

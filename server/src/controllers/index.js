/**
 * CONTROLLERS
 * 
 * Purpose: Handle HTTP request/response cycle
 * Responsibilities:
 * - Extract data from req (body, params, query)
 * - Call appropriate service methods
 * - Return formatted responses to client
 * - Handle input validation (with middleware)
 * 
 * Pattern: Thin controllers, fat services
 * Controllers should NOT contain business logic.
 * 
 * Available controllers:
 * - leadController.js     → Lead management
 * - jobController.js      → Scraping job management
 * - systemController.js   → System operations
 * - preparationController.js → Interview prep guide generation
 */

export { leadController } from './leadController.js';
export { jobController } from './jobController.js';
export { systemController } from './systemController.js';
export { preparationController } from './preparationController.js';

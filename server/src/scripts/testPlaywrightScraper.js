/**
 * Test Script for Playwright Indeed Scraper
 * 
 * Purpose: Validate that Playwright scraper works correctly
 * 
 * Usage:
 *   node src/scripts/testPlaywrightScraper.js
 */

import { PlaywrightIndeedScraper } from '../scrapers/PlaywrightIndeedScraper.js';

async function testScraper() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Playwright Scraper Test');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Create scraper instance
  // Set headless: false to see the browser window (useful for learning)
  const scraper = new PlaywrightIndeedScraper({
    baseUrl: 'https://in.indeed.com',
    headless: true, // Set to false to watch the browser
    timeout: 60000,
    delayBetweenRequests: 2000,
  });
  
  // Test parameters
  const params = {
    keyword: 'Software Engineer',
    location: 'Bengaluru',
    maxPages: 1, // Test with just 1 page
    onProgress: (progress) => {
      console.log(`Progress: Page ${progress.currentPage}/${progress.totalPages} - ${progress.jobsFound} jobs found`);
    },
  };
  
  try {
    // Validate parameters
    const validation = scraper.validateParams(params);
    if (!validation.isValid) {
      console.error('Invalid parameters:', validation.errors);
      return;
    }
    
    console.log('Starting scrape...\n');
    console.log('Parameters:');
    console.log(`  Keyword:  ${params.keyword}`);
    console.log(`  Location: ${params.location}`);
    console.log(`  Pages:    ${params.maxPages}\n`);
    
    // Execute scraping
    const jobs = await scraper.scrape(params);
    
    // Display results
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Results');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log(`Total jobs extracted: ${jobs.length}\n`);
    
    if (jobs.length > 0) {
      console.log('Sample jobs:\n');
      jobs.slice(0, 3).forEach((job, i) => {
        console.log(`${i + 1}. ${job.title}`);
        console.log(`   Company: ${job.company}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   URL: ${job.jobUrl}`);
        console.log();
      });
    }
    
    // Display statistics
    const stats = scraper.getStats();
    console.log('Statistics:');
    console.log(`  Requests made: ${stats.requestsMade}`);
    console.log(`  Successful: ${stats.successfulRequests}`);
    console.log(`  Failed: ${stats.failedRequests}`);
    console.log(`  Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.forEach(err => {
        console.log(`  - ${err.message}`);
      });
    }
    
    console.log('\n✓ Test completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testScraper();

# Playwright Browser Automation Setup

## Overview

This project now includes **Playwright** for browser automation, allowing you to scrape JavaScript-rendered websites that traditional HTTP scraping (axios + cheerio) cannot handle effectively.

## What is Playwright?

Playwright is a Node.js library that provides a high-level API to control Chromium, Firefox, and WebKit browsers. It allows you to:

- **Automate real browsers** (not just HTTP requests)
- **Execute JavaScript** in web pages
- **Wait for dynamic content** to load
- **Interact with pages** (click, type, scroll)
- **Take screenshots** for debugging
- **Handle modern web technologies** (React, Vue, Angular, etc.)

## When to Use Each Scraper

### Use **Playwright** (`usePlaywright: true`) when:
- ✅ Website uses JavaScript to render content (React, Vue, Angular, etc.)
- ✅ Content appears after page load (lazy loading, infinite scroll)
- ✅ Site requires interaction (clicking buttons, filling forms)
- ✅ You need to handle AJAX requests or SPAs (Single Page Applications)

### Use **axios + cheerio** (`usePlaywright: false`) when:
- ✅ Website serves complete HTML from the server
- ✅ No JavaScript is needed to view the content
- ✅ You need faster scraping (no browser overhead)
- ✅ Simple static pages

## Installation

Playwright has already been installed in this project. If you need to reinstall:

```bash
cd server
npm install playwright
npx playwright install chromium
```

The `playwright install chromium` command downloads the Chromium browser (~170MB).

## Architecture

### File Structure

```
server/src/
├── scrapers/
│   ├── IndeedScraper.js           # HTTP scraper (axios + cheerio)
│   ├── PlaywrightIndeedScraper.js # Browser scraper (Playwright)
│   └── index.js
├── jobs/
│   └── scrapeJobRunner.js         # Orchestrates scraping jobs
├── controllers/
│   └── devController.js           # API endpoints
└── scripts/
    └── testPlaywrightScraper.js   # Test script
```

### How It Works

1. **Frontend** sends scrape request with `usePlaywright: true/false`
2. **API Controller** (`devController.js`) receives the request
3. **Job Runner** (`scrapeJobRunner.js`) selects appropriate scraper
4. **Scraper** executes and returns data
5. **Response** sent back to frontend

## Playwright Scraper - Code Walkthrough

### Step 1: Initialize Browser

```javascript
// Launch a Chromium browser instance
this.browser = await chromium.launch({
  headless: true, // Set to false to see the browser window
});

// Create a browser context (like an incognito window)
const context = await this.browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 ...',
});

// Create a new page (tab)
this.page = await context.newPage();
```

**Learning Note:** Browser contexts are isolated - cookies, storage, and session data don't mix between contexts.

### Step 2: Navigate to URL

```javascript
// Navigate and wait for page to load
await this.page.goto(url, {
  waitUntil: 'domcontentloaded', // Wait for DOM to be ready
  timeout: 60000,
});

// Give JavaScript time to render content
await this.page.waitForTimeout(2000);
```

**Learning Note:** Different `waitUntil` options:
- `'load'`: Wait for load event (default)
- `'domcontentloaded'`: Wait for DOM (faster)
- `'networkidle'`: Wait for all network requests (slowest, most complete)

### Step 3: Wait for Content

```javascript
// Wait for job listings to appear
await this.page.waitForSelector('.job_seen_beacon', {
  state: 'visible',
  timeout: 10000,
});
```

**Learning Note:** This ensures JavaScript has finished rendering before we try to extract data.

### Step 4: Extract Data

```javascript
// Execute JavaScript in the browser context
const jobs = await this.page.evaluate(() => {
  // This code runs IN THE BROWSER, not Node.js!
  const jobCards = document.querySelectorAll('.job_seen_beacon');
  
  const data = [];
  jobCards.forEach(card => {
    const title = card.querySelector('.jobTitle')?.textContent.trim();
    const company = card.querySelector('.companyName')?.textContent.trim();
    // ... extract more fields
    
    data.push({ title, company });
  });
  
  return data; // Sent back to Node.js
});
```

**Learning Note:** `page.evaluate()` runs JavaScript in the page context. You can access `document`, `window`, and all DOM APIs. The function must return serializable data (no DOM elements).

### Step 5: Cleanup

```javascript
// ALWAYS close the browser when done
await this.browser.close();
```

**Learning Note:** Failing to close the browser will cause memory leaks and zombie processes.

## Using the Playwright Scraper

### From the Frontend

1. Go to "Create Scrape Job"
2. Check the **"Use Playwright Browser Automation"** checkbox
3. Configure your search parameters
4. Click "Start Scraping"

### From the API

```bash
curl -X POST http://localhost:5000/api/v1/dev/scrape/indeed \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "Software Engineer",
    "location": "Bengaluru",
    "maxPages": 2,
    "usePlaywright": true,
    "headless": true
  }'
```

### From a Test Script

```bash
cd server
node src/scripts/testPlaywrightScraper.js
```

## Configuration Options

### Headless Mode

- `headless: true` - No visible browser window (faster, for production)
- `headless: false` - Shows browser window (useful for debugging and learning)

### Timeout

```javascript
{
  timeout: 60000, // 60 seconds max per operation
}
```

### Delays

```javascript
{
  delayBetweenRequests: 2000, // 2 seconds between pages (be respectful)
}
```

## Debugging Tips

### 1. Disable Headless Mode

Set `headless: false` to watch the browser in action:

```javascript
const scraper = new PlaywrightIndeedScraper({
  headless: false,
});
```

### 2. Take Screenshots

```javascript
await this.page.screenshot({ 
  path: './debug.png', 
  fullPage: true 
});
```

### 3. Slow Down Actions

Add a delay between operations:

```javascript
this.browser = await chromium.launch({
  headless: false,
  slowMo: 100, // 100ms delay between actions
});
```

### 4. Console Logs

Playwright shows browser console logs in your terminal by default.

## Performance Comparison

| Feature | axios + cheerio | Playwright |
|---------|----------------|------------|
| Speed | ⚡ Fast (1-2s per page) | 🐢 Slower (5-10s per page) |
| JavaScript | ❌ Cannot execute | ✅ Full execution |
| Memory | 💚 Low (~50MB) | 🟡 Higher (~200MB) |
| Complexity | 💚 Simple | 🟡 More complex |
| Reliability | 🟡 Depends on site | ✅ Very reliable |
| Best For | Static HTML | JS-rendered content |

## Common Issues & Solutions

### Issue: Timeout errors

**Solution:** Increase timeout or use faster `waitUntil` option:

```javascript
await this.page.goto(url, {
  waitUntil: 'domcontentloaded', // Instead of 'networkidle'
  timeout: 120000, // Increase timeout
});
```

### Issue: Elements not found

**Solution:** Increase wait time after navigation:

```javascript
await this.page.goto(url);
await this.page.waitForTimeout(3000); // Wait 3 seconds
```

### Issue: Browser doesn't close

**Solution:** Always use try/finally:

```javascript
try {
  await scraper.initialize();
  const results = await scraper.scrape(params);
} finally {
  await scraper.cleanup(); // Always runs
}
```

## Educational Resources

### Official Playwright Documentation
- https://playwright.dev/docs/intro

### Key Concepts to Learn
1. **Browser Contexts** - Isolation between scraping sessions
2. **Page Objects** - Representing browser tabs
3. **Selectors** - Finding elements (CSS, XPath, text)
4. **Waiting Strategies** - When to wait for content
5. **Page Evaluation** - Running JavaScript in the page

### Recommended Learning Path
1. ✅ Run the test script and observe output
2. ✅ Set `headless: false` and watch the browser
3. ✅ Modify selectors and see what breaks
4. ✅ Try scraping different websites
5. ✅ Read Playwright documentation

## Legal & Ethical Considerations

⚠️ **IMPORTANT**: This setup is for **educational purposes only**.

Before scraping any website:
1. ✅ Check the website's `robots.txt` file
2. ✅ Review their Terms of Service
3. ✅ Respect rate limits and add delays
4. ✅ Only scrape publicly available data
5. ✅ Don't overwhelm servers with requests

## Next Steps

### To expand this project, consider:

1. **Add more scrapers** for different websites
2. **Implement proxy rotation** for large-scale scraping
3. **Add captcha handling** (using services like 2captcha)
4. **Create a job queue** for background scraping
5. **Store results in MongoDB** (currently running without DB)
6. **Add pagination handling** for infinite scroll
7. **Implement screenshot capture** on errors

## Summary

You now have two scraping methods available:

1. **HTTP Scraper** (axios + cheerio) - Fast, simple, for static sites
2. **Browser Scraper** (Playwright) - Slower, powerful, for JavaScript sites

Choose based on the target website's technology. When in doubt, start with Playwright to ensure you capture all content.

Happy learning! 🚀

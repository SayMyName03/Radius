/**
 * Database Seeding Script
 * Populates the database with sample data for development/testing
 */

import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Lead, ScrapeJob } from '../models/index.js';

const sampleJobs = [
  {
    name: 'LinkedIn Tech Companies Scrape',
    targetUrl: 'https://www.linkedin.com/search/results/companies/',
    keywords: ['saas', 'b2b', 'software', 'technology'],
    maxPages: 10,
    status: 'completed',
    startedAt: new Date('2026-01-10T09:00:00Z'),
    completedAt: new Date('2026-01-10T09:45:00Z'),
    progress: {
      currentPage: 10,
      totalPages: 10,
      leadsFound: 47,
      percentage: 100,
    },
    results: {
      totalLeads: 47,
      duplicates: 3,
      errors: 0,
      duration: 2700,
    },
  },
  {
    name: 'Y Combinator Startups',
    targetUrl: 'https://www.ycombinator.com/companies',
    keywords: ['startup', 'seed', 'series-a'],
    maxPages: 20,
    status: 'running',
    startedAt: new Date('2026-01-15T08:30:00Z'),
    progress: {
      currentPage: 12,
      totalPages: 20,
      leadsFound: 28,
      percentage: 60,
    },
    results: {
      totalLeads: 28,
      duplicates: 1,
      errors: 0,
      duration: 0,
    },
  },
  {
    name: 'Product Hunt Makers',
    targetUrl: 'https://www.producthunt.com/makers',
    keywords: ['product', 'founder', 'indie'],
    maxPages: 5,
    status: 'pending',
    progress: {
      currentPage: 0,
      totalPages: 5,
      leadsFound: 0,
      percentage: 0,
    },
    schedule: {
      enabled: true,
      cron: '0 9 * * 1',
      nextRun: new Date('2026-01-20T09:00:00Z'),
    },
  },
];

const sampleLeads = [
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@techvision.io',
    phone: '+1 (555) 123-4567',
    company: 'TechVision AI',
    location: 'San Francisco, CA',
    status: 'qualified',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/sarahchen',
    notes: 'CEO of AI startup, interested in B2B automation tools.',
    metadata: {
      title: 'CEO & Founder',
      employees: '25-50',
      industry: 'Artificial Intelligence',
      funding: 'Series A',
    },
  },
  {
    name: 'Marcus Rodriguez',
    email: 'marcus@cloudscale.com',
    phone: '+1 (555) 234-5678',
    company: 'CloudScale Solutions',
    location: 'Austin, TX',
    status: 'new',
    source: 'Y Combinator',
    sourceUrl: 'https://ycombinator.com/companies/cloudscale',
    metadata: {
      title: 'CTO',
      employees: '11-25',
      industry: 'Cloud Infrastructure',
      funding: 'Seed',
    },
  },
  {
    name: 'Emily Watson',
    email: 'emily.watson@designlab.co',
    phone: '+44 20 1234 5678',
    company: 'DesignLab Studio',
    location: 'London, UK',
    status: 'contacted',
    source: 'Product Hunt',
    sourceUrl: 'https://producthunt.com/@emilywatson',
    notes: 'Founder of design tool startup. Follow up next week.',
    metadata: {
      title: 'Founder & Creative Director',
      employees: '5-10',
      industry: 'Design Software',
      funding: 'Bootstrapped',
    },
  },
  {
    name: 'David Kim',
    email: 'dkim@fintech-ventures.com',
    phone: '+1 (555) 345-6789',
    company: 'FinTech Ventures',
    location: 'New York, NY',
    status: 'converted',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/davidkim',
    notes: 'Signed contract on Jan 12. Onboarding in progress.',
    metadata: {
      title: 'VP of Operations',
      employees: '100-250',
      industry: 'Financial Technology',
      funding: 'Series B',
    },
  },
  {
    name: 'Lisa Anderson',
    email: 'l.anderson@healthtech.io',
    phone: '+1 (555) 456-7890',
    company: 'HealthTech Innovations',
    location: 'Boston, MA',
    status: 'new',
    source: 'Y Combinator',
    sourceUrl: 'https://ycombinator.com/companies/healthtech',
    metadata: {
      title: 'Head of Product',
      employees: '50-100',
      industry: 'Healthcare Technology',
      funding: 'Series A',
    },
  },
  {
    name: 'James Mitchell',
    email: 'james@ecommerce-platform.com',
    phone: '+1 (555) 567-8901',
    company: 'E-Commerce Platform Inc',
    location: 'Seattle, WA',
    status: 'qualified',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/jamesmitchell',
    notes: 'Interested in lead gen tools. Scheduled demo for Jan 20.',
    metadata: {
      title: 'CMO',
      employees: '250-500',
      industry: 'E-Commerce',
      funding: 'Series C',
    },
  },
  {
    name: 'Priya Sharma',
    email: 'priya@datainsights.ai',
    phone: '+91 98765 43210',
    company: 'DataInsights AI',
    location: 'Bangalore, India',
    status: 'new',
    source: 'Product Hunt',
    sourceUrl: 'https://producthunt.com/@priyasharma',
    metadata: {
      title: 'Founder',
      employees: '10-25',
      industry: 'Data Analytics',
      funding: 'Seed',
    },
  },
  {
    name: 'Robert Taylor',
    email: 'rtaylor@cybersec-solutions.com',
    phone: '+1 (555) 678-9012',
    company: 'CyberSec Solutions',
    location: 'Washington, DC',
    status: 'contacted',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/roberttaylor',
    notes: 'Security concerns addressed. Waiting for approval from legal.',
    metadata: {
      title: 'Director of Security',
      employees: '100-250',
      industry: 'Cybersecurity',
      funding: 'Series B',
    },
  },
  {
    name: 'Olivia Brown',
    email: 'olivia@martech-tools.io',
    phone: '+1 (555) 789-0123',
    company: 'MarTech Tools',
    location: 'Los Angeles, CA',
    status: 'disqualified',
    source: 'Y Combinator',
    sourceUrl: 'https://ycombinator.com/companies/martech-tools',
    notes: 'Budget constraints. Not a fit at this time.',
    metadata: {
      title: 'Marketing Director',
      employees: '25-50',
      industry: 'Marketing Technology',
      funding: 'Seed',
    },
  },
  {
    name: 'Ahmed Hassan',
    email: 'ahmed@edtech-platform.com',
    phone: '+971 50 123 4567',
    company: 'EdTech Platform',
    location: 'Dubai, UAE',
    status: 'new',
    source: 'Product Hunt',
    sourceUrl: 'https://producthunt.com/@ahmedhassan',
    metadata: {
      title: 'CEO',
      employees: '50-100',
      industry: 'Education Technology',
      funding: 'Series A',
    },
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('Clearing existing data...');
    await Lead.deleteMany({});
    await ScrapeJob.deleteMany({});
    console.log('✓ Cleared existing data\n');

    // Insert scrape jobs
    console.log('Inserting scrape jobs...');
    const jobs = await ScrapeJob.insertMany(sampleJobs);
    console.log(`✓ Inserted ${jobs.length} scrape jobs\n`);

    // Link some leads to the first job
    const firstJobId = jobs[0]._id;
    sampleLeads.forEach((lead, index) => {
      if (index < 5) {
        lead.jobId = firstJobId;
      }
    });

    // Insert leads
    console.log('Inserting leads...');
    const leads = await Lead.insertMany(sampleLeads);
    console.log(`✓ Inserted ${leads.length} leads\n`);

    // Print summary
    console.log('─────────────────────────────────────────');
    console.log('✅ Seeding completed successfully!');
    console.log('─────────────────────────────────────────');
    console.log(`Scrape Jobs: ${jobs.length}`);
    console.log(`Leads:       ${leads.length}`);
    console.log('─────────────────────────────────────────\n');
    console.log('🔍 View data in MongoDB Atlas:');
    console.log('   Browse Collections → radius database\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Run the seed function
seed();

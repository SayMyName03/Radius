# LLM-Powered Interview Preparation Guide - Setup & Usage

## Overview

This feature integrates OpenAI's GPT-4 to generate personalized interview preparation guides for job leads. When users click "Generate Prep Guide" on a lead, the system analyzes the job details and creates a comprehensive, actionable interview prep plan.

## Features

✅ **AI-Powered Analysis** - Uses GPT-4 to analyze job postings and create tailored prep guides  
✅ **Structured Output** - Organized sections covering all interview aspects  
✅ **On-Demand Generation** - Only generates when explicitly requested (not automatic)  
✅ **Clean UI** - Apple-esque design with expandable sections  
✅ **Error Handling** - Graceful fallbacks for API failures  

## Setup Instructions

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)

### 2. Configure Environment Variable

Edit `server/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important**: Never commit your `.env` file to version control!

### 3. Restart Server

After adding the API key, restart your Node.js server:

```bash
cd server
npm run dev
```

### 4. Test the Feature

1. Open your LeadGen app
2. Click on any lead to open the detail panel
3. Scroll down to the **"AI Interview Prep"** section
4. Click **"Generate Prep Guide"**
5. Wait 5-15 seconds for the AI to generate the guide
6. View your personalized prep guide!

## Architecture

### Backend Stack

```
📁 server/src/
├── services/
│   └── preparationService.js    ← LLM integration & prompt engineering
├── controllers/
│   └── preparationController.js ← HTTP request handling
└── routes/
    └── preparation.routes.js    ← API endpoints
```

**API Endpoint:**
```
POST /api/v1/preparation/generate
```

**Request Body:**
```json
{
  "jobData": {
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "Job description...",
    "location": "San Francisco, CA",
    "skills": ["JavaScript", "React", "Node.js"],
    "salary": "$150k - $200k"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roleOverview": { ... },
    "coreTopics": [ ... ],
    "skillBreakdown": { ... },
    "interviewFocusAreas": { ... },
    "preparationStrategy": { ... },
    "companySpecificTips": [ ... ],
    "keyTakeaways": [ ... ]
  },
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "model": "gpt-4o",
    "tokensUsed": 2341
  }
}
```

### Frontend Components

```
📁 client/src/
├── components/
│   ├── PrepGuide.jsx           ← Display component (modal)
│   └── LeadDetailPanel.jsx     ← Integration point (trigger button)
└── api/
    └── client.js               ← API functions
```

## Prep Guide Structure

Each generated guide contains:

### 1. **Role Overview**
- High-level summary of the position
- Seniority level (Entry/Mid/Senior/Lead)
- Employment type

### 2. **Core Topics**
- Essential topics ranked by importance
- Why each topic matters for this role
- Criticality ratings

### 3. **Skill Breakdown**
- **Must-Know Skills**: Required proficiency levels + interview likelihood
- **Good-to-Have Skills**: Nice-to-have skills + benefits

### 4. **Interview Focus Areas**
- **Technical**: Domain-specific technical knowledge
- **Coding**: Algorithms, data structures, patterns
- **System Design**: Architecture topics (if applicable)
- **Behavioral**: STAR stories to prepare

### 5. **Preparation Strategy**
- Recommended timeline (7-14 days)
- Weekly breakdown with daily activities
- Practice resources prioritized by importance

### 6. **Company-Specific Tips**
- Culture insights
- Interview process expectations
- Research suggestions

### 7. **Key Takeaways**
- Critical success factors
- Top priorities to remember

## Usage in Code

### Generate from Lead ID

```javascript
import { generatePrepGuide } from '../api/client';

const response = await generatePrepGuide({
  leadId: '507f1f77bcf86cd799439011'
});
```

### Generate from Job Data

```javascript
const response = await generatePrepGuide({
  jobData: {
    title: 'Full Stack Developer',
    company: 'Startup Inc',
    description: 'We are looking for...',
    location: 'Remote',
    skills: ['React', 'Node.js', 'MongoDB'],
    salary: '$120k - $160k'
  }
});
```

## Customization

### Adjust LLM Model

Edit `server/src/services/preparationService.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o', // Change to 'gpt-3.5-turbo' for faster/cheaper responses
  // ... other options
});
```

**Model Options:**
- `gpt-4o` - Latest GPT-4 (best quality, slower, more expensive)
- `gpt-4-turbo` - Optimized GPT-4 (good balance)
- `gpt-3.5-turbo` - Faster and cheaper (decent quality)

### Modify Prompt

The prompt is constructed in `buildPrompt()` function. You can:
- Add more context about the company
- Request different output sections
- Adjust tone (formal/casual)
- Include specific examples

### Change UI Theme

Edit `client/src/components/PrepGuide.jsx` to customize:
- Color scheme (currently blue/purple gradient)
- Section layout
- Expand/collapse defaults
- Modal size and behavior

## Error Handling

The feature handles these error scenarios:

| Error | Message | Resolution |
|-------|---------|------------|
| Missing API Key | "Invalid OpenAI API key" | Add `OPENAI_API_KEY` to `.env` |
| Rate Limit | "Rate limit exceeded" | Wait a few minutes or upgrade plan |
| Network Error | "Unable to connect to OpenAI service" | Check internet connection |
| Invalid Job Data | "Missing required job data fields" | Ensure lead has title, company, description |

## Cost Considerations

**OpenAI Pricing (as of 2024):**
- GPT-4o: ~$0.10-0.30 per guide
- GPT-3.5-turbo: ~$0.01-0.03 per guide

**Average tokens per guide:** 2,000-3,000 tokens

**Monthly estimates:**
- 100 guides/month with GPT-4: ~$10-30
- 100 guides/month with GPT-3.5: ~$1-3

💡 **Tip**: Start with `gpt-3.5-turbo` for development/testing, then upgrade to `gpt-4o` for production.

## Security Best Practices

✅ **Do:**
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production
- Implement rate limiting on your endpoint
- Validate user authentication before generation

❌ **Don't:**
- Commit API keys to version control
- Expose API keys in frontend code
- Allow unlimited generation requests
- Skip error handling

## Troubleshooting

### "Invalid OpenAI API key"
- Verify key is correctly copied in `.env`
- Ensure key starts with `sk-`
- Check if key has expired or been revoked
- Restart server after adding key

### "Rate limit exceeded"
- Wait 60 seconds and try again
- Check your OpenAI usage dashboard
- Consider upgrading your OpenAI plan

### Guide takes too long to generate
- Normal: 5-15 seconds
- If longer: Check network connection
- Consider switching to `gpt-3.5-turbo` for faster responses

### UI not showing button
- Check browser console for errors
- Verify lead has required fields (title, company, description)
- Ensure authentication is working

## Future Enhancements

Potential improvements:

- 📝 Save generated guides to database
- 📊 Track generation history per user
- 🔄 Regenerate guides with feedback
- 📧 Email guides to users
- 🎯 Add custom prompts per user
- 💾 Cache guides to avoid regeneration
- 📱 Mobile-optimized view
- 🌐 Multi-language support

## Support

For issues or questions:
1. Check error logs: `server/logs/` (if logging is enabled)
2. Review browser console (F12)
3. Verify `.env` configuration
4. Test API endpoint directly using Postman/Insomnia

---

**Created:** 2024  
**Version:** 1.0.0  
**Dependencies:** OpenAI SDK v4.x, GPT-4/GPT-3.5

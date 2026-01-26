# 🚀 Quick Start - Interview Prep Guide Feature

## Setup (2 minutes)

### 1. Get OpenAI API Key
- Visit https://platform.openai.com/api-keys
- Create new secret key
- Copy the key (starts with `sk-...`)

### 2. Add to Environment
Edit `server/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

### 3. Restart Server
```bash
cd server
npm run dev
```

## Usage

### In the App
1. Open any lead in LeadGen
2. Scroll to **"AI Interview Prep"** section
3. Click **"Generate Prep Guide"**
4. Wait 5-15 seconds
5. View your personalized guide!

### API Endpoint
```bash
POST http://localhost:5000/api/v1/preparation/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "jobData": {
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "Looking for experienced developer...",
    "location": "Remote",
    "skills": ["JavaScript", "React", "Node.js"],
    "salary": "$150k - $200k"
  }
}
```

## What You Get

✅ Role Overview & Level  
✅ Core Topics (ranked by importance)  
✅ Must-Know vs Good-to-Have Skills  
✅ Interview Focus Areas (Technical, Coding, Behavioral, System Design)  
✅ 7-14 Day Prep Strategy  
✅ Company-Specific Tips  
✅ Key Takeaways  

## Cost

- **GPT-4**: ~$0.10-0.30 per guide (best quality)
- **GPT-3.5**: ~$0.01-0.03 per guide (faster, cheaper)

To change model, edit `server/src/services/preparationService.js`:
```javascript
model: 'gpt-3.5-turbo', // Change from 'gpt-4o'
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid API key" | Check `.env` file, restart server |
| "Rate limit exceeded" | Wait 60 seconds, or upgrade OpenAI plan |
| Button not showing | Verify lead has title, company, description |
| Takes too long | Normal: 5-15s. Use GPT-3.5 for faster response |

## Files Modified

**Backend:**
- ✅ `server/src/services/preparationService.js` (NEW)
- ✅ `server/src/controllers/preparationController.js` (NEW)
- ✅ `server/src/routes/preparation.routes.js` (NEW)
- ✅ `server/src/config/index.js` (updated)
- ✅ `server/.env` (updated)

**Frontend:**
- ✅ `client/src/components/PrepGuide.jsx` (NEW)
- ✅ `client/src/components/LeadDetailPanel.jsx` (updated)
- ✅ `client/src/api/client.js` (updated)

## Need Help?

📖 Full documentation: `LLM_PREP_GUIDE_SETUP.md`  
🔍 Check browser console (F12) for errors  
📊 Monitor OpenAI usage: https://platform.openai.com/usage  

---

**Ready to test?** 
1. Add your OpenAI API key to `.env`
2. Restart the server
3. Open any lead and click "Generate Prep Guide"

That's it! 🎉

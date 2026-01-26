import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Generate a personalized interview preparation guide using LLM
 * @param {Object} jobData - Job lead data
 * @param {string} jobData.title - Job title
 * @param {string} jobData.company - Company name
 * @param {string} jobData.description - Job description
 * @param {string} jobData.location - Job location
 * @param {Array<string>} jobData.skills - Required skills
 * @param {string} jobData.salary - Salary range (optional)
 * @returns {Promise<Object>} Structured preparation guide
 */
async function generatePreparationGuide(jobData) {
  try {
    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.description) {
      throw new AppError('Missing required job data fields', 400);
    }

    // Construct a detailed, structured prompt
    const prompt = buildPrompt(jobData);

    // Call Gemini API with JSON output mode
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8000,
        responseMimeType: 'application/json',
      },
    });

    const systemInstruction = `You are an expert career coach and technical interview specialist. Your role is to analyze job postings and create practical, actionable interview preparation guides. Focus on specific, concrete advice rather than generic tips. Structure your responses as valid JSON with the exact format requested.`;
    
    const fullPrompt = `${systemInstruction}\n\n${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const responseText = response.text();

    // Log the raw response for debugging
    console.log('\n=== GEMINI API RESPONSE DEBUG ===');
    console.log('Response length:', responseText.length);
    console.log('Response type:', typeof responseText);
    console.log('First 300 chars:', responseText.substring(0, 300));
    console.log('Last 100 chars:', responseText.substring(Math.max(0, responseText.length - 100)));
    console.log('Full response:', responseText);
    console.log('=== END DEBUG ===\n');

    // Extract and parse JSON from the response
    const prepGuide = extractAndParseJSON(responseText);

    // Validate response structure
    validatePrepGuideStructure(prepGuide);

    return {
      success: true,
      data: prepGuide,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gemini-3-flash-preview',
        tokensUsed: result.response.usageMetadata?.totalTokenCount || 0,
      },
    };
  } catch (error) {
    console.error('Error generating preparation guide:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      response: error.response?.data
    });

    // Handle specific Gemini errors
    if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
      throw new AppError('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.', 500);
    } else if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new AppError(
        'Rate limit exceeded. Please try again later.',
        429
      );
    } else if (error.message?.includes('API has not been used') || error.message?.includes('enable it')) {
      throw new AppError(
        'Gemini API is not enabled. Please enable it in Google Cloud Console.',
        500
      );
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new AppError('Unable to connect to Gemini service', 503);
    } else if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError(`Failed to generate preparation guide: ${error.message}`, 500);
    }
  }
}

/**
 * Build the LLM prompt with structured requirements
 */
function buildPrompt(jobData) {
  const { title, company, description, location, skills, salary } = jobData;

  return `Job: ${title} @ ${company}
${location ? `Location: ${location}` : ''}${salary ? ` | Salary: ${salary}` : ''}
${skills?.length ? `Skills: ${skills.join(', ')}` : ''}

Description:
${description}

Return JSON interview prep guide with this structure:
{
  "roleOverview": {"summary": "2-3 sentences", "level": "Entry/Mid/Senior/Lead", "type": "Full-time/Contract"},
  "coreTopics": [{"topic": "", "importance": "Critical/High/Medium", "description": ""}],
  "skillBreakdown": {
    "mustKnow": [{"skill": "", "proficiency": "", "interviewLikelihood": "High/Medium/Low"}],
    "goodToHave": [{"skill": "", "benefit": ""}]
  },
  "interviewFocusAreas": {"technical": [], "coding": [], "systemDesign": [], "behavioral": []},
  "preparationStrategy": {
    "timeline": "7-14 days",
    "weeklyPlan": [{"phase": "Days X-Y", "focus": "", "activities": []}],
    "practiceResources": [{"type": "", "focus": "", "priority": "High/Medium/Low"}]
  },
  "companySpecificTips": [],
  "keyTakeaways": []
}

Focus: Specific, actionable advice for ${company}. Prioritize interview-likely topics. Return valid JSON only.`;
}

/**
 * Extract and parse JSON from LLM response (handles markdown code blocks)
 */
function extractAndParseJSON(responseText) {
  try {
    // First, try to parse as-is
    return JSON.parse(responseText);
  } catch (e) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error('Failed to parse extracted JSON:', e2);
      }
    }

    // Try to find JSON object directly (look for {...})
    const directMatch = responseText.match(/\{[\s\S]*\}/);
    if (directMatch) {
      try {
        return JSON.parse(directMatch[0]);
      } catch (e3) {
        console.error('Failed to parse direct match JSON:', e3);
      }
    }

    // If all parsing attempts fail, throw a detailed error
    console.error('Full response text:', responseText);
    throw new AppError(
      'LLM returned invalid JSON. Response preview: ' + responseText.substring(0, 500),
      500
    );
  }
}

/**
 * Validate the structure of the prep guide response
 */
function validatePrepGuideStructure(prepGuide) {
  const requiredFields = [
    'roleOverview',
    'coreTopics',
    'skillBreakdown',
    'interviewFocusAreas',
    'preparationStrategy',
    'companySpecificTips',
    'keyTakeaways',
  ];

  for (const field of requiredFields) {
    if (!prepGuide[field]) {
      throw new AppError(
        `Invalid prep guide structure: missing ${field}`,
        500
      );
    }
  }
}

export default {
  generatePreparationGuide,
};

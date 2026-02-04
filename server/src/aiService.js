import { OpenAI } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI client only if API key is available
let client = null;
if (apiKey) {
  client = new OpenAI({ apiKey });
}

const ANALYSIS_PROMPT = `You are an expert recruiter and ATS (Applicant Tracking System) engine. Analyze the provided resume against the job role and company.

Return ONLY valid JSON (no markdown, no commentary) matching this exact schema:
{
  "overallScore": number (0-100, be conservative if confidence is low),
  "confidence": number (0-1, based on resume clarity),
  "marketFit": "excellent" | "strong" | "moderate" | "weak" | "poor",
  "breakdown": [
    {
      "category": "Technical Skills" | "Experience Level" | "Role Alignment" | "Company Fit" | "Market Demand",
      "score": number (0-100),
      "confidence": number (0-1),
      "reasoning": string (1-2 sentences, recruiter-realistic)
    }
  ],
  "keyStrengths": [string, string, string],
  "keyGaps": [string, string],
  "recommendedActions": [string, string, string],
  "timestamp": ISO timestamp
}

Rules:
- If confidence is low (< 0.6), reduce scores by 10-20 points
- Be conservative - favor lower scores when uncertain
- Focus on recruiter concerns: skills match, experience level, market rate, culture fit
- Each breakdown category must be present exactly once
- Key strengths: 2-4 items max
- Key gaps: 1-3 items max
- Recommended actions: 2-3 items max
- No markdown, no explanation, JSON only`;

/**
 * Call OpenAI API with strict schema validation
 */
export async function analyzeResumeWithAI(resumeText, jobRole, company) {
  if (!client) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
  }

  try {
    const prompt = `${ANALYSIS_PROMPT}

Resume:
${resumeText}

Job Role: ${jobRole}
Company: ${company}`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from API');
    }

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonString = content.text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7);
    }
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.slice(0, -3);
    }

    const analysisResult = JSON.parse(jsonString.trim());

    // Validate schema
    validateAnalysisSchema(analysisResult);

    return analysisResult;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
}

/**
 * Validate response matches expected schema
 */
function validateAnalysisSchema(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  // Check required fields
  if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
    throw new Error('Invalid overallScore');
  }

  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    throw new Error('Invalid confidence');
  }

  if (!['excellent', 'strong', 'moderate', 'weak', 'poor'].includes(data.marketFit)) {
    throw new Error('Invalid marketFit');
  }

  if (!Array.isArray(data.breakdown) || data.breakdown.length !== 5) {
    throw new Error('Breakdown must have exactly 5 items');
  }

  const categories = new Set();
  for (const item of data.breakdown) {
    if (typeof item.score !== 'number' || item.score < 0 || item.score > 100) {
      throw new Error('Invalid breakdown score');
    }
    if (typeof item.confidence !== 'number' || item.confidence < 0 || item.confidence > 1) {
      throw new Error('Invalid breakdown confidence');
    }
    if (typeof item.reasoning !== 'string') {
      throw new Error('Invalid breakdown reasoning');
    }
    if (categories.has(item.category)) {
      throw new Error('Duplicate category in breakdown');
    }
    categories.add(item.category);
  }

  if (!Array.isArray(data.keyStrengths) || data.keyStrengths.length < 2 || data.keyStrengths.length > 4) {
    throw new Error('keyStrengths must have 2-4 items');
  }

  if (!Array.isArray(data.keyGaps) || data.keyGaps.length < 1 || data.keyGaps.length > 3) {
    throw new Error('keyGaps must have 1-3 items');
  }

  if (!Array.isArray(data.recommendedActions) || data.recommendedActions.length < 2 || data.recommendedActions.length > 3) {
    throw new Error('recommendedActions must have 2-3 items');
  }

  if (typeof data.timestamp !== 'string') {
    throw new Error('Invalid timestamp');
  }

  return true;
}

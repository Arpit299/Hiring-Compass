import type { AnalysisResult } from '../types/analysis';

export const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      description: 'Overall match score (0-100). Conservative scoring: if confidence is low, reduce by 10-20 points.',
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Confidence level of analysis (0-1). Based on resume clarity and data availability.',
    },
    marketFit: {
      type: 'string',
      enum: ['excellent', 'strong', 'moderate', 'weak', 'poor'],
      description: 'Market fit category based on current hiring expectations.',
    },
    breakdown: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: [
              'Technical Skills',
              'Experience Level',
              'Role Alignment',
              'Company Fit',
              'Market Demand',
            ],
          },
          score: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
          },
          reasoning: {
            type: 'string',
            description: 'Concise, recruiter-realistic explanation.',
          },
        },
        required: ['category', 'score', 'confidence', 'reasoning'],
      },
      minItems: 4,
      maxItems: 5,
    },
    keyStrengths: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 4,
      description: 'Top 2-4 competitive advantages.',
    },
    keyGaps: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 3,
      description: 'Critical missing qualifications.',
    },
    recommendedActions: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 3,
      description: 'Actionable next steps for candidate.',
    },
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: [
    'overallScore',
    'confidence',
    'marketFit',
    'breakdown',
    'keyStrengths',
    'keyGaps',
    'recommendedActions',
    'timestamp',
  ],
  additionalProperties: false,
} as const;

export function validateAnalysisSchema(data: unknown): data is AnalysisResult {
  // Strict validation: must match schema exactly
  if (typeof data !== 'object' || data === null) return false;

  const result = data as Record<string, unknown>;

  // Check required fields
  if (
    typeof result.overallScore !== 'number' ||
    result.overallScore < 0 ||
    result.overallScore > 100
  ) {
    return false;
  }

  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
    return false;
  }

  if (!['excellent', 'strong', 'moderate', 'weak', 'poor'].includes(result.marketFit as string)) {
    return false;
  }

  if (!Array.isArray(result.breakdown) || result.breakdown.length < 4 || result.breakdown.length > 5) {
    return false;
  }

  // Validate each breakdown item
  for (const item of result.breakdown as unknown[]) {
    if (typeof item !== 'object' || item === null) return false;
    const breakdownItem = item as Record<string, unknown>;
    if (
      typeof breakdownItem.category !== 'string' ||
      typeof breakdownItem.score !== 'number' ||
      typeof breakdownItem.confidence !== 'number' ||
      typeof breakdownItem.reasoning !== 'string' ||
      breakdownItem.score < 0 ||
      breakdownItem.score > 100 ||
      breakdownItem.confidence < 0 ||
      breakdownItem.confidence > 1
    ) {
      return false;
    }
  }

  if (!Array.isArray(result.keyStrengths) || result.keyStrengths.length < 2 || result.keyStrengths.length > 4) {
    return false;
  }

  if (!Array.isArray(result.keyGaps) || result.keyGaps.length < 1 || result.keyGaps.length > 3) {
    return false;
  }

  if (!Array.isArray(result.recommendedActions) || result.recommendedActions.length < 2 || result.recommendedActions.length > 3) {
    return false;
  }

  if (typeof result.timestamp !== 'string') {
    return false;
  }

  return true;
}

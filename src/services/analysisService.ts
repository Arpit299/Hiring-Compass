import type { AnalysisResult, ResumeInput } from '../types/analysis';
import { validateAnalysisSchema } from '../schemas/analysis';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001';
const SERVER_API_TOKEN = import.meta.env.VITE_SERVER_API_TOKEN;

interface ApiAnalysisRequest {
  resumeText: string;
  jobRole: string;
  company: string;
}

interface ApiAnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

/**
 * Call backend API for resume analysis
 * Backend will handle OpenAI API calls with strict schema validation
 */
export async function analyzeResumeViaAPI(input: ResumeInput): Promise<AnalysisResult> {
  try {
    let response: Response;

    // If a file is provided, send multipart/form-data so the server can parse the file
    if (input.resumeFile) {
      const form = new FormData();
      form.append('resumeFile', input.resumeFile as Blob, (input.resumeFile as File).name);
      form.append('jobRole', input.jobRole);
      form.append('company', input.company);

      response = await fetch(`${API_ENDPOINT}/api/analyze`, {
        method: 'POST',
        headers: {
          ...(SERVER_API_TOKEN && { 'X-API-Token': SERVER_API_TOKEN }),
        },
        body: form,
      });
    } else {
      response = await fetch(`${API_ENDPOINT}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SERVER_API_TOKEN && { 'X-API-Token': SERVER_API_TOKEN }),
        },
        body: JSON.stringify({ resumeText: input.resumeText ?? '', jobRole: input.jobRole, company: input.company } as ApiAnalysisRequest),
      });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`API error: ${response.status} ${text}`);
    }

    const result: ApiAnalysisResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze resume');
    }

    // Validate response conforms to schema
    if (!validateAnalysisSchema(result.data)) {
      throw new Error('Invalid analysis response schema');
    }

    return result.data;
  } catch (error) {
    console.error('API analysis failed:', error);
    throw error;
  }
}

/**
 * Fallback: Local analysis for development/testing
 * Uses a prompt-based approach to mimic AI responses
 */
export async function analyzeResumeLocal(input: ResumeInput): Promise<AnalysisResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const text = (input.resumeText ?? '').trim();
  const resumeLength = text ? text.split(' ').length : 0;
  const hasExperience = /\d+\+?\s*years?|senior|lead|principal/i.test(text);
  const hasTech = /react|typescript|javascript|node|python|aws|gcp/i.test(text);

  const baseScore = Math.min(100, 40 + resumeLength / 10);
  const techBoost = hasTech ? 15 : 0;
  const expBoost = hasExperience ? 10 : 0;
  const overallScore = Math.min(100, Math.round(baseScore + techBoost + expBoost));

  const confidence = Math.min(0.95, 0.6 + resumeLength / 3000);

  return {
    overallScore,
    confidence: Math.round(confidence * 100) / 100,
    marketFit:
      overallScore >= 80
        ? 'excellent'
        : overallScore >= 65
          ? 'strong'
          : overallScore >= 50
            ? 'moderate'
            : 'weak',
    breakdown: [
      {
        category: 'Technical Skills',
        score: Math.min(100, hasTech ? 75 + Math.random() * 15 : 45 + Math.random() * 15),
        confidence: 0.85,
        reasoning:
          hasTech && input.jobRole.toLowerCase().includes('engineer')
            ? 'Strong technical background aligns with role requirements.'
            : 'Limited technical depth mentioned in resume.',
      },
      {
        category: 'Experience Level',
        score: Math.min(100, hasExperience ? 70 + Math.random() * 20 : 50 + Math.random() * 15),
        confidence: 0.88,
        reasoning: hasExperience ? 'Demonstrates clear seniority progression.' : 'Experience level difficult to assess.',
      },
      {
        category: 'Role Alignment',
        score: Math.min(100, overallScore * 0.9 + Math.random() * 10),
        confidence: 0.82,
        reasoning: 'Resume content moderately aligns with stated position requirements.',
      },
      {
        category: 'Company Fit',
        score: Math.min(100, overallScore * 0.8 + Math.random() * 15),
        confidence: 0.75,
        reasoning: `Limited company-specific signals for ${input.company} culture fit in provided resume.`,
      },
      {
        category: 'Market Demand',
        score: Math.min(100, hasTech ? 78 + Math.random() * 15 : 60 + Math.random() * 20),
        confidence: 0.88,
        reasoning: 'Current market demand favorable for stated skill set.',
      },
    ],
    keyStrengths: [
      hasTech ? 'Strong technical foundation' : 'Clear communication skills',
      'Demonstrated career progression',
      resumeLength > 500 ? 'Comprehensive project experience' : 'Focused experience summary',
    ],
    keyGaps: [
      !hasTech && input.jobRole.includes('Engineer') ? 'Limited technical depth' : 'Minimal cloud infrastructure mentioned',
      'No explicit leadership examples',
    ],
    recommendedActions: [
      'Highlight quantified impact of past projects',
      `Research ${input.company} culture and values; align resume language accordingly`,
      'Consider adding certifications relevant to current market trends',
    ],
    recruiterPerspective: `Recruiter view: Candidate shows ${overallScore >= 75 ? 'strong' : overallScore >= 55 ? 'reasonable' : 'limited'} fit for the ${input.jobRole} role at ${input.company}. Strengths: ${hasTech ? 'technical skills' : 'communication'}, career progression. Gaps: ${!hasTech && input.jobRole.toLowerCase().includes('engineer') ? 'technical depth' : 'cloud/infrastructure or leadership'}. Recommend tailoring resume and adding measurable impact.`,
    improvementPlan: {
      title: `30-Day ${input.jobRole} Mastery Plan for ${input.company}`,
      duration: '4 weeks (30 days)',
      overview: `A structured improvement plan to accelerate your readiness for the ${input.jobRole} position at ${input.company}. This plan targets key skill gaps and builds on your existing strengths.`,
      focusAreas: ['Core Competencies', 'Industry Knowledge', 'Professional Growth'],
      weeks: [
        {
          week: 1,
          title: 'Assessment & Planning',
          goals: ['Assess current skills', 'Research role requirements', 'Set learning objectives'],
          resources: ['Job description analysis', 'Industry reports', 'Skill gap templates'],
          timeCommitment: '5-7 hours/week'
        },
        {
          week: 2,
          title: 'Skill Development',
          goals: ['Complete foundational training', 'Build practical experience', 'Review key concepts'],
          resources: ['Online courses', 'Documentation', 'Practice problems'],
          timeCommitment: '8-10 hours/week'
        },
        {
          week: 3,
          title: 'Project & Portfolio',
          goals: ['Complete projects', 'Document work', 'Build case studies'],
          resources: ['GitHub', 'Portfolio site', 'Technical writing guides'],
          timeCommitment: '10-12 hours/week'
        },
        {
          week: 4,
          title: 'Polish & Interview Prep',
          goals: ['Refine portfolio', 'Practice interviews', 'Prepare presentation'],
          resources: ['Interview prep guides', 'Mock interviews', 'Presentation templates'],
          timeCommitment: '8-10 hours/week'
        }
      ],
      successMetrics: [
        'Complete all weekly milestones on schedule',
        'Build or improve portfolio projects',
        'Gain measurable competency improvements',
        'Network with 5+ industry professionals',
        'Document and showcase learning progress'
      ]
    },
    marketPulse: {
      demandLevel: hasTech ? 'high' : 'moderate',
      trendingSkills: hasTech
        ? ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker']
        : ['Project Management', 'Communication', 'Leadership', 'Agile', 'Analytics'],
      marketSalaryRange: {
        min: overallScore >= 80 ? 150000 : overallScore >= 65 ? 120000 : 100000,
        max: overallScore >= 80 ? 220000 : overallScore >= 65 ? 180000 : 150000,
        currency: 'USD',
      },
      hiringOutlook: `Strong demand for ${input.jobRole} roles in 2024. ${input.company} and similar firms actively hiring. Salary range competitive with market averages. Key skills: ${hasTech ? 'TypeScript, React, Node.js' : 'leadership, strategy, communication'}.`,
      topCompanies: ['Google', 'Microsoft', 'Meta', 'Amazon', 'Netflix'],
      lastUpdated: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main analysis function - tries API first, falls back to local
 */
export async function analyzeResume(input: ResumeInput, useLocalFallback = true): Promise<AnalysisResult> {
  // If no API endpoint, use local
  if (!API_ENDPOINT || API_ENDPOINT === 'http://localhost:3001') {
    return analyzeResumeLocal(input);
  }

  try {
    return await analyzeResumeViaAPI(input);
  } catch (error) {
    if (useLocalFallback) {
      console.warn('Falling back to local analysis:', error);
      return analyzeResumeLocal(input);
    }
    throw error;
  }
}

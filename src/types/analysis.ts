export interface ResumeInput {
  // Either provide `resumeText` (string) or `resumeFile` (File) when calling analysis.
  resumeText?: string;
  resumeFile?: File | null;
  jobRole: string;
  company: string;
  yearsExp?: number;
}

export interface ScoreBreakdown {
  category: string;
  score: number; // 0-100
  confidence: number; // 0-1
  reasoning: string;
}

export interface WeeklyMilestone {
  week: number;
  title: string;
  goals: string[];
  resources: string[];
  timeCommitment: string;
}

export interface ImprovementPlan {
  title: string;
  duration: string;
  overview: string;
  focusAreas: string[];
  weeks: WeeklyMilestone[];
  successMetrics: string[];
}

export interface MarketPulse {
  demandLevel: 'high' | 'moderate' | 'low'; // Based on job postings, search trends
  trendingSkills: string[]; // Top skills in demand for this role
  marketSalaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  hiringOutlook: string; // Recruiter-realistic summary
  topCompanies?: string[]; // Companies actively hiring for this role
  lastUpdated: string;
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  confidence: number; // 0-1
  marketFit: 'excellent' | 'strong' | 'moderate' | 'weak' | 'poor';
  breakdown: ScoreBreakdown[];
  keyStrengths: string[];
  keyGaps: string[];
  recommendedActions: string[];
  improvementPlan: ImprovementPlan;
  recruiterPerspective: string;
  marketPulse?: MarketPulse; // Optional, fetched from Google Search
  timestamp: string;
}

/**
 * Server-side local analysis (can be replaced with real AI service)
 */

import { getMarketPulseNonBlocking } from './marketPulseService.js';

function generateImprovementPlan(resumeText, jobRole, company, keyGaps) {
  const lowerJobRole = jobRole.toLowerCase();
  const isEngineer = /engineer|developer|architect/.test(lowerJobRole);
  const isManager = /manager|lead|director/.test(lowerJobRole);
  
  let focusAreas = [];
  let weeks = [];

  if (isEngineer) {
    focusAreas = ['Technical Depth', 'System Design', 'Project Portfolio'];
    weeks = [
      {
        week: 1,
        title: 'Foundation & Assessment',
        goals: [
          'Audit current technical skills against job requirements',
          'Identify top 3 priority tech skills to learn',
          'Set up learning environment and resources'
        ],
        resources: [
          'LeetCode or HackerRank (DS/Algorithms)',
          'Tech documentation for target languages',
          'GitHub account setup for projects'
        ],
        timeCommitment: '5-7 hours/week'
      },
      {
        week: 2,
        title: 'Core Technical Skills',
        goals: [
          'Master fundamentals of primary language/framework',
          'Complete 5-10 coding challenges',
          'Study system design patterns'
        ],
        resources: [
          'Udemy/Coursera courses on core tech',
          'Official framework documentation',
          'System Design Interview book'
        ],
        timeCommitment: '8-10 hours/week'
      },
      {
        week: 3,
        title: 'Project Build & Portfolio',
        goals: [
          'Start building 1-2 portfolio projects',
          'Implement best practices and design patterns',
          'Document code and architecture decisions'
        ],
        resources: [
          'GitHub for version control',
          'Project templates and boilerplates',
          'Technical writing guides'
        ],
        timeCommitment: '10-12 hours/week'
      },
      {
        week: 4,
        title: 'Polish & Demonstrate Expertise',
        goals: [
          'Complete and refine portfolio projects',
          'Write technical blog posts or README documentation',
          'Prepare for technical interviews'
        ],
        resources: [
          'Interview prep guides',
          'Mock interview platforms',
          'Portfolio website builder'
        ],
        timeCommitment: '8-10 hours/week'
      }
    ];
  } else if (isManager) {
    focusAreas = ['Leadership Skills', 'Strategic Thinking', 'Team Development'];
    weeks = [
      {
        week: 1,
        title: 'Leadership Fundamentals',
        goals: [
          'Assess current leadership competencies',
          'Research leadership styles and frameworks',
          'Define leadership vision and values'
        ],
        resources: [
          '"The Manager\'s Path" by Camille Fournier',
          'LinkedIn Learning leadership courses',
          'Harvard ManageMentor resources'
        ],
        timeCommitment: '6-8 hours/week'
      },
      {
        week: 2,
        title: 'Team & Communication Skills',
        goals: [
          'Study effective delegation and feedback techniques',
          'Practice difficult conversations',
          'Develop communication frameworks'
        ],
        resources: [
          'Crucial Conversations workshop materials',
          'Coaching and mentoring guides',
          'Communication courses'
        ],
        timeCommitment: '7-9 hours/week'
      },
      {
        week: 3,
        title: 'Strategic & Business Acumen',
        goals: [
          'Learn company strategy frameworks',
          'Study OKRs and goal-setting methodologies',
          'Understand profit & loss fundamentals'
        ],
        resources: [
          'Business strategy books',
          'OKR frameworks documentation',
          'Financial literacy courses'
        ],
        timeCommitment: '8-10 hours/week'
      },
      {
        week: 4,
        title: 'Real-World Application & Reflection',
        goals: [
          'Apply learnings in current/practice scenarios',
          'Document lessons learned and growth areas',
          'Create personal leadership development plan'
        ],
        resources: [
          'Peer mentoring networks',
          'Reflection journaling templates',
          'Executive coaching resources'
        ],
        timeCommitment: '6-8 hours/week'
      }
    ];
  } else {
    focusAreas = ['Core Competencies', 'Industry Knowledge', 'Professional Network'];
    weeks = [
      {
        week: 1,
        title: 'Role Deep Dive',
        goals: [
          'Research and define role competencies',
          'Analyze job description in detail',
          'Identify skill gaps and priorities'
        ],
        resources: [
          'Job description analysis template',
          'Industry reports and whitepapers',
          'Competitor research'
        ],
        timeCommitment: '5-7 hours/week'
      },
      {
        week: 2,
        title: 'Skill Development',
        goals: [
          'Enroll in relevant online courses',
          'Complete skill assessments',
          'Practice with real-world scenarios'
        ],
        resources: [
          'LinkedIn Learning, Coursera, Udemy',
          'Industry certifications',
          'Practice platforms'
        ],
        timeCommitment: '8-10 hours/week'
      },
      {
        week: 3,
        title: 'Experience Building',
        goals: [
          'Take on side projects or freelance work',
          'Build case studies from work',
          'Network with industry professionals'
        ],
        resources: [
          'Upwork, Fiverr for projects',
          'Industry conferences and webinars',
          'Professional associations'
        ],
        timeCommitment: '10-12 hours/week'
      },
      {
        week: 4,
        title: 'Portfolio & Personal Brand',
        goals: [
          'Create professional portfolio/website',
          'Update LinkedIn profile comprehensively',
          'Share learnings and insights publicly'
        ],
        resources: [
          'Portfolio website builders',
          'LinkedIn optimization guides',
          'Content creation tools'
        ],
        timeCommitment: '7-9 hours/week'
      }
    ];
  }

  return {
    title: `30-Day ${jobRole} Mastery Plan for ${company}`,
    duration: '4 weeks (30 days)',
    overview: `A structured improvement plan to accelerate your readiness for the ${jobRole} position at ${company}. This plan targets key skill gaps and builds on your existing strengths.`,
    focusAreas,
    weeks,
    successMetrics: [
      'Complete all weekly milestones on schedule',
      'Build or improve 1-2 portfolio projects/artifacts',
      'Gain measurable competency improvements in focus areas',
      'Network with 5+ professionals in target industry',
      'Document and showcase learning progress'
    ]
  };
}

function generateRecruiterPerspective(overallScore, keyStrengths, keyGaps, jobRole, company) {
  const strengths = keyStrengths && keyStrengths.length ? keyStrengths.slice(0,3).join('; ') : 'Relevant strengths present.';
  const gaps = keyGaps && keyGaps.length ? keyGaps.slice(0,3).join('; ') : 'Some areas to improve.';

  const tone = overallScore >= 75 ? 'strong candidate' : overallScore >= 55 ? 'good match with gaps' : 'needs improvement for this role';

  return `Recruiter summary for ${jobRole} @ ${company}: ${tone}. Key strengths: ${strengths}. Key concerns: ${gaps}. Recommended next steps: highlight measurable impact, tailor for ${company}, and address top gaps.`;
}

export async function analyzeResumeLocal(resumeText, jobRole, company) {
  // Simulate network processing
  await new Promise((resolve) => setTimeout(resolve, 600));

  const resumeLength = resumeText.split(' ').length;
  const hasExperience = /\d+\+?\s*years?|senior|lead|principal|expert/i.test(resumeText);
  const hasTech = /react|typescript|javascript|node|python|aws|gcp|docker|kubernetes/i.test(resumeText);
  const hasLeadership = /led|managed|mentored|directed|founded|head of/i.test(resumeText);

  const baseScore = Math.min(100, 40 + resumeLength / 10);
  const techBoost = hasTech ? 18 : 0;
  const expBoost = hasExperience ? 12 : 0;
  const leadershipBoost = hasLeadership && jobRole.toLowerCase().includes('lead|senior|manager') ? 10 : 0;
  const overallScore = Math.min(100, Math.round(baseScore + techBoost + expBoost + leadershipBoost));

  const confidence = Math.min(0.95, 0.6 + Math.min(resumeLength / 3000, 0.3));

  const keyGaps = [
    !hasTech && /engineer|developer/i.test(jobRole) ? 'Limited technical depth for engineering role' : 'Cloud infrastructure experience not highlighted',
    hasLeadership ? 'Limited mention of team development and mentorship' : 'No explicit leadership examples',
  ];

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
            : overallScore >= 35
              ? 'weak'
              : 'poor',
    breakdown: [
      {
        category: 'Technical Skills',
        score: Math.min(100, hasTech ? 72 + Math.random() * 20 : 45 + Math.random() * 20),
        confidence: 0.85,
        reasoning:
          hasTech && /engineer|developer|architect/i.test(jobRole)
            ? 'Strong technical foundation visible in projects and tools listed.'
            : 'Technical depth could be strengthened with more specific tool/framework mentions.',
      },
      {
        category: 'Experience Level',
        score: Math.min(100, hasExperience ? 68 + Math.random() * 20 : 48 + Math.random() * 20),
        confidence: 0.87,
        reasoning: hasExperience
          ? 'Clear seniority progression demonstrated across roles.'
          : 'Limited explicit experience timeframe data; consider adding years and milestones.',
      },
      {
        category: 'Role Alignment',
        score: Math.min(100, overallScore * 0.92 + Math.random() * 8),
        confidence: 0.81,
        reasoning: `Resume experience aligns ${overallScore > 70 ? 'well' : 'partially'} with ${jobRole} requirements.`,
      },
      {
        category: 'Company Fit',
        score: Math.min(100, overallScore * 0.85 + Math.random() * 15),
        confidence: 0.73,
        reasoning: `Limited company-specific culture signals for ${company} in provided resume; research company values.`,
      },
      {
        category: 'Market Demand',
        score: Math.min(100, hasTech ? 75 + Math.random() * 18 : 65 + Math.random() * 20),
        confidence: 0.88,
        reasoning: 'Current market demand is favorable for stated skillset; positioning could emphasize impact.',
      },
    ],
    keyStrengths: [
      hasTech ? 'Strong technical foundation with modern tech stack' : 'Clear communication and documentation skills',
      'Demonstrated career progression and growth',
      resumeLength > 500 ? 'Comprehensive project experience with measurable outcomes' : 'Focused experience highlights',
    ],
    keyGaps,
    recommendedActions: [
      'Quantify impact: use metrics and results rather than responsibilities',
      `Add research on ${company} culture; tailor language to their values and mission`,
      'Include certifications, side projects, or open-source contributions to strengthen candidacy',
    ],
    improvementPlan: generateImprovementPlan(resumeText, jobRole, company, keyGaps),
    recruiterPerspective: generateRecruiterPerspective(overallScore, [
      hasTech ? 'Technical knowledge' : 'Communication',
      'Career progression',
      resumeLength > 500 ? 'Project depth' : 'Concise highlights'
    ], keyGaps, jobRole, company),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main export: analyzeResumeLocal with non-blocking market pulse fetch
 * Market pulse is fetched in parallel and merged into result
 * If market pulse fails or times out, analysis still returns complete result
 */
export async function analyzeResumeLocalWithMarketPulse(resumeText, jobRole, company) {
  // Start main analysis
  const baseAnalysis = await analyzeResumeLocal(resumeText, jobRole, company);

  // Fetch market pulse in non-blocking manner (parallel, with timeout)
  const marketPulse = await getMarketPulseNonBlocking(jobRole, company);

  // Merge market pulse if available
  if (marketPulse) {
    baseAnalysis.marketPulse = marketPulse;
  }

  return baseAnalysis;
}

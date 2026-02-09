import React from 'react';
import type { AnalysisResult } from '../types/analysis';
import ATSScoreGaugeEnhanced from './ATSScoreGaugeEnhanced';
import ImprovementPlanComponent from './ImprovementPlan';
import { TrendingUp, MessageSquare, BarChart3, DollarSign, Building2 } from 'lucide-react';
import { AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/components.css';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    const text = `Hiring Compass Analysis
Overall Score: ${result.overallScore}/100
Market Fit: ${result.marketFit}
Confidence: ${Math.round(result.confidence * 100)}%

Key Strengths:
${result.keyStrengths.map((s) => `- ${s}`).join('\n')}

Key Gaps:
${result.keyGaps.map((g) => `- ${g}`).join('\n')}

Recommended Actions:
${result.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Overall Score Card */}
      <motion.div variants={itemVariants} className="glass-panel p-8">
        <ATSScoreGaugeEnhanced
          score={result.overallScore}
          confidence={result.confidence}
          breakdown={result.breakdown}
          showAdvancedMetrics={true}
          animationDelay={0.2}
        />
      </motion.div>

      {/* Score Breakdown */}
      <motion.div variants={itemVariants} className="glass-panel p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Score Breakdown</h2>
          <p className="text-sm text-gray-400">Detailed analysis of your profile across key categories</p>
        </div>
        <div className="space-y-6">
          {result.breakdown.map((item, idx) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
              className="border border-white/[0.08] rounded-lg p-4 hover:border-cyan-400/30 transition-colors"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white text-lg">{item.category}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-mono text-2xl font-bold ${
                      item.score >= 80 ? 'text-emerald-400' :
                      item.score >= 60 ? 'text-blue-400' :
                      item.score >= 40 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {Math.round(item.score)}
                    </span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">confidence</div>
                    <div className={`font-mono text-sm font-semibold ${
                      item.confidence >= 0.8 ? 'text-emerald-400' :
                      item.confidence >= 0.6 ? 'text-blue-400' :
                      'text-amber-400'
                    }`}>
                      {Math.round(item.confidence * 100)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Score Distribution</span>
                  <span>{Math.round(item.score)}% of 100</span>
                </div>
                <div className="w-full h-3 bg-midnight-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full transition-colors ${
                      item.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                      item.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                      item.score >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ delay: 0.15 + idx * 0.08, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{item.reasoning}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Strengths & Gaps */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          className="glass-panel p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Key Strengths</h3>
          </div>
          <ul className="space-y-3">
            {result.keyStrengths.map((strength, idx) => (
              <motion.li
                key={strength}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                className="flex gap-3 text-sm"
              >
                <span className="text-emerald-400 font-bold mt-0.5" aria-hidden="true">•</span>
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Gaps */}
        <motion.div
          className="glass-panel p-6"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold">Key Gaps</h3>
          </div>
          <ul className="space-y-3">
            {result.keyGaps.map((gap, idx) => (
              <motion.li
                key={gap}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                className="flex gap-3 text-sm"
              >
                <span className="text-amber-400 font-bold mt-0.5" aria-hidden="true">•</span>
                <span>{gap}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Recommended Actions */}
      <motion.div variants={itemVariants} className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">Recommended Actions</h3>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-white/[0.08] transition-colors text-xs font-medium text-gray-400 hover:text-white"
            title="Copy analysis"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <ol className="space-y-3">
          {result.recommendedActions.map((action, idx) => (
            <motion.li
              key={action}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.1, duration: 0.5 }}
              className="flex gap-3 text-sm"
            >
              <span className="text-blue-400 font-bold min-w-6" aria-hidden="true">{idx + 1}.</span>
              <span>{action}</span>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      {/* Recruiter Perspective */}
      <motion.div variants={itemVariants} className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold">Recruiter Perspective</h3>
        </div>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.recruiterPerspective}</p>
      </motion.div>

      {/* Market Pulse Insights */}
      {result.marketPulse && (
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Market Pulse Insights</h3>
            <span className="text-xs text-gray-500 ml-auto">
              Updated: {new Date(result.marketPulse.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-6">
            {/* Demand Level */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Market Demand</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.marketPulse.demandLevel === 'high'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : result.marketPulse.demandLevel === 'moderate'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {result.marketPulse.demandLevel.charAt(0).toUpperCase() + result.marketPulse.demandLevel.slice(1)}
                  </div>
                  <TrendingUp
                    className={`w-4 h-4 ${
                      result.marketPulse.demandLevel === 'high'
                        ? 'text-emerald-400'
                        : result.marketPulse.demandLevel === 'moderate'
                          ? 'text-amber-400'
                          : 'text-red-400'
                    }`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Salary Range */}
            {result.marketPulse.marketSalaryRange && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-4"
              >
                <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Market Salary Range</p>
                  <p className="font-semibold text-blue-400">
                    ${(result.marketPulse.marketSalaryRange.min / 1000).toFixed(0)}K – ${(result.marketPulse.marketSalaryRange.max / 1000).toFixed(0)}K{' '}
                    <span className="text-xs text-gray-500">{result.marketPulse.marketSalaryRange.currency}</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Trending Skills */}
            {result.marketPulse.trendingSkills && result.marketPulse.trendingSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-gray-400 mb-3">Trending Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.marketPulse.trendingSkills.map((skill, idx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top Companies */}
            {result.marketPulse.topCompanies && result.marketPulse.topCompanies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <p className="text-sm text-gray-400">Top Hiring Companies</p>
                </div>
                <p className="text-sm text-gray-300">{result.marketPulse.topCompanies.join(', ')}</p>
              </motion.div>
            )}

            {/* Hiring Outlook */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 border-t border-white/[0.08]"
            >
              <p className="text-sm text-gray-400 mb-2">Hiring Outlook</p>
              <p className="text-sm text-gray-300">{result.marketPulse.hiringOutlook}</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* 30-Day Improvement Plan */}
      <ImprovementPlanComponent plan={result.improvementPlan} />
    </motion.div>
  );
}

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { AnalysisResult } from '../types/analysis';
import { CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';

interface ScrollDrivenResultsProps {
  result: AnalysisResult;
}

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Section wrapper that animates based on scroll progress
 * Maps scroll position to opacity and translateY
 */
const ScrollSection = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Reduce animation if motion preference set
  const shouldReduce = prefersReducedMotion();

  // Map scroll progress to opacity and translateY
  // Section starts invisible below, ends fully visible at top
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], shouldReduce ? [1, 1, 1] : [0, 0.7, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3, 1], shouldReduce ? [0, 0, 0] : [40, 20, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 1],
    shouldReduce ? [1, 1, 1] : [0.95, 0.98, 1]
  );

  return (
    <motion.div
      ref={ref}
      style={{
        opacity: shouldReduce ? 1 : opacity,
        y: shouldReduce ? 0 : y,
        scale: shouldReduce ? 1 : scale,
      }}
      className="relative z-10 mb-12"
    >
      {children}
    </motion.div>
  );
};

/**
 * Sticky header showing analysis summary
 * Stays fixed while sections scroll underneath
 */
const StickyAnalysisHeader = ({ result }: { result: AnalysisResult }) => {
  const shouldReduce = prefersReducedMotion();
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    shouldReduce ? ['rgba(15, 23, 42, 0)', 'rgba(15, 23, 42, 0.8)'] : ['rgba(15, 23, 42, 0)', 'rgba(15, 23, 42, 0.95)']
  );
  const headerBlur = useTransform(scrollY, [0, 100], shouldReduce ? [0, 0] : [0, 10]);

  return (
    <motion.div
      style={{
        backgroundColor: headerBg,
        backdropFilter: headerBlur.get() > 0 ? `blur(${headerBlur}px)` : 'none',
      }}
      className="sticky top-0 z-50 border-b border-white/[0.08] backdrop-blur-md transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Score & Fit */}
          <div className="flex items-baseline gap-4">
            <div className="text-center">
              <motion.div
                className="text-3xl sm:text-4xl font-bold text-blue-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {result.overallScore}
              </motion.div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Score</p>
            </div>

            <div className="text-left">
              <motion.div
                className={`text-lg font-semibold ${
                  result.marketFit === 'excellent'
                    ? 'text-emerald-400'
                    : result.marketFit === 'strong'
                      ? 'text-blue-400'
                      : result.marketFit === 'moderate'
                        ? 'text-amber-400'
                        : 'text-orange-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {result.marketFit.charAt(0).toUpperCase() + result.marketFit.slice(1)}
              </motion.div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Market Fit</p>
            </div>
          </div>

          {/* Right: Confidence & Timestamp */}
          <div className="flex items-baseline gap-4 text-sm text-gray-400">
            <div className="text-right">
              <p className="font-mono">{Math.round(result.confidence * 100)}% confidence</p>
              <p className="text-xs text-gray-600">
                {new Date(result.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicator: subtle scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"
          style={{
            scaleX: useTransform(
              scrollY,
              [0, typeof window !== 'undefined' ? document.body.scrollHeight : 3000],
              [0, 1]
            ),
            transformOrigin: '0%',
          }}
        />
      </div>
    </motion.div>
  );
};

export default function ScrollDrivenResults({ result }: ScrollDrivenResultsProps) {
  const shouldReduce = prefersReducedMotion();

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950">
      {/* Sticky Header */}
      <StickyAnalysisHeader result={result} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="space-y-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Section 1: Resume Intake */}
          <ScrollSection>
            <motion.article
              className="glass-panel p-8 rounded-lg border border-white/[0.1]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
                  animate={{ scale: shouldReduce ? 1 : [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm font-bold text-blue-400">1</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Resume Intake</h2>
              </div>

              <div className="space-y-4">
                <motion.div
                  className="p-4 rounded-lg bg-white/[0.05] border border-white/[0.08]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <p className="text-sm text-gray-400 mb-1">File processed</p>
                  <p className="font-mono text-white">Resume uploaded successfully</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/[0.05] border border-white/[0.08]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <p className="text-sm text-gray-400 mb-1">Analysis initiated</p>
                  <p className="font-mono text-white">Processing via OpenAI & market data</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/[0.05] border border-white/[0.08]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <p className="text-sm text-gray-400 mb-1">Schema validated</p>
                  <p className="font-mono text-white">Results ready for interpretation</p>
                </motion.div>
              </div>
            </motion.article>
          </ScrollSection>

          {/* Section 2: ATS Score */}
          <ScrollSection>
            <motion.article
              className="glass-panel p-8 rounded-lg border border-white/[0.1]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  animate={{ scale: shouldReduce ? 1 : [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                >
                  <span className="text-sm font-bold text-emerald-400">2</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white">ATS Score Breakdown</h2>
              </div>

              <div className="space-y-6">
                {result.breakdown.slice(0, 3).map((item, idx) => (
                  <motion.div
                    key={item.category}
                    className="border border-white/[0.08] rounded-lg p-5 hover:border-cyan-400/30 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-white text-lg">{item.category}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-1">
                          <motion.span
                            className={`text-2xl font-bold font-mono ${
                              item.score >= 80 ? 'text-emerald-400' :
                              item.score >= 60 ? 'text-blue-400' :
                              item.score >= 40 ? 'text-amber-400' :
                              'text-red-400'
                            }`}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: idx * 0.15 + 0.2 }}
                          >
                            {Math.round(item.score)}
                          </motion.span>
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
                      <motion.div
                        className="w-full h-3 bg-midnight-800 rounded-full overflow-hidden"
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: false }}
                        transition={{ delay: idx * 0.15, duration: 0.6 }}
                      >
                        <motion.div
                          className={`h-full transition-colors ${
                            item.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            item.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                            item.score >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                            'bg-gradient-to-r from-red-500 to-red-400'
                          }`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.score}%` }}
                          viewport={{ once: false }}
                          transition={{ delay: idx * 0.15 + 0.3, duration: 0.8 }}
                        />
                      </motion.div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{item.reasoning}</p>
                  </motion.div>
                ))}
              </div>
            </motion.article>
          </ScrollSection>

          {/* Section 3: Recruiter Perspective */}
          <ScrollSection>
            <motion.article
              className="glass-panel p-8 rounded-lg border border-white/[0.1]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"
                  animate={{ scale: shouldReduce ? 1 : [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                >
                  <span className="text-sm font-bold text-indigo-400">3</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Recruiter Perspective</h2>
              </div>

              <motion.div
                className="prose prose-invert prose-sm max-w-none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {result.recruiterPerspective}
                </p>
              </motion.div>

              {/* Key Strengths & Gaps */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.keyStrengths.map((strength, idx) => (
                      <motion.li
                        key={strength}
                        className="text-sm text-gray-300 flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.35 + idx * 0.1 }}
                      >
                        <span className="text-emerald-400 mt-1">✓</span>
                        {strength}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <h3 className="font-bold text-white">Gaps</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.keyGaps.map((gap, idx) => (
                      <motion.li
                        key={gap}
                        className="text-sm text-gray-300 flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.35 + idx * 0.1 }}
                      >
                        <span className="text-orange-400 mt-1">⚠</span>
                        {gap}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.article>
          </ScrollSection>

          {/* Section 4: Market Pulse */}
          {result.marketPulse && (
            <ScrollSection>
              <motion.article
                className="glass-panel p-8 rounded-lg border border-white/[0.1]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center"
                    animate={{ scale: shouldReduce ? 1 : [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  >
                    <span className="text-sm font-bold text-cyan-400">4</span>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">Market Pulse Insights</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demand Level */}
                  <motion.div
                    className="p-6 rounded-lg bg-white/[0.05] border border-white/[0.08]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <p className="text-sm text-gray-400 mb-3">Market Demand</p>
                    <div
                      className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                        result.marketPulse.demandLevel === 'high'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : result.marketPulse.demandLevel === 'moderate'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {result.marketPulse.demandLevel.charAt(0).toUpperCase() +
                        result.marketPulse.demandLevel.slice(1)}
                    </div>
                  </motion.div>

                  {/* Salary Range */}
                  {result.marketPulse.marketSalaryRange && (
                    <motion.div
                      className="p-6 rounded-lg bg-white/[0.05] border border-white/[0.08]"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <p className="text-sm text-gray-400 mb-3">Salary Range</p>
                      <p className="text-xl font-bold text-blue-400">
                        ${(result.marketPulse.marketSalaryRange.min / 1000).toFixed(0)}K –{' '}
                        {(result.marketPulse.marketSalaryRange.max / 1000).toFixed(0)}K
                      </p>
                    </motion.div>
                  )}

                  {/* Trending Skills */}
                  {result.marketPulse.trendingSkills && (
                    <motion.div
                      className="md:col-span-2 p-6 rounded-lg bg-white/[0.05] border border-white/[0.08]"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <p className="text-sm text-gray-400 mb-4">Trending Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {result.marketPulse.trendingSkills.map((skill, idx) => (
                          <motion.span
                            key={skill}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.35 + idx * 0.08 }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.article>
            </ScrollSection>
          )}

          {/* Section 5: 30-Day Roadmap */}
          <ScrollSection>
            <motion.article
              className="glass-panel p-8 rounded-lg border border-white/[0.1]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center"
                  animate={{ scale: shouldReduce ? 1 : [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                >
                  <span className="text-sm font-bold text-violet-400">5</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white">30-Day Improvement Plan</h2>
              </div>

              <motion.h3
                className="text-lg font-semibold text-white mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {result.improvementPlan.title}
              </motion.h3>

              <motion.p
                className="text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {result.improvementPlan.overview}
              </motion.p>

              {/* Weekly breakdown */}
              <div className="space-y-6">
                {result.improvementPlan.weeks.map((week, idx) => (
                  <motion.div
                    key={week.week}
                    className="p-6 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.25 + idx * 0.15, duration: 0.5 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <motion.h4
                          className="font-bold text-white mb-1"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: false }}
                          transition={{ delay: 0.3 + idx * 0.15 }}
                        >
                          Week {week.week}: {week.title}
                        </motion.h4>
                        <p className="text-sm text-gray-400">{week.timeCommitment}</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-violet-400" />
                    </div>

                    <motion.ul
                      className="space-y-2 text-sm text-gray-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.35 + idx * 0.15 }}
                    >
                      {week.goals.map((goal) => (
                        <li key={goal} className="flex items-start gap-2 ml-4">
                          <span className="text-violet-400 mt-1">›</span>
                          {goal}
                        </li>
                      ))}
                    </motion.ul>
                  </motion.div>
                ))}
              </div>

              {/* Success Metrics */}
              <motion.div
                className="mt-8 p-6 rounded-lg bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-violet-400" />
                  <h4 className="font-bold text-white">Success Metrics</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  {result.improvementPlan.successMetrics.map((metric) => (
                    <li key={metric} className="flex items-start gap-2">
                      <span className="text-violet-400 mt-1">✓</span>
                      {metric}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.article>
          </ScrollSection>
        </motion.div>

        {/* Footer / CTA */}
        <motion.div
          className="mt-24 py-12 text-center border-t border-white/[0.08]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.h3
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.4 }}
          >
            You're ready to take the next step.
          </motion.h3>
          <motion.p
            className="text-gray-400 mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.5 }}
          >
            Follow your 30-day plan and implement the recommended actions to maximize your hiring potential.
          </motion.p>

          <motion.button
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/50"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your 30-Day Plan
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}

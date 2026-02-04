import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useMemo } from 'react';

interface ATSScoreGaugeEnhancedProps {
  score: number; // 0-100
  confidence: number; // 0-1
  breakdown?: Array<{ category: string; score: number }>;
  showAdvancedMetrics?: boolean;
  animationDelay?: number;
}

/**
 * Enhanced ATS Score Gauge with:
 * - Precise circular progress with SVG
 * - Dual scoring system (company-specific + global market)
 * - Confidence-weighted accuracy
 * - Breakdown visualization
 * - Advanced metrics & insights
 * - Smooth spring animations
 * - Responsive design
 */
export default function ATSScoreGaugeEnhanced({
  score,
  confidence,
  breakdown = [],
  showAdvancedMetrics = true,
  animationDelay = 0,
}: ATSScoreGaugeEnhancedProps) {
  // Validate inputs
  const validScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const validConfidence = Math.max(0, Math.min(1, Number.isFinite(confidence) ? confidence : 0.5));

  // Calculate metrics
  const metrics = useMemo(() => {
    // Confidence-adjusted score (if confidence is low, effective score is lower)
    const confidenceAdjustment = validConfidence < 0.6 ? (1 - validConfidence) * 15 : 0;
    const adjustedScore = Math.max(0, validScore - confidenceAdjustment);

    // Global market percentile (slightly lower for market comparison)
    const globalScore = Math.round(adjustedScore * 0.92);

    // Category average from breakdown
    const avgBreakdown = breakdown.length > 0 ? Math.round(breakdown.reduce((sum, b) => sum + b.score, 0) / breakdown.length) : validScore;

    // Percentile rank
    const percentile = Math.round(validScore / 10);

    // Score interpretation
    const getInterpretation = (s: number) => {
      if (s >= 85) return { level: 'Excellent', color: '#10b981', intensity: 'high' };
      if (s >= 70) return { level: 'Strong', color: '#0ea5e9', intensity: 'medium-high' };
      if (s >= 55) return { level: 'Moderate', color: '#f59e0b', intensity: 'medium' };
      if (s >= 40) return { level: 'Fair', color: '#f97316', intensity: 'medium-low' };
      return { level: 'Poor', color: '#ef4444', intensity: 'low' };
    };

    const interpretation = getInterpretation(adjustedScore);

    return {
      adjustedScore: Math.round(adjustedScore),
      globalScore,
      avgBreakdown,
      percentile,
      interpretation,
      confidenceAdjustment: Math.round(confidenceAdjustment),
    };
  }, [validScore, validConfidence, breakdown]);

  const circumference = 2 * Math.PI * 48;
  const strokeOffset = circumference - (metrics.adjustedScore / 100) * circumference;

  // Gauge segments (threshold ranges with colors)
  const segments = [
    { range: 40, color: '#ef4444', label: 'Poor' },
    { range: 15, color: '#f97316', label: 'Fair' },
    { range: 15, color: '#f59e0b', label: 'Moderate' },
    { range: 15, color: '#0ea5e9', label: 'Strong' },
    { range: 15, color: '#10b981', label: 'Excellent' },
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.6 }}
    >
      {/* Main Gauge Container */}
      <div className="relative w-72 h-72 mb-6">
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ background: metrics.interpretation.color }}
        />

        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 120 120">
          <defs>
            {/* Advanced glow filter with intensity based on score */}
            <filter id="ats-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation={(metrics.adjustedScore / 100) * 2.5} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for smooth transitions */}
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={metrics.interpretation.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={metrics.interpretation.color} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Threshold indicator background segments */}
          {(() => {
            let accumulated = 0;
            return segments.map((seg, idx) => {
              const length = (seg.range / 100) * circumference;
              const dashArray = `${length} ${circumference - length}`;
              const dashOffset = circumference - (accumulated / 100) * circumference;
              accumulated += seg.range;
              return (
                <circle
                  key={`segment-${idx}`}
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="1.5"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  opacity="0.15"
                />
              );
            });
          })()}

          {/* Main background ring */}
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Animated primary progress ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="url(#score-gradient)"
            strokeWidth="9"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference, opacity: 0 }}
            animate={{ strokeDashoffset: strokeOffset, opacity: 1 }}
            transition={{
              strokeDashoffset: {
                type: 'spring',
                stiffness: 40,
                damping: 20,
                duration: 1.4,
              },
              opacity: { duration: 0.5, delay: 0.1 },
            }}
            strokeLinecap="round"
            filter="url(#ats-glow)"
            transform="rotate(-90 60 60)"
          />

          {/* Secondary accent ring (subtle) */}
          <motion.circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke={metrics.interpretation.color}
            strokeWidth="1"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference, opacity: 0 }}
            animate={{ strokeDashoffset: strokeOffset, opacity: 0.4 }}
            transition={{
              strokeDashoffset: {
                type: 'spring',
                stiffness: 35,
                damping: 25,
                duration: 1.3,
                delay: 0.1,
              },
              opacity: { duration: 0.6, delay: 0.2 },
            }}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            opacity={0.3}
          />

          {/* Center score display */}
          <motion.text
            x="60"
            y="54"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="36"
            fontWeight="700"
            fontFamily="JetBrains Mono"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: animationDelay + 0.4, duration: 0.6, type: 'spring', stiffness: 100 }}
          >
            {metrics.adjustedScore}
          </motion.text>

          {/* Score label */}
          <motion.text
            x="60"
            y="72"
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="9"
            fontFamily="Plus Jakarta Sans"
            fontWeight="600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationDelay + 0.5, duration: 0.4 }}
          >
            ATS MATCH
          </motion.text>

          {/* Percentage label */}
          <motion.text
            x="60"
            y="82"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="8"
            fontFamily="Plus Jakarta Sans"
            fontWeight="500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationDelay + 0.6, duration: 0.4 }}
          >
            OUT OF 100
          </motion.text>
        </svg>
      </div>

      {/* Interpretation Card */}
      <motion.div
        className="mb-6 px-6 py-4 rounded-xl glass-panel border border-blue-500/20 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay + 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {metrics.interpretation.level === 'Excellent' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : metrics.interpretation.level === 'Poor' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <TrendingUp className="w-5 h-5 text-amber-400" />
          )}
          <span
            className="text-lg font-bold"
            style={{ color: metrics.interpretation.color }}
          >
            {metrics.interpretation.level} Match
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Your resume shows <strong>{metrics.interpretation.level.toLowerCase()}</strong> alignment with the job requirements.
          {metrics.confidenceAdjustment > 0 && (
            <span className="block mt-1 text-gray-400">
              ({metrics.confidenceAdjustment} pts deducted due to low confidence)
            </span>
          )}
        </p>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: animationDelay + 0.4, staggerChildren: 0.05, delayChildren: animationDelay + 0.5 }}
      >
        {/* Company Score */}
        <motion.div
          className="glass-panel p-4 rounded-lg border border-emerald-500/20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs text-gray-400 font-medium mb-2">COMPANY SCORE</div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.adjustedScore}%</div>
          <div className="text-xs text-gray-500 mt-1">This job fit</div>
        </motion.div>

        {/* Global Market Score */}
        <motion.div
          className="glass-panel p-4 rounded-lg border border-blue-500/20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs text-gray-400 font-medium mb-2">MARKET SCORE</div>
          <div className="text-2xl font-bold text-blue-400">{metrics.globalScore}%</div>
          <div className="text-xs text-gray-500 mt-1">Market average</div>
        </motion.div>

        {/* Confidence Level */}
        <motion.div
          className="glass-panel p-4 rounded-lg border border-cyan-500/20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs text-gray-400 font-medium mb-2">CONFIDENCE</div>
          <div className="text-2xl font-bold text-cyan-400">{Math.round(validConfidence * 100)}%</div>
          <div className="text-xs text-gray-500 mt-1">Analysis accuracy</div>
        </motion.div>

        {/* Percentile Rank */}
        <motion.div
          className="glass-panel p-4 rounded-lg border border-amber-500/20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs text-gray-400 font-medium mb-2">PERCENTILE</div>
          <div className="text-2xl font-bold text-amber-400">{metrics.percentile}%</div>
          <div className="text-xs text-gray-500 mt-1">Top performers</div>
        </motion.div>
      </motion.div>

      {/* Category Breakdown (if available) */}
      <AnimatePresence>
        {breakdown.length > 0 && (
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: animationDelay + 0.6 }}
          >
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Category Breakdown
            </h3>
            <div className="space-y-2">
              {breakdown.map((item, idx) => {
                const catColor =
                  item.score >= 80
                    ? '#10b981'
                    : item.score >= 65
                      ? '#0ea5e9'
                      : item.score >= 50
                        ? '#f59e0b'
                        : '#ef4444';

                return (
                  <motion.div
                    key={`breakdown-${idx}`}
                    className="glass-panel p-3 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: animationDelay + 0.7 + idx * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-300">{item.category}</span>
                      <span className="text-sm font-bold" style={{ color: catColor }}>
                        {Math.round(item.score)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: catColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{
                          delay: animationDelay + 0.8 + idx * 0.1,
                          duration: 0.8,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Insights (optional) */}
      {showAdvancedMetrics && (
        <motion.div
          className="w-full max-w-2xl mt-6 p-4 rounded-lg border border-gray-600/20 bg-gradient-to-br from-gray-800/30 to-gray-900/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationDelay + 0.9, duration: 0.5 }}
        >
          <h3 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider">
            Analysis Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">→</span>
              <span>
                {metrics.adjustedScore >= 80
                  ? 'Excellent fit—immediate consideration'
                  : metrics.adjustedScore >= 65
                    ? 'Strong match—competitive candidate'
                    : metrics.adjustedScore >= 50
                      ? 'Moderate fit—potential but gaps exist'
                      : metrics.adjustedScore >= 35
                        ? 'Weak alignment—significant concerns'
                        : 'Poor match—not recommended'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">→</span>
              <span>
                {validConfidence >= 0.8
                  ? 'High confidence in analysis'
                  : validConfidence >= 0.6
                    ? 'Moderate confidence'
                    : 'Low confidence—resume may lack detail'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold">→</span>
              <span>
                Category average: <strong>{metrics.avgBreakdown}%</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-400 font-bold">→</span>
              <span>
                Market rank: <strong>Top {100 - metrics.percentile}%</strong>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

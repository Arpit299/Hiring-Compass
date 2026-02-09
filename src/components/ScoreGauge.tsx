import { motion } from 'framer-motion';
import '../styles/components.css';

interface ScoreGaugeProps {
  score: number; // 0-100
  confidence: number; // 0-1
}

export default function ScoreGauge({ score, confidence }: ScoreGaugeProps) {
  // Input validation with error handling
  const validScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const validConfidence = Math.max(0, Math.min(1, Number.isFinite(confidence) ? confidence : 0.5));

  const circumference = 2 * Math.PI * 45;
  const strokeOffset = circumference - (validScore / 100) * circumference;

  // Color gradient based on score
  const getColor = (value: number) => {
    if (value >= 80) return '#10b981'; // emerald
    if (value >= 65) return '#3b82f6'; // blue
    if (value >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const gaugeColor = getColor(validScore);
  const glowIntensity = validScore / 100;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 120 120">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={glowIntensity * 3} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Colored segments for thresholds (0-50,50-65,65-80,80-100) */}
          {(() => {
            const segments = [50, 15, 15, 20];
            const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
            let accumulated = 0;
            return segments.map((seg, idx) => {
              const length = (seg / 100) * circumference;
              const dashArray = `${length} ${circumference - length}`;
              const dashOffset = circumference - (accumulated / 100) * circumference;
              accumulated += seg;
              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={colors[idx]}
                  strokeWidth="8"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  transform="rotate(-90 60 60)"
                  opacity={0.18}
                />
              );
            });
          })()}

          {/* Background ring */}
          <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />

          {/* Animated progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference, opacity: 0 }}
            animate={{ strokeDashoffset: strokeOffset, opacity: 1 }}
            transition={{
              strokeDashoffset: { type: 'spring', stiffness: 35, damping: 25, duration: 1.2 },
              opacity: { duration: 0.4 },
            }}
            strokeLinecap="round"
            filter="url(#glow)"
            transform="rotate(-90 60 60)"
          />

          {/* Center label */}
          <motion.text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="JetBrains Mono" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            {Math.round(validScore)}%
          </motion.text>
          <text x="60" y="78" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">
            ATS SCORE
          </text>
        </svg>
      </div>
      {/* Confidence badge above circle */}
      <motion.div className="mb-3 glass-panel px-4 py-2 rounded-full text-xs font-mono text-blue-300 border border-blue-500/30" initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 80 }}>
        Confidence {Math.round(validConfidence * 100)}%
      </motion.div>
      {/* Single-line score + color criteria */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 text-sm text-gray-200">
          <div className="text-xl font-bold text-white">{Math.round(validScore)}%</div>
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="color-indicator color-critical" />
              <span>0-49</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="color-indicator color-warning" />
              <span>50-64</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="color-indicator color-good" />
              <span>65-79</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="color-indicator color-excellent" />
              <span>80-100</span>
            </div>
          </div>
        </div>

        {/* Dual ATS Score Board */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
          <div className="glass-panel p-3 rounded-md flex flex-col items-center">
            <div className="text-xs text-gray-300">Company ATS Score</div>
            <div className="text-2xl font-bold text-white">{Math.round(validScore)}%</div>
            <div className="text-xs text-gray-400 mt-1">How your resume performs for this company</div>
          </div>
          <div className="glass-panel p-3 rounded-md flex flex-col items-center">
            <div className="text-xs text-gray-300">Global ATS Score</div>
            <div className="text-2xl font-bold text-white">{Math.max(0, Math.min(100, Math.round(validScore * 0.95)))}%</div>
            <div className="text-xs text-gray-400 mt-1">How your resume performs across the market</div>
          </div>
        </div>
      </div>
    </div>
  );
}

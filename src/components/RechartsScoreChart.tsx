import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import '../styles/components.css';

interface BreakdownItem {
  category: string;
  score: number;
}

interface Props {
  breakdown: BreakdownItem[];
  compact?: boolean;
}

const colorFor = (v: number) => {
  if (v >= 80) return '#10b981'; // emerald-500
  if (v >= 60) return '#0ea5e9'; // sky-500
  if (v >= 40) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

interface ScoreTooltipEntry {
  value: number;
  payload: { name: string };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: ScoreTooltipEntry[] }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const toneClass =
    p.value >= 80
      ? 'tooltip-text-emerald tooltip-border-emerald'
      : p.value >= 60
        ? 'tooltip-text-sky tooltip-border-sky'
        : p.value >= 40
          ? 'tooltip-text-amber tooltip-border-amber'
          : 'tooltip-text-red tooltip-border-red';
  return (
    <div className={`tooltip-surface ${toneClass}`}>
      <div className="tooltip-title">
        {p.payload.name}
      </div>
      <div className="tooltip-value-secondary">
        Score: <span className="tooltip-value">{p.value}%</span>
      </div>
    </div>
  );
};

const RechartsScoreChart: React.FC<Props> = ({ breakdown, compact = false }) => {
  if (!breakdown || breakdown.length === 0) return null;
  const data = breakdown
    .filter((b) => typeof b.category === 'string' && b.category.trim().length > 0 && Number.isFinite(b.score))
    .slice(0, compact ? 3 : breakdown.length)
    .map((b) => ({ name: b.category, score: Math.round(Number(b.score)) }));
  if (data.length === 0) return null;

  return (
    <div className="chart-container-small">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[6, 6, 6, 6]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorFor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsScoreChart;

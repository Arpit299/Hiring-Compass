import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

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

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const bgColor = colorFor(p.value);
  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: `1px solid ${bgColor}40`,
      borderRadius: '0.5rem',
      padding: '0.5rem 0.75rem',
      boxShadow: `0 4px 12px rgba(0,0,0,0.6)`,
    }}>
      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: bgColor, marginBottom: '0.25rem' }}>
        {p.payload.name}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
        Score: <span style={{ fontWeight: '600', color: bgColor }}>{p.value}%</span>
      </div>
    </div>
  );
};

const RechartsScoreChart: React.FC<Props> = ({ breakdown, compact = false }) => {
  if (!breakdown || breakdown.length === 0) return null;
  const data = breakdown.slice(0, compact ? 3 : breakdown.length).map((b) => ({ name: b.category, score: Math.round(b.score) }));
  const height = compact ? 90 : 160;

  return (
    <div style={{ width: '100%', height }}>
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

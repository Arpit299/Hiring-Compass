import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import '../styles/components.css';

interface Props {
  points: { timestamp: number; score?: number }[];
  height?: number;
}

const fmt = (t: number) => new Date(t).toLocaleDateString();

const CustomTrendTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const score = p.value;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#0ea5e9' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: `1px solid ${color}40`,
      borderRadius: '0.5rem',
      padding: '0.5rem 0.75rem',
      boxShadow: `0 4px 12px rgba(0,0,0,0.6)`,
    }}>
      <div className="tooltip-label">
        {p.payload.time}
      </div>
      <div className="tooltip-title" style={{ color }}>
        ATS Score: {score}%
      </div>
    </div>
  );
};

export const TrendChart: React.FC<Omit<Props, 'height'>> = ({ points }) => {
  if (!points || points.length === 0) return null;
  const data = points
    .filter((p) => typeof p.score === 'number')
    .map((p) => ({ time: fmt(p.timestamp), score: Math.round(p.score as number) }));

  if (data.length === 0) return null;

  return (
    <div className="chart-container-small">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip content={<CustomTrendTooltip />} />
          <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;

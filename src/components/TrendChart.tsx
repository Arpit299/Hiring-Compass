import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import '../styles/components.css';

interface Props {
  points: { timestamp: number; score?: number }[];
  height?: number;
}

const fmt = (t: number) => new Date(t).toLocaleDateString();

interface TrendTooltipEntry {
  value: number;
  payload: { time: string };
}

const CustomTrendTooltip = ({ active, payload }: { active?: boolean; payload?: TrendTooltipEntry[] }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const score = p.value;
  const toneClass =
    score >= 80
      ? 'tooltip-text-emerald tooltip-border-emerald'
      : score >= 60
        ? 'tooltip-text-sky tooltip-border-sky'
        : score >= 40
          ? 'tooltip-text-amber tooltip-border-amber'
          : 'tooltip-text-red tooltip-border-red';
  return (
    <div className={`tooltip-surface ${toneClass}`}>
      <div className="tooltip-label">
        {p.payload.time}
      </div>
      <div className="tooltip-title">
        ATS Score: {score}%
      </div>
    </div>
  );
};

export const TrendChart: React.FC<Omit<Props, 'height'>> = ({ points }) => {
  if (!points || points.length === 0) return null;
  const data = points
    .filter((p) => typeof p.score === 'number' && Number.isFinite(p.score) && Number.isFinite(p.timestamp))
    .map((p) => ({ time: fmt(p.timestamp), score: Math.round(Number(p.score)) }));

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

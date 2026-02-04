import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

interface BreakdownItem {
  category: string;
  score: number;
}

interface Props {
  breakdown: BreakdownItem[];
  compact?: boolean;
}

const formatData = (items: BreakdownItem[]) => items.map((i) => ({ name: i.category, score: Math.round(i.score) }));

export const ScoreChart: React.FC<Props> = ({ breakdown, compact = false }) => {
  if (!breakdown || breakdown.length === 0) return null;
  const items = breakdown.slice(0, compact ? 3 : breakdown.length);
  const data = formatData(items);
  const height = compact ? 80 : 140;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <Tooltip formatter={(value: any) => `${value ?? 0}%`} />
          <Bar dataKey="score" fill="#60a5fa" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;

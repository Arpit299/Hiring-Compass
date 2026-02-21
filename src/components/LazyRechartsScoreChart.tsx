import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import '../styles/components.css';

const LazyComp = React.lazy(() => import('./RechartsScoreChart'));

const Spinner: React.FC = () => (
  <div className="spinner-container spinner-h-96">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
  </div>
);

interface LazyRechartsScoreChartProps {
  breakdown: Array<{ category: string; score: number }>;
  compact?: boolean;
}

const LazyRechartsScoreChart: React.FC<LazyRechartsScoreChartProps> = (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <LazyComp {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRechartsScoreChart;

import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import '../styles/components.css';

const LazyComp = React.lazy(() => import('./TrendChart'));

const Spinner: React.FC = () => (
  <div className="spinner-container spinner-h-80">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
  </div>
);

interface LazyTrendChartProps {
  points: Array<{ timestamp: number; score?: number }>;
}

const LazyTrendChart: React.FC<LazyTrendChartProps> = (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <LazyComp {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyTrendChart;

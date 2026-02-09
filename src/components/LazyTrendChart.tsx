import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import '../styles/components.css';

const LazyComp = React.lazy(() => import('./TrendChart'));

const Spinner: React.FC = () => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <div className="spinner-container" style={{ height: '80px' }}>
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
  </div>
);

const LazyTrendChart: React.FC<any> = (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <LazyComp {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyTrendChart;

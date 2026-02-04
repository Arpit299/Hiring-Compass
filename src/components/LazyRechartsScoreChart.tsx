import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const LazyComp = React.lazy(() => import('./RechartsScoreChart'));

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center" style={{ height: 96 }}>
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
  </div>
);

const LazyRechartsScoreChart: React.FC<any> = (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <LazyComp {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRechartsScoreChart;

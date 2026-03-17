
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}></div>
);

export default LoadingSpinner;

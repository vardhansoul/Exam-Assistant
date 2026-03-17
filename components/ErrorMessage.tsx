import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-600 p-4 my-4 rounded-r-lg" role="alert">
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
          </div>
        </div>
        {onRetry && (
          <div className="ml-4">
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
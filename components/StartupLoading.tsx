import React from 'react';

const StartupLoading: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-9 bg-slate-300 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>

            <div className="mt-8 bg-slate-300 dark:bg-slate-700 rounded-xl h-24 w-full"></div>

            <div className="mt-8">
              <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartupLoading;
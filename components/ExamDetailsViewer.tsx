
import React, { useEffect } from 'react';
import { logActivity } from '../utils/tracking';
import type { ExamDetailGroup, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ContentRenderer from './ContentRenderer';

interface ExamDetailsViewerProps {
  selectionPath: string;
  details: ExamDetailGroup[];
  isLoading: boolean;
  error: string | null;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
  officialLink?: string;
}

const ExamDetailsViewer: React.FC<ExamDetailsViewerProps> = ({ selectionPath, details, isLoading, error, user, canAccessPremium, requestAuth, officialLink }) => {
  useEffect(() => {
    if (selectionPath && user) {
        logActivity(user.uid, {
            type: 'EXAM_DETAILS_VIEWED' as HistoryType,
            description: `Viewed details for "${selectionPath}"`,
            view: AppView.EXAM_DETAILS_VIEWER,
            context: { examPath: selectionPath }
        });
    }
  }, [selectionPath, user]);

  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to view detailed exam information.</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Eligibility & Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{selectionPath}</p>
          </div>
        </div>
        
        {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
        
        <ErrorMessage message={error} />
        
        {!isLoading && !error && officialLink && (
            <div className="mb-6">
                <a 
                    href={officialLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                    View Official Notification / Apply &rarr;
                </a>
            </div>
        )}

        {!isLoading && !error && details.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">No detailed eligibility or requirement information could be found for this selection.</p>
        )}

        {!isLoading && !error && details.length > 0 && (
          <div className="space-y-6">
            {details.map(group => (
              <div key={group.groupTitle} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-4">{group.groupTitle}</h3>
                <div className="space-y-3">
                  {group.details.map(detail => (
                    <div key={detail.criteria} className="flex flex-col sm:flex-row text-sm">
                      <p className="font-semibold text-slate-600 dark:text-slate-300 sm:w-1/3 flex-shrink-0">{detail.criteria}:</p>
                      <div className="text-slate-800 dark:text-slate-200 sm:w-2/3 break-words prose prose-base max-w-none dark:prose-invert">
                        <ContentRenderer content={detail.details} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExamDetailsViewer;

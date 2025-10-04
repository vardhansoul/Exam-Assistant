

import React from 'react';
import type { ExamDetailGroup } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface ExamDetailsViewerProps {
  selectionPath: string;
  details: ExamDetailGroup[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

const ExamDetailsViewer: React.FC<ExamDetailsViewerProps> = ({ selectionPath, details, isLoading, error, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <Button onClick={onBack} variant="secondary" className="!p-2.5 !rounded-full flex-shrink-0">
            Back
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-800">Eligibility & Details</h2>
            <p className="text-sm text-slate-500 truncate">{selectionPath}</p>
          </div>
        </div>
        
        {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
        
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        
        {!isLoading && !error && details.length === 0 && (
          <p className="text-slate-500 text-center py-8">No detailed eligibility or requirement information could be found for this specific exam selection.</p>
        )}

        {!isLoading && !error && details.length > 0 && (
          <div className="space-y-6">
            {details.map(group => (
              <div key={group.groupTitle} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-lg font-bold text-teal-700 mb-4">{group.groupTitle}</h3>
                <div className="space-y-3">
                  {group.details.map(detail => (
                    <div key={detail.criteria} className="flex flex-col sm:flex-row text-sm">
                      <p className="font-semibold text-slate-600 sm:w-1/3 flex-shrink-0">{detail.criteria}:</p>
                      <p className="text-slate-800 sm:w-2/3 break-words">{detail.details}</p>
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
import React, { useState } from 'react';
import { generateStatusUpdate, getSpecificErrorMessage } from '../services/geminiService';
import type { ExamStatusUpdate } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface Selection {
    selectedExam: string;
    selectedSubCategory: string;
    selectedTier: string;
}

interface StatusTrackerProps {
  trackerType: 'Result' | 'Admit Card';
  selection: Selection;
  language: string;
  isOnline: boolean;
}


const StatusTracker: React.FC<StatusTrackerProps> = ({ trackerType, selection, language, isOnline }) => {
  const { selectedExam, selectedSubCategory, selectedTier } = selection;
  const [statusUpdate, setStatusUpdate] = useState<ExamStatusUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleCheckStatus = async () => {
    if (!selectedSubCategory || !isOnline) return;
    setIsLoading(true);
    setError(null);
    setStatusUpdate(null);
    try {
      const update = await generateStatusUpdate(selectedExam, selectedSubCategory, selectedTier, language, trackerType);
      setStatusUpdate(update);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('released') || s.includes('available')) return 'text-green-600';
    if (s.includes('announced')) return 'text-blue-600';
    if (s.includes('not') || s.includes('unavailable')) return 'text-red-600';
    if (s.includes('delayed')) return 'text-orange-600';
    return 'text-gray-800';
  };

  const isCheckButtonDisabled = isLoading || !isOnline || !selectedSubCategory;

  return (
    <Card>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-3">{trackerType} Tracker</h2>
      
      {!selectedSubCategory ? (
         <div className="text-center py-10">
            <p className="text-gray-500">Please select an exam from the home page to check its status.</p>
        </div>
      ) : (
        <>
            <div className="p-4 bg-indigo-50 rounded-lg mb-8 text-center">
                <p className="text-sm text-gray-600">Checking status for:</p>
                <p className="font-bold text-lg text-indigo-800">{selectedExam} - {selectedSubCategory} {selectedTier && `(${selectedTier})`}</p>
            </div>

            <div className="mt-8">
                <Button onClick={handleCheckStatus} className="w-full" disabled={isCheckButtonDisabled}>
                {isLoading ? 'Checking...' : (isOnline ? `Check ${trackerType} Status` : 'Offline')}
                </Button>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mt-6">{error}</p>}
            
            {isLoading && !statusUpdate && <div className="mt-6"><LoadingSpinner /></div>}

            {statusUpdate && (
                <div className="mt-6 border-t pt-6">
                <Card className="bg-slate-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Status for {selectedSubCategory} {selectedTier && `(${selectedTier})`}
                    </h3>
                    <p className={`text-2xl font-bold ${getStatusColor(statusUpdate.status)}`}>
                    {statusUpdate.status}
                    </p>
                    <p className="text-gray-600 mt-2">{statusUpdate.details}</p>
                    {statusUpdate.link && (
                    <div className="mt-4">
                        <a
                        href={statusUpdate.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors break-all"
                        >
                        Go to Official Page &rarr;
                        </a>
                    </div>
                    )}
                </Card>
                </div>
            )}
        </>
      )}
    </Card>
  );
};

export default StatusTracker;
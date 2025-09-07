import React from 'react';
import StatusTracker from './StatusTracker';

interface Selection {
    selectedExam: string;
    selectedSubCategory: string;
    selectedTier: string;
}

interface ResultTrackerProps {
  selection: Selection;
  language: string;
  isOnline: boolean;
}

const ResultTracker: React.FC<ResultTrackerProps> = ({ selection, language, isOnline }) => {
  return <StatusTracker trackerType="Result" selection={selection} language={language} isOnline={isOnline} />;
};

export default ResultTracker;
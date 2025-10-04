
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

const ResultTracker: React.FC<ResultTrackerProps> = (props) => {
  return <StatusTracker {...props} trackerType="Result" />;
};

export default ResultTracker;
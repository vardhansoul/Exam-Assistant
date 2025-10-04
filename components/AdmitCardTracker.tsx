
import React from 'react';
import StatusTracker from './StatusTracker';

interface Selection {
    selectedExam: string;
    selectedSubCategory: string;
    selectedTier: string;
}

interface AdmitCardTrackerProps {
  selection: Selection;
  language: string;
  isOnline: boolean;
}

const AdmitCardTracker: React.FC<AdmitCardTrackerProps> = (props) => {
  return <StatusTracker {...props} trackerType="Admit Card" />;
};

export default AdmitCardTracker;
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

const AdmitCardTracker: React.FC<AdmitCardTrackerProps> = ({ selection, language, isOnline }) => {
  return <StatusTracker trackerType="Admit Card" selection={selection} language={language} isOnline={isOnline} />;
};

export default AdmitCardTracker;
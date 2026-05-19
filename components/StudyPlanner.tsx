
import React, { useState, useEffect } from 'react';
import { generateStudyRoadmap } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { StudyRoadmap as StudyRoadmapType, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';

interface StudyPlannerProps {
    selectionPath: string;
    language: string;
    isOnline: boolean;
    user: User | null;
    canAccessPremium: boolean;
    requestAuth: () => void;
    topics?: string[];
    isSyllabusLoading?: boolean;
    onRefresh?: () => void;
}

const STORAGE_KEY = 'study_roadmap_state';

const StudyPlanner: React.FC<StudyPlannerProps> = ({ selectionPath, language, isOnline, user, canAccessPremium, requestAuth, topics, isSyllabusLoading, onRefresh }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize from storage
    const [studyRoadmap, setStudyRoadmap] = useState<StudyRoadmapType | null>(() => {
        const saved = getComponentState<{roadmap: StudyRoadmapType, path: string}>(STORAGE_KEY);
        // Only restore if the path matches to prevent showing wrong roadmap
        if (saved && saved.path === selectionPath) return saved.roadmap;
        return null;
    });

    // Persist state
    useEffect(() => {
        if (studyRoadmap) {
            saveComponentState(STORAGE_KEY, { roadmap: studyRoadmap, path: selectionPath });
        } else {
            saveComponentState(STORAGE_KEY, null);
        }
    }, [studyRoadmap, selectionPath]);

    // Auto-fetch topics if missing and online (Helps context but mostly ensures data integrity)
    useEffect(() => {
        if ((!topics || topics.length === 0) && !isSyllabusLoading && isOnline && onRefresh) {
            onRefresh();
        }
    }, [topics, isSyllabusLoading, isOnline, onRefresh]);

    const handleGenerateRoadmap = async () => {
        if (!canAccessPremium) {
            requestAuth();
            return;
        }
        if (!selectionPath.trim()) {
            setError("Please select an exam from the dashboard first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setStudyRoadmap(null);
        logActivity(user?.uid || null, {
            type: 'ROADMAP_GENERATED' as HistoryType,
            description: `Generated a study roadmap for "${selectionPath}"`,
            view: AppView.STUDY_ROADMAP,
            context: { examPath: selectionPath }
        });

        try {
            const roadmap = await generateStudyRoadmap(selectionPath, language, topics);
            setStudyRoadmap(roadmap);
        } catch(err) {
            setError(getSpecificErrorMessage(err));
        }
        setIsLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!canAccessPremium) {
        return (
            <div className="max-w-3xl mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the Study Roadmap Generator.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
      <div className="max-w-3xl mx-auto print-section-wrapper">
        <Card>
          <div className="text-center no-print">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Study Roadmap Generator</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Get a personalized, phase-by-phase study plan for your exam.</p>
          </div>

          {!studyRoadmap ? (
            <div className="mt-8 text-center no-print">
              <p className="text-slate-600 dark:text-slate-300 mb-4">Generate a roadmap for: <span className="font-bold">{selectionPath}</span></p>
              {(!topics || topics.length === 0) && isSyllabusLoading && (
                  <div className="flex justify-center items-center gap-2 mb-4 text-sm text-slate-500">
                      <LoadingSpinner /> <span>Refining syllabus context...</span>
                  </div>
              )}
              <Button onClick={handleGenerateRoadmap} disabled={isLoading || !isOnline || !selectionPath.trim()}>
                {isLoading ? 'Generating...' : 'Generate My Roadmap'}
              </Button>
              {isLoading && <div className="mt-4"><LoadingSpinner/></div>}
              <ErrorMessage message={error} onRetry={handleGenerateRoadmap} />
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 no-print">
                  <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400">{studyRoadmap.title}</h3>
                  <div className="self-end sm:self-auto">
                      <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center gap-2" title="Print Roadmap">
                            <PrinterIcon className="w-4 h-4" /> 
                      </Button>
                  </div>
              </div>
              
              <div className="hidden print:block text-center mb-8">
                  <h1 className="text-3xl font-bold text-black">{studyRoadmap.title}</h1>
                  <p className="text-gray-600 mt-2">Study Roadmap - Club of Competition</p>
              </div>

              <div className="space-y-6">
                {studyRoadmap.phases.map((phase, index) => (
                  <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-white print:border-l-4 print:border-indigo-200 print:break-inside-avoid">
                    <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{phase.phaseTitle}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic print:text-gray-700">{phase.strategy}</p>
                    <ul className="list-disc list-inside mt-4 space-y-1 text-slate-700 dark:text-slate-200 print:text-black">
                      {phase.topics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center no-print">
                <Button onClick={handleGenerateRoadmap} variant="secondary" disabled={isLoading || !isOnline}>
                  Regenerate Roadmap
                </Button>
              </div>
            </div>
          )}
        </Card>
        <style>{`
            @media print {
                .no-print, header, .sidebar, .mobile-taskbar, button { display: none !important; }
                body, #root, main, .print-section-wrapper, .print-section-wrapper > div { 
                    display: block !important; 
                    position: static !important; 
                    background: white !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    width: 100% !important; 
                    height: auto !important; 
                    overflow: visible !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .prose { color: black !important; }
            }
        `}</style>
      </div>
    );
};

export default StudyPlanner;

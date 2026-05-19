
import React, { useState, useEffect } from 'react';
import { generateStoryForTopic } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { User, HistoryType, StoryTutorResponse, PopupConfig } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import PopupSelector from './PopupSelector';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface StoryTutorGeneratorProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
  isSyllabusLoading?: boolean;
  onRefresh?: () => void;
}

const STORAGE_KEY = 'story_tutor_state';

const StoryTutorGenerator: React.FC<StoryTutorGeneratorProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth, isSyllabusLoading, onRefresh }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [storyIndex, setStoryIndex] = useState(1);

  // Initialize from storage
  const [topic, setTopic] = useState<string>(() => {
      const saved = getComponentState<{data: StoryTutorResponse|null, topic: string}>(STORAGE_KEY);
      return saved?.topic || (topics.length > 0 ? topics[0] : '');
  });

  const [storyData, setStoryData] = useState<StoryTutorResponse | null>(() => {
      const saved = getComponentState<{data: StoryTutorResponse|null, topic: string}>(STORAGE_KEY);
      return saved?.data || null;
  });

  useEffect(() => {
    // Sync topic default
    if (!topic && topics.length > 0) {
        setTopic(topics[0]);
    }
  }, [topics, topic]);

  // Persist State
  useEffect(() => {
      saveComponentState(STORAGE_KEY, { data: storyData, topic });
  }, [storyData, topic]);

  // Auto-fetch topics if missing
  useEffect(() => {
    if (topics.length === 0 && !isSyllabusLoading && isOnline && onRefresh) {
        onRefresh();
    }
  }, [topics.length, isSyllabusLoading, isOnline, onRefresh]);

  const handleGenerateStory = async (indexToFetch: number = 1) => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    if (!topic) return;

    setIsLoading(true);
    setStoryData(null);
    setError(null);
    setShowSolution(false);

    logActivity(user?.uid || null, {
        type: 'STORY_TUTOR_VIEWED' as HistoryType,
        description: `Generated story lesson for "${topic}"`,
        view: AppView.STORY_TUTOR,
        context: { topic }
    });

    try {
      const result = await generateStoryForTopic(topic, language, indexToFetch);
      setStoryData(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleGenerateAnother = () => {
      if (storyIndex < 10) {
          const nextIndex = storyIndex + 1;
          setStoryIndex(nextIndex);
          handleGenerateStory(nextIndex);
      }
  };

  const handleTopicSelect = () => {
    showPopup({
      title: 'Select a Topic',
      options: topics.map(t => ({ value: t, label: t })),
      onSelect: (selectedTopic) => {
        setTopic(selectedTopic);
        setStoryData(null);
        setError(null);
        setStoryIndex(1);
      },
    });
  };

  const handlePrint = () => window.print();

  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the Story Tutor.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  if (topics.length === 0) {
      return (
          <div className="max-w-3xl mx-auto">
              <Card className="text-center py-10">
                  {isSyllabusLoading ? (
                      <>
                        <LoadingSpinner />
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Loading your syllabus topics...</p>
                      </>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">No Syllabus Loaded</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We need to load the topics before you can generate a story lesson.</p>
                        <Button onClick={onRefresh} variant="secondary" disabled={!isOnline}>
                            {isOnline ? 'Load Topics Now' : 'You are Offline'}
                        </Button>
                      </>
                  )}
              </Card>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto print-section-wrapper">
      <Card>
        <div className="text-center no-print">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Story Tutor</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Master complex topics and solve questions through engaging stories.</p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 no-print">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full flex-grow">
              <PopupSelector
                label="Select a topic to learn"
                value={topic}
                placeholder="Select a topic..."
                onClick={handleTopicSelect}
                disabled={topics.length === 0 || isLoading}
              />
            </div>
            <Button onClick={() => handleGenerateStory(1)} disabled={isLoading || !isOnline || !topic} className="w-full sm:w-auto flex-shrink-0 !py-3">
              {isLoading ? 'Creating Story...' : 'Generate Story'}
            </Button>
          </div>
          <ErrorMessage message={error} onRetry={handleGenerateStory} />
        </div>

        {isLoading && (
          <div className="text-center p-8 no-print">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600 dark:text-slate-300">Weaving a story for you...</p>
          </div>
        )}

        {storyData && (
          <div className="mt-8 space-y-8 animate-fade-in">
             <div className="flex justify-end no-print">
                <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2" title="Print Lesson">
                    <PrinterIcon className="w-4 h-4" /> 
                </Button>
             </div>

             <div className="print-title hidden print:block mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-black">{topic}</h1>
                <p className="text-gray-500 mt-2">Story Tutor Lesson</p>
             </div>

             {/* Pre-points Section */}
             {storyData.prePoints && storyData.prePoints.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 shadow-sm print:border print:shadow-none print:break-inside-avoid">
                    <div className="flex items-center gap-3 mb-4">
                        <LightBulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">Key Takeaways (Pre-points)</h3>
                    </div>
                    <ul className="space-y-2">
                        {storyData.prePoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
             )}

             {/* Story Section */}
             <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm print:border-none print:shadow-none print:p-0">
                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">The Story</h3>
                <ContentRenderer content={storyData.story} className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed print:text-black" />
             </div>

             {/* Solve with Story Section */}
             {storyData.challengeQuestion && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6 shadow-sm print:border print:shadow-none print:break-inside-avoid">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">Solve with Story</h3>
                    </div>
                    
                    <div className="mb-6">
                        <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Challenge Question:</p>
                        <p className="text-lg text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50 italic">
                            "{storyData.challengeQuestion}"
                        </p>
                    </div>

                    <div className="print:block">
                        {!showSolution ? (
                            <div className="text-center no-print">
                                <Button onClick={() => setShowSolution(true)} variant="success" className="shadow-emerald-200">
                                    Reveal Solution
                                </Button>
                            </div>
                        ) : null}
                        
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showSolution ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 print:max-h-none print:opacity-100'}`}>
                            <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800/50">
                                <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Solution Strategy:</p>
                                <ContentRenderer content={storyData.solutionWithStory} className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 print:text-black" />
                            </div>
                        </div>
                    </div>
                </div>
             )}

             <div className="flex justify-center mt-8 no-print">
                <Button onClick={handleGenerateAnother} disabled={isLoading || !isOnline || storyIndex >= 10} variant="secondary">
                    {storyIndex >= 10 ? 'Maximum stories reached' : `Generate another story (${storyIndex}/10)`}
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
            .print-title { display: block !important; }
            .prose { color: black !important; }
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default StoryTutorGenerator;
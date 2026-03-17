
import React, { useState, useEffect } from 'react';
import { generateGuessPaper } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { GuessPaper, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';

interface GuessPaperGeneratorProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  selectionPath: string;
  canAccessPremium: boolean;
  requestAuth: () => void;
  isSyllabusLoading?: boolean;
  onRefresh?: () => void;
}

const STORAGE_KEY = 'guess_paper_state';

const QuestionCard: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-300 break-inside-avoid">
            <p className="font-semibold text-slate-500 mb-2">Question {index + 1}</p>
            <h3 className="text-lg font-bold text-slate-800">{question}</h3>
            <div className="mt-4 no-print">
                <Button variant="secondary" onClick={() => setIsAnswerVisible(!isAnswerVisible)}>
                    {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
                </Button>
            </div>
            {isAnswerVisible && (
                <div className="mt-4 pt-4 border-t border-slate-200 prose prose-sm prose-slate max-w-none">
                    <ContentRenderer content={answer} />
                </div>
            )}
        </div>
    );
};

const GuessPaperGenerator: React.FC<GuessPaperGeneratorProps> = ({ topics, language, isOnline, showPopup, user, selectionPath, canAccessPremium, requestAuth, isSyllabusLoading, onRefresh }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from storage
  const [guessPaper, setGuessPaper] = useState<GuessPaper | null>(() => {
      const saved = getComponentState<{paper: GuessPaper, topic: string}>(STORAGE_KEY);
      if (saved && saved.topic) {
          setTopic(saved.topic);
          return saved.paper;
      }
      return null;
  });

  useEffect(() => {
    // Sync topic state if not restored from storage or if topics changed
    const saved = getComponentState<{paper: GuessPaper, topic: string}>(STORAGE_KEY);
    if (!saved) {
        if (topics.length > 0 && !topics.includes(topic)) {
            setTopic(topics[0]);
        } else if (topics.length === 0) {
            setTopic('');
        }
    }
  }, [topics, topic]);

  // Persist State
  useEffect(() => {
      if (guessPaper && topic) {
          saveComponentState(STORAGE_KEY, { paper: guessPaper, topic });
      } else if (!guessPaper) {
          saveComponentState(STORAGE_KEY, null);
      }
  }, [guessPaper, topic]);

  // Auto-fetch topics if missing and online
  useEffect(() => {
    if (topics.length === 0 && !isSyllabusLoading && isOnline && onRefresh) {
        onRefresh();
    }
  }, [topics.length, isSyllabusLoading, isOnline, onRefresh]);

  const handleGeneratePaper = async () => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    setIsLoading(true);
    setGuessPaper(null);
    setError(null);
    if (!isOnline) {
      setError("You are offline. Please connect to generate a guess paper.");
      setIsLoading(false);
      return;
    }

    logActivity(user?.uid || null, {
        type: 'GUESS_PAPER_GENERATED' as HistoryType,
        description: `Generated a guess paper for "${topic}"`,
        view: AppView.GUESS_PAPER,
        context: { topic }
    });

    try {
      // Pass !user as isTrial
      const data = await generateGuessPaper(topic, language, selectionPath, !user);
      setGuessPaper(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };
  
  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: (t) => { setTopic(t); setGuessPaper(null); },
    });
  };

  const handlePrint = () => {
      window.print();
  };
  
  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to use the Guess Paper Generator.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Sign Up / Log In</Button>
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
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We need to load the topics before you can generate a guess paper.</p>
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
    <div className="max-w-3xl mx-auto print-section-wrapper">
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 mb-6 no-print">
            <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Guess Paper Generator</h2>
                <p className="text-slate-500 mt-1">Get COC AI-predicted questions for <span className="font-semibold">{selectionPath}</span>.</p>
            </div>
            {guessPaper && (
                <div className="flex gap-2 mt-4 sm:mt-0">
                     <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2">
                        <PrinterIcon className="w-4 h-4" /> Print
                    </Button>
                    <Button variant="secondary" onClick={() => setGuessPaper(null)} className="!px-3 !py-1.5">
                        New Paper
                    </Button>
                </div>
            )}
          </div>

          {!guessPaper ? (
            <div className="no-print">
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full flex-grow">
                          <PopupSelector 
                            label="Select a topic"
                            value={topic}
                            placeholder="Select a topic..."
                            onClick={handleTopicSelect}
                            disabled={topics.length === 0}
                          />
                        </div>
                        <Button onClick={handleGeneratePaper} disabled={isLoading || topics.length === 0 || !isOnline} className="w-full sm:w-auto flex-shrink-0 !py-3">
                          {isLoading ? 'Generating...' : 'Generate Paper'}
                        </Button>
                    </div>
                </div>
                <ErrorMessage message={error} onRetry={handleGeneratePaper} />
                {isLoading && (
                    <div className="text-center p-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-600">COC AI is analyzing patterns to predict questions...</p>
                    </div>
                )}
            </div>
          ) : (
            <div className="mt-6">
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-3xl font-bold text-black">{guessPaper.title}</h1>
                    <p className="text-gray-600 mt-2">Generated by Club of Competition</p>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-center text-indigo-700 mb-6 print:hidden">{guessPaper.title}</h3>
                
                <div className="space-y-6 bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200 print:bg-white print:border-none print:p-0">
                    {guessPaper.questions.map((q, index) => (
                        <QuestionCard key={index} question={q.question} answer={q.answer} index={index} />
                    ))}
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
                .print-content {
                    padding: 0 !important;
                }
                .break-inside-avoid {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .prose { color: black !important; font-size: 11pt; }
            }
        `}</style>
    </div>
  );
};

export default GuessPaperGenerator;

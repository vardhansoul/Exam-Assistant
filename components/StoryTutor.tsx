
import React, { useState, useEffect, useCallback } from 'react';
import { generateStoryForTopic } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import type { StoryTutorResponse } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface StoryTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string | null;
  language: string;
  isOnline: boolean;
  isTrial?: boolean;
}

const StoryTutorModal: React.FC<StoryTutorModalProps> = ({ isOpen, onClose, topic, language, isOnline, isTrial }) => {
  const [data, setData] = useState<StoryTutorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const fetchStory = useCallback(async () => {
    if (!topic) return;
    if (!isOnline) {
      setError("You are offline. Please connect to generate a story.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setData(null);
    setShowSolution(false);
    try {
      const result = await generateStoryForTopic(topic, language, isTrial);
      setData(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [topic, language, isOnline, isTrial]);

  useEffect(() => {
    if (isOpen && topic) {
      fetchStory();
    }
  }, [isOpen, topic, fetchStory]);

  const handlePrint = () => {
      window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col animate-slide-up print-container">
      <div className="w-full h-full flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800 no-print">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">Learn with a Story: {topic}</h3>
          <div className="flex gap-2">
             <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2">
                <PrinterIcon className="w-4 h-4" /> Print
            </Button>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6 flex-grow print-content">
          <div className="max-w-4xl mx-auto h-full">
            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-full text-center no-print">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">COC AI is crafting a story for you...</p>
                </div>
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchStory} />
            ) : data ? (
                <div className="space-y-8 pb-10">
                    <div className="print-title hidden print:block mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-slate-900">{topic}</h1>
                        <p className="text-slate-500 mt-2">Story Tutor - Club of Competition</p>
                    </div>

                    {/* Pre-points Section */}
                    {data.prePoints && data.prePoints.length > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 shadow-sm print:shadow-none print:border">
                            <div className="flex items-center gap-3 mb-4">
                                <LightBulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">Key Takeaways (Pre-points)</h3>
                            </div>
                            <ul className="space-y-2">
                                {data.prePoints.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Story Section */}
                    <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm print:shadow-none print:border-none print:p-0">
                        <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">The Story</h3>
                        <ContentRenderer content={data.story} className="prose prose-lg dark:prose-invert max-w-none print:text-black font-serif leading-relaxed" />
                    </div>

                    {/* Solve with Story Section */}
                    {data.challengeQuestion && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6 shadow-sm print:shadow-none print:border print:break-inside-avoid">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">Solve with Story</h3>
                            </div>
                            
                            <div className="mb-6">
                                <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Challenge Question:</p>
                                <p className="text-lg text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50 italic">
                                    "{data.challengeQuestion}"
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
                                        <ContentRenderer content={data.solutionWithStory} className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-20 text-lg">Could not generate a story. Please try again.</p>
            )}
          </div>
        </div>
        
        <footer className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 flex justify-between items-center no-print">
            <Button onClick={fetchStory} disabled={isLoading || !isOnline} variant="secondary">
                Generate another story
            </Button>
            <Button onClick={onClose}>Close</Button>
        </footer>
      </div>
       <style>{`
            @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            
            @media print {
                @page { margin: 2cm; }
                .no-print, header, footer, button, .sidebar, .mobile-taskbar { display: none !important; }
                body, #root, .print-container { background: white !important; height: auto !important; position: static !important; overflow: visible !important; }
                .print-content { position: static !important; overflow: visible !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                .print-title { display: block !important; }
                .prose { color: black !important; }
            }
       `}</style>
    </div>
  );
};

export default StoryTutorModal;
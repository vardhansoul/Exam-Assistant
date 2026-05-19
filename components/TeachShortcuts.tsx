
import React, { useState, useEffect } from 'react';
import { generateShortcuts, generateAdditionalShortcut } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import { APTITUDE_TOPICS } from '../constants';
import type { PopupConfig } from '../types';
import type { User, HistoryType, SolvingMethod } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';
import PlusIcon from './icons/PlusIcon';

interface TeachShortcutsProps {
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const STORAGE_KEY = 'shortcuts_state';

const TeachShortcuts: React.FC<TeachShortcutsProps> = ({ language, isOnline, showPopup, user, canAccessPremium, requestAuth }) => {
  const [topic, setTopic] = useState<string>(APTITUDE_TOPICS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Initialize from storage
  const [methods, setMethods] = useState<SolvingMethod[] | null>(() => {
      const saved = getComponentState<{content: SolvingMethod[], topic: string}>(STORAGE_KEY);
      if (saved && saved.topic) {
          setTopic(saved.topic);
          return saved.content;
      }
      return null;
  });

  // Persist State
  useEffect(() => {
      if (methods && topic) {
          saveComponentState(STORAGE_KEY, { content: methods, topic });
      } else if (!methods) {
          saveComponentState(STORAGE_KEY, null);
      }
  }, [methods, topic]);

  const handleGenerate = async () => {
    if (!canAccessPremium) {
      requestAuth();
      return;
    }
    if (!isOnline) {
      setError("You are offline. Please connect to the internet to generate shortcuts.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMethods(null);
    setActiveTab(0);

    logActivity(user?.uid || null, {
        type: 'SHORTCUTS_VIEWED' as HistoryType,
        description: `Viewed solving methods for "${topic}"`,
        view: AppView.TEACH_SHORTCUTS,
        context: { topic }
    });

    try {
      const result = await generateShortcuts(topic, language);
      setMethods(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleAddMethod = async () => {
      if (!isOnline || !methods) return;
      setIsGeneratingMore(true);
      try {
          const newMethod = await generateAdditionalShortcut(topic, language, methods.length);
          setMethods(prev => [...(prev || []), newMethod]);
          setActiveTab(methods.length); // Switch to the new tab (index is length before update)
      } catch (err) {
          setError(getSpecificErrorMessage(err));
      }
      setIsGeneratingMore(false);
  };

  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic',
        options: APTITUDE_TOPICS.map(t => ({ value: t, label: t })),
        onSelect: (t) => { setTopic(t); setMethods(null); },
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
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to learn Aptitude Shortcuts.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto print-section-wrapper">
      <Card>
        <div className="text-center no-print">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Aptitude & Reasoning: Solving Methods</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Discover different ways to solve typical problems for any topic.</p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 no-print">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full flex-grow">
              <PopupSelector 
                label="Select Topic"
                value={topic}
                placeholder="Select a topic..."
                onClick={handleTopicSelect}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !isOnline} className="w-full sm:w-auto flex-shrink-0 !py-3">
              {isLoading ? 'Generating...' : 'Get Methods'}
            </Button>
          </div>
          <ErrorMessage message={error} onRetry={handleGenerate} />
        </div>

        {isLoading && (
          <div className="text-center p-8 no-print">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600 dark:text-slate-300">Finding the best solving techniques for {topic}...</p>
          </div>
        )}

        {methods && methods.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 no-print">
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Solving Approaches</h3>
                <div className="self-end sm:self-auto">
                    <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2" title="Print format">
                        <PrinterIcon className="w-4 h-4" /> 
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation (No Print) */}
            <div className="flex space-x-2 rounded-xl bg-slate-100 dark:bg-slate-700 p-1 mb-6 overflow-x-auto no-print items-center">
                {methods.map((method, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`flex-1 min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 whitespace-nowrap px-4 transition-all duration-200 ${
                            activeTab === idx
                                ? 'bg-white dark:bg-slate-800 shadow text-indigo-700 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-white/[0.12] hover:text-indigo-600'
                        }`}
                    >
                        Method {idx + 1}
                    </button>
                ))}
                {/* Add Another Way Button */}
                <button
                    onClick={handleAddMethod}
                    disabled={isGeneratingMore || !isOnline}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate an additional unique solving method"
                >
                    {isGeneratingMore ? (
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <PlusIcon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Add Method</span>
                </button>
            </div>

            {/* Active Content Area */}
            <div className="print-content">
                <div className="hidden print:block mb-6 text-center">
                    <h1 className="text-2xl font-bold text-black">{topic} - Solving Methods</h1>
                    <p className="text-sm text-gray-500">Club of Competition Study Material</p>
                </div>

                {/* In Print mode, show ALL methods stacked. In View mode, show only active tab. */}
                {methods.map((method, idx) => (
                    <div 
                        key={idx} 
                        className={`${activeTab === idx ? 'block' : 'hidden'} print:block print:mb-8 print:break-inside-avoid`}
                    >
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none">
                            <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800 print:bg-transparent print:border-b-2 print:border-gray-300 print:px-0">
                                <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 print:text-black">
                                    {idx + 1}. {method.title}
                                </h3>
                            </div>
                            <div className="p-6 space-y-6 print:px-0">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 print:text-gray-600">Explanation</h4>
                                    <ContentRenderer content={method.explanation} className="prose prose-slate dark:prose-invert max-w-none print:text-black" />
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 print:bg-transparent print:border-l-4 print:border-gray-300 print:rounded-none">
                                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 print:text-gray-600">Worked Example</h4>
                                    <ContentRenderer content={method.example} className="prose prose-slate dark:prose-invert max-w-none print:text-black" />
                                </div>
                            </div>
                        </div>
                    </div>
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
                display: block !important;
                padding: 2cm !important;
            }
            .prose { color: black !important; font-size: 11pt; }
        }
      `}</style>
    </div>
  );
};

export default TeachShortcuts;

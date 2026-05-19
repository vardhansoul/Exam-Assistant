
import React, { useState } from 'react';
import type { Tutorial } from '../types';
import LoadingSpinner, { TypingLoadingText } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ContentRenderer from './ContentRenderer';
import Button from './Button';
import PrinterIcon from './icons/PrinterIcon';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: Tutorial | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, tutorial, isLoading, error, onRetry }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col animate-slide-up print-container">
      <div className="w-full h-full flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800 no-print">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{tutorial?.title || 'Tutorial'}</h3>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" disabled={!tutorial || isLoading} className="flex items-center gap-2" title="Print to PDF">
                <PrinterIcon className="w-4 h-4" /> 
            </Button>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6 flex-grow print-content">
          <div className="max-w-5xl mx-auto h-full">
            {isLoading && (
                <div className="flex flex-col justify-center items-center h-full text-center no-print">
                    <TypingLoadingText />
                </div>
            )}
            {error && <ErrorMessage message={error} onRetry={onRetry} />}
            {tutorial && (
                <div className="space-y-8 pb-10">
                    <div className="print-title hidden print:block mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-slate-900">{tutorial.title}</h1>
                        <p className="text-slate-500 mt-2">Study Tutorial - Club of Competition</p>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-none print:p-0">
                        <ContentRenderer content={tutorial.introduction} className="prose prose-lg dark:prose-invert max-w-none print:text-slate-900"/>
                    </div>

                    {tutorial.prerequisites.length > 0 && (
                        <div className="print:break-inside-avoid">
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 print:text-indigo-700">Prerequisites</h4>
                            <ul className="list-disc list-inside bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-2 print:border-none print:p-0 print:text-slate-800">
                                {tutorial.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    <div className="print:break-before-auto">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 print:text-indigo-700">Step-by-Step Guide</h4>
                        <div className="space-y-6">
                        {tutorial.steps.map(step => (
                            <div key={step.step} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-l-4 print:border-indigo-200 print:rounded-none print:bg-transparent print:mb-6 print:break-inside-avoid">
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">Step {step.step}: {step.title}</p>
                                <div className="mt-2 prose prose-lg dark:prose-invert max-w-none print:text-slate-800"><ContentRenderer content={step.content} /></div>
                                {step.example && (
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 prose prose-lg dark:prose-invert max-w-none print:bg-slate-100 print:text-slate-700">
                                        <ContentRenderer content={`**Example:** ${step.example}`} />
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:p-0 print:break-inside-avoid">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 print:text-indigo-700">Worked Example</h4>
                        <div className="prose prose-lg dark:prose-invert max-w-none print:text-slate-800"><ContentRenderer content={tutorial.workedExample} /></div>
                    </div>

                    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-l-4 border-amber-400 dark:border-amber-600 print:bg-amber-50 print:border-amber-400 print:break-inside-avoid">
                        <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-3">Common Pitfalls</h4>
                        <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 space-y-2 print:text-amber-900">
                            {tutorial.commonPitfalls.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:p-0 print:break-inside-avoid">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 print:text-indigo-700">Summary</h4>
                        <div className="prose prose-lg dark:prose-invert max-w-none print:text-slate-800"><ContentRenderer content={tutorial.summary} /></div>
                    </div>

                    {tutorial.nextSteps.length > 0 && (
                        <div className="print:break-inside-avoid">
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 print:text-indigo-700">Next Steps</h4>
                            <ul className="list-disc list-inside bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-2 print:border-none print:p-0 print:text-slate-800">
                                {tutorial.nextSteps.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    )}

                </div>
            )}
          </div>
        </div>
      </div>
       <style>{`
            @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            
            @media print {
                /* Reset standard page margins for clean PDF */
                @page { margin: 2cm; }

                /* Hide non-print elements */
                .no-print, header, footer, button, .sidebar, .mobile-taskbar {
                    display: none !important;
                }

                /* Container adjustments */
                body, #root, .print-container {
                    background: white !important;
                    height: auto !important;
                    position: static !important;
                    overflow: visible !important;
                }

                /* Content layout */
                .print-content {
                    position: static !important;
                    overflow: visible !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    width: 100% !important;
                }

                .max-w-5xl {
                    max-width: 100% !important;
                    width: 100% !important;
                }

                /* Typographical improvements for print */
                .prose {
                    color: #1a1a1a !important;
                    font-size: 11pt !important;
                    line-height: 1.5 !important;
                }

                .prose h1, .prose h2, .prose h3, .prose h4 {
                    color: #1a1a1a !important;
                    page-break-after: avoid;
                }

                .print-title {
                    display: block !important;
                }

                /* Theme fix: Force light mode colors for printing */
                * {
                    color-scheme: light !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Ensure dark mode text is visible on white paper */
                .dark .print-content * {
                    color: #1a1a1a !important;
                    border-color: #e2e8f0 !important;
                }
            }
       `}</style>
    </div>
  );
};

export default TutorialModal;

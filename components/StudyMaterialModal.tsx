import React, { useState, useEffect } from 'react';
import type { StudyMaterial, DeepDiveMaterial, User } from '../types';
import LoadingSpinner, { TypingLoadingText } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ContentRenderer from './ContentRenderer';
import Button from './Button';
import PrinterIcon from './icons/PrinterIcon';
import { generateDeepDiveForTopic } from '../services/geminiService';

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; variant?: 'notes' | 'summary' | 'story' | 'questions'; wordCount?: number; }> = ({ title, children, defaultOpen = false, variant = 'notes', wordCount }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const variantStyles = {
        notes:     { container: 'border-slate-200 dark:border-slate-600', header: 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600', content: 'bg-white dark:bg-slate-700' },
        summary:   { container: 'border-amber-300 dark:border-amber-700', header: 'bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40', content: 'bg-amber-50/50 dark:bg-amber-900/20' },
        story:     { container: 'border-sky-300 dark:border-sky-700', header: 'bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/40', content: 'bg-sky-50/50 dark:bg-sky-900/20' },
        questions: { container: 'border-emerald-300 dark:border-emerald-700', header: 'bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40', content: 'bg-emerald-50/50 dark:bg-emerald-900/20' },
    };

    const styles = variantStyles[variant];

    return (
        <div className={`border rounded-xl transition-shadow hover:shadow-md ${styles.container} print:border-none print:shadow-none print:mb-4`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-4 font-bold text-slate-800 dark:text-slate-100 rounded-t-xl ${styles.header} no-print`}
                aria-expanded={isOpen}
            >
                <div className="flex items-baseline gap-2">
                    <span className="text-lg">{title}</span>
                    {wordCount && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({wordCount} words)</span>}
                </div>
                <span className={`text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {/* For print: always show content if it's rendered, or we rely on user expanding it. 
                Optimally, we'd force expand for print, but React state controls rendering. 
                We'll add a print-only header to identifying the section since the button is hidden. */}
            {isOpen && (
                <>
                    <h4 className="hidden print:block text-lg font-bold mb-2 uppercase tracking-wide border-b border-slate-300 pb-1 mt-4">{title}</h4>
                    <div className={`p-4 border-t ${styles.container} ${styles.content} print:border-none print:p-0 print:bg-transparent`}>
                        {children}
                    </div>
                </>
            )}
        </div>
    );
};

const QuizItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="p-3 bg-white dark:bg-slate-700 rounded-md border dark:border-slate-600 mt-2 shadow-sm print:shadow-none print:border-slate-300">
      <p className="font-semibold text-slate-700 dark:text-slate-200 print:text-black">{question}</p>
      <button onClick={() => setShowAnswer(!showAnswer)} className="text-sm text-indigo-600 dark:text-indigo-400 font-bold mt-2 hover:underline no-print">
        {showAnswer ? 'Hide' : 'Show'} Answer
      </button>
      {/* For print: always show answer or add a print class to show it? 
          Simple approach: User must expand to see/print answer, OR we force show in print. 
          Let's force show answer in print for better utility. */}
      <div className={`mt-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded prose prose-slate dark:prose-invert max-w-none print:block print:bg-transparent print:text-black print:pl-0 ${showAnswer ? 'block' : 'hidden'}`}>
          <strong className="hidden print:inline">Answer: </strong><ContentRenderer content={answer} />
      </div>
    </div>
  );
};


interface StudyMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string | null;
  material: StudyMaterial | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  language: string;
  selectionPath: string;
  isOnline: boolean;
  user: User | null;
  onSelectRelatedTopic: (topic: string) => void;
}

const StudyMaterialModal: React.FC<StudyMaterialModalProps> = ({ isOpen, onClose, topic, material, isLoading, error, onRetry, language, selectionPath, isOnline, user, onSelectRelatedTopic }) => {
  const [deepDiveMaterial, setDeepDiveMaterial] = useState<DeepDiveMaterial | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);

  useEffect(() => {
    // Reset deep dive when modal opens for a new topic
    setDeepDiveMaterial(null);
    if (material && topic && isOnline) {
      const fetchDeepDive = async () => {
        setIsDeepDiveLoading(true);
        try {
          const deepDiveData = await generateDeepDiveForTopic(topic, language, selectionPath);
          setDeepDiveMaterial(deepDiveData);
        } catch (e) {
          console.warn("Could not fetch deep dive material:", e);
          // Silently fail, as it's an enhancement and not critical.
        } finally {
          setIsDeepDiveLoading(false);
        }
      };
      fetchDeepDive();
    }
  }, [material, topic, language, selectionPath, isOnline, user]);

  const handlePrint = () => {
      window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col animate-slide-up print-container">
      <div className="w-full h-full flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800 no-print">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">{topic}</h3>
          <div className="flex gap-2">
             <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2" title="Print to PDF">
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
            <ErrorMessage message={error} onRetry={onRetry} />
            {material && (
                <div className="space-y-6 pb-10">
                    <div className="print-title hidden print:block mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-slate-900">{topic}</h1>
                        <p className="text-slate-500 mt-2">Study Material - Club of Competition</p>
                    </div>

                    {/* Summary Section */}
                    <CollapsibleSection title="Quick Summary" defaultOpen variant="summary">
                        <ContentRenderer content={material.summary} className="prose prose-lg dark:prose-invert max-w-none print:text-slate-800" />
                    </CollapsibleSection>

                    {/* Detailed Notes Section */}
                    <CollapsibleSection title="Detailed Notes" defaultOpen variant="notes" wordCount={material.notes.split(/\s+/).length}>
                        <ContentRenderer content={material.notes} className="prose prose-lg dark:prose-invert max-w-none print:text-slate-800" />
                    </CollapsibleSection>

                    {/* Shortcuts Section */}
                    {material.shortcutsAndTricks && (
                        <CollapsibleSection title="Shortcuts & Tricks" defaultOpen={false} variant="notes">
                            <ContentRenderer content={material.shortcutsAndTricks} className="prose prose-lg dark:prose-invert max-w-none print:text-slate-800" />
                        </CollapsibleSection>
                    )}

                    {/* Story Mode Section */}
                    <CollapsibleSection title="Learn with a Story" defaultOpen={false} variant="story">
                        <ContentRenderer content={material.story} className="prose prose-lg dark:prose-invert max-w-none print:text-slate-800" />
                    </CollapsibleSection>

                    {/* Practice Questions */}
                    <CollapsibleSection title="Practice Questions" defaultOpen={false} variant="questions">
                        {material.practiceQuestions.map((q, idx) => (
                            <QuizItem key={idx} question={`${idx + 1}. ${q.question}`} answer={q.answer} />
                        ))}
                    </CollapsibleSection>

                    {/* Deep Dive Section (Async Loaded) */}
                    {isDeepDiveLoading ? (
                        <div className="p-6 border border-indigo-200 rounded-xl bg-indigo-50/50 flex flex-col items-center justify-center no-print">
                            <LoadingSpinner />
                            <p className="mt-2 text-indigo-600 font-medium">Loading Deep Dive Analysis...</p>
                        </div>
                    ) : deepDiveMaterial && (
                        <div className="border border-indigo-300 dark:border-indigo-700 rounded-xl print:border-none print:mt-8">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-t-xl border-b border-indigo-200 dark:border-indigo-800 no-print">
                                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">Deep Dive Analysis</h3>
                            </div>
                            <h4 className="hidden print:block text-xl font-bold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">Deep Dive Analysis</h4>
                            
                            <div className="p-4 space-y-6 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-b-xl">
                                <div>
                                    <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">Core Concepts</h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                        {deepDiveMaterial.coreConcepts.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                                {deepDiveMaterial.commonMistakes.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-2">Common Mistakes</h4>
                                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                            {deepDiveMaterial.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Real World Application</h4>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{deepDiveMaterial.realWorldExample}</p>
                                </div>
                                {deepDiveMaterial.relatedTopics.length > 0 && (
                                    <div className="no-print">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Related Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {deepDiveMaterial.relatedTopics.map(topic => (
                                                <button 
                                                    key={topic}
                                                    onClick={() => onSelectRelatedTopic(topic)}
                                                    className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    {topic}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                @page { margin: 2cm; }
                .no-print, header, footer, button, .sidebar, .mobile-taskbar { display: none !important; }
                body, #root, .print-container { background: white !important; height: auto !important; position: static !important; overflow: visible !important; }
                .print-content { position: static !important; overflow: visible !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                .max-w-5xl { max-width: 100% !important; width: 100% !important; }
                .prose { color: #1a1a1a !important; font-size: 11pt !important; line-height: 1.5 !important; }
                .print-title { display: block !important; }
                * { color-scheme: light !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
       `}</style>
    </div>
  );
};

export default StudyMaterialModal;
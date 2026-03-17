
import React, { useState, useEffect } from 'react';
import { getDictionaryDefinition } from '../services/geminiService';
import type { DictionaryEntry } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface DictionaryPopupProps {
  word: string;
  position: { top: number; left: number }; // Kept for interface compatibility but ignored
  language: string;
  onClose: () => void;
}

const DictionaryPopup: React.FC<DictionaryPopupProps> = ({ word, language, onClose }) => {
  const [definition, setDefinition] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs whenever the selected word changes.
    const fetchDefinition = async () => {
      if (!word) return;
      setIsLoading(true);
      setError(null);
      setDefinition(null);
      try {
        const result = await getDictionaryDefinition(word, language);
        setDefinition(result);
      } catch (err) {
        setError("Could not find a definition for this word.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefinition();
  }, [word, language]);

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="w-full h-full bg-white dark:bg-slate-800 flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-end">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </header>
        
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-4xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">{word}</h3>
            
            {isLoading && (
                <div className="flex justify-center items-center py-4">
                <LoadingSpinner />
                </div>
            )}

            {error && <p className="text-lg text-red-600 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl">{error}</p>}
            
            {definition && (
                <div className="space-y-6 max-w-2xl">
                <p className="text-xl font-semibold text-slate-500 dark:text-slate-400 italic">{definition.partOfSpeech}</p>
                <p className="text-2xl text-slate-800 dark:text-slate-100 leading-relaxed">{definition.definition}</p>
                <div className="text-slate-600 dark:text-slate-300 mt-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-indigo-300 dark:border-indigo-600 text-lg">
                    <em>"{definition.example}"</em>
                </div>
                </div>
            )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DictionaryPopup;

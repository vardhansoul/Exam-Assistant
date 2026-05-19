
import React, { useState, useEffect } from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}></div>
);

// Simulated typing line animation to make waiting for AI feel faster via distraction
export const TypingLoadingText: React.FC<{ phrases?: string[] }> = ({ phrases }) => {
    const defaultPhrases = [
        "Analyzing topic boundaries...",
        "Evaluating historical patterns and PYQs...",
        "Extracting microscopic core concepts...",
        "Writing deep-dive explanations...",
        "Generating complex Mermaid diagrams...",
        "Assembling textbook formatting...",
        "Polishing final layout..."
    ];
    
    const lines = phrases || defaultPhrases;
    const [currentLine, setCurrentLine] = useState(0);

    useEffect(() => {
        // Reset whenever it mounts
        setCurrentLine(0);
        const interval = setInterval(() => {
            setCurrentLine(prev => (prev < lines.length - 1 ? prev + 1 : prev));
        }, 1200); // Reveal a new line slightly faster (1.2 seconds)

        return () => clearInterval(interval);
    }, [lines]);

    return (
        <div className="flex flex-col justify-center items-center h-full text-center p-8 w-full max-w-sm mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-8"></div>
            <div className="text-left font-mono text-sm w-full space-y-3 min-h-[200px]">
                {lines.map((line, index) => (
                    <div 
                        key={index}
                        className={`transition-all duration-300 flex items-center gap-3 ${index <= currentLine ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}
                    >
                         <svg className={`shrink-0 w-4 h-4 ${index < currentLine ? 'text-green-500' : 'text-indigo-500 animate-pulse'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {index < currentLine ? (
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           ) : (
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                           )}
                        </svg>
                        <span className={`truncate ${index < currentLine ? "text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200 font-semibold"}`}>
                            {line}
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-6 text-xs text-slate-400 animate-pulse">Writing detailed textbook layout...</p>
        </div>
    );
};

export default LoadingSpinner;

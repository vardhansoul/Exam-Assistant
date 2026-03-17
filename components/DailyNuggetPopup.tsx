
import React from 'react';
import type { DailyNugget } from '../types';
import Button from './Button';

interface DailyNuggetPopupProps {
  nugget: DailyNugget;
  onClose: () => void;
}

const DailyNuggetPopup: React.FC<DailyNuggetPopupProps> = ({ nugget, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col items-center justify-center p-6 animate-slide-up"
    >
      <div className="w-full max-w-2xl text-center space-y-8">
        {nugget.type === 'word' ? (
          <>
            <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Word of the Day</h2>
            <div className="py-8">
                <p className="text-6xl sm:text-7xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-6">{nugget.word}</p>
                <p className="text-2xl sm:text-3xl text-slate-700 dark:text-slate-300 font-serif italic">{nugget.meaning}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-lg text-slate-600 dark:text-slate-400">"{nugget.sentence}"</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quote of the Day</h2>
            <div className="py-10">
                <p className="text-3xl sm:text-4xl text-slate-800 dark:text-slate-100 leading-relaxed font-serif">"{nugget.quote}"</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-6">- {nugget.author || 'Unknown'}</p>
            </div>
          </>
        )}
        <div className="pt-8 w-full max-w-xs mx-auto">
          <Button onClick={onClose} className="w-full !py-4 text-xl shadow-lg">
            Got it!
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DailyNuggetPopup;

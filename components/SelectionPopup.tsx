
import React, { useState, useMemo, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  onSelect: (value: string) => void;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ isOpen, onClose, title, options, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  
  useEffect(() => {
      // Reset search term when the popup opens with new options
      if (isOpen) {
          setSearchTerm('');
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-up">
      <div className="flex flex-col h-full w-full">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        {options.length > 10 && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 text-lg"
                />
            </div>
        )}

        <div className="overflow-y-auto p-4 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className="w-full h-full p-6 text-left bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all duration-200 shadow-sm"
              >
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{option.label}</p>
                {option.subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{option.subtitle}</p>}
              </button>
            ))}
            {filteredOptions.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 text-center col-span-full py-20 text-lg">No options found.</p>
            )}
          </div>
        </div>
      </div>
       <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default SelectionPopup;

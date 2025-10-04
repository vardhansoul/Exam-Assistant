





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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
            X
          </button>
        </header>
        
        {options.length > 10 && (
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-500"
                />
            </div>
        )}

        <div className="overflow-y-auto p-4 flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className="w-full h-full p-4 text-left bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-200"
              >
                <p className="font-semibold text-slate-700">{option.label}</p>
                {option.subtitle && <p className="text-xs text-slate-500 mt-1">{option.subtitle}</p>}
              </button>
            ))}
            {filteredOptions.length === 0 && (
                <p className="text-slate-500 text-center col-span-full py-8">No options found.</p>
            )}
          </div>
        </div>
      </div>
       <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default SelectionPopup;
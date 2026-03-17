
import React, { useState, useMemo } from 'react';
import type { DisplaySettings } from '../types';
import { LANGUAGES } from '../constants';

interface DisplaySettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onSettingsChange: (newSettings: Partial<DisplaySettings>) => void;
}

const DisplaySettingsPopup: React.FC<DisplaySettingsPopupProps> = ({
  isOpen, onClose, settings, onSettingsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { language, fontSize, fontFamily, theme } = settings;

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return LANGUAGES;
    return LANGUAGES.filter(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);
  
  const SettingButtonGroup: React.FC<{
      label: string;
      options: { value: string; label: string }[];
      currentValue: string;
      onSelect: (value: any) => void;
  }> = ({ label, options, currentValue, onSelect }) => (
      <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-lg">{label}</h4>
          <div className="flex w-full rounded-xl bg-slate-200 dark:bg-slate-700 p-1.5">
              {options.map(opt => (
                  <button
                      key={opt.value}
                      onClick={() => onSelect(opt.value)}
                      className={`flex-1 py-3 px-4 text-base font-semibold rounded-lg transition-all ${currentValue === opt.value ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`}
                  >
                      {opt.label}
                  </button>
              ))}
          </div>
      </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-up"
    >
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Display Settings</h3>
        <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </header>

      <div className="flex-grow overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <SettingButtonGroup
                label="Theme"
                options={[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}, {value: 'system', label: 'System'}]}
                currentValue={theme}
                onSelect={(value) => onSettingsChange({ theme: value })}
            />
            <SettingButtonGroup
                label="Text Size"
                options={[{value: 'sm', label: 'Small'}, {value: 'base', label: 'Medium'}, {value: 'lg', label: 'Large'}]}
                currentValue={fontSize}
                onSelect={(value) => onSettingsChange({ fontSize: value })}
            />
            <SettingButtonGroup
                label="Font Style"
                options={[{value: 'sans', label: 'Sans-serif'}, {value: 'serif', label: 'Serif'}, {value: 'mono', label: 'Monospace'}]}
                currentValue={fontFamily}
                onSelect={(value) => onSettingsChange({ fontFamily: value })}
            />
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                 <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-lg">Language</h4>
                 <input
                    type="text"
                    placeholder={`Search languages... (Current: ${language})`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 mb-4"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredLanguages.map(lang => (
                    <button
                        key={lang}
                        onClick={() => { onSettingsChange({ language: lang }); onClose(); }}
                        className={`w-full p-4 text-left rounded-xl text-base transition-colors ${lang === language ? 'bg-indigo-600 text-white font-bold shadow-md' : 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-200'}`}
                    >
                        {lang}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
       <style>{`
            @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default DisplaySettingsPopup;

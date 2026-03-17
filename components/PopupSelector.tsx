import React from 'react';

interface PopupSelectorProps {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
  disabled?: boolean;
}

const PopupSelector: React.FC<PopupSelectorProps> = ({ label, value, placeholder, onClick, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800"
      >
        <span className={value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <span className="text-slate-500 dark:text-slate-400">▼</span>
      </button>
    </div>
  );
};

export default PopupSelector;
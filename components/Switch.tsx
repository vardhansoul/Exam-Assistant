import React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch: React.FC<SwitchProps> = (props) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" {...props} />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
    </label>
  );
};

export default Switch;

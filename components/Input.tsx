
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
    return (
        <div>
            <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-700">{label}</label>
            <input 
                {...props} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-slate-50" 
            />
        </div>
    );
};

export default Input;

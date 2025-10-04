
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, placeholder, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <select
          {...props}
          className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100"
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;
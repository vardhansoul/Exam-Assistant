import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/60 p-5 sm:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block';
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };

  return <span className={`${baseClasses} ${variantClasses[variant]}`}>{children}</span>;
};

export default Badge;

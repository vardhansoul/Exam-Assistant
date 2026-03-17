
import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface MobileTaskbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  jobCount?: number;
  onBack?: () => void;
}

const TaskbarItem: React.FC<{
    view?: AppView;
    label: string;
    icon: React.ReactNode;
    currentView: AppView;
    setView: (view: AppView) => void;
    badge?: number;
    isActive?: boolean;
    onClick?: () => void;
}> = ({ view, label, icon, currentView, setView, badge, isActive, onClick }) => {
    // If onClick is provided, use it (for Back button). Otherwise use view logic.
    const active = isActive !== undefined ? isActive : (view === currentView);
    const handleClick = onClick ? onClick : () => view && setView(view);

    return (
        <button
            onClick={handleClick}
            className={`relative flex flex-col items-center justify-center flex-1 p-1 text-xs transition-colors ${
                active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'
            }`}
        >
            <div className="w-6 h-6 mb-0.5">{icon}</div>
            <span className="truncate w-full text-center">{label}</span>
            {badge && badge > 0 && (
                <span className="absolute top-1 right-3 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[1.25rem] text-center border-2 border-white dark:border-slate-800 leading-none">
                    {badge}
                </span>
            )}
        </button>
    );
};

const MobileTaskbar: React.FC<MobileTaskbarProps> = ({ currentView, setView, jobCount, onBack }) => {
    const navItems = [
        { view: AppView.HOME, label: 'Home', icon: <HomeIcon /> },
        { view: AppView.ASK_AI, label: 'Ask COC', icon: <QuestionMarkCircleIcon /> },
        { view: AppView.JOB_NOTIFICATIONS, label: 'Jobs', icon: <BriefcaseIcon /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 z-20 flex sm:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
            {currentView !== AppView.HOME && (
                <TaskbarItem 
                    label="Back" 
                    icon={<ArrowLeftIcon />} 
                    currentView={currentView} 
                    setView={setView} 
                    isActive={false}
                    onClick={onBack}
                />
            )}
            {navItems.map(item => (
                <TaskbarItem 
                    key={item.label} 
                    {...item} 
                    currentView={currentView} 
                    setView={setView}
                    badge={item.view === AppView.JOB_NOTIFICATIONS ? jobCount : undefined}
                />
            ))}
        </div>
    );
};

export default MobileTaskbar;

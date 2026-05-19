
import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import NewspaperIcon from './icons/NewspaperIcon2';
import BookOpenIcon from './icons/BookOpenIcon';

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
            className={`relative flex flex-col items-center justify-center flex-1 p-1 text-[10px] font-medium transition-colors ${
                active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
            <div className={`w-10 h-8 mb-1 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-slate-100 dark:bg-slate-800' : 'bg-transparent'}`}>
                <div className="w-5 h-5">{icon}</div>
            </div>
            <span className="truncate w-full text-center">{label}</span>
            {badge && badge > 0 && (
                <span className="absolute top-1 right-2 px-1 py-0.5 bg-indigo-500 text-white text-[8px] font-bold rounded-full min-w-[1rem] text-center border ring-2 ring-white dark:ring-slate-900 leading-none">
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
        { view: AppView.CURRENT_AFFAIRS, label: 'Current Affairs', icon: <NewspaperIcon /> },
        { view: AppView.JOB_NOTIFICATIONS, label: 'Jobs', icon: <BriefcaseIcon /> },
        { label: 'Study Plan', icon: <BookOpenIcon />, onClick: () => window.open('https://clubofcompetition.in/studyplan', '_blank') },
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


import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import NewspaperIcon from './icons/NewspaperIcon2';
import BookOpenIcon from './icons/BookOpenIcon';

interface NavigationMenuProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  jobCount?: number;
  onBack?: () => void;
}

interface NavItemProps {
  view?: AppView;
  label: string;
  icon: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  onClose: () => void;
  badge?: number;
  isBack?: boolean;
  onBack?: () => void;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon, currentView, setView, onClose, badge, isBack, onBack, onClick }) => {
  const isActive = !isBack && view === currentView;
  const handleClick = () => {
    if (onClick) {
        onClick();
    } else if (isBack && onBack) {
        onBack();
    } else if (view) {
        setView(view);
    }
    onClose();
  };
  return (
    <li>
      <button
        onClick={handleClick}
        className={`relative flex items-center w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
            : isBack 
                ? 'text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 mb-4' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <span className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>{icon}</span>
        <span className="flex-grow text-left">{label}</span>
        {badge && badge > 0 && (
            <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                {badge}
            </span>
        )}
      </button>
    </li>
  );
};

const Sidebar: React.FC<NavigationMenuProps> = ({ currentView, setView, isOpen, onClose, jobCount, onBack }) => {
    const navItems = [
        { view: AppView.HOME, label: 'Dashboard', icon: <HomeIcon /> },
        { view: AppView.ASK_AI, label: 'Ask COC', icon: <QuestionMarkCircleIcon /> },
        { view: AppView.CURRENT_AFFAIRS, label: 'Current Affairs', icon: <GlobeAltIcon className="w-6 h-6" /> },
        { view: AppView.JOB_NOTIFICATIONS, label: 'Alerts & Updates', icon: <BriefcaseIcon /> },
        { label: 'Study Plan', icon: <BookOpenIcon />, onClick: () => window.open('https://clubofcompetition.in/studyplan', '_blank') },
    ];

    return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-800 w-64 p-4 z-40 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col shadow-lg lg:shadow-none border-r border-slate-200 dark:border-slate-700`}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Club of Competition</h1>
          <button onClick={onClose} className="lg:hidden p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-2xl font-bold">
            &times;
          </button>
        </div>
        <nav className="flex-grow overflow-y-auto pr-2 -mr-2">
          <ul className="space-y-2">
            {currentView !== AppView.HOME && (
                <NavItem 
                    label="Back" 
                    icon={<ArrowLeftIcon />} 
                    currentView={currentView} 
                    setView={setView} 
                    onClose={onClose}
                    isBack={true}
                    onBack={onBack}
                />
            )}
            {navItems.map(item => (
              <NavItem 
                key={item.label} 
                {...item} 
                currentView={currentView} 
                setView={setView} 
                onClose={onClose} 
                badge={item.view === AppView.JOB_NOTIFICATIONS ? jobCount : undefined}
              />
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Sync Status:</span>
            <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                Active
            </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

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
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon, currentView, setView, onClose, badge, isBack, onBack }) => {
  const isActive = !isBack && view === currentView;
  const handleClick = () => {
    if (isBack && onBack) {
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
        className={`relative flex items-center w-full p-3 rounded-lg text-base font-medium transition-colors ${
          isActive
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
            : isBack 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 mb-2' 
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <span className="mr-4 h-6 w-6 flex-shrink-0">{icon}</span>
        <span className="flex-grow text-left">{label}</span>
        {badge && badge > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
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
        { view: AppView.JOB_NOTIFICATIONS, label: 'Job Notifications', icon: <BriefcaseIcon /> },
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
      </aside>
    </>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import Bars3Icon from './icons/Bars3Icon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import ArrowRightOnRectangleIcon from './icons/ArrowRightOnRectangleIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import { AppView, User, LastSelection } from '../types';
import Button from './Button';

interface HeaderProps {
  onToggleNav: () => void;
  onOpenSettings: () => void;
  onUserSignOut: () => void;
  setView: (view: AppView) => void;
  user: User | null;
  lastSelection: LastSelection | null;
  onChangeExam: () => void;
  isAdmin: boolean;
  setAppMode: (mode: 'user' | 'admin') => void;
  requestAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleNav, onOpenSettings, onUserSignOut, setView, user, lastSelection, onChangeExam,
  isAdmin, setAppMode, requestAuth
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getExamDisplay = (selection: LastSelection | null): string => {
    if (!selection) return 'No Exam Selected';

    if (selection.selectionLevel === 'School Syllabus (NCERT)') {
      if (selection.selectedExam && selection.selectedTier) { // Class & Subject
        return `${selection.selectedExam} - ${selection.selectedTier}`;
      }
      return selection.selectedExam || '';
    }

    if (selection.selectionLevel === 'Exams by Qualification') {
        if (selection.selectedQualification) {
            return `Exams for ${selection.selectedQualification}`;
        }
        return '';
    }

    if (selection.selectedSubCategory) {
      return `${selection.selectedSubCategory}${selection.selectedTier ? ` (${selection.selectedTier})` : ''}`;
    }
    
    if (selection.selectedExam) {
      return selection.selectedExam;
    }
    
    return '';
  };

  const examDisplay = getExamDisplay(lastSelection);

  return (
    <header className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40 z-30 sticky top-0 transition-colors duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-1 min-w-0">
            <button onClick={onToggleNav} className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-colors">
              <Bars3Icon className="h-5 w-5" />
            </button>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                <span className="truncate">Welcome, {user?.displayName?.split(' ')[0] || 'Aspirant'}!</span>
                {examDisplay && (
                    <button onClick={onChangeExam} className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline-flex items-center gap-2 group" title="Change your exam focus">
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{examDisplay}</span>
                    </button>
                )}
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onOpenSettings} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Open display settings">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)} className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700" aria-label="Open user menu">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-800" />
                ) : (
                    <UserCircleIcon className="h-7 w-7 text-slate-400" />
                )}
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">{user?.displayName?.split(' ')[0]}</span>
                <span className="hidden sm:inline text-slate-400 text-xs">▼</span>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none py-2 border border-slate-200 dark:border-slate-800 animate-fade-in-fast z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <button onClick={() => { setView(AppView.LEARNING_TRACKER); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors">
                    <ChartBarIcon className="w-4 h-4" /> Insights
                  </button>
                  {isAdmin && (
                    <button onClick={() => { setAppMode('admin'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors">
                        <ChartBarIcon className="w-4 h-4" /> Admin Panel
                    </button>
                  )}
                  <button onClick={() => { onUserSignOut(); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors mt-1">
                    <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </header>
  );
};

export default Header;

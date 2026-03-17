
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
  onTrialLogout: () => void;
  setView: (view: AppView) => void;
  user: User | null;
  lastSelection: LastSelection | null;
  onChangeExam: () => void;
  isAnonymous: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  requestAuth: () => void;
  verifiedPhoneNumber: string | null;
  isAdmin: boolean;
  setAppMode: (mode: 'user' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleNav, onOpenSettings, onUserSignOut, setView, user, lastSelection, onChangeExam,
  isAnonymous, isTrialActive, trialDaysRemaining, requestAuth, verifiedPhoneNumber, onTrialLogout,
  isAdmin, setAppMode
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isTrialMenuOpen, setIsTrialMenuOpen] = useState(false);

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

  if (isAnonymous) {
    return (
      <header className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center flex-1 min-w-0">
            <button onClick={onToggleNav} className="lg:hidden p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2">
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="text-sm sm:text-base font-semibold">
              {isTrialActive ? (
                <span className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1.5 rounded-full">
                  Trial: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-full">
                  Trial Expired
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenSettings} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Open display settings">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            <div className="relative">
                <button onClick={() => setIsTrialMenuOpen(!isTrialMenuOpen)} onBlur={() => setTimeout(() => setIsTrialMenuOpen(false), 200)} className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Open trial menu">
                    <UserCircleIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">{verifiedPhoneNumber}</span>
                    <span className="hidden sm:inline text-slate-500 dark:text-slate-400">▼</span>
                </button>
                {isTrialMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700 animate-fade-in-fast">
                        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">Trial Account</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{verifiedPhoneNumber}</p>
                        </div>
                        <button onClick={() => { requestAuth(); setIsTrialMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                           <UserCircleIcon className="w-5 h-5" /> Sign Up / Log In
                        </button>
                        <button onClick={() => { onTrialLogout(); setIsTrialMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                           <ArrowRightOnRectangleIcon className="w-5 h-5" /> End Trial & Log Out
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-1 min-w-0">
            <button onClick={onToggleNav} className="lg:hidden p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 mr-2">
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                <span className="truncate">Welcome, {user?.displayName?.split(' ')[0] || 'Aspirant'}!</span>
                {examDisplay && (
                    <button onClick={onChangeExam} className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline-flex items-center gap-2 group" title="Change your exam focus">
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline truncate transition-colors">{examDisplay}</span>
                    </button>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onOpenSettings} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Open display settings">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)} className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Open user menu">
                {user?.validityDaysRemaining !== undefined && (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded whitespace-nowrap">
                        {user.validityDaysRemaining}d left
                    </span>
                )}
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                    <UserCircleIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                )}
                <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.displayName?.split(' ')[0]}</span>
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400">▼</span>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700 animate-fade-in-fast">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { setView(AppView.LEARNING_TRACKER); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" /> Insights
                  </button>
                  {isAdmin && (
                    <button onClick={() => { setAppMode('admin'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5" /> Admin Panel
                    </button>
                  )}
                  <button onClick={() => { onUserSignOut(); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
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

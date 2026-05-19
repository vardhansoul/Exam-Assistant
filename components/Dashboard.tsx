
import React, { useState, useEffect } from 'react';
import { AppView, type User, type LastSelection, type HistoryItem } from '../types';
import { getHistory } from '../utils/tracking';
import Button from './Button';
import BookOpenIcon from './icons/BookOpenIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import NewspaperIcon from './icons/NewspaperIcon2';
import InformationCircleIcon from './icons/InformationCircleIcon';
import RectangleGroupIcon from './icons/RectangleGroupIcon';
import ScissorsIcon from './icons/ScissorsIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClockIcon from './icons/ClockIcon';

interface DashboardProps {
    user: User | null;
    setView: (view: AppView) => void;
    lastSelection: LastSelection | null;
    onChangeExam: () => void;
    isOnline: boolean;
}

const DashboardCard: React.FC<{
  title: string,
  description: string,
  icon: React.ReactNode,
  onClick: () => void,
}> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-left p-6 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/60 hover:border-red-400 dark:hover:border-red-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex flex-col h-full active:scale-[0.98]"
    >
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-5 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold text-blue-950 dark:text-blue-100 group-hover:text-red-800 dark:group-hover:text-red-200 text-base mb-1.5 transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
    </button>
);

const ActivityItem: React.FC<{ item: HistoryItem, onClick: () => void }> = ({ item, onClick }) => {
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div 
            onClick={onClick}
            className="flex items-center justify-between p-4 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    <ClockIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-950 dark:text-blue-100 group-hover:text-red-800 dark:group-hover:text-red-200 transition-colors truncate">{item.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize mt-0.5">{item.view.replace(/_/g, ' ').toLowerCase()}</p>
                </div>
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex-shrink-0 ml-3">
                {timeAgo(item.timestamp)}
            </span>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ user, setView, lastSelection, onChangeExam, isOnline }) => {
    const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const selectionPath = lastSelection ? [lastSelection.selectedExam, lastSelection.selectedSubCategory, lastSelection.selectedTier].filter(Boolean).join(' > ') : 'No Exam Selected';

    let displayFocus = 'No Exam Selected';
    if (lastSelection) {
        if (lastSelection.selectedExam) {
            displayFocus = lastSelection.selectedExam;
        } else if (lastSelection.selectedQualification) {
             displayFocus = lastSelection.selectedQualification;
        } else {
             displayFocus = selectionPath;
        }
    }

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const history = await getHistory(user?.uid || null);
                setRecentActivity(history.slice(0, 10));
            } catch (e) {
                console.error("Failed to load recent activity", e);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [user]);

    const secondaryFeatures = [
        { 
            title: "Exam Details",
            description: "View eligibility, dates, and pattern for your selected exam.",
            icon: <InformationCircleIcon className="w-6 h-6" />,
            view: AppView.EXAM_DETAILS_VIEWER
        },
        {
            title: "Explore Topics",
            description: "Browse your syllabus, study notes, and dive into micro-topics.",
            icon: <BookOpenIcon className="w-6 h-6" />,
            view: AppView.LEARN_TOPICS
        },
        {
            title: "Map Learning",
            description: "Interactive map-based pointer challenge for geography and history.",
            icon: <GlobeAltIcon className="w-6 h-6" />,
            view: AppView.MAP_INTERACTIVE_LEARNING
        },
        {
            title: "Practice Quiz",
            description: "Generate custom quizzes based on your selected exam syllabus.",
            icon: <ClipboardListIcon className="w-6 h-6" />,
            view: AppView.QUIZ
        },
        {
            title: "Story Tutor",
            description: "Master complex topics and solve questions through engaging stories.",
            icon: <SparklesIcon className="w-6 h-6" />,
            view: AppView.STORY_TUTOR
        },
        {
            title: "Mock Interview",
            description: "Practice for your interview with a COC AI-powered mock session.",
            icon: <UserGroupIcon className="w-6 h-6" />,
            view: AppView.INTERVIEW
        },
        {
            title: "Current Affairs",
            description: "Get weekly, monthly, or half-yearly news summaries for your exam.",
            icon: <GlobeAltIcon className="w-6 h-6" />,
            view: AppView.CURRENT_AFFAIRS
        },
        { 
            title: "Alerts & Updates",
            description: "Get the latest job notifications, admit cards, and exam results in one place.",
            icon: <GlobeAltIcon className="w-6 h-6" />,
            view: AppView.JOB_NOTIFICATIONS
        },
        { 
            title: "Flashcards Generator",
            description: "Create and study with decks of digital flashcards for any topic.",
            icon: <RectangleGroupIcon className="w-6 h-6" />,
            view: AppView.FLASHCARDS_GENERATOR
        },
        { 
            title: "Aptitude Shortcuts",
            description: "Learn important shortcuts, tricks, and formulas for aptitude topics.",
            icon: <ScissorsIcon className="w-6 h-6" />,
            view: AppView.TEACH_SHORTCUTS
        },
        { 
            title: "Teach-back Mode",
            description: "Reinforce learning by explaining a concept to your COC AI partner.",
            icon: <UserGroupIcon className="w-6 h-6" />,
            view: AppView.TEACH_BACK_MODE
        },
        { 
            title: "Mind Map Generator",
            description: "Visually structure and connect concepts for any topic.",
            icon: <SparklesIcon className="w-6 h-6" />,
            view: AppView.MIND_MAP
        },
         { 
            title: "Tools Hub",
            description: "Access all specialized COC AI tools for study, career, and practice.",
            icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
            view: AppView.TOOLS
        },
    ];

    const filteredFeatures = secondaryFeatures.filter(feature => 
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between sm:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none transition-all"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">Current Focus</p>
                        {isOnline && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                Synced
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate" title={selectionPath}>
                        {displayFocus}
                    </h2>
                </div>
                <div className="relative z-10">
                    <Button 
                        onClick={onChangeExam} 
                        variant="secondary" 
                        className="w-full sm:w-auto flex-shrink-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" 
                        disabled={!isOnline}
                    >
                        {lastSelection ? 'Change Focus' : 'Select Focus'}
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-12 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search tools like 'Quiz', 'Maps', 'Interview'..."
                    className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-blue-950 dark:text-blue-100 transition-all placeholder-slate-400 text-base shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Tools Grid Section */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    {searchTerm ? 'Search Results' : 'Explore & Learn'}
                </h3>
                
                {filteredFeatures.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFeatures.map(feature => (
                            <DashboardCard
                                key={feature.view}
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                                onClick={() => setView(feature.view)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/50">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">No tools found</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">We couldn't find anything matching "{searchTerm}".</p>
                        <button onClick={() => setSearchTerm('')} className="mt-5 text-blue-600 dark:text-blue-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold transition-colors">Clear search</button>
                    </div>
                )}
            </div>
            
            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/60 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Recent Activity</h3>
                    <button 
                        onClick={() => setView(AppView.LEARNING_TRACKER)}
                        className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                        View Analytics <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                
                {isLoadingHistory ? (
                    <div className="text-center py-12 text-slate-500">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm font-medium">Loading activity...</p>
                    </div>
                ) : recentActivity.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50">
                        <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-blue-400/80" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">No recent activity</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Start using the tools to see your history here!</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800/40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700/50">
                        {recentActivity.map((item, index) => (
                            <ActivityItem 
                                key={item.id || index} 
                                item={item} 
                                onClick={() => setView(item.view)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
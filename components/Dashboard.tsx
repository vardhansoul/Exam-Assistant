
import React, { useState, useEffect } from 'react';
import { AppView, type User, type LastSelection, type HistoryItem } from '../types';
import { getHistory } from '../utils/tracking';
import Button from './Button';
import BookOpenIcon from './icons/BookOpenIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
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
        className="group w-full text-left p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
        <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </div>
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
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-500 dark:text-indigo-400 flex-shrink-0">
                    <ClockIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{item.view.replace(/_/g, ' ').toLowerCase()}</p>
                </div>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
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
            title: "Job Notifications",
            description: "Find the latest government job openings from national and state sources.",
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
        <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-center sm:text-left">
                    <div>
                        <p className="text-sm font-medium text-indigo-200">YOUR CURRENT FOCUS</p>
                        <h2 className="text-2xl font-bold truncate" title={selectionPath}>
                            {displayFocus}
                        </h2>
                    </div>
                    <Button 
                        onClick={onChangeExam} 
                        variant="secondary" 
                        className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30 w-full sm:w-auto flex-shrink-0" 
                        disabled={!isOnline}
                    >
                        {lastSelection ? 'Change Focus' : 'Select Focus'}
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search tools like 'Quiz', 'Maps', 'Interview'..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No tools found matching "{searchTerm}".</p>
                        <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">Clear search</button>
                    </div>
                )}
            </div>
            
            {/* Recent Activity Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Activity</h3>
                    <button 
                        onClick={() => setView(AppView.LEARNING_TRACKER)}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                        View Analytics →
                    </button>
                </div>
                
                {isLoadingHistory ? (
                    <div className="text-center py-10 text-slate-500">Loading activity...</div>
                ) : recentActivity.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No recent activity found. Start using the tools to see your history here!</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
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
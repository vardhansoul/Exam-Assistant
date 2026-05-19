
import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import type { Syllabus, User, HistoryType } from '../types';
import { AppView } from '../types';
import { generateMicroTopics } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getBookmarkedTopics, saveBookmarkedTopics, getComponentState, saveComponentState } from '../utils/tracking';
import Card from './Card';
import Button from './Button';
import LoadingSpinner, { Skeleton } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import FireIcon from './icons/FireIcon';
import PrinterIcon from './icons/PrinterIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import SparklesIcon from './icons/SparklesIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface LearnTopicsProps {
  syllabus: Syllabus;
  onStudyTopic: (topic: string, mainTopic?: string) => void;
  onTeachWithStory: (topic: string) => void;
  onStartTutorial: (topic: string) => void;
  isOnline: boolean;
  user: User | null;
  language: string;
  selectionPath: string;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  canAccessPremium: boolean;
  requestAuth: () => void;
  onSetBackHandler?: (handler: (() => boolean) | null) => void;
  onTakeQuiz?: (topic: string) => void;
}

const STORAGE_KEY = 'topic_explorer_state';

const AccordionItem = memo(({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 dark:border-slate-700/60 rounded-3xl mb-4 bg-white dark:bg-slate-800/40 shadow-sm print:border-none print:bg-transparent print:mb-4 overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 sm:p-6 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors no-print"
                aria-expanded={isOpen}
            >
                <span className="text-lg">{title}</span>
                <span className={`transform transition-transform duration-200 text-slate-400 dark:text-slate-500 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <h4 className="hidden print:block text-lg font-bold text-black border-b border-slate-300 mb-2 mt-4">{title}</h4>
            {isOpen && <div className="p-5 sm:p-6 pt-0 sm:pt-0 bg-transparent print:border-none print:p-0 print:bg-transparent animate-fade-in-fast">{children}</div>}
        </div>
    );
});

const MicroTopicCard = memo(({ topic, importance, isBookmarked, onToggleBookmark, onStudy, onStory, onQuiz, isOnline }: {
    topic: string;
    importance: number;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
    onStudy: () => void;
    onStory: () => void;
    onQuiz: () => void;
    isOnline: boolean;
}) => {
    const getHeatColor = (p: number) => {
        if (p > 85) return 'text-rose-700 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        if (p > 65) return 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 group">
            <div className="p-5 flex-grow flex flex-col relative">
                <div className="flex justify-between items-start gap-3 mb-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getHeatColor(importance)}`}>
                        <FireIcon className="w-3.5 h-3.5" />
                        <span>{importance > 85 ? 'Critical' : importance > 65 ? 'High' : 'Frequent'} ({importance}%)</span>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                        className={`p-1.5 -mr-1.5 -mt-1.5 rounded-lg transition-all duration-200 ${
                            isBookmarked 
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark topic"}
                    >
                        <svg className={`w-5 h-5 transition-transform ${isBookmarked ? 'scale-110' : ''}`} fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </button>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3">
                    {topic}
                </h4>
            </div>
            
            <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-700 divide-x divide-slate-100 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <button 
                    onClick={onStudy} 
                    disabled={!isOnline} 
                    className="flex flex-col items-center justify-center py-3 px-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                    <BookOpenIcon className="w-4 h-4 mb-1 text-slate-400 group-hover/btn:text-indigo-600 dark:text-slate-500 dark:group-hover/btn:text-indigo-400 transition-colors" /> 
                    <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-indigo-700 dark:text-slate-400 dark:group-hover/btn:text-indigo-300 uppercase tracking-wide">Study</span>
                </button>
                <button 
                    onClick={onStory} 
                    disabled={!isOnline} 
                    className="flex flex-col items-center justify-center py-3 px-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                    <SparklesIcon className="w-4 h-4 mb-1 text-slate-400 group-hover/btn:text-purple-600 dark:text-slate-500 dark:group-hover/btn:text-purple-400 transition-colors" />
                    <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-purple-700 dark:text-slate-400 dark:group-hover/btn:text-purple-300 uppercase tracking-wide">Story</span>
                </button>
                <button 
                    onClick={onQuiz} 
                    disabled={!isOnline} 
                    className="flex flex-col items-center justify-center py-3 px-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                    <ClipboardListIcon className="w-4 h-4 mb-1 text-slate-400 group-hover/btn:text-emerald-600 dark:text-slate-500 dark:group-hover/btn:text-emerald-400 transition-colors" />
                    <span className="text-[10px] font-semibold text-slate-500 group-hover/btn:text-emerald-700 dark:text-slate-400 dark:group-hover/btn:text-emerald-300 uppercase tracking-wide">Quiz</span>
                </button>
            </div>
        </div>
    );
});

const MicroTopicSkeleton = () => (
    <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden h-40">
        <div className="p-5 flex-grow space-y-4">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-full h-7" />
        </div>
        <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-700 h-14">
            <Skeleton className="m-2 rounded" />
            <Skeleton className="m-2 rounded" />
            <Skeleton className="m-2 rounded" />
        </div>
    </div>
);

const LearnTopics: React.FC<LearnTopicsProps> = ({ 
    syllabus, onStudyTopic, onTeachWithStory, onStartTutorial, isOnline, user, language, 
    selectionPath, isLoading, error, onRefresh, canAccessPremium, requestAuth, 
    onSetBackHandler, onTakeQuiz 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingMicro, setIsLoadingMicro] = useState(false);
    const [microTopicsError, setMicroTopicsError] = useState<string | null>(null);
    const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
    const isMounted = useRef(true);

    const [selectedTopic, setSelectedTopic] = useState<{ subject: string, topic: string } | null>(() => {
        const saved = getComponentState<{selectedTopic: { subject: string, topic: string } | null, microTopics: string[]}>(STORAGE_KEY);
        return saved?.selectedTopic || null;
    });
    
    const [microTopics, setMicroTopics] = useState<string[]>(() => {
        const saved = getComponentState<{selectedTopic: { subject: string, topic: string } | null, microTopics: string[]}>(STORAGE_KEY);
        return saved?.microTopics || [];
    });

    useEffect(() => {
        saveComponentState(STORAGE_KEY, { selectedTopic, microTopics }, user?.uid || null);
    }, [selectedTopic, microTopics, user?.uid]);

    // Reset state when selection path changes to ensure fresh view for new exam
    useEffect(() => {
        setSelectedTopic(null);
        setMicroTopics([]);
        setMicroTopicsError(null);
        saveComponentState(STORAGE_KEY, null, user?.uid || null);
    }, [selectionPath, user?.uid]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        const loadBookmarks = async () => {
            const bookmarks = await getBookmarkedTopics(user?.uid || null);
            if (isMounted.current) setBookmarkedTopics(new Set(bookmarks));
        };
        loadBookmarks();
    }, [user]);
    
    const handleBackToList = () => {
        setSelectedTopic(null);
        setMicroTopics([]);
        setMicroTopicsError(null);
        saveComponentState(STORAGE_KEY, null, user?.uid || null);
    };

    useEffect(() => {
        if (onSetBackHandler) {
            if (selectedTopic) {
                onSetBackHandler(() => {
                    handleBackToList();
                    return true;
                });
            } else {
                onSetBackHandler(null);
            }
        }
        return () => { if (onSetBackHandler) onSetBackHandler(null); };
    }, [selectedTopic, onSetBackHandler]);
    
    const handleToggleBookmark = async (topicTitle: string) => {
        const newBookmarkedTopics = new Set(bookmarkedTopics);
        if (newBookmarkedTopics.has(topicTitle)) newBookmarkedTopics.delete(topicTitle);
        else newBookmarkedTopics.add(topicTitle);
        setBookmarkedTopics(newBookmarkedTopics);
        await saveBookmarkedTopics(Array.from(newBookmarkedTopics) as string[], user?.uid || null);
    };

    const calculateImportance = useMemo(() => (topic: string): number => {
        const hash = topic.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        return 30 + (Math.abs(hash) % 66);
    }, []);

    const filteredSyllabus = useMemo(() => {
        if (!Array.isArray(syllabus)) return [];
        if (!searchTerm) return syllabus;
        const lowTerm = searchTerm.toLowerCase();
        return syllabus
          .map(subject => ({
            ...subject,
            topics: subject.topics.filter(topic => topic.toLowerCase().includes(lowTerm))
          }))
          .filter(subject => subject.subject.toLowerCase().includes(lowTerm) || subject.topics.length > 0);
      }, [syllabus, searchTerm]);

    const handleTopicSelect = async (subject: string, topic: string) => {
        if (!canAccessPremium) {
            requestAuth();
            return;
        }
        if (!isOnline) return;
        setSelectedTopic({ subject, topic });
        setIsLoadingMicro(true);
        setMicroTopics([]);
        setMicroTopicsError(null);

        logActivity(user?.uid || null, {
            type: 'TOPIC_STUDIED' as HistoryType,
            description: `Explored micro-topics for "${topic}"`,
            view: AppView.LEARN_TOPICS,
            context: { topic, examPath: selectionPath }
        });

        try {
            const micros = await generateMicroTopics(topic, language, selectionPath);
            if (isMounted.current) setMicroTopics(micros);
        } catch(e) {
            if (isMounted.current) setMicroTopicsError(getSpecificErrorMessage(e));
        } finally {
            if (isMounted.current) setIsLoadingMicro(false);
        }
    };

    const prevLanguageRef = useRef(language);
    useEffect(() => {
        if (prevLanguageRef.current !== language) {
            prevLanguageRef.current = language;
            if (selectedTopic) {
                handleTopicSelect(selectedTopic.subject, selectedTopic.topic);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);



    const handlePrint = () => { window.print(); };

    if (selectedTopic) {
        return (
            <div className="max-w-6xl mx-auto print-section-wrapper animate-fade-in">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex-1 min-w-0 relative z-10">
                            <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 no-print">
                                <button onClick={handleBackToList} className="hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    SYLLABUS
                                </button>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-slate-500 dark:text-slate-400 truncate">{selectedTopic.subject}</span>
                            </nav>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-6 tracking-tight" title={selectedTopic.topic}>
                                {selectedTopic.topic}
                            </h2>
                            <div className="flex flex-wrap gap-2 sm:gap-3 no-print">
                                <Button onClick={() => onStudyTopic(selectedTopic.topic)} variant="primary" size="sm" className="flex items-center justify-center p-2 sm:p-2.5 shadow-md shadow-indigo-100 dark:shadow-indigo-900/40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all" title="Study Full Topic" disabled={!isOnline}>
                                    <BookOpenIcon className="w-5 h-5" />
                                </Button>
                                <Button onClick={() => onStartTutorial(selectedTopic.topic)} variant="secondary" size="sm" className="flex items-center justify-center p-2 sm:p-2.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 rounded-xl transition-all border-0 shadow-sm" title="Start Tutorial" disabled={!isOnline}>
                                    <LightBulbIcon className="w-5 h-5" />
                                </Button>
                                <Button onClick={() => onTeachWithStory(selectedTopic.topic)} variant="ghost" size="sm" className="flex items-center justify-center p-2 sm:p-2.5 !bg-purple-100 dark:!bg-purple-900/30 !text-purple-700 dark:!text-purple-300 hover:!bg-purple-200 dark:hover:!bg-purple-900/50 transition-all rounded-xl shadow-sm" title="Learn with a Story" disabled={!isOnline}>
                                    <SparklesIcon className="w-5 h-5" />
                                </Button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center hidden sm:block"></div>
                                <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center justify-center p-2 sm:p-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700" title="Print Material">
                                    <PrinterIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Granular Micro-Topics</h3>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full no-print">
                                {microTopics.length > 0 ? `${microTopics.length} key concepts identified` : ''}
                            </p>
                        </div>
                        
                        {isLoadingMicro && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
                                {[...Array(6)].map((_, i) => <MicroTopicSkeleton key={i} />)}
                            </div>
                        )}
                        <ErrorMessage message={microTopicsError} onRetry={() => handleTopicSelect(selectedTopic.subject, selectedTopic.topic)} />

                        {!isLoadingMicro && !microTopicsError && microTopics.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {microTopics.map(micro => (
                                    <MicroTopicCard 
                                        key={micro}
                                        topic={micro}
                                        importance={calculateImportance(micro)}
                                        isBookmarked={bookmarkedTopics.has(micro)}
                                        onToggleBookmark={() => handleToggleBookmark(micro)}
                                        onStudy={() => onStudyTopic(micro, selectedTopic.topic)}
                                        onStory={() => onTeachWithStory(micro)}
                                        onQuiz={() => onTakeQuiz ? onTakeQuiz(micro) : window.alert("Quiz mode pre-selection enabled. Head to the Quiz tool!")}
                                        isOnline={isOnline}
                                    />
                                ))}
                            </div>
                        )}
                         {!isLoadingMicro && !microTopicsError && microTopics.length === 0 && (
                             <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400 text-lg">We couldn't split this into smaller topics right now.</p>
                                <Button onClick={() => onStudyTopic(selectedTopic.topic)} variant="secondary" className="mt-4">Study Topic</Button>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto print-section-wrapper animate-fade-in">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="text-left flex-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Browse Syllabus</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">Select a core subject to explore granular sub-topics and start studying.</p>
                </div>
                <div className="flex gap-3 self-stretch sm:self-auto no-print">
                     <Button onClick={onRefresh} variant="secondary" size="sm" className="flex-1 sm:flex-none flex items-center justify-center gap-2" disabled={isLoading || !isOnline} title="Regenerate Syllabus">
                        <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1 sm:flex-none flex items-center justify-center gap-2">
                        <PrinterIcon className="w-4 h-4" /> 
                        <span>Print</span>
                    </Button>
                </div>
            </div>
            {isLoading ? (
                <div className="space-y-4 no-print">
                    <Skeleton className="w-full h-14" />
                    <Skeleton className="w-full h-14" />
                    <Skeleton className="w-full h-14" />
                </div>
            ) : error ? (
                <div className="py-8">
                    <ErrorMessage message={error} onRetry={onRefresh} />
                </div>
            ) : (
                <>
                    <div className="mt-6 max-w-2xl mx-auto relative no-print mb-10 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input 
                            type="text"
                            placeholder="Search subjects or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm text-base"
                        />
                         {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
            
                    <div className="space-y-4">
                        {filteredSyllabus.length > 0 ? (
                            filteredSyllabus.map((subject, index) => (
                                <AccordionItem key={subject.subject} title={subject.subject} defaultOpen={index === 0}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {subject.topics.map(topic => (
                                           <button 
                                                key={topic}
                                                onClick={() => handleTopicSelect(subject.subject, topic)}
                                                disabled={!isOnline}
                                                className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all text-left group disabled:opacity-50 shadow-sm hover:shadow-md"
                                           >
                                               <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-indigo-500 transition-colors flex-shrink-0"></div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{topic}</span>
                                               </div>
                                               <span className="text-slate-300 dark:text-slate-500 group-hover:text-indigo-500 transition-colors ml-2 flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                               </span>
                                           </button>
                                        ))}
                                    </div>
                                </AccordionItem>
                            ))
                        ) : searchTerm ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 font-medium">No matches found</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">We couldn't find anything matching "{searchTerm}".</p>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 font-medium mb-4">Syllabus ready for generation.</p>
                                <Button onClick={onRefresh} disabled={!isOnline}>Generate Topics</Button>
                            </div>
                        )}
                    </div>
                </>
            )}
          </Card>
          <style>{`
                @media print {
                    .no-print, header, .sidebar, .mobile-taskbar, button { display: none !important; }
                    body, #root, main, .print-section-wrapper { 
                        display: block !important; 
                        position: static !important; 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important; 
                        height: auto !important; 
                        overflow: visible !important;
                    }
                }
                @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LearnTopics;

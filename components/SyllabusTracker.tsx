
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateSyllabus } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { getSyllabusProgress, saveSyllabusProgress, getBookmarkedTopics, saveBookmarkedTopics, getTrackingData, markTopicAsStudied, unmarkTopicAsStudied } from '../utils/tracking';
import type { SyllabusTopic, User, SyllabusProgress, LearningProgress } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';


const SyllabusNode: React.FC<{
  topic: SyllabusTopic;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  onTeachWithStory: (topicTitle: string) => void;
  bookmarkedTopics: Set<string>;
  onToggleBookmark: (topicTitle: string) => void;
}> = ({ topic, checkedIds, onToggle, onTeachWithStory, bookmarkedTopics, onToggleBookmark }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isChecked = checkedIds.has(topic.id);
  const isBookmarked = bookmarkedTopics.has(topic.title);
  const hasChildren = Array.isArray(topic.children) && topic.children.length > 0;

  const handleToggleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggle(topic.id);
  };

  return (
    <div className={`ml-4 my-1 pl-4 border-l-2 ${isExpanded ? 'border-slate-300 dark:border-slate-600' : 'border-transparent'} print:border-l-2 print:border-gray-300`}>
      <div className="flex items-center group">
        {hasChildren && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 mr-1 no-print">
             <span className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 inline-block ${!isExpanded && '-rotate-90'}`}>▼</span>
          </button>
        )}
        <div className="flex items-center flex-grow py-1" onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
            <input
              type="checkbox"
              id={topic.id}
              checked={isChecked}
              onChange={handleToggleCheck}
              className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
              aria-label={`Mark topic ${topic.title} as ${isChecked ? 'incomplete' : 'complete'}`}
            />
            <div className="ml-3 flex-grow">
                <label htmlFor={topic.id} className={`font-medium cursor-pointer ${isChecked ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'} print:text-black`}>
                  {topic.title}
                </label>
                {topic.details && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 print:text-gray-600">{topic.details}</p>}
            </div>
             <button
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(topic.title); }}
                className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-600 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs no-print"
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
             >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); onTeachWithStory(topic.title); }} 
                className="ml-auto p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs no-print"
                title={`Teach "${topic.title}" with a story`}
                aria-label={`Teach "${topic.title}" with a story`}
            >
                Story
            </button>
        </div>
      </div>
      {hasChildren && (
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen' : 'max-h-0'} print:max-h-none print:overflow-visible`}>
          {topic.children?.map(child => (
            <SyllabusNode key={child.id} topic={child} checkedIds={checkedIds} onToggle={onToggle} onTeachWithStory={onTeachWithStory} bookmarkedTopics={bookmarkedTopics} onToggleBookmark={onToggleBookmark}/>
          ))}
        </div>
      )}
    </div>
  );
};

interface SyllabusTrackerProps {
    selectedExam: string;
    language: string;
    isOnline: boolean;
    onTeachWithStory: (topicTitle: string) => void;
    user: User | null;
}

const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ selectedExam, language, isOnline, onTeachWithStory, user }) => {
  const [syllabus, setSyllabus] = useState<SyllabusTopic[] | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set<string>());
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syllabusKey = selectedExam ? `${selectedExam}-${language}` : '';

  const fetchSyllabusAndProgress = useCallback(async (isRefresh = false) => {
    if (!selectedExam) {
      setSyllabus(null);
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    setError(null);
    if (isRefresh) {
      setSyllabus(null);
    }
  
    const uid = user?.uid || null;

    try {
        const [progress, bookmarks, trackingData] = await Promise.all([
            getSyllabusProgress(uid),
            getBookmarkedTopics(uid),
            getTrackingData(uid),
        ] as const);
        
        setBookmarkedTopics(new Set(bookmarks));
        
        const savedProgress = progress[syllabusKey];
        const globallyLearnedTitles = new Set(trackingData.studiedTopics.map(t => t.toLowerCase().trim()));

        const findLearnedIds = (nodes: SyllabusTopic[], learnedTitles: Set<string>): string[] => {
            let ids: string[] = [];
            for (const node of nodes) {
                if (learnedTitles.has(node.title.toLowerCase().trim())) {
                    ids.push(node.id);
                }
                if (node.children) {
                    ids = ids.concat(findLearnedIds(node.children, learnedTitles));
                }
            }
            return ids;
        };

        let currentSyllabus = savedProgress?.syllabus?.length > 0 && !isRefresh ? savedProgress.syllabus : null;

        if (!currentSyllabus) {
            const syllabusData = await generateSyllabus(selectedExam, language);
            currentSyllabus = syllabusData;
            if (syllabusData.length > 0) {
                // Sanitize checkedIds from storage before saving to prevent passing malformed data.
                const checkedIdsToSave: string[] = Array.isArray(savedProgress?.checkedIds) ? savedProgress.checkedIds.filter((id): id is string => typeof id === 'string') : [];
                await saveSyllabusProgress(syllabusKey, checkedIdsToSave, syllabusData, uid);
            }
        }
        
        if (currentSyllabus && currentSyllabus.length > 0) {
             setSyllabus(currentSyllabus);
             const globallyLearnedIds = findLearnedIds(currentSyllabus, globallyLearnedTitles);
             // Safely access and sanitize saved checkedIds before combining with globally learned IDs.
             const safeSavedIds = Array.isArray(savedProgress?.checkedIds) ? savedProgress.checkedIds.filter((id): id is string => typeof id === 'string') : [];
             const allCheckedIds = [...safeSavedIds, ...globallyLearnedIds];
             setCheckedIds(new Set(allCheckedIds));
        } else if (!savedProgress?.syllabus?.length) {
            setError("We couldn't load the syllabus just yet. A quick refresh usually helps!");
        }
    } catch (err) {
        setError(getSpecificErrorMessage(err));
        setSyllabus(null);
    } finally {
        setIsLoading(false);
    }
  
  }, [selectedExam, language, syllabusKey, user]);
  
  useEffect(() => {
    fetchSyllabusAndProgress();
  }, [fetchSyllabusAndProgress]);


  const handleToggle = useCallback(async (id: string) => {
    const newCheckedIds = new Set(checkedIds);
    
    const findTopic = (topics: SyllabusTopic[], targetId: string): SyllabusTopic | null => {
        for (const topic of topics) {
            if (topic.id === targetId) return topic;
            if (topic.children) {
                const found = findTopic(topic.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };
    
    const collectChildTopics = (startNode: SyllabusTopic): SyllabusTopic[] => {
        let nodes = [startNode];
        if (startNode.children) {
            for (const child of startNode.children) {
                nodes = nodes.concat(collectChildTopics(child));
            }
        }
        return nodes;
    };

    const targetTopic = findTopic(syllabus || [], id);
    if (!targetTopic) return;

    const topicsToUpdate = collectChildTopics(targetTopic);
    const isChecking = !newCheckedIds.has(id);

    // Update UI state
    topicsToUpdate.forEach(t => {
        if (isChecking) newCheckedIds.add(t.id);
        else newCheckedIds.delete(t.id);
    });
    setCheckedIds(newCheckedIds);
    
    // Update backend storage
    const uid = user?.uid || null;
    const updateTasks = topicsToUpdate.map(t => {
        return isChecking ? markTopicAsStudied(t.title, uid) : unmarkTopicAsStudied(t.title, uid);
    });
    
    // FIX: Explicitly cast to string[] to resolve TypeScript type inference errors.
    updateTasks.push(saveSyllabusProgress(syllabusKey, Array.from(newCheckedIds) as string[], syllabus || [], uid));
    
    await Promise.all(updateTasks);
    
  }, [checkedIds, syllabus, syllabusKey, user]);
  
  const handleToggleBookmark = useCallback(async (topicTitle: string) => {
    const newBookmarkedTopics = new Set(bookmarkedTopics);
    if (newBookmarkedTopics.has(topicTitle)) {
        newBookmarkedTopics.delete(topicTitle);
    } else {
        newBookmarkedTopics.add(topicTitle);
    }
    setBookmarkedTopics(newBookmarkedTopics);
    // FIX: Explicitly cast to string[] to resolve TypeScript type inference errors.
    await saveBookmarkedTopics(Array.from(newBookmarkedTopics) as string[], user?.uid || null);
  }, [bookmarkedTopics, user]);
  
  const handlePrint = () => {
      window.print();
  };

  const countTopics = useCallback((topics: SyllabusTopic[]): number => {
    return topics.reduce((acc, topic) => acc + 1 + (topic.children ? countTopics(topic.children) : 0), 0);
  }, []);

  const totalTopics = useMemo(() => syllabus ? countTopics(syllabus) : 0, [syllabus, countTopics]);
  const progressPercentage = totalTopics > 0 ? (checkedIds.size / totalTopics) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto print-section-wrapper">
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-center sm:text-left">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Syllabus Tracker</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 truncate">Track your preparation for <span className="font-semibold">{selectedExam}</span>.</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0 justify-center">
                 <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2 no-print">
                    <PrinterIcon className="w-4 h-4" /> Print
                </Button>
                 <Button 
                    onClick={() => fetchSyllabusAndProgress(true)} 
                    disabled={isLoading || !isOnline} 
                    variant="secondary" 
                    className="!py-2 !px-3 no-print"
                 >
                    <span className="ml-2">Refresh</span>
                </Button>
            </div>
          </div>
          
          <div className="mt-6">
            {isLoading ? (
                <div className="text-center py-10 no-print"><LoadingSpinner /></div>
            ) : error ? (
                <div className="text-center">
                    <ErrorMessage message={error} onRetry={() => fetchSyllabusAndProgress(true)} />
                </div>
            ) : syllabus && syllabus.length > 0 ? (
                <div>
                    <div className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-indigo-700 dark:text-indigo-400">Completion</span>
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                {`${checkedIds.size} / ${totalTopics} topics (${Math.round(progressPercentage)}%)`}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                           <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:p-0 print:bg-white">
                        {syllabus.map(topic => (
                            <SyllabusNode 
                                key={topic.id} 
                                topic={topic} 
                                checkedIds={checkedIds} 
                                onToggle={handleToggle} 
                                onTeachWithStory={onTeachWithStory}
                                bookmarkedTopics={bookmarkedTopics}
                                onToggleBookmark={handleToggleBookmark}
                             />
                        ))}
                    </div>
                </div>
            ) : (
                 <p className="text-center text-slate-500 dark:text-slate-400 py-10">
                    We couldn't load the syllabus just yet. A quick refresh usually helps!
                </p>
            )}
          </div>
        </Card>
        <style>{`
            @media print {
                .no-print, header, .sidebar, .mobile-taskbar, button { display: none !important; }
                body, #root, main, .print-section-wrapper, .print-section-wrapper > div { 
                    display: block !important; 
                    position: static !important; 
                    background: white !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    width: 100% !important; 
                    height: auto !important; 
                    overflow: visible !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            }
        `}</style>
    </div>
  );
};

export default SyllabusTracker;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateSyllabus, getSpecificErrorMessage } from '../services/geminiService';
import { getSyllabusProgress, saveSyllabusProgress } from '../utils/tracking';
import type { SyllabusTopic, User } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';


const SyllabusNode: React.FC<{
  topic: SyllabusTopic;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  onTeachWithStory: (topicTitle: string) => void;
}> = ({ topic, checkedIds, onToggle, onTeachWithStory }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isChecked = checkedIds.has(topic.id);
  const hasChildren = topic.children && topic.children.length > 0;

  const handleToggleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggle(topic.id);
  };

  return (
    <div className={`ml-4 my-1 pl-4 border-l-2 ${isExpanded ? 'border-slate-300' : 'border-transparent'}`}>
      <div className="flex items-center group">
        {hasChildren && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-slate-200 mr-1">
             <span className={`text-slate-500 transition-transform duration-200 inline-block ${!isExpanded && '-rotate-90'}`}>▼</span>
          </button>
        )}
        <div className="flex items-center flex-grow py-1" onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
            <input
              type="checkbox"
              id={topic.id}
              checked={isChecked}
              onChange={handleToggleCheck}
              className="h-4 w-4 rounded border-slate-400 text-teal-600 focus:ring-teal-500"
              aria-label={`Mark topic ${topic.title} as ${isChecked ? 'incomplete' : 'complete'}`}
            />
            <div className="ml-3 flex-grow">
                <label htmlFor={topic.id} className={`font-medium cursor-pointer ${isChecked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                  {topic.title}
                </label>
                {topic.details && <p className="text-xs text-slate-500 mt-0.5">{topic.details}</p>}
            </div>
             <button 
                onClick={(e) => { e.stopPropagation(); onTeachWithStory(topic.title); }} 
                className="ml-auto p-1 rounded-full text-slate-400 hover:bg-teal-100 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                title={`Teach "${topic.title}" with a story`}
                aria-label={`Teach "${topic.title}" with a story`}
            >
                Story
            </button>
        </div>
      </div>
      {hasChildren && (
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen' : 'max-h-0'}`}>
          {topic.children.map(child => (
            <SyllabusNode key={child.id} topic={child} checkedIds={checkedIds} onToggle={onToggle} onTeachWithStory={onTeachWithStory}/>
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
        const progress = await getSyllabusProgress(uid);
        const savedProgress = progress[syllabusKey];
        setCheckedIds(new Set(savedProgress?.checkedIds || []));

        // Attempt to load syllabus from cache/progress first for speed
        if (savedProgress?.syllabus?.length > 0 && !isRefresh) {
            setSyllabus(savedProgress.syllabus);
        }

        const syllabusData = await generateSyllabus(selectedExam, language);
        setSyllabus(syllabusData);
        if (syllabusData.length > 0) {
            // Save newly generated syllabus with current progress
            await saveSyllabusProgress(syllabusKey, Array.from(savedProgress?.checkedIds || []), syllabusData, uid);
        } else if (!savedProgress?.syllabus?.length) {
            setError("A syllabus could not be found or generated for this selection.");
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
    const newCheckedIds = new Set<string>(checkedIds);
    const topicsToModify = new Set<string>();
    
    const findTopicAndChildren = (topics: SyllabusTopic[], targetId: string): SyllabusTopic | null => {
        for (const topic of topics) {
            if (topic.id === targetId) return topic;
            if (topic.children) {
                const found = findTopicAndChildren(topic.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };
    
    const collectAllIds = (topic: SyllabusTopic) => {
        topicsToModify.add(topic.id);
        if (topic.children) topic.children.forEach(collectAllIds);
    };

    const targetTopic = findTopicAndChildren(syllabus || [], id);
    if (targetTopic) collectAllIds(targetTopic);
    
    const isChecking = !newCheckedIds.has(id);
    topicsToModify.forEach(topicId => {
        if (isChecking) newCheckedIds.add(topicId);
        else newCheckedIds.delete(topicId);
    });

    setCheckedIds(newCheckedIds);
    await saveSyllabusProgress(syllabusKey, Array.from(newCheckedIds), syllabus || [], user?.uid || null);
  }, [checkedIds, syllabus, syllabusKey, user]);
  

  const countTopics = useCallback((topics: SyllabusTopic[]): number => {
    return topics.reduce((acc, topic) => acc + 1 + (topic.children ? countTopics(topic.children) : 0), 0);
  }, []);

  const totalTopics = useMemo(() => syllabus ? countTopics(syllabus) : 0, [syllabus, countTopics]);
  const progressPercentage = totalTopics > 0 ? (checkedIds.size / totalTopics) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-center sm:text-left">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Syllabus Tracker</h2>
                <p className="text-slate-500 mt-2 truncate">Track your preparation for <span className="font-semibold">{selectedExam}</span>.</p>
            </div>
             <Button 
                onClick={() => fetchSyllabusAndProgress(true)} 
                disabled={isLoading || !isOnline} 
                variant="secondary" 
                className="mt-4 sm:mt-0 !py-2 !px-3"
             >
                <span className="ml-2">Refresh</span>
            </Button>
          </div>
          
          <div className="mt-6">
            {isLoading ? (
                <div className="text-center py-10"><LoadingSpinner /></div>
            ) : error ? (
                <p className="text-red-500 bg-red-100 p-3 rounded-md my-4 text-center">{error}</p>
            ) : syllabus && syllabus.length > 0 ? (
                <div>
                    <div className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-teal-700">Completion</span>
                            <span className="text-sm font-medium text-teal-700">
                                {`${checkedIds.size} / ${totalTopics} topics (${Math.round(progressPercentage)}%)`}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                           <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-slate-50 max-h-[60vh] overflow-y-auto">
                        {syllabus.map(topic => (
                            <SyllabusNode key={topic.id} topic={topic} checkedIds={checkedIds} onToggle={handleToggle} onTeachWithStory={onTeachWithStory} />
                        ))}
                    </div>
                </div>
            ) : (
                 <p className="text-center text-slate-500 py-10">
                    No syllabus available. Try refreshing or changing your exam selection.
                </p>
            )}
          </div>
        </Card>
    </div>
  );
};

export default SyllabusTracker;
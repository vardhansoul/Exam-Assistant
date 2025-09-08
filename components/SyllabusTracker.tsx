import React, { useState, useEffect, useCallback } from 'react';
import { generateSyllabus, getSpecificErrorMessage } from '../services/geminiService';
import { getSyllabusProgress, saveSyllabusProgress } from '../utils/tracking';
import type { SyllabusTopic } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

// Recursive component to render each topic and its children
const SyllabusNode: React.FC<{
  topic: SyllabusTopic;
  checkedIds: Set<string>;
  onToggle: (id: string, isChecked: boolean) => void;
}> = ({ topic, checkedIds, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isChecked = checkedIds.has(topic.id);
  const hasChildren = topic.children && topic.children.length > 0;

  const handleToggle = () => {
    onToggle(topic.id, !isChecked);
  };

  return (
    <div className="ml-4 my-2 border-l-2 border-slate-200 pl-4">
      <div className="flex items-center">
        {hasChildren && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 text-indigo-500">
            {isExpanded ? '[-]' : '[+]'}
          </button>
        )}
        <input
          type="checkbox"
          id={topic.id}
          checked={isChecked}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor={topic.id} className={`ml-2 text-sm font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
          {topic.title}
        </label>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {topic.children.map(child => (
            <SyllabusNode key={child.id} topic={child} checkedIds={checkedIds} onToggle={onToggle} />
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
}

const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ selectedExam, language, isOnline }) => {
  const [syllabus, setSyllabus] = useState<SyllabusTopic[] | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syllabusKey = selectedExam ? `${selectedExam}-${language}` : '';

  useEffect(() => {
    if (selectedExam) {
      const progress = getSyllabusProgress();
      const savedData = progress[syllabusKey];
      if (savedData) {
        setSyllabus(savedData.syllabus);
        setCheckedIds(new Set(savedData.checkedIds));
      } else {
        setSyllabus(null);
        setCheckedIds(new Set());
      }
    } else {
        setSyllabus(null);
        setCheckedIds(new Set());
    }
  }, [selectedExam, language, syllabusKey]);

  const handleGenerateSyllabus = async () => {
    if (!isOnline) {
      setError("You are offline. Please connect to the internet to generate a new syllabus.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSyllabus(null);
    setCheckedIds(new Set());
    try {
      const newSyllabus = await generateSyllabus(selectedExam, language);
      setSyllabus(newSyllabus);
      saveSyllabusProgress(syllabusKey, [], newSyllabus);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleToggle = useCallback((id: string, isChecked: boolean) => {
    const newCheckedIds = new Set(checkedIds);
    const topicsToCheck = new Set<string>();
    
    // Function to recursively find all children of a topic
    const findAllChildren = (topic: SyllabusTopic) => {
        topicsToCheck.add(topic.id);
        if (topic.children) {
            topic.children.forEach(findAllChildren);
        }
    };
    
    // Find the topic in the syllabus tree
    const findTopic = (topics: SyllabusTopic[], topicId: string): SyllabusTopic | null => {
        for (const topic of topics) {
            if (topic.id === topicId) return topic;
            if (topic.children) {
                const found = findTopic(topic.children, topicId);
                if (found) return found;
            }
        }
        return null;
    };

    const targetTopic = findTopic(syllabus || [], id);

    if (targetTopic) {
        findAllChildren(targetTopic);
    }

    // Check or uncheck the topic and all its children
    topicsToCheck.forEach(topicId => {
        if (isChecked) {
            newCheckedIds.add(topicId);
        } else {
            newCheckedIds.delete(topicId);
        }
    });

    setCheckedIds(newCheckedIds);
    saveSyllabusProgress(syllabusKey, Array.from(newCheckedIds), syllabus || []);
  }, [checkedIds, syllabus, syllabusKey]);
  

  const countTopics = (topics: SyllabusTopic[]): number => {
    let count = topics.length;
    topics.forEach(topic => {
      if (topic.children) {
        count += countTopics(topic.children);
      }
    });
    return count;
  };

  const totalTopics = syllabus ? countTopics(syllabus) : 0;
  const progressPercentage = totalTopics > 0 ? (checkedIds.size / totalTopics) * 100 : 0;

  return (
    <Card>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Syllabus Tracker</h2>
      
      {!selectedExam ? (
        <div className="text-center py-10">
            <p className="text-gray-500">Please select an exam from the home page to track its syllabus.</p>
        </div>
      ) : (
        <>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Syllabus for Exam Category:</p>
                <p className="font-bold text-lg text-indigo-800">{selectedExam}</p>
            </div>
            <div className="mt-6 text-center">
              <Button onClick={handleGenerateSyllabus} disabled={isLoading || !isOnline} className="w-full sm:w-auto">
                {isLoading ? 'Generating...' : (syllabus ? 'Regenerate Syllabus' : 'Generate Syllabus')}
              </Button>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{error}</p>}
            
            {isLoading && <div className="mt-4"><LoadingSpinner /></div>}

            {!isLoading && syllabus && (
                <div className="mt-6">
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-indigo-700">Syllabus Completion</span>
                    <span className="text-sm font-medium text-indigo-700">{checkedIds.size} / {totalTopics} ({Math.round(progressPercentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                    </div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 max-h-[60vh] overflow-y-auto">
                    {syllabus.map(topic => (
                    <SyllabusNode key={topic.id} topic={topic} checkedIds={checkedIds} onToggle={handleToggle} />
                    ))}
                </div>
                </div>
            )}
        </>
      )}
    </Card>
  );
};

export default SyllabusTracker;
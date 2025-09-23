

import React, { useState, useEffect } from 'react';
import { generateStudyNotes, generateStoryForTopic, getSpecificErrorMessage } from '../services/geminiService';
import { getStudyNotesFromCache, markTopicAsStudied } from '../utils/tracking';
import type { StudyMaterial } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface StudyHelperProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  preselectedTopic?: string | null;
  onClearPreselectedTopic?: () => void;
}

const StudyHelper: React.FC<StudyHelperProps> = ({ topics, language, isOnline, preselectedTopic, onClearPreselectedTopic }) => {
  const [topic, setTopic] = useState<string>(() => preselectedTopic || (topics.length > 0 ? topics[0] : ''));
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stories, setStories] = useState<string[]>([]);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (preselectedTopic) {
        // Automatically fetch notes if a topic is preselected
        handleGenerateNotes(preselectedTopic);
        if(onClearPreselectedTopic) {
            onClearPreselectedTopic();
        }
    }
  }, [preselectedTopic]);

  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    } else if (topics.length === 0) {
      setTopic('');
    }
  }, [topics, topic]);

  const handleGenerateNotes = async (selectedTopic: string = topic) => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setStudyMaterial(null);
    setStories([]);
    setError(null);

    if (!isOnline) {
        const cachedMaterial = getStudyNotesFromCache(selectedTopic, language);
        if (cachedMaterial) {
            setStudyMaterial(cachedMaterial);
            setError("You are offline. Showing last saved version of these notes.");
        } else {
            setError("You are offline and no saved version is available.");
        }
        setIsLoading(false);
        return;
    }

    try {
        markTopicAsStudied(selectedTopic);
        const material = await generateStudyNotes(selectedTopic, language);
        setStudyMaterial(material);
    } catch (err) {
        setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleGenerateStory = async () => {
    if (!topic || !isOnline) return;
    setIsStoryLoading(true);
    try {
        const generatedStory = await generateStoryForTopic(topic, language);
        setStories(prevStories => [...prevStories, generatedStory]);
    } catch (err) {
        const errorMessage = getSpecificErrorMessage(err);
        setStories(prevStories => [...prevStories, `Error: ${errorMessage}`]);
    }
    setIsStoryLoading(false);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('Error:')) return <p key={index} className="my-1 font-semibold text-red-600">{line}</p>;
      if (line.startsWith('###')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      if (line.startsWith('##')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
      if (line.startsWith('* ')) return <li key={index} className="ml-5 list-disc">{line.replace('* ', '').trim()}</li>;
      if (line.includes('**')) {
        const parts = line.split('**');
        return <p key={index}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
      }
      return <p key={index} className="my-1">{line || '\u00A0'}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-indigo-100 rounded-full mb-4">
                <BookOpenIcon className="w-8 h-8 text-indigo-600"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">AI Study Helper</h2>
            <p className="text-slate-500 mt-2">Generate comprehensive notes and stories on any topic.</p>
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full flex-grow">
                  <Select label="Select a topic" options={topics} value={topic} onChange={e => setTopic(e.target.value)} disabled={topics.length === 0} />
                </div>
                <Button onClick={() => handleGenerateNotes()} disabled={isLoading || topics.length === 0} className="w-full sm:w-auto flex-shrink-0 !py-3">
                  {isLoading ? 'Generating...' : 'Get Notes'}
                </Button>
            </div>
             {error && <p className="text-orange-600 bg-orange-100 p-3 rounded-md mt-4 text-sm font-medium text-center">{error}</p>}
        </div>
        
        {isLoading && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Preparing your study material...</p>
          </div>
        )}

        {studyMaterial && (
          <div className="mt-6 space-y-6">
            <div className="p-6 border border-slate-200 rounded-xl bg-white">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Study Notes: {topic}</h3>
              <div className="prose prose-slate max-w-none max-h-[50vh] overflow-y-auto pr-3">
                {formatText(studyMaterial.notes)}
              </div>
            </div>

            <div className="p-6 border border-slate-200 rounded-xl bg-white">
                <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Stories to Remember</h3>
                 {!isStoryLoading && (
                    <div className="text-center">
                        <Button onClick={handleGenerateStory} variant="secondary" disabled={!isOnline || isStoryLoading}>
                            {stories.length === 0 ? 'Teach with a Story' : 'Teach with Another Story'}
                        </Button>
                    </div>
                )}
                {isStoryLoading && (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-2 text-slate-500">Crafting a memorable story...</p>
                    </div>
                )}
                {stories.length > 0 && (
                    <div className="mt-4 space-y-4">
                         {stories.map((story, index) => (
                            <div key={index} className="prose prose-slate max-w-none text-left p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                                {formatText(story)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudyHelper;
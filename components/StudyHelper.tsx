import React, { useState, useEffect } from 'react';
import { generateStudyNotes, generateStoryForTopic, getSpecificErrorMessage } from '../services/geminiService';
import { getStudyNotesFromCache } from '../utils/tracking';
import type { StudyMaterial } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';

interface StudyHelperProps {
  topics: string[];
  language: string;
  isOnline: boolean;
}

const StudyHelper: React.FC<StudyHelperProps> = ({ topics, language, isOnline }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stories, setStories] = useState<string[]>([]);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If the available topics change and the currently selected topic is no longer in the list,
    // update the selection to the first available topic.
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    } else if (topics.length === 0) {
      setTopic('');
    }
  }, [topics, topic]);


  const handleGenerateNotes = async () => {
    setIsLoading(true);
    setStudyMaterial(null);
    setStories([]);
    setError(null);

    if (!isOnline) {
        const cachedMaterial = getStudyNotesFromCache(topic, language);
        if (cachedMaterial) {
            setStudyMaterial(cachedMaterial);
            setError("You are offline. Showing the last saved version of these notes.");
        } else {
            setError("You are offline and no saved version is available for this topic. Please connect to the internet.");
        }
        setIsLoading(false);
        return;
    }

    try {
        const material = await generateStudyNotes(topic, language);
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

  const formatNotes = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('Error:')) {
        return <p key={index} className="my-1 font-semibold text-red-600">{line}</p>;
      }
      if (line.startsWith('###')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('##')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
      }
      if (line.startsWith('#')) {
        return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{line.replace('#', '').trim()}</h1>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc">{line.replace('* ', '').trim()}</li>;
      }
       if (line.includes('**')) {
        const parts = line.split('**');
        return <p key={index}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
      }
      return <p key={index} className="my-1">{line}</p>;
    });
  };

  return (
    <Card>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">AI Study Helper</h2>
      {error && <p className="text-orange-500 bg-orange-100 p-3 rounded-md mb-4">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Select label="Select a topic to get notes on" options={topics} value={topic} onChange={e => setTopic(e.target.value)} disabled={topics.length === 0} />
        </div>
        <div className="self-end">
          <Button onClick={handleGenerateNotes} disabled={isLoading || topics.length === 0} className="w-full sm:w-auto">
            {isLoading ? 'Generating...' : 'Get Notes'}
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center p-8">
          <LoadingSpinner />
           <p className="mt-4 text-gray-600">Preparing your study material...</p>
        </div>
      )}

      {studyMaterial && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-slate-50 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
          {studyMaterial.imageUrl && (
            <img 
              src={studyMaterial.imageUrl} 
              alt={`Visual representation of ${topic}`}
              className="w-full h-auto rounded-lg mb-4 object-cover max-h-72"
            />
          )}
          <div className="prose max-w-none">
            {formatNotes(studyMaterial.notes)}
          </div>
          
          <div className="mt-8 border-t pt-6">
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
                    <p className="mt-2 text-gray-500">Crafting a memorable story...</p>
                </div>
            )}
            {stories.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-bold mt-2 mb-3 text-center">Stories to Remember</h3>
                     {stories.map((story, index) => (
                        <div key={index} className={`prose max-w-none text-left p-4 rounded-md bg-white mt-4 ${index > 0 ? 'border-t' : ''}`}>
                            {formatNotes(story)}
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>
      )}
    </Card>
  );
};

export default StudyHelper;
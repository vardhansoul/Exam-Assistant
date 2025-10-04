

import React, { useState, useEffect, useCallback } from 'react';
import { generateStoryForTopic, getSpecificErrorMessage } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface StoryTutorProps {
  topic: string | null;
  language: string;
  isOnline: boolean;
  onBack: () => void;
}

const StoryTutor: React.FC<StoryTutorProps> = ({ topic, language, isOnline, onBack }) => {
  const [story, setStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStory = useCallback(async () => {
    if (!topic) {
      setError("No topic selected.");
      setIsLoading(false);
      return;
    }
    if (!isOnline) {
      setError("You are offline. Please connect to generate a story.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStoryForTopic(topic, language);
      setStory(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [topic, language, isOnline]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const formatStory = (text: string) => {
    return text.split('\n').map((line, index) => {
        if (line.trim() === '') return <br key={index} />;
        if (line.includes('**')) {
            const parts = line.split('**');
            return <p key={index} className="my-2">{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>;
        }
        return <p key={index} className="my-2">{line}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <Button onClick={onBack} variant="secondary" className="!p-2.5 !rounded-full flex-shrink-0">
            Back
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-800">AI Story Tutor</h2>
            <p className="text-sm text-slate-500 truncate">Understanding "{topic}"</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">The AI is crafting a story for you...</p>
          </div>
        ) : error ? (
          <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>
        ) : story ? (
          <div>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl prose prose-slate max-w-none">
              {formatStory(story)}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={fetchStory} disabled={isLoading || !isOnline}>
                Teach me with another story
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Could not generate a story. Please try again.</p>
        )}
      </Card>
    </div>
  );
};

export default StoryTutor;


import React, { useState, useEffect } from 'react';
import { DIFFICULTY_LEVELS } from '../constants';
import { generateQuiz, getSpecificErrorMessage } from '../services/geminiService';
import type { Quiz as QuizType, User } from '../types';
import type { PopupConfig } from '../App';
import Quiz from './Quiz';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';

interface QuizGeneratorProps {
    topics: string[];
    language: string;
    isOnline: boolean;
    preselectedTopic?: string | null;
    onClearPreselectedTopic?: () => void;
    showPopup: (config: PopupConfig) => void;
    user: User | null;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topics, language, isOnline, preselectedTopic, onClearPreselectedTopic, showPopup, user }) => {
  const [topic, setTopic] = useState<string>(() => preselectedTopic || (topics.length > 0 ? topics[0] : ''));
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[1]); // Default to Medium
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear the preselected topic on mount so it's not sticky
    if (preselectedTopic && onClearPreselectedTopic) {
        onClearPreselectedTopic();
    }
  }, [preselectedTopic, onClearPreselectedTopic]);

  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    }
  }, [topics, topic]);

  const handleGenerateQuiz = async () => {
    if (!isOnline) {
      setError("You are offline. Please connect to generate a quiz.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    try {
        const generatedQuiz = await generateQuiz(topic, difficulty, numQuestions, language);
        setQuiz(generatedQuiz);
    } catch (err) {
        setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };
  
  const resetQuiz = () => {
    setQuiz(null);
    setError(null);
  };

  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: setTopic,
    });
  };

  if (isLoading) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Generating Quiz...</h2>
        <p className="text-slate-500 mb-6">The AI is crafting questions for {topic}.</p>
        <LoadingSpinner />
      </Card>
    );
  }

  if (quiz) {
    return <Quiz quiz={quiz} topic={topic} onFinish={resetQuiz} user={user} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Custom Quiz Generator</h2>
            <p className="text-slate-500 mt-2">Test your knowledge on a specific topic.</p>
        </div>

        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md my-6 text-sm font-medium">{error}</p>}
        
        <div className="space-y-6 mt-6">
          <PopupSelector 
            label="Select Topic" 
            value={topic} 
            placeholder="Select a topic..." 
            onClick={handleTopicSelect} 
            disabled={topics.length === 0 || !isOnline}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Difficulty
            </label>
            <div className="flex items-center space-x-2 p-1 bg-slate-200 rounded-lg">
              {DIFFICULTY_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={!isOnline}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${difficulty === level ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:bg-slate-300/50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="num-questions" className="block text-sm font-medium text-slate-700">Number of Questions: <span className="font-bold text-teal-700">{numQuestions}</span></label>
            <input
              id="num-questions"
              type="range"
              min="1"
              max="10"
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2 accent-teal-600"
              disabled={!isOnline}
            />
          </div>
        </div>
        <div className="mt-8">
          <Button onClick={handleGenerateQuiz} className="w-full !py-3" disabled={isLoading || topics.length === 0 || !isOnline}>
            {isLoading ? 'Generating...' : (!isOnline ? 'You are Offline' : 'Generate Quiz')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizGenerator;
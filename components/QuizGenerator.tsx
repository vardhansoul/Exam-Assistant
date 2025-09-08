import React, { useState, useEffect } from 'react';
import { DIFFICULTY_LEVELS } from '../constants';
import { generateQuiz, getSpecificErrorMessage } from '../services/geminiService';
import type { Quiz as QuizType } from '../types';
import Quiz from './Quiz';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';

interface QuizGeneratorProps {
    topics: string[];
    language: string;
    isOnline: boolean;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topics, language, isOnline }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[0]);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If the available topics change and the currently selected topic is no longer in the list,
    // update the selection to the first available topic.
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    }
  }, [topics, topic]);

  const handleGenerateQuiz = async () => {
    if (!isOnline) {
      setError("You are offline. Please connect to the internet to generate a new quiz.");
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

  if (isLoading) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Generating Quiz for {topic}...</h2>
        <p className="text-gray-500 mb-6">The AI is crafting the perfect questions for you.</p>
        <LoadingSpinner />
      </Card>
    );
  }

  if (quiz) {
    return <Quiz quiz={quiz} topic={topic} onFinish={resetQuiz} />;
  }

  return (
    <Card>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Create Your Custom Quiz</h2>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
       {!isOnline && <p className="text-orange-500 bg-orange-100 p-3 rounded-md mb-4">You are offline. Connect to generate new quizzes.</p>}
      <div className="space-y-6">
        <Select label="Select Topic" options={topics} value={topic} onChange={e => setTopic(e.target.value)} disabled={topics.length === 0}/>
        
        <div>
          <label htmlFor="difficulty-slider" className="block text-sm font-medium text-gray-700">
            Difficulty: <span className="font-bold">{difficulty}</span>
          </label>
          <input
            id="difficulty-slider"
            type="range"
            min="0"
            max={DIFFICULTY_LEVELS.length - 1}
            step="1"
            value={DIFFICULTY_LEVELS.indexOf(difficulty)}
            onChange={(e) => setDifficulty(DIFFICULTY_LEVELS[parseInt(e.target.value, 10)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 w-full px-1 mt-1">
            {DIFFICULTY_LEVELS.map((level) => (
              <span key={level}>{level}</span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Questions: {numQuestions}</label>
          <input
            type="range"
            min="3"
            max="10"
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>
      <div className="mt-8">
        <Button onClick={handleGenerateQuiz} className="w-full" disabled={!isOnline || isLoading || topics.length === 0}>
          {isLoading ? 'Generating...' : (isOnline ? 'Generate Quiz' : 'Offline')}
        </Button>
      </div>
    </Card>
  );
};

export default QuizGenerator;
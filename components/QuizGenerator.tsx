
import React, { useState, useEffect } from 'react';
import { DIFFICULTY_LEVELS } from '../constants';
import { generateQuiz, getSpecificErrorMessage } from '../services/geminiService';
import { getQuizUsageToday, logQuizGeneration } from '../utils/tracking';
import type { Quiz as QuizType } from '../types';
import Quiz from './Quiz';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';
import { BeakerIcon } from './icons/BeakerIcon';

interface QuizGeneratorProps {
    topics: string[];
    language: string;
    isOnline: boolean;
}

const MAX_QUESTIONS_PER_DAY = 5;

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topics, language, isOnline }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[1]); // Default to Medium
  const [numQuestions, setNumQuestions] = useState<number>(3);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsage, setDailyUsage] = useState(getQuizUsageToday());

  const questionsLeft = MAX_QUESTIONS_PER_DAY - dailyUsage;
  const canGenerate = questionsLeft > 0 && isOnline;

  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    }
  }, [topics, topic]);

  useEffect(() => {
    setDailyUsage(getQuizUsageToday());
    if (numQuestions > questionsLeft) {
      setNumQuestions(Math.max(1, questionsLeft));
    }
  }, [questionsLeft, numQuestions]);

  const handleGenerateQuiz = async () => {
    if (!canGenerate) {
      setError("You are offline or have reached your daily limit.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    try {
        const generatedQuiz = await generateQuiz(topic, difficulty, numQuestions, language);
        setQuiz(generatedQuiz);
        logQuizGeneration(numQuestions);
        setDailyUsage(getQuizUsageToday());
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
        <div className="w-16 h-16 mx-auto flex items-center justify-center bg-indigo-100 rounded-full mb-4">
            <BeakerIcon className="w-8 h-8 text-indigo-600"/>
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Generating Quiz...</h2>
        <p className="text-slate-500 mb-6">The AI is crafting questions for {topic}.</p>
        <LoadingSpinner />
      </Card>
    );
  }

  if (quiz) {
    return <Quiz quiz={quiz} topic={topic} onFinish={resetQuiz} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-indigo-100 rounded-full mb-4">
                <BeakerIcon className="w-8 h-8 text-indigo-600"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Custom Quiz Generator</h2>
            <p className="text-slate-500 mt-2">Test your knowledge on a specific topic.</p>
        </div>

        <div className="my-6">
            <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-700">Daily Question Limit</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{questionsLeft} / {MAX_QUESTIONS_PER_DAY}</p>
                <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(questionsLeft / MAX_QUESTIONS_PER_DAY) * 100}%` }}></div>
                </div>
            </div>
        </div>

        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4 text-sm font-medium">{error}</p>}
        
        <div className="space-y-6">
          <Select label="Select Topic" options={topics} value={topic} onChange={e => setTopic(e.target.value)} disabled={topics.length === 0 || !canGenerate}/>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Difficulty
            </label>
            <div className="flex items-center space-x-2 p-1 bg-slate-200 rounded-lg">
              {DIFFICULTY_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={!canGenerate}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${difficulty === level ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-300/50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="num-questions" className="block text-sm font-medium text-slate-700">Number of Questions: <span className="font-bold text-indigo-700">{numQuestions}</span></label>
            <input
              id="num-questions"
              type="range"
              min="1"
              max={Math.max(1, questionsLeft)}
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2 accent-indigo-600"
              disabled={!canGenerate || questionsLeft <= 1}
            />
          </div>
        </div>
        <div className="mt-8">
          <Button onClick={handleGenerateQuiz} className="w-full !py-3" disabled={isLoading || topics.length === 0 || !canGenerate}>
            {isLoading ? 'Generating...' : (!isOnline ? 'You are Offline' : questionsLeft > 0 ? 'Generate Quiz' : 'Daily Limit Reached')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizGenerator;
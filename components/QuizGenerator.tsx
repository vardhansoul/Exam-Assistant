
import React, { useState, useEffect } from 'react';
import { DIFFICULTY_LEVELS } from '../constants';
import { generateQuiz } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { Quiz as QuizType, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import Quiz from './Quiz';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ErrorMessage from './ErrorMessage';
import { checkAndIncrementDailyLimit } from '../firebase';

interface QuizGeneratorProps {
    topics: string[];
    language: string;
    isOnline: boolean;
    topic: string | null;
    onTopicChange: (topic: string) => void;
    showPopup: (config: PopupConfig) => void;
    user: User | null;
    selectionPath: string;
    canAccessPremium: boolean;
    requestAuth: () => void;
    isSyllabusLoading?: boolean;
    onRefresh?: () => void;
    onSetBackHandler?: (handler: (() => boolean) | null) => void;
}

const STORAGE_KEY = 'quiz_active_state';

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topics, language, isOnline, topic, onTopicChange, showPopup, user, selectionPath, canAccessPremium, requestAuth, isSyllabusLoading, onRefresh, onSetBackHandler }) => {
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[1]); // Default to Medium
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize quiz from saved state if available
  const [quiz, setQuiz] = useState<QuizType | null>(() => {
      const saved = getComponentState<{quiz: QuizType, topic: string}>(STORAGE_KEY);
      if (saved && saved.topic) {
          // Sync the parent topic state
          onTopicChange(saved.topic);
          return saved.quiz;
      }
      return null;
  });

  useEffect(() => {
    if (topics.length > 0 && (!topic || !topics.includes(topic))) {
        // If we have a saved quiz, don't overwrite topic immediately unless it's invalid
        const saved = getComponentState<{quiz: QuizType, topic: string}>(STORAGE_KEY);
        if (!saved) {
            onTopicChange(topics[0]);
        }
    } else if (topics.length === 0 && topic) {
        onTopicChange('');
    }
  }, [topics, topic, onTopicChange]);

  // Persist Quiz State
  useEffect(() => {
      if (quiz && topic) {
          saveComponentState(STORAGE_KEY, { quiz, topic }, user?.uid || null);
      } else if (!quiz) {
          saveComponentState(STORAGE_KEY, null, user?.uid || null);
      }
  }, [quiz, topic, user?.uid]);

  // Auto-fetch topics if missing and online
  useEffect(() => {
    if (topics.length === 0 && !isSyllabusLoading && isOnline && onRefresh) {
        onRefresh();
    }
  }, [topics.length, isSyllabusLoading, isOnline, onRefresh]);

  // Register back handler when quiz is active
  useEffect(() => {
    if (onSetBackHandler) {
        if (quiz) {
            onSetBackHandler(() => {
                setQuiz(null); // Go back to setup
                return true;
            });
        } else {
            onSetBackHandler(null);
        }
    }
    return () => { if (onSetBackHandler) onSetBackHandler(null); };
  }, [quiz, onSetBackHandler]);


  const handleGenerateQuiz = async () => {
    if (!topic || !isOnline) return;
    if (!canAccessPremium) {
      requestAuth();
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuiz(null);

    if (user?.uid) {
        const limitCheck = await checkAndIncrementDailyLimit(user.uid, 'quiz');
        if (!limitCheck.allowed) {
            setError("You have reached your daily limit of 5 quizzes. Please try again tomorrow.");
            setIsLoading(false);
            return;
        }
    }

    logActivity(user?.uid || null, {
        type: 'QUIZ_STARTED' as HistoryType,
        description: `Started a ${difficulty} quiz on "${topic}"`,
        view: AppView.QUIZ,
        context: { topic }
    });

    try {
      const generatedQuiz = await generateQuiz(topic, difficulty, numQuestions, language, selectionPath);
      setQuiz(generatedQuiz);
    } catch (e) {
      setError(getSpecificErrorMessage(e));
    }
    setIsLoading(false);
  };

  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic for the Quiz',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: onTopicChange,
    });
  };

  const handleDifficultySelect = () => {
    showPopup({
        title: 'Select Difficulty',
        options: DIFFICULTY_LEVELS.map(d => ({ value: d, label: d })),
        onSelect: setDifficulty,
    });
  };
  
  if (!canAccessPremium) {
    return (
        <div className="max-w-2xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to generate quizzes.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  if (quiz) {
    return (
      <div className="max-w-3xl mx-auto">
        <Quiz 
            quiz={quiz} 
            topic={topic || ''} 
            onFinish={() => setQuiz(null)} 
            user={user} 
            language={language}
            // Add a unique key for the quiz progress itself (handled inside Quiz component)
            persistenceKey={`quiz_progress_${topic}`} 
        />
      </div>
    );
  }

  if (topics.length === 0) {
      return (
          <div className="max-w-2xl mx-auto">
              <Card className="text-center py-10">
                  {isSyllabusLoading ? (
                      <>
                        <LoadingSpinner />
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Preparing your quiz topics...</p>
                      </>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Ready to Quiz?</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">To generate the perfect quiz, we just need to load your syllabus for <strong>{selectionPath}</strong> first.</p>
                        <Button onClick={onRefresh} variant="secondary" disabled={!isOnline}>
                            {isOnline ? 'Load Syllabus & Start' : 'You are Offline'}
                        </Button>
                      </>
                  )}
              </Card>
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quiz Generator</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Test your knowledge with a COC AI-generated quiz.</p>
        </div>
        
        <div className="mt-6 space-y-6">
            <PopupSelector label="Topic" value={topic || ''} placeholder="Select a topic..." onClick={handleTopicSelect} disabled={topics.length === 0} />
            <PopupSelector label="Difficulty" value={difficulty} placeholder="Select difficulty..." onClick={handleDifficultySelect} />
             <div>
                <label htmlFor="num-questions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Number of Questions: <span className="font-bold text-indigo-700 dark:text-indigo-400">{numQuestions}</span>
                </label>
                <input
                    id="num-questions"
                    type="range"
                    min="5" max="20" step="1"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2 accent-indigo-600"
                />
            </div>
        </div>

        <div className="mt-8">
          <Button onClick={handleGenerateQuiz} disabled={isLoading || !topic || !isOnline} className="w-full !py-3">
            {isLoading ? 'Generating Quiz...' : 'Start Quiz'}
          </Button>
        </div>
        
        {isLoading && <div className="mt-4 flex justify-center"><LoadingSpinner /></div>}
        <ErrorMessage message={error} onRetry={handleGenerateQuiz} />
      </Card>
    </div>
  );
};

export default QuizGenerator;

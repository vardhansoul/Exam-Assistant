
import React, { useState, useEffect } from 'react';
import { generateDailyBriefing, getSpecificErrorMessage } from '../services/geminiService';
import type { DailyBriefingData, DailyBriefingMCQ } from '../types';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface DailyBriefingProps {
  language: string;
  isOnline: boolean;
}

const DAILY_BRIEFING_CACHE_KEY = 'govPrepAiDailyBriefing';

interface CachedBriefing {
  date: string; // YYYY-MM-DD
  language: string;
  data: DailyBriefingData;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ language, isOnline }) => {
  const [briefing, setBriefing] = useState<DailyBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];

      // 1. Check cache first
      try {
        const cachedItem = localStorage.getItem(DAILY_BRIEFING_CACHE_KEY);
        if (cachedItem) {
          const parsed: CachedBriefing = JSON.parse(cachedItem);
          if (parsed.date === today && parsed.language === language) {
            setBriefing(parsed.data);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to read briefing cache", e);
      }

      // 2. If not in cache or stale, check online status
      if (!isOnline) {
        setError("You are offline. Please connect to the internet to get today's briefing.");
        setIsLoading(false);
        return;
      }

      // 3. Fetch from API
      try {
        const data = await generateDailyBriefing(language);
        setBriefing(data);
        const newCacheItem: CachedBriefing = { date: today, language, data };
        localStorage.setItem(DAILY_BRIEFING_CACHE_KEY, JSON.stringify(newCacheItem));
      } catch (err) {
        setError(getSpecificErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefing();
  }, [language, isOnline]);

  const handleAnswerSelect = (mcqIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [mcqIndex]: option }));
    setSubmitted(prev => ({ ...prev, [mcqIndex]: true }));
  };

  const renderMCQ = (mcq: DailyBriefingMCQ, index: number) => {
    const isSubmitted = submitted[index];
    const selectedAnswer = answers[index];

    return (
      <div key={index} className="mt-6">
        <h4 className="font-semibold text-gray-800">{index + 1}. {mcq.question}</h4>
        <div className="space-y-3 mt-4">
          {(mcq.options || []).map(option => {
            const isCorrect = option === mcq.correctAnswer;
            const isSelected = option === selectedAnswer;
            
            let buttonClasses = 'bg-white hover:bg-indigo-50/70 border-gray-300';
            if (isSubmitted) {
              if (isCorrect) {
                buttonClasses = 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected && !isCorrect) {
                buttonClasses = 'bg-red-100 border-red-500 text-red-800';
              } else {
                 buttonClasses = 'bg-gray-100 border-gray-300 text-gray-500';
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswerSelect(index, option)}
                disabled={isSubmitted}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between disabled:cursor-default ${buttonClasses}`}
              >
                <span>{option}</span>
                {isSubmitted && isCorrect && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                {isSubmitted && isSelected && !isCorrect && <XCircleIcon className="w-5 h-5 text-red-600" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Fetching Today's Briefing...</h2>
        <p className="text-gray-500 mb-6">The AI is preparing your daily current affairs update.</p>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 border-b pb-4">Daily AI Briefing</h2>
      {briefing ? (
        <div>
          <div className="prose max-w-none bg-slate-50 p-4 rounded-lg">
            <p>{briefing.summary}</p>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Check Your Understanding</h3>
          {briefing.mcqs.map(renderMCQ)}
        </div>
      ) : (
        <p className="text-gray-500">Could not load the daily briefing.</p>
      )}
    </Card>
  );
};

export default DailyBriefing;

import React, { useState, useEffect, useRef } from 'react';
import { generateDailyBriefing } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { DailyBriefingData, DailyBriefingMCQ, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import Button from './Button';


interface DailyBriefingProps {
  language: string;
  isOnline: boolean;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ language, isOnline, user, canAccessPremium, requestAuth }) => {
  const [briefing, setBriefing] = useState<DailyBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const hasLogged = useRef(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsLoading(true);
      setError(null);

      if (!canAccessPremium) {
        setError("Please sign in or start a trial to view the Daily Briefing.");
        setIsLoading(false);
        return;
      }

      if (!isOnline) {
        setError("You are offline. Please connect to the internet to get today's briefing.");
        setIsLoading(false);
        return;
      }

      try {
        // Pass !user as isTrial
        const data = await generateDailyBriefing(language, !user);
        setBriefing(data);
        if (user && !hasLogged.current) {
            logActivity(user.uid, { type: 'DAILY_BRIEFING_VIEWED' as HistoryType, description: "Viewed the Daily Briefing", view: AppView.DAILY_BRIEFING, context: {} });
            hasLogged.current = true;
        }
      } catch (err) {
        setError(getSpecificErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBriefing();
  }, [language, isOnline, user, canAccessPremium]);

  const handleAnswerSelect = (mcqIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [mcqIndex]: option }));
    setSubmitted(prev => ({ ...prev, [mcqIndex]: true }));
  };

  const renderMCQ = (mcq: DailyBriefingMCQ, index: number) => {
    const isSubmitted = submitted[index];
    const selectedAnswer = answers[index];

    return (
      <div key={index} className="mt-6">
        <h4 className="font-semibold text-gray-800">{index + 1}. <ContentRenderer content={mcq.question} /></h4>
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
                <ContentRenderer content={option} />
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  if (!canAccessPremium && !isLoading) {
    return (
        <Card className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{error || "Your trial has ended. Please sign up or log in to view the Daily Briefing."}</p>
            <div className="mt-6">
                <Button onClick={requestAuth}>Sign Up / Log In</Button>
            </div>
        </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Fetching Today's Briefing...</h2>
        <p className="text-gray-500 mb-6">COC AI is preparing your daily current affairs update.</p>
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
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 border-b pb-4">Daily COC AI Briefing</h2>
      {briefing ? (
        <div>
          <div className="prose max-w-none bg-slate-50 p-4 rounded-lg">
            <ContentRenderer content={briefing.summary} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">Check Your Understanding</h3>
          {briefing.mcqs.map(renderMCQ)}
          {briefing.sources && briefing.sources.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-200">
                <h4 className="text-md font-bold text-slate-700 mb-2">Sources</h4>
                <ul className="space-y-2 text-sm">
                    {briefing.sources.map((source, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-slate-100 rounded-md">
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all" title={source.web.title}>
                                {source.web.title || source.web.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Could not load the daily briefing.</p>
      )}
    </Card>
  );
};

export default DailyBriefing;

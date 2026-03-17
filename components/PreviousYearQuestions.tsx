
import React, { useState, useEffect } from 'react';
import { fetchPreviousYearQuestions } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { GroundedSummary, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';

interface PreviousYearQuestionsProps {
  selectionPath: string;
  language: string;
  isOnline: boolean;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const STORAGE_KEY = 'pyq_state';

const PreviousYearQuestions: React.FC<PreviousYearQuestionsProps> = ({ selectionPath, language, isOnline, user, canAccessPremium, requestAuth }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize from storage
  const [questions, setQuestions] = useState<GroundedSummary | null>(() => {
      const saved = getComponentState<{questions: GroundedSummary | null, path: string}>(STORAGE_KEY);
      if (saved && saved.path === selectionPath) return saved.questions;
      return null;
  });

  // Persist
  useEffect(() => {
      if (questions) {
          saveComponentState(STORAGE_KEY, { questions, path: selectionPath });
      } else {
          saveComponentState(STORAGE_KEY, null);
      }
  }, [questions, selectionPath]);

  const handleFetch = async () => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    if (!selectionPath.trim()) {
      setError("Please select an exam from the dashboard first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuestions(null);

    logActivity(user?.uid || null, {
        type: 'PREVIOUS_YEAR_QUESTIONS_VIEWED' as HistoryType,
        description: `Searched for previous year questions for "${selectionPath}"`,
        view: AppView.PREVIOUS_YEAR_QUESTIONS,
        context: { examPath: selectionPath }
    });

    try {
      // Pass !user as isTrial
      const result = await fetchPreviousYearQuestions(selectionPath, language, !user);
      setQuestions(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };
  
  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to search for previous year questions.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Sign Up / Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Previous Year Questions</h2>
          <p className="text-slate-500 mt-2">Find real questions from past exams for <span className="font-semibold">{selectionPath}</span>.</p>
        </div>

        {!questions ? (
          <div className="mt-8 text-center">
            <Button onClick={handleFetch} disabled={isLoading || !isOnline} className="!py-3 px-8">
              {isLoading ? 'Searching...' : 'Find Questions'}
            </Button>
            {isLoading && <div className="mt-4"><LoadingSpinner/></div>}
            <ErrorMessage message={error} onRetry={handleFetch} />
          </div>
        ) : (
          <div className="mt-8">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-h-[60vh] overflow-y-auto">
              <ContentRenderer content={questions.text} className="prose prose-slate max-w-none" />
            </div>
            
            {questions.sources && questions.sources.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-md font-bold text-slate-700 mb-2">Sources</h4>
                    <ul className="space-y-2 text-sm">
                        {questions.sources.map((source, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 bg-slate-100 rounded-md">
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all" title={source.web.title}>
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="mt-8 text-center">
                <Button onClick={handleFetch} variant="secondary" disabled={isLoading || !isOnline}>
                    {isLoading ? 'Searching...' : 'Find More Questions'}
                </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PreviousYearQuestions;

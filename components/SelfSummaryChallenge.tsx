
import React, { useState, useEffect } from 'react';
import { evaluateUserSummary } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';

interface SelfSummaryChallengeProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const STORAGE_KEY = 'summary_challenge_state';

const SelfSummaryChallenge: React.FC<SelfSummaryChallengeProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from storage
  const [topic, setTopic] = useState<string>(() => {
      const saved = getComponentState<{userSummary: string, feedback: string|null, topic: string}>(STORAGE_KEY);
      return saved?.topic || (topics.length > 0 ? topics[0] : '');
  });
  
  const [userSummary, setUserSummary] = useState(() => {
      const saved = getComponentState<{userSummary: string, feedback: string|null, topic: string}>(STORAGE_KEY);
      return saved?.userSummary || '';
  });

  const [feedback, setFeedback] = useState<string | null>(() => {
      const saved = getComponentState<{userSummary: string, feedback: string|null, topic: string}>(STORAGE_KEY);
      return saved?.feedback || null;
  });

  useEffect(() => {
    // If no topic selected and topics available, default to first
    if (!topic && topics.length > 0) {
        setTopic(topics[0]);
    }
  }, [topics, topic]);

  // Persist State
  useEffect(() => {
      saveComponentState(STORAGE_KEY, { userSummary, feedback, topic });
  }, [userSummary, feedback, topic]);

  const handleSubmit = async () => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    if (!userSummary.trim()) {
      setError("Please write a summary before submitting.");
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    setError(null);

    logActivity(user?.uid || null, {
        type: 'SUMMARY_CHALLENGE_COMPLETED' as HistoryType,
        description: `Completed a summary challenge for "${topic}"`,
        view: AppView.SELF_SUMMARY_CHALLENGE,
        context: { topic }
    });

    try {
      const result = await evaluateUserSummary(topic, userSummary, language);
      setFeedback(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleTopicSelect = () => {
    showPopup({
      title: 'Select a Topic to Summarize',
      options: topics.map(t => ({ value: t, label: t })),
      onSelect: (selectedTopic) => {
        setTopic(selectedTopic);
        // Clear previous results when topic changes manually
        setUserSummary('');
        setFeedback(null);
        setError(null);
      },
    });
  };

  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the Self-summary Challenge.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Self-summary Challenge</h2>
          <p className="text-slate-500 mt-2">Test your understanding. Write a summary and get expert COC AI feedback.</p>
        </div>

        <div className="mt-6 space-y-4">
          <PopupSelector
            label="1. Select your topic"
            value={topic}
            placeholder="Select a topic..."
            onClick={handleTopicSelect}
            disabled={topics.length === 0 || isLoading}
          />
          <div>
            <label htmlFor="summary-input" className="block text-sm font-medium text-slate-700 mb-1.5">
              2. Write your summary
            </label>
            <textarea
              id="summary-input"
              value={userSummary}
              onChange={(e) => setUserSummary(e.target.value)}
              placeholder={`In your own words, explain the key concepts of "${topic}"...`}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-slate-100 transition"
              rows={8}
              disabled={isLoading || !isOnline}
            />
          </div>
          <Button onClick={handleSubmit} disabled={isLoading || !isOnline || !userSummary.trim()} className="w-full !py-3">
            {isLoading ? 'Evaluating...' : 'Get Feedback'}
          </Button>
        </div>

        <ErrorMessage message={error} onRetry={handleSubmit} />
        
        {isLoading && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">COC AI is reviewing your summary...</p>
          </div>
        )}

        {feedback && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-center text-indigo-700 mb-4">COC AI Feedback</h3>
            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 max-h-[60vh] overflow-y-auto">
              <ContentRenderer content={feedback} className="prose prose-slate max-w-none" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SelfSummaryChallenge;

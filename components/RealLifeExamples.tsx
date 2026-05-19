
import React, { useState, useEffect } from 'react';
import { generateRealLifeExamples } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import PopupSelector from './PopupSelector';
import ErrorMessage from './ErrorMessage';

interface RealLifeExamplesProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const STORAGE_KEY = 'real_life_examples_state';

const RealLifeExamples: React.FC<RealLifeExamplesProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from storage
  const [topic, setTopic] = useState<string>(() => {
      const saved = getComponentState<{examples: string|null, topic: string}>(STORAGE_KEY);
      return saved?.topic || (topics.length > 0 ? topics[0] : '');
  });

  const [examples, setExamples] = useState<string | null>(() => {
      const saved = getComponentState<{examples: string|null, topic: string}>(STORAGE_KEY);
      return saved?.examples || null;
  });

  useEffect(() => {
    // Sync topic default
    if (!topic && topics.length > 0) {
        setTopic(topics[0]);
    }
  }, [topics, topic]);

  // Persist State
  useEffect(() => {
      saveComponentState(STORAGE_KEY, { examples, topic });
  }, [examples, topic]);

  const handleGetExamples = async () => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    setIsLoading(true);
    setExamples(null);
    setError(null);

    logActivity(user?.uid || null, {
        type: 'REAL_LIFE_EXAMPLES_VIEWED' as HistoryType,
        description: `Viewed real-life examples for "${topic}"`,
        view: AppView.REAL_LIFE_EXAMPLES,
        context: { topic }
    });

    try {
      const result = await generateRealLifeExamples(topic, language);
      setExamples(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleTopicSelect = () => {
    showPopup({
      title: 'Select a Topic',
      options: topics.map(t => ({ value: t, label: t })),
      onSelect: (selectedTopic) => {
        setTopic(selectedTopic);
        setExamples(null);
        setError(null);
      },
    });
  };

  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to see real-life examples.</p>
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Concept to Real Life</h2>
          <p className="text-slate-500 mt-2">Discover how abstract concepts apply in the real world.</p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full flex-grow">
              <PopupSelector
                label="Select a concept or topic"
                value={topic}
                placeholder="Select a topic..."
                onClick={handleTopicSelect}
                disabled={topics.length === 0 || isLoading}
              />
            </div>
            <Button onClick={handleGetExamples} disabled={isLoading || !isOnline || !topic} className="w-full sm:w-auto flex-shrink-0 !py-3">
              {isLoading ? 'Generating...' : 'Get Examples'}
            </Button>
          </div>
          <ErrorMessage message={error} onRetry={handleGetExamples} />
        </div>

        {isLoading && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Finding real-world applications for {topic}...</p>
          </div>
        )}

        {examples && (
          <div className="mt-6">
            <div className="p-6 border border-slate-200 rounded-xl bg-white max-h-[60vh] overflow-y-auto">
              <ContentRenderer content={examples} className="prose prose-slate max-w-none" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RealLifeExamples;

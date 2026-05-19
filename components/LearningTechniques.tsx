import React, { useState, useEffect } from 'react';
import { generateLearningTechniques } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';

interface LearningTechniquesProps {
  language: string;
  isOnline: boolean;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
  topics?: string[];
  selectionPath?: string;
}

const LearningTechniques: React.FC<LearningTechniquesProps> = ({
  language,
  isOnline,
  user,
  canAccessPremium,
  requestAuth,
  topics = [],
  selectionPath = ''
}) => {
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topics.length > 0 && !subject) {
      setSubject(topics[0]);
    }
  }, [topics]);

  const handleGenerate = async () => {
    if (!canAccessPremium) {
      requestAuth();
      return;
    }
    if (!subject.trim() || !isOnline) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    logActivity(user?.uid || null, {
      type: 'LEARNING_TECHNIQUES_GENERATED' as HistoryType,
      description: `Generated learning techniques for "${subject}"`,
      view: AppView.LEARNING_TECHNIQUES,
      context: { subject }
    });

    try {
      const generatedTechniques = await generateLearningTechniques(subject, language);
      setResult(generatedTechniques);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Subject Learning Techniques</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Discover the most effective, evidence-based study methods tailored specifically to the subject you want to master.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What subject or topic are you studying?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Organic Chemistry, Indian History, Calculus..."
                className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !subject.trim() || !isOnline}
                className="px-6 py-3"
              >
                {isLoading ? <LoadingSpinner /> : 'Get Strategy'}
              </Button>
            </div>
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 py-1">Suggestions:</span>
              {topics.slice(0, 5).map(t => (
                <button
                  key={t}
                  onClick={() => setSubject(t)}
                  className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {error && <ErrorMessage message={error} />}

      {result && (
        <Card className="p-6 md:p-8 border-t-4 border-t-indigo-500">
          <div className="prose dark:prose-invert max-w-none">
            <ContentRenderer content={result} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default LearningTechniques;

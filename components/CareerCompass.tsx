
import React, { useState, useEffect, useCallback } from 'react';
import { getCareerPathAdvice, generateSkillDevelopmentPlan, findUpskillingResources } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { getTrackingData, logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { User, PerformanceSummary, GroundedSummary, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import { JOB_ROLES } from '../constants';

interface CareerCompassProps {
  language: string;
  isOnline: boolean;
  user: User | null;
  selectionPath: string;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const STORAGE_KEY = 'career_compass_state';

const CareerCompass: React.FC<CareerCompassProps> = ({ language, isOnline, user, selectionPath, canAccessPremium, requestAuth }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);

  // Initialize from storage
  const [activeTool, setActiveTool] = useState<'advice' | 'skill' | 'resources' | null>(() => {
      return getComponentState<any>(STORAGE_KEY)?.activeTool || null;
  });
  const [inputValue, setInputValue] = useState(() => {
      return getComponentState<any>(STORAGE_KEY)?.inputValue || '';
  });
  const [result, setResult] = useState<string | GroundedSummary | null>(() => {
      return getComponentState<any>(STORAGE_KEY)?.result || null;
  });

  // Persist
  useEffect(() => {
      saveComponentState(STORAGE_KEY, { activeTool, inputValue, result });
  }, [activeTool, inputValue, result]);

  useEffect(() => {
    const loadData = async () => {
        const trackingData = await getTrackingData(user?.uid || null);
        const totalQuizzes = trackingData.quizHistory.length;
        const totalScore = trackingData.quizHistory.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0);
        const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
        setPerformanceSummary({
            totalQuizzes, averageScore,
            topicsStudied: trackingData.studiedTopics.length,
            masteredTopics: [], 
            weakTopics: [], 
            studyStreak: 0,
        });
    };
    if (user) loadData();
  }, [user]);
  
  const handleRunTool = async (tool: 'advice' | 'skill' | 'resources') => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    let input = inputValue;
    if (tool === 'advice') {
        const potentialRole = JOB_ROLES.find(role => selectionPath.toLowerCase().includes(role.toLowerCase().split('(')[0].trim()));
        input = potentialRole || JOB_ROLES[0];
    }

    if (!input.trim() && tool !== 'advice') {
        setError('Please enter a role or skill.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    logActivity(user?.uid || null, {
        type: 'CAREER_ADVICE_VIEWED' as HistoryType,
        description: `Used Career Compass for "${tool}: ${input}"`,
        view: AppView.CAREER_COMPASS,
        context: { topic: input }
    });

    try {
        let response;
        if (tool === 'advice') {
            if (!performanceSummary) throw new Error("Performance data not loaded yet.");
            response = await getCareerPathAdvice(input, performanceSummary, language, !user);
        } else if (tool === 'skill') {
            response = await generateSkillDevelopmentPlan(input, language, !user);
        } else { // resources
            response = await findUpskillingResources(input, language, !user);
        }
        setResult(response);
    } catch(err) {
        setError(getSpecificErrorMessage(err));
    } finally {
        setIsLoading(false);
    }
  };

  const ToolCard: React.FC<{
      title: string, description: string,
      toolId: 'advice' | 'skill' | 'resources', placeholder: string
  }> = ({ title, description, toolId, placeholder }) => (
      <Card className="flex flex-col">
          <div className="flex items-center gap-3">
              <div>
                  <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                  <p className="text-sm text-slate-500">{description}</p>
              </div>
          </div>
          <div className="mt-4 flex-grow flex flex-col">
            { toolId !== 'advice' && 
              <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full p-2 border border-slate-300 rounded-md mb-3"
                  onFocus={() => { setActiveTool(toolId); setResult(null); setError(null); }}
                  disabled={!canAccessPremium}
              />
            }
          </div>
          <Button
              onClick={() => { setActiveTool(toolId); handleRunTool(toolId); }}
              disabled={isLoading || !isOnline || !canAccessPremium}
              className="mt-auto w-full"
          >
              {isLoading && activeTool === toolId ? 'Generating...' : !canAccessPremium ? 'Sign Up to Use' : 'Get Advice'}
          </Button>
      </Card>
  );

  if (!canAccessPremium) {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to use the Career Compass.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Sign Up / Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Career Compass</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">From exam success to career excellence. Let COC guide your professional journey beyond the classroom.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ToolCard 
              title="Chart Your Next Step"
              description="Get personalized career path advice based on your performance and goals."
              toolId="advice"
              placeholder="e.g., Bank PO"
          />
          <ToolCard 
              title="Develop New Skills"
              description="Generate a custom learning plan for any professional skill."
              toolId="skill"
              placeholder="e.g., Public Speaking"
          />
          <ToolCard 
              title="Find Upskilling Resources"
              description="Discover top online courses, articles, and tutorials for any skill."
              toolId="resources"
              placeholder="e.g., Data Analysis with Python"
          />
      </div>
      
      {(isLoading || error || result) && (
        <div className="mt-8">
            <Card>
                 {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
                 {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                 {result && (
                    <div>
                        {typeof result === 'string' ? (
                             <ContentRenderer content={result} className="prose prose-slate max-w-none" />
                        ) : (
                            <div>
                                <ContentRenderer content={result.text} className="prose prose-slate max-w-none" />
                                {result.sources && result.sources.length > 0 && (
                                    <div className="mt-6 pt-4 border-t">
                                        <h4 className="font-bold text-slate-700 mb-2">Sources Found:</h4>
                                        <ul className="space-y-2 text-sm">
                                            {result.sources.map((source, index) => (
                                                <li key={index} className="p-2 bg-slate-100 rounded-md">
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all" title={source.web.title}>
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                 )}
            </Card>
        </div>
      )}
    </div>
  );
};

export default CareerCompass;

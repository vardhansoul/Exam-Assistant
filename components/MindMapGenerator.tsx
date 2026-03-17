
import React, { useState, useEffect } from 'react';
import { generateMindMap } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { MindMapNode, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ErrorMessage from './ErrorMessage';

interface MindMapGeneratorProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
  isSyllabusLoading?: boolean;
  onRefresh?: () => void;
}

const STORAGE_KEY = 'mindmap_active_state';

const MindMapNodeDisplay: React.FC<{ node: MindMapNode; level?: number }> = ({ node, level = 0 }) => {
  const colors = [
    'bg-indigo-600 text-white',
    'bg-sky-500 text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
  ];
  const nodeColor = colors[level % colors.length];

  return (
    <div className="my-2 relative">
      <div className="flex items-center">
        {level > 0 && <div className="w-8 h-px bg-slate-300"></div>}
        <div className={`px-4 py-2 rounded-lg shadow-md ${nodeColor} z-10`}>
          <p className="font-semibold text-sm sm:text-base">{node.name}</p>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="pl-10 border-l-2 border-slate-300 ml-4">
          {node.children.map((child, index) => (
            <MindMapNodeDisplay key={`${child.name}-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};


const MindMapGenerator: React.FC<MindMapGeneratorProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth, isSyllabusLoading, onRefresh }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize from storage
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(() => {
      const saved = getComponentState<{data: MindMapNode, topic: string}>(STORAGE_KEY);
      if (saved && saved.topic) {
          setTopic(saved.topic); // Will be overwritten by useEffect if topics loads later, handled below
          return saved.data;
      }
      return null;
  });

  useEffect(() => {
    // If we have a saved topic but it's not in the topics list yet (maybe list loading), that's fine.
    // But if we don't have a saved state, default to first topic.
    const saved = getComponentState<{data: MindMapNode, topic: string}>(STORAGE_KEY);
    if (!saved) {
        if (topics.length > 0 && !topics.includes(topic)) {
            setTopic(topics[0]);
        } else if (topics.length === 0) {
            setTopic('');
        }
    } else {
        if (!topic) setTopic(saved.topic);
    }
  }, [topics, topic]);

  // Persist State
  useEffect(() => {
      if (mindMapData && topic) {
          saveComponentState(STORAGE_KEY, { data: mindMapData, topic });
      } else if (!mindMapData) {
          saveComponentState(STORAGE_KEY, null);
      }
  }, [mindMapData, topic]);

  // Auto-fetch topics if missing and online
  useEffect(() => {
    if (topics.length === 0 && !isSyllabusLoading && isOnline && onRefresh) {
        onRefresh();
    }
  }, [topics.length, isSyllabusLoading, isOnline, onRefresh]);

  const handleGenerateMap = async () => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    setIsLoading(true);
    setMindMapData(null);
    setError(null);

    if (!isOnline) {
      setError("It looks like we're offline. Please connect to generate a mind map.");
      setIsLoading(false);
      return;
    }
    
    logActivity(user?.uid || null, {
        type: 'MIND_MAP_GENERATED' as HistoryType,
        description: `Generated a mind map for "${topic}"`,
        view: AppView.MIND_MAP,
        context: { topic }
    });

    try {
      const data = await generateMindMap(topic, language);
      setMindMapData(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };
  
  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic to Visualize',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: (t) => { setTopic(t); setMindMapData(null); }, // Reset map when topic changes manually
    });
  };

  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to use the Mind Map Generator.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Sign Up / Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  if (topics.length === 0) {
      return (
          <div className="max-w-3xl mx-auto">
              <Card className="text-center py-10">
                  {isSyllabusLoading ? (
                      <>
                        <LoadingSpinner />
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Gathering topics for your visual map...</p>
                      </>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Let's Get Started</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We need to load your syllabus topics first so you can create a mind map.</p>
                        <Button onClick={onRefresh} variant="secondary" disabled={!isOnline}>
                            {isOnline ? 'Load Topics Now' : 'You are Offline'}
                        </Button>
                      </>
                  )}
              </Card>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Mind Map Generator</h2>
            <p className="text-slate-500 mt-2">Visually explore connections between topics with COC AI.</p>
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full flex-grow">
                  <PopupSelector 
                    label="Select a topic to visualize"
                    value={topic}
                    placeholder="Select a topic..."
                    onClick={handleTopicSelect}
                    disabled={topics.length === 0}
                  />
                </div>
                <Button onClick={handleGenerateMap} disabled={isLoading || topics.length === 0 || !isOnline} className="w-full sm:w-auto flex-shrink-0 !py-3">
                  {isLoading ? 'Generating...' : (isOnline ? 'Generate Map' : 'Offline')}
                </Button>
            </div>
             <ErrorMessage message={error} onRetry={handleGenerateMap} />
        </div>
        
        {isLoading && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Creating your visual map...</p>
          </div>
        )}

        {mindMapData && (
          <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-white overflow-x-auto">
            <div className="min-w-max py-4">
               <MindMapNodeDisplay node={mindMapData} />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MindMapGenerator;

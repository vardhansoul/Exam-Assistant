
import React, { useState, useEffect } from 'react';
import { generateConceptLinkMap } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { MindMapNode, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ErrorMessage from './ErrorMessage';

interface ConceptLinkMapProps {
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


const ConceptLinkMap: React.FC<ConceptLinkMapProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth, isSyllabusLoading, onRefresh }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [mapData, setMapData] = useState<MindMapNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    } else if (topics.length === 0) {
      setTopic('');
    }
  }, [topics, topic]);

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
    setMapData(null);
    setError(null);

    if (!isOnline) {
      setError("You are offline. Please connect to the internet to generate a concept map.");
      setIsLoading(false);
      return;
    }
    
    logActivity(user?.uid || null, {
        type: 'CONCEPT_MAP_GENERATED' as HistoryType,
        description: `Generated a concept link map for "${topic}"`,
        view: AppView.CONCEPT_LINK_MAP,
        context: { topic }
    });

    try {
      // Pass !user as isTrial
      const data = await generateConceptLinkMap(topic, language, !user);
      setMapData(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };
  
  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: setTopic,
    });
  };

  if (!canAccessPremium) {
    return (
        <div className="max-w-3xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to use the Concept Link Map.</p>
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
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Loading your syllabus topics...</p>
                      </>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">No Syllabus Loaded</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We need to load the topics before you can generate a concept map.</p>
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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Concept Link Map</h2>
            <p className="text-slate-500 mt-2">Explore prerequisites and related concepts for deep understanding.</p>
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full flex-grow">
                  <PopupSelector 
                    label="Select a topic to analyze"
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
            <p className="mt-4 text-slate-600">Analyzing concept connections...</p>
          </div>
        )}

        {mapData && (
          <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-white overflow-x-auto">
            <div className="min-w-max py-4">
               <MindMapNodeDisplay node={mapData} />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConceptLinkMap;

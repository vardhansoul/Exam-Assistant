
import React, { useState, useEffect } from 'react';
import { generateMindMap, getSpecificErrorMessage } from '../services/geminiService';
import type { MindMapNode } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';

interface MindMapGeneratorProps {
  topics: string[];
  language: string;
  isOnline: boolean;
}

const MindMapNodeDisplay: React.FC<{ node: MindMapNode; level?: number }> = ({ node, level = 0 }) => {
  const colors = [
    'bg-indigo-600 text-white', 'bg-sky-500 text-white',
    'bg-emerald-500 text-white', 'bg-amber-500 text-white',
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


const MindMapGenerator: React.FC<MindMapGeneratorProps> = ({ topics, language, isOnline }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    } else if (topics.length === 0) {
      setTopic('');
    }
  }, [topics, topic]);

  const handleGenerateMap = async () => {
    setIsLoading(true);
    setMindMapData(null);
    setError(null);

    if (!isOnline) {
      setError("You are offline. Please connect to the internet to generate a mind map.");
      setIsLoading(false);
      return;
    }

    try {
      const data = await generateMindMap(topic, language);
      setMindMapData(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Mind Map Generator</h2>
            <p className="text-slate-500 mt-2">Visually explore connections between topics with AI.</p>
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full flex-grow">
                  <Select label="Select a topic to visualize" options={topics} value={topic} onChange={e => setTopic(e.target.value)} disabled={topics.length === 0} />
                </div>
                <Button onClick={handleGenerateMap} disabled={isLoading || topics.length === 0 || !isOnline} className="w-full sm:w-auto flex-shrink-0 !py-3">
                  {isLoading ? 'Generating...' : (isOnline ? 'Generate Map' : 'Offline')}
                </Button>
            </div>
             {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mt-4 text-center">{error}</p>}
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

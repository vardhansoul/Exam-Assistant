import React, { useState } from 'react';
import { generateShortcuts, getSpecificErrorMessage } from '../services/geminiService';
import { APTITUDE_TOPICS } from '../constants';
import Card from './Card';
import Button from './Button';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface TeachShortcutsProps {
  language: string;
  isOnline: boolean;
}

const TeachShortcuts: React.FC<TeachShortcutsProps> = ({ language, isOnline }) => {
  const [topic, setTopic] = useState<string>(APTITUDE_TOPICS[0]);
  const [shortcuts, setShortcuts] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!isOnline) {
      setError("You are offline. Please connect to the internet to generate shortcuts.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setShortcuts(null);
    try {
      const result = await generateShortcuts(topic, language);
      setShortcuts(result);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('###')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      if (line.startsWith('##')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
      if (line.startsWith('* ')) return <li key={index} className="ml-5 list-disc">{line.replace('* ', '').trim()}</li>;
      if (line.includes('**')) {
        const parts = line.split('**');
        return <p key={index}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>;
      }
      return <p key={index} className="my-1">{line || '\u00A0'}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto flex items-center justify-center bg-amber-100 rounded-full mb-4">
            <LightBulbIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Aptitude & Reasoning Shortcuts</h2>
          <p className="text-slate-500 mt-2">Select a topic to get AI-generated shortcuts, tricks, and formulas.</p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full flex-grow">
              <Select label="Select Topic" options={APTITUDE_TOPICS} value={topic} onChange={e => setTopic(e.target.value)} disabled={isLoading} />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !isOnline} className="w-full sm:w-auto flex-shrink-0 !py-3">
              {isLoading ? 'Generating...' : 'Get Shortcuts'}
            </Button>
          </div>
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mt-4 text-center">{error}</p>}
        </div>

        {isLoading && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Finding the quickest tricks for {topic}...</p>
          </div>
        )}

        {shortcuts && (
          <div className="mt-6">
            <div className="p-6 border border-slate-200 rounded-xl bg-white prose prose-slate max-w-none max-h-[60vh] overflow-y-auto">
              {formatText(shortcuts)}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeachShortcuts;

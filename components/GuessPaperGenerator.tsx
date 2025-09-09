
import React, { useState, useEffect } from 'react';
import { generateGuessPaper, getSpecificErrorMessage } from '../services/geminiService';
import type { GuessPaper } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';

interface GuessPaperGeneratorProps {
  topics: string[];
  language: string;
  isOnline: boolean;
}

const QuestionCard: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);

    const formatAnswer = (text: string) => {
        return text.split('\n').map((line, idx) => {
            if (line.startsWith('###')) return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
            if (line.startsWith('##')) return <h2 key={idx} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
            if (line.startsWith('* ')) return <li key={idx} className="ml-5 list-disc">{line.replace('* ', '').trim()}</li>;
            if (line.includes('**')) {
                const parts = line.split('**');
                return <p key={idx}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>;
            }
            return <p key={idx} className="my-1">{line || '\u00A0'}</p>;
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-300">
            <p className="font-semibold text-slate-500 mb-2">Question {index + 1}</p>
            <h3 className="text-lg font-bold text-slate-800">{question}</h3>
            <div className="mt-4">
                <Button variant="secondary" onClick={() => setIsAnswerVisible(!isAnswerVisible)}>
                    {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
                </Button>
            </div>
            {isAnswerVisible && (
                <div className="mt-4 pt-4 border-t border-slate-200 prose prose-sm prose-slate max-w-none">
                    {formatAnswer(answer)}
                </div>
            )}
        </div>
    );
};

const GuessPaperGenerator: React.FC<GuessPaperGeneratorProps> = ({ topics, language, isOnline }) => {
  const [topic, setTopic] = useState<string>(topics.length > 0 ? topics[0] : '');
  const [guessPaper, setGuessPaper] = useState<GuessPaper | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    } else if (topics.length === 0) {
      setTopic('');
    }
  }, [topics, topic]);

  const handleGeneratePaper = async () => {
    setIsLoading(true);
    setGuessPaper(null);
    setError(null);
    if (!isOnline) {
      setError("You are offline. Please connect to generate a guess paper.");
      setIsLoading(false);
      return;
    }
    try {
      const data = await generateGuessPaper(topic, language);
      setGuessPaper(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
        <Card>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 mb-6">
            <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-800">Guess Paper Generator</h2>
                <p className="text-slate-500 mt-1">Get AI-predicted questions with detailed answers.</p>
            </div>
            {guessPaper && (
                 <Button variant="secondary" onClick={() => setGuessPaper(null)} className="mt-4 sm:mt-0 w-full sm:w-auto">
                    Generate New Paper
                </Button>
            )}
          </div>

          {!guessPaper ? (
            <>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full flex-grow">
                          <Select label="Select a topic" options={topics} value={topic} onChange={e => setTopic(e.target.value)} disabled={topics.length === 0} />
                        </div>
                        <Button onClick={handleGeneratePaper} disabled={isLoading || topics.length === 0 || !isOnline} className="w-full sm:w-auto flex-shrink-0 !py-3">
                          {isLoading ? 'Generating...' : 'Generate Paper'}
                        </Button>
                    </div>
                </div>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4 text-center">{error}</p>}
                {isLoading && (
                    <div className="text-center p-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-600">AI is analyzing patterns to predict questions...</p>
                    </div>
                )}
            </>
          ) : (
            <div className="mt-6">
                <h3 className="text-2xl font-bold text-center text-indigo-700 mb-6">{guessPaper.title}</h3>
                <div className="space-y-6 bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200">
                    {guessPaper.questions.map((q, index) => (
                        <QuestionCard key={index} question={q.question} answer={q.answer} index={index} />
                    ))}
                </div>
            </div>
          )}
        </Card>
    </div>
  );
};

export default GuessPaperGenerator;

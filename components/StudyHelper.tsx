

import React, { useState, useEffect } from 'react';
import { generateStudyNotes, getSpecificErrorMessage, generateDeepDiveForTopic } from '../services/geminiService';
import type { StudyMaterial, DeepDiveMaterial, PracticeQuestion, User } from '../types';
import type { PopupConfig } from '../App';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import { markTopicAsStudied } from '../utils/tracking';

interface StudyHelperProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  preselectedTopic?: string | null;
  onClearPreselectedTopic?: () => void;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
}

const QuizItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="p-3 bg-white rounded-md border mt-2 shadow-sm">
      <p className="font-semibold text-slate-700">{question}</p>
      <button onClick={() => setShowAnswer(!showAnswer)} className="text-sm text-teal-600 font-bold mt-2 hover:underline">
        {showAnswer ? 'Hide' : 'Show'} Answer
      </button>
      {showAnswer && <p className="mt-2 text-slate-700 bg-slate-100 p-2 rounded">{answer}</p>}
    </div>
  );
};


const DeepDiveDisplay: React.FC<{ material: DeepDiveMaterial, topic: string }> = ({ material, topic }) => {
  return (
    <div className="mt-8 pt-6 border-t-4 border-teal-500 bg-slate-50 rounded-b-xl">
      <h3 className="text-2xl font-bold text-center text-teal-700">Deep Dive: {topic}</h3>
      
      <div className="mt-6 p-4 space-y-6">
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Core Concepts</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {material.coreConcepts.map((concept, i) => <li key={i}>{concept}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Real-World Example</h4>
          <p className="text-slate-700 p-3 bg-white rounded-lg border italic">{material.realWorldExample}</p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Common Mistakes to Avoid</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {material.commonMistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Quick Quiz</h4>
          <div className="space-y-2">
             {material.quickQuiz.map((q, i) => <QuizItem key={i} question={q.question} answer={q.answer} />)}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Related Topics</h4>
          <div className="flex flex-wrap gap-2">
            {material.relatedTopics.map((t, i) => <span key={i} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-200 rounded-xl bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 font-bold text-slate-800 hover:bg-slate-50"
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <span className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 prose prose-slate max-w-none">
                    {children}
                </div>
            )}
        </div>
    );
};


const StudyHelper: React.FC<StudyHelperProps> = ({ topics, language, isOnline, preselectedTopic, onClearPreselectedTopic, showPopup, user }) => {
  const [topic, setTopic] = useState<string>(() => preselectedTopic || (topics.length > 0 ? topics[0] : ''));
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [deepDiveMaterial, setDeepDiveMaterial] = useState<DeepDiveMaterial | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (preselectedTopic) {
        handleGenerateNotes(preselectedTopic);
        if(onClearPreselectedTopic) {
            onClearPreselectedTopic();
        }
    }
  }, [preselectedTopic]);

  useEffect(() => {
    if (topics.length > 0 && !topics.includes(topic)) {
      setTopic(topics[0]);
    } else if (topics.length === 0) {
      setTopic('');
    }
  }, [topics, topic]);

  const handleGenerateNotes = async (selectedTopic: string = topic) => {
    if (!selectedTopic) return;
    setIsLoading(true);
    setStudyMaterial(null);
    setError(null);
    setDeepDiveMaterial(null);
    setIsDeepDiveLoading(false);

    try {
        await markTopicAsStudied(selectedTopic, user?.uid || null);
        const material = await generateStudyNotes(selectedTopic, language);
        setStudyMaterial(material);
    } catch (err) {
        setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };
  
  const handleGenerateDeepDive = async () => {
    if (!topic || !isOnline) return;

    setIsDeepDiveLoading(true);
    setError(null);
    try {
        const material = await generateDeepDiveForTopic(topic, language);
        setDeepDiveMaterial(material);
    } catch(err) {
        setError(getSpecificErrorMessage(err));
    }
    setIsDeepDiveLoading(false);
  };

  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: setTopic,
    });
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('Error:')) return <p key={index} className="my-1 font-semibold text-red-600">{line}</p>;
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
            <h2 className="text-2xl font-bold text-slate-800">AI Study Helper</h2>
            <p className="text-slate-500 mt-2">Generate a complete learning package for any topic.</p>
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full flex-grow">
                  <PopupSelector 
                    label="Select a topic"
                    value={topic}
                    placeholder="Select a topic..."
                    onClick={handleTopicSelect}
                    disabled={topics.length === 0}
                  />
                </div>
                <Button onClick={() => handleGenerateNotes()} disabled={isLoading || topics.length === 0} className="w-full sm:w-auto flex-shrink-0 !py-3">
                  {isLoading ? 'Generating...' : 'Get Learning Package'}
                </Button>
            </div>
             {error && <p className="text-orange-600 bg-orange-100 p-3 rounded-md mt-4 text-sm font-medium text-center">{error}</p>}
        </div>
        
        {isLoading && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Preparing your study material...</p>
          </div>
        )}

        {studyMaterial && (
          <div className="mt-6 space-y-4">
            <div className="p-6 border border-slate-200 rounded-xl bg-white">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Study Notes: {topic}</h3>
              <div className="prose prose-slate max-w-none max-h-[50vh] overflow-y-auto pr-3">
                {formatText(studyMaterial.notes)}
              </div>
            </div>

            {studyMaterial.summary && (
              <CollapsibleSection title="Summary">
                {formatText(studyMaterial.summary)}
              </CollapsibleSection>
            )}
            
            {studyMaterial.story && (
              <CollapsibleSection title="Story to Remember">
                {formatText(studyMaterial.story)}
              </CollapsibleSection>
            )}

            {studyMaterial.practiceQuestions && studyMaterial.practiceQuestions.length > 0 && (
              <CollapsibleSection title="Practice Questions">
                  <div className="space-y-2">
                      {studyMaterial.practiceQuestions.map((q, i) => (
                          <QuizItem key={i} question={q.question} answer={q.answer} />
                      ))}
                  </div>
              </CollapsibleSection>
            )}
            
            {!isDeepDiveLoading && !deepDiveMaterial && (
              <div className="mt-8 text-center p-4 bg-teal-50 rounded-lg border-2 border-dashed border-teal-200">
                  <h4 className="font-bold text-teal-800">Need more clarity?</h4>
                  <p className="text-teal-700 text-sm mt-1">Go beyond the notes for 100% understanding.</p>
                  <Button
                      onClick={handleGenerateDeepDive}
                      disabled={!isOnline || isDeepDiveLoading}
                      className="mt-4"
                  >
                      Get a Deep Dive
                  </Button>
              </div>
            )}

            {isDeepDiveLoading && (
                <div className="text-center p-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-600">Generating a Deep Dive analysis...</p>
                </div>
            )}

            {deepDiveMaterial && (
                <DeepDiveDisplay material={deepDiveMaterial} topic={topic} />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudyHelper;
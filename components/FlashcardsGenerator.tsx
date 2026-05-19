
import React, { useState, useEffect } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { Flashcard, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';

interface FlashcardsGeneratorProps {
  topics: string[];
  language: string;
  isOnline: boolean;
  showPopup: (config: PopupConfig) => void;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
  topic: string | null;
  onTopicChange: (topic: string) => void;
  isSyllabusLoading?: boolean;
  onRefresh?: () => void;
}

const FlashcardViewer: React.FC<{ flashcards: Flashcard[], onFinish: () => void }> = ({ flashcards, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    };

    const currentCard = flashcards[currentIndex];

    return (
        <div>
            <div className="text-center mb-4">
                <p className="font-semibold text-slate-600">Card {currentIndex + 1} of {flashcards.length}</p>
            </div>
            <div className="perspective-1000">
                <div
                    className={`relative w-full h-80 rounded-2xl shadow-lg cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className="absolute w-full h-full bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-center p-6 text-center backface-hidden overflow-y-auto">
                        <div className="prose prose-lg max-w-none text-red-800 dark:text-red-300 font-bold"><ContentRenderer content={currentCard.front}/></div>
                    </div>
                    <div className="absolute w-full h-full bg-[#f8fafc] dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl flex items-center justify-center p-6 text-center backface-hidden rotate-y-180 overflow-y-auto">
                        <div className="prose max-w-none text-blue-950 dark:text-blue-200 font-medium text-lg leading-relaxed"><ContentRenderer content={currentCard.back}/></div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-6">
                <Button onClick={handlePrev} variant="secondary" className="!p-3">Prev</Button>
                <Button onClick={() => setIsFlipped(!isFlipped)}>Flip Card</Button>
                <Button onClick={handleNext} variant="secondary" className="!p-3">Next</Button>
            </div>
            <div className="text-center mt-6">
                <Button onClick={onFinish} variant="secondary">End Session</Button>
            </div>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
        </div>
    );
};


const FlashcardsGenerator: React.FC<FlashcardsGeneratorProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth, topic, onTopicChange, isSyllabusLoading, onRefresh }) => {
  const [numCards, setNumCards] = useState(10);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topics.length > 0 && (!topic || !topics.includes(topic))) {
      onTopicChange(topics[0]);
    } else if (topics.length === 0 && topic) {
      onTopicChange('');
    }
  }, [topics, topic, onTopicChange]);

  // Auto-fetch topics if missing and online
  useEffect(() => {
    if (topics.length === 0 && !isSyllabusLoading && isOnline && onRefresh) {
        onRefresh();
    }
  }, [topics.length, isSyllabusLoading, isOnline, onRefresh]);

  const handleGenerate = async () => {
    if (!canAccessPremium) {
        requestAuth();
        return;
    }
    if (!topic) return;

    setIsLoading(true);
    setError(null);
    setFlashcards(null);

    logActivity(user?.uid || null, {
        type: 'FLASHCARDS_GENERATED' as HistoryType,
        description: `Generated ${numCards} flashcards for "${topic}"`,
        view: AppView.FLASHCARDS_GENERATOR,
        context: { topic }
    });

    try {
      const data = await generateFlashcards(topic, numCards, language);
      setFlashcards(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    }
    setIsLoading(false);
  };

  const handleTopicSelect = () => {
    showPopup({
        title: 'Select a Topic',
        options: topics.map(t => ({ value: t, label: t })),
        onSelect: onTopicChange,
    });
  };
  
  const reset = () => {
    setFlashcards(null);
    setError(null);
  };
  
  if (!canAccessPremium) {
    return (
        <div className="max-w-2xl mx-auto">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the Flashcards Generator.</p>
                <div className="mt-6">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  if (isLoading) {
    return <Card className="text-center"><h2 className="text-xl font-semibold mb-4">Generating Flashcards...</h2><LoadingSpinner /></Card>;
  }
  
  if (flashcards) {
    return <Card><FlashcardViewer flashcards={flashcards} onFinish={reset} /></Card>;
  }

  if (topics.length === 0) {
      return (
          <div className="max-w-2xl mx-auto">
              <Card className="text-center py-10">
                  {isSyllabusLoading ? (
                      <>
                        <LoadingSpinner />
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Loading your syllabus topics...</p>
                      </>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">No Syllabus Loaded</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We need to load the topics before you can generate flashcards.</p>
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Flashcards Generator</h2>
            <p className="text-slate-500 mt-2">Create a deck of flashcards to study any topic.</p>
        </div>
        <ErrorMessage message={error} onRetry={handleGenerate} />
        <div className="space-y-6 mt-6">
          <PopupSelector label="Topic" value={topic || ''} placeholder="Select a topic..." onClick={handleTopicSelect} disabled={topics.length === 0 || !isOnline} />
          <div>
            <label htmlFor="num-cards" className="block text-sm font-medium text-slate-700">Number of Flashcards: <span className="font-bold text-indigo-700">{numCards}</span></label>
            <input id="num-cards" type="range" min="5" max="20" value={numCards} onChange={e => setNumCards(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2 accent-indigo-600" disabled={!isOnline} />
          </div>
        </div>
        <div className="mt-8">
          <Button onClick={handleGenerate} className="w-full !py-3" disabled={isLoading || !topic || topics.length === 0 || !isOnline}>
            {isLoading ? 'Generating...' : 'Generate Flashcards'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FlashcardsGenerator;

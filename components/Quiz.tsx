
import React, { useState, useEffect } from 'react';
// FIX: Import QuizResult type to resolve compilation error.
import type { Quiz as QuizType, User, HistoryType, QuizQuestion, QuizResult } from '../types';
import { AppView } from '../types';
import Button from './Button';
import Card from './Card';
import ContentRenderer from './ContentRenderer';
import { saveQuizResult, logActivity } from '../utils/tracking';
import { getExplanationForAnswer } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';

const SmallSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>;

interface QuizProps {
  quiz: QuizType;
  topic: string;
  onFinish: (submittedAnswers?: Record<number, string>) => void;
  user: User | null;
  language: string;
  persistenceKey?: string;
}

const QuestionPalette: React.FC<{
    count: number;
    current: number;
    answered: Record<number, string>;
    onSelect: (index: number) => void;
}> = ({ count, current, answered, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2 justify-center p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
            {Array.from({ length: count }).map((_, index) => {
                const isCurrent = index === current;
                const isAnswered = answered[index] !== undefined;
                let classes = 'w-8 h-8 rounded-md text-sm font-semibold flex items-center justify-center transition-all duration-200 ';
                if (isCurrent) {
                    classes += 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-110 ';
                }
                if (isAnswered) {
                    classes += 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-300';
                } else {
                    classes += 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300';
                }

                return (
                    <button key={index} onClick={() => onSelect(index)} className={classes} aria-label={`Go to question ${index + 1}`}>
                        {index + 1}
                    </button>
                );
            })}
        </div>
    );
};

const ReviewQuestion: React.FC<{
    question: QuizQuestion;
    userAnswer: string;
    index: number;
    user: User | null;
    language: string;
}> = ({ question, userAnswer, index, user, language }) => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

    const getExplanation = async () => {
        if (!user) {
            setExplanation("Please sign in to get explanations.");
            return;
        }
        setIsLoadingExplanation(true);
        try {
            const exp = await getExplanationForAnswer(question, question.correctAnswer, language);
            setExplanation(exp);
        } catch (e) {
            setExplanation(getSpecificErrorMessage(e));
        } finally {
            setIsLoadingExplanation(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 break-words">
            <div className="prose prose-slate dark:prose-invert max-w-none mb-4">
                <ContentRenderer content={`**${index + 1}.** ${question.question}`} />
            </div>
            <div className="space-y-2">
                {question.options.map(option => {
                    const isCorrect = option === question.correctAnswer;
                    const isUserAnswer = option === userAnswer;
                    let classes = 'p-3 rounded-lg border text-sm ';

                    if (isCorrect) {
                        classes += 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-700 text-green-800 dark:text-green-200 font-semibold';
                    } else if (isUserAnswer && !isCorrect) {
                        classes += 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 line-through';
                    } else {
                        classes += 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300';
                    }
                    return <div key={option} className={classes}><ContentRenderer content={option} /></div>;
                })}
            </div>
            <div className="mt-4">
                {!explanation && !isLoadingExplanation && (
                    <Button onClick={getExplanation} variant="secondary" className="!text-xs !py-1 !px-3" disabled={!user}>
                       {user ? 'Show COC AI Explanation' : 'Sign in for Explanations'}
                    </Button>
                )}
                {isLoadingExplanation && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <SmallSpinner />
                        <span>COC AI is thinking...</span>
                    </div>
                )}
                {explanation && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg animate-fade-in-fast">
                        <ContentRenderer content={explanation} className="prose prose-sm max-w-none text-slate-700 dark:prose-invert" />
                    </div>
                )}
            </div>
        </div>
    );
};

const Quiz: React.FC<QuizProps> = ({ quiz, topic, onFinish, user, language, persistenceKey }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (!persistenceKey) return 0;
    try {
        const saved = localStorage.getItem(persistenceKey);
        if (saved) {
            const progress = JSON.parse(saved);
            if (progress.quizTitle === quiz.title) {
                return progress.currentQuestionIndex || 0;
            }
        }
    } catch (e) { console.error("Failed to load quiz progress (index):", e); }
    return 0;
  });

  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, string>>(() => {
      if (!persistenceKey) return {};
      try {
          const saved = localStorage.getItem(persistenceKey);
          if (saved) {
              const progress = JSON.parse(saved);
              if (progress.quizTitle === quiz.title) {
                  return progress.submittedAnswers || {};
              }
          }
      } catch (e) { console.error("Failed to load quiz progress (answers):", e); }
      return {};
  });

  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, { [option: string]: string }>>({});
  const [isExplanationLoading, setIsExplanationLoading] = useState<string | null>(null);
  const [visibleExplanation, setVisibleExplanation] = useState<string | null>(null);

  useEffect(() => {
    if (persistenceKey) {
        try {
            const progress = { currentQuestionIndex, submittedAnswers, quizTitle: quiz.title };
            localStorage.setItem(persistenceKey, JSON.stringify(progress));
        } catch (e) { console.error("Failed to save quiz progress:", e); }
    }
  }, [currentQuestionIndex, submittedAnswers, persistenceKey, quiz.title]);

  useEffect(() => {
      const alreadyAnswered = submittedAnswers[currentQuestionIndex];
      if (alreadyAnswered) {
          setSelectedOption(alreadyAnswered);
          setIsSubmitted(true);
      } else {
          setSelectedOption(null);
          setIsSubmitted(false);
      }
      setVisibleExplanation(null);
  }, [currentQuestionIndex, submittedAnswers]);


  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Quiz Generation Error</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">COC AI couldn't create questions for this topic. Please try again or choose another topic.</p>
        <Button onClick={() => onFinish()}>Return</Button>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => { if (!isSubmitted) setSelectedOption(option); };
  
  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    setSubmittedAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOption }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const handleWhyClick = async (option: string) => {
    if (visibleExplanation === option) { setVisibleExplanation(null); return; }
    setVisibleExplanation(option);
    if (explanations[currentQuestionIndex]?.[option] || isExplanationLoading === option) return;
    if (!user) {
        setExplanations(prev => ({ ...prev, [currentQuestionIndex]: { ...(prev[currentQuestionIndex] || {}), [option]: "Please sign in to get COC AI-powered explanations." } }));
        return;
    }
    setIsExplanationLoading(option);
    try {
        const explanationText = await getExplanationForAnswer(currentQuestion, option, language);
        setExplanations(prev => ({ ...prev, [currentQuestionIndex]: { ...(prev[currentQuestionIndex] || {}), [option]: explanationText } }));
    } catch (e) {
        setExplanations(prev => ({ ...prev, [currentQuestionIndex]: { ...(prev[currentQuestionIndex] || {}), [option]: getSpecificErrorMessage(e) } }));
    }
    setIsExplanationLoading(null);
  };

  // FIX: Calculate score by iterating over questions to ensure correct index matching and type safety.
  const score = quiz.questions.reduce((acc, q, index) => {
      const userAnswer = submittedAnswers[index];
      return userAnswer === q.correctAnswer ? acc + 1 : acc;
  }, 0);
  
  if (showResults && !resultsSaved) {
      const resultData: QuizResult = { topic: topic, score, totalQuestions: quiz.questions.length, date: new Date().toISOString() };
      saveQuizResult(resultData, user?.uid || null);
      logActivity(user?.uid || null, {
        type: 'QUIZ_COMPLETED' as HistoryType,
        description: `Completed quiz on "${topic}" (${score}/${quiz.questions.length})`,
        view: AppView.QUIZ,
        context: { topic }
      });
      setResultsSaved(true);
  }

  if (showResults) {
    const percentage = quiz.questions.length > 0 ? Math.round((score / quiz.questions.length) * 100) : 0;
    return (
      <Card>
        {reviewMode ? (
            <div>
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Review Answers</h2>
                    <Button onClick={() => setReviewMode(false)} variant="secondary">Back to Summary</Button>
                </div>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto p-2 -m-2">
                    {quiz.questions.map((q, i) => (
                        <ReviewQuestion key={i} question={q} userAnswer={submittedAnswers[i]} index={i} user={user} language={language} />
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Quiz Completed!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Topic: {topic}</p>
                <p className="text-5xl sm:text-7xl font-extrabold text-blue-600 mb-2">{score} <span className="text-3xl sm:text-4xl text-slate-500 dark:text-slate-400">/ {quiz.questions.length}</span></p>
                <p className="text-xl sm:text-2xl font-semibold mb-8 text-slate-700 dark:text-slate-300">{percentage}%</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => setReviewMode(true)}>Review Answers</Button>
                    <Button onClick={() => { if(persistenceKey) localStorage.removeItem(persistenceKey); onFinish(submittedAnswers); }} variant="secondary">Finish & Exit Quiz</Button>
                </div>
            </div>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Topic: {topic}</p>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
      </div>
      <div className="prose max-w-none break-words text-xl font-medium text-red-800 dark:text-red-300">
        <ContentRenderer content={currentQuestion.question} />
        {currentQuestion.questionEnglish && currentQuestion.question.toLowerCase() !== currentQuestion.questionEnglish.toLowerCase() && (
            <p className="text-md text-red-600/80 dark:text-red-300/80 mt-2 italic">({currentQuestion.questionEnglish})</p>
        )}
      </div>
      <div className="space-y-4 mt-8">
        {currentQuestion.options.map((option) => {
          let buttonClasses = 'bg-white dark:bg-slate-700 hover:bg-blue-50/70 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-blue-950 dark:text-blue-100 text-lg';
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = selectedOption === option;

          if (isSubmitted) {
            if (isCorrect) buttonClasses = 'bg-green-100 dark:bg-green-500/10 border-green-500 dark:border-green-500/30 text-green-900 dark:text-green-200 ring-2 ring-green-300 dark:ring-green-500/30 font-bold';
            else if (isSelected && !isCorrect) buttonClasses = 'bg-red-100 dark:bg-red-500/10 border-red-500 dark:border-red-500/30 text-red-900 dark:text-red-200 ring-2 ring-red-300 dark:ring-red-500/30 font-bold';
            else buttonClasses = 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 opacity-60';
          } else if (isSelected) buttonClasses = 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 dark:border-blue-600 ring-2 ring-blue-300 dark:ring-blue-700 text-blue-900 dark:text-blue-100 font-bold';
          
          const englishOption = currentQuestion.optionsEnglish && currentQuestion.optionsEnglish.find(opt => opt.toLowerCase() !== option.toLowerCase());
          const areDifferent = englishOption && option.toLowerCase() !== englishOption.toLowerCase();
          const explanation = explanations[currentQuestionIndex]?.[option];
          const isExplanationVisible = visibleExplanation === option;

          return (
            <div key={option}>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOptionSelect(option)} disabled={isSubmitted} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 break-words ${!isSubmitted ? 'transform hover:scale-[1.02]' : 'cursor-default'} ${buttonClasses}`}>
                      <div className="font-semibold prose prose-slate dark:prose-invert max-w-none"><ContentRenderer content={option} /></div>
                      {areDifferent && <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1 prose prose-slate dark:prose-invert max-w-none"><ContentRenderer content={englishOption} /></span>}
                    </button>
                    {isSubmitted && (
                        <button onClick={() => handleWhyClick(option)} disabled={!user} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 font-bold flex-shrink-0" title={`Why is this ${isCorrect ? 'correct' : 'incorrect'}?`} aria-label={`Get explanation for option ${option}`}>
                           (?)
                        </button>
                    )}
                </div>
                {isExplanationVisible && (
                    <div className="mt-2 ml-4 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg animate-fade-in-fast break-words">
                        {isExplanationLoading === option ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><SmallSpinner /><span>COC AI is thinking...</span></div>
                        ) : ( explanation && <ContentRenderer content={explanation} className="prose prose-base max-w-none text-slate-700 dark:prose-invert" /> )}
                    </div>
                )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 space-y-4">
        <QuestionPalette count={quiz.questions.length} current={currentQuestionIndex} answered={submittedAnswers} onSelect={setCurrentQuestionIndex} />
        <div className="text-right">
            {isSubmitted ? (
                <Button onClick={handleNext}>{currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</Button>
            ) : (
                <Button onClick={handleSubmitAnswer} disabled={!selectedOption}>Submit Answer</Button>
            )}
        </div>
      </div>
      <style>{`.animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; } @keyframes fade-in-fast { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Card>
  );
};

export default Quiz;

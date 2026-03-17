
import React, { useState, useCallback, useEffect } from 'react';
import { generateDiagnosticQuiz, generateAdaptivePath } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { Quiz as QuizType, QuizQuestion, AdaptiveLearningPath as PathType, User, Syllabus, HistoryType, AppView, AdaptiveLearningStep } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Quiz from './Quiz';
import ContentRenderer from './ContentRenderer';

interface AdaptiveLearningPathProps {
    topics: string[];
    language: string;
    isOnline: boolean;
    user: User | null;
    selectionPath: string;
    setView: (view: AppView) => void;
    onStudyTopic: (topic: string, mainTopic?: string) => void;
    setQuizTopic: (topic: string) => void;
    canAccessPremium: boolean;
    requestAuth: () => void;
}

const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
    topics, language, isOnline, user, selectionPath, setView, onStudyTopic, setQuizTopic, canAccessPremium, requestAuth
}) => {
    // v2 key to avoid conflicts with old structure. Specific to user and exam path.
    const persistenceKey = `adaptive_learning_path_v2_${user?.uid || 'guest'}_${selectionPath.replace(/\s/g, '_')}`;
    const quizPersistenceKey = `quiz_state_adaptive_v2_${user?.uid || 'guest'}_${selectionPath.replace(/\s/g, '_')}`;

    const [state, setState] = useState(() => {
        if (isOnline) {
            try {
                const savedState = localStorage.getItem(persistenceKey);
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    if (parsed.stage) { // Basic validation
                        return parsed;
                    }
                }
            } catch (e) {
                console.error("Failed to load saved learning path state:", e);
                localStorage.removeItem(persistenceKey);
            }
        }
        return {
            stage: 'init', // init, loading_quiz, quiz, loading_path, path
            diagnosticQuiz: null,
            learningPath: null,
        };
    });

    const [error, setError] = useState<string | null>(null);
    const { stage, diagnosticQuiz, learningPath } = state;

    const updateState = (newState: Partial<typeof state>) => {
        setState((prev: typeof state) => ({ ...prev, ...newState }));
    };

    useEffect(() => {
        try {
            localStorage.setItem(persistenceKey, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save learning path state:", e);
        }
    }, [state, persistenceKey]);
    
    const handleStartDiagnostic = useCallback(async () => {
        if (!isOnline || !user || topics.length === 0) return;
        updateState({ stage: 'loading_quiz', diagnosticQuiz: null, learningPath: null });
        setError(null);
        try {
            const quiz = await generateDiagnosticQuiz(topics, language, selectionPath);
            updateState({ diagnosticQuiz: quiz, stage: 'quiz' });
        } catch (err) {
            setError(getSpecificErrorMessage(err));
            updateState({ stage: 'init' });
        }
    }, [topics, language, selectionPath, isOnline, user]);

    useEffect(() => {
        if (stage === 'init' && topics.length > 0 && canAccessPremium) {
            handleStartDiagnostic();
        }
    }, [stage, topics, canAccessPremium, handleStartDiagnostic]);

    const handleQuizFinish = useCallback(async (submittedAnswers?: Record<number, string>) => {
        if (!state.diagnosticQuiz || !submittedAnswers || !user) {
            updateState({ stage: 'init' });
            return;
        }
        localStorage.removeItem(quizPersistenceKey);
        updateState({ stage: 'loading_path' });
        setError(null);

        const quizResults = state.diagnosticQuiz.questions.map((q: QuizQuestion, index: number) => ({
            question: q,
            userAnswer: submittedAnswers[index],
            isCorrect: submittedAnswers[index] === q.correctAnswer
        }));

        logActivity(user.uid, {
            type: 'ADAPTIVE_PATH_GENERATED' as HistoryType,
            description: `Generated a learning path for "${selectionPath}"`,
            view: 'ADAPTIVE_LEARNING_PATH' as AppView,
            context: { examPath: selectionPath }
        });

        try {
            // Pass !user as isTrial
            const path = await generateAdaptivePath(selectionPath, quizResults, language, !user);
            updateState({ learningPath: path, stage: 'path' });
        } catch (err) {
            setError(getSpecificErrorMessage(err));
            updateState({ stage: 'init' });
        }
    }, [state.diagnosticQuiz, language, user, selectionPath, quizPersistenceKey]);
    
    const handlePathAction = (step: AdaptiveLearningStep) => {
        const { action, topic, subject } = step;
        switch(action) {
            case 'Review Concept':
            case 'Deep Dive':
                onStudyTopic(topic, subject);
                break;
            case 'Practice Questions':
            case 'Final Quiz':
                setQuizTopic(topic);
                setView('QUIZ' as AppView);
                break;
            default:
                onStudyTopic(topic, subject);
                break;
        }
    };

    const handleResetAndStartNew = () => {
        localStorage.removeItem(persistenceKey);
        localStorage.removeItem(quizPersistenceKey);
        setState({
            stage: 'init',
            diagnosticQuiz: null,
            learningPath: null,
        });
        setError(null);
    };

    if (!canAccessPremium) {
        return (
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Your trial has ended. Please sign up or log in to use the Adaptive Learning Path.
                </p>
                <div className="mt-8">
                    <Button onClick={requestAuth}>Sign Up / Log In</Button>
                </div>
            </Card>
        );
    }

    const renderInit = () => (
        <Card>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Adaptive Learning Path</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
                    Get a personalized study plan for <strong>{selectionPath}</strong>. We'll start with a short diagnostic quiz to assess your knowledge.
                </p>
                <ErrorMessage message={error} onRetry={handleStartDiagnostic} />
                <div className="mt-8 flex justify-center items-center gap-3">
                    {topics.length > 0 && user && isOnline ? (
                        <>
                            <LoadingSpinner />
                            <p className="text-slate-600 dark:text-slate-300">Preparing your diagnostic quiz...</p>
                        </>
                    ) : (
                        <p className="text-red-500 font-semibold">
                            {!user ? "Please sign in to start." : !isOnline ? "Please connect to the internet." : "Syllabus not loaded. Please select an exam on the dashboard."}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );

    const renderLoading = (message: string) => (
        <Card className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">{message}</p>
        </Card>
    );

    const renderQuiz = () => (
        diagnosticQuiz && user && (
            <Quiz
                quiz={diagnosticQuiz}
                topic={`Diagnostic: ${selectionPath}`}
                onFinish={handleQuizFinish}
                user={user}
                language={language}
                persistenceKey={quizPersistenceKey}
            />
        )
    );

    const renderPath = () => (
        learningPath && (
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center text-center sm:text-left mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{learningPath.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{learningPath.initialAssessment}</p>
                    </div>
                     <Button onClick={handleResetAndStartNew} variant="secondary" className="mt-4 sm:mt-0 flex-shrink-0">Start New Path</Button>
                </div>
                <div className="space-y-4">
                    {learningPath.steps.map(step => (
                        <div key={step.step} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-indigo-400">
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Step {step.step}: {step.action}</p>
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1">{step.topic} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({step.subject})</span></h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{step.rationale}</p>
                            <div className="mt-3">
                                <Button onClick={() => handlePathAction(step)} variant="secondary" className="!text-xs !py-1 !px-3">
                                    {step.action.includes('Quiz') || step.action.includes('Questions') ? 'Start Quiz' : 'Study Now'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )
    );

    switch (stage) {
        case 'init': return renderInit();
        case 'loading_quiz': return renderLoading('Generating your diagnostic quiz...');
        case 'quiz': return renderQuiz();
        case 'loading_path': return renderLoading('Analyzing your results and creating your learning path...');
        case 'path': return renderPath();
        default: return renderInit();
    }
};

export default AdaptiveLearningPath;

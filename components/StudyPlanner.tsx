

import React, { useState, useEffect } from 'react';
import { getTrackingData } from '../utils/tracking';
import { generateStudyPlan, getSpecificErrorMessage } from '../services/geminiService';
// Import AppView as a value, not a type, because it's an enum used at runtime.
import { AppView, type PerformanceSummary, type StudyPlan, type User } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { BeakerIcon } from './icons/BeakerIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface StudyPlannerProps {
    setView: (view: AppView) => void;
    setPreselectedTopic: (topic: string) => void;
    selectionPath: string;
    availableTopics: string[];
    language: string;
    isOnline: boolean;
    user: User | null;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ setView, setPreselectedTopic, selectionPath, availableTopics, language, isOnline, user }) => {
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [performanceData, setPerformanceData] = useState<Omit<PerformanceSummary, 'topicsStudied' | 'studyStreak'> | null>(null);

    useEffect(() => {
        const loadPerformanceData = async () => {
            const data = await getTrackingData(user?.uid || null);
            const topicScores: Record<string, { totalScore: number; totalAttempts: number; totalPossible: number }> = {};
            data.quizHistory.forEach(result => {
                if (!topicScores[result.topic]) topicScores[result.topic] = { totalScore: 0, totalAttempts: 0, totalPossible: 0 };
                topicScores[result.topic].totalScore += result.score;
                topicScores[result.topic].totalAttempts += 1;
                topicScores[result.topic].totalPossible += result.totalQuestions;
            });

            const masteredTopics: string[] = [];
            const weakTopics: string[] = [];
            for (const topic in topicScores) {
                const d = topicScores[topic];
                const avg = d.totalPossible > 0 ? (d.totalScore / d.totalPossible) : 0;
                if (d.totalAttempts >= 2 && avg >= 0.8) masteredTopics.push(topic);
                if (d.totalAttempts >= 2 && avg < 0.6) weakTopics.push(topic);
            }

            const totalQuizzes = data.quizHistory.length;
            const totalScore = data.quizHistory.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0);
            const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
            
            setPerformanceData({ totalQuizzes, averageScore, masteredTopics, weakTopics });
        };

        loadPerformanceData();
    }, [user]);

    const handleGeneratePlan = async () => {
        if (!performanceData) return;
        setIsLoading(true);
        setError(null);
        setStudyPlan(null);
        try {
            const plan = await generateStudyPlan(performanceData, selectionPath, availableTopics, language);
            setStudyPlan(plan);
        } catch(err) {
            setError(getSpecificErrorMessage(err));
        }
        setIsLoading(false);
    };

    const handleTaskClick = (topic: string, activity: 'Study Notes' | 'Take Quiz') => {
        setPreselectedTopic(topic);
        if (activity === 'Study Notes') {
            setView(AppView.STUDY_HELPER);
        } else {
            setView(AppView.QUIZ);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">AI Study Planner</h2>
                    <p className="text-slate-500 mt-2">Get a personalized 5-day study plan based on your performance.</p>
                </div>

                {!studyPlan && (
                    <div className="mt-8 text-center">
                        <Button onClick={handleGeneratePlan} disabled={isLoading || !isOnline || !performanceData} className="!py-3 px-8">
                            {isLoading ? 'Generating Your Plan...' : 'Generate My Plan'}
                        </Button>
                        {isLoading && <div className="mt-4"><LoadingSpinner/></div>}
                        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mt-4 text-sm font-medium">{error}</p>}
                    </div>
                )}

                {studyPlan && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-center text-indigo-700 mb-6">{studyPlan.title}</h3>
                        <div className="space-y-4">
                            {studyPlan.plan.map((task, index) => (
                                <div key={index} className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-lg">
                                    <p className="text-sm font-semibold text-slate-500">{task.day}</p>
                                    <p className="text-lg font-bold text-slate-800 mt-1">{task.topic}</p>
                                    <p className="text-sm text-slate-600 mt-2 italic">"{task.reason}"</p>
                                    <div className="mt-4">
                                        <button onClick={() => handleTaskClick(task.topic, task.activity)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5">
                                            {task.activity === 'Study Notes' ? <BookOpenIcon className="w-4 h-4" /> : <BeakerIcon className="w-4 h-4" />}
                                            <span>{task.activity}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Button onClick={handleGeneratePlan} variant="secondary" disabled={isLoading || !isOnline}>
                                {isLoading ? 'Regenerating...' : 'Regenerate Plan'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StudyPlanner;
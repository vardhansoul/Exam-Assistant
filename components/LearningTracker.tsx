import React, { useState, useEffect } from 'react';
import { getTrackingData } from '../utils/tracking';
import type { LearningProgress, QuizResult } from '../types';
import Card from './Card';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface WeakArea {
    topic: string;
    averageScore: number;
    attempts: number;
}

interface TimeInsights {
    streak: number;
    weeklyActivity: number[]; // Mon -> Sun
    mostActiveDay: string;
}

const LearningTracker: React.FC = () => {
    const [progress, setProgress] = useState<LearningProgress>({ studiedTopics: [], quizHistory: [] });
    const [masteredTopics, setMasteredTopics] = useState<Set<string>>(new Set());
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
    const [timeInsights, setTimeInsights] = useState<TimeInsights | null>(null);

    useEffect(() => {
        const data = getTrackingData();
        setProgress(data);

        // --- Mastery Calculation ---
        const calculateMastery = (quizHistory: QuizResult[]): Set<string> => {
            const topicScores: Record<string, { totalScore: number; totalAttempts: number; totalPossible: number }> = {};
            quizHistory.forEach(result => {
                if (!topicScores[result.topic]) {
                    topicScores[result.topic] = { totalScore: 0, totalAttempts: 0, totalPossible: 0 };
                }
                topicScores[result.topic].totalScore += result.score;
                topicScores[result.topic].totalAttempts += 1;
                topicScores[result.topic].totalPossible += result.totalQuestions;
            });
            const mastered = new Set<string>();
            for (const topic in topicScores) {
                const d = topicScores[topic];
                if (d.totalAttempts >= 2 && (d.totalScore / d.totalPossible) >= 0.8) {
                    mastered.add(topic);
                }
            }
            return mastered;
        };
        setMasteredTopics(calculateMastery(data.quizHistory));

        // --- Weak Area Detection ---
        const calculateWeakAreas = (quizHistory: QuizResult[]): WeakArea[] => {
            const topicData: Record<string, { totalScore: number; totalPossible: number; count: number }> = {};
            quizHistory.forEach(result => {
                if (!topicData[result.topic]) {
                    topicData[result.topic] = { totalScore: 0, totalPossible: 0, count: 0 };
                }
                topicData[result.topic].totalScore += result.score;
                topicData[result.topic].totalPossible += result.totalQuestions;
                topicData[result.topic].count += 1;
            });
            const weak: WeakArea[] = [];
            for (const topic in topicData) {
                const d = topicData[topic];
                const averageScore = d.totalPossible > 0 ? (d.totalScore / d.totalPossible) : 0;
                // Weak if attempted at least twice with an average score below 60%
                if (d.count >= 2 && averageScore < 0.6) {
                    weak.push({ topic, averageScore: Math.round(averageScore * 100), attempts: d.count });
                }
            }
            return weak.sort((a, b) => a.averageScore - b.averageScore);
        };
        setWeakAreas(calculateWeakAreas(data.quizHistory));

        // --- Time Management Insights ---
        const calculateTimeInsights = (quizHistory: QuizResult[]): TimeInsights => {
            if (quizHistory.length === 0) {
                return { streak: 0, weeklyActivity: Array(7).fill(0), mostActiveDay: 'N/A' };
            }

            // Streak Calculation
            const quizDates = new Set(quizHistory.map(q => new Date(q.date).toISOString().split('T')[0]));
            let streak = 0;
            if (quizDates.size > 0) {
                let currentDate = new Date();
                while (quizDates.has(currentDate.toISOString().split('T')[0])) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                }
            }

            // Weekly Activity (Last 7 days, Mon -> Sun)
            const weeklyActivity = Array(7).fill(0);
            const today = new Date();
            const last7DaysStart = new Date();
            last7DaysStart.setDate(today.getDate() - 6);
            
            quizHistory.forEach(q => {
                const qDate = new Date(q.date);
                if (qDate >= last7DaysStart && qDate <= today) {
                    const dayIndex = (qDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6
                    weeklyActivity[dayIndex]++;
                }
            });


            // Most Active Day
            const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun -> Sat
            quizHistory.forEach(q => {
                const dayIndex = new Date(q.date).getDay();
                dayCounts[dayIndex]++;
            });
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const maxCount = Math.max(...dayCounts);
            const mostActiveDay = maxCount > 0 ? days[dayCounts.indexOf(maxCount)] : 'N/A';
            
            return { streak, weeklyActivity, mostActiveDay };
        };
        setTimeInsights(calculateTimeInsights(data.quizHistory));

    }, []);

    const renderQuizHistory = () => {
        if (progress.quizHistory.length === 0) {
            return <p className="text-center text-gray-500 bg-slate-50 p-4 rounded-lg">No quiz history yet. Take a quiz to see your results here!</p>;
        }
        return (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {progress.quizHistory.map((result: QuizResult, index: number) => {
                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                    let progressBarColor = 'bg-green-500';
                    if (percentage < 50) {
                        progressBarColor = 'bg-red-500';
                    } else if (percentage < 80) {
                        progressBarColor = 'bg-yellow-500';
                    }

                    return (
                        <div key={index} className="bg-slate-100 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <p className="font-semibold text-gray-800 truncate" title={result.topic}>{result.topic}</p>
                                    <p className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                   <p className={`text-lg font-bold ${percentage >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {result.score}/{result.totalQuestions}
                                    </p>
                                    <p className="text-sm text-gray-500">{percentage}%</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    
    const renderStudiedTopics = () => {
        if (progress.studiedTopics.length === 0) {
            return <p className="text-center text-gray-500 bg-slate-50 p-4 rounded-lg">You haven't studied any topics yet. Use the Study Helper to learn!</p>;
        }
        return (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {progress.studiedTopics.map(topic => (
                     <div key={topic} className="bg-slate-100 p-3 rounded-lg flex items-center justify-between">
                        <p className="font-medium text-gray-700">{topic}</p>
                         {masteredTopics.has(topic) && (
                            <div className="flex items-center gap-1 text-green-600" title="Mastered!">
                                <CheckBadgeIcon className="w-5 h-5" />
                                <span className="text-xs font-bold">Mastered</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderWeakAreas = () => {
        if (weakAreas.length === 0) {
            return <p className="text-center text-gray-500 bg-green-50 p-4 rounded-lg">Great job! No consistent weak areas found. Keep up the good work!</p>;
        }
        return (
            <div className="space-y-3">
                {weakAreas.map(area => (
                    <div key={area.topic} className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-800">{area.topic}</p>
                            <p className="text-sm font-bold text-orange-600">Avg. Score: {area.averageScore}%</p>
                        </div>
                         <p className="text-xs text-gray-500 mt-1">{area.attempts} attempts</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderTimeInsights = () => {
        if (!timeInsights) return null;
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const maxActivity = Math.max(...timeInsights.weeklyActivity, 1);
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">🔥 {timeInsights.streak}</p>
                        <p className="text-sm font-medium text-gray-600">Day Streak</p>
                    </div>
                     <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-xl font-bold text-purple-600">{timeInsights.mostActiveDay}</p>
                        <p className="text-sm font-medium text-gray-600">Most Productive Day</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Weekly Activity (Last 7 Days)</h4>
                    <div className="flex justify-around items-end bg-gray-50 p-4 rounded-lg h-32">
                        {timeInsights.weeklyActivity.map((count, index) => (
                             <div key={index} className="flex flex-col items-center">
                                <div 
                                    className="w-6 bg-indigo-300 rounded-t-md hover:bg-indigo-500 transition-all"
                                    style={{ height: `${(count / maxActivity) * 100}%` }}
                                    title={`${count} quizzes`}
                                ></div>
                                <span className="text-xs font-bold text-gray-500 mt-1">{days[index]}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Progress & Insights</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Analysis */}
                <div className="space-y-8">
                     <div>
                        <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                            <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-orange-500"/>
                            Weak Area Detection
                        </h3>
                        {renderWeakAreas()}
                    </div>
                    <div>
                        <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                            <ClockIcon className="w-6 h-6 mr-2 text-blue-500"/>
                            Time Management Insights
                        </h3>
                        {renderTimeInsights()}
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="space-y-8">
                     <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Quiz History</h3>
                        {renderQuizHistory()}
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Studied Topics ({progress.studiedTopics.length})</h3>
                        {renderStudiedTopics()}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default LearningTracker;

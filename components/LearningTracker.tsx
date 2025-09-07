import React, { useState, useEffect } from 'react';
import { getTrackingData } from '../utils/tracking';
import type { LearningProgress, QuizResult } from '../types';
import Card from './Card';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

const LearningTracker: React.FC = () => {
    const [progress, setProgress] = useState<LearningProgress>({ studiedTopics: [], quizHistory: [] });
    const [masteredTopics, setMasteredTopics] = useState<Set<string>>(new Set());

    useEffect(() => {
        const data = getTrackingData();
        setProgress(data);

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
                const data = topicScores[topic];
                // Mastery condition: At least 2 attempts and average score >= 80%
                if (data.totalAttempts >= 2 && (data.totalScore / data.totalPossible) >= 0.8) {
                    mastered.add(topic);
                }
            }
            return mastered;
        };

        setMasteredTopics(calculateMastery(data.quizHistory));
    }, []);

    const totalStudied = progress.studiedTopics.length;

    const renderQuizHistory = () => {
        if (progress.quizHistory.length === 0) {
            return <p className="text-gray-500">No quiz history yet. Take a quiz to see your results here!</p>;
        }
        return (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
        if (totalStudied === 0) {
            return <p className="text-gray-500">You haven't studied any topics yet. Visit the Topic Explorer to get started!</p>;
        }
        return (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
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
        )
    }

    return (
        <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Your Learning Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Studied Micro-Topics ({totalStudied})</h3>
                    {renderStudiedTopics()}
                </div>
                 <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Quiz History</h3>
                    {renderQuizHistory()}
                </div>
            </div>
        </Card>
    );
};

export default LearningTracker;
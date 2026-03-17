import React from 'react';
import type { User } from '../types';
import Card from './Card';

interface PaperFoldingPracticeProps {
    language: string;
    isOnline: boolean;
    user: User | null;
}

const PaperFoldingPractice: React.FC<PaperFoldingPracticeProps> = ({ language, isOnline, user }) => {
    return (
        <Card>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Paper Cutting & Folding Practice</h2>
                <p className="text-slate-500 mt-2">This feature is coming soon!</p>
            </div>
        </Card>
    );
};

export default PaperFoldingPractice;

import React from 'react';
import type { User } from '../types';
import Card from './Card';

interface MirrorImagePracticeProps {
    language: string;
    isOnline: boolean;
    user: User | null;
}

const MirrorImagePractice: React.FC<MirrorImagePracticeProps> = ({ language, isOnline, user }) => {
    return (
        <Card>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Mirror Image Practice</h2>
                <p className="text-slate-500 mt-2">This feature is coming soon!</p>
            </div>
        </Card>
    );
};

export default MirrorImagePractice;

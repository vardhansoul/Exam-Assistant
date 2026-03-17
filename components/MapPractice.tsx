import React from 'react';
import Card from './Card';
import { User } from '../types';

interface MapPracticeProps {
    user: User | null;
}

const MapPractice: React.FC<MapPracticeProps> = ({ user }) => {
    return (
        <Card>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Map Practice</h2>
                <p className="text-slate-500 mt-2">Interactive map practice is coming soon!</p>
                <div className="mt-8 p-8 bg-slate-100 rounded-lg">
                    <p className="text-slate-400">Map placeholder</p>
                </div>
            </div>
        </Card>
    );
};

export default MapPractice;

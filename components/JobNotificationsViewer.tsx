

import React, { useState, useEffect, useCallback } from 'react';
import { fetchLatestJobNotifications, getSpecificErrorMessage } from '../services/geminiService';
import type { JobNotification } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface JobNotificationsViewerProps {
  language: string;
  isOnline: boolean;
  onBack: () => void;
}

const JobNotificationsViewer: React.FC<JobNotificationsViewerProps> = ({ language, isOnline, onBack }) => {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!isOnline) {
      setError("You are offline. Please connect to view the latest job notifications.");
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchLatestJobNotifications(language);
      setNotifications(data);
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [language, isOnline]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="flex items-center justify-between gap-4 mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="secondary" className="!p-2.5 !rounded-full">
              Back
            </Button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Latest Job Notifications</h2>
              <p className="text-sm text-slate-500">Real-time updates from national & state sources.</p>
            </div>
          </div>
          <Button onClick={fetchJobs} variant="secondary" className="!p-2.5 !rounded-full" disabled={isLoading}>
            Refresh
          </Button>
        </div>

        {isLoading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
        
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        
        {!isLoading && !error && notifications.length === 0 && (
          <p className="text-slate-500 text-center py-8">Could not find any recent job notifications. Please try again later.</p>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((job, index) => (
              <a 
                key={index}
                href={job.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-bold text-indigo-700 truncate">{job.postName}</h3>
                <p className="text-sm font-semibold text-slate-700">{job.organization}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                  <span><strong>Vacancies:</strong> {job.vacancies}</span>
                  <span><strong>Last Date:</strong> {job.lastDate}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default JobNotificationsViewer;
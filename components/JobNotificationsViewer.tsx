
import React, { useState, useEffect, useCallback, memo } from 'react';
import { fetchLatestJobNotifications } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { JobNotification, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner, { Skeleton } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface JobNotificationsViewerProps {
  language: string;
  isOnline: boolean;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
  onSelectJob: (job: JobNotification) => void;
}

const JobSkeleton = () => (
    <div className="block p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
            </div>
            <Skeleton className="w-24 h-8 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
        </div>
    </div>
);

const JobCard = memo(({ job, onSelect }: { job: JobNotification; onSelect: (job: JobNotification) => void }) => (
    <div 
        onClick={() => onSelect(job)}
        className="block p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer text-left w-full break-words gpu-accelerated"
    >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{job.postName}</h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{job.organization}</p>
            </div>
            <div className="flex-shrink-0 self-start">
                <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs px-3 py-1.5 rounded-full font-bold border border-green-200 dark:border-green-800">
                    {job.vacancies} Vacancies
                </span>
            </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col justify-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/50">
                <span className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Eligibility</span>
                <span className="text-amber-900 dark:text-amber-200 text-sm leading-snug">{job.eligibility}</span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 text-xs uppercase tracking-wide">Start Date</span>
                    <span className="text-blue-900 dark:text-blue-200 font-medium">{job.startDate || 'Active'}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800/50">
                    <span className="font-semibold text-rose-700 dark:text-rose-400 text-xs uppercase tracking-wide">End Date</span>
                    <span className="text-blue-900 dark:text-blue-200 font-medium">{job.lastDate}</span>
                </div>
            </div>
        </div>
    </div>
));

const JobNotificationsViewer: React.FC<JobNotificationsViewerProps> = ({ language, isOnline, user, canAccessPremium, requestAuth, onSelectJob }) => {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setError(null);

    if (!canAccessPremium) {
        setError("Please sign in or start a trial to view job notifications.");
        setIsLoading(false);
        return;
    }

    if (isManualRefresh && user) {
        logActivity(user.uid, {
            type: 'JOB_NOTIFICATIONS_VIEWED' as HistoryType,
            description: `Checked for job notifications`,
            view: AppView.JOB_NOTIFICATIONS,
            context: {}
        });
    }

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
  }, [language, isOnline, user, canAccessPremium]);

  useEffect(() => {
    if (canAccessPremium) {
        fetchJobs();
        if (user) {
            logActivity(user.uid, {
                type: 'JOB_NOTIFICATIONS_VIEWED' as HistoryType,
                description: `Viewed job notifications`,
                view: AppView.JOB_NOTIFICATIONS,
                context: {}
            });
        }
    }
  }, [user, fetchJobs, canAccessPremium]);

  if (!canAccessPremium) {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to view Job Notifications.</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button onClick={requestAuth}>Sign Up / Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Latest Job Notifications</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Top government job openings sorted by vacancy count.</p>
            </div>
          </div>
          <Button onClick={() => fetchJobs(true)} variant="secondary" className="!p-2.5 !rounded-full sm:self-start self-end" disabled={isLoading}>
            Refresh
          </Button>
        </div>

        {isLoading && (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <JobSkeleton key={i} />)}
            </div>
        )}
        
        <div className="text-center">
            <ErrorMessage message={error} onRetry={() => fetchJobs(true)} />
        </div>
        
        {!isLoading && !error && notifications.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">Could not find any recent job notifications. Please try again later.</p>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((job, index) => (
              <JobCard key={index} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        )}
      </Card>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default JobNotificationsViewer;

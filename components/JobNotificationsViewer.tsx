
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { fetchLatestJobNotifications, fetchLatestAdmitCards, fetchLatestResults } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import type { JobNotification, AdmitCardNotification, ResultNotification, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner, { Skeleton } from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ArrowPathIcon from './icons/ArrowPathIcon';

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

const JobCard = memo(({ job, onSelect }: { job: JobNotification; onSelect: (job: JobNotification) => void }) => {
    // Check if expiry is near (within 7 days)
    const isExpiringSoon = useMemo(() => {
        if (!job.lastDate) return false;
        const expiry = new Date(job.lastDate);
        if (isNaN(expiry.getTime())) return false;
        const diffTime = expiry.getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    }, [job.lastDate]);

    return (
    <div 
        onClick={() => onSelect(job)}
        className="block p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer text-left w-full break-words gpu-accelerated relative overflow-hidden"
    >
        {isExpiringSoon && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                Expiring Soon
            </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                    {job.level && (
                        <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                            {job.level}
                        </span>
                    )}
                    {job.state && job.state !== 'All India' && (
                        <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                            {job.state}
                        </span>
                    )}
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{job.postName}</h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{job.organization} {job.department ? `(${job.department})` : ''}</p>
            </div>
            <div className="flex-shrink-0 self-start mt-2 sm:mt-0">
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
                    <span className={`font-medium ${isExpiringSoon ? 'text-red-600 dark:text-red-400 font-bold' : 'text-blue-900 dark:text-blue-200'}`}>{job.lastDate}</span>
                </div>
            </div>
        </div>
    </div>
    );
});

const AdmitCardCard = memo(({ admitCard }: { admitCard: AdmitCardNotification }) => (
    <div className="block p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 text-left w-full relative overflow-hidden">
        <div className="flex flex-wrap gap-2 mb-2">
            {admitCard.level && (
                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                    {admitCard.level}
                </span>
            )}
            {admitCard.state && admitCard.state !== 'All India' && (
                <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                    {admitCard.state}
                </span>
            )}
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{admitCard.examName}</h3>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{admitCard.organization}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50 text-center">
                <span className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Released</span>
                <span className="text-blue-900 dark:text-blue-200 font-medium">{admitCard.releaseDate}</span>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/50 text-center">
                <span className="block text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Exam Date</span>
                <span className="text-purple-900 dark:text-purple-200 font-medium">{admitCard.examDate || 'TBA'}</span>
            </div>
        </div>
        
        {admitCard.link && (
            <a 
                href={admitCard.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
            >
                Download Admit Card
            </a>
        )}
    </div>
));

const ResultCard = memo(({ result }: { result: ResultNotification }) => (
    <div className="block p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 text-left w-full relative overflow-hidden">
        <div className="flex flex-wrap gap-2 mb-2">
            {result.level && (
                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                    {result.level}
                </span>
            )}
            {result.state && result.state !== 'All India' && (
                <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                    {result.state}
                </span>
            )}
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{result.examName}</h3>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{result.organization}</p>
        
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50 text-center">
            <span className="block text-[10px] uppercase font-bold text-green-600 dark:text-green-400">Result Date</span>
            <span className="text-green-900 dark:text-green-200 font-medium">{result.resultDate}</span>
        </div>
        
        {result.link && (
            <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
            >
                Check Result
            </a>
        )}
    </div>
));

type ActiveTab = 'jobs' | 'admit-cards' | 'results';

const JobNotificationsViewer: React.FC<JobNotificationsViewerProps> = ({ language, isOnline, user, canAccessPremium, requestAuth, onSelectJob }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCardNotification[]>([]);
  const [results, setResults] = useState<ResultNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  const fetchData = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    setError(null);

    if (!canAccessPremium) {
        setError("Please sign in to view updates.");
        setIsLoading(false);
        return;
    }

    if (isManualRefresh && user) {
        logActivity(user.uid, {
            type: 'JOB_NOTIFICATIONS_VIEWED' as HistoryType,
            description: `Refreshed ${activeTab} notifications`,
            view: AppView.JOB_NOTIFICATIONS,
            context: {}
        });
    }

    if (!isOnline) {
      setError("You are offline. Please connect to view the latest updates.");
      setIsLoading(false);
      return;
    }

    try {
      if (activeTab === 'jobs') {
          const data = await fetchLatestJobNotifications(language);
          setNotifications(data);
      } else if (activeTab === 'admit-cards') {
          const data = await fetchLatestAdmitCards(language);
          setAdmitCards(data);
      } else if (activeTab === 'results') {
          const data = await fetchLatestResults(language);
          setResults(data);
      }
    } catch (err) {
      setError(getSpecificErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [language, isOnline, user, canAccessPremium, activeTab]);

  useEffect(() => {
    if (canAccessPremium) {
        fetchData();
        if (user) {
            logActivity(user.uid, {
                type: 'JOB_NOTIFICATIONS_VIEWED' as HistoryType,
                description: `Viewed ${activeTab} notifications`,
                view: AppView.JOB_NOTIFICATIONS,
                context: {}
            });
        }
    }
  }, [user, fetchData, canAccessPremium, activeTab]);

  // Derived state for filters
  const uniqueStates = useMemo(() => {
      const states = new Set<string>();
      const currentList: any[] = activeTab === 'jobs' ? notifications : activeTab === 'admit-cards' ? admitCards : results;
      currentList.forEach(item => {
          if (item.state && item.state !== 'All India') states.add(item.state);
      });
      return Array.from(states).sort();
  }, [notifications, admitCards, results, activeTab]);

  const uniqueDepartments = useMemo(() => {
      if (activeTab !== 'jobs') return [];
      const depts = new Set<string>();
      notifications.forEach(job => {
          if (job.department) depts.add(job.department);
          else if (job.organization) depts.add(job.organization);
      });
      return Array.from(depts).sort();
  }, [notifications, activeTab]);

  // Apply filters and sort
  const filteredJobs = useMemo(() => {
      let filtered = notifications;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(job => {
          if (!job.lastDate) return true;
          const expiry = new Date(job.lastDate);
          if (isNaN(expiry.getTime())) return true;
          return expiry >= today;
      });
      if (levelFilter !== 'All') filtered = filtered.filter(job => job.level === levelFilter);
      if (stateFilter !== 'All') filtered = filtered.filter(job => job.state === stateFilter);
      if (departmentFilter !== 'All') filtered = filtered.filter(job => job.department === departmentFilter || job.organization === departmentFilter);
      return filtered.sort((a, b) => new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime());
  }, [notifications, levelFilter, stateFilter, departmentFilter]);

  const filteredAdmitCards = useMemo(() => {
      let filtered = admitCards;
      if (levelFilter !== 'All') filtered = filtered.filter(item => item.level === levelFilter);
      if (stateFilter !== 'All') filtered = filtered.filter(item => item.state === stateFilter);
      return filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }, [admitCards, levelFilter, stateFilter]);

  const filteredResults = useMemo(() => {
      let filtered = results;
      if (levelFilter !== 'All') filtered = filtered.filter(item => item.level === levelFilter);
      if (stateFilter !== 'All') filtered = filtered.filter(item => item.state === stateFilter);
      return filtered.sort((a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime());
  }, [results, levelFilter, stateFilter]);

  if (!canAccessPremium) {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to view Updates.</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button onClick={requestAuth}>Log In</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Latest Updates</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Job notifications, admit cards, and results in one place.</p>
          </div>
          <Button onClick={() => fetchData(true)} variant="secondary" className="!p-2.5 !rounded-full sm:self-start self-end flex items-center justify-center gap-2 text-sm" disabled={isLoading} title="Refresh">
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 font-mono overflow-x-auto no-scrollbar">
          {(['jobs', 'admit-cards', 'results'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Filters */}
        {!isLoading && !error && (
            <div className={`grid grid-cols-1 ${activeTab === 'jobs' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700`}>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Level</label>
                    <select 
                        value={levelFilter} 
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">All Levels</option>
                        <option value="Central">Central Govt</option>
                        <option value="State">State Govt</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">State</label>
                    <select 
                        value={stateFilter} 
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">All States</option>
                        {uniqueStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
                {activeTab === 'jobs' && (
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department</label>
                    <select 
                        value={departmentFilter} 
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">All Departments</option>
                        {uniqueDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                )}
            </div>
        )}

        {isLoading && (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <JobSkeleton key={i} />)}
            </div>
        )}
        
        <div className="text-center">
            <ErrorMessage message={error} onRetry={() => fetchData(true)} />
        </div>
        
        {!isLoading && !error && (
            <div className="space-y-4">
                {activeTab === 'jobs' && (
                    filteredJobs.length > 0 ? (
                        filteredJobs.map((job, index) => <JobCard key={index} job={job} onSelect={onSelectJob} />)
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No job notifications found.</p>
                    )
                )}
                {activeTab === 'admit-cards' && (
                    filteredAdmitCards.length > 0 ? (
                        filteredAdmitCards.map((card, index) => <AdmitCardCard key={index} admitCard={card} />)
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No admit cards found.</p>
                    )
                )}
                {activeTab === 'results' && (
                    filteredResults.length > 0 ? (
                        filteredResults.map((res, index) => <ResultCard key={index} result={res} />)
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No exam results found.</p>
                    )
                )}
            </div>
        )}
      </Card>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default JobNotificationsViewer;

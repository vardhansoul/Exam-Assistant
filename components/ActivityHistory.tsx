import React, { useState, useEffect } from 'react';
import { getHistory } from '../utils/tracking';
import { AppView, HistoryItem, HistoryType, User } from '../types';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

interface ActivityHistoryProps {
  user: User | null;
  setView: (view: AppView) => void;
  setPreselectedTopic: (topic: string) => void;
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const groupHistoryByDate = (history: HistoryItem[]) => {
  const groups: { [key: string]: HistoryItem[] } = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  history.forEach(item => {
    const itemDate = new Date(item.timestamp);
    const itemDateStr = itemDate.toDateString();
    let key: string;

    if (itemDateStr === todayStr) key = 'Today';
    else if (itemDateStr === yesterdayStr) key = 'Yesterday';
    else key = itemDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return groups;
};

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ user, setView, setPreselectedTopic }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      const data = await getHistory(user?.uid || null);
      setHistory(data);
      setIsLoading(false);
    };
    loadHistory();
  }, [user]);

  const handleItemClick = (item: HistoryItem) => {
    if (item.context.topic) {
      setPreselectedTopic(item.context.topic);
    }
    setView(item.view);
  };

  const groupedHistory = groupHistoryByDate(history);
  const dateKeys = Object.keys(groupedHistory);

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">Activity History</h2>
        {isLoading ? (
          <div className="text-center py-10"><LoadingSpinner /></div>
        ) : history.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No activities recorded yet. Start learning to see your history here!</p>
        ) : (
          <div className="space-y-8">
            {dateKeys.map(dateKey => (
              <div key={dateKey}>
                <h3 className="text-lg font-bold text-slate-700 mb-3">{dateKey}</h3>
                <div className="space-y-3">
                  {groupedHistory[dateKey].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-left"
                    >
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex-shrink-0">
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-slate-800">{item.description}</p>
                      </div>
                      <div className="text-sm text-slate-500 flex-shrink-0">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityHistory;
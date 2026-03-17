import React, { useState, useMemo } from 'react';
import { AppView } from '../types';
import Card from './Card';

interface TopicSearchToolProps {
  topics: string[];
  setView: (view: AppView) => void;
  setPreselectedTopic: (topic: string) => void;
}

const ActionButton: React.FC<{ onClick: () => void; label: string; }> = ({ onClick, label }) => (
    <button 
      onClick={onClick} 
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition-all duration-200 transform hover:scale-105"
    >
        <span>{label}</span>
    </button>
);

const TopicSearchTool: React.FC<TopicSearchToolProps> = ({ topics, setView, setPreselectedTopic }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();
    return topics.filter(t => !t.startsWith('  ') && t.toLowerCase().includes(lowerCaseSearch));
  }, [topics, searchTerm]);

  const handleActionClick = (topic: string, view: AppView) => {
    setPreselectedTopic(topic);
    setView(view);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Topic Quick Search</h2>
          <p className="text-slate-500 mt-2">Instantly find any topic in your syllabus and access all related tools.</p>
        </div>

        <div className="mt-6 relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search for a topic..."
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-lg"
            aria-label="Search for a topic"
          />
        </div>

        <div className="mt-6 min-h-[40vh]">
          {searchTerm.trim().length < 2 ? (
            <div className="text-center text-slate-500 pt-10">
              <p>Start typing to see matching topics from your syllabus.</p>
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="space-y-4">
              {filteredTopics.map(topic => (
                <div key={topic} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="font-bold text-lg text-slate-800">{topic}</h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <ActionButton onClick={() => handleActionClick(topic, AppView.LEARN_TOPICS)} label="Study Notes" />
                    <ActionButton onClick={() => handleActionClick(topic, AppView.QUIZ)} label="Take Quiz" />
                    <ActionButton onClick={() => handleActionClick(topic, AppView.MIND_MAP)} label="Mind Map" />
                    <ActionButton onClick={() => handleActionClick(topic, AppView.GUESS_PAPER)} label="Guess Paper" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 pt-10">
              <p>No topics found matching "{searchTerm}".</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TopicSearchTool;
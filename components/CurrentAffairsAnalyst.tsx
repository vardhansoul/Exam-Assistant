
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundedSummary, InterviewChat, User, HistoryType, DailyBriefingData, DailyBriefingMCQ } from '../types';
import { AppView } from '../types';
import { generateGroundedSummary, createCurrentAffairsChat, sendMessageToChatStream, generateDailyBriefing } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';
import PrinterIcon from './icons/PrinterIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface CurrentAffairsAnalystProps {
    language: string;
    isOnline: boolean;
    selectionPath: string;
    user: User | null;
    canAccessPremium: boolean;
    requestAuth: () => void;
}

const FREQUENCIES = ['Weekly', 'Monthly', 'Last 6 Months'];
const STORAGE_KEY = 'current_affairs_state';

const CurrentAffairsAnalyst: React.FC<CurrentAffairsAnalystProps> = ({ language, isOnline, selectionPath, user, canAccessPremium, requestAuth }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatSessionRef = useRef<InterviewChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize from storage
    const [mode, setMode] = useState<'daily' | 'custom'>(() => getComponentState<any>(STORAGE_KEY)?.mode || 'daily');
    const [topic, setTopic] = useState(() => getComponentState<any>(STORAGE_KEY)?.topic || '');
    const [frequency, setFrequency] = useState(() => getComponentState<any>(STORAGE_KEY)?.frequency || 'Weekly');
    const [level, setLevel] = useState(() => getComponentState<any>(STORAGE_KEY)?.level || 'Central');
    const [state, setState] = useState(() => getComponentState<any>(STORAGE_KEY)?.state || '');
    const [summary, setSummary] = useState<GroundedSummary | null>(() => getComponentState<any>(STORAGE_KEY)?.summary || null);
    const [messages, setMessages] = useState<ChatMessage[]>(() => getComponentState<any>(STORAGE_KEY)?.messages || []);
    const [activeTab, setActiveTab] = useState(() => getComponentState<any>(STORAGE_KEY)?.activeTab || 'summary');
    const [chatInput, setChatInput] = useState('');

    // Daily Briefing State
    const [briefing, setBriefing] = useState<DailyBriefingData | null>(() => getComponentState<any>(STORAGE_KEY)?.briefing || null);
    const [answers, setAnswers] = useState<Record<number, string>>(() => getComponentState<any>(STORAGE_KEY)?.answers || {});
    const [submitted, setSubmitted] = useState<Record<number, boolean>>(() => getComponentState<any>(STORAGE_KEY)?.submitted || {});

    // Persist
    useEffect(() => {
        saveComponentState(STORAGE_KEY, { mode, topic, frequency, level, state, summary, messages, activeTab, briefing, answers, submitted }, user?.uid || null);
    }, [mode, topic, frequency, level, state, summary, messages, activeTab, briefing, answers, submitted, user?.uid]);

    // Restore Chat Object if we have history
    useEffect(() => {
        if (mode === 'custom' && summary && messages.length > 0 && !chatSessionRef.current) {
             chatSessionRef.current = createCurrentAffairsChat(topic, summary.text, language, frequency, selectionPath);
        }
    }, [mode, summary, topic, language, frequency, selectionPath, messages.length, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeTab]);

    // Fetch Daily Briefing automatically if in daily mode and not fetched
    useEffect(() => {
        if (mode === 'daily' && !briefing && canAccessPremium && isOnline) {
            handleFetchDailyBriefing();
        }
    }, [mode, briefing, canAccessPremium, isOnline]);

    const handleFetchDailyBriefing = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await generateDailyBriefing(language);
            setBriefing(data);
            logActivity(user?.uid || null, { type: 'DAILY_BRIEFING_VIEWED' as HistoryType, description: "Viewed the Daily Briefing", view: AppView.CURRENT_AFFAIRS, context: {} });
        } catch (err) {
            setError(getSpecificErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!isOnline) {
            setError("You are offline. Please connect to generate a summary.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSummary(null);
        setMessages([]);

        logActivity(user?.uid || null, {
            type: 'CURRENT_AFFAIRS_VIEWED' as HistoryType,
            description: `Generated ${frequency} current affairs for "${selectionPath}" (${level}${state ? ` - ${state}` : ''})`,
            view: AppView.CURRENT_AFFAIRS,
            context: { examPath: selectionPath, level, state }
        });

        try {
            const fullTopic = `${topic}${level ? ` ${level} Government` : ''}${state ? ` in ${state}` : ''}`;
            const result = await generateGroundedSummary(fullTopic, language, frequency, selectionPath);
            setSummary(result);
            chatSessionRef.current = createCurrentAffairsChat(fullTopic, result.text, language, frequency, selectionPath);
            setMessages([{ role: 'model', content: "Here's your summary. Feel free to ask any follow-up questions." }]);
        } catch (err) {
            setError(getSpecificErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading || !isOnline) return;
        
        // Ensure session
        if (!chatSessionRef.current && summary) {
             chatSessionRef.current = createCurrentAffairsChat(topic, summary.text, language, frequency, selectionPath);
        }
        
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: chatInput }, { role: 'model', content: '' }];
        setMessages(newMessages);
        setChatInput('');
        setIsChatLoading(true);

        try {
            if (!chatSessionRef.current) throw new Error("Chat session not initialized.");
            const stream = await sendMessageToChatStream(chatSessionRef.current, chatInput);
            let accumulatedText = '';
            for await (const chunk of stream) {
                const text = chunk.text;
                if (text) {
                    accumulatedText += text;
                    setMessages(prev => {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1].content = accumulatedText;
                        return updatedMessages;
                    });
                }
            }
        } catch (err) {
            setMessages(prev => {
                const updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1] = { role: 'system', content: getSpecificErrorMessage(err) };
                return updatedMessages;
            });
        } finally {
            setIsChatLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAnswerSelect = (mcqIndex: number, option: string) => {
        setAnswers(prev => ({ ...prev, [mcqIndex]: option }));
        setSubmitted(prev => ({ ...prev, [mcqIndex]: true }));
    };

    const renderMCQ = (mcq: DailyBriefingMCQ, index: number) => {
        const isSubmitted = submitted[index];
        const selectedAnswer = answers[index];

        return (
            <div key={index} className="mt-6">
                <h4 className="font-semibold text-gray-800 dark:text-slate-200">{index + 1}. <ContentRenderer content={mcq.question} /></h4>
                <div className="space-y-3 mt-4">
                    {(mcq.options || []).map(option => {
                        const isCorrect = option === mcq.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        
                        let buttonClasses = 'bg-white dark:bg-slate-800 hover:bg-indigo-50/70 dark:hover:bg-indigo-900/30 border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-300';
                        if (isSubmitted) {
                            if (isCorrect) {
                                buttonClasses = 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300';
                            } else if (isSelected && !isCorrect) {
                                buttonClasses = 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-300';
                            } else {
                                buttonClasses = 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400';
                            }
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerSelect(index, option)}
                                disabled={isSubmitted}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between disabled:cursor-default ${buttonClasses}`}
                            >
                                <ContentRenderer content={option} />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!canAccessPremium) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use Current Affairs.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button 
                    onClick={() => setMode('daily')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors ${mode === 'daily' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                >
                    Daily Briefing
                </button>
                <button 
                    onClick={() => setMode('custom')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors ${mode === 'custom' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                >
                    Custom Topic Analysis
                </button>
            </div>

            {mode === 'daily' && (
                <Card>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100">Daily Briefing</h2>
                        <Button onClick={handleFetchDailyBriefing} disabled={isLoading || !isOnline} variant="outline" className="!px-3 !py-1.5 flex items-center justify-center gap-2" title="Refresh">
                            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    
                    {isLoading && !briefing ? (
                        <div className="text-center py-12">
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-4">Fetching Today's Briefing...</h2>
                            <LoadingSpinner />
                        </div>
                    ) : error && !briefing ? (
                        <ErrorMessage message={error} onRetry={handleFetchDailyBriefing} />
                    ) : briefing ? (
                        <div>
                            <div className="prose max-w-none prose-slate dark:prose-invert bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                <ContentRenderer content={briefing.summary} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mt-8 mb-2">Check Your Understanding</h3>
                            {briefing.mcqs.map(renderMCQ)}
                            {briefing.sources && briefing.sources.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-md font-bold text-slate-700 dark:text-slate-300 mb-2">Sources</h4>
                                    <ul className="space-y-2 text-sm">
                                        {briefing.sources.map((source, index) => {
                                            if (!source.web?.uri) return null;
                                            return (
                                                <li key={index} className="flex items-start gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all" title={source.web.title}>
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}
                </Card>
            )}

            {mode === 'custom' && (
                !summary ? (
                    <Card>
                        <div className="text-center">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Custom Topic Analysis</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Get COC AI-powered news summaries relevant to your exam.</p>
                        </div>
                        <ErrorMessage message={error} onRetry={handleGenerateSummary} />
                        <div className="space-y-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Focus Topic (optional)</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Indian Economy, recent space missions..."
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Level</label>
                                    <select 
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                                    >
                                        <option value="Central">Central Govt</option>
                                        <option value="State">State Govt</option>
                                        <option value="International">International</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">State (If State Govt)</label>
                                    <input 
                                        type="text" 
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="e.g., Maharashtra, Delhi"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm disabled:opacity-50"
                                        disabled={level !== 'State'}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Time Period</label>
                                <div className="flex items-center space-x-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                    {FREQUENCIES.map(freq => (
                                        <button
                                            key={freq}
                                            onClick={() => setFrequency(freq)}
                                            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${frequency === freq ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button onClick={handleGenerateSummary} disabled={isLoading || !isOnline} className="w-full !py-3">
                                {isLoading ? 'Analyzing...' : 'Get Summary'}
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card className="print-section-wrapper">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 no-print">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Custom Topic Analysis</h2>
                            <div className="flex gap-2 self-end sm:self-auto">
                                {activeTab === 'summary' && (
                                    <Button onClick={handlePrint} variant="outline" className="!px-3 !py-1.5 flex items-center gap-2" title="Print format">
                                        <PrinterIcon className="w-4 h-4" /> 
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={() => { setSummary(null); setError(null); }} className="!px-3 !py-1.5">New Topic</Button>
                            </div>
                        </div>
                        
                        <div className="flex border-b border-slate-200 dark:border-slate-700 no-print">
                            <button 
                                onClick={() => setActiveTab('summary')}
                                className={`px-4 py-2 text-sm font-semibold ${activeTab === 'summary' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Summary
                            </button>
                            <button 
                                onClick={() => setActiveTab('chat')}
                                className={`px-4 py-2 text-sm font-semibold ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Ask Follow-up Questions
                            </button>
                        </div>
                        
                        <div className="mt-4">
                            {activeTab === 'summary' && (
                                <div className="print-content max-h-[60vh] overflow-y-auto pr-2">
                                    <div className="hidden print:block mb-6 text-center">
                                        <h1 className="text-2xl font-bold">Current Affairs Summary</h1>
                                        <p className="text-sm text-gray-500">{frequency} {topic ? `- Focus: ${topic}` : ''}</p>
                                    </div>
                                    <ContentRenderer content={summary.text} className="prose max-w-none prose-slate dark:prose-invert print:text-black" />
                                    {summary.sources && summary.sources.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 print:break-inside-avoid">
                                            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 print:text-black">Sources:</h4>
                                            <ul className="space-y-1 text-sm">
                                                {summary.sources.map((source, i) => {
                                                    if (!source.web?.uri) return null;
                                                    return (
                                                        <li key={i} className="truncate">
                                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline print:text-blue-700">{source.web.title || source.web.uri}</a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'chat' && (
                                <div className="flex flex-col h-[60vh]">
                                    <div className="flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-t-lg">
                                        <div className="space-y-4">
                                            {messages.map((msg, index) => (
                                                 <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">COC AI</div>}
                                                    <div className={`rounded-2xl p-3 max-w-md shadow-sm text-sm ${
                                                        msg.role === 'user' ? 'bg-indigo-600 text-white' :
                                                        msg.role === 'system' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                        'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                                    }`}>
                                                       <ContentRenderer content={msg.content} />
                                                    </div>
                                                </div>
                                            ))}
                                            {isChatLoading && (
                                                <div className="flex items-start gap-3 justify-start">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">COC AI</div>
                                                    <div className="rounded-2xl p-3 shadow-sm bg-white dark:bg-slate-800">
                                                        <LoadingSpinner />
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </div>
                                    <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                placeholder="Ask anything about the summary..."
                                                className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                                disabled={isChatLoading || !isOnline}
                                            />
                                            <Button type="submit" disabled={isChatLoading || !isOnline}>Send</Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                        <style>{`
                            @media print {
                                /* Hide main UI shells */
                                .no-print, header, .sidebar, .mobile-taskbar, button { display: none !important; }
                                /* Reset main layout styles */
                                body, #root, main, .print-section-wrapper { 
                                    display: block !important; 
                                    position: static !important; 
                                    background: white !important; 
                                    margin: 0 !important; 
                                    padding: 0 !important; 
                                    width: 100% !important; 
                                    height: auto !important; 
                                    overflow: visible !important;
                                }
                                /* Ensure only the content is visible and styled properly */
                                .print-content {
                                    display: block !important;
                                    position: static !important;
                                    overflow: visible !important;
                                    max-height: none !important;
                                    padding: 2cm !important;
                                    color: black !important;
                                }
                                /* Hide other non-print-content siblings if necessary (though our structure isolates it mostly) */
                                .print-section-wrapper > *:not(.print-content) {
                                    display: none !important;
                                }
                                .prose { color: black !important; font-size: 11pt; }
                                a { text-decoration: underline; color: #0000EE !important; }
                            }
                        `}</style>
                    </Card>
                )
            )}
        </div>
    );
};

export default CurrentAffairsAnalyst;

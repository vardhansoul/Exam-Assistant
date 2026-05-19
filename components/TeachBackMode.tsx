
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, InterviewChat, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import { createTeachBackSession, sendMessageToChatStream } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ContentRenderer from './ContentRenderer';

interface TeachBackModeProps {
    topics: string[];
    language: string;
    isOnline: boolean;
    showPopup: (config: PopupConfig) => void;
    user: User | null;
    canAccessPremium: boolean;
    requestAuth: () => void;
    isSyllabusLoading?: boolean;
    onRefresh?: () => void;
}

const TeachBackMode: React.FC<TeachBackModeProps> = ({ topics, language, isOnline, showPopup, user, canAccessPremium, requestAuth, isSyllabusLoading, onRefresh }) => {
    const [topic, setTopic] = useState(topics[0] || '');
    const [hasStarted, setHasStarted] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<InterviewChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (topics.length > 0 && !topics.includes(topic)) {
            setTopic(topics[0]);
        }
    }, [topics, topic]);

    // Auto-fetch topics if missing and online
    useEffect(() => {
        if (topics.length === 0 && !isSyllabusLoading && isOnline && onRefresh) {
            onRefresh();
        }
    }, [topics.length, isSyllabusLoading, isOnline, onRefresh]);
    
    const startSession = useCallback(async () => {
        if (!isOnline || !topic) return;
        setIsLoading(true);
        setHasStarted(true);
        setMessages([]);
        
        logActivity(user?.uid || null, {
            type: 'TEACH_BACK_STARTED' as HistoryType,
            description: `Started Teach-back session for "${topic}"`,
            view: AppView.TEACH_BACK_MODE,
            context: { topic: topic }
        });

        chatRef.current = createTeachBackSession(topic, language);
        
        try {
            if (isMounted.current) setMessages([{ role: 'model', content: '' }]);
            const stream = await sendMessageToChatStream(chatRef.current, "Start the session.");
            let accumulatedText = '';
            for await (const chunk of stream) {
                if (!isMounted.current) return;
                const text = chunk.text;
                if (text) {
                    accumulatedText += text;
                    setMessages([{ role: 'model', content: accumulatedText }]);
                }
            }
        } catch(e) {
            if (isMounted.current) setMessages([{ role: 'system', content: getSpecificErrorMessage(e) }]);
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [topic, language, isOnline, user]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chatRef.current || isLoading || !isOnline) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }, { role: 'model', content: '' }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const stream = await sendMessageToChatStream(chatRef.current, userInput);
            let accumulatedText = '';
            for await (const chunk of stream) {
                if (!isMounted.current) return;
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
        } catch (error) {
            if (isMounted.current) {
                setMessages(prev => {
                    const updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1] = { role: 'system', content: getSpecificErrorMessage(error) };
                    return updatedMessages;
                });
            }
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    };
    
    const handleTopicSelect = () => {
        showPopup({
            title: 'Select Topic to Teach',
            options: topics.map(t => ({ value: t, label: t })),
            onSelect: setTopic,
        });
    };
    
    if (!canAccessPremium) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Premium Feature</h2>
                    <p className="mt-2 text-slate-500">Please log in to use Teach-back Mode.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (topics.length === 0) {
      return (
          <div className="max-w-2xl mx-auto">
              <Card className="text-center py-10">
                  {isSyllabusLoading ? (
                      <>
                        <LoadingSpinner />
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Loading your syllabus topics...</p>
                      </>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">No Syllabus Loaded</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">We need to load the topics before you can start a teach-back session.</p>
                        <Button onClick={onRefresh} variant="secondary" disabled={!isOnline}>
                            {isOnline ? 'Load Topics Now' : 'You are Offline'}
                        </Button>
                      </>
                  )}
              </Card>
          </div>
      );
    }
    
    if (!hasStarted) {
        return (
             <div className="max-w-2xl mx-auto">
                 <Card>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Teach-back Mode</h2>
                        <p className="text-slate-500 mt-2">Reinforce your learning by explaining a concept to your COC AI partner.</p>
                    </div>
                    <div className="max-w-md mx-auto my-6">
                        <PopupSelector
                            label="Select Topic to Explain"
                            value={topic}
                            placeholder="Select a topic..."
                            onClick={handleTopicSelect}
                            disabled={topics.length === 0}
                        />
                    </div>
                    
                    <div className="mt-6 border-t pt-6 text-center text-sm text-slate-600 space-y-2">
                       <p><strong>How it works:</strong> You'll explain the topic in your own words. COC AI will act as a student, listen to your explanation, and ask questions to help you refine your understanding.</p>
                    </div>

                    <div className="text-center mt-8">
                        <Button onClick={startSession} disabled={isLoading || !isOnline || !topic} className="!py-3 w-full sm:w-auto">
                           {isOnline ? 'Start Session' : 'You are Offline'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="w-full h-[calc(100vh_-_10rem)] sm:h-[calc(100vh_-_6rem)]">
            <Card className="flex flex-col h-full p-0 overflow-hidden !border-t-0">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-slate-800 truncate">Teaching: {topic}</h2>
                        <p className="text-xs text-slate-500">COC AI Teach-back Session</p>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-800">
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">COC AI</div>}
                                <div className={`rounded-2xl p-4 max-w-[90%] sm:max-w-3xl shadow-sm text-sm ${
                                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' :
                                    msg.role === 'system' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-bl-none' :
                                    'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-600'
                                }`}>
                                   <div className="whitespace-pre-wrap prose prose-base sm:prose-lg max-w-none dark:prose-invert"><ContentRenderer content={msg.content} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center p-3 bg-white dark:bg-slate-800 border-t border-slate-200 flex-shrink-0">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isOnline ? "Explain here..." : "You are offline"}
                        className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 transition resize-none"
                        rows={2}
                        disabled={isLoading || !isOnline}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as any);
                            }
                        }}
                    />
                    <Button type="submit" disabled={isLoading || !userInput.trim() || !isOnline} className="!p-3.5 self-end">
                        Send
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default TeachBackMode;

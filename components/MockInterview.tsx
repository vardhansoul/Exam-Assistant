
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, InterviewChat, User, HistoryType } from '../types';
import { AppView } from '../types';
import type { PopupConfig } from '../types';
import { createInterviewSession, generateSyllabusInfo, sendMessageToChatStream } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import { JOB_ROLES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';
import ContentRenderer from './ContentRenderer';
import LightBulbIcon from './icons/LightBulbIcon';

interface MockInterviewProps {
    language: string;
    isOnline: boolean;
    showPopup: (config: PopupConfig) => void;
    user: User | null;
    selectionPath: string;
    canAccessPremium: boolean;
    requestAuth: () => void;
    onSetBackHandler?: (handler: (() => boolean) | null) => void;
}

const STORAGE_KEY = 'interview_active_state';

const MockInterview: React.FC<MockInterviewProps> = ({ language, isOnline, showPopup, user, selectionPath, canAccessPremium, requestAuth, onSetBackHandler }) => {
    const [jobRole, setJobRole] = useState(JOB_ROLES[0]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [syllabusInfo, setSyllabusInfo] = useState<string>('');
    const [isSyllabusLoading, setIsSyllabusLoading] = useState(true);
    const chatRef = useRef<InterviewChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    // Initialize state from storage
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = getComponentState<{messages: ChatMessage[], jobRole: string}>(STORAGE_KEY);
        if (saved) return saved.messages;
        return [];
    });
    
    const [hasStarted, setHasStarted] = useState(() => {
        const saved = getComponentState<{messages: ChatMessage[], jobRole: string}>(STORAGE_KEY);
        return !!saved && saved.messages.length > 0;
    });

    useEffect(() => {
        const saved = getComponentState<{messages: ChatMessage[], jobRole: string}>(STORAGE_KEY);
        if (saved && saved.jobRole) {
            setJobRole(saved.jobRole);
        }
    }, []);

    // Persist active state
    useEffect(() => {
        if (hasStarted && messages.length > 0) {
            saveComponentState(STORAGE_KEY, { messages, jobRole }, user?.uid || null);
        } else if (!hasStarted) {
            saveComponentState(STORAGE_KEY, null, user?.uid || null);
        }
    }, [messages, hasStarted, jobRole, user?.uid]);

    // Restore Chat Object on mount if we have messages but no active chat object
    useEffect(() => {
        if (hasStarted && !chatRef.current && isOnline) {
            // Re-create session with history
            // Note: Google GenAI SDK chat history format is slightly different, 
            // but for simplicity we start a new session context here or we could map messages to History.
            // For a Mock Interview, creating a new session usually works fine as long as the prompt context is set.
            chatRef.current = createInterviewSession(jobRole, language);
            
            // Optionally, we could "replay" the history to the model if the API supported it easily in this structure,
            // but for now, we just ensure the object exists for *new* messages.
        }
    }, [hasStarted, isOnline, jobRole, language]);


    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (onSetBackHandler) {
            if (hasStarted) {
                onSetBackHandler(() => {
                    setHasStarted(false);
                    return true;
                });
            } else {
                onSetBackHandler(null);
            }
        }
        return () => { if (onSetBackHandler) onSetBackHandler(null); };
    }, [hasStarted, onSetBackHandler]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectionPath && !hasStarted) {
            const lowerSelectionPath = selectionPath.toLowerCase();
            const foundRole = JOB_ROLES.find(role => 
                lowerSelectionPath.includes(role.toLowerCase().split('(')[0].trim())
            );
            if (foundRole) {
                setJobRole(foundRole);
            }
        }
    }, [selectionPath, hasStarted]);

    useEffect(() => {
        const fetchSyllabus = async () => {
            if (isMounted.current) setIsSyllabusLoading(true);
            try {
                const info = await generateSyllabusInfo(jobRole, language);
                if (isMounted.current) setSyllabusInfo(info);
            } catch (error) {
                if (isMounted.current) setSyllabusInfo(`Error: ${getSpecificErrorMessage(error)}`);
            }
            if (isMounted.current) setIsSyllabusLoading(false);
        };
        if (!hasStarted && isOnline) {
            fetchSyllabus();
        } else if (!hasStarted && !isOnline) {
            setSyllabusInfo("Error: You are offline. Please connect to view syllabus information.");
            setIsSyllabusLoading(false);
        }
    }, [jobRole, language, hasStarted, isOnline]);
    
    const startInterview = useCallback(async () => {
        if (!isOnline) return;
        if (isMounted.current) {
            setIsLoading(true);
            setHasStarted(true);
            setMessages([]);
        }
        
        logActivity(user?.uid || null, {
            type: 'INTERVIEW_STARTED' as HistoryType,
            description: `Started an interview for "${jobRole}"`,
            view: AppView.INTERVIEW,
            context: { topic: jobRole }
        });

        chatRef.current = createInterviewSession(jobRole, language);
        
        try {
            if (isMounted.current) setMessages([{ role: 'model', content: '' }]);
            
            const stream = await sendMessageToChatStream(chatRef.current, "Start the interview.");
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
    }, [jobRole, language, isOnline, user]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !isOnline) return;
        
        // Ensure chat session exists (e.g. if refreshed page)
        if (!chatRef.current) {
             chatRef.current = createInterviewSession(jobRole, language);
        }

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
    
    const handleGetHint = async () => {
        if (isLoading || !isOnline) return;
        if (!chatRef.current) chatRef.current = createInterviewSession(jobRole, language);
        
        const hintPrompt = "I am stuck. Please give me a hint or a structure (like STAR) for how I should answer this question. Do not give me the full answer, just guide me.";
        
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: "Please give me a hint." }, { role: 'model', content: '' }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const stream = await sendMessageToChatStream(chatRef.current, hintPrompt);
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
    
    const handleJobRoleSelect = () => {
        showPopup({
            title: 'Select Job Role',
            options: JOB_ROLES.map(r => ({ value: r, label: r })),
            onSelect: setJobRole,
        });
    };

    if (!canAccessPremium) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the COC AI Mock Interview feature.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    if (!hasStarted) {
        return (
             <div className="max-w-2xl mx-auto">
                 <Card>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mock Interview Coach</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Select a job role. COC AI will interview you and teach you how to give the perfect answer.</p>
                    </div>
                    <div className="max-w-md mx-auto my-6">
                        <PopupSelector
                            label="Select Job Role"
                            value={jobRole}
                            placeholder="Select a job role..."
                            onClick={handleJobRoleSelect}
                        />
                    </div>
                    
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 text-center">Typical Syllabus Overview</h3>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 max-h-60 overflow-y-auto prose prose-slate dark:prose-invert max-w-none">
                            {isSyllabusLoading ? <div className="flex justify-center items-center h-24"><LoadingSpinner /></div> : <ContentRenderer content={syllabusInfo} />}
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Button onClick={startInterview} disabled={isSyllabusLoading || !isOnline} className="!py-3 w-full sm:w-auto">
                           {isOnline ? 'Start Interview' : 'You are Offline'}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="w-full h-[calc(100vh_-_10rem)] sm:h-[calc(100vh_-_6rem)]">
            <Card className="flex flex-col h-full p-0 overflow-hidden !border-t-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">Interview: {jobRole}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">COC AI Coaching Session</p>
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
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isOnline ? "Your answer..." : "You are offline"}
                            className="flex-grow p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 transition"
                            disabled={isLoading || !isOnline}
                        />
                        <button
                            type="button"
                            onClick={handleGetHint}
                            disabled={isLoading || !isOnline}
                            className="p-3 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-50 transition-colors"
                            title="Get a hint"
                        >
                            <LightBulbIcon className="w-6 h-6" />
                        </button>
                        <Button type="submit" disabled={isLoading || !userInput.trim() || !isOnline} className="!p-3.5">
                            Send
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default MockInterview;



import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, InterviewChat } from '../types';
import type { PopupConfig } from '../App';
import { createInterviewSession, generateSyllabusInfo, getSpecificErrorMessage, sendMessageToChat } from '../services/geminiService';
import { JOB_ROLES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import PopupSelector from './PopupSelector';

interface MockInterviewProps {
    language: string;
    isOnline: boolean;
    showPopup: (config: PopupConfig) => void;
}

const MockInterview: React.FC<MockInterviewProps> = ({ language, isOnline, showPopup }) => {
    const [jobRole, setJobRole] = useState(JOB_ROLES[0]);
    const [hasStarted, setHasStarted] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [syllabusInfo, setSyllabusInfo] = useState<string>('');
    const [isSyllabusLoading, setIsSyllabusLoading] = useState<boolean>(true);
    const chatRef = useRef<InterviewChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchSyllabus = async () => {
            setIsSyllabusLoading(true);
            try {
                const info = await generateSyllabusInfo(jobRole, language);
                setSyllabusInfo(info);
            } catch (error) {
                setSyllabusInfo(`Error: ${getSpecificErrorMessage(error)}`);
            }
            setIsSyllabusLoading(false);
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
        setIsLoading(true);
        setHasStarted(true);
        setMessages([]);
        
        chatRef.current = createInterviewSession(jobRole, language);
        
        try {
            const initialResponse = await sendMessageToChat(chatRef.current, "Start the interview.");
            setMessages([{ role: 'model', content: initialResponse.text }]);
        } catch(e) {
            setMessages([{ role: 'system', content: getSpecificErrorMessage(e) }]);
        } finally {
            setIsLoading(false);
        }
    }, [jobRole, language, isOnline]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chatRef.current || isLoading || !isOnline) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await sendMessageToChat(chatRef.current, userInput);
            setMessages([...newMessages, { role: 'model', content: response.text }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'system', content: getSpecificErrorMessage(error) }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleJobRoleSelect = () => {
        showPopup({
            title: 'Select Job Role',
            options: JOB_ROLES.map(r => ({ value: r, label: r })),
            onSelect: setJobRole,
        });
    };

    const formatMessageContent = (content: string) => {
        const parts = content.split(/(\*.*?\*)|(_.*?_)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) return <strong key={index}>{part.slice(1, -1)}</strong>;
            if (part.startsWith('_') && part.endsWith('_')) return <em key={index}>{part.slice(1, -1)}</em>;
            return part;
        });
    };
    
    const formatSyllabus = (text: string) => {
        if (text.startsWith('Error:')) {
            return <p className="text-red-600 font-semibold">{text}</p>;
        }
        return text.split('\n').map((line, index) => {
            if (line.startsWith('###')) return <h3 key={index} className="text-md font-semibold mt-3 mb-1">{line.replace('###', '').trim()}</h3>;
            if (line.startsWith('##')) return <h2 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
            if (line.startsWith('* ')) return <li key={index} className="ml-4 list-disc text-sm">{line.replace('* ', '').trim()}</li>;
            return <p key={index} className="my-1 text-sm">{line || '\u00A0'}</p>;
        });
    };

    if (!hasStarted) {
        return (
             <div className="max-w-2xl mx-auto">
                 <Card>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Mock Interview Practice</h2>
                        <p className="text-slate-500 mt-2">Select a job role to start your AI-powered practice session.</p>
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
                        <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">Typical Syllabus Overview</h3>
                        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 max-h-60 overflow-y-auto prose prose-slate max-w-none">
                            {isSyllabusLoading ? <div className="flex justify-center items-center h-24"><LoadingSpinner /></div> : formatSyllabus(syllabusInfo)}
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
        <div className="max-w-3xl mx-auto">
            <Card className="flex flex-col h-[calc(100vh_-_10rem)] max-h-[700px] p-0 overflow-hidden !border-t-0">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-slate-800 truncate">Interview: {jobRole}</h2>
                        <p className="text-xs text-slate-500">AI Practice Session</p>
                    </div>
                    <Button onClick={() => setHasStarted(false)} variant="secondary" className="!px-3 !py-1.5 text-xs flex-shrink-0">End Session</Button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50">
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">AI</div>}
                                <div className={`rounded-2xl p-3 max-w-md shadow-sm text-sm ${
                                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' :
                                    msg.role === 'system' ? 'bg-red-100 text-red-800 rounded-bl-none' :
                                    'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                                }`}>
                                   <p className="whitespace-pre-wrap">{formatMessageContent(msg.content)}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages.length > 0 && 
                            <div className="flex items-start gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">AI</div>
                                <div className="rounded-2xl p-3 shadow-sm bg-white border border-slate-200">
                                    <div className="animate-pulse flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center p-3 bg-white border-t border-slate-200 flex-shrink-0">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isOnline ? "Your answer..." : "You are offline"}
                        className="flex-grow p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-slate-100 transition"
                        disabled={isLoading || !isOnline}
                    />
                    <Button type="submit" disabled={isLoading || !userInput.trim() || !isOnline} className="!p-3.5">
                        Send
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default MockInterview;
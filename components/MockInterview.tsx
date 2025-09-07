
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, InterviewChat } from '../types';
import { createInterviewSession, generateSyllabusInfo, getSpecificErrorMessage } from '../services/geminiService';
import { JOB_ROLES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import Button from './Button';
import Select from './Select';

interface MockInterviewProps {
    language: string;
    isOnline: boolean;
}

const MockInterview: React.FC<MockInterviewProps> = ({ language, isOnline }) => {
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
            const initialResponse = await chatRef.current.sendMessage({ message: "Start the interview." });
            setMessages([{ role: 'model', content: initialResponse.text }]);
        } catch(e) {
            console.error(e);
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
            const response = await chatRef.current.sendMessage({ message: userInput });
            setMessages([...newMessages, { role: 'model', content: response.text }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages([...newMessages, { role: 'system', content: getSpecificErrorMessage(error) }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatMessageContent = (content: string) => {
        const parts = content.split(/(\*.*?\*)|(_.*?_)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return <strong key={index}>{part.slice(1, -1)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
                 return <em key={index}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };
    
    const formatSyllabus = (text: string) => {
        if (text.startsWith('Error:')) {
            return <p className="text-red-600 font-semibold">{text}</p>;
        }
        return text.split('\n').map((line, index) => {
            if (line.startsWith('###')) {
                return <h3 key={index} className="text-md font-semibold mt-3 mb-1">{line.replace('###', '').trim()}</h3>;
            }
            if (line.startsWith('##')) {
                return <h2 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('##', '').trim()}</h2>;
            }
            if (line.startsWith('* ')) {
                return <li key={index} className="ml-4 list-disc text-sm">{line.replace('* ', '').trim()}</li>;
            }
            if (line.includes('**')) {
                const parts = line.split('**');
                return <p key={index} className="text-sm">{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
            }
            return <p key={index} className="my-1 text-sm">{line}</p>;
        });
    };

    if (!hasStarted) {
        return (
             <Card>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Mock Interview Practice</h2>
                    <p className="text-gray-600 mb-6">Select a job role to start your practice interview session.</p>
                </div>
                <div className="max-w-md mx-auto mb-6">
                    <Select label="Select Job Role" options={JOB_ROLES} value={jobRole} onChange={e => setJobRole(e.target.value)} />
                </div>
                
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Typical Exam Pattern & Syllabus</h3>
                    {isSyllabusLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-60 overflow-y-auto prose max-w-none">
                            {formatSyllabus(syllabusInfo)}
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <Button onClick={startInterview} disabled={isSyllabusLoading || !isOnline}>
                        {isOnline ? 'Start Interview' : 'Offline'}
                    </Button>
                     {!isOnline && <p className="text-sm text-orange-600 mt-2">Connect to the internet to start an interview.</p>}
                </div>
            </Card>
        );
    }
    
    if (isLoading && messages.length === 0) {
        return (
            <Card className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Starting Interview...</h2>
                <p className="text-gray-500 mb-6">The AI interviewer is getting ready.</p>
                <LoadingSpinner />
            </Card>
        )
    }

    return (
        <Card className="flex flex-col h-[calc(100vh_-_9rem)] max-h-[85vh] p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Mock Interview: {jobRole}</h2>
                <button onClick={() => setHasStarted(false)} className="text-sm text-indigo-600 hover:underline">End & Change Role</button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">AI</div>}
                        <div className={`rounded-2xl p-4 max-w-lg shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                        }`}>
                           {msg.role === 'system' 
                                ? <p className="text-red-600 font-semibold">{msg.content}</p>
                                : <p className="whitespace-pre-wrap">{formatMessageContent(msg.content)}</p>
                           }
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && 
                    <div className="flex items-end mb-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">AI</div>
                        <div className="rounded-2xl p-4 max-w-lg shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
                            <div className="animate-pulse flex space-x-1">
                                <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                                <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                }
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-3 items-center p-4 bg-white border-t border-gray-200">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isOnline ? "Type your answer..." : "You are offline"}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-gray-100 transition"
                    disabled={isLoading || !isOnline}
                />
                <Button type="submit" disabled={isLoading || !userInput.trim() || !isOnline} className="h-full">Send</Button>
            </form>
        </Card>
    );
};

export default MockInterview;
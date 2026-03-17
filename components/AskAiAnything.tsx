
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, InterviewChat, User, HistoryType } from '../types';
import { AppView } from '../types';
import { createGeneralChat, sendMessageToChatStream, generatePromptSuggestions } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity } from '../utils/tracking';
import Card from './Card';
import Button from './Button';
import ContentRenderer from './ContentRenderer';
import LoadingSpinner from './LoadingSpinner';

interface AskAiAnythingProps {
    language: string;
    isOnline: boolean;
    selectionPath: string;
    user: User | null;
    canAccessPremium: boolean;
    requestAuth: () => void;
}

// --- Helper Components for message types ---

const AIMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
    <div className="flex items-start gap-3 justify-start animate-fade-in-up">
        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            COC AI
        </div>
        <div className="rounded-2xl rounded-bl-none p-3 max-w-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm break-words">
            <ContentRenderer content={msg.content} className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none dark:prose-invert" />
        </div>
    </div>
);

const UserMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
    <div className="flex items-start gap-3 justify-end animate-fade-in-up">
        <div className="rounded-2xl rounded-br-none p-3 max-w-md bg-indigo-600 text-white shadow-sm break-words">
            <ContentRenderer content={msg.content} className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none prose-invert" />
        </div>
    </div>
);

const SystemMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
    <div className="flex items-center justify-center text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg my-4 animate-fade-in-up break-words">
        <span>{msg.content}</span>
    </div>
);


const AskAiAnything: React.FC<AskAiAnythingProps> = ({ language, isOnline, selectionPath, user, canAccessPremium, requestAuth }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    
    // Manage chat locally to ensure fresh sessions and no persistence issues
    const [chat, setChat] = useState<InterviewChat | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial load: Start new chat
    useEffect(() => {
        if (isOnline && canAccessPremium) {
            // Pass !user as isTrial indicator
            const newChat = createGeneralChat(language, !user);
            setChat(newChat);
            setMessages([]);
        }
    }, [language, isOnline, canAccessPremium, user]);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!selectionPath || !isOnline) {
                setPromptSuggestions([]);
                return;
            }
            setIsSuggestionsLoading(true);
            try {
                const suggestions = await generatePromptSuggestions(selectionPath, language);
                setPromptSuggestions(suggestions);
            } catch (error) {
                console.error("Failed to fetch prompt suggestions:", error);
                setPromptSuggestions([]);
            }
            setIsSuggestionsLoading(false);
        };
        if (canAccessPremium) {
            fetchSuggestions();
        }
    }, [selectionPath, language, isOnline, canAccessPremium]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading || !isOnline) return;
        
        let currentChat = chat;
        if (!currentChat) {
             currentChat = createGeneralChat(language, !user);
             setChat(currentChat);
        }

        const userMessage: ChatMessage = { role: 'user', content: prompt };
        
        // Optimistically add user message and a placeholder for model response
        setMessages(prev => [...prev, userMessage, { role: 'model', content: '' }]);
        
        logActivity(user?.uid || null, {
            type: 'ASK_AI_QUESTION' as HistoryType,
            description: `Asked: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
            view: AppView.ASK_AI,
            context: { examPath: selectionPath }
        });

        setUserInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setIsLoading(true);

        try {
            const stream = await sendMessageToChatStream(currentChat, prompt);
            let accumulatedText = '';
            
            for await (const chunk of stream) {
                const text = chunk.text;
                if (text) {
                    accumulatedText += text;
                    setMessages(prev => {
                        const updated = [...prev];
                        if (updated.length > 0) {
                            const lastIndex = updated.length - 1;
                            // Properly update the object without mutating the previous state reference directly
                            if (updated[lastIndex].role === 'model') {
                                updated[lastIndex] = { ...updated[lastIndex], content: accumulatedText };
                            }
                        }
                        return updated;
                    });
                }
            }
            
            if (!accumulatedText) {
                 setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'system', content: "COC AI did not return a response. Please try again." };
                    return updated;
                });
            }

        } catch (error) {
            setMessages(prev => {
                const updated = [...prev];
                // Replace the placeholder with an error message
                updated[updated.length - 1] = { role: 'system', content: getSpecificErrorMessage(error) };
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
    };
    
    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">COC AI</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ask COC AI Anything!</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-xs">I'm your personal COC AI tutor. How can I help you with your exam preparation today?</p>
            
            {(isSuggestionsLoading || promptSuggestions.length > 0) && (
                <div className="mt-8 w-full max-w-md">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Or try one of these prompts:</p>
                    {isSuggestionsLoading ? <LoadingSpinner /> : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {promptSuggestions.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSendMessage(prompt)}
                                    className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm text-left hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (!canAccessPremium) {
        return (
            <div className="max-w-3xl mx-auto">
                <Card className="flex flex-col h-[calc(100vh_-_10rem)] max-h-[700px] p-0 overflow-hidden items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Your trial has ended. Please sign up or log in to chat with the COC AI Tutor.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Sign Up / Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh_-_8rem)] max-h-[700px]">
            <Card className="flex flex-col h-full p-0 overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 text-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ask COC AI Anything</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Your Personal COC AI Tutor</p>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50">
                    {messages.length === 0 && !isLoading ? renderEmptyState() : (
                        <div className="space-y-6">
                            {messages.map((msg, index) => {
                                if (msg.role === 'model') return <AIMessage key={index} msg={msg} />;
                                if (msg.role === 'user') return <UserMessage key={index} msg={msg} />;
                                if (msg.role === 'system') return <SystemMessage key={index} msg={msg} />;
                                return null;
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <form onSubmit={handleFormSubmit} className="flex gap-2 items-end">
                        <textarea
                            ref={textareaRef}
                            value={userInput}
                            onChange={handleTextareaInput}
                            placeholder={isOnline ? "Ask a question..." : "You are offline"}
                            className="flex-grow p-3 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-300 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-400 disabled:bg-slate-100 transition-all resize-none max-h-40"
                            rows={1}
                            disabled={isLoading || !isOnline}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleFormSubmit(e as any);
                                }
                            }}
                        />
                        <Button type="submit" disabled={isLoading || !userInput.trim() || !isOnline} className="!p-3.5 !rounded-xl">
                            Send
                        </Button>
                    </form>
                </div>
            </Card>
            
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .prose-invert strong, .prose-invert h1, .prose-invert h2, .prose-invert h3, .prose-invert h4 { color: inherit; }
            `}</style>
        </div>
    );
};

export default AskAiAnything;


import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundedSummary, InterviewChat } from '../types';
import { generateGroundedSummary, createCurrentAffairsChat, getSpecificErrorMessage } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface CurrentAffairsAnalystProps {
    language: string;
    isOnline: boolean;
    selectionPath: string;
}

const FREQUENCIES = ['Last 6 Months', 'Monthly', 'Daily'];

const CurrentAffairsAnalyst: React.FC<CurrentAffairsAnalystProps> = ({ language, isOnline, selectionPath }) => {
    const [topic, setTopic] = useState('');
    const [frequency, setFrequency] = useState('Monthly');
    const [summary, setSummary] = useState<GroundedSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('summary');
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatSessionRef = useRef<InterviewChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleGenerateSummary = async () => {
        if (!isOnline) return;
        setIsLoading(true);
        setError(null);
        setSummary(null);
        setMessages([]);

        try {
            const result = await generateGroundedSummary(topic, language, frequency, selectionPath);
            setSummary(result);
            chatSessionRef.current = createCurrentAffairsChat(topic, result.text, language, frequency, selectionPath);
            setMessages([{ role: 'model', content: "Here's your summary. Feel free to ask any follow-up questions." }]);
        } catch (err) {
            setError(getSpecificErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatSummary = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const boldRegex = /\*\*(.*?)\*\*/g;
            const colorRegex = /\|\|(red|blue|green|orange):(.+?)\|\|/g;

            const renderBold = (text: string) => {
                const parts = text.split(boldRegex);
                return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
            };

            if (line.startsWith('###')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-slate-800">{renderBold(line.replace('###', '').trim())}</h3>;
            if (line.startsWith('##')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b pb-2 text-slate-900">{renderBold(line.replace('##', '').trim())}</h2>;
            if (line.startsWith('* ')) return <li key={index} className="ml-5 list-disc text-slate-700">{renderBold(line.replace('* ', '').trim())}</li>;
            
            const parts = line.split(colorRegex);
            const content = parts.map((part, i) => {
                if (i % 3 === 1) { // color name
                    const color = part;
                    const textContent = parts[i + 1];
                    const colorClasses: Record<string, string> = { red: 'text-red-600 bg-red-100/60', blue: 'text-blue-600 bg-blue-100/60', green: 'text-green-600 bg-green-100/60', orange: 'text-orange-600 bg-orange-100/60' };
                    return <span key={i} className={`px-1 rounded font-semibold ${colorClasses[color]}`}>{renderBold(textContent)}</span>;
                }
                if (i % 3 === 2) return null; // Already processed content
                return renderBold(part);
            }).filter(Boolean).flat();

            return <p key={index} className="my-1 text-slate-700">{content.length > 0 ? content : '\u00A0'}</p>;
        });
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading || !isOnline) return;
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: chatInput }];
        setMessages(newMessages); setChatInput(''); setIsChatLoading(true);
        try {
            const response = await chatSessionRef.current!.sendMessage({ message: chatInput });
            setMessages([...newMessages, { role: 'model', content: response.text }]);
        } catch (err) {
            setMessages([...newMessages, { role: 'system', content: getSpecificErrorMessage(err) }]);
        } finally { setIsChatLoading(false); }
    };
    
    if (!summary) return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Current Affairs Analyst</h2>
                    <p className="text-slate-500 mt-2">Get AI-powered news summaries relevant to your exam.</p>
                </div>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md my-4">{error}</div>}
                <div className="space-y-6 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                        <div className="flex w-full rounded-lg bg-slate-200 p-1">
                            {FREQUENCIES.map(freq => (
                                <button key={freq} onClick={() => setFrequency(freq)} className={`w-full py-1.5 text-sm font-semibold rounded-md transition-all ${frequency === freq ? 'bg-white text-indigo-700 shadow' : 'text-slate-600 hover:bg-slate-300/50'}`}>
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Optional: Focus Area (e.g., Economy)" className="w-full p-3 border border-slate-300 rounded-lg" disabled={isLoading || !isOnline} />
                </div>
                <div className="mt-8">
                    <Button onClick={handleGenerateSummary} disabled={isLoading || !isOnline} className="w-full !py-3">
                        {isLoading ? 'Analyzing...' : 'Generate Summary'}
                    </Button>
                </div>
                {isLoading && <div className="text-center mt-6"><LoadingSpinner /></div>}
            </Card>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Analysis Complete</h2>
                        <p className="text-sm text-slate-500">{frequency} Briefing{topic && ` on ${topic}`}</p>
                    </div>
                    <Button onClick={() => setSummary(null)} variant="secondary">New Analysis</Button>
                </div>
                <div className="flex w-full sm:w-auto mb-4 rounded-lg bg-slate-200 p-1">
                    {['summary', 'sources', 'chat'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full py-1.5 px-3 text-sm font-semibold rounded-md transition-all capitalize ${activeTab === tab ? 'bg-white text-indigo-700 shadow' : 'text-slate-600 hover:bg-slate-300/50'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="bg-slate-50 p-4 rounded-lg min-h-[50vh] max-h-[65vh] overflow-y-auto">
                    {activeTab === 'summary' && <div className="prose prose-slate max-w-none">{formatSummary(summary.text)}</div>}
                    {activeTab === 'sources' && (
                        <ul className="space-y-2 text-sm">
                            {summary.sources.map((source, index) => (
                                <li key={index} className="flex items-start gap-2 p-2 bg-white rounded-md">
                                    <GlobeAltIcon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all" title={source.web.title}>
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-grow space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                        <div className={`rounded-xl p-2.5 max-w-xs text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : msg.role === 'system' ? 'bg-red-100 text-red-800' : 'bg-white'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && <div className="flex justify-start"><LoadingSpinner /></div>}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 sticky bottom-0 bg-slate-50 py-2">
                                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask a question..." className="flex-grow p-2 border border-slate-300 rounded-md" disabled={isChatLoading || !isOnline} />
                                <Button type="submit" className="!p-2.5" disabled={isChatLoading || !isOnline || !chatInput.trim()}><PaperAirplaneIcon className="w-5 h-5" /></Button>
                            </form>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CurrentAffairsAnalyst;

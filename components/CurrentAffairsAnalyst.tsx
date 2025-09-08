import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundedSummary, InterviewChat } from '../types';
import { generateGroundedSummary, createCurrentAffairsChat, getSpecificErrorMessage } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { GlobeAltIcon } from './icons/GlobeAltIcon';

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

    // Chat state
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

            // Initialize chat session
            chatSessionRef.current = createCurrentAffairsChat(topic, result.text, language, frequency, selectionPath);
            setMessages([
                { role: 'model', content: "Here is the summary. What would you like to discuss further?" }
            ]);

        } catch (err) {
            setError(getSpecificErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !chatSessionRef.current || isChatLoading || !isOnline) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: chatInput }];
        setMessages(newMessages);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const response = await chatSessionRef.current.sendMessage({ message: chatInput });
            setMessages([...newMessages, { role: 'model', content: response.text }]);
        } catch (err) {
            setMessages([...newMessages, { role: 'system', content: getSpecificErrorMessage(err) }]);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const handleReset = () => {
        setTopic('');
        setSummary(null);
        setError(null);
        setMessages([]);
        setFrequency('Monthly');
        chatSessionRef.current = null;
    };

    const formatMessageContent = (content: string) => {
        const parts = content.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const formatSummary = (text: string) => {
        const lines = text.split('\n');
        let isTable = false;
        const formattedContent: JSX.Element[] = [];
        let tableRows: JSX.Element[] = [];
        let tableHeader: JSX.Element | null = null;
    
        const parseLine = (line: string, key: string | number): React.ReactNode => {
            const boldTextRegex = /\*\*(.*?)\*\*/g;
            const coloredTextRegex = /\|\|(red|blue|green|orange):(.+?)\|\|/g;

            // A function to process a segment of text for bolding
            const processBold = (segment: string, keyPrefix: string) => {
                if (!segment) return [];
                const parts = segment.split(boldTextRegex);
                return parts.map((part, index) => {
                    if (index % 2 === 1) { // This is the bolded text
                        return <strong key={`${keyPrefix}-bold-${index}`}>{part}</strong>;
                    }
                    return part;
                });
            };

            // Process the line for colors first
            const parts = line.split(coloredTextRegex);
            return parts.map((part, index) => {
                if (index % 3 === 1) { // This is the color name
                    const color = part;
                    const textContent = parts[index + 1]; // The text to be colored
                    const colorClasses: { [key: string]: string } = {
                        red: 'text-red-600 bg-red-100/60 px-1 rounded font-semibold',
                        blue: 'text-blue-600 bg-blue-100/60 px-1 rounded font-semibold',
                        green: 'text-green-600 bg-green-100/60 px-1 rounded font-semibold',
                        orange: 'text-orange-600 bg-orange-100/60 px-1 rounded font-semibold',
                    };
                    // Process the colored text for bolding
                    return <span key={`${key}-color-${index}`} className={colorClasses[color] || 'font-semibold'}>{processBold(textContent, `${key}-color-${index}`)}</span>;
                
                } else if (index % 3 === 2) { // This is the text that was colored, already handled
                    return null;
                
                } else { // This is a non-colored part, process it for bolding
                    return processBold(part, `${key}-noncolor-${index}`);
                }
            });
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            // Table logic
            if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                if (!isTable) isTable = true;
                const cells = trimmedLine.slice(1, -1).split('|').map(c => c.trim());

                if (cells.every(c => /^-+$/.test(c))) {
                    return; // Skip rendering markdown table separator
                }
                
                if (!tableHeader) {
                    tableHeader = (
                        <thead key={`thead-${index}`}>
                            <tr className="bg-slate-200">
                                {cells.map((cell, i) => <th key={i} className="p-2 border border-slate-300 text-left text-sm font-bold text-slate-700">{parseLine(cell, `th-${i}`)}</th>)}
                            </tr>
                        </thead>
                    );
                } else {
                    tableRows.push(
                        <tr key={`tr-${index}`} className="bg-white hover:bg-slate-50">
                            {cells.map((cell, i) => <td key={i} className="p-2 border border-slate-300 text-sm">{parseLine(cell, `td-${i}`)}</td>)}
                        </tr>
                    );
                }
                return;
            }
            
            if (isTable) {
                formattedContent.push(
                    <div key={`table-wrapper-${index}`} className="overflow-x-auto my-4">
                        <table className="w-full border-collapse border border-slate-300 rounded-lg">
                            {tableHeader}
                            <tbody>{tableRows}</tbody>
                        </table>
                    </div>
                );
                isTable = false; tableHeader = null; tableRows = [];
            }

            // Other markdown elements
            if (line.startsWith('###')) {
                formattedContent.push(<h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-800">{parseLine(line.replace('###', '').trim(), index)}</h3>);
            } else if (line.startsWith('##')) {
                formattedContent.push(<h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b pb-2 text-gray-900">{parseLine(line.replace('##', '').trim(), index)}</h2>);
            } else if (line.startsWith('* ')) {
                formattedContent.push(<li key={index} className="ml-5 list-disc text-gray-700">{parseLine(line.replace('* ', '').trim(), index)}</li>);
            } else if (line.trim() === '') {
                 formattedContent.push(<div key={index} className="h-2"></div>);
            }
            else {
                formattedContent.push(<p key={index} className="my-1 text-gray-700">{parseLine(line, index)}</p>);
            }
        });

        if (isTable) {
             formattedContent.push(
                <div key="table-wrapper-end" className="overflow-x-auto my-4">
                    <table className="w-full border-collapse border border-slate-300 rounded-lg">
                        {tableHeader}
                        <tbody>{tableRows}</tbody>
                    </table>
                </div>
            );
        }

        return <div className="prose max-w-none">{formattedContent}</div>;
    };

    if (!summary) {
        return (
            <Card>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Current Affairs Analyst</h2>
                <p className="text-gray-600 mb-4">Get AI-powered summaries of important news, tailored for your selected exam.</p>
                { selectionPath && <p className="text-sm text-indigo-700 bg-indigo-100 p-2 rounded-md mb-6">Exam Context: <strong>{selectionPath}</strong></p> }

                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                        <div className="flex w-full rounded-lg bg-gray-200 p-1">
                            {FREQUENCIES.map(freq => (
                                <button
                                    key={freq}
                                    onClick={() => setFrequency(freq)}
                                    className={`w-full py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${frequency === freq ? 'bg-white text-indigo-700 shadow' : 'text-gray-600 hover:bg-gray-300/50'}`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <label htmlFor="focus-area" className="block text-sm font-medium text-gray-700 mb-2">Optional: Focus Area</label>
                        <input
                            id="focus-area"
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g., 'Recent Supreme Court judgements'"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-gray-100 transition"
                            disabled={isLoading || !isOnline}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <Button onClick={handleGenerateSummary} disabled={isLoading || !isOnline} className="w-full">
                        {isLoading ? 'Analyzing...' : 'Generate Summary'}
                    </Button>
                </div>

                {!isOnline && <p className="text-sm text-center text-orange-600 mt-4">Connect to the internet to use this feature.</p>}
                 {isLoading && (
                    <div className="text-center mt-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600 animate-pulse">Searching the web and compiling summary...</p>
                    </div>
                 )}
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Analysis for {selectionPath}</h2>
                    <p className="text-sm text-gray-500">{frequency} Briefing{topic && ` (focusing on ${topic})`}</p>
                </div>
                <Button onClick={handleReset} variant="secondary" className="flex-shrink-0">New Analysis</Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-[calc(100vh_-_18rem)] overflow-hidden">
                <div className="lg:col-span-2 overflow-y-auto pr-4 -mr-4">
                    <h3 className="text-lg font-semibold mb-3">AI-Generated Summary</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        {formatSummary(summary.text)}
                    </div>

                    <h3 className="text-lg font-semibold mt-6 mb-3">Sources</h3>
                    <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
                        {summary.sources.map((source, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <GlobeAltIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all" title={source.web.title}>
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-1 flex flex-col border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                     <h3 className="text-lg font-semibold mb-3">Follow-up Chat</h3>
                     <div className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-xl p-3 max-w-xs shadow-sm ${
                                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' :
                                    msg.role === 'model' ? 'bg-white text-gray-800 rounded-bl-none' :
                                    'bg-red-100 text-red-800 rounded-bl-none'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{formatMessageContent(msg.content)}</p>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex items-end mb-4 justify-start">
                                <div className="rounded-xl p-3 max-w-xs shadow-sm bg-white text-gray-800 rounded-bl-none">
                                    <div className="animate-pulse flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                     </div>
                     <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-400"
                            disabled={isChatLoading || !isOnline}
                        />
                        <Button type="submit" disabled={isChatLoading || !isOnline || !chatInput.trim()}>Send</Button>
                     </form>
                </div>
            </div>
        </Card>
    );
};

export default CurrentAffairsAnalyst;
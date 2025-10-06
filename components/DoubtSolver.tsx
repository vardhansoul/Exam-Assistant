

import React, { useState, useRef } from 'react';
import { solveImageQuery, getSpecificErrorMessage } from '../services/geminiService';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface DoubtSolverProps {
  language: string;
  isOnline: boolean;
}

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
        };
        reader.readAsDataURL(file);
    });

    return {
        base64: await base64EncodedDataPromise,
        mimeType: file.type,
    };
};

const DoubtSolver: React.FC<DoubtSolverProps> = ({ language, isOnline }) => {
    const [image, setImage] = useState<{ preview: string; file: File } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage({
                preview: URL.createObjectURL(file),
                file: file,
            });
            setResponse(null);
            setError(null);
        }
    };

    const handleSolveDoubt = async () => {
        if (!image || !isOnline) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const { base64, mimeType } = await fileToGenerativePart(image.file);
            const userPrompt = prompt || 'Explain the problem in this image.';
            const result = await solveImageQuery(base64, mimeType, userPrompt, language);
            setResponse(result);
        } catch (err) {
            setError(getSpecificErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatResponse = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('###')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
            if (line.startsWith('##')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
            if (line.startsWith('* ')) return <li key={index} className="ml-5 list-disc">{line.replace('* ', '').trim()}</li>;
            if (line.includes('**')) {
                const parts = line.split('**');
                return <p key={index} className="my-1">{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>;
            }
            return <p key={index} className="my-1">{line || '\u00A0'}</p>;
        });
    };

    const clearImage = () => {
        setImage(null);
        setResponse(null);
        setError(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">AI Doubt Solver</h2>
                    <p className="text-slate-500 mt-2">Stuck on a question? Take a photo and get an instant AI explanation.</p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Image Upload and Preview */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700">1. Upload your question</h3>
                        {image ? (
                             <div className="relative group">
                                <img src={image.preview} alt="Question preview" className="w-full h-auto rounded-lg border-2 border-slate-300" />
                                <button onClick={clearImage} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                                    X
                                </button>
                            </div>
                        ) : (
                            <div 
                                className="w-full h-64 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center p-4 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files[0]) {
                                        setImage({ preview: URL.createObjectURL(e.dataTransfer.files[0]), file: e.dataTransfer.files[0] });
                                    }
                                }}
                            >
                                <p className="font-semibold text-slate-600">Drag & drop an image</p>
                                <p className="text-sm text-slate-500">or</p>
                                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="mt-2">
                                    Browse Files
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                />
                            </div>
                        )}
                        <h3 className="font-bold text-slate-700 pt-4">2. Add context (optional)</h3>
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Explain this formula, or how to solve step 2."
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 disabled:bg-slate-100 transition"
                            rows={3}
                            disabled={!image}
                         />
                         <Button onClick={handleSolveDoubt} disabled={!image || isLoading || !isOnline} className="w-full !py-3">
                            {isLoading ? 'Analyzing...' : (isOnline ? 'Solve My Doubt' : 'You are Offline')}
                        </Button>
                    </div>

                    {/* Response Area */}
                     <div className="space-y-4">
                        <h3 className="font-bold text-slate-700">3. Get your explanation</h3>
                        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 min-h-[300px]">
                            {isLoading && (
                                <div className="flex flex-col justify-center items-center h-full text-center">
                                    <LoadingSpinner />
                                    <p className="mt-4 text-slate-600">AI is thinking...</p>
                                </div>
                            )}
                            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm font-medium">{error}</p>}
                            {response && (
                                <div className="prose prose-slate max-w-none">
                                    {formatResponse(response)}
                                </div>
                            )}
                            {!isLoading && !response && !error && (
                                <div className="flex justify-center items-center h-full">
                                    <p className="text-slate-500 text-center">Your explanation will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DoubtSolver;

import React, { useState, useRef, useEffect } from 'react';
import { solveImageQuery } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ContentRenderer from './ContentRenderer';
import ErrorMessage from './ErrorMessage';
import { checkAndIncrementDailyLimit } from '../firebase';

interface DoubtSolverProps {
  language: string;
  isOnline: boolean;
  user: User | null;
  canAccessPremium: boolean;
  requestAuth: () => void;
}

const STORAGE_KEY = 'doubt_solver_state';

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

const DoubtSolver: React.FC<DoubtSolverProps> = ({ language, isOnline, user, canAccessPremium, requestAuth }) => {
    const [image, setImage] = useState<{ preview: string; file: File } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize text fields from storage
    const [prompt, setPrompt] = useState(() => {
        const saved = getComponentState<{prompt: string, response: string | null}>(STORAGE_KEY);
        return saved?.prompt || '';
    });
    const [response, setResponse] = useState<string | null>(() => {
        const saved = getComponentState<{prompt: string, response: string | null}>(STORAGE_KEY);
        return saved?.response || null;
    });

    // Persist state
    useEffect(() => {
        saveComponentState(STORAGE_KEY, { prompt, response });
    }, [prompt, response]);

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
        if (!canAccessPremium) {
            requestAuth();
            return;
        }
        if (!image || !isOnline) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);

        if (user?.uid) {
            const limitCheck = await checkAndIncrementDailyLimit(user.uid, 'imageQuery');
            if (!limitCheck.allowed) {
                setError("You have reached your daily limit of 5 image queries. Please try again tomorrow.");
                setIsLoading(false);
                return;
            }
        }

        logActivity(user?.uid || null, {
            type: 'DOUBT_SOLVED' as HistoryType,
            description: 'Used the Doubt Solver',
            view: AppView.DOUBT_SOLVER,
            context: {}
        });

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
    
    const clearImage = () => {
        setImage(null);
        // Note: We don't clear response/prompt on image clear to prevent accidental data loss,
        // but user can clear them manually or upload new image.
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    
    if (!canAccessPremium) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the Doubt Solver.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">COC AI Doubt Solver</h2>
                    <p className="text-slate-500 mt-2">Stuck on a question? Take a photo and get an instant COC AI explanation.</p>
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
                                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="mt-2" disabled={!isOnline}>
                                    Browse Files
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    disabled={!isOnline}
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
                            disabled={!image && !response} // Allow editing if response exists
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
                                    <p className="mt-4 text-slate-600">COC AI is thinking...</p>
                                </div>
                            )}
                            <ErrorMessage message={error} onRetry={handleSolveDoubt} />
                            {response && (
                                <ContentRenderer content={response} className="prose prose-slate max-w-none" />
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

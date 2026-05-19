
import React, { useState, useEffect } from 'react';
import { generateResumeSummary } from '../services/geminiService';
import { getSpecificErrorMessage } from '../utils/errors';
import { logActivity, getComponentState, saveComponentState } from '../utils/tracking';
import type { ResumeData, User, HistoryType } from '../types';
import { AppView } from '../types';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import PrinterIcon from './icons/PrinterIcon';

interface AiResumeBuilderProps {
    language: string;
    isOnline: boolean;
    user: User | null;
    canAccessPremium: boolean;
    requestAuth: () => void;
}

const STORAGE_KEY = 'resume_builder_state';

const AiResumeBuilder: React.FC<AiResumeBuilderProps> = ({ language, isOnline, user, canAccessPremium, requestAuth }) => {
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    // Initialize from storage
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        const saved = getComponentState<ResumeData>(STORAGE_KEY);
        return saved || {
            fullName: '', email: '', phone: '', address: '', summary: '',
            workExperience: [], education: [], skills: [],
        };
    });

    // Persist
    useEffect(() => {
        saveComponentState(STORAGE_KEY, resumeData);
    }, [resumeData]);

    const handleInputChange = (field: keyof ResumeData, value: any) => {
        setResumeData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateSummary = async () => {
        if (!canAccessPremium) {
            requestAuth();
            return;
        }
        setIsLoading(prev => ({ ...prev, summary: true }));
        setError(null);
        try {
            const prompt = `
                Full Name: ${resumeData.fullName}
                Experience: ${resumeData.workExperience.map(w => `${w.jobTitle} at ${w.company}`).join(', ')}
                Skills: ${resumeData.skills.join(', ')}
            `;
            const summary = await generateResumeSummary(prompt, language);
            setResumeData(prev => ({ ...prev, summary }));
            logActivity(user?.uid || null, {
                type: 'RESUME_BUILT' as HistoryType,
                description: 'Generated a resume summary with COC',
                view: AppView.AI_RESUME_BUILDER,
                context: {}
            });
        } catch(err) {
            setError(getSpecificErrorMessage(err));
        }
        setIsLoading(prev => ({ ...prev, summary: false }));
    };

    const handlePrint = () => {
        window.print();
    };

    if (!canAccessPremium) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Premium Feature</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Please log in to use the COC Resume Builder.</p>
                    <div className="mt-6">
                        <Button onClick={requestAuth}>Log In</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start print-section-wrapper">
            {/* Form Section */}
            <div className="space-y-6 no-print">
                <h1 className="text-3xl font-bold text-slate-800">COC Resume Builder</h1>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
                <Card>
                    <h2 className="font-bold text-lg mb-4">Personal Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Full Name" value={resumeData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
                        <Input label="Email" type="email" value={resumeData.email} onChange={e => handleInputChange('email', e.target.value)} />
                        <Input label="Phone" type="tel" value={resumeData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                        <Input label="Address" value={resumeData.address} onChange={e => handleInputChange('address', e.target.value)} />
                    </div>
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Professional Summary</h2>
                        <Button onClick={handleGenerateSummary} disabled={!isOnline || isLoading.summary} className="!px-3 !py-1.5 text-xs flex items-center gap-1.5">
                            {isLoading.summary ? <LoadingSpinner /> : 'COC Generate'}
                        </Button>
                    </div>
                    <textarea value={resumeData.summary} onChange={e => handleInputChange('summary', e.target.value)} rows={5} className="w-full p-2 border rounded"/>
                </Card>
            </div>

            {/* Preview Section */}
            <div className="sticky top-24 print:static print:block print:w-full">
                <Card className="print:border-none print:shadow-none print:p-0">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 no-print">
                        <h2 className="font-bold text-lg">Live Preview</h2>
                        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-center" title="Print / Save PDF">
                            <PrinterIcon className="w-4 h-4" /> 
                        </Button>
                    </div>
                    <div id="resume-preview" className="bg-white p-8 border rounded-lg min-h-[60vh] text-sm print:border-none print:p-0 print:text-black">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-1">{resumeData.fullName || 'Your Name'}</h2>
                        <p className="text-center text-sm text-slate-600 mb-6">
                            {[resumeData.email, resumeData.phone, resumeData.address].filter(Boolean).join(' | ')}
                        </p>
                        
                        <div className="border-b-2 border-slate-300 mb-3 pb-1">
                            <h3 className="font-bold text-lg uppercase tracking-wide text-slate-800">Professional Summary</h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{resumeData.summary || 'Your professional summary will appear here.'}</p>
                    </div>
                </Card>
            </div>
            <style>{`
                @media print {
                    .no-print, header, .sidebar, .mobile-taskbar, button { display: none !important; }
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
                    /* Hide the form column */
                    .print-section-wrapper > div:first-child {
                        display: none !important;
                    }
                    /* Style the preview column */
                    .print-section-wrapper > div:last-child {
                        display: block !important;
                        width: 100% !important;
                        position: static !important;
                    }
                    
                    @page { margin: 1cm; }
                }
            `}</style>
        </div>
    );
};

export default AiResumeBuilder;

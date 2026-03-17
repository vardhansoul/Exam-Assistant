
import React, { useState } from 'react';
import { registerTrialUser } from '../firebase';
import { getDeviceFingerprint } from '../utils/tracking';
import { getSpecificErrorMessage } from '../utils/errors';
import Button from './Button';
import Input from './Input';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (phoneNumber: string) => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ isOpen, onClose, onVerificationSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trialOver, setTrialOver] = useState(false);
  
  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phoneNumber.trim()) {
        setError("All fields are required.");
        return;
    }

    // Strict Indian Phone Validation
    const rawNumber = phoneNumber.replace(/\D/g, '');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    
    if (!indianPhoneRegex.test(rawNumber)) {
        setError("Please enter a valid 10-digit Indian mobile number.");
        return;
    }

    const formattedNumber = '+91' + rawNumber;

    setIsLoading(true);

    try {
        const fingerprint = await getDeviceFingerprint();
        await registerTrialUser(name, email, formattedNumber, fingerprint);
        
        // Success Logic
        onVerificationSuccess(formattedNumber);
        
        // Clear form state
        setName('');
        setEmail('');
        setPhoneNumber('');
    } catch (err: any) {
        console.error("Trial Registration Error:", err);
        const message = err.message || getSpecificErrorMessage(err);
        
        if (message.includes("Trial Over")) {
             setTrialOver(true);
             setError(message.replace("Trial Over:", "").trim());
        } else {
             setError(message);
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const resetState = () => {
      setName('');
      setEmail('');
      setPhoneNumber('');
      setError(null);
      setIsLoading(false);
      setTrialOver(false);
      onClose();
  }

  if (!isOpen) return null;

  if (trialOver) {
    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-up overflow-y-auto">
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-sm text-center">
                    <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Trial Period Over</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">{error || "You have already used your free trial."}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Please sign up or log in to continue accessing premium features and unlimited practice.</p>
                    <div className="space-y-3">
                        <Button onClick={resetState} variant="secondary" className="w-full !py-3.5 text-lg">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
            <style>{`
            @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
          `}</style>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-up overflow-y-auto">
        <div className="flex-grow flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Start Free Trial</h2>
                    <button onClick={resetState} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleTrialSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                        autoFocus
                        disabled={isLoading}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                        disabled={isLoading}
                    />
                    <div className="space-y-1">
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) setPhoneNumber(val);
                            }}
                            required
                            placeholder="Phone Number"
                            maxLength={10}
                            disabled={isLoading}
                        />
                    </div>
                    
                    {error && <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-600 dark:text-red-300 text-sm">{error}</div>}
                    
                    <Button type="submit" className="w-full !py-3.5 text-lg" disabled={isLoading}>
                        {isLoading ? 'Activating...' : 'Activate 7-Day Trial'}
                    </Button>
                </form>
            </div>
        </div>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PhoneVerificationModal;

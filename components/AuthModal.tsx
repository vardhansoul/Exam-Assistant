
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { sendPasswordReset, signInWithEmailPassword } from '../firebase';
import { getSpecificErrorMessage } from '../utils/errors';
import Input from './Input';

interface AuthModalProps {
  onClose: () => void;
  onAuthStart?: () => void;
  onAuthEnd?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthStart, onAuthEnd }) => {
  const [mode, setMode] = useState<'signIn' | 'reset'>('signIn');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  
  // Toggle for Email Login
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // Access Code State
  const [accessCodeInput, setAccessCodeInput] = useState('');

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleAuthOperation = async (authPromise: Promise<any>) => {
    if (onAuthStart) onAuthStart();
    if (isMounted.current) {
        setIsLoading(true);
        setError(null);
        setResetMessage('');
    }

    try {
      await authPromise;
      if (isMounted.current) {
        onClose(); // Close modal on successful auth
      }
    } catch (err) {
      if (isMounted.current) {
        setError(getSpecificErrorMessage(err));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        if (onAuthEnd) onAuthEnd();
      }
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthOperation(signInWithEmailPassword(email, password));
  };
  
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (isMounted.current) {
        setIsLoading(true);
        setError(null);
        setResetMessage('');
    }

    try {
      await sendPasswordReset(email);
      if (isMounted.current) {
        setResetMessage('If an account with that email exists, a password reset link has been sent.');
      }
    } catch (err) {
      if (isMounted.current) {
        setError(getSpecificErrorMessage(err));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const renderContent = () => {
    switch (mode) {
        case 'reset':
            return ( <> <h2 className="text-3xl font-bold text-center mb-2">Reset Password</h2> <p className="text-slate-500 text-center mb-8">Enter your email to get a reset link.</p> <form onSubmit={handlePasswordResetSubmit} className="space-y-5"> {resetMessage && <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm mb-4">{resetMessage}</div>} <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} /> <Button type="submit" variant="primary" disabled={isLoading} className="w-full !py-3.5 text-lg mt-4">{isLoading ? 'Sending...' : 'Send Reset Link'}</Button> </form> </> );
        default: // signIn
            return ( 
                <> 
                    <h2 className="text-3xl font-bold text-center mb-2">Welcome Back!</h2> 
                    <p className="text-slate-500 text-center mb-8">Sign in to continue your journey.</p> 
                    
                    {!showEmailLogin && (
                        <div className="space-y-3">
                            <Button onClick={() => setShowEmailLogin(true)} variant="outline" className="w-full !py-3" disabled={isLoading}>
                                Sign in with Email
                            </Button>
                        </div>
                    )}

                    {showEmailLogin && (
                        <form onSubmit={handleEmailSignIn} className="space-y-5 animate-fade-in">
                            <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                            <div className="text-right"><button type="button" onClick={() => setMode('reset')} className="text-sm font-semibold text-indigo-600 hover:underline">Forgot Password?</button></div>
                            <div className="space-y-3 mt-4">
                                <Button type="submit" variant="primary" disabled={isLoading} className="w-full !py-3.5 text-lg">{isLoading ? 'Signing In...' : 'Sign In'}</Button>
                                <Button type="button" variant="ghost" onClick={() => setShowEmailLogin(false)} className="w-full" disabled={isLoading}>Cancel</Button>
                            </div>
                        </form>
                    )}
                </> 
            );
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-up overflow-y-auto">
        <header className="p-4 flex justify-end items-center absolute top-0 right-0 z-10 w-full">
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </header>
        <div className="flex-grow flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <ErrorMessage message={error} />
                {renderContent()}
                
                <div className="mt-8 text-center text-base">
                    {mode === 'reset' && (
                        <p>Remember your password? <button onClick={() => { setMode('signIn'); }} className="font-bold text-indigo-600 hover:underline">Sign In</button></p>
                    )}
                </div>
            </div>
        </div>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AuthModal;

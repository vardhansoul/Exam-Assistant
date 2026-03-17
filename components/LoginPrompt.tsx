
import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import { 
  sendPasswordReset, 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  handleGoogleSignIn,
  handleAdminGoogleSignIn,
  getSignupAccessCode
} from '../firebase';
import { migrateGuestDataToUser } from '../utils/tracking';
import { getSpecificErrorMessage } from '../utils/errors';
import Input from './Input';
import GoogleIcon from './icons/GoogleIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface SignInPageProps {
  initialError?: string | null;
  onAuthStart?: () => void;
  onAuthEnd?: () => void;
  onStartTrialFlow?: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ initialError, onAuthStart, onAuthEnd, onStartTrialFlow }) => {
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'reset'>('signIn');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  
  // Easter egg states
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAdminEntry, setShowAdminEntry] = useState(false);

  // Toggle for Email Login form
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // Admin Forms
  const [adminAccessCode, setAdminAccessCode] = useState('');

  // Standard Forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
        setError(initialError || null);
    }
  }, [initialError]);
  
  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);
    
    // 7 clicks to open Admin Entry
    if (newCount === 7) {
        setShowAdminEntry(true);
        setTitleClickCount(0);
        // Also unlock sign up if they stumble here
        setShowSignUp(true); 
    }
  };
  
  const handleAuthOperation = async (authPromise: Promise<any>) => {
    if (onAuthStart) onAuthStart();
    if (isMounted.current) {
        setIsLoading(true);
        setError(null);
        setResetMessage('');
    }

    try {
      await authPromise;
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

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthOperation((async () => {
      const { user } = await signUpWithEmailPassword(email, password, displayName);
      await migrateGuestDataToUser(user.uid);
    })());
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthOperation(signInWithEmailPassword(email, password));
  };

  const handleGoogleAuth = () => {
    handleAuthOperation(handleGoogleSignIn());
  };

  const handleAdminLogin = () => {
    handleAuthOperation(handleAdminGoogleSignIn());
  };
  
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (onAuthStart) onAuthStart();
    if (isMounted.current) {
        setIsLoading(true);
        setError(null);
        setResetMessage('');
    }

    try {
      await sendPasswordReset(email);
      if (isMounted.current) {
        setResetMessage('If an account with that email exists, a password reset link has been sent. Please check your inbox and spam folder.');
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

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      try {
          const correctCode = await getSignupAccessCode();
          if (adminAccessCode === correctCode) {
              setShowSignUp(true);
              setShowAdminEntry(false);
              setAdminAccessCode('');
              alert("Sign Up unlocked.");
          } else {
              setError("Invalid Access Code.");
          }
      } catch (err) {
          setError(getSpecificErrorMessage(err));
      } finally {
          setIsLoading(false);
      }
  };
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resetMessage) {
      timer = setTimeout(() => {
        if (isMounted.current) {
            setMode('signIn');
            setResetMessage('');
        }
      }, 5000); 
    }
    return () => clearTimeout(timer);
  }, [resetMessage]);


  const renderContent = () => {
    if (showAdminEntry) {
        return (
            <div className="animate-fade-in">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                        <ShieldCheckIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Access</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Verify code to enable Sign Up</p>
                </div>
                <form onSubmit={handleVerifyAccessCode} className="space-y-4">
                    <Input 
                        label="Access Code" 
                        type="password" 
                        value={adminAccessCode} 
                        onChange={e => setAdminAccessCode(e.target.value)} 
                        autoFocus
                        required 
                        disabled={isLoading} 
                    />
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setShowAdminEntry(false)} className="flex-1" disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !adminAccessCode} className="flex-1">
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </div>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                        <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Administrators</span>
                        </div>
                    </div>
                    
                    <Button type="button" onClick={handleAdminLogin} variant="secondary" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
                        <GoogleIcon className="w-5 h-5" />
                        Login with Google
                    </Button>
                </form>
            </div>
        );
    }

    switch (mode) {
      case 'signUp':
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">Join the Ranks of Achievers</h2>
            <form onSubmit={handleEmailSignUp} className="mt-8 text-left space-y-4">
              <Input label="Full Name" type="text" id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} required disabled={isLoading} />
              <Input label="Email Address" type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
              <Input label="Password" type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
              <div className="pt-2 space-y-3">
                <Button type="submit" disabled={isLoading || !email || !password || !displayName} className="w-full !py-3">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </>
        );
      case 'reset':
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">Recover Your Access</h2>
            <p className="mt-2 text-center text-slate-600 dark:text-slate-400">Enter your email to receive a password reset link.</p>
            <form onSubmit={handlePasswordResetSubmit} className="mt-8 text-left space-y-4">
              {resetMessage && (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-md text-sm">
                      {resetMessage}
                      <p className="mt-1 text-xs">Returning to sign-in shortly...</p>
                  </div>
              )}
              <Input label="Email Address" type="email" id="reset-email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              <div className="pt-2 space-y-3">
                <Button type="submit" disabled={isLoading || !email} className="w-full !py-3">
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </>
        );
      case 'signIn':
      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">Continue Your Journey</h2>
            
            <div className="mt-6 space-y-3">
                <Button onClick={handleGoogleAuth} variant="secondary" className="w-full !py-3 flex items-center justify-center gap-2" disabled={isLoading}>
                    <GoogleIcon className="w-5 h-5" />
                    Sign in with Google
                </Button>
                
                {!showEmailLogin && (
                    <Button onClick={() => setShowEmailLogin(true)} variant="outline" className="w-full !py-3 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700" disabled={isLoading}>
                        Sign in with Email
                    </Button>
                )}
            </div>
            
            {showEmailLogin && (
                <div className="animate-fade-in">
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Email Login</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignIn} className="text-left space-y-4">
                        <Input label="Email Address" type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                        <Input label="Password" type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                        <div className="text-right">
                            <button type="button" onClick={() => setMode('reset')} className="text-sm font-semibold text-indigo-600 hover:underline">Forgot Password?</button>
                        </div>
                        <div className="pt-2 space-y-3">
                            <Button type="submit" disabled={isLoading || !email || !password} className="w-full !py-3">
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setShowEmailLogin(false)} className="w-full" disabled={isLoading}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <h1 onClick={handleTitleClick} className="text-3xl font-bold text-slate-800 dark:text-slate-100 select-none cursor-pointer hover:opacity-90 transition-opacity" title="Club of Competition">Club of Competition</h1>
            <p className="mt-2 text-md text-slate-500 dark:text-slate-400">Your COC AI-Powered Gateway to Success</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <ErrorMessage message={error} />
          
          {!showAdminEntry && (
              <div className="space-y-4 mb-6">
                <Button onClick={onStartTrialFlow} variant="primary" className="w-full !py-3 text-base" disabled={isLoading}>
                    Start 7-Day Free Trial
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or</span>
                    </div>
                </div>
              </div>
          )}

          {renderContent()}

        </div>
        {!showAdminEntry && (
            <div className="mt-6 text-center text-sm">
                {mode === 'signIn' && (
                    showSignUp ? (
                        <p className="text-slate-600 dark:text-slate-400">Don't have an account? <button onClick={() => setMode('signUp')} className="font-semibold text-indigo-600 hover:underline">Sign Up</button></p>
                    ) : (
                        <p className="h-5">&nbsp;</p> 
                    )
                )}
                {mode === 'signUp' && (
                    <p className="text-slate-600 dark:text-slate-400">Already have an account? <button onClick={() => setMode('signIn')} className="font-semibold text-indigo-600 hover:underline">Sign In</button></p>
                )}
                {mode === 'reset' && (
                    <p className="text-slate-600 dark:text-slate-400">Remember your password? <button onClick={() => setMode('signIn')} className="font-semibold text-indigo-600 hover:underline">Back to Sign In</button></p>
                )}
            </div>
        )}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>Made with ❤️ for students and aspirants in India.</p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SignInPage;

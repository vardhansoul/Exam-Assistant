

import React, { useState } from 'react';
import { auth, GoogleAuthProvider, signInWithRedirect } from '../firebase';
import Card from './Card';
import Button from './Button';

const AdminLogin: React.FC = () => {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = () => {
        setIsRedirecting(true);
        setError(null);
        sessionStorage.setItem('postLoginDestination', 'ADMIN');
        const provider = new GoogleAuthProvider();
        signInWithRedirect(auth, provider).catch(err => {
            console.error("Redirect initiation failed", err);
            setError(`Could not start the sign-in process: ${err.message}`);
            setIsRedirecting(false);
            sessionStorage.removeItem('postLoginDestination');
        });
    };

    return (
        <Card className="w-full text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Administrator Access</h2>
            <p className="text-slate-500 mt-2 mb-6">
                Please sign in with an authorized Google account.
            </p>
            
            {error && (
                <p className="text-red-600 bg-red-100 p-3 rounded-md my-4 text-sm font-medium">
                    {error}
                </p>
            )}

            <div className="my-6">
                <Button onClick={handleGoogleLogin} variant="secondary" className="w-full !py-3 flex items-center justify-center gap-3" disabled={isRedirecting}>
                    {isRedirecting ? 'Redirecting...' : 'Sign in with Google'}
                </Button>
            </div>
            
            <div className="text-xs text-slate-400 border-t border-slate-200/80 pt-4 mt-6">
                <p>Not an administrator? Return to the main application.</p>
                <a href="/" className="text-teal-600 hover:underline font-semibold mt-1 inline-block">
                    Go to Club of Competition
                </a>
            </div>
        </Card>
    );
}

export default AdminLogin;
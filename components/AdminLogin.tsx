

import React, { useState } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup } from '../firebase';
import Card from './Card';
import Button from './Button';

const AdminLogin: React.FC = () => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // onAuthStateChanged in admin.tsx will handle the state change.
        } catch (err: any) {
            console.error("Popup sign-in failed", err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(`Sign-in failed: ${err.message}`);
            }
        } finally {
            setIsLoggingIn(false);
        }
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
                <Button onClick={handleGoogleLogin} variant="secondary" className="w-full !py-3 flex items-center justify-center gap-3" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                </Button>
            </div>
            
            <div className="text-xs text-slate-400 border-t border-slate-200/80 pt-4 mt-6">
                <p>Not an administrator? Return to the main application.</p>
                <a href="/" className="text-indigo-600 hover:underline font-semibold mt-1 inline-block">
                    Go to Club of Competition
                </a>
            </div>
        </Card>
    );
}

export default AdminLogin;
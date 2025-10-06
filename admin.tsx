import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { auth, db, onAuthStateChanged, signOut, getDoc, doc } from './firebase';
import type { UserProfile } from './types';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import LoadingSpinner from './components/LoadingSpinner';

const AdminApp: React.FC = () => {
    const [userState, setUserState] = useState<'loading' | 'admin' | 'guest' | 'access-denied'>('loading');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUserState('guest');
                return;
            }

            // User is signed in, now verify their role from Firestore.
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setUserState('admin');
                } else {
                    // This user is not an admin, deny access and sign them out.
                    setUserState('access-denied');
                    await signOut(auth);
                }
            } catch (error) {
                console.error("Error verifying admin role:", error);
                setUserState('access-denied');
                await signOut(auth);
            }
        });
        
        return () => unsubscribe();
    }, []);

    const renderContent = () => {
        switch (userState) {
            case 'loading':
                return <LoadingSpinner />;
            case 'admin':
                return <AdminDashboard />;
            case 'guest':
                return (
                    <div className="w-full max-w-md">
                        <AdminLogin />
                    </div>
                );
            case 'access-denied':
                return (
                    <div className="w-full max-w-md text-center p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
                        <p className="text-slate-600 mt-2">You do not have administrative privileges. You have been signed out.</p>
                        <p className="text-sm text-slate-500 mt-4">Please sign in with an authorized account.</p>
                         <div className="mt-6 w-full max-w-md">
                            <AdminLogin />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
                Club of Competition - <span className="text-indigo-600">Admin Panel</span>
            </h1>
            <div className="w-full max-w-6xl">
              {renderContent()}
            </div>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
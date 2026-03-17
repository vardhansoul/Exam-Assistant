
import React from 'react';
import Button from './Button';
import CheckCircleIcon from './icons/CheckCircleIcon';
import LockClosedIcon from './icons/LockClosedIcon';

interface GuestWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode; available: boolean }> = ({ children, available }) => (
    <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-6 h-6 mt-1 ${available ? 'text-green-500' : 'text-red-400'}`}>
            {available ? <CheckCircleIcon /> : <LockClosedIcon />}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{children}</p>
    </div>
);

const GuestWelcomeModal: React.FC<GuestWelcomeModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-up" 
    >
      <header className="p-6 border-b border-slate-200 dark:border-slate-700 text-center flex-shrink-0">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome to Guest Mode!</h2>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-2">Here’s a quick tour of what you can do.</p>
      </header>

      <div className="overflow-y-auto p-6 md:p-10 flex-grow">
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h3 className="font-bold text-2xl text-green-600 dark:text-green-400 mb-6 border-b pb-2">Available in Guest Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureItem available>
                        <strong>Browse & Select Exams:</strong> Choose from our entire library of national, state, and entrance exams.
                    </FeatureItem>
                    <FeatureItem available>
                        <strong>View Syllabus:</strong> See the complete high-level syllabus for any exam you select.
                    </FeatureItem>
                    <FeatureItem available>
                        <strong>Track Progress Locally:</strong> Use the Syllabus Tracker to check off topics. Your progress is saved on this device.
                    </FeatureItem>
                    <FeatureItem available>
                        <strong>Local Bookmarks & Settings:</strong> Bookmark topics and customize display settings. Everything is stored in your browser.
                    </FeatureItem>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-2xl text-red-500 dark:text-red-400 mb-6 border-b pb-2">Sign Up to Unlock COC AI Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureItem available={false}>
                        <strong>COC AI Tutor & Quiz Generation:</strong> Get personalized help, generate quizzes, and receive detailed explanations.
                    </FeatureItem>
                    <FeatureItem available={false}>
                        <strong>COC AI-Powered Study Tools:</strong> Access the full Tools Hub, including Mind Maps, Guess Papers, and the Adaptive Learning Path.
                    </FeatureItem>
                     <FeatureItem available={false}>
                        <strong>Mock Interviews & Career Compass:</strong> Practice for interviews and get career guidance from COC AI.
                    </FeatureItem>
                    <FeatureItem available={false}>
                        <strong>Cloud Sync:</strong> Save your progress, history, and settings to your account and access them from any device.
                    </FeatureItem>
                </div>
            </div>
        </div>
      </div>

      <footer className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={onSwitchToLogin} variant="secondary" className="!py-3 text-lg">
                Sign Up / Log In
            </Button>
            <Button onClick={onClose} className="!py-3 text-lg">
                Continue as Guest
            </Button>
        </div>
      </footer>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GuestWelcomeModal;

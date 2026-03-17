import React, { useEffect } from 'react';

interface NotificationBannerProps {
  message: string;
  type: 'error' | 'success';
  onDismiss: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
    }
  };

  const { bg, text } = styles[type];


  return (
    <div className={`fixed top-4 sm:top-20 right-4 z-50 p-4 rounded-md shadow-lg ${bg} ${text} flex items-start gap-3 animate-slide-in-right`}>
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
       <div className="flex-shrink-0">
         <button onClick={onDismiss} className="p-1 -m-1 rounded-full hover:bg-black/10">
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
        </button>
      </div>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default NotificationBanner;


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

  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-lg ${bgColor} ${textColor} flex items-center gap-3 animate-slide-in-right`}>
      <span className="font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-black/10">
        X
      </button>
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
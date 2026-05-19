import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineBannerProps {
    isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
    const [showBanner, setShowBanner] = useState(!isOnline);
    const [justCameOnline, setJustCameOnline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowBanner(true);
            setJustCameOnline(false);
        } else if (isOnline && showBanner) {
            // They were offline and just came back online
            setJustCameOnline(true);
            const timer = setTimeout(() => {
                setShowBanner(false);
                setJustCameOnline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, showBanner]);

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`fixed top-0 left-0 w-full z-[100] px-4 py-3 flex items-center justify-center space-x-2 text-sm font-medium shadow-md ${
                        justCameOnline 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-800 text-amber-300 dark:bg-amber-900/90 dark:text-amber-100'
                    }`}
                >
                    {justCameOnline ? (
                        <>
                            <Wifi className="w-4 h-4 animate-pulse" />
                            <span>Back Online! Syncing data...</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4" />
                            <span>You are currently offline. Running from local cache.</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

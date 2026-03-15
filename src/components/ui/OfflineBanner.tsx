import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Sticky banner that appears when the browser loses network connectivity.
 * Listens to `online`/`offline` events and `navigator.onLine`.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-amber-500 text-white text-sm font-medium px-4 py-2 shadow-md"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You're offline. Some features may be unavailable until your connection is restored.</span>
    </div>
  );
};

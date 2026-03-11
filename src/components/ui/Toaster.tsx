import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * App-wide toast notification container.
 * Drop into RootLayout — all toasts rendered here.
 */
export const Toaster: React.FC = () => (
  <SonnerToaster
    position="bottom-right"
    toastOptions={{
      className:
        'bg-white text-slate-900 border border-slate-200 shadow-lg rounded-xl text-sm font-medium',
      duration: 3500,
    }}
    richColors
    closeButton
  />
);

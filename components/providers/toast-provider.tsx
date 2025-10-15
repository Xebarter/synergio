'use client';

import * as React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast as useToastHook, toast as toastFn } from '@/components/ui/use-toast';

const ToastContext = React.createContext<ReturnType<typeof useToastHook> | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToastHook();
  
  // Make toast function available globally for easier access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Adding to window for global access
      window.toast = toastFn;
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

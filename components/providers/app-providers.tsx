'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { ToastProvider } from '@/hooks/use-toast';

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props} enableSystem={false} attribute="class">
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
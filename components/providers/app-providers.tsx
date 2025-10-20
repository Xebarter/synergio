'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { Toaster } from '@/components/ui/toaster';

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props} enableSystem={false} attribute="class">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
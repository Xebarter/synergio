'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props} enableSystem={false} attribute="class">
      {children}
    </ThemeProvider>
  );
}
'use client';

import { AppProviders } from '@/components/providers/app-providers';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
}
"use client"

import React, { memo } from 'react';
import { PersistentSidebar } from './persistent-sidebar';
import { PersistentHeader } from './persistent-header';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  role: string;
  points: number;
  avatar?: string;
}

interface MainLayoutProps {
  user?: User;
  children: React.ReactNode;
  className?: string;
}

const MainLayout = memo(({ user, children, className }: MainLayoutProps) => {
  // Provide default user data if not provided
  const defaultUser = {
    name: 'Guest',
    email: '',
    role: 'guest',
    points: 0
  };
  
  const actualUser = user || defaultUser;

  // Return null if user is an admin, as this layout is only for non-admin routes
  if (actualUser.role === 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-none">
        <PersistentSidebar user={actualUser} />
      </div>
      
      {/* Main content area that sits to the right of the sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PersistentHeader user={actualUser} />
        
        <Separator />
        
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50", className)}>
          {children}
        </main>
      </div>
    </div>
  );
});

export default MainLayout;
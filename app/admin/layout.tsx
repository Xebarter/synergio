"use client"

import React from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar - completely independent from main app */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen transition-all duration-300">
        {/* Admin Header - completely independent from main app */}
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
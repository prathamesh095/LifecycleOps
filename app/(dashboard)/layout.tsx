import React from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { SidebarProvider } from '@/components/sidebar/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <Sidebar />
        
        <div className="lg:pl-64">
          <Topbar />
          <main>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

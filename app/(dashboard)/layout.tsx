'use client';

import React from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Topbar } from '@/components/dashboard/Topbar';
import { cn } from '@/lib/utils';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavigation />
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "pb-24 md:pb-28 lg:pb-32" // Space for bottom nav
      )}>
        <Topbar />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutContent>
      {children}
    </DashboardLayoutContent>
  );
}

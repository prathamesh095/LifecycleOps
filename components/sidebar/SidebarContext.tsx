'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SidebarContextType = {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  // Close sidebar on route change (handled in Sidebar component usually, but good to have here or in layout)
  // Actually, we'll handle it in the Sidebar component by listening to pathname changes.

  return (
    <SidebarContext.Provider
      value={{ isMobileOpen, toggleMobileSidebar, closeMobileSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

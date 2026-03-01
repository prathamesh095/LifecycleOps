'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SidebarContextType = {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    
    // Use setTimeout to avoid synchronous setState warning in useEffect
    const timer = setTimeout(() => {
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebar-collapsed', String(newState));
      return newState;
    });
  };

  return (
    <SidebarContext.Provider
      value={{ 
        isMobileOpen, 
        isCollapsed: isMounted ? isCollapsed : false, 
        toggleMobileSidebar, 
        closeMobileSidebar, 
        toggleCollapsed 
      }}
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

'use client';

import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Bell, 
  BarChart2, 
  Menu,
  X,
  Settings,
  HelpCircle
} from 'lucide-react';
import { NavItem } from './NavItem';
import { useSidebar } from './SidebarContext';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { drawer } from '@/lib/motion/presets';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/applications', icon: Briefcase },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
];

const QUICK_LINKS = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help & Support', href: '/help', icon: HelpCircle },
];

function SidebarContent() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex h-full flex-col bg-neutral-50/50 border-r border-neutral-200/60 backdrop-blur-xl">
      {/* Logo Area */}
      <div className="flex h-18 shrink-0 items-center px-6 pt-2">
        <div className="flex items-center gap-3 font-bold text-lg text-neutral-900 tracking-tight">
          <div className="h-8 w-8 rounded-xl bg-neutral-900 flex items-center justify-center text-white text-sm shadow-sm shadow-neutral-900/20">A</div>
          ApexJob
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
            />
          ))}
        </div>

        <div>
          <h3 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400/80">
            Quick Links
          </h3>
          <div className="flex flex-col gap-1">
            {QUICK_LINKS.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Divider */}
      <div className="px-6 py-2">
        <div className="h-px bg-neutral-200/60" />
      </div>

      {/* Bottom Utility Area */}
      <div className="p-4">
        <div className="rounded-2xl bg-white border border-neutral-200/60 p-4 text-xs text-neutral-500 shadow-sm">
          <p className="font-medium text-neutral-900 text-sm mb-0.5">Pro Plan</p>
          <p className="leading-relaxed">Your team is growing fast.</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  // Close sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMobileSidebar]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 z-40 bg-neutral-900/20 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              {...drawer}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-50 shadow-xl lg:hidden"
            >
              <SidebarContent />
              
              {/* Close Button (Mobile Only) */}
              <button 
                onClick={closeMobileSidebar}
                className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileTrigger() {
  const { toggleMobileSidebar } = useSidebar();
  
  return (
    <button
      onClick={toggleMobileSidebar}
      className="p-2 -ml-2 rounded-md text-neutral-600 hover:bg-neutral-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-neutral-200"
      aria-label="Open sidebar"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

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
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavItem } from './NavItem';
import { useSidebar } from './SidebarContext';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { drawer, pressable } from '@/lib/motion/presets';

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

function SidebarContent({ isMobile = false, onItemClick }: { isMobile?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  const showText = isMobile || !isCollapsed;

  return (
    <div className="flex h-full flex-col bg-neutral-50 border-r border-neutral-200 relative group/sidebar">
      {/* Logo Area */}
      <div className={cn(
        "flex h-18 shrink-0 items-center px-6 pt-2 transition-all duration-300",
        !showText && "px-0 justify-center"
      )}>
        <div className="flex items-center gap-3 font-bold text-lg text-neutral-900 tracking-tight">
          <div className="h-8 w-8 rounded-xl bg-neutral-900 flex items-center justify-center text-white text-sm shadow-sm shadow-neutral-900/20 shrink-0">A</div>
          {showText && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="whitespace-nowrap"
            >
              ApexJob
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto px-4 py-6 space-y-8 transition-all duration-300",
        !showText && "px-2"
      )}>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
              isCollapsed={!showText}
              onClick={onItemClick}
            />
          ))}
        </div>

        <div>
          {showText ? (
            <h3 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400/80">
              Quick Links
            </h3>
          ) : (
            <div className="h-px bg-neutral-200/60 my-6 mx-2" />
          )}
          <div className="flex flex-col gap-1">
            {QUICK_LINKS.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={isActive(item.href)}
                isCollapsed={!showText}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Utility Area */}
      <div className={cn("p-4 transition-all duration-300", !showText && "p-2")}>
        {showText ? (
          <div className="rounded-2xl bg-white border border-neutral-200/60 p-4 text-xs text-neutral-500 shadow-sm">
            <p className="font-medium text-neutral-900 text-sm mb-0.5">Pro Plan</p>
            <p className="leading-relaxed">Your team is growing fast.</p>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200/60 flex items-center justify-center mx-auto shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Collapse Toggle (Desktop Only) */}
      {!isMobile && (
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm opacity-0 group-hover/sidebar:opacity-100 transition-all hover:text-neutral-900 hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileSidebar, isCollapsed } = useSidebar();

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

  // Scroll lock and Focus trap
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap (simple)
      const timer = setTimeout(() => {
        const closeBtn = document.querySelector('[aria-label="Close sidebar"]') as HTMLElement;
        closeBtn?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen]);

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside 
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:z-30 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence mode="wait">
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              {...drawer}
              className="absolute inset-y-0 left-0 w-72 bg-neutral-50 shadow-2xl border-r border-neutral-200"
            >
              <SidebarContent isMobile onItemClick={closeMobileSidebar} />
              
              {/* Close Button (Mobile Only) */}
              <button 
                onClick={closeMobileSidebar}
                className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 bg-white/50 backdrop-blur-sm rounded-full shadow-sm border border-neutral-200/60"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
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
      className="p-2 -ml-2 rounded-xl text-neutral-600 hover:bg-neutral-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-colors"
      aria-label="Open sidebar"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

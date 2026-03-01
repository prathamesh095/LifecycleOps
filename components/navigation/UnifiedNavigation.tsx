'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Bell, 
  BarChart2, 
  MoreHorizontal,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/applications', icon: Briefcase },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
];

const MORE_ITEMS = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help & Support', href: '/help', icon: HelpCircle },
];

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type NavItemProps = {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
};

// ----------------------------------------------------------------------
// HOOKS
// ----------------------------------------------------------------------

function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      
      // Safety guards:
      // 1. Always visible at top of page (threshold 50px)
      // 2. Always visible if scrolling up
      // 3. Hide only on significant down scroll (>12px delta)
      if (scrollY < 50) {
        setIsVisible(true);
      } else if (direction === "up") {
        setIsVisible(true);
      } else if (direction === "down" && Math.abs(scrollY - lastScrollY) > 12) {
        setIsVisible(false);
      }

      setLastScrollY(scrollY > 0 ? scrollY : 0);
      
      // Idle intelligence: Restore after 1.5s of inactivity
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    };

    // Passive listener for performance
    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  return isVisible;
}

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

function NavItem({ item, isActive, onClick, isMobile, isTablet, isDesktop }: NavItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20",
        // Mobile: Stacked Icon + Label
        isMobile && "flex-col gap-1 w-full h-full py-1 rounded-xl",
        // Tablet: Icon + Label (Row) - Large touch targets
        isTablet && "flex-1 gap-3 px-2 py-3 hover:bg-neutral-100/50 rounded-full min-h-[48px]",
        // Desktop: Icon Only
        isDesktop && "p-3 hover:bg-neutral-100 rounded-full"
      )}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active Indicator Background (Desktop/Tablet) */}
      {(isTablet || isDesktop) && isActive && (
        <motion.div
          layoutId="activeNavBubble"
          className="absolute inset-0 bg-neutral-900/5 rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.25 }}
        />
      )}

      {/* Icon */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={isDesktop ? { y: -2 } : {}}
        transition={{ duration: 0.16 }}
      >
        <Icon 
          className={cn(
            "transition-colors duration-200",
            isMobile && "h-6 w-6",
            isTablet && "h-5 w-5",
            isDesktop && "h-5 w-5",
            isActive ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-700"
          )} 
          strokeWidth={isActive ? 2.5 : 2}
        />
      </motion.div>

      {/* Label (Mobile & Tablet) */}
      {(isMobile || isTablet) && (
        <span className={cn(
          "font-medium transition-colors duration-200",
          isMobile && "text-[10px] leading-none",
          isTablet && "text-sm",
          isActive ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-700"
        )}>
          {item.label}
        </span>
      )}

      {/* Active Dot (Mobile) */}
      {isMobile && isActive && (
        <motion.div
          layoutId="activeNavDot"
          className="absolute top-1 right-1/2 translate-x-1/2 -mt-1 w-1 h-1 bg-neutral-900 rounded-full"
        />
      )}
    </button>
  );
}

function MoreMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed bottom-24 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-50 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden origin-bottom"
          >
            <div className="p-2 space-y-1">
              {MORE_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors"
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function UnifiedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isVisible = useScrollDirection();

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsMoreOpen(false);
  };

  // Animation variants for different devices
  const mobileVariants = {
    visible: { y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const } },
    hidden: { y: "100%", transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const tabletVariants = {
    visible: { y: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" as const } },
    hidden: { y: 20, opacity: 0, transition: { duration: 0.22, ease: "easeIn" as const } }
  };

  const desktopVariants = {
    visible: { y: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" as const } },
    hidden: { y: 0, opacity: 0.6, transition: { duration: 0.24, ease: "easeIn" as const } } // Subtle fade for desktop
  };

  return (
    <>
      {/* 
        MOBILE NAV (< 768px)
        Full width bottom bar
      */}
      <motion.nav 
        initial="visible"
        animate={isVisible ? "visible" : "hidden"}
        variants={mobileVariants}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-neutral-200/50 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={() => handleNavClick(item.href)}
              isMobile
            />
          ))}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="relative flex flex-col gap-1 items-center justify-center w-full h-full py-1 text-neutral-500"
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </motion.nav>

      {/* 
        TABLET NAV (768px - 1023px)
        Floating centered dock - Refined
      */}
      <motion.nav 
        initial="visible"
        animate={isVisible ? "visible" : "hidden"}
        variants={tabletVariants}
        className="hidden md:flex lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[clamp(420px,60vw,720px)]"
      >
        <div className="flex items-center justify-evenly w-full bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl shadow-neutral-900/10 rounded-full p-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={() => handleNavClick(item.href)}
              isTablet
            />
          ))}
          <div className="w-px h-8 bg-neutral-200/60 mx-2" />
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              "p-3 rounded-full hover:bg-neutral-100/50 transition-colors flex-shrink-0",
              isMoreOpen ? "bg-neutral-100 text-neutral-900" : "text-neutral-500"
            )}
            aria-label="More menu"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </motion.nav>

      {/* 
        DESKTOP NAV (≥ 1024px)
        Floating bubble (bottom-right or centered - choosing centered for balance)
      */}
      <motion.nav 
        initial="visible"
        animate={isVisible ? "visible" : "hidden"}
        variants={desktopVariants}
        className="hidden lg:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-neutral-900/10 rounded-full p-2 pl-4 pr-2 ring-1 ring-neutral-900/5 transition-all hover:scale-[1.01] hover:shadow-neutral-900/15">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={() => handleNavClick(item.href)}
              isDesktop
            />
          ))}
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              "p-3 rounded-full hover:bg-neutral-100 transition-colors",
              isMoreOpen ? "bg-neutral-100 text-neutral-900" : "text-neutral-500"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </motion.nav>

      <MoreMenu isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}

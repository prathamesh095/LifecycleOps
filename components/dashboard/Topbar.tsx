'use client';

import { usePathname } from 'next/navigation';
import { MobileTrigger } from '@/components/sidebar/Sidebar';
import { Search, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { pressable } from '@/lib/motion/presets';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/applications': 'Applications',
  '/contacts': 'Contacts',
  '/reminders': 'Reminders',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/help': 'Help & Support',
};

export function Topbar() {
  const pathname = usePathname();
  
  // Find the matching title, or default to 'ApexJob'
  // Handle nested routes (e.g., /applications/123 -> Applications)
  const currentTitle = Object.entries(ROUTE_TITLES).find(([route]) => 
    pathname === route || (route !== '/dashboard' && pathname.startsWith(route))
  )?.[1] || 'ApexJob';

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-4 border-b border-neutral-200/60 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8 transition-all">
      <MobileTrigger />
      
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-neutral-900 lg:hidden">{currentTitle}</span>
          
          {/* Search - Hidden on mobile for simplicity, or icon only */}
          <div className="hidden md:flex items-center relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-10 w-72 rounded-full border border-neutral-200/80 bg-neutral-50/50 pl-10 pr-4 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-neutral-100 transition-all duration-200 ease-out shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <motion.button 
            {...pressable}
            className="rounded-full p-2.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-100"
          >
            <Bell className="h-5 w-5" />
          </motion.button>
          <motion.div 
            {...pressable}
            className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-medium text-xs border border-neutral-200 ring-2 ring-white shadow-sm cursor-pointer hover:bg-neutral-200 transition-colors"
          >
            JD
          </motion.div>
        </div>
      </div>
    </header>
  );
}

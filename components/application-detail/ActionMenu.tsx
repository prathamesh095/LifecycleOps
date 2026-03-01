'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MoreHorizontal, 
  Copy, 
  Share2, 
  ExternalLink, 
  Trash2, 
  Check, 
  ChevronRight, 
  Calendar, 
  Activity,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pressable } from '@/lib/motion/presets';
import { ApplicationStatus, APPLICATION_STATUS } from '@/lib/schemas';

interface ActionMenuProps {
  onCopyLink: () => void;
  onShare: () => void;
  onViewPosting?: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: ApplicationStatus) => void;
  onScheduleFollowUp: () => void;
  currentStatus: ApplicationStatus;
  disabled?: boolean;
}

export function ActionMenu({ 
  onCopyLink, 
  onShare, 
  onViewPosting, 
  onDelete, 
  onUpdateStatus,
  onScheduleFollowUp,
  currentStatus,
  disabled 
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'main' | 'status'>('main');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu('main');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { 
      label: 'Update Status', 
      icon: Activity, 
      onClick: () => setActiveSubmenu('status'),
      hasSubmenu: true,
      value: currentStatus.toLowerCase()
    },
    { 
      label: 'Schedule Follow-Up', 
      icon: Calendar, 
      onClick: () => {
        onScheduleFollowUp();
        setIsOpen(false);
      }
    },
    { label: 'Copy Link', icon: Copy, onClick: onCopyLink },
    { label: 'Share Application', icon: Share2, onClick: onShare },
    ...(onViewPosting ? [{ label: 'View Posting', icon: ExternalLink, onClick: onViewPosting }] : []),
  ];

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        {...pressable}
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setActiveSubmenu('main');
        }}
        className={cn(
          "h-10 px-4 flex items-center gap-2 rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-all",
          isOpen && "ring-2 ring-neutral-900/5 border-neutral-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="text-sm font-semibold text-neutral-700">Actions</span>
        <MoreHorizontal className="h-4 w-4 text-neutral-400" />
      </motion.button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={activeSubmenu}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full right-0 mt-2 w-64 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 py-2 z-[120] overflow-hidden"
          >
            {activeSubmenu === 'main' ? (
              <>
                <div className="px-4 py-2 mb-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Application Actions</span>
                </div>
                
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-900/5 hover:text-neutral-900 group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
                      {item.label}
                    </div>
                    {item.hasSubmenu && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">{item.value}</span>
                        <ChevronRight className="h-3 w-3 text-neutral-300" />
                      </div>
                    )}
                  </button>
                ))}

                <div className="h-px bg-neutral-100 my-1 mx-2" />

                <button
                  onClick={() => {
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Application
                </button>
              </>
            ) : (
              <>
                <div className="px-2 py-1 mb-1 flex items-center">
                  <button 
                    onClick={() => setActiveSubmenu('main')}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-400 rotate-180" />
                  </button>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Update Status</span>
                </div>
                
                {APPLICATION_STATUS.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdateStatus(status);
                      setIsOpen(false);
                      setActiveSubmenu('main');
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-900/5 hover:text-neutral-900 group"
                  >
                    <span className={cn(
                      currentStatus === status && "text-neutral-900 font-bold"
                    )}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </span>
                    {currentStatus === status && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

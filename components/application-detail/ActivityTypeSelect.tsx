'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Mail, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  Activity, 
  FileText,
  ChevronDown,
  Check
} from 'lucide-react';
import { ActivityType, ACTIVITY_TYPE } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { pressable } from '@/lib/motion/presets';

interface ActivityTypeSelectProps {
  value: ActivityType;
  onChange: (value: ActivityType) => void;
  disabled?: boolean;
}

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: any; color: string; bg: string }> = {
  APPLIED: { label: 'Applied', icon: Briefcase, color: 'text-neutral-600', bg: 'bg-neutral-100' },
  FOLLOWED_UP: { label: 'Followed Up', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100' },
  RECRUITER_REPLY: { label: 'Recruiter Reply', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
  INTERVIEW_COMPLETED: { label: 'Interview Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  OFFER_RECEIVED: { label: 'Offer Received', icon: ArrowUpRight, color: 'text-emerald-700', bg: 'bg-emerald-200' },
  STATUS_CHANGED: { label: 'Status Changed', icon: Activity, color: 'text-neutral-600', bg: 'bg-neutral-100' },
  NOTE_ADDED: { label: 'Note Added', icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  FOLLOW_UP_SCHEDULED: { label: 'Follow-Up Scheduled', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
  RESCHEDULED: { label: 'Rescheduled', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
  APPLICATION_CREATED: { label: 'Application Created', icon: Briefcase, color: 'text-neutral-600', bg: 'bg-neutral-100' },
};

export function ActivityTypeSelect({ value, onChange, disabled }: ActivityTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeConfig = ACTIVITY_CONFIG[value];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full sm:w-56" ref={containerRef}>
      <motion.button
        {...pressable}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 flex items-center justify-between px-4 rounded-2xl bg-white border border-neutral-200 shadow-sm transition-all",
          isOpen && "ring-2 ring-neutral-900/5 border-neutral-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center shrink-0", activeConfig.bg)}>
            <activeConfig.icon className={cn("h-3.5 w-3.5", activeConfig.color)} />
          </div>
          <span className="text-sm font-semibold text-neutral-700 truncate">{activeConfig.label}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-neutral-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute bottom-full left-0 mb-2 w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 py-2 z-[120] overflow-hidden"
          >
            <div className="px-4 py-2 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Activity Type</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto px-1">
              {ACTIVITY_TYPE.map((type) => {
                const config = ACTIVITY_CONFIG[type];
                const isSelected = value === type;
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onChange(type);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors group",
                      isSelected ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                        isSelected ? "bg-white/20" : config.bg
                      )}>
                        <config.icon className={cn("h-4 w-4", isSelected ? "text-white" : config.color)} />
                      </div>
                      <span>{config.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

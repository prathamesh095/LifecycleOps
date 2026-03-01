'use client';

import { ApplicationStatus, APPLICATION_STATUS } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/DropdownMenu';

interface StatusPillSelectorProps {
  value: ApplicationStatus;
  onChange: (value: ApplicationStatus) => void;
  disabled?: boolean;
}

export function StatusPillSelector({ value, onChange, disabled }: StatusPillSelectorProps) {
  const getStatusStyles = (s: ApplicationStatus) => {
    switch (s) {
      case 'OFFER': return 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-bg)] hover:bg-[var(--success-bg)]/80';
      case 'INTERVIEWING': return 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-bg)] hover:bg-[var(--warning-bg)]/80';
      case 'APPLIED': return 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary-subtle)] hover:bg-[var(--primary-subtle)]/80';
      case 'REJECTED': return 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-bg)] hover:bg-[var(--danger-bg)]/80';
      case 'GHOSTED': return 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200';
      case 'WITHDRAWN': return 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100 hover:bg-neutral-100';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border uppercase tracking-wider transition-all active:scale-95 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-200",
            getStatusStyles(value),
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {value === 'INTERVIEWING' ? 'Interview' : value}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl shadow-xl border-neutral-100/50 bg-white/90 backdrop-blur-xl">
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] uppercase text-neutral-400 tracking-widest font-bold">
          Update Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as ApplicationStatus)}>
          {APPLICATION_STATUS.map((status) => (
            <DropdownMenuRadioItem 
              key={status} 
              value={status}
              className="flex items-center justify-between px-2 py-2 text-xs font-medium rounded-lg cursor-pointer data-[state=checked]:bg-neutral-50 data-[state=checked]:text-neutral-900 text-neutral-600 focus:bg-neutral-50 focus:text-neutral-900"
            >
              {status === 'INTERVIEWING' ? 'Interviewing' : status.charAt(0) + status.slice(1).toLowerCase()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, X, Clock } from 'lucide-react';
import { format, addDays, startOfToday, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/Calendar';
import { pressable } from '@/lib/motion/presets';
import { Button } from '@/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"

interface FollowUpDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export function FollowUpDatePicker({ date, onSelect, isOpen, onOpenChange, disabled }: FollowUpDatePickerProps) {
  const quickSelects = [
    { label: 'Tomorrow', days: 1 },
    { label: 'In 3 days', days: 3 },
    { label: 'Next week', days: 7 },
  ];

  const handleSelect = (newDate: Date | undefined) => {
    onSelect(newDate);
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <motion.button
          {...pressable}
          disabled={disabled}
          className={cn(
            "h-10 px-4 flex items-center gap-2 rounded-full transition-all border",
            date 
              ? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm" 
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50",
            isOpen && "ring-2 ring-neutral-900/5 border-neutral-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CalendarIcon className={cn("h-4 w-4", date ? "text-blue-500" : "text-neutral-400")} />
          <span className="text-sm font-semibold">
            {date ? format(date, 'MMM d') : 'Schedule'}
          </span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[320px] p-0 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Schedule Follow-Up</span>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickSelects.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSelect(addDays(startOfToday(), item.days))}
                className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-100 overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={(d) => isPast(d) && !isToday(d)}
              initialFocus
              className="p-3"
            />
          </div>

          <div className="mt-4 flex gap-2">
            {date && (
              <Button 
                variant="ghost" 
                className="flex-1 h-10 rounded-xl text-rose-600 hover:bg-rose-50"
                onClick={() => handleSelect(undefined)}
              >
                Clear Date
              </Button>
            )}
            <Button 
              variant="primary" 
              className="flex-1 h-10 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


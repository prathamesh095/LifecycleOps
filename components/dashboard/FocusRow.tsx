import { Application } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { AlertCircle, Clock, Flame, Snowflake, Star, ChevronRight, Calendar } from 'lucide-react';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';

interface FocusRowProps {
  application: Application;
  onClick?: (id: string) => void;
}

export function FocusRow({ application, onClick }: FocusRowProps) {
  const {
    company_name,
    job_title,
    status,
    next_follow_up_at,
    is_overdue,
    is_heating_up,
    is_cooling,
    is_high_priority,
    follow_up_status
  } = application;

  // Determine status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OFFER': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'INTERVIEWING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'APPLIED': return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100 opacity-70';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  // Determine time indicator
  const getTimeIndicator = () => {
    if (next_follow_up_at) {
      const date = parseISO(next_follow_up_at);
      if (isPast(date) && !is_overdue) return 'Due today';
      if (is_overdue) return 'Overdue';
      return format(date, 'MMM d');
    }
    return null;
  };

  const timeIndicator = getTimeIndicator();

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick?.(application.id)}
      className="group flex items-center justify-between p-3 -mx-3 rounded-lg cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Indicators */}
        <div className="flex flex-col items-center justify-center gap-1 shrink-0 w-4">
          {is_overdue && <div className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Overdue" />}
          {follow_up_status === 'DUE_SOON' && !is_overdue && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Due Soon" />}
          {is_high_priority && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
          {is_heating_up && <Flame className="h-3 w-3 text-orange-500" />}
          {is_cooling && <Snowflake className="h-3 w-3 text-blue-300" />}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-neutral-900 truncate leading-tight">
            {company_name}
          </h4>
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {job_title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {timeIndicator && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            is_overdue ? "text-rose-600" : 
            follow_up_status === 'DUE_SOON' ? "text-amber-600" : "text-neutral-400"
          )}>
            <Clock className="h-3 w-3" />
            <span>{timeIndicator}</span>
          </div>
        )}
        
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide",
          getStatusColor(status)
        )}>
          {status === 'INTERVIEWING' ? 'Interview' : status}
        </span>
      </div>
    </motion.div>
  );
}

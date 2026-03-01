import { Application } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Clock, Flame, Snowflake, Star, ChevronRight, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useState } from 'react';
import { useApplicationStore } from '@/lib/store';
import { toast } from 'sonner';

interface FocusRowProps {
  application: Application;
  onClick?: (id: string) => void;
}

export function FocusRow({ application, onClick }: FocusRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const updateApplication = useApplicationStore(state => state.updateApplication);

  const {
    id,
    company_name,
    job_title,
    status,
    next_follow_up_at,
    is_overdue,
    is_heating_up,
    is_cooling,
    is_high_priority,
    follow_up_status,
    priority_score
  } = application;

  // Determine status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OFFER': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'INTERVIEWING': return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'APPLIED': return 'bg-neutral-50 text-neutral-700 border-neutral-200/50';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200/50 opacity-80';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-200/50';
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

  // Signals
  const signals = [];
  if (is_overdue) signals.push({ id: 'overdue', icon: AlertCircle, label: 'Overdue', color: 'text-rose-600 bg-rose-50 border-rose-100/50' });
  else if (follow_up_status === 'DUE_SOON') signals.push({ id: 'due_soon', icon: Clock, label: 'Due Soon', color: 'text-amber-600 bg-amber-50 border-amber-100/50' });
  
  if (is_high_priority) signals.push({ id: 'priority', icon: Star, label: 'Priority', color: 'text-amber-500 bg-amber-50 border-amber-100/50' });
  if (is_heating_up) signals.push({ id: 'heating', icon: Flame, label: 'Heating Up', color: 'text-orange-500 bg-orange-50 border-orange-100/50' });
  if (is_cooling) signals.push({ id: 'cooling', icon: Snowflake, label: 'Cooling', color: 'text-blue-400 bg-blue-50 border-blue-100/50' });

  const visibleSignals = signals.slice(0, 3);
  const overflowCount = signals.length - 3;

  // Score emphasis
  const getScoreEmphasis = () => {
    if (priority_score >= 80) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    if (priority_score >= 60) return 'bg-emerald-400';
    if (priority_score >= 40) return 'bg-amber-400';
    return 'bg-neutral-300';
  };

  const handleMarkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateApplication({ ...application, next_follow_up_at: undefined });
    toast.success('Follow-up marked as done');
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        // Only set to false if focus leaves the entire row
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsHovered(false);
        }
      }}
      onClick={() => onClick?.(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(id);
        }
      }}
      tabIndex={0}
      className="group relative flex items-center justify-between py-2 px-3 -mx-3 rounded-2xl cursor-pointer transition-all duration-[120ms] ease-out hover:bg-neutral-50/80 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Priority Score Indicator */}
        <div className="flex items-center justify-center w-1.5 h-8 shrink-0">
          <div className={cn("w-1 h-full rounded-full opacity-60 group-hover:opacity-100 transition-opacity", getScoreEmphasis())} />
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-neutral-900 truncate leading-tight">
              {company_name}
            </h4>
            
            {/* Signal Chips */}
            {visibleSignals.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 hidden sm:flex">
                {visibleSignals.map((sig, idx) => (
                  <div key={sig.id} className={cn("flex items-center justify-center h-[18px] px-1.5 rounded-full border", sig.color)} title={sig.label}>
                    <sig.icon className="h-3 w-3" strokeWidth={2.5} />
                    {idx === 0 && <span className="text-[9px] font-bold uppercase tracking-wider ml-1 leading-none mt-[1px]">{sig.label}</span>}
                  </div>
                ))}
                {overflowCount > 0 && (
                  <div 
                    className="flex items-center justify-center h-[18px] px-1.5 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 text-[9px] font-bold"
                    title={signals.slice(3).map(s => s.label).join(', ')}
                  >
                    +{overflowCount}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-neutral-500 truncate font-medium">
              {job_title}
            </p>
            {timeIndicator && (
              <>
                <span className="text-neutral-300 text-[10px]">•</span>
                <div className={cn(
                  "flex items-center gap-1 text-[11px] font-medium",
                  is_overdue ? "text-rose-600" : 
                  follow_up_status === 'DUE_SOON' ? "text-amber-600" : "text-neutral-400"
                )}>
                  <Clock className="h-3 w-3" />
                  <span>{timeIndicator}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 relative h-8">
        {/* Default Right Content (Status) */}
        <div className={cn(
          "flex items-center transition-all duration-[120ms] ease-out",
          isHovered ? "opacity-0 translate-x-1 pointer-events-none absolute right-0" : "opacity-100 translate-x-0 relative"
        )}>
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm",
            getStatusColor(status)
          )}>
            {status === 'INTERVIEWING' ? 'Interview' : status}
          </span>
        </div>

        {/* Quick Actions (Hover Reveal) */}
        <div className={cn(
          "flex items-center gap-1 transition-all duration-[120ms] ease-out",
          isHovered ? "opacity-100 translate-x-0 relative" : "opacity-0 -translate-x-1 pointer-events-none absolute right-0"
        )}>
          {(is_overdue || follow_up_status === 'DUE_SOON') && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onClick?.(id); }}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors shadow-sm"
                title="Reschedule follow-up"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button 
                onClick={handleMarkDone}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
                title="Mark follow-up done"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onClick?.(id); }}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
            title="Open details"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

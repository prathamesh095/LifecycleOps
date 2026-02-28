import { Application } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { Activity, AlertTriangle, Clock, Flame, Shield, Zap } from 'lucide-react';

interface IntelligenceStripProps {
  application: Application;
}

export function IntelligenceStrip({ application }: IntelligenceStripProps) {
  const {
    priority_score,
    is_heating_up,
    is_cooling,
    is_stale,
    is_overdue,
    last_activity_at,
    next_follow_up_at
  } = application;

  const daysSinceActivity = last_activity_at 
    ? differenceInDays(new Date(), parseISO(last_activity_at))
    : 0;

  const daysUntilFollowUp = next_follow_up_at
    ? differenceInDays(parseISO(next_follow_up_at), new Date())
    : null;

  // Determine Momentum State
  let momentumState = 'Stable';
  let momentumColor = 'bg-neutral-100 text-neutral-600 border-neutral-200';
  let MomentumIcon = Activity;

  if (is_heating_up) {
    momentumState = 'Heating Up';
    momentumColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    MomentumIcon = Flame;
  } else if (is_cooling) {
    momentumState = 'Cooling';
    momentumColor = 'bg-blue-50 text-blue-700 border-blue-200';
    MomentumIcon = Activity; // Or snowflake if available
  }

  // Determine Risk Level
  let riskLevel = 'Healthy';
  let riskColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let RiskIcon = Shield;

  if (is_overdue) {
    riskLevel = 'At Risk';
    riskColor = 'bg-rose-50 text-rose-700 border-rose-200';
    RiskIcon = AlertTriangle;
  } else if (is_stale) {
    riskLevel = 'Watch';
    riskColor = 'bg-amber-50 text-amber-700 border-amber-200';
    RiskIcon = AlertTriangle;
  }

  return (
    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-4 overflow-x-auto scrollbar-hide">
      
      {/* Priority Score */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm shrink-0">
        <div className="h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wide">Priority</span>
          <span className="text-sm font-bold text-neutral-900">{priority_score}/100</span>
        </div>
      </div>

      {/* Momentum State */}
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0", momentumColor)}>
        <MomentumIcon className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">{momentumState}</span>
      </div>

      {/* Risk Level */}
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0", riskColor)}>
        <RiskIcon className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">{riskLevel}</span>
      </div>

      {/* Days Since Activity */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm shrink-0">
        <Clock className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-xs font-medium text-neutral-600">
          Last activity {daysSinceActivity === 0 ? 'today' : `${daysSinceActivity}d ago`}
        </span>
      </div>

      {/* Next Follow-Up */}
      {daysUntilFollowUp !== null && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0",
          daysUntilFollowUp < 0 ? "bg-rose-50 text-rose-700 border-rose-200" :
          daysUntilFollowUp <= 2 ? "bg-amber-50 text-amber-700 border-amber-200" :
          "bg-white text-neutral-600 border-neutral-200"
        )}>
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">
            {daysUntilFollowUp < 0 ? `Overdue by ${Math.abs(daysUntilFollowUp)}d` :
             daysUntilFollowUp === 0 ? 'Due today' :
             `Follow-up in ${daysUntilFollowUp}d`}
          </span>
        </div>
      )}
    </div>
  );
}

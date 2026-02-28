import { Application } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { Calendar, CheckCircle2, Clock, RotateCw } from 'lucide-react';

interface FollowUpPanelProps {
  application: Application;
  onMarkDone: () => void;
  onReschedule: () => void;
}

export function FollowUpPanel({ application, onMarkDone, onReschedule }: FollowUpPanelProps) {
  const {
    next_follow_up_at,
    follow_up_status,
    follow_up_reason,
    followup_count,
    is_overdue
  } = application;

  const hasScheduledFollowUp = !!next_follow_up_at && follow_up_status !== 'COMPLETED';
  
  let statusColor = 'text-neutral-600';
  let statusText = 'No follow-up scheduled';
  let daysOverdue = 0;

  if (hasScheduledFollowUp && next_follow_up_at) {
    const date = parseISO(next_follow_up_at);
    if (is_overdue) {
      statusColor = 'text-rose-600';
      daysOverdue = differenceInDays(new Date(), date);
      statusText = `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
    } else if (follow_up_status === 'DUE_SOON') {
      statusColor = 'text-amber-600';
      statusText = 'Due soon';
    } else {
      statusColor = 'text-blue-600';
      statusText = 'Scheduled';
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Follow-Up Management</h2>
        <div className="px-2.5 py-0.5 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600">
          {followup_count} completed
        </div>
      </div>

      {hasScheduledFollowUp && next_follow_up_at ? (
        <div className="space-y-6">
          <div className={cn("p-4 rounded-xl border", 
            is_overdue ? "bg-rose-50 border-rose-100" : 
            follow_up_status === 'DUE_SOON' ? "bg-amber-50 border-amber-100" : 
            "bg-blue-50 border-blue-100"
          )}>
            <div className="flex items-start gap-3">
              <Calendar className={cn("h-5 w-5 mt-0.5", 
                is_overdue ? "text-rose-600" : 
                follow_up_status === 'DUE_SOON' ? "text-amber-600" : 
                "text-blue-600"
              )} />
              <div>
                <p className={cn("font-semibold text-sm", 
                  is_overdue ? "text-rose-900" : 
                  follow_up_status === 'DUE_SOON' ? "text-amber-900" : 
                  "text-blue-900"
                )}>
                  {format(parseISO(next_follow_up_at), 'EEEE, MMMM do')}
                </p>
                <p className={cn("text-xs font-medium mt-0.5", statusColor)}>
                  {statusText}
                </p>
                {follow_up_reason && (
                  <p className="text-sm text-neutral-600 mt-2">
                    Reason: {follow_up_reason}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onReschedule} className="w-full">
              <RotateCw className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
            <Button variant="primary" onClick={onMarkDone} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="h-12 w-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-900 mb-1">No follow-up scheduled</p>
          <p className="text-xs text-neutral-500 mb-4">Stay top of mind by scheduling a check-in.</p>
          <Button variant="outline" onClick={onReschedule} className="w-full">
            Schedule Follow-Up
          </Button>
        </div>
      )}
    </div>
  );
}

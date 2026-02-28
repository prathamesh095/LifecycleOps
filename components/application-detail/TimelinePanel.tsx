import { ApplicationActivity } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Mail, 
  ArrowUpRight,
  User,
  Building2
} from 'lucide-react';

interface TimelinePanelProps {
  activities: ApplicationActivity[];
}

export function TimelinePanel({ activities }: TimelinePanelProps) {
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'APPLIED': return Briefcase;
      case 'FOLLOWED_UP': return Mail;
      case 'RECRUITER_REPLY': return MessageSquare;
      case 'INTERVIEW_SCHEDULED': return Calendar;
      case 'INTERVIEW_COMPLETED': return CheckCircle2;
      case 'OFFER_RECEIVED': return ArrowUpRight;
      case 'STATUS_CHANGED': return ActivityIcon;
      case 'NOTE_ADDED': return FileText;
      default: return ActivityIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'APPLIED': return 'bg-neutral-100 text-neutral-600';
      case 'FOLLOWED_UP': return 'bg-blue-50 text-blue-600';
      case 'RECRUITER_REPLY': return 'bg-purple-50 text-purple-600';
      case 'INTERVIEW_SCHEDULED': return 'bg-amber-50 text-amber-600';
      case 'INTERVIEW_COMPLETED': return 'bg-emerald-50 text-emerald-600';
      case 'OFFER_RECEIVED': return 'bg-emerald-100 text-emerald-700';
      case 'STATUS_CHANGED': return 'bg-neutral-100 text-neutral-600';
      case 'NOTE_ADDED': return 'bg-yellow-50 text-yellow-600';
      default: return 'bg-neutral-50 text-neutral-500';
    }
  };

  const getActivityTitle = (activity: ApplicationActivity) => {
    switch (activity.activity_type) {
      case 'APPLIED': return 'Application Submitted';
      case 'FOLLOWED_UP': return 'Follow-Up Sent';
      case 'RECRUITER_REPLY': return 'Recruiter Replied';
      case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
      case 'INTERVIEW_COMPLETED': return 'Interview Completed';
      case 'OFFER_RECEIVED': return 'Offer Received';
      case 'STATUS_CHANGED': return 'Status Updated';
      case 'NOTE_ADDED': return 'Note Added';
      default: return 'Activity Logged';
    }
  };

  // Sort activities newest first
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">Activity Timeline</h2>
      
      {sortedActivities.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-sm">
          Start tracking activity for this application.
        </div>
      ) : (
        <div className="space-y-0 relative">
          {/* Vertical connector line */}
          <div className="absolute left-5 top-4 bottom-4 w-px bg-neutral-100" />

          {sortedActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.activity_type);
            const colorClass = getActivityColor(activity.activity_type);
            const title = getActivityTitle(activity);

            return (
              <div key={activity.id} className="relative flex gap-4 pb-8 last:pb-0 group">
                {/* Icon */}
                <div className={cn(
                  "relative z-10 h-10 w-10 rounded-full flex items-center justify-center border border-white shadow-sm shrink-0",
                  colorClass
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                    <span className="text-xs text-neutral-400 font-medium">
                      {format(parseISO(activity.activity_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                    {activity.actor === 'USER' ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>You</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>Company</span>
                      </div>
                    )}
                    {activity.channel && (
                      <>
                        <span>•</span>
                        <span>{activity.channel}</span>
                      </>
                    )}
                  </div>

                  {activity.notes && (
                    <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-700 border border-neutral-100">
                      {activity.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Fallback icon
function ActivityIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

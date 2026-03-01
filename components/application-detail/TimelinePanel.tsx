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
  Building2,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fadeIn, staggerContainer } from '@/lib/motion/presets';

interface TimelinePanelProps {
  activities: ApplicationActivity[];
}

export function TimelinePanel({ activities }: TimelinePanelProps) {
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_CREATED': return Briefcase;
      case 'APPLIED': return Briefcase;
      case 'FOLLOWED_UP': return Mail;
      case 'RECRUITER_REPLY': return MessageSquare;
      case 'INTERVIEW_SCHEDULED': return Calendar;
      case 'INTERVIEW_COMPLETED': return CheckCircle2;
      case 'OFFER_RECEIVED': return ArrowUpRight;
      case 'STATUS_CHANGED': return Activity;
      case 'NOTE_ADDED': return FileText;
      case 'FOLLOW_UP_SCHEDULED': return Calendar;
      case 'RESCHEDULED': return Calendar;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'APPLICATION_CREATED': return 'bg-neutral-100 text-neutral-600';
      case 'APPLIED': return 'bg-neutral-100 text-neutral-600';
      case 'FOLLOWED_UP': return 'bg-blue-50 text-blue-600';
      case 'RECRUITER_REPLY': return 'bg-purple-50 text-purple-600';
      case 'INTERVIEW_SCHEDULED': return 'bg-amber-50 text-amber-600';
      case 'INTERVIEW_COMPLETED': return 'bg-emerald-50 text-emerald-600';
      case 'OFFER_RECEIVED': return 'bg-emerald-100 text-emerald-700';
      case 'STATUS_CHANGED': return 'bg-neutral-100 text-neutral-600';
      case 'NOTE_ADDED': return 'bg-yellow-50 text-yellow-600';
      case 'FOLLOW_UP_SCHEDULED': return 'bg-blue-50 text-blue-600';
      case 'RESCHEDULED': return 'bg-amber-50 text-amber-600';
      default: return 'bg-neutral-50 text-neutral-500';
    }
  };

  const getActivityTitle = (activity: ApplicationActivity) => {
    switch (activity.activity_type) {
      case 'APPLICATION_CREATED': return 'Application Created';
      case 'APPLIED': return 'Application Submitted';
      case 'FOLLOWED_UP': return 'Follow-Up Sent';
      case 'RECRUITER_REPLY': return 'Recruiter Replied';
      case 'INTERVIEW_SCHEDULED': return 'Interview Scheduled';
      case 'INTERVIEW_COMPLETED': return 'Interview Completed';
      case 'OFFER_RECEIVED': return 'Offer Received';
      case 'STATUS_CHANGED': return 'Status Updated';
      case 'NOTE_ADDED': return 'Note Added';
      case 'FOLLOW_UP_SCHEDULED': return 'Follow-Up Scheduled';
      case 'RESCHEDULED': return 'Follow-Up Rescheduled';
      default: return 'Activity Logged';
    }
  };

  // Sort activities newest first
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime()
  );

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6">
      <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-6">Activity Timeline</h2>
      
      {sortedActivities.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-sm">
          Start tracking activity for this application.
        </div>
      ) : (
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-neutral-100" />

          <AnimatePresence initial={false}>
            {sortedActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.activity_type);
              const colorClass = getActivityColor(activity.activity_type);
              const title = getActivityTitle(activity);

              return (
                <motion.div 
                  key={activity.id || activity.activity_at} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  layout
                  className="relative flex gap-4 pb-6 last:pb-0 group"
                >
                {/* Icon */}
                <div className={cn(
                  "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0",
                  colorClass
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[13px] font-bold text-neutral-900">{title}</h3>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {format(parseISO(activity.activity_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 mb-2.5">
                    {activity.actor === 'USER' ? (
                      <div className="flex items-center gap-1 text-neutral-600">
                        <User className="h-3 w-3" />
                        <span>You</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Building2 className="h-3 w-3" />
                        <span>Company</span>
                      </div>
                    )}
                    {activity.channel && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">{activity.channel}</span>
                      </>
                    )}
                  </div>

                  {activity.notes && (
                    <div className="bg-neutral-50/80 rounded-2xl rounded-tl-sm p-3.5 text-[13px] text-neutral-700 border border-neutral-200/60 leading-relaxed shadow-sm">
                      {activity.notes}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
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

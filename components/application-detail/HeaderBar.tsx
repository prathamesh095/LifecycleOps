import { Application } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ChevronLeft, MoreHorizontal, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderBarProps {
  application: Application;
  onUpdateStatus: () => void;
  onLogActivity: () => void;
  onScheduleFollowUp: () => void;
}

export function HeaderBar({ 
  application, 
  onUpdateStatus, 
  onLogActivity, 
  onScheduleFollowUp 
}: HeaderBarProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OFFER': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'INTERVIEWING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'APPLIED': return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100 opacity-70';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5 text-neutral-500" />
        </Button>
        
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900 leading-tight">
              {application.company_name}
            </h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
              getStatusColor(application.status)
            )}>
              {application.status === 'INTERVIEWING' ? 'Interview' : application.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-0.5">
            <span className="font-medium">{application.job_title}</span>
            {application.location && (
              <>
                <span>•</span>
                <span>{application.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onUpdateStatus}>
          Update Status
        </Button>
        <Button variant="outline" size="sm" onClick={onLogActivity}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
        <Button variant="primary" size="sm" onClick={onScheduleFollowUp}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Follow-Up
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
          <MoreHorizontal className="h-5 w-5 text-neutral-500" />
        </Button>
      </div>
    </div>
  );
}

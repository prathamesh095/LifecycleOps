import { Application, ApplicationStatus } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ChevronLeft, MoreHorizontal, Calendar, CheckCircle, MessageSquare, Copy, Trash2, Share2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { pressable } from '@/lib/motion/presets';
import { StatusPillSelector } from './StatusPillSelector';
import { FollowUpDatePicker } from './FollowUpDatePicker';
import { ActionMenu } from './ActionMenu';
import { parseISO } from 'date-fns';
import { toast } from 'sonner';

interface HeaderBarProps {
  application: Application;
  onUpdateStatus: (status: ApplicationStatus) => void;
  onLogActivity: () => void;
  onScheduleFollowUp: (date: Date | undefined) => void;
  onDelete: () => void;
  isFollowUpOpen: boolean;
  onFollowUpOpenChange: (open: boolean) => void;
  isUpdating?: boolean;
}

export function HeaderBar({ 
  application, 
  onUpdateStatus, 
  onLogActivity, 
  onScheduleFollowUp,
  onDelete,
  isFollowUpOpen,
  onFollowUpOpenChange,
  isUpdating = false
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
            <StatusPillSelector 
              value={application.status} 
              onChange={onUpdateStatus}
              disabled={isUpdating}
            />
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
        <motion.div {...pressable}>
          <Button variant="outline" size="sm" onClick={onLogActivity} disabled={isUpdating}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        </motion.div>

        <FollowUpDatePicker 
          date={application.next_follow_up_at ? parseISO(application.next_follow_up_at) : undefined}
          onSelect={onScheduleFollowUp}
          isOpen={isFollowUpOpen}
          onOpenChange={onFollowUpOpenChange}
          disabled={isUpdating}
        />

        <ActionMenu 
          onCopyLink={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
          }}
          onShare={() => toast.info('Sharing features coming soon')}
          onViewPosting={application.job_posting_url ? () => window.open(application.job_posting_url, '_blank') : undefined}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
          onScheduleFollowUp={() => onFollowUpOpenChange(true)}
          currentStatus={application.status}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Application, ApplicationActivity, ActivityType, APPLICATION_STATUS, ApplicationStatus } from '@/lib/schemas';
import { HeaderBar } from './HeaderBar';
import { IntelligenceStrip } from './IntelligenceStrip';
import { TimelinePanel } from './TimelinePanel';
import { FollowUpPanel } from './FollowUpPanel';
import { ContextPanel } from './ContextPanel';
import { ActivityComposer } from './ActivityComposer';
import { 
  recomputeApplicationSignals, 
  updateApplicationStatus, 
  scheduleFollowUp, 
  rescheduleFollowUp,
  markFollowUpDone, 
  logApplicationActivity 
} from '@/lib/engine';
import { AnimatePresence } from 'motion/react';
import { useApplicationStore } from '@/lib/store';
import { 
  StatusPillSelector 
} from './StatusPillSelector';
import { 
  ConfirmDeleteDialog 
} from './ConfirmDeleteDialog';
import { 
  FollowUpDatePicker 
} from './FollowUpDatePicker';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface ApplicationDetailClientProps {
  initialApplication: Application;
}

export function ApplicationDetailClient({ initialApplication }: ApplicationDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    applications, 
    updateApplication, 
    addActivity, 
    activities: allActivities, 
    addApplication,
    deleteApplication
  } = useApplicationStore();
  
  // 1. Single Source of Truth from Store
  const application = useMemo(() => {
    const found = applications.find(a => a.id === initialApplication.id);
    return found ? recomputeApplicationSignals(found) : recomputeApplicationSignals(initialApplication);
  }, [applications, initialApplication]);

  const activities = useMemo(() => {
    return allActivities[application.id] || [];
  }, [allActivities, application.id]);

  // Handle query params for actions
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'log_activity') {
      // Small delay to ensure render
      setTimeout(() => {
        const composer = document.getElementById('activity-composer');
        composer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        composer?.querySelector('input')?.focus();
      }, 500);
    }
  }, [searchParams]);

  // Ensure application exists in store (for deep links)
  useEffect(() => {
    const exists = applications.find(a => a.id === initialApplication.id);
    if (!exists) {
      addApplication(initialApplication);
    }
  }, [applications, initialApplication, addApplication]);

  // 2. UI State
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 3. Mutation Layer (Centralized)
  const applyMutation = (updatedApp: Application, activity?: ApplicationActivity) => {
    updateApplication(updatedApp);
    if (activity) {
      addActivity(activity);
    }
  };

  const handleUpdateStatus = (newStatus: ApplicationStatus) => {
    if (newStatus === application.status) return;
    setIsUpdating(true);
    
    // Deterministic Pipeline
    const { application: updatedApp, activity } = updateApplicationStatus(application, newStatus);
    applyMutation(updatedApp, activity as ApplicationActivity);
    
    setIsUpdating(false);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleScheduleFollowUp = (date: Date | undefined, reason?: string) => {
    setIsUpdating(true);
    
    if (!date) {
      // Clear follow-up
      const updatedApp: Application = {
        ...application,
        next_follow_up_at: undefined,
        follow_up_status: 'NONE',
        updated_at: new Date().toISOString()
      };
      applyMutation(recomputeApplicationSignals(updatedApp));
      setIsUpdating(false);
      toast.success('Follow-up cleared');
      return;
    }

    if (application.next_follow_up_at) {
      const { application: updatedApp, activity } = rescheduleFollowUp(application, date.toISOString());
      applyMutation(updatedApp, activity as ApplicationActivity);
      setIsUpdating(false);
      toast.success('Follow-up rescheduled');
    } else {
      const { application: updatedApp, activity } = scheduleFollowUp(application, date.toISOString(), reason);
      applyMutation(updatedApp, activity as ApplicationActivity);
      setIsUpdating(false);
      toast.success('Follow-up scheduled');
    }
  };

  const handleMarkFollowUpDone = () => {
    setIsUpdating(true);
    const { application: updatedApp, activity } = markFollowUpDone(application);
    applyMutation(updatedApp, activity as ApplicationActivity);
    setIsUpdating(false);
    toast.success('Follow-up completed');
  };

  const handleAddActivity = (type: ActivityType, notes: string, date?: Date) => {
    const { application: updatedApp, activity } = logApplicationActivity(
      application, 
      type, 
      notes, 
      date?.toISOString()
    );
    
    applyMutation(updatedApp, activity as ApplicationActivity);
    toast.success('Activity logged');
  };

  const handleDeleteApplication = async () => {
    setIsDeleting(true);
    
    deleteApplication(application.id);
    toast.success('Application deleted');
    router.push('/applications');
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <HeaderBar 
        application={application}
        onUpdateStatus={handleUpdateStatus}
        onLogActivity={() => {
          const composer = document.getElementById('activity-composer');
          composer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          composer?.querySelector('input')?.focus();
        }}
        onScheduleFollowUp={handleScheduleFollowUp}
        onDelete={() => setIsDeleteOpen(true)}
        isFollowUpOpen={isFollowUpOpen}
        onFollowUpOpenChange={setIsFollowUpOpen}
        isUpdating={isUpdating}
      />
      
      <IntelligenceStrip application={application} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Timeline (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <TimelinePanel activities={activities} />
            <div id="activity-composer">
              <ActivityComposer onAddActivity={handleAddActivity} />
            </div>
          </div>

          {/* Right Column: Actions & Context (1/3 width) */}
          <div className="space-y-6">
            <FollowUpPanel 
              application={application}
              onMarkDone={handleMarkFollowUpDone}
              onReschedule={() => setIsFollowUpOpen(true)}
              isUpdating={isUpdating}
            />
            <ContextPanel application={application} />
          </div>

        </div>
      </div>

      <ConfirmDeleteDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteApplication}
        isDeleting={isDeleting}
        companyName={application.company_name}
      />
    </div>
  );
}

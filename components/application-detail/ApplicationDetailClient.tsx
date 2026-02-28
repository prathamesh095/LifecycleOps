'use client';

import { useState } from 'react';
import { Application, ApplicationActivity, ActivityType } from '@/lib/schemas';
import { HeaderBar } from './HeaderBar';
import { IntelligenceStrip } from './IntelligenceStrip';
import { TimelinePanel } from './TimelinePanel';
import { FollowUpPanel } from './FollowUpPanel';
import { ContextPanel } from './ContextPanel';
import { ActivityComposer } from './ActivityComposer';
import { computeApplicationMetrics } from '@/lib/engine';

// Mock initial activities
const MOCK_ACTIVITIES: ApplicationActivity[] = [
  {
    id: '1',
    application_id: '1',
    activity_type: 'APPLIED',
    activity_at: '2023-10-20T10:00:00Z',
    actor: 'USER',
    notes: 'Applied via LinkedIn Easy Apply'
  },
  {
    id: '2',
    application_id: '1',
    activity_type: 'NOTE_ADDED',
    activity_at: '2023-10-22T14:30:00Z',
    actor: 'USER',
    notes: 'Researched company values, seems like a good culture fit.'
  }
];

interface ApplicationDetailClientProps {
  initialApplication: Application;
}

export function ApplicationDetailClient({ initialApplication }: ApplicationDetailClientProps) {
  // Initialize with engine computation
  const [application, setApplication] = useState<Application>(() => 
    computeApplicationMetrics(initialApplication)
  );
  
  const [activities, setActivities] = useState<ApplicationActivity[]>(MOCK_ACTIVITIES);

  const handleAddActivity = (type: ActivityType, notes: string) => {
    const newActivity: ApplicationActivity = {
      id: crypto.randomUUID(),
      application_id: application.id,
      activity_type: type,
      activity_at: new Date().toISOString(),
      actor: 'USER',
      notes
    };

    setActivities(prev => [newActivity, ...prev]);
    
    // Update application state based on activity
    const updatedApp = { ...application, last_activity_at: newActivity.activity_at };
    
    // Re-run engine
    setApplication(computeApplicationMetrics(updatedApp));
  };

  const handleUpdateStatus = () => {
    console.log('Update status clicked');
    // Implement status update modal
  };

  const handleScheduleFollowUp = () => {
    console.log('Schedule follow-up clicked');
    // Implement schedule modal
  };

  const handleMarkFollowUpDone = () => {
    const updatedApp = { 
      ...application, 
      follow_up_status: 'COMPLETED' as const,
      followup_count: application.followup_count + 1,
      last_activity_at: new Date().toISOString()
    };
    setApplication(computeApplicationMetrics(updatedApp));
    
    handleAddActivity('FOLLOWED_UP', 'Marked follow-up as done');
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <HeaderBar 
        application={application}
        onUpdateStatus={handleUpdateStatus}
        onLogActivity={() => {}}
        onScheduleFollowUp={handleScheduleFollowUp}
      />
      
      <IntelligenceStrip application={application} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Timeline (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <TimelinePanel activities={activities} />
            <ActivityComposer onAddActivity={handleAddActivity} />
          </div>

          {/* Right Column: Actions & Context (1/3 width) */}
          <div className="space-y-6">
            <FollowUpPanel 
              application={application}
              onMarkDone={handleMarkFollowUpDone}
              onReschedule={handleScheduleFollowUp}
            />
            <ContextPanel application={application} />
          </div>

        </div>
      </div>
    </div>
  );
}

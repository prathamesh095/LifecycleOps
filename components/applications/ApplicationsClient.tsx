'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Application, ApplicationFormData, APPLICATION_STATUS, ApplicationActivity, ActivityType } from '@/lib/schemas';
import { AddApplicationModal } from './AddApplicationModal';
import { ApplicationsTable } from './ApplicationsTable';
import { recomputeApplicationSignals } from '@/lib/engine';
import { FocusZone } from '@/components/dashboard/FocusZone';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Mock initial data with rich engine fields
const INITIAL_APPLICATIONS_RAW: any[] = [
  { 
    id: '1', 
    company_name: 'Google', 
    job_title: 'Senior Designer', 
    status: 'APPLIED', 
    action_date: '2023-10-20', // Stale
    last_activity_at: '2023-10-20T10:00:00Z',
    location: 'Mountain View, CA',
    created_at: '2023-10-20T10:00:00Z',
    channel_type: 'DIRECT_APPLY',
    application_source: 'LinkedIn',
    cover_letter_included: false,
    user_interest_level: 'HIGH',
    interaction_count: 1,
    followup_count: 0,
    follow_up_status: 'NONE',
    follow_up_priority: 'MEDIUM',
    response_received: false,
    interview_scheduled: false,
    offer_received: false,
    is_stale: false,
    is_overdue: false,
    is_heating_up: false,
    is_high_priority: false,
    is_cooling: false,
    priority_score: 0
  },
  { 
    id: '2', 
    company_name: 'Linear', 
    job_title: 'Product Engineer', 
    status: 'INTERVIEWING', 
    action_date: '2023-10-28',
    last_activity_at: '2023-10-28T14:30:00Z',
    location: 'Remote',
    created_at: '2023-10-28T14:30:00Z',
    channel_type: 'RECRUITER',
    recruiter_name: 'Sarah Jones',
    recruiter_contacted: true,
    recruiter_email: 'sarah@linear.app',
    user_interest_level: 'HIGH',
    interaction_count: 5,
    followup_count: 2,
    follow_up_status: 'SCHEDULED',
    next_follow_up_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    follow_up_priority: 'HIGH',
    response_received: true,
    interview_scheduled: true,
    interview_date: new Date(Date.now() + 172800000).toISOString(), // 2 days
    offer_received: false,
    is_stale: false,
    is_overdue: false,
    is_heating_up: false,
    is_high_priority: false,
    is_cooling: false,
    priority_score: 0
  },
  { 
    id: '3', 
    company_name: 'Airbnb', 
    job_title: 'UX Engineer', 
    status: 'REJECTED', 
    action_date: '2023-10-15',
    last_activity_at: '2023-10-15T09:15:00Z',
    location: 'San Francisco, CA',
    created_at: '2023-10-15T09:15:00Z',
    channel_type: 'REFERRAL',
    referrer_name: 'Mike Chen',
    user_interest_level: 'MEDIUM',
    interaction_count: 2,
    followup_count: 0,
    follow_up_status: 'COMPLETED',
    follow_up_priority: 'LOW',
    response_received: true,
    interview_scheduled: false,
    offer_received: false,
    is_stale: false,
    is_overdue: false,
    is_heating_up: false,
    is_high_priority: false,
    is_cooling: false,
    priority_score: 0
  },
  { 
    id: '4', 
    company_name: 'Stripe', 
    job_title: 'Frontend Engineer', 
    status: 'OFFER', 
    action_date: '2023-10-30',
    last_activity_at: '2023-10-30T10:00:00Z',
    location: 'San Francisco, CA',
    created_at: '2023-10-25T10:00:00Z',
    channel_type: 'DIRECT_APPLY',
    application_source: 'Company Site',
    cover_letter_included: true,
    user_interest_level: 'HIGH',
    strategic_value: 'HIGH',
    interaction_count: 8,
    followup_count: 3,
    follow_up_status: 'NONE',
    follow_up_priority: 'URGENT',
    response_received: true,
    interview_scheduled: true,
    offer_received: true,
    offer_received_at: '2023-10-30T10:00:00Z',
    is_stale: false,
    is_overdue: false,
    is_heating_up: false,
    is_high_priority: false,
    is_cooling: false,
    priority_score: 0
  },
];

// Initialize engine
const INITIAL_APPLICATIONS = INITIAL_APPLICATIONS_RAW.map(app => recomputeApplicationSignals(app));

export function ApplicationsClient() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Mutation Handlers
  const logActivity = (applicationId: string, type: ActivityType, notes?: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;
      
      const now = new Date().toISOString();
      const updatedApp: Application = {
        ...app,
        last_activity_at: now,
        interaction_count: app.interaction_count + 1,
        updated_at: now,
      };

      return recomputeApplicationSignals(updatedApp);
    }));
  };

  const updateApplicationStatus = (applicationId: string, newStatus: any) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;
      
      const now = new Date().toISOString();
      const updatedApp: Application = {
        ...app,
        status: newStatus,
        status_updated_at: now,
        last_activity_at: now,
        updated_at: now,
      };

      return recomputeApplicationSignals(updatedApp);
    }));
    logActivity(applicationId, 'STATUS_CHANGED', `Status changed to ${newStatus}`);
    toast.success(`Status updated to ${newStatus}`);
  };

  const scheduleFollowUp = (applicationId: string, date: string | undefined) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;
      
      const now = new Date().toISOString();
      const updatedApp: Application = {
        ...app,
        next_follow_up_at: date,
        follow_up_status: date ? 'SCHEDULED' : 'NONE',
        last_activity_at: now,
        updated_at: now,
      };

      return recomputeApplicationSignals(updatedApp);
    }));
    if (date) {
      logActivity(applicationId, 'NOTE_ADDED', `Follow-up scheduled for ${new Date(date).toLocaleDateString()}`);
    }
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  // Re-run engine when applications change
  const processedApplications = useMemo(() => {
    return applications.map(app => recomputeApplicationSignals(app)).sort((a, b) => {
      // Smart Sort: Priority > Next Follow Up > Last Activity
      if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
      
      if (a.next_follow_up_at && b.next_follow_up_at) {
        return new Date(a.next_follow_up_at).getTime() - new Date(b.next_follow_up_at).getTime();
      }
      if (a.next_follow_up_at) return -1;
      if (b.next_follow_up_at) return 1;

      const aDate = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
      const bDate = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
      return bDate - aDate;
    });
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return processedApplications.filter(app => {
      const matchesSearch = 
        app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [processedApplications, searchQuery, statusFilter]);

  const handleCreateApplication = async (data: ApplicationFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newApplication: Application = {
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        interaction_count: 1,
        followup_count: 0,
        follow_up_status: 'NONE',
        follow_up_priority: 'MEDIUM',
        response_received: false,
        interview_scheduled: false,
        offer_received: false,
        is_stale: false,
        is_overdue: false,
        is_heating_up: false,
        is_high_priority: false,
        is_cooling: false,
        priority_score: 0,
        user_interest_level: data.user_interest_level || 'MEDIUM',
      };
      
      // Run engine on new app
      const computedApp = computeApplicationMetrics(newApplication);

      setApplications(prev => [computedApp, ...prev]);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create application:', error);
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Applications" 
        description="Manage your job applications."
      >
        <Button onClick={() => setIsOpen(true)}>
          Add Application
        </Button>
      </PageHeader>
      
      {/* Focus Zone */}
      <FocusZone 
        applications={processedApplications} 
        onItemClick={(id) => router.push(`/applications/${id}`)}
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900 transition-all duration-200"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-10 pr-8 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-900 transition-all duration-200"
          >
            <option value="ALL">All Status</option>
            {APPLICATION_STATUS.map(status => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Start tracking your job search by adding your first application."
            actionLabel="Add Application"
            onAction={() => setIsOpen(true)}
          />
        </Card>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No applications match your search.</p>
          <Button 
            variant="ghost" 
            className="mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <ApplicationsTable 
          applications={filteredApplications} 
          isLoading={isLoading}
          onStatusChange={updateApplicationStatus}
          onScheduleFollowUp={scheduleFollowUp}
          onLogActivity={logActivity}
          onDelete={deleteApplication}
        />
      )}
      
      <AddApplicationModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSubmit={handleCreateApplication} 
      />
    </PageContainer>
  );
}

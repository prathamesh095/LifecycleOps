'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase, Search, Filter } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Application, ApplicationFormData, APPLICATION_STATUS, ApplicationActivity, ActivityType, ApplicationStatus } from '@/lib/schemas';
import { AddApplicationModal } from './AddApplicationModal';
import { ApplicationsTable } from './ApplicationsTable';
import { recomputeApplicationSignals, logApplicationActivity, updateApplicationStatus, scheduleFollowUp } from '@/lib/engine';
import { FocusZone } from '@/components/dashboard/FocusZone';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApplicationStore } from '@/lib/store';

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
  const { 
    applications, 
    setApplications, 
    updateApplication, 
    deleteApplication: storeDeleteApplication, 
    addActivity,
    addApplication
  } = useApplicationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Initialize store with mock data if empty
  useEffect(() => {
    if (applications.length === 0) {
      setApplications(INITIAL_APPLICATIONS);
    }
  }, [applications.length, setApplications]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Mutation Handlers using centralized engine logic
  const handleLogActivity = useCallback((applicationId: string, type: ActivityType, notes?: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const { application: updatedApp, activity } = logApplicationActivity(app, type, notes || '');
    updateApplication(updatedApp);
    addActivity(activity as ApplicationActivity);
  }, [applications, updateApplication, addActivity]);

  const handleUpdateStatus = useCallback((applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const { application: updatedApp, activity } = updateApplicationStatus(app, newStatus);
    updateApplication(updatedApp);
    addActivity(activity as ApplicationActivity);
    toast.success(`Status updated to ${newStatus}`);
  }, [applications, updateApplication, addActivity]);

  const handleScheduleFollowUp = useCallback((applicationId: string, date: string | undefined) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app || !date) return;

    const { application: updatedApp, activity } = scheduleFollowUp(app, date);
    updateApplication(updatedApp);
    addActivity(activity as ApplicationActivity);
    toast.success('Follow-up scheduled');
  }, [applications, updateApplication, addActivity]);

  const handleDeleteApplication = useCallback((id: string) => {
    storeDeleteApplication(id);
  }, [storeDeleteApplication]);

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

  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, page]);

  const totalPages = Math.ceil(filteredApplications.length / pageSize);

  const handleCreateApplication = async (data: ApplicationFormData) => {
    try {
      const now = new Date().toISOString();
      
      const newApplication: Application = {
        id: crypto.randomUUID(),
        ...data,
        created_at: now,
        updated_at: now,
        last_activity_at: now,
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
      
      addApplication(newApplication);
      
      // Log creation activity
      addActivity({
        id: crypto.randomUUID(),
        application_id: newApplication.id,
        activity_type: 'APPLICATION_CREATED',
        activity_at: now,
        actor: 'USER',
        notes: 'Application created'
      });

      setIsOpen(false);
      toast.success('Application created');
    } catch (error) {
      console.error('Failed to create application:', error);
      toast.error('Failed to create application');
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
        <>
          <ApplicationsTable 
            applications={paginatedApplications} 
            isLoading={isLoading}
            onStatusChange={handleUpdateStatus}
            onScheduleFollowUp={handleScheduleFollowUp}
            onLogActivity={handleLogActivity}
            onDelete={handleDeleteApplication}
          />
          
          {filteredApplications.length > pageSize && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-xs text-neutral-500 font-medium">
                Showing {Math.min(filteredApplications.length, (page - 1) * pageSize + 1)} to {Math.min(filteredApplications.length, page * pageSize)} of {filteredApplications.length}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      <AddApplicationModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSubmit={handleCreateApplication} 
      />
    </PageContainer>
  );
}

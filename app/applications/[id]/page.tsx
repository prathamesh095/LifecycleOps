import { ApplicationDetailClient } from '@/components/application-detail/ApplicationDetailClient';
import { Application } from '@/lib/schemas';

// Mock data fetcher
async function getApplication(id: string): Promise<Application> {
  // Simulate DB fetch
  return {
    id,
    company_name: 'Google',
    job_title: 'Senior Designer',
    status: 'APPLIED',
    action_date: '2023-10-20',
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
    priority_score: 0,
    next_follow_up_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  } as Application;
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getApplication(id);

  return <ApplicationDetailClient initialApplication={application} />;
}

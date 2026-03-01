'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowUpRight, Briefcase, CheckCircle2, Clock, LucideIcon, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { hoverable } from '@/lib/motion/presets';
import { AddApplicationModal } from '@/components/applications/AddApplicationModal';
import { ApplicationFormData, Application } from '@/lib/schemas';
import { useApplicationStore } from '@/lib/store';
import { toast } from 'sonner';
import { FocusZone } from '@/components/applications/../dashboard/FocusZone';
import { useRouter } from 'next/navigation';
import { recomputeApplicationSignals } from '@/lib/engine';

export function DashboardClient() {
  const router = useRouter();
  const { applications, addApplication } = useApplicationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleNewApplication = () => {
    setIsModalOpen(true);
  };

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
      
      // Log creation activity (using store directly would be better but this works for now)
      useApplicationStore.getState().addActivity({
        id: crypto.randomUUID(),
        application_id: newApplication.id,
        activity_type: 'APPLICATION_CREATED',
        activity_at: now,
        actor: 'USER',
        notes: 'Application created'
      });

      setIsModalOpen(false);
      toast.success('Application created');
    } catch (error) {
      console.error('Failed to create application:', error);
      toast.error('Failed to create application');
    }
  };

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = applications.length;
    const interviewing = applications.filter(a => a.status === 'INTERVIEWING').length;
    const offers = applications.filter(a => a.status === 'OFFER').length;
    
    // Simple response rate calculation
    const withResponse = applications.filter(a => a.response_received).length;
    const responseRate = total > 0 ? ((withResponse / total) * 100).toFixed(1) : '0';

    return { total, interviewing, offers, responseRate };
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => {
        const aDate = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
        const bDate = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [applications]);

  const upcomingReminders = useMemo(() => {
    return applications
      .filter(app => app.next_follow_up_at && app.follow_up_status !== 'COMPLETED')
      .map(app => ({
        id: app.id,
        title: `Follow up: ${app.company_name}`,
        time: new Date(app.next_follow_up_at!).toLocaleDateString() + ' ' + new Date(app.next_follow_up_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: app.is_overdue ? 'urgent' : 'normal',
        company: app.company_name
      }))
      .sort((a, b) => {
        const appA = applications.find(x => x.id === a.id)!;
        const appB = applications.find(x => x.id === b.id)!;
        return new Date(appA.next_follow_up_at!).getTime() - new Date(appB.next_follow_up_at!).getTime();
      })
      .slice(0, 5);
  }, [applications]);

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your job search progress."
      >
        <Button onClick={handleNewApplication}>
          New Application
        </Button>
      </PageHeader>
      
      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <MetricCard 
          title="Total Applications" 
          value={metrics.total.toString()} 
          change="Active tracking" 
          icon={Briefcase}
          trend="neutral"
        />
        <MetricCard 
          title="Interviews" 
          value={metrics.interviewing.toString()} 
          change="Active pipelines" 
          icon={ArrowUpRight}
          trend="up"
        />
        <MetricCard 
          title="Offers" 
          value={metrics.offers.toString()} 
          change="Success milestones" 
          icon={CheckCircle2}
          trend="up"
        />
        <MetricCard 
          title="Response Rate" 
          value={`${metrics.responseRate}%`} 
          change="Engagement rate" 
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Focus Zone */}
      <FocusZone 
        applications={applications} 
        onItemClick={(id) => router.push(`/applications/${id}`)}
      />

      {/* Secondary Section */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="mt-1">Your latest application updates.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => router.push('/applications')}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {recentApplications.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No recent activity.</p>
              ) : recentApplications.map((app) => (
                <motion.div 
                  key={app.id} 
                  {...hoverable}
                  className="flex items-start gap-4 group cursor-pointer"
                  onClick={() => router.push(`/applications/${app.id}`)}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-transform group-hover:scale-105",
                    app.status === 'OFFER' ? "bg-emerald-50 text-emerald-600" :
                    app.status === 'INTERVIEWING' ? "bg-blue-50 text-blue-600" :
                    "bg-neutral-100 text-neutral-600"
                  )}>
                    {app.company_name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900 leading-none group-hover:text-blue-600 transition-colors">
                      {app.company_name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {app.job_title} • {app.status.toLowerCase()}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium tabular-nums">
                    {app.last_activity_at ? new Date(app.last_activity_at).toLocaleDateString() : 'N/A'}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription className="mt-1">Don&apos;t miss these deadlines.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => router.push('/reminders')}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
             <div className="space-y-4">
              {upcomingReminders.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No upcoming reminders.</p>
              ) : upcomingReminders.map((item) => (
                <motion.div 
                  key={item.id} 
                  {...hoverable}
                  className="flex items-center gap-4 rounded-xl border border-neutral-100 p-4 bg-neutral-50/30 hover:bg-white hover:shadow-sm hover:border-neutral-200 transition-all cursor-pointer group"
                  onClick={() => router.push(`/applications/${item.id}`)}
                >
                  <div className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    item.type === 'urgent' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-blue-500"
                  )} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900 leading-none group-hover:text-neutral-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 font-medium">
                      {item.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateApplication} 
      />
    </PageContainer>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

const MotionCard = motion.create(Card);

function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <MotionCard 
      {...hoverable}
      className="hover:border-neutral-300/80 transition-colors group cursor-pointer"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500 group-hover:text-neutral-700 transition-colors">
          {title}
        </CardTitle>
        <div className="h-9 w-9 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-white group-hover:shadow-sm transition-all">
          <Icon className="h-4.5 w-4.5 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-neutral-900 tracking-tight">{value}</div>
        <p className={cn(
          "text-xs font-medium mt-2 flex items-center gap-1.5",
          trend === 'up' && "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit",
          trend === 'down' && "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full w-fit",
          trend === 'neutral' && "text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full w-fit"
        )}>
          {change}
        </p>
      </CardContent>
    </MotionCard>
  )
}

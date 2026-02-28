'use client';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowUpRight, Briefcase, CheckCircle2, Clock, LucideIcon, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';
import { hoverable } from '@/lib/motion/presets';
import { AddApplicationModal } from '@/components/applications/AddApplicationModal';
import { ApplicationFormData } from '@/lib/schemas';

export function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleNewApplication = () => {
    setIsModalOpen(true);
  };

  const handleCreateApplication = async (data: ApplicationFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Created application:', data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create application:', error);
    }
  };

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
          value="24" 
          change="+12% from last month" 
          icon={Briefcase}
          trend="up"
        />
        <MetricCard 
          title="Interviews" 
          value="3" 
          change="+1 this week" 
          icon={ArrowUpRight}
          trend="up"
        />
        <MetricCard 
          title="Offers" 
          value="1" 
          change="Pending negotiation" 
          icon={CheckCircle2}
          trend="neutral"
        />
        <MetricCard 
          title="Response Rate" 
          value="12.5%" 
          change="+2.1% average" 
          icon={Clock}
          trend="up"
        />
      </div>

      {/* Secondary Section */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="mt-1">Your latest application updates.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {[
                { company: 'Google', action: 'Applied to Senior Designer', time: '2h ago', initial: 'G', color: 'bg-blue-50 text-blue-600' },
                { company: 'Linear', action: 'Interview scheduled', time: '5h ago', initial: 'L', color: 'bg-purple-50 text-purple-600' },
                { company: 'Notion', action: 'Application viewed', time: '1d ago', initial: 'N', color: 'bg-neutral-100 text-neutral-600' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  {...hoverable}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-transform group-hover:scale-105", item.color)}>
                    {item.initial}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900 leading-none group-hover:text-blue-600 transition-colors">
                      {item.company}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {item.action}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium tabular-nums">
                    {item.time}
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
             <div className="space-y-4">
              {[
                { title: 'Follow up with Recruiter', time: 'Tomorrow at 10:00 AM', type: 'urgent' },
                { title: 'Submit Portfolio', time: 'Wed at 5:00 PM', type: 'normal' },
                { title: 'Prepare for Interview', time: 'Thu at 2:00 PM', type: 'normal' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  {...hoverable}
                  className="flex items-center gap-4 rounded-xl border border-neutral-100 p-4 bg-neutral-50/30 hover:bg-white hover:shadow-sm hover:border-neutral-200 transition-all cursor-pointer group"
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

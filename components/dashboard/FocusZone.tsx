import { useMemo } from 'react';
import { Application } from '@/lib/schemas';
import { FocusPanel } from './FocusPanel';
import { AlertCircle, Clock, Zap, Activity, Briefcase } from 'lucide-react';
import { differenceInHours, parseISO } from 'date-fns';

interface FocusZoneProps {
  applications: Application[];
  onItemClick?: (id: string) => void;
}

export function FocusZone({ applications, onItemClick }: FocusZoneProps) {
  
  // Memoize derived lists to avoid heavy filtering on every render
  const panels = useMemo(() => {
    const now = new Date();

    const needsAttention = applications.filter(app => 
      app.is_overdue || app.is_stale || app.is_cooling
    ).sort((a, b) => b.priority_score - a.priority_score);

    const dueSoon = applications.filter(app => 
      app.follow_up_status === 'DUE_SOON' && !app.is_overdue
    ).sort((a, b) => {
      if (!a.next_follow_up_at) return 1;
      if (!b.next_follow_up_at) return -1;
      return new Date(a.next_follow_up_at).getTime() - new Date(b.next_follow_up_at).getTime();
    });

    const inProgress = applications.filter(app => 
      app.status === 'INTERVIEWING' || 
      (app.interview_date && differenceInHours(parseISO(app.interview_date), now) > 0)
    ).sort((a, b) => {
      if (a.interview_date && b.interview_date) {
        return new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime();
      }
      return b.priority_score - a.priority_score;
    });

    const highValue = applications.filter(app => 
      app.offer_received || 
      app.priority_score >= 70 || 
      app.user_interest_level === 'HIGH'
    ).sort((a, b) => b.priority_score - a.priority_score);

    const recentlyActive = applications.filter(app => {
      if (!app.last_activity_at) return false;
      return differenceInHours(now, parseISO(app.last_activity_at)) <= 48;
    }).sort((a, b) => {
      if (!a.last_activity_at) return 1;
      if (!b.last_activity_at) return -1;
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
    });

    return { needsAttention, dueSoon, inProgress, highValue, recentlyActive };
  }, [applications]);

  return (
    <div className="flex flex-col gap-4 md:gap-5 mb-8">
      {/* Tier 1: Primary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* 🔴 Panel 1 — Needs Attention */}
        <FocusPanel
          title="Needs Attention"
          subtitle="Items requiring action"
          icon={AlertCircle}
          accentColor="red"
          items={panels.needsAttention}
          emptyMessage="You're fully caught up."
          onItemClick={onItemClick}
          tier={1}
        />

        {/* 🟢 Panel 2 — High Value Opportunities */}
        <FocusPanel
          title="High Value"
          subtitle="Opportunities to prioritize"
          icon={Zap}
          accentColor="green"
          items={panels.highValue}
          emptyMessage="No high value items yet."
          onItemClick={onItemClick}
          tier={1}
        />
      </div>

      {/* Tier 2 & 3: Secondary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {/* 🟡 Panel 3 — Follow-Up Due Soon */}
        <FocusPanel
          title="Follow-Up Due Soon"
          subtitle="Upcoming touchpoints"
          icon={Clock}
          accentColor="amber"
          items={panels.dueSoon}
          emptyMessage="No upcoming follow-ups."
          onItemClick={onItemClick}
          tier={2}
        />

        {/* 🔵 Panel 4 — Interview in Progress */}
        <FocusPanel
          title="Interview in Progress"
          subtitle="Active pipelines"
          icon={Briefcase}
          accentColor="blue"
          items={panels.inProgress}
          emptyMessage="No active interviews."
          onItemClick={onItemClick}
          tier={2}
        />

        {/* ⚪ Panel 5 — Recently Active */}
        <FocusPanel
          title="Recently Active"
          subtitle="Latest momentum"
          icon={Activity}
          accentColor="neutral"
          items={panels.recentlyActive}
          emptyMessage="No recent activity."
          onItemClick={onItemClick}
          tier={3}
        />
      </div>
    </div>
  );
}

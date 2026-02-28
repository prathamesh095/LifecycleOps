import { Application, FollowUpStatus } from './schemas';
import { differenceInDays, parseISO, isPast, addDays, isWithinInterval } from 'date-fns';

/**
 * Pure rule-based intelligence engine for ApexJob.
 * Computes deterministic flags and priority scores.
 */
export function computeApplicationMetrics(app: Application): Application {
  const now = new Date();
  
  // 1. Compute Flags
  const is_stale = computeIsStale(app, now);
  const is_overdue = computeIsOverdue(app, now);
  const is_cooling = computeIsCooling(app, now);
  const is_heating_up = computeIsHeatingUp(app, now);
  const is_high_priority = computeIsHighPriority(app, now, is_overdue);

  // 2. Compute Priority Score
  const priority_score = computePriorityScore(app, now, {
    is_overdue,
    is_heating_up,
    is_high_priority
  });

  // 3. Determine Follow-Up Status if not explicitly set
  let follow_up_status = app.follow_up_status;
  if (app.next_follow_up_at) {
    const followUpDate = parseISO(app.next_follow_up_at);
    if (isPast(followUpDate) && follow_up_status !== 'COMPLETED') {
      follow_up_status = 'OVERDUE';
    } else if (differenceInDays(followUpDate, now) <= 2 && follow_up_status !== 'COMPLETED') {
      follow_up_status = 'DUE_SOON';
    } else if (follow_up_status === 'NONE') {
      follow_up_status = 'SCHEDULED';
    }
  }

  return {
    ...app,
    is_stale,
    is_overdue,
    is_cooling,
    is_heating_up,
    is_high_priority,
    priority_score,
    follow_up_status
  };
}

/**
 * Shared utility for recomputing signals and priority.
 * Alias for computeApplicationMetrics as per architectural requirements.
 */
export const recomputeApplicationSignals = computeApplicationMetrics;

function computeIsStale(app: Application, now: Date): boolean {
  if (app.status !== 'APPLIED') return false;
  if (!app.last_activity_at) return false; // Or true? Assuming new apps are fresh.
  
  const daysSinceActivity = differenceInDays(now, parseISO(app.last_activity_at));
  return daysSinceActivity >= 7;
}

function computeIsOverdue(app: Application, now: Date): boolean {
  if (!app.next_follow_up_at) return false;
  if (app.follow_up_status === 'COMPLETED') return false;
  
  return isPast(parseISO(app.next_follow_up_at));
}

function computeIsCooling(app: Application, now: Date): boolean {
  if (app.status !== 'INTERVIEWING') return false;
  if (!app.last_activity_at) return false;

  const daysSinceActivity = differenceInDays(now, parseISO(app.last_activity_at));
  return daysSinceActivity >= 5;
}

function computeIsHeatingUp(app: Application, now: Date): boolean {
  // ANY: interview scheduled, recruiter replied recently, offer received, activity within last 48h
  if (app.interview_scheduled) return true;
  if (app.offer_received) return true;
  
  if (app.last_activity_at) {
    const hoursSinceActivity = (now.getTime() - parseISO(app.last_activity_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity <= 48) return true;
  }

  // Note: "recruiter replied recently" would need analyzing activity log types, 
  // simplified here to rely on last_activity_at or external flag if we had it.
  return false;
}

function computeIsHighPriority(app: Application, now: Date, isOverdue: boolean): boolean {
  // ANY: offer_received, interview_date within 3 days, overdue follow-up, user_interest_level = HIGH
  if (app.offer_received) return true;
  if (isOverdue) return true;
  if (app.user_interest_level === 'HIGH') return true;

  if (app.interview_date) {
    const interviewDate = parseISO(app.interview_date);
    const daysUntilInterview = differenceInDays(interviewDate, now);
    if (daysUntilInterview >= 0 && daysUntilInterview <= 3) return true;
  }

  return false;
}

function computePriorityScore(
  app: Application, 
  now: Date, 
  flags: { is_overdue: boolean; is_heating_up: boolean; is_high_priority: boolean }
): number {
  let score = 0;

  // Stage Weight
  switch (app.status) {
    case 'OFFER': score += 40; break;
    case 'INTERVIEWING': score += 30; break;
    case 'APPLIED': score += 15; break;
    default: score += 5;
  }

  // Time Decay (inactivity penalty after 5 days)
  if (app.last_activity_at) {
    const daysSinceActivity = differenceInDays(now, parseISO(app.last_activity_at));
    if (daysSinceActivity > 5) {
      score -= Math.min(20, (daysSinceActivity - 5) * 2); // Cap penalty
    }
  }

  // Urgency Boost
  if (flags.is_overdue) score += 25;
  if (app.follow_up_status === 'DUE_SOON') score += 15;

  // User Interest
  if (app.user_interest_level === 'HIGH') score += 15;
  if (app.user_interest_level === 'MEDIUM') score += 5;

  // Strategic Value
  if (app.strategic_value === 'HIGH') score += 10;

  // Clamp 0-100
  return Math.max(0, Math.min(100, score));
}

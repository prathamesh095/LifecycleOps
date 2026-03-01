import { Application, FollowUpStatus, ApplicationStatus, ApplicationActivity, ActivityType } from './schemas';
import { differenceInDays, parseISO, isPast, addDays, isWithinInterval } from 'date-fns';

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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

  // 3. Determine Follow-Up Status
  let follow_up_status = app.follow_up_status;
  if (app.next_follow_up_at) {
    const followUpDate = parseISO(app.next_follow_up_at);
    if (follow_up_status !== 'COMPLETED') {
      if (isPast(followUpDate)) {
        follow_up_status = 'OVERDUE';
      } else if (differenceInDays(followUpDate, now) <= 2) {
        follow_up_status = 'DUE_SOON';
      } else {
        follow_up_status = 'SCHEDULED';
      }
    }
  } else {
    follow_up_status = 'NONE';
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

// --- CENTRAL MUTATION UTILITIES ---

export function updateApplicationStatus(
  app: Application,
  newStatus: ApplicationStatus
): { application: Application; activity: Partial<ApplicationActivity> } {
  const now = new Date().toISOString();
  
  const updatedApp: Application = {
    ...app,
    status: newStatus,
    status_updated_at: now,
    last_activity_at: now,
    updated_at: now,
  };

  const activity: Partial<ApplicationActivity> = {
    id: generateId(),
    application_id: app.id,
    activity_type: 'STATUS_CHANGED',
    activity_at: now,
    actor: 'USER',
    notes: `Status changed to ${newStatus}`,
  };

  return {
    application: recomputeApplicationSignals(updatedApp),
    activity
  };
}

export function scheduleFollowUp(
  app: Application,
  date: string,
  reason?: string
): { application: Application; activity: Partial<ApplicationActivity> } {
  const now = new Date().toISOString();
  
  const updatedApp: Application = {
    ...app,
    next_follow_up_at: date,
    follow_up_status: 'SCHEDULED',
    follow_up_reason: reason || app.follow_up_reason,
    followup_count: app.followup_count + 1,
    last_activity_at: now,
    updated_at: now,
  };

  const activity: Partial<ApplicationActivity> = {
    id: generateId(),
    application_id: app.id,
    activity_type: 'FOLLOW_UP_SCHEDULED',
    activity_at: now,
    actor: 'USER',
    notes: `Follow-up scheduled for ${new Date(date).toLocaleDateString()}${reason ? `: ${reason}` : ''}`,
  };

  return {
    application: recomputeApplicationSignals(updatedApp),
    activity
  };
}

export function rescheduleFollowUp(
  app: Application,
  date: string
): { application: Application; activity: Partial<ApplicationActivity> } {
  const now = new Date().toISOString();
  
  const updatedApp: Application = {
    ...app,
    next_follow_up_at: date,
    updated_at: now,
  };

  const activity: Partial<ApplicationActivity> = {
    id: generateId(),
    application_id: app.id,
    activity_type: 'RESCHEDULED',
    activity_at: now,
    actor: 'USER',
    notes: `Follow-up rescheduled to ${new Date(date).toLocaleDateString()}`,
  };

  return {
    application: recomputeApplicationSignals(updatedApp),
    activity
  };
}

export function markFollowUpDone(
  app: Application
): { application: Application; activity: Partial<ApplicationActivity> } {
  const now = new Date().toISOString();
  
  const updatedApp: Application = {
    ...app,
    follow_up_status: 'COMPLETED',
    last_activity_at: now,
    updated_at: now,
  };

  const activity: Partial<ApplicationActivity> = {
    id: generateId(),
    application_id: app.id,
    activity_type: 'FOLLOWED_UP',
    activity_at: now,
    actor: 'USER',
    notes: 'Marked follow-up as completed',
  };

  return {
    application: recomputeApplicationSignals(updatedApp),
    activity
  };
}

export function logApplicationActivity(
  app: Application,
  type: ActivityType,
  notes: string,
  date?: string
): { application: Application; activity: Partial<ApplicationActivity> } {
  const now = new Date().toISOString();
  const activityAt = date || now;
  
  let extraData: Partial<Application> = {};
  
  // Special activity rules
  if (type === 'INTERVIEW_SCHEDULED') {
    extraData = { 
      interview_scheduled: true,
      interview_date: activityAt,
      status: 'INTERVIEWING' // Auto-transition if scheduled
    };
  } else if (type === 'OFFER_RECEIVED') {
    extraData = { 
      offer_received: true, 
      offer_received_at: activityAt,
      status: 'OFFER' 
    };
  } else if (type === 'RECRUITER_REPLY') {
    extraData = { response_received: true };
  }

  const updatedApp: Application = {
    ...app,
    ...extraData,
    last_activity_at: activityAt,
    interaction_count: app.interaction_count + 1,
    updated_at: now,
  };

  const activity: Partial<ApplicationActivity> = {
    id: generateId(),
    application_id: app.id,
    activity_type: type,
    activity_at: activityAt,
    actor: 'USER',
    notes,
  };

  return {
    application: recomputeApplicationSignals(updatedApp),
    activity
  };
}

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

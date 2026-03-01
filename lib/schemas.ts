import { z } from 'zod';

export const APPLICATION_STATUS = [
  'DRAFT',
  'APPLIED',
  'INTERVIEWING',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
  'GHOSTED',
] as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[number];

export const CHANNEL_TYPE = [
  'DIRECT_APPLY',
  'OUTREACH',
  'REFERRAL',
  'RECRUITER',
  'FOLLOW_UP',
] as const;

export type ChannelType = typeof CHANNEL_TYPE[number];

export const FOLLOW_UP_STATUS = ['NONE', 'SCHEDULED', 'DUE_SOON', 'OVERDUE', 'COMPLETED'] as const;
export type FollowUpStatus = typeof FOLLOW_UP_STATUS[number];

export const FOLLOW_UP_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type FollowUpPriority = typeof FOLLOW_UP_PRIORITY[number];

export const USER_INTEREST_LEVEL = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type UserInterestLevel = typeof USER_INTEREST_LEVEL[number];

export const STRATEGIC_VALUE = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type StrategicValue = typeof STRATEGIC_VALUE[number];

export const ACTIVITY_TYPE = [
  'APPLICATION_CREATED',
  'APPLIED', 'FOLLOWED_UP', 'RECRUITER_REPLY', 'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'STATUS_CHANGED', 'NOTE_ADDED',
  'FOLLOW_UP_SCHEDULED', 'RESCHEDULED'
] as const;
export type ActivityType = typeof ACTIVITY_TYPE[number];

export interface ApplicationActivity {
  id: string;
  application_id: string;
  activity_type: ActivityType;
  activity_at: string; // ISO
  actor: 'USER' | 'COMPANY';
  channel?: string;
  notes?: string;
  metadata_json?: string;
}

export const NOTIFICATION_TYPE = [
  'FOLLOW_UP_OVERDUE',
  'FOLLOW_UP_DUE_SOON',
  'INTERVIEW_SCHEDULED',
  'OFFER_RECEIVED',
  'HIGH_PRIORITY_OPPORTUNITY',
  'REMINDER_DUE'
] as const;
export type NotificationType = typeof NOTIFICATION_TYPE[number];

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_type: 'APPLICATION' | 'CONTACT' | 'REMINDER';
  related_entity_id: string;
  read: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  notes?: string;
  relationship_strength?: 'WEAK' | 'MODERATE' | 'STRONG';
  created_at: string;
  updated_at?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  due_at: string; // ISO
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  related_entity_type?: 'APPLICATION' | 'CONTACT';
  related_entity_id?: string;
  created_at: string;
}

// Base schema shared by all types
const baseApplicationSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  job_title: z.string().min(2, 'Job title must be at least 2 characters'),
  status: z.enum(APPLICATION_STATUS),
  location: z.string().optional(),
  action_date: z.string().min(1, 'Action date is required'),
  next_follow_up_at: z.string().optional(), // ISO datetime
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  attachments: z.array(z.any()).optional(), // Placeholder for file objects
  drive_links: z.array(z.string().url()).optional(),
  contact_id: z.string().optional(),
  
  // --- NEW UNIVERSAL CORE FIELDS ---
  // Identity Layer
  role_family: z.enum(['ENGINEERING', 'DESIGN', 'PRODUCT', 'DATA', 'SALES', 'MARKETING', 'OPERATIONS', 'OTHER']).optional(),
  seniority_level: z.enum(['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL', 'EXECUTIVE']).optional(),
  department: z.string().optional(),
  company_normalized_id: z.string().optional(),

  // Location Structure
  work_type: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),

  // Timeline Layer
  first_action_date: z.string().optional(),
  source_attribution_primary: z.string().optional(),
  source_attribution_secondary: z.string().optional(),

  // Document Layer
  resume_file_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  personal_website: z.string().url().optional().or(z.literal('')),

  // Intelligence Layer
  tags: z.array(z.string()).optional(),
  fit_score: z.number().min(0).max(100).optional(),
  confidence_score: z.number().min(0).max(100).optional(),

  // New Engine Fields (Optional in form, but required in model usually)
  user_interest_level: z.enum(USER_INTEREST_LEVEL).default('MEDIUM'),
  strategic_value: z.enum(STRATEGIC_VALUE).optional(),
  follow_up_reason: z.string().optional(),
  follow_up_priority: z.enum(FOLLOW_UP_PRIORITY).default('MEDIUM'),
});

// Tab-specific schemas merged with base
const directApplySchema = baseApplicationSchema.extend({
  channel_type: z.literal('DIRECT_APPLY'),
  application_source: z.string().min(1, 'Application source is required'),
  job_posting_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  job_id: z.string().optional(),
  resume_version: z.string().optional(),
  cover_letter_included: z.boolean().default(false),
  
  // New Direct Apply Fields
  application_platform: z.string().optional(),
  application_method: z.enum(['WEB_FORM', 'EASY_APPLY', 'EMAIL', 'OTHER']).optional(),
  confirmation_received: z.boolean().default(false),
  ats_detected: z.boolean().default(false),
  screening_questions_completed: z.boolean().default(false),
  salary_range_posted: z.string().optional(),
  
  // Email specific (if method is email)
  application_email_address: z.string().email().optional().or(z.literal('')),
  email_subject_used: z.string().optional(),
  email_sent_timestamp: z.string().optional(),
  attachments_verified: z.boolean().default(false),
  auto_reply_received: z.boolean().default(false),
});

const outreachSchema = baseApplicationSchema.extend({
  channel_type: z.literal('OUTREACH'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  outreach_channel: z.string().optional(),
  template_used: z.string().optional(),
  message_preview: z.string().optional(),

  // New Outreach Fields
  outreach_type: z.enum(['COLD', 'WARM', 'REFERRAL_REQUEST', 'NETWORKING']).optional(),
  personalization_level: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  response_received: z.boolean().default(false),
  response_sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  conversation_status: z.enum(['NO_REPLY', 'ACTIVE', 'CLOSED']).optional(),
  last_reply_date: z.string().optional(),
  potential_role_discussed: z.string().optional(),
  potential_job_url: z.string().url().optional().or(z.literal('')),
});

const referralSchema = baseApplicationSchema.extend({
  channel_type: z.literal('REFERRAL'),
  referrer_name: z.string().min(1, 'Referrer name is required'),
  referrer_company: z.string().optional(),
  relationship_strength: z.enum(['WEAK', 'MODERATE', 'STRONG']).optional(),
  referral_status: z.string().optional(),

  // New Referral Fields
  referral_type: z.enum(['INTERNAL_SUBMISSION', 'EMAIL_INTRO', 'PORTAL_REFERRAL']).optional(),
  referral_date: z.string().optional(),
  referral_confidence_score: z.number().min(0).max(100).optional(),
  referred_job_url: z.string().url().optional().or(z.literal('')),
  referred_job_id: z.string().optional(),
  referrer_role: z.string().optional(),
  referrer_contact: z.string().optional(),
  how_you_know_them: z.string().optional(),
});

const recruiterSchema = baseApplicationSchema.extend({
  channel_type: z.literal('RECRUITER'),
  recruiter_name: z.string().min(1, 'Recruiter name is required'),
  recruiter_email: z.string().email('Invalid email').optional().or(z.literal('')),
  recruiting_agency: z.string().optional(),
  recruiter_contacted: z.boolean().default(false),

  // New Recruiter Fields
  recruiter_type: z.enum(['INTERNAL', 'EXTERNAL_AGENCY']).optional(),
  recruiter_linkedin: z.string().url().optional().or(z.literal('')),
  recruiter_phone: z.string().optional(),
  who_initiated: z.enum(['ME', 'RECRUITER']).optional(),
  initial_contact_date: z.string().optional(),
  role_discussed: z.string().optional(),
  job_confirmed: z.boolean().default(false),
  recruiter_stage: z.enum(['INTRO', 'SCREENING', 'SUBMITTED', 'CLOSED']).optional(),
  recruiter_responsiveness_score: z.number().min(0).max(100).optional(),
  recruiter_notes: z.string().optional(),
});

const followUpSchema = baseApplicationSchema.extend({
  channel_type: z.literal('FOLLOW_UP'),
  follow_up_type: z.string().min(1, 'Follow-up type is required'),
  follow_up_channel: z.string().optional(),
  follow_up_outcome: z.string().optional(),
  notes: z.string().optional(),

  // New Follow-Up Fields
  related_opportunity_id: z.string().optional(),
  next_step_agreed: z.string().optional(),
  blocker_identified: z.string().optional(),
  sentiment_change: z.enum(['IMPROVED', 'UNCHANGED', 'WORSENED']).optional(),
  follow_up_notes: z.string().optional(),
});

// Discriminated union for channel-specific fields
export const applicationSchema = z.discriminatedUnion('channel_type', [
  directApplySchema,
  outreachSchema,
  referralSchema,
  recruiterSchema,
  followUpSchema,
]);

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export interface Application {
  id: string;
  created_at: string;
  updated_at?: string;
  
  // Common fields
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  location?: string;
  action_date: string;
  notes?: string;
  attachments?: any[];
  drive_links?: string[];
  contact_id?: string;
  contact_email?: string;
  
  // Union fields
  channel_type: ChannelType;
  [key: string]: any;

  // --- INTELLIGENT ENGINE FIELDS ---
  
  // Pipeline Status
  status_updated_at?: string;
  stage_entered_at?: string;

  // Activity Tracking
  last_activity_at?: string;
  last_user_action_at?: string;
  last_contact_action_at?: string;
  interaction_count: number;
  followup_count: number;

  // Follow-Up Scheduling
  next_follow_up_at?: string;
  follow_up_status: FollowUpStatus;
  follow_up_priority: FollowUpPriority;
  follow_up_reason?: string;

  // Response Signals
  response_received: boolean;
  response_received_at?: string;
  interview_scheduled: boolean;
  interview_date?: string;
  offer_received: boolean;
  offer_received_at?: string;

  // Risk & Momentum Flags
  is_stale: boolean;
  is_overdue: boolean;
  is_heating_up: boolean;
  is_high_priority: boolean;
  is_cooling: boolean;
  priority_score: number;

  // User Intent
  user_interest_level: UserInterestLevel;
  strategic_value?: StrategicValue;
}

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  due_date: z.string().min(1, 'Due date is required'),
  type: z.enum(['urgent', 'normal']),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;

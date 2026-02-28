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
  'APPLIED', 'FOLLOWED_UP', 'RECRUITER_REPLY', 'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'STATUS_CHANGED', 'NOTE_ADDED'
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
});

const outreachSchema = baseApplicationSchema.extend({
  channel_type: z.literal('OUTREACH'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  outreach_channel: z.string().optional(),
  template_used: z.string().optional(),
  message_preview: z.string().optional(),
});

const referralSchema = baseApplicationSchema.extend({
  channel_type: z.literal('REFERRAL'),
  referrer_name: z.string().min(1, 'Referrer name is required'),
  referrer_company: z.string().optional(),
  relationship_strength: z.enum(['WEAK', 'MODERATE', 'STRONG']).optional(),
  referral_status: z.string().optional(),
});

const recruiterSchema = baseApplicationSchema.extend({
  channel_type: z.literal('RECRUITER'),
  recruiter_name: z.string().min(1, 'Recruiter name is required'),
  recruiter_email: z.string().email('Invalid email').optional().or(z.literal('')),
  recruiting_agency: z.string().optional(),
  recruiter_contacted: z.boolean().default(false),
});

const followUpSchema = baseApplicationSchema.extend({
  channel_type: z.literal('FOLLOW_UP'),
  follow_up_type: z.string().min(1, 'Follow-up type is required'),
  follow_up_channel: z.string().optional(),
  follow_up_outcome: z.string().optional(),
  notes: z.string().optional(),
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

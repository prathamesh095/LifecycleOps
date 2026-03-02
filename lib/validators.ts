import { z } from 'zod';

export const ApplicationSyncSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  status: z.string(),
  location: z.string().nullable().optional(),
  salaryRange: z.string().nullable().optional(),
  jobUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  channelType: z.string(),
  nextFollowUpAt: z.string().datetime().nullable().optional(),
  interviewDate: z.string().datetime().nullable().optional(),
  lastActivityAt: z.string().datetime(),
  isHighPriority: z.boolean(),
  isArchived: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const ContactSyncSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  lastContactAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime(),
});

export const ActivitySyncSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  type: z.string(),
  notes: z.string().nullable().optional(),
  occurredAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ReminderSyncSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  notes: z.string().nullable().optional(),
  dueAt: z.string().datetime(),
  completed: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const SyncBatchSchema = z.object({
  applications: z.array(ApplicationSyncSchema).optional(),
  contacts: z.array(ContactSyncSchema).optional(),
  activities: z.array(ActivitySyncSchema).optional(),
  reminders: z.array(ReminderSyncSchema).optional(),
});

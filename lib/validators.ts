import { z } from "zod";

// Application Validators
export const createApplicationValidator = z.object({
  name: z.string().min(1, "Application name is required").max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(["active", "archived", "closed"]).default("active"),
  category: z.string().max(255).optional(),
  appliedDate: z.string().datetime().optional(),
});

export const updateApplicationValidator = createApplicationValidator.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationValidator>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationValidator>;

// Activity Validators
export const createActivityValidator = z.object({
  applicationId: z.string().optional(),
  type: z.string().min(1, "Activity type is required").max(100),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateActivityValidator = createActivityValidator.partial();

export type CreateActivityInput = z.infer<typeof createActivityValidator>;
export type UpdateActivityInput = z.infer<typeof updateActivityValidator>;

// Contact Validators
export const createContactValidator = z.object({
  applicationId: z.string().optional(),
  name: z.string().min(1, "Contact name is required").max(255),
  role: z.string().max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateContactValidator = createContactValidator.partial();

export type CreateContactInput = z.infer<typeof createContactValidator>;
export type UpdateContactInput = z.infer<typeof updateContactValidator>;

// Reminder Validators
export const createReminderValidator = z.object({
  applicationId: z.string().optional(),
  title: z.string().min(1, "Reminder title is required").max(255),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime("Due date is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  completed: z.boolean().default(false),
});

export const updateReminderValidator = createReminderValidator.partial();

export type CreateReminderInput = z.infer<typeof createReminderValidator>;
export type UpdateReminderInput = z.infer<typeof updateReminderValidator>;

// User Validators (for future use)
export const createUserValidator = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(255).optional(),
});

export type CreateUserInput = z.infer<typeof createUserValidator>;

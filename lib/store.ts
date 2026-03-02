'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Application, ApplicationActivity, Notification, Contact, Reminder } from './schemas';
import { recomputeApplicationSignals, generateId } from './engine';
import { isPast, differenceInHours, parseISO } from 'date-fns';
import { get, set, del } from 'idb-keyval';

// Custom IndexedDB storage adapter
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface ApplicationState {
  applications: Application[];
  activities: Record<string, ApplicationActivity[]>;
  notifications: Notification[];
  contacts: Contact[];
  reminders: Reminder[];

  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplication: (app: Application) => void;
  deleteApplication: (id: string) => void;
  
  addActivity: (activity: ApplicationActivity) => void;
  getActivities: (applicationId: string) => ApplicationActivity[];

  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Contacts
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;

  // Reminders
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;

  // Global Pipeline
  applyGlobalMutation: () => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: [],
      activities: {},
      notifications: [],
      contacts: [],
      reminders: [],
      
      setApplications: (apps) => {
        set({ applications: apps.map(app => recomputeApplicationSignals(app)) });
        get().applyGlobalMutation();
      },
      
      addApplication: (app) => {
        set((state) => ({ 
          applications: [recomputeApplicationSignals(app), ...state.applications] 
        }));
        get().applyGlobalMutation();
      },
      
      updateApplication: (updatedApp) => {
        set((state) => ({
          applications: state.applications.map((app) => 
            app.id === updatedApp.id ? recomputeApplicationSignals(updatedApp) : app
          )
        }));
        get().applyGlobalMutation();
      },
      
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id)
        }));
        get().applyGlobalMutation();
      },
      
      addActivity: (activity) => {
        set((state) => {
          const appActivities = state.activities[activity.application_id] || [];
          return {
            activities: {
              ...state.activities,
              [activity.application_id]: [activity, ...appActivities]
            }
          };
        });
        get().applyGlobalMutation();
      },
      
      getActivities: (applicationId) => {
        return get().activities[applicationId] || [];
      },

      // Notifications
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Contacts
      addContact: (contact) => {
        set((state) => ({
          contacts: [contact, ...state.contacts]
        }));
        get().applyGlobalMutation();
      },
      updateContact: (updatedContact) => {
        set((state) => ({
          contacts: state.contacts.map(c => c.id === updatedContact.id ? updatedContact : c)
        }));
        get().applyGlobalMutation();
      },
      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter(c => c.id !== id)
        }));
        get().applyGlobalMutation();
      },

      // Reminders
      addReminder: (reminder) => {
        set((state) => ({
          reminders: [reminder, ...state.reminders]
        }));
        get().applyGlobalMutation();
      },
      updateReminder: (updatedReminder) => {
        set((state) => ({
          reminders: state.reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r)
        }));
        get().applyGlobalMutation();
      },
      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter(r => r.id !== id)
        }));
        get().applyGlobalMutation();
      },

      // Global Pipeline
      applyGlobalMutation: () => {
        const state = get();
        const now = new Date();
        const newNotifications: Notification[] = [];
        const existingNotifications = state.notifications;

        // Helper to check if a notification already exists for an entity and type
        const notificationExists = (type: string, entityId: string) => {
          return existingNotifications.some(n => n.type === type && n.related_entity_id === entityId);
        };

        // 1. Check Applications
        state.applications.forEach(app => {
          // Follow-up overdue
          if (app.is_overdue && !notificationExists('FOLLOW_UP_OVERDUE', app.id)) {
            newNotifications.push({
              id: generateId(),
              user_id: 'user', // Mock user id
              type: 'FOLLOW_UP_OVERDUE',
              title: 'Follow-up Overdue',
              message: `Follow-up for ${app.company_name} is overdue.`,
              related_entity_type: 'APPLICATION',
              related_entity_id: app.id,
              read: false,
              created_at: now.toISOString()
            });
          }

          // Follow-up due soon (within 48h)
          if (app.follow_up_status === 'DUE_SOON' && !app.is_overdue && !notificationExists('FOLLOW_UP_DUE_SOON', app.id)) {
            newNotifications.push({
              id: generateId(),
              user_id: 'user',
              type: 'FOLLOW_UP_DUE_SOON',
              title: 'Follow-up Due Soon',
              message: `Follow-up for ${app.company_name} is due soon.`,
              related_entity_type: 'APPLICATION',
              related_entity_id: app.id,
              read: false,
              created_at: now.toISOString()
            });
          }

          // Interview scheduled (check if interview_date is in the future and no notification exists)
          if (app.status === 'INTERVIEWING' && app.interview_date && !isPast(parseISO(app.interview_date)) && !notificationExists('INTERVIEW_SCHEDULED', app.id)) {
            newNotifications.push({
              id: generateId(),
              user_id: 'user',
              type: 'INTERVIEW_SCHEDULED',
              title: 'Interview Scheduled',
              message: `You have an upcoming interview with ${app.company_name}.`,
              related_entity_type: 'APPLICATION',
              related_entity_id: app.id,
              read: false,
              created_at: now.toISOString()
            });
          }

          // Offer received
          if (app.status === 'OFFER' && !notificationExists('OFFER_RECEIVED', app.id)) {
            newNotifications.push({
              id: generateId(),
              user_id: 'user',
              type: 'OFFER_RECEIVED',
              title: 'Offer Received!',
              message: `Congratulations! You received an offer from ${app.company_name}.`,
              related_entity_type: 'APPLICATION',
              related_entity_id: app.id,
              read: false,
              created_at: now.toISOString()
            });
          }

          // High priority opportunity
          if (app.is_high_priority && !notificationExists('HIGH_PRIORITY_OPPORTUNITY', app.id)) {
            newNotifications.push({
              id: generateId(),
              user_id: 'user',
              type: 'HIGH_PRIORITY_OPPORTUNITY',
              title: 'High Priority Opportunity',
              message: `${app.company_name} is marked as high priority.`,
              related_entity_type: 'APPLICATION',
              related_entity_id: app.id,
              read: false,
              created_at: now.toISOString()
            });
          }
        });

        // 2. Check Reminders
        state.reminders.forEach(reminder => {
          if (!reminder.completed && isPast(parseISO(reminder.due_at)) && !notificationExists('REMINDER_DUE', reminder.id)) {
            newNotifications.push({
              id: generateId(),
              user_id: 'user',
              type: 'REMINDER_DUE',
              title: 'Reminder Due',
              message: reminder.title,
              related_entity_type: 'REMINDER',
              related_entity_id: reminder.id,
              read: false,
              created_at: now.toISOString()
            });
          }
        });

        if (newNotifications.length > 0) {
          set((state) => ({
            notifications: [...newNotifications, ...state.notifications]
          }));
        }
      }
    }),
    {
      name: 'apexjob-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

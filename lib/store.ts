'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Application, ApplicationActivity, Notification, Contact, Reminder } from './schemas';
import { recomputeApplicationSignals, generateId } from './engine';
import { isPast, differenceInHours, parseISO } from 'date-fns';
import { get, set, del } from 'idb-keyval';
import { addToSyncQueue } from './local-cache';
import { triggerSync } from './sync/engine';

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
  isCloudSynced: boolean;
  lastSyncedAt: string | null;

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
  setCloudSynced: (synced: boolean) => void;
  loadFromCloud: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: [],
      activities: {},
      notifications: [],
      contacts: [],
      reminders: [],
      isCloudSynced: false,
      lastSyncedAt: null,
      
      setApplications: (apps) => {
        set({ applications: apps.map(app => recomputeApplicationSignals(app)) });
        get().applyGlobalMutation();
      },
      
      addApplication: (app) => {
        set((state) => ({ 
          applications: [recomputeApplicationSignals(app), ...state.applications] 
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id: app.id,
          type: 'APPLICATION',
          action: 'CREATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },
      
      updateApplication: (updatedApp) => {
        set((state) => ({
          applications: state.applications.map((app) => 
            app.id === updatedApp.id ? recomputeApplicationSignals(updatedApp) : app
          )
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id: updatedApp.id,
          type: 'APPLICATION',
          action: 'UPDATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },
      
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id)
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id,
          type: 'APPLICATION',
          action: 'DELETE',
          timestamp: Date.now()
        }).then(() => triggerSync());
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

        // Queue for sync
        addToSyncQueue({
          id: activity.id,
          type: 'ACTIVITY',
          action: 'CREATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
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

        // Queue for sync
        addToSyncQueue({
          id: contact.id,
          type: 'CONTACT',
          action: 'CREATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },
      updateContact: (updatedContact) => {
        set((state) => ({
          contacts: state.contacts.map(c => c.id === updatedContact.id ? updatedContact : c)
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id: updatedContact.id,
          type: 'CONTACT',
          action: 'UPDATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },
      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter(c => c.id !== id)
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id,
          type: 'CONTACT',
          action: 'DELETE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },

      // Reminders
      addReminder: (reminder) => {
        set((state) => ({
          reminders: [reminder, ...state.reminders]
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id: reminder.id,
          type: 'REMINDER',
          action: 'CREATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },
      updateReminder: (updatedReminder) => {
        set((state) => ({
          reminders: state.reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r)
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id: updatedReminder.id,
          type: 'REMINDER',
          action: 'UPDATE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },
      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter(r => r.id !== id)
        }));
        get().applyGlobalMutation();

        // Queue for sync
        addToSyncQueue({
          id,
          type: 'REMINDER',
          action: 'DELETE',
          timestamp: Date.now()
        }).then(() => triggerSync());
      },

      setCloudSynced: (synced) => set({ isCloudSynced: synced }),

      loadFromCloud: async () => {
        try {
          const response = await fetch('/api/bootstrap');

          if (response.ok) {
            const { applications: apps, contacts, activities, reminders, serverTime } = await response.json();

            // Merge applications
            const appsMap = new Map(get().applications.map(a => [a.id, a]));
            apps.forEach((newApp: any) => {
              const mappedApp = {
                ...newApp,
                company_name: newApp.companyName,
                job_title: newApp.jobTitle,
                channel_type: newApp.channelType,
                next_follow_up_at: newApp.nextFollowUpAt,
                interview_date: newApp.interviewDate,
                last_activity_at: newApp.lastActivityAt,
                is_high_priority: newApp.isHighPriority,
                is_archived: newApp.isArchived,
              };
              appsMap.set(mappedApp.id, recomputeApplicationSignals(mappedApp));
            });

            // Merge contacts
            const contactsMap = new Map(get().contacts.map(c => [c.id, c]));
            contacts.forEach((newContact: any) => {
              contactsMap.set(newContact.id, {
                ...newContact,
                linkedin_url: newContact.linkedinUrl,
                last_contact_at: newContact.lastContactAt,
              });
            });

            // Merge reminders
            const remindersMap = new Map(get().reminders.map(r => [r.id, r]));
            reminders.forEach((newReminder: any) => {
              remindersMap.set(newReminder.id, {
                ...newReminder,
                due_at: newReminder.dueAt,
              });
            });

            // Merge activities
            const activitiesMap = { ...get().activities };
            activities.forEach((act: any) => {
              const mappedAct = {
                ...act,
                application_id: act.applicationId,
                occurred_at: act.occurredAt,
              };
              if (!activitiesMap[mappedAct.application_id]) {
                activitiesMap[mappedAct.application_id] = [];
              }
              const exists = activitiesMap[mappedAct.application_id].some(a => a.id === mappedAct.id);
              if (!exists) {
                activitiesMap[mappedAct.application_id].push(mappedAct);
              }
            });

            set({
              applications: Array.from(appsMap.values()),
              contacts: Array.from(contactsMap.values()),
              activities: activitiesMap,
              reminders: Array.from(remindersMap.values()),
              isCloudSynced: true,
              lastSyncedAt: serverTime || new Date().toISOString()
            });
            
            get().applyGlobalMutation();
          }
        } catch (error) {
          console.error('Failed to load from cloud:', error);
        }
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

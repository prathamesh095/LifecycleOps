import { getSyncQueue, clearFromSyncQueue } from '../local-cache';
import { useApplicationStore } from '../store';

/**
 * Sync Engine
 * Handles background synchronization between IndexedDB and Neon PostgreSQL.
 */

let isSyncing = false;

export async function triggerSync() {
  if (isSyncing) return;
  
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  console.log(`[SyncEngine] Starting sync for ${queue.length} items...`);

  try {
    const store = useApplicationStore.getState();
    
    // Group by type for batch processing
    const applications = queue.filter(q => q.type === 'APPLICATION');
    const contacts = queue.filter(q => q.type === 'CONTACT');
    const activities = queue.filter(q => q.type === 'ACTIVITY');
    const reminders = queue.filter(q => q.type === 'REMINDER');

    const payload = {
      applications: applications.map(q => store.applications.find(a => a.id === q.id)).filter(Boolean),
      contacts: contacts.map(q => store.contacts.find(c => c.id === q.id)).filter(Boolean),
      activities: activities.flatMap(q => {
        return Object.values(store.activities).flat().filter(a => a.id === q.id);
      }).filter(Boolean),
      reminders: reminders.map(q => store.reminders.find(r => r.id === q.id)).filter(Boolean),
    };

    const response = await fetch('/api/sync/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const syncedIds = queue.map(q => q.id);
      await clearFromSyncQueue(syncedIds);
      console.log('[SyncEngine] Sync successful');
    } else {
      const error = await response.text();
      console.error('[SyncEngine] Sync failed:', error);
    }
  } catch (error) {
    console.error('[SyncEngine] Network error during sync:', error);
  } finally {
    isSyncing = false;
  }
}

export function startPeriodicSync(intervalMs = 30000) {
  setInterval(() => {
    triggerSync();
  }, intervalMs);
}

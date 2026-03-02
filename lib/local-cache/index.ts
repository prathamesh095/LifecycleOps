import { get, set, del, keys } from 'idb-keyval';

/**
 * Local Cache Layer
 * Abstraction over IndexedDB using idb-keyval.
 * Handles persistence and sync status tracking.
 */

const SYNC_QUEUE_KEY = 'apex_sync_queue';

export interface SyncQueueItem {
  id: string;
  type: 'APPLICATION' | 'CONTACT' | 'ACTIVITY' | 'REMINDER';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: number;
}

export async function saveLocal<T>(key: string, data: T): Promise<void> {
  await set(key, data);
}

export async function getLocal<T>(key: string): Promise<T | undefined> {
  return await get(key);
}

export async function deleteLocal(key: string): Promise<void> {
  await del(key);
}

export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const queue = (await get<SyncQueueItem[]>(SYNC_QUEUE_KEY)) || [];
  
  // Remove existing pending syncs for the same ID to avoid redundant calls
  const filteredQueue = queue.filter(q => q.id !== item.id);
  
  await set(SYNC_QUEUE_KEY, [...filteredQueue, item]);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return (await get<SyncQueueItem[]>(SYNC_QUEUE_KEY)) || [];
}

export async function clearFromSyncQueue(ids: string[]): Promise<void> {
  const queue = (await get<SyncQueueItem[]>(SYNC_QUEUE_KEY)) || [];
  const remaining = queue.filter(q => !ids.includes(q.id));
  await set(SYNC_QUEUE_KEY, remaining);
}

export async function getAllKeys(): Promise<string[]> {
  return (await keys()) as string[];
}

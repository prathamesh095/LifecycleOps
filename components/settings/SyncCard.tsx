'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApplicationStore } from '@/lib/store';
import { toast } from 'sonner';
import { CloudUpload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export function SyncCard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const { applications, contacts, activities, reminders, setCloudSynced, loadFromCloud } = useApplicationStore();

  function chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  }

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(null);
    const start = Date.now();
    const BATCH_SIZE = 250;

    try {
      const allActivities = Object.values(activities).flat();
      
      const contactChunks = chunkArray(contacts, BATCH_SIZE);
      const applicationChunks = chunkArray(applications, BATCH_SIZE);
      const activityChunks = chunkArray(allActivities, BATCH_SIZE);
      const reminderChunks = chunkArray(reminders, BATCH_SIZE);

      const totalBatches = contactChunks.length + applicationChunks.length + activityChunks.length + reminderChunks.length;
      let completedBatches = 0;

      // 1. Sync Contacts
      for (const chunk of contactChunks) {
        setSyncProgress({ current: completedBatches, total: totalBatches, stage: 'Contacts' });
        const res = await fetch('/api/sync/initial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: chunk, applications: [], activities: [], reminders: [] }),
        });
        if (!res.ok) throw new Error('Failed to sync contacts batch');
        completedBatches++;
      }

      // 2. Sync Applications
      for (const chunk of applicationChunks) {
        setSyncProgress({ current: completedBatches, total: totalBatches, stage: 'Applications' });
        const res = await fetch('/api/sync/initial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applications: chunk, contacts: [], activities: [], reminders: [] }),
        });
        if (!res.ok) throw new Error('Failed to sync applications batch');
        completedBatches++;
      }

      // 3. Sync Activities
      for (const chunk of activityChunks) {
        setSyncProgress({ current: completedBatches, total: totalBatches, stage: 'Activities' });
        const res = await fetch('/api/sync/initial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activities: chunk, applications: [], contacts: [], reminders: [] }),
        });
        if (!res.ok) throw new Error('Failed to sync activities batch');
        completedBatches++;
      }

      // 4. Sync Reminders
      for (const chunk of reminderChunks) {
        setSyncProgress({ current: completedBatches, total: totalBatches, stage: 'Reminders' });
        const res = await fetch('/api/sync/initial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminders: chunk, applications: [], contacts: [], activities: [] }),
        });
        if (!res.ok) throw new Error('Failed to sync reminders batch');
        completedBatches++;
      }

      setSyncProgress({ current: totalBatches, total: totalBatches, stage: 'Complete' });
      console.log(`[Sync] Full chunked sync completed in ${Date.now() - start}ms`);
      
      toast.success('Data synced to cloud successfully');
      setLastSync(new Date().toLocaleString());
      setCloudSynced(true);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data. Check database connection.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncProgress(null), 3000);
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      await loadFromCloud();
      toast.success('Data loaded from cloud');
      setLastSync(new Date().toLocaleString());
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CloudUpload className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Cloud Sync</h3>
            <p className="text-sm text-neutral-500">
              Sync your data with the secure database.
            </p>
          </div>
        </div>
        {lastSync && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Synced: {lastSync}
          </div>
        )}
      </div>

      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-6 space-y-3">
        {syncProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-500 font-medium">Syncing {syncProgress.stage}...</span>
              <span className="text-neutral-500">{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="bg-blue-600 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Applications</span>
          <span className="font-mono font-medium text-neutral-900">{applications.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Contacts</span>
          <span className="font-mono font-medium text-neutral-900">{contacts.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Activities</span>
          <span className="font-mono font-medium text-neutral-900">
            {Object.values(activities).reduce((acc, curr) => acc + curr.length, 0)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button 
          variant="outline"
          onClick={handleLoad}
          isLoading={isLoading}
          disabled={isSyncing}
        >
          Load from Cloud
        </Button>
        <Button 
          onClick={handleSync} 
          isLoading={isSyncing}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isSyncing ? 'Syncing...' : 'Push to Cloud'}
          {!isSyncing && <RefreshCw className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-neutral-400">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Ensure your database credentials are configured in the server environment variables before syncing.
        </p>
      </div>
    </Card>
  );
}

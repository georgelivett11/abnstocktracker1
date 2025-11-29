import { useState, useEffect } from 'react';
import { userSyncService } from '@/lib/user-sync-service';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface UseSyncReturn {
  status: SyncStatus;
  error: string | null;
  lastSync: string | null;
  isConfigured: boolean;
  manualSync: () => Promise<void>;
}

export function useUserSync(autoSync = false): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isConfigured] = useState(() => userSyncService.isConfigured());

  useEffect(() => {
    // Subscribe to sync state changes
    const unsubscribe = userSyncService.subscribe((state) => {
      setStatus(state.status);
      setError(state.error);
      setLastSync(state.lastSync);
    });

    // Start auto-sync if requested and configured
    if (autoSync && isConfigured) {
      userSyncService.startAutoSync();
    }

    // Cleanup
    return () => {
      unsubscribe();
      if (autoSync) {
        userSyncService.stopAutoSync();
      }
    };
  }, [autoSync, isConfigured]);

  const manualSync = async () => {
    if (!isConfigured) return;
    await userSyncService.sync();
  };

  return {
    status,
    error,
    lastSync,
    isConfigured,
    manualSync,
  };
}

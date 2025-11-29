import { useState, useEffect } from 'react';
import {
  startAutoSync,
  stopAutoSync,
  onSyncStatusChange,
  getSyncInfo,
  triggerManualSync,
  type SyncStatus,
} from '@/lib/sync-service';
import { isGoogleSheetsConfigured } from '@/lib/google-sheets';

interface SyncState {
  status: SyncStatus;
  error?: string;
  lastSync: Date | null;
  isConfigured: boolean;
  isActive: boolean;
}

export function useSheetsSync(autoStart: boolean = true) {
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const info = getSyncInfo();
    return {
      status: info.status,
      error: info.error,
      lastSync: info.lastSync,
      isConfigured: info.isConfigured,
      isActive: info.isActive,
    };
  });

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = onSyncStatusChange((status, error) => {
      const info = getSyncInfo();
      setSyncState({
        status,
        error,
        lastSync: info.lastSync,
        isConfigured: info.isConfigured,
        isActive: info.isActive,
      });
    });

    // Start auto-sync if enabled and configured
    if (autoStart && isGoogleSheetsConfigured()) {
      const intervalMs = Number(import.meta.env.VITE_SYNC_INTERVAL) || 5000;
      startAutoSync(intervalMs);
    }

    return () => {
      unsubscribe();
      if (autoStart) {
        stopAutoSync();
      }
    };
  }, [autoStart]);

  const manualSync = async () => {
    await triggerManualSync();
  };

  return {
    ...syncState,
    manualSync,
  };
}

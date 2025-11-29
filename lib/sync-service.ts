import { type InventoryItem } from '@/types';
import {
  fetchInventoryFromSheets,
  updateLastSyncTime,
  getLastSyncTime,
  isGoogleSheetsConfigured,
} from './google-sheets';

// Storage key for local inventory cache
const INVENTORY_CACHE_KEY = 'inventory_items_cache';

// Sync status type
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// Sync event listeners
type SyncListener = (status: SyncStatus, error?: string) => void;
const syncListeners: SyncListener[] = [];

let currentSyncStatus: SyncStatus = 'idle';
let lastSyncError: string | undefined;

// Subscribe to sync status changes
export function onSyncStatusChange(listener: SyncListener): () => void {
  syncListeners.push(listener);
  // Immediately notify with current status
  listener(currentSyncStatus, lastSyncError);

  // Return unsubscribe function
  return () => {
    const index = syncListeners.indexOf(listener);
    if (index > -1) {
      syncListeners.splice(index, 1);
    }
  };
}

// Update sync status and notify listeners
function updateSyncStatus(status: SyncStatus, error?: string): void {
  currentSyncStatus = status;
  lastSyncError = error;
  syncListeners.forEach((listener) => listener(status, error));
}

// Get current sync status
export function getSyncStatus(): { status: SyncStatus; error?: string } {
  return { status: currentSyncStatus, error: lastSyncError };
}

// Sync inventory from Google Sheets
export async function syncFromGoogleSheets(): Promise<{
  success: boolean;
  data?: InventoryItem[];
  error?: string;
}> {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Please add API credentials.',
    };
  }

  updateSyncStatus('syncing');

  try {
    const result = await fetchInventoryFromSheets();

    if (result.success && result.data) {
      // Cache the data locally
      localStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(result.data));
      updateLastSyncTime();
      updateSyncStatus('success');
      return { success: true, data: result.data };
    } else {
      updateSyncStatus('error', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error during sync';
    updateSyncStatus('error', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Get cached inventory (fallback when sheets unavailable)
export function getCachedInventory(): InventoryItem[] {
  try {
    const cached = localStorage.getItem(INVENTORY_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

// Manual sync trigger
export async function triggerManualSync(): Promise<void> {
  await syncFromGoogleSheets();
}

// Auto-sync setup with polling
let syncInterval: number | undefined;

export function startAutoSync(intervalMs: number = 5000): void {
  if (syncInterval) {
    stopAutoSync();
  }

  // Initial sync
  syncFromGoogleSheets();

  // Set up polling
  syncInterval = window.setInterval(() => {
    syncFromGoogleSheets();
  }, intervalMs);
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = undefined;
  }
}

// Get sync info for UI
export function getSyncInfo() {
  const lastSync = getLastSyncTime();
  const isConfigured = isGoogleSheetsConfigured();
  const { status, error } = getSyncStatus();

  return {
    isConfigured,
    lastSync: lastSync ? new Date(lastSync) : null,
    status,
    error,
    isActive: syncInterval !== undefined,
  };
}

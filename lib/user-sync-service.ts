import {
  fetchUsersFromSheets,
  isUsersGoogleSheetsConfigured,
  updateLastUserSyncTime,
} from './google-sheets';
import { type User } from '@/types';

const USERS_CACHE_KEY = 'inventory_users_cache';
const SYNC_INTERVAL = Number(import.meta.env.VITE_SYNC_INTERVAL) || 5000;

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  error: string | null;
  lastSync: string | null;
}

class UserSyncService {
  private syncInterval: number | null = null;
  private listeners: Array<(state: SyncState) => void> = [];
  private state: SyncState = {
    status: 'idle',
    error: null,
    lastSync: localStorage.getItem('last_users_sheets_sync'),
  };

  private setState(updates: Partial<SyncState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: SyncState) => void) {
    this.listeners.push(listener);
    // Immediately send current state to new subscriber
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState() {
    return this.state;
  }

  async sync(): Promise<void> {
    if (!isUsersGoogleSheetsConfigured()) {
      this.setState({
        status: 'error',
        error: 'Google Sheets for users not configured',
      });
      return;
    }

    this.setState({ status: 'syncing', error: null });

    try {
      const result = await fetchUsersFromSheets();

      if (result.success && result.data) {
        // Update cache with fetched data
        localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(result.data));
        updateLastUserSyncTime();

        this.setState({
          status: 'success',
          error: null,
          lastSync: new Date().toISOString(),
        });
      } else {
        throw new Error(result.error || 'Failed to sync users');
      }
    } catch (error) {
      this.setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  startAutoSync() {
    if (!isUsersGoogleSheetsConfigured()) {
      return;
    }

    // Initial sync
    this.sync();

    // Set up polling
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, SYNC_INTERVAL);
  }

  stopAutoSync() {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  isConfigured(): boolean {
    return isUsersGoogleSheetsConfigured();
  }
}

// Export singleton instance
export const userSyncService = new UserSyncService();

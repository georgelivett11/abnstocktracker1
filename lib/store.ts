import { type User, type InventoryItem, type AuditLog, type UserPermissions } from '@/types';
import { isGoogleSheetsConfigured, isUsersGoogleSheetsConfigured } from './google-sheets';

// Storage keys
const USERS_KEY = 'inventory_users';
const USERS_CACHE_KEY = 'inventory_users_cache';
const INVENTORY_KEY = 'inventory_items';
const INVENTORY_CACHE_KEY = 'inventory_items_cache';
const AUDIT_LOG_KEY = 'audit_logs';
const CURRENT_USER_KEY = 'current_user';

// Helper functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Initialize with master account if no users exist
function initializeUsers(): User[] {
  const existingUsers = getFromStorage<User[]>(USERS_KEY, []);
  if (existingUsers.length === 0) {
    const masterUser: User = {
      id: '1',
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      email: 'admin@inventory.com',
      role: 'master',
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(USERS_KEY, [masterUser]);
    return [masterUser];
  }
  return existingUsers;
}

// User operations
export const userStore = {
  getAll(): User[] {
    // If Users Google Sheets is configured, use the synced cache
    if (isUsersGoogleSheetsConfigured()) {
      const cachedUsers = getFromStorage<User[]>(USERS_CACHE_KEY, []);
      // If cache is empty, fall back to initialized users
      if (cachedUsers.length === 0) {
        return initializeUsers();
      }
      return cachedUsers;
    }
    // Otherwise, use initialized users from local storage
    return initializeUsers();
  },

  getById(id: string): User | undefined {
    const users = this.getAll();
    return users.find((u: User) => u.id === id);
  },

  getByUsername(username: string): User | undefined {
    const users = this.getAll();
    return users.find((u: User) => u.username === username);
  },

  create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getAll();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);

    // Save to appropriate storage based on configuration
    if (isUsersGoogleSheetsConfigured()) {
      saveToStorage(USERS_CACHE_KEY, users);
    } else {
      saveToStorage(USERS_KEY, users);
    }
    return newUser;
  },

  update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const users = this.getAll();
    const index = users.findIndex((u: User) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Save to appropriate storage based on configuration
    if (isUsersGoogleSheetsConfigured()) {
      saveToStorage(USERS_CACHE_KEY, users);
    } else {
      saveToStorage(USERS_KEY, users);
    }
    return users[index];
  },

  delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter((u: User) => u.id !== id);
    if (filtered.length === users.length) return false;

    // Save to appropriate storage based on configuration
    if (isUsersGoogleSheetsConfigured()) {
      saveToStorage(USERS_CACHE_KEY, filtered);
    } else {
      saveToStorage(USERS_KEY, filtered);
    }
    return true;
  },

  authenticate(username: string, password: string): User | null {
    const user = this.getByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  },
};

// Current user session
export const sessionStore = {
  getCurrentUser(): User | null {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    return userStore.getById(userId) || null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  },

  clearCurrentUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};

// Inventory operations
export const inventoryStore = {
  getAll(): InventoryItem[] {
    // If Google Sheets is configured, use the synced cache
    if (isGoogleSheetsConfigured()) {
      return getFromStorage<InventoryItem[]>(INVENTORY_CACHE_KEY, []);
    }
    // Otherwise, use local storage
    return getFromStorage<InventoryItem[]>(INVENTORY_KEY, []);
  },

  getById(id: string): InventoryItem | undefined {
    const items = this.getAll();
    return items.find((item: InventoryItem) => item.id === id);
  },

  getByShelf(rack: string, shelf: string): InventoryItem[] {
    const items = this.getAll();
    return items.filter((item: InventoryItem) => item.rack === rack && item.shelf === shelf);
  },

  search(query: string): InventoryItem[] {
    const items = this.getAll();
    const lowerQuery = query.toLowerCase();
    return items.filter((item: InventoryItem) =>
      item.itemName.toLowerCase().includes(lowerQuery)
    );
  },

  create(
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): InventoryItem {
    const items = this.getAll();
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    saveToStorage(INVENTORY_KEY, items);
    return newItem;
  },

  update(
    id: string,
    updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
  ): InventoryItem | null {
    const items = this.getAll();
    const index = items.findIndex((item: InventoryItem) => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(INVENTORY_KEY, items);
    return items[index];
  },

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item: InventoryItem) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveToStorage(INVENTORY_KEY, filtered);
    return true;
  },

  bulkCreate(items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]): InventoryItem[] {
    const existingItems = this.getAll();
    const newItems: InventoryItem[] = items.map((itemData) => ({
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    existingItems.push(...newItems);
    saveToStorage(INVENTORY_KEY, existingItems);
    return newItems;
  },
};

// Audit log operations
export const auditLogStore = {
  getAll(): AuditLog[] {
    return getFromStorage<AuditLog[]>(AUDIT_LOG_KEY, []);
  },

  getFiltered(startDate?: string, endDate?: string, searchQuery?: string): AuditLog[] {
    let logs = this.getAll();

    if (startDate) {
      logs = logs.filter((log: AuditLog) => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      logs = logs.filter((log: AuditLog) => new Date(log.timestamp) <= end);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      logs = logs.filter(
        (log: AuditLog) =>
          log.description.toLowerCase().includes(query) ||
          log.username.toLowerCase().includes(query) ||
          log.itemName?.toLowerCase().includes(query) ||
          log.notes?.toLowerCase().includes(query)
      );
    }

    return logs.sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  create(logData: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const logs = this.getAll();
    const newLog: AuditLog = {
      ...logData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    logs.push(newLog);
    saveToStorage(AUDIT_LOG_KEY, logs);
    return newLog;
  },

  updateNotes(id: string, notes: string): AuditLog | null {
    const logs = this.getAll();
    const index = logs.findIndex((log: AuditLog) => log.id === id);
    if (index === -1) return null;

    logs[index] = {
      ...logs[index],
      notes,
    };
    saveToStorage(AUDIT_LOG_KEY, logs);
    return logs[index];
  },
};

// Helper to create audit logs
export function createAuditLog(
  user: User,
  action: AuditLog['action'],
  description: string,
  metadata?: Partial<Pick<AuditLog, 'shelfLocation' | 'itemName' | 'previousValue' | 'newValue'>>
): void {
  auditLogStore.create({
    userId: user.id,
    username: user.username,
    action,
    description,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

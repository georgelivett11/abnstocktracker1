// User types
export type UserRole = 'master' | 'admin' | 'editor' | 'viewer';

export interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
}

// Inventory types
export type Rack = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'LB';
export type Shelf = '1' | '2' | '3' | '4';

export interface InventoryItem {
  id: string;
  rack: Rack;
  shelf: Shelf;
  itemName: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // user id
  lastModifiedBy: string; // user id
}

// Audit log types
export type AuditAction =
  | 'add'
  | 'edit'
  | 'delete'
  | 'import'
  | 'user_create'
  | 'user_edit'
  | 'user_delete';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: AuditAction;
  description: string;
  shelfLocation?: string;
  itemName?: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
  timestamp: string;
  createdAt: string;
}

// Import/Export types
export interface ImportRecord {
  rack: string;
  shelf: string;
  item: string;
  qty: string;
}

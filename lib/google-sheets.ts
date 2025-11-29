import { type InventoryItem, type User } from '@/types';

// Google Sheets API configuration
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const USERS_SHEET_ID = import.meta.env.VITE_GOOGLE_USERS_SHEET_ID;
const SHEET_NAME = 'Inventory'; // The name of the sheet tab
const USERS_SHEET_NAME = 'Users'; // The name of the users sheet tab

// Check if Google Sheets is configured
export function isGoogleSheetsConfigured(): boolean {
  return Boolean(API_KEY && SHEET_ID);
}

// Check if Users Google Sheets is configured
export function isUsersGoogleSheetsConfigured(): boolean {
  return Boolean(API_KEY && USERS_SHEET_ID);
}

// Get configuration status
export function getConfigStatus() {
  return {
    hasApiKey: Boolean(API_KEY),
    hasSheetId: Boolean(SHEET_ID),
    hasUsersSheetId: Boolean(USERS_SHEET_ID),
    isConfigured: isGoogleSheetsConfigured(),
    isUsersConfigured: isUsersGoogleSheetsConfigured(),
  };
}

// Convert inventory item to sheet row
function itemToRow(item: InventoryItem): (string | number)[] {
  return [
    item.id,
    item.rack,
    item.shelf,
    item.itemName,
    item.quantity,
    item.createdAt,
    item.updatedAt,
    item.createdBy,
    item.lastModifiedBy,
  ];
}

// Convert sheet row to inventory item
function rowToItem(row: (string | number)[]): InventoryItem | null {
  if (!row || row.length < 9) return null;

  return {
    id: String(row[0]),
    rack: String(row[1]) as InventoryItem['rack'],
    shelf: String(row[2]) as InventoryItem['shelf'],
    itemName: String(row[3]),
    quantity: Number(row[4]),
    createdAt: String(row[5]),
    updatedAt: String(row[6]),
    createdBy: String(row[7]),
    lastModifiedBy: String(row[8]),
  };
}

// Initialize the sheet with headers
export async function initializeSheet(): Promise<{ success: boolean; error?: string }> {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets not configured' };
  }

  try {
    // First, check if the sheet exists
    const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
    const checkResponse = await fetch(checkUrl);

    if (!checkResponse.ok) {
      throw new Error('Invalid Sheet ID or API Key');
    }

    // Check if Inventory sheet exists and has headers
    const range = `${SHEET_NAME}!A1:I1`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Sheet might not exist, try to create it (requires OAuth, so we'll skip)
      throw new Error('Inventory sheet not found. Please create it manually.');
    }

    const data = await response.json();

    // If no headers, we need to add them (requires OAuth)
    if (!data.values || data.values.length === 0) {
      return {
        success: false,
        error: 'Please add headers to the Inventory sheet: ID, Rack, Shelf, Item Name, Quantity, Created At, Updated At, Created By, Last Modified By',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize sheet',
    };
  }
}

// Fetch all inventory items from Google Sheets
export async function fetchInventoryFromSheets(): Promise<{
  success: boolean;
  data?: InventoryItem[];
  error?: string;
}> {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets not configured' };
  }

  try {
    const range = `${SHEET_NAME}!A2:I`; // Skip header row
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      return { success: true, data: [] };
    }

    const items: InventoryItem[] = data.values
      .map((row: (string | number)[]) => rowToItem(row))
      .filter((item: InventoryItem | null): item is InventoryItem => item !== null);

    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch from Google Sheets',
    };
  }
}

// Note: Writing to Google Sheets requires OAuth2 authentication
// The API Key alone only allows read operations
// For write operations, you'll need to set up OAuth2 with proper credentials

export async function canWriteToSheets(): Promise<boolean> {
  // API Key only allows read access
  // To enable write access, we'd need OAuth2 implementation
  return false;
}

// Mock write function that explains the limitation
export async function syncInventoryToSheets(
  items: InventoryItem[]
): Promise<{ success: boolean; error?: string }> {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets not configured' };
  }

  return {
    success: false,
    error: 'Writing to Google Sheets requires OAuth2 authentication. Currently only read-only mode is supported with API Key.',
  };
}

// Get last sync timestamp from localStorage
export function getLastSyncTime(): string | null {
  return localStorage.getItem('last_sheets_sync');
}

// Update last sync timestamp
export function updateLastSyncTime(): void {
  localStorage.setItem('last_sheets_sync', new Date().toISOString());
}

// ========== USER MANAGEMENT FUNCTIONS ==========

// Convert user to sheet row
function userToRow(user: User): (string | number)[] {
  return [
    user.id,
    user.username,
    user.password,
    user.email,
    user.role,
    user.permissions.canView ? 'TRUE' : 'FALSE',
    user.permissions.canEdit ? 'TRUE' : 'FALSE',
    user.permissions.canDelete ? 'TRUE' : 'FALSE',
    user.permissions.canManageUsers ? 'TRUE' : 'FALSE',
    user.createdAt,
    user.updatedAt,
  ];
}

// Convert sheet row to user
function rowToUser(row: (string | number)[]): User | null {
  if (!row || row.length < 11) return null;

  return {
    id: String(row[0]),
    username: String(row[1]),
    password: String(row[2]),
    email: String(row[3]),
    role: String(row[4]) as User['role'],
    permissions: {
      canView: String(row[5]).toUpperCase() === 'TRUE',
      canEdit: String(row[6]).toUpperCase() === 'TRUE',
      canDelete: String(row[7]).toUpperCase() === 'TRUE',
      canManageUsers: String(row[8]).toUpperCase() === 'TRUE',
    },
    createdAt: String(row[9]),
    updatedAt: String(row[10]),
  };
}

// Fetch all users from Google Sheets
export async function fetchUsersFromSheets(): Promise<{
  success: boolean;
  data?: User[];
  error?: string;
}> {
  if (!isUsersGoogleSheetsConfigured()) {
    return { success: false, error: 'Users Google Sheets not configured' };
  }

  try {
    const range = `${USERS_SHEET_NAME}!A2:K`; // Skip header row
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${USERS_SHEET_ID}/values/${range}?key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      return { success: true, data: [] };
    }

    const users: User[] = data.values
      .map((row: (string | number)[]) => rowToUser(row))
      .filter((user: User | null): user is User => user !== null);

    return { success: true, data: users };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users from Google Sheets',
    };
  }
}

// Sync users to Google Sheets (write operation - requires OAuth2)
export async function syncUsersToSheets(
  users: User[]
): Promise<{ success: boolean; error?: string }> {
  if (!isUsersGoogleSheetsConfigured()) {
    return { success: false, error: 'Users Google Sheets not configured' };
  }

  // Note: This requires OAuth2 authentication for write access
  // With API Key alone, we only have read-only access
  // You'll need to implement OAuth2 flow for write operations

  return {
    success: false,
    error: 'Writing to Google Sheets requires OAuth2 authentication. Currently only read-only mode is supported with API Key.',
  };
}

// Get last user sync timestamp from localStorage
export function getLastUserSyncTime(): string | null {
  return localStorage.getItem('last_users_sheets_sync');
}

// Update last user sync timestamp
export function updateLastUserSyncTime(): void {
  localStorage.setItem('last_users_sheets_sync', new Date().toISOString());
}

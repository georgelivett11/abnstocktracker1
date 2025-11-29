# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for real-time inventory syncing across all users.

## Overview

The inventory management system can sync with Google Sheets to provide:
- **Real-time updates** - All users see the same data, updated every 5 seconds
- **Cloud backup** - Your inventory data is stored in Google Sheets
- **Manual editing** - Update inventory directly in Google Sheets
- **Offline support** - Cached data continues to work when offline

## Quick Start

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename the first sheet tab to **"Inventory"** (case-sensitive)
4. Add these headers in the first row (A1:I1):

```
ID | Rack | Shelf | Item Name | Quantity | Created At | Updated At | Created By | Last Modified By
```

5. Copy the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the long string between `/d/` and `/edit`

### 2. Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable the **Google Sheets API**:
   - Navigate to: APIs & Services → Library
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create an **API Key**:
   - Navigate to: APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy your API key
   - **Optional:** Click "Restrict Key" and limit to Google Sheets API only (recommended for security)

### 3. Make Sheet Publicly Readable

1. Open your Google Sheet
2. Click the **Share** button (top right)
3. Click "Change to anyone with the link"
4. Set permissions to **Viewer**
5. Click "Done"

⚠️ **Important:** The sheet needs to be public (or shared with anyone with the link) because we're using API Key authentication, which doesn't include user credentials.

### 4. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Required: Your Google Sheets API Key
VITE_GOOGLE_SHEETS_API_KEY=AIza...your_key_here

# Required: Your Google Sheet ID
VITE_GOOGLE_SHEET_ID=1a2b3c...your_sheet_id_here

# Optional: Sync interval in milliseconds (default: 5000 = 5 seconds)
VITE_SYNC_INTERVAL=5000
```

### 5. Restart Your Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## How It Works

### Read-Only Sync

The current implementation uses **API Key authentication**, which provides:
- ✅ **Read access** to Google Sheets
- ✅ Simple setup (no OAuth required)
- ✅ Automatic polling every 5 seconds
- ❌ **No write access** from the app

This means:
- Users can **view** real-time data from Google Sheets
- To **update** inventory, manually edit the Google Sheet
- All connected users will see changes within the sync interval

### Data Flow

```
Google Sheets (Source of Truth)
        ↓
  [Polling every 5s]
        ↓
  Local Cache (App)
        ↓
   User Interface
```

1. The app fetches data from Google Sheets every 5 seconds
2. Data is cached locally in the browser
3. All inventory views show the cached (synced) data
4. If Google Sheets is unavailable, the app uses the last cached data

## UI Features

### Sync Status Indicator

In the header, you'll see a sync status indicator:

- 🔄 **Syncing...** - Currently fetching from Google Sheets
- ☁️ **Synced [time]** - Successfully synced, shows last sync time
- ⚠️ **Sync error** - Connection issue or configuration problem
- ⚙️ **Setup Google Sheets** - Not yet configured

### Manual Sync Button

Click the refresh icon to manually trigger a sync (useful for immediate updates).

### Error Alerts

If there's a sync error, you'll see an alert banner with:
- The error message
- A link to check your setup configuration

## Troubleshooting

### "Google Sheets not configured"

**Solution:** Create a `.env` file with your API key and Sheet ID, then restart the server.

### "Invalid Sheet ID or API Key"

**Solutions:**
- Verify your Sheet ID is correct (check the URL)
- Verify your API Key is correct (check Google Cloud Console)
- Ensure Google Sheets API is enabled in your Google Cloud project
- Check that the API key hasn't been restricted to exclude Google Sheets API

### "Inventory sheet not found"

**Solution:**
- The sheet tab must be named exactly **"Inventory"** (case-sensitive)
- Create a sheet tab with this name in your Google Spreadsheet

### "Please add headers to the Inventory sheet"

**Solution:**
- Add the required headers in row 1:
  `ID, Rack, Shelf, Item Name, Quantity, Created At, Updated At, Created By, Last Modified By`

### Sheet is not syncing

**Solutions:**
1. Check that the sheet is publicly readable (Share → Anyone with the link → Viewer)
2. Try clicking the manual sync button
3. Check browser console for error messages
4. Verify the sheet has the "Inventory" tab with proper headers

### Data format issues

**Important:** When manually editing the Google Sheet:
- **Rack:** Must be A, B, C, D, E, F, G, or LB
- **Shelf:** Must be 1, 2, 3, or 4
- **Quantity:** Must be a non-negative number
- **Dates:** Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)

## Upgrading to Write Access (Advanced)

To enable **write access** (updating Google Sheets from the app), you would need to:

1. Set up **OAuth2 authentication** instead of API Key
2. Request the `https://www.googleapis.com/auth/spreadsheets` scope
3. Implement the OAuth2 flow in the app
4. Update the `google-sheets.ts` service to use OAuth credentials

This is more complex but allows full read/write access. Contact your developer if you need this feature.

## Security Considerations

### API Key Security

- ✅ **DO:** Restrict your API key to only the Google Sheets API
- ✅ **DO:** Restrict your API key to specific referrer URLs (your domain)
- ❌ **DON'T:** Commit your `.env` file to version control
- ❌ **DON'T:** Share your API key publicly

### Sheet Permissions

- The sheet must be publicly readable for API Key auth
- Anyone with the link can view the sheet
- Only people you explicitly grant edit access can modify it
- Consider using a separate Google account for the sheet if needed

## Performance Tips

1. **Adjust Sync Interval:**
   - Default: 5000ms (5 seconds)
   - For less frequent updates: Increase to 10000ms (10 seconds)
   - For real-time needs: Decrease to 3000ms (3 seconds)
   - Don't go below 1000ms to avoid rate limits

2. **Monitor API Usage:**
   - Google Sheets API has quota limits
   - Check usage in Google Cloud Console
   - With default 5s polling: ~12 requests/minute per user

3. **Optimize Sheet Size:**
   - Keep sheet focused on active inventory
   - Archive old data to separate sheets
   - Avoid unnecessary formulas in the data range

## Support

If you encounter issues:

1. Check this documentation
2. Review the in-app Setup page (Settings icon in header)
3. Test your connection using the "Test Connection" button
4. Check browser console for detailed error messages
5. Verify all steps in the setup process

## Example Sheet Template

You can use this as a template:

| ID | Rack | Shelf | Item Name | Quantity | Created At | Updated At | Created By | Last Modified By |
|----|------|-------|-----------|----------|------------|------------|------------|------------------|
| 1  | A    | 1     | Widget A  | 100      | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z | admin | admin |
| 2  | B    | 2     | Widget B  | 50       | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z | admin | admin |

Simply copy this structure and add your own inventory items!

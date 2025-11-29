# Inventory Management System - Google Sheets Integration

## 🎉 What's New

Your inventory management system now supports **real-time syncing with Google Sheets**! This means:

- ✅ **Live Updates** - All users see the same inventory data in real-time
- ✅ **Cloud Backup** - Your data is stored in Google Sheets as a backup
- ✅ **Manual Editing** - Update inventory directly in Google Sheets
- ✅ **Multi-User** - Perfect for teams working together
- ✅ **Offline Support** - Works even when temporarily disconnected

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create `.env` File

Create a file named `.env` in the project root:

```bash
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
```

### Step 2: Get Your Credentials

1. **Sheet ID**: Create a Google Sheet, copy the ID from the URL
2. **API Key**: Get one from [Google Cloud Console](https://console.cloud.google.com)

### Step 3: Set Up Your Sheet

1. Create a sheet tab named **"Inventory"**
2. Add headers in row 1:
   ```
   ID | Rack | Shelf | Item Name | Quantity | Created At | Updated At | Created By | Last Modified By
   ```
3. Make the sheet publicly readable (Share → Anyone with the link → Viewer)

### Step 4: Restart Server

```bash
npm run dev
```

**That's it!** Your app will now sync with Google Sheets automatically.

## 📖 Detailed Setup Instructions

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for comprehensive setup instructions.

## 🎯 How to Use

### Viewing Inventory

1. Log in to the app (default: `admin` / `admin123`)
2. Navigate to any inventory page
3. Data automatically syncs every 5 seconds from Google Sheets
4. Look for the sync status in the header (cloud icon)

### Updating Inventory

**Option 1: Manual Edit in Google Sheets**
1. Open your Google Sheet
2. Edit any inventory items directly
3. All users will see changes within 5 seconds

**Option 2: In-App (Without Google Sheets)**
- If Google Sheets is not configured, the app works with local storage
- Data is stored only in the browser

### Manual Sync

Click the refresh button in the header to manually sync immediately.

## 🔧 Features

### Sync Status Indicator

The header shows your connection status:

- 🔄 **Syncing...** - Fetching latest data
- ☁️ **Synced [time]** - Up to date
- ⚠️ **Sync error** - Configuration issue
- ⚙️ **Setup Google Sheets** - Not configured yet

### In-App Setup Page

Click the "Setup Google Sheets" button to access:
- Configuration status checker
- Step-by-step setup instructions
- Connection test tool
- Troubleshooting guide

## 📝 Important Notes

### Read-Only Mode

The current implementation uses **API Key authentication** which provides:
- ✅ Read access from Google Sheets
- ❌ No write access to Google Sheets

**What this means:**
- The app can READ from Google Sheets
- To UPDATE data, edit the Google Sheet manually
- All users will see the manual changes in real-time

### Data Priority

When Google Sheets is configured:
1. Data is fetched from Google Sheets
2. Cached locally in the browser
3. Local cache used if sync fails

Without Google Sheets:
- Data stored in browser localStorage
- Works completely offline
- Data not shared between users/devices

## 🔒 Security

- Your API Key is stored in `.env` (never commit this file!)
- The Google Sheet must be publicly readable
- Edit access can be restricted to specific users
- All audit logs continue to work as before

## 🎨 UI Updates

### Header
- Real-time sync status indicator with icons
- Manual refresh button
- Error alerts with helpful links
- "Setup Google Sheets" button when not configured

### Setup Page
- Configuration status checker
- Complete setup walkthrough
- Test connection tool
- Troubleshooting help

## 📊 Example Sheet

Here's what your Google Sheet should look like:

| ID | Rack | Shelf | Item Name | Quantity | Created At | Updated At | Created By | Last Modified By |
|----|------|-------|-----------|----------|------------|------------|------------|------------------|
| 1  | A    | 1     | Widget A  | 100      | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z | admin | admin |
| 2  | B    | 2     | Widget B  | 50       | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z | admin | admin |
| 3  | LB   | 1     | Widget C  | 25       | 2024-01-01T00:00:00.000Z | 2024-01-01T00:00:00.000Z | admin | admin |

## 🛠️ Configuration Options

In your `.env` file:

```bash
# Required: Google Sheets API Key
VITE_GOOGLE_SHEETS_API_KEY=AIza...

# Required: Your Sheet ID
VITE_GOOGLE_SHEET_ID=1a2b3c...

# Optional: Sync interval (milliseconds)
# Default: 5000 (5 seconds)
# Recommended range: 3000-10000
VITE_SYNC_INTERVAL=5000
```

## 🐛 Troubleshooting

### Not Syncing?

1. ✅ Check `.env` file exists with correct values
2. ✅ Restart the development server
3. ✅ Verify Google Sheets API is enabled
4. ✅ Ensure sheet is publicly readable
5. ✅ Check sheet tab is named "Inventory"
6. ✅ Verify headers are in row 1

### Error Messages?

Click "Check Settings" in the error alert to:
- See detailed configuration status
- Test your connection
- Get specific error resolution steps

### Still Having Issues?

1. Check the browser console for errors
2. Use the "Test Connection" button in Setup page
3. Review [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

## 📁 New Files Added

```
src/
  lib/
    google-sheets.ts       # Google Sheets API client
    sync-service.ts        # Sync orchestration
  hooks/
    use-sheets-sync.ts     # React hook for syncing
  components/
    pages/
      SetupPage.tsx        # Setup instructions UI

.env.example               # Example environment config
GOOGLE_SHEETS_SETUP.md     # Detailed setup guide
README_SHEETS_INTEGRATION.md  # This file
```

## 🎯 Original Features (Still Working!)

All your existing features continue to work:

- ✅ User authentication & role-based access
- ✅ Shelf management (Racks A-G, LB-1/2/3)
- ✅ Inventory CRUD operations
- ✅ Search functionality
- ✅ Audit logging with user attribution
- ✅ Stock import/export (JSON)
- ✅ User management

The Google Sheets integration **adds** to these features without replacing them!

## 📈 Future Enhancements

Potential upgrades (not yet implemented):

- OAuth2 for write access from the app
- Conflict resolution for simultaneous edits
- Change notifications/webhooks
- Export audit logs to separate sheet
- User management in Google Sheets

## 💡 Tips

1. **Test First**: Use the "Test Connection" button before going live
2. **Backup**: Export your data before switching to Google Sheets
3. **Monitor**: Watch the sync status to ensure everything is working
4. **Security**: Restrict your API key to your domain in Google Cloud Console
5. **Performance**: Adjust `VITE_SYNC_INTERVAL` based on your needs

## 🎓 Learn More

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com)
- Full setup guide: `GOOGLE_SHEETS_SETUP.md`

---

**Need Help?** Check the in-app Setup page or review the detailed setup guide!

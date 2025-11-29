# ⚡ Quick Start Guide - Netlify Deployment

## 🎯 Your Question Answered

**"Should I link Google Sheets first or deploy to Netlify first?"**

**Answer: Set up Google Sheets FIRST, then deploy to Netlify.**

**Why?** You need your API credentials to configure Netlify environment variables, and testing locally first ensures everything works before going live.

---

## 📋 Step-by-Step Workflow

### Phase 1: Configure Google Sheets (10-15 minutes)

1. **Create Google Sheet** at [sheets.google.com](https://sheets.google.com)
   - Name it "ABN Stock Tracker"
   - Create two tabs: "Inventory" and "Users"

2. **Add headers**

   **Inventory tab:**
   ```
   ID, Rack, Shelf, Item Name, Quantity, Created At, Updated At, Created By, Last Modified By
   ```

   **Users tab:**
   ```
   ID, Username, Password, Email, Role, Can View, Can Edit, Can Delete, Can Manage Users, Created At, Updated At
   ```

3. **Add a test user** to the Users tab:
   ```
   1, admin, admin123, admin@example.com, Admin, TRUE, TRUE, TRUE, TRUE, 2024-01-01T00:00:00Z, 2024-01-01T00:00:00Z
   ```

4. **Share your sheet**
   - Click "Share" → "Anyone with the link" → "Viewer"

5. **Get Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
   Copy the ID between `/d/` and `/edit`

6. **Get API Key** from [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project → "ABN Stock Tracker"
   - Enable "Google Sheets API"
   - Create Credentials → API Key
   - Copy the API key

7. **Test locally** (optional but recommended):
   ```bash
   # Create .env file
   cat > .env << EOF
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
   VITE_GOOGLE_SHEET_ID=your_sheet_id_here
   VITE_GOOGLE_USERS_SHEET_ID=your_sheet_id_here
   VITE_SYNC_INTERVAL=5000
   EOF

   # Install and run
   npm install
   npm run dev
   ```

✅ **Done!** Your Google Sheets backend is ready.

---

### Phase 2: Deploy to Netlify (10 minutes)

1. **Go to [Netlify](https://app.netlify.com)**
   - Sign up or log in

2. **Deploy your site**

   **Option A: Deploy from Git (Recommended)**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub/GitLab/Bitbucket
   - Select your repository
   - Click "Deploy site"

   **Option B: Manual Deploy (No Git Required)**
   - Click "Add new site" → "Deploy manually"
   - Drag and drop your project folder
   - Netlify builds and deploys automatically

3. **Add environment variables**
   - Go to Site settings → Environment variables
   - Click "Add a variable" and add:
   ```
   VITE_GOOGLE_SHEETS_API_KEY = [Your API Key]
   VITE_GOOGLE_SHEET_ID = [Your Sheet ID]
   VITE_GOOGLE_USERS_SHEET_ID = [Your Sheet ID]
   VITE_SYNC_INTERVAL = 5000
   ```

4. **Redeploy with environment variables**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait 2-3 minutes for build to complete

5. **Test your live site**
   - Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
   - Navigate to Setup page
   - Click "Test Connection"
   - Should see: ✅ "Successfully connected to Google Sheets!"

✅ **Done!** Your app is live on Netlify with real-time syncing!

---

## 📖 Need More Details?

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for:
- Detailed step-by-step screenshots
- Troubleshooting common issues
- Security best practices
- Netlify CLI deployment
- Custom domain setup
- Auto-deploy from Git setup

---

## 🔄 How User Syncing Works

**Adding users:**
- Manually add a row in the "Users" tab of your Google Sheet
- Fill in: ID, Username, Password, Email, Role, permissions, timestamps
- App syncs automatically within 5 seconds

**Editing users:**
- Edit the user's row in Google Sheets
- Changes appear in all connected apps within 5 seconds

**Deleting users:**
- Delete the user's row in Google Sheets
- User is removed from all apps within 5 seconds

The Users page shows real-time sync status and last sync time!

---

## 🚀 Updating Your Deployed Site

**If you connected Netlify to Git:**
```bash
git add .
git commit -m "Update feature"
git push
```
Netlify automatically rebuilds and deploys!

**If you deployed manually:**
```bash
npm run build
netlify deploy --prod --dir=dist
```
Or drag-and-drop the `dist` folder to Netlify UI.

---

## 🔐 Security Reminder

✅ API keys stored in Netlify environment variables (never in code)
✅ `.env` is in `.gitignore` - never gets committed
✅ Google Sheets uses read-only Viewer permission
✅ Each environment can have different credentials

**Never hardcode API keys in your source code!**

---

## 🛠️ Quick Troubleshooting

**Build fails?**
- Run `npm run check:safe` locally to find errors
- Check Netlify deploy log for details

**API not connecting?**
- Verify environment variables are set in Netlify
- Trigger a new deploy after adding variables
- Check variable names start with `VITE_`

**Data not syncing?**
- Ensure Google Sheet is shared as "Anyone with link = Viewer"
- Verify tab names are exactly "Inventory" and "Users"
- Check browser console for errors

---

## 📊 Netlify Features

- **Continuous Deployment** - Auto-deploy on git push
- **Deploy Previews** - Test branches before merging
- **Rollbacks** - Revert to previous deploy instantly
- **Custom Domains** - Use your own domain with free SSL

---

**You're all set!** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive documentation.

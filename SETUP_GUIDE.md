# 📘 Complete Setup Guide - ABN Stock Tracker

This guide provides comprehensive, step-by-step instructions for setting up Google Sheets integration and deploying your ABN Stock Tracker to **Netlify**.

---

## 🎯 Quick Answer to Your Question

**Should I link Google Sheets first or deploy to Netlify first?**

**Answer: Set up Google Sheets FIRST, then deploy to Netlify.**

**Why?**
- You'll need your Google Sheets API credentials to configure Netlify environment variables
- You can test the integration locally before deploying
- Netlify reads your environment variables during build time
- This ensures your production app works correctly from the first deployment

---

## 📋 Part 1: Configure Google Sheets Integration

Set up your Google Sheets backend before deploying to Netlify.

### Step 1: Create Your Google Spreadsheet

#### Option A: One Spreadsheet with Multiple Tabs (Recommended)

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. Name it **"ABN Stock Tracker"**
4. Rename the first tab to **"Inventory"** (case-sensitive)
5. Click the **"+"** button to add a second tab
6. Name the second tab **"Users"** (case-sensitive)

#### Option B: Separate Spreadsheets

1. Create one spreadsheet named **"Inventory"**
2. Create another spreadsheet named **"Users"**
3. You'll need to copy the Sheet ID from each

### Step 2: Set Up Sheet Headers

#### For the "Inventory" Tab:

Click into cell A1 and paste these headers (tab-separated):
```
ID	Rack	Shelf	Item Name	Quantity	Created At	Updated At	Created By	Last Modified By
```

Your sheet should look like this:

| ID | Rack | Shelf | Item Name | Quantity | Created At | Updated At | Created By | Last Modified By |
|----|------|-------|-----------|----------|------------|------------|------------|------------------|
|    |      |       |           |          |            |            |            |                  |

#### For the "Users" Tab:

Click into cell A1 and paste these headers (tab-separated):
```
ID	Username	Password	Email	Role	Can View	Can Edit	Can Delete	Can Manage Users	Created At	Updated At
```

Your sheet should look like this:

| ID | Username | Password | Email | Role | Can View | Can Edit | Can Delete | Can Manage Users | Created At | Updated At |
|----|----------|----------|-------|------|----------|----------|------------|------------------|------------|------------|
|    |          |          |       |      |          |          |            |                  |            |            |

### Step 3: Add Sample Data to Users Tab

Add a test user so you can log in:

| ID | Username | Password | Email | Role | Can View | Can Edit | Can Delete | Can Manage Users | Created At | Updated At |
|----|----------|----------|-------|------|----------|----------|------------|------------------|------------|------------|
| 1  | admin    | admin123 | admin@example.com | Admin | TRUE | TRUE | TRUE | TRUE | 2024-01-01T00:00:00Z | 2024-01-01T00:00:00Z |

### Step 4: Get Your Sheet ID

1. Look at the URL of your Google Sheet
2. The Sheet ID is the long string between `/d/` and `/edit`

Example URL:
```
https://docs.google.com/spreadsheets/d/1abc123XYZ456def789GHI/edit#gid=0
                                    ^^^^^^^^^^^^^^^^^^
                                    This is your Sheet ID
```

**Copy this ID - you'll need it for Netlify!**

### Step 5: Make Your Sheet Public (Read-Only)

1. Click the **"Share"** button (top-right corner)
2. Click **"Change to anyone with the link"**
3. Set the permission dropdown to **"Viewer"** (not Editor)
4. Click **"Done"**

⚠️ **Security Note:** Anyone with the link can VIEW your sheet. They cannot edit it without your API key.

### Step 6: Get a Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Name your project (e.g., "Inventory System")
4. Click **"Create"**

#### Enable the Google Sheets API:

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it, then click **"Enable"**

#### Create an API Key:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy your API key immediately
4. (Recommended) Click **"Restrict Key"**:
   - Under "API restrictions", select **"Restrict key"**
   - Check only **"Google Sheets API"**
   - Click **"Save"**

⚠️ **Keep this API key secure!** You'll add it to Netlify's environment variables.

### Step 7: Test Locally (Optional but Recommended)

1. In your project root, create a file named `.env`
2. Add the following content:

```env
# Google Sheets API Configuration
VITE_GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE
VITE_GOOGLE_SHEET_ID=YOUR_SHEET_ID_HERE
VITE_GOOGLE_USERS_SHEET_ID=YOUR_SHEET_ID_HERE

# Note: If using one spreadsheet with tabs, use the SAME Sheet ID for both
# If using separate spreadsheets, use different Sheet IDs

# Optional: Sync interval in milliseconds (default: 5000)
VITE_SYNC_INTERVAL=5000
```

3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID(s)
5. Run `npm install` (if not already done)
6. Run `npm run dev`
7. Open the app and test the connection

**✅ If local testing works, you're ready for Netlify deployment!**

---

## 📋 Part 2: Deploy to Netlify

Now that Google Sheets is configured, let's deploy to Netlify.

### Method A: Deploy via Netlify UI (Easiest)

#### Step 1: Prepare Your Code

Your project is already configured for Netlify with:
- `netlify.toml` - Build configuration
- `public/_redirects` - SPA routing support
- `.env.example` - Environment variable template

#### Step 2: Create Netlify Site

1. Go to [Netlify](https://app.netlify.com)
2. Sign up or log in
3. Click **"Add new site"** → **"Import an existing project"**

#### Step 3: Connect Your Repository

**Option 1: Deploy from Git (Recommended)**

1. Choose your Git provider (GitHub, GitLab, Bitbucket)
2. Authorize Netlify to access your repositories
3. Select your inventory management repository
4. Netlify will auto-detect the build settings from `netlify.toml`
5. Click **"Deploy site"**

**Option 2: Manual Deploy (No Git Required)**

1. Click **"Add new site"** → **"Deploy manually"**
2. Drag and drop your project folder (or zip file)
3. Netlify will build and deploy automatically

#### Step 4: Add Environment Variables

**This is the critical step!**

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add each of these:

```
Key: VITE_GOOGLE_SHEETS_API_KEY
Value: [Your Google Sheets API Key]

Key: VITE_GOOGLE_SHEET_ID
Value: [Your Google Sheet ID]

Key: VITE_GOOGLE_USERS_SHEET_ID
Value: [Your Google Sheet ID (same as above if using one spreadsheet)]

Key: VITE_SYNC_INTERVAL
Value: 5000
```

3. Click **"Save"**

#### Step 5: Redeploy with Environment Variables

**Important:** You must redeploy after adding environment variables!

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the build to complete (~2-3 minutes)

#### Step 6: Test Your Live Site

1. Click on your site URL (e.g., `https://your-site-name.netlify.app`)
2. Navigate to the Setup page (via Settings → Setup)
3. Click **"Test Connection"**
4. You should see: ✅ **"Successfully connected to Google Sheets!"**

**✅ Your app is now live on Netlify!**

---

### Method B: Deploy via Netlify CLI

If you prefer the command line:

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

#### Step 3: Initialize Your Site

```bash
netlify init
```

Follow the prompts:
- Create a new site
- Choose your team
- Site name (or leave blank for random name)

#### Step 4: Set Environment Variables

```bash
netlify env:set VITE_GOOGLE_SHEETS_API_KEY "your_api_key_here"
netlify env:set VITE_GOOGLE_SHEET_ID "your_sheet_id_here"
netlify env:set VITE_GOOGLE_USERS_SHEET_ID "your_sheet_id_here"
netlify env:set VITE_SYNC_INTERVAL "5000"
```

#### Step 5: Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or deploy to a draft URL first
netlify deploy
```

**✅ Your site is deployed!**

---

## 🔄 Part 3: How Syncing Works

### Inventory Syncing

**Adding Items:**
- Add items through the app UI, OR
- Manually add a row in the "Inventory" tab
- Changes sync to all users within 5 seconds

**Editing Items:**
- Edit items through the app UI, OR
- Manually edit cells in the "Inventory" tab
- Changes sync to all users within 5 seconds

**Deleting Items:**
- Delete items through the app UI, OR
- Manually delete rows in the "Inventory" tab
- Changes sync to all users within 5 seconds

### User Account Syncing

**Adding New Users:**
1. Open the "Users" tab in Google Sheets
2. Add a new row with all required fields:
   - ID: Unique number (e.g., 2, 3, 4...)
   - Username: Login username
   - Password: Login password (plain text - consider hashing in production)
   - Email: User's email
   - Role: "Admin", "Manager", or "User"
   - Can View: TRUE or FALSE
   - Can Edit: TRUE or FALSE
   - Can Delete: TRUE or FALSE
   - Can Manage Users: TRUE or FALSE
   - Created At: Current timestamp (e.g., 2024-01-15T10:30:00Z)
   - Updated At: Current timestamp

3. Save the sheet
4. All connected users will see the new user within 5 seconds

**Editing Users:**
1. Open the "Users" tab
2. Find the user's row
3. Edit any fields (username, email, permissions, etc.)
4. Update the "Updated At" timestamp
5. Changes sync to all users within 5 seconds

**Deleting Users:**
1. Open the "Users" tab
2. Find the user's row
3. Right-click the row number → "Delete row"
4. User is removed from all connected apps within 5 seconds

### Sync Status Indicators

The Users page shows:
- 🔄 **Spinning cloud icon** = Currently syncing
- ☁️ **Cloud icon** = Successfully synced
- ❌ **Cloud-off icon** = Sync error
- ⏰ **Timestamp** = Last successful sync time
- 🔄 **Refresh button** = Manual sync trigger

---

## 🔐 Security Best Practices

### DO:
✅ Store API keys in Netlify environment variables (never in code)
✅ Keep your `.env` file local (never commit it to Git)
✅ Use `.env.example` to document required variables (without actual values)
✅ Restrict your API key to only the Google Sheets API
✅ Set Google Sheets permissions to "Viewer" (read-only)
✅ Regenerate API keys if they're ever exposed
✅ Use different API keys for development and production

### DON'T:
❌ Commit your `.env` file to Git
❌ Share your API key publicly
❌ Hardcode API keys in your source code
❌ Store passwords in plain text (implement hashing in production)
❌ Grant "Editor" permissions to Google Sheets unless necessary
❌ Use the same API key across multiple projects

---

## 🚀 Updating Your Deployed Site

### Automatic Deployments (Git-Connected Sites)

If you connected Netlify to Git:
1. Make changes to your code locally
2. Commit and push to your repository:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
3. Netlify automatically rebuilds and deploys!

### Manual Deployments

If you deployed manually:
1. Build your project locally:
   ```bash
   npm run build
   ```
2. Deploy via CLI:
   ```bash
   netlify deploy --prod --dir=dist
   ```
3. Or drag-and-drop the `dist` folder to Netlify UI

---

## 🛠️ Troubleshooting

### "API key not valid" error
- Verify your API key is correct in Netlify environment variables
- Check that Google Sheets API is enabled in Google Cloud Console
- Ensure API key restrictions allow Google Sheets API
- After updating environment variables, trigger a new deploy

### "Sheet not found" error
- Verify your Sheet ID is correct in Netlify environment variables
- Check that the sheet is publicly shared (anyone with link = viewer)
- Ensure tab names are exactly "Inventory" and "Users" (case-sensitive)

### "403 Forbidden" error
- Your sheet may not be publicly accessible
- Go to Share → Change to "Anyone with the link" → Viewer

### Data not syncing on deployed site
- Check that all environment variables are set in Netlify
- Verify variable names start with `VITE_` (required for Vite)
- Trigger a new deploy after adding/updating environment variables
- Check browser console on the live site for error messages

### Build fails on Netlify
- Check the deploy log in Netlify dashboard
- Ensure `npm run build` works locally first
- Verify all dependencies are in `package.json`
- Check that TypeScript has no errors: `npm run check:safe`

### Environment variables not working
- Ensure variable names start with `VITE_` (required for Vite to expose them)
- Redeploy after adding/changing environment variables
- Variables are only available at build time, not runtime

---

## 📞 Support

If you encounter issues not covered here:

1. Check the **Setup page** in the app (accessible via Settings)
2. Review the **Configuration Status** section
3. Use the **Test Connection** button to verify your setup
4. Check Netlify deploy logs for build errors
5. Check browser console for runtime errors

---

## 📝 Summary Checklist

**Google Sheets Setup:**
- [ ] Spreadsheet created with "Inventory" and "Users" tabs
- [ ] Headers added to both tabs
- [ ] Sample user added to Users tab
- [ ] Sheet ID copied
- [ ] Sheet made publicly readable (Viewer permission)
- [ ] Google Sheets API enabled in Cloud Console
- [ ] API key created and copied
- [ ] (Optional) Tested locally with `.env` file

**Netlify Deployment:**
- [ ] Netlify account created
- [ ] Site created (via Git or manual deploy)
- [ ] Environment variables added in Netlify dashboard:
  - [ ] VITE_GOOGLE_SHEETS_API_KEY
  - [ ] VITE_GOOGLE_SHEET_ID
  - [ ] VITE_GOOGLE_USERS_SHEET_ID
  - [ ] VITE_SYNC_INTERVAL
- [ ] Site redeployed after adding environment variables
- [ ] Connection tested on live site

**You're ready to go!** 🎉

---

## 🌐 Custom Domain (Optional)

Want to use your own domain (e.g., `inventory.yourdomain.com`)?

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow Netlify's DNS configuration instructions
5. SSL certificate is automatically provided by Netlify!

---

## 📊 Netlify Features You Can Use

- **Continuous Deployment** - Auto-deploy when you push to Git
- **Deploy Previews** - Test changes before going live
- **Rollbacks** - Instantly revert to a previous deploy
- **Analytics** - Track site traffic (paid feature)
- **Forms** - Add contact forms without backend code
- **Functions** - Add serverless functions if needed

Enjoy your deployed inventory management system! 🚀

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink, Copy, Settings } from 'lucide-react';
import { getConfigStatus, initializeSheet } from '@/lib/google-sheets';
import { useState } from 'react';

interface SetupPageProps {
  onBack: () => void;
}

export function SetupPage({ onBack }: SetupPageProps) {
  const configStatus = getConfigStatus();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await initializeSheet();

    if (result.success) {
      setTestResult({ success: true, message: 'Successfully connected to Google Sheets!' });
    } else {
      setTestResult({ success: false, message: result.error || 'Connection failed' });
    }

    setTesting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold" style={{ color: '#003366' }}>
          Google Sheets Integration Setup
        </h1>
        <p className="text-gray-600 mt-2">
          Connect your ABN Stock Tracker to Google Sheets for real-time syncing across all users
        </p>
      </div>

      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Key</span>
              {configStatus.hasApiKey ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Configured</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Not Set</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sheet ID</span>
              {configStatus.hasSheetId ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Configured</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Not Set</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Status</span>
              {configStatus.isConfigured ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Ready</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Setup Required</span>
                </div>
              )}
            </div>
          </div>

          {configStatus.isConfigured && (
            <div className="mt-4">
              <Button onClick={handleTestConnection} disabled={testing} className="w-full">
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          )}

          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'} className="mt-4">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to enable Google Sheets integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#003366' }}>
              Step 1: Create Your Google Sheets
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              You can use either ONE spreadsheet with multiple tabs OR separate spreadsheets for inventory and users.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <p className="text-sm font-semibold text-blue-900 mb-2">Option A: One Spreadsheet (Recommended)</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                <li>
                  Go to{' '}
                  <a
                    href="https://sheets.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Google Sheets
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>Create a new spreadsheet and name it "ABN Stock Tracker"</li>
                <li>Rename the first tab to "Inventory" (case-sensitive)</li>
                <li>
                  In the "Inventory" tab, add these headers in row 1:
                  <div className="bg-gray-100 p-2 rounded mt-2 font-mono text-xs flex items-center justify-between">
                    <span>ID, Rack, Shelf, Item Name, Quantity, Created At, Updated At, Created By, Last Modified By</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          'ID\tRack\tShelf\tItem Name\tQuantity\tCreated At\tUpdated At\tCreated By\tLast Modified By'
                        )
                      }
                      className="h-6"
                      title="Copy headers (paste into Google Sheets)"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
                <li>Create a second tab named "Users" (case-sensitive)</li>
                <li>
                  In the "Users" tab, add these headers in row 1:
                  <div className="bg-gray-100 p-2 rounded mt-2 font-mono text-xs flex items-center justify-between">
                    <span>ID, Username, Password, Email, Role, Can View, Can Edit, Can Delete, Can Manage Users, Created At, Updated At</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          'ID\tUsername\tPassword\tEmail\tRole\tCan View\tCan Edit\tCan Delete\tCan Manage Users\tCreated At\tUpdated At'
                        )
                      }
                      className="h-6"
                      title="Copy headers (paste into Google Sheets)"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
                <li>Copy the Sheet ID from the URL (the long string between /d/ and /edit)</li>
                <li className="font-semibold">Use the SAME Sheet ID for both VITE_GOOGLE_SHEET_ID and VITE_GOOGLE_USERS_SHEET_ID</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Option B: Separate Spreadsheets</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                <li>Create two separate spreadsheets (one for "Inventory", one for "Users")</li>
                <li>Set up headers as described in Option A</li>
                <li>Copy the Sheet ID from each spreadsheet's URL</li>
                <li>Use different Sheet IDs for VITE_GOOGLE_SHEET_ID and VITE_GOOGLE_USERS_SHEET_ID</li>
              </ol>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#003366' }}>
              Step 2: Get a Google Sheets API Key
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
              <li>
                Go to{' '}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Google Cloud Console
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Create a new project or select an existing one</li>
              <li>
                Enable the Google Sheets API:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Go to "APIs & Services" → "Library"</li>
                  <li>• Search for "Google Sheets API"</li>
                  <li>• Click "Enable"</li>
                </ul>
              </li>
              <li>
                Create an API Key:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Go to "APIs & Services" → "Credentials"</li>
                  <li>• Click "Create Credentials" → "API Key"</li>
                  <li>• Copy your API key</li>
                  <li>
                    • (Optional but recommended) Restrict the API key to only the Google Sheets API
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Step 3 */}
          <div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#003366' }}>
              Step 3: Make Your Sheet Publicly Readable
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
              <li>Open your Google Sheet</li>
              <li>Click the "Share" button</li>
              <li>Click "Change to anyone with the link"</li>
              <li>Set permissions to "Viewer" (read-only is sufficient)</li>
              <li>Click "Done"</li>
            </ol>
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Note:</strong> With API Key authentication, the app can only READ from Google
                Sheets. To enable WRITE access, you would need OAuth2 authentication (more complex
                setup). For now, you can manually edit the sheet and changes will sync to all users.
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 4 */}
          <div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#003366' }}>
              Step 4: Configure Environment Variables
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">For Netlify Deployment (Production):</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                  <li>Go to your Netlify dashboard</li>
                  <li>Navigate to Site settings → Environment variables</li>
                  <li>Click "Add a variable" and add each of these:
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs space-y-1 mt-2">
                      <div>VITE_GOOGLE_SHEETS_API_KEY = [Your API Key]</div>
                      <div>VITE_GOOGLE_SHEET_ID = [Your Sheet ID]</div>
                      <div>VITE_GOOGLE_USERS_SHEET_ID = [Your Sheet ID]</div>
                      <div>VITE_SYNC_INTERVAL = 5000</div>
                    </div>
                  </li>
                  <li>Click "Save"</li>
                  <li>Trigger a new deploy for changes to take effect</li>
                </ol>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">For Local Development (Optional):</p>
                <p className="text-sm text-gray-700 mb-2">
                  Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in the project
                  root with:
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs space-y-1">
                  <div>VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here</div>
                  <div>VITE_GOOGLE_SHEET_ID=your_sheet_id_here</div>
                  <div>VITE_GOOGLE_USERS_SHEET_ID=your_users_sheet_id_here</div>
                  <div className="text-gray-500"># Note: Use the SAME ID for both if using one spreadsheet with tabs</div>
                  <div className="text-gray-500"># Optional: Sync interval in milliseconds (default: 5000)</div>
                  <div>VITE_SYNC_INTERVAL=5000</div>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  After creating the .env file, restart your development server for the changes to take
                  effect.
                </p>
              </div>
            </div>

            <Alert className="mt-3 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-xs text-red-800">
                <strong>IMPORTANT:</strong> Never commit your .env file to Git! It contains sensitive
                API keys. The .gitignore file should already exclude it. For Netlify, always use environment variables in the dashboard.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How Syncing Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-2">📊 Inventory Syncing:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The app polls Google Sheets every 5 seconds to fetch the latest inventory data</li>
              <li>All connected users see real-time updates automatically</li>
              <li>Manual edits in Google Sheets sync to all users within 5 seconds</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">👥 User Account Syncing:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>User accounts are also synced every 5 seconds from the "Users" tab</li>
              <li>To <strong>add a new user</strong>: Manually add a row in the Google Sheets "Users" tab with all required fields</li>
              <li>To <strong>edit a user</strong>: Manually update the user's row in Google Sheets (e.g., change permissions, email)</li>
              <li>To <strong>delete a user</strong>: Manually delete the user's row in Google Sheets</li>
              <li>All changes sync automatically to all users within 5 seconds</li>
              <li>Users page shows sync status with timestamps and refresh options</li>
            </ul>
          </div>

          <Alert className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Read-Only Mode:</strong> The current setup uses API Key authentication which only
              allows reading from sheets. This is simpler to set up and sufficient for viewing live data.
              To update data, manually edit the Google Sheet.
            </AlertDescription>
          </Alert>

          <div>
            <p className="font-semibold mb-2">🔄 Offline Support:</p>
            <p>The app caches the last synced data, so it continues to work even if the connection to Google Sheets is temporarily unavailable.</p>
          </div>
        </CardContent>
      </Card>

      {/* Netlify Deployment Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Deploying to Netlify</CardTitle>
          <CardDescription>Best practices for deploying your ABN Stock Tracker</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Recommended Strategy:</strong> Set up Google Sheets FIRST, then deploy to Netlify with environment variables configured.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-2">Why Set Up Google Sheets First?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-2">
              <li>You need API credentials to configure Netlify environment variables</li>
              <li>Test the integration locally before deploying to production</li>
              <li>Netlify reads environment variables during build time</li>
              <li>Ensures your production app works correctly from first deployment</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Deploy to Netlify (Method 1 - From Git):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>
                Go to{' '}
                <a
                  href="https://app.netlify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Netlify
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>{' '}
                and sign up/login
              </li>
              <li>Click "Add new site" → "Import an existing project"</li>
              <li>Connect to GitHub, GitLab, or Bitbucket</li>
              <li>Select your repository</li>
              <li>Netlify auto-detects build settings from netlify.toml</li>
              <li>Click "Deploy site"</li>
              <li>Go to Site settings → Environment variables</li>
              <li>Add all four environment variables (see Step 4 above)</li>
              <li>Trigger a new deploy for changes to take effect</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Deploy to Netlify (Method 2 - Manual):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Click "Add new site" → "Deploy manually"</li>
              <li>Drag and drop your project folder</li>
              <li>Netlify builds and deploys automatically</li>
              <li>Add environment variables in Site settings</li>
              <li>Redeploy to apply environment variables</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Continuous Deployment:</h4>
            <p className="text-sm text-gray-700 mb-2">
              If you deployed from Git, Netlify automatically rebuilds and deploys when you push changes:
            </p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
              <div>git add .</div>
              <div>git commit -m "Update feature"</div>
              <div>git push</div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Netlify will detect the push and automatically deploy the new version!
            </p>
          </div>

          <Alert className="mt-3 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs text-yellow-800">
              <strong>Security Tip:</strong> Never hardcode API keys in your source code. Always use environment variables in Netlify dashboard. If you accidentally commit credentials, regenerate your API keys immediately.
            </AlertDescription>
          </Alert>

          <Alert className="mt-3 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-xs text-green-800">
              <strong>Netlify Features:</strong> Free SSL, continuous deployment, deploy previews, instant rollbacks, and custom domains. Your app will be deployed at https://your-site-name.netlify.app
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

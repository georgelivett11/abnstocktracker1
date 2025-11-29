import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSheetsSync } from '@/hooks/use-sheets-sync';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ShelvesPage } from './pages/ShelvesPage';
import { ShelfDetailPage } from './pages/ShelfDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AuditPage } from './pages/AuditPage';
import { UsersPage } from './pages/UsersPage';
import { ImportPage } from './pages/ImportPage';
import { ExportPage } from './pages/ExportPage';
import { SetupPage } from './pages/SetupPage';
import { Button } from './ui/button';
import { LogOut, Home, RefreshCw, AlertCircle, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import abnLogo from '@/assets/abn_logo.png';

type Page =
  | 'login'
  | 'dashboard'
  | 'shelves'
  | 'shelf-detail'
  | 'search'
  | 'audit'
  | 'users'
  | 'import'
  | 'export'
  | 'setup';

interface ShelfLocation {
  rack: string;
  shelf: string;
}

export function InventoryApp() {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(isAuthenticated ? 'dashboard' : 'login');
  const [selectedShelf, setSelectedShelf] = useState<ShelfLocation | null>(null);
  const { status, error, lastSync, isConfigured, manualSync } = useSheetsSync(true);

  const navigateTo = (page: Page, shelfLocation?: ShelfLocation) => {
    if (shelfLocation) {
      setSelectedShelf(shelfLocation);
    }
    setCurrentPage(page);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated || currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#003366' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateTo('dashboard')}
              className="flex items-center space-x-3 text-white hover:opacity-80 transition-opacity"
            >
              <img src={abnLogo} alt="ABN Logo" className="h-8 w-8 rounded" />
              <span className="font-semibold text-lg">ABN Stock Tracker</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-2 text-white text-xs">
              {isConfigured ? (
                <>
                  {status === 'syncing' && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {status === 'success' && <Cloud className="h-4 w-4" />}
                  {status === 'error' && <CloudOff className="h-4 w-4 text-red-300" />}
                  <span>
                    {status === 'syncing' && 'Syncing...'}
                    {status === 'success' && lastSync && `Synced ${new Date(lastSync).toLocaleTimeString()}`}
                    {status === 'error' && 'Sync error'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={manualSync}
                    disabled={status === 'syncing'}
                    className="h-6 px-2 text-white hover:bg-white/10"
                    title="Manual sync"
                  >
                    <RefreshCw className={`h-3 w-3 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo('setup')}
                  className="h-6 px-2 text-yellow-300 hover:bg-white/10"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Setup Google Sheets
                </Button>
              )}
            </div>
            <span className="text-white text-sm">
              {user?.username} ({user?.role})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-white border-white hover:bg-white hover:text-[#003366]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Sync Error Alert */}
        {error && currentPage !== 'setup' && (
          <div className="container mx-auto px-4 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sync Error: {error}{' '}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigateTo('setup')}
                  className="p-0 h-auto underline"
                >
                  Check Settings
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigateTo} />}
        {currentPage === 'shelves' && <ShelvesPage onNavigate={navigateTo} />}
        {currentPage === 'shelf-detail' && selectedShelf && (
          <ShelfDetailPage
            rack={selectedShelf.rack}
            shelf={selectedShelf.shelf}
            onBack={() => navigateTo('shelves')}
          />
        )}
        {currentPage === 'search' && <SearchPage />}
        {currentPage === 'audit' && <AuditPage />}
        {currentPage === 'users' && <UsersPage />}
        {currentPage === 'import' && <ImportPage />}
        {currentPage === 'export' && <ExportPage />}
        {currentPage === 'setup' && (
          <div className="container mx-auto px-4 py-8">
            <SetupPage onBack={() => navigateTo('dashboard')} />
          </div>
        )}
      </main>
    </div>
  );
}

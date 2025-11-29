import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, FileText, Search, Upload, Download } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: 'shelves' | 'search' | 'audit' | 'users' | 'import' | 'export', location?: { rack: string; shelf: string }) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();

  const features: Array<{
    title: string;
    description: string;
    icon: typeof Package;
    page: 'shelves' | 'search' | 'audit' | 'users' | 'import' | 'export';
    color: string;
  }> = [
    {
      title: 'Shelf Management',
      description: 'View and manage inventory across all shelves',
      icon: Package,
      page: 'shelves',
      color: '#007acc',
    },
    {
      title: 'Search Inventory',
      description: 'Search for items across all locations',
      icon: Search,
      page: 'search',
      color: '#00a870',
    },
    {
      title: 'Audit Logs',
      description: 'View activity history and logs',
      icon: FileText,
      page: 'audit',
      color: '#e67e22',
    },
    {
      title: 'Import Stock',
      description: 'Upload inventory from JSON file',
      icon: Upload,
      page: 'import',
      color: '#9b59b6',
    },
    {
      title: 'Export Stock',
      description: 'Download inventory as JSON',
      icon: Download,
      page: 'export',
      color: '#16a085',
    },
  ];

  if (user?.permissions.canManageUsers) {
    features.push({
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      page: 'users',
      color: '#c0392b',
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#003366' }}>
          Welcome, {user?.username}
        </h1>
        <p className="text-gray-600">
          ABN Stock Tracker - Role: <span className="font-semibold">{user?.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <button
            key={feature.page}
            onClick={() => onNavigate(feature.page)}
            className="text-left"
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: feature.color }}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Rack Locations</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Racks A-G (4 shelves each)</li>
                <li>• LB-1, LB-2, LB-3 (special shelves)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Your Permissions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View Inventory: {user?.permissions.canView ? '✓' : '✗'}</li>
                <li>• Edit Items: {user?.permissions.canEdit ? '✓' : '✗'}</li>
                <li>• Delete Items: {user?.permissions.canDelete ? '✓' : '✗'}</li>
                <li>• Manage Users: {user?.permissions.canManageUsers ? '✓' : '✗'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

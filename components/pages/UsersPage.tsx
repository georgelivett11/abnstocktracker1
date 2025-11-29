import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userStore, createAuditLog } from '@/lib/store';
import { useUserSync } from '@/hooks/use-user-sync';
import { type User, type UserRole, type UserPermissions } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Trash2, Edit, RefreshCw, Cloud, CloudOff } from 'lucide-react';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { status, error: syncError, lastSync, isConfigured, manualSync } = useUserSync(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'viewer' as UserRole,
  });
  const [permissions, setPermissions] = useState<UserPermissions>({
    canView: true,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
  });
  const [message, setMessage] = useState('');

  const loadUsers = () => {
    const allUsers = userStore.getAll();
    setUsers(allUsers);
  };

  useEffect(() => {
    if (!currentUser?.permissions.canManageUsers) {
      setMessage('You do not have permission to manage users');
    }
    loadUsers();
  }, []);

  // Reload users when sync status changes to success
  useEffect(() => {
    if (status === 'success') {
      loadUsers();
    }
  }, [status]);

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      role: 'viewer',
    });
    setPermissions({
      canView: true,
      canEdit: false,
      canDelete: false,
      canManageUsers: false,
    });
    setShowAddForm(false);
    setEditingUser(null);
  };

  const handleSubmit = () => {
    if (!formData.username || !formData.email) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (!editingUser && !formData.password) {
      setMessage('Password is required for new users');
      return;
    }

    if (!currentUser?.permissions.canManageUsers) {
      setMessage('You do not have permission to manage users');
      return;
    }

    if (editingUser) {
      const updates: Partial<User> = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        permissions,
      };
      if (formData.password) {
        updates.password = formData.password;
      }
      userStore.update(editingUser.id, updates);
      createAuditLog(currentUser, 'user_edit', `Updated user ${formData.username}`);
      setMessage('User updated successfully');
    } else {
      const newUser = userStore.create({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        permissions,
      });
      createAuditLog(currentUser, 'user_create', `Created user ${formData.username}`);
      setMessage('User created successfully');
    }

    resetForm();
    loadUsers();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      role: user.role,
    });
    setPermissions(user.permissions);
    setShowAddForm(true);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      setMessage('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    if (!currentUser?.permissions.canManageUsers) {
      setMessage('You do not have permission to manage users');
      return;
    }

    userStore.delete(user.id);
    createAuditLog(currentUser, 'user_delete', `Deleted user ${user.username}`);
    setMessage('User deleted successfully');
    loadUsers();
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({ ...formData, role });
    switch (role) {
      case 'master':
        setPermissions({
          canView: true,
          canEdit: true,
          canDelete: true,
          canManageUsers: true,
        });
        break;
      case 'admin':
        setPermissions({
          canView: true,
          canEdit: true,
          canDelete: true,
          canManageUsers: false,
        });
        break;
      case 'editor':
        setPermissions({
          canView: true,
          canEdit: true,
          canDelete: false,
          canManageUsers: false,
        });
        break;
      case 'viewer':
        setPermissions({
          canView: true,
          canEdit: false,
          canDelete: false,
          canManageUsers: false,
        });
        break;
    }
  };

  if (!currentUser?.permissions.canManageUsers) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>You do not have permission to manage users</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold" style={{ color: '#003366' }}>
            User Management
          </h1>
          {isConfigured && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {status === 'syncing' && <RefreshCw className="h-4 w-4 animate-spin" />}
              {status === 'success' && <Cloud className="h-4 w-4" />}
              {status === 'error' && <CloudOff className="h-4 w-4 text-red-500" />}
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
                className="h-6 px-2"
                title="Manual sync"
              >
                <RefreshCw className={`h-3 w-3 ${status === 'syncing' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} style={{ backgroundColor: '#007acc' }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {syncError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Sync Error: {syncError}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit User' : 'Add New User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password {!editingUser && '*'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canView"
                      checked={permissions.canView}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, canView: checked as boolean })
                      }
                    />
                    <label htmlFor="canView" className="text-sm cursor-pointer">
                      Can View Inventory
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canEdit"
                      checked={permissions.canEdit}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, canEdit: checked as boolean })
                      }
                    />
                    <label htmlFor="canEdit" className="text-sm cursor-pointer">
                      Can Edit Items
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canDelete"
                      checked={permissions.canDelete}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, canDelete: checked as boolean })
                      }
                    />
                    <label htmlFor="canDelete" className="text-sm cursor-pointer">
                      Can Delete Items
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageUsers"
                      checked={permissions.canManageUsers}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, canManageUsers: checked as boolean })
                      }
                    />
                    <label htmlFor="canManageUsers" className="text-sm cursor-pointer">
                      Can Manage Users
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} style={{ backgroundColor: '#007acc' }}>
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <Users className="h-5 w-5 inline mr-2" />
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{user.username}</p>
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: '#007acc' }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Permissions: View:{permissions.canView ? '✓' : '✗'} | Edit:{user.permissions.canEdit ? '✓' : '✗'} |
                    Delete:{user.permissions.canDelete ? '✓' : '✗'} | Manage Users:
                    {user.permissions.canManageUsers ? '✓' : '✗'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.id !== currentUser?.id && user.role !== 'master' && (
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

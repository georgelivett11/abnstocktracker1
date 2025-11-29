import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { inventoryStore, createAuditLog } from '@/lib/store';
import { type InventoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShelfDetailPageProps {
  rack: string;
  shelf: string;
  onBack: () => void;
}

export function ShelfDetailPage({ rack, shelf, onBack }: ShelfDetailPageProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const loadItems = () => {
    const shelfItems = inventoryStore.getByShelf(rack, shelf);
    setItems(shelfItems);
  };

  useEffect(() => {
    loadItems();
  }, [rack, shelf]);

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemQty.trim()) {
      setMessage('Please enter both item name and quantity');
      return;
    }

    const qty = parseInt(newItemQty, 10);
    if (isNaN(qty) || qty < 0) {
      setMessage('Please enter a valid quantity');
      return;
    }

    if (!user?.permissions.canEdit) {
      setMessage('You do not have permission to add items');
      return;
    }

    const newItem = inventoryStore.create({
      rack: rack as InventoryItem['rack'],
      shelf: shelf as InventoryItem['shelf'],
      itemName: newItemName.trim(),
      quantity: qty,
      createdBy: user.id,
      lastModifiedBy: user.id,
    });

    createAuditLog(user, 'add', `Added item "${newItemName.trim()}" to ${rack}-${shelf}`, {
      shelfLocation: `${rack}-${shelf}`,
      itemName: newItemName.trim(),
      newValue: qty.toString(),
    });

    setNewItemName('');
    setNewItemQty('');
    setMessage('Item added successfully');
    loadItems();
  };

  const handleUpdateItem = (item: InventoryItem) => {
    const newQty = editQty[item.id];
    if (!newQty) return;

    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 0) {
      setMessage('Please enter a valid quantity');
      return;
    }

    if (!user?.permissions.canEdit) {
      setMessage('You do not have permission to edit items');
      return;
    }

    inventoryStore.update(item.id, {
      quantity: qty,
      lastModifiedBy: user.id,
    });

    createAuditLog(user, 'edit', `Updated quantity for "${item.itemName}" on ${rack}-${shelf}`, {
      shelfLocation: `${rack}-${shelf}`,
      itemName: item.itemName,
      previousValue: item.quantity.toString(),
      newValue: qty.toString(),
    });

    setEditingItem(null);
    setMessage('Item updated successfully');
    loadItems();
  };

  const handleDeleteItem = (item: InventoryItem) => {
    if (!user?.permissions.canDelete) {
      setMessage('You do not have permission to delete items');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      return;
    }

    inventoryStore.delete(item.id);

    createAuditLog(user, 'delete', `Deleted item "${item.itemName}" from ${rack}-${shelf}`, {
      shelfLocation: `${rack}-${shelf}`,
      itemName: item.itemName,
      previousValue: item.quantity.toString(),
    });

    setMessage('Item deleted successfully');
    loadItems();
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditQty({ ...editQty, [item.id]: item.quantity.toString() });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="outline" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shelves
      </Button>

      <h1 className="text-3xl font-bold mb-6" style={{ color: '#003366' }}>
        {rack === 'LB' ? `LB-${shelf}` : `Rack ${rack} - Shelf ${shelf}`}
      </h1>

      {message && (
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {user?.permissions.canEdit && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="itemQty">Quantity</Label>
                <Input
                  id="itemQty"
                  type="number"
                  min="0"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full" style={{ backgroundColor: '#007acc' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Items on this Shelf ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items on this shelf</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {editingItem === item.id ? (
                      <>
                        <Input
                          type="number"
                          min="0"
                          className="w-24"
                          value={editQty[item.id] || ''}
                          onChange={(e) => setEditQty({ ...editQty, [item.id]: e.target.value })}
                        />
                        <Button size="sm" onClick={() => handleUpdateItem(item)} style={{ backgroundColor: '#007acc' }}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-lg w-16 text-right">Qty: {item.quantity}</span>
                        {user?.permissions.canEdit && (
                          <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                            Edit
                          </Button>
                        )}
                        {user?.permissions.canDelete && (
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

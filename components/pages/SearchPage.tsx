import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { inventoryStore, createAuditLog } from '@/lib/store';
import { type InventoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchResults = inventoryStore.search(query.trim());
    setResults(searchResults);
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

    createAuditLog(user, 'edit', `Updated quantity for "${item.itemName}" on ${item.rack}-${item.shelf}`, {
      shelfLocation: `${item.rack}-${item.shelf}`,
      itemName: item.itemName,
      previousValue: item.quantity.toString(),
      newValue: qty.toString(),
    });

    setEditingItem(null);
    setMessage('Item updated successfully');
    handleSearch();
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditQty({ ...editQty, [item.id]: item.quantity.toString() });
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#003366' }}>
        Search Inventory
      </h1>

      {message && (
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search for Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Item Name</Label>
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter item name to search"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} style={{ backgroundColor: '#007acc' }}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 && query ? (
            <p className="text-gray-500 text-center py-8">No items found matching "{query}"</p>
          ) : results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Enter a search term to find items</p>
          ) : (
            <div className="space-y-3">
              {results.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-lg">{highlightMatch(item.itemName)}</p>
                      <p className="text-sm text-gray-600">
                        Location: <span className="font-semibold">{item.rack === 'LB' ? `LB-${item.shelf}` : `Rack ${item.rack}, Shelf ${item.shelf}`}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
                          <span className="font-semibold text-lg">Qty: {item.quantity}</span>
                          {user?.permissions.canEdit && (
                            <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                              Edit Qty
                            </Button>
                          )}
                        </>
                      )}
                    </div>
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

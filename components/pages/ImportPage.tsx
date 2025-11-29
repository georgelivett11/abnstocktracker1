import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { inventoryStore, createAuditLog } from '@/lib/store';
import { type ImportRecord, type Rack, type Shelf } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload } from 'lucide-react';

export function ImportPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateRack = (rack: string): rack is Rack => {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'LB'].includes(rack);
  };

  const validateShelf = (shelf: string, rack: string): shelf is Shelf => {
    if (rack === 'LB') {
      return ['1', '2', '3'].includes(shelf);
    }
    return ['1', '2', '3', '4'].includes(shelf);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.permissions.canEdit) {
      setMessage('You do not have permission to import items');
      setIsSuccess(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ImportRecord[];

        if (!Array.isArray(data)) {
          setMessage('Invalid file format: Expected an array of items');
          setIsSuccess(false);
          return;
        }

        const errors: string[] = [];
        const validItems: ImportRecord[] = [];

        data.forEach((item, index) => {
          if (!item.rack || !item.shelf || !item.item || item.qty === undefined) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }

          if (!validateRack(item.rack)) {
            errors.push(`Row ${index + 1}: Invalid rack "${item.rack}". Must be A-G or LB`);
            return;
          }

          if (!validateShelf(item.shelf, item.rack)) {
            errors.push(
              `Row ${index + 1}: Invalid shelf "${item.shelf}" for rack "${item.rack}". Must be ${
                item.rack === 'LB' ? '1-3' : '1-4'
              }`
            );
            return;
          }

          const qty = parseInt(item.qty, 10);
          if (isNaN(qty) || qty < 0) {
            errors.push(`Row ${index + 1}: Invalid quantity "${item.qty}"`);
            return;
          }

          validItems.push(item);
        });

        if (errors.length > 0) {
          setMessage(`Import failed with errors:\n${errors.join('\n')}`);
          setIsSuccess(false);
          return;
        }

        const itemsToCreate = validItems.map((item) => ({
          rack: item.rack as Rack,
          shelf: item.shelf as Shelf,
          itemName: item.item,
          quantity: parseInt(item.qty, 10),
          createdBy: user.id,
          lastModifiedBy: user.id,
        }));

        inventoryStore.bulkCreate(itemsToCreate);

        createAuditLog(user, 'import', `Imported ${validItems.length} items from JSON file`);

        setMessage(`Successfully imported ${validItems.length} items!`);
        setIsSuccess(true);
      } catch (error) {
        setMessage(`Error parsing JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsSuccess(false);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#003366' }}>
        Import Stock
      </h1>

      {message && (
        <Alert className="mb-4" variant={isSuccess ? 'default' : 'destructive'}>
          <AlertDescription className="whitespace-pre-line">{message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload JSON File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a JSON file containing inventory items to import. The file should be an array of objects with
              the following structure:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(
                [
                  { rack: 'A', shelf: '1', item: 'Widget', qty: '10' },
                  { rack: 'B', shelf: '2', item: 'Gadget', qty: '5' },
                  { rack: 'LB', shelf: '1', item: 'Tool', qty: '3' },
                ],
                null,
                2
              )}
            </pre>
            <div className="flex items-center gap-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div
                  className="flex items-center px-4 py-2 rounded text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#007acc' }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!user?.permissions.canEdit}
                />
              </label>
              {!user?.permissions.canEdit && (
                <span className="text-sm text-red-600">You do not have permission to import items</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>File must be in JSON format</li>
            <li>Each item must have: rack, shelf, item (name), and qty (quantity)</li>
            <li>Valid racks: A, B, C, D, E, F, G, LB</li>
            <li>Valid shelves: 1-4 for racks A-G, 1-3 for LB</li>
            <li>Quantities must be non-negative numbers</li>
            <li>All imports are logged in the audit trail with your username</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

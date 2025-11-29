import { inventoryStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ExportPage() {
  const handleExport = () => {
    const items = inventoryStore.getAll();

    const exportData = items.map((item) => ({
      rack: item.rack,
      shelf: item.shelf,
      item: item.itemName,
      qty: item.quantity.toString(),
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const items = inventoryStore.getAll();
  const itemCount = items.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#003366' }}>
        Export Stock
      </h1>

      <Alert className="mb-6">
        <AlertDescription>
          Export all inventory items to a JSON file. This file can be imported later to restore or transfer inventory
          data.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold" style={{ color: '#003366' }}>
                  {itemCount}
                </p>
              </div>
              <Button onClick={handleExport} style={{ backgroundColor: '#007acc' }}>
                <Download className="h-4 w-4 mr-2" />
                Export to JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            The exported file will contain an array of objects in the following format:
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
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Note:</strong> This format is compatible with the Import Stock feature.
            </p>
            <p>The file will be named with the current date for easy identification.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

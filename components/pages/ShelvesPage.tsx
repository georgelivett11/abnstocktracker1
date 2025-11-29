import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface ShelvesPageProps {
  onNavigate: (page: 'shelf-detail', location: { rack: string; shelf: string }) => void;
}

export function ShelvesPage({ onNavigate }: ShelvesPageProps) {
  const racks = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const shelves = ['1', '2', '3', '4'];
  const lbShelves = ['1', '2', '3'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#003366' }}>
        Shelf Management
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Racks A-G</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {racks.map((rack) => (
              <div key={rack} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" style={{ color: '#007acc' }} />
                  Rack {rack}
                </h3>
                <div className="space-y-2">
                  {shelves.map((shelf) => (
                    <Button
                      key={`${rack}-${shelf}`}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onNavigate('shelf-detail', { rack, shelf })}
                    >
                      Shelf {shelf}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LB Shelves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lbShelves.map((shelf) => (
              <Button
                key={`LB-${shelf}`}
                variant="outline"
                className="h-20"
                onClick={() => onNavigate('shelf-detail', { rack: 'LB', shelf })}
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2" style={{ color: '#007acc' }} />
                  <span className="font-semibold">LB-{shelf}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

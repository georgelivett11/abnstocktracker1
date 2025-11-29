import { useState, useEffect } from 'react';
import { auditLogStore } from '@/lib/store';
import { type AuditLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save } from 'lucide-react';

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});

  const loadLogs = () => {
    const filtered = auditLogStore.getFiltered(startDate, endDate, searchQuery);
    setLogs(filtered);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleFilter = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    const allLogs = auditLogStore.getFiltered();
    setLogs(allLogs);
  };

  const startEditNotes = (log: AuditLog) => {
    setEditingNotes(log.id);
    setNoteText({ ...noteText, [log.id]: log.notes || '' });
  };

  const handleSaveNotes = (logId: string) => {
    auditLogStore.updateNotes(logId, noteText[logId] || '');
    setEditingNotes(null);
    loadLogs();
  };

  const getActionColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'add':
        return '#00a870';
      case 'edit':
        return '#007acc';
      case 'delete':
        return '#c0392b';
      case 'import':
        return '#9b59b6';
      case 'user_create':
        return '#16a085';
      case 'user_edit':
        return '#e67e22';
      case 'user_delete':
        return '#d35400';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#003366' }}>
        Audit Logs
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="searchQuery">Search</Label>
              <Input
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                placeholder="Search logs..."
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} style={{ backgroundColor: '#007acc' }}>
                Apply
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity History ({logs.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No audit logs found</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="h-5 w-5 mt-1" style={{ color: getActionColor(log.action) }} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: getActionColor(log.action) }}
                          >
                            {log.action.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            by <strong>{log.username}</strong>
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-800">{log.description}</p>
                        {log.shelfLocation && (
                          <p className="text-sm text-gray-600 mt-1">Location: {log.shelfLocation}</p>
                        )}
                        {(log.previousValue || log.newValue) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {log.previousValue && `Previous: ${log.previousValue}`}
                            {log.previousValue && log.newValue && ' → '}
                            {log.newValue && `New: ${log.newValue}`}
                          </p>
                        )}
                        <div className="mt-3">
                          {editingNotes === log.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={noteText[log.id] || ''}
                                onChange={(e) => setNoteText({ ...noteText, [log.id]: e.target.value })}
                                placeholder="Add notes..."
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveNotes(log.id)} style={{ backgroundColor: '#007acc' }}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Notes
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {log.notes ? (
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                  <strong>Notes:</strong> {log.notes}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No notes</p>
                              )}
                              <Button size="sm" variant="link" onClick={() => startEditNotes(log)} className="mt-1 p-0 h-auto">
                                {log.notes ? 'Edit Notes' : 'Add Notes'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
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

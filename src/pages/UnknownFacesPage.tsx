import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockUnknownFaces } from '@/data/mockData';
import { UnknownFace } from '@/types';
import { formatDateTime } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Camera, Check, Flag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UnknownFacesPage() {
  const [faces, setFaces] = useState<UnknownFace[]>(mockUnknownFaces);
  const [filter, setFilter] = useState('all');

  const filtered = faces.filter(f => {
    if (filter === 'pending') return !f.reviewed;
    if (filter === 'reviewed') return f.reviewed;
    if (filter === 'flagged') return f.flagged;
    return true;
  });

  const counts = {
    total: faces.length,
    reviewed: faces.filter(f => f.reviewed).length,
    flagged: faces.filter(f => f.flagged).length,
    pending: faces.filter(f => !f.reviewed).length,
  };

  const markReviewed = (id: string) => {
    setFaces(prev => prev.map(f => f.id === id ? { ...f, reviewed: true } : f));
    toast.success('Marked as reviewed');
  };

  const toggleFlag = (id: string) => {
    setFaces(prev => prev.map(f => f.id === id ? { ...f, flagged: !f.flagged } : f));
    toast.success('Flag toggled');
  };

  const deleteFace = (id: string) => {
    setFaces(prev => prev.filter(f => f.id !== id));
    toast.success('Entry dismissed');
  };

  const updateNotes = (id: string, notes: string) => {
    setFaces(prev => prev.map(f => f.id === id ? { ...f, notes } : f));
  };

  return (
    <AppLayout title="Unknown Faces">
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: counts.total, color: 'text-foreground' },
            { label: 'Reviewed', value: counts.reviewed, color: 'text-success' },
            { label: 'Flagged', value: counts.flagged, color: 'text-warning' },
            { label: 'Pending', value: counts.pending, color: 'text-destructive' },
          ].map(c => (
            <div key={c.label} className="bg-card rounded-xl border p-4 shadow-sm text-center">
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No unknown faces found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">Snapshot</th>
                  <th className="text-left p-3 font-medium">Timestamp</th>
                  <th className="text-left p-3 font-medium">Session</th>
                  <th className="text-left p-3 font-medium">Reviewed</th>
                  <th className="text-left p-3 font-medium">Flagged</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id} className="border-b hover:bg-muted/20">
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </td>
                      <td className="p-3">{formatDateTime(f.timestamp)}</td>
                      <td className="p-3 font-mono text-xs">{f.sessionId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.reviewed ? 'status-present' : 'status-absent'}`}>
                          {f.reviewed ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.flagged ? 'status-late' : 'bg-muted text-muted-foreground'}`}>
                          {f.flagged ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Input
                          className="h-7 text-xs max-w-[150px]"
                          value={f.notes}
                          onChange={e => updateNotes(f.id, e.target.value)}
                          placeholder="Add note..."
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {!f.reviewed && (
                            <Button variant="ghost" size="sm" onClick={() => markReviewed(f.id)} title="Mark Reviewed">
                              <Check className="w-4 h-4 text-success" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => toggleFlag(f.id)} title="Toggle Flag">
                            <Flag className={`w-4 h-4 ${f.flagged ? 'text-warning' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteFace(f.id)} title="Delete">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

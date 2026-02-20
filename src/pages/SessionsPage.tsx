import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockSessions, mockAttendanceRecords } from '@/data/mockData';
import { formatDateTime, getDurationStr } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Clock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Session } from '@/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startNewSession = () => {
    const newSession: Session = {
      id: `sess_${Date.now()}`,
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      startedAt: new Date().toISOString(),
      markedBy: 'user_1',
      markedByName: 'Dr. Admin',
      department: 'CS',
      totalPresent: 0,
      status: 'active',
    };
    setSessions(prev => [newSession, ...prev]);
    toast.success(`Session ${newSession.sessionId} started`);
  };

  const getSessionStudents = (sessionId: string) => {
    return mockAttendanceRecords.filter(r => r.sessionId === sessionId && r.status === 'present').slice(0, 15);
  };

  return (
    <AppLayout title="Sessions">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={startNewSession} className="gradient-primary text-white border-0">
            <Play className="w-4 h-4 mr-1" /> Start New Session
          </Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Clock className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No sessions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">Session ID</th>
                  <th className="text-left p-3 font-medium">Started By</th>
                  <th className="text-left p-3 font-medium">Dept</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-left p-3 font-medium">Marked</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium"></th>
                </tr></thead>
                <tbody>
                  {sessions.map(s => (
                    <>
                      <tr key={s.id} className="border-b hover:bg-muted/20 cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                        <td className="p-3 font-mono text-xs">{s.sessionId}</td>
                        <td className="p-3">{s.markedByName}</td>
                        <td className="p-3">{s.department}</td>
                        <td className="p-3">{formatDateTime(s.startedAt)}</td>
                        <td className="p-3">{getDurationStr(s.startedAt, s.endedAt)}</td>
                        <td className="p-3">{s.totalPresent}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'status-present' : 'bg-muted text-muted-foreground'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {expandedId === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </tr>
                      {expandedId === s.id && (
                        <tr key={`${s.id}-detail`}>
                          <td colSpan={8} className="p-4 bg-muted/20">
                            <p className="text-sm font-medium mb-2">Students marked in this session:</p>
                            <div className="flex flex-wrap gap-2">
                              {getSessionStudents(s.id).map(r => (
                                <span key={r.id} className="px-3 py-1 bg-card rounded-full text-xs border">
                                  {r.studentName} ({r.rollNo})
                                </span>
                              ))}
                              {getSessionStudents(s.id).length === 0 && <span className="text-sm text-muted-foreground">No records</span>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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

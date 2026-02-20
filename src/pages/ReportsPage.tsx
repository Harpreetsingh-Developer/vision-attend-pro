import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockStudents, mockAttendanceRecords } from '@/data/mockData';
import { getAttendanceBadgeColor } from '@/utils/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Department } from '@/types';

export default function ReportsPage() {
  const [selectedStudent, setSelectedStudent] = useState('');

  // Individual report data
  const student = mockStudents.find(s => s.id === selectedStudent);
  const studentRecords = mockAttendanceRecords.filter(r => r.studentId === selectedStudent);
  const studentPresent = studentRecords.filter(r => r.status === 'present').length;
  const studentPct = studentRecords.length > 0 ? Math.round((studentPresent / studentRecords.length) * 100) : 0;

  const studentMonthly = useMemo(() => {
    const map: Record<string, { total: number; present: number }> = {};
    studentRecords.forEach(r => {
      const m = r.date.substring(0, 7);
      if (!map[m]) map[m] = { total: 0, present: 0 };
      map[m].total++;
      if (r.status === 'present') map[m].present++;
    });
    return Object.entries(map).sort().map(([m, d]) => ({
      month: new Date(m + '-01').toLocaleDateString('en', { month: 'short' }),
      held: d.total, attended: d.present,
      percentage: Math.round((d.present / d.total) * 100),
    }));
  }, [selectedStudent]);

  // Department heatmap
  const deptData = useMemo(() => {
    const depts: Department[] = ['CS', 'IT', 'EC', 'ME', 'CE'];
    const months = new Set<string>();
    mockAttendanceRecords.forEach(r => months.add(r.date.substring(0, 7)));
    const sortedMonths = [...months].sort().slice(-6);

    return depts.map(dept => {
      const monthData: Record<string, number> = {};
      sortedMonths.forEach(m => {
        const total = mockAttendanceRecords.filter(r => r.department === dept && r.date.startsWith(m)).length;
        const present = mockAttendanceRecords.filter(r => r.department === dept && r.date.startsWith(m) && r.status === 'present').length;
        monthData[m] = total > 0 ? Math.round((present / total) * 100) : 0;
      });
      return { department: dept, months: monthData };
    });
  }, []);

  const heatmapMonths = Object.keys(deptData[0]?.months || {});

  // Defaulters
  const defaulters = useMemo(() => {
    return mockStudents.filter(s => s.isActive).map(s => {
      const recs = mockAttendanceRecords.filter(r => r.studentId === s.id);
      const present = recs.filter(r => r.status === 'present').length;
      const pct = recs.length > 0 ? Math.round((present / recs.length) * 100) : 0;
      const missed = recs.length - present;
      return { ...s, attendancePercentage: pct, missed };
    }).filter(s => s.attendancePercentage < 75).sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  }, []);

  const getCellColor = (pct: number) => {
    if (pct >= 85) return 'bg-success/20 text-success';
    if (pct >= 60) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  return (
    <AppLayout title="Reports & Analytics">
      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual Report</TabsTrigger>
          <TabsTrigger value="department">Department Analytics</TabsTrigger>
          <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="mt-4 space-y-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select a student..." /></SelectTrigger>
            <SelectContent>
              {mockStudents.filter(s => s.isActive).map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNo})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {student && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 bg-card rounded-xl border p-6 shadow-sm">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={studentPct >= 75 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${studentPct * 2.51} ${251 - studentPct * 2.51}`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{studentPct}%</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <p className="text-muted-foreground">{student.rollNo} • {student.department} • Year {student.year}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total classes: {studentRecords.length} | Attended: {studentPresent}</p>
                </div>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => toast.success('PDF report generated')}><FileText className="w-4 h-4 mr-1" /> Generate PDF</Button>
              </div>

              <div className="bg-card rounded-xl border p-5 shadow-sm">
                <h3 className="font-semibold mb-4">Monthly Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={studentMonthly}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="attended" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} name="Attended" />
                    <Bar dataKey="held" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Held" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Month</th>
                    <th className="text-left p-3 font-medium">Classes Held</th>
                    <th className="text-left p-3 font-medium">Attended</th>
                    <th className="text-left p-3 font-medium">Percentage</th>
                  </tr></thead>
                  <tbody>
                    {studentMonthly.map(m => (
                      <tr key={m.month} className="border-b">
                        <td className="p-3">{m.month}</td>
                        <td className="p-3">{m.held}</td>
                        <td className="p-3">{m.attended}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceBadgeColor(m.percentage)}`}>{m.percentage}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="department" className="mt-4">
          <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
            <div className="p-5 border-b"><h3 className="font-semibold">Department Attendance Heatmap</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">Department</th>
                {heatmapMonths.map(m => (
                  <th key={m} className="text-center p-3 font-medium">{new Date(m + '-01').toLocaleDateString('en', { month: 'short' })}</th>
                ))}
              </tr></thead>
              <tbody>
                {deptData.map(d => (
                  <tr key={d.department} className="border-b">
                    <td className="p-3 font-medium">{d.department}</td>
                    {heatmapMonths.map(m => (
                      <td key={m} className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCellColor(d.months[m])}`}>{d.months[m]}%</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="defaulters" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">{defaulters.length} students below 75% attendance</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success('Defaulters list exported')}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Roll No</th>
                <th className="text-left p-3 font-medium">Dept</th>
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-left p-3 font-medium">Attendance</th>
                <th className="text-left p-3 font-medium">Missed</th>
              </tr></thead>
              <tbody>
                {defaulters.map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/20">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 font-mono text-xs">{s.rollNo}</td>
                    <td className="p-3">{s.department}</td>
                    <td className="p-3">{s.year}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">{s.attendancePercentage}%</span></td>
                    <td className="p-3">{s.missed}</td>
                  </tr>
                ))}
                {defaulters.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No defaulters found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

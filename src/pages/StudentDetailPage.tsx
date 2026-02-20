import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockStudents, mockAttendanceRecords } from '@/data/mockData';
import { getInitials, getAttendanceBadgeColor, getStatusColor, formatDate, formatTime } from '@/utils/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const student = mockStudents.find(s => s.id === id);

  if (!student) {
    return (
      <AppLayout title="Student Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <User className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Student not found</p>
          <Link to="/students"><Button variant="outline" className="mt-3">Back to Students</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const records = mockAttendanceRecords.filter(r => r.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const totalRecords = records.length;
  const presentRecords = records.filter(r => r.status === 'present').length;
  const pct = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

  // Monthly data
  const monthMap: Record<string, { total: number; present: number }> = {};
  records.forEach(r => {
    const month = r.date.substring(0, 7);
    if (!monthMap[month]) monthMap[month] = { total: 0, present: 0 };
    monthMap[month].total++;
    if (r.status === 'present') monthMap[month].present++;
  });
  const monthlyData = Object.entries(monthMap).sort().map(([m, d]) => ({
    month: new Date(m + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
    percentage: Math.round((d.present / d.total) * 100),
  }));

  return (
    <AppLayout title={student.name}>
      <div className="space-y-6">
        <Link to="/students" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>

        {/* Profile card */}
        <div className="bg-card rounded-xl border p-6 shadow-sm flex flex-wrap items-center gap-6">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
            {getInitials(student.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <p className="text-muted-foreground">{student.rollNo} • {student.department} • Year {student.year} • Section {student.section}</p>
          </div>
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={pct >= 75 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${pct * 2.51} ${251 - pct * 2.51}`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{pct}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall</p>
          </div>
        </div>

        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Time</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Confidence</th>
                </tr></thead>
                <tbody>
                  {records.slice(0, 30).map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/20">
                      <td className="p-3">{formatDate(r.date)}</td>
                      <td className="p-3">{formatTime(r.time)}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(r.status)}`}>{r.status}</span></td>
                      <td className="p-3">{(r.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Monthly Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="hsl(239, 84%, 67%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="profile" className="mt-4">
            <div className="bg-card rounded-xl border p-6 shadow-sm max-w-lg space-y-3">
              <div><span className="text-sm text-muted-foreground">Name:</span> <span className="font-medium ml-2">{student.name}</span></div>
              <div><span className="text-sm text-muted-foreground">Roll No:</span> <span className="font-medium ml-2">{student.rollNo}</span></div>
              <div><span className="text-sm text-muted-foreground">Email:</span> <span className="font-medium ml-2">{student.email}</span></div>
              <div><span className="text-sm text-muted-foreground">Department:</span> <span className="font-medium ml-2">{student.department}</span></div>
              <div><span className="text-sm text-muted-foreground">Year:</span> <span className="font-medium ml-2">{student.year}</span></div>
              <div><span className="text-sm text-muted-foreground">Section:</span> <span className="font-medium ml-2">{student.section}</span></div>
              <div><span className="text-sm text-muted-foreground">Enrolled:</span> <span className="font-medium ml-2">{formatDate(student.enrolledAt)}</span></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

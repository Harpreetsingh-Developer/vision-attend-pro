import { AppLayout } from '@/components/layout/AppLayout';
import { mockStudents, mockAttendanceRecords, mockSessions, mockUnknownFaces } from '@/data/mockData';
import { todayStr, formatTime, getInitials } from '@/utils/helpers';
import { Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'];

export default function DashboardPage() {
  const today = todayStr();
  const todayRecords = mockAttendanceRecords.filter(r => r.date === today);
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const totalToday = todayRecords.length;
  const rate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;
  const unknownToday = mockUnknownFaces.filter(f => f.timestamp.startsWith(today)).length;

  const statCards = [
    { label: 'Total Students', value: mockStudents.length, icon: Users, color: 'text-primary' },
    { label: 'Sessions Today', value: mockSessions.filter(s => s.startedAt.startsWith(today)).length || 1, icon: Clock, color: 'text-accent' },
    { label: "Today's Attendance", value: `${rate}%`, icon: TrendingUp, color: 'text-success' },
    { label: 'Unknown Faces', value: unknownToday || 3, icon: AlertTriangle, color: 'text-warning' },
  ];

  // Pie data
  const statusCounts = { present: 0, absent: 0, late: 0, unknown: 0 };
  todayRecords.forEach(r => statusCounts[r.status]++);
  // Use mock data if today has no records
  const pieData = totalToday > 0
    ? [
        { name: 'Present', value: statusCounts.present },
        { name: 'Absent', value: statusCounts.absent },
        { name: 'Late', value: statusCounts.late },
        { name: 'Unknown', value: statusCounts.unknown },
      ]
    : [{ name: 'Present', value: 12 }, { name: 'Absent', value: 2 }, { name: 'Late', value: 1 }, { name: 'Unknown', value: 0 }];

  // Bar chart: last 7 days
  const barData: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en', { weekday: 'short' });
    barData.push({ day: dayLabel, count: mockAttendanceRecords.filter(r => r.date === ds && r.status === 'present').length || Math.floor(Math.random() * 5 + 8) });
  }

  // Area chart: last 30 days
  const areaData: { day: string; rate: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const total = mockAttendanceRecords.filter(r => r.date === ds).length;
    const present = mockAttendanceRecords.filter(r => r.date === ds && r.status === 'present').length;
    areaData.push({ day: d.getDate().toString(), rate: total > 0 ? Math.round((present / total) * 100) : Math.floor(Math.random() * 15 + 78) });
  }

  // Live feed simulation
  const [liveEvents, setLiveEvents] = useState<Array<{ id: string; name: string; rollNo: string; time: string }>>([]);
  useEffect(() => {
    const initial = mockStudents.slice(0, 5).map((s, i) => ({
      id: `ev_${i}`, name: s.name, rollNo: s.rollNo,
      time: new Date(Date.now() - i * 30000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }));
    setLiveEvents(initial);

    const interval = setInterval(() => {
      const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
      setLiveEvents(prev => [{
        id: `ev_${Date.now()}`, name: randomStudent.name, rollNo: randomStudent.rollNo,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }, ...prev].slice(0, 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="bg-card rounded-xl border p-5 shadow-sm animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live feed + Pie */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
              <h3 className="font-semibold">Live Attendance Feed</h3>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {liveEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-slide-in">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {getInitials(ev.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ev.name}</p>
                    <p className="text-xs text-muted-foreground">{ev.rollNo}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full status-present font-medium">Present</span>
                  <span className="text-xs text-muted-foreground">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Today's Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(239, 84%, 67%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <h3 className="font-semibold mb-4">30-Day Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[50, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="hsl(263, 70%, 58%)" fill="hsl(263, 70%, 58%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sessions table */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-5 border-b">
            <h3 className="font-semibold">Recent Sessions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium">Session ID</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Department</th>
                <th className="text-left p-3 font-medium">Present</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {mockSessions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs">{s.sessionId}</td>
                    <td className="p-3">{new Date(s.startedAt).toLocaleDateString()}</td>
                    <td className="p-3">{s.department}</td>
                    <td className="p-3">{s.totalPresent}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'status-present' : 'bg-muted text-muted-foreground'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockAttendanceRecords } from '@/data/mockData';
import { formatDate, formatTime, getStatusColor } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceStatus } from '@/types';

export default function AttendanceRecordsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filtered = useMemo(() => {
    return mockAttendanceRecords.filter(r => {
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (deptFilter !== 'all' && r.department !== deptFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search && !r.studentName?.toLowerCase().includes(search.toLowerCase()) && !r.rollNo?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [dateFrom, dateTo, deptFilter, statusFilter, search]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const statusCounts = { total: filtered.length, present: 0, absent: 0, late: 0, unknown: 0 };
  filtered.forEach(r => statusCounts[r.status]++);

  const resetFilters = () => { setDateFrom(''); setDateTo(''); setDeptFilter('all'); setStatusFilter('all'); setSearch(''); setPage(1); };

  return (
    <AppLayout title="Attendance Records">
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-[160px]" placeholder="From" />
            <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-[160px]" placeholder="To" />
            <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Dept" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                {['CS','IT','EC','ME','CE'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search student..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="flex-1 min-w-[150px]" />
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-muted font-medium">Total: {statusCounts.total}</span>
          <span className="px-3 py-1 rounded-full status-present font-medium">Present: {statusCounts.present}</span>
          <span className="px-3 py-1 rounded-full status-absent font-medium">Absent: {statusCounts.absent}</span>
          <span className="px-3 py-1 rounded-full status-late font-medium">Late: {statusCounts.late}</span>
          <span className="px-3 py-1 rounded-full status-unknown font-medium">Unknown: {statusCounts.unknown}</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => toast.success('Excel export ready')}><Download className="w-4 h-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('PDF export ready')}><FileText className="w-4 h-4 mr-1" /> PDF</Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Roll No</th>
                  <th className="text-left p-3 font-medium">Dept</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Time</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Confidence</th>
                </tr></thead>
                <tbody>
                  {paged.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">{r.studentName}</td>
                      <td className="p-3 font-mono text-xs">{r.rollNo}</td>
                      <td className="p-3">{r.department}</td>
                      <td className="p-3">{formatDate(r.date)}</td>
                      <td className="p-3">{formatTime(r.time)}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(r.status)}`}>{r.status}</span></td>
                      <td className="p-3">{(r.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">{(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

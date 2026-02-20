import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockStudents } from '@/data/mockData';
import { Student, Department } from '@/types';
import { getInitials, getAttendanceBadgeColor } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', rollNo: '', email: '', department: 'CS' as Department, year: 1 as 1|2|3|4, section: 'A' });

  const perPage = 10;

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (!s.isActive) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.rollNo.toLowerCase().includes(search.toLowerCase())) return false;
      if (deptFilter !== 'all' && s.department !== deptFilter) return false;
      if (yearFilter !== 'all' && s.year !== parseInt(yearFilter)) return false;
      return true;
    });
  }, [students, search, deptFilter, yearFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const openAdd = () => {
    setEditStudent(null);
    setForm({ name: '', rollNo: '', email: '', department: 'CS', year: 1, section: 'A' });
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ name: s.name, rollNo: s.rollNo, email: s.email, department: s.department, year: s.year, section: s.section });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.rollNo) { toast.error('Name and Roll No are required'); return; }
    if (editStudent) {
      setStudents(prev => prev.map(s => s.id === editStudent.id ? { ...s, ...form } : s));
      toast.success('Student updated');
    } else {
      const newS: Student = { id: `stu_${Date.now()}`, ...form, enrolledAt: new Date().toISOString(), isActive: true, attendancePercentage: 0 };
      setStudents(prev => [newS, ...prev]);
      toast.success('Student added');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setStudents(prev => prev.map(s => s.id === deleteId ? { ...s, isActive: false } : s));
      toast.success('Student removed');
      setDeleteId(null);
    }
  };

  return (
    <AppLayout title="Student Management">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
          </div>
          <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {['CS','IT','EC','ME','CE'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[110px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {[1,2,3,4].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gradient-primary text-white border-0"><Plus className="w-4 h-4 mr-1" /> Add Student</Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-muted-foreground">No students found</p>
              <Button variant="outline" className="mt-3" onClick={openAdd}>Add Student</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Roll No</th>
                  <th className="text-left p-3 font-medium">Dept</th>
                  <th className="text-left p-3 font-medium">Year</th>
                  <th className="text-left p-3 font-medium">Section</th>
                  <th className="text-left p-3 font-medium">Attendance</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {paged.map(s => (
                    <tr key={s.id} className="border-b hover:bg-muted/20 cursor-pointer" onClick={() => {}}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">{getInitials(s.name)}</div>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{s.rollNo}</td>
                      <td className="p-3">{s.department}</td>
                      <td className="p-3">{s.year}</td>
                      <td className="p-3">{s.section}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceBadgeColor(s.attendancePercentage || 0)}`}>
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Link to={`/students/${s.id}`}><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">Showing {(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editStudent ? 'Edit Student' : 'Add Student'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Roll No</Label><Input value={form.rollNo} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v as Department }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['CS','IT','EC','ME','CE'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={String(form.year)} onValueChange={v => setForm(f => ({ ...f, year: parseInt(v) as 1|2|3|4 }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Section</Label><Input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gradient-primary text-white border-0">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>This will mark the student as inactive. This action can be reversed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

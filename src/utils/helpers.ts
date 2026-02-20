import { AttendanceStatus } from '@/types';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export function formatDateTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'status-present';
    case 'absent': return 'status-absent';
    case 'late': return 'status-late';
    case 'unknown': return 'status-unknown';
  }
}

export function getAttendanceBadgeColor(pct: number): string {
  if (pct >= 85) return 'bg-success/10 text-success';
  if (pct >= 60) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDurationStr(start: string, end?: string): string {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const mins = Math.floor((e - s) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export type UserRole = 'admin' | 'teacher' | 'student';
export type Department = 'CS' | 'IT' | 'EC' | 'ME' | 'CE';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'unknown';
export type SessionStatus = 'active' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  department: Department;
  year: 1 | 2 | 3 | 4;
  section: string;
  photoFilename?: string;
  enrolledAt: string;
  isActive: boolean;
  attendancePercentage?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  rollNo?: string;
  department?: Department;
  date: string;
  time: string;
  status: AttendanceStatus;
  sessionId?: string;
  markedBy?: string;
  confidence: number;
  createdAt: string;
}

export interface UnknownFace {
  id: string;
  timestamp: string;
  snapshotFilename?: string;
  sessionId?: string;
  reviewed: boolean;
  flagged: boolean;
  notes: string;
}

export interface AppSettings {
  key: string;
  value: any;
  label: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  markedBy?: string;
  markedByName?: string;
  department?: string;
  totalPresent: number;
  status: SessionStatus;
}

export interface LiveEvent {
  id: string;
  studentName: string;
  rollNo: string;
  time: string;
  confidence: number;
  type: 'attendance' | 'session_start' | 'session_end';
}

export interface DashboardStats {
  totalStudents: number;
  sessionsToday: number;
  todayAttendanceRate: number;
  unknownFacesToday: number;
}

export interface DepartmentReport {
  department: Department;
  months: Record<string, number>;
}

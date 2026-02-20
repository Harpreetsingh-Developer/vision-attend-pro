import { Student, AttendanceRecord, UnknownFace, Session, AppSettings, User, Department, AttendanceStatus } from '@/types';

const departments: Department[] = ['CS', 'IT', 'EC', 'ME', 'CE'];

const studentNames = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Iyer', 'Karthik Nair', 'Meera Joshi', 'Arjun Kumar', 'Divya Menon',
  'Rahul Verma', 'Pooja Chauhan', 'Amit Thakur', 'Neha Agarwal', 'Saurabh Das'
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Students
export const mockStudents: Student[] = studentNames.map((name, i) => {
  const deptMap: Department[] = ['CS','CS','CS','CS','CS','CS','IT','IT','IT','IT','EC','EC','EC','ME','ME'];
  return {
    id: `stu_${i + 1}`,
    name,
    rollNo: `${deptMap[i]}${2021 + (i % 4)}${String(i + 1).padStart(3, '0')}`,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@university.edu`,
    department: deptMap[i],
    year: ((i % 4) + 1) as 1 | 2 | 3 | 4,
    section: i % 2 === 0 ? 'A' : 'B',
    enrolledAt: '2023-08-01',
    isActive: true,
    attendancePercentage: randomBetween(55, 98),
  };
});

// Generate 60 days of attendance
function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    
    for (const student of mockStudents) {
      const rand = Math.random();
      let status: AttendanceStatus;
      if (rand < 0.85) status = 'present';
      else if (rand < 0.93) status = 'absent';
      else if (rand < 0.98) status = 'late';
      else status = 'unknown';

      records.push({
        id: generateId(),
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        department: student.department,
        date: dateStr,
        time: `${String(randomBetween(8, 10)).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}:${String(randomBetween(0, 59)).padStart(2, '0')}`,
        status,
        sessionId: `sess_${dayOffset}`,
        markedBy: 'user_1',
        confidence: status === 'present' ? +(0.85 + Math.random() * 0.15).toFixed(2) : +(0.3 + Math.random() * 0.4).toFixed(2),
        createdAt: date.toISOString(),
      });
    }
  }
  return records;
}

export const mockAttendanceRecords = generateAttendanceRecords();

export const mockSessions: Session[] = [
  { id: 'sess_0', sessionId: 'SESS-001', startedAt: new Date().toISOString(), endedAt: undefined, markedBy: 'user_1', markedByName: 'Dr. Admin', department: 'CS', totalPresent: 12, status: 'active' },
  { id: 'sess_1', sessionId: 'SESS-002', startedAt: new Date(Date.now() - 86400000).toISOString(), endedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(), markedBy: 'user_2', markedByName: 'Prof. Teacher', department: 'IT', totalPresent: 9, status: 'closed' },
  { id: 'sess_2', sessionId: 'SESS-003', startedAt: new Date(Date.now() - 172800000).toISOString(), endedAt: new Date(Date.now() - 172800000 + 5400000).toISOString(), markedBy: 'user_1', markedByName: 'Dr. Admin', department: 'EC', totalPresent: 11, status: 'closed' },
];

export const mockUnknownFaces: UnknownFace[] = Array.from({ length: 8 }, (_, i) => ({
  id: `uf_${i + 1}`,
  timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  snapshotFilename: `unknown_${i + 1}.jpg`,
  sessionId: `SESS-00${(i % 3) + 1}`,
  reviewed: i < 3,
  flagged: i === 1 || i === 4,
  notes: i === 1 ? 'Possibly a visitor' : '',
}));

export const mockSettings: AppSettings[] = [
  { key: 'recognitionThreshold', value: 0.6, label: 'Recognition Threshold', updatedAt: new Date().toISOString() },
  { key: 'sessionWindowMinutes', value: 180, label: 'Session Window (minutes)', updatedAt: new Date().toISOString() },
  { key: 'showConfidence', value: true, label: 'Show Confidence', updatedAt: new Date().toISOString() },
];

export const mockUsers: User[] = [
  { id: 'user_1', name: 'Dr. Admin', email: 'admin@visioattend.com', role: 'admin', department: 'CS', createdAt: '2024-01-01' },
  { id: 'user_2', name: 'Prof. Teacher', email: 'teacher@visioattend.com', role: 'teacher', department: 'IT', createdAt: '2024-01-01' },
];

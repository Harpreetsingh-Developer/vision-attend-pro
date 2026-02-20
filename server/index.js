import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173'], credentials: false }));
app.use(express.json());

// In-memory data (mirrors frontend types) with simple JSON-file persistence
const departments = ['CS', 'IT', 'EC', 'ME', 'CE'];

const studentNames = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Iyer', 'Karthik Nair', 'Meera Joshi', 'Arjun Kumar', 'Divya Menon',
  'Rahul Verma', 'Pooja Chauhan', 'Amit Thakur', 'Neha Agarwal', 'Saurabh Das',
];

function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Users and auth
const users = [
  { id: 'user_1', name: 'Dr. Admin', email: 'admin@visioattend.com', role: 'admin', department: 'CS', createdAt: '2024-01-01' },
  { id: 'user_2', name: 'Prof. Teacher', email: 'teacher@visioattend.com', role: 'teacher', department: 'IT', createdAt: '2024-01-01' },
];

const credentials = {
  'admin@visioattend.com': { password: 'Admin@123', userId: 'user_1' },
  'teacher@visioattend.com': { password: 'Teacher@123', userId: 'user_2' },
};

// Students
let students = studentNames.map((name, i) => {
  const deptMap = ['CS','CS','CS','CS','CS','CS','IT','IT','IT','IT','EC','EC','EC','ME','ME'];
  return {
    id: `stu_${i + 1}`,
    name,
    rollNo: `${deptMap[i]}${2021 + (i % 4)}${String(i + 1).padStart(3, '0')}`,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@university.edu`,
    department: deptMap[i],
    year: ((i % 4) + 1),
    section: i % 2 === 0 ? 'A' : 'B',
    enrolledAt: '2023-08-01',
    isActive: true,
    attendancePercentage: randomBetween(55, 98),
  };
});

// Attendance records (smaller set than frontend mock, but enough for demo)
let attendanceRecords = [];
(function generateAttendanceRecords() {
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    for (const student of students) {
      const rand = Math.random();
      let status;
      if (rand < 0.85) status = 'present';
      else if (rand < 0.93) status = 'absent';
      else if (rand < 0.98) status = 'late';
      else status = 'unknown';

      attendanceRecords.push({
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
})();

// Simple sessions and unknown faces
let sessions = [
  { id: 'sess_0', sessionId: 'SESS-001', startedAt: new Date().toISOString(), endedAt: null, markedBy: 'user_1', markedByName: 'Dr. Admin', department: 'CS', totalPresent: 12, status: 'active' },
  { id: 'sess_1', sessionId: 'SESS-002', startedAt: new Date(Date.now() - 86400000).toISOString(), endedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(), markedBy: 'user_2', markedByName: 'Prof. Teacher', department: 'IT', totalPresent: 9, status: 'closed' },
];

let unknownFaces = Array.from({ length: 4 }, (_, i) => ({
  id: `uf_${i + 1}`,
  timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  snapshotFilename: `unknown_${i + 1}.jpg`,
  sessionId: `SESS-00${(i % 2) + 1}`,
  reviewed: i < 2,
  flagged: i === 1,
  notes: i === 1 ? 'Possibly a visitor' : '',
}));

const settings = [
  { key: 'recognitionThreshold', value: 0.6, label: 'Recognition Threshold', updatedAt: new Date().toISOString() },
  { key: 'sessionWindowMinutes', value: 180, label: 'Session Window (minutes)', updatedAt: new Date().toISOString() },
  { key: 'showConfidence', value: true, label: 'Show Confidence', updatedAt: new Date().toISOString() },
];

function saveDb() {
  const data = {
    students,
    attendanceRecords,
    sessions,
    unknownFaces,
    settings,
  };
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json', err);
  }
}

// Load existing data from disk if present so data persists across restarts
try {
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.students)) students = parsed.students;
      if (Array.isArray(parsed.attendanceRecords)) attendanceRecords = parsed.attendanceRecords;
      if (Array.isArray(parsed.sessions)) sessions = parsed.sessions;
      if (Array.isArray(parsed.unknownFaces)) unknownFaces = parsed.unknownFaces;
      if (Array.isArray(parsed.settings)) {
        // Keep default settings keys but override from file when present
        parsed.settings.forEach((sFromFile) => {
          const idx = settings.findIndex((s) => s.key === sFromFile.key);
          if (idx !== -1) settings[idx] = sFromFile;
          else settings.push(sFromFile);
        });
      }
    }
  } else {
    // No existing file; create one from initial seeded data
    saveDb();
  }
} catch (err) {
  console.error('Failed to load db.json, using in-memory defaults', err);
}

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Vision Attend Pro backend running' });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const cred = credentials[email];
  if (!cred || cred.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const user = users.find(u => u.id === cred.userId);
  res.json({ user });
});

// Students CRUD
app.get('/api/students', (req, res) => {
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { name, rollNo, email, department, year, section } = req.body || {};
  if (!name || !rollNo) {
    return res.status(400).json({ message: 'Name and rollNo are required' });
  }
  const newStudent = {
    id: `stu_${Date.now()}`,
    name,
    rollNo,
    email: email || '',
    department: departments.includes(department) ? department : 'CS',
    year: Number(year) || 1,
    section: section || 'A',
    enrolledAt: new Date().toISOString(),
    isActive: true,
    attendancePercentage: 0,
  };
  students = [newStudent, ...students];
  saveDb();
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Student not found' });
  students[idx] = { ...students[idx], ...req.body };
  saveDb();
  res.json(students[idx]);
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Student not found' });
  students[idx] = { ...students[idx], isActive: false };
  saveDb();
  res.json(students[idx]);
});

// Attendance / sessions / settings
app.get('/api/attendance', (req, res) => {
  res.json(attendanceRecords);
});

app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

app.get('/api/unknown-faces', (req, res) => {
  res.json(unknownFaces);
});

app.get('/api/settings', (req, res) => {
  res.json(settings);
});

// Face Recognition endpoints (proxy to Python service)
const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:5000';

app.post('/api/face-recognition/recognize', async (req, res) => {
  try {
    const { image, threshold } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image data required' });
    }
    
    const response = await fetch(`${FACE_SERVICE_URL}/recognize-face-base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, threshold: threshold || 0.6 }),
    });
    
    if (!response.ok) {
      throw new Error('Face recognition service error');
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Face recognition error:', error);
    res.status(500).json({ 
      success: false, 
      recognized: false, 
      message: 'Face recognition service unavailable',
      error: error.message 
    });
  }
});

app.post('/api/face-recognition/register', async (req, res) => {
  try {
    const { studentId, image } = req.body;
    if (!studentId || !image) {
      return res.status(400).json({ message: 'Student ID and image required' });
    }
    
    // Send base64 image directly to Python service
    // The Python service will handle base64 decoding
    const response = await fetch(`${FACE_SERVICE_URL}/register-face-base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, image }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || error.message || 'Registration failed');
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/face-recognition/registered', async (req, res) => {
  try {
    const response = await fetch(`${FACE_SERVICE_URL}/registered-faces`);
    if (!response.ok) throw new Error('Service error');
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ student_ids: [], count: 0 });
  }
});

// Mark attendance with face recognition
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { image, sessionId, markedBy, threshold } = req.body;
    
    if (!image || !sessionId) {
      return res.status(400).json({ message: 'Image and sessionId required' });
    }
    
    // Recognize face
    const recognitionResponse = await fetch(`${FACE_SERVICE_URL}/recognize-face-base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, threshold: threshold || 0.6 }),
    });
    
    if (!recognitionResponse.ok) {
      throw new Error('Face recognition failed');
    }
    
    const recognition = await recognitionResponse.json();
    
    if (!recognition.recognized || !recognition.student_id) {
      // Unknown face - save to unknown faces
      const unknownFace = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        snapshotFilename: `unknown_${Date.now()}.jpg`,
        sessionId,
        reviewed: false,
        flagged: false,
        notes: '',
      };
      unknownFaces.push(unknownFace);
      saveDb();
      
      return res.json({
        success: false,
        recognized: false,
        message: 'Unknown face detected',
        unknownFace,
      });
    }
    
    // Find student
    const student = students.find(s => s.id === recognition.student_id);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if already marked in this session today
    const today = new Date().toISOString().split('T')[0];
    const existing = attendanceRecords.find(
      r => r.studentId === student.id && r.sessionId === sessionId && r.date === today
    );
    
    if (existing) {
      return res.json({
        success: true,
        recognized: true,
        alreadyMarked: true,
        student: {
          id: student.id,
          name: student.name,
          rollNo: student.rollNo,
        },
        confidence: recognition.confidence,
      });
    }
    
    // Create attendance record
    const record = {
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      department: student.department,
      date: today,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'present',
      sessionId,
      markedBy: markedBy || 'system',
      confidence: recognition.confidence,
      createdAt: new Date().toISOString(),
    };
    
    attendanceRecords.push(record);
    
    // Update session totalPresent
    const session = sessions.find(s => s.sessionId === sessionId || s.id === sessionId);
    if (session) {
      session.totalPresent = (session.totalPresent || 0) + 1;
    }
    
    saveDb();
    
    res.json({
      success: true,
      recognized: true,
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
      },
      confidence: recognition.confidence,
      record,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/update session
app.post('/api/sessions', async (req, res) => {
  try {
    const { sessionId, markedBy, markedByName, department } = req.body;
    
    const existing = sessions.find(s => s.sessionId === sessionId);
    if (existing) {
      res.json(existing);
      return;
    }
    
    const session = {
      id: `sess_${Date.now()}`,
      sessionId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      markedBy: markedBy || 'user_1',
      markedByName: markedByName || 'System',
      department: department || 'CS',
      totalPresent: 0,
      status: 'active',
    };
    
    sessions.push(session);
    saveDb();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const session = sessions.find(s => s.id === id || s.sessionId === id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.endedAt = new Date().toISOString();
    session.status = 'closed';
    saveDb();
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Vision Attend Pro backend listening on http://localhost:${PORT}`);
  console.log(`Face recognition service expected at: ${FACE_SERVICE_URL}`);
});


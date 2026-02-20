import { useState, useRef, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockStudents } from '@/data/mockData';
import { getInitials } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Camera, Play, Square, Scan, Download } from 'lucide-react';
import { toast } from 'sonner';

interface MarkedStudent {
  id: string; name: string; rollNo: string; time: string; confidence: number;
}

export default function MarkAttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState('00:00');
  const [markedStudents, setMarkedStudents] = useState<MarkedStudent[]>([]);
  const [unknownCount, setUnknownCount] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setCameraError(false);
      }
    } catch {
      setCameraError(true);
      toast.error('Camera access denied');
    }
  }, []);

  useEffect(() => { startCamera(); return () => { if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }; }, [startCamera]);

  // Timer
  useEffect(() => {
    if (!sessionActive || !sessionStart) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, sessionStart]);

  const startSession = () => {
    const id = `SESS-${Date.now().toString().slice(-6)}`;
    setSessionId(id);
    setSessionStart(new Date());
    setSessionActive(true);
    setMarkedStudents([]);
    setUnknownCount(0);
    toast.success(`Session ${id} started`);
  };

  const captureRecognise = () => {
    if (!sessionActive) { toast.error('Start a session first'); return; }
    setDetecting(true);
    setTimeout(() => {
      // Simulate: pick a random unmarked student
      const unmarked = mockStudents.filter(s => s.isActive && !markedStudents.find(m => m.id === s.id));
      if (unmarked.length === 0) {
        // Simulate unknown face
        setUnknownCount(c => c + 1);
        toast.warning('Unknown face detected');
      } else {
        const student = unmarked[Math.floor(Math.random() * unmarked.length)];
        const confidence = +(0.85 + Math.random() * 0.15).toFixed(2);
        const entry: MarkedStudent = {
          id: student.id, name: student.name, rollNo: student.rollNo,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          confidence,
        };
        setMarkedStudents(prev => [entry, ...prev]);
        toast.success(`${student.name} marked present (${(confidence * 100).toFixed(0)}%)`);
      }
      setDetecting(false);
    }, 800);
  };

  const endSession = () => {
    setSessionActive(false);
    toast.success(`Session ended. ${markedStudents.length} students marked.`);
  };

  return (
    <AppLayout title="Mark Attendance">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left - Camera */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-foreground/5">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <Camera className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-semibold mb-2">Camera Access Required</h3>
                  <p className="text-sm text-muted-foreground mb-4">Please allow camera access in your browser settings to use face recognition.</p>
                  <Button onClick={startCamera} variant="outline">Retry</Button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {detecting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-success rounded-xl animate-pulse" />
                    </div>
                  )}
                  {sessionActive && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/70 text-background text-sm">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse-dot" />
                      LIVE • {elapsed}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {!sessionActive ? (
                <Button onClick={startSession} className="gradient-primary text-white border-0" disabled={cameraError}>
                  <Play className="w-4 h-4 mr-1" /> Start Session
                </Button>
              ) : (
                <>
                  <Button onClick={captureRecognise} disabled={detecting}>
                    <Scan className="w-4 h-4 mr-1" /> {detecting ? 'Detecting...' : 'Capture & Recognise'}
                  </Button>
                  <Button onClick={endSession} variant="destructive">
                    <Square className="w-4 h-4 mr-1" /> End Session
                  </Button>
                </>
              )}
            </div>
          </div>

          {sessionActive && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border p-4 text-center">
                <p className="text-2xl font-bold text-success">{markedStudents.length}</p>
                <p className="text-sm text-muted-foreground">Recognised</p>
              </div>
              <div className="bg-card rounded-xl border p-4 text-center">
                <p className="text-2xl font-bold text-warning">{unknownCount}</p>
                <p className="text-sm text-muted-foreground">Unknown Faces</p>
              </div>
            </div>
          )}
        </div>

        {/* Right - Session list */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Session Attendance</h3>
              {sessionId && <span className="text-xs font-mono text-muted-foreground">{sessionId}</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[500px]">
              {markedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Camera className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">{sessionActive ? 'Capture faces to mark attendance' : 'Start a session to begin'}</p>
                </div>
              ) : (
                markedStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-slide-in">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">{getInitials(s.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.rollNo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs px-2 py-1 rounded-full status-present font-medium">Present</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {markedStudents.length > 0 && (
              <div className="p-3 border-t">
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success('Export feature - data ready')}>
                  <Download className="w-4 h-4 mr-1" /> Export Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

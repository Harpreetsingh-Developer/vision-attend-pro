import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, Zap, DollarSign, Users, Lock, BarChart2,
  Camera, Cpu, Eye, Database, ArrowRight, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const stats = [
  { label: 'Recognition Accuracy', value: 93, suffix: '%' },
  { label: 'Per Person', value: 1, prefix: '<', suffix: ' Second' },
  { label: 'Hardware Cost', value: 0, prefix: '', suffix: '', display: 'Zero' },
  { label: 'Proxy-Free', value: 100, suffix: '%' },
];

const features = [
  { icon: ShieldCheck, title: 'No Proxy Attendance', desc: 'A face cannot be lent or shared. Biometric verification ensures every student is physically present.' },
  { icon: Zap, title: 'Real-Time Processing', desc: 'Marks attendance in under one second using optimized deep feature extraction pipelines.' },
  { icon: DollarSign, title: 'Zero Hardware Cost', desc: 'Runs entirely on existing laptop webcams. No special cameras or sensors required.' },
  { icon: Users, title: 'Parallel Detection', desc: 'Detects and recognizes multiple faces simultaneously in a single video frame.' },
  { icon: Lock, title: 'Secure Digital Records', desc: 'All records are encrypted, timestamped, and exportable in PDF and Excel formats.' },
  { icon: BarChart2, title: 'Full Analytics', desc: 'Comprehensive dashboards with trends, department reports, and automatic defaulter detection.' },
];

const pipeline = [
  { icon: Camera, label: 'Camera' },
  { icon: Eye, label: 'Face Detect' },
  { icon: Cpu, label: 'Preprocess' },
  { icon: Database, label: 'Extract Features' },
  { icon: ShieldCheck, label: 'Recognise' },
  { icon: BarChart2, label: 'Log Attendance' },
];

const techBadges = ['Python', 'OpenCV', 'React', 'Node.js', 'MongoDB', 'Dlib ResNet'];

const citations = [
  { author: 'Schroff et al.', title: 'FaceNet: A Unified Embedding for Face Recognition and Clustering', detail: 'Triplet loss function achieving 99.63% accuracy on LFW benchmark.' },
  { author: 'King, D.', title: 'Dlib: 99.38% LFW Accuracy', detail: 'Open-source face recognition with 128-dimensional embeddings using ResNet architecture.' },
  { author: 'Dalal & Triggs', title: 'HOG Descriptors for Human Detection', detail: 'Histogram of Oriented Gradients for robust face detection in varying conditions.' },
];

function AnimatedCounter({ value, prefix = '', suffix = '', display }: { value: number; prefix?: string; suffix?: string; display?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  if (display) return <span className="text-4xl font-bold gradient-text">{display}</span>;
  return <span className="text-4xl font-bold gradient-text">{prefix}{count}{suffix}</span>;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-white">VI</div>
            <span className="font-bold text-lg">VISIOATTEND</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Login</Button></Link>
                <Link to="/register"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
            Intelligent Biometric Attendance
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Stop Losing{' '}
            <span className="gradient-text">9 Minutes</span>
            {' '}Per Class
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            VISIOATTEND marks attendance automatically using face recognition — before your students finish sitting down.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/login'}>
              <Button size="lg" className="gradient-primary text-white border-0 px-8 h-12 text-base">
                Login to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Animated counters */}
      <section className="py-12 border-y bg-card/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {stats.map(s => (
            <div key={s.label} className="text-center animate-count-up">
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} display={s.display} />
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose VISIOATTEND?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="how-it-works" className="py-20 px-6 bg-card/50 border-y">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">System Architecture</h2>
          <p className="text-center text-muted-foreground mb-12">How VISIOATTEND processes each frame in real-time</p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {pipeline.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border shadow-sm min-w-[100px]">
                  <step.icon className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium text-center">{step.label}</span>
                </div>
                {i < pipeline.length - 1 && <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech badges */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Powered By</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techBadges.map(t => (
              <span key={t} className="px-4 py-2 bg-card border rounded-full text-sm font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Research */}
      <section className="py-20 px-6 bg-card/50 border-y">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Research Foundation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {citations.map(c => (
              <div key={c.author} className="p-6 bg-card rounded-xl border">
                <p className="text-sm font-semibold text-primary mb-1">{c.author}</p>
                <p className="font-medium mb-2">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center text-[10px] font-bold text-white">VI</div>
            <span className="font-bold">VISIOATTEND</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Intelligent Biometric Attendance — Powered by Computer Vision</p>
          <p className="text-xs text-muted-foreground">Team: Abhishek Yadav • Aman Mishra • Anav Shukla • Abhigyan Singh</p>
          <p className="text-xs text-muted-foreground">Guide: Neeraj Chauhan Sir</p>
        </div>
      </footer>
    </div>
  );
}

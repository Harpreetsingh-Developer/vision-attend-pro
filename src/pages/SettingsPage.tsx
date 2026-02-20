import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockSettings } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, User, Cpu } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState(mockSettings.find(s => s.key === 'recognitionThreshold')?.value || 0.6);
  const [sessionWindow, setSessionWindow] = useState(mockSettings.find(s => s.key === 'sessionWindowMinutes')?.value || 180);
  const [showConfidence, setShowConfidence] = useState(mockSettings.find(s => s.key === 'showConfidence')?.value || true);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const saveRecognition = () => {
    toast.success('Recognition settings saved');
  };

  const saveAccount = () => {
    if (newPass && newPass !== confirmPass) { toast.error('Passwords do not match'); return; }
    toast.success('Account settings saved');
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl space-y-6">
        {/* Recognition Settings */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recognition Settings</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Recognition Threshold</Label>
                <span className="text-sm font-mono font-medium text-primary">{threshold.toFixed(2)}</span>
              </div>
              <Slider value={[threshold]} min={0.4} max={0.8} step={0.01} onValueChange={v => setThreshold(v[0])} />
              <p className="text-xs text-muted-foreground mt-1">Higher values = stricter matching (0.4 - 0.8)</p>
            </div>
            <div>
              <Label>Session Window Duration (minutes)</Label>
              <Input type="number" value={sessionWindow} onChange={e => setSessionWindow(parseInt(e.target.value))} className="mt-1 max-w-[200px]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Confidence Percentage</Label>
                <p className="text-xs text-muted-foreground">Display recognition confidence in records</p>
              </div>
              <Switch checked={showConfidence} onCheckedChange={setShowConfidence} />
            </div>
          </div>
          <Button onClick={saveRecognition} className="mt-6 gradient-primary text-white border-0">Save Settings</Button>
        </div>

        {/* Account Settings */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Account Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 max-w-[300px]" />
            </div>
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="mt-1 max-w-[300px]" />
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-[300px]">
              <div>
                <Label>New Password</Label>
                <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Confirm</Label>
                <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <p className="text-sm font-medium capitalize mt-1">{user?.role} (read-only)</p>
            </div>
          </div>
          <Button onClick={saveAccount} className="mt-6 gradient-primary text-white border-0">Save Account</Button>
        </div>

        {/* System Info */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">System Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Algorithm', 'Dlib ResNet 128-d Embeddings'],
              ['Detector', 'HOG + Dlib Frontal Face'],
              ['Classifier', 'K-Nearest Neighbours (k=5)'],
              ['LFW Benchmark', '99.38%'],
              ['Deployment Threshold', threshold.toFixed(2)],
              ['Version', '1.0.0'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

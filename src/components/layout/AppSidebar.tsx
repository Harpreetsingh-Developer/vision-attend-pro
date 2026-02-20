import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/helpers';
import {
  LayoutDashboard, Users, Camera, ClipboardList, BarChart2,
  Clock, AlertTriangle, Settings, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockUnknownFaces } from '@/data/mockData';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Students', icon: Users, path: '/students' },
  { label: 'Mark Attendance', icon: Camera, path: '/attendance/mark', badge: 'LIVE' },
  { label: 'Attendance Records', icon: ClipboardList, path: '/attendance/records' },
  { label: 'Reports', icon: BarChart2, path: '/reports' },
  { label: 'Sessions', icon: Clock, path: '/sessions' },
  { label: 'Unknown Faces', icon: AlertTriangle, path: '/unknown-faces' },
  { label: 'Settings', icon: Settings, path: '/settings', adminOnly: true },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const unknownCount = mockUnknownFaces.filter(f => !f.reviewed).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
          VI
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight">VISIOATTEND</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground border-l-2 border-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded gradient-primary text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.label === 'Unknown Faces' && unknownCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-warning text-warning-foreground">
                      {unknownCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(user.name)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-sidebar-muted capitalize">{user.role}</p>
              </div>
            )}
            <button onClick={handleLogout} className="p-1.5 rounded hover:bg-sidebar-accent" title="Logout">
              <LogOut className="w-4 h-4 text-sidebar-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-md md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="w-[260px] h-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-sidebar-foreground">
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border shadow-sm flex items-center justify-center hover:bg-muted"
        >
          <ChevronLeft className={cn('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import {
  LayoutDashboard, Upload, Users, UserCheck, ClipboardList, Mail,
  MessageCircle, Trophy, Settings, LogOut, Menu, ChevronLeft,
  GraduationCap, Send, BarChart3, FileText, Bell, Award, GitBranch, Sparkles, Ban
} from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Import Data', icon: Upload, path: '/admin/import' },
  { label: 'Teams', icon: Users, path: '/admin/teams' },
  { label: 'Mentors', icon: UserCheck, path: '/admin/mentors' },
  { label: 'Round Mapping', icon: GitBranch, path: '/admin/round-mapping' },
  { label: 'Evaluations', icon: BarChart3, path: '/admin/evaluations' },
  { label: 'Submissions', icon: FileText, path: '/admin/submissions' },
  { label: 'Disqualify Team', icon: Ban, path: '/admin/disqualify' },
  { label: 'Rubrics', icon: GraduationCap, path: '/admin/rubrics' },
  { label: 'Email', icon: Mail, path: '/admin/email' },
  { label: 'Chat Monitor', icon: MessageCircle, path: '/admin/chat' },
  { label: 'Release Results', icon: Trophy, path: '/admin/release' },
  { label: 'Leaderboard', icon: Award, path: '/admin/leaderboard' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const mentorNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/mentor' },
  { label: 'Evaluations', icon: ClipboardList, path: '/mentor/evaluations' },
  { label: 'Chat', icon: MessageCircle, path: '/mentor/chat' },
  { label: 'Rubrics', icon: GraduationCap, path: '/mentor/rubrics' },
  { label: 'Leaderboard', icon: Award, path: '/mentor/leaderboard' },
];

const teamNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/team' },
  { label: 'Submissions', icon: FileText, path: '/team/submissions' },
  { label: 'Project', icon: Sparkles, path: '/team/project' },
  { label: 'Chat', icon: MessageCircle, path: '/team/chat' },
  { label: 'Results', icon: Trophy, path: '/team/results' },
  { label: 'Rubrics', icon: GraduationCap, path: '/team/rubrics' },
];

function SidebarContent({ items, location, collapsed, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm" style={{fontFamily:'Space Grotesk'}}>C</span>
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight" style={{fontFamily:'Space Grotesk', color:'hsl(262 83% 58%)'}}>CodHER</span>}
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" data-testid="app-shell-sidebar">
          {items.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/mentor' && item.path !== '/team' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                data-testid="app-shell-nav-item"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'mentor' ? mentorNav : teamNav;
  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'mentor' ? 'Mentor' : 'Team';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background app-bg">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-card relative z-10 transition-all duration-200 ease-out ${collapsed ? 'w-16' : 'w-60'}`}
        data-testid="app-shell-sidebar"
      >
        <SidebarContent items={navItems} location={location} collapsed={collapsed} />
        <div className="p-3 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent z-20"
          data-testid="app-shell-sidebar-toggle"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-30">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <SidebarContent items={navItems} location={location} collapsed={false} onNavigate={() => setMobileOpen(false)} />

              {/* Account Details & Sign Out */}
              <div className="mt-auto border-t">
                {/* Account Info */}
                <div className="p-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.username || user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="p-3">
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="ghost" size="icon" className="relative" data-testid="app-shell-notifications-button">
            <Bell className="w-4 h-4" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

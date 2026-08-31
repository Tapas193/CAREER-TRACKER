import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FileText,
  FolderKanban,
  GitBranch,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Medal,
  Menu,
  MessagesSquare,
  Search,
  Target,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ActionMenu, Avatar, Breadcrumbs, Button } from '../components/ui';
import { cn } from '../utils/cn';
import type { AuthUser } from '../types';

type Panel = 'admin' | 'student' | 'placement' | 'alumni';

type NavItem = { to: string; label: string; icon: typeof Users };
type NavGroup = { title: string; items: NavItem[] };

function panelFor(user: AuthUser): Panel {
  if (user.role === 'ADMIN') return 'admin';
  if (user.role === 'PLACEMENT_HEAD') return 'placement';
  if (user.role === 'STUDENT' && user.currentStatus === 'ALUMNI') return 'alumni';
  return 'student';
}

const NAV: Record<Panel, NavGroup[]> = {
  admin: [
    { title: 'Main', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      title: 'Administration',
      items: [
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/users', label: 'Users', icon: User },
        { to: '/admin/courses', label: 'Courses', icon: BookOpen },
        { to: '/admin/skills', label: 'Skill Catalogue', icon: Award },
      ],
    },
    {
      title: 'Placement',
      items: [{ to: '/admin/placements', label: 'Placements', icon: Briefcase }],
    },
    {
      title: 'Analytics',
      items: [{ to: '/admin/reports', label: 'Reports', icon: BarChart3 }],
    },
  ],
  student: [
    {
      title: 'Main',
      items: [
        { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/student/profile', label: 'Profile', icon: User },
      ],
    },
    {
      title: 'Academics',
      items: [
        { to: '/student/academics', label: 'Academics', icon: BookOpen },
        { to: '/student/backlogs', label: 'Backlogs', icon: ListChecks },
        { to: '/student/attendance', label: 'Attendance', icon: ClipboardList },
        { to: '/student/academic-progress', label: 'Academic Progress', icon: BarChart3 },
      ],
    },
    {
      title: 'Career',
      items: [
        { to: '/student/skills', label: 'Skills', icon: Award },
        { to: '/student/projects', label: 'Projects', icon: FolderKanban },
        { to: '/student/internships', label: 'Internships', icon: Building2 },
        { to: '/student/certifications', label: 'Certifications', icon: GraduationCap },
        { to: '/student/achievements', label: 'Achievements', icon: Medal },
        { to: '/student/career-goals', label: 'Career Goals', icon: Target },
        { to: '/student/career-profile', label: 'Career Profile', icon: ClipboardList },
        { to: '/student/resume', label: 'Resume Center', icon: FileText },
      ],
    },
    {
      title: 'Placement',
      items: [
        { to: '/student/placements', label: 'Placements', icon: Briefcase },
        { to: '/student/tracker', label: 'Placement Tracker', icon: ListChecks },
        { to: '/student/placement-preparation', label: 'Preparation', icon: Target },
        { to: '/student/timeline', label: 'Career Timeline', icon: GraduationCap },
      ],
    },
    {
      title: 'Documents',
      items: [{ to: '/student/documents', label: 'Document Center', icon: FolderKanban }],
    },
    {
      title: 'System',
      items: [
        { to: '/student/notifications', label: 'Notifications', icon: Bell },
        { to: '/student/support', label: 'Help & Support', icon: HelpCircle },
      ],
    },
  ],
  placement: [
    { title: 'Main', items: [{ to: '/placement', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      title: 'Placement',
      items: [
        { to: '/placement/drives', label: 'Placement Drives', icon: Building2 },
        { to: '/placement/drive-detail', label: 'Drive Detail', icon: Briefcase },
        { to: '/placement/pipeline', label: 'Pipeline', icon: GitBranch },
        { to: '/placement/student-profiles', label: 'Student Profiles', icon: Users },
        { to: '/placement/placements', label: 'Placements', icon: ListChecks },
        { to: '/placement/reports', label: 'Reports', icon: BarChart3 },
      ],
    },
  ],
  alumni: [
    { title: 'Main', items: [{ to: '/alumni', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      title: 'Alumni',
      items: [
        { to: '/alumni/profile', label: 'Profile', icon: User },
        { to: '/alumni/career', label: 'Career History', icon: Briefcase },
        { to: '/alumni/feedback', label: 'Feedback', icon: MessagesSquare },
      ],
    },
  ],
};

const CRUMBS: Record<string, { label: string; to?: string }[]> = {
  '/admin': [{ label: 'Admin', to: '/admin' }, { label: 'Dashboard' }],
  '/admin/students': [{ label: 'Admin', to: '/admin' }, { label: 'Students', to: '/admin/students' }],
  '/admin/students/detail': [{ label: 'Admin', to: '/admin' }, { label: 'Students', to: '/admin/students' }, { label: 'Student Details' }],
  '/admin/users': [{ label: 'Admin', to: '/admin' }, { label: 'Users' }],
  '/admin/courses': [{ label: 'Admin', to: '/admin' }, { label: 'Courses' }],
  '/admin/skills': [{ label: 'Admin', to: '/admin' }, { label: 'Skill Catalogue' }],
  '/admin/placements': [{ label: 'Admin', to: '/admin' }, { label: 'Placements' }],
  '/admin/reports': [{ label: 'Admin', to: '/admin' }, { label: 'Reports' }],
  '/placement': [{ label: 'Placement', to: '/placement' }, { label: 'Dashboard' }],
  '/placement/drives': [{ label: 'Placement', to: '/placement' }, { label: 'Placement Drives' }],
  '/placement/drive-detail': [{ label: 'Placement', to: '/placement' }, { label: 'Drive Detail' }],
  '/placement/pipeline': [{ label: 'Placement', to: '/placement' }, { label: 'Pipeline' }],
  '/placement/student-profiles': [{ label: 'Placement', to: '/placement' }, { label: 'Student Profiles' }],
  '/placement/placements': [{ label: 'Placement', to: '/placement' }, { label: 'Placements' }],
  '/placement/reports': [{ label: 'Placement', to: '/placement' }, { label: 'Reports' }],
  '/student': [{ label: 'Student', to: '/student' }, { label: 'Dashboard' }],
  '/student/profile': [{ label: 'Student', to: '/student' }, { label: 'Profile' }],
  '/student/academics': [{ label: 'Student', to: '/student' }, { label: 'Academics' }],
  '/student/backlogs': [{ label: 'Student', to: '/student' }, { label: 'Backlogs' }],
  '/student/attendance': [{ label: 'Student', to: '/student' }, { label: 'Attendance & Engagement' }],
  '/student/academic-progress': [{ label: 'Student', to: '/student' }, { label: 'Academic Progress' }],
  '/student/skills': [{ label: 'Student', to: '/student' }, { label: 'Skills' }],
  '/student/certifications': [{ label: 'Student', to: '/student' }, { label: 'Certifications' }],
  '/student/projects': [{ label: 'Student', to: '/student' }, { label: 'Projects' }],
  '/student/internships': [{ label: 'Student', to: '/student' }, { label: 'Internships' }],
  '/student/achievements': [{ label: 'Student', to: '/student' }, { label: 'Achievements' }],
  '/student/career-goals': [{ label: 'Student', to: '/student' }, { label: 'Career Goals' }],
  '/student/career-profile': [{ label: 'Student', to: '/student' }, { label: 'Career Profile' }],
  '/student/resume': [{ label: 'Student', to: '/student' }, { label: 'Resume Center' }],
  '/student/placements': [{ label: 'Student', to: '/student' }, { label: 'Placements' }],
  '/student/tracker': [{ label: 'Student', to: '/student' }, { label: 'Placement Tracker' }],
  '/student/placement-preparation': [{ label: 'Student', to: '/student' }, { label: 'Placement Preparation' }],
  '/student/documents': [{ label: 'Student', to: '/student' }, { label: 'Document Center' }],
  '/student/timeline': [{ label: 'Student', to: '/student' }, { label: 'Career Timeline' }],
  '/student/notifications': [{ label: 'Student', to: '/student' }, { label: 'Notifications' }],
  '/student/support': [{ label: 'Student', to: '/student' }, { label: 'Help & Support' }],
  '/alumni': [{ label: 'Alumni', to: '/alumni' }, { label: 'Dashboard' }],
  '/alumni/profile': [{ label: 'Alumni', to: '/alumni' }, { label: 'Profile' }],
  '/alumni/career': [{ label: 'Alumni', to: '/alumni' }, { label: 'Career History' }],
  '/alumni/feedback': [{ label: 'Alumni', to: '/alumni' }, { label: 'Feedback' }],
};

function crumbsFor(pathname: string) {
  if (pathname.startsWith('/admin/students/')) return CRUMBS['/admin/students/detail'];
  const match = CRUMBS[pathname];
  return match ?? [{ label: 'Career Track' }];
}

function roleLabel(user: AuthUser): string {
  if (user.role === 'ADMIN') return 'Administrator';
  if (user.role === 'PLACEMENT_HEAD') return 'Placement Head';
  if (user.currentStatus === 'ALUMNI') return 'Alumni';
  return 'Student';
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const panel = user ? panelFor(user) : ('student' as Panel);
  const crumbs = useMemo(() => crumbsFor(location.pathname), [location.pathname]);
  const name = user?.email ?? 'User';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'
        )}
        aria-label="Sidebar"
      >
        <div className={cn('flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4', collapsed && 'justify-center px-0')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">Career Track</p>
              <p className="truncate text-[10px] text-white/50">College ERP</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {NAV[panel].map((group) => (
            <div key={group.title} className="mb-1">
              {!collapsed && (
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">{group.title}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} {...item} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2.5 rounded-md px-2 py-1.5">
              <Avatar name={name} className="bg-white/10 text-white" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{name}</p>
                <p className="truncate text-[10px] text-white/50">{roleLabel(user!)}</p>
              </div>
            </div>
          )}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4 shrink-0" /> : <ChevronsLeft className="h-4 w-4 shrink-0" />}
              {!collapsed && <span>Collapse</span>}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 md:px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden min-w-0 sm:block">
            <Breadcrumbs items={crumbs} />
          </div>
          <h2 className="truncate text-sm font-semibold text-foreground sm:hidden">{crumbs[crumbs.length - 1]?.label}</h2>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {panel === 'admin' && <GlobalSearch onSearch={(q) => navigate(`/admin/students?search=${encodeURIComponent(q)}`)} />}
            <ActionMenu
              a11yLabel="Notifications"
              trigger={<Bell className="h-4 w-4" />}
              items={[{ label: 'No new notifications', disabled: true }]}
            />
            <div className="ml-1 flex shrink-0 items-center gap-2 border-l border-border pl-2">
              <ActionMenu
                a11yLabel="Account menu"
                variant="ghost"
                size="default"
                buttonClassName="gap-2 px-1"
                trigger={
                  <span className="flex items-center gap-2">
                    <Avatar name={name} />
                    <span className="hidden text-left md:block">
                      <span className="block max-w-44 truncate text-xs font-medium text-foreground">{name}</span>
                      <span className="block text-[10px] text-muted-foreground">{roleLabel(user!)}</span>
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
                  </span>
                }
                items={[
                  { label: name, disabled: true },
                  { label: roleLabel(user!), disabled: true },
                  { divider: true },
                  ...(panel === 'student' || panel === 'alumni'
                    ? [{ label: 'My Profile', icon: <User className="h-4 w-4" />, onClick: () => navigate(panel === 'alumni' ? '/alumni/profile' : '/student/profile') }]
                    : []),
                  { label: 'Logout', icon: <LogOut className="h-4 w-4" />, destructive: true, onClick: handleLogout },
                ]}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
}: NavItem & { collapsed: boolean; onNavigate: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive ? 'bg-primary text-primary-foreground' : 'text-white/70 hover:bg-white/10 hover:text-white'
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function GlobalSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSearch(value.trim());
      }}
      className="hidden md:block"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search students…"
          aria-label="Search students"
          className="field-input w-56 rounded-md pl-8"
        />
      </div>
    </form>
  );
}
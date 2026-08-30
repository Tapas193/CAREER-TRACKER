import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, CardHeader, CardContent, Loading } from '../../components/ui';
import { GraduationCap, Users, Briefcase, Activity, Award, BookOpen, Building2, UsersRound } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminDashboardData {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  alumniCount: number;
  placementRate: number;
  placedCount: number;
  internshipCount: number;
  certificationCount: number;
  activeDrives: number;
  byDepartment: { department: string; studentCount: number }[];
}

export default function AdminDashboard() {
  const { data, isLoading, refetch, isError } = useApi<AdminDashboardData>(['admin-dashboard'], '/api/dashboard');

  if (isLoading) return <Loading label="Loading dashboard…" />;
  if (!data) return <DashboardError onRetry={refetch} failed={isError} />;

  const deptData = (data.byDepartment ?? []).map((d) => ({ name: d.department, Students: d.studentCount }));

  return (
    <div>
      <PageHeader
        title="Institutional Dashboard"
        subtitle="College-wide career lifecycle overview"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Students" value={data.activeStudents} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Graduated" value={data.graduatedStudents} sub={`${data.alumniCount} alumni`} icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="Placement Rate" value={`${data.placementRate}%`} sub={`${data.placedCount} placed`} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Internships" value={data.internshipCount} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Certifications" value={data.certificationCount} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Active Drives" value={data.activeDrives} icon={<UsersRound className="h-4 w-4" />} />
        <StatCard label="Departments" value={data.byDepartment.length} icon={<BookOpen className="h-4 w-4" />} />
      </div>

      <Card className="mt-5">
        <CardHeader title="Students by Department" subtitle="Distribution across offering courses" />
        <CardContent>
          {deptData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No department data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Bar dataKey="Students" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardError({ onRetry, failed }: { onRetry: () => void; failed?: boolean }) {
  if (failed) {
    return (
      <div>
        <PageHeader title="Institutional Dashboard" />
        <Card className="flex flex-col items-center justify-center py-14 text-center">
          <p className="text-sm text-muted-foreground">Unable to load dashboard data.</p>
          <button onClick={onRetry} className="mt-3 text-sm font-medium text-primary hover:underline">
            Retry
          </button>
        </Card>
      </div>
    );
  }
  return null;
}
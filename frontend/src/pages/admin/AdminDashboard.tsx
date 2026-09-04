import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, Loading } from '../../components/ui';
import { GraduationCap, Users, Briefcase, Activity, Award, BookOpen, Building2, UsersRound } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CHART_COLORS, chartAxis, chartGrid, ChartCard, ChartTooltip, ChartEmpty } from '../../components/charts';

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
        <ChartCard
          title="Students by Department"
          description="Distribution across offering courses"
          empty={<ChartEmpty title="No department data" message="Department enrolment data will appear here once courses are populated." />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} vertical={false} />
              <XAxis dataKey="name" tick={chartAxis.tick} axisLine={{ stroke: chartGrid.stroke }} tickLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={chartAxis.tick} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar dataKey="Students" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
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
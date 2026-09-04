import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, CardHeader, CardContent, Loading } from '../../components/ui';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, UserCheck, Briefcase, TrendingUp, Banknote, Trophy, Activity, CalendarDays, GitBranch, LayoutGrid } from 'lucide-react';
import { CHART_COLORS, ChartCard, ChartTooltip, ChartEmpty } from '../../components/charts';

interface PlacementDashboardData {
  eligibleCount: number;
  participatingCount: number;
  placedCount: number;
  onPlacementCount: number;
  placementRate: number;
  avgPackage: number;
  highestPackage: number;
  byStatus: Record<string, number>;
  activeDrives: { companyName: string; jobRole: string; count: number }[];
}

export default function PlacementDashboard() {
  const { data, isLoading } = useApi<PlacementDashboardData>(['placement-dashboard'], '/api/dashboard');
  if (isLoading || !data) return <Loading label="Loading dashboard…" />;

  const pieData = Object.entries(data.byStatus ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Placement Dashboard" subtitle="Placement cell analytics" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link to="/placement/drives" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"><CalendarDays className="h-3.5 w-3.5" />Drives</Link>
        <Link to="/placement/drive-detail" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"><Briefcase className="h-3.5 w-3.5" />Drive Detail</Link>
        <Link to="/placement/pipeline" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"><GitBranch className="h-3.5 w-3.5" />Pipeline</Link>
        <Link to="/placement/student-profiles" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"><LayoutGrid className="h-3.5 w-3.5" />Student Profiles</Link>
        <Link to="/placement/reports" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"><TrendingUp className="h-3.5 w-3.5" />Reports</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Eligible" value={data.eligibleCount} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Participating" value={data.participatingCount} icon={<UserCheck className="h-4 w-4" />} />
        <StatCard label="Placed" value={data.placedCount} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Placement Rate" value={`${data.placementRate}%`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Avg Package" value={`₹${data.avgPackage} LPA`} icon={<Banknote className="h-4 w-4" />} />
        <StatCard label="Highest Package" value={`₹${data.highestPackage} LPA`} icon={<Trophy className="h-4 w-4" />} />
        <StatCard label="On Placement" value={data.onPlacementCount} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Active Drives" value={data.activeDrives?.length ?? 0} icon={<CalendarDays className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Placements by Status"
          description="Distribution of students by current placement status"
          empty={<ChartEmpty title="No placement data" message="Placement status will appear here once students are tracked." />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={92} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="hsl(var(--card))" />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader title="Active Drives" subtitle="Grouped by company, role and date" />
          <CardContent>
            {!data.activeDrives?.length ? (
              <div className="flex h-64 items-center justify-center sm:h-72">
                <ChartEmpty title="No active drives" message="Create a placement drive to see it listed here." />
              </div>
            ) : (
              <ul className="max-h-[18rem] space-y-2 overflow-y-auto">
                {data.activeDrives.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{d.companyName} — {d.jobRole}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{d.count} participant(s)</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
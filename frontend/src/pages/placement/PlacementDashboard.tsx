import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, CardHeader, CardContent, Loading } from '../../components/ui';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, UserCheck, Briefcase, TrendingUp, Banknote, Trophy, Activity, CalendarDays } from 'lucide-react';

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

const COLORS = ['#64748b', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'];

export default function PlacementDashboard() {
  const { data, isLoading } = useApi<PlacementDashboardData>(['placement-dashboard'], '/api/dashboard');
  if (isLoading || !data) return <Loading label="Loading dashboard…" />;

  const pieData = Object.entries(data.byStatus ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Placement Dashboard" subtitle="Placement cell analytics" />

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
        <Card>
          <CardHeader title="Placements by Status" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Active Drives" subtitle="Grouped by company, role and date" />
          <CardContent>
            {!data.activeDrives?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No active drives right now.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.activeDrives.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
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
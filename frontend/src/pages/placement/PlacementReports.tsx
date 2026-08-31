import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Loading, EmptyState } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { asArray } from '../../utils/cn';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#3b82f6', IN_PROGRESS: '#f59e0b', SELECTED: '#22c55e', OFFER_RECEIVED: '#16a34a', REJECTED: '#ef4444',
};

export default function PlacementReports() {
  const { data, isLoading } = useApi<any>(['placement-list'], '/api/placements');
  const items = asArray<any>(data?.items ?? data);

  const { byStatus, byCompany, total } = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byCompany: Record<string, number> = {};
    for (const p of items) {
      byStatus[p.placementStatus] = (byStatus[p.placementStatus] ?? 0) + 1;
      byCompany[p.companyName] = (byCompany[p.companyName] ?? 0) + 1;
    }
    return { byStatus, byCompany, total: items.length };
  }, [items]);

  if (isLoading) return <Loading label="Preparing reports…" />;

  if (total === 0) {
    return (
      <div>
        <PageHeader title="Placement Reports" subtitle="Analytics derived from placement records" />
        <Card><EmptyState title="No data yet" message="Add placement records to generate reports." /></Card>
      </div>
    );
  }

  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  const companyData = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  const totalRounds = items.reduce((acc, p) => acc + asArray(p.rounds).length, 0);
  const offers = items.filter((p) => p.offerLetter).length;

  return (
    <div>
      <PageHeader title="Placement Reports" subtitle={`Analytics across ${total} placement record(s), ${totalRounds} round(s), ${offers} offer(s)`} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Placements by Status" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.name] ?? '#94a3b8'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Top Companies by Placement Count" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companyData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Status Summary" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Count</th>
                  <th className="px-4 py-2.5 font-medium text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {statusData.map((s) => (
                  <tr key={s.name}>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] ?? '#94a3b8' }} />
                        <span className="font-medium">{s.name.replace(/_/g, ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{s.value}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{total ? Math.round((s.value / total) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

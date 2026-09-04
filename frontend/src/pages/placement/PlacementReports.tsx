import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Loading, EmptyState } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { asArray } from '../../utils/cn';
import { CHART_COLORS, chartAxis, chartGrid, ChartCard, ChartTooltip, ChartEmpty } from '../../components/charts';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: CHART_COLORS[0], IN_PROGRESS: CHART_COLORS[3], SELECTED: CHART_COLORS[1], OFFER_RECEIVED: CHART_COLORS[1], REJECTED: CHART_COLORS[4],
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
        <ChartCard
          title="Placements by Status"
          description="Share of placement records by current status"
        >
          {statusData.length === 0 ? <ChartEmpty title="No placement data" message="Add placement records to see the status breakdown." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={92} paddingAngle={2}>
                  {statusData.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.name] ?? CHART_COLORS[i % CHART_COLORS.length]} stroke="hsl(var(--card))" />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Top Companies by Placement Count"
          description="Companies ranked by number of placement records"
        >
          {companyData.length === 0 ? <ChartEmpty title="No company data" message="Add placement records to see company trends." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
                <XAxis type="number" tick={chartAxis.tick} stroke={chartGrid.stroke} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={chartAxis.tick} stroke="transparent" />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
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

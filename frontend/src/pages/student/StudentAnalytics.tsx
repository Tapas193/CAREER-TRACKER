import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Loading, EmptyState } from '../../components/ui';
import { ScoreBar } from '../../components/intelligence';
import { asArray, formatLpa } from '../../utils/cn';
import { Briefcase, Trophy, Banknote, Activity } from 'lucide-react';

const BAR: Record<string, string> = {
  APPLIED: 'bg-blue-600',
  SHORTLISTED: 'bg-sky-500',
  INTERVIEW: 'bg-purple-600',
  OFFER_RECEIVED: 'bg-green-600',
  SELECTED: 'bg-green-600',
  REJECTED: 'bg-red-500',
  WITHDRAWN: 'bg-slate-400',
};

export default function StudentAnalytics() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  const stats = useMemo(() => {
    if (!me) return null;
    const placements = asArray<any>(me.placements);
    const order = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER_RECEIVED', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
    const statusCounts = order.reduce<Record<string, number>>((acc, s) => {
      acc[s] = placements.filter((p) => p.placementStatus === s).length;
      return acc;
    }, {});
    const packages = placements
      .map((p) => Number(p.packageLpa))
      .filter((n) => !Number.isNaN(n) && n > 0);
    const maxPkg = packages.length ? Math.max(...packages) : null;
    const minPkg = packages.length ? Math.min(...packages) : null;
    const avgPkg = packages.length ? packages.reduce((a, b) => a + b, 0) / packages.length : null;
    const hasOffer = placements.some((p) => p.offerLetter || p.placementStatus === 'OFFER_RECEIVED' || p.placementStatus === 'SELECTED');
    const rounds = placements.reduce((sum, p) => sum + asArray<any>(p.rounds).length, 0);
    const roundsPassed = placements.reduce(
      (sum, p) => sum + asArray<any>(p.rounds).filter((r) => r.result === 'PASS' || r.roundResult === 'PASS' || r.result === 'SELECTED').length,
      0
    );
    return {
      total: placements.length,
      statusCounts,
      maxPkg,
      minPkg,
      avgPkg,
      hasOffer,
      rounds,
      roundsPassed,
      order,
    };
  }, [me]);

  if (isLoading || !stats) return <Loading label="Computing placement analytics…" />;

  const active = stats.total - (stats.statusCounts.REJECTED || 0) - (stats.statusCounts.WITHDRAWN || 0);

  return (
    <div>
      <PageHeader title="Placement Analytics" subtitle="Derived analytics from your recorded placement activity" />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={stats.total} sub={`${active} still active`} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Offer received" value={stats.hasOffer ? 'Yes' : 'Not yet'} sub="Tracking offer records" icon={<Trophy className="h-4 w-4" />} />
        <StatCard label="Avg package" value={stats.avgPkg != null ? `${formatLpa(stats.avgPkg)} LPA` : '—'} sub={stats.maxPkg != null ? `Peak ${formatLpa(stats.maxPkg)} LPA` : 'No packages yet'} icon={<Banknote className="h-4 w-4" />} />
        <StatCard label="Rounds completed" value={stats.rounds} sub={`${stats.roundsPassed} passed`} icon={<Activity className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Status funnel" subtitle="Where each application stands" />
          <CardContent>
            {stats.total ? (
              <ul className="space-y-3">
                {stats.order.map((s) => {
                  const count = stats.statusCounts[s] || 0;
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <li key={s}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{s.replace(/_/g, ' ')}</span>
                        <span className="flex items-center gap-2">
                          <span className="tabular-nums text-muted-foreground">{count}</span>
                          <Badge tone="slate">{pct}%</Badge>
                        </span>
                      </div>
                      <ScoreBar value={pct} color={BAR[s] || 'bg-blue-600'} showValue={false} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No placement activity yet" message="Applications you record will appear in your placement analytics." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Package summary" subtitle="Across offers and placements with packages" />
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{stats.avgPkg != null ? formatLpa(stats.avgPkg) : '—'}</p>
                  <p className="text-xs text-muted-foreground">Average (LPA)</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{stats.minPkg != null ? formatLpa(stats.minPkg) : '—'}</p>
                  <p className="text-xs text-muted-foreground">Minimum (LPA)</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{stats.maxPkg != null ? formatLpa(stats.maxPkg) : '—'}</p>
                  <p className="text-xs text-muted-foreground">Peak (LPA)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Key insight" />
            <CardContent>
              {stats.total ? (
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-600">•</span>You've recorded {stats.total} application(s) across {stats.order.filter((s) => (stats.statusCounts[s] || 0) > 0).length} stage(s).</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-blue-600">•</span>Progress through rounds on {stats.rounds} round(s); keep tracking to spot patterns.</li>
                  {stats.hasOffer && <li className="flex items-start gap-2"><span className="mt-0.5 text-green-600">✓</span>You have an offer on record — congratulations!</li>}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Record placement applications to unlock insights.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Loading, EmptyState } from '../../components/ui';
import { ScoreRing, ScoreBar, LocalNote } from '../../components/intelligence';
import { assessRisk, RiskLevel } from '../../utils/intelligence/risk';
import { ShieldAlert, HeartHandshake, Lightbulb, AlertTriangle } from 'lucide-react';

const LEVEL_STYLE: Record<RiskLevel, 'green' | 'amber' | 'red'> = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red' };
const BAR_COLOR: Record<RiskLevel, string> = { LOW: 'bg-green-600', MEDIUM: 'bg-amber-500', HIGH: 'bg-red-500' };

export default function StudentRiskOverview() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  const report = useMemo(() => (me ? assessRisk(me) : null), [me]);

  if (isLoading || !report) return <Loading label="Assessing risk indicators…" />;

  return (
    <div>
      <PageHeader title="At-Risk Overview" subtitle="A transparency-focused self-assessment from measurable signals in your real data" />

      <div className="mb-5 flex flex-col items-center gap-6 lg:flex-row">
        <Card className="flex flex-col items-center justify-center py-8">
          <ScoreRing value={report.score} label="risk score" color={LEVEL_STYLE[report.level] as any} size={150} thickness={12} />
          <div className="mt-3">
            <Badge tone={LEVEL_STYLE[report.level]}>Risk: {report.level}</Badge>
          </div>
          <p className="mt-2 max-w-xs text-center text-xs text-muted-foreground">
            Higher score = higher at-risk signal. Every contributing factor is listed below; none are hidden.
          </p>
        </Card>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <StatCard label="Risk level" value={report.level} sub="Overall assessment" icon={<ShieldAlert className="h-4 w-4" />} />
          <StatCard label="Contributing factors" value={report.reasons.length} sub="Transparent reasons" icon={<AlertTriangle className="h-4 w-4" />} />
          <StatCard label="Suggested supports" value={report.interventions.length} sub="Recommended actions" icon={<Lightbulb className="h-4 w-4" />} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Why this assessment" subtitle="Measurable factors behind the score" />
          <CardContent>
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">At-risk signal</span>
                <Badge tone={LEVEL_STYLE[report.level]}>{report.score}%</Badge>
              </div>
              <ScoreBar value={report.score} color={BAR_COLOR[report.level]} showValue={false} />
            </div>
            {report.reasons.length ? (
              <ul className="space-y-2">
                {report.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-0.5 text-amber-600">⚠</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No risk factors" message="No measurable risk signals found." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recommended support" subtitle="Proactive interventions" action={<HeartHandshake className="h-4 w-4 text-primary" />} />
          <CardContent>
            <ul className="space-y-2">
              {report.interventions.map((iv, i) => (
                <li key={i} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{i + 1}</span>
                  <span>{iv}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <LocalNote className="mt-4" label="This is a transparency tool for your own planning; it is not a student-support diagnosis delivered to the placement office." />
    </div>
  );
}

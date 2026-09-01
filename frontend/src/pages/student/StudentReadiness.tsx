import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, EmptyState, Loading } from '../../components/ui';
import { ScoreRing, ScoreBar, LocalNote } from '../../components/intelligence';
import { computeReadiness, loadReadinessActivity } from '../../utils/intelligence/readiness';
import { TrendingUp, AlertTriangle, Sparkles, Target } from 'lucide-react';
import { useMemo } from 'react';

export default function StudentReadiness() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  const report = useMemo(() => {
    if (!me) return null;
    return computeReadiness(me, loadReadinessActivity());
  }, [me]);

  if (isLoading || !report) return <Loading label="Computing career readiness…" />;

  const toneFor = (s: number): 'green' | 'blue' | 'amber' | 'red' => (s >= 70 ? 'green' : s >= 50 ? 'blue' : s >= 30 ? 'amber' : 'red');
  const barColor = (s: number) => (s >= 70 ? 'bg-green-600' : s >= 50 ? 'bg-blue-600' : s >= 30 ? 'bg-amber-500' : 'bg-red-500');

  return (
    <div>
      <PageHeader title="Career Readiness" subtitle="An explainable, weighted score computed from your actual academic and career data" />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center py-8">
          <ScoreRing value={report.overall} label="readiness" color={toneFor(report.overall) as any} size={150} thickness={12} />
          <div className="mt-3">
            <Badge tone={toneFor(report.overall)}>{report.level}</Badge>
          </div>
        </Card>

        <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
          <StatCard label="Strengths" value={report.strengths.length} sub="Ready dimensions" icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Priority areas" value={report.weaknesses.length} sub="Needs improvement" icon={<AlertTriangle className="h-4 w-4" />} />
          <StatCard label="History points" value={report.history.length} sub="Semester snapshots" icon={<Target className="h-4 w-4" />} />
          <StatCard label="Overall" value={`${Math.round(report.overall)}%`} sub={report.level} icon={<Sparkles className="h-4 w-4" />} />
        </div>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Readiness breakdown" subtitle="Weighted dimensions driving your score" />
          <CardContent>
            <ul className="space-y-3">
              {report.categories.map((c) => (
                <li key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">weight {Math.round(c.weight * 100)}%</span>
                      <Badge tone={toneFor(c.score)}>{c.score}%</Badge>
                    </span>
                  </div>
                  <ScoreBar value={c.score} color={barColor(c.score)} showValue={false} />
                  <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                </li>
              ))}
            </ul>
            <LocalNote className="mt-4" label="Interview prep, roadmap and learning weigh in from activity saved in your browser only." />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Strengths" />
            <CardContent>
              {report.strengths.length ? (
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-0.5 text-green-600">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No strengths yet" message="Add career content to establish strengths." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Recommended next steps" />
            <CardContent>
              <ol className="space-y-2">
                {report.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{i + 1}</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {report.history.length > 1 && (
            <Card>
              <CardHeader title="Readiness over time" subtitle="Reconstructed from your semester academic records" />
              <CardContent>
                <ul className="space-y-2">
                  {report.history.map((h) => (
                    <li key={h.label} className="flex items-center gap-2 text-sm">
                      <span className="w-14 shrink-0 text-muted-foreground">{h.label}</span>
                      <ScoreBar value={h.score} color={barColor(h.score)} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

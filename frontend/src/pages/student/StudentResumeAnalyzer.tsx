import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, EmptyState, Loading } from '../../components/ui';
import { ScoreRing, ScoreBar, LocalNote } from '../../components/intelligence';
import { analyzeResume } from '../../utils/intelligence/resume';
import { FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { formatDate } from '../../utils/cn';

export default function StudentResumeAnalyzer() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  const analysis = useMemo(() => (me ? analyzeResume(me) : null), [me]);

  if (isLoading || !analysis) return <Loading label="Analyzing your resume profile…" />;

  const toneFor = (s: number): 'green' | 'blue' | 'amber' | 'red' => (s >= 70 ? 'green' : s >= 50 ? 'blue' : s >= 30 ? 'amber' : 'red');
  const barColor = (s: number) => (s >= 70 ? 'bg-green-600' : s >= 50 ? 'bg-blue-600' : s >= 30 ? 'bg-amber-500' : 'bg-red-500');

  return (
    <div>
      <PageHeader title="Resume Analyzer" subtitle="ATS-style review of your career profile" action={analysis.updatedAt ? <Badge tone="slate"><Clock className="mr-1 h-3 w-3" />Updated {formatDate(analysis.updatedAt)}</Badge> : undefined} />

      <div className="mb-5 flex flex-col items-center gap-6 lg:flex-row lg:items-stretch">
        <Card className="flex flex-1 flex-col items-center justify-center py-8">
          <ScoreRing value={analysis.overall} label="resume score" color={toneFor(analysis.overall) as any} size={150} thickness={12} />
          <div className="mt-3">
            <Badge tone={toneFor(analysis.overall)}>{analysis.level}</Badge>
          </div>
        </Card>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <StatCard label="Dimensions" value={analysis.dimensions.length} sub="Scored areas" icon={<FileText className="h-4 w-4" />} />
          <StatCard label="Strengths" value={analysis.strengths.filter((s) => s !== 'Profile is taking shape — keep adding career content.').length} sub="Ready dimensions" icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Gaps" value={analysis.gaps.filter((g) => g !== 'None — your profile looks well-rounded.').length} sub="Needs attention" icon={<AlertCircle className="h-4 w-4" />} />
          <StatCard label="Tips" value={analysis.tips.length} sub="Suggested edits" icon={<AlertCircle className="h-4 w-4" />} />
        </div>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Section breakdown" subtitle="How each resume section scores" />
          <CardContent>
            <ul className="space-y-3">
              {analysis.dimensions.map((d) => (
                <li key={d.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{d.label}</span>
                    <Badge tone={toneFor(d.score)}>{d.score}%</Badge>
                  </div>
                  <ScoreBar value={d.score} color={barColor(d.score)} showValue={false} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.presentCount}/{d.targetCount} recorded{d.suggestion ? ` — ${d.suggestion}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Strengths" />
            <CardContent>
              {analysis.strengths.length ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-0.5 text-green-600">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No strengths yet" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Improvement tips" />
            <CardContent>
              {analysis.tips.length ? (
                <ol className="space-y-2">
                  {analysis.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">{i + 1}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState title="No tips" message="Your profile looks well-rounded." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LocalNote label="Analysis is derived from your recorded career profile. Uploads are handled in Resume Center." />
    </div>
  );
}

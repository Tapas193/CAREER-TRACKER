import { useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Loading, Select } from '../../components/ui';
import { ScoreRing, ScoreBar, LocalNote } from '../../components/intelligence';
import { analyzeSkillGap } from '../../utils/intelligence/skillGap';
import { defaultRole, TARGET_ROLES } from '../../utils/intelligence/roles';
import { CheckCircle2, XCircle, Sparkles, Layers } from 'lucide-react';

export default function StudentSkillGap() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');
  const [roleId, setRoleId] = useState('swe');

  const result = useMemo(() => (me ? analyzeSkillGap(me.skills, defaultRole(roleId)) : null), [me, roleId]);

  if (isLoading || !result) return <Loading label="Analyzing skill gap…" />;

  const toneFor = (s: number): 'green' | 'blue' | 'amber' | 'red' => (s >= 70 ? 'green' : s >= 50 ? 'blue' : s >= 30 ? 'amber' : 'red');
  const barColor = (s: number) => (s >= 70 ? 'bg-green-600' : s >= 50 ? 'bg-blue-600' : s >= 30 ? 'bg-amber-500' : 'bg-red-500');

  return (
    <div>
      <PageHeader title="Skill Gap Analysis" subtitle="See how your skills match a target role's requirements" />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Compare against</p>
          <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-72" aria-label="Target role">
            {TARGET_ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <div className="mb-5 flex flex-col items-center gap-6 lg:flex-row">
        <Card className="flex flex-col items-center justify-center py-8">
          <ScoreRing value={result.overall} label="match" color={toneFor(result.overall) as any} size={140} thickness={12} />
          <div className="mt-3"><Badge tone={toneFor(result.overall)}>{result.overall >= 70 ? 'Good fit' : result.overall >= 50 ? 'Moderate' : 'Work needed'}</Badge></div>
        </Card>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <StatCard label="Your skills" value={result.studentSkills.length} sub="On profile" icon={<Layers className="h-4 w-4" />} />
          <StatCard label="Required met" value={result.presentRequired.length} sub={`of ${result.role.requiredSkills.length} required`} icon={<CheckCircle2 className="h-4 w-4" />} />
          <StatCard label="Required missing" value={result.missingRequired.length} sub="To prioritize" icon={<XCircle className="h-4 w-4" />} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Required skills" subtitle="Prioritize these for your target role" />
          <CardContent>
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Required coverage</span>
                <Badge tone={toneFor(result.requiredCoverage)}>{result.requiredCoverage}%</Badge>
              </div>
              <ScoreBar value={result.requiredCoverage} color={barColor(result.requiredCoverage)} showValue={false} />
            </div>
            <ul className="space-y-2">
              {result.role.requiredSkills.map((s) => {
                const has = result.presentRequired.includes(s);
                return (
                  <li key={s} className="flex items-center justify-between rounded-md border border-border p-2.5">
                    <span className="text-sm font-medium text-foreground">{s}</span>
                    {has ? (
                      <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Present</span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-red-500"><XCircle className="h-4 w-4" />Missing</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Preferred skills" subtitle="Nice-to-have additions that strengthen fit" />
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.role.preferredSkills.map((s) => {
                  const has = result.studentSkills.some((x) => x.toLowerCase() === s.toLowerCase());
                  return (
                    <Badge key={s} tone={has ? 'green' : 'slate'}>
                      {has ? '✓ ' : ''}{s}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Recommendations" />
            <CardContent>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <LocalNote className="mt-4" label="Coverage is computed from the skills recorded on your profile." />
    </div>
  );
}

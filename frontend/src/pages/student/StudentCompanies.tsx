import { useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Loading, EmptyState, Select } from '../../components/ui';
import { ScoreBar, LocalNote } from '../../components/intelligence';
import { computeCompanyRecommendations } from '../../utils/intelligence/companies';
import { computeReadiness } from '../../utils/intelligence/readiness';
import { defaultRole, TARGET_ROLES } from '../../utils/intelligence/roles';
import { Building2, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatLpa } from '../../utils/cn';

export default function StudentCompanies() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');
  const [roleId, setRoleId] = useState('swe');

  const result = useMemo(() => {
    if (!me) return null;
    const role = defaultRole(roleId);
    const readiness = computeReadiness(me).overall;
    return computeCompanyRecommendations(me, role, readiness);
  }, [me, roleId]);

  if (isLoading || !result) return <Loading label="Loading recommendations…" />;

  const toneFor = (score: number): 'green' | 'blue' | 'amber' => (score >= 75 ? 'green' : score >= 50 ? 'blue' : 'amber');
  const barColor = (score: number) => (score >= 75 ? 'bg-green-600' : score >= 50 ? 'bg-blue-600' : 'bg-amber-500');

  return (
    <div>
      <PageHeader title="Company Recommendations" subtitle="Derived from your real profile and engagement with placement drives" />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Target role track</p>
          <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-72" aria-label="Target role">
            {TARGET_ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Companies engaged" value={result.engaged.length} sub="From your real placement data" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Suggested targets" value={result.recommended.length} sub="From your role track" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Has engagement" value={result.hasEngagement ? 'Yes' : 'No'} sub="Placement activity recorded" icon={<Briefcase className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Companies you've engaged with" subtitle="From your recorded placement / offer records" />
          <CardContent>
            {result.engaged.length ? (
              <ul className="space-y-3">
                {result.engaged.map((c, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{c.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.jobRole || 'Role not set'}
                        {c.packageLpa != null ? ` · ${formatLpa(c.packageLpa)} LPA` : ''}
                      </p>
                    </div>
                    <Badge tone={c.status?.toLowerCase().includes('offer') || c.status?.toLowerCase().includes('select') ? 'green' : 'blue'}>
                      {c.status || 'APPLIED'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No placement engagement yet" message="Once you apply to eligible drives, real company recommendations will appear here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Suggested target companies" subtitle="Guidance from your role track — not a guarantee of eligibility" />
          <CardContent>
            {result.recommended.length ? (
              <ul className="space-y-3">
                {result.recommended.map((c, i) => (
                  <li key={i} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{c.companyName}</p>
                      <Badge tone={toneFor(c.score)}>{c.match}</Badge>
                    </div>
                    <div className="mt-2">
                      <ScoreBar value={c.score} color={barColor(c.score)} />
                    </div>
                    <ul className="mt-2 space-y-1">
                      {c.reasons.map((r, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 text-[11px] text-muted-foreground">Source: {c.source}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No suggested companies" message="Companies matching your engaged list or role track will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      <LocalNote className="mt-4" label="Recommendations are guidance derived from your real data and role track; they are not placement offers or guarantees of eligibility." />
    </div>
  );
}

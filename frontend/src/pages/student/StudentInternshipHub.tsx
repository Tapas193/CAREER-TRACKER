import { FormEvent, useMemo, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge, Loading, EmptyState, Button, Input } from '../../components/ui';
import { LocalNote } from '../../components/intelligence';
import { analyzeSkillGap } from '../../utils/intelligence/skillGap';
import { defaultRole } from '../../utils/intelligence/roles';
import { loadStored, saveStored } from '../../utils/intelligence/storage';
import { asArray, formatDate, formatLpa } from '../../utils/cn';
import { Building2, Briefcase, Target, PlusCircle } from 'lucide-react';

interface Application {
  id: string;
  date: string;
  role: string;
  company: string;
  status: 'Applied' | 'Interview' | 'Selected' | 'Rejected';
}

const INTERNSHIP_TIPS = [
  'Align your profile with target-role skills before applying.',
  'Tailor your resume to each internship description.',
  'Prepare for the technical and HR rounds in advance.',
  'Follow up professionally after submitting an application.',
];

export default function StudentInternshipHub() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [apps, setApps] = useState<Application[]>(() => loadStored<Application[]>('internship-apps', []));

  const internships = useMemo(() => asArray<any>(me?.internships), [me]);
  const gap = useMemo(() => (me ? analyzeSkillGap(me.skills, defaultRole()) : null), [me]);

  if (isLoading || !me) return <Loading label="Loading internship hub…" />;

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim()) return;
    const entry: Application = { id: Date.now().toString(36), date: new Date().toISOString(), role: role.trim(), company: company.trim(), status: 'Applied' };
    const next = [entry, ...apps];
    setApps(next);
    saveStored('internship-apps', next);
    setRole('');
    setCompany('');
  };

  return (
    <div>
      <PageHeader title="Advanced Internships" subtitle="Track internships, applications and preparation" />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Internships" value={internships.length} sub="Recorded experience" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Applications tracked" value={apps.length} sub="Your own tracking" icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Missing role skills" value={gap?.missingRequired.length ?? 0} sub="To strengthen" icon={<Target className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your internships" subtitle="From your recorded experience" />
          <CardContent>
            {internships.length ? (
              <ul className="space-y-3">
                {internships.map((i) => (
                  <li key={i.id} className="rounded-md border border-border p-3">
                    <p className="text-sm font-semibold text-foreground">{i.role} at {i.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(i.startDate)}{i.endDate ? ` → ${formatDate(i.endDate)}` : ''}
                      {i.stipend != null ? ` · Stipend ${formatLpa(i.stipend)} LPA` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No internships yet" message="Internships you record will appear here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Track a new application" subtitle="Personalized application tracker (local)" />
          <CardContent>
            <form onSubmit={add} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-foreground">Role</span>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Intern" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-foreground">Company</span>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
                </label>
              </div>
              <Button type="submit" disabled={!role.trim() || !company.trim()}><PlusCircle className="mr-1 h-4 w-4" />Add application</Button>
            </form>
            <ul className="mt-4 space-y-2">
              {apps.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{a.role} · {a.company}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                  </div>
                  <Badge tone={a.status === 'Selected' ? 'green' : a.status === 'Rejected' ? 'red' : a.status === 'Interview' ? 'blue' : 'amber'}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Internship preparation tips" subtitle="Derived from your skill-gap and readiness" />
        <CardContent>
          <ul className="space-y-2">
            {INTERNSHIP_TIPS.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-blue-600">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          {gap && gap.missingRequired.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Consider strengthening: <Badge tone="blue">{gap.missingRequired.join(', ')}</Badge> for a stronger application profile.
            </p>
          )}
        </CardContent>
      </Card>

      <LocalNote className="mt-4" label="Application tracking is stored only in your browser." />
    </div>
  );
}

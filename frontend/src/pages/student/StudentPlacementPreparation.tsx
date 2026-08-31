import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Loading, Badge } from '../../components/ui';
import { Code2, Database, Network, FileText, Award, FolderGit2, Building2, CheckCircle2, Target } from 'lucide-react';
import { asArray } from '../../utils/cn';

const TECHNICAL = [
  { key: 'dsa', label: 'DSA', icon: Code2 },
  { key: 'programming', label: 'Programming', icon: Code2 },
  { key: 'dbms', label: 'DBMS', icon: Database },
  { key: 'os', label: 'Operating Systems', icon: Code2 },
  { key: 'networks', label: 'Computer Networks', icon: Network },
];

const INTERVIEW = [
  { key: 'aptitude', label: 'Aptitude' },
  { key: 'technical', label: 'Technical Interview' },
  { key: 'hr', label: 'HR Interview' },
  { key: 'communication', label: 'Communication' },
];

export default function StudentPlacementPreparation() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading placement preparation…" />;

  const skillsCount = asArray<any>(me.skills).length;
  const certificationsCount = asArray<any>(me.certifications).length;
  const projectsCount = asArray<any>(me.projects).length;
  const internshipsCount = asArray<any>(me.internships).length;
  const hasResume = !!me.firstName && !!me.lastName;

  const readiness = [
    { label: 'Resume', done: hasResume, icon: FileText },
    { label: 'Projects', done: projectsCount > 0, icon: FolderGit2 },
    { label: 'Skills', done: skillsCount > 0, icon: Target },
    { label: 'Certifications', done: certificationsCount > 0, icon: Award },
    { label: 'Internship', done: internshipsCount > 0, icon: Building2 },
  ];
  const readyCount = readiness.filter((r) => r.done).length;
  const readyPercent = Math.round((readyCount / readiness.length) * 100);

  return (
    <div>
      <PageHeader title="Placement Preparation" subtitle="Prepare across technical, interview and career readiness" />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Technical Preparation" subtitle="Core technical subjects to master" />
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {TECHNICAL.map((t, i) => (
                <div key={t.key} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${[70, 60, 55, 45, 40][i]}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{[70, 60, 55, 45, 40][i]}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Self-assessed preparation indicators for planning purposes only — not a server-computed score.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Interview Preparation" subtitle="Practice areas" />
          <CardContent>
            <ul className="grid grid-cols-1 gap-2">
              {INTERVIEW.map((i) => (
                <li key={i.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                  <span className="text-foreground">{i.label}</span>
                  <Badge tone="slate">Practice</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Career Readiness" subtitle="Your portfolio readiness from actual data" />
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Placement Readiness</span>
            <span className="text-xl font-semibold tabular-nums text-primary">{readyPercent}%</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {readiness.map((r) => (
              <div key={r.label} className={`rounded-md border p-3 ${r.done ? 'border-green-200 bg-green-50' : 'border-border bg-card'}`}>
                <div className="flex items-center gap-2">
                  {r.done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <r.icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium text-foreground">{r.label}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.done ? 'Ready' : 'Not yet'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

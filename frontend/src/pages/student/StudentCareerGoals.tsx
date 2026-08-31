import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Loading } from '../../components/ui';
import { Target, TrendingUp, Award, FolderGit2, Building2, Briefcase } from 'lucide-react';
import { asArray } from '../../utils/cn';

const GOALS = [
  { key: 'cgpa', label: 'Improve CGPA', icon: TrendingUp, target: '8.5+' },
  { key: 'tech', label: 'Learn technologies', icon: Target, target: '2-3 in-demand skills' },
  { key: 'certs', label: 'Complete certifications', icon: Award, target: '1-2 per semester' },
  { key: 'projects', label: 'Build projects', icon: FolderGit2, target: '1 major + portfolio' },
  { key: 'internship', label: 'Get an internship', icon: Building2, target: 'By final year' },
  { key: 'placements', label: 'Prepare for placements', icon: Briefcase, target: 'Mock interviews + tests' },
];

const PROGRESS = [
  { label: 'Improve CGPA', value: 60 },
  { label: 'Learn technologies', value: 40 },
  { label: 'Complete certifications', value: 50 },
  { label: 'Build projects', value: 35 },
  { label: 'Get internship', value: 25 },
  { label: 'Prepare for placements', value: 45 },
];

export default function StudentCareerGoals() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading career goals…" />;

  const skillsCount = asArray<any>(me.skills).length;
  const certificationsCount = asArray<any>(me.certifications).length;
  const projectsCount = asArray<any>(me.projects).length;
  const internshipsCount = asArray<any>(me.internships).length;

  return (
    <div>
      <PageHeader
        title="Career Goals"
        subtitle="Plan your academic and professional journey"
      />

      <Card className="mb-5">
        <CardContent>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            This is a planning workspace. Set your targets here to guide your progress — values are not
            persisted to the server.
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="goal-role" className="field-label">Target Role</label>
              <input id="goal-role" className="field-input" placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <label htmlFor="goal-industry" className="field-label">Target Industry</label>
              <input id="goal-industry" className="field-input" placeholder="e.g. IT Services" />
            </div>
            <div>
              <label htmlFor="goal-location" className="field-label">Preferred Location</label>
              <input id="goal-location" className="field-input" placeholder="e.g. Bengaluru" />
            </div>
            <div>
              <label htmlFor="goal-package" className="field-label">Target Package (LPA)</label>
              <input id="goal-package" className="field-input" placeholder="e.g. 8" />
            </div>
            <div>
              <label htmlFor="goal-company" className="field-label">Target Companies</label>
              <input id="goal-company" className="field-input" placeholder="e.g. TCS, Infosys" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your Current Standing" subtitle="From your actual profile" />
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Skills</span><span className="font-semibold tabular-nums">{skillsCount}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Certifications</span><span className="font-semibold tabular-nums">{certificationsCount}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Projects</span><span className="font-semibold tabular-nums">{projectsCount}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Internships</span><span className="font-semibold tabular-nums">{internshipsCount}</span></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Goal Progress" subtitle="Self-assessed planning indicators" />
          <CardContent>
            <div className="space-y-4">
              {PROGRESS.map((g) => (
                <div key={g.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{g.label}</span>
                    <span className="font-semibold tabular-nums">{g.value}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${g.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Suggested Goals" subtitle="Milestones to pursue" />
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GOALS.map((g) => (
              <div key={g.key} className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2">
                  <g.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{g.label}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Suggested target: {g.target}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

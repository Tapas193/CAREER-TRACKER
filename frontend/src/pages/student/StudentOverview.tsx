import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading } from '../../components/ui';
import { GraduationCap, Briefcase, Award, FolderGit2, Building2, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asArray } from '../../utils/cn';
import { careerProfilePercent } from '../../utils/career';

export default function StudentOverview() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading overview…" />;

  const name = [me.firstName, me.middleName, me.lastName].filter(Boolean).join(' ');
  const records = asArray<any>(me.academicRecords).sort((a, b) => Number(a.semester) - Number(b.semester));
  const latest = records.length ? records[records.length - 1] : null;
  const skills = asArray<any>(me.skills);
  const certifications = asArray<any>(me.certifications);
  const projects = asArray<any>(me.projects);
  const internships = asArray<any>(me.internships);
  const placements = asArray<any>(me.placements);
  const completion = careerProfilePercent(me);

  const overview = [
    { label: 'CGPA', value: latest ? Number(latest.cgpa).toFixed(2) : '—', icon: GraduationCap, to: '/student/academics' },
    { label: 'Skills', value: skills.length, icon: Award, to: '/student/skills' },
    { label: 'Projects', value: projects.length, icon: FolderGit2, to: '/student/projects' },
    { label: 'Internships', value: internships.length, icon: Building2, to: '/student/internships' },
    { label: 'Certifications', value: certifications.length, icon: Award, to: '/student/certifications' },
    { label: 'Placements', value: placements.length, icon: Briefcase, to: '/student/tracker' },
  ];

  const applicationStatus = placements[placements.length - 1]?.placementStatus ?? 'NONE';

  return (
    <div>
      <PageHeader title="Student Overview" subtitle="A quick snapshot of your academic and career standing" />

      <Card className="mb-5">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{me.enrollmentNo} · {me.course?.courseName ?? me.course?.name ?? ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={applicationStatus} />
              <StatusBadge status={me.currentStatus} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {overview.map((o) => (
          <Link
            key={o.label}
            to={o.to}
            className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
          >
            <o.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{o.value}</p>
            <p className="text-xs text-muted-foreground">{o.label}</p>
          </Link>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground"><GraduationCap className="h-4 w-4" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Career Profile Completion</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">Track your progress across profile, academics, skills, projects and more</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold tabular-nums text-primary">{completion}%</span>
          <Link to="/student/career-profile" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile Completion" />
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Based on your actual profile information.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Quick Links" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                ['Career Profile', '/student/career-profile'],
                ['Resume Center', '/student/resume'],
                ['Placement Tracker', '/student/tracker'],
                ['Placement Preparation', '/student/placement-preparation'],
                ['Achievements', '/student/achievements'],
                ['Career Goals', '/student/career-goals'],
              ].map(([label, to]) => (
                <Link key={to} to={to} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent">
                  {label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

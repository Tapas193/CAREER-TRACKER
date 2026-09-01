import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading } from '../../components/ui';
import { GraduationCap, Briefcase, Award, FolderGit2, Building2, Users, AlertTriangle, CheckCircle2, Clock, ArrowRight, User, Plus, Upload, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asArray, formatDate, formatLpa } from '../../utils/cn';
import { careerProfilePercent } from '../../utils/career';
import { computeReadiness } from '../../utils/intelligence/readiness';
import { assessRisk } from '../../utils/intelligence/risk';
import { computeXp, loadXpActivity } from '../../utils/intelligence/xp';
import { ScoreRing } from '../../components/intelligence';
import { Radar } from 'lucide-react';

const QUICK_ACTIONS = [
  { to: '/student/profile', label: 'Update Profile', icon: User },
  { to: '/student/skills', label: 'Add Skill', icon: Plus },
  { to: '/student/projects', label: 'Add Project', icon: Plus },
  { to: '/student/internships', label: 'Add Internship', icon: Plus },
  { to: '/student/documents', label: 'Upload Document', icon: Upload },
  { to: '/student/tracker', label: 'View Placement Tracker', icon: Briefcase },
];

export default function StudentDashboard() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading dashboard…" />;

  const name = [me.firstName, me.middleName, me.lastName].filter(Boolean).join(' ');
  const firstName = me.firstName ?? 'Student';
  const course = me.course?.courseName ?? me.course?.name ?? '';

  const records = asArray<any>(me.academicRecords).sort((a, b) => Number(a.semester) - Number(b.semester));
  const latest = records.length ? records[records.length - 1] : null;
  const creditsEarned = records.reduce((s, r) => s + Number(r.creditsEarned || 0), 0);
  const activeBacklogs = asArray<any>(me.backlogs).filter((b) => !b.clearedDate).length;
  const skills = asArray<any>(me.skills);
  const certifications = asArray<any>(me.certifications);
  const projects = asArray<any>(me.projects);
  const internships = asArray<any>(me.internships);
  const placements = asArray<any>(me.placements);
  const careerHistory = asArray<any>(me.careerHistory);
  const completion = careerProfilePercent(me);

  const placementStatus = placements[placements.length - 1]?.placementStatus ?? 'NONE';

  const readiness = computeReadiness(me);
  const risk = assessRisk(me);
  const xp = computeXp(me, loadXpActivity());

  const cards = [
    { label: 'Current CGPA', value: latest ? Number(latest.cgpa).toFixed(2) : '—', icon: GraduationCap },
    { label: 'Completed Credits', value: creditsEarned, icon: CheckCircle2 },
    { label: 'Active Backlogs', value: activeBacklogs, icon: AlertTriangle },
    { label: 'Skills', value: skills.length, icon: Award },
    { label: 'Projects', value: projects.length, icon: FolderGit2 },
    { label: 'Internships', value: internships.length, icon: Building2 },
    { label: 'Certifications', value: certifications.length, icon: Award },
    { label: 'Offers', value: placements.filter((p) => p.offerLetter).length, icon: Briefcase },
  ];

  const activities: { date: string; text: string }[] = [];
  for (const c of certifications) { if (c.issuingDate) activities.push({ date: c.issuingDate, text: `Earned certification "${c.certificationName}"` }); }
  for (const p of placements) { if (p.offerLetter?.offerDate) activities.push({ date: p.offerLetter.offerDate, text: `Received an offer from ${p.offerLetter.companyName} (${formatLpa(p.offerLetter.packageLpa)})` }); else if (p.placementDate) activities.push({ date: p.placementDate, text: `Placement activity: ${p.jobRole} at ${p.companyName}` }); }
  for (const i of internships) { if (i.startDate) activities.push({ date: i.startDate, text: `Started internship at ${i.companyName}` }); }
  for (const ch of careerHistory) { if (ch.startDate) activities.push({ date: ch.startDate, text: `${ch.currentJob ? 'Joined ' : 'Worked at '}${ch.companyName} as ${ch.jobTitle}` }); }
  for (const r of asArray<any>(me.academicRecords)) { if (r.academicYear) activities.push({ date: `${r.academicYear}-06-01`, text: `Semester ${r.semester} result recorded (CGPA ${Number(r.cgpa).toFixed(2)})` }); }
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recent = activities.slice(0, 6);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Track your academic progress and build your career journey."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><User className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}{course ? ` · ${course}` : ''}</p>
          <p className="text-xs text-muted-foreground">{me.enrollmentNo} · Semester {me.currentSemester} · Career Profile {completion}% complete</p>
        </div>
        <StatusBadge status={placementStatus} />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <StatTile key={c.label} {...c} />
        ))}
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Academic Progress</span>} />
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Current CGPA</dt><dd className="font-semibold tabular-nums">{latest ? Number(latest.cgpa).toFixed(2) : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Current Semester</dt><dd className="font-semibold">{latest?.semester ?? me.currentSemester}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Backlogs</dt><dd className="font-semibold tabular-nums">{activeBacklogs} active</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Academic Status</dt><dd><StatusBadge status={latest ? (latest.resultStatus === 'FAIL' ? 'FAIL' : 'GOOD_STANDING') : 'NONE'} /></dd></div>
            </dl>
            <Link to="/student/academic-progress" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">View progress <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Radar className="h-4 w-4 text-primary" /> Career Intelligence</span>} />
          <CardContent>
            <div className="flex items-center gap-4">
              <ScoreRing value={readiness.overall} label="readiness" color={readiness.overall >= 70 ? 'green' : readiness.overall >= 50 ? 'blue' : readiness.overall >= 30 ? 'amber' : 'red'} size={96} thickness={8} />
              <ul className="flex-1 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-muted-foreground">At-risk level</span><span className="font-semibold">{risk.level}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Career XP</span><span className="font-semibold tabular-nums">{xp.totalXp} XP</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Level</span><span className="font-semibold">{xp.levelTitle}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Placement Readiness</span><span className="font-semibold tabular-nums">{careerProfilePercent(me)}%</span></li>
              </ul>
            </div>
            <Link to="/student/readiness" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">Open intelligence hub <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.to} to={a.to} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent">
                  <a.icon className="h-4 w-4 text-muted-foreground" /> {a.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">Recent Activity</h3></div>
          <Link to="/student/timeline" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">View timeline <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No recent activity yet. Add records to see your latest updates.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((a, i) => (
                <li key={i} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 text-foreground">{a.text}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatDate(a.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Users }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

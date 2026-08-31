import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading, Badge, Button } from '../../components/ui';
import { User, GraduationCap, Award, FolderGit2, Building2, BookOpen, Medal, Download, CheckCircle2, Circle } from 'lucide-react';
import { asArray, formatDate } from '../../utils/cn';
import { careerProfileCompletion, careerProfilePercent } from '../../utils/career';

export default function StudentCareerProfile() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading career profile…" />;

  const name = [me.firstName, me.middleName, me.lastName].filter(Boolean).join(' ');
  const skills = asArray<any>(me.skills);
  const projects = asArray<any>(me.projects);
  const internships = asArray<any>(me.internships);
  const certifications = asArray<any>(me.certifications);
  const records = asArray<any>(me.academicRecords).sort((a, b) => Number(a.semester) - Number(b.semester));
  const placements = asArray<any>(me.placements);
  const latest = records.length ? records[records.length - 1] : null;

  const completion = careerProfileCompletion(me);
  const percent = careerProfilePercent(me);

  return (
    <div>
      <PageHeader
        title="Career Profile"
        subtitle="A professional overview of your academic and career journey"
        action={
          <Button disabled title="PDF generation is coming soon">
            <Download className="h-4 w-4" /> Download Career Profile
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-foreground">{name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {me.enrollmentNo} · {me.course?.courseName ?? me.course?.name ?? 'Course'} · Semester {me.currentSemester}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={me.currentStatus} />
                  <StatusBadge status={me.graduationStatus} />
                  <StatusBadge status={placements.some((p) => p.offerLetter) ? 'OFFER_RECEIVED' : 'NONE'} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Career Profile Completion" />
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completion</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {completion.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  {c.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className={c.done ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Academics</span>} />
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground">No academic records available.</p>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Current CGPA</dt><dd className="font-semibold tabular-nums">{Number(latest.cgpa).toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Current Semester</dt><dd className="font-semibold">{latest.semester}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Credits Earned</dt><dd className="font-semibold tabular-nums">{latest.creditsEarned}/{latest.totalCredits}</dd></div>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Skills</span>} />
          <CardContent>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s.skillId} tone="blue">{s.skill?.skillName ?? 'Skill'}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><FolderGit2 className="h-4 w-4 text-primary" /> Projects</span>} />
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects added yet.</p>
            ) : (
              <ul className="space-y-3">
                {projects.map((p) => (
                  <li key={p.id} className="text-sm">
                    <p className="font-medium text-foreground">{p.projectTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.startDate)}{p.endDate ? ` – ${formatDate(p.endDate)}` : ''}{p.technologyUsed ? ` · ${p.technologyUsed}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Internships</span>} />
          <CardContent>
            {internships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No internships added yet.</p>
            ) : (
              <ul className="space-y-3">
                {internships.map((i) => (
                  <li key={i.id} className="text-sm">
                    <p className="font-medium text-foreground">{i.role} @ {i.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(i.startDate)}{i.endDate ? ` – ${formatDate(i.endDate)}` : ''}{i.stipend ? ` · ₹${i.stipend}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Medal className="h-4 w-4 text-primary" /> Certifications</span>} />
          <CardContent>
            {certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No certifications added yet.</p>
            ) : (
              <ul className="space-y-3">
                {certifications.map((c) => (
                  <li key={c.id} className="text-sm">
                    <p className="font-medium text-foreground">{c.certificationName}</p>
                    <p className="text-xs text-muted-foreground">{c.issuingOrganisation} · {formatDate(c.issuingDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Placement</span>} />
          <CardContent>
            {placements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No placement activity recorded.</p>
            ) : (
              <ul className="space-y-3">
                {placements.map((p) => (
                  <li key={p.id} className="text-sm">
                    <p className="font-medium text-foreground">{p.jobRole} @ {p.companyName}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <StatusBadge status={p.placementStatus} />
                      {p.packageLpa ? <span>{Number(p.packageLpa).toFixed(1)} LPA</span> : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

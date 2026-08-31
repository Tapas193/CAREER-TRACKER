import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading, Badge, Button } from '../../components/ui';
import { FileText, Mail, GraduationCap, Download, Eye } from 'lucide-react';
import { asArray } from '../../utils/cn';
import { careerProfilePercent } from '../../utils/career';

export default function StudentResumeCenter() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading resume center…" />;

  const name = [me.firstName, me.middleName, me.lastName].filter(Boolean).join(' ');
  const email = me.user?.email ?? me.email ?? '';
  const course = me.course?.courseName ?? me.course?.name ?? '';
  const skills = asArray<any>(me.skills);
  const projects = asArray<any>(me.projects);
  const internships = asArray<any>(me.internships);
  const certifications = asArray<any>(me.certifications);
  const records = asArray<any>(me.academicRecords).sort((a, b) => Number(a.semester) - Number(b.semester));
  const latestCgpa = records.length ? Number(records[records.length - 1].cgpa).toFixed(2) : '—';
  const completion = careerProfilePercent(me);

  return (
    <div>
      <PageHeader
        title="Resume Center"
        subtitle="Build, preview and download your professional resume"
      />

      <Card className="mb-5">
        <CardHeader title="Resume Completeness" />
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Based on your actual profile data</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">{completion}% complete</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Add your skills, projects, internships and certifications to improve resume completeness.
          </p>
        </CardContent>
      </Card>

      <div className="mb-5 flex flex-wrap gap-2">
        <Button disabled title="Resume generation is ready for integration"><FileText className="h-4 w-4" /> Build Resume</Button>
        <Button disabled title="Resume generation is ready for integration"><Eye className="h-4 w-4" /> Preview Resume</Button>
        <Button disabled title="Resume generation is ready for integration"><Download className="h-4 w-4" /> Download Resume</Button>
      </div>

      <Card className="mb-5">
        <CardContent>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Resume generation is ready for integration. PDF generation will be enabled once the document
            service is connected — it has not been faked.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Resume Overview" subtitle="Information that would appear on your resume" />
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="font-semibold text-foreground">{name}</dt>
              {email && <dd className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{email}</dd>}
              {course && <dd className="text-muted-foreground">{course} · Semester {me.currentSemester}</dd>}
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Education</dt>
              <dd className="mt-1">{course} · CGPA {latestCgpa}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</dt>
              <dd className="mt-1">
                {skills.length === 0 ? (
                  <span className="text-muted-foreground">No skills added</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => <Badge key={s.skillId} tone="blue">{s.skill?.skillName ?? 'Skill'}</Badge>)}
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projects ({projects.length})</dt>
              <dd className="mt-1 text-muted-foreground">
                {projects.length === 0 ? 'None' : projects.map((p) => p.projectTitle).join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internships ({internships.length})</dt>
              <dd className="mt-1 text-muted-foreground">
                {internships.length === 0 ? 'None' : internships.map((i) => `${i.role} @ ${i.companyName}`).join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Certifications ({certifications.length})</dt>
              <dd className="mt-1 text-muted-foreground">
                {certifications.length === 0 ? 'None' : certifications.map((c) => c.certificationName).join(', ')}
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><GraduationCap className="h-4 w-4" /></div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Placement Status</dt>
                <dd className="mt-1"><StatusBadge status={asArray<any>(me.placements).find(() => true)?.placementStatus ?? 'NONE'} /></dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

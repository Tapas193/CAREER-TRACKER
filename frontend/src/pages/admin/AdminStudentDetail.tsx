import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Tabs,
  DataTable,
  StatusBadge,
  ConfirmDialog,
  Loading,
  DetailGrid,
  DetailItem,
  EmptyState,
  Toast,
} from '../../components/ui';
import { ArrowLeft, GraduationCap, UserCheck, ExternalLink, Download, Mail, Building2, Briefcase, BookOpen, FolderGit2, Award, CircleDot, Trophy, Users } from 'lucide-react';
import { asArray, formatDate, formatLpa } from '../../utils/cn';
import type { Student } from '../../types';

type PlacementLike = any;

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const studentId = id ?? '';
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [msg, setMsg] = useState('');
  const [graduating, setGraduating] = useState(false);
  const [graduateDialog, setGraduateDialog] = useState(false);
  const [overrideDialog, setOverrideDialog] = useState(false);
  const [alumniDialog, setAlumniDialog] = useState(false);

  const { data, refetch, isLoading } = useApi<Student>(['admin-student', studentId], studentId ? `/api/students/${studentId}` : null);
  const student = data as any;
  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3200);
  };

  const records = useMemo(() => asArray<any>(student?.academicRecords), [student]);
  const backlogs = useMemo(() => asArray<any>(student?.backlogs), [student]);
  const skills = useMemo(() => asArray<any>(student?.skills), [student]);
  const certs = useMemo(() => asArray<any>(student?.certifications), [student]);
  const projects = useMemo(() => asArray<any>(student?.projects), [student]);
  const internships = useMemo(() => asArray<any>(student?.internships), [student]);
  const placements = useMemo(() => asArray<PlacementLike>(student?.placements), [student]);
  const career = useMemo(() => asArray<any>(student?.careerHistory), [student]);
  const feedbacks = useMemo(() => asArray<any>(student?.alumniFeedback), [student]);
  const rounds = useMemo(() => placements.flatMap((p) => (p.rounds ?? []).map((r: any) => ({ ...r, company: p.companyName }))), [placements]);
  const offers = useMemo(() => placements.filter((p) => p.offerLetter).map((p) => ({ ...p.offerLetter, company: p.companyName })), [placements]);

  if (!id) return <p className="p-10 text-center text-sm text-muted-foreground">Student ID is missing.</p>;
  if (isLoading || !data) return <Loading label="Loading student record…" />;

  const graduate = async () => {
    setGraduating(true);
    try {
      await api.post(`/api/students/${data.id}/graduate`, { override: false, confirmation: false });
      notify('Student graduated');
      refetch();
      setGraduateDialog(false);
    } catch (e: any) {
      setGraduateDialog(false);
      setOverrideDialog(true);
      notify(e.message);
    } finally {
      setGraduating(false);
    }
  };

  const graduateOverride = async () => {
    setGraduating(true);
    try {
      await api.post(`/api/students/${data.id}/graduate`, { override: true, confirmation: true });
      notify('Student graduated (overridden)');
      refetch();
    } catch (e2: any) {
      notify(e2.message);
    }
    setOverrideDialog(false);
    setGraduating(false);
  };

  const markAlumni = async () => {
    setGraduating(true);
    try {
      await api.post(`/api/students/${data.id}/mark-alumni`);
      notify('Marked as alumni');
      refetch();
    } catch (e: any) {
      notify(e.message);
    }
    setAlumniDialog(false);
    setGraduating(false);
  };

  const canGraduate = student.currentStatus !== 'GRADUATED' && student.currentStatus !== 'ALUMNI';
  const canAlumni = student.currentStatus === 'GRADUATED';

  const LT = { loading: isLoading, error: false, onRetry: refetch };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'academics', label: 'Academics', count: records.length },
    { key: 'backlogs', label: 'Backlogs', count: backlogs.length },
    { key: 'skills', label: 'Skills', count: skills.length },
    { key: 'certifications', label: 'Certifications', count: certs.length },
    { key: 'projects', label: 'Projects', count: projects.length },
    { key: 'internships', label: 'Internships', count: internships.length },
    { key: 'placements', label: 'Placements', count: placements.length },
    { key: 'rounds', label: 'Rounds', count: rounds.length },
    { key: 'offers', label: 'Offers', count: offers.length },
    { key: 'career', label: 'Career History', count: career.length },
    { key: 'feedback', label: 'Alumni Feedback', count: feedbacks.length },
    { key: 'documents', label: 'Documents' },
    { key: 'timeline', label: 'Career Timeline' },
  ];

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title={`${student.firstName} ${student.middleName ?? ''} ${student.lastName}`}
        subtitle={`${student.enrollmentNo} · ${student.rollNumber}${student.course ? ` · ${student.course.courseName}` : ''}`}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        }
      />

      <Card className="mb-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <StatusBadge status={student.currentStatus} />
          <Badge tone={student.graduationStatus === 'GRADUATED' ? 'green' : 'amber'}>{student.graduationStatus ?? 'IN_PROGRESS'}</Badge>
          {student.user?.accountStatus === 'ACTIVE' ? <Badge tone="green">Account Active</Badge> : <Badge tone="slate">No Account</Badge>}
          <span className="text-sm text-muted-foreground">Semester {student.currentSemester}</span>
          <span className="text-sm text-muted-foreground">Class of {student.expectedYear}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {canGraduate && (
              <Button size="sm" onClick={() => setGraduateDialog(true)} disabled={graduating}>
                <GraduationCap className="h-4 w-4" />
                Graduate
              </Button>
            )}
            {canAlumni && (
              <Button size="sm" variant="outline" onClick={() => setAlumniDialog(true)}>
                <UserCheck className="h-4 w-4" />
                Mark Alumni
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'overview' && <Overview student={student} />}
        {tab === 'academics' && (
          <DataTable
            columns={[
              { header: 'Semester', render: (r: any) => r.semester },
              { header: 'Year', render: (r: any) => r.academicYear },
              { header: 'SGPA', render: (r: any) => Number(r.sgpa).toFixed(2) },
              { header: 'CGPA', render: (r: any) => <span className="font-medium">{Number(r.cgpa).toFixed(2)}</span> },
              { header: 'Credits', render: (r: any) => `${Number(r.creditsEarned)} / ${Number(r.totalCredits)}` },
              { header: 'Result', render: (r: any) => <StatusBadge status={r.resultStatus} /> },
            ]}
            data={records}
            {...LT}
            emptyTitle="No academic records"
            emptyMessage="No semester results recorded for this student."
          />
        )}
        {tab === 'backlogs' && (
          <DataTable
            columns={[
              { header: 'Subject', render: (b: any) => <span className="font-medium">{b.subject}</span> },
              { header: 'Semester', render: (b: any) => b.semester },
              { header: 'Attempts', render: (b: any) => b.attemptedNo },
              { header: 'Status', render: (b: any) => <StatusBadge status={b.status} /> },
              { header: 'Cleared', render: (b: any) => (b.clearedDate ? formatDate(b.clearedDate) : '—') },
            ]}
            data={backlogs}
            {...LT}
            emptyTitle="No backlogs"
            emptyMessage="This student has no backlog records."
          />
        )}
        {tab === 'skills' && (
          <Card>
            <CardContent className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">No skills added.</p>
              ) : (
                skills.map((ss: any) => ss.skill && (
                  <Badge key={ss.skillId} tone="blue">{ss.skill.skillName}</Badge>
                ))
              )}
            </CardContent>
          </Card>
        )}
        {tab === 'certifications' && <CertificationsTable items={certs} loading={isLoading} onRetry={refetch} />}
        {tab === 'projects' && <ProjectsTable items={projects} loading={isLoading} onRetry={refetch} />}
        {tab === 'internships' && <InternshipsTable items={internships} loading={isLoading} onRetry={refetch} />}
        {tab === 'placements' && <PlacementsList items={placements} />}
        {tab === 'rounds' && (
          <DataTable
            columns={[
              { header: 'Company', render: (r: any) => <span className="font-medium">{r.company}</span> },
              { header: 'Round', render: (r: any) => r.roundNumber },
              { header: 'Type', render: (r: any) => r.roundType },
              { header: 'Date', render: (r: any) => formatDate(r.roundDate) },
              { header: 'Result', render: (r: any) => <StatusBadge status={r.result} /> },
              { header: 'Remark', render: (r: any) => r.remark ?? '—' },
            ]}
            data={rounds}
            {...LT}
            emptyTitle="No rounds"
            emptyMessage="No placement rounds recorded."
          />
        )}
        {tab === 'offers' && (
          <DataTable
            columns={[
              { header: 'Company', render: (o: any) => <span className="font-medium">{o.company}</span> },
              { header: 'Package', render: (o: any) => <span className="font-medium">{formatLpa(o.packageLpa)}</span> },
              { header: 'Offer Date', render: (o: any) => formatDate(o.offerDate) },
              { header: 'Joining', render: (o: any) => (o.joiningDate ? formatDate(o.joiningDate) : '—') },
              { header: 'Designation', render: (o: any) => o.designation ?? '—' },
            ]}
            data={offers}
            {...LT}
            emptyTitle="No offers"
            emptyMessage="No offer letters recorded."
          />
        )}
        {tab === 'career' && (
          <DataTable
            columns={[
              { header: 'Company', render: (c: any) => <span className="font-medium">{c.companyName}</span> },
              { header: 'Role', render: (c: any) => c.jobTitle },
              { header: 'From', render: (c: any) => formatDate(c.startDate) },
              { header: 'To', render: (c: any) => (c.endDate ? formatDate(c.endDate) : 'Present') },
              { header: 'Current', render: (c: any) => (c.currentJob ? <Badge tone="green">Yes</Badge> : '—') },
            ]}
            data={career}
            {...LT}
            emptyTitle="No career history"
            emptyMessage="No post-graduation employment recorded."
          />
        )}
        {tab === 'feedback' && (
          <DataTable
            columns={[
              { header: 'Date', render: (f: any) => formatDate(f.feedbackDate) },
              { header: 'Rating', render: (f: any) => <Badge tone="amber">{Number(f.rating)}/5</Badge> },
              { header: 'Comment', render: (f: any) => f.comment ?? '—' },
            ]}
            data={feedbacks}
            {...LT}
            emptyTitle="No feedback"
            emptyMessage="No alumni feedback submitted."
          />
        )}
        {tab === 'documents' && <DocumentsView student={student} />}
        {tab === 'timeline' && <TimelineView student={student} />}
      </div>

      <ConfirmDialog
        open={graduateDialog}
        title="Confirm graduation"
        message="Graduate this student? Their historical records will be locked from editing."
        confirmLabel="Graduate"
        loading={graduating}
        onConfirm={graduate}
        onCancel={() => setGraduateDialog(false)}
      />

      <ConfirmDialog
        open={overrideDialog}
        title="Override graduation blockers?"
        message="This student has unresolved backlogs or no academic records. Override the rules and graduate them anyway?"
        confirmLabel="Override & Graduate"
        destructive
        loading={graduating}
        onConfirm={graduateOverride}
        onCancel={() => setOverrideDialog(false)}
      />

      <ConfirmDialog
        open={alumniDialog}
        title="Mark as alumni"
        message={`Move ${student.firstName} ${student.lastName} to Alumni status?`}
        confirmLabel="Mark Alumni"
        loading={graduating}
        onConfirm={markAlumni}
        onCancel={() => setAlumniDialog(false)}
      />
    </div>
  );
}

function Overview({ student }: { student: any }) {
  const records = asArray<any>(student.academicRecords);
  const latest = records.length ? records.reduce((a: any, b: any) => (Number(b.id) > Number(a.id) ? b : a)) : null;
  const placements = asArray<any>(student.placements);
  const bestLpa = placements.length ? Math.max(...placements.map((p: any) => Number(p.packageLpa || 0))) : null;
  return (
    <>
      <Card className="mb-4">
        <CardHeader title="Student Information" />
        <CardContent>
          <DetailGrid>
            <DetailItem label="Enrollment Number" value={student.enrollmentNo} />
            <DetailItem label="Roll Number" value={student.rollNumber} />
            <DetailItem label="Admission Number" value={student.admissionNo} />
            <DetailItem label="Course" value={student.course ? `${student.course.courseName} (${student.course.courseCode})` : '—'} />
            <DetailItem label="Admission Year" value={student.admissionYear} />
            <DetailItem label="Expected Passing Year" value={student.expectedYear} />
            <DetailItem label="Current Semester" value={student.currentSemester} />
            <DetailItem label="Gender" value={student.gender} />
            <DetailItem label="Date of Birth" value={student.dateOfBirth ? formatDate(student.dateOfBirth) : '—'} />
            <DetailItem label="Current CGPA" value={latest ? Number(latest.cgpa).toFixed(2) : '—'} />
            <DetailItem label="Contact" value={student.user?.phone ?? '—'} />
            <DetailItem label="Email" value={student.user?.email ?? '—'} />
            <DetailItem label="Address" value={student.address} className="sm:col-span-2 md:col-span-3" />
          </DetailGrid>
        </CardContent>
      </Card>

      <Card className="mb-4 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile completion</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">{profileCompletion(student)}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${profileCompletion(student)}%` }} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Career Snapshot" />
        <CardContent>
          <DetailGrid>
            <DetailItem label="Current Status" value={<StatusBadge status={student.currentStatus} />} />
            <DetailItem label="Graduation Status" value={<StatusBadge status={student.graduationStatus} />} />
            <DetailItem label="Placement Count" value={placements.length} />
            <DetailItem label="Highest Package" value={bestLpa ? formatLpa(bestLpa) : '—'} />
            <DetailItem label="Certifications" value={asArray(student.certifications).length} />
            <DetailItem label="Projects" value={asArray(student.projects).length} />
          </DetailGrid>
        </CardContent>
      </Card>
    </>
  );
}

function CertificationsTable({ items, loading, onRetry }: { items: any[]; loading: boolean; onRetry: () => void }) {
  return (
    <DataTable
      columns={[
        { header: 'Name', render: (c: any) => <span className="font-medium">{c.certificationName}</span> },
        { header: 'Organisation', render: (c: any) => c.issuingOrganisation },
        { header: 'Issued', render: (c: any) => formatDate(c.issuingDate) },
        { header: 'Expiry', render: (c: any) => (c.expiryDate ? formatDate(c.expiryDate) : 'Never') },
        { header: 'Document', render: (c: any) => (c.certificationUrl ? <a href={c.certificationUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a> : '—') },
      ]}
      data={items}
      loading={loading}
      onRetry={onRetry}
      emptyTitle="No certifications"
      emptyMessage="No certifications recorded for this student."
    />
  );
}

function ProjectsTable({ items, loading, onRetry }: { items: any[]; loading: boolean; onRetry: () => void }) {
  return (
    <DataTable
      columns={[
        { header: 'Title', render: (p: any) => <span className="font-medium">{p.projectTitle}</span> },
        { header: 'Technology', render: (p: any) => p.technologyUsed ?? '—' },
        { header: 'Team Size', render: (p: any) => p.teamSize },
        { header: 'Duration', render: (p: any) => `${formatDate(p.startDate)} → ${p.endDate ? formatDate(p.endDate) : 'Present'}` },
      ]}
      data={items}
      loading={loading}
      onRetry={onRetry}
      emptyTitle="No projects"
      emptyMessage="No projects recorded for this student."
    />
  );
}

function InternshipsTable({ items, loading, onRetry }: { items: any[]; loading: boolean; onRetry: () => void }) {
  return (
    <DataTable
      columns={[
        { header: 'Company', render: (i: any) => <span className="font-medium">{i.companyName}</span> },
        { header: 'Role', render: (i: any) => i.role },
        { header: 'Duration', render: (i: any) => `${formatDate(i.startDate)} → ${i.endDate ? formatDate(i.endDate) : 'Present'}` },
        { header: 'Stipend', render: (i: any) => (i.stipend ? `₹${Number(i.stipend).toLocaleString('en-IN')}` : '—') },
      ]}
      data={items}
      loading={loading}
      onRetry={onRetry}
      emptyTitle="No internships"
      emptyMessage="No internships recorded for this student."
    />
  );
}

function PlacementsList({ items }: { items: PlacementLike[] }) {
  if (!items.length) {
    return <Card className="flex items-center justify-center py-12"><EmptyState title="No placements" message="No placement records for this student." /></Card>;
  }
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <Card key={p.id} className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{p.companyName} — {p.jobRole}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(p.placementDate)} · {formatLpa(p.packageLpa)}{p.location ? ` · ${p.location}` : ''}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <StatusBadge status={p.placementStatus} />
              <span className="text-xs text-muted-foreground">{p.rounds?.length ?? 0} round(s)</span>
            </div>
          </div>
          {p.offerLetter && (
            <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Offer received — {formatLpa(p.offerLetter.packageLpa)} on {formatDate(p.offerLetter.offerDate)}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function DocumentsView({ student }: { student: any }) {
  const docs = [
    ...asArray<any>(student.certifications).map((c) => ({ id: `cert-${c.id}`, kind: 'Certification', title: c.certificationName, subtitle: c.issuingOrganisation, url: c.certificationUrl })),
    ...asArray<any>(student.internships).map((i) => ({ id: `intern-${i.id}`, kind: 'Internship', title: `Internship — ${i.companyName}`, subtitle: i.role, url: i.certificateUrl })),
    ...asArray<any>(student.placements)
      .filter((p) => p.offerLetter?.documentUrl)
      .map((p) => ({ id: `offer-${p.id}`, kind: 'Offer Letter', title: `Offer — ${p.companyName}`, subtitle: p.jobRole, url: p.offerLetter.documentUrl })),
  ].filter((d) => d.url);

  return (
    <DataTable
      columns={[
        { header: 'Type', render: (d: any) => <StatusBadge status={d.kind} /> },
        { header: 'Title', render: (d: any) => <span className="font-medium">{d.title}</span> },
        { header: 'Detail', render: (d: any) => d.subtitle ?? '—' },
        {
          header: 'Action',
          render: (d: any) => (
            <div className="flex gap-2">
              <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" />View</a>
              <a href={d.url} download className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"><Download className="h-3.5 w-3.5" />Download</a>
            </div>
          ),
        },
      ]}
      data={docs}
      emptyTitle="No documents"
      emptyMessage="No certification, internship or offer documents with attached files."
    />
  );
}

function TimelineView({ student }: { student: any }) {
  const events: any[] = [
    { type: 'Admission', title: `Admitted to ${student.course?.courseName || 'program'}`, date: String(student.admissionYear || ''), icon: Users },
    ...asArray<any>(student.academicRecords).map((r) => ({ type: 'Academic', title: `Semester ${r.semester}`, subtitle: `SGPA ${Number(r.sgpa).toFixed(2)} · CGPA ${Number(r.cgpa).toFixed(2)}`, date: String(r.academicYear || ''), icon: BookOpen })),
    ...asArray<any>(student.skills).map((s) => ({ type: 'Skill', title: `Skill: ${s.skill?.skillName || ''}`, date: '', icon: Award })),
    ...asArray<any>(student.certifications).map((c) => ({ type: 'Certification', title: c.certificationName, date: c.issuingDate ? formatDate(c.issuingDate) : '', icon: Award })),
    ...asArray<any>(student.projects).map((p) => ({ type: 'Project', title: p.projectTitle, date: p.startDate ? formatDate(p.startDate) : '', icon: FolderGit2 })),
    ...asArray<any>(student.internships).map((i) => ({ type: 'Internship', title: `${i.role} at ${i.companyName}`, date: i.startDate ? formatDate(i.startDate) : '', icon: Building2 })),
    ...asArray<any>(student.placements).flatMap((p) => [
      { type: 'Drive', title: `Applied ${p.jobRole} at ${p.companyName}`, date: p.placementDate ? formatDate(p.placementDate) : '', icon: Briefcase },
      ...asArray<any>(p.rounds).map((r) => ({ type: 'Round', title: `${r.roundType} round`, subtitle: `Result: ${r.result}`, date: r.roundDate ? formatDate(r.roundDate) : '', icon: CircleDot })),
      ...(p.offerLetter ? [{ type: 'Offer', title: `Offer from ${p.companyName}`, subtitle: formatLpa(p.offerLetter.packageLpa), date: p.offerLetter.offerDate ? formatDate(p.offerLetter.offerDate) : '', icon: Trophy }] : []),
    ]),
    ...(student.graduationStatus === 'GRADUATED' ? [{ type: 'Graduation', title: 'Graduated', date: String(student.expectedYear || ''), icon: GraduationCap }] : []),
    ...asArray<any>(student.careerHistory).map((c) => ({ type: 'Career', title: `${c.jobTitle} at ${c.companyName}`, date: c.startDate ? formatDate(c.startDate) : '', icon: Mail })),
  ].sort((a, b) => {
    const at = !a.date ? 0 : new Date(a.date).getTime();
    const bt = !b.date ? 0 : new Date(b.date).getTime();
    return at - bt;
  });

  if (!events.length) return <Card><EmptyState title="No timeline" message="No records available." /></Card>;

  return (
    <Card className="p-5">
      <div className="relative ml-2 border-l-2 border-border pl-6">
        {events.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div key={i} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[38px] flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">{ev.type}</Badge>
                <span className="text-sm font-semibold text-foreground">{ev.title}</span>
                {ev.date && <span className="text-xs text-muted-foreground">{ev.date}</span>}
              </div>
              {ev.subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{ev.subtitle}</p>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function profileCompletion(student: any): number {
  const fields = [
    !!(student.courseId),
    asArray<any>(student.academicRecords).length > 0,
    asArray<any>(student.skills).length > 0,
    asArray<any>(student.certifications).length > 0,
    asArray<any>(student.projects).length > 0,
    asArray<any>(student.internships).length > 0,
    !!(student.address || student.gender),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
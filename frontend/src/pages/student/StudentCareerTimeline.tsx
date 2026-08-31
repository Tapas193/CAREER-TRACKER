import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, Badge, Loading, EmptyState } from '../../components/ui';
import { GraduationCap, BookOpen, Award, FolderGit2, Building2, Briefcase, CircleDot, Trophy, Users, CheckCircle2 } from 'lucide-react';
import { asArray, formatDate, formatLpa } from '../../utils/cn';
import type { Student } from '../../types';

interface TimelineEvent {
  type: string;
  title: string;
  subtitle?: string;
  date: string;
  tone: string;
}

export default function StudentCareerTimeline() {
  const { data, isLoading } = useApi<Student>(['student-timeline'], '/api/students/me');
  const student = data as any;

  if (isLoading) return <Loading label="Loading timeline…" />;
  if (!student) return <Card><EmptyState title="No data" message="No student profile found." /></Card>;

  const events: TimelineEvent[] = [
    { type: 'Admission', title: `Admitted to ${student.course?.courseName || 'the program'}`, subtitle: `Enrollment ${student.enrollmentNo}`, date: String(student.admissionYear), tone: 'blue' },
    ...asArray<any>(student.academicRecords).map((r) => ({
      type: 'Academic', title: `Semester ${r.semester}`, subtitle: `SGPA ${Number(r.sgpa).toFixed(2)} · CGPA ${Number(r.cgpa).toFixed(2)}`, date: String(r.academicYear), tone: 'slate',
    })),
    ...asArray<any>(student.skills).map((s) => ({
      type: 'Skill', title: `Skill added: ${s.skill?.skillName || ''}`, subtitle: s.skill?.category, date: '—', tone: 'purple',
    })),
    ...asArray<any>(student.certifications).map((c) => ({
      type: 'Certification', title: c.certificationName, subtitle: c.issuingOrganisation, date: formatDate(c.issuingDate), tone: 'amber',
    })),
    ...asArray<any>(student.projects).map((p) => ({
      type: 'Project', title: p.projectTitle, subtitle: p.technologyUsed, date: p.startDate ? formatDate(p.startDate) : '—', tone: 'teal',
    })),
    ...asArray<any>(student.internships).map((i) => ({
      type: 'Internship', title: `${i.role} at ${i.companyName}`, subtitle: i.stipend ? `₹${Number(i.stipend).toLocaleString('en-IN')}/mo` : undefined, date: formatDate(i.startDate), tone: 'cyan',
    })),
    ...asArray<any>(student.placements).flatMap((p) => [
      { type: 'Drive', title: `Applied for ${p.jobRole} at ${p.companyName}`, subtitle: formatLpa(p.packageLpa), date: formatDate(p.placementDate), tone: 'blue' },
      ...asArray<any>(p.rounds).map((r) => ({
        type: 'Round', title: `${r.roundType} round`, subtitle: `Result: ${r.result}`, date: formatDate(r.roundDate), tone: r.result === 'PENDING' ? 'slate' : r.result === 'REJECTED' || r.result === 'FAIL' ? 'red' : 'green',
      })),
      ...(p.offerLetter ? [{ type: 'Offer', title: `Offer from ${p.companyName}`, subtitle: formatLpa(p.offerLetter.packageLpa), date: formatDate(p.offerLetter.offerDate), tone: 'green' }] : []),
    ]),
    ...(student.graduationStatus === 'GRADUATED' ? [{ type: 'Graduation', title: 'Graduated', subtitle: `Class of ${student.expectedYear}`, date: String(student.expectedYear), tone: 'purple' }] : []),
    ...asArray<any>(student.careerHistory).map((c) => ({
      type: 'Career', title: `${c.jobTitle} at ${c.companyName}`, subtitle: c.currentJob ? 'Current job' : undefined, date: formatDate(c.startDate), tone: 'green',
    })),
  ].sort((a, b) => {
    const at = a.date === '—' ? 0 : new Date(a.date).getTime();
    const bt = b.date === '—' ? 0 : new Date(b.date).getTime();
    return at - bt;
  });

  const ICONS: Record<string, any> = {
    Admission: Users, Academic: BookOpen, Skill: Award, Certification: Award, Project: FolderGit2,
    Internship: Building2, Drive: Briefcase, Round: CircleDot, Offer: Trophy, Graduation: GraduationCap, Career: CheckCircle2,
  };
  const TONES: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700', slate: 'bg-slate-100 text-slate-700', purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700', teal: 'bg-teal-100 text-teal-700', cyan: 'bg-cyan-100 text-cyan-700', green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <PageHeader title="Career Timeline" subtitle={`From admission to ${student.currentStatus === 'ALUMNI' ? 'alumni life' : 'now'}`} />

      {events.length === 0 ? (
        <Card><EmptyState title="Nothing here yet" message="Complete your academic, skill and placement records to build your timeline." /></Card>
      ) : (
        <div className="relative ml-3 border-l-2 border-border pl-6">
          {events.map((ev, i) => {
            const Icon = ICONS[ev.type] ?? CircleDot;
            return (
              <div key={i} className="relative pb-6 last:pb-0">
                <span className={`absolute -left-[38px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background ${TONES[ev.tone] ?? 'bg-slate-100 text-slate-700'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={ev.tone as any}>{ev.type}</Badge>
                  <span className="text-sm font-semibold text-foreground">{ev.title}</span>
                  {ev.date && ev.date !== '—' && <span className="text-xs text-muted-foreground">{ev.date}</span>}
                </div>
                {ev.subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{ev.subtitle}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

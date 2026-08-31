import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardContent, Loading, StatCard } from '../../components/ui';
import { Medal, GraduationCap, Award, FolderGit2, Building2, Briefcase } from 'lucide-react';
import { asArray, formatDate } from '../../utils/cn';

const ACHIEVEMENT_CATEGORIES = [
  { key: 'academic', label: 'Academic', icon: GraduationCap, tone: 'blue' as const, note: 'Honors, distinctions and academic milestones.' },
  { key: 'certifications', label: 'Certifications', icon: Award, tone: 'purple' as const, note: 'Professional certifications you have earned.' },
  { key: 'projects', label: 'Projects', icon: FolderGit2, tone: 'teal' as const, note: 'Notable projects and contributions.' },
  { key: 'competitions', label: 'Competitions', icon: Medal, tone: 'amber' as const, note: 'Competition wins and participation.' },
  { key: 'internships', label: 'Internships', icon: Building2, tone: 'slate' as const, note: 'Internship accomplishments.' },
  { key: 'placement', label: 'Placement', icon: Briefcase, tone: 'green' as const, note: 'Placement and offer achievements.' },
];

export default function StudentAchievements() {
  const { data: me, isLoading } = useApi<any>(['student-me'], '/api/students/me');

  if (isLoading || !me) return <Loading label="Loading achievements…" />;

  const certifications = asArray<any>(me.certifications);
  const projects = asArray<any>(me.projects);
  const internships = asArray<any>(me.internships);
  const placements = asArray<any>(me.placements);
  const hasDerived = certifications.length > 0 || projects.length > 0 || internships.length > 0 || placements.length > 0;

  return (
    <div>
      <PageHeader title="Achievements" subtitle="Your academic and career milestones" />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Certifications" value={certifications.length} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Projects" value={projects.length} icon={<FolderGit2 className="h-4 w-4" />} />
        <StatCard label="Internships" value={internships.length} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Placements" value={placements.length} icon={<Briefcase className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {ACHIEVEMENT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const derived: { title: string; meta: string; tone: string }[] = [];
          if (cat.key === 'certifications') {
            for (const c of certifications) derived.push({ title: c.certificationName, meta: `${c.issuingOrganisation} · ${formatDate(c.issuingDate)}`, tone: 'purple' });
          }
          if (cat.key === 'projects') {
            for (const p of projects) derived.push({ title: p.projectTitle, meta: p.technologyUsed ?? 'Project', tone: 'teal' });
          }
          if (cat.key === 'internships') {
            for (const i of internships) derived.push({ title: `${i.role} @ ${i.companyName}`, meta: `Stipend: ₹${i.stipend ?? '—'}`, tone: 'slate' });
          }
          if (cat.key === 'placement') {
            for (const p of placements) derived.push({ title: `${p.jobRole} @ ${p.companyName}`, meta: `${p.placementStatus}${p.packageLpa ? ` · ${Number(p.packageLpa).toFixed(1)} LPA` : ''}`, tone: 'green' });
          }

          return (
            <Card key={cat.key}>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="h-4 w-4" /></div>
                  <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{cat.note}</p>
                <div className="mt-3 space-y-2">
                  {derived.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No achievements in this category yet.</p>
                  ) : (
                    derived.slice(0, 3).map((d, i) => (
                      <p key={i} className="text-sm">
                        <span className="font-medium text-foreground">{d.title}</span>
                        <span className="block text-xs text-muted-foreground">{d.meta}</span>
                      </p>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!hasDerived && (
        <Card className="mt-5">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Medal className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No achievements added yet</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Add achievements as you progress through your academic and career journey.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

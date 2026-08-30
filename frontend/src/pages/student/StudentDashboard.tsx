import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, CardContent, Loading } from '../../components/ui';
import { GraduationCap, Users, Briefcase, AlertTriangle, Award, FolderGit2, Building2, CheckCircle2 } from 'lucide-react';

interface StudentDashboardData {  currentCgpa: number | null;
  currentSemester: number;
  activeBacklogs: number;
  skillCount: number;
  certificationCount: number;
  projectCount: number;
  internshipCount: number;
  placementStatus: string;
  offerCount: number;
  profileCompletion: number;
}

export default function StudentDashboard() {
  const { data, isLoading } = useApi<StudentDashboardData>(['student-dashboard'], '/api/dashboard');

  if (isLoading || !data) return <Loading label="Loading dashboard…" />;

  const progress = Math.min(100, Number(data.profileCompletion) || 0);

  return (
    <div>
      <PageHeader title="Student Dashboard" subtitle="Your academic & placement snapshot" />

      <Card className="mb-5">
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile completion</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Current CGPA" value={data.currentCgpa != null ? Number(data.currentCgpa).toFixed(2) : '—'} icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="Semester" value={data.currentSemester} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Backlogs" value={data.activeBacklogs} icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="Placement Status" value={data.placementStatus ?? '—'} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Skills" value={data.skillCount} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Certifications" value={data.certificationCount} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Projects" value={data.projectCount} icon={<FolderGit2 className="h-4 w-4" />} />
        <StatCard label="Internships" value={data.internshipCount} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Offers" value={data.offerCount} icon={<Briefcase className="h-4 w-4" />} />
      </div>
    </div>
  );
}
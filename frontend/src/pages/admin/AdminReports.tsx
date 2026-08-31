import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, CardHeader, CardContent, Loading } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Users, GraduationCap, Briefcase, Award } from 'lucide-react';
import { asArray } from '../../utils/cn';
import PlacementReports from '../placement/PlacementReports';

const DEPT_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminReports() {
  const { data, isLoading } = useApi<any>(['admin-dashboard'], '/api/dashboard');

  const byDepartment = useMemo(() => asArray<any>(data?.byDepartment), [data]);

  if (isLoading) return <Loading label="Preparing reports…" />;

  const stats = [
    { label: 'Total Students', value: data?.totalStudents ?? 0, icon: <Users className="h-4 w-4" /> },
    { label: 'Active', value: data?.activeStudents ?? 0, icon: <Users className="h-4 w-4" /> },
    { label: 'Graduated', value: data?.graduatedStudents ?? 0, icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Alumni', value: data?.alumniCount ?? 0, icon: <Users className="h-4 w-4" /> },
    { label: 'Internships', value: data?.internshipCount ?? 0, icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Certifications', value: data?.certificationCount ?? 0, icon: <Award className="h-4 w-4" /> },
    { label: 'Placement Rate', value: `${data?.placementRate ?? 0}%`, icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Active Drives', value: data?.activeDrives ?? 0, icon: <Briefcase className="h-4 w-4" /> },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Institution-wide ERP analytics" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />)}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Students by Department" />
          <CardContent>
            {byDepartment.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No department data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byDepartment} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="courseName" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                  <Bar dataKey="studentCount" radius={[6, 6, 0, 0]}>
                    {byDepartment.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Department Totals" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Department</th>
                    <th className="px-4 py-2.5 font-medium">Course</th>
                    <th className="px-4 py-2.5 font-medium text-right">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {byDepartment.map((d) => (
                    <tr key={d.courseId}>
                      <td className="px-4 py-2.5 font-medium">{d.department}</td>
                      <td className="px-4 py-2.5">{d.courseName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{d.studentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5">
        <PlacementReports />
      </div>
    </div>
  );
}

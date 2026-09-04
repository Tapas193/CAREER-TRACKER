import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { PageHeader, StatCard, Card, CardHeader, CardContent, Loading } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Users, GraduationCap, Briefcase, Award } from 'lucide-react';
import { asArray } from '../../utils/cn';
import { CHART_COLORS, chartAxis, chartGrid, ChartCard, ChartTooltip, ChartEmpty } from '../../components/charts';
import PlacementReports from '../placement/PlacementReports';

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
        <ChartCard
          title="Students by Department"
          description="Distribution of students across departments"
          empty={<ChartEmpty title="No department data" message="Add students and courses to populate this chart." />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDepartment} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} vertical={false} />
              <XAxis dataKey="courseName" tick={chartAxis.tick} axisLine={{ stroke: chartGrid.stroke }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis tick={chartAxis.tick} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar dataKey="studentCount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {byDepartment.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

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
                    <tr key={d.courseId} className="transition-colors hover:bg-accent/40">
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

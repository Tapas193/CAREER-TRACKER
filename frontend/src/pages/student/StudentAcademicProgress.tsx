import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading, EmptyState, StatCard } from '../../components/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { GraduationCap, AlertTriangle, BarChart3, CheckCircle2 } from 'lucide-react';
import type { AcademicRecord, Backlog } from '../../types';
import { asArray } from '../../utils/cn';

export default function AcademicProgress() {
  const { data, isLoading } = useApi<AcademicRecord[]>(['academic-records'], '/api/academic-records');
  const { data: backlogData } = useApi<Backlog[]>(['backlogs-summary'], '/api/backlogs');

  if (isLoading) return <Loading label="Loading academic progress…" />;

  const records = asArray<AcademicRecord>(data).sort((a, b) => Number(a.semester) - Number(b.semester));
  const backlogs = asArray<Backlog>(backlogData);
  const latest = records.length ? records[records.length - 1] : null;
  const currentSemester = latest?.semester ?? 1;
  const activeBacklogs = backlogs.filter((b) => !b.clearedDate).length;
  const clearedBacklogs = backlogs.filter((b) => b.clearedDate).length;
  const totalCreditsEarned = records.reduce((s, r) => s + Number(r.creditsEarned || 0), 0);

  const chartData = records.map((r) => ({ semester: `Sem ${r.semester}`, CGPA: Number(r.cgpa), SGPA: Number(r.sgpa) }));

  return (
    <div>
      <PageHeader
        title="Academic Progress"
        subtitle="Track your CGPA, credits and academic standing over time"
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Current CGPA" value={latest ? Number(latest.cgpa).toFixed(2) : '—'} icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="Current Semester" value={currentSemester} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard label="Credits Earned" value={totalCreditsEarned} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Active Backlogs" value={activeBacklogs} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="CGPA / SGPA Trend" subtitle="Semester-wise progression" />
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState title="No academic records yet" message="Semester results will appear here as they are recorded." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="CGPA" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="SGPA" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Backlog Summary" subtitle="Cleared vs pending" />
          <CardContent>
            {backlogs.length === 0 ? (
              <EmptyState title="No backlogs" message="You have no backlog records. Great job!" />
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-semibold tabular-nums">{activeBacklogs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cleared</span>
                    <span className="font-semibold tabular-nums text-green-600">{clearedBacklogs}</span>
                  </div>
                </div>
                {activeBacklogs > 0 && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                    {activeBacklogs} subject{activeBacklogs > 1 ? 's' : ''} pending clearance. Review your backlogs page for details.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Semester Records" subtitle="Full academic history" />
        <CardContent>
          {records.length === 0 ? (
            <EmptyState title="No records" message="Add semester records from the Academics page." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Semester</th>
                    <th className="py-2 pr-4 font-semibold">Year</th>
                    <th className="py-2 pr-4 font-semibold">SGPA</th>
                    <th className="py-2 pr-4 font-semibold">CGPA</th>
                    <th className="py-2 pr-4 font-semibold">Credits</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-4 font-medium">Semester {r.semester}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{r.academicYear}</td>
                      <td className="py-2.5 pr-4 tabular-nums">{Number(r.sgpa).toFixed(2)}</td>
                      <td className="py-2.5 pr-4 tabular-nums">{Number(r.cgpa).toFixed(2)}</td>
                      <td className="py-2.5 pr-4 tabular-nums">{Number(r.creditsEarned)}/{Number(r.totalCredits)}</td>
                      <td className="py-2.5"><StatusBadge status={r.resultStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

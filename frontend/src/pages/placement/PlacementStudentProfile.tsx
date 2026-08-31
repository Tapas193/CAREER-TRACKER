import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading, EmptyState } from '../../components/ui';
import { useSearchParams } from 'react-router-dom';
import { formatDate, formatLpa, asArray } from '../../utils/cn';
import { Briefcase } from 'lucide-react';

export default function PlacementStudentProfile() {
  const [params, setParams] = useSearchParams();
  const selectedId = Number(params.get('student') ?? 0);

  const { data, isLoading } = useApi<any>(['placement-list'], '/api/placements');
  const all = asArray<any>(data?.items ?? data);

  const byStudent = new Map<number, any>();
  for (const p of all) {
    const sid = p.studentId;
    if (!byStudent.has(sid)) byStudent.set(sid, { student: p.student, placements: [] });
    byStudent.get(sid).placements.push(p);
  }
  const students = Array.from(byStudent.values());

  const current = students.find((s) => s.student?.id === selectedId) ?? students[selectedId === 0 ? (students[0] ?? null) : undefined] ?? null;

  if (isLoading) return <Loading label="Loading profiles…" />;

  return (
    <div>
      <PageHeader title="Student Placement Profile" subtitle="Placement-centric view of a student" />

      {students.length === 0 ? (
        <Card><EmptyState title="No placements" message="No student placements recorded yet." /></Card>
      ) : (
        <>
          <Card className="mb-4 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select student</span>
              <div className="flex flex-wrap gap-2">
                {students.map((s) => {
                  const st = s.student;
                  const active = selectedId === st?.id;
                  return (
                    <button
                      key={st?.id}
                      onClick={() => setParams({ student: String(st?.id) })}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${
                        active ? 'bg-primary text-primary-foreground ring-primary' : 'bg-background text-foreground ring-border hover:bg-accent'
                      }`}
                    >
                      {st?.firstName} {st?.lastName}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {current ? (
            <div className="space-y-4">
              <Card>
                <CardHeader
                  title={`${current.student.firstName} ${current.student.middleName ? `${current.student.middleName} ` : ''}${current.student.lastName}`}
                  subtitle={`${current.student.enrollmentNo ?? '—'} · ${current.placements.length} placement(s)`}
                  action={<StatusBadge status={current.student.currentStatus} />}
                />
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{current.student.course?.department ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Degree</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{current.student.course?.courseName ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Admission Year</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{current.student.admissionYear ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Year</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{current.student.expectedYear ?? '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {current.placements.map((p: any) => {
                const rounds = asArray<any>(p.rounds);
                return (
                  <Card key={p.id}>
                    <CardHeader
                      title={`${p.companyName} — ${p.jobRole}`}
                      subtitle={`${formatDate(p.placementDate)} · ${formatLpa(p.packageLpa)}${p.location ? ` · ${p.location}` : ''}`}
                      action={<StatusBadge status={p.placementStatus} />}
                    />
                    <CardContent>
                      {rounds.length > 0 ? (
                        <div className="overflow-x-auto rounded-md border border-border">
                          <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                              <tr>
                                <th className="px-4 py-2.5 font-medium">#</th>
                                <th className="px-4 py-2.5 font-medium">Type</th>
                                <th className="px-4 py-2.5 font-medium">Date</th>
                                <th className="px-4 py-2.5 font-medium">Result</th>
                                <th className="px-4 py-2.5 font-medium">Feedback</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {rounds.map((r) => (
                                <tr key={r.id}>
                                  <td className="px-4 py-2.5 tabular-nums">{r.roundNumber}</td>
                                  <td className="px-4 py-2.5">{r.roundType}</td>
                                  <td className="px-4 py-2.5">{formatDate(r.roundDate)}</td>
                                  <td className="px-4 py-2.5"><StatusBadge status={r.result} /></td>
                                  <td className="px-4 py-2.5">{r.feedback ? `${r.feedback.rating ?? '—'}/5${r.feedback.comments ? ` — ${r.feedback.comments}` : ''}` : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">No rounds yet.</p>
                      )}

                      {p.offerLetter && (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                          <Briefcase className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            <strong>Offer:</strong> {p.offerLetter.companyName} · {formatLpa(p.offerLetter.packageLpa)} on {formatDate(p.offerLetter.offerDate)}
                            {p.offerLetter.designation ? ` · ${p.offerLetter.designation}` : ''}
                            {p.offerLetter.joiningDate ? ` · Joining ${formatDate(p.offerLetter.joiningDate)}` : ''}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card><EmptyState title="No student selected" message="Select a student above to view their placement profile." /></Card>
          )}
        </>
      )}
    </div>
  );
}

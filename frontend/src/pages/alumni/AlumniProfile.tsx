import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Badge, StatusBadge, EmptyState, Loading } from '../../components/ui';
import { formatDate, formatLpa, asArray } from '../../utils/cn';
import type { Student } from '../../types';

export default function AlumniProfile() {
  const { data, isLoading } = useApi<Student>(['alumni-me'], '/api/students/me');

  if (isLoading || !data) return <Loading label="Loading profile…" />;

  const records = asArray<any>(data.academicRecords);
  const certs = asArray<any>(data.certifications);
  const projects = asArray<any>(data.projects);
  const internships = asArray<any>(data.internships);
  const placements = asArray<any>(data.placements);

  return (
    <div>
      <PageHeader
        title={`${data.firstName} ${data.middleName ?? ''} ${data.lastName}`}
        subtitle={`${data.enrollmentNo} · ${data.rollNumber}${data.course ? ` · ${data.course.courseName}` : ''}`}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={data.currentStatus} />
        <Badge tone={data.graduationStatus === 'GRADUATED' ? 'green' : 'amber'}>{data.graduationStatus ?? 'IN_PROGRESS'}</Badge>
        <span className="text-sm text-muted-foreground">Class of {data.expectedYear}</span>
      </div>

      <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
        Alumni profiles are read-only — this is your preserved student record for reference.
      </p>

      <Card className="mb-4">
        <CardHeader title="Academic History (Read Only)" />
        <CardContent>
          {records.length === 0 ? (
            <EmptyState message="No academic records" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Semester</th>
                    <th className="px-4 py-2.5 font-medium">Year</th>
                    <th className="px-4 py-2.5 font-medium">SGPA</th>
                    <th className="px-4 py-2.5 font-medium">CGPA</th>
                    <th className="px-4 py-2.5 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 text-foreground">{r.semester}</td>
                      <td className="px-4 py-2.5 text-foreground">{r.academicYear}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{Number(r.sgpa).toFixed(2)}</td>
                      <td className="px-4 py-2.5 font-medium tabular-nums text-foreground">{Number(r.cgpa).toFixed(2)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={r.resultStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Certifications (${certs.length})`} />
          <CardContent>
            {certs.length === 0 ? <EmptyState message="None" /> : (
              <ul className="space-y-2 text-sm">
                {certs.map((c) => (
                  <li key={c.id}>
                    <p className="font-medium text-foreground">{c.certificationName}</p>
                    <p className="text-muted-foreground">{c.issuingOrganisation} · {formatDate(c.issuingDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={`Internships (${internships.length})`} />
          <CardContent>
            {internships.length === 0 ? <EmptyState message="None" /> : (
              <ul className="space-y-2 text-sm">
                {internships.map((i) => (
                  <li key={i.id}>
                    <p className="font-medium text-foreground">{i.companyName}</p>
                    <p className="text-muted-foreground">{i.role} · {formatDate(i.startDate)} → {i.endDate ? formatDate(i.endDate) : 'Present'}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader title={`Projects (${projects.length})`} />
        <CardContent>
          {projects.length === 0 ? <EmptyState message="None" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Title</th>
                    <th className="px-4 py-2.5 font-medium">Tech</th>
                    <th className="px-4 py-2.5 font-medium">Team</th>
                    <th className="px-4 py-2.5 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2.5 font-medium text-foreground">{p.projectTitle}</td>
                      <td className="px-4 py-2.5 text-foreground">{p.technologyUsed ?? '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums text-foreground">{p.teamSize}</td>
                      <td className="px-4 py-2.5 text-foreground">{formatDate(p.startDate)} → {p.endDate ? formatDate(p.endDate) : 'Present'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Placement History (${placements.length})`} />
        <CardContent>
          {placements.length === 0 ? <EmptyState message="None" /> : (
            <div className="space-y-3">
              {placements.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{p.companyName} — {p.jobRole}</span>
                    <StatusBadge status={p.placementStatus} />
                    <span className="ml-auto text-muted-foreground">{formatDate(p.placementDate)} · {formatLpa(p.packageLpa)}</span>
                  </div>
                  {p.offerLetter && (
                    <div className="mt-1 text-green-700">Offer: {formatLpa(p.offerLetter.packageLpa)} on {formatDate(p.offerLetter.offerDate)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
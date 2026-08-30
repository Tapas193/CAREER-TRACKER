import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading, EmptyState } from '../../components/ui';
import { formatDate, formatLpa, asArray } from '../../utils/cn';
import type { Placement } from '../../types';

export default function StudentPlacements() {
  const { data, isLoading } = useApi<Placement[]>(['student-placements'], '/api/placements');
  const items = asArray<any>(data);

  return (
    <div>
      <PageHeader title="My Placements" subtitle="Placement drives you participated in" />
      {isLoading ? (
        <Loading label="Loading placements…" />
      ) : items.length === 0 ? (
        <Card><EmptyState title="No placements yet" message="You haven't participated in any placement drives." /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <Card key={p.id}>
              <CardHeader
                title={`${p.companyName} — ${p.jobRole}`}
                subtitle={`${formatDate(p.placementDate)} · ${formatLpa(p.packageLpa)}${p.location ? ` · ${p.location}` : ''}`}
                action={<StatusBadge status={p.placementStatus} />}
              />
              <CardContent>
                {p.description && <p className="mb-3 text-sm text-muted-foreground">{p.description}</p>}
                <p className="mb-2 text-sm font-semibold text-foreground">Rounds ({p.rounds?.length ?? 0})</p>
                {(p.rounds ?? []).length > 0 ? (
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
                        {(p.rounds ?? []).map((r: any) => (
                          <tr key={r.id}>
                            <td className="px-4 py-2.5">{r.roundNumber}</td>
                            <td className="px-4 py-2.5">{r.roundType}</td>
                            <td className="px-4 py-2.5">{formatDate(r.roundDate)}</td>
                            <td className="px-4 py-2.5"><StatusBadge status={r.result} /></td>
                            <td className="px-4 py-2.5">{r.feedback ? `${r.feedback?.rating ?? '—'}/5${r.feedback?.comments ? ` — ${r.feedback.comments}` : ''}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No rounds recorded yet.</p>
                )}
                {p.offerLetter && (
                  <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <strong>Offer received:</strong> {p.offerLetter.companyName} · {formatLpa(p.offerLetter.packageLpa)} on {formatDate(p.offerLetter.offerDate)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
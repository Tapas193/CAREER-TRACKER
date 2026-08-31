import { useApi } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, StatusBadge, Loading, EmptyState } from '../../components/ui';
import { formatDate, formatLpa, asArray } from '../../utils/cn';
import type { Placement } from '../../types';

const PIPELINE_STAGES = [
  { key: 'APPLIED', label: 'Applied', tone: 'blue' as const },
  { key: 'IN_PROGRESS', label: 'In Progress', tone: 'amber' as const },
  { key: 'SELECTED', label: 'Selected', tone: 'green' as const },
  { key: 'REJECTED', label: 'Rejected', tone: 'red' as const },
  { key: 'OFFER_RECEIVED', label: 'Offer', tone: 'green' as const },
];

export default function StudentPlacementTracker() {
  const { data, isLoading } = useApi<Placement[]>(['student-placements-tracker'], '/api/placements');
  const items = asArray<any>(data);

  if (isLoading) return <Loading label="Loading placement tracker…" />;

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Placement Tracker" subtitle="Visualize your placement journey" />
        <Card><EmptyState title="No placements yet" message="You haven't participated in any placement drives yet." /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Placement Tracker" subtitle="Your application flow across companies" />

      {items.map((p) => {
        const stageIndex = PIPELINE_STAGES.findIndex((s) => s.key === p.placementStatus);
        const rounds = asArray<any>(p.rounds).sort((a, b) => Number(a.roundNumber) - Number(b.roundNumber));
        const doneRounds = rounds.filter((r) => r.result !== 'PENDING');
        const progress = rounds.length ? Math.round((doneRounds.length / rounds.length) * 100) : stageIndex >= 0 ? ((stageIndex + 1) / PIPELINE_STAGES.length) * 100 : 0;

        return (
          <Card key={p.id} className="mb-4">
            <CardHeader
              title={`${p.companyName} — ${p.jobRole}`}
              subtitle={`${formatDate(p.placementDate)} · ${formatLpa(p.packageLpa)}${p.location ? ` · ${p.location}` : ''}`}
              action={<StatusBadge status={p.placementStatus} />}
            />
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Overall progress</span>
                <span className="text-xs font-semibold tabular-nums text-foreground">{progress}%</span>
              </div>
              <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {PIPELINE_STAGES.map((s, i) => {
                  const reached = i <= stageIndex || (stageIndex < 0 && false);
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset ${
                          reached ? 'bg-primary text-primary-foreground ring-primary' : 'bg-muted text-muted-foreground ring-border'
                        }`}
                      >
                        {reached ? '✓' : s.label.slice(0, 1)}
                        <span>{s.label}</span>
                      </div>
                      {i < PIPELINE_STAGES.length - 1 && <span aria-hidden className="text-border">→</span>}
                    </div>
                  );
                })}
              </div>

              {rounds.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-foreground">Rounds ({rounds.length})</p>
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
                </div>
              )}

              {p.offerLetter && (
                <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <strong>Offer received:</strong> {p.offerLetter.companyName} · {formatLpa(p.offerLetter.packageLpa)} on {formatDate(p.offerLetter.offerDate)}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

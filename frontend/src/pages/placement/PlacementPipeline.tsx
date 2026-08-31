import { useApi } from '../../hooks/useApi';
import { PageHeader, Loading } from '../../components/ui';
import { asArray } from '../../utils/cn';

type StageKey = 'ELIGIBLE' | 'APPLIED' | 'SHORTLISTED' | 'ASSESSMENT' | 'INTERVIEW' | 'SELECTED' | 'REJECTED' | 'OFFERED' | 'JOINED';

const STAGES: { key: StageKey; label: string; dot: string }[] = [
  { key: 'ELIGIBLE', label: 'Eligible', dot: 'bg-slate-400' },
  { key: 'APPLIED', label: 'Applied', dot: 'bg-blue-500' },
  { key: 'SHORTLISTED', label: 'Shortlisted', dot: 'bg-cyan-500' },
  { key: 'ASSESSMENT', label: 'Assessment', dot: 'bg-amber-500' },
  { key: 'INTERVIEW', label: 'Interview', dot: 'bg-orange-500' },
  { key: 'SELECTED', label: 'Selected', dot: 'bg-emerald-500' },
  { key: 'OFFERED', label: 'Offered', dot: 'bg-green-600' },
  { key: 'JOINED', label: 'Joined', dot: 'bg-teal-600' },
  { key: 'REJECTED', label: 'Rejected', dot: 'bg-red-500' },
];

const ASSESSMENT_TYPES = ['APTITUDE', 'CODING', 'ASSESSMENT'];
const INTERVIEW_TYPES = ['TECHNICAL', 'INTERVIEW_HR', 'HR', 'PANEL', 'INTERVIEW'];

function detailedStage(p: any): StageKey {
  if (p.placementStatus === 'OFFER_RECEIVED') {
    const joiningDate = p.offerLetter?.joiningDate;
    if (joiningDate && new Date(joiningDate).getTime() <= Date.now()) return 'JOINED';
    return 'OFFERED';
  }
  if (p.placementStatus === 'SELECTED') return 'SELECTED';
  if (p.placementStatus === 'REJECTED') return 'REJECTED';
  if (p.placementStatus === 'APPLIED') {
    const rounds = asArray<any>(p.rounds);
    if (rounds.length === 0) return 'APPLIED';
    // Any round started or scheduled but not decided yet => shortlisted past application
    const decided = rounds.filter((r) => r.result && r.result !== 'PENDING');
    if (decided.length === 0) return 'SHORTLISTED';
  }
  if (p.placementStatus === 'IN_PROGRESS') {
    const rounds = asArray<any>(p.rounds).sort((a, b) => Number(a.roundNumber) - Number(b.roundNumber));
    const active = rounds.find((r) => !r.result || r.result === 'PENDING') ?? rounds[rounds.length - 1];
    const type = active?.roundType ?? '';
    if (INTERVIEW_TYPES.includes(type)) return 'INTERVIEW';
    if (ASSESSMENT_TYPES.includes(type)) return 'ASSESSMENT';
    const cleared = rounds.filter((r) => r.result === 'CLEARED' || r.result === 'PASS').length;
    return cleared > 0 ? 'INTERVIEW' : 'SHORTLISTED';
  }
  return 'APPLIED';
}

export default function PlacementPipeline() {
  const { data, isLoading } = useApi<any>(['placement-pipeline'], '/api/placements');
  const { data: eligibleData } = useApi<any[]>(['eligible-students'], '/api/placements/eligible-students');

  const items = asArray<any>(data?.items ?? data);
  const eligible = asArray<any>(eligibleData);

  if (isLoading) return <Loading label="Loading pipeline…" />;

  const placedStudentIds = new Set(items.map((p) => p.studentId));
  const pools: Record<StageKey, any[]> = {
    ELIGIBLE: eligible.filter((s) => !placedStudentIds.has(s.id)),
    APPLIED: [], SHORTLISTED: [], ASSESSMENT: [], INTERVIEW: [], SELECTED: [], REJECTED: [], OFFERED: [], JOINED: [],
  };
  for (const p of items) pools[detailedStage(p)].push(p);

  return (
    <div>
      <PageHeader title="Placement Pipeline" subtitle="Students by stage across all placement drives" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((stage) => {
          const list = pools[stage.key] ?? [];
          return (
            <div key={stage.key} className="rounded-lg bg-muted/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                  {stage.label}
                </span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{list.length}</span>
              </div>

              <div className="space-y-2">
                {list.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">Empty</p>
                ) : (
                  list.map((p, i) => {
                    const student = p.student ?? { firstName: p.firstName, lastName: p.lastName };
                    const sub = stage.key === 'ELIGIBLE'
                      ? `${student.department ?? ''} · ${student.currentSemester ?? ''}`
                      : `${p.companyName} — ${p.jobRole}`;
                    return (
                      <div key={p.id ?? i} className="rounded-md border border-border bg-background p-3 shadow-sm">
                        <p className="text-sm font-medium text-foreground">{student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>
                        {stage.key !== 'ELIGIBLE' && (
                          <p className="mt-2 text-xs tabular-nums text-muted-foreground">{asArray(p.rounds).length} round(s)</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

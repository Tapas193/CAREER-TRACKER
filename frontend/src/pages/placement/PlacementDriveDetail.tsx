import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Button, Input, Select, StatusBadge, Loading, Modal, FormField, Toast, EmptyState } from '../../components/ui';
import { formatDate, formatLpa, asArray } from '../../utils/cn';
import { Plus, ChevronDown, ChevronUp, FilePlus2 } from 'lucide-react';

const ROUND_TYPES = ['APTITUDE', 'TECHNICAL', 'HR', 'CODING', 'GROUP_DISCUSSION', 'OTHER'];
const ROUND_RESULTS = ['PENDING', 'CLEARED', 'REJECTED', 'ON_HOLD'];

const emptyRound = { roundNumber: '', roundType: '', roundDate: '', result: 'PENDING' };

export default function PlacementDriveDetail() {
  const [params, setParams] = useSearchParams();
  const selectedIdx = Number(params.get('drive') ?? '-1');

  const { data, isLoading } = useApi<any[]>(['placement-drives'], '/api/placements/drives');
  const drives = asArray<any>(data);

  const drive = drives[selectedIdx];
  const participants = asArray<any>(drive?.participants);

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [roundFor, setRoundFor] = useState<number | null>(null);
  const [offerFor, setOfferFor] = useState<number | null>(null);
  const [round, setRound] = useState<any>(emptyRound);
  const [offer, setOffer] = useState<any>({ companyName: '', packageLpa: '', offerDate: '', designation: '', location: '' });
  const [msg, setMsg] = useState('');

  const addRound = useApiMutation<any>('/api/placements', 'post', ['placement-drives', 'placement-dashboard']);
  const addOffer = useApiMutation<any>('/api/placements', 'post', ['placement-drives', 'placement-dashboard']);

  const toggle = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const submitRound = async (placementId: number) => {
    if (!round.roundNumber || !round.roundType || !round.roundDate) { setMsg('Fill all round fields'); return; }
    try {
      await addRound.mutateAsync({ ...round, placementId, roundNumber: Number(round.roundNumber), result: round.result || 'PENDING' });
      setMsg('Round added'); setRoundFor(null); setRound(emptyRound);
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) { setMsg(e.message); }
  };

  const submitOffer = async (placementId: number) => {
    if (!offer.companyName || !offer.packageLpa || !offer.offerDate) { setMsg('Fill offer fields'); return; }
    try {
      await addOffer.mutateAsync({ placementId, ...offer, packageLpa: Number(offer.packageLpa) });
      setMsg('Offer added'); setOfferFor(null); setOffer({ companyName: '', packageLpa: '', offerDate: '', designation: '', location: '' });
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) { setMsg(e.message); }
  };

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('fill') || msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}

      <PageHeader title="Drive Detail" subtitle="Manage rounds and offers per participant" />

      {isLoading ? (
        <Loading label="Loading drives…" />
      ) : (
        <>
          {drives.length === 0 ? (
            <Card><EmptyState title="No drives" message="Create a placement drive to manage participants." /></Card>
          ) : (
            <>
              <Card className="mb-4 px-5 py-4">
                <FormField label="Select drive">
                  <Select
                    value={selectedIdx}
                    onChange={(e) => setParams({ drive: String(Number(e.target.value)) })}
                  >
                    <option value="-1">Choose a drive…</option>
                    {drives.map((d, i) => (
                      <option key={i} value={i}>{d.companyName} — {d.jobRole} · {formatDate(d.placementDate)} ({d.participantCount})</option>
                    ))}
                  </Select>
                </FormField>
              </Card>

              {drive && (
                <>
                  <Card className="mb-4">
                    <CardHeader
                      title={`${drive.companyName} — ${drive.jobRole}`}
                      subtitle={`${formatDate(drive.placementDate)} · ${formatLpa(drive.packageLpa)}${drive.location ? ` · ${drive.location}` : ''} · ${participants.length} participant(s)`}
                    />
                  </Card>

                  {participants.length === 0 ? (
                    <Card><EmptyState title="No participants" message="No students are part of this drive yet." /></Card>
                  ) : (
                    <div className="space-y-4">
                      {participants.map((p) => {
                        const rounds = asArray<any>(p.rounds);
                        const isOpen = expanded[p.id];
                        return (
                          <Card key={p.id}>
                            <CardContent className="p-0">
                              <button onClick={() => toggle(p.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-accent/40">
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground">{p.student?.firstName} {p.student?.middleName ? `${p.student.middleName} ` : ''}{p.student?.lastName}</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{p.student?.enrollmentNo ?? `Student #${p.studentId}`} · {rounds.length} round(s) · {formatLpa(p.packageLpa)}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                  <StatusBadge status={p.placementStatus} />
                                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </div>
                              </button>

                              {isOpen && (
                                <div className="border-t border-border px-5 py-4">
                                  {rounds.length > 0 && (
                                    <div className="mb-4 overflow-x-auto rounded-md border border-border">
                                      <table className="w-full text-sm">
                                        <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                                          <tr>
                                            <th className="px-4 py-2 font-medium">#</th>
                                            <th className="px-4 py-2 font-medium">Type</th>
                                            <th className="px-4 py-2 font-medium">Date</th>
                                            <th className="px-4 py-2 font-medium">Result</th>
                                            <th className="px-4 py-2 font-medium">Feedback</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {rounds.map((r) => (
                                            <tr key={r.id}>
                                              <td className="px-4 py-2 tabular-nums">{r.roundNumber}</td>
                                              <td className="px-4 py-2">{r.roundType}</td>
                                              <td className="px-4 py-2">{formatDate(r.roundDate)}</td>
                                              <td className="px-4 py-2"><StatusBadge status={r.result} /></td>
                                              <td className="px-4 py-2">{r.feedback ? `${r.feedback.rating ?? '—'}/5${r.feedback.comments ? ` — ${r.feedback.comments}` : ''}` : '—'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {p.offerLetter && (
                                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
                                      Offer: {p.offerLetter.companyName} · {formatLpa(p.offerLetter.packageLpa)} · {formatDate(p.offerLetter.offerDate)}
                                    </div>
                                  )}

                                  <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => { setRoundFor(p.id); setRound({ ...emptyRound, roundNumber: String(rounds.length + 1) }); }}><Plus className="h-4 w-4" />Add Round</Button>
                                    {p.offerLetter ? (
                                      <Button size="sm" variant="outline" disabled><FilePlus2 className="h-4 w-4" />Offer Added</Button>
                                    ) : (
                                      <Button size="sm" variant="outline" onClick={() => { setOfferFor(p.id); setOffer({ ...offer, companyName: p.companyName, packageLpa: p.packageLpa }); }}><FilePlus2 className="h-4 w-4" />Add Offer</Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      <Modal
        open={roundFor !== null}
        onClose={() => setRoundFor(null)}
        title="Add Round"
        description="Add a new interview round for this participant."
        footer={<Button onClick={() => roundFor !== null && submitRound(roundFor)} disabled={addRound.isPending}>{addRound.isPending ? 'Saving…' : 'Add Round'}</Button>}
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (roundFor !== null) submitRound(roundFor); }}>
          <FormField label="Round No." required>
            <Input type="number" min={1} value={round.roundNumber} onChange={(e) => setRound({ ...round, roundNumber: e.target.value })} required />
          </FormField>
          <FormField label="Type" required>
            <Select value={round.roundType} onChange={(e) => setRound({ ...round, roundType: e.target.value })} required>
              <option value="">Select…</option>
              {ROUND_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </Select>
          </FormField>
          <FormField label="Round Date" required>
            <Input type="date" value={round.roundDate} onChange={(e) => setRound({ ...round, roundDate: e.target.value })} required />
          </FormField>
          <FormField label="Result">
            <Select value={round.result} onChange={(e) => setRound({ ...round, result: e.target.value })}>
              {ROUND_RESULTS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </Select>
          </FormField>
        </form>
      </Modal>

      <Modal
        open={offerFor !== null}
        onClose={() => setOfferFor(null)}
        title="Add Offer Letter"
        description="Record an offer for this participant."
        footer={<Button onClick={() => offerFor !== null && submitOffer(offerFor)} disabled={addOffer.isPending}>{addOffer.isPending ? 'Saving…' : 'Add Offer'}</Button>}
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (offerFor !== null) submitOffer(offerFor); }}>
          <FormField label="Company" required>
            <Input value={offer.companyName} onChange={(e) => setOffer({ ...offer, companyName: e.target.value })} required />
          </FormField>
          <FormField label="Package (LPA)" required>
            <Input type="number" step="0.01" value={offer.packageLpa} onChange={(e) => setOffer({ ...offer, packageLpa: e.target.value })} required />
          </FormField>
          <FormField label="Offer Date" required>
            <Input type="date" value={offer.offerDate} onChange={(e) => setOffer({ ...offer, offerDate: e.target.value })} required />
          </FormField>
          <FormField label="Designation">
            <Input value={offer.designation} onChange={(e) => setOffer({ ...offer, designation: e.target.value })} />
          </FormField>
          <FormField label="Location" className="sm:col-span-2">
            <Input value={offer.location} onChange={(e) => setOffer({ ...offer, location: e.target.value })} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

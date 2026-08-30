import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, Select, StatusBadge, DataTable, ActionMenu, Modal, FormField, Toast, type MenuItem } from '../../components/ui';
import { formatDate, formatLpa } from '../../utils/cn';
import type { Placement } from '../../types';

const STATUS_OPTIONS = ['APPLIED', 'IN_PROGRESS', 'SELECTED', 'REJECTED', 'OFFER_RECEIVED'];
const ROUND_TYPES = ['APPLICATION', 'APTITUDE', 'TECHNICAL', 'INTERVIEW_HR'];
const ROUND_RESULTS = ['PENDING', 'PASS', 'FAIL', 'SELECTED', 'REJECTED'];

export default function PlacementList() {
  const { data, isLoading, refetch } = useApi<{ items: Placement[]; total: number }>(['placement-list'], '/api/placements');
  const [msg, setMsg] = useState('');
  const [roundTarget, setRoundTarget] = useState<Placement | null>(null);
  const [roundForm, setRoundForm] = useState({ roundType: '', roundDate: '', result: 'PENDING' });
  const [saving, setSaving] = useState(false);

  const items = (data as any)?.items ?? [];

  const roundMenu = (p: Placement): MenuItem[] => [
    { label: 'Add round', onClick: () => { setRoundForm({ roundType: '', roundDate: '', result: 'PENDING' }); setRoundTarget(p); } },
  ];

  const addRound = async () => {
    if (!roundTarget) return;
    if (!roundForm.roundType || !roundForm.roundDate) {
      setMsg('Round type and date are required');
      return;
    }
    setSaving(true);
    const rounds = items.find((p: any) => p.id === roundTarget.id)?.rounds ?? [];
    const roundNumber = rounds.length + 1;
    try {
      await api.post(`/api/placements/${roundTarget.id}/rounds`, {
        placementId: roundTarget.id,
        roundNumber,
        roundType: roundForm.roundType,
        roundDate: roundForm.roundDate,
        result: roundForm.result,
      });
      setMsg('Round added');
      setRoundTarget(null);
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (placementId: number, placementStatus: string) => {
    try {
      await api.patch(`/api/placements/${placementId}`, { placementStatus });
      setMsg('Status updated');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') || msg.toLowerCase().includes('required') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader title="Placements" subtitle="Manage placement records, rounds, results and offers" />

      <Card>
        <DataTable
          columns={[
            { header: 'Student', render: (p: any) => <span className="font-medium">{p.student ? `${p.student.firstName} ${p.student.lastName}` : p.studentId}</span> },
            { header: 'Company', render: (p: any) => p.companyName },
            { header: 'Role', render: (p: any) => p.jobRole },
            { header: 'Package', render: (p: any) => <span className="tabular-nums">{formatLpa(p.packageLpa)}</span> },
            { header: 'Date', render: (p: any) => formatDate(p.placementDate) },
            {
              header: 'Status',
              render: (p: any) => (
                <Select value={String(p.placementStatus ?? '')} onChange={(e) => updateStatus(p.id, e.target.value)} className="h-7 w-36 py-0 text-xs" aria-label={`Update status for ${p.companyName}`}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              ),
            },
            { header: 'Rounds', render: (p: any) => <span className="tabular-nums">{p.rounds?.length ?? 0}</span> },
            {
              header: '',
              className: 'text-right',
              render: (p: any) => <ActionMenu a11yLabel={`Actions for ${p.companyName} placement`} items={roundMenu(p)} />,
            },
          ]}
          data={items}
          loading={isLoading}
          onRetry={refetch}
          emptyTitle="No placements"
          emptyMessage="Create a placement drive to begin recording placements."
        />
      </Card>

      <Modal
        open={!!roundTarget}
        onClose={() => setRoundTarget(null)}
        title={roundTarget ? `Add Round — ${roundTarget.companyName} (${roundTarget.jobRole})` : 'Add Round'}
        description="Record a round for this placement."
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setRoundTarget(null)} disabled={saving}>Cancel</Button>
            <Button onClick={addRound} disabled={saving}>{saving ? 'Saving…' : 'Add Round'}</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Round Type" required>
            <Select value={roundForm.roundType} onChange={(e) => setRoundForm({ ...roundForm, roundType: e.target.value })}>
              <option value="">Select type</option>
              {ROUND_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormField>
          <FormField label="Round Date" required>
            <Input type="date" value={roundForm.roundDate} onChange={(e) => setRoundForm({ ...roundForm, roundDate: e.target.value })} />
          </FormField>
          <FormField label="Result" className="sm:col-span-2">
            <Select value={roundForm.result} onChange={(e) => setRoundForm({ ...roundForm, result: e.target.value })}>
              {ROUND_RESULTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="mt-4">
          {!roundTarget || (roundTarget.rounds ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No rounds recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Result</th>
                    <th className="px-3 py-2 font-medium">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(roundTarget?.rounds ?? []).map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2">{r.roundNumber}</td>
                      <td className="px-3 py-2 text-foreground">{r.roundType}</td>
                      <td className="px-3 py-2 text-foreground">{formatDate(r.roundDate)}</td>
                      <td className="px-3 py-2"><StatusBadge status={r.result} /></td>
                      <td className="px-3 py-2 text-foreground">{r.remark ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
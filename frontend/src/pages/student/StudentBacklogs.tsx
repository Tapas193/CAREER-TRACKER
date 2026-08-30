import { useState } from 'react';
import type { FormEvent } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, Select, DataTable, StatusBadge, Loading, Modal, FormField, ConfirmDialog, ActionMenu, Toast, type MenuItem } from '../../components/ui';
import { CheckCircle2, Plus } from 'lucide-react';
import type { Backlog } from '../../types';
import { asArray } from '../../utils/cn';

const empty = { attemptedNo: 1, semester: 1, subject: '', status: 'PENDING', clearedDate: '', attemptedAgain: false };

export default function StudentBacklogs() {
  const { data, refetch, isLoading } = useApi<Backlog[]>(['backlogs'], '/api/backlogs');
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [clearTarget, setClearTarget] = useState<Backlog | null>(null);

  const items = asArray<any>(data);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/backlogs', { subject: form.subject, semester: Number(form.semester), attemptedNo: Number(form.attemptedNo), status: form.status, clearedDate: form.clearedDate || null, attemptedAgain: !!form.attemptedAgain });
      setMsg('Backlog added');
      setForm(empty);
      setShowForm(false);
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (!clearTarget) return;
    setSaving(true);
    try {
      await api.patch(`/api/backlogs/${clearTarget.id}`, { status: 'CLEARED', clearedDate: new Date().toISOString().slice(0, 10) });
      setMsg('Backlog marked as cleared');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
    setClearTarget(null);
    setSaving(false);
  };

  const actionsFor = (b: Backlog): MenuItem[] => b.status !== 'CLEARED'
    ? [{ label: 'Mark cleared', icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => setClearTarget(b) }]
    : [];

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Backlogs"
        subtitle="Track subjects pending or cleared"
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Backlog</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading backlogs…" />}

      {(!isLoading || items.length > 0) && (
        <Card>
          <DataTable
            columns={[
              { header: 'Subject', render: (b: any) => <span className="font-medium">{b.subject}</span> },
              { header: 'Semester', render: (b: any) => b.semester },
              { header: 'Attempt', render: (b: any) => b.attemptedNo },
              { header: 'Re-attempt?', render: (b: any) => (b.attemptedAgain ? 'Yes' : 'No') },
              { header: 'Status', render: (b: any) => <StatusBadge status={b.status} /> },
              { header: 'Cleared', render: (b: any) => (b.clearedDate ? b.clearedDate.slice(0, 10) : '—') },
              {
                header: '',
                className: 'text-right',
                render: (b: any) => (b.status !== 'CLEARED' ? <ActionMenu a11yLabel={`Actions for ${b.subject}`} items={actionsFor(b)} /> : <span className="text-muted-foreground" />),
              },
            ]}
            data={items}
            emptyTitle="No backlogs"
            emptyMessage="You have no backlog records. Great work!"
          />
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Backlog"
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="backlog-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="backlog-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Subject" required className="sm:col-span-2">
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </FormField>
          <FormField label="Semester" required>
            <Input type="number" min={1} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </FormField>
          <FormField label="Attempt Number" required>
            <Input type="number" min={1} value={form.attemptedNo} onChange={(e) => setForm({ ...form, attemptedNo: e.target.value })} />
          </FormField>
          <FormField label="Status" required>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PENDING">PENDING</option>
              <option value="CLEARED">CLEARED</option>
            </Select>
          </FormField>
          <FormField label="Cleared Date">
            <Input type="date" value={form.clearedDate} onChange={(e) => setForm({ ...form, clearedDate: e.target.value })} />
          </FormField>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={!!form.attemptedAgain} onChange={(e) => setForm({ ...form, attemptedAgain: e.target.checked })} className="h-4 w-4 rounded border-border text-primary" id="reattempt" />
            <label htmlFor="reattempt" className="text-sm text-foreground">Attempted again later</label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!clearTarget}
        title="Mark backlog cleared?"
        message={`Mark "${clearTarget?.subject}" as cleared?`}
        confirmLabel="Mark Cleared"
        loading={saving}
        onConfirm={clear}
        onCancel={() => setClearTarget(null)}
      />
    </div>
  );
}
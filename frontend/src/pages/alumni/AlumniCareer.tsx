import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, DataTable, Loading, Modal, FormField, Badge, ConfirmDialog, ActionMenu, Toast, type MenuItem } from '../../components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { CareerHistory } from '../../types';

const empty = { companyName: '', jobTitle: '', role: '', startDate: '', endDate: '', location: '', currentJob: false };

export default function AlumniCareer() {
  const { data, refetch, isLoading } = useApi<CareerHistory[]>(['career-history'], '/api/career-history');
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerHistory | null>(null);

  const items = asArray<any>(data);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/career-history', {
        companyName: form.companyName, jobTitle: form.jobTitle, role: form.role,
        startDate: form.startDate, location: form.location,
        endDate: form.currentJob ? null : form.endDate || null,
        currentJob: !!form.currentJob,
      });
      setMsg('Career entry added');
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

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.delete(`/api/career-history/${deleteTarget.id}`);
      setMsg('Entry removed');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
    setDeleteTarget(null);
    setSaving(false);
  };

  const actionsFor = (c: any): MenuItem[] => [
    { label: 'Remove', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setDeleteTarget(c) },
  ];

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Career History"
        subtitle="Add jobs you've held after graduation"
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Job</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading career history…" />}

      {(!isLoading || items.length > 0) && (
        <Card>
          <DataTable
            columns={[
              {
                header: 'Company',
                render: (c: any) => (
                  <span className="font-medium text-foreground">
                    {c.companyName} {c.currentJob && <Badge tone="green" className="ml-1.5">Current</Badge>}
                  </span>
                ),
              },
              { header: 'Role', render: (c: any) => c.jobTitle },
              { header: 'Location', render: (c: any) => c.location ?? '—' },
              { header: 'From', render: (c: any) => formatDate(c.startDate) },
              { header: 'To', render: (c: any) => (c.endDate ? formatDate(c.endDate) : 'Present') },
              {
                header: '',
                className: 'text-right',
                render: (c: any) => <ActionMenu a11yLabel={`Actions for ${c.companyName} entry`} items={actionsFor(c)} />,
              },
            ]}
            data={items}
            emptyTitle="No career entries"
            emptyMessage="Add your first post-graduation job."
          />
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Career Entry"
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="career-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="career-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Company" required>
            <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          </FormField>
          <FormField label="Job Title" required>
            <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required />
          </FormField>
          <FormField label="Role / Designation" className="sm:col-span-2">
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </FormField>
          <FormField label="Location" className="sm:col-span-2">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </FormField>
          <FormField label="Start Date" required>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          </FormField>
          <FormField label="End Date" hint={form.currentJob ? 'Cleared: marked as current job' : undefined}>
            <Input type="date" value={form.endDate} disabled={form.currentJob} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </FormField>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={!!form.currentJob} onChange={(e) => setForm({ ...form, currentJob: e.target.checked })} className="h-4 w-4 rounded border-border text-primary" id="current-job" />
            <label htmlFor="current-job" className="text-sm text-foreground">This is my current job</label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove career entry?"
        message={`Remove the entry at "${deleteTarget?.companyName}"?`}
        confirmLabel="Remove"
        destructive
        loading={saving}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
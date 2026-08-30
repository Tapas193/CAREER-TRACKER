import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, DataTable, Loading, Modal, FormField, ConfirmDialog, ActionMenu, Toast, type MenuItem } from '../../components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { Internship } from '../../types';

const empty = { companyName: '', role: '', startDate: '', endDate: '', stipend: '', certificateUrl: '' };

export default function StudentInternships() {
  const { data, refetch, isLoading } = useApi<Internship[]>(['internships'], '/api/internships');
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);

  const items = asArray<any>(data);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/internships', { companyName: form.companyName, role: form.role, startDate: form.startDate, endDate: form.endDate || null, stipend: form.stipend ? Number(form.stipend) : null, certificateUrl: form.certificateUrl });
      setMsg('Internship added');
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
      await api.delete(`/api/internships/${deleteTarget.id}`);
      setMsg('Internship removed');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
    setDeleteTarget(null);
    setSaving(false);
  };

  const actionsFor = (i: any): MenuItem[] => [
    { label: 'Remove', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setDeleteTarget(i) },
  ];

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Internships"
        subtitle={`${items.length} internships`}
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Internship</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading internships…" />}

      {(!isLoading || items.length > 0) && (
        <Card>
          <DataTable
            columns={[
              {
                header: 'Company',
                render: (i: any) => i.certificateUrl
                  ? <a href={i.certificateUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{i.companyName}</a>
                  : <span className="font-medium">{i.companyName}</span>,
              },
              { header: 'Role', render: (i: any) => i.role },
              { header: 'Duration', render: (i: any) => `${formatDate(i.startDate)} → ${i.endDate ? formatDate(i.endDate) : 'Present'}` },
              { header: 'Stipend', render: (i: any) => (i.stipend ? <span className="tabular-nums">₹{Number(i.stipend).toLocaleString('en-IN')}/mo</span> : '—') },
              {
                header: '',
                className: 'text-right',
                render: (i: any) => <ActionMenu a11yLabel={`Actions for ${i.companyName}`} items={actionsFor(i)} />,
              },
            ]}
            data={items}
            emptyTitle="No internships"
            emptyMessage="Add internships you've completed to showcase practical experience."
          />
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Internship"
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="internship-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="internship-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Company" required>
            <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          </FormField>
          <FormField label="Role" required>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          </FormField>
          <FormField label="Start Date" required>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </FormField>
          <FormField label="Stipend (₹/month)">
            <Input type="number" min={0} value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
          </FormField>
          <FormField label="Certificate URL">
            <Input value={form.certificateUrl} onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })} />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove internship?"
        message={`Remove the internship at "${deleteTarget?.companyName}"?`}
        confirmLabel="Remove"
        destructive
        loading={saving}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
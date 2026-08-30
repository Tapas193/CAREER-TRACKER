import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, DataTable, Loading, Modal, FormField, ConfirmDialog, ActionMenu, Toast, type MenuItem } from '../../components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { Certification } from '../../types';

const empty = { certificationName: '', issuingOrganisation: '', issuingDate: '', expiryDate: '', certificationUrl: '' };

export default function StudentCertifications() {
  const { data, refetch, isLoading } = useApi<Certification[]>(['certifications'], '/api/certifications');
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);

  const items = asArray<any>(data);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/certifications', form);
      setMsg('Certification added');
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
      await api.delete(`/api/certifications/${deleteTarget.id}`);
      setMsg('Certification removed');
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
        title="Certifications"
        subtitle={`${items.length} certifications recorded`}
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Certification</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading certifications…" />}

      {(!isLoading || items.length > 0) && (
        <Card>
          <DataTable
            columns={[
              {
                header: 'Name',
                render: (c: any) => c.certificationUrl
                  ? <a href={c.certificationUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{c.certificationName}</a>
                  : <span className="font-medium">{c.certificationName}</span>,
              },
              { header: 'Organisation', render: (c: any) => c.issuingOrganisation },
              { header: 'Issued', render: (c: any) => formatDate(c.issuingDate) },
              { header: 'Expiry', render: (c: any) => (c.expiryDate ? formatDate(c.expiryDate) : 'Never') },
              {
                header: '',
                className: 'text-right',
                render: (c: any) => <ActionMenu a11yLabel={`Actions for ${c.certificationName}`} items={actionsFor(c)} />,
              },
            ]}
            data={items}
            emptyTitle="No certifications"
            emptyMessage="Add credentials you've earned to strengthen your profile."
          />
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Certification"
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="cert-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="cert-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Certification Name" required className="sm:col-span-2">
            <Input value={form.certificationName} onChange={(e) => setForm({ ...form, certificationName: e.target.value })} required />
          </FormField>
          <FormField label="Issuing Organisation" required className="sm:col-span-2">
            <Input value={form.issuingOrganisation} onChange={(e) => setForm({ ...form, issuingOrganisation: e.target.value })} required />
          </FormField>
          <FormField label="Issue Date" required>
            <Input type="date" value={form.issuingDate} onChange={(e) => setForm({ ...form, issuingDate: e.target.value })} required />
          </FormField>
          <FormField label="Expiry Date">
            <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </FormField>
          <FormField label="Certificate URL" className="sm:col-span-2">
            <Input value={form.certificationUrl} onChange={(e) => setForm({ ...form, certificationUrl: e.target.value })} />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove certification?"
        message={`Remove "${deleteTarget?.certificationName}" from your profile?`}
        confirmLabel="Remove"
        destructive
        loading={saving}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
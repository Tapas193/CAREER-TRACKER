import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import {
  PageHeader, Card, Button, Input, DataTable, Badge, Loading,
  ConfirmDialog, Toast, Modal, FormField, ActionMenu, type MenuItem,
} from '../../components/ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { asArray } from '../../utils/cn';
import type { Skill } from '../../types';

const emptyForm = { skillName: '', category: '' };

export default function AdminSkills() {
  const { data, isLoading, refetch } = useApi<Skill[]>(['skills'], '/api/skills');
  const items = asArray<any>(data);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Skill | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };
  const openEdit = (c: Skill) => { setEditing(c); setForm({ skillName: c.skillName, category: c.category ?? '' }); setShowForm(true); setError(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = { skillName: form.skillName, category: form.category || null };
    try {
      if (editing) { await api.patch(`/api/skills/${editing.id}`, payload); notify('Skill updated'); }
      else { await api.post('/api/skills', payload); notify('Skill created'); }
      setShowForm(false); refetch();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await api.delete(`/api/skills/${confirmDelete.id}`); notify('Skill deleted'); refetch(); }
    catch (e: any) { notify(e.message); }
    setConfirmDelete(null);
  };

  const actionsFor = (c: any): MenuItem[] => [
    { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(c) },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setConfirmDelete(c) },
  ];

  if (isLoading) return <Loading label="Loading skills…" />;

  return (
    <div>
      {toast && <Toast message={toast} type={toast.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setToast('')} />}
      <PageHeader
        title="Skills Master"
        subtitle="Skill catalog students can add to their profiles"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" />New Skill</Button>}
      />

      <Card>
        <DataTable
          columns={[
            { header: 'Skill', render: (c: any) => <span className="font-medium">{c.skillName}</span> },
            { header: 'Category', render: (c: any) => (c.category ? <Badge tone="purple">{c.category}</Badge> : <span className="text-muted-foreground">—</span>) },
            {
              header: '',
              className: 'text-right',
              render: (c: any) => <ActionMenu a11yLabel={`Actions for ${c.skillName}`} items={actionsFor(c)} />,
            },
          ]}
          data={items}
          emptyTitle="No skills"
          emptyMessage="No skills have been added to the catalog."
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit Skill ${editing.skillName}` : 'Create Skill'}
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="skill-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="skill-form" onSubmit={submit} className="grid gap-3">
          <FormField label="Skill Name" required>
            <Input value={form.skillName} onChange={(e) => setForm({ ...form, skillName: e.target.value })} required />
          </FormField>
          <FormField label="Category">
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </FormField>
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete skill?"
        message={`This will permanently delete skill "${confirmDelete?.skillName}".`}
        confirmLabel="Delete"
        destructive
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
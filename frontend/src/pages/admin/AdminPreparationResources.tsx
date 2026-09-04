import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import {
  PageHeader, Card, Button, Input, Select, Textarea, DataTable, Badge, Loading,
  ConfirmDialog, Toast, Modal, FormField, ActionMenu, type MenuItem,
} from '../../components/ui';
import { Pencil, Plus, Trash2, Power } from 'lucide-react';
import { asArray } from '../../utils/cn';
import type { PreparationResource, PreparationResourceType, PreparationDifficulty } from '../../types';

const CATEGORIES = [
  'Interview Preparation',
  'Technical Interview',
  'HR Interview',
  'Aptitude',
  'Coding / DSA',
  'Communication Skills',
  'Resume Preparation',
  'Group Discussion',
  'Mock Interview',
];

const TYPES = ['YOUTUBE', 'ARTICLE', 'PDF', 'DOCUMENT', 'PRACTICE', 'OTHER'] as const;
const DIFFS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const TYPE_LABEL: Record<PreparationResourceType, string> = {
  YOUTUBE: 'YouTube', ARTICLE: 'Article', PDF: 'PDF', DOCUMENT: 'Document', PRACTICE: 'Practice', OTHER: 'Other',
};

const DIFF_LABEL: Record<PreparationDifficulty, string> = {
  BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced',
};

const emptyForm = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  topic: '',
  resourceType: 'YOUTUBE' as PreparationResourceType,
  url: '',
  thumbnailUrl: '',
  duration: '',
  difficulty: 'BEGINNER' as PreparationDifficulty,
  isActive: true,
};

export default function AdminPreparationResources() {
  const { data, isLoading, refetch } = useApi<{ items: PreparationResource[]; total: number }>(['preparation-resources'], '/api/student/preparation?includeInactive=true');
  const items = asArray<PreparationResource>(data?.items);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PreparationResource | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<PreparationResource | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };
  const openEdit = (r: PreparationResource) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description ?? '',
      category: r.category,
      topic: r.topic,
      resourceType: r.resourceType,
      url: r.url,
      thumbnailUrl: r.thumbnailUrl ?? '',
      duration: r.duration ?? '',
      difficulty: r.difficulty ?? 'BEGINNER',
      isActive: r.isActive,
    });
    setShowForm(true);
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      topic: form.topic,
      resourceType: form.resourceType,
      url: form.url,
      thumbnailUrl: form.thumbnailUrl || null,
      duration: form.duration || null,
      difficulty: form.difficulty || null,
      isActive: form.isActive,
    };
    try {
      if (editing) { await api.patch(`/api/student/preparation/${editing.id}`, payload); notify('Resource updated'); }
      else { await api.post('/api/student/preparation', payload); notify('Resource created'); }
      setShowForm(false); refetch();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await api.delete(`/api/student/preparation/${confirmDelete.id}`); notify('Resource deleted'); refetch(); }
    catch (e: any) { notify(e.message); }
    setConfirmDelete(null);
  };

  const toggleActive = async (r: PreparationResource) => {
    try {
      await api.patch(`/api/student/preparation/${r.id}`, { isActive: !r.isActive });
      notify(r.isActive ? 'Resource deactivated' : 'Resource activated');
      refetch();
    } catch (e: any) { notify(e.message); }
  };

  const actionsFor = (r: any): MenuItem[] => [
    { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(r) },
    { label: r.isActive ? 'Deactivate' : 'Activate', icon: <Power className="h-4 w-4" />, onClick: () => toggleActive(r) },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setConfirmDelete(r) },
  ];

  if (isLoading) return <Loading label="Loading preparation resources…" />;

  return (
    <div>
      {toast && <Toast message={toast} type={toast.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setToast('')} />}
      <PageHeader
        title="Preparation Resources"
        subtitle={`${items.length} resources across ${CATEGORIES.length} categories`}
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" />Add Resource</Button>}
      />

      <Card>
        <DataTable
          columns={[
            {
              header: 'Title',
              render: (r: any) => (
                <div>
                  <span className="font-medium">{r.title}</span>
                  <span className="ml-2"><Badge tone={r.isActive ? 'green' : 'slate'}>{r.isActive ? 'Active' : 'Inactive'}</Badge></span>
                </div>
              ),
            },
            { header: 'Category', render: (r: any) => <Badge tone="blue">{r.category}</Badge> },
            { header: 'Topic', render: (r: any) => r.topic },
            { header: 'Type', render: (r: any) => <Badge>{TYPE_LABEL[r.resourceType as PreparationResourceType]}</Badge> },
            { header: 'Difficulty', render: (r: any) => (r.difficulty ? <Badge>{DIFF_LABEL[r.difficulty as PreparationDifficulty]}</Badge> : <span className="text-muted-foreground">—</span>) },
            {
              header: '',
              className: 'text-right',
              render: (r: any) => <ActionMenu a11yLabel={`Actions for ${r.title}`} items={actionsFor(r)} />,
            },
          ]}
          data={items}
          emptyTitle="No resources"
          emptyMessage="Add preparation resources for students to access."
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Resource' : 'Add Resource'}
        size="lg"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="resource-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="resource-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Title" required className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </FormField>
          <FormField label="Category" required>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Topic" required>
            <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Tell me about yourself" required />
          </FormField>
          <FormField label="Resource Type" required>
            <Select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </Select>
          </FormField>
          <FormField label="Difficulty">
            <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFS.map((d) => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
            </Select>
          </FormField>
          <FormField label="URL" required className="sm:col-span-2" hint="Must start with http:// or https://">
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." required />
          </FormField>
          <FormField label="Thumbnail URL" className="sm:col-span-2" hint="Optional — must start with http:// or https://">
            <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://..." />
          </FormField>
          <FormField label="Duration">
            <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 12 min" />
          </FormField>
          <FormField label="Active">
            <Select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete resource?"
        message={`This will permanently delete "${confirmDelete?.title}".`}
        confirmLabel="Delete"
        destructive
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

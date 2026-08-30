import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, Textarea, DataTable, Loading, Modal, FormField, ConfirmDialog, ActionMenu, Toast, type MenuItem } from '../../components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { Project } from '../../types';

const empty = { projectTitle: '', description: '', startDate: '', endDate: '', technologyUsed: '', projectUrl: '', teamSize: 1 };

export default function StudentProjects() {
  const { data, refetch, isLoading } = useApi<Project[]>(['projects'], '/api/projects');
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const items = asArray<any>(data);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/projects', { projectTitle: form.projectTitle, description: form.description, startDate: form.startDate, endDate: form.endDate || null, technologyUsed: form.technologyUsed, projectUrl: form.projectUrl, teamSize: Number(form.teamSize) });
      setMsg('Project added');
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
      await api.delete(`/api/projects/${deleteTarget.id}`);
      setMsg('Project removed');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
    setDeleteTarget(null);
    setSaving(false);
  };

  const actionsFor = (p: any): MenuItem[] => [
    { label: 'Remove', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setDeleteTarget(p) },
  ];

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Projects"
        subtitle={`${items.length} projects`}
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Project</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading projects…" />}

      {(!isLoading || items.length > 0) && (
        <Card>
          <DataTable
            columns={[
              { header: 'Title', render: (p: any) => <span className="font-medium">{p.projectTitle}</span> },
              { header: 'Technology', render: (p: any) => p.technologyUsed ?? '—' },
              { header: 'Team Size', render: (p: any) => p.teamSize ?? '—' },
              { header: 'Duration', render: (p: any) => `${formatDate(p.startDate)} → ${p.endDate ? formatDate(p.endDate) : 'Present'}` },
              {
                header: '',
                className: 'text-right',
                render: (p: any) => <ActionMenu a11yLabel={`Actions for ${p.projectTitle}`} items={actionsFor(p)} />,
              },
            ]}
            data={items}
            emptyTitle="No projects"
            emptyMessage="Add projects you've built to showcase your work."
          />
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Project"
        size="lg"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="project-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="project-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Project Title" required className="sm:col-span-2">
            <Input value={form.projectTitle} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} required />
          </FormField>
          <FormField label="Start Date" required>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </FormField>
          <FormField label="Technology Used">
            <Input value={form.technologyUsed} onChange={(e) => setForm({ ...form, technologyUsed: e.target.value })} />
          </FormField>
          <FormField label="Team Size">
            <Input type="number" min={1} value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />
          </FormField>
          <FormField label="Project URL" className="sm:col-span-2">
            <Input value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} />
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove project?"
        message={`Remove "${deleteTarget?.projectTitle}"?`}
        confirmLabel="Remove"
        destructive
        loading={saving}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
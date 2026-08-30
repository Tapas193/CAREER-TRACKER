import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import {
  PageHeader, Card, Button, Input, DataTable, Badge, Loading,
  ConfirmDialog, Toast, Modal, FormField, ActionMenu, type MenuItem,
} from '../../components/ui';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { asArray } from '../../utils/cn';
import type { Course } from '../../types';

const emptyForm = { courseCode: '', courseName: '', department: '', degree: '', durationYears: '', totalSemesters: '' };

export default function AdminCourses() {
  const { data, isLoading, refetch } = useApi<Course[]>(['courses'], '/api/courses');
  const items = asArray<any>(data);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ courseCode: c.courseCode, courseName: c.courseName, department: c.department, degree: c.degree, durationYears: String(c.durationYears), totalSemesters: String(c.totalSemesters) });
    setShowForm(true); setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = {
      courseCode: form.courseCode, courseName: form.courseName, department: form.department,
      degree: form.degree, durationYears: Number(form.durationYears), totalSemesters: Number(form.totalSemesters),
    };
    try {
      if (editing) { await api.patch(`/api/courses/${editing.id}`, payload); notify('Course updated'); }
      else { await api.post('/api/courses', payload); notify('Course created'); }
      setShowForm(false); refetch();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try { await api.delete(`/api/courses/${confirmDelete.id}`); notify('Course deleted'); refetch(); }
    catch (e: any) { notify(e.message); }
    setConfirmDelete(null);
  };

  const actionsFor = (c: any): MenuItem[] => [
    { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(c) },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setConfirmDelete(c) },
  ];

  if (isLoading) return <Loading label="Loading courses…" />;

  return (
    <div>
      {toast && <Toast message={toast} type={toast.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setToast('')} />}
      <PageHeader
        title="Courses"
        subtitle={`${items.length} courses offered`}
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" />New Course</Button>}
      />

      <Card>
        <DataTable
          columns={[
            { header: 'Code', render: (c: any) => <Badge tone="blue">{c.courseCode}</Badge> },
            { header: 'Course Name', render: (c: any) => <span className="font-medium">{c.courseName}</span> },
            { header: 'Department', render: (c: any) => <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-muted-foreground" />{c.department}</span> },
            { header: 'Degree', render: (c: any) => c.degree },
            { header: 'Duration', render: (c: any) => `${c.durationYears} yr(s)` },
            { header: 'Semesters', render: (c: any) => c.totalSemesters },
            {
              header: '',
              className: 'text-right',
              render: (c: any) => <ActionMenu a11yLabel={`Actions for ${c.courseName}`} items={actionsFor(c)} />,
            },
          ]}
          data={items}
          emptyTitle="No courses"
          emptyMessage="No courses have been created yet."
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit Course ${editing.courseCode}` : 'Create Course'}
        description="Define the course catalog for student enrollment."
        size="lg"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="course-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="course-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Course Code" required>
            <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
          </FormField>
          <FormField label="Course Name" required>
            <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
          </FormField>
          <FormField label="Department" required>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
          </FormField>
          <FormField label="Degree" required>
            <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} required />
          </FormField>
          <FormField label="Duration (years)" required>
            <Input type="number" min={1} value={form.durationYears} onChange={(e) => setForm({ ...form, durationYears: e.target.value })} required />
          </FormField>
          <FormField label="Total Semesters" required>
            <Input type="number" min={1} value={form.totalSemesters} onChange={(e) => setForm({ ...form, totalSemesters: e.target.value })} required />
          </FormField>
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete course?"
        message={`This will permanently delete course "${confirmDelete?.courseName}". This may be blocked if students reference it.`}
        confirmLabel="Delete"
        destructive
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, Select, DataTable, StatusBadge, Loading, Modal, FormField, Toast } from '../../components/ui';
import { Plus } from 'lucide-react';
import type { AcademicRecord } from '../../types';
import { asArray } from '../../utils/cn';

const empty = { semester: 1, academicYear: new Date().getFullYear(), sgpa: '', cgpa: '', creditsEarned: '', totalCredits: '', resultStatus: 'PASS' };

export default function StudentAcademics() {
  const { data, refetch, isLoading } = useApi<AcademicRecord[]>(['academic-records'], '/api/academic-records');
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const items = asArray<any>(data);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/academic-records', {
        semester: Number(form.semester),
        academicYear: Number(form.academicYear),
        sgpa: Number(form.sgpa), cgpa: Number(form.cgpa),
        creditsEarned: Number(form.creditsEarned), totalCredits: Number(form.totalCredits),
        resultStatus: form.resultStatus,
      });
      setMsg('Semester record added');
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

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Academic Records"
        subtitle="Semester-wise SGPA / CGPA progression"
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Semester</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading records…" />}

      {items.length > 0 && (
        <Card>
          <DataTable
            columns={[
              { header: 'Semester', render: (r: any) => r.semester },
              { header: 'Academic Year', render: (r: any) => r.academicYear },
              { header: 'SGPA', render: (r: any) => <span className="tabular-nums">{Number(r.sgpa).toFixed(2)}</span> },
              { header: 'CGPA', render: (r: any) => <span className="font-medium tabular-nums">{Number(r.cgpa).toFixed(2)}</span> },
              { header: 'Credits', render: (r: any) => <span className="tabular-nums">{Number(r.creditsEarned)} / {Number(r.totalCredits)}</span> },
              { header: 'Result', render: (r: any) => <StatusBadge status={r.resultStatus} /> },
            ]}
            data={items}
            emptyTitle="No academic records"
            emptyMessage="Add your first semester result to begin tracking your CGPA."
          />
        </Card>
      )}

      {!items.length && !isLoading && (
        <Card className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <p className="text-sm text-muted-foreground">No semester records yet.</p>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Semester</Button>
        </Card>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Semester Record"
        description="Record your performance for a semester."
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="academic-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="academic-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Semester" required>
            <Input type="number" min={1} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </FormField>
          <FormField label="Academic Year" required>
            <Input type="number" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
          </FormField>
          <FormField label="SGPA" required>
            <Input type="number" step="0.01" min={0} max={10} value={form.sgpa} onChange={(e) => setForm({ ...form, sgpa: e.target.value })} />
          </FormField>
          <FormField label="CGPA" required>
            <Input type="number" step="0.01" min={0} max={10} value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
          </FormField>
          <FormField label="Credits Earned" required>
            <Input type="number" min={0} value={form.creditsEarned} onChange={(e) => setForm({ ...form, creditsEarned: e.target.value })} />
          </FormField>
          <FormField label="Total Credits" required>
            <Input type="number" min={0} value={form.totalCredits} onChange={(e) => setForm({ ...form, totalCredits: e.target.value })} />
          </FormField>
          <FormField label="Result Status" required className="sm:col-span-2">
            <Select value={form.resultStatus} onChange={(e) => setForm({ ...form, resultStatus: e.target.value })}>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
            </Select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
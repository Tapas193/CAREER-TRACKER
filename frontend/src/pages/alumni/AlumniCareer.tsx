import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, Button, Input, Loading, Modal, FormField, Badge, ConfirmDialog, Toast, EmptyState } from '../../components/ui';
import { Plus, Trash2, Briefcase, MapPin } from 'lucide-react';
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

  const items = asArray<any>(data).sort((a, b) => new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime());

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

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Career History"
        subtitle="Your professional journey since graduation"
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Add Job</Button>}
      />

      {isLoading && !items.length && <Loading label="Loading career history…" />}

      {(!isLoading || items.length > 0) && (
        <Card className="p-5">
          {items.length === 0 ? (
            <EmptyState title="No career entries" message="Add your first post-graduation job to start your timeline." />
          ) : (
            <div className="relative ml-2 border-l-2 border-border pl-6">
              {items.map((c) => (
                <div key={c.id} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                    <Briefcase className="h-3 w-3" />
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {c.companyName}
                        {c.currentJob && <Badge tone="green" className="ml-2">Current</Badge>}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{c.jobTitle}{c.role ? ` · ${c.role}` : ''}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{formatDate(c.startDate)} — {c.endDate ? formatDate(c.endDate) : 'Present'}</span>
                        {c.location && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.location}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove career entry at ${c.companyName}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

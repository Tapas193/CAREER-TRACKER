import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, CardHeader, CardContent, Button, Textarea, DataTable, Select, Badge, ActionMenu, ConfirmDialog, Toast, type MenuItem } from '../../components/ui';
import { Star, Trash2 } from 'lucide-react';
import { formatDate, asArray } from '../../utils/cn';
import type { AlumniFeedback } from '../../types';

export default function AlumniFeedback() {
  const { data, refetch } = useApi<AlumniFeedback[]>(['alumni-feedback'], '/api/alumni-feedback');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AlumniFeedback | null>(null);

  const items = asArray<any>(data);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/alumni-feedback', { rating, comment });
      setMsg('Feedback submitted');
      setComment('');
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
    try {
      await api.delete(`/api/alumni-feedback/${deleteTarget.id}`);
      setMsg('Feedback removed');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
    setDeleteTarget(null);
  };

  const actionsFor = (f: any): MenuItem[] => [
    { label: 'Remove', icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => setDeleteTarget(f) },
  ];

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader title="Alumni Feedback" subtitle="Share your experience with the institution" />

      <Card className="mb-5">
        <CardHeader title="Submit Feedback" />
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-2">
              <label className="field-label">Rating (1–5)</label>
              <Select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-40" aria-label="Rating">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="field-label">Comment</label>
              <Textarea placeholder="Your feedback…" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving}>
              <Star className="h-4 w-4" />
              {saving ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Past Feedback" />
        <div className="p-0">
          <DataTable
            columns={[
              { header: 'Rating', render: (f: any) => <Badge tone="amber">{f.rating}/5</Badge> },
              { header: 'Date', render: (f: any) => formatDate(f.feedbackDate) },
              { header: 'Comment', render: (f: any) => f.comment ?? '—' },
              {
                header: '',
                className: 'text-right',
                render: (f: any) => <ActionMenu a11yLabel={`Actions for feedback from ${formatDate(f.feedbackDate)}`} items={actionsFor(f)} />,
              },
            ]}
            data={items}
            emptyTitle="No feedback yet"
            emptyMessage="Submit your first piece of feedback above."
          />
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove feedback?"
        message={`Remove this feedback submitted on ${deleteTarget ? formatDate(deleteTarget.feedbackDate) : ''}?`}
        confirmLabel="Remove"
        destructive
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
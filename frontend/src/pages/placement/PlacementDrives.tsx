import { useState } from 'react';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { PageHeader, Card, CardHeader, CardContent, Button, Input, StatusBadge, Loading, Modal, FormField, Toast } from '../../components/ui';
import { Plus } from 'lucide-react';
import { formatDate, formatLpa, asArray } from '../../utils/cn';

interface Drive {
  companyName: string;
  jobRole: string;
  placementDate: string;
  packageLpa: number | string;
  location?: string | null;
  participants: any[];
  participantCount: number;
}

const empty = { companyName: '', jobRole: '', placementDate: '', packageLpa: '', location: '' };

export default function PlacementDrives() {
  const { data, isLoading } = useApi<Drive[]>(['placement-drives'], '/api/placements/drives');
  const { data: eligible } = useApi<any[]>(['eligible-students'], '/api/placements/eligible-students');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [selected, setSelected] = useState<number[]>([]);
  const [msg, setMsg] = useState('');

  const createDrive = useApiMutation<any>('/api/placements/drive/create', 'post', ['placement-drives', 'placement-dashboard', 'eligible-students']);

  const submitDrive = async () => {
    if (!form.companyName || !form.jobRole || !form.placementDate || !form.packageLpa || selected.length === 0) {
      setMsg('Fill all fields and select at least one student');
      return;
    }
    try {
      await createDrive.mutateAsync({ companyName: form.companyName, jobRole: form.jobRole, placementDate: form.placementDate, packageLpa: Number(form.packageLpa), location: form.location, studentIds: selected });
      setMsg('Drive created');
      setShowForm(false);
      setForm(empty);
      setSelected([]);
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const toggleSel = (id: number) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const drives = asArray<any>(data);
  const eligibleStudents = asArray<any>(eligible);

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fill') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Placement Drives"
        subtitle="Grouped by Company + Role + Date (one Placement record per student)"
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />New Drive</Button>}
      />

      {isLoading ? (
        <Loading label="Loading drives…" />
      ) : (
        <div className="space-y-4">
          {drives.length === 0 && (
            <Card className="flex items-center justify-center py-12 text-center text-sm text-muted-foreground">
              No drives created yet.
            </Card>
          )}
          {drives.map((d) => (
            <Card key={`${d.companyName}-${d.placementDate}-${d.jobRole}`}>
              <CardHeader
                title={`${d.companyName} — ${d.jobRole}`}
                subtitle={`${formatDate(d.placementDate)} · ${d.participantCount} participant(s) · ${formatLpa(d.packageLpa)}${d.location ? ` · ${d.location}` : ''}`}
              />
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/60 text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Student</th>
                        <th className="px-4 py-2.5 font-medium">Enrollment</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Rounds</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(d.participants ?? []).map((p: any) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2.5 font-medium text-foreground">{p.student ? `${p.student.firstName} ${p.student.lastName}` : p.studentId}</td>
                          <td className="px-4 py-2.5 text-foreground">{p.student?.enrollmentNo ?? '—'}</td>
                          <td className="px-4 py-2.5"><StatusBadge status={p.placementStatus} /></td>
                          <td className="px-4 py-2.5 tabular-nums text-foreground">{p.rounds?.length ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create Placement Drive"
        description="Creates one Placement record per selected student."
        size="lg"
        footer={
          <Button onClick={submitDrive} disabled={createDrive.isPending}>
            {createDrive.isPending ? 'Creating…' : `Create Drive for ${selected.length} student(s)`}
          </Button>
        }
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submitDrive(); }}>
          <FormField label="Company" required>
            <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="e.g. Amazon" required />
          </FormField>
          <FormField label="Job Role" required>
            <Input value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} placeholder="e.g. SDE-1" required />
          </FormField>
          <FormField label="Drive Date" required>
            <Input type="date" value={form.placementDate} onChange={(e) => setForm({ ...form, placementDate: e.target.value })} required />
          </FormField>
          <FormField label="Package (LPA)" required>
            <Input type="number" step="0.01" value={form.packageLpa} onChange={(e) => setForm({ ...form, packageLpa: e.target.value })} required />
          </FormField>
          <FormField label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bengaluru" />
          </FormField>

          <FormField label={`Select eligible students (${eligibleStudents.length} eligible)`} className="sm:col-span-2">
            <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2">
              {eligibleStudents.length === 0 ? (
                <p className="px-2 py-1 text-sm text-muted-foreground">No eligible students.</p>
              ) : (
                eligibleStudents.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSel(s.id)}
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                    {s.firstName} {s.middleName ? `${s.middleName} ` : ''}{s.lastName} ({s.enrollmentNo})
                  </label>
                ))
              )}
            </div>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
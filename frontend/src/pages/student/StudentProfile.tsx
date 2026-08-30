import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, CardHeader, CardContent, Button, Input, Textarea, StatusBadge, DetailGrid, DetailItem, Toast } from '../../components/ui';
import type { Student } from '../../types';

export default function StudentProfile() {
  const { data, refetch } = useApi<Student>(['student-me'], '/api/students/me');
  const [form, setForm] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        firstName: data.firstName ?? '', middleName: data.middleName ?? '', lastName: data.lastName ?? '',
        dateOfBirth: data.dateOfBirth?.slice(0, 10) ?? '', gender: data.gender ?? '',
        address: data.address ?? '', phone: data.user?.phone ?? '',
      });
    }
  }, [data]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await api.patch(`/api/students/${data.id}`, form);
      setMsg('Profile updated');
      setEditing(false);
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="py-14 text-center text-sm text-muted-foreground">Loading profile…</div>;

  const hasAccount = !!data.user;
  const isAlumni = data.currentStatus === 'ALUMNI';

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="My Profile"
        subtitle={`${data.enrollmentNo} · ${data.rollNumber}`}
        action={
          isAlumni ? null : editing ? (
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
          )
        }
      />

      {isAlumni && (
        <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          Alumni profiles are read-only. Your underlying student record is preserved for historical reference.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="self-start">
          <CardHeader title="Summary" />
          <CardContent>
            <dl className="space-y-3 text-sm">
              <DetailItem label="Course" value={data.course?.courseName ?? '—'} />
              <DetailItem label="Admission Year" value={data.admissionYear} />
              <DetailItem label="Current Semester" value={data.currentSemester} />
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title="Personal Details" />
          <CardContent>
            {editing ? (
              <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="grid gap-2">
                  <label className="field-label">First Name</label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label">Middle Name</label>
                  <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label">Last Name</label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label">Date of Birth</label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label">Gender</label>
                  <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label">Phone</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="field-label">Address</label>
                  <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 md:col-span-2">
                  <Button variant="outline" type="button" onClick={() => { setEditing(false); }}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                </div>
              </form>
            ) : (
              <DetailGrid>
                <DetailItem label="Name" value={`${data.firstName} ${data.middleName ?? ''} ${data.lastName}`} />
                <DetailItem label="Date of Birth" value={data.dateOfBirth?.slice(0, 10) ?? '—'} />
                <DetailItem label="Gender" value={data.gender ?? '—'} />
                <DetailItem label="Phone" value={data.user?.phone ?? '—'} />
                <DetailItem label="Email" value={hasAccount ? data.user?.email : 'No login account'} />
                <DetailItem label="Status" value={<StatusBadge status={data.currentStatus} />} className="sm:col-span-2" />
                <DetailItem label="Address" value={data.address ?? '—'} className="sm:col-span-2" />
              </DetailGrid>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
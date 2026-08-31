import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { PageHeader, Card, CardHeader, CardContent, Button, Input, Textarea, StatusBadge, DetailGrid, DetailItem, Toast } from '../../components/ui';
import { User, GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import type { Student } from '../../types';
import { careerProfileCompletion, careerProfilePercent } from '../../utils/career';

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
  const completion = careerProfilePercent(data as any);
  const completionItems = careerProfileCompletion(data as any);
  const name = `${data.firstName} ${data.middleName ?? ''} ${data.lastName}`.replace(/\s+/g, ' ');

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

      <Card className="mb-5">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">{name}</h2>
                <p className="text-xs text-muted-foreground">Enrollment: {data.enrollmentNo} · Roll: {data.rollNumber}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{data.course?.courseName ?? ''}{data.course?.department ? ` · ${data.course.department}` : ''} · Semester {data.currentSemester}</p>
              </div>
            </div>
            <StatusBadge status={data.currentStatus} />
          </div>

          {!isAlumni && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile completion</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{completion}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {completionItems.map((c) => (
                  <span key={c.id} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c.done ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-muted text-muted-foreground ring-border'}`}>
                    {c.done ? '✓' : '○'} {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Academic Information</span>} />
          <CardContent>
            <DetailGrid>
              <DetailItem label="Course" value={data.course?.courseName ?? '—'} />
              <DetailItem label="Admission Year" value={data.admissionYear} />
              <DetailItem label="Expected Year" value={data.expectedYear} />
              <DetailItem label="Current Semester" value={data.currentSemester} />
              <DetailItem label="Graduation Status" value={<StatusBadge status={data.graduationStatus} />} />
              <DetailItem label="Academic Status" value={<StatusBadge status={data.currentStatus} />} />
              <DetailItem label="Account Status" value={<StatusBadge status={data.accountStatus} />} className="sm:col-span-2" />
            </DetailGrid>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader title={<span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Career Information</span>} />
          <CardContent>
            <DetailGrid>
              <DetailItem label="Placement Status" value={<StatusBadge status={data.placements?.[data.placements.length - 1]?.placementStatus ?? 'NONE'} />} />
              <DetailItem label="Career Profile" value={`${completion}% complete`} />
              <DetailItem label="Skills" value={data.skills?.length ?? 0} />
              <DetailItem label="Projects" value={data.projects?.length ?? 0} />
              <DetailItem label="Internships" value={data.internships?.length ?? 0} />
              <DetailItem label="Certifications" value={data.certifications?.length ?? 0} />
            </DetailGrid>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader title={<span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Personal & Contact Information</span>} />
          <CardContent>
            {editing ? (
              <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="grid gap-2">
                  <label className="field-label" htmlFor="pf-first">First Name</label>
                  <Input id="pf-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label" htmlFor="pf-middle">Middle Name</label>
                  <Input id="pf-middle" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label" htmlFor="pf-last">Last Name</label>
                  <Input id="pf-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label" htmlFor="pf-dob">Date of Birth</label>
                  <Input id="pf-dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label" htmlFor="pf-gender">Gender</label>
                  <Input id="pf-gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label className="field-label" htmlFor="pf-phone">Phone</label>
                  <Input id="pf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="field-label" htmlFor="pf-address">Address</label>
                  <Textarea id="pf-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 md:col-span-2">
                  <Button variant="outline" type="button" onClick={() => { setEditing(false); }}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                </div>
              </form>
            ) : (
              <DetailGrid>
                <DetailItem label="Name" value={name} />
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

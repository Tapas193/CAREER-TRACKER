import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  Select,
  FilterBar,
  DataTable,
  StatusBadge,
  Loading,
  ConfirmDialog,
  Modal,
  FormField,
  Toast,
  ActionMenu,
  type MenuItem,
} from '../../components/ui';
import { Eye, GraduationCap, Search, UserCheck, UserPlus } from 'lucide-react';
import { asArray } from '../../utils/cn';
import type { Student, Course } from '../../types';

const STATUS_OPTIONS = ['ADMITTED', 'ACTIVE', 'ON_PLACEMENT', 'GRADUATED', 'ALUMNI'];

const emptyForm = {
  firstName: '', middleName: '', lastName: '', enrollmentNo: '', rollNumber: '', admissionNo: '',
  admissionYear: '', expectedYear: '', currentSemester: 1, courseId: '',
  createAccount: false, email: '', phone: '', password: '', gender: '', dateOfBirth: '', address: '',
};

export default function AdminStudents() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [status, setStatus] = useState('');
  const [courseId, setCourseId] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading, isError, refetch } = useApi<{ items: Student[]; total: number }>(
    ['admin-students', search, status, courseId, String(page)],
    `/api/students?search=${search}${status ? `&status=${status}` : ''}${courseId ? `&courseId=${courseId}` : ''}&page=${page}&pageSize=${PAGE_SIZE}`
  );
  const { data: courses } = useApi<Course[]>(['courses'], '/api/courses');
  const courseList = asArray<any>(courses);

  const students = asArray<any>(data);
  const total = (data as any)?.total ?? 0;

  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [gradTarget, setGradTarget] = useState<{ id: number; override: boolean } | null>(null);
  const [alumniTarget, setAlumniTarget] = useState<Student | null>(null);
  const [working, setWorking] = useState(false);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setCourseId('');
    setPage(1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload: Record<string, any> = {
      firstName: form.firstName, middleName: form.middleName || null, lastName: form.lastName,
      enrollmentNo: form.enrollmentNo, rollNumber: form.rollNumber, admissionNo: form.admissionNo,
      admissionYear: Number(form.admissionYear), expectedYear: Number(form.expectedYear),
      currentSemester: Number(form.currentSemester), courseId: Number(form.courseId),
      gender: form.gender || null, dateOfBirth: form.dateOfBirth || null, address: form.address || null,
      createAccount: !!form.createAccount,
    };
    if (form.createAccount) {
      payload.email = form.email;
      payload.phone = form.phone || null;
      payload.password = form.password;
    }
    try {
      const r = await api.post<any>('/api/students', payload);
      notify(r.message || 'Student created');
      setShowForm(false);
      setForm(emptyForm);
      refetch();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const doGraduate = async () => {
    if (!gradTarget) return;
    setWorking(true);
    try {
      await api.post(`/api/students/${gradTarget.id}/graduate`, { override: gradTarget.override, confirmation: gradTarget.override });
      notify(gradTarget.override ? 'Student graduated (overridden)' : 'Student graduated');
      refetch();
    } catch (e: any) {
      if (!gradTarget.override) {
        setGradTarget({ id: gradTarget.id, override: true });
        notify(e.message);
        return;
      }
      notify(e.message);
    } finally {
      setGradTarget(null);
      setWorking(false);
    }
  };

  const doMarkAlumni = async () => {
    if (!alumniTarget) return;
    setWorking(true);
    try {
      await api.post(`/api/students/${alumniTarget.id}/mark-alumni`);
      notify('Marked as alumni');
      refetch();
    } catch (e: any) {
      notify(e.message);
    }
    setAlumniTarget(null);
    setWorking(false);
  };

  const actionsFor = (s: Student): MenuItem[] => {
    const canGraduate = s.currentStatus === 'ADMITTED' || s.currentStatus === 'ACTIVE' || s.currentStatus === 'ON_PLACEMENT';
    const canAlumni = s.currentStatus === 'GRADUATED';
    return [
      { label: 'View details', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/admin/students/${s.id}`) },
      ...(canGraduate
        ? [{ label: 'Graduate', icon: <GraduationCap className="h-4 w-4" />, onClick: () => setGradTarget({ id: s.id, override: false }) }]
        : []),
      ...(canAlumni
        ? [{ label: 'Mark alumni', icon: <UserCheck className="h-4 w-4" />, onClick: () => setAlumniTarget(s) }]
        : []),
    ];
  };

  if (isLoading && !students.length) return <Loading label="Loading students…" />;

  return (
    <div>
      {toast && <Toast message={toast} type={toast.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setToast('')} />}

      <PageHeader
        title="Students"
        subtitle={`${total} records across all courses`}
        action={
          <Button onClick={() => { setShowForm(true); setFormError(''); }}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="py-3">
          <FilterBar onReset={resetFilters}>
            <FormField label="" className="min-w-56 flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="field-input pl-8"
                  placeholder="Search by name, roll no, enrollment…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  aria-label="Search students"
                />
              </div>
            </FormField>
            <FormField label="" className="w-44">
              <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="" className="w-44">
              <Select value={courseId} onChange={(e) => { setCourseId(e.target.value); setPage(1); }} aria-label="Filter by course">
                <option value="">All courses</option>
                {courseList.map((c: any) => <option key={c.id} value={c.id}>{c.courseName}</option>)}
              </Select>
            </FormField>
          </FilterBar>
        </CardContent>
      </Card>

      <Card>
        <DataTable<Student>
          columns={[
            { header: 'Enrollment', render: (s) => <span className="font-medium">{s.enrollmentNo}</span> },
            {
              header: 'Name',
              render: (s) => (
                <button type="button" onClick={() => navigate(`/admin/students/${s.id}`)} className="font-medium text-primary hover:underline">
                  {s.firstName} {s.middleName ? `${s.middleName} ` : ''}{s.lastName}
                </button>
              ),
            },
            { header: 'Course', render: (s) => s.course?.courseCode ?? '—' },
            { header: 'CGPA', render: (s) => latestCgpa(s) },
            { header: 'Semester', render: (s) => s.currentSemester },
            { header: 'Status', render: (s) => <StatusBadge status={s.currentStatus} /> },
            {
              header: '',
              className: 'text-right',
              render: (s) => <ActionMenu a11yLabel={`Actions for ${s.firstName} ${s.lastName}`} items={actionsFor(s)} />,
            },
          ]}
          data={students}
          loading={isLoading}
          error={isError}
          onRetry={refetch}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPage={setPage}
          emptyTitle="No students found"
          emptyMessage="Try adjusting the search or filters, or add a new student record."
          emptyAction={<Button size="sm" onClick={() => setShowForm(true)}><UserPlus className="h-4 w-4" />Add Student</Button>}
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Student"
        description="Create a new student profile with enrollment details."
        size="lg"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="student-form" disabled={saving}>{saving ? 'Saving…' : 'Create Student'}</Button>
          </>
        }
      >
        <form id="student-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="First Name" required>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </FormField>
          <FormField label="Middle Name">
            <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
          </FormField>
          <FormField label="Last Name" required>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </FormField>
          <FormField label="Enrollment No" required>
            <Input value={form.enrollmentNo} onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })} required />
          </FormField>
          <FormField label="Roll Number" required>
            <Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
          </FormField>
          <FormField label="Admission No" required>
            <Input value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} required />
          </FormField>
          <FormField label="Admission Year" required>
            <Input type="number" value={form.admissionYear} onChange={(e) => setForm({ ...form, admissionYear: e.target.value })} required />
          </FormField>
          <FormField label="Expected Passing Year" required>
            <Input type="number" value={form.expectedYear} onChange={(e) => setForm({ ...form, expectedYear: e.target.value })} required />
          </FormField>
          <FormField label="Current Semester" required>
            <Input type="number" min={1} value={form.currentSemester} onChange={(e) => setForm({ ...form, currentSemester: e.target.value })} required />
          </FormField>
          <FormField label="Course" required>
            <Select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
              <option value="">Select course</option>
              {courseList.map((c: any) => <option key={c.id} value={c.id}>{c.courseName}</option>)}
            </Select>
          </FormField>
          <FormField label="Gender">
            <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
          </FormField>
          <FormField label="Date of Birth">
            <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </FormField>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={!!form.createAccount} onChange={(e) => setForm({ ...form, createAccount: e.target.checked })} className="h-4 w-4 rounded border-border text-primary" />
              Create a login account for this student
            </label>
          </div>
          {form.createAccount && (
            <>
              <FormField label="Email" required>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="off" />
              </FormField>
              <FormField label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </FormField>
              <FormField label="Password" required hint="Minimum 6 characters">
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} autoComplete="new-password" />
              </FormField>
            </>
          )}
          {formError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!gradTarget}
        title={gradTarget?.override ? 'Override graduation blockers?' : 'Confirm graduation'}
        message={gradTarget?.override
          ? 'This student has unresolved backlogs or no academic records. Override the rules and graduate them anyway?'
          : 'Graduate this student? Their historical records will be locked from editing.'}
        confirmLabel={gradTarget?.override ? 'Override & Graduate' : 'Graduate'}
        destructive={!!gradTarget?.override}
        loading={working}
        onConfirm={doGraduate}
        onCancel={() => setGradTarget(null)}
      />

      <ConfirmDialog
        open={!!alumniTarget}
        title="Mark as alumni"
        message={`Move ${alumniTarget?.firstName} ${alumniTarget?.lastName} to Alumni status? This makes the record read-only for pre-graduation data.`}
        confirmLabel="Mark Alumni"
        loading={working}
        onConfirm={doMarkAlumni}
        onCancel={() => setAlumniTarget(null)}
      />
    </div>
  );
}

function latestCgpa(s: Student): string {
  const ars = asArray<any>(s.academicRecords);
  if (!ars.length) return '—';
  const latest = ars.reduce((a, b) => (Number(b.id) > Number(a.id) ? b : a));
  return Number(latest.cgpa ?? latest.sgpa).toFixed(2) ?? '—';
}
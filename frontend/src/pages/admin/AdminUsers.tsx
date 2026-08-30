import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import {
  PageHeader, Card, Button, Input, Select, DataTable, StatusBadge, Loading,
  ConfirmDialog, Toast, Modal, FormField, ActionMenu, type MenuItem,
} from '../../components/ui';
import { Pencil, Power, UserPlus } from 'lucide-react';
import { asArray } from '../../utils/cn';
import type { User } from '../../types';

const emptyForm = { firstName: '', middleName: '', lastName: '', email: '', phone: '', password: '', role: 'STUDENT' };

export default function AdminUsers() {
  const { data, isLoading, refetch } = useApi<{ items: User[]; total: number }>(['admin-users'], '/api/users');
  const items = asArray<any>(data);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [deactivating, setDeactivating] = useState<User | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ firstName: u.firstName, middleName: u.middleName ?? '', lastName: u.lastName, email: u.email, phone: u.phone ?? '', password: '', role: u.role });
    setShowForm(true); setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload: Record<string, any> = {
      firstName: form.firstName, middleName: form.middleName || null, lastName: form.lastName,
      email: form.email, phone: form.phone || null, role: form.role,
    };
    if (form.password) payload.password = form.password;
    try {
      if (editing) { await api.patch(`/api/users/${editing.id}`, payload); notify('User updated'); }
      else { await api.post('/api/users', payload); notify('User created'); }
      setShowForm(false); refetch();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const doDeactivate = async () => {
    if (!deactivating) return;
    const next = deactivating.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/api/users/${deactivating.id}`, { accountStatus: next });
      notify(`User ${next === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (e: any) { notify(e.message); }
    setDeactivating(null);
  };

  const actionsFor = (u: User): MenuItem[] => [
    { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(u) },
    {
      label: u.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate',
      icon: <Power className="h-4 w-4" />,
      destructive: u.accountStatus === 'ACTIVE',
      onClick: () => setDeactivating(u),
    },
  ];

  if (isLoading) return <Loading label="Loading users…" />;

  return (
    <div>
      {toast && <Toast message={toast} type={toast.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setToast('')} />}
      <PageHeader
        title="Users"
        subtitle={`${(data as any)?.total ?? items.length} accounts`}
        action={<Button onClick={openCreate}><UserPlus className="h-4 w-4" />New User</Button>}
      />

      <Card>
        <DataTable<User>
          columns={[
            { header: 'Name', render: (u) => <span className="font-medium">{u.firstName} {u.middleName ? `${u.middleName} ` : ''}{u.lastName}</span> },
            { header: 'Email', render: (u) => u.email },
            { header: 'Role', render: (u) => <StatusBadge status={u.role} /> },
            { header: 'Status', render: (u) => <StatusBadge status={u.accountStatus} /> },
            {
              header: '',
              className: 'text-right',
              render: (u) => <ActionMenu a11yLabel={`Actions for ${u.firstName} ${u.lastName}`} items={actionsFor(u)} />,
            },
          ]}
          data={items}
          emptyTitle="No users"
          emptyMessage="No user accounts exist yet."
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit User ${editing.email}` : 'Create User'}
        description="Manage login accounts and roles."
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="user-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <form id="user-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <FormField label="First Name" required>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </FormField>
          <FormField label="Middle Name">
            <Input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
          </FormField>
          <FormField label="Last Name" required>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </FormField>
          <FormField label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </FormField>
          <FormField label={editing ? 'New Password (optional)' : 'Password'} required={!editing} hint="Minimum 6 characters">
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} minLength={6} autoComplete="new-password" />
          </FormField>
          <FormField label="Role" required className="sm:col-span-2">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">Student</option>
              <option value="PLACEMENT_HEAD">Placement Head</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </FormField>
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deactivating}
        title={deactivating?.accountStatus === 'ACTIVE' ? 'Deactivate user?' : 'Activate user?'}
        message={`Are you sure you want to ${deactivating?.accountStatus === 'ACTIVE' ? 'deactivate' : 'activate'} ${deactivating?.email}?`}
        confirmLabel={deactivating?.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        destructive={deactivating?.accountStatus === 'ACTIVE'}
        onConfirm={doDeactivate}
        onCancel={() => setDeactivating(null)}
      />
    </div>
  );
}
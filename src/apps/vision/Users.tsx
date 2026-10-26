import { CircleDot, Factory } from 'lucide-react';
import { useMemo, useState } from 'react';
import { VisionShell } from './Shell';
import { ROLES, ROLE_COLOR, USERS, type Role, type User } from './data';
import { Button, IconButton } from '../../components/ds/Button';
import { Field, SearchInput, TextInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { Badge, Illustration, Tag } from '../../components/ds/Display';
import { DataTable, TableCard, type Column } from '../../components/ds/Table';
import { Pagination, Tabs } from '../../components/ds/Nav';
import { ConfirmDialog, SlidePanel } from '../../components/ds/Overlay';
import { ArrowBack, Copy, Edit, Export, Plus, Trash } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';
import { copyText } from '../../lib/copy';

type TabValue = 'all' | Role;
const PAGE = 8;
const TAB_LABEL: Record<Role, string> = { 'HUL Admin': 'HUL Admins', 'Factory Admin': 'Factory Admins', 'Factory Operator': 'Factory Operators', 'Factory Quality Supervisor': 'Factory Quality Supervisors' };

/** Frame 6 · User Management (491:14493): role tabs with counts, role tags, glass status pills, copy / edit / delete, pagination. */
export function UsersApp() {
  const [users, setUsers] = useState<User[]>(USERS);
  const [q, setQ] = useState('');
  const [factory, setFactory] = useState('All Factories');
  const [status, setStatus] = useState('All Status');
  const [tab, setTab] = useState<TabValue>('all');
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<User | null>(null);
  const [edit, setEdit] = useState<User | 'new' | null>(null);

  const filtered = useMemo(() => users.filter(u => (tab === 'all' || u.role === tab)
    && (factory === 'All Factories' || u.factory === factory) && (status === 'All Status' || u.status.label === status)
    && `${u.name} ${u.email} ${u.role} ${u.factory}`.toLowerCase().includes(q.toLowerCase())), [users, tab, factory, status, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const cols: Column<User>[] = [
    { key: 'name', header: 'Name' }, { key: 'email', header: 'Email ID' },
    { key: 'role', header: 'Role', render: u => <Tag color={ROLE_COLOR[u.role]}>{u.role}</Tag> },
    { key: 'factory', header: 'Factory' }, { key: 'lines', header: 'Line access' },
    { key: 'status', header: 'Status', render: u => <Badge tone={u.status.tone} appearance="glass">{u.status.label}</Badge> },
    { key: 'lastActive', header: 'Last active' },
    { key: 'actions', header: 'Actions', hiddenHeader: true, align: 'end', render: u => (
      <span className="ds-row-actions">
        <IconButton icon={Copy} size="compact" label={`Copy email of ${u.name}`} onClick={() => copyText(u.email, 'Email copied')} />
        <IconButton icon={Edit} size="compact" label={`Edit ${u.name}`} onClick={() => setEdit(u)} />
        <IconButton icon={Trash} size="compact" label={`Delete ${u.name}`} onClick={() => setDel(u)} />
      </span>
    ) },
  ];

  return (
    <VisionShell current="users" title="User Management" icon={<Illustration name="illus.user-group" size={36} fit="cover" />}
      actions={<>
        <SearchInput width="lg" value={q} onValueChange={reset(setQ)} label="Search users" placeholder="Search users by name, email, role or factory" />
        <Select variant="filter" leadIcon={Factory} className="ds-select--180" label="Factory" value={factory} onChange={reset(setFactory)} searchable={false}
          options={['All Factories', 'Factory 1 - Haridwar'].map(v => ({ value: v, label: v }))} />
        <Select variant="filter" leadIcon={CircleDot} className="ds-select--180" label="Status" value={status} onChange={reset(setStatus)} searchable={false}
          options={['All Status', 'Active', 'Inactive'].map(v => ({ value: v, label: v }))} />
        <Button leading={Plus} minWidth onClick={() => setEdit('new')}>Add user</Button>
      </>}
      overlays={<>
        <ConfirmDialog open={!!del} title="Delete user?" message={del ? `${del.name} (${del.email}) loses access to Vision Automation.` : ''} confirmLabel="Delete"
          onCancel={() => setDel(null)} onConfirm={() => { setUsers(us => us.filter(u => u.id !== del!.id)); toast(`${del!.name} deleted`); setDel(null); }} />
        <UserPanel user={edit} onClose={() => setEdit(null)} onSave={u => {
          setUsers(us => (us.some(x => x.id === u.id) ? us.map(x => (x.id === u.id ? u : x)) : [u, ...us]));
          toast(edit === 'new' ? `${u.name} added` : `${u.name} updated`); setEdit(null);
        }} />
      </>}>
      <div className="ds-cluster app-between">
        <Tabs label="Roles" idBase="roles" value={tab} onChange={reset(setTab)} controls="users-table"
          tabs={[{ value: 'all' as TabValue, label: 'All Users', count: users.length }, ...ROLES.map(r => ({ value: r as TabValue, label: TAB_LABEL[r], count: users.filter(u => u.role === r).length }))]} />
        <Button variant="secondary" leading={Export} onClick={() => toast(`${filtered.length} users exported`)}>Export</Button>
      </div>
      <div id="users-table">
        <TableCard>
          <DataTable caption="Users" columns={cols} rows={rows} rowKey={u => u.id} rowHeader="name" minWidth={1300} empty="No users match your filters." />
          <Pagination page={current} pageSize={PAGE} total={filtered.length} noun="users" onPage={setPage} />
        </TableCard>
      </div>
    </VisionShell>
  );
}

function UserPanel({ user, onClose, onSave }: { user: User | 'new' | null; onClose: () => void; onSave: (u: User) => void }) {
  const base = user && user !== 'new' ? user : null;
  const [f, setF] = useState({ name: base?.name ?? '', email: base?.email ?? '', role: (base?.role ?? null) as Role | null, factory: base?.factory ?? 'Factory 1 - Haridwar' });
  const [tried, setTried] = useState(false);
  const [key, setKey] = useState<User | 'new' | null>(user);
  if (key !== user) { setKey(user); setF({ name: base?.name ?? '', email: base?.email ?? '', role: base?.role ?? null, factory: base?.factory ?? 'Factory 1 - Haridwar' }); setTried(false); }
  const errs = { name: !f.name.trim() ? 'Enter the user’s name.' : '', email: !/^\S+@\S+\.\S+$/.test(f.email) ? 'Enter a valid email address.' : '', role: !f.role ? 'Choose a role.' : '' };
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined);
  const save = () => {
    setTried(true);
    if (Object.values(errs).some(Boolean)) { window.setTimeout(() => document.querySelector<HTMLElement>('.ds-panel [aria-invalid="true"]')?.focus(), 0); return; }
    onSave({ id: base?.id ?? `u${Date.now()}`, name: f.name.trim(), email: f.email.trim(), role: f.role!, factory: f.role === 'HUL Admin' ? 'All Factories' : f.factory,
      lines: 'All Lines', status: base?.status ?? { tone: 'success', label: 'Active' }, lastActive: base?.lastActive ?? 'Just now' });
  };
  return (
    <SlidePanel open={!!user} onClose={onClose} size="md" title={base ? 'Edit User' : 'Add User'} icon={<Illustration name="illus.user-group" size={36} fit="cover" />}
      dirty={!!(f.name || f.email) && !base}
      footer={<>
        <Button variant="secondary" leading={ArrowBack} onClick={onClose}>Cancel</Button>
        <Button minWidth onClick={save}>{base ? 'Save changes' : 'Add user'}</Button>
      </>}>
      <div className="ds-form-grid ds-form-grid--1">
        <Field label="Full name" required error={e('name')}><TextInput placeholder="Enter full name" value={f.name} onChange={x => setF({ ...f, name: x.target.value })} /></Field>
        <Field label="Email ID" required error={e('email')}><TextInput type="email" placeholder="name@hul.com" value={f.email} onChange={x => setF({ ...f, email: x.target.value })} /></Field>
        <Field label="Role" required error={e('role')}><Select placeholder="Choose role" value={f.role} onChange={v => setF({ ...f, role: v as Role })} options={ROLES.map(r => ({ value: r, label: r }))} searchable={false} /></Field>
        <Field label="Factory"><Select value={f.factory} onChange={v => setF({ ...f, factory: v })} searchable={false}
          options={['Factory 1 - Haridwar', 'Factory 2 - Pune', 'Factory 3 - Mumbai'].map(v => ({ value: v, label: v }))} /></Field>
      </div>
    </SlidePanel>
  );
}

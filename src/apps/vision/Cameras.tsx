import { CircleDot, Factory } from 'lucide-react';
import { useMemo, useState } from 'react';
import { VisionShell } from './Shell';
import { SITES, type Camera, type Site } from './data';
import { Button, IconButton } from '../../components/ds/Button';
import { SearchInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { Badge, Illustration } from '../../components/ds/Display';
import { Collapsible, DataTable, type Column } from '../../components/ds/Table';
import { ConfirmDialog } from '../../components/ds/Overlay';
import { Edit, Plus, PlusLarge, Trash } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';

const FACTORY_OPTS = ['All Factories', ...SITES.map(s => s.name)].map(v => ({ value: v, label: v }));
const STATUS_OPTS = ['All Status', 'Active', 'Offline'].map(v => ({ value: v, label: v }));

/** Frame 4 · Cameras (491:12471): collapsible factories → nested line groups → camera tables. */
export function CamerasApp() {
  const [sites, setSites] = useState<Site[]>(SITES);
  const [q, setQ] = useState('');
  const [factory, setFactory] = useState('All Factories');
  const [status, setStatus] = useState('All Status');
  const [open, setOpen] = useState<Record<string, boolean>>({ s1: true, f1l1: true });
  const [del, setDel] = useState<{ site: string; line: string; cam: Camera } | null>(null);
  const toggle = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }));

  const shown = useMemo(() => sites.filter(s => factory === 'All Factories' || s.name === factory).map(s => ({
    ...s, lines: s.lines.map(l => ({ ...l, cameras: l.cameras.filter(c => (status === 'All Status' || c.status.label === status)
      && `${c.name} ${c.serial} ${c.ip} ${s.name}`.toLowerCase().includes(q.toLowerCase())) })),
  })), [sites, factory, status, q]);

  const cols = (site: string, line: string): Column<Camera>[] => [
    { key: 'name', header: 'Camera name' }, { key: 'serial', header: 'Serial number' }, { key: 'ip', header: 'IP address' },
    { key: 'status', header: 'Status', render: c => <Badge tone={c.status.tone} appearance="glass">{c.status.label}</Badge> },
    { key: 'installed', header: 'Installed on' }, { key: 'lastActive', header: 'Last active' },
    { key: 'actions', header: 'Actions', hiddenHeader: true, align: 'end', render: c => (
      <span className="ds-row-actions">
        <IconButton icon={Edit} size="compact" label={`Edit ${c.name}`} onClick={() => toast(`Edit form for ${c.name} opens here`)} />
        <IconButton icon={Trash} size="compact" label={`Delete ${c.name}`} onClick={() => setDel({ site, line, cam: c })} />
      </span>
    ) },
  ];

  return (
    <VisionShell current="cameras" title="Cameras" icon={<Illustration name="illus.camera" size={36} />}
      actions={<>
        <SearchInput width="sm" value={q} onValueChange={setQ} label="Filter cameras" placeholder="Filter factories or units..." />
        <Select variant="filter" leadIcon={Factory} className="ds-select--180" label="Factory" value={factory} onChange={setFactory} options={FACTORY_OPTS} searchable={false} />
        <Select variant="filter" leadIcon={CircleDot} className="ds-select--180" label="Status" value={status} onChange={setStatus} options={STATUS_OPTS} searchable={false} />
        <Button leading={Plus} minWidth onClick={() => toast('The Add Cameras form opens here (see Add Cameras example)')}>Add camera</Button>
      </>}
      overlays={<ConfirmDialog open={!!del} title="Delete camera?" message={del ? `${del.cam.name} will stop sending frames and be removed from ${del.line}.` : ''} confirmLabel="Delete"
        onCancel={() => setDel(null)} onConfirm={() => {
          if (!del) return;
          setSites(ss => ss.map(s => s.id !== del.site ? s : { ...s, lines: s.lines.map(l => l.id !== del.line ? l : { ...l, cameras: l.cameras.filter(c => c.id !== del.cam.id) }) }));
          toast(`${del.cam.name} deleted`); setDel(null);
        }} />}>
      <div className="ds-section-stack">
        {shown.map(s => (
          <Collapsible key={s.id} title={s.name} count={s.count} open={!!open[s.id]} onToggle={() => toggle(s.id)}>
            {s.lines.map(l => (
              <Collapsible key={l.id} nested headingLevel={3} title={l.name} count={l.cameras.length} open={!!open[l.id]} onToggle={() => toggle(l.id)}
                action={<Button variant="subtle" leading={PlusLarge} onClick={() => toast(`Add a camera to ${s.name} · ${l.name}`)}>Add Camera to Line</Button>}>
                <DataTable caption={`${s.name} ${l.name} cameras`} columns={cols(s.id, l.id)} rows={l.cameras} rowKey={c => c.id} rowHeader="name" minWidth={1100}
                  empty="No cameras on this line match your filters." />
              </Collapsible>
            ))}
          </Collapsible>
        ))}
        {!shown.length && <div className="ds-empty"><p className="ds-text-body-muted">No factories match these filters.</p></div>}
      </div>
    </VisionShell>
  );
}

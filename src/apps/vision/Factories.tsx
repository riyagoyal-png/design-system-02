import { CircleDot } from 'lucide-react';
import { useMemo, useState } from 'react';
import { VisionShell } from './Shell';
import { FACTORIES, PICKER_PEOPLE, utilTone, type Factory } from './data';
import { Field, SearchInput, TextInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { RichPicker } from '../../components/ds/Inputs2';
import { Illustration, Stepper } from '../../components/ds/Display';
import { EntityCard, KpiCard } from '../../components/ds/Cards';
import { Modal, SlidePanel } from '../../components/ds/Overlay';
import { DataTable, type Column } from '../../components/ds/Table';
import { Tabs } from '../../components/ds/Nav';
import { Button, LinkAction } from '../../components/ds/Button';
import { ArrowBack, ChevronRight, Plus, Upload } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';

const STATUS_OPTS = ['All Status', 'Active', 'Warning', 'Offline'].map(v => ({ value: v, label: v }));
const REGION_OPTS = ['West', 'North', 'South', 'East'].map(v => ({ value: v, label: v }));
const STEPS = [{ title: 'Basic Details', sub: 'In progress' }, { title: 'Configuration', sub: 'Lines & Sensors' }, { title: 'Review & Add', sub: 'Summary' }];

/** Frame 2 · Factories (452:10239); `flow` opens frame 3 (Add New Factory, picker open) or frame 5 (step 2 + Add Cameras modal). */
export function FactoriesApp({ flow }: { flow?: 'add-factory' | 'add-cameras' }) {
  const [factories, setFactories] = useState(FACTORIES);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All Status');
  const [panel, setPanel] = useState(!!flow);
  const shown = useMemo(() => factories.filter(f =>
    (status === 'All Status' || f.status.label === status) && `${f.name} ${f.city}`.toLowerCase().includes(q.toLowerCase())), [factories, q, status]);
  const active = factories.filter(f => f.status.label === 'Active').length;
  return (
    <VisionShell current="factories" withLines={flow === 'add-cameras'} title="Factories" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />}
      actions={<>
        <SearchInput width="sm" value={q} onValueChange={setQ} label="Filter factories or units" placeholder="Filter factories or units..." />
        <Select variant="filter" leadIcon={CircleDot} className="ds-select--180" label="Status" value={status} onChange={setStatus} options={STATUS_OPTS} searchable={false} />
        <Button leading={Plus} minWidth onClick={() => setPanel(true)}>Add factory</Button>
      </>}
      overlays={<AddFactoryPanel open={panel} onClose={() => setPanel(false)} start={flow === 'add-cameras' ? 1 : 0} cameraModal={flow === 'add-cameras'} pickerOpen={flow === 'add-factory'}
        onAdd={f => { setFactories(fs => [...fs, f]); setPanel(false); toast(`${f.name} added`); }} />}>
      <div className="ds-kpi-row">
        <KpiCard label="Total Factories" value={factories.length} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} />
        <KpiCard label="Active Factories" value={active} icon={<Illustration name="illus.facility-set" crop="factory-active" size={52} />} />
        <KpiCard label="Total Lines" value={28} icon={<Illustration name="illus.conveyor-line" crop="conveyor" size={52} />} />
        <KpiCard label="Cameras Online" value="96 / 112" icon={<Illustration name="illus.facility-set" crop="camera-zoom" size={52} />} />
      </div>
      <section className="app-section" aria-labelledby="units-title">
        <h2 className="ds-section-title" id="units-title">Active Operational Units<span className="ds-section-title__dot" aria-hidden="true" /><span>{shown.length}</span></h2>
        {shown.length ? (
          <div className="ds-entity-grid ds-entity-grid--3">
            {shown.map(f => (
              <EntityCard key={f.id} title={f.name} location={f.city} status={f.status} icon={<Illustration name="illus.facility-set" crop="factory" size={40} />}
                metric={{ value: f.lines, of: f.linesOf, unit: 'lines active', tone: utilTone(f) }} meta={{ text: `${f.cameras} cameras` }}
                owner={f.admin} role="Factory Admin" actionLabel="View factory" onAction={() => toast(`${f.name} details open here`)} />
            ))}
          </div>
        ) : <div className="ds-empty"><p className="ds-text-body-muted">No factories match these filters.</p></div>}
      </section>
    </VisionShell>
  );
}

/** Frames 3 and 5 · "Add New Factory" slide panel (xl, 3 steps). */
function AddFactoryPanel({ open, onClose, start, cameraModal, pickerOpen, onAdd }: {
  open: boolean; onClose: () => void; start: number; cameraModal?: boolean; pickerOpen?: boolean; onAdd: (f: Factory) => void;
}) {
  const [step, setStep] = useState(start);
  const [form, setForm] = useState({ name: '', city: '', region: null as string | null, admin: null as string | null });
  const [tried, setTried] = useState(false);
  const [lines, setLines] = useState([{ id: 'l1', name: 'Bottle Line - 1', code: 'L01', cameras: 2 }, { id: 'l2', name: 'Bottle Line - 2', code: 'L02', cameras: 2 }]);
  const [tab, setTab] = useState<'lines' | 'cameras'>('lines');
  const [modal, setModal] = useState(!!cameraModal);
  const errors = {
    name: !form.name.trim() ? 'Enter the factory name.' : '', city: !form.city.trim() ? 'Enter the location.' : '',
    region: !form.region ? 'Choose a region.' : '', admin: !form.admin ? 'Choose the factory admin.' : '',
  };
  const valid = !Object.values(errors).some(Boolean);
  const dirty = !!(form.name || form.city || form.region || form.admin);
  const next = () => {
    if (step === 0) { setTried(true); if (!valid) { window.setTimeout(() => document.querySelector<HTMLElement>('.ds-panel [aria-invalid="true"]')?.focus(), 0); return; } }
    if (step < 2) setStep(step + 1);
    else onAdd({ id: `f${Date.now()}`, name: form.name, city: form.city, status: { tone: 'success', label: 'Active' }, lines: lines.length, linesOf: lines.length, cameras: lines.reduce((s, l) => s + l.cameras, 0), admin: PICKER_PEOPLE.find(p => p.id === form.admin)?.name ?? '' });
  };
  const close = () => { onClose(); setStep(start); setTried(false); };
  const err = (k: keyof typeof errors) => (tried ? errors[k] || undefined : undefined);
  const lineCols: Column<(typeof lines)[number]>[] = [
    { key: 'name', header: 'Line name' }, { key: 'code', header: 'Line code' },
    { key: 'cameras', header: 'Cameras', align: 'num', render: l => l.cameras },
  ];
  return (
    <>
      <SlidePanel open={open} onClose={close} size="xl" dirty={dirty} title="Add New Factory"
        subtitle={step > 0 ? 'Provision and integrate a new operational manufacturing unit.' : undefined}
        icon={<Illustration name="illus.facility-set" crop="factory" size={40} />}
        subheader={<Stepper steps={STEPS} current={step} />}
        footer={<>
          <Button variant="secondary" leading={ArrowBack} onClick={() => (step === 0 ? close() : setStep(step - 1))}>Back</Button>
          <div className="ds-panel__footer-end">
            <p className="ds-panel__note" role="status">Auto-saved draft 12s ago</p>
            <Button trailing={ChevronRight} minWidth onClick={next}>{step === 0 ? 'Next: Configuration' : step === 1 ? 'Review & Add' : 'Add factory'}</Button>
          </div>
        </>}>
        {step === 0 && (
          <div className="ds-form-grid">
            <Field label="Factory Name" required error={err('name')} className="ds-span-all">
              <TextInput placeholder="Enter factory name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Location / City" required error={err('city')}>
              <TextInput placeholder="Enter location" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="Assigned Region" required error={err('region')}>
              <Select placeholder="Enter region name" value={form.region} onChange={v => setForm({ ...form, region: v })} options={REGION_OPTS} searchable={false} />
            </Field>
            <div className="ds-span-all app-stack-16">
              <Field label="Factory Admin / Plant Manager" required error={err('admin')}>
                <RichPicker people={PICKER_PEOPLE} value={form.admin} onChange={v => setForm({ ...form, admin: v })} defaultOpen={pickerOpen} />
              </Field>
              <LinkAction icon={Plus} onClick={() => toast('The add-user form opens here')}>Add New User</LinkAction>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="app-stack-16">
            <Tabs label="Configuration" idBase="cfg" value={tab} onChange={setTab} tabs={[{ value: 'lines', label: 'Lines' }, { value: 'cameras', label: 'Cameras' }]} variant="accent" />
            <div className="ds-cluster app-between">
              <p className="ds-text-body-muted">Lines and their cameras for this factory.</p>
              <span className="ds-cluster">
                <Button variant="secondary" leading={Upload} onClick={() => toast('CSV import opens here')}>Import (CSV)</Button>
                {tab === 'lines'
                  ? <Button leading={Plus} onClick={() => setLines(ls => [...ls, { id: `l${ls.length + 1}`, name: `Bottle Line - ${ls.length + 1}`, code: `L0${ls.length + 1}`, cameras: 0 }])}>Add Line</Button>
                  : <Button leading={Plus} onClick={() => setModal(true)}>Add Camera</Button>}
              </span>
            </div>
            <div className="ds-table-card"><DataTable caption="Production lines" columns={lineCols} rows={lines} rowKey={l => l.id} rowHeader="name" /></div>
          </div>
        )}
        {step === 2 && (
          <dl className="app-review">
            <div><dt className="ds-text-small">Factory</dt><dd className="ds-text-body-strong">{form.name || '—'}</dd></div>
            <div><dt className="ds-text-small">Location</dt><dd className="ds-text-body-strong">{form.city || '—'}</dd></div>
            <div><dt className="ds-text-small">Region</dt><dd className="ds-text-body-strong">{form.region ?? '—'}</dd></div>
            <div><dt className="ds-text-small">Admin</dt><dd className="ds-text-body-strong">{PICKER_PEOPLE.find(p => p.id === form.admin)?.name ?? '—'}</dd></div>
            <div><dt className="ds-text-small">Lines</dt><dd className="ds-text-body-strong">{lines.length}</dd></div>
          </dl>
        )}
      </SlidePanel>
      <AddCamerasModal open={open && modal} onClose={() => setModal(false)} onAdd={line => { setModal(false); setLines(ls => ls.map(l => (l.name === line ? { ...l, cameras: l.cameras + 1 } : l))); toast('Camera added'); }}
        lines={lines.map(l => l.name)} />
    </>
  );
}

/** Frame 5 · "Add Cameras" modal (491:14290): eight caps-label fields in two columns. */
function AddCamerasModal({ open, onClose, onAdd, lines }: { open: boolean; onClose: () => void; onAdd: (line: string) => void; lines: string[] }) {
  const [v, setV] = useState({ id: '', ip: '', brand: '', model: '', serial: '', rtsp: '', line: null as string | null, type: null as string | null });
  const [tried, setTried] = useState(false);
  const errs = { id: !v.id.trim() ? 'Enter the camera ID.' : '', ip: !/^\d{1,3}(\.\d{1,3}){3}$/.test(v.ip.trim()) ? 'Enter a valid IPv4 address.' : '', brand: !v.brand.trim() ? 'Enter the camera brand.' : '' };
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined);
  const set = (k: keyof typeof v) => (ev: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: ev.target.value });
  const submit = () => { setTried(true); if (Object.values(errs).some(Boolean)) return; onAdd(v.line ?? lines[0]); };
  return (
    <Modal open={open} onClose={onClose} title="Add Cameras" icon={<Illustration name="illus.camera" size={32} />} dirty={!!(v.id || v.ip || v.brand)}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Skip</Button>
        <Button minWidth onClick={submit}>Add Camera</Button>
      </>}>
      <div className="ds-form-grid">
        <Field caps label="Camera ID" required error={e('id')}><TextInput placeholder="e.g. - CAM01 - L01" value={v.id} onChange={set('id')} /></Field>
        <Field caps label="Camera IP" required error={e('ip')}><TextInput placeholder="e.g. - 192.168.1.101" value={v.ip} onChange={set('ip')} inputMode="decimal" /></Field>
        <Field caps label="Camera Brand" required error={e('brand')}><TextInput placeholder="e.g. - Hanwa QNO-7080R" value={v.brand} onChange={set('brand')} /></Field>
        <Field caps label="Model No."><TextInput placeholder="e.g. - 192.168.1.101" value={v.model} onChange={set('model')} /></Field>
        <Field caps label="Serial Number"><TextInput placeholder="e.g. - SN-2048-0012" value={v.serial} onChange={set('serial')} /></Field>
        <Field caps label="RTSP URL"><TextInput placeholder="e.g. - rtsp://admin:pass@192.168.1.101:554" value={v.rtsp} onChange={set('rtsp')} /></Field>
        <Field caps label="Line Associated With"><Select placeholder="e.g. - Line 1" value={v.line} onChange={x => setV({ ...v, line: x })} options={lines.map(l => ({ value: l, label: l }))} searchable={false} /></Field>
        <Field caps label="Inspection Type"><Select placeholder="e.g. - Primary - Front Label" value={v.type} onChange={x => setV({ ...v, type: x })}
          options={['Primary - Front Label', 'Primary - Back Label', 'Secondary - Carton', 'Tertiary - CLD'].map(x => ({ value: x, label: x }))} searchable={false} /></Field>
      </div>
    </Modal>
  );
}


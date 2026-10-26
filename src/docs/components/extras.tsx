import { useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog, Modal, SlidePanel } from '../../components/ds/Overlay';
import { Tooltip } from '../../components/ds/Tooltip';
import { toast } from '../../components/ds/Toast';
import { ArrowLeft, Copy, Factory as FactoryIcon, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ComponentDoc } from '../ComponentPage';
import { Cell, Grid } from '../kit';
import { Button, IconButton, LinkAction } from '../../components/ds/Button';
import { Avatar, Badge, Callout, Chip, CountPill, Dot, EmptyState, IconTile, Illustration, InlineAlert, LiveBadge, Metric, Progress, SegBar, Skeleton, Status, Stepper, Tag, TAG_ORDER, type TagColor } from '../../components/ds/Display';
import { DashCard, EntityCard, MediaCard, StatusCard, SummaryStrip } from '../../components/ds/Cards';
import { Field, Textarea, TextInput } from '../../components/ds/Field';
import { MultiSelect, Select } from '../../components/ds/Select';
import { BinaryToggle, RadioCards, Switch } from '../../components/ds/Choice';
import { AttachField, DateRangePicker, FileUpload, RichPicker } from '../../components/ds/Inputs2';
import { Breadcrumb, NavItem, PageHeader, Pagination, Sidebar, Tabs } from '../../components/ds/Nav';
import { Collapsible, DataTable, TableCard, type Column } from '../../components/ds/Table';
import { ArrowBack, ChevronRight } from '../../components/ds/figmaIcons';
import { StaticModal } from './overlays';
import { CAMERA_STATUS, FACTORIES, LIVE, PICKER_PEOPLE, ROLES, SITES, USER, USERS, asset, type Camera as Cam, type Factory } from '../../apps/vision/data';

type Extra = Partial<Pick<ComponentDoc, 'anatomy' | 'playground' | 'states' | 'variants' | 'staticComponent' | 'noVariants'>>;
const opts = (xs: string[]) => xs.map(v => ({ value: v, label: v }));
const factoryOpts = opts(FACTORIES.map(f => f.name));
const people = PICKER_PEOPLE;
const navIcon = <Illustration name="illus.facility-set" crop="factory" size={24} />;

/* Domain tables (Factories frame 2, Cameras frame 4) used by the table, card and loading examples. */
const factoryColumns: Column<Factory>[] = [
  { key: 'name', header: 'Factory', sortable: true, sortValue: f => f.name },
  { key: 'city', header: 'Location' },
  { key: 'lines', header: 'Lines active', align: 'num', sortable: true, sortValue: f => f.lines / (f.linesOf || 1), render: f => `${f.lines} / ${f.linesOf}` },
  { key: 'cameras', header: 'Cameras', align: 'num', render: f => f.cameras },
  { key: 'status', header: 'Status', shrink: true, render: f => <Badge tone={f.status.tone} appearance="glass">{f.status.label}</Badge> },
  { key: 'admin', header: 'Factory admin' },
];
const cameraColumns: Column<Cam>[] = [
  { key: 'name', header: 'Camera' }, { key: 'serial', header: 'Serial no.' }, { key: 'ip', header: 'IP address' },
  { key: 'status', header: 'Status', shrink: true, render: c => <Badge tone={c.status.tone} appearance="glass">{c.status.label}</Badge> },
];
const line1 = SITES[0].lines[0];

/* Static renders of overlay markup (overlays themselves portal into #ds-overlay-host over the shell). */
const StaticPanel = () => (
  <div className="doc-static-panel">
    <aside className="ds-panel" data-part="panel">
      <div className="ds-panel__header" data-part="header"><div className="ds-panel__titlerow"><div className="ds-panel__titlegroup"><span className="ds-panel__icon" aria-hidden="true"><Illustration name="illus.facility-set" crop="factory" size={40} /></span><p className="ds-text-dialog-title">Add New Factory</p></div><span className="ds-icon-btn ds-icon-btn--close" aria-hidden="true">×</span></div></div>
      <div className="ds-panel__body" data-part="body"><div className="ds-form-grid"><div className="ds-field"><span className="ds-field__label">Factory Name</span><span className="ds-input doc-static-input" /></div><div className="ds-field"><span className="ds-field__label">Location / City</span><span className="ds-input doc-static-input" /></div></div></div>
      <div className="ds-panel__footer" data-part="footer"><span className="ds-btn ds-btn--secondary">Back</span><span className="ds-panel__footer-end"><span className="ds-panel__note">Auto-saved draft 12s ago</span><span className="ds-btn ds-btn--primary">Next: Configuration</span></span></div>
    </aside>
  </div>
);

function PlayState<T>({ init, children }: { init: T; children: (v: T, set: (v: T) => void) => ReactNode }) {
  const [v, setV] = useState(init);
  return <>{children(v, setV)}</>;
}

export const EXTRAS: Record<string, Extra> = {
  '/components/icon-buttons': {
    anatomy: { render: () => <IconButton icon={Pencil} label="Edit Anita Sharma" size="compact" tooltip={false} />, parts: [{ part: 'container', label: 'Hit area', spec: '36×36 (md, 20px glyph) / 32×32 (compact, 24px glyph) / 28×28 (sm, 16px glyph) · radius 8 · transparent; hover surface-hover + text-primary' }] },
  },
  '/components/link-action': {
    anatomy: { render: () => <LinkAction icon={Plus}>Add New User</LinkAction>, parts: [{ part: 'container', label: 'Action', spec: 'inline-flex, gap 8, radius 4 (focus)' }, { part: 'icon', label: 'Icon', spec: '14px plus, currentColor' }, { part: 'label', label: 'Label', spec: 'link-action 14/20 600 link (hover link-hover)' }] },
    playground: {
      controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'icon', label: 'Leading plus' }],
      initial: { label: 'Add New User', icon: true },
      render: p => <LinkAction icon={p.icon ? Plus : undefined}>{String(p.label)}</LinkAction>,
      code: p => `<LinkAction${p.icon ? ' icon={Plus}' : ''}>${p.label}</LinkAction>`,
    },
  },
  '/components/action-group': {
    staticComponent: 'An action group has no states of its own; each member keeps its own states (§5.54).',
    anatomy: { render: () => <div className="doc-footer-demo doc-narrow-xl" data-part="container"><span data-part="secondary" className="ds-contents"><Button variant="secondary" leading={ArrowBack}>Back</Button></span><span data-part="primary" className="ds-contents"><Button minWidth trailing={ChevronRight}>Next: Configuration</Button></span></div>,
      parts: [{ part: 'container', label: 'Panel footer group', spec: 'justify-content: space-between' }, { part: 'secondary', label: 'Secondary (start)', spec: 'Back / Cancel with a 20px back arrow' }, { part: 'primary', label: 'Primary (end)', spec: 'min-width 180 (size-header-button), trailing chevron' }] },
    playground: {
      controls: [{ kind: 'select', key: 'ctx', label: 'Context', options: ['Modal', 'Panel footer', 'Row actions', 'Popover footer'] }],
      initial: { ctx: 'Modal' },
      render: p => p.ctx === 'Modal' ? <div className="ds-modal__footer"><Button variant="secondary">Skip</Button><Button minWidth>Add Camera</Button></div>
        : p.ctx === 'Panel footer' ? <div className="doc-footer-demo doc-narrow-xl"><Button variant="secondary" leading={ArrowBack}>Back</Button><Button minWidth trailing={ChevronRight}>Save product</Button></div>
        : p.ctx === 'Row actions' ? <div className="ds-row-actions"><IconButton icon={Copy} label="Copy Anita Sharma" size="compact" /><IconButton icon={Pencil} label="Edit Anita Sharma" size="compact" /><IconButton icon={Trash2} label="Delete Anita Sharma" size="compact" /></div>
        : <div className="doc-footer-demo doc-narrow-lg"><Button variant="ghost" size="sm">Clear</Button><Button size="sm">Apply</Button></div>,
      code: p => p.ctx === 'Row actions' ? '<div className="ds-row-actions">…3 compact IconButtons (24px glyphs, 16px apart)…</div>' : p.ctx === 'Modal' ? '<Modal footer={<><Button variant="secondary">Skip</Button><Button minWidth>Add Camera</Button></>} …/>' : p.ctx === 'Panel footer' ? '<SlidePanel footer={<><Button variant="secondary" leading={ArrowBack}>Back</Button><Button minWidth trailing={ChevronRight}>Save product</Button></>} …/>' : '<Popover footer={<><Button variant="ghost" size="sm">Clear</Button><Button size="sm">Apply</Button></>} …/>',
    },
  },
  '/components/textareas': {
    noVariants: 'The spec defines one textarea (80px minimum); auto-grow is a product choice.',
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><Field label="Notes (optional)" help="Visible to line operators."><Textarea /></Field></div>, parts: [{ part: 'label', label: 'Label', spec: 'form-label 12/16 500 text-muted' }, { part: 'message', label: 'Helper', spec: 'helper 12/16 text-tertiary, 2px below the control' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'error', label: 'Error' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
      initial: { label: 'Notes (optional)', error: false, disabled: false },
      render: p => <div className="doc-narrow-xl"><Field label={String(p.label)} error={p.error ? 'Keep it under 500 characters.' : undefined}><Textarea disabled={!!p.disabled} /></Field></div>,
      code: p => `<Field label="${p.label}"${p.error ? ' error="…"' : ''}><Textarea${p.disabled ? ' disabled' : ''} /></Field>`,
    },
  },
  '/components/labels': {
    staticComponent: 'Labels are static; the control inside carries the interactive states. Error is shown via the message (see Variants).',
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><Field label="Camera IP" required error="Enter a valid IPv4 address."><TextInput defaultValue="192.168.1" /></Field></div>,
      parts: [{ part: 'container', label: 'Field', spec: 'column, gap 6 (space-form-label)' }, { part: 'label', label: 'Label + required', spec: 'form-label 12/16 500 text-muted (caps in compact modals: uppercase +0.55); " *" in error-text' }, { part: 'message', label: 'Validation', spec: 'validation 12/16 error-text, linked by aria-describedby, 2px below' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'required', label: 'Required' }, { kind: 'bool', key: 'caps', label: 'Caps (compact modal)' }, { kind: 'select', key: 'msg', label: 'Message', options: ['none', 'helper', 'error'] }],
      initial: { label: 'Camera IP', required: true, caps: false, msg: 'helper' },
      render: p => <div className="doc-narrow-xl"><Field label={String(p.label)} caps={!!p.caps} required={!!p.required} help={p.msg === 'helper' ? 'e.g. 192.168.1.101' : undefined} error={p.msg === 'error' ? 'Enter a valid IPv4 address.' : undefined}><TextInput /></Field></div>,
      code: p => `<Field label="${p.label}"${p.caps ? ' caps' : ''}${p.required ? ' required' : ''}${p.msg === 'helper' ? ' help="…"' : p.msg === 'error' ? ' error="…"' : ''}><TextInput /></Field>`,
    },
  },
  '/components/multi-selects': {
    states: () => <Grid min={260}><Cell label="focus-visible"><MultiSelect label="Factories" options={factoryOpts} value={['Factory 1']} onChange={() => {}} triggerClassName="is-focus-visible" /></Cell><Cell label="error"><MultiSelect label="Factories" options={factoryOpts} value={[]} onChange={() => {}} aria-invalid="true" /></Cell><Cell label="disabled"><MultiSelect label="Factories" options={factoryOpts} value={['Factory 2']} onChange={() => {}} disabled /></Cell></Grid>,
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><MultiSelect label="Factories" options={factoryOpts} value={['Factory 1', 'Factory 2']} onChange={() => {}} /></div>, parts: [{ part: 'trigger', label: 'Field trigger', spec: '§5.9 field trigger: 40px, gradient-glass, shadow-field + shadow-edge + shadow-xs, radius 12, values text-primary; joined labels; 18px chevron' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'bool', key: 'action', label: 'Action row' }, { kind: 'bool', key: 'error', label: 'Error' }, { kind: 'select', key: 'width', label: 'Width', options: ['440px', '200px'] }],
      initial: { action: true, error: false, width: '440px' },
      render: p => <PlayState init={['Factory 1']}>{(v, set) => <div className={p.width === '200px' ? 'doc-narrow' : 'doc-narrow-xl'}><MultiSelect label="Factories" options={factoryOpts} value={v} onChange={set} aria-invalid={p.error ? 'true' : undefined} action={p.action ? { label: 'Add New Factory', onAction: () => {} } : undefined} /></div>}</PlayState>,
      code: p => `<MultiSelect options={factories} value={selected} onChange={setSelected}${p.action ? " action={{ label: 'Add New Factory', onAction }}" : ''}${p.error ? ' aria-invalid="true"' : ''} />`,
    },
  },
  '/components/date-pickers': {
    anatomy: { render: () => <DateRangePicker from="2024-04-10" to="2024-04-20" onChange={() => {}} />, parts: [{ part: 'container', label: 'Trigger wrapper', spec: 'width size-filter-date (240)' }, { part: 'trigger', label: 'Filter-select trigger', spec: 'aria-haspopup=dialog · 18px calendar glyph; opens a §5.47 popover with two dates, Apply / Clear' }] },
    playground: {
      controls: [{ kind: 'select', key: 'range', label: 'Value', options: ['range', 'from only', 'to only', 'none'] }],
      initial: { range: 'range' },
      render: p => <PlayState init={0}>{() => <DateRangePicker from={p.range === 'range' || p.range === 'from only' ? '2024-04-10' : ''} to={p.range === 'range' || p.range === 'to only' ? '2024-04-20' : ''} onChange={() => {}} />}</PlayState>,
      code: () => `<DateRangePicker from={from} to={to} onChange={(f, t) => setRange({ from: f, to: t })} />`,
    },
  },
  '/components/checkboxes': { noVariants: 'One checkbox; indeterminate is a state (see States).' },
  '/components/radio-cards': {
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><RadioCards label="Inspection type" value="b" onChange={() => {}} options={[{ value: 'a', label: 'Primary - Front Label' }, { value: 'b', label: 'Secondary - Carton' }]} /></div>, parts: [{ part: 'group', label: 'Radiogroup', spec: 'flex, wraps, gap 12' }, { part: 'card', label: 'Card', spec: 'min-height 40 · padding 10 16 · radius 8 · 1px border-control-hover; selected brand-strong border + surface-nested; 20px radio glyph' }, { part: 'label', label: 'Label', spec: '14/20 text-muted (primary when selected), wraps' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'select', key: 'n', label: 'Options', options: ['2', '3', '4', '4 (vertical)'] }, { kind: 'bool', key: 'disabled', label: 'Disabled group' }],
      initial: { n: '3', disabled: false },
      render: p => <PlayState init="a">{(v, set) => <div className="doc-narrow-xxl"><RadioCards label="Inspection type" value={v} onChange={set} disabled={!!p.disabled} vertical={String(p.n).includes('vertical')} options={['Primary - Front Label', 'Primary - Back Label', 'Secondary - Carton', 'Tertiary - CLD'].slice(0, parseInt(String(p.n), 10)).map((l, i) => ({ value: 'abcd'[i], label: l }))} /></div>}</PlayState>,
      code: p => `<RadioCards label="Inspection type" value={value} onChange={setValue}${String(p.n).includes('vertical') ? ' vertical' : ''}${p.disabled ? ' disabled' : ''} options={[…]} />`,
    },
  },
  '/components/binary-toggle': {
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><BinaryToggle label="Status" value="a" onChange={() => {}} options={[{ value: 'a', label: 'Active', dot: 'success' }, { value: 'b', label: 'Inactive', dot: 'error' }]} /></div>, parts: [{ part: 'container', label: 'Container', spec: 'radiogroup · two equal options in one toggle track · 48px' }, { part: 'option', label: 'Option', spec: 'padding 8 16 · radius 8 · no border, in a gradient-toggle track (1px border-subtle, radius 12, padding 5); 8px glowing dot, 6px gap, 14/20 500 label; selected gradient-toggle-active, label primary' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'bool', key: 'dots', label: 'Status dots' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
      initial: { dots: true, disabled: false },
      render: p => <PlayState init="a">{(v, set) => <div className="doc-narrow-xl"><BinaryToggle label="Status" value={v} onChange={set} disabled={!!p.disabled} options={[{ value: 'a', label: 'Active', dot: p.dots ? 'success' : undefined }, { value: 'b', label: 'Inactive', dot: p.dots ? 'error' : undefined }]} /></div>}</PlayState>,
      code: p => `<BinaryToggle label="Status" value={v} onChange={setV}${p.disabled ? ' disabled' : ''} options={[{ value: 'a', label: 'Active'${p.dots ? ", dot: 'success'" : ''} }, …]} />`,
    },
  },
  '/components/switches': {
    noVariants: 'The spec defines one switch.',
    anatomy: { render: () => <Switch checked onChange={() => {}} label="Auto-save drafts" />, parts: [{ part: 'track', label: 'Track', spec: '36×20, radius full, color-track; on = brand-strong' }, { part: 'thumb', label: 'Thumb', spec: '16px text-muted (white when on), travels 16px toward the end edge' }, { part: 'label', label: 'Visible label', spec: '14/20 text-secondary, 12px gap' }] },
    playground: {
      controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
      initial: { label: 'Auto-save drafts', disabled: false },
      render: p => <PlayState init={true}>{(v, set) => <Switch checked={v} onChange={set} label={String(p.label)} disabled={!!p.disabled} />}</PlayState>,
      code: p => `<Switch checked={on} onChange={setOn} label="${p.label}"${p.disabled ? ' disabled' : ''} />`,
    },
  },
  '/components/file-upload': {
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><FileUpload /></div>, parts: [{ part: 'container', label: 'Dropzone', spec: 'role=button · gradient-glass · 1px dashed border-control · radius 12 · no shadow · padding 24 · gap 8' }, { part: 'icon', label: 'Icon', spec: '32px upload glyph, text-muted at 60%' }, { part: 'title', label: 'Title', spec: '14/20 500 text-secondary' }, { part: 'hint', label: 'Hint', spec: '12/16 text-placeholder, 2px under the title, "•" separators' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'text', key: 'title', label: 'Title' }, { kind: 'bool', key: 'multiple', label: 'Multiple files' }],
      initial: { title: 'Upload Reference', multiple: false },
      render: p => <div className="doc-narrow-xl"><FileUpload key={String(p.multiple)} title={String(p.title)} multiple={!!p.multiple} /></div>,
      code: p => `<FileUpload title="${p.title}"${p.multiple ? ' multiple' : ''} />`,
    },
  },
  '/components/field-with-attach': {
    noVariants: 'One component; the attached / processing appearance are states of it.',
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><AttachField value="8901030875397" onValueChange={() => {}} /></div>, parts: [{ part: 'container', label: 'Row', spec: 'gap 12, wraps' }, { part: 'field', label: 'Field', spec: '§5.5 field: min-height 40 · gradient-glass · 1px border-glass · radius 12 · shadow-field; the wrapper draws the focus ring' }, { part: 'button', label: 'Attach button', spec: 'min-height 40 · gradient-glass · 1px border-control · radius 12 · 14/20 500 text-emphasis' }] },
    playground: {
      surface: 'card', controls: [{ kind: 'bool', key: 'error', label: 'Error' }], initial: { error: false },
      render: p => <PlayState init="">{(v, set) => <div className="doc-narrow-xl"><Field label="Primary Barcode" error={p.error ? 'Text not detected. Upload the photo again.' : undefined}><AttachField value={v} onValueChange={set} /></Field></div>}</PlayState>,
      code: p => `<Field label="Primary Barcode"${p.error ? ' error="…"' : ''}><AttachField value={code} onValueChange={setCode} /></Field>`,
    },
  },
  '/components/rich-picker': {
    noVariants: 'Select-only vs inline-add is a product choice; the "+ Add User" footer row represents it.',
    states: () => <Grid min={340}><Cell label="empty"><RichPicker label="Factory Admin" people={people} value={null} onChange={() => {}} /></Cell><Cell label="with value"><RichPicker label="Factory Admin" people={people} value={people[0].id} onChange={() => {}} /></Cell><Cell label="error"><RichPicker label="Factory Admin" people={people} value={null} onChange={() => {}} aria-invalid="true" /></Cell></Grid>,
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><RichPicker label="Factory Admin" people={people} value={people[1].id} onChange={() => {}} /></div>, parts: [{ part: 'trigger', label: 'Trigger with rich row', spec: '§5.5 field; 40px brand avatar with presence dot + name 12/600 + info chip (EMP ID) + e-mail line (11px mail glyph, 12/16 muted)' }] },
    playground: {
      surface: 'card', controls: [{ kind: 'select', key: 'n', label: 'People', options: ['1', '2', '3'] }], initial: { n: '3' },
      render: p => <PlayState init={null as string | null}>{(v, set) => <div className="doc-narrow-xl"><RichPicker label="Factory Admin" people={people.slice(0, +p.n)} value={v} onChange={set} /></div>}</PlayState>,
      code: () => `<RichPicker people={people} value={adminId} onChange={setAdminId} />`,
    },
  },
  '/components/badges': { staticComponent: 'Badges are not interactive (§5.27): no hover, focus or disabled states.' },
  '/components/tags': {
    staticComponent: 'Tags are static (§5.29). Removable filter chips add a separate remove button (§6.3).',
    anatomy: { render: () => <Tag color="purple">HUL Admin</Tag>, parts: [{ part: 'container', label: 'Tag', spec: 'padding 6 12 · radius 4 · tag 14/20 500 text-primary on a solid fill' }] },
    playground: {
      controls: [{ kind: 'select', key: 'color', label: 'Fill', options: TAG_ORDER }, { kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'raised', label: 'Raised' }],
      initial: { color: 'purple', label: 'HUL Admin', raised: false },
      render: p => <Tag color={p.color as TagColor} raised={!!p.raised}>{String(p.label)}</Tag>,
      code: p => `<Tag color="${p.color}"${p.raised ? ' raised' : ''}>${p.label}</Tag>`,
    },
  },
  '/components/status-indicators': {
    staticComponent: 'Status dots are static; a standalone dot with a tooltip becomes focusable (§5.28).',
    anatomy: { render: () => <Status tone="success" size="md">Active</Status>, parts: [{ part: 'dot', label: 'Dot', spec: '10px (md) / 8px (sm), status glow' }, { part: 'label', label: 'Label', spec: '14/20 text-secondary, 8px gap' }] },
    playground: {
      controls: [{ kind: 'select', key: 'tone', label: 'Tone', options: ['success', 'warning', 'error'] }, { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md'] }, { kind: 'bool', key: 'label', label: 'Visible label' }],
      initial: { tone: 'success', size: 'sm', label: true },
      render: p => p.label ? <Status tone={p.tone as 'success'} size={p.size as 'sm'}>{p.tone === 'success' ? 'Active' : p.tone === 'warning' ? 'Warning' : 'Offline'}</Status> : <Dot tone={p.tone as 'success'} size={p.size as 'sm'} label={String(p.tone)} />,
      code: p => (p.label ? `<Status tone="${p.tone}"${p.size === 'md' ? ' size="md"' : ''}>…</Status>` : `<Dot tone="${p.tone}" label="…" />`),
    },
  },
  '/components/count-pill': {
    staticComponent: 'Not interactive (§5.30).', noVariants: 'One style.',
    anatomy: { render: () => <CountPill>12</CountPill>, parts: [{ part: 'container', label: 'Pill', spec: 'padding 3 13 (26px) · radius full · surface-control · 1px border-subtle · count-pill 14/18 700 text-secondary, tabular' }] },
    playground: { controls: [{ kind: 'text', key: 'n', label: 'Value' }], initial: { n: '12' }, render: p => <div className="ds-cluster"><span className="ds-text-group-title">Factory 1</span><CountPill>{String(p.n)}</CountPill></div>, code: p => `<CountPill>${p.n}</CountPill>` },
  },
  '/components/info-chip': {
    staticComponent: 'Static text (§5.31).', noVariants: 'One style.',
    anatomy: { render: () => <Chip>EMP-8841</Chip>, parts: [{ part: 'container', label: 'Chip', spec: 'padding 2 8 · radius 4 · brand-tint-10 + 1px brand-tint-20 · 10/15 brand-text' }] },
    playground: { controls: [{ kind: 'text', key: 't', label: 'Text' }], initial: { t: 'EMP-8841' }, render: p => <Chip>{String(p.t)}</Chip>, code: p => `<Chip>${p.t}</Chip>` },
  },
  '/components/avatar': {
    staticComponent: 'Avatars are static and decorative when the name is adjacent.',
    anatomy: { render: () => <Avatar name="Priya Nair" />, parts: [{ part: 'container', label: 'Circle', spec: 'brand: 40px, gradient-brand-avatar, 1px brand-avatar-border, 12/16 700 initials · neutral / photo: 32px' }] },
    playground: {
      controls: [{ kind: 'text', key: 'name', label: 'Name' }, { kind: 'select', key: 'variant', label: 'Variant', options: ['brand', 'neutral', 'photo'] }],
      initial: { name: 'Priya Nair', variant: 'brand' },
      render: p => <Avatar name={String(p.name) || 'A'} variant={p.variant as 'brand'} src={p.variant === 'photo' ? USER.src : undefined} />,
      code: p => `<Avatar name="${p.name}"${p.variant !== 'brand' ? ` variant="${p.variant}"` : ''}${p.variant === 'photo' ? ' src={url}' : ''} />`,
    },
  },
  '/components/metric-cards': {
    staticComponent: 'Metric indicators are static (§5.33).',
    anatomy: { render: () => <Metric label="Lines Active" value={6} of={6} />, parts: [{ part: 'label', label: 'Label', spec: 'metric-label 12/18 500 uppercase +0.4 text-muted' }, { part: 'value', label: 'Value', spec: 'metric-value 24/32 700 −0.65 text-primary, tabular; 6px to the denominator' }, { part: 'denominator', label: 'Denominator', spec: 'metric-denominator 14/20 400 text-muted ("/ 6 lines active")' }] },
    playground: {
      controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'text', key: 'value', label: 'Value' }, { kind: 'text', key: 'of', label: 'Denominator (blank = none)' }, { kind: 'select', key: 'tone', label: 'Value tone', options: ['neutral', 'success', 'warning', 'alert'] }],
      initial: { label: 'Lines Active', value: '6', of: '6', tone: 'neutral' },
      render: p => <Metric label={String(p.label)} value={String(p.value)} of={p.of ? Number(p.of) : undefined} tone={p.tone === 'neutral' ? undefined : p.tone as 'success'} />,
      code: p => `<Metric label="${p.label}" value={${p.value}}${p.of ? ` of={${p.of}}` : ''}${p.tone !== 'neutral' ? ` tone="${p.tone}"` : ''} />`,
    },
  },
  '/components/progress': {
    staticComponent: 'Static; value changes animate (500ms, duration-chart).',
    anatomy: { render: () => <div className="doc-narrow-xl doc-stack"><Progress value={75} label="Lines active" /><SegBar segments={[{ value: CAMERA_STATUS.running, color: 'var(--ds-chart-running)', label: 'running' }, { value: CAMERA_STATUS.stopped, color: 'var(--ds-chart-stopped)', label: 'stopped' }]} /></div>,
      parts: [{ part: 'track', label: 'Track', spec: 'progress: 4px, color-track, pill radius · segmented bar: md 20px radius 6 / lg 40px radius 12 (no gaps)' }, { part: 'fill', label: 'Fill', spec: 'brand / success (gradient-progress-success) / warning-text / danger' }, { part: 'value', label: 'Value label', spec: '12/16 600 text-secondary, 8px gap' }, { part: 'segment', label: 'Segment', spec: 'flex-grow ∝ count, min 28px (md), bar-segment 12/600 text-on-bright' }] },
    playground: {
      controls: [{ kind: 'select', key: 'tone', label: 'Tone', options: ['brand', 'success', 'warning', 'error'] }, { kind: 'select', key: 'v', label: 'Value', options: ['0', '50', '75', '100'] }],
      initial: { tone: 'success', v: '75' },
      render: p => <div className="doc-narrow-xl"><Progress value={+p.v} tone={p.tone as 'brand'} label="Lines active" /></div>,
      code: p => `<Progress value={${p.v}}${p.tone !== 'brand' ? ` tone="${p.tone}"` : ''} label="Lines active" />`,
    },
  },
  '/components/callout': {
    staticComponent: 'Static (§5.20).', noVariants: 'Neutral only; status tones are the Alert extension.',
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><Callout title="RTSP stream">The camera must be reachable from the factory network before it can be added.</Callout></div>, parts: [{ part: 'container', label: 'Container', spec: 'padding 14 · radius 8 · surface-nested · 1px border-glass · gap 4' }, { part: 'title', label: 'Title', spec: 'small-strong 12/16 600 text-secondary' }, { part: 'body', label: 'Body', spec: '12px / 1.45 text-muted' }] },
    playground: { surface: 'card', controls: [{ kind: 'text', key: 't', label: 'Title' }, { kind: 'text', key: 'b', label: 'Body' }], initial: { t: 'RTSP stream', b: 'The camera must be reachable from the factory network before it can be added.' }, render: p => <div className="doc-narrow-xl"><Callout title={String(p.t)}>{String(p.b)}</Callout></div>, code: p => `<Callout title="${p.t}">${p.b}</Callout>` },
  },
  '/components/alerts': {
    staticComponent: 'Static; the optional dismiss button has the universal states.',
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xl"><InlineAlert tone="warning" title="Camera offline" onDismiss={() => {}}>Camera 4 on Bottle Line 3 is not sending frames.</InlineAlert></div>, parts: [{ part: 'container', label: 'Container', spec: 'padding 12 14 · radius 8 · status-pill fill + border (tone-bg / tone-border)' }, { part: 'icon', label: 'Status icon', spec: '16px' }, { part: 'content', label: 'Title + body', spec: '12/16 600 + 12/1.45 text-secondary' }, { part: 'dismiss', label: 'Dismiss', spec: 'sm icon button' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'select', key: 'tone', label: 'Tone', options: ['info', 'success', 'warning', 'error'] }, { kind: 'text', key: 'title', label: 'Title' }, { kind: 'bool', key: 'dismiss', label: 'Dismissible' }],
      initial: { tone: 'info', title: 'Scheduled maintenance', dismiss: false },
      render: p => <div className="doc-narrow-xl"><InlineAlert tone={p.tone as 'info'} title={String(p.title)} onDismiss={p.dismiss ? () => {} : undefined}>Analytics will be read-only on Sunday 02:00–04:00.</InlineAlert></div>,
      code: p => `<InlineAlert tone="${p.tone}" title="${p.title}"${p.dismiss ? ' onDismiss={dismiss}' : ''}>…</InlineAlert>`,
    },
  },
  '/components/stepper': {
    staticComponent: 'Non-interactive by default (§5.22); clickable steps would be buttons with universal states.',
    anatomy: { render: () => <div className="doc-narrow-xxl"><Stepper current={0} steps={[{ title: 'Basic Details', sub: 'In progress' }, { title: 'Configuration', sub: 'Lines & Sensors' }]} /></div>, parts: [{ part: 'list', label: 'List', spec: '<ol aria-label="Progress">, flex; 2px connectors with 16px insets' }, { part: 'index', label: 'Current index', spec: '32×32 radius 8 brand-strong, stepper-active-border, shadow-stepper-active; aria-current=step' }, { part: 'text', label: 'Title + subtitle', spec: 'step-title 12/16 700 +0.3 text-primary + step-sub 12/16 500 link' }, { part: 'upcoming', label: 'Upcoming step', spec: 'index and text at 50% (next) / 40% (later); title text-secondary, subtitle text-tertiary' }] },
    playground: {
      controls: [{ kind: 'select', key: 'cur', label: 'Current step', options: ['1', '2', '3'] }],
      initial: { cur: '1' },
      render: p => <div className="doc-narrow-xxl"><Stepper current={+p.cur - 1} steps={[{ title: 'Basic Details', sub: 'In progress' }, { title: 'Configuration', sub: 'Lines & Sensors' }, { title: 'Review & Add', sub: 'Summary' }]} /></div>,
      code: p => `<Stepper current={${+p.cur - 1}} steps={[…]} />`,
    },
  },
  '/components/loading': {
    staticComponent: 'Loading is itself a state (loading → loaded / error); see Variants.',
    anatomy: { render: () => <div className="doc-narrow-xl doc-stack-sm" data-part="container"><Skeleton w="80%" /><Skeleton w="60%" /></div>, parts: [{ part: 'container', label: 'Skeleton bars', spec: '12px tall, radius 6 (radius-chip), skeleton fill, 1.5s pulse' }] },
    playground: {
      controls: [{ kind: 'select', key: 'kind', label: 'Context', options: ['button', 'table'] }, { kind: 'bool', key: 'loading', label: 'Loading' }],
      initial: { kind: 'table', loading: true },
      render: p => p.kind === 'button' ? <Button loading={!!p.loading}>Save product</Button>
        : <section className="ds-table-card doc-full"><DataTable caption="Factories (loading demo)" rowHeader="name" loading={!!p.loading} rowKey={f => f.id} rows={FACTORIES.slice(0, 3)} columns={factoryColumns.slice(0, 3)} /></section>,
      code: p => (p.kind === 'button' ? `<Button${p.loading ? ' loading' : ''}>Save product</Button>` : `<DataTable${p.loading ? ' loading' : ''} … />`),
    },
  },
  '/components/empty-states': {
    staticComponent: 'Static; the action button has the universal states.',
    anatomy: { surface: 'card', render: () => <EmptyState variant="first-use" icon={<Illustration name="illus.facility-set" crop="factory" size={40} />} title="No factories yet" message="Add your first factory to start monitoring its lines." action={<Button leading={Plus}>Add factory</Button>} />,
      parts: [{ part: 'container', label: 'Container', spec: 'centred column, gap 12; padding 48 16 (inline) / 64 24 (first-use) / 64 0 (chart)' }, { part: 'icon', label: 'Illustration / icon tile', spec: '40px, optional' }, { part: 'title', label: 'Title', spec: 'card-title, optional' }, { part: 'message', label: 'Message', spec: 'body-muted, one sentence' }, { part: 'action', label: 'Primary action', spec: 'optional' }] },
    playground: {
      surface: 'card',
      controls: [{ kind: 'select', key: 'v', label: 'Variant', options: ['inline', 'first-use'] }, { kind: 'text', key: 'msg', label: 'Message' }],
      initial: { v: 'first-use', msg: 'Add your first factory to start monitoring its lines.' },
      render: p => p.v === 'inline' ? <EmptyState message={String(p.msg)} /> : <EmptyState variant="first-use" icon={<IconTile icon={FactoryIcon} />} title="No factories yet" message={String(p.msg)} action={<Button leading={Plus}>Add factory</Button>} />,
      code: p => `<EmptyState${p.v === 'first-use' ? ' variant="first-use" icon={…} title="No factories yet"' : ''} message="${p.msg}"${p.v === 'first-use' ? ' action={<Button>Add factory</Button>}' : ''} />`,
    },
  },
  '/components/standard-cards': {
    playground: {
      controls: [{ kind: 'text', key: 'title', label: 'Title' }, { kind: 'select', key: 'status', label: 'Status', options: ['Active', 'Warning', 'Offline'] },
        { kind: 'select', key: 'active', label: 'Lines active', options: ['0', '2', '5', '6'] }, { kind: 'select', key: 'total', label: 'Lines total', options: ['4', '6'] },
        { kind: 'bool', key: 'fallback', label: 'Icon-tile fallback' }],
      initial: { title: 'Factory 1', status: 'Active', active: '6', total: '6', fallback: false },
      render: p => <PlayEntity {...p} />,
      code: p => `<EntityCard title="${p.title}" location="Mumbai, MH" status={{ tone: '${p.status === 'Offline' ? 'error' : p.status === 'Warning' ? 'warning' : 'success'}', label: '${p.status}' }} icon={…}\n  metric={{ value: ${p.active}, of: ${p.total}, unit: 'lines active' }} meta={{ text: '24 cameras' }} owner="Rahul Sharma" role="Factory Admin" actionLabel="View factory" onAction={open} />`,
    },
  },
  '/components/dashboard-card': {
    staticComponent: 'A static container; its loading and empty states are §5.50 / §5.51.',
    anatomy: { render: () => <div className="doc-full"><DashCard title="Quality Snapshot" subtitle="Good vs bad products" right={<Tabs size="sm" idBase="anat" label="View" value="b" onChange={() => {}} tabs={[{ value: 'a', label: 'Time Series' }, { value: 'b', label: 'Factory Wise' }]} />}><div className="doc-placeholder">Chart</div></DashCard></div>,
      parts: [{ part: 'container', label: 'Card', spec: 'padding 24 · radius 16 (radius-card) · gradient-glass · shadow-surface · gap 20' }, { part: 'title', label: 'Title', spec: 'card-title 24/24 600 −0.4; title row min-height 40' }, { part: 'subtitle', label: 'Subtitle', spec: '14/20 text-chart-subtle, 5px below' }, { part: 'controls', label: 'Legend / controls', spec: 'inline-end, 20px apart (space-5)' }, { part: 'body', label: 'Body', spec: 'chart or table; the flush variant runs edge to edge under a border-divider' }] },
    playground: {
      controls: [{ kind: 'bool', key: 'flush', label: 'Flush (tables / heatmaps)' }, { kind: 'bool', key: 'sub', label: 'Subtitle' }],
      initial: { flush: false, sub: true },
      render: p => <div className="doc-full"><DashCard flush={!!p.flush} title="Factory Overview" subtitle={p.sub ? 'Lines active per factory' : undefined}>{p.flush ? <DataTable variant="compact" caption="Factory overview" rowHeader="name" rowKey={f => f.id} rows={FACTORIES.slice(0, 3)} columns={factoryColumns.slice(0, 3)} /> : <div className="doc-placeholder">Chart</div>}</DashCard></div>,
      code: p => `<DashCard title="Factory Overview"${p.sub ? ' subtitle="Lines active per factory"' : ''}${p.flush ? ' flush' : ''}>…</DashCard>`,
    },
  },
  '/components/status-card': {
    staticComponent: 'Inherits the table states; loading and empty per §5.50 / §5.51.', noVariants: 'One composition.',
    anatomy: { render: () => <div className="doc-narrow-xxl"><StatusCard title="Camera Status" running={CAMERA_STATUS.running} stopped={CAMERA_STATUS.stopped}><p className="ds-text-body-muted doc-pad">Compact grid table (§5.41)</p></StatusCard></div>, parts: [{ part: 'header', label: 'Header', spec: 'card-title 20/24 600 + dot legend, min-height 40' }, { part: 'legend', label: 'Dot legend', spec: '12px dots · 12/16 500 text-tertiary labels · 20px apart' }, { part: 'bar', label: 'Segmented bar', spec: '§5.34 md: 20px, radius 6, counts inside' }, { part: 'table', label: 'Table', spec: 'edge to edge under a border-subtle line, five rows under a pinned header' }] },
    playground: {
      controls: [{ kind: 'select', key: 'r', label: 'Running', options: ['0', '24', '123'] }, { kind: 'select', key: 's', label: 'Stopped', options: ['0', '5', '12'] }],
      initial: { r: '123', s: '5' },
      render: p => <div className="doc-narrow-xxl"><StatusCard title="Camera Status" running={+p.r} stopped={+p.s}><p className="ds-text-body-muted doc-pad">{+p.r + +p.s} cameras</p></StatusCard></div>,
      code: p => `<StatusCard title="Camera Status" running={${p.r}} stopped={${p.s}}>…</StatusCard>`,
    },
  },
  '/components/summary-strip': {
    staticComponent: 'Static; a clamped title is focusable for its tooltip.', noVariants: 'Stacked or inline, with or without status fields (see Playground).',
    playground: {
      controls: [{ kind: 'select', key: 'layout', label: 'Layout', options: ['inline', 'stacked'] }, { kind: 'select', key: 'len', label: 'Title length', options: ['short', 'long (clamps to 2 lines)'] }, { kind: 'bool', key: 'status', label: 'Status fields' }],
      initial: { layout: 'inline', len: 'short', status: true },
      render: p => <div className="doc-full"><SummaryStrip layout={p.layout as 'inline'} eyebrow={LIVE.line} title={p.len === 'short' ? LIVE.sku : `${LIVE.sku} — limited edition festive multipack with refill pouch and promotional neck tag`} fields={LIVE.barcodes.slice(0, 2)} statuses={p.status ? [{ label: 'Line', tone: 'error', value: 'Stopped' }] : undefined} /></div>,
      code: p => `<SummaryStrip${p.layout === 'stacked' ? ' layout="stacked"' : ''} eyebrow="Bottle Line 3" title={sku} fields={barcodes}${p.status ? ' statuses={[…]}' : ''} />`,
    },
  },
  '/components/media-card': {
    noVariants: 'One tile anatomy; the status pill tone and an optional detection frame vary (see Playground). The viewer opens from the expand button.',
    states: () => <Grid min={320}>
      <Cell label="default (matched)"><div className="doc-media-cell"><MediaCard title="Front Label Match" sub="Camera 1" src={asset('feed-front-label.png')} status={{ tone: 'success', label: 'Matched' }} detected="“nourishing bodywash”" onOpen={() => {}} /></div></Cell>
      <Cell label="failed read + detection frame"><div className="doc-media-cell"><MediaCard title="CLD / Packing Check" sub="Camera 4" src={asset('feed-cld-packing.png')} status={{ tone: 'error', label: 'Error' }} detected="failed to read due to scratches" detectedError frame={{ left: '36%', top: '31%', width: '54%', height: '39%' }} onOpen={() => {}} /></div></Cell>
    </Grid>,
    anatomy: { render: () => <div className="doc-media-cell"><MediaCard title="Front Label Match" sub="Camera 1" src={asset('feed-front-label.png')} status={{ tone: 'success', label: 'Matched' }} detected="“nourishing bodywash”" onOpen={() => {}} /></div>,
      parts: [{ part: 'container', label: 'Tile', spec: 'radius 24 (radius-panel) · clipped · 1px transparent border · gradient-glass · shadow-glass + shadow-edge above the feed' }, { part: 'header', label: 'Header bar', spec: 'padding 14 24 15 · card colour · border-track divider · 28px icon tile · media-title 20/26 600 · tinted status pill · 16px expand' }, { part: 'media', label: 'Feed', spec: 'surface-media, object-fit cover at 50% opacity' }, { part: 'footer', label: 'Footer bar', spec: 'padding 14 24 · media-detail 14/16 600 "Detected : " + italic 400 value (danger-text on failed reads)' }] },
    playground: {
      controls: [{ kind: 'text', key: 'title', label: 'Title' }, { kind: 'select', key: 'frame', label: 'Feed', options: ['feed-front-label.png', 'feed-product-barcode.png', 'feed-secondary-carton.png', 'feed-cld-packing.png'] }, { kind: 'select', key: 'tone', label: 'Status', options: ['success', 'error'] }, { kind: 'bool', key: 'detect', label: 'Detection frame' }],
      initial: { title: 'Front Label Match', frame: 'feed-front-label.png', tone: 'success', detect: false },
      render: p => <div className="doc-media-cell"><MediaCard title={String(p.title)} sub="Camera 1" src={asset(String(p.frame))} status={{ tone: p.tone as 'success', label: p.tone === 'success' ? 'Matched' : 'Error' }} detected={p.tone === 'error' ? 'failed to read due to scratches' : '“nourishing bodywash”'} detectedError={p.tone === 'error'} frame={p.detect ? { left: '30%', top: '30%', width: '40%', height: '40%' } : undefined} onOpen={() => toast('Opens the media viewer')} /></div>,
      code: p => `<MediaCard title="${p.title}" sub="Camera 1" src={url} status={{ tone: '${p.tone}', label: '${p.tone === 'success' ? 'Matched' : 'Error'}' }} detected="…"${p.tone === 'error' ? ' detectedError' : ''}${p.detect ? ' frame={{ left, top, width, height }}' : ''} onOpen={openViewer} />`,
    },
  },
  '/components/tables': {
    anatomy: { render: () => <section className="ds-table-card doc-full"><DataTable caption="Factories" rowHeader="name" rowKey={f => f.id} rows={FACTORIES.slice(0, 2)} columns={factoryColumns.slice(0, 5)} sort={{ key: 'name', dir: 'ascending' }} onSort={() => {}} /></section>,
      parts: [{ part: 'region', label: 'Scroll region', spec: 'role=region, labelled, tabindex 0, overflow-x auto' }, { part: 'header', label: 'Header row', spec: '40px · surface-table-header · no divider · table-header 12/16 600 uppercase +0.3 text-muted' }, { part: 'sort', label: 'Sort button', spec: 'label + 14px sort glyph; aria-sort on the th, sorted label text-secondary' }, { part: 'row', label: 'Body row', spec: '44px, cells padding 12 16, secondary cells 14/400, no dividers, no zebra' }] },
    playground: {
      controls: [{ kind: 'bool', key: 'selectable', label: 'Selectable' }, { kind: 'bool', key: 'capped', label: 'Capped (sticky header)' }, { kind: 'bool', key: 'loading', label: 'Loading' }, { kind: 'bool', key: 'empty', label: 'Empty' }, { kind: 'bool', key: 'tints', label: 'Status tints' }],
      initial: { selectable: false, capped: false, loading: false, empty: false, tints: false },
      render: p => <PlayTable {...p} />,
      code: p => `<DataTable caption="Factories" rowHeader="name" columns={columns} rows={factories} rowKey={f => f.id}${p.selectable ? ' selectable selected={sel} onSelect={setSel}' : ''}${p.capped ? ' maxHeight={266}' : ''}${p.loading ? ' loading' : ''}${p.tints ? " rowTone={f => f.status.label === 'Offline' ? 'critical' : f.status.label === 'Warning' ? 'warning' : undefined}" : ''} />`,
    },
  },
  '/components/table-card': {
    staticComponent: 'A static container (§5.42).', noVariants: 'With or without the section header / bulk bar (see Playground).',
    anatomy: { render: () => <div className="doc-full"><TableCard title="Users" titleId="anat-tc" count={USERS.length} actions={<Button variant="secondary" size="sm">Export</Button>}><DataTable caption="Users" labelledBy="anat-tc" rowHeader="name" rowKey={u => u.id} rows={USERS.slice(0, 2)} columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }, { key: 'factory', header: 'Factory' }]} /></TableCard></div>,
      parts: [{ part: 'container', label: 'Card', spec: 'radius 16 (radius-card) · gradient-glass · shadow-float-drop + shadow-edge above the content · clipped' }, { part: 'header', label: 'Section header', spec: 'padding 16 · group-title 20/24 700 + small count pill 14px apart · actions at the end · 1px border-faint divider' }] },
    playground: {
      controls: [{ kind: 'bool', key: 'header', label: 'Section header' }, { kind: 'bool', key: 'pagination', label: 'Pagination' }],
      initial: { header: true, pagination: true },
      render: p => <div className="doc-full"><TableCard title={p.header ? 'Users' : undefined} titleId="pl-tc" count={USERS.length}><DataTable caption="Users" rowHeader="name" rowKey={u => u.id} rows={USERS.slice(0, 3)} columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }, { key: 'factory', header: 'Factory' }]} />{p.pagination && <Pagination page={1} pageSize={3} total={USERS.length} noun="users" onPage={() => {}} />}</TableCard></div>,
      code: p => `<TableCard${p.header ? ` title="Users" count={${USERS.length}}` : ''}>\n  <DataTable … />${p.pagination ? '\n  <Pagination … />' : ''}\n</TableCard>`,
    },
  },
  '/components/collapsible-section': {
    anatomy: { render: () => <div className="doc-full"><Collapsible title={SITES[0].name} count={SITES[0].count} open={false} onToggle={() => {}}><p /></Collapsible></div>,
      parts: [{ part: 'container', label: 'Section card', spec: 'radius 16 · gradient-glass · 1px border-faint · shadow-glass-soft' }, { part: 'toggle', label: 'Header button', spec: 'button[aria-expanded] inside an h2 · min-height 64 · padding 8 24 · 32px chevron at the end (start, 24px gap, when nested)' }, { part: 'title', label: 'Title', spec: 'group-title 20/24 700, wraps' }, { part: 'count', label: 'Count pill', spec: '14px after the title' }] },
    playground: {
      controls: [{ kind: 'bool', key: 'nested', label: 'Nested (line)' }, { kind: 'bool', key: 'action', label: 'Action button' }, { kind: 'text', key: 'title', label: 'Title' }],
      initial: { nested: true, action: true, title: line1.name },
      render: p => <PlayState init={true}>{(o, set) => <div className="doc-full"><Collapsible nested={!!p.nested} title={String(p.title)} count={line1.cameras.length} open={o} onToggle={() => set(!o)} action={p.action ? <Button variant="subtle" leading={Plus}>Add Camera to Line</Button> : undefined}><DataTable caption="Cameras" rowHeader="name" rowKey={c => c.id} rows={line1.cameras} columns={cameraColumns} /></Collapsible></div>}</PlayState>,
      code: p => `<Collapsible title="${p.title}" count={${line1.cameras.length}} open={open} onToggle={toggle}${p.nested ? ' nested headingLevel={3}' : ''}${p.action ? ' action={<Button variant="subtle" leading={Plus}>Add Camera to Line</Button>}' : ''}>…</Collapsible>`,
    },
  },
  '/components/navigation-items': {
    anatomy: { render: () => <div className="doc-sidebar-frame"><Sidebar product="Unilever" tagline="Vision Automation" logo={<img src={asset('logo-unilever.svg')} alt="" />} current="factories" user={USER}
        sections={[{ label: 'General', items: [{ id: 'factories', label: 'Factories', icon: navIcon }, { id: 'analytics', label: 'Analytics', icon: <Illustration name="illus.analytics-board" size={24} /> }] }]} /></div>,
      parts: [{ part: 'brand', label: 'Brand row', spec: '40px logo tile (radius 8, 1px border-logo) + product 14/20 600 over tagline 11/16.5 text-muted; 24px collapse toggle (aria-pressed)' }, { part: 'item', label: 'Item', spec: 'min-height 44 · padding 0 14 · radius 16 (radius-nested); current: gradient-nav-active + shadow-card' }, { part: 'icon', label: 'Icon', spec: '24px illustration, 12px to the label' }, { part: 'label', label: 'Label', spec: 'nav-item 14/20 500, one line + tooltip; text-primary when current (weight stays 500)' }, { part: 'user', label: 'User card', spec: 'radius 24 · gradient-glass · 1px border-glass · shadow-glass-soft · padding 12; 32px photo avatar, name 14/18 600, role 12/16 muted, 20px danger logout' }] },
    playground: {
      controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'current', label: 'Current page' }],
      initial: { label: 'Factories', current: true },
      render: p => <div className="doc-nav-item-frame"><NavItem item={{ id: 'p', label: String(p.label), icon: navIcon }} current={!!p.current} /></div>,
      code: p => `<NavItem item={{ id: 'factories', label: '${p.label}', icon: <Illustration name="illus.facility-set" crop="factory" size={24} /> }}${p.current ? ' current' : ''} />`,
    },
  },
  '/components/page-headers': {
    staticComponent: 'The header itself is static; scrolled / unscrolled is shown in Variants.',
    anatomy: { render: () => <div className="doc-header-frame"><PageHeader title="Factories" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />} status={<LiveBadge />} actions={<Button leading={Plus} minWidth>Add factory</Button>} /></div>, parts: [{ part: 'container', label: 'Header', spec: '76px · padding 0 16 · no fill, no divider (shadow-header-scrolled while content scrolls) · space-between' }, { part: 'lead', label: 'Lead', spec: 'optional back button · title block · status pill 12px after' }, { part: 'icon', label: 'Illustration', spec: '36px (size-page-icon), 10px to the title' }, { part: 'title', label: 'Title', spec: 'page-title 24/32 600 −0.35, wraps' }, { part: 'actions', label: 'Actions', spec: 'search → filters → primary, gap 12, wrap' }] },
    playground: {
      controls: [{ kind: 'text', key: 'title', label: 'Title' }, { kind: 'bool', key: 'icon', label: 'Illustration' }, { kind: 'bool', key: 'live', label: 'Live status' }, { kind: 'bool', key: 'back', label: 'Back button' }, { kind: 'bool', key: 'crumb', label: 'Breadcrumb' }, { kind: 'bool', key: 'desc', label: 'Description' }, { kind: 'bool', key: 'scrolled', label: 'Scrolled' }],
      initial: { title: 'Factories', icon: true, live: false, back: false, crumb: false, desc: false, scrolled: false },
      render: p => <div className="doc-header-frame"><PageHeader title={String(p.title)} icon={p.icon ? <Illustration name="illus.facility-set" crop="factory" size={36} /> : undefined} status={p.live ? <LiveBadge /> : undefined} back={p.back ? { label: 'Factories', onBack: () => {} } : undefined} breadcrumb={p.crumb ? [{ label: 'Factories', href: '#/components/page-headers' }] : undefined} description={p.desc ? 'Every factory connected to Vision Automation.' : undefined} scrolled={!!p.scrolled} actions={<Button leading={Plus} minWidth>Add factory</Button>} /></div>,
      code: p => `<PageHeader title="${p.title}"${p.icon ? ' icon={<Illustration … size={36} />}' : ''}${p.live ? ' status={<LiveBadge />}' : ''}${p.back ? " back={{ label: 'Factories', onBack }}" : ''}${p.crumb ? ' breadcrumb={[…]}' : ''}${p.desc ? ' description="…"' : ''}${p.scrolled ? ' scrolled' : ''} actions={…} />`,
    },
  },
  '/components/breadcrumbs': {
    noVariants: 'One style.',
    anatomy: { render: () => <Breadcrumb items={[{ label: 'Factories', href: '#/components/breadcrumbs' }, { label: 'Factory 1', href: '#/components/breadcrumbs/f1' }]} />, parts: [{ part: 'container', label: 'nav[aria-label=Breadcrumb]', spec: '<ol>, gap 6, 12/16' }, { part: 'link', label: 'Link', spec: 'text-muted → text-primary on hover, radius 4 focus' }, { part: 'separator', label: 'Separator', spec: '"/" text-faint, aria-hidden' }] },
    playground: { controls: [{ kind: 'select', key: 'n', label: 'Levels', options: ['1', '2', '3'] }], initial: { n: '2' }, render: p => <Breadcrumb items={['Factories', 'Factory 1', 'Line 1'].slice(0, +p.n).map((l, i) => ({ label: l, href: `#/components/breadcrumbs/${i}` }))} />, code: p => `<Breadcrumb items={[${['Factories', 'Factory 1', 'Line 1'].slice(0, +p.n).map(l => `{ label: '${l}', href: '…' }`).join(', ')}]} />` },
  },
  '/components/tabs': {
    anatomy: { render: () => <Tabs idBase="anat-tabs" label="Anatomy" value="a" onChange={() => {}} tabs={[{ value: 'a', label: 'All Users', count: USERS.length }, { value: 'b', label: ROLES[0], count: USERS.filter(u => u.role === ROLES[0]).length }]} />, parts: [{ part: 'track', label: 'Track', spec: 'gradient-toggle · 1px border-subtle · radius 12 · padding 5 · no shadow' }, { part: 'tab', label: 'Tab', spec: 'padding 10 20 (sm 6 20) · radius 8 · tab 14/20 400; selected = gradient-toggle-active pill + text-primary (weight unchanged)' }, { part: 'count', label: 'Count', spec: 'tab-count 12/16 text-tertiary (muted when selected), 4px after the label' }] },
  },
  '/components/pagination': {
    anatomy: { render: () => <section className="ds-table-card doc-full"><Pagination page={1} pageSize={8} total={USERS.length} noun="users" onPage={() => {}} /></section>, parts: [{ part: 'container', label: 'Bar', spec: 'padding 12 16 · gradient-glass-up · 1px border-subtle top · space-between' }, { part: 'summary', label: 'Summary', spec: '14/20 text-muted; numbers text-primary 500' }, { part: 'pages', label: 'Buttons', spec: '32×32 · radius 6 · surface-control + border-faint · 12/16 500 · gap 6; current brand-strong + 1px white/30% border + shadow-card' }] },
    playground: {
      controls: [{ kind: 'select', key: 'total', label: 'Total rows', options: ['24', '126'] }, { kind: 'select', key: 'size', label: 'Page size', options: ['8', '16'] }],
      initial: { total: '24', size: '8' },
      render: p => <PlayState init={1}>{(pg, set) => <section className="ds-table-card doc-full"><Pagination page={Math.min(pg, Math.ceil(+p.total / +p.size))} pageSize={+p.size} total={+p.total} noun={p.total === '24' ? 'users' : 'products'} onPage={set} /></section>}</PlayState>,
      code: p => `<Pagination page={page} pageSize={${p.size}} total={${p.total}} noun="${p.total === '24' ? 'users' : 'products'}" onPage={setPage} />`,
    },
  },
  '/components/modals': {
    staticComponent: 'Overlay states are open / dirty (Escape asks "Discard changes?"); try the live preview.',
    anatomy: { surface: 'card', render: () => <div className="doc-narrow-xxl"><StaticModal /></div>, parts: [{ part: 'container', label: 'Modal', spec: 'width 720 (sm 440) · padding 24 · sections 28 apart · radius 12 · gradient-dialog · shadow-modal · no border' }, { part: 'header', label: 'Header', spec: '32px illustration + 12px + modal-title 14/18 400; 32px compact close; 20px bottom padding over a border-faint divider' }, { part: 'body', label: 'Body', spec: 'form grid: rows 40 apart, columns 20; caps labels (form-label-caps)' }, { part: 'footer', label: 'Actions', spec: 'end-aligned, 16 apart; secondary min 120, primary min 180' }] },
    playground: {
      controls: [{ kind: 'select', key: 'kind', label: 'Kind', options: ['form modal', 'confirmation'] }, { kind: 'select', key: 'size', label: 'Modal size', options: ['md', 'sm'] }, { kind: 'select', key: 'tone', label: 'Confirm action', options: ['danger', 'primary'] }, { kind: 'text', key: 'title', label: 'Title' }],
      initial: { kind: 'form modal', size: 'md', tone: 'danger', title: 'Add Cameras' },
      render: p => p.kind === 'confirmation' ? <PlayConfirm tone={p.tone as 'danger'} title={String(p.title)} /> : <PlayModal size={p.size as 'md'} title={String(p.title)} />,
      code: p => p.kind === 'confirmation'
        ? `<ConfirmDialog open={open} title="${p.title}" message="…" confirmLabel="${p.tone === 'danger' ? 'Delete user' : 'Publish'}"${p.tone === 'primary' ? ' tone="primary"' : ''} onCancel={close} onConfirm={run} />`
        : `<Modal open={open} onClose={close} title="${p.title}"${p.size === 'sm' ? ' size="sm"' : ''} icon={<Illustration name="illus.camera" size={32} />} dirty={dirty} footer={…}>…</Modal>`,
    },
  },
  '/components/drawers': {
    staticComponent: 'Panel states are open, body scrolled (header shadow) and dirty; try the live preview.',
    anatomy: { render: () => <StaticPanel />, parts: [{ part: 'panel', label: 'Panel', spec: 'gradient-app body · 1px border-subtle start edge · shadow-drawer · no sheen · no radius' }, { part: 'header', label: 'Header', spec: 'padding 20 24 (28 24 33 with a stepper) · gradient-glass · 1px border-subtle divider · illustration + 12 + dialog-title 20/28 700 · 36px close' }, { part: 'body', label: 'Body', spec: 'padding 24, scrolls, gap 28; form grid 20 / 40' }, { part: 'footer', label: 'Footer', spec: 'padding 20 24 · gradient-glass-up · 1px border-subtle · secondary start; note + 180px primary end' }] },
    playground: {
      controls: [{ kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg', 'xl'] }, { kind: 'bool', key: 'stepper', label: 'Stepper' }, { kind: 'bool', key: 'subtitle', label: 'Description' }],
      initial: { size: 'xl', stepper: false, subtitle: false },
      render: p => <PlayPanel size={p.size as 'md'} stepper={!!p.stepper} subtitle={!!p.subtitle} />,
      code: p => `<SlidePanel open={open} onClose={close} title="Add Product" size="${p.size}" icon={<Illustration name="illus.catalog-item" size={36} />}${p.subtitle ? ' subtitle="…"' : ''}${p.stepper ? ' subheader={<Stepper … />}' : ''} dirty={dirty} footer={…}>…</SlidePanel>`,
    },
  },
  '/components/tooltips-popovers': {
    staticComponent: 'Tooltip states are hidden / shown (hover after 300ms or focus) / dismissed (Escape); popovers are open / closed.',
    anatomy: { render: () => <span className="ds-tooltip ds-tooltip--static" data-part="container">Delete Anita Sharma</span>, parts: [{ part: 'container', label: 'Tooltip', spec: 'padding 6 10 · radius 8 · gradient-tooltip · 1px border-glass · shadow-tooltip · 12/16 text-tooltip · max 280' }] },
    playground: {
      controls: [{ kind: 'text', key: 'text', label: 'Tooltip text' }, { kind: 'select', key: 'placement', label: 'Placement', options: ['top', 'bottom', 'right'] }],
      initial: { text: 'Lines running out of total lines, across all factories.', placement: 'top' },
      render: p => <PlayTip text={String(p.text)} placement={p.placement as 'top'} />,
      code: p => `<Tooltip content="${p.text}" placement="${p.placement}"><button>…</button></Tooltip>`,
    },
  },
  '/components/toasts': {
    staticComponent: 'States: visible, paused on hover / focus, replaced by the next toast. §5.48: 4s timeout; the showcase uses 2500ms (5000ms for errors) and no timeout when the toast has an action.',
    anatomy: { render: () => <div className="ds-toast doc-static-toast" data-part="container">Anita Sharma deleted<span className="ds-btn ds-btn--ghost ds-btn--sm">Undo</span></div>, parts: [{ part: 'container', label: 'Toast', spec: 'padding 10 16 · radius 8 · surface-raised · 1px border-subtle · shadow-elevated · toast 14/20 · max 480' }] },
    playground: {
      controls: [{ kind: 'text', key: 'msg', label: 'Message' }, { kind: 'select', key: 'tone', label: 'Tone', options: ['neutral', 'error'] }, { kind: 'bool', key: 'action', label: 'Undo action' }],
      initial: { msg: 'Factory 7 added', tone: 'neutral', action: false },
      render: p => <PlayToast msg={String(p.msg)} tone={p.tone as 'neutral'} action={!!p.action} />,
      code: p => `toast('${p.msg}'${p.tone === 'error' || p.action ? `, { ${[p.tone === 'error' ? "tone: 'error'" : '', p.action ? "action: { label: 'Undo', onAction: undo }" : ''].filter(Boolean).join(', ')} }` : ''});`,
    },
  },
};


function PlayEntity(p: Record<string, string | boolean>) {
  const active = Math.min(+p.active, +p.total);
  const status = p.status === 'Offline' ? { tone: 'error' as const, label: 'Offline' } : p.status === 'Warning' ? { tone: 'warning' as const, label: 'Warning' } : { tone: 'success' as const, label: 'Active' };
  return <div className="doc-narrow-xxl"><EntityCard title={String(p.title)} location="Mumbai, MH" icon={p.fallback ? <IconTile icon={FactoryIcon} /> : <Illustration name="illus.facility-set" crop="factory" size={40} />} status={status}
    metric={{ value: active, of: +p.total, unit: 'lines active', tone: +p.total && active / +p.total >= 0.75 ? 'success' : 'error' }} meta={{ text: '24 cameras' }}
    owner="Rahul Sharma" role="Factory Admin" actionLabel="View factory" onAction={() => toast(`Opens ${p.title}`)} /></div>;
}
function PlayTable(p: Record<string, string | boolean>) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  return (
    <section className="ds-table-card doc-full">
      <DataTable caption="Factories" rowHeader="name" rowKey={f => f.id} rows={p.empty ? [] : FACTORIES} columns={factoryColumns}
        selectable={!!p.selectable} selected={sel} onSelect={setSel} rowName={f => f.name} maxHeight={p.capped ? 266 : undefined} loading={!!p.loading}
        rowTone={p.tints ? f => (f.status.label === 'Warning' ? 'warning' : f.status.label === 'Offline' ? 'critical' : undefined) : undefined} />
    </section>
  );
}
function PlayConfirm({ tone, title }: { tone: 'danger' | 'primary'; title: string }) {
  const [open, setOpen] = useState(false);
  return <><Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => setOpen(true)}>Open dialog</Button>
    <ConfirmDialog open={open} tone={tone} title={title} message={tone === 'danger' ? "Anita Sharma will lose access immediately. This can't be undone." : 'Every factory admin will see the new inspection rules.'} confirmLabel={tone === 'danger' ? 'Delete user' : 'Publish'} onCancel={() => setOpen(false)} onConfirm={() => { setOpen(false); toast('Done'); }} /></>;
}
function PlayModal({ size, title }: { size: 'sm' | 'md'; title: string }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState('');
  const close = () => { setOpen(false); setV(''); };
  return <><Button onClick={() => setOpen(true)}>Open {size} modal</Button>
    <Modal open={open} onClose={close} title={title} size={size} icon={<Illustration name="illus.camera" size={32} />} dirty={!!v}
      footer={<><Button variant="secondary" onClick={close}>Skip</Button><Button minWidth onClick={close}>Add Camera</Button></>}>
      <div className={size === 'sm' ? 'ds-form-grid ds-form-grid--1' : 'ds-form-grid'}><Field caps label="Camera ID" required><TextInput value={v} onChange={e => setV(e.target.value)} placeholder="e.g. - CAM01 - L01" /></Field><Field caps label="Line Associated With"><Select options={opts(['Line 1', 'Line 2'])} value={null} onChange={() => {}} placeholder="e.g. - Line 1" searchable={false} /></Field></div>
    </Modal></>;
}
function PlayPanel({ size, stepper, subtitle }: { size: 'sm' | 'md' | 'lg' | 'xl'; stepper: boolean; subtitle: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const close = () => { setOpen(false); setName(''); };
  return <><Button onClick={() => setOpen(true)}>Open {size} panel</Button>
    <SlidePanel open={open} onClose={close} title="Add Product" size={size} icon={<Illustration name="illus.catalog-item" size={36} />} dirty={!!name}
      subtitle={subtitle ? 'Register a SKU and its reference barcodes.' : undefined} subheader={stepper ? <Stepper current={0} steps={[{ title: 'Basic Details', sub: 'In progress' }, { title: 'Barcodes', sub: 'References' }]} /> : undefined}
      footer={<><Button variant="secondary" leading={ArrowLeft} onClick={close}>Cancel</Button><Button trailing={ChevronRight} minWidth onClick={close}>Save product</Button></>}>
      <div className="ds-form-grid"><Field label="Product Name" required className="ds-span-2"><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Enter product name" /></Field><Field label="Primary Barcode"><TextInput placeholder="e.g. 8901030875397" /></Field><Field label="Factory"><Select options={factoryOpts} value={null} onChange={() => {}} placeholder="Choose factory" /></Field></div>
    </SlidePanel></>;
}
function PlayTip({ text, placement }: { text: string; placement: 'top' | 'bottom' | 'right' }) {
  const ref = useRef<HTMLButtonElement>(null);
  return <Tooltip key={placement + text} content={text} placement={placement}><button ref={ref} type="button" className="ds-btn ds-btn--secondary"><Info size={14} aria-hidden="true" />Hover or focus</button></Tooltip>;
}
function PlayToast({ msg, tone, action }: { msg: string; tone: 'neutral' | 'error'; action: boolean }) {
  return <Button variant="secondary" onClick={() => toast(msg, { tone, action: action ? { label: 'Undo', onAction: () => toast('Undone') } : undefined })}>Show toast</Button>;
}

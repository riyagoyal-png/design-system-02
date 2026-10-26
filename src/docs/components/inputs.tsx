import { useState, type ReactNode } from 'react';
import { Check, Factory } from 'lucide-react';
import { Field, SearchInput, Textarea, TextInput } from '../../components/ds/Field';
import { MultiSelect, Select, type Option } from '../../components/ds/Select';
import { BinaryToggle, Checkbox, RadioCards, Switch } from '../../components/ds/Choice';
import { AttachField, DateRangePicker, FileUpload, RichPicker } from '../../components/ds/Inputs2';
import { CheckMark, Icon } from '../../components/ds/Icon';
import { Plus } from '../../components/ds/figmaIcons';
import { LinkAction } from '../../components/ds/Button';
import { toast } from '../../components/ds/Toast';
import { Cell, Grid } from '../kit';
import type { ComponentDoc } from '../ComponentPage';
import { FACTORIES, LINE_STATUS, PICKER_PEOPLE, SITES } from '../../apps/vision/data';

const opts = (vs: string[]): Option[] => vs.map(v => ({ value: v, label: v }));
const factoryOpts = opts(['All Factories', ...FACTORIES.map(f => f.name)]);
const statusOpts: Option[] = [{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active', dot: 'success' }, { value: 'warning', label: 'Warning', dot: 'warning' }, { value: 'offline', label: 'Offline', dot: 'error' }];
const regionOpts = opts(['West', 'North', 'South', 'East']);
const lineOpts = opts(LINE_STATUS.rows.map(r => r.line));
const inspectionOpts = opts(['Primary - Front Label', 'Primary - Back Label', 'Secondary - Carton', 'Tertiary - CLD']);
const periodOpts = opts(['Today', 'Last 7 days', 'Last 8 weeks', 'Custom range']);
const CAMS = SITES.flatMap(s => s.lines.flatMap(l => l.cameras.map(c => ({ ...c, site: s.name }))));
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Holds playground state that must survive re-renders of the generated preview. */
function PlayState<T>({ init, children }: { init: T; children: (v: T, set: (v: T) => void) => ReactNode }) {
  const [v, setV] = useState(init);
  return <>{children(v, setV)}</>;
}

/* ── Text input ─────────────────────────────────────────────────── */
function TextInputDemo() {
  const [v, setV] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const err = submitted && !IPV4.test(v.trim()) ? 'Enter a valid IPv4 address.' : undefined;
  return (
    <form className="doc-form" noValidate onSubmit={e => { e.preventDefault(); setSubmitted(true); if (IPV4.test(v.trim())) toast('Camera added'); }}>
      <Field caps label="Camera IP" required error={err} help="The camera's address on the line network."><TextInput value={v} onChange={e => setV(e.target.value)} placeholder="e.g. - 192.168.1.101" inputMode="decimal" /></Field>
      <button type="submit" className="ds-btn ds-btn--primary ds-btn--minw">Add Camera</button>
    </form>
  );
}

export const textInputDoc: ComponentDoc = {
  path: '/components/text-inputs', title: 'Text Inputs', refs: ['5.5', '5.8'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'Single-line entry on the glass field of every drawer and modal: gradient-glass fill, 1px border-glass, shadow-field, radius 12, 40px minimum height, 16px horizontal padding. Placeholders sit at 60% (4.57:1, R-07). Errors add the 1px error ring and a linked validation message after the first submit. Glass edges are below 3:1 by design (§9.2); boundary mode adds a 3:1 edge (§9.3).',
  preview: () => <TextInputDemo />,
  variants: () => (
    <Grid min={240}>
      <Cell label="plain · drawer label"><Field label="Factory Name"><TextInput placeholder="Enter factory name" /></Field></Cell>
      <Cell label="caps label · compact modal" note="form-label-caps"><Field caps label="Camera ID"><TextInput placeholder="e.g. - CAM01 - L01" /></Field></Cell>
      <Cell label="with suffix unit" note="12px text-muted suffix"><Field label="Line speed"><TextInput suffix="packs/min" inputMode="numeric" placeholder="e.g. 120" /></Field></Cell>
      <Cell label="trailing button" note="24px hit area (password toggle)"><Field label="RTSP password"><TextInput type="password" defaultValue="admin-554" /></Field></Cell>
      <Cell label="with helper"><Field label="Location / City" help="City and state, e.g. Mumbai, MH."><TextInput placeholder="Enter location" /></Field></Cell>
      <Cell label="with validation"><Field caps label="Camera IP" required error="Enter a valid IPv4 address."><TextInput defaultValue="192.168.1" /></Field></Cell>
    </Grid>
  ),
  unsupported: ['leading-icon text inputs other than search (§5.6)', 'floating labels', 'underline-only fields'],
  states: () => (
    <Grid min={220}>
      <Cell label="default (placeholder)" note="text-placeholder"><TextInput placeholder="Enter factory name" aria-label="Default" /></Cell>
      <Cell label="filled" note="input-text 14/20 text-primary"><TextInput defaultValue="Factory 1" aria-label="Filled" /></Cell>
      <Cell label="hover" note="border-control"><TextInput className="is-hover" defaultValue="Factory 1" aria-label="Hover" /></Cell>
      <Cell label="focus-visible" note="focus-ring-field (1px, offset 0)"><TextInput className="is-focus-visible" defaultValue="Factory 1" aria-label="Focus" /></Cell>
      <Cell label="error" note="1px error ring"><TextInput aria-invalid="true" defaultValue="192.168.1" aria-label="Error" /></Cell>
      <Cell label="disabled" note="opacity 0.4"><TextInput disabled defaultValue="Factory 1" aria-label="Disabled" /></Cell>
      <Cell label="read-only" note="no hover"><TextInput readOnly defaultValue="SN123456" aria-label="Read only" /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><Field label="Factory Name" required help="Shown on factory cards and reports."><TextInput placeholder="Enter factory name" data-part="field" /></Field></div>,
    parts: [
      { part: 'container', label: 'Form field', spec: 'flex column, gap 6 (space-form-label)' },
      { part: 'label', label: 'Label + required marker', spec: 'form-label 12/16 500 text-secondary; " *" in error-text (#fb7185)' },
      { part: 'field', label: 'Field', spec: 'min-height 40 · padding 0 16 · 1px border-glass · radius 12 · gradient-glass · shadow-field; value input-text 14/20 text-secondary' },
      { part: 'message', label: 'Helper / validation', spec: 'helper 12/16 text-tertiary, or validation 12/16 error-text (role=alert); 2px below the control' },
    ],
  },
  spec: [
    { property: 'Min height', token: '--ds-size-control' },
    { property: 'Horizontal padding', token: '--ds-space-4' },
    { property: 'Fill / shadow', token: '--ds-gradient-glass + --ds-shadow-field' },
    { property: 'Border / hover', token: '--ds-color-border-glass + --ds-color-border-control' },
    { property: 'Boundary mode border (§9.3, opt-in)', token: '--ds-color-border-control-strong' },
    { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Value / placeholder', token: '--ds-color-text-secondary + --ds-color-text-placeholder' },
    { property: 'Suffix', token: '--ds-color-text-muted', note: ' 12/16' },
    { property: 'Error border / ring', token: '--ds-color-error + --ds-error-ring' },
    { property: 'Focus', token: '--ds-color-focus-ring + --ds-focus-offset-tight' },
    { property: 'Label → control gap', token: '--ds-space-form-label' },
  ],
  playground: {
    surface: 'card',
    controls: [
      { kind: 'text', key: 'label', label: 'Label' },
      { kind: 'text', key: 'placeholder', label: 'Placeholder' },
      { kind: 'select', key: 'type', label: 'Type', options: ['text', 'password', 'with suffix'] },
      { kind: 'bool', key: 'caps', label: 'Caps label (modal)' },
      { kind: 'bool', key: 'required', label: 'Required' },
      { kind: 'bool', key: 'help', label: 'Helper text' },
      { kind: 'bool', key: 'error', label: 'Error' },
      { kind: 'bool', key: 'disabled', label: 'Disabled' },
    ],
    initial: { label: 'Factory Name', placeholder: 'Enter factory name', type: 'text', caps: false, required: true, help: false, error: false, disabled: false },
    render: p => (
      <div className="doc-narrow-lg">
        <Field label={String(p.label)} caps={!!p.caps} required={!!p.required} help={p.help ? 'Shown on factory cards and reports.' : undefined} error={p.error ? 'Enter the factory name.' : undefined}>
          <TextInput placeholder={String(p.placeholder)} type={p.type === 'password' ? 'password' : 'text'} suffix={p.type === 'with suffix' ? 'packs/min' : undefined} disabled={!!p.disabled} />
        </Field>
      </div>
    ),
    code: p => `<Field label="${p.label}"${p.caps ? ' caps' : ''}${p.required ? ' required' : ''}${p.help ? ' help="Shown on factory cards and reports."' : ''}${p.error ? ' error="Enter the factory name."' : ''}>\n  <TextInput placeholder="${p.placeholder}"${p.type === 'password' ? ' type="password"' : ''}${p.type === 'with suffix' ? ' suffix="packs/min"' : ''}${p.disabled ? ' disabled' : ''} />\n</Field>`,
  },
  usage: `<Field label="Factory Name" required error={errors.name}>\n  <TextInput placeholder="Enter factory name" value={name} onChange={e => setName(e.target.value)} />\n</Field>\n<Field caps label="Camera IP" required><TextInput placeholder="e.g. - 192.168.1.101" inputMode="decimal" /></Field>`,
  behavior: (
    <ul className="doc-list">
      <li>No errors before the first submit; on submit every error shows and focus moves to the first invalid field; afterwards errors update on blur (§5.55 Forms).</li>
      <li>The message is linked with <code>aria-describedby</code>; the control gets <code>aria-invalid</code> and, when required, <code>aria-required</code>. The visual asterisk is <code>aria-hidden</code>.</li>
      <li>The password toggle is a 24px button with <code>aria-pressed</code> and "Show / Hide password".</li>
    </ul>
  ),
};

/* ── Search ─────────────────────────────────────────────────────── */
function SearchDemo({ width }: { width?: 'sm' | 'md' | 'lg' }) {
  const [q, setQ] = useState('');
  const hits = CAMS.filter(c => `${c.name} ${c.serial} ${c.ip} ${c.site}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="doc-stack">
      <SearchInput value={q} onValueChange={setQ} label="Filter cameras" placeholder="Filter by camera, serial or IP" width={width} />
      <p className="ds-text-small" role="status">{q ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : `${CAMS.length} cameras`}</p>
      {q && <ul className="doc-results">{hits.slice(0, 4).map(h => <li key={h.id} className="ds-text-body">{h.name} <span className="ds-muted">· {h.site} · {h.ip}</span></li>)}</ul>}
    </div>
  );
}
function PlaySearch(p: { width: 'sm' | 'md' | 'lg' | 'full'; placeholder: string; disabled: boolean }) {
  const [q, setQ] = useState('');
  return <div className={p.width === 'full' ? 'doc-full' : undefined}><SearchInput value={q} onValueChange={setQ} label="Search" {...p} /></div>;
}
export const searchDoc: ComponentDoc = {
  path: '/components/search-fields', title: 'Search Fields', refs: ['5.6'], provenance: 'OBSERVED',
  summary: 'The §5.5 field with an 18px search glyph 14px from the inline-start and 40px start padding. type="search"; clearable with the × button or Escape; the result count is announced via role="status". Header widths 288 / 320 / 360; full width in a table toolbar.',
  preview: () => <SearchDemo width="md" />,
  variants: () => (
    <Grid min={300}>
      <Cell label="header · sm 288" note="Factories, Cameras"><SearchInput value="" onValueChange={() => {}} label="Filter factories or units" placeholder="Filter factories or units..." width="sm" /></Cell>
      <Cell label="header · md 320"><SearchInput value="" onValueChange={() => {}} label="Filter products" placeholder="Filter products..." width="md" /></Cell>
      <Cell label="header · lg 360" note="Longest Figma placeholder never clips"><SearchInput value="" onValueChange={() => {}} label="Search users" placeholder="Search users by name, email, role or factory" width="lg" /></Cell>
      <Cell label="table toolbar · full" note="Product Master"><SearchInput value="" onValueChange={() => {}} label="Search products" placeholder="Search by product name, barcode, CLD code or CBU code" width="full" /></Cell>
      <Cell label="in-menu search band" note="Menus with more than 5 options (§5.10)"><div className="ds-menu__search ds-menu-band-demo"><SearchInput value="" onValueChange={() => {}} label="Search factories" placeholder="Search…" /></div></Cell>
    </Grid>
  ),
  states: () => (
    <Grid min={260}>
      <Cell label="empty"><SearchInput value="" onValueChange={() => {}} label="Search" placeholder="Filter factories or units..." /></Cell>
      <Cell label="with text (clear button)" note="Escape also clears"><SearchInput value="Factory 2" onValueChange={() => {}} label="Search" /></Cell>
      <Cell label="hover" note="border-control"><SearchInput value="" onValueChange={() => {}} label="Search" placeholder="Filter factories or units..." className="is-hover" /></Cell>
      <Cell label="focus-visible"><SearchInput value="" onValueChange={() => {}} label="Search" placeholder="Filter factories or units..." className="is-focus-visible" /></Cell>
      <Cell label="disabled"><SearchInput value="" onValueChange={() => {}} label="Search" placeholder="Filter factories or units..." disabled /></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <SearchInput value="Factory 2" onValueChange={() => {}} label="Filter factories or units" width="sm" />,
    parts: [
      { part: 'container', label: 'Search field', spec: 'width min(288px, 100%) (sm); md 320, lg 360, or full' },
      { part: 'icon', label: 'Search glyph', spec: '18px box, 14px from the inline-start, text-muted' },
      { part: 'field', label: 'Input', spec: '§5.5 field with 40px start padding; 44px end padding while the 24px clear button shows' },
    ],
  },
  spec: [
    { property: 'Header widths (sm / md / lg)', token: '--ds-size-search-sm + --ds-size-search-md + --ds-size-search-lg' },
    { property: 'Icon box', token: '--ds-size-search-icon' },
    { property: 'Icon inset', value: '14px', note: ' (spec literal)' },
    { property: 'Start padding', token: '--ds-space-10' },
    { property: 'Icon color', token: '--ds-color-text-muted' },
    { property: 'Field', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-shadow-field' },
  ],
  playground: {
    controls: [{ kind: 'select', key: 'width', label: 'Width', options: ['sm', 'md', 'lg', 'full'] }, { kind: 'text', key: 'placeholder', label: 'Placeholder' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
    initial: { width: 'sm', placeholder: 'Filter factories or units...', disabled: false },
    render: p => <PlaySearch width={p.width as 'sm'} placeholder={String(p.placeholder)} disabled={!!p.disabled} />,
    code: p => `<SearchInput value={q} onValueChange={setQ} label="Filter factories or units" placeholder="${p.placeholder}" width="${p.width}"${p.disabled ? ' disabled' : ''} />`,
  },
  usage: `const [q, setQ] = useState('');\n<SearchInput value={q} onValueChange={setQ} label="Search users" placeholder="Search users by name, email, role or factory" width="lg" />`,
  behavior: <ul className="doc-list"><li>The visible placeholder is not a label: pass <code>label</code> (aria-label) naming what is searched.</li><li>Filtering is live; announce the result count in a <code>role="status"</code> region.</li><li>Escape clears the text (and stops propagation so an enclosing drawer stays open); the clear button is "Clear search".</li></ul>,
};

/* ── Textarea ───────────────────────────────────────────────────── */
export const textareaDoc: ComponentDoc = {
  path: '/components/textareas', title: 'Textareas', refs: ['5.7'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'The §5.5 field for multi-line notes ("Notes (optional)" in Add Product): 80px minimum height, 10px top padding with the value aligned to the top, vertical resize.',
  preview: () => <div className="doc-narrow-xl"><Field label="Notes (optional)"><Textarea placeholder="Enter any note as necessary" /></Field></div>,
  states: () => (
    <Grid min={240}>
      <Cell label="default"><Textarea placeholder="Enter any note as necessary" aria-label="Default" /></Cell>
      <Cell label="hover" note="border-control"><Textarea className="is-hover" aria-label="Hover" defaultValue="Label printed slightly off-centre." /></Cell>
      <Cell label="focus-visible"><Textarea className="is-focus-visible" aria-label="Focus" defaultValue="Label printed slightly off-centre." /></Cell>
      <Cell label="error"><Field label="Notes (optional)" error="Keep notes under 500 characters."><Textarea defaultValue="Label printed slightly off-centre…" /></Field></Cell>
      <Cell label="disabled"><Textarea disabled defaultValue="Label printed slightly off-centre." aria-label="Disabled" /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><Field label="Notes (optional)" help="Visible to quality supervisors."><Textarea placeholder="Enter any note as necessary" data-part="field" /></Field></div>,
    parts: [
      { part: 'label', label: 'Label', spec: 'form-label 12/16 500 text-secondary' },
      { part: 'field', label: 'Field', spec: 'min-height 80 · padding 10 16 · §5.5 glass field (border-glass, gradient-glass, shadow-field, radius 12) · resize vertical' },
      { part: 'message', label: 'Helper', spec: 'helper 12/16 text-tertiary' },
    ],
  },
  spec: [
    { property: 'Min height', value: '80px', note: ' (spec literal)' },
    { property: 'Padding', token: '--ds-space-2-5 + --ds-space-4' },
    { property: 'Fill / border / shadow', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-shadow-field' },
    { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Value / placeholder', token: '--ds-color-text-secondary + --ds-color-text-placeholder' },
  ],
  playground: {
    surface: 'card',
    controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'error', label: 'Error' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
    initial: { label: 'Notes (optional)', error: false, disabled: false },
    render: p => <div className="doc-narrow-xl"><Field label={String(p.label)} error={p.error ? 'Keep notes under 500 characters.' : undefined}><Textarea placeholder="Enter any note as necessary" disabled={!!p.disabled} /></Field></div>,
    code: p => `<Field label="${p.label}"${p.error ? ' error="Keep notes under 500 characters."' : ''}><Textarea placeholder="Enter any note as necessary"${p.disabled ? ' disabled' : ''} /></Field>`,
  },
  usage: `<Field label="Notes (optional)"><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter any note as necessary" /></Field>`,
};

/* ── Labels / form field ───────────────────────────────────────── */
export const fieldDoc: ComponentDoc = {
  path: '/components/labels', title: 'Labels & Form Fields', refs: ['5.8'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'Label above the control (6px). Drawers use sentence-case form-label in text-muted; compact modals use uppercase form-label-caps. Helper text and errors sit 2px below the control; a validation message replaces the helper. Required fields show an aria-hidden " *" in error-text plus required / aria-required.',
  preview: () => (
    <div className="ds-form-grid doc-form-max">
      <Field label="Factory Name" required className="ds-span-all"><TextInput placeholder="Enter factory name" /></Field>
      <Field label="Location / City" required error="Enter the factory location."><TextInput placeholder="Enter location" /></Field>
      <Field label="Assigned Region" required><Select options={regionOpts} value={null} onChange={() => {}} placeholder="Enter region name" searchable={false} /></Field>
    </div>
  ),
  variants: () => (
    <Grid min={240}>
      <Cell label="drawer label" note="form-label 12/16 500 text-muted"><Field label="Factory Name"><TextInput placeholder="Enter factory name" /></Field></Cell>
      <Cell label="compact modal label" note="form-label-caps, +0.55 tracking, text-muted"><Field caps label="Camera Brand"><TextInput placeholder="e.g. - Hanwa QNO-7080R" /></Field></Cell>
      <Cell label="required"><Field label="Product Name" required><TextInput placeholder="Enter product name" /></Field></Cell>
      <Cell label="with helper" note="helper 12/16 text-tertiary"><Field label="CBU Barcode" help="Printed on the shipping case."><TextInput /></Field></Cell>
      <Cell label="with error" note="validation 12/16 error-text"><Field label="Product Barcode" required error="Enter a 13-digit barcode."><TextInput defaultValue="890103" /></Field></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><Field label="Product Barcode" required error="Enter a 13-digit barcode."><TextInput defaultValue="890103" /></Field></div>,
    parts: [
      { part: 'container', label: 'Field', spec: 'flex column, gap 6 (space-form-label)' },
      { part: 'label', label: 'Label + required', spec: 'form-label 12/16 500 text-secondary; " *" error-text, aria-hidden' },
      { part: 'message', label: 'Validation', spec: 'validation 12/16 error-text, role=alert, 2px below the control' },
    ],
  },
  spec: [
    { property: 'Label (drawer)', token: '--ds-color-text-secondary', note: ' 12/16 500' },
    { property: 'Label (caps, compact modal)', token: '--ds-color-text-muted + --ds-tracking-upper' },
    { property: 'Required marker', token: '--ds-color-error-text' },
    { property: 'Helper text', token: '--ds-color-text-tertiary' },
    { property: 'Validation text', token: '--ds-color-error-text' },
    { property: 'Label → control', token: '--ds-space-form-label' },
    { property: 'Message offset', value: '2px', note: ' (margin, §2.4)' },
    { property: 'Form columns / rows / sections', token: '--ds-space-form-col + --ds-space-form-row + --ds-space-form-section' },
  ],
  playground: {
    surface: 'card',
    controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'caps', label: 'Caps (compact modal)' }, { kind: 'bool', key: 'required', label: 'Required' }, { kind: 'select', key: 'msg', label: 'Message', options: ['none', 'helper', 'error'] }],
    initial: { label: 'Product Barcode', caps: false, required: true, msg: 'helper' },
    render: p => <div className="doc-narrow-xl"><Field label={String(p.label)} caps={!!p.caps} required={!!p.required} help={p.msg === 'helper' ? 'The 13-digit EAN on the pack.' : undefined} error={p.msg === 'error' ? 'Enter a 13-digit barcode.' : undefined}><TextInput inputMode="numeric" /></Field></div>,
    code: p => `<Field label="${p.label}"${p.caps ? ' caps' : ''}${p.required ? ' required' : ''}${p.msg === 'helper' ? ' help="…"' : p.msg === 'error' ? ' error="…"' : ''}><TextInput /></Field>`,
  },
  usage: `<div className="ds-form-grid">\n  <Field label="Factory Name" required error={errors.name} className="ds-span-all">\n    <TextInput value={name} onChange={e => setName(e.target.value)} />\n  </Field>\n</div>`,
  behavior: <ul className="doc-list"><li>Form grid: two columns 20px apart, rows 40px apart; one column below 1024px. Form sections put 24px between the section header and the first row (§5.8).</li><li>Validate on submit and on blur after the first submit; focus the first invalid field; messages are linked with <code>aria-describedby</code> (§5.55 Forms).</li></ul>,
};

/* ── Select ─────────────────────────────────────────────────────── */
function SelectDemo() {
  const [factory, setFactory] = useState('All Factories');
  const [status, setStatus] = useState('all');
  const [line, setLine] = useState<string | null>(null);
  return (
    <div className="doc-stack">
      <div className="ds-cluster">
        <Select variant="filter" label="Factory" options={factoryOpts} value={factory} onChange={setFactory} className="ds-select--180" />
        <Select variant="filter" label="Status" options={statusOpts} value={status} onChange={setStatus} className="ds-select--180" />
      </div>
      <div className="doc-narrow-lg"><Field caps label="Line Associated With" required><Select options={lineOpts} value={line} onChange={setLine} placeholder="e.g. - Line 1" searchable={false} action={{ label: 'Add New Line', onAction: () => toast('The Add Line form opens here') }} /></Field></div>
    </div>
  );
}
function StaticMenu({ multi }: { multi?: boolean }) {
  const rows = multi ? [['Bottle Line-1', true, true], ['Bottle Line-2', false, false], ['Norden-1', true, false]] as const : [['Active', false, true], ['Warning', true, false], ['Offline', false, false]] as const;
  return (
    <div className="ds-select doc-static-menu">
      <div className="ds-menu" data-part="menu">
        <ul className="ds-menu__list" role="listbox" aria-label="Static example of option states" aria-multiselectable={multi || undefined}>
          {rows.map(([l, sel, active], i) => (
            <li key={l} className={`ds-menu__option${multi ? ' ds-menu__option--multi' : ''}${active ? ' is-active' : ''}`} role="option" aria-selected={sel} data-part={i === 0 ? 'option' : undefined}>
              {multi && <span className="ds-check__box" aria-hidden="true">{sel && <CheckMark />}</span>}{l}
              {!multi && <span className="ds-menu__check"><Icon icon={Check} size={16} strokeWidth={2} /></span>}
            </li>
          ))}
        </ul>
        <button type="button" className="ds-menu__action" data-part="action" tabIndex={-1}><Icon icon={Plus} size={16} />{multi ? 'Add New Line' : 'Add New Status'}</button>
      </div>
    </div>
  );
}
export const selectDoc: ComponentDoc = {
  path: '/components/dropdowns', title: 'Dropdowns & Selects', refs: ['5.9', '5.10'], provenance: 'OBSERVED',
  summary: 'Two trigger styles, as in DEOC: filter (headers, toolbars and single-choice form selects: gradient-glass, a 1px edge stroke, shadow-control, text-emphasis 14/400) and field (multi-select and picker triggers: the §5.5 field plus shadow-xs, values text-primary). The menu is an opaque surface-raised list (#0c1325, radius 12 — 8 for multi-select — shadow-float, no border, 4px below the trigger) in a select-only combobox + listbox; more than 5 options adds a search band.',
  preview: () => <SelectDemo />,
  variants: () => (
    <Grid min={240}>
      <Cell label="filter · 180" note="Header filter (size-filter)"><Select variant="filter" label="Status" options={statusOpts} value="all" onChange={() => {}} className="ds-select--180" /></Cell>
      <Cell label="field" note="filter trigger (DEOC form selects), value text-emphasis 14/400"><Select label="Assigned Region" options={regionOpts} value="West" onChange={() => {}} searchable={false} /></Cell>
      <Cell label="field · placeholder"><Select label="Assigned Region" options={regionOpts} value={null} onChange={() => {}} placeholder="Enter region name" searchable={false} /></Cell>
      <Cell label="with lead icon" note="16px line icon, text-muted at 60 % (header filters)"><Select variant="filter" leadIcon={Factory} label="Factory" options={factoryOpts} value="Factory 1" onChange={() => {}} className="ds-select--180" /></Cell>
      <Cell label="with status dots" note="8px glowing dot"><Select variant="filter" label="Status" options={statusOpts} value="active" onChange={() => {}} /></Cell>
      <Cell label="searchable (> 5 options)"><Select variant="filter" label="Factory" options={factoryOpts} value="Factory 1" onChange={() => {}} /></Cell>
      <Cell label="with action row"><Select label="Line" options={lineOpts} value={null} onChange={() => {}} placeholder="e.g. - Line 1" searchable={false} action={{ label: 'Add New Line', onAction: () => {} }} /></Cell>
      <Cell label="widths 160 / 200" note="size-filter-sm / size-filter-lg"><div className="doc-stack-sm"><Select variant="filter" label="Period" options={periodOpts} value="Today" onChange={() => {}} className="ds-select--160" /><Select variant="filter" label="Inspection type" options={inspectionOpts} value="Secondary - Carton" onChange={() => {}} className="ds-select--200" /></div></Cell>
    </Grid>
  ),
  unsupported: ['chips inside the trigger', 'native <select> styling', 'nested sub-menus'],
  states: () => (
    <Grid min={240}>
      <Cell label="filter · default"><Select variant="filter" label="Status" options={statusOpts} value="all" onChange={() => {}} /></Cell>
      <Cell label="filter · hover" note="border-control-hover"><Select variant="filter" label="Status" options={statusOpts} value="all" onChange={() => {}} triggerClassName="is-hover" /></Cell>
      <Cell label="field · hover" note="border-control"><Select label="Assigned Region" options={regionOpts} value="West" onChange={() => {}} triggerClassName="is-hover" searchable={false} /></Cell>
      <Cell label="focus-visible" note="focus-ring-field"><Select variant="filter" label="Status" options={statusOpts} value="all" onChange={() => {}} triggerClassName="is-focus-visible" /></Cell>
      <Cell label="field · error" note="1px error ring"><Select label="Assigned Region" options={regionOpts} value={null} onChange={() => {}} placeholder="Enter region name" aria-invalid="true" searchable={false} /></Cell>
      <Cell label="disabled" note="opacity 0.4"><Select label="Assigned Region" options={regionOpts} value="North" onChange={() => {}} disabled searchable={false} /></Cell>
      <Cell label="open menu (static)" note="Rows: selected and active descendant (surface-hover + primary) · default (text-muted); action row"><StaticMenu /></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <div className="doc-static-menu doc-stack-sm"><Select variant="filter" label="Status" options={statusOpts} value="active" onChange={() => {}} searchable={false} /><StaticMenu /></div>,
    parts: [
      { part: 'trigger', label: 'Filter trigger', spec: 'role=combobox · min-height 40 · padding 0 12 0 16 · radius 12 · gradient-glass · 1px border-control · shadow-control · text-emphasis 14/500 · 18px chevron (icon-chevron)' },
      { part: 'menu', label: 'Menu panel', spec: 'surface-raised · 1px border-glass · radius 12 · shadow-float · 4px below the trigger · list max-height 260' },
      { part: 'option', label: 'Option', spec: 'padding 10 16 (40px) · 14/20 text-muted; hover and selected surface-hover + primary, no check mark' },
      { part: 'action', label: 'Action row', spec: '1px border-subtle top · link 14/500 with a 16px plus' },
    ],
  },
  spec: [
    { property: 'Trigger min height', token: '--ds-size-control' },
    { property: 'Filter fill / border / hover / shadow', token: '--ds-gradient-glass + --ds-color-border-control + --ds-color-border-control-hover + --ds-shadow-control' },
    { property: 'Filter value', token: '--ds-color-text-emphasis', note: ' 14/20 500' },
    { property: 'Field fill / border / hover / shadow', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-color-border-control + --ds-shadow-field' },
    { property: 'Field value / placeholder', token: '--ds-color-text-secondary + --ds-color-text-placeholder' },
    { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Error', token: '--ds-color-error + --ds-error-ring' },
    { property: 'Chevron', token: '--ds-color-icon-chevron', note: ' 18px box, rotates 180° when open' },
    { property: 'Filter widths', token: '--ds-size-filter-sm + --ds-size-filter + --ds-size-filter-lg' },
    { property: 'Menu fill / border / shadow', token: '--ds-color-surface-raised + --ds-color-border-glass + --ds-shadow-float' },
    { property: 'Menu offset / max height', token: '--ds-space-1 + --ds-size-menu-max-height' },
    { property: 'Option text / hover and selected', token: '--ds-color-text-muted + --ds-color-surface-hover' },
    { property: 'Selected check / action row text', token: '--ds-color-link' },
    { property: 'Search band / action divider', token: '--ds-space-2 + --ds-color-border-subtle' },
    { property: 'Z-index', token: '--ds-z-menu' },
  ],
  playground: {
    controls: [
      { kind: 'select', key: 'variant', label: 'Trigger style', options: ['filter', 'field'] },
      { kind: 'select', key: 'set', label: 'Options', options: ['status (dots)', 'regions', 'factories (searchable)'] },
      { kind: 'bool', key: 'action', label: 'Action row' },
      { kind: 'bool', key: 'error', label: 'Error (field only)' },
      { kind: 'bool', key: 'disabled', label: 'Disabled' },
    ],
    initial: { variant: 'filter', set: 'status (dots)', action: false, error: false, disabled: false },
    render: p => <PlaySelect {...p} />,
    code: p => `<Select variant="${p.variant}" label="…" options={options} value={value} onChange={setValue}${p.action ? ` action={{ label: 'Add New Line', onAction }}` : ''}${p.error && p.variant === 'field' ? ' aria-invalid="true"' : ''}${p.disabled ? ' disabled' : ''} />`,
  },
  usage: `<Select variant="filter" className="ds-select--180" label="Status" options={statusOptions} value={status} onChange={setStatus} />\n<Field label="Assigned Region" required>\n  <Select options={regions} value={region} onChange={setRegion} placeholder="Enter region name" />\n</Field>`,
  behavior: (
    <div className="ds-table-region doc-table" role="region" aria-label="Keyboard" tabIndex={0}>
      <table className="ds-table ds-table--compact"><caption className="ds-sr-only">Keyboard behavior</caption>
        <thead><tr><th scope="col">Key</th><th scope="col">Action</th></tr></thead>
        <tbody>
          {[['Enter / Space / ↓ on the trigger', 'Open; active option = selected (or first)'], ['↑ on the closed trigger', 'Open at the selected (or last) option'], ['↓ / ↑', 'Move the active option (disabled skipped)'], ['Home / End', 'First / last option (without a search band)'], ['Characters', 'Type-ahead (without a search band) or filter, announcing "N results" (with one)'], ['Enter', 'Select and close (single) / toggle (multi)'], ['Escape', 'Close without changing; focus returns to the trigger'], ['Tab', 'With an action row: move to it. Otherwise close and move on']].map(([k, a]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td></tr>)}
        </tbody>
      </table>
    </div>
  ),
};
function PlaySelect(p: Record<string, string | boolean>) {
  const o = p.set === 'regions' ? regionOpts : p.set === 'factories (searchable)' ? factoryOpts : statusOpts;
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="doc-narrow-lg">
      <Select variant={p.variant as 'filter'} label="Example" options={o} value={v ?? (p.variant === 'filter' ? o[0].value : null)} onChange={setV}
        action={p.action ? { label: 'Add New Line', onAction: () => toast('The Add Line form opens here') } : undefined}
        aria-invalid={p.error && p.variant === 'field' ? 'true' : undefined} disabled={!!p.disabled} />
    </div>
  );
}

/* ── Multi-select ───────────────────────────────────────────────── */
function MultiDemo() {
  const [v, setV] = useState<string[]>(['Bottle Line-1', 'Norden-1']);
  return (
    <div className="doc-narrow-lg doc-stack">
      <Field label="Line access" help="Lines this operator can monitor."><MultiSelect options={lineOpts} value={v} onChange={setV} placeholder="Choose lines" action={{ label: 'Add New Line', onAction: () => toast('The Add Line form opens here') }} /></Field>
      <div className="ds-cluster">{v.map(d => (
        <span key={d} className="doc-chip-remove">{d}<button type="button" className="ds-icon-btn ds-icon-btn--sm" aria-label={`Remove ${d}`} onClick={() => setV(v.filter(x => x !== d))}>×</button></span>
      ))}</div>
    </div>
  );
}
export const multiSelectDoc: ComponentDoc = {
  path: '/components/multi-selects', title: 'Multi-selects', refs: ['5.11'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'Choose several options. The trigger is the §5.9 field trigger and shows the joined labels when they fit, otherwise "N selected"; each option carries a 16px checkbox 12px before its label and the menu stays open while toggling.',
  preview: () => <MultiDemo />,
  variants: () => (
    <Grid min={260}>
      <Cell label="empty (placeholder)"><MultiSelect label="Line access" options={lineOpts} value={[]} onChange={() => {}} placeholder="Choose lines" /></Cell>
      <Cell label="labels fit"><MultiSelect label="Line access" options={lineOpts} value={['Norden-1']} onChange={() => {}} /></Cell>
      <Cell label="too long → N selected"><div className="doc-narrow"><MultiSelect label="Line access" options={lineOpts} value={lineOpts.map(o => o.value)} onChange={() => {}} /></div></Cell>
      <Cell label="open list (static)" note="checkbox 16px, gap 12, text-secondary; checked = brand-strong"><StaticMenu multi /></Cell>
    </Grid>
  ),
  unsupported: ['chips inside the trigger (the spec keeps the value as text)'],
  states: () => (
    <Grid min={260}>
      <Cell label="hover" note="border-control"><MultiSelect label="Line access" options={lineOpts} value={['Norden-1']} onChange={() => {}} triggerClassName="is-hover" /></Cell>
      <Cell label="focus-visible"><MultiSelect label="Line access" options={lineOpts} value={['Norden-1']} onChange={() => {}} triggerClassName="is-focus-visible" /></Cell>
      <Cell label="error"><MultiSelect label="Line access" options={lineOpts} value={[]} onChange={() => {}} placeholder="Choose lines" aria-invalid="true" /></Cell>
      <Cell label="disabled"><MultiSelect label="Line access" options={lineOpts} value={['Bottle Line-2']} onChange={() => {}} disabled /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-static-menu doc-stack-sm"><MultiSelect label="Line access" options={lineOpts} value={['Bottle Line-1', 'Norden-1']} onChange={() => {}} /><StaticMenu multi /></div>,
    parts: [
      { part: 'trigger', label: 'Field trigger', spec: 'min-height 40 · padding 0 14 0 16 · gradient-glass · 1px border-glass · shadow-field · radius 12; joined labels or "N selected"; 18px chevron' },
      { part: 'menu', label: 'Menu', spec: '§5.10 panel, aria-multiselectable' },
      { part: 'option', label: 'Option', spec: '16px checkbox → 12px → label, text-secondary; checked = brand-strong fill, brand border' },
      { part: 'action', label: 'Action row', spec: 'link 14/500 with a 16px plus, border-subtle top' },
    ],
  },
  notes: <p className="ds-text-body-muted">The removable chips under the preview demonstrate removing selections outside the trigger (§6.3 applied filters). They are not part of the trigger.</p>,
  spec: [
    { property: 'Trigger', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-shadow-field' },
    { property: 'Option gap (checkbox → label)', token: '--ds-space-3' },
    { property: 'Option text', token: '--ds-color-text-secondary' },
    { property: 'Checkbox size / unchecked border', token: '--ds-size-checkbox + --ds-color-border-control-hover' },
    { property: 'Checkbox checked', token: '--ds-color-brand-strong + --ds-color-brand' },
  ],
  playground: {
    surface: 'card',
    controls: [{ kind: 'bool', key: 'action', label: 'Action row' }, { kind: 'bool', key: 'error', label: 'Error' }, { kind: 'select', key: 'width', label: 'Width', options: ['440px', '200px'] }],
    initial: { action: true, error: false, width: '440px' },
    render: p => <PlayState init={['Bottle Line-1']}>{(v, set) => <div className={p.width === '200px' ? 'doc-narrow' : 'doc-narrow-xl'}><MultiSelect label="Line access" options={lineOpts} value={v} onChange={set} placeholder="Choose lines" aria-invalid={p.error ? 'true' : undefined} action={p.action ? { label: 'Add New Line', onAction: () => toast('The Add Line form opens here') } : undefined} /></div>}</PlayState>,
    code: p => `<MultiSelect label="Line access" options={lines} value={selected} onChange={setSelected}${p.action ? " action={{ label: 'Add New Line', onAction }}" : ''}${p.error ? ' aria-invalid="true"' : ''} />`,
  },
  usage: `<Field label="Line access"><MultiSelect options={lines} value={selected} onChange={setSelected} placeholder="Choose lines" /></Field>`,
  behavior: <ul className="doc-list"><li><code>listbox</code> with <code>aria-multiselectable</code>; Space or Enter toggles the active option and the list stays open; Escape closes and returns focus to the trigger (§5.55).</li></ul>,
};

/* ── Date range ─────────────────────────────────────────────────── */
function DateDemo() {
  const [r, setR] = useState({ from: '2024-04-01', to: '2024-04-10' });
  const [preset, setPreset] = useState('Custom range');
  return (
    <div className="ds-cluster">
      <Select variant="filter" label="Period" className="ds-select--180" value={preset} onChange={setPreset} options={periodOpts} searchable={false} />
      {preset === 'Custom range' && <DateRangePicker label="Period" from={r.from} to={r.to} onChange={(from, to) => setR({ from, to })} />}
    </div>
  );
}
export const dateDoc: ComponentDoc = {
  path: '/components/date-pickers', title: 'Date Pickers', refs: ['5.16', '5.47'], provenance: 'OBSERVED',
  summary: 'The Analytics "Today" filter is a §5.9 filter select of presets (Today, Last 7 days, Last 8 weeks …). A custom range uses a filter trigger with an 18px calendar glyph (240px, size-filter-date) that opens a §5.47 popover with two native date inputs and Clear / Apply. Apply validates From ≤ To; Escape or an outside click discards the draft.',
  preview: () => <DateDemo />,
  variants: () => (
    <Grid min={260}>
      <Cell label="preset filter select" note="§5.9 filter"><Select variant="filter" label="Period" className="ds-select--180" value="Today" onChange={() => {}} options={periodOpts} searchable={false} /></Cell>
      <Cell label="custom range"><DateRangePicker from="2024-04-01" to="2024-04-10" onChange={() => {}} /></Cell>
      <Cell label="open-ended (from)"><DateRangePicker from="2024-04-01" to="" onChange={() => {}} /></Cell>
      <Cell label="no value" note="All Dates"><DateRangePicker from="" to="" onChange={() => {}} /></Cell>
    </Grid>
  ),
  unsupported: ['inline calendar grid (the spec uses native date inputs)', 'single-date picker component (use a §5.5 input type="date")'],
  states: () => (
    <Grid min={300}>
      <Cell label="hover" note="border-control-hover"><div className="ds-select ds-select--240"><button type="button" className="ds-select__trigger ds-select__trigger--filter is-hover" tabIndex={-1}><span className="ds-select__value">1 Apr 2024 - 10 Apr 2024</span></button></div></Cell>
      <Cell label="invalid draft · Apply aria-disabled" note="Open it and set From after To to see the message"><DateRangePicker from="2024-04-10" to="2024-04-01" onChange={() => {}} /></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <DateRangePicker from="2024-04-01" to="2024-04-10" onChange={() => {}} />,
    parts: [
      { part: 'container', label: 'Trigger wrapper', spec: 'min-width 240 (size-filter-date)' },
      { part: 'trigger', label: 'Filter trigger', spec: 'gradient-glass · 1px border-control · shadow-control · radius 12 · aria-haspopup=dialog · 16px calendar glyph in an 18px box (icon-chevron)' },
    ],
  },
  spec: [
    { property: 'Trigger min width', token: '--ds-size-filter-date' },
    { property: 'Trigger', token: '--ds-gradient-glass + --ds-color-border-control + --ds-shadow-control' },
    { property: 'Popover width (max)', token: '--ds-size-popover-date' },
    { property: 'Popover fill / border / shadow', token: '--ds-color-surface-raised + --ds-color-border-glass + --ds-shadow-float' },
    { property: 'Popover radius', token: '--ds-radius-control' },
    { property: 'Popover padding / gap', token: '--ds-space-4' },
    { property: 'Offset / layer', token: '--ds-space-1 + --ds-z-menu' },
  ],
  usage: `<Select variant="filter" label="Period" options={presets} value={preset} onChange={setPreset} />\n{preset === 'Custom range' && <DateRangePicker label="Period" from={from} to={to} onChange={(f, t) => setRange({ from: f, to: t })} />}`,
  behavior: <ul className="doc-list"><li>The trigger has <code>aria-haspopup="dialog"</code> and <code>aria-expanded</code>; its accessible name includes the current range.</li><li>Escape and outside click close the popover without applying; Apply commits; focus returns to the trigger (§5.55 Popovers).</li></ul>,
};

/* ── Checkbox ───────────────────────────────────────────────────── */
const INSPECTIONS = inspectionOpts.map(o => o.label);
function CheckDemo() {
  const [on, setOn] = useState<string[]>(['Primary - Front Label']);
  const all = on.length === INSPECTIONS.length, some = on.length > 0 && !all;
  return (
    <fieldset className="doc-fieldset">
      <legend className="ds-field__label">Inspection types on this camera</legend>
      <Checkbox checked={all} indeterminate={some} onChange={v => setOn(v ? INSPECTIONS : [])}>All inspection types</Checkbox>
      <div className="doc-indent">{INSPECTIONS.map(i => <Checkbox key={i} checked={on.includes(i)} onChange={v => setOn(v ? [...on, i] : on.filter(x => x !== i))}>{i}</Checkbox>)}</div>
    </fieldset>
  );
}
function PlayCheck(p: Record<string, string | boolean>) {
  const [c, setC] = useState(false);
  return <Checkbox checked={c} onChange={setC} indeterminate={!!p.indeterminate} disabled={!!p.disabled}>{String(p.label)}</Checkbox>;
}
export const checkboxDoc: ComponentDoc = {
  path: '/components/checkboxes', title: 'Checkboxes', refs: ['5.12'], provenance: 'EXTENSION', previewSurface: 'card',
  summary: 'A native checkbox visually hidden over a 16px box (radius 4). The unchecked border is border-control-hover (white/20 %, as DEOC); checked and indeterminate use a brand-strong fill, brand border and a white mark. Used in table selection and multi-select options.',
  preview: () => <CheckDemo />,
  states: () => (
    <Grid min={180}>
      <Cell label="unchecked"><Checkbox checked={false} onChange={() => {}}>Secondary - Carton</Checkbox></Cell>
      <Cell label="checked"><Checkbox checked onChange={() => {}}>Secondary - Carton</Checkbox></Cell>
      <Cell label="indeterminate"><Checkbox checked={false} indeterminate onChange={() => {}}>All inspection types</Checkbox></Cell>
      <Cell label="focus-visible" note="2px ring, offset 2, on the box"><Checkbox checked={false} onChange={() => {}} className="is-focus-visible">Secondary - Carton</Checkbox></Cell>
      <Cell label="disabled" note="opacity 0.4"><Checkbox checked onChange={() => {}} disabled>Secondary - Carton</Checkbox></Cell>
      <Cell label="long label wraps"><div className="doc-narrow"><Checkbox checked={false} onChange={() => {}}>Flag every carton whose expiry date cannot be read</Checkbox></div></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <Checkbox checked onChange={() => {}}>Primary - Front Label</Checkbox>,
    parts: [{ part: 'container', label: 'Row', spec: 'inline-flex, gap 12, 14/20 text-secondary' }, { part: 'box', label: 'Box', spec: '16×16, radius 4, 1px border-control-hover; checked brand-strong + brand' }, { part: 'label', label: 'Label', spec: 'wraps; clicking it toggles' }],
  },
  spec: [
    { property: 'Box', token: '--ds-size-checkbox' },
    { property: 'Radius', token: '--ds-radius-xs' },
    { property: 'Unchecked border', token: '--ds-color-border-control-hover' },
    { property: 'Checked fill / border / mark', token: '--ds-color-brand-strong + --ds-color-brand + --ds-color-text-on-brand' },
    { property: 'Label', token: '--ds-color-text-secondary', note: ' 14/20' },
    { property: 'Gap', token: '--ds-space-3' },
    { property: 'Focus', token: '--ds-color-focus-ring + --ds-focus-offset' },
  ],
  playground: {
    surface: 'card',
    controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'indeterminate', label: 'Indeterminate' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
    initial: { label: 'Primary - Front Label', indeterminate: false, disabled: false },
    render: p => <PlayCheck {...p} />,
    code: p => `<Checkbox checked={checked} onChange={setChecked}${p.indeterminate ? ' indeterminate' : ''}${p.disabled ? ' disabled' : ''}>${p.label}</Checkbox>`,
  },
  usage: `<Checkbox checked={front} onChange={setFront}>Primary - Front Label</Checkbox>`,
  behavior: <ul className="doc-list"><li>A real <code>input type="checkbox"</code>: Space toggles; the label is part of the hit area. Group related boxes in a <code>fieldset</code> with a <code>legend</code>.</li></ul>,
};

/* ── Radio cards ────────────────────────────────────────────────── */
function RadioDemo({ vertical }: { vertical?: boolean }) {
  const [v, setV] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const id = `insp${vertical ? 'v' : ''}`;
  return (
    <div className="ds-field doc-narrow-xl">
      <span className="ds-field__label" id={id}>Packaging level</span>
      <RadioCards labelId={id} value={v} onChange={setV} vertical={vertical} options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }]} />
    </div>
  );
}
export const radioDoc: ComponentDoc = {
  path: '/components/radio-cards', title: 'Radio Buttons & Radio Cards', refs: ['5.13'], provenance: 'STANDARDIZED', previewSurface: 'card',
  summary: 'Choose one of 2–4 visible options. The option look comes from the Figma Active / Inactive options: 1px white/20% outline, radius 8, padding 10 16, 14/400 label; a 20px radio glyph is the state cue. Selected [INFERRED]: brand-strong border, surface-nested fill, primary text. Arrow keys move and select (one tab stop).',
  preview: () => <RadioDemo />,
  variants: () => <Grid min={300}><Cell label="horizontal (2–4)"><RadioDemo /></Cell><Cell label="vertical"><RadioDemo vertical /></Cell></Grid>,
  unsupported: ['plain stand-alone radio buttons without a card (the spec defines radio cards only)'],
  states: () => (
    <Grid min={300}>
      <Cell label="unselected · hover · selected · focus" note="hover: border text-faint + text-secondary">
        <RadioCards value="b" onChange={() => {}} label="States" forceClass={{ a: 'is-hover', c: 'is-focus-visible' }} options={[{ value: 'a', label: 'Hover' }, { value: 'b', label: 'Selected' }, { value: 'c', label: 'Focus' }]} />
      </Cell>
      <Cell label="disabled group" note="opacity 0.4"><RadioCards value="a" onChange={() => {}} label="Disabled" disabled options={[{ value: 'a', label: 'Primary' }, { value: 'b', label: 'Secondary' }]} /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><RadioCards label="Packaging level" value="b" onChange={() => {}} options={[{ value: 'a', label: 'Primary' }, { value: 'b', label: 'Secondary' }]} /></div>,
    parts: [
      { part: 'group', label: 'Radiogroup', spec: 'flex, wraps, gap 12' },
      { part: 'card', label: 'Card', spec: 'min-height 40 · radius 8 · 1px border-control-hover (white/20%) · padding 10 16 · 20px glyph + 8px gap' },
      { part: 'label', label: 'Label', spec: '14/20, text-muted → primary when selected; wraps' },
    ],
  },
  spec: [
    { property: 'Min height', token: '--ds-size-control' },
    { property: 'Padding', token: '--ds-space-2-5 + --ds-space-4' },
    { property: 'Radius', token: '--ds-radius-sm' },
    { property: 'Unselected border / text', token: '--ds-color-border-control-hover + --ds-color-text-muted' },
    { property: 'Hover border / text', token: '--ds-color-text-faint + --ds-color-text-secondary' },
    { property: 'Selected fill / border / text', token: '--ds-color-surface-nested + --ds-color-brand-strong + --ds-color-text-primary' },
    { property: 'Glyph on / off', token: '--ds-color-brand + --ds-color-text-muted' },
    { property: 'Gap between cards', token: '--ds-space-3' },
  ],
  playground: {
    surface: 'card',
    controls: [{ kind: 'select', key: 'n', label: 'Options', options: ['2', '3', '4'] }, { kind: 'bool', key: 'vertical', label: 'Vertical' }, { kind: 'bool', key: 'disabled', label: 'Disabled group' }],
    initial: { n: '3', vertical: false, disabled: false },
    render: p => <PlayState init="a">{(v, set) => <div className="doc-narrow-xxl"><RadioCards label="Inspection type" value={v} onChange={set} disabled={!!p.disabled} vertical={!!p.vertical} options={INSPECTIONS.slice(0, +p.n).map((l, i) => ({ value: 'abcd'[i], label: l }))} /></div>}</PlayState>,
    code: p => `<RadioCards label="Inspection type" value={value} onChange={setValue}${p.vertical ? ' vertical' : ''}${p.disabled ? ' disabled' : ''} options={[…${p.n} options]} />`,
  },
  usage: `<RadioCards label="Packaging level" value={level} onChange={setLevel} options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }]} />`,
  behavior: <ul className="doc-list"><li><code>radiogroup</code> of <code>radio</code> buttons with roving tabindex: arrows move and select (wrapping, mirrored in RTL), Home / End jump (§5.55 Choice controls).</li></ul>,
};

/* ── Binary toggle ──────────────────────────────────────────────── */
function ToggleDemo() {
  const [v, setV] = useState<'active' | 'inactive'>('active');
  return <div className="doc-narrow-xl ds-field"><span className="ds-field__label" id="tg">Status</span><BinaryToggle labelId="tg" value={v} onChange={setV} options={[{ value: 'active', label: 'Active', dot: 'success' }, { value: 'inactive', label: 'Inactive', dot: 'error' }]} /></div>;
}
export const toggleDoc: ComponentDoc = {
  path: '/components/binary-toggle', title: 'Binary Status Toggle', refs: ['5.14'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'Sets an on/off status with labelled, coloured options ("Status" in Add Product): two equal options 12px apart, each centred with an 8px glowing dot and a 14/400 label. A radiogroup; selected [INFERRED]: surface-nested fill, primary label and a border in the option\'s status colour.',
  preview: () => <ToggleDemo />,
  variants: () => (
    <Grid min={300}>
      <Cell label="product status (Add Product)"><ToggleDemo /></Cell>
      <Cell label="line state"><BinaryToggle label="Line state" value="r" onChange={() => {}} options={[{ value: 'r', label: 'Running', dot: 'success' }, { value: 's', label: 'Stopped', dot: 'error' }]} /></Cell>
    </Grid>
  ),
  states: () => (
    <Grid min={300}>
      <Cell label="on selected · off hover" note="hover: text-secondary"><BinaryToggle label="s" value="a" onChange={() => {}} forceClass={{ b: 'is-hover' }} options={[{ value: 'a', label: 'Active', dot: 'success' }, { value: 'b', label: 'Inactive', dot: 'error' }]} /></Cell>
      <Cell label="off selected" note="danger-border"><BinaryToggle label="o" value="b" onChange={() => {}} options={[{ value: 'a', label: 'Active', dot: 'success' }, { value: 'b', label: 'Inactive', dot: 'error' }]} /></Cell>
      <Cell label="focus-visible" note="focus-ring-field"><BinaryToggle label="f" value="a" onChange={() => {}} forceClass={{ a: 'is-focus-visible' }} options={[{ value: 'a', label: 'Active', dot: 'success' }, { value: 'b', label: 'Inactive', dot: 'error' }]} /></Cell>
      <Cell label="disabled" note="opacity 0.4"><BinaryToggle label="d" value="a" onChange={() => {}} disabled options={[{ value: 'a', label: 'Active', dot: 'success' }, { value: 'b', label: 'Inactive', dot: 'error' }]} /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><BinaryToggle label="Status" value="a" onChange={() => {}} options={[{ value: 'a', label: 'Active', dot: 'success' }, { value: 'b', label: 'Inactive', dot: 'error' }]} /></div>,
    parts: [
      { part: 'container', label: 'Radiogroup', spec: 'flex, gap 12, min-height 40' },
      { part: 'option', label: 'Option', spec: 'flex 1 · radius 8 · 1px border-control-hover (white/20%) · padding 10 16 · 8px dot + 8px gap + 14/20 label; selected = surface-nested + status border + primary text' },
    ],
  },
  spec: [
    { property: 'Min height', token: '--ds-size-control' },
    { property: 'Gap', token: '--ds-space-3' },
    { property: 'Option border / radius', token: '--ds-color-border-control-hover + --ds-radius-sm' },
    { property: 'Option padding', token: '--ds-space-2-5 + --ds-space-4' },
    { property: 'Label / hover / selected', token: '--ds-color-text-muted + --ds-color-text-secondary + --ds-color-text-primary' },
    { property: 'Selected fill', token: '--ds-color-surface-nested' },
    { property: 'Selected border (on / off)', token: '--ds-color-success-border + --ds-color-danger-border' },
    { property: 'Dot', token: '--ds-size-status-dot-sm' },
  ],
  usage: `<BinaryToggle labelId="status-label" value={status} onChange={setStatus} options={[{ value: 'active', label: 'Active', dot: 'success' }, { value: 'inactive', label: 'Inactive', dot: 'error' }]} />`,
  behavior: <ul className="doc-list"><li>Behaves as a radio group (<code>role="radiogroup"</code>): arrows move and select; one tab stop. The label, not the dot colour, carries the meaning (§9.4).</li></ul>,
};

/* ── Switch ─────────────────────────────────────────────────────── */
function SwitchDemo() {
  const [on, setOn] = useState(true);
  return <Switch checked={on} onChange={v => { setOn(v); toast(`Detection frames ${v ? 'shown' : 'hidden'}`); }} label="Show detection frames" />;
}
export const switchDoc: ComponentDoc = {
  path: '/components/switches', title: 'Switches', refs: ['5.15'], provenance: 'EXTENSION',
  summary: 'Only for instant-apply settings outside forms with a Save button. A 36 × 20 track (color-track, debossed) with a 16px text-muted thumb; on = brand-strong track and white thumb. role="switch" with a visible label 12px to the inline-end; the thumb mirrors in RTL.',
  preview: () => <SwitchDemo />,
  states: () => (
    <Grid min={220}>
      <Cell label="off"><Switch checked={false} onChange={() => {}} label="Show detection frames" /></Cell>
      <Cell label="on"><Switch checked onChange={() => {}} label="Show detection frames" /></Cell>
      <Cell label="focus-visible"><Switch checked onChange={() => {}} label="Show detection frames" className="is-focus-visible" /></Cell>
      <Cell label="disabled" note="opacity 0.4"><Switch checked onChange={() => {}} label="Show detection frames" disabled /></Cell>
    </Grid>
  ),
  spec: [
    { property: 'Track', value: '36 × 20px', note: ' (spec literal)' },
    { property: 'Off track / shadow', token: '--ds-color-track + --ds-shadow-close' },
    { property: 'On track', token: '--ds-color-brand-strong' },
    { property: 'Thumb (16px) off / on', token: '--ds-color-text-muted + --ds-color-text-primary' },
    { property: 'Radius', token: '--ds-radius-full' },
    { property: 'Label gap', token: '--ds-space-3' },
    { property: 'Thumb travel', token: '--ds-duration-fast + --ds-ease-standard' },
  ],
  playground: {
    controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
    initial: { label: 'Show detection frames', disabled: false },
    render: p => <PlayState init={true}>{(v, set) => <Switch checked={v} onChange={set} label={String(p.label)} disabled={!!p.disabled} />}</PlayState>,
    code: p => `<Switch checked={on} onChange={setOn} label="${p.label}"${p.disabled ? ' disabled' : ''} />`,
  },
  usage: `<Switch checked={showFrames} onChange={setShowFrames} label="Show detection frames" />`,
  behavior: <ul className="doc-list"><li><code>button role="switch"</code> with <code>aria-checked</code>; Space toggles and the change applies immediately (§5.55).</li></ul>,
};

/* ── File upload, attach, rich picker ──────────────────────────── */
export const uploadDoc: ComponentDoc = {
  path: '/components/file-upload', title: 'File Upload', refs: ['5.17'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'The reference-image dropzone (DEOC FileUpload): a glass box (1px dashed border-control, radius 12, no shadow), 24px padding, a centred 32px upload glyph at 60%, title 14/500 text-secondary and a 12px text-placeholder hint with "•" separators. role="button": click, Enter or Space opens the file picker; drag-and-drop is an enhancement. Type and size are validated locally; nothing is uploaded.',
  preview: () => (
    <div className="ds-field doc-narrow-xl">
      <span className="ds-field__label" id="up-primary">Primary Label Reference<span className="ds-field__req" aria-hidden="true"> *</span></span>
      <FileUpload labelledBy="up-primary" />
    </div>
  ),
  variants: () => <Grid min={300}><Cell label="empty · single file"><FileUpload /></Cell><Cell label="multiple files (product choice)" note="Filled: file rows on surface-nested, radius 8"><FileUpload multiple title="Upload reference images" /></Cell></Grid>,
  states: () => (
    <Grid min={260}>
      <Cell label="hover / drag-over" note="brand border + brand-tint-10 fill [INFERRED]"><FileUpload forceClass="is-dragover" /></Cell>
      <Cell label="focus-visible"><FileUpload forceClass="is-focus-visible" /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><FileUpload /></div>,
    parts: [
      { part: 'container', label: 'Dropzone', spec: 'role=button · 1px border-glass · radius 12 · gradient-glass · shadow-glass · padding 28 12 · gap 8' },
      { part: 'icon', label: 'Upload glyph', spec: '32px, text-muted' },
      { part: 'title', label: 'Title', spec: '14/20 500 text-secondary' },
      { part: 'hint', label: 'Hint', spec: '12/16 text-muted, "•" separators 6px apart' },
    ],
  },
  spec: [
    { property: 'Fill / border / shadow', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-shadow-glass' },
    { property: 'Hover / drag-over', token: '--ds-color-brand + --ds-color-brand-tint-10' },
    { property: 'Error border', token: '--ds-color-error' },
    { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Padding', token: '--ds-space-6' },
    { property: 'Gap', token: '--ds-space-2' },
    { property: 'Glyph / hint', token: '--ds-color-text-muted' },
    { property: 'File row fill / radius', token: '--ds-color-surface-nested + --ds-radius-sm' },
  ],
  playground: {
    surface: 'card',
    controls: [{ kind: 'text', key: 'title', label: 'Title' }, { kind: 'bool', key: 'multiple', label: 'Multiple files' }],
    initial: { title: 'Upload Reference', multiple: false },
    render: p => <div className="doc-narrow-xl"><FileUpload key={String(p.multiple)} title={String(p.title)} multiple={!!p.multiple} /></div>,
    code: p => `<FileUpload title="${p.title}"${p.multiple ? ' multiple' : ''} />`,
  },
  usage: `<span className="ds-field__label" id="primary-ref">Primary Label Reference</span>\n<FileUpload labelledBy="primary-ref" accept={['image/jpeg', 'image/png']} maxMb={5} />`,
  behavior: <ul className="doc-list"><li>A wrong type or size shows "Use a JPG or PNG file up to 5 MB." (role=alert) and the 1px error border. Selected files appear as rows with a "Remove …" button; removing returns focus to the dropzone (§5.55).</li></ul>,
};

function AttachDemo() {
  const [v, setV] = useState('');
  return <div className="doc-narrow-xl"><Field label="Product Barcode" required><AttachField value={v} onValueChange={setV} /></Field></div>;
}
export const attachDoc: ComponentDoc = {
  path: '/components/field-with-attach', title: 'Field with Attach Button', refs: ['5.18'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'A §5.5 field holding a thumbnail and the value, followed by a secondary-style attach button; the wrapper draws the focus ring with :focus-within. The value can be typed or read from a photo; the extraction here is simulated locally (it fills a sample barcode after "Scanning…").',
  preview: () => <AttachDemo />,
  states: () => (
    <Grid min={320}>
      <Cell label="filled"><AttachField value="8901030875397" onValueChange={() => {}} /></Cell>
      <Cell label="error"><Field label="Product Barcode" error="Barcode not detected. Upload the photo again."><AttachField value="" onValueChange={() => {}} /></Field></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><AttachField value="8901030875397" onValueChange={() => {}} /></div>,
    parts: [
      { part: 'container', label: 'Row', spec: 'flex, wraps, gap 12' },
      { part: 'field', label: 'Glass field', spec: 'min-height 40 · padding 0 16 · 1px border-glass · radius 12 · gradient-glass · shadow-field · gap 10; 20px thumbnail' },
      { part: 'button', label: 'Attach button', spec: 'min-height 40 · padding 0 14 · 1px border-control · gradient-glass · shadow-field · text-emphasis 14/500 · 18px glyph, gap 6' },
    ],
  },
  spec: [
    { property: 'Field fill / border / shadow', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-shadow-field' },
    { property: 'Field focus (wrapper)', token: '--ds-color-focus-ring + --ds-focus-offset-tight' },
    { property: 'Button border / hover / text', token: '--ds-color-border-control + --ds-color-border-control-hover + --ds-color-text-emphasis' },
    { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Row gap / field gap', token: '--ds-space-3 + --ds-space-2-5' },
    { property: 'Error', token: '--ds-color-error + --ds-error-ring' },
  ],
  playground: {
    surface: 'card', controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'error', label: 'Error' }], initial: { label: 'Product Barcode', error: false },
    render: p => <PlayState init="">{(v, set) => <div className="doc-narrow-xl"><Field label={String(p.label)} error={p.error ? 'Barcode not detected. Upload the photo again.' : undefined}><AttachField value={v} onValueChange={set} /></Field></div>}</PlayState>,
    code: p => `<Field label="${p.label}"${p.error ? ' error="…"' : ''}><AttachField value={code} onValueChange={setCode} /></Field>`,
  },
  usage: `<Field label="Product Barcode"><AttachField value={barcode} onValueChange={setBarcode} /></Field>`,
};

function PickerDemo() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="doc-narrow-xl doc-stack">
      <Field label="Factory Admin / Plant Manager" required><RichPicker people={PICKER_PEOPLE} value={v} onChange={setV} /></Field>
      <LinkAction icon={Plus} onClick={() => toast('The add-user form opens here')}>Add New User</LinkAction>
    </div>
  );
}
export const richPickerDoc: ComponentDoc = {
  path: '/components/rich-picker', title: 'Rich Picker', refs: ['5.19'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'Choose a person with identity details ("Factory Admin / Plant Manager", frame 3). The trigger is the §5.5 field ("Choose user"); the opaque surface-raised list (radius 12, 4px below) holds surface-nested rows: a 40px brand avatar with a 12px presence dot, name 12/600 + an info chip (employee ID), and an e-mail line. A "+ Add User" footer row closes the list.',
  preview: () => <PickerDemo />,
  states: () => (
    <Grid min={340}>
      <Cell label="empty"><RichPicker label="Factory admin" people={PICKER_PEOPLE} value={null} onChange={() => {}} /></Cell>
      <Cell label="with value"><RichPicker label="Factory admin" people={PICKER_PEOPLE} value="p1" onChange={() => {}} /></Cell>
      <Cell label="error" note="1px error ring"><RichPicker label="Factory admin" people={PICKER_PEOPLE} value={null} onChange={() => {}} aria-invalid="true" /></Cell>
    </Grid>
  ),
  anatomy: {
    surface: 'card',
    render: () => <div className="doc-narrow-xl"><RichPicker label="Factory admin" people={PICKER_PEOPLE} value="p1" onChange={() => {}} /></div>,
    parts: [{ part: 'trigger', label: 'Trigger with rich row', spec: '§5.5 field, 8px vertical padding: 40px brand avatar + 12px presence dot · name 12/600 primary + info chip · 11px mail glyph + 12/400 muted e-mail; row gap 14' }],
  },
  spec: [
    { property: 'List fill / radius / shadow', token: '--ds-color-surface-raised + --ds-radius-control + --ds-shadow-float' },
    { property: 'List offset / max height', token: '--ds-space-1 + --ds-size-picker-max-height' },
    { property: 'Row fill / edge', token: '--ds-color-surface-nested + --ds-color-border-glass' },
    { property: 'Row hover / selected', token: '--ds-color-surface-hover-subtle + --ds-color-surface-selected' },
    { property: 'Row padding / gap', token: '--ds-space-3-5 + --ds-space-4', note: ' (14 14 14 16, gap 14)' },
    { property: 'Avatar', token: '--ds-size-avatar-lg + --ds-gradient-brand-avatar' },
    { property: 'Presence dot / ring', token: '--ds-color-success-glow + --ds-color-surface-sunken-button' },
    { property: 'Footer row', token: '--ds-gradient-glass + --ds-color-link' },
  ],
  playground: {
    surface: 'card', controls: [{ kind: 'select', key: 'n', label: 'People', options: ['1', '2', '3'] }, { kind: 'bool', key: 'error', label: 'Error' }], initial: { n: '3', error: false },
    render: p => <PlayState init={null as string | null}>{(v, set) => <div className="doc-narrow-xl"><RichPicker label="Factory admin" people={PICKER_PEOPLE.slice(0, +p.n)} value={v} onChange={set} aria-invalid={p.error ? 'true' : undefined} /></div>}</PlayState>,
    code: p => `<RichPicker people={people} value={adminId} onChange={setAdminId}${p.error ? ' aria-invalid="true"' : ''} />`,
  },
  notes: <p className="ds-text-body-muted">Each option's accessible name is "Name, role, email"; with more than 5 people the list adds a search band that matches name, e-mail, role and ID. The "+ Add User" footer opens a product-specific form; here it shows a toast.</p>,
  usage: `<Field label="Factory Admin / Plant Manager" required>\n  <RichPicker people={PICKER_PEOPLE} value={adminId} onChange={setAdminId} />\n</Field>`,
};

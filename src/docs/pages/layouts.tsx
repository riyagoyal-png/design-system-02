import { useRef, useState, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { DocSection, Preview, Prov, SpecSource, SpecTable } from '../kit';
import { Button, IconButton } from '../../components/ds/Button';
import { PageHeader, Pagination, Tabs, TabPanel } from '../../components/ds/Nav';
import { SearchInput, Field, TextInput, Textarea } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { DashCard, EntityCard, KpiCard, StatusCard, SummaryStrip } from '../../components/ds/Cards';
import { Badge, Illustration, Status, Tag } from '../../components/ds/Display';
import { Collapsible, DataTable, TableCard, type Column } from '../../components/ds/Table';
import { ConfirmDialog, Modal, Popover, SlidePanel } from '../../components/ds/Overlay';
import { BarChart, Donut, Heatmap } from '../../charts/Charts';
import { Legend } from '../../charts/core';
import { toast } from '../../components/ds/Toast';
import { Icon } from '../../components/ds/Icon';
import { ArrowBack, ChevronRight, Edit, Export, Plus, Trash } from '../../components/ds/figmaIcons';
import { DEFECT_DIST, FACTORIES, HEAT_COLS, HEAT_ROWS, HEAT_VALUES, QUALITY, ROLES, ROLE_COLOR, SITES, USERS, utilTone, type Camera, type User } from '../../apps/vision/data';
import { href } from '../../lib/router';

/** The nine application routes (§12) a layout pattern can point to. */
const APP = {
  live: ['Live View', '/apps/live-view'], factories: ['Factories', '/apps/factories'], addFactory: ['Add New Factory', '/apps/add-factory'],
  cameras: ['Cameras', '/apps/cameras'], addCameras: ['Add Cameras', '/apps/add-cameras'], users: ['User Management', '/apps/users'],
  analytics: ['Analytics', '/apps/analytics'], addProduct: ['Add Product', '/apps/add-product'], products: ['Product Master', '/apps/product-master'],
} as const;
type AppKey = keyof typeof APP;

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return <div className="doc-frame" role="group" aria-label={label}><div className="ds-main doc-frame__main">{children}</div></div>;
}
function Page({ intro, refs, apps, tag = 'PRODUCT DECISION', children }: { intro: string; refs: string[]; apps: AppKey[]; tag?: 'PRODUCT DECISION' | 'OBSERVED'; children: ReactNode }) {
  return (
    <div className="doc-page">
      <div className="doc-meta"><Prov tag={tag} /><span className="ds-text-small">Layer L3 (SHOULD) · Spec: {refs.map(r => `§${r}`).join(' · ')}</span></div>
      <p className="ds-text-body doc-lead">{intro}</p>
      <p className="ds-text-body">{apps.length ? 'Used in: ' : 'Not drawn in the eight screens.'}{apps.map((k, i) => <span key={k}>{i ? ' · ' : ''}<a className="ds-link" href={href(APP[k][1])}>{APP[k][0]}</a></span>)}</p>
      {children}
      <div className="doc-stack">{refs.map(r => <SpecSource key={r} num={r} />)}</div>
    </div>
  );
}

const ALL_APPS = Object.keys(APP) as AppKey[];

export function ShellLayout() {
  return (
    <Page tag="OBSERVED" refs={['6.1', '6.0', '8.2']} apps={ALL_APPS} intro="Every frame (1920 × 1021): a 16px-padded viewport on the app gradient with a blue and a green ambient glow; the 256px sidebar and the main panel (radius 24, gradient-glass-strong, shadow-shell + shadow-edge) sit 20px apart. Only the page content scrolls (16px gutter, 8px under the header, sections 20px apart). Drawers and modals mount on the shell, so their scrim also covers the sidebar (R-12). Below 1024px the shell loses its padding and radii, a 56px top bar appears and the sidebar opens as a drawer.">
      <DocSection id="demo" title="Scaled shell">
        <div className="doc-shell-mini" aria-hidden="true">
          <div className="doc-shell-mini__rail doc-shell-mini__rail--wide">{[0, 1, 2, 3].map(i => <span key={i} className={i === 1 ? 'is-on' : ''} />)}</div>
          <div className="doc-shell-mini__main">
            <div className="doc-shell-mini__header"><span className="doc-shell-mini__title" /><span className="doc-shell-mini__btn" /></div>
            <div className="doc-shell-mini__content"><div className="doc-shell-mini__kpis">{[0, 1, 2, 3].map(i => <span key={i} />)}</div><span className="doc-shell-mini__card" /></div>
          </div>
        </div>
      </DocSection>
      <DocSection id="spacing" title="Spacing and radius by role (§6.0, §2.5)">
        <SpecTable caption="Shell and page spacing" rows={[
          { property: 'Viewport → shell panels', token: '--ds-space-shell-padding' }, { property: 'Sidebar → main panel', token: '--ds-space-shell-gap' },
          { property: 'Page gutter (inline, bottom)', token: '--ds-space-page-gutter' }, { property: 'Header → content', token: '--ds-space-page-top' },
          { property: 'Between page sections', token: '--ds-space-section' }, { property: 'KPI, entity and dashboard cards', token: '--ds-space-grid-lg' },
          { property: 'Camera tiles, side-panel cards', token: '--ds-space-grid' }, { property: 'Sidebar width', token: '--ds-size-sidebar-expanded' },
          { property: 'Main panel, sidebar, KPI cards, camera tiles', token: '--ds-radius-panel' }, { property: 'Entity, dashboard, table, section cards', token: '--ds-radius-card' },
          { property: 'Nested groups, nav items', token: '--ds-radius-nested' }, { property: 'Buttons, inputs, menus, modals', token: '--ds-radius-control' },
        ]} />
      </DocSection>
    </Page>
  );
}

export function HeaderLayout() {
  const [q, setQ] = useState('');
  return (
    <Page tag="OBSERVED" refs={['6.2', '5.38']} apps={['live', 'factories', 'cameras', 'users', 'analytics', 'products']} intro="Title with its 36px illustration at the start; page-scoped controls at the end in the order search → filters → primary action, one primary per header. Live View adds a status pill after the title. A table that needs its own search and filters gets a toolbar row inside its table card (Product Master).">
      <DocSection id="default" title="Default (Factories)">
        <Frame label="Header default"><PageHeader title="Factories" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />} actions={<>
          <SearchInput value={q} onValueChange={setQ} label="Filter factories or units" placeholder="Filter factories or units..." width="sm" />
          <Select variant="filter" label="Status" className="ds-select--180" value="All Status" onChange={() => {}} searchable={false} options={[{ value: 'All Status', label: 'All Status' }]} />
          <Button leading={Plus} minWidth>Add factory</Button></>} /></Frame>
      </DocSection>
      <DocSection id="toolbar" title="Variant: table toolbar row (Product Master)">
        <section className="ds-table-card" aria-label="Product list toolbar">
          <div className="ds-table-card__toolbar">
            <SearchInput width="full" value={q} onValueChange={setQ} label="Search products" placeholder="Search by product name, barcode, CLD code or CBU code" />
            {['Status', 'CBU code'].map(l => <Select key={l} variant="filter" label={l} className="ds-select--180" value="all" onChange={() => {}} searchable={false} options={[{ value: 'all', label: l === 'Status' ? 'All Status' : 'All CBU Codes' }]} />)}
            <Button variant="secondary" leading={Export}>Export</Button>
          </div>
        </section>
      </DocSection>
    </Page>
  );
}

const USER_COUNTS = [{ value: 'all', label: 'All Users', count: USERS.length }, ...ROLES.map(r => ({ value: r as string, label: `${r}s`, count: USERS.filter(u => u.role === r).length }))];

export function FilterLayout() {
  const [open, setOpen] = useState(false);
  const [chips, setChips] = useState(['Factory: Factory 1', 'Status: Active']);
  const ref = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState('all');
  const sel = (label: string, first: string, cls = 'ds-select--180') => <Select variant="filter" label={label} className={cls} value={first} onChange={() => {}} searchable={false} options={[{ value: first, label: first }]} />;
  return (
    <Page tag="OBSERVED" refs={['6.3']} apps={['analytics', 'live', 'users', 'products', 'cameras']} intro="Place a filter where its scope is. Page-wide filters go in the header (search 288–360px, selects 180px). Filters that scope one card go in that card's header; filters for one table go in a toolbar row above it. Role filters that partition a list are segmented tabs with counts, with the export action at the end of the same row. Changing a filter resets pagination.">
      <DocSection id="global" title="Page-wide (Analytics header)"><Frame label="Global filters"><PageHeader title="Analytics" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />} actions={<>{sel('Period', 'Today')}{sel('Factory', 'All Factories')}{sel('Line', 'All Lines')}</>} /></Frame></DocSection>
      <DocSection id="local" title="Card-scoped (defect matrix header)"><DashCard title="Line - Product Defect Matrix" subtitle="Weekly defect rate by production line" right={<><Badge tone="success">Active</Badge>{sel('Period', 'Last 8 weeks')}</>}><div className="doc-placeholder">Bubble matrix</div></DashCard></DocSection>
      <DocSection id="categorical" title="Partitioning tabs with counts (User Management)">
        <div className="ds-cluster app-between"><Tabs idBase="lf" label="Roles" value={tab} onChange={setTab} tabs={USER_COUNTS} /><Button variant="secondary" leading={Export}>Export</Button></div>
      </DocSection>
      <DocSection id="advanced" title="Many filters [EXTENSION]">
        <div className="doc-stack">
          <div className="ds-select">
            <Button ref={ref} variant="secondary" leading={SlidersHorizontal} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(o => !o)}>Filters</Button>
            <Popover open={open} onClose={() => setOpen(false)} label="Filters" anchorRef={ref} align="start" width="sm" footer={<><Button variant="ghost" size="sm" onClick={() => { setChips([]); setOpen(false); }}>Clear</Button><Button size="sm" onClick={() => { setChips(['Factory: Factory 1', 'Status: Active', 'Line: Line 1']); setOpen(false); ref.current?.focus(); }}>Apply</Button></>}>
              <Field label="Line"><Select options={[{ value: 'Line 1', label: 'Line 1' }, { value: 'Line 2', label: 'Line 2' }]} value={null} onChange={() => {}} placeholder="Any line" /></Field>
            </Popover>
          </div>
          <div className="ds-cluster" aria-label="Applied filters" role="group">
            {chips.map(c => <span key={c} className="doc-chip-remove">{c}<button type="button" className="ds-icon-btn ds-icon-btn--sm" aria-label={`Remove filter ${c}`} onClick={() => setChips(chips.filter(x => x !== c))}><Icon icon={X} size={14} /></button></span>)}
            {chips.length > 0 && <Button variant="ghost" size="sm" onClick={() => setChips([])}>Clear filters</Button>}
          </div>
        </div>
      </DocSection>
    </Page>
  );
}

export function KpiLayout() {
  const f = FACTORIES[0];
  return (
    <Page tag="OBSERVED" refs={['6.4', '8.4']} apps={['factories', 'analytics', 'products']} intro="Page-level headline numbers are a full-width row of 4 (Factories, Product Master) or 6 (Analytics) equal KPI cards, 20px apart, each a panel-weight object with radius 24. Values are short; ratios read “a / b”. Below 1280px the row becomes an auto-fill grid (min 260px). Numbers that belong to one object use the variants instead.">
      <DocSection id="row" title="KPI row (Factories)">
        <div className="ds-kpi-row">
          <KpiCard label="Total Factories" value={FACTORIES.length} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} />
          <KpiCard label="Active Factories" value={FACTORIES.filter(x => x.status.label === 'Active').length} icon={<Illustration name="illus.facility-set" crop="factory-active" size={52} />} />
          <KpiCard label="Total Lines" value={28} icon={<Illustration name="illus.conveyor-line" crop="conveyor" size={52} />} />
          <KpiCard label="Cameras Online" value="96 / 112" icon={<Illustration name="illus.facility-set" crop="camera-zoom" size={52} />} />
        </div>
      </DocSection>
      <DocSection id="variants" title="Variants">
        <div className="doc-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))' }}>
          <EntityCard title={f.name} location={f.city} status={f.status} icon={<Illustration name="illus.facility-set" crop="factory" size={40} />}
            metric={{ value: f.lines, of: f.linesOf, unit: 'lines active', tone: utilTone(f) }} meta={{ text: `${f.cameras} cameras` }} owner={f.admin} role="Factory Admin" actionLabel="View factory" />
          <SummaryStrip layout="stacked" eyebrow="Bottle Line 3" title="Dove Nourishing Bodywash 825 ml" />
          <StatusCard title="Camera Status" running={123} stopped={5}><p className="ds-text-body-muted doc-pad">Offline cameras are listed here (§5.26).</p></StatusCard>
        </div>
      </DocSection>
    </Page>
  );
}

const PAGE = 8;
const userCols: Column<User>[] = [
  { key: 'name', header: 'Name' }, { key: 'email', header: 'Email ID' },
  { key: 'role', header: 'Role', render: u => <Tag color={ROLE_COLOR[u.role]}>{u.role}</Tag> },
  { key: 'factory', header: 'Factory' },
  { key: 'status', header: 'Status', render: u => <Badge tone={u.status.tone} appearance="glass">{u.status.label}</Badge> },
  { key: 'actions', header: 'Actions', hiddenHeader: true, align: 'end', render: u => (
    <span className="ds-row-actions">
      <IconButton icon={Edit} size="compact" label={`Edit ${u.name}`} onClick={() => toast(`Edit ${u.name}`)} />
      <IconButton icon={Trash} size="compact" label={`Delete ${u.name}`} onClick={() => toast(`Delete ${u.name}`)} />
    </span>
  ) },
];
const camCols: Column<Camera>[] = [
  { key: 'name', header: 'Camera name' }, { key: 'serial', header: 'Serial number' }, { key: 'ip', header: 'IP address' },
  { key: 'status', header: 'Status', render: c => <Badge tone={c.status.tone} appearance="glass">{c.status.label}</Badge> },
];

export function TableLayout() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState<Record<string, boolean>>({ s1: true, f1l1: true });
  const rows = USERS.filter(u => tab === 'all' || u.role === tab);
  const site = SITES[0];
  return (
    <Page tag="OBSERVED" refs={['6.6', '6.7']} apps={['users', 'products', 'cameras']} intro="List / management page: header (search, filters, primary) → optional tab row with counts and Export → table card with the table and pagination. Rows are at least 72px, the header row 56px, 8 rows per page; row actions are 32 × 32. Equipment managed by hierarchy uses the grouped list instead: collapsible factory sections 20px apart holding nested line groups (radius 16, 16px apart), the first section and its first group expanded.">
      <DocSection id="list" title="List page (User Management)">
        <Frame label="List page">
          <PageHeader title="User Management" icon={<Illustration name="illus.user-group" size={36} fit="cover" />} actions={<Button leading={Plus} minWidth>Add user</Button>} />
          <div className="ds-page-content doc-frame__content">
            <div className="ds-cluster app-between">
              <Tabs idBase="tl" controls label="Roles" value={tab} onChange={v => { setTab(v); setPage(1); }} tabs={USER_COUNTS} />
              <Button variant="secondary" leading={Export}>Export</Button>
            </div>
            <TabPanel idBase="tl" value={tab}>
              <TableCard>
                <DataTable caption="Users" rowHeader="name" rowKey={u => u.id} rows={rows.slice((page - 1) * PAGE, page * PAGE)} columns={userCols} minWidth={960} />
                <Pagination page={page} pageSize={PAGE} total={rows.length} noun="users" onPage={setPage} />
              </TableCard>
            </TabPanel>
          </div>
        </Frame>
      </DocSection>
      <DocSection id="grouped" title="Grouped list (Cameras)">
        <div className="ds-section-stack">
          <Collapsible title={site.name} count={site.count} open={!!open.s1} onToggle={() => setOpen(o => ({ ...o, s1: !o.s1 }))}>
            {site.lines.map(l => (
              <Collapsible key={l.id} nested headingLevel={3} title={l.name} count={l.cameras.length} open={!!open[l.id]} onToggle={() => setOpen(o => ({ ...o, [l.id]: !o[l.id] }))}
                action={<Button variant="subtle" leading={Plus} onClick={() => toast(`Add a camera to ${l.name}`)}>Add Camera to Line</Button>}>
                <DataTable caption={`${site.name} ${l.name} cameras`} columns={camCols} rows={l.cameras} rowKey={c => c.id} rowHeader="name" minWidth={720} />
              </Collapsible>
            ))}
          </Collapsible>
        </div>
      </DocSection>
    </Page>
  );
}

export function DashboardLayout() {
  const pct = (v: number) => (v >= 10 ? `${v}%` : `${v.toFixed(1)}%`);
  return (
    <Page tag="OBSERVED" refs={['6.9', '6.5']} apps={['analytics']} intro="Header with page-wide filters → KPI row (6) → stacked dashboard cards 20px apart: a full-width chart (Quality Snapshot), a full-width matrix, a pair (fixed 594px donut card + flexible heatmap card), a full-width table, then three status cards. Pairs stack below 1280px. Good / bad always use chart-positive / chart-negative across the page.">
      <div className="doc-stack">
        <DashCard title="Quality Snapshot" right={<Legend items={[{ label: 'Good Products', color: 'var(--ds-chart-positive)' }, { label: 'Bad Products', color: 'var(--ds-chart-negative)' }]} />}>
          <BarChart height={220} label="Good and bad products by factory with defect rate" series={[{ key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)' }, { key: 'bad', label: 'Bad Products', color: 'var(--ds-chart-negative)' }]}
            data={QUALITY.map(d => ({ x: d.x, values: { good: d.good, bad: d.bad } }))} trend={{ label: 'Defect rate', values: QUALITY.map(d => d.rate), format: v => `${v}%` }} />
        </DashCard>
        <div className="ds-dash-row app-row">
          <DashCard title="Defect Distribution" className="app-col-donut"><Donut label="Defects by category" data={DEFECT_DIST} /></DashCard>
          <DashCard title="Defect Rate by Category & Factory" flush className="app-col-grow">
            <Heatmap label="Defect rate by factory and category" rowLabel="Factory" rows={HEAT_ROWS.slice(0, 3)} cols={HEAT_COLS} values={HEAT_VALUES.slice(0, 3)} format={pct} />
          </DashCard>
        </div>
      </div>
    </Page>
  );
}

export function FormsLayout() {
  const [panel, setPanel] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('Bottle Line - 1');
  const [draft, setDraft] = useState(title);
  return (
    <Page tag="OBSERVED" refs={['6.10', '5.46', '5.44', '5.8']} apps={['addFactory', 'addCameras', 'addProduct']} intro="Multi-field and multi-step records open in an xl (820px) slide panel (Add New Factory, Add Product); one compact step over a running flow opens a 720px modal (Add Cameras). Two or three equal columns 20px apart, rows 40px apart; pickers, uploads and notes take a full row. Sections start with a title over a divider. Footer: Back / Cancel at the start; helper note and the primary at the end. Validate on submit, then focus the first invalid field.">
      <DocSection id="containers" title="Containers">
        <div className="ds-cluster">
          <Button leading={Plus} onClick={() => setPanel(true)}>Slide panel (Add Product)</Button>
          <Button variant="secondary" onClick={() => setModal(true)}>Modal (Add Cameras)</Button>
        </div>
      </DocSection>
      <DocSection id="inline" title="Inline edit [EXTENSION]" description="Enter saves, Escape cancels.">
        <Preview surface="card">
          {editing
            ? <TextInput autoFocus aria-label="Line name" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setTitle(draft); setEditing(false); toast('Line renamed'); } if (e.key === 'Escape') { setDraft(title); setEditing(false); } }} />
            : <span className="ds-cluster"><span className="ds-text-card-title">{title}</span><Button variant="ghost" size="sm" leading={Edit} onClick={() => { setDraft(title); setEditing(true); }}>Rename line</Button></span>}
        </Preview>
      </DocSection>
      <SlidePanel open={panel} onClose={() => setPanel(false)} title="Add Product" size="xl" icon={<Illustration name="illus.catalog-item" size={36} />}
        footer={<><Button variant="secondary" leading={ArrowBack} onClick={() => setPanel(false)}>Cancel</Button>
          <div className="ds-panel__footer-end"><p className="ds-panel__note" role="status">Auto-saved draft 12s ago</p><Button trailing={ChevronRight} minWidth onClick={() => { setPanel(false); toast('Product saved'); }}>Save product</Button></div></>}>
        <div className="ds-form-grid">
          <Field label="Product Name" required className="ds-span-all"><TextInput placeholder="Enter product name" /></Field>
          <Field label="Product Barcode" required><TextInput inputMode="numeric" /></Field>
          <Field label="CLD Barcode" required><TextInput inputMode="numeric" /></Field>
          <Field label="Notes (optional)" className="ds-span-all"><Textarea placeholder="Enter any note as necessary" /></Field>
        </div>
      </SlidePanel>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Cameras" icon={<Illustration name="illus.camera" size={32} />}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Skip</Button><Button minWidth onClick={() => { setModal(false); toast('Camera added'); }}>Add Camera</Button></>}>
        <div className="ds-form-grid">
          <Field caps label="Camera ID" required><TextInput placeholder="e.g. - CAM01 - L01" /></Field>
          <Field caps label="Camera IP" required><TextInput placeholder="e.g. - 192.168.1.101" inputMode="decimal" /></Field>
        </div>
      </Modal>
    </Page>
  );
}

export function DetailLayout() {
  const f = FACTORIES[0];
  const line = SITES[0].lines[0];
  return (
    <Page refs={['6.8']} apps={[]} intro="[PRESERVED] Back button + record name in the header, record actions at the end, then a summary strip, then child records. Not drawn in the eight screens: this is where “View factory” on a Factories card would lead. Variant: a two-column layout with a 320–360px properties card on wide screens [EXTENSION].">
      <Frame label="Detail page">
        <PageHeader title={f.name} back={{ label: 'Factories', onBack: () => {} }} actions={<Button variant="secondary" leading={Edit}>Edit factory</Button>} />
        <div className="ds-page-content doc-frame__content">
          <SummaryStrip eyebrow={f.city} title={f.name} fields={[{ label: 'Lines active', value: `${f.lines} / ${f.linesOf}` }, { label: 'Cameras', value: String(f.cameras) }]} statuses={[{ label: 'Status', tone: f.status.tone, value: f.status.label }]} />
          <div className="doc-detail-cols">
            <TableCard title={`${line.name} cameras`} titleId="dl-t" count={line.cameras.length}><DataTable caption={`${line.name} cameras`} labelledBy="dl-t" rowHeader="name" rowKey={c => c.id} rows={line.cameras} columns={camCols} /></TableCard>
            <section className="ds-dash-card doc-props" aria-label="Properties"><span className="ds-text-card-title">Properties</span>
              <dl className="app-review">{[['Location', f.city], ['Factory Admin', f.admin], ['Cameras', String(f.cameras)]].map(([k, v]) => <div key={k}><dt className="ds-field__label">{k}</dt><dd className="ds-text-body">{v}</dd></div>)}</dl>
              <Status tone={f.status.tone}>{f.status.label}</Status></section>
          </div>
        </div>
      </Frame>
    </Page>
  );
}

export function ModalWorkflowLayout() {
  const [step, setStep] = useState<'idle' | 'panel' | 'confirm'>('idle');
  const [name, setName] = useState('');
  return (
    <Page refs={['5.44', '5.45', '5.55']} apps={['addFactory', 'addCameras', 'cameras']} intro="Create → delete with the overlay contract: the scrim covers the whole shell (R-12), focus moves in and is trapped, the rest is inert, backdrop clicks never close, Escape asks before discarding edits, destructive actions confirm with Cancel focused, success shows a toast (with Undo when reversible), and focus returns to the opener.">
      <Preview surface="card">
        <div className="ds-cluster">
          <Button leading={Plus} onClick={() => setStep('panel')}>Add Line</Button>
          <Button variant="danger" onClick={() => setStep('confirm')}>Delete camera</Button>
        </div>
      </Preview>
      <SlidePanel open={step === 'panel'} onClose={() => { setStep('idle'); setName(''); }} title="Add Line" size="sm" dirty={!!name} icon={<Illustration name="illus.conveyor-line" size={36} />}
        footer={<><Button variant="secondary" leading={ArrowBack} onClick={() => { setStep('idle'); setName(''); }}>Cancel</Button><Button onClick={() => { setStep('idle'); toast(`${name || 'Line'} added`, { action: { label: 'Undo', onAction: () => toast('Line removed') } }); setName(''); }}>Add Line</Button></>}>
        <Field label="Line name" required><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Type, then press Escape" /></Field>
      </SlidePanel>
      <ConfirmDialog open={step === 'confirm'} title="Delete camera?" message="Line 1 • Camera 1 will stop sending frames and be removed from Line 1." confirmLabel="Delete" onCancel={() => setStep('idle')} onConfirm={() => { setStep('idle'); toast('Line 1 • Camera 1 deleted'); }} />
    </Page>
  );
}

import { useState } from 'react';
import { Activity, Cctv, Cpu } from 'lucide-react';
import { DashCard, EntityCard, FieldList, HealthRow, KpiCard, MediaCard, PanelCard, StatusCard, SummaryStrip } from '../../components/ds/Cards';
import { Badge, IconTile, Illustration } from '../../components/ds/Display';
import { MediaViewer } from '../../components/ds/Overlay';
import { DataTable } from '../../components/ds/Table';
import { Select } from '../../components/ds/Select';
import { Tabs } from '../../components/ds/Nav';
import { toast } from '../../components/ds/Toast';
import { BarChart, LineChart } from '../../charts/Charts';
import { Legend } from '../../charts/core';
import { Camera, Package, QrCode } from '../../components/ds/figmaIcons';
import { Cell, Grid } from '../kit';
import type { ComponentDoc } from '../ComponentPage';
import { CAMERA_STATUS, FACTORIES, LINE_DEFECTS, LIVE, QUALITY, utilTone, type Factory } from '../../apps/vision/data';

const ICON = {
  factory: <Illustration name="illus.facility-set" crop="factory" size={52} />,
  active: <Illustration name="illus.facility-set" crop="factory-active" size={52} />,
  lines: <Illustration name="illus.conveyor-line" crop="conveyor" size={52} />,
  cameras: <Illustration name="illus.facility-set" crop="camera-zoom" size={52} />,
};

function KpiRow() {
  const [active, setActive] = useState<string | null>(null);
  const items = [
    { k: 'total', label: 'Total Factories', value: String(FACTORIES.length), icon: ICON.factory },
    { k: 'active', label: 'Active Factories', value: String(FACTORIES.filter(f => f.status.label === 'Active').length), icon: ICON.active },
    { k: 'lines', label: 'Total Lines', value: '28', icon: ICON.lines },
    { k: 'cams', label: 'Cameras Online', value: '96 / 112', icon: ICON.cameras },
  ];
  return (
    <div className="ds-kpi-row doc-full">
      {items.map(i => <KpiCard key={i.k} label={i.label} value={i.value} icon={i.icon} pressed={active === i.k} onToggle={() => setActive(a => (a === i.k ? null : i.k))} />)}
    </div>
  );
}

export const kpiDoc: ComponentDoc = {
  path: '/components/kpi-cards', title: 'KPI Cards', refs: ['5.23'], provenance: 'OBSERVED',
  summary: 'One headline metric (DEOC KPICard, every page): gradient-glass-kpi, radius 24, padding 16, shadow-glass + shadow-kpi-lift, a 1px edge (shadow-edge, white/2%); a 40px 3D illustration, 12px gap, kpi-label (12/16 700 uppercase +0.55, text-muted) directly over kpi-value (20/28 700 −0.65, tabular); both truncate on one line. Rows of 3–6 cards, 16px apart; below 1280px the row becomes an auto-fill grid of ≥ 260px cards.',
  preview: () => <KpiRow />,
  variants: () => (
    <Grid min={300}>
      <Cell label="static · sprite crop (factory)"><KpiCard label="Total Factories" value="6" icon={ICON.factory} /></Cell>
      <Cell label="static · single illustration"><KpiCard label="Defect %" value="4%" icon={<Illustration name="illus.defect-rate" size={52} />} /></Cell>
      <Cell label="static · icon-tile fallback" note="Only when no illustration exists (§2.11-D)"><KpiCard label="Devices Online" value="28/28" icon={<IconTile icon={Cpu} />} /></Cell>
      <Cell label="status ball [EXTENSION]"><KpiCard label="Devices Online" value="28/28" icon={ICON.cameras} ball="success" /></Cell>
      <Cell label="delta line [EXTENSION]" note="Every card in the row must then show one"><KpiCard label="Defect %" value="4%" icon={<Illustration name="illus.defect-rate" size={52} />} delta={{ dir: 'down', text: '0.6% vs last week' }} /></Cell>
      <Cell label="toggle · pressed [EXTENSION]"><KpiCard label="Active Factories" value="4" icon={ICON.active} pressed onToggle={() => {}} /></Cell>
    </Grid>
  ),
  states: () => (
    <Grid min={300}>
      <Cell label="toggle · hover (brightness 1.1)"><KpiCard label="Total Lines" value="28" icon={ICON.lines} onToggle={() => {}} className="is-hover" /></Cell>
      <Cell label="toggle · focus-visible"><KpiCard label="Total Lines" value="28" icon={ICON.lines} onToggle={() => {}} className="is-focus-visible" /></Cell>
      <Cell label="long label and value wrap"><div className="doc-narrow-lg"><KpiCard label="Average Changeover Time" value="12 h 45 min" icon={ICON.lines} /></div></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <div className="doc-narrow-xl"><KpiCard label="Cameras Online" value="96 / 112" icon={ICON.cameras} delta={{ dir: 'up', text: '4 more than yesterday' }} /></div>,
    parts: [
      { part: 'container', label: 'Container', spec: 'min-height 76 · padding 16 · radius 24 (radius-panel) · gradient-glass-kpi · shadow-glass + shadow-kpi-lift + shadow-edge · 12px icon → text' },
      { part: 'icon', label: 'Illustration', spec: '52×52 (size-kpi-icon), decorative; exact Figma crop of the sprite (§2.11-B)' },
      { part: 'label', label: 'Label', spec: 'kpi-label 14/16 700 UPPERCASE +0.55 text-muted; wraps, never truncated' },
      { part: 'value', label: 'Value', spec: 'kpi-value 20/28 700 −0.65 text-primary, tabular numbers; directly below the label' },
      { part: 'delta', label: 'Delta line [EXTENSION]', spec: '12/16; success-text (up) / danger-text (down)' },
    ],
  },
  spec: [
    { property: 'Background', token: '--ds-gradient-glass-kpi' }, { property: 'Edge / lift', token: '--ds-shadow-edge + --ds-shadow-kpi-lift' },
    { property: 'Radius', token: '--ds-radius-panel' }, { property: 'Padding', token: '--ds-space-card-xl' }, { property: 'Shadow', token: '--ds-shadow-glass' },
    { property: 'Min height', token: '--ds-size-kpi-card' }, { property: 'Icon', token: '--ds-size-kpi-icon' }, { property: 'Icon → text gap', token: '--ds-space-4' },
    { property: 'Label', token: '--ds-color-text-muted', note: ' kpi-label 14/16 700, +0.55px, uppercase' }, { property: 'Label → value gap', token: '--ds-space-1-5' },
    { property: 'Value', token: '--ds-font-size-heading + --ds-color-text-primary', note: ' kpi-value 20/28 700, −0.65px' },
    { property: 'Row gap', token: '--ds-space-grid-lg' }, { property: 'Pressed ring', token: '--ds-color-brand', note: ' inset 1px' }, { property: 'Toggle hover', value: 'filter: brightness(1.1)' },
    { property: 'Status ball', token: '--ds-color-success-glow + --ds-color-danger + --ds-color-surface-base', note: ' 14px, 2px ring' },
    { property: 'Delta', token: '--ds-color-success-text + --ds-color-danger-text' },
  ],
  behavior: <ul className="doc-list"><li>Static cards are plain containers; the toggle variant is a <code>&lt;button aria-pressed&gt;</code> that filters the page, so its accessible name is the label plus the value.</li><li>The illustration and status ball are decorative (<code>aria-hidden</code>); a ball always repeats information the value already gives.</li><li>Labels and values wrap and are never truncated (§2.3).</li></ul>,
  playground: {
    controls: [
      { kind: 'text', key: 'label', label: 'Label' }, { kind: 'text', key: 'value', label: 'Value' },
      { kind: 'select', key: 'icon', label: 'Icon', options: ['factory crop', 'conveyor crop', 'camera crop', 'icon tile (fallback)'] },
      { kind: 'select', key: 'ball', label: 'Status ball', options: ['none', 'success', 'error'] },
      { kind: 'bool', key: 'interactive', label: 'Toggle (button)' }, { kind: 'bool', key: 'delta', label: 'Delta line' },
    ],
    initial: { label: 'Total Factories', value: '6', icon: 'factory crop', ball: 'none', interactive: false, delta: false },
    render: p => <PlayKpi {...p} />,
    code: p => `<KpiCard label="${p.label}" value="${p.value}" icon={${p.icon === 'icon tile (fallback)' ? '<IconTile icon={Cpu} />' : `<Illustration name="illus.${p.icon === 'conveyor crop' ? 'conveyor-line' : 'facility-set'}" crop="${p.icon === 'factory crop' ? 'factory' : p.icon === 'conveyor crop' ? 'conveyor' : 'camera-zoom'}" size={52} />`}}${p.ball !== 'none' ? ` ball="${p.ball}"` : ''}${p.delta ? ` delta={{ dir: 'up', text: '…' }}` : ''}${p.interactive ? ' pressed={on} onToggle={toggle}' : ''} />`,
  },
  usage: `<div className="ds-kpi-row">\n  <KpiCard label="Total Factories" value={6} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} />\n</div>`,
};
function PlayKpi(p: Record<string, string | boolean>) {
  const [on, setOn] = useState(false);
  const icon = p.icon === 'icon tile (fallback)' ? <IconTile icon={Cpu} /> : p.icon === 'conveyor crop' ? ICON.lines : p.icon === 'camera crop' ? ICON.cameras : ICON.factory;
  return (
    <div className="doc-narrow-xl">
      <KpiCard label={String(p.label)} value={String(p.value)} icon={icon}
        ball={p.ball === 'none' ? undefined : p.ball as 'success'} delta={p.delta ? { dir: 'up', text: '4 more than yesterday' } : undefined}
        pressed={on} onToggle={p.interactive ? () => setOn(o => !o) : undefined} />
    </div>
  );
}

/** One Figma "Factory List" card from the Vision Automation data. */
const entity = (f: Factory, over: Partial<Parameters<typeof EntityCard>[0]> = {}) => (
  <EntityCard title={f.name} location={f.city} status={f.status} icon={<Illustration name="illus.facility-set" crop="factory" size={40} />}
    metric={{ value: f.lines, of: f.linesOf, unit: 'lines active', tone: utilTone(f) }} meta={{ text: `${f.cameras} cameras` }} owner={f.admin} role="Factory Admin"
    actionLabel="View factory" onAction={() => toast(`Opens ${f.name}`)} {...over} />
);
const [F1, F2, , , F5] = FACTORIES;
export const entityDoc: ComponentDoc = {
  path: '/components/standard-cards', title: 'Standard Cards (Entity Card)', refs: ['5.24'], provenance: 'OBSERVED',
  summary: 'One record in a browsable grid (Figma "Factory List"): gradient-glass, radius 16, padding 24, shadow-surface (shadow-glass + a 1px edge), sections 20px apart. Edges are 25% fainter than the Figma border (D-8). Header: 40px icon (no tile) + card-title name + location, glass status pill at the end; metric well (surface-nested, radius 12, padding 16) with "6 / 6 lines active", a camera count and a 4px progress bar; footer: 32px neutral avatar, owner and role, subtle "View factory" button. The card itself is not interactive; status changes only the pill and the bar tone.',
  preview: () => <div className="ds-entity-grid doc-full">{FACTORIES.slice(0, 3).map(f => <div key={f.id}>{entity(f)}</div>)}</div>,
  variants: () => (
    <Grid min={420}>
      <Cell label="active">{entity(F1)}</Cell>
      <Cell label="warning" note="Bar uses the stopped colour below 75% of lines active [PRODUCT DECISION]">{entity(F2)}</Cell>
      <Cell label="offline (empty track)">{entity(F5)}</Cell>
    </Grid>
  ),
  states: () => <Grid min={420}><Cell label="action hover"><div className="doc-force-hover">{entity(F1)}</div></Cell><Cell label="long name wraps">{entity(F1, { title: 'Haridwar Personal Care Manufacturing Unit 2' })}</Cell></Grid>,
  anatomy: {
    render: () => <div className="doc-narrow-xxl">{entity(F1)}</div>,
    parts: [
      { part: 'container', label: 'Container', spec: 'padding 24 · radius 16 (radius-card) · gradient-glass · 1px border-glass (white/3%) · shadow-glass · sections 20 apart' },
      { part: 'header', label: 'Header', spec: '40px icon, no tile (D-9) + 12px + card-title 24/24 600 −0.4; 4px below, 14px location glyph + 14/16 text-muted; glass status pill at the end' },
      { part: 'metrics', label: 'Metric well', spec: 'surface-nested · radius 12 (radius-track) · padding 16 · gap 8: metric-value 24/32 700 + 6px + metric-denominator 14/20 text-muted; 14px video glyph + count in text-muted at the end; 4px progress bar (§5.34)' },
      { part: 'person', label: 'Footer', spec: '32px neutral avatar · 10px · owner 16/22 500 text-secondary over role 12/16 link; subtle "View factory" button with a trailing chevron' },
    ],
  },
  spec: [
    { property: 'Fill', token: '--ds-gradient-glass' }, { property: 'Border', token: '--ds-color-border-glass' }, { property: 'Padding', token: '--ds-space-card-entity' },
    { property: 'Radius', token: '--ds-radius-card' }, { property: 'Shadow', token: '--ds-shadow-glass' }, { property: 'Section gap', token: '--ds-space-card-gap' },
    { property: 'Icon', token: '--ds-size-entity-icon' },
    { property: 'Name', token: '--ds-font-size-title', note: ' card-title 24/24 600, −0.4px' }, { property: 'Location', token: '--ds-color-text-muted', note: ' 14/16' },
    { property: 'Well', token: '--ds-color-surface-nested + --ds-radius-track + --ds-space-4' },
    { property: 'Progress track / healthy fill', token: '--ds-color-track + --ds-gradient-progress-success', note: ' 4px' },
    { property: 'Owner / role', token: '--ds-color-text-secondary + --ds-color-link', note: ' 16/22 500 · 12/16' },
    { property: 'Grid gap', token: '--ds-space-grid-lg', note: ' columns min 400px' },
  ],
  behavior: <ul className="doc-list"><li>An <code>&lt;article&gt;</code> with the name as a heading (<code>headingLevel</code>, h3 by default); the card is not a link or button.</li><li>The footer button opens the record; its accessible name includes the record ("View factory: Factory 1").</li><li>The metric reads as one phrase ("6 of 6 lines active"); the bar is a labelled <code>progressbar</code>. The status is always spelled out in the pill, never colour alone.</li></ul>,
  usage: `<div className="ds-entity-grid">\n  <EntityCard title="Factory 1" location="Mumbai, MH" status={{ tone: 'success', label: 'Active' }} icon={<Illustration name="illus.facility-set" crop="factory" size={40} />}\n    metric={{ value: 6, of: 6, unit: 'lines active', tone: 'success' }} meta={{ text: '24 cameras' }} owner="Rahul Sharma" role="Factory Admin"\n    actionLabel="View factory" onAction={open} />\n</div>`,
};

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
const QUALITY_SERIES = [{ key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)' }, { key: 'bad', label: 'Bad Products', color: 'var(--ds-chart-negative)' }];
function DashDemo() {
  const [view, setView] = useState<'factory' | 'time'>('factory');
  return (
    <DashCard title="Quality Snapshot" right={<>
      <Legend items={QUALITY_SERIES} />
      <Tabs size="sm" idBase="dashdemo" label="Quality view" value={view} onChange={setView} tabs={[{ value: 'time', label: 'Time Series' }, { value: 'factory', label: 'Factory Wise' }]} />
    </>}>
      {view === 'factory'
        ? <BarChart label="Good and bad products by factory with defect rate" height={240} series={QUALITY_SERIES}
            data={QUALITY.map(d => ({ x: d.x, values: { good: d.good, bad: d.bad } }))} trend={{ label: 'Defect rate', values: QUALITY.map(d => d.rate), format: v => `${v}%` }} />
        : <LineChart label="Good and bad products per week" height={240} x={WEEKS}
            series={[{ ...QUALITY_SERIES[0], values: [218, 224, 230, 226, 231, 228, 236, 234].map(v => v * 1000) }, { ...QUALITY_SERIES[1], values: [21, 19, 18, 20, 17, 18, 16, 18].map(v => v * 1000) }]} />}
    </DashCard>
  );
}
export const dashCardDoc: ComponentDoc = {
  path: '/components/dashboard-card', title: 'Dashboard Card', refs: ['5.25'], provenance: 'OBSERVED',
  summary: 'The container for a chart, matrix, heatmap or table (DEOC dashboard: "Quality Snapshot", "Defect Distribution", "Line - Product Defect Matrix"): gradient-glass, radius 16, padding 24, the content-card surface (shadow-surface). Title row min 40px high with card-title 20/24 600, an optional 14/20 text-chart-subtle subtitle 5px below and controls (legend, filters, accent tabs) 20px apart at the end; 20px to the content. Flush puts a table edge-to-edge under a border-subtle line.',
  preview: () => <div className="doc-full"><DashDemo /></div>,
  variants: () => (
    <Grid min={360}>
      <Cell label="padded (charts)"><DashCard title="Defect Distribution" subtitle="Share of defects by inspection point"><div className="doc-placeholder">Chart area</div></DashCard></Cell>
      <Cell label="flush (tables / heatmaps)"><DashCard flush title="Line Wise Defects" right={<Select variant="filter" label="Rows" value="p" onChange={() => {}} options={[{ value: 'p', label: 'Products' }]} className="ds-select--180" searchable={false} />}>
        <DataTable variant="compact" caption="Line wise defects" rowHeader="line" rowKey={r => r.line + r.product} rows={LINE_DEFECTS.slice(0, 3)} columns={[{ key: 'line', header: 'Line' }, { key: 'factory', header: 'Factory' }, { key: 'total', header: 'Total defect %', align: 'center', render: r => `${r.total}%` }]} />
      </DashCard></Cell>
    </Grid>
  ),
  spec: [{ property: 'Fill', token: '--ds-gradient-glass' }, { property: 'Shadow / edge', token: '--ds-shadow-surface' }, { property: 'Radius', token: '--ds-radius-card' }, { property: 'Padding', token: '--ds-space-card-xl' },
    { property: 'Title row min height', token: '--ds-size-control' }, { property: 'Title', token: '--ds-font-size-title + --ds-tracking-card-title', note: ' card-title 24/24 600' },
    { property: 'Subtitle', token: '--ds-color-text-chart-subtle', note: ' 14/20, 5px below the title' }, { property: 'Controls gap', token: '--ds-space-5' },
    { property: 'Header ↔ content gap', token: '--ds-space-chart-gap' }, { property: 'Flush divider', token: '--ds-color-border-divider' }, { property: 'Side-by-side gap', token: '--ds-space-grid-lg' }],
  behavior: <ul className="doc-list"><li>A <code>&lt;section aria-labelledby&gt;</code> named by its <code>h2</code> title.</li><li>View switches use sm segmented tabs without a <code>TabPanel</code> (the chart re-renders in place); charts carry their own accessible label and data table (§7).</li><li>Loading and empty states follow §5.50 / §5.51.</li></ul>,
  usage: `<DashCard title="Quality Snapshot" right={<><Legend items={…} /><Tabs size="sm" … /></>}>\n  <BarChart … />\n</DashCard>`,
};

export const statusCardDoc: ComponentDoc = {
  path: '/components/status-card', title: 'Status Card', refs: ['5.26'], provenance: 'OBSERVED',
  summary: 'Running vs stopped units (Figma "Line Status", "Camera Status", "Device Status"): laid out like an entity card (padding 24, parts 20px apart, entity-card surface) whose header holds the title and a swatch legend with counts ("Running 123", "Stopped 5"); a 40px segmented bar (§5.34 lg); then a compact grid table in a surface-nested well (radius 12) (§5.41) of the stopped units under a divider.',
  preview: () => (
    <div className="doc-narrow-xxl">
      <StatusCard title="Camera Status" running={CAMERA_STATUS.running} stopped={CAMERA_STATUS.stopped}>
        <DataTable variant="grid" caption="Offline cameras" rowHeader="camera" rowKey={r => r.camera} rows={CAMERA_STATUS.rows.slice(0, 3)}
          columns={[{ key: 'camera', header: 'Camera ID' }, { key: 'line', header: 'Line' }, { key: 'factory', header: 'Factory' }, { key: 'since', header: 'Offline since', align: 'center' }]} />
      </StatusCard>
    </div>
  ),
  spec: [{ property: 'Card padding / gap', token: '--ds-space-card-entity + --ds-space-card-gap' }, { property: 'Running / stopped', token: '--ds-chart-running + --ds-chart-stopped' },
    { property: 'Legend swatch', token: '--ds-radius-xs', note: ' 24 × 16' }, { property: 'Legend label / count', token: '--ds-color-text-secondary + --ds-color-text-muted', note: ' 14/22 500' },
    { property: 'Bar height / radius', token: '--ds-size-control + --ds-radius-track' }, { property: 'Table well', token: '--ds-color-surface-nested + --ds-radius-track' }, { property: 'Table dividers', token: '--ds-color-border-divider' }],
  behavior: <ul className="doc-list"><li>The legend spells out both counts as text; the segmented bar is <code>role="img"</code> with an <code>aria-label</code> listing every count.</li><li>The table follows §5.41 (caption, row headers).</li></ul>,
  usage: `<StatusCard title="Camera Status" running={123} stopped={5}>\n  <DataTable variant="grid" … />\n</StatusCard>`,
};

export const stripDoc: ComponentDoc = {
  path: '/components/summary-strip', title: 'Summary Strip & Side-Panel Cards', refs: ['5.35'], provenance: 'OBSERVED',
  summary: 'Identify the record in context (Figma Live View side panel). Stacked "Running SKU Card": eyebrow 12/18 +0.55 in link after an 8px brand dot, summary-title 20/28 700 −0.5. Companion side-panel cards (gradient-glass, 1px white/5% border, radius 16, padding 20, shadow-glass, gap 16) hold a section label (11/16 700 uppercase, text-tertiary), a field list (12/16 500 labels over 18/24 +0.55 identifier values, border-faint dividers) or system-health rows (20px icon tile + 14px label, tinted status pill). The inline layout keeps fields beside the title [PRESERVED].',
  preview: () => (
    <div className="doc-narrow-lg doc-stack">
      <SummaryStrip layout="stacked" eyebrow={LIVE.line} title={LIVE.sku} />
      <PanelCard label="Reference Barcodes"><FieldList items={LIVE.barcodes} /></PanelCard>
      <PanelCard label="System Health">
        <HealthRow icon={Activity} label="Production Line" status={{ tone: 'error', label: 'Stopped' }} />
        <HealthRow icon={Cctv} label="Cameras" status={{ tone: 'success', label: 'Active' }} />
        <HealthRow icon={Cpu} label="Devices" status={{ tone: 'success', label: 'Active' }} />
      </PanelCard>
    </div>
  ),
  variants: () => (
    <Grid min={420}>
      <Cell label="stacked (side panel)"><SummaryStrip layout="stacked" eyebrow={LIVE.line} title={LIVE.sku} /></Cell>
      <Cell label="inline with fields [PRESERVED]"><SummaryStrip eyebrow={LIVE.line} title={LIVE.sku} fields={LIVE.barcodes.slice(0, 1)} statuses={[{ label: 'Line', tone: 'error', value: 'Stopped' }]} /></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <div className="doc-narrow-lg"><SummaryStrip layout="stacked" eyebrow={LIVE.line} title={LIVE.sku} /></div>,
    parts: [{ part: 'container', label: 'Container', spec: 'padding 20 (space-card) · radius 16 · gradient-glass · 1px border-faint (white/5%) · shadow-glass · gap 12 (stacked)' },
      { part: 'lead', label: 'Lead block', spec: 'eyebrow 12/18 +0.55 link after an 8px brand dot; summary-title 20/28 700 −0.5, 2-line clamp with a tooltip' }],
  },
  spec: [{ property: 'Padding', token: '--ds-space-card' }, { property: 'Radius', token: '--ds-radius-card' }, { property: 'Fill / border / shadow', token: '--ds-gradient-glass + --ds-color-border-faint + --ds-shadow-glass' },
    { property: 'Eyebrow / dot', token: '--ds-color-link + --ds-size-status-dot-sm', note: ' 12/18 +0.55' }, { property: 'Title', token: '--ds-font-size-heading', note: ' summary-title 20/28 700' },
    { property: 'Side-panel card gap', token: '--ds-space-4' }, { property: 'Section label', token: '--ds-color-text-tertiary', note: ' 11/16 700 uppercase +0.55' },
    { property: 'Field label / value', token: '--ds-color-text-tertiary + --ds-color-text-primary', note: ' 12/16 500 · 18/24 +0.55' }, { property: 'Field divider', token: '--ds-color-border-faint' },
    { property: 'Health tile', token: '--ds-color-surface-icon-tile + --ds-radius-chip', note: ' 20px, 12px glyph' }],
  behavior: <ul className="doc-list"><li>Each card is a <code>&lt;section&gt;</code> labelled by its title / section label; identifiers are a <code>&lt;dl&gt;</code>.</li><li>A clamped title is focusable and shows the full text in a tooltip only when it is actually truncated.</li><li>Health rows repeat the state in the pill text; the icon tiles are decorative.</li></ul>,
  usage: `<SummaryStrip layout="stacked" eyebrow="Bottle Line 3" title={sku} />\n<PanelCard label="Reference Barcodes"><FieldList items={barcodes} /></PanelCard>\n<PanelCard label="System Health"><HealthRow icon={Activity} label="Production Line" status={{ tone: 'error', label: 'Stopped' }} /></PanelCard>`,
};

const MEDIA_ICON = [Camera, QrCode, Package, Package];
function MediaDemo() {
  const [open, setOpen] = useState<number | null>(null);
  const v = open === null ? null : LIVE.cameras[open];
  return (
    <>
      <div className="ds-media-grid doc-full">
        {LIVE.cameras.map((c, k) => <MediaCard key={c.title} title={c.title} sub={c.sub} src={c.src} icon={MEDIA_ICON[k]} status={c.status}
          detected={c.detected} detectedError={'error' in c} frame={'error' in c ? { left: '36%', top: '31%', width: '54%', height: '39%' } : undefined} onOpen={() => setOpen(k)} />)}
      </div>
      {v && <MediaViewer open onClose={() => setOpen(null)} title={v.title} sub={v.sub} src={v.src} badge={<Badge tone={v.status.tone}>{v.status.label}</Badge>} />}
    </>
  );
}
export const mediaDoc: ComponentDoc = {
  path: '/components/media-card', title: 'Media Card (Camera Tile) & Viewer', refs: ['5.36'], provenance: 'OBSERVED',
  summary: 'A live camera tile (DEOC CameraPanel): radius 24, clipped, a 1px transparent border (brand/40% on hover), gradient-glass, shadow-glass and a 1px edge (shadow-edge) drawn above the feed. Header and footer bars show the card colour (padding 14 24 15 / 14 24), with a border-track divider under the header; the header holds a 28px icon tile (brand-tint-10, 1px brand-tint-20, radius 12), media-title 20/26 600 −0.25 (16px on tiles under 420px), a tinted status pill and a 16px expand glyph. The feed sits on surface-media at 50% opacity; the footer reads "Detected : " + italic value (danger-text on failed reads). Expand opens the viewer (radius 32, 2px detection frame with a glow). Tiles sit 2 per row, 16px apart, one per row below 1024px.',
  preview: () => <MediaDemo />,
  spec: [{ property: 'Radius / fill / shadow', token: '--ds-radius-panel + --ds-gradient-glass + --ds-shadow-glass' }, { property: 'Edge (::after)', token: '--ds-shadow-edge' },
    { property: 'Bar padding', token: '--ds-space-3-5 + --ds-space-6' }, { property: 'Header divider', token: '--ds-color-border-edge' },
    { property: 'Icon tile', token: '--ds-size-media-icon + --ds-color-brand-tint-10 + --ds-color-brand-tint-20 + --ds-radius-track' },
    { property: 'Title', token: '--ds-font-size-heading + --ds-tracking-media-title', note: ' media-title 20/24 600' }, { property: 'Camera name', token: '--ds-color-text-muted', note: ' 14/16' },
    { property: 'Expand glyph', token: '--ds-color-icon', note: ' 16px' }, { property: 'Media well', token: '--ds-color-surface-media', note: ' image opacity 0.5' },
    { property: 'Detection frame', token: '--ds-border-width-detect + --ds-color-danger' }, { property: 'Detail / failed read', token: '--ds-color-text-secondary + --ds-color-danger-text', note: ' media-detail 14/16 600, value italic 400' },
    { property: 'Grid gap', token: '--ds-space-grid' }, { property: 'Viewer shadow', token: '--ds-shadow-modal', note: ' width min(90vw, 960px)' }],
  behavior: <ul className="doc-list"><li>Each tile is an <code>&lt;article&gt;</code> labelled by its title; the feed image has a text alternative and the detection frame is decorative.</li><li>The expand button is named "Expand {'{title}'}"; the viewer is a modal dialog (§5.44) with focus on its close button, Escape to close, and focus returned to the expand button.</li><li>The inspection result is always spelled out in the pill and the footer, never by the frame colour alone.</li></ul>,
  notes: <p className="ds-text-body-muted">Feeds are the sample frames exported from the Figma file (feed-*.png). Positive detection frames are part of the source images.</p>,
  usage: `<MediaCard title="Front Label Match" sub="Camera 1" src={url} icon={Camera} status={{ tone: 'success', label: 'Matched' }}\n  detected="“nourishing bodywash”" onOpen={open} />\n<MediaViewer open={open} onClose={close} title="Front Label Match" sub="Camera 1" src={url} badge={<Badge tone="success">Matched</Badge>} />`,
};

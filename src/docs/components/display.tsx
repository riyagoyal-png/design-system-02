import { useState } from 'react';
import { Avatar, Badge, Callout, Chip, CountPill, Dot, EmptyState, Illustration, InlineAlert, Metric, Progress, SegBar, Skeleton, Status, Stepper, Tag, TAG_ORDER } from '../../components/ds/Display';
import { Button, Spinner } from '../../components/ds/Button';
import { KpiCard } from '../../components/ds/Cards';
import { DataTable } from '../../components/ds/Table';
import { Plus } from '../../components/ds/figmaIcons';
import { Cell, Grid } from '../kit';
import type { ComponentDoc } from '../ComponentPage';
import { ROLES, ROLE_COLOR, USER, fmtIN } from '../../apps/vision/data';

const LABEL = { success: 'Active', warning: 'Warning', error: 'Stopped', info: 'Scheduled', neutral: 'Draft' } as const;

export const badgeDoc: ComponentDoc = {
  path: '/components/badges', title: 'Badges', refs: ['5.27'], provenance: 'OBSERVED',
  summary: 'A labelled status pill for one record (Active, Warning, Stopped, Offline). Text always names the state; the dot glows only at md. Two appearances: tinted (component default) and glass (table and card instances, R-14). Never interactive, never truncated.',
  preview: () => <div className="ds-cluster"><Badge tone="success">Active</Badge><Badge tone="warning">Warning</Badge><Badge tone="error">Stopped</Badge><Badge tone="success" appearance="glass">Active</Badge><Badge tone="error" appearance="glass">Offline</Badge></div>,
  variants: () => (
    <Grid min={160}>
      {(['success', 'warning', 'error', 'info', 'neutral'] as const).flatMap(t => [
        <Cell key={t} label={`${t} · tinted${t === 'info' || t === 'neutral' ? ' [EXT]' : ''}`}><Badge tone={t}>{LABEL[t]}</Badge></Cell>,
        <Cell key={t + 'g'} label={`${t} · glass`}><Badge tone={t} appearance="glass">{LABEL[t]}</Badge></Cell>,
        <Cell key={t + 'sm'} label={`${t} · sm`}><Badge tone={t} size="sm">{LABEL[t]}</Badge></Cell>,
      ])}
    </Grid>
  ),
  unsupported: ['clickable / removable badges', 'count badges on icons'],
  anatomy: { render: () => <Badge tone="success">Active</Badge>, parts: [{ part: 'container', label: 'Pill', spec: 'padding 4 12 · 1px tone border · radius full · gap 6 (glass: gradient-glass, border-glass, shadow-control)' }, { part: 'dot', label: 'Dot', spec: '6px, no glow (glass error dot: danger + glow)' }, { part: 'label', label: 'Label', spec: '14/20 600 in the tone text colour (danger-text for errors, R-04)' }] },
  spec: [
    { property: 'Padding md / sm', token: '--ds-space-1 + --ds-space-2-5', note: ' · sm 2 8' },
    { property: 'Dot', token: '--ds-size-badge-dot' },
    { property: 'Radius', token: '--ds-radius-full' },
    { property: 'Success bg / border / text', token: '--ds-color-success-bg + --ds-color-success-border + --ds-color-success-text' },
    { property: 'Error bg / border / text', token: '--ds-color-danger-bg + --ds-color-danger-border + --ds-color-danger-text' },
    { property: 'Glass appearance', token: '--ds-gradient-glass + --ds-color-border-glass + --ds-shadow-control' },
    { property: 'Glow (success / warning / error)', token: '--ds-shadow-status-success + --ds-shadow-status-warning + --ds-shadow-status-error' },
  ],
  playground: {
    controls: [{ kind: 'select', key: 'tone', label: 'Tone', options: ['success', 'warning', 'error', 'info', 'neutral'] }, { kind: 'select', key: 'appearance', label: 'Appearance', options: ['tinted', 'glass'] }, { kind: 'select', key: 'size', label: 'Size', options: ['md', 'sm'] }, { kind: 'text', key: 'label', label: 'Label' }],
    initial: { tone: 'success', appearance: 'tinted', size: 'md', label: 'Active' },
    render: p => <Badge tone={p.tone as 'success'} appearance={p.appearance as 'tinted'} size={p.size as 'md'}>{String(p.label)}</Badge>,
    code: p => `<Badge tone="${p.tone}"${p.appearance === 'glass' ? ' appearance="glass"' : ''}${p.size === 'sm' ? ' size="sm"' : ''}>${p.label}</Badge>`,
  },
  usage: `<Badge tone="success" appearance="glass">Active</Badge>`,
};

export const tagDoc: ComponentDoc = {
  path: '/components/tags', title: 'Tags', refs: ['5.29'], provenance: 'OBSERVED',
  summary: 'Categorical labels (user roles in frame 6) in five muted fills, all ≥ 4.5:1 with white text (green and amber darkened, R-06). Map each category to one fill once per product and keep it stable. Never use tags for status.',
  preview: () => <div className="ds-cluster">{ROLES.map(r => <Tag key={r} color={ROLE_COLOR[r]}>{r}</Tag>)}</div>,
  variants: () => <Grid min={150}>{TAG_ORDER.map(c => <Cell key={c} label={c}><Tag color={c}>Category</Tag></Cell>)}<Cell label="raised (busy surfaces)"><Tag color="blue" raised>Factory Admin</Tag></Cell></Grid>,
  unsupported: ['outlined tags', 'status-coloured tags'],
  spec: TAG_ORDER.map(c => ({ property: `Fill · ${c}`, token: `--ds-tag-${c}` })).concat([{ property: 'Padding', token: '--ds-space-1-5 + --ds-space-3' }, { property: 'Radius', token: '--ds-radius-xs' }]),
  usage: `<Tag color={ROLE_COLOR[user.role]}>{user.role}</Tag>`,
};

export const statusDoc: ComponentDoc = {
  path: '/components/status-indicators', title: 'Status Indicators', refs: ['5.28'], provenance: 'OBSERVED',
  summary: 'Glowing dots (10 / 8px), always paired with a visible label (default) or, when density forbids a label, given role="img", an aria-label and a legend. Green healthy, amber warning, orange-red stopped / offline.',
  preview: () => <div className="ds-cluster"><Status tone="success">Running</Status><Status tone="warning">Warning</Status><Status tone="error">Stopped</Status></div>,
  variants: () => (
    <Grid min={160}>
      {(['success', 'warning', 'error'] as const).flatMap(t => [
        <Cell key={t} label={`${t} · md 10px`}><Dot tone={t} label={LABEL[t]} /></Cell>,
        <Cell key={t + 's'} label={`${t} · sm 8px + label`}><Status tone={t}>{LABEL[t]}</Status></Cell>,
      ])}
    </Grid>
  ),
  spec: [
    { property: 'Size md / sm', token: '--ds-size-status-dot + --ds-size-status-dot-sm' },
    { property: 'Success core / glow', token: '--ds-color-success-text + --ds-shadow-status-success' },
    { property: 'Warning core / glow', token: '--ds-color-warning-text + --ds-shadow-status-warning' },
    { property: 'Error core / glow', token: '--ds-color-danger + --ds-shadow-status-error' },
    { property: 'Dot → label gap', token: '--ds-space-2' },
  ],
  usage: `<Status tone="success">Running</Status>\n<Dot tone="error" label="Offline" /> {/* standalone: role="img" */}`,
};

export const countDoc: ComponentDoc = {
  path: '/components/count-pill', title: 'Count Pill', refs: ['5.30'], provenance: 'OBSERVED',
  summary: 'A number next to a group or section title (Product List 24, Factory 1 12). Not interactive.',
  preview: () => <div className="ds-cluster"><span className="ds-text-group-title">Product List</span><CountPill>24</CountPill></div>,
  spec: [{ property: 'Fill / border', token: '--ds-color-surface-control + --ds-color-border-subtle' }, { property: 'Text', token: '--ds-color-text-secondary', note: ' 14/18 700, tabular' }, { property: 'Padding', token: '--ds-space-0-5 + --ds-space-3' }, { property: 'Radius', token: '--ds-radius-full' }],
  usage: `<CountPill>24</CountPill>`,
};

export const chipDoc: ComponentDoc = {
  path: '/components/info-chip', title: 'Info Chip', refs: ['5.31'], provenance: 'PRESERVED',
  summary: 'A compact identifier next to a name (a line code or CBU code). Not drawn in the screens; kept from the previous system.',
  preview: () => <div className="ds-cluster"><span className="ds-text-body-strong">Bottle Line - 1</span><Chip>L01</Chip></div>,
  spec: [{ property: 'Fill / border', token: '--ds-color-brand-tint-10 + --ds-color-brand-tint-20' }, { property: 'Text', token: '--ds-color-brand-text', note: ' 10/15' }, { property: 'Radius', token: '--ds-radius-xs' }],
  usage: `<Chip>L01</Chip>`,
};

export const avatarDoc: ComponentDoc = {
  path: '/components/avatar', title: 'Avatar', refs: ['5.32'], provenance: 'OBSERVED',
  summary: 'Photo (32px with a gradient ring and blue orb shadow — sidebar user), brand initials (40px — pickers) or neutral initials (32px). Optional presence dot. Decorative when the name is shown beside it.',
  preview: () => <div className="ds-cluster"><Avatar name={USER.name} variant="photo" src={USER.src} presence /><Avatar name={USER.name} /><Avatar name={USER.name} variant="neutral" /></div>,
  variants: () => <Grid min={160}><Cell label="photo 32"><Avatar name={USER.name} variant="photo" src={USER.src} /></Cell><Cell label="photo · initials fallback"><Avatar name="Anita Sharma" variant="photo" /></Cell><Cell label="initials · brand 40"><Avatar name="Anita Sharma" /></Cell><Cell label="initials · neutral 32"><Avatar name="Anita Sharma" variant="neutral" /></Cell><Cell label="with presence"><Avatar name="Rohan Kumar" presence /></Cell></Grid>,
  spec: [{ property: 'Sizes', token: '--ds-size-avatar-sm + --ds-size-avatar-md + --ds-size-avatar-lg' }, { property: 'Brand gradient / shadow', token: '--ds-gradient-brand-avatar + --ds-shadow-avatar' }, { property: 'Photo ring', token: '--ds-gradient-brand-ring' }, { property: 'Neutral fill / border', token: '--ds-color-surface-avatar + --ds-color-border-avatar' }],
  usage: `<Avatar name="Rishav Raj Sinha" variant="photo" src={src} />`,
};

export const metricDoc: ComponentDoc = {
  path: '/components/metric-cards', title: 'Metric Indicators & Metric Cards', refs: ['5.33', '6.4'], provenance: 'OBSERVED',
  summary: 'Inline metrics (value + optional denominator) for entity cards and strips — e.g. "Lines running 3 / 4" — and the §6.4 prominent-metric dashboard card [EXTENSION]. Not every number needs a KPI card.',
  preview: () => (
    <div className="doc-stack">
      <div className="ds-entity__metrics doc-metric-row">{[['Lines running', 3, 4], ['Cameras online', 7, 8], ['Alerts', 2, undefined]].map(([l, v, o]) => <div key={l as string} className="ds-entity__metric"><Metric label={l as string} value={v as number} of={o as number | undefined} tone={l === 'Alerts' ? 'alert' : undefined} /></div>)}</div>
      <section className="ds-dash-card doc-narrow-xl" aria-label="Prominent metric">
        <span className="ds-text-kpi-label">Products analysed today</span>
        <span className="ds-text-page-title">{fmtIN(234567)}</span>
      </section>
    </div>
  ),
  variants: () => (
    <Grid min={160}>
      <Cell label="with denominator"><Metric label="Lines" value={3} of={4} /></Cell>
      <Cell label="no denominator"><Metric label="Cameras" value={8} /></Cell>
      <Cell label="target met (success)"><Metric label="Online" value={8} of={8} tone="success" /></Cell>
      <Cell label="below target (warning)"><Metric label="Online" value={5} of={8} tone="warning" /></Cell>
      <Cell label="non-zero alerts"><Metric label="Alerts" value={3} tone="alert" /></Cell>
    </Grid>
  ),
  unsupported: ['sparkline metric cards', 'KPI deltas inside the KPI card (deltas go in tooltips or dashboard cards)'],
  spec: [{ property: 'Value', token: '--ds-color-text-primary', note: ' 16/24 700' }, { property: 'Denominator', token: '--ds-color-text-tertiary' }, { property: 'Label → value gap', token: '--ds-space-1' }, { property: 'Alert count', token: '--ds-color-alert-count' }],
  usage: `<Metric label="Lines running" value={3} of={4} />`,
};

export const progressDoc: ComponentDoc = {
  path: '/components/progress', title: 'Progress & Status Bars', refs: ['5.34'], provenance: 'OBSERVED',
  summary: 'Segmented status bars — md (20px, radius 6, no gaps, counts inside segments, 28px minimum per segment; DEOC status cards) and lg (40px, radius 12, no numbers) — and a 4px single-value progress bar.',
  preview: () => <ProgressDemo />,
  variants: () => (
    <Grid min={260}>
      <Cell label="segmented · lg (Line Status)"><SegBar size="lg" segments={[{ value: 123, color: 'var(--ds-chart-running)', label: 'running' }, { value: 5, color: 'var(--ds-chart-stopped)', label: 'stopped' }]} /></Cell>
      <Cell label="segmented · md with counts"><SegBar segments={[{ value: 18, color: 'var(--ds-chart-running)', label: 'running' }, { value: 3, color: 'var(--ds-chart-stopped)', label: 'stopped' }]} /></Cell>
      {(['brand', 'success', 'warning', 'error'] as const).map(t => <Cell key={t} label={`progress · ${t}`}><Progress value={t === 'error' ? 18 : t === 'warning' ? 46 : t === 'success' ? 92 : 64} tone={t} label={`Line utilisation (${t})`} /></Cell>)}
    </Grid>
  ),
  spec: [{ property: 'Segment colours', token: '--ds-chart-running + --ds-chart-stopped' }, { property: 'Segment text (md)', token: '--ds-color-text-on-bright' }, { property: 'Height lg / radius lg', token: '--ds-size-control + --ds-radius-track' }, { property: 'Radius md', token: '--ds-radius-chip' }, { property: 'Progress track / success fill', token: '--ds-color-track + --ds-gradient-progress-success' }, { property: 'Motion', token: '--ds-duration-chart' }],
  usage: `<SegBar size="lg" segments={[{ value: 123, color: 'var(--ds-chart-running)', label: 'running' }, { value: 5, color: 'var(--ds-chart-stopped)', label: 'stopped' }]} />\n<Progress value={64} tone="success" label="Line utilisation" />`,
};
function ProgressDemo() {
  const [v, setV] = useState(64);
  return (
    <div className="doc-stack doc-narrow-xl">
      <Progress value={v} tone={v >= 75 ? 'success' : 'brand'} label="Line utilisation" />
      <div className="ds-cluster"><Button size="sm" variant="secondary" onClick={() => setV(x => Math.max(0, x - 10))}>−10%</Button><Button size="sm" variant="secondary" onClick={() => setV(x => Math.min(100, x + 10))}>+10%</Button></div>
      <SegBar size="lg" segments={[{ value: Math.round(v / 4), color: 'var(--ds-chart-running)', label: 'running' }, { value: 25 - Math.round(v / 4), color: 'var(--ds-chart-stopped)', label: 'stopped' }]} />
    </div>
  );
}

export const calloutDoc: ComponentDoc = {
  path: '/components/callout', title: 'Inline Callout', refs: ['5.20'], provenance: 'OBSERVED', previewSurface: 'card',
  summary: 'An informational note in a well (surface-nested, glass border) placed directly under the fields it explains.',
  preview: () => <div className="doc-narrow-xl"><Callout title="Camera placement">Mount cameras within 1.5 m of the label so the reference image matches the live feed.</Callout></div>,
  spec: [{ property: 'Fill / border', token: '--ds-color-surface-nested + --ds-color-border-glass' }, { property: 'Padding', token: '--ds-space-3-5' }, { property: 'Radius', token: '--ds-radius-sm' }, { property: 'Title / body', token: '--ds-color-text-secondary + --ds-color-text-muted', note: ' 12px' }],
  usage: `<Callout title="Camera placement">Mount cameras within 1.5 m…</Callout>`,
};

export const alertDoc: ComponentDoc = {
  path: '/components/alerts', title: 'Alerts', refs: ['5.21'], provenance: 'EXTENSION', previewSurface: 'card',
  summary: 'Page- or form-level messages built from the callout with status tints. Errors use role="alert", others role="status". Toasts are documented with Overlays → Toasts.',
  preview: () => <AlertDemo />,
  variants: () => (
    <div className="doc-stack">
      <InlineAlert tone="info" title="Scheduled maintenance">Live View will be read-only on Sunday 02:00–04:00.</InlineAlert>
      <InlineAlert tone="success" title="Import complete">24 products were added.</InlineAlert>
      <InlineAlert tone="warning" title="Camera drifting">Camera 3 on Bottle Line - 2 has not matched the reference for 10 minutes.</InlineAlert>
      <InlineAlert tone="error" title="Couldn't save">Check your connection and try again.</InlineAlert>
    </div>
  ),
  spec: [{ property: 'Info', token: '--ds-color-info-bg + --ds-color-info-border + --ds-color-info-text' }, { property: 'Error', token: '--ds-color-danger-bg + --ds-color-danger-border + --ds-color-danger-text' }, { property: 'Padding', token: '--ds-space-3 + --ds-space-3-5' }],
  usage: `<InlineAlert tone="error" title="Couldn't save" onDismiss={dismiss}>Check your connection and try again.</InlineAlert>`,
};
function AlertDemo() {
  const [shown, setShown] = useState(true);
  return shown ? <div className="doc-narrow-xl"><InlineAlert tone="warning" title="Camera drifting" onDismiss={() => setShown(false)}>Camera 3 on Bottle Line - 2 has not matched the reference for 10 minutes.</InlineAlert></div>
    : <Button variant="secondary" onClick={() => setShown(true)}>Show alert again</Button>;
}

const STEPS = [{ title: 'Factory Details', sub: 'Name, location, admin' }, { title: 'Configuration', sub: 'Lines and cameras' }, { title: 'Review & Add', sub: 'Summary' }];
export const stepperDoc: ComponentDoc = {
  path: '/components/stepper', title: 'Stepper', refs: ['5.22'], provenance: 'OBSERVED',
  summary: 'Progress through a multi-step form in a slide-panel subheader (Add New Factory). The current step glows and reads "In progress"; completed steps show a tick and "Completed" in success-text (R-23); as in DEOC, the next step is dimmed to 50% and later ones to 40% (index and text).',
  preview: () => <StepDemo />,
  variants: () => <Grid min={420}><Cell label="first step current"><Stepper current={0} steps={STEPS} /></Cell><Cell label="completed steps"><Stepper current={2} steps={STEPS} /></Cell></Grid>,
  spec: [{ property: 'Index size / radius', token: '--ds-size-pagination-button + --ds-radius-sm' }, { property: 'Current fill / border / shadow', token: '--ds-color-brand-strong + --ds-color-stepper-active-border + --ds-shadow-stepper-active' }, { property: 'Done fill', token: '--ds-color-success-glow' }, { property: 'Idle fill / shadow', token: '--ds-color-surface-sunken-button + --ds-shadow-stepper-idle' }, { property: 'Connector', token: '--ds-color-stepper-track + --ds-gradient-stepper-active' }],
  usage: `<Stepper current={1} steps={[{ title: 'Factory Details', sub: '…' }, …]} />`,
};
function StepDemo() {
  const [c, setC] = useState(0);
  return (
    <div className="doc-stack">
      <Stepper current={c} steps={STEPS} />
      <div className="ds-cluster"><Button variant="secondary" size="sm" disabled={c === 0} onClick={() => setC(c - 1)}>Back</Button><Button size="sm" disabled={c === 2} onClick={() => setC(c + 1)}>Next</Button></div>
    </div>
  );
}

export const loadingDoc: ComponentDoc = {
  path: '/components/loading', title: 'Loading & Skeleton States', refs: ['5.50'], provenance: 'EXTENSION',
  summary: 'Keep the frame, replace the content: a spinner in buttons, a "Loading…" placeholder in fields, skeleton rows in tables, a skeleton value in KPI cards, a spinner in chart areas. Never blank the shell.',
  preview: () => <LoadingDemo />,
  variants: () => (
    <Grid min={260}>
      <Cell label="button"><Button loading>Saving</Button></Cell>
      <Cell label="spinner (chart area)"><span className="ds-muted"><Spinner label="Loading chart" /></span></Cell>
      <Cell label="KPI value skeleton"><KpiCard label="Total factories" value={<Skeleton w={72} h={20} />} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} /></Cell>
      <Cell label="skeleton bars"><div className="doc-stack-sm"><Skeleton w="80%" /><Skeleton w="60%" /><Skeleton w="70%" /></div></Cell>
    </Grid>
  ),
  spec: [{ property: 'Skeleton fill', token: '--ds-color-skeleton' }, { property: 'Skeleton radius', token: '--ds-radius-chip' }, { property: 'Row height', token: '--ds-size-table-row' }],
  usage: `<DataTable loading … />  // renders skeleton rows with aria-busy\n<Button loading>Saving</Button>`,
};
function LoadingDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="doc-stack doc-full">
      <Button variant="secondary" size="sm" onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 1500); }}>Reload table</Button>
      <section className="ds-table-card"><DataTable caption="Factories" rowHeader="name" loading={loading} rowKey={r => r.name} rows={[{ name: 'Factory 1 - Haridwar', admin: 'Anita Sharma', cameras: 12 }, { name: 'Factory 2 - Pune', admin: 'Rohan Kumar', cameras: 6 }]}
        columns={[{ key: 'name', header: 'Factory' }, { key: 'admin', header: 'Admin' }, { key: 'cameras', header: 'Cameras', align: 'num', shrink: true }]} /></section>
    </div>
  );
}

export const emptyDoc: ComponentDoc = {
  path: '/components/empty-states', title: 'Empty States', refs: ['5.51'], provenance: 'EXTENSION',
  summary: 'One sentence stating why there is nothing to show, in body-muted. First-use pages add the page illustration, a title and a primary action.',
  preview: () => <section className="ds-table-card doc-full"><EmptyState variant="first-use" icon={<Illustration name="illus.catalog-item" size={52} />} title="No products yet" message="Add your first product to start matching labels on the line." action={<Button leading={Plus}>Add product</Button>} /></section>,
  variants: () => (
    <Grid min={280}>
      <Cell label="table with no rows"><section className="ds-table-card doc-full"><DataTable caption="Users" rowHeader="name" rows={[]} rowKey={() => ''} columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }]} empty="No users match your filters." /></section></Cell>
      <Cell label="chart with no data"><EmptyState variant="chart" message="No defects recorded in this range." /></Cell>
      <Cell label="menu search"><div className="ds-select doc-static-menu"><div className="ds-menu"><p className="ds-menu__empty">No matches</p></div></div></Cell>
    </Grid>
  ),
  spec: [{ property: 'Text', token: '--ds-color-text-muted' }, { property: 'Padding (table / chart)', token: '--ds-space-12 + --ds-space-16' }],
  usage: `<EmptyState variant="first-use" icon={<Illustration name="illus.catalog-item" size={52} />} title="No products yet" message="…" action={<Button leading={Plus}>Add product</Button>} />`,
};

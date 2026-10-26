import { useState } from 'react';
import { CircleDot, Plus } from 'lucide-react';
import { Breadcrumb, NavItem, PageHeader, Pagination, Sidebar, TabPanel, Tabs } from '../../components/ds/Nav';
import { Button } from '../../components/ds/Button';
import { Illustration, LiveBadge } from '../../components/ds/Display';
import { SearchInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { Changeover } from '../../components/ds/figmaIcons';
import { Cell, Grid } from '../kit';
import type { ComponentDoc } from '../ComponentPage';
import { LIVE, ROLES, USER, USERS, asset } from '../../apps/vision/data';

/* The Vision Automation sidebar as drawn in the Figma frames (General + Admin groups, 24px illustrations). */
const navSections = [
  { label: 'General', items: [
    { id: 'live', label: 'Live View', icon: <Illustration name="illus.camera" size={24} /> },
    { id: 'factories', label: 'Factories', icon: <Illustration name="illus.facility-set" crop="factory" size={24} /> },
    { id: 'analytics', label: 'Analytics', icon: <Illustration name="illus.analytics-board" size={24} /> },
  ] },
  { label: 'Admin', items: [
    { id: 'product-master', label: 'Product Master', icon: <Illustration name="illus.catalog-item" size={24} /> },
    { id: 'cameras', label: 'Cameras', icon: <Illustration name="illus.camera" size={24} /> },
    { id: 'users', label: 'User Management', icon: <Illustration name="illus.user-group" size={24} fit="cover" /> },
    { id: 'activity', label: 'Activity Log', icon: <Illustration name="illus.activity-document" size={24} /> },
  ] },
];
const navIcon = (id: string) => navSections.flatMap(s => s.items).find(i => i.id === id)!.icon;

function SidebarDemo({ collapsed: start }: { collapsed?: boolean }) {
  const [cur, setCur] = useState('factories');
  const [collapsed, setCollapsed] = useState(!!start);
  return (
    <div className="doc-sidebar-frame">
      <Sidebar product="Unilever" tagline="Vision Automation" logo={<img src={asset('logo-unilever.svg')} alt="" />} sections={navSections} current={cur} onSelect={setCur}
        user={USER} collapsible collapsed={collapsed} onToggleCollapsed={() => setCollapsed(c => !c)} />
      <div className="doc-sidebar-content ds-text-body-muted">{collapsed ? 'Hover or tab into the 76px rail: it expands to 256px over the content without reflowing it; labels fade in 75ms later.' : 'The collapse button in the brand row (aria-pressed) switches to the 76px rail.'} Current page: <b className="ds-text-body-strong">{navSections.flatMap(s => s.items).find(i => i.id === cur)?.label}</b></div>
    </div>
  );
}
export const navDoc: ComponentDoc = {
  path: '/components/navigation-items', title: 'Navigation Items & Sidebar', refs: ['5.37'], provenance: 'STANDARDIZED',
  summary: 'DEOC Sidebar: a 256px glass panel (gradient-glass, radius 24, shadow-sidebar, padding 17 10) with a brand row (40px logo tile, product 14/20 600 over a 10px tagline; optional collapse toggle), labelled groups and the user card pinned to the bottom (padding 10, no shadow, muted logout). Items are 44px, padding 10 14, radius 16, 24px illustration + 12px + nav-item 14/20 500; items 4px apart, groups 16px apart. The current item carries gradient-nav-active + shadow-card, a text-primary label (weight stays 500, OBSERVED) and aria-current="page". Collapsed, it becomes the 76px rail that overlays content at 256px on hover or keyboard focus [PRESERVED].',
  preview: () => <SidebarDemo />,
  variants: () => (
    <Grid min={340}>
      <Cell label="expanded (default, OBSERVED)"><SidebarDemo /></Cell>
      <Cell label="collapsed rail [PRESERVED]" note="76px; expands to 256px over content on hover / focus"><SidebarDemo collapsed /></Cell>
    </Grid>
  ),
  unsupported: ['top (horizontal) navigation', 'icon-only items without a label (the collapsed rail still exposes labels on expand)', 'a bold current label (weight stays 500)'],
  states: () => (
    <div className="doc-nav-states">
      {[['default', ''], ['hover', 'is-hover'], ['focus-visible', 'is-focus-visible']].map(([l, c]) => (
        <Cell key={l} label={l}><div className="doc-nav-item-frame"><NavItem item={{ id: l, label: 'Analytics', icon: navIcon('analytics') }} className={c} /></div></Cell>
      ))}
      <Cell label="current (aria-current=page)"><div className="doc-nav-item-frame"><NavItem item={{ id: 'c', label: 'Factories', icon: navIcon('factories') }} current /></div></Cell>
      <Cell label="long label truncates + tooltip"><div className="doc-nav-item-frame"><NavItem item={{ id: 'l', label: 'Camera Calibration & Device Configuration', icon: navIcon('cameras') }} /></div></Cell>
    </div>
  ),
  spec: [
    { property: 'Rail / expanded width', token: '--ds-size-sidebar-collapsed + --ds-size-sidebar-expanded' },
    { property: 'Panel fill / border / shadow', token: '--ds-gradient-glass + --ds-color-border-faint + --ds-shadow-sidebar' },
    { property: 'Panel radius / inner padding', token: '--ds-radius-panel + --ds-space-4' },
    { property: 'Logo tile', token: '--ds-radius-sm + --ds-color-border-logo', note: ' 40px, logo 23 × 24' },
    { property: 'Product / tagline', token: '--ds-color-text-primary + --ds-color-text-muted', note: ' 14/20 600 −0.35 · 11/16.5' },
    { property: 'Group label', token: '--ds-color-text-muted', note: ' nav-section 12/16 400, padding 0 14' },
    { property: 'Item min height', token: '--ds-size-nav-item' },
    { property: 'Item padding / radius', token: '--ds-space-3-5 + --ds-radius-nested' },
    { property: 'Item icon / icon → label', token: '--ds-size-nav-icon + --ds-space-3' },
    { property: 'Item gap / group gap', token: '--ds-space-1 + --ds-space-4' },
    { property: 'Inactive label / hover fill', token: '--ds-color-text-muted + --ds-color-surface-hover', note: ' nav-item 14/20 500' },
    { property: 'Current item', token: '--ds-gradient-nav-active + --ds-shadow-card', note: ' label text-primary, weight 500' },
    { property: 'User card', token: '--ds-radius-panel + --ds-gradient-glass + --ds-color-border-glass + --ds-shadow-glass-soft' },
    { property: 'User card glow', token: '--ds-color-brand-tint-20', note: ' 128px, blur 20px' },
    { property: 'Logout glyph', token: '--ds-color-danger', note: ' 20px' },
    { property: 'Expand transition / label fade', token: '--ds-duration-slow + --ds-ease-emphasized + --ds-duration-base' },
    { property: 'Z-index', token: '--ds-z-sidebar' },
  ],
  behavior: <ul className="doc-list"><li><code>&lt;nav aria-label="Primary"&gt;</code>; the current link has <code>aria-current="page"</code>.</li><li>The collapse button is a toggle (<code>aria-pressed</code>); in the collapsed rail, hover or keyboard focus expands it over the content.</li><li>Labels truncate to one line; the full text is in a tooltip (hover after 300ms, immediately on focus).</li><li>Below 1024px the sidebar becomes a drawer opened from the top bar (§8.2). Reduced motion removes the width transition.</li></ul>,
  usage: `<Sidebar product="Unilever" tagline="Vision Automation" logo={<img src={logo} alt="" />} sections={sections}\n  current={route} onSelect={go} user={{ name: 'Rishav Raj Sinha', role: 'HUL Admin', src }} collapsed={collapsed} onToggleCollapsed={toggle} />`,
};

const STATUS_OPTS = ['All Status', 'Active', 'Warning', 'Offline'].map(v => ({ value: v, label: v }));
function HeaderDemo() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All Status');
  return (
    <div className="doc-header-frame">
      <PageHeader title="Factories" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />} actions={<>
        <SearchInput value={q} onValueChange={setQ} label="Filter factories or units" placeholder="Filter factories or units..." width="sm" />
        <Select variant="filter" leadIcon={CircleDot} label="Status" className="ds-select--180" value={status} onChange={setStatus} options={STATUS_OPTS} searchable={false} />
        <Button leading={Plus} minWidth>Add factory</Button>
      </>} />
    </div>
  );
}
export const pageHeaderDoc: ComponentDoc = {
  path: '/components/page-headers', title: 'Page Header', refs: ['5.38'], provenance: 'OBSERVED',
  summary: 'DEOC PageHeader: 76px, padding 0 16, no fill and no divider. Title block = optional back button or illustration + 10px + page-title (24/32 600 −0.35); an optional status pill 12px after the title ("Live"). Global actions on the end side in the order search → filters → primary, 12px apart; they wrap below the title on narrow screens. Gains shadow-header-scrolled while the content is scrolled.',
  preview: () => <HeaderDemo />,
  variants: () => (
    <div className="doc-stack">
      <Cell label="with status pill (Live View)"><div className="doc-header-frame"><PageHeader title={LIVE.sku} icon={<Illustration name="illus.camera" size={36} />} status={<LiveBadge />} actions={<Button leading={Changeover} minWidth>Line Changeover</Button>} /></div></Cell>
      <Cell label="with back button [PRESERVED]"><div className="doc-header-frame"><PageHeader title="Factory 1" back={{ label: 'Factories', onBack: () => {} }} actions={<Button variant="secondary">Edit factory</Button>} /></div></Cell>
      <Cell label="with breadcrumb [PRESERVED]"><div className="doc-header-frame"><PageHeader title="Line 1" breadcrumb={[{ label: 'Factories', href: '#/components/page-headers' }, { label: 'Factory 1', href: '#/components/page-headers/f1' }]} /></div></Cell>
      <Cell label="with description [PRESERVED]"><div className="doc-header-frame"><PageHeader title="User Management" icon={<Illustration name="illus.user-group" size={36} fit="cover" />} description="Roles and factory access for every user." /></div></Cell>
      <Cell label="scrolled state"><div className="doc-header-frame"><PageHeader title="Analytics" icon={<Illustration name="illus.analytics-board" size={36} />} scrolled /></div></Cell>
    </div>
  ),
  spec: [
    { property: 'Min height', token: '--ds-size-page-header' }, { property: 'Padding', token: '--ds-space-3 + --ds-space-page-gutter' },
    { property: 'Bottom divider / shadow', token: '--ds-color-border-faint + --ds-shadow-glass' },
    { property: 'Illustration / gap to title', token: '--ds-size-page-icon + --ds-space-2-5' },
    { property: 'Title', token: '--ds-font-size-title + --ds-color-text-primary', note: ' page-title 24/32 600, −0.35px (D-9)' },
    { property: 'Title → status pill', token: '--ds-space-3' },
    { property: 'Action gap', token: '--ds-space-header-actions' },
    { property: 'Scrolled shadow', token: '--ds-shadow-header-scrolled' }, { property: 'Z-index', token: '--ds-z-header' },
  ],
  behavior: <ul className="doc-list"><li>The title is the page's only <code>h1</code> (<code>tabIndex=-1</code>): overlays return focus to it when their opener is gone.</li><li>The title wraps; it is never truncated. Actions keep the order search → filters → primary and wrap as a group.</li><li>The back button is an icon button named "Back to …"; breadcrumbs omit the current page because it is the h1.</li></ul>,
  usage: `<PageHeader title="Factories" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />}\n  actions={<><SearchInput width="sm" …/><Select variant="filter" …/><Button leading={Plus} minWidth>Add factory</Button></>} />`,
};

export const breadcrumbDoc: ComponentDoc = {
  path: '/components/breadcrumbs', title: 'Breadcrumbs', refs: ['5.38'], provenance: 'EXTENSION', derivedCss: true,
  summary: 'For two or more levels of hierarchy, placed above the title in the page header [PRESERVED; not in the screens, §15.2]. Links 12/16 in text-muted (text-primary on hover), "/" separators in text-faint (decorative, aria-hidden), 6px apart; the current page is omitted because it is the h1.',
  preview: () => <Breadcrumb items={[{ label: 'Factories', href: '#/components/breadcrumbs' }, { label: 'Factory 1', href: '#/components/breadcrumbs/f1' }, { label: 'Line 1', href: '#/components/breadcrumbs/l1' }]} />,
  states: () => (
    <Grid min={220}>
      <Cell label="link · hover"><nav className="ds-breadcrumb" aria-label="Example"><ol><li><a href="#/components/breadcrumbs" className="is-hover">Factories</a></li></ol></nav></Cell>
      <Cell label="link · focus-visible"><nav className="ds-breadcrumb" aria-label="Example 2"><ol><li><a href="#/components/breadcrumbs" className="is-focus-visible">Factories</a></li></ol></nav></Cell>
    </Grid>
  ),
  spec: [{ property: 'Text', token: '--ds-font-size-label + --ds-color-text-muted', note: ' 12/16' }, { property: 'Hover', token: '--ds-color-text-primary' }, { property: 'Separator', token: '--ds-color-text-faint' }, { property: 'Item gap', token: '--ds-space-1-5' }, { property: 'Focus radius', token: '--ds-radius-xs' }],
  behavior: <ul className="doc-list"><li><code>&lt;nav aria-label="Breadcrumb"&gt;</code> with an ordered list; separators are <code>aria-hidden</code>.</li><li>Links use the standard focus ring; wraps instead of truncating.</li></ul>,
  usage: `<PageHeader title="Line 1" breadcrumb={[{ label: 'Factories', href: '/factories' }, { label: 'Factory 1', href: '/factories/f1' }]} />`,
};

const ROLE_TABS = [{ value: 'all', label: 'All Users', count: USERS.length }, ...ROLES.map(r => ({ value: r, label: r, count: USERS.filter(u => u.role === r).length }))];
function TabsDemo({ variant, size }: { variant: 'raised' | 'accent'; size?: 'sm' }) {
  const [v, setV] = useState('all');
  const id = `tabs-${variant}-${size ?? 'md'}`;
  if (size === 'sm') return <Tabs size="sm" idBase={id} label="Quality view" value={v === 'all' ? 'factory' : v} onChange={setV} tabs={[{ value: 'time', label: 'Time Series' }, { value: 'factory', label: 'Factory Wise' }]} />;
  if (variant === 'accent') return <Tabs variant="accent" idBase={id} label="Configuration" value={v === 'all' ? 'lines' : v} onChange={setV} tabs={[{ value: 'lines', label: 'Lines' }, { value: 'cameras', label: 'Cameras' }]} />;
  const shown = ROLE_TABS.find(t => t.value === v) ?? ROLE_TABS[0];
  return (
    <div className="doc-stack">
      <Tabs idBase={id} controls label="Filter users by role" value={v} onChange={setV} tabs={ROLE_TABS} />
      <TabPanel idBase={id} value={v}><p className="ds-text-body">Showing {shown.count} {v === 'all' ? 'users' : `${shown.label} users`}.</p></TabPanel>
    </div>
  );
}
export const tabsDoc: ComponentDoc = {
  path: '/components/tabs', title: 'Tabs & Segmented Controls', refs: ['5.39'], provenance: 'STANDARDIZED',
  summary: 'DEOC role tabs (User Management) and chart / table view switches (Dashboard): a toggle track (gradient-toggle, 1px border-subtle, radius 12, no shadow, 5px padding); tabs radius 8, padding 10 20 (sm: 6 20), tab 14/20 400 text-muted. The selected tab is a gradient-toggle-active pill with text-primary, weight unchanged (D-9); counts (tab-count 12/16) sit 4px after the label. Accent (dashboard view switches) is a 40px track with equal-width 600-weight tabs, padding 0 12. Tablist pattern: one tab stop, arrows move and activate, Home / End.',
  preview: () => <TabsDemo variant="raised" />,
  variants: () => (
    <Grid min={340}>
      <Cell label="raised (default, page level, with counts)"><TabsDemo variant="raised" /></Cell>
      <Cell label="sm (chart controls in a dashboard card)"><TabsDemo variant="raised" size="sm" /></Cell>
      <Cell label="accent [PRESERVED]" note="Equal-width options, labels 600"><TabsDemo variant="accent" /></Cell>
    </Grid>
  ),
  unsupported: ['underline tabs', 'vertical tabs', 'counts on accent tabs'],
  states: () => (
    <Grid min={340}>
      <Cell label="raised: selected · hover · focus"><Tabs idBase="st1" label="States" value="a" onChange={() => {}} forceClass={{ b: 'is-hover', c: 'is-focus-visible' }} tabs={[{ value: 'a', label: 'HUL Admin', count: 3 }, { value: 'b', label: 'Factory Admin', count: 8 }, { value: 'c', label: 'Factory Operator', count: 10 }]} /></Cell>
      <Cell label="sm: selected · hover · focus"><Tabs idBase="st3" size="sm" label="States sm" value="a" onChange={() => {}} forceClass={{ b: 'is-hover', c: 'is-focus-visible' }} tabs={[{ value: 'a', label: 'Factory Wise' }, { value: 'b', label: 'Product Wise' }, { value: 'c', label: 'Line Wise' }]} /></Cell>
      <Cell label="accent: selected · hover · focus"><Tabs idBase="st2" variant="accent" label="States accent" value="a" onChange={() => {}} forceClass={{ b: 'is-hover', c: 'is-focus-visible' }} tabs={[{ value: 'a', label: 'Lines' }, { value: 'b', label: 'Cameras' }, { value: 'c', label: 'Devices' }]} /></Cell>
    </Grid>
  ),
  spec: [
    { property: 'Track fill / border / shadow', token: '--ds-gradient-glass + --ds-color-border-track + --ds-shadow-glass' },
    { property: 'Track radius / padding', token: '--ds-radius-track + --ds-space-1' },
    { property: 'Tab radius', token: '--ds-radius-sm' },
    { property: 'Tab padding (md)', token: '--ds-space-2-5 + --ds-space-5' }, { property: 'Tab padding (sm)', token: '--ds-space-1-5 + --ds-space-5' },
    { property: 'Label', token: '--ds-color-text-muted', note: ' tab 14/20 400' },
    { property: 'Hover', token: '--ds-color-surface-hover-subtle + --ds-color-text-secondary' },
    { property: 'Raised selected pill', token: '--ds-color-surface-nested + --ds-color-text-primary', note: ' weight unchanged' },
    { property: 'Count (inactive / selected)', token: '--ds-color-text-tertiary + --ds-color-text-muted', note: ' tab-count 12/16, 4px gap' },
    { property: 'Accent track', token: '--ds-color-surface-sunken-button + --ds-shadow-close' },
    { property: 'Accent selected pill', token: '--ds-color-brand-strong + --ds-color-text-on-brand', note: ' labels 600' },
    { property: 'Focus offset', token: '--ds-focus-offset-tight' },
  ],
  behavior: <ul className="doc-list"><li><code>role="tablist"</code> with an <code>aria-label</code>; each tab is <code>role="tab"</code> with <code>aria-selected</code> and a roving tabindex (one tab stop).</li><li>Arrow keys move and activate (wrapping, mirrored in RTL); Home / End jump to the ends.</li><li>When the tabs switch a region, pass <code>controls</code> and render a <code>TabPanel</code>; when they re-render a chart in place, omit it.</li><li>The track scrolls horizontally rather than wrapping when space runs out.</li></ul>,
  playground: {
    controls: [{ kind: 'select', key: 'variant', label: 'Variant', options: ['raised', 'accent'] }, { kind: 'select', key: 'size', label: 'Size', options: ['md', 'sm'] }, { kind: 'bool', key: 'counts', label: 'Counts (raised)' }, { kind: 'select', key: 'n', label: 'Tabs', options: ['2', '3', '5'] }],
    initial: { variant: 'raised', size: 'md', counts: true, n: '5' },
    render: p => <PlayTabs {...p} />,
    code: p => `<Tabs idBase="roles" label="Filter users by role"${p.variant === 'accent' ? ' variant="accent"' : ''}${p.size === 'sm' ? ' size="sm"' : ''} value={tab} onChange={setTab} tabs={[${ROLE_TABS.slice(0, +p.n).map(t => `{ value: '${t.value}', label: '${t.label}'${p.counts && p.variant === 'raised' ? `, count: ${t.count}` : ''} }`).join(', ')}]} />`,
  },
  usage: `<Tabs idBase="roles" controls label="Filter users by role" value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All Users', count: 24 }, …]} />\n<TabPanel idBase="roles" value={tab}>…</TabPanel>\n<Tabs size="sm" idBase="qv" label="Quality view" value={view} onChange={setView} tabs={[{ value: 'time', label: 'Time Series' }, { value: 'factory', label: 'Factory Wise' }]} />`,
};
function PlayTabs(p: Record<string, string | boolean>) {
  const tabs = ROLE_TABS.slice(0, +p.n).map(t => ({ ...t, count: p.counts ? t.count : undefined }));
  const [v, setV] = useState('all');
  return <Tabs idBase="play" variant={p.variant as 'raised'} size={p.size as 'md'} label="Playground tabs" value={tabs.some(t => t.value === v) ? v : 'all'} onChange={setV} tabs={tabs} />;
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const size = 8;
  const rows = USERS.slice((page - 1) * size, page * size);
  return (
    <section className="ds-table-card doc-full">
      <ul className="doc-page-list">{rows.map(u => <li key={u.id} className="ds-text-body">{u.name} <span className="ds-muted">· {u.role}</span></li>)}</ul>
      <Pagination page={page} pageSize={size} total={USERS.length} noun="users" onPage={setPage} />
    </section>
  );
}
export const paginationDoc: ComponentDoc = {
  path: '/components/pagination', title: 'Pagination', refs: ['5.40'], provenance: 'OBSERVED',
  summary: 'DEOC Pagination (User Management, Product Master, Activity Log): gradient-glass-up bar with a 1px border-subtle top divider, padding 12 16; "Showing 1 – 8 of 24 users" in 14/20 text-muted with text-primary 500 numbers; 32px page buttons 6px apart (radius 6, surface-control + border-faint, 12/16 500 text-muted); the current page is brand-strong with a 1px white/30% border and shadow-card; chevrons disabled at 0.4. More than 7 pages adds an ellipsis; below 640px it collapses to "Page n of m" [PRESERVED].',
  preview: () => <PaginationDemo />,
  variants: () => (
    <div className="doc-stack">
      <Cell label="few pages (Figma: 24 users, 8 per page)"><section className="ds-table-card"><Pagination page={1} pageSize={8} total={USERS.length} noun="users" onPage={() => {}} /></section></Cell>
      <Cell label="many pages (ellipsis) [PRESERVED]"><section className="ds-table-card"><Pagination page={7} pageSize={8} total={126} noun="products" onPage={() => {}} /></section></Cell>
    </div>
  ),
  states: () => (
    <Grid min={140}>
      <Cell label="inactive"><button type="button" className="ds-page-btn">3</button></Cell>
      <Cell label="hover"><button type="button" className="ds-page-btn is-hover">3</button></Cell>
      <Cell label="focus-visible"><button type="button" className="ds-page-btn is-focus-visible">3</button></Cell>
      <Cell label="current"><button type="button" className="ds-page-btn" aria-current="page">3</button></Cell>
      <Cell label="disabled (ends)"><button type="button" className="ds-page-btn" disabled aria-label="Previous page">‹</button></Cell>
    </Grid>
  ),
  spec: [
    { property: 'Bar fill / top divider', token: '--ds-gradient-glass-up + --ds-color-border-track' }, { property: 'Bar padding', token: '--ds-space-4 + --ds-space-6' },
    { property: 'Summary', token: '--ds-color-text-muted + --ds-color-text-primary', note: ' 14/16 400; numbers primary, weight 400' },
    { property: 'Button min size', token: '--ds-size-pagination-button' }, { property: 'Button radius', token: '--ds-radius-sm' },
    { property: 'Button fill / border', token: '--ds-color-surface-control + --ds-color-border-faint', note: ' 12/16 text-muted' },
    { property: 'Button gap', token: '--ds-space-1-5' }, { property: 'Hover border', token: '--ds-color-border-control-hover' },
    { property: 'Current fill / top edge', token: '--ds-color-brand-strong + --ds-color-border-on-brand' }, { property: 'Current shadow', token: '--ds-shadow-card' },
    { property: 'Disabled', value: 'opacity 0.4' },
  ],
  behavior: <ul className="doc-list"><li>Page buttons sit in <code>&lt;nav aria-label="Pagination"&gt;</code>; each is named "Page n" and the current one has <code>aria-current="page"</code>.</li><li>After a page change focus stays on the activated button, or moves to the current page when that button becomes disabled; a polite status announces "Page n of m".</li><li>First, last, current ±1 and "…" once there are more than 7 pages.</li></ul>,
  usage: `<Pagination page={page} pageSize={8} total={users.length} noun="users" onPage={setPage} />`,
};

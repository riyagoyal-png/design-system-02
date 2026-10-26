import { useMemo, useState } from 'react';
import { Collapsible, DataTable, sortRows, TableCard, type Column, type Sort } from '../../components/ds/Table';
import { Pagination } from '../../components/ds/Nav';
import { Button, IconButton } from '../../components/ds/Button';
import { ConfirmDialog } from '../../components/ds/Overlay';
import { Badge, Tag } from '../../components/ds/Display';
import { Copy, Edit, Export, PlusLarge, Trash } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';
import { Tooltip } from '../../components/ds/Tooltip';
import { Cell, Grid } from '../kit';
import type { ComponentDoc } from '../ComponentPage';
import { LINE_DEFECTS, ROLE_COLOR, SITES, USERS, fmtIN, type Camera, type User } from '../../apps/vision/data';

/** User Management columns (frame 6): role tag, glass status pill, copy / edit / delete. */
export function userColumns(opts: { onEdit?: (u: User) => void; onDelete?: (u: User) => void; open?: boolean } = {}): Column<User>[] {
  return [
    { key: 'name', header: 'Name', sortable: true, sortValue: u => u.name, render: u => (opts.open
      ? <Tooltip content={`Open ${u.name}`}><a className="ds-row-link" href="#/components/tables" onClick={ev => { ev.preventDefault(); toast(`Open ${u.name}`); }}>{u.name}</a></Tooltip>
      : u.name) },
    { key: 'email', header: 'Email ID', sortable: true, sortValue: u => u.email },
    { key: 'role', header: 'Role', sortable: true, sortValue: u => u.role, render: u => <Tag color={ROLE_COLOR[u.role]}>{u.role}</Tag> },
    { key: 'factory', header: 'Factory', sortable: true, sortValue: u => u.factory },
    { key: 'status', header: 'Status', sortable: true, sortValue: u => u.status.label, render: u => <Badge tone={u.status.tone} appearance="glass">{u.status.label}</Badge> },
    { key: 'lastActive', header: 'Last active' },
    ...(opts.onEdit ? [{ key: 'actions', header: 'Actions', hiddenHeader: true, align: 'end' as const, render: (u: User) => (
      <span className="ds-row-actions">
        <IconButton icon={Copy} size="compact" label={`Copy email of ${u.name}`} onClick={() => { navigator.clipboard?.writeText(u.email).catch(() => {}); toast('Email copied'); }} />
        <IconButton icon={Edit} size="compact" label={`Edit ${u.name}`} onClick={() => opts.onEdit?.(u)} />
        <IconButton icon={Trash} size="compact" label={`Delete ${u.name}`} onClick={() => opts.onDelete?.(u)} />
      </span>
    ) }] : []),
  ];
}

const cameraColumns: Column<Camera>[] = [
  { key: 'name', header: 'Camera' }, { key: 'serial', header: 'Serial no.' }, { key: 'ip', header: 'IP address' },
  { key: 'status', header: 'Status', render: c => <Badge tone={c.status.tone} appearance="glass">{c.status.label}</Badge> },
  { key: 'lastActive', header: 'Last active' },
];

function TableDemo() {
  const [rows, setRows] = useState(USERS);
  const [sort, setSort] = useState<Sort>({ key: 'name', dir: 'ascending' });
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<User | null>(null);
  const size = 8;
  const sorted = useMemo(() => sortRows(rows, sort, userColumns()), [rows, sort]);
  const pageRows = sorted.slice((page - 1) * size, page * size);
  return (
    <TableCard title="Users" titleId="tbl-demo-title" count={rows.length} actions={<Button variant="secondary" leading={Export} onClick={() => toast(`${rows.length} users exported`)}>Export</Button>}
      bulk={sel.size ? (
        <div className="ds-bulkbar">
          <span className="ds-text-body-strong" role="status">{sel.size} selected</span>
          <div className="ds-bulkbar__actions">
            <Button size="sm" variant="secondary" onClick={() => { setRows(r => r.filter(x => !sel.has(x.id))); toast(`${sel.size} users removed`); setSel(new Set()); }}>Remove</Button>
            <Button size="sm" variant="ghost" onClick={() => setSel(new Set())}>Clear selection</Button>
          </div>
        </div>
      ) : undefined}>
      <DataTable caption="Users" labelledBy="tbl-demo-title" rowHeader="name" columns={userColumns({ open: true, onEdit: u => toast(`Edit ${u.name}`), onDelete: setDel })}
        rows={pageRows} rowKey={u => u.id} sort={sort} onSort={s => { setSort(s); setPage(1); }} selectable selected={sel} onSelect={setSel} rowName={u => u.name} minWidth={1100} />
      <Pagination page={page} pageSize={size} total={rows.length} noun="users" onPage={setPage} />
      <ConfirmDialog open={!!del} title="Delete user?" message={del ? `${del.name} (${del.email}) loses access to Vision Automation.` : ''} confirmLabel="Delete"
        onCancel={() => setDel(null)} onConfirm={() => { const n = del!.name; setRows(r => r.filter(x => x.id !== del!.id)); setDel(null); toast(`${n} deleted`); }}
        fallbackFocus={() => document.querySelector<HTMLElement>('#tbl-demo-title')?.closest('section')?.querySelector<HTMLElement>('.ds-row-link') ?? null} />
    </TableCard>
  );
}

const ldCols: Column<(typeof LINE_DEFECTS)[number] & { key: string }>[] = [
  { key: 'line', header: 'Line' }, { key: 'product', header: 'Products' }, { key: 'factory', header: 'Factory' },
  { key: 'analysed', header: 'Products an.', align: 'num', render: r => fmtIN(r.analysed) },
  { key: 'issue', header: 'Main issue', align: 'center' }, { key: 'total', header: 'Total defect %', align: 'center', render: r => `${r.total}%` },
];
const ldRows = LINE_DEFECTS.slice(0, 4).map((r, i) => ({ ...r, key: `ld${i}` }));
const someUsers = USERS.slice(0, 4);

export const tableDoc: ComponentDoc = {
  path: '/components/tables', title: 'Tables', refs: ['5.41'], provenance: 'OBSERVED',
  summary: 'Tables as DEOC renders them (44px rows, 40px header, 12 × 16 cell padding, 12px uppercase headers, regular-weight secondary cells) and a compact density (40 / 36): semantic HTML (caption, th scope, row headers), no zebra, numbers end-aligned with tabular figures, glass status pills, a labelled keyboard-scrollable region, accessible sorting, selection and row actions.',
  preview: () => <div className="doc-full"><TableDemo /></div>,
  variants: () => (
    <div className="doc-stack">
      <Cell label="default (frames 4, 6, 8: row 72, header 56)"><section className="ds-table-card"><DataTable caption="Users" rowHeader="name" rowKey={u => u.id} rows={someUsers.slice(0, 3)} columns={userColumns().slice(0, 5)} /></section></Cell>
      <Cell label="compact (frame 7 dashboard tables: row 48, header 40)"><section className="ds-table-card"><DataTable variant="compact" caption="Line wise defects" rowHeader="line" rowKey={r => r.key} rows={ldRows} columns={ldCols} /></section></Cell>
      <Cell label="grid (compact with column dividers: frame 7 status cards)"><section className="ds-table-card"><DataTable variant="grid" caption="Stopped lines" rowHeader="line" rowKey={r => r.key} rows={ldRows.slice(0, 3)} columns={ldCols.slice(0, 3)} /></section></Cell>
      <Cell label="capped with sticky header"><section className="ds-table-card"><DataTable caption="Capped table" rowHeader="name" rowKey={u => u.id} rows={USERS.slice(0, 12)} columns={userColumns().slice(0, 5)} maxHeight={344} /></section></Cell>
      <Cell label="status tints (warning / stopped rows) [EXTENSION]"><section className="ds-table-card"><DataTable caption="Tinted rows" rowHeader="name" rowKey={c => c.id} rows={SITES[1].lines[0].cameras.concat(SITES[2].lines[0].cameras)} columns={cameraColumns} rowTone={c => (c.status.tone === 'warning' ? 'warning' : c.status.tone === 'error' ? 'critical' : undefined)} /></section></Cell>
      <Cell label="clickable rows (row link is the keyboard target)"><section className="ds-table-card"><DataTable caption="Clickable rows" rowHeader="name" rowKey={u => u.id} rows={someUsers.slice(0, 3)} columns={userColumns({ open: true }).slice(0, 4)} onRowActivate={u => toast(`Open ${u.name}`)} /></section></Cell>
      <Cell label="loading"><section className="ds-table-card"><DataTable caption="Loading" rowHeader="name" rowKey={u => u.id} rows={[]} loading columns={userColumns().slice(0, 4)} /></section></Cell>
      <Cell label="empty"><section className="ds-table-card"><DataTable caption="Empty" rowHeader="name" rowKey={u => u.id} rows={[]} columns={userColumns().slice(0, 4)} empty="No users match your filters." /></section></Cell>
    </div>
  ),
  unsupported: ['spreadsheet-style cell navigation (ARIA grid) — a product decision for editable grids only', 'row dividers and zebra stripes (not in the screens)', 'spacer columns'],
  states: () => (
    <section className="ds-table-card">
      <DataTable caption="Row states" rowHeader="name" rowKey={u => u.id} rows={someUsers} columns={userColumns().slice(0, 4)} selectable selected={new Set([someUsers[3].id])} onSelect={() => {}}
        forceRowClass={(_, i) => (i === 1 ? 'is-hover' : '')} />
      <p className="ds-text-small doc-pad">Row 1 default · row 2 hover (forced) · row 4 selected (the checked checkbox is the non-colour cue).</p>
    </section>
  ),
  spec: [
    { property: 'Cell padding', token: '--ds-space-cell-x', note: ' 0 24' },
    { property: 'Row min height (default / compact)', token: '--ds-size-table-row + --ds-size-table-row-compact' },
    { property: 'Header min height (default / compact)', token: '--ds-size-table-header + --ds-size-table-header-compact' },
    { property: 'Header fill / pinned fill', token: '--ds-color-surface-table-header + --ds-gradient-table-header-pinned' },
    { property: 'Header text', token: '--ds-color-text-muted', note: ' table-header 14/600 uppercase' },
    { property: 'Header tracking', token: '--ds-tracking-table-header' },
    { property: 'Header divider / grid dividers', token: '--ds-color-border-divider' },
    { property: 'Row hover / clickable row hover', token: '--ds-color-surface-row-hover + --ds-color-surface-hover' },
    { property: 'Selected row', token: '--ds-color-brand-tint-10' },
    { property: 'Row tints [EXTENSION]', token: '--ds-color-row-warning + --ds-color-row-critical' },
    { property: 'Row action buttons', token: '--ds-size-icon-button-compact', note: ' 24px glyphs, 16 apart' },
    { property: 'Scrolled header shadow', token: '--ds-shadow-header-scrolled' },
  ],
  behavior: <ul className="doc-list"><li>Sorting: header buttons with the Figma sort glyph; <code>aria-sort</code> only on the sorted column; text sorts ascending first, numbers descending first; changes are announced.</li><li>Selection [EXTENSION]: header checkbox is unchecked / indeterminate / checked; the bulk bar announces "N selected".</li><li>Row actions name their row ("Edit Anita Sharma"); delete asks for confirmation, then focus moves to the next row link (§5.55).</li><li>Click anywhere on a clickable row activates its link, except on interactive elements or while selecting text.</li></ul>,
  usage: `<DataTable caption="Users" labelledBy="users-title" rowHeader="name" columns={columns} rows={rows} rowKey={u => u.id}\n  sort={sort} onSort={setSort} />\n<DataTable variant="compact" … />  // dashboard tables\n<DataTable variant="grid" … />     // status-card tables`,
};

export const tableCardDoc: ComponentDoc = {
  path: '/components/table-card', title: 'Table Card', refs: ['5.42'], provenance: 'OBSERVED',
  summary: 'A table never sits directly on the page: it lives in a glass card (radius 16, shadow-float) with an optional section header (group-title + count pill + actions) and pagination.',
  preview: () => <div className="doc-full"><TableCard title="Users" titleId="tc-title" count={USERS.length} actions={<Button variant="secondary" size="sm" leading={Export}>Export</Button>}><DataTable caption="Users" labelledBy="tc-title" rowHeader="name" rowKey={u => u.id} rows={someUsers.slice(0, 3)} columns={userColumns().slice(0, 4)} /></TableCard></div>,
  spec: [{ property: 'Radius', token: '--ds-radius-card' }, { property: 'Shadow / edge', token: '--ds-shadow-float-drop + --ds-shadow-edge', note: ' (R-18, R-28)' }, { property: 'Header padding', token: '--ds-space-4' }, { property: 'Header divider', token: '--ds-color-border-faint' }, { property: 'Title → count', token: '--ds-space-3-5' }],
  usage: `<TableCard title="Users" titleId="users-title" count={24} actions={…}>\n  <DataTable labelledBy="users-title" … />\n  <Pagination … />\n</TableCard>`,
};

/** Cameras (frame 4): factory sections → nested line groups → camera tables. */
function GroupDemo() {
  const [open, setOpen] = useState<Record<string, boolean>>({ s1: true, l1: true });
  const tog = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }));
  return (
    <div className="ds-section-stack doc-full">
      {SITES.slice(0, 2).map(s => (
        <Collapsible key={s.id} title={s.name} count={s.count} open={!!open[s.id]} onToggle={() => tog(s.id)}>
          <div className="ds-section-stack">
            {s.lines.slice(0, 2).map(l => (
              <Collapsible key={l.id} nested headingLevel={3} title={l.name} count={l.cameras.length} open={!!open[l.id]} onToggle={() => tog(l.id)}
                action={<Button variant="subtle" leading={PlusLarge} onClick={() => toast(`Add a camera to ${s.name} · ${l.name}`)}>Add Camera to Line</Button>}>
                <DataTable caption={`${l.name} cameras`} rowHeader="name" rowKey={c => c.id} rows={l.cameras} columns={cameraColumns} />
              </Collapsible>
            ))}
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
export const collapsibleDoc: ComponentDoc = {
  path: '/components/collapsible-section', title: 'Collapsible Section', refs: ['5.43'], provenance: 'OBSERVED',
  summary: 'Groups records by a parent (factories → lines → cameras). The header is a button with aria-expanded inside a heading; min-height 64; titles wrap. While filtering, sections with matches are forced open.',
  preview: () => <GroupDemo />,
  variants: () => (
    <Grid min={360}>
      <Cell label="section (glass, 32px chevron at the end)"><Collapsible title="Factory 2" count={6} open={false} onToggle={() => {}}><p /></Collapsible></Cell>
      <Cell label="nested group (well, chevron at the start, radius 16)"><Collapsible nested title="Bottle Line - 1" count={2} open={false} onToggle={() => {}} headingLevel={3}><p /></Collapsible></Cell>
    </Grid>
  ),
  states: () => (
    <Grid min={360}>
      <Cell label="collapsed · hover"><Collapsible title="Factory 3" count={6} open={false} onToggle={() => {}} forceClass="is-hover"><p /></Collapsible></Cell>
      <Cell label="focus-visible"><Collapsible title="Factory 4" count={6} open={false} onToggle={() => {}} forceClass="is-focus-visible"><p /></Collapsible></Cell>
      <Cell label="expanded (divider under header)"><Collapsible title="Factory 1" count={12} open onToggle={() => {}}><p className="ds-text-body doc-pad">Line groups</p></Collapsible></Cell>
    </Grid>
  ),
  spec: [
    { property: 'Header min height', token: '--ds-size-section-header' },
    { property: 'Section fill / edge / shadow', token: '--ds-gradient-glass + --ds-shadow-edge + --ds-shadow-glass-soft' },
    { property: 'Nested group fill', token: '--ds-color-surface-nested' },
    { property: 'Radius (section / nested)', token: '--ds-radius-card + --ds-radius-nested' },
    { property: 'Header padding', token: '--ds-space-4', note: ' 0 16, 60px tall' },
    { property: 'Chevron', token: '--ds-color-icon-chevron' },
    { property: 'Stack gap', token: '--ds-space-section' },
  ],
  usage: `<Collapsible title="Factory 1" count={12} open={open} onToggle={toggle}>\n  <Collapsible nested headingLevel={3} title="Bottle Line - 1" count={2} open={…} onToggle={…}\n    action={<Button variant="subtle" leading={PlusLarge}>Add Camera to Line</Button>}>\n    <DataTable … />\n  </Collapsible>\n</Collapsible>`,
};

import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDisclosure, Sort as SortGlyph } from './figmaIcons';
import { Checkbox } from './Choice';
import { Skeleton } from './Display';
import { Icon } from './Icon';

export interface Column<R> {
  key: string;
  header: string;
  align?: 'num' | 'end' | 'center';
  shrink?: boolean;
  sortable?: boolean;
  sortValue?: (r: R) => string | number;
  render?: (r: R) => ReactNode;
  hiddenHeader?: boolean;
  minWidth?: number;
}

export type Sort = { key: string; dir: 'ascending' | 'descending' } | null;

/** Sort cycle (§5.41): first activation ascending for text, descending for numbers; next reverses. */
export function nextSort<R>(cur: Sort, col: Column<R>, sample?: R): Sort {
  if (cur?.key === col.key) return { key: col.key, dir: cur.dir === 'ascending' ? 'descending' : 'ascending' };
  const numeric = col.align === 'num' || (sample !== undefined && typeof col.sortValue?.(sample) === 'number');
  return { key: col.key, dir: numeric ? 'descending' : 'ascending' };
}

export function sortRows<R>(rows: R[], sort: Sort, cols: Column<R>[]): R[] {
  if (!sort) return rows;
  const col = cols.find(c => c.key === sort.key);
  if (!col?.sortValue) return rows;
  const f = col.sortValue;
  return [...rows].sort((a, b) => {
    const x = f(a), y = f(b);
    const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
    return sort.dir === 'ascending' ? c : -c;
  });
}

/** Unsorted: the Figma column-sort glyph (two opposed arrows); sorted: a single arrow. */
function SortIcon({ dir }: { dir?: 'ascending' | 'descending' }) {
  if (!dir) return <Icon icon={SortGlyph} size={14} />;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v8M4 6l3-3 3 3" />
    </svg>
  );
}

/**
  §5.41 Data table: semantic structure (caption, th scope, row header), no spacer columns, labelled
  keyboard-scrollable region, sticky opaque header when capped, aria-sort on the sorted column only.
*/
export function DataTable<R>({ columns, rows, rowKey, rowHeader, caption, labelledBy, sort, onSort, selectable, selected, onSelect, rowName,
  maxHeight, minWidth, loading, empty = 'No records match your filters.', rowTone, onRowActivate, forceRowClass, variant = 'default' }: {
  columns: Column<R>[]; rows: R[]; rowKey: (r: R) => string; rowHeader: string; caption: string; labelledBy?: string;
  sort?: Sort; onSort?: (s: Sort) => void; selectable?: boolean; selected?: Set<string>; onSelect?: (s: Set<string>) => void; rowName?: (r: R) => string;
  maxHeight?: number; minWidth?: number; loading?: boolean; empty?: ReactNode; rowTone?: (r: R) => 'warning' | 'critical' | undefined;
  onRowActivate?: (r: R) => void; forceRowClass?: (r: R, i: number) => string;
  /** default (56 / 72 px rows), compact (40 / 48, dashboard cards), grid (compact + column dividers). */
  variant?: 'default' | 'compact' | 'grid';
}) {
  const [scrolled, setScrolled] = useState(false);
  const statusId = useId();
  const [announce, setAnnounce] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);
  const keys = useMemo(() => rows.map(rowKey), [rows, rowKey]);
  const sel = selected ?? new Set<string>();
  const allOn = keys.length > 0 && keys.every(k => sel.has(k));
  const someOn = keys.some(k => sel.has(k)) && !allOn;

  const doSort = (c: Column<R>) => {
    const s = nextSort(sort ?? null, c, rows[0]);
    onSort?.(s);
    setAnnounce(`Sorted by ${c.header}, ${s!.dir}`);
  };
  const toggleAll = (on: boolean) => {
    const next = new Set(sel);
    keys.forEach(k => (on ? next.add(k) : next.delete(k)));
    onSelect?.(next);
  };
  const toggle = (k: string, on: boolean) => {
    const next = new Set(sel);
    if (on) next.add(k); else next.delete(k);
    onSelect?.(next);
  };
  const alignCls = (c: Column<R>) => [c.shrink ? 'ds-col-shrink' : '', c.align === 'num' ? 'ds-num' : c.align === 'end' ? 'ds-right' : c.align === 'center' ? 'ds-center' : ''].join(' ').trim() || undefined;
  const sortedCol = columns.find(c => c.key === sort?.key);
  const fullCaption = `${caption}${sortedCol ? `, sorted by ${sortedCol.header} ${sort!.dir}` : ''}`;
  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div ref={regionRef} className={`ds-table-region${maxHeight ? ' ds-table-region--capped' : ''}${scrolled ? ' ds-table-region--scrolled' : ''}`}
      role="region" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : caption} tabIndex={0}
      style={{ ['--ds-table-max-height' as string]: maxHeight ? `${maxHeight}px` : undefined }}
      onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 0)} data-part="region">
      <table className={`ds-table${variant !== 'default' ? ' ds-table--compact' : ''}${variant === 'grid' ? ' ds-table--grid' : ''}`} style={{ ['--ds-table-min-width' as string]: minWidth ? `${minWidth}px` : undefined }} aria-busy={loading || undefined}>
        <caption className="ds-sr-only">{fullCaption}</caption>
        <thead>
          <tr data-part="header">
            {selectable && (
              <th scope="col" className="ds-col-check">
                <Checkbox checked={allOn} indeterminate={someOn} onChange={toggleAll} label="Select all rows on this page" />
              </th>
            )}
            {columns.map(c => (
              <th key={c.key} scope="col" data-part={c.sortable && onSort && c.key === columns.find(x => x.sortable)?.key ? 'sort' : undefined} className={alignCls(c)} aria-sort={sort?.key === c.key ? sort.dir : undefined} style={c.minWidth ? { minWidth: c.minWidth, width: c.minWidth } : undefined} /* auto-layout tables ignore min-width on cells; width acts as the minimum */>
                {c.hiddenHeader ? <span className="ds-sr-only">{c.header}</span>
                  : c.sortable && onSort ? (
                    <button type="button" className="ds-th-sort" onClick={() => doSort(c)}>{c.header}<SortIcon dir={sort?.key === c.key ? sort.dir : undefined} /></button>
                  ) : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>
              {selectable && <td className="ds-col-check"><Skeleton w={16} h={16} /></td>}
              {columns.map((c, j) => <td key={c.key} className={alignCls(c)}><Skeleton w={j === 0 ? 140 : 80} /></td>)}
            </tr>
          )) : rows.length === 0 ? (
            <tr><td colSpan={colCount} className="ds-table-empty">{empty}</td></tr>
          ) : rows.map((r, i) => {
            const k = rowKey(r);
            const tone = rowTone?.(r);
            const cls = [onRowActivate ? 'ds-row-clickable' : '', tone === 'warning' ? 'ds-row-warning' : tone === 'critical' ? 'ds-row-critical' : '', sel.has(k) ? 'is-selected' : '', forceRowClass?.(r, i) ?? ''].join(' ').trim();
            return (
              <tr key={k} data-part={i === 0 ? 'row' : undefined} className={cls || undefined} aria-selected={selectable ? sel.has(k) : undefined}
                onClick={e => {
                  // §5.55 row click: ignore clicks on interactive elements or while selecting text
                  if (!onRowActivate || (e.target as HTMLElement).closest('a,button,input,label') || window.getSelection()?.toString()) return;
                  onRowActivate(r);
                }}>
                {selectable && (
                  <td className="ds-col-check"><Checkbox checked={sel.has(k)} onChange={on => toggle(k, on)} label={`Select ${rowName?.(r) ?? k}`} /></td>
                )}
                {columns.map(c => c.key === rowHeader
                  ? <th key={c.key} scope="row" className={alignCls(c)}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key])}</th>
                  : <td key={c.key} className={alignCls(c)}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key])}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p id={statusId} className="ds-sr-only" role="status">{announce}</p>
    </div>
  );
}

/** §5.42 table card + optional section header. */
export function TableCard({ title, titleId, count, actions, children, bulk }: { title?: string; titleId?: string; count?: number; actions?: ReactNode; children: ReactNode; bulk?: ReactNode }) {
  return (
    <section className="ds-table-card" aria-labelledby={title ? titleId : undefined} data-part="container">
      {bulk ?? (title && (
        <div className="ds-table-card__header" data-part="header">
          <div className="ds-table-card__title">
            <h2 className="ds-text-group-title" id={titleId}>{title}</h2>
            {count !== undefined && <span className="ds-count ds-count--sm">{count.toLocaleString('en-GB')}</span>}
          </div>
          {actions && <div className="ds-cluster">{actions}</div>}
        </div>
      ))}
      {children}
    </section>
  );
}

/** §5.43 collapsible section. */
export function Collapsible({ title, count, open, onToggle, action, children, nested, headingLevel = 2, forceClass }: {
  title: string; count?: number; open: boolean; onToggle: () => void; action?: ReactNode; children: ReactNode; nested?: boolean; headingLevel?: 2 | 3; forceClass?: string;
}) {
  const id = useId();
  const H = `h${headingLevel}` as 'h2';
  const chevron = <span className="ds-section-card__chev" aria-hidden="true"><Icon icon={ChevronDisclosure} size={24} /></span>;
  return (
    <section className={`ds-section-card${nested ? ' ds-section-card--nested' : ''}`} data-part="container">
      <div className="ds-section-card__heading ds-section-card__heading--row" data-part="header">
        <H className="ds-section-card__h">
          <button type="button" className={`ds-section-card__toggle ${forceClass ?? ''}`.trim()} aria-expanded={open} aria-controls={id} onClick={onToggle} data-part="toggle">
            <span className="ds-text-subgroup-title" data-part="title">{title}</span>
            {count !== undefined && <span className="ds-count" data-part="count">{count}</span>}
            {chevron}
          </button>
        </H>
        {action}
      </div>
      <div id={id} hidden={!open} className={nested ? 'ds-section-card__body ds-section-card__body--flush' : 'ds-section-card__body'} data-part="content">{open && children}</div>
    </section>
  );
}

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/* ── Formatting (§7.1) ───────────────────────────────────────────── */
export const fmtInt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 0 });
export const fmtPct = (n: number) => `${n.toFixed(2)}%`;
export function fmtCompact(n: number) {
  if (Math.abs(n) >= 1e6) return `${+(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${+(n / 1e3).toFixed(1)}k`;
  return `${+n.toFixed(1)}`;
}

/** §7.3: 7 ticks (0 + 6 even steps), step rounded to a nice 1 / 2 / 2.5 / 5 × 10ⁿ. */
export function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1, 2, 3, 4, 5, 6];
  const raw = max / 6;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw)!;
  return Array.from({ length: 7 }, (_, i) => +(i * step).toFixed(6));
}

/* ── Heat scale (§7.2, §7.7 snapping) ─────────────────────────────── */
// Mirrors --ds-heat-0…4 (§3) for RGB interpolation.
const HEAT = ['#003e3a', '#116035', '#597730', '#d18732', '#ff5825'].map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
export function heatColor(p: number): string {
  const x = Math.min(1, Math.max(0, p)) * 4;
  const i = Math.min(3, Math.floor(x));
  const f = x - i;
  const c = HEAT[i].map((v, j) => Math.round(v + (HEAT[i + 1][j] - v) * f));
  return `rgb(${c.join(',')})`;
}
/** Text-bearing heat cells: snap 0.55 < p < 0.59 to the nearer edge; white ≤ 0.55, ink ≥ 0.59 (§7.7, R-21). */
export function heatCell(t: number, reversed = false) {
  let p = reversed ? 1 - t : t;
  if (p > 0.55 && p < 0.59) p = p < 0.57 ? 0.55 : 0.59;
  return { fill: heatColor(p), ink: p > 0.55, p };
}
export function normalize(values: number[]) {
  const min = Math.min(...values), max = Math.max(...values);
  return (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
}

/* ── Rich chart tooltip (§7.9): anchored at the mark centre +12/+12, flips, hoverable, Escape closes ── */
export interface TipState { x: number; y: number; content: ReactNode; id: string }
export function useChartTip() {
  const [tip, setTip] = useState<TipState | null>(null);
  const over = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const container = useRef<HTMLDivElement>(null);
  const show = useCallback((el: Element, content: ReactNode, id: string) => {
    window.clearTimeout(timer.current);
    const c = container.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top, content, id });
  }, []);
  const hide = useCallback((now = false) => {
    window.clearTimeout(timer.current);
    if (now) { setTip(null); return; }
    timer.current = window.setTimeout(() => { if (!over.current) setTip(null); }, 100);
  }, []);
  useEffect(() => {
    if (!tip) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setTip(null); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [tip]);
  const bind = (content: ReactNode, id: string) => ({
    onPointerEnter: (e: React.PointerEvent) => show(e.currentTarget, content, id),
    onPointerLeave: () => hide(),
    onFocus: (e: React.FocusEvent) => show(e.currentTarget, content, id),
    onBlur: () => hide(true),
    'aria-describedby': tip?.id === id ? 'chart-tip-' + id : undefined,
  });
  const node = tip ? <ChartTipBox tip={tip} container={container} onEnter={() => { over.current = true; window.clearTimeout(timer.current); }} onLeave={() => { over.current = false; hide(); }} /> : null;
  return { container, bind, node, hide };
}
function ChartTipBox({ tip, container, onEnter, onLeave }: { tip: TipState; container: React.RefObject<HTMLDivElement | null>; onEnter: () => void; onLeave: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: tip.x + 12, top: tip.y + 12 });
  useLayoutEffect(() => {
    const c = container.current!.getBoundingClientRect();
    const t = ref.current!.getBoundingClientRect();
    let left = tip.x + 12, top = tip.y + 12;
    if (left + t.width + 24 > c.width) left = Math.max(0, tip.x - 12 - t.width);
    if (top + t.height + 24 > c.height) top = Math.max(0, tip.y - 12 - t.height);
    setPos({ left, top });
  }, [tip, container]);
  return <div ref={ref} id={'chart-tip-' + tip.id} role="tooltip" className="ds-chart-tip" style={pos} onPointerEnter={onEnter} onPointerLeave={onLeave}>{tip.content}</div>;
}

export function TipContent({ title, sub, color, rows, list }: { title: string; sub?: string; color?: string; rows: [string, string][]; list?: { title: string; items: [string, string][] } }) {
  return (
    <>
      <div className="ds-chart-tip__head">{color && <span className="ds-chart-tip__dot" style={{ background: color }} />}<b>{title}</b>{sub && <><span className="ds-tip-x">×</span><span className="ds-tip-sub">{sub}</span></>}</div>
      <div className="ds-chart-tip__rows">{rows.map(([k, v]) => <div className="ds-chart-tip__row" key={k}><span>{k}</span><span>{v}</span></div>)}</div>
      {list && (
        <>
          <div className="ds-chart-tip__divider" />
          <div className="ds-chart-tip__rows"><span className="ds-tip-sub">{list.title}</span>
            {list.items.map(([k, v], i) => <div className="ds-chart-tip__row ds-chart-tip__item" key={k}><span className="ds-truncate">{i + 1}. {k}</span><span>{v}</span></div>)}
          </div>
        </>
      )}
    </>
  );
}

/* ── Legends (§7.10) ─────────────────────────────────────────────── */
export function Legend({ items, kind = 'swatch' }: { items: { label: string; color: string; value?: string; dashed?: boolean }[]; kind?: 'swatch' | 'dot' | 'line' }) {
  return (
    <ul className={`ds-legend ds-legend--${kind}`} aria-label="Legend">
      {items.map(i => (
        <li key={i.label}>
          {kind === 'line' || i.dashed
            ? <svg width="24" height="16" aria-hidden="true"><line x1="0" y1="8" x2="24" y2="8" stroke={i.color} strokeWidth="2" strokeDasharray="4 3" /><circle cx="12" cy="8" r="3" fill={i.color} /></svg>
            : <span className="ds-legend__mark" style={{ background: i.color }} aria-hidden="true" />}
          <span>{i.label}</span>{i.value && <span className="ds-legend__value">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ── Accessible data-table alternative ───────────────────────────── */
export function ChartData({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="ds-chart-data">
      <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        {open ? 'Hide data table' : 'Show data table'}
      </button>
      <div id={id} hidden={!open}>
        {open && (
          <div className="ds-table-region" role="region" aria-label={`${caption} data`} tabIndex={0}>
            <table className="ds-table">
              <caption className="ds-sr-only">{caption}</caption>
              <thead><tr>{head.map((h, i) => <th key={h} scope="col" className={i ? 'ds-num' : undefined}>{h}</th>)}</tr></thead>
              <tbody>{rows.map(r => <tr key={String(r[0])}>{r.map((c, i) => i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i} className="ds-num">{typeof c === 'number' ? fmtInt(c) : c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChartEmpty({ height = 300 }: { height?: number }) {
  return <div className="ds-empty ds-empty--chart" style={{ minHeight: height }}><p className="ds-text-body-muted">No data in this range.</p></div>;
}

/** Container width via ResizeObserver (responsive charts). */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

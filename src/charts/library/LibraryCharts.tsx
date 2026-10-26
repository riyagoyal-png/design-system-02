// Chart Library renderers — batch 1. Geometry follows the Pulse chart library (read-only reference); styling is §7 only:
// the same tokens, axis/label styles, tooltips (useChartTip), legends and empty states as the existing charts.
import type { ReactNode } from 'react';
import { sankey, sankeyJustify, sankeyLinkHorizontal, type SankeyLink, type SankeyNode } from 'd3-sankey';
import { ChartEmpty, fmtCompact, fmtInt, fmtPct, niceTicks, TipContent, useChartTip, useWidth } from '../core';
import { labelInterval } from '../Charts';
import { CATEGORICAL, GUIDE, SEQUENTIAL, seqStep } from './scales';
import india from './india.internal.json';

export const H = 300; // size/chart-plot
export const L = 38;  // y axis 28 + 10 gap (§7.3)
export const fmt1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** Measured SVG plot: width follows the card; the chart is a group with an accessible name. */
export function Svg({ label, height = H + 34, children, overlay }: { label: string; height?: number | ((w: number) => number); children: (w: number) => ReactNode; overlay?: ReactNode }) {
  const { ref, w } = useWidth<HTMLDivElement>();
  return <div ref={ref} className="cl-svg" role="group" aria-label={label}><svg width={w} height={typeof height === 'function' ? height(w) : height} aria-hidden="false">{children(w)}</svg>{overlay}</div>;
}
export function YTicks({ ticks, y, x = L - 10, anchor = 'end', format = fmtCompact }: { ticks: number[]; y: (v: number) => number; x?: number; anchor?: 'end' | 'start'; format?: (n: number) => string }) {
  return <g aria-hidden="true">{ticks.map(t => <text key={t} className="cl-tick" x={x} y={y(t) + 4} textAnchor={anchor}>{format(t)}</text>)}</g>;
}
export const Baseline = ({ x, w }: { x: number; w: number }) => <line className="cl-baseline" x1={x} x2={x + w} y1={H + 0.5} y2={H + 0.5} />;
export const pathOf = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/* ── #30 Histogram ─────────────────────────────────────────────── */
export function Histogram({ bins, label, unit }: { bins: { low: number; high: number; value: number }[]; label: string; unit: string }) {
  const { container, bind, node } = useChartTip();
  if (!bins.length) return <ChartEmpty />;
  const ticks = niceTicks(Math.max(...bins.map(b => b.value))), max = ticks[6];
  const lo = bins[0].low, hi = bins[bins.length - 1].high;
  return <div ref={container} className="ds-chart">
    <Svg label={label} height={H + 54}>{w => {
      const pw = w - L - 8, x = (v: number) => L + (v - lo) / (hi - lo) * pw, y = (v: number) => H - v / max * H;
      const edges = bins.length > 12 ? bins.filter((_, i) => i % 2 === 0).map(b => b.low).concat(hi) : bins.map(b => b.low).concat(hi);
      return <>
        <YTicks ticks={ticks} y={y} />
        {bins.map((b, i) => <rect key={b.low} className="cl-mark" x={x(b.low)} y={y(b.value)} width={Math.max(0, x(b.high) - x(b.low) - 1)} height={H - y(b.value)} fill={CATEGORICAL[0]}
          tabIndex={0} role="img" aria-label={`${b.low}–${b.high} ${unit}: ${b.value}`} {...bind(<TipContent title={`${b.low}–${b.high} ${unit}`} rows={[['Count', fmtInt(b.value)]]} />, `h${i}`)} />)}
        <Baseline x={L} w={pw} />
        {edges.map(e => <text key={e} className="cl-tick" x={x(e)} y={H + 22} textAnchor="middle">{e}</text>)}
        <text className="cl-axis-title" x={L + pw / 2} y={H + 48} textAnchor="middle">{`Inspection duration · ${unit}`}</text>
      </>;
    }}</Svg>{node}
  </div>;
}

/* ── #8 Pie (documented alternative to Donut) ──────────────────── */
export function Pie({ data, label }: { data: { label: string; value: number; color: string }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <ChartEmpty height={180} />;
  const R = 90, gap = 2 / (R / 2); let acc = 0;
  const arc = (a0: number, a1: number) => { const p = (a: number) => [90 + R * Math.sin(a), 90 - R * Math.cos(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M90,90 L${x0},${y0} A${R},${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`; };
  return <div ref={container} className="ds-donut" role="group" aria-label={label}>
    <svg width="180" height="180" viewBox="0 0 180 180" className="ds-donut__ring">{data.map((d, i) => { const a0 = acc / total * 2 * Math.PI; acc += d.value; const a1 = acc / total * 2 * Math.PI - (data.length > 1 ? gap : 0);
      return <path key={d.label} className="cl-mark" d={arc(a0, a1)} fill={d.color} tabIndex={0} role="img" aria-label={`${d.label}: ${fmtInt(d.value)} (${fmtPct(d.value / total * 100)})`} {...bind(<TipContent title={d.label} color={d.color} rows={[['Value', `${fmtInt(d.value)} (${fmtPct(d.value / total * 100)})`]]} />, `p${i}`)} />; })}</svg>
    <ul className="ds-donut__legend">{data.map(d => <li key={d.label}><span className="ds-donut__row"><span className="ds-legend__item"><span className="ds-legend__mark" style={{ background: d.color }} aria-hidden="true" />{d.label}</span><span>{fmtInt(d.value)} ({fmtPct(d.value / total * 100)})</span></span></li>)}</ul>
    {node}
  </div>;
}

/* ── #21 #22 #37 Range rows (dumbbell / lollipop / dot) ─────────── */
export function RangePlot({ rows, style, max, label, format = fmt1 }: { rows: { name: string; previous?: number; current: number }[]; style: 'dumbbell' | 'lollipop' | 'dot'; max: number; label: string; format?: (n: number) => string }) {
  const { container, bind, node } = useChartTip();
  if (!rows.length) return <ChartEmpty height={200} />;
  const ticks = Array.from({ length: 6 }, (_, i) => +(max * i / 5).toFixed(2));
  // Below 400px the label sits above its track (Figma Range row layout=stacked), so the scale keeps its width.
  return <div ref={container} className="ds-chart">
    <Svg label={label} height={w => rows.length * (w < 400 ? 56 : 36) + 30}>{w => {
      const st = w < 400, rowH = st ? 56 : 36, LB = st ? 0 : 154 + 12, tw = w - LB - 16, x = (v: number) => LB + v / max * tw;
      return <>
        {ticks.map(t => <g key={t} aria-hidden="true"><line className="cl-gridline" x1={x(t)} x2={x(t)} y1={0} y2={rows.length * rowH} /><text className="cl-tick" x={x(t)} y={rows.length * rowH + 22} textAnchor="middle">{format(t)}</text></g>)}
        {rows.map((r, i) => { const cy = st ? i * rowH + 38 : i * rowH + rowH / 2; const tip = <TipContent title={r.name} rows={[...(r.previous != null && style === 'dumbbell' ? [['Previous', format(r.previous)] as [string, string]] : []), ['Current', format(r.current)]]} />;
          return <g key={r.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${r.name}: ${style === 'dumbbell' && r.previous != null ? `${format(r.previous)} → ` : ''}${format(r.current)}`} {...bind(tip, `r${i}`)}>
            <text className="cl-row-label" x={0} y={st ? cy - 18 : cy + 5}>{r.name}</text>
            {style === 'dumbbell' && r.previous != null && <><line x1={x(r.previous)} x2={x(r.current)} y1={cy} y2={cy} stroke={GUIDE} strokeWidth={2} /><circle cx={x(r.previous)} cy={cy} r={4} fill={CATEGORICAL[0]} /></>}
            {style === 'lollipop' && <line x1={x(0)} x2={x(r.current)} y1={cy} y2={cy} stroke={CATEGORICAL[3]} strokeWidth={2} />}
            <circle cx={x(r.current)} cy={cy} r={5} fill={style === 'dot' ? CATEGORICAL[0] : CATEGORICAL[3]} />
          </g>; })}
      </>;
    }}</Svg>{node}
  </div>;
}

/* ── shared monthly line frame ─────────────────────────────────── */
function MonthFrame({ label, names, ticks, yFormat, children, rightTicks }: { label: string; names: string[]; ticks: number[]; yFormat?: (n: number) => string; children: (x: (i: number) => number, pw: number) => ReactNode; rightTicks?: { ticks: number[]; y: (v: number) => number } }) {
  const lo = ticks[0], hi = ticks[6];
  return <Svg label={label}>{w => {
    const pw = w - L - (rightTicks ? 38 : 8), x = (i: number) => L + (i + 0.5) / names.length * pw, y = (v: number) => H - (v - lo) / (hi - lo) * H;
    const monthly = names.every(n => /^[A-Z][a-z]{2}$/.test(n)); // calendar steps (quarterly, half-year) for month axes
    const every = labelInterval(pw / names.length, Math.max(28, Math.max(...names.map(n => n.length)) * 7.5 + 8), names.length, monthly ? [1, 3, 6, 12] : undefined);
    return <>
      <YTicks ticks={ticks} y={y} format={yFormat} />
      {rightTicks && <YTicks ticks={rightTicks.ticks} y={rightTicks.y} x={L + pw + 10} anchor="start" format={v => `${v}`} />}
      <Baseline x={L} w={pw} />
      {names.map((n, i) => i % every === 0 && <text key={n} className="cl-xlabel" x={x(i)} y={H + 24} textAnchor="middle">{n}</text>)}
      {children(x, pw)}
    </>;
  }}</Svg>;
}

/* ── #7 Line + forecast band ───────────────────────────────────── */
export function ForecastChart({ data, showBand, showForecast, label }: { data: { name: string; output: number; forecast: number; low: number; high: number }[]; showBand: boolean; showForecast: boolean; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const ticks = niceTicks(Math.max(...data.flatMap(d => [d.output, d.high]))), y = (v: number) => H - v / ticks[6] * H;
  return <div ref={container} className="ds-chart">
    <MonthFrame label={label} names={data.map(d => d.name)} ticks={ticks}>{x => <>
      {showBand && <path d={pathOf([...data.map((d, i) => [x(i), y(d.high)] as [number, number]), ...data.map((d, i) => [x(i), y(d.low)] as [number, number]).reverse()]) + 'Z'} fill="var(--ds-chart-cat-2)" opacity={0.16} />}
      {showForecast && <path d={pathOf(data.map((d, i) => [x(i), y(d.forecast)]))} fill="none" stroke="var(--ds-chart-cat-2)" strokeWidth={2} strokeDasharray="6 5" />}
      <path d={pathOf(data.map((d, i) => [x(i), y(d.output)]))} fill="none" stroke="var(--ds-chart-cat-1)" strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => <circle key={d.name} className="cl-mark" cx={x(i)} cy={y(d.output)} r={3} fill="var(--ds-chart-cat-1)" tabIndex={0} role="img" aria-label={`${d.name}: actual ${d.output}, forecast ${d.forecast}`}
        {...bind(<TipContent title={d.name} rows={[['Actual', `${d.output}k`], ...(showForecast ? [['Forecast', `${d.forecast}k`] as [string, string]] : []), ...(showBand ? [['95% band', `${fmt1(d.low)}–${fmt1(d.high)}k`] as [string, string]] : [])]} />, `f${i}`)} />)}
    </>}</MonthFrame>{node}
  </div>;
}

/* ── #45 Step ──────────────────────────────────────────────────── */
export function StepChart({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const ticks = niceTicks(Math.max(...data.map(d => d.value))), y = (v: number) => H - v / ticks[6] * H;
  return <div ref={container} className="ds-chart">
    <MonthFrame label={label} names={data.map(d => d.name)} ticks={ticks}>{x => { const pts: [number, number][] = []; data.forEach((d, i) => { pts.push([x(i), y(d.value)]); if (i < data.length - 1) pts.push([x(i + 1), y(d.value)]); });
      return <><path d={pathOf(pts)} fill="none" stroke="var(--ds-chart-cat-1)" strokeWidth={2} />
        {data.map((d, i) => <rect key={d.name} className="cl-hit" x={x(i) - 10} y={0} width={20} height={H} tabIndex={0} role="img" aria-label={`${d.name}: ${d.value} pallets`} {...bind(<TipContent title={d.name} rows={[['Inventory', `${d.value} pallets`]]} />, `s${i}`)} />)}</>; }}</MonthFrame>{node}
  </div>;
}

/* ── #43 Control chart ─────────────────────────────────────────── */
export function ControlChart({ data, limits, showLimits, label }: { data: { sample: number; value: number }[]; limits: { mean: number; lower: number; upper: number }; showLimits: boolean; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  // A control chart reads deviation around the centre: the axis brackets the limits (documented exception to zero-based bar ticks).
  const span = Math.max(limits.upper - limits.mean, ...data.map(d => Math.abs(d.value - limits.mean))) * 1.2, step = Math.ceil(span / 3 * 2) / 2 || 1;
  const ticks = Array.from({ length: 7 }, (_, i) => +(limits.mean + (i - 3) * step).toFixed(2)), lo = ticks[0], hi = ticks[6], y = (v: number) => H - (v - lo) / (hi - lo) * H;
  const out = (v: number) => v > limits.upper || v < limits.lower;
  return <div ref={container} className="ds-chart">
    <MonthFrame label={label} names={data.map(d => String(d.sample))} ticks={ticks} yFormat={v => `${v}`}>{(x, pw) => <>
      {showLimits && [['CL', limits.mean, 'cl-ref'], ['UCL', limits.upper, 'cl-ref cl-ref--limit'], ['LCL', limits.lower, 'cl-ref cl-ref--limit']].map(([n, v, c]) => <g key={n as string} aria-hidden="true"><line className={c as string} x1={L} x2={L + pw} y1={y(v as number)} y2={y(v as number)} /><text className="cl-ref-label" x={L + pw - 2} y={y(v as number) - 5} textAnchor="end">{`${n} ${v}`}</text></g>)}
      <path d={pathOf(data.map((d, i) => [x(i), y(d.value)]))} fill="none" stroke="var(--ds-chart-cat-1)" strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => <g key={d.sample} className="cl-mark" tabIndex={0} role="img" aria-label={`Sample ${d.sample}: ${d.value} g${out(d.value) ? ', outside control limits' : ''}`} {...bind(<TipContent title={`Sample ${d.sample}`} rows={[['Fill weight', `${d.value} g`], ...(out(d.value) ? [['Status', 'Outside 3σ limits'] as [string, string]] : [])]} />, `c${i}`)}>
        {out(d.value) ? <path d={`M${x(i)},${y(d.value) - 6} l6,6 -6,6 -6,-6Z`} fill="var(--ds-color-error)" /> : <circle cx={x(i)} cy={y(d.value)} r={2.5} fill="var(--ds-chart-cat-1)" />}
      </g>)}
    </>}</MonthFrame>{node}
  </div>;
}

/* ── #25 Pareto ────────────────────────────────────────────────── */
export function ParetoChart({ data, label }: { data: { name: string; count: number; cumulative: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const ticks = niceTicks(Math.max(...data.map(d => d.count))), y = (v: number) => H - v / ticks[6] * H, yr = (v: number) => H - v / 120 * H;
  return <div ref={container} className="ds-chart">
    <MonthFrame label={label} names={data.map(d => d.name)} ticks={ticks} rightTicks={{ ticks: [0, 20, 40, 60, 80, 100, 120], y: yr }}>{(x, pw) => { const bw = Math.max(6, Math.min(74, pw / data.length * 0.5));
      return <>
        {data.map((d, i) => <rect key={d.name} className="cl-mark" x={x(i) - bw / 2} y={y(d.count)} width={bw} height={H - y(d.count)} rx={2} fill="var(--ds-chart-cat-1)" tabIndex={0} role="img" aria-label={`${d.name}: ${d.count} defects, cumulative ${fmtPct(d.cumulative)}`} {...bind(<TipContent title={d.name} rows={[['Defects', fmtInt(d.count)], ['Cumulative', fmtPct(d.cumulative)]]} />, `pa${i}`)} />)}
        <path d={pathOf(data.map((d, i) => [x(i), yr(d.cumulative)]))} fill="none" stroke="var(--ds-chart-cat-4)" strokeWidth={2} />
        {data.map((d, i) => <circle key={d.name} cx={x(i)} cy={yr(d.cumulative)} r={3} fill="var(--ds-chart-cat-4)" aria-hidden="true" />)}
      </>; }}</MonthFrame>{node}
  </div>;
}

/* ── #12 Scatter / quadrant matrix ─────────────────────────────── */
export const SHAPES = ['circle', 'diamond', 'triangle'] as const;
export function PointMark({ shape, x, y, color }: { shape: typeof SHAPES[number]; x: number; y: number; color: string }) {
  if (shape === 'circle') return <circle cx={x} cy={y} r={5} fill={color} />;
  if (shape === 'diamond') return <path d={`M${x},${y - 5.5}L${x + 5.5},${y}L${x},${y + 5.5}L${x - 5.5},${y}Z`} fill={color} />;
  return <path d={`M${x},${y - 5.5}L${x + 5.5},${y + 4.5}L${x - 5.5},${y + 4.5}Z`} fill={color} />;
}
export function ScatterPlot({ points, groups, tx, ty, label }: { points: { name: string; skill: number; output: number; group: number }[]; groups: string[]; tx: number; ty: number; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!points.length) return <ChartEmpty />;
  const ticks = [40, 50, 60, 70, 80, 90, 100];
  return <div ref={container} className="ds-chart">
    <Svg label={label} height={H + 54}>{w => {
      const pw = w - L - 30, x = (v: number) => L + (v - 40) / 60 * pw, y = (v: number) => H - (v - 40) / 60 * H;
      return <>
        <YTicks ticks={ticks} y={y} format={v => `${v}`} />
        <Baseline x={L} w={pw} />
        <g aria-hidden="true"><line className="cl-ref" x1={x(tx)} x2={x(tx)} y1={0} y2={H} /><line className="cl-ref" x1={L} x2={L + pw} y1={y(ty)} y2={y(ty)} /><text className="cl-ref-label" x={x(tx) + 4} y={12}>{tx}%</text><text className="cl-ref-label" x={L + pw + 4} y={y(ty) + 4}>{ty}%</text></g>
        {points.map((p, i) => <g key={p.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${p.name}, ${groups[p.group]}: skill ${p.skill}%, output ${p.output}%`} {...bind(<TipContent title={p.name} sub={groups[p.group]} color={CATEGORICAL[p.group]} rows={[['Skill coverage', `${p.skill}%`], ['Output attainment', `${p.output}%`]]} />, `sc${i}`)}>
          <PointMark shape={SHAPES[p.group]} x={x(p.skill)} y={y(p.output)} color={CATEGORICAL[p.group]} /></g>)}
        {ticks.map(t => <text key={t} className="cl-tick" x={x(t)} y={H + 22} textAnchor="middle">{t}</text>)}
        <text className="cl-axis-title" x={L + pw / 2} y={H + 48} textAnchor="middle">Skill coverage · %</text>
      </>;
    }}</Svg>{node}
  </div>;
}
export function ShapeLegend({ groups }: { groups: string[] }) {
  return <ul className="ds-legend ds-legend--dot" aria-label="Legend">{groups.map((g, i) => <li key={g}><svg width="12" height="12" aria-hidden="true"><PointMark shape={SHAPES[i]} x={6} y={6} color={CATEGORICAL[i]} /></svg><span>{g}</span></li>)}</ul>;
}

/* ── #48 Sankey (d3-sankey, as in Pulse) ───────────────────────── */
type SN = { name: string }; type SL = { source: number; target: number; value: number };
export function SankeyChart({ nodes, links, label, unit }: { nodes: SN[]; links: SL[]; label: string; unit: string }) {
  const { container, bind, node } = useChartTip();
  if (!links.length) return <ChartEmpty />;
  return <div ref={container} className="ds-chart">
    <Svg label={label} height={H + 20}>{w => {
      const g = sankey<SN, SL>().nodeWidth(10).nodePadding(18).nodeAlign(sankeyJustify).extent([[0, 10], [w, H + 10]])({ nodes: nodes.map(n => ({ ...n })), links: links.map(l => ({ ...l })) });
      const color = (n: SankeyNode<SN, SL>) => CATEGORICAL[(n.index ?? 0) % CATEGORICAL.length];
      return <>
        {g.links.map((l: SankeyLink<SN, SL>, i) => { const s = l.source as SankeyNode<SN, SL>, t = l.target as SankeyNode<SN, SL>;
          return <path key={i} className="cl-mark cl-ribbon" d={sankeyLinkHorizontal()(l) ?? ''} fill="none" stroke={color(s)} strokeOpacity={0.35} strokeWidth={Math.max(1, l.width ?? 1)} tabIndex={0} role="img" aria-label={`${s.name} to ${t.name}: ${l.value} ${unit}`} {...bind(<TipContent title={s.name} sub={t.name} color={color(s)} rows={[['Flow', `${fmtInt(l.value)} ${unit}`]]} />, `l${i}`)} />; })}
        {g.nodes.map((n, i) => { const right = (n.x0 ?? 0) > w / 2 + 20; const tx = right ? (n.x0 ?? 0) - 6 : (n.x1 ?? 0) + 6, cy = ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2;
          return <g key={n.name} tabIndex={0} role="img" className="cl-mark" aria-label={`${n.name}: ${n.value} ${unit}`} {...bind(<TipContent title={n.name} color={color(n)} rows={[['Total', `${fmtInt(n.value ?? 0)} ${unit}`]]} />, `n${i}`)}>
            <rect x={n.x0} y={n.y0} width={(n.x1 ?? 0) - (n.x0 ?? 0)} height={Math.max(1, (n.y1 ?? 0) - (n.y0 ?? 0))} rx={2} fill={color(n)} />
            <text className="cl-node-label" x={tx} y={cy - 2} textAnchor={right ? 'end' : 'start'}>{n.name}</text>
            <text className="cl-node-value" x={tx} y={cy + 14} textAnchor={right ? 'end' : 'start'}>{fmtInt(n.value ?? 0)}</text>
          </g>; })}
      </>;
    }}</Svg>{node}
  </div>;
}

/* ── #15 Choropleth (India geometry — internal reference only) ─── */
const MAP = india as { viewBox: string; shapes: { name: string; d: string }[] };
export function Choropleth({ values, label }: { values: Record<string, number>; label: string }) {
  const { container, bind, node } = useChartTip();
  const vs = Object.values(values); const min = Math.min(...vs), max = Math.max(...vs);
  return <div ref={container} className="ds-chart cl-map">
    <svg viewBox={MAP.viewBox} className="cl-map__svg" role="group" aria-label={label}>
      {MAP.shapes.map((s, i) => { const v = values[s.name];
        return <path key={s.name} className="cl-mark cl-region" d={s.d} fillRule="evenodd" fill={v == null ? 'var(--ds-chart-track)' : SEQUENTIAL[seqStep(v, min, max)]} tabIndex={v == null ? -1 : 0} role="img" aria-label={v == null ? `${s.name}: no data` : `${s.name}: ${fmtInt(v)} people`}
          {...bind(<TipContent title={s.name} rows={[['Headcount', v == null ? 'No data' : fmtInt(v)]]} />, `m${i}`)} />; })}
    </svg>
    <div className="cl-seq-legend" aria-label="Legend"><span>{fmtInt(min)}</span><span className="cl-seq-legend__ramp">{SEQUENTIAL.map(c => <i key={c} style={{ background: c }} />)}</span><span>{fmtInt(max)}</span><span className="cl-seq-legend__nd"><i />No data</span></div>
    {node}
  </div>;
}

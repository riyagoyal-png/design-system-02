// Chart Library renderers — batches 2–6 (the 37 remaining types). Geometry follows the Pulse chart library (read-only reference);
// styling is §7 only. Every renderer recomputes its geometry from the measured width (no viewBox scaling):
//  · categorical charts use equal bands (mark = 50% of the band, 6–74px) and thin their labels by measured space;
//  · row charts stack the label above the track below 400px;
//  · square / radial charts fit the largest centred square and never stretch;
//  · stretchable fields (density, stream, treemap …) are laid out again at the new width.
import type { ReactNode } from 'react';
import { arc as d3arc, area, curveBasis, curveMonotoneX, stack, stackOffsetWiggle, stackOrderInsideOut } from 'd3-shape';
import { cluster, hierarchy, pack, partition, treemap, treemapSquarify, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
import { chord, ribbon } from 'd3-chord';
import { contours } from 'd3-contour';
import { hexbin } from 'd3-hexbin';
import { sankey, sankeyLinkHorizontal, type SankeyLink, type SankeyNode } from 'd3-sankey';
import { ChartEmpty, fmtInt, niceTicks, TipContent, useChartTip, useWidth } from '../core';
import { labelInterval } from '../Charts';
import { CATEGORICAL, GUIDE, SEQUENTIAL } from './scales';
import { Baseline, fmt1, H, L, pathOf, Svg, YTicks } from './LibraryCharts';
import india from './india.internal.json';
import type { HNode } from './data';

const POS = 'var(--ds-chart-positive)', NEG = 'var(--ds-chart-negative)', TRACK = 'var(--ds-chart-track)', INK = 'var(--ds-color-text-primary)', CARD = 'var(--ds-color-surface-base)';
const mid = (i: number, n: number, x0: number, w: number) => x0 + (i + 0.5) / n * w;
const markW = (band: number) => Math.max(6, Math.min(74, band * 0.5));
/** A tile label is drawn only where its text (≈ 7 px per character at 12 px) plus padding fits the tile — never clipped or overflowing. */
const fits = (text: string, width: number, pad: number) => text.length * 7 + pad <= width;
const need = (labels: string[]) => Math.min(80, Math.max(24, Math.max(...labels.map(l => l.length)) * 7.2 + 8));
/** Even ticks (≤ 7) covering [min, max] with a nice step — the axis ends at the first step past the data (non-zero-based axes: box, error, price, Q–Q). */
function niceDomain(min: number, max: number) {
  const raw = (max - min) / 6 || 1, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw)!;
  const lo = Math.floor(min / step) * step, n = Math.ceil((max - lo) / step - 1e-9); return Array.from({ length: n + 1 }, (_, i) => +(lo + i * step).toFixed(6));
}
const last = (t: number[]) => t[t.length - 1];
const lin = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + (v - d0) / (d1 - d0 || 1) * (r1 - r0);

/** Category labels under bands; thinned to every k-th band when the measured band is too narrow. */
function BandLabels({ names, x0, pw, y = H + 24 }: { names: string[]; x0: number; pw: number; y?: number }) {
  const band = pw / names.length, every = labelInterval(band, need(names), names.length);
  return <g aria-hidden="true">{names.map((n, i) => i % every === 0 && <text key={n + i} className="cl-xlabel" x={mid(i, names.length, x0, pw)} y={y} textAnchor="middle">{n}</text>)}</g>;
}
/** Row layout: 154px label column + track; below 400px the label sits above a full-width track. */
function useRows(w: number, n: number, rowH = 36) {
  const stacked = w < 400, LB = stacked ? 0 : 166, rh = stacked ? rowH + 20 : rowH, labelY = (i: number) => stacked ? i * rh + 14 : i * rh + rh / 2 + 5, cy = (i: number) => stacked ? i * rh + 20 + (rowH - 8) / 2 : i * rh + rh / 2;
  return { stacked, LB, rh, labelY, cy, h: n * rh };
}
/** Largest centred square that fits the width (radial charts never stretch). */
const square = (w: number, max = 260) => Math.max(120, Math.min(w - 16, max));
/** Square / radial charts are laid out at ≤ 272 px and grow in proportion beyond it, up to 1.35× (≈ 367 px); text keeps its size.
 *  Mirrors the Figma templates: an aspect-locked drawing that fills the card up to the same cap. */
const RADIAL = 272, grow = (w: number) => Math.min(1.35, Math.max(1, w / RADIAL)), w0 = (w: number) => Math.min(w, RADIAL);

/* ═══ Categorical (native band / row model) ═══════════════════════ */

/** #18 Waterfall: floating bars on the running total; totals from zero; dashed connectors at each level. */
export function Waterfall({ data, label }: { data: { name: string; value: number; total?: boolean }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  let run = 0; const bars = data.map(d => { const start = d.total ? 0 : run, end = d.total ? d.value : run + d.value; run = end; return { ...d, start, end }; });
  const ticks = niceTicks(Math.max(...bars.map(b => Math.max(b.start, b.end)))), y = (v: number) => H - v / ticks[6] * H;
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 34}>{w => {
    const pw = w - L - 8, bw = pw / data.length, mw = markW(bw);
    return <><YTicks ticks={ticks} y={y} /><Baseline x={L} w={pw} />
      {bars.map((b, i) => { const cx = mid(i, data.length, L, pw), top = y(Math.max(b.start, b.end)), hh = Math.abs(y(b.start) - y(b.end)), c = b.total ? CATEGORICAL[0] : b.value >= 0 ? POS : NEG;
        return <g key={b.name}>
          {i < bars.length - 1 && <line x1={cx + mw / 2} x2={mid(i + 1, data.length, L, pw) - mw / 2} y1={y(b.end)} y2={y(b.end)} stroke={GUIDE} strokeDasharray="3 3" aria-hidden="true" />}
          <rect className="cl-mark" x={cx - mw / 2} y={top} width={mw} height={Math.max(1, hh)} rx={2} fill={c} tabIndex={0} role="img" aria-label={`${b.name}: ${b.value > 0 && !b.total ? '+' : ''}${b.value}, running total ${b.end}`}
            {...bind(<TipContent title={b.name} rows={[[b.total ? 'Total' : 'Change', `${b.value > 0 && !b.total ? '+' : ''}${fmtInt(b.value)}`], ['Running total', fmtInt(b.end)]]} />, `w${i}`)} />
        </g>; })}
      <BandLabels names={data.map(d => d.name)} x0={L} pw={pw} /></>;
  }}</Svg>{node}</div>;
}

/** #31 Box-and-whisker: Tukey whiskers, IQR box, median line, outliers as rings. */
export function BoxPlot({ data, label, unit = 's' }: { data: { name: string; q1: number; median: number; q3: number; low: number; high: number; outliers: number[] }[]; label: string; unit?: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const ticks = niceDomain(Math.min(...data.flatMap(d => [d.low, ...d.outliers])), Math.max(...data.flatMap(d => [d.high, ...d.outliers]))), y = lin(ticks[0], last(ticks), H, 0);
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => {
    const pw = w - L - 8, mw = markW(pw / data.length);
    return <><YTicks ticks={ticks} y={y} format={v => `${v}`} /><Baseline x={L} w={pw} />
      {data.map((d, i) => { const cx = mid(i, data.length, L, pw);
        return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: median ${fmt1(d.median)} ${unit}, IQR ${fmt1(d.q1)}–${fmt1(d.q3)}, whiskers ${fmt1(d.low)}–${fmt1(d.high)}${d.outliers.length ? `, ${d.outliers.length} outlier` : ''}`}
          {...bind(<TipContent title={d.name} rows={[['Median', `${fmt1(d.median)} ${unit}`], ['Q1–Q3', `${fmt1(d.q1)}–${fmt1(d.q3)}`], ['Whiskers', `${fmt1(d.low)}–${fmt1(d.high)}`], ...(d.outliers.length ? [['Outliers', d.outliers.join(', ')] as [string, string]] : [])]} />, `bx${i}`)}>
          <line x1={cx} x2={cx} y1={y(d.high)} y2={y(d.low)} stroke={GUIDE} strokeWidth={2} />
          <line x1={cx - mw / 4} x2={cx + mw / 4} y1={y(d.high)} y2={y(d.high)} stroke={GUIDE} strokeWidth={2} /><line x1={cx - mw / 4} x2={cx + mw / 4} y1={y(d.low)} y2={y(d.low)} stroke={GUIDE} strokeWidth={2} />
          <rect x={cx - mw / 2} y={y(d.q3)} width={mw} height={y(d.q1) - y(d.q3)} rx={2} fill={CATEGORICAL[i % 4]} opacity={0.85} />
          <line x1={cx - mw / 2} x2={cx + mw / 2} y1={y(d.median)} y2={y(d.median)} stroke={INK} strokeWidth={2} />
          {d.outliers.map(o => <circle key={o} cx={cx} cy={y(o)} r={5} fill={CATEGORICAL[0]} />)}
        </g>; })}
      <BandLabels names={data.map(d => d.name)} x0={L} pw={pw} /></>;
  }}</Svg>{node}</div>;
}

/** #39 Error bars: mean dot with ± interval whiskers. */
export function ErrorBars({ data, label }: { data: { name: string; value: number; error: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const ticks = niceDomain(Math.min(...data.map(d => d.value - d.error)) - 1, Math.max(...data.map(d => d.value + d.error)) + 1), y = lin(ticks[0], last(ticks), H, 0);
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => {
    const pw = w - L - 8, mw = markW(pw / data.length);
    return <><YTicks ticks={ticks} y={y} format={v => `${v}`} /><Baseline x={L} w={pw} />
      {data.map((d, i) => { const cx = mid(i, data.length, L, pw);
        return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${d.value} ± ${d.error} min`} {...bind(<TipContent title={d.name} rows={[['Mean', `${d.value} min`], ['95% interval', `${fmt1(d.value - d.error)}–${fmt1(d.value + d.error)}`]]} />, `e${i}`)}>
          <line x1={cx} x2={cx} y1={y(d.value + d.error)} y2={y(d.value - d.error)} stroke={CATEGORICAL[0]} strokeWidth={2} />
          {[d.value + d.error, d.value - d.error].map(v => <line key={v} x1={cx - mw / 4} x2={cx + mw / 4} y1={y(v)} y2={y(v)} stroke={CATEGORICAL[0]} strokeWidth={2} />)}
          <circle cx={cx} cy={y(d.value)} r={5} fill={CATEGORICAL[0]} />
        </g>; })}
      <BandLabels names={data.map(d => d.name)} x0={L} pw={pw} /></>;
  }}</Svg>{node}</div>;
}

/** #40 Candlestick and #44 OHLC: wick = high–low; body (candle) or open/close ticks (OHLC); rising positive, falling negative. */
export function PriceChart({ data, kind, label }: { data: { name: string; open: number; close: number; high: number; low: number }[]; kind: 'candle' | 'ohlc'; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const ticks = niceDomain(Math.min(...data.map(d => d.low)), Math.max(...data.map(d => d.high))), y = lin(ticks[0], last(ticks), H, 0);
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => {
    const pw = w - L - 8, mw = markW(pw / data.length);
    return <><YTicks ticks={ticks} y={y} format={v => `${v}`} /><Baseline x={L} w={pw} />
      {data.map((d, i) => { const cx = mid(i, data.length, L, pw), up = d.close >= d.open, c = up ? POS : NEG;
        return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: open ${d.open}, high ${d.high}, low ${d.low}, close ${d.close}`} {...bind(<TipContent title={d.name} rows={[['Open', `${d.open}`], ['High', `${d.high}`], ['Low', `${d.low}`], ['Close', `${d.close}`]]} />, `o${i}`)}>
          <line x1={cx} x2={cx} y1={y(d.high)} y2={y(d.low)} stroke={c} strokeWidth={kind === 'ohlc' ? 2 : 1.5} />
          {kind === 'candle' ? <rect x={cx - mw / 2} y={y(Math.max(d.open, d.close))} width={mw} height={Math.max(1, Math.abs(y(d.open) - y(d.close)))} fill={c} rx={1} />
            : <><line x1={cx - mw / 2} x2={cx} y1={y(d.open)} y2={y(d.open)} stroke={c} strokeWidth={2} /><line x1={cx} x2={cx + mw / 2} y1={y(d.close)} y2={y(d.close)} stroke={c} strokeWidth={2} /></>}
        </g>; })}
      <BandLabels names={data.map(d => d.name)} x0={L} pw={pw} /></>;
  }}</Svg>{node}</div>;
}

/** #28 Marimekko: column width = plant share (data, so never equal bands); segment height = mix share. */
export function Marimekko({ data, series, label }: { data: { name: string; width: number; mix: number[] }[]; series: string[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const total = data.reduce((s, d) => s + d.width, 0), y = (v: number) => H - v / 100 * H;
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => {
    const pw = w - L - 8; let acc = 0;
    return <><YTicks ticks={[0, 20, 40, 60, 80, 100]} y={y} format={v => `${v}%`} /><Baseline x={L} w={pw} />
      {data.map((d, i) => { const x0 = L + acc / total * pw, cw = d.width / total * pw; acc += d.width; let up = 0;
        return <g key={d.name}>
          {d.mix.map((m, k) => { const y1 = y(up), y0 = y(up + m); up += m;
            return <rect key={k} className="cl-mark" x={x0 + 1} y={y0 + 1} width={Math.max(0, cw - 2)} height={Math.max(0, y1 - y0 - 2)} fill={CATEGORICAL[k]} tabIndex={0} role="img" aria-label={`${d.name}, ${series[k]}: ${m}% of a ${d.width}% plant`}
              {...bind(<TipContent title={d.name} sub={series[k]} color={CATEGORICAL[k]} rows={[['Share of plant', `${m}%`], ['Plant share', `${d.width}%`]]} />, `m${i}${k}`)} />; })}
          <text className="cl-xlabel" x={x0 + cw / 2} y={H + 24} textAnchor="middle" aria-hidden="true">{cw > 112 ? `${d.name} · ${d.width}%` : cw > 56 ? d.name : ''}</text>
        </g>; })}</>;
  }}</Svg>{node}</div>;
}

/** #19 Funnel: centred stage bars, width = value / first stage; conversion from the previous stage. */
export function Funnel({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const { ref, w } = useWidth<HTMLDivElement>();
  if (!data.length) return <ChartEmpty height={200} />;
  const r = useRowsLayout(w, data.length, 44), max = data[0].value;
  // Stage value and conversion sit under the stage name (Figma: H-bar row layout=centered, Sub text), so the widest stage can use the full track.
  return <div ref={container} className="ds-chart"><div ref={ref} className="cl-svg" role="group" aria-label={label}><svg width={w} height={r.h + (r.stacked ? data.length * 14 : 0)} aria-hidden="false">
    {data.map((d, i) => { const tw = w - r.LB - 4, bw = Math.max(6, d.value / max * tw), cx = r.LB + tw / 2, conv = i ? d.value / data[i - 1].value * 100 : 100, oy = r.stacked ? i * 14 : 0;
      return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${fmtInt(d.value)} (${conv.toFixed(0)}% of the previous stage)`} {...bind(<TipContent title={d.name} rows={[['Candidates', fmtInt(d.value)], ['From previous stage', `${conv.toFixed(1)}%`]]} />, `fu${i}`)}>
        <text className="cl-row-label" x={0} y={r.labelY(i) + oy - (r.stacked ? 0 : 8)}>{d.name}</text>
        <text className="cl-node-value" x={0} y={r.labelY(i) + oy + (r.stacked ? 14 : 8)}>{fmtInt(d.value)} · {i ? `${conv.toFixed(0)}% of previous` : '100%'}</text>
        <rect x={cx - bw / 2} y={r.cy(i) + oy + (r.stacked ? 14 : 0) - 12} width={bw} height={24} rx={3} fill={CATEGORICAL[0]} opacity={1 - i * 0.12} />
      </g>; })}
  </svg></div>{node}</div>;
}
function useRowsLayout(w: number, n: number, rowH: number) { return useRows(w, n, rowH); }

/** #20 Bullet: qualitative bands (track tints), measure bar, target tick; 0–100 scale. */
export function Bullet({ data, label }: { data: { name: string; actual: number; target: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const { ref, w } = useWidth<HTMLDivElement>();
  if (!data.length) return <ChartEmpty height={200} />;
  const r = useRows(w, data.length, 40), ticks = [0, 20, 40, 60, 80, 100];
  return <div ref={container} className="ds-chart"><div ref={ref} className="cl-svg" role="group" aria-label={label}><svg width={w} height={r.h + 26} aria-hidden="false">
    {(() => { const tw = w - r.LB - 12, x = (v: number) => r.LB + v / 100 * tw;
      return <>{data.map((d, i) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${d.actual}% against a ${d.target}% target`} {...bind(<TipContent title={d.name} rows={[['Actual', `${d.actual}%`], ['Target', `${d.target}%`], ['Gap', `${d.actual - d.target > 0 ? '+' : ''}${d.actual - d.target} pts`]]} />, `bu${i}`)}>
          <text className="cl-row-label" x={0} y={r.labelY(i)}>{d.name}</text>
          {[[0, 60, 0.18], [60, 80, 0.3], [80, 100, 0.45]].map(([a, b, o]) => <rect key={a} x={x(a)} y={r.cy(i) - 12} width={x(b) - x(a)} height={24} fill={GUIDE} opacity={o / 0.2 * 0.5} />)}
          <rect x={x(0)} y={r.cy(i) - 5} width={x(d.actual) - x(0)} height={10} fill={CATEGORICAL[0]} />
          <line x1={x(d.target)} x2={x(d.target)} y1={r.cy(i) - 14} y2={r.cy(i) + 14} stroke={INK} strokeWidth={3} />
        </g>)}
        {ticks.map(t => <text key={t} className="cl-tick" x={x(t)} y={r.h + 18} textAnchor="middle" aria-hidden="true">{t}%</text>)}</>; })()}
  </svg></div>{node}</div>;
}

/** #26 Tornado and #27 Population pyramid: diverging rows around a shared zero. */
export function Diverging({ data, left, right, kind, label }: { data: { name: string; l: number; r: number }[]; left: string; right: string; kind: 'tornado' | 'pyramid'; label: string }) {
  const { container, bind, node } = useChartTip();
  const { ref, w } = useWidth<HTMLDivElement>();
  if (!data.length) return <ChartEmpty height={200} />;
  const r = useRows(w, data.length, 34), max = Math.max(...data.flatMap(d => [Math.abs(d.l), Math.abs(d.r)])), ticks = niceTicks(max), M = ticks[6];
  const lc = kind === 'tornado' ? NEG : CATEGORICAL[1], rc = kind === 'tornado' ? POS : CATEGORICAL[0], unit = kind === 'tornado' ? '%' : '';
  return <div ref={container} className="ds-chart"><div ref={ref} className="cl-svg" role="group" aria-label={label}><svg width={w} height={r.h + 26} aria-hidden="false">
    {(() => { const tw = w - r.LB - 8, c = r.LB + tw / 2, half = tw / 2 - 4, x = (v: number) => c + v / M * half, show = [ticks[0], ticks[3], ticks[6]];
      return <>{show.flatMap(t => t ? [-t, t] : [0]).map(t => <g key={t} aria-hidden="true"><line className="cl-gridline" x1={x(t)} x2={x(t)} y1={0} y2={r.h} /><text className="cl-tick" x={x(t)} y={r.h + 18} textAnchor="middle">{Math.abs(t)}{unit}</text></g>)}
        {data.map((d, i) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${left} ${Math.abs(d.l)}${unit}, ${right} ${d.r}${unit}`} {...bind(<TipContent title={d.name} rows={[[left, `${d.l}${unit}`], [right, `${d.r}${unit}`]]} />, `dv${i}`)}>
          <text className="cl-row-label" x={0} y={r.labelY(i)}>{d.name}</text>
          <rect x={x(-Math.abs(d.l))} y={r.cy(i) - 10} width={c - x(-Math.abs(d.l))} height={20} rx={2} fill={lc} />
          <rect x={c} y={r.cy(i) - 10} width={x(Math.abs(d.r)) - c} height={20} rx={2} fill={rc} />
        </g>)}
        <line x1={c} x2={c} y1={0} y2={r.h} stroke={INK} strokeWidth={1} aria-hidden="true" /></>; })()}
  </svg></div>{node}</div>;
}

/** #42 Gantt: bars on a shared day scale (start → end), progress fill; week ticks thinned by space. */
export function Gantt({ data, label }: { data: { name: string; start: number; end: number; progress: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const { ref, w } = useWidth<HTMLDivElement>();
  if (!data.length) return <ChartEmpty height={200} />;
  const r = useRows(w, data.length, 36), D = Math.ceil(Math.max(...data.map(d => d.end)) / 5) * 5;
  return <div ref={container} className="ds-chart"><div ref={ref} className="cl-svg" role="group" aria-label={label}><svg width={w} height={r.h + 26} aria-hidden="false">
    {(() => { const tw = w - r.LB - 8, x = (v: number) => r.LB + v / D * tw, ticks = Array.from({ length: D / 5 + 1 }, (_, i) => i * 5), every = labelInterval(tw / (ticks.length - 1), 40, ticks.length);
      return <>{ticks.map((t, i) => <g key={t} aria-hidden="true"><line className="cl-gridline" x1={x(t)} x2={x(t)} y1={0} y2={r.h} />{i % every === 0 && <text className="cl-tick" x={x(t)} y={r.h + 18} textAnchor="middle">{`D${t}`}</text>}</g>)}
        {data.map((d, i) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: day ${d.start} to ${d.end}, ${Math.round(d.progress * 100)}% complete`} {...bind(<TipContent title={d.name} rows={[['Start', `Day ${d.start}`], ['End', `Day ${d.end}`], ['Complete', `${Math.round(d.progress * 100)}%`]]} />, `g${i}`)}>
          <text className="cl-row-label" x={0} y={r.labelY(i)}>{d.name}</text>
          <rect x={x(d.start)} y={r.cy(i) - 9} width={x(d.end) - x(d.start)} height={18} rx={3} fill={CATEGORICAL[0]} opacity={0.35} />
          <rect x={x(d.start)} y={r.cy(i) - 9} width={(x(d.end) - x(d.start)) * d.progress} height={18} rx={3} fill={CATEGORICAL[0]} />
        </g>)}</>; })()}
  </svg></div>{node}</div>;
}

/* ═══ Freeform plots (Scatter model) ═══════════════════════════════ */

function Frame({ w, xt, yt, xFmt = (v: number) => `${v}`, yFmt = (v: number) => `${v}`, xTitle, yTitle, children, right = 16 }: { w: number; xt: number[]; yt: number[]; xFmt?: (v: number) => string; yFmt?: (v: number) => string; xTitle: string; yTitle?: string; right?: number; children: (x: (v: number) => number, y: (v: number) => number, pw: number) => ReactNode }) {
  const pw = w - L - right, x = lin(xt[0], xt[xt.length - 1], L, L + pw), y = lin(yt[0], yt[yt.length - 1], H, 0), every = labelInterval(pw / (xt.length - 1), 36, xt.length);
  return <><YTicks ticks={yt} y={y} format={yFmt} /><Baseline x={L} w={pw} />
    {xt.map((t, i) => i % every === 0 && <text key={t} className="cl-tick" x={x(t)} y={H + 22} textAnchor="middle" aria-hidden="true">{xFmt(t)}</text>)}
    <text className="cl-axis-title" x={L + pw / 2} y={H + 48} textAnchor="middle" aria-hidden="true">{xTitle}</text>
    {yTitle && <text className="cl-axis-title" x={0} y={-8} aria-hidden="true">{yTitle}</text>}
    {children(x, y, pw)}</>;
}

/** #13 Four-quadrant: impact × effort with tinted quadrants; names shown when there is room. */
export function Quadrant({ data, label }: { data: { name: string; effort: number; impact: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const t = [0, 25, 50, 75, 100], Q = [['Quick wins', 0, 50, 50, 100, 1], ['Major projects', 50, 50, 100, 100, 0], ['Fill-ins', 0, 0, 50, 50, 2], ['Thankless tasks', 50, 0, 100, 50, 3]] as const;
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 54}>{w => <Frame w={w} xt={t} yt={t} xTitle="Effort ·  %" yTitle="Impact · %">{(x, y, pw) => <>
    {Q.map(([n, x0, y0, x1, y1, c]) => <g key={n} aria-hidden="true"><rect x={x(x0)} y={y(y1)} width={x(x1) - x(x0)} height={y(y0) - y(y1)} fill={CATEGORICAL[c]} opacity={0.07} /><text className="cl-ref-label" x={x(x0) + 6} y={y(y1) + 14}>{n}</text></g>)}
    <line className="cl-ref" x1={x(50)} x2={x(50)} y1={0} y2={H} /><line className="cl-ref" x1={L} x2={L + pw} y1={y(50)} y2={y(50)} />
    {data.map((d, i) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: effort ${d.effort}, impact ${d.impact}`} {...bind(<TipContent title={d.name} rows={[['Effort', `${d.effort}`], ['Impact', `${d.impact}`]]} />, `q${i}`)}>
      <circle cx={x(d.effort)} cy={y(d.impact)} r={6} fill={CATEGORICAL[0]} />{pw >= 420 && <text className="cl-node-value" x={x(d.effort) + 9} y={y(d.impact) + 4}>{d.name}</text>}
    </g>)}</>}</Frame>}</Svg>{node}</div>;
}

/** #38 Q–Q: sample quantiles vs normal quantiles, with the mean ± sd reference line. */
export function QQPlot({ data, label }: { data: { expected: number; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const vals = data.map(d => d.value), m = vals.reduce((a, b) => a + b, 0) / vals.length, sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length);
  const yt = niceDomain(Math.min(...vals), Math.max(...vals)), xt = [-3, -2, -1, 0, 1, 2, 3];
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 54}>{w => <Frame w={w} xt={xt} yt={yt} xTitle="Theoretical normal quantile" yTitle="Inspection time · min">{(x, y) => <>
    <line className="cl-ref" x1={x(-3)} x2={x(3)} y1={y(m - 3 * sd)} y2={y(m + 3 * sd)} />
    {data.map((d, i) => <circle key={i} cx={x(d.expected)} cy={y(d.value)} r={2.5} fill={CATEGORICAL[0]} opacity={0.85} aria-hidden="true" />)}
    <rect className="cl-hit" x={L} y={0} width={1} height={1} tabIndex={0} role="img" aria-label={`${data.length} quantile points; mean ${fmt1(m)} min, sd ${fmt1(sd)}`} {...bind(<TipContent title="Normal Q–Q" rows={[['Points', `${data.length}`], ['Mean', `${fmt1(m)} min`], ['SD', `${fmt1(sd)} min`]]} />, 'qq')} />
  </>}</Frame>}</Svg>{node}</div>;
}

/** #33 Beeswarm: one row per machine, dots placed along x then nudged vertically so they never overlap (re-run at every width). */
export function Beeswarm({ data, label }: { data: { name: string; values: number[] }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const all = data.flatMap(d => d.values), xt = niceDomain(Math.min(...all), Math.max(...all)), rowH = H / data.length;
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 54}>{w => { const LB = w < 400 ? 70 : 96, pw = w - LB - 12, x = lin(xt[0], last(xt), LB, LB + pw), every = labelInterval(pw / (xt.length - 1), 36, xt.length), R = pw < 360 ? 2 : 3; // denser x → smaller dots so a row still fits
    return <>{data.map((d, i) => { const cy0 = i * rowH + rowH / 2, placed: [number, number][] = [];
      const dots = [...d.values].sort((a, b) => a - b).map(v => { const px = x(v); let dy = 0;
        for (let k = 0; k < 60; k++) { const cand = k === 0 ? 0 : Math.ceil(k / 2) * (k % 2 ? 1 : -1) * (R * 2 + 0.5); if (placed.every(([ox, oy]) => (ox - px) ** 2 + (oy - cand) ** 2 >= (2 * R + 0.5) ** 2)) { dy = cand; break; } }
        placed.push([px, dy]); return [px, cy0 + Math.max(-rowH / 2 + R, Math.min(rowH / 2 - R, dy))] as [number, number]; });
      return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${d.values.length} cycle times`} {...bind(<TipContent title={d.name} rows={[['Samples', `${d.values.length}`], ['Range', `${fmt1(Math.min(...d.values))}–${fmt1(Math.max(...d.values))} s`]]} />, `bs${i}`)}>
        <text className="cl-row-label" x={0} y={cy0 + 5}>{d.name}</text>
        {dots.map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={R} fill={CATEGORICAL[i % 4]} />)}
      </g>; })}
      <line className="cl-baseline" x1={LB} x2={LB + pw} y1={H + 0.5} y2={H + 0.5} />
      {xt.map((t, i) => i % every === 0 && <text key={t} className="cl-tick" x={x(t)} y={H + 22} textAnchor="middle" aria-hidden="true">{t}</text>)}
      <text className="cl-axis-title" x={LB + pw / 2} y={H + 48} textAnchor="middle" aria-hidden="true">Cycle time · s</text></>; }}</Svg>{node}</div>;
}

/** #63 Quadrant + bubble: performance × risk, bubble area = team size (radius ∝ √size). */
export function QuadrantBubble({ data, thresholds, categories, label }: { data: { name: string; performance: number; risk: number; size: number; category: number }[]; thresholds: { performance: number; risk: number }; categories: string[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty />;
  const t = [0, 25, 50, 75, 100], max = Math.max(...data.map(d => d.size)), quad = (d: { performance: number; risk: number }) => d.risk >= thresholds.risk ? (d.performance >= thresholds.performance ? 'Retain' : 'Coach') : (d.performance >= thresholds.performance ? 'Sustain' : 'Grow');
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 54}>{w => <Frame w={w} xt={t} yt={t} yFmt={v => `${v}%`} xTitle="Performance · /100" yTitle="Attrition risk · %">{(x, y, pw) => { const rMax = Math.min(22, pw * 0.085);
    return <>{[['Coach', 0, thresholds.risk, thresholds.performance, 100], ['Retain', thresholds.performance, thresholds.risk, 100, 100], ['Grow', 0, 0, thresholds.performance, thresholds.risk], ['Sustain', thresholds.performance, 0, 100, thresholds.risk]].map(([n, x0, , , y1]) => <text key={n} className="cl-ref-label" x={x(x0 as number) + 6} y={y(y1 as number) + 14} aria-hidden="true">{n}</text>)}
      <line className="cl-ref" x1={x(thresholds.performance)} x2={x(thresholds.performance)} y1={0} y2={H} /><line className="cl-ref" x1={L} x2={L + pw} y1={y(thresholds.risk)} y2={y(thresholds.risk)} />
      {[...data].sort((a, b) => b.size - a.size).map((d, i) => <circle key={d.name} className="cl-mark" cx={x(d.performance)} cy={y(d.risk)} r={Math.sqrt(d.size / max) * rMax} fill={CATEGORICAL[d.category]} fillOpacity={0.75} stroke={CATEGORICAL[d.category]} strokeWidth={1.2}
        tabIndex={0} role="img" aria-label={`${d.name}: performance ${d.performance}, risk ${d.risk}%, ${d.size} people, ${quad(d)}`} {...bind(<TipContent title={d.name} sub={categories[d.category]} color={CATEGORICAL[d.category]} rows={[['Performance', `${d.performance}/100`], ['Attrition risk', `${d.risk}%`], ['Team size', `${d.size} people`], ['Quadrant', quad(d)]]} />, `qb${i}`)} />)}</>; }}</Frame>}</Svg>{node}</div>;
}

/** #47 Event timeline: dated markers on a day axis; names alternate above / below so neighbours never collide. */
export function EventTimeline({ data, days = 30, label }: { data: { day: number; name: string; date: string; detail: string }[]; days?: number; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty height={160} />;
  return <div ref={container} className="ds-chart"><Svg label={label} height={180}>{w => { const x = lin(1, days, 24, w - 24), ty = 90, ticks = [1, 8, 15, 22, 30];
    return <><line x1={x(1)} x2={x(days)} y1={ty} y2={ty} stroke={GUIDE} strokeWidth={2} aria-hidden="true" />
      {ticks.map(t => <text key={t} className="cl-tick" x={x(t)} y={ty + 74} textAnchor="middle" aria-hidden="true">{t} Sep</text>)}
      {data.map((d, i) => { const up = i % 2 === 0, cx = x(d.day), anchor = cx < 50 ? 'start' : cx > w - 50 ? 'end' : 'middle';
        return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.date}: ${d.name} — ${d.detail}`} {...bind(<TipContent title={d.name} sub={d.date} rows={[['Detail', d.detail]]} />, `ev${i}`)}>
          <line x1={cx} x2={cx} y1={ty} y2={up ? ty - 28 : ty + 28} stroke={GUIDE} />
          <circle cx={cx} cy={ty} r={6} fill={CATEGORICAL[0]} stroke={CARD} strokeWidth={2} />
          <text className="cl-row-label" x={cx} y={up ? ty - 46 : ty + 44} textAnchor={anchor}>{d.name}</text>
          <text className="cl-node-value" x={cx} y={up ? ty - 32 : ty + 58} textAnchor={anchor}>{d.date}</text>
        </g>; })}</>; }}</Svg>{node}</div>;
}

/* ═══ Square / radial (never stretched) ═══════════════════════════ */

type Part = HierarchyRectangularNode<HNode>;
const rootOf = (d: HNode) => hierarchy<HNode>(d).sum(n => n.value ?? 0);
const branch = (n: Part | HierarchyNode<HNode>) => { const top = n.depth <= 1 ? n : n.ancestors().find(a => a.depth === 1)!; return CATEGORICAL[(top.parent?.children ?? []).indexOf(top as never) % 8] ?? CATEGORICAL[0]; };

/** #10 Nested donut: departments inside, teams outside; arcs = shares of 600 people. */
export function NestedDonut({ data, label }: { data: HNode; label: string }) {
  const { container, bind, node } = useChartTip();
  const r0 = partition<HNode>().size([2 * Math.PI, 1])(rootOf(data));
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 280 * grow(w)}>{w => { const g = grow(w), s = square(w0(w), 260) * g, R = s / 2;
    return <g transform={`translate(${w / 2},${140 * g})`}>{r0.descendants().filter(d => d.depth).map((d, i) => <path key={i} className="cl-mark" d={d3arc<Part>().innerRadius(R * (d.depth === 1 ? 0.32 : 0.65)).outerRadius(R * (d.depth === 1 ? 0.62 : 0.98)).startAngle(d.x0).endAngle(d.x1).padAngle(0.02)(d) ?? ''}
      fill={branch(d)} fillOpacity={d.depth === 1 ? 1 : 0.55} tabIndex={0} role="img" aria-label={`${d.ancestors().reverse().slice(1).map(a => a.data.name).join(' / ')}: ${d.value} people`} {...bind(<TipContent title={d.data.name} sub={d.parent?.data.name} rows={[['People', fmtInt(d.value ?? 0)], ['Share', `${((d.value ?? 0) / (r0.value ?? 1) * 100).toFixed(1)}%`]]} />, `nd${i}`)} />)}
      <text className="cl-center-value" y={4} textAnchor="middle">{r0.value}</text><text className="cl-node-value" y={22} textAnchor="middle">people</text></g>; }}</Svg>{node}</div>;
}

/** #50 Sunburst: factory centre, departments, teams; ring depth = hierarchy level, angle = people. */
export function Sunburst({ data, label }: { data: HNode; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 280 * grow(w)}>{w => { const g = grow(w), R = square(w0(w), 260) * g / 2, t = partition<HNode>().size([2 * Math.PI, R])(rootOf(data));
    return <g transform={`translate(${w / 2},${140 * g})`}>{t.descendants().map((d, i) => <g key={i} className="cl-mark" tabIndex={d.depth ? 0 : -1} role="img" aria-label={`${d.ancestors().reverse().map(a => a.data.name).join(' / ')}: ${d.value} people`} {...bind(<TipContent title={d.data.name} rows={[['People', fmtInt(d.value ?? 0)]]} />, `sb${i}`)}>
      <path d={d3arc<Part>().startAngle(d.x0).endAngle(d.x1).innerRadius(d.y0).outerRadius(d.y1 - 1).padAngle(d.depth ? 0.018 : 0)(d) ?? ''} fill={d.depth ? branch(d) : TRACK} fillOpacity={d.depth === 2 ? 0.6 : 1} stroke={CARD} />
      {d.depth === 1 && R > 90 && (() => { const a = (d.x0 + d.x1) / 2, rr = (d.y0 + d.y1) / 2; return <text className="cl-inlabel" x={Math.sin(a) * rr} y={-Math.cos(a) * rr + 4} textAnchor="middle">{d.data.name.length > 8 ? d.data.name.slice(0, 4) + '.' : d.data.name}</text>; })()}
    </g>)}<text className="cl-center-value" y={4} textAnchor="middle">{t.value}</text></g>; }}</Svg>{node}</div>;
}

/** #29 Gauge: semicircle 0–100%, value arc and target tick. */
export function Gauge({ actual, target, label }: { actual: number; target: number; label: string }) {
  return <Svg label={label} height={w => 210 * grow(w)}>{w => { const R = Math.min(w0(w) / 2 - 16, 125) * grow(w), seg = d3arc<unknown>().innerRadius(R - 22).outerRadius(R), a = -Math.PI / 2, ang = a + target / 100 * Math.PI, p = (r: number) => [Math.sin(ang) * r, -Math.cos(ang) * r];
    return <g transform={`translate(${w / 2},${R + 24})`} role="img" aria-label={`Training completion ${actual}% against a ${target}% target`}>
      <path d={seg({ startAngle: a, endAngle: -a } as never) ?? ''} fill={TRACK} /><path d={seg({ startAngle: a, endAngle: a + actual / 100 * Math.PI } as never) ?? ''} fill={CATEGORICAL[0]} />
      <line x1={p(R - 28)[0]} y1={p(R - 28)[1]} x2={p(R + 6)[0]} y2={p(R + 6)[1]} stroke={INK} strokeWidth={2} />
      <text className="cl-center-value cl-center-value--lg" y={-12} textAnchor="middle">{actual}%</text><text className="cl-node-value" y={10} textAnchor="middle">Training completed · target {target}%</text>
      <text className="cl-tick" x={-R + 11} y={20} textAnchor="middle">0%</text><text className="cl-tick" x={R - 11} y={20} textAnchor="middle">100%</text></g>; }}</Svg>;
}

/** #11 Radar: six capability axes, actual vs benchmark polygons on a 0–100 radial scale. */
export function Radar({ data, label }: { data: { name: string; actual: number; benchmark: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  if (!data.length) return <ChartEmpty height={280} />;
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 300 * grow(w)}>{w => { const g = grow(w), R = (square(w0(w), 300) / 2 - 34) * g, n = data.length, pt = (i: number, v: number) => [Math.sin(i / n * 2 * Math.PI) * R * v / 100, -Math.cos(i / n * 2 * Math.PI) * R * v / 100] as [number, number];
    return <g transform={`translate(${w / 2},${150 * g})`}>
      {[25, 50, 75, 100].map(v => <path key={v} d={pathOf(data.map((_, i) => pt(i, v))) + 'Z'} fill="none" stroke={GUIDE} aria-hidden="true" />)}
      {data.map((d, i) => { const [x, y] = pt(i, 100); return <g key={d.name} aria-hidden="true"><line x1={0} y1={0} x2={x} y2={y} stroke={GUIDE} /><text className="cl-node-value" x={pt(i, 118)[0]} y={pt(i, 118)[1] + 4} textAnchor="middle">{d.name}</text></g>; })}
      <path d={pathOf(data.map((d, i) => pt(i, d.benchmark))) + 'Z'} fill="none" stroke={CATEGORICAL[1]} strokeWidth={2} strokeDasharray="5 4" aria-hidden="true" />
      <path d={pathOf(data.map((d, i) => pt(i, d.actual))) + 'Z'} fill={CATEGORICAL[0]} fillOpacity={0.2} stroke={CATEGORICAL[0]} strokeWidth={2} aria-hidden="true" />
      {data.map((d, i) => <circle key={d.name} className="cl-mark" cx={pt(i, d.actual)[0]} cy={pt(i, d.actual)[1]} r={4} fill={CATEGORICAL[0]} tabIndex={0} role="img" aria-label={`${d.name}: ${d.actual} vs benchmark ${d.benchmark}`} {...bind(<TipContent title={d.name} rows={[['Actual', `${d.actual}`], ['Benchmark', `${d.benchmark}`]]} />, `rd${i}`)} />)}
    </g>; }}</Svg>{node}</div>;
}

/** #61 Polar rose: equal 45° sectors, radius ∝ √value so sector area encodes the count. */
export function PolarRose({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const M = Math.max(40, ...data.map(d => d.value));
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 280 * grow(w)}>{w => { const g = grow(w), R = (square(w0(w), 260) / 2 - 22) * g, sec = d3arc<unknown>().innerRadius(0);
    return <g transform={`translate(${w / 2},${140 * g})`}>{[10, 20, 40].map(v => <g key={v} aria-hidden="true"><circle r={Math.sqrt(v / M) * R} fill="none" stroke={GUIDE} /><text className="cl-tick" x={4} y={-Math.sqrt(v / M) * R + 12}>{v}</text></g>)}
      {data.map((d, i) => { const th = i * 2 * Math.PI / data.length, half = Math.PI / data.length;
        return <g key={d.name}><path className="cl-mark" d={sec({ outerRadius: Math.sqrt(d.value / M) * R, startAngle: th - half, endAngle: th + half } as never) ?? ''} fill={CATEGORICAL[0]} fillOpacity={0.7} stroke={CARD} strokeWidth={1.5}
          tabIndex={0} role="img" aria-label={`${d.name}: ${d.value} observations`} {...bind(<TipContent title={d.name} rows={[['Observations', `${d.value}`]]} />, `ro${i}`)} />
          <text className="cl-node-value" x={Math.sin(th) * (R + 14)} y={-Math.cos(th) * (R + 14) + 4} textAnchor="middle" aria-hidden="true">{d.name}</text></g>; })}</g>; }}</Svg>{node}</div>;
}

/** #60 Waffle: 100 square units (1 unit = 1%), filled in category order; cell size from the width, never stretched. */
export function Waffle({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 250 * grow(w)}>{w => { const step = Math.min((w0(w) - 16) / 10, 23) * grow(w), x0 = (w - step * 10) / 2;
    let acc = 0; const cat = Array.from({ length: 100 }, (_, i) => { while (acc < data.length && i >= data.slice(0, acc + 1).reduce((s, d) => s + d.value, 0)) acc++; return acc; });
    return <g>{data.map((d, k) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${d.value} of 100`} {...bind(<TipContent title={d.name} color={CATEGORICAL[k]} rows={[['People', `${d.value} of 100`]]} />, `wf${k}`)}>
      {cat.map((c, i) => c === k && <rect key={i} x={x0 + (i % 10) * step} y={4 + Math.floor(i / 10) * step} width={step - 3} height={step - 3} rx={2} fill={CATEGORICAL[k]} />)}</g>)}</g>; }}</Svg>{node}</div>;
}

/** #49 Chord: collaboration hours between four teams; ribbon width = hours (d3-chord). */
export function Chord({ names, matrix, label }: { names: string[]; matrix: number[][]; label: string }) {
  const { container, bind, node } = useChartTip();
  const ch = chord().padAngle(0.06).sortSubgroups((a, b) => b - a)(matrix);
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 280 * grow(w)}>{w => { const g = grow(w), R = (square(w0(w), 260) / 2 - 26) * g, ar = d3arc<unknown>().innerRadius(R - 12).outerRadius(R), rb = ribbon<unknown, unknown>().radius(R - 13);
    return <g transform={`translate(${w / 2},${140 * g})`}>
      {ch.map((c, i) => <path key={i} className="cl-mark" d={(rb(c as never) as unknown as string) ?? ''} fill={CATEGORICAL[c.source.index]} fillOpacity={0.45} stroke={CARD} strokeWidth={0.5}
        tabIndex={0} role="img" aria-label={`${names[c.source.index]} and ${names[c.target.index]}: ${matrix[c.source.index][c.target.index]} hours`} {...bind(<TipContent title={`${names[c.source.index]} ↔ ${names[c.target.index]}`} rows={[['Hours / week', `${matrix[c.source.index][c.target.index]}`]]} />, `ch${i}`)} />)}
      {ch.groups.map(g => { const a = (g.startAngle + g.endAngle) / 2; return <g key={g.index} aria-hidden="true"><path d={ar(g as never) ?? ''} fill={CATEGORICAL[g.index]} /><text className="cl-node-value" x={Math.sin(a) * (R + 14)} y={-Math.cos(a) * (R + 14) + 4} textAnchor={Math.sin(a) > 0.2 ? 'start' : Math.sin(a) < -0.2 ? 'end' : 'middle'}>{names[g.index]}</text></g>; })}
    </g>; }}</Svg>{node}</div>;
}

/* ═══ Time series and distributions (laid out again at each width) ═ */

/** #23 Slopegraph: previous (left) vs current (right) on one value scale. */
export function Slopegraph({ data, label }: { data: { name: string; previous: number; current: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const ticks = niceDomain(Math.min(...data.map(d => d.previous)) - 2, Math.max(...data.map(d => d.current)) + 2), y = lin(ticks[0], last(ticks), H - 10, 14);
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => { const pad = w < 400 ? 76 : 120, x0 = pad, x1 = w - pad;
    return <><text className="cl-xlabel" x={x0} y={H + 24} textAnchor="middle">2023</text><text className="cl-xlabel" x={x1} y={H + 24} textAnchor="middle">2024</text>
      <line x1={x0} x2={x0} y1={0} y2={H} stroke={GUIDE} aria-hidden="true" /><line x1={x1} x2={x1} y1={0} y2={H} stroke={GUIDE} aria-hidden="true" />
      {data.map((d, i) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${d.previous}% to ${d.current}%`} {...bind(<TipContent title={d.name} color={CATEGORICAL[i]} rows={[['2023', `${d.previous}%`], ['2024', `${d.current}%`], ['Change', `+${d.current - d.previous} pts`]]} />, `sl${i}`)}>
        <line x1={x0} x2={x1} y1={y(d.previous)} y2={y(d.current)} stroke={CATEGORICAL[i]} strokeWidth={2} /><circle cx={x0} cy={y(d.previous)} r={4} fill={CATEGORICAL[i]} /><circle cx={x1} cy={y(d.current)} r={4} fill={CATEGORICAL[i]} />
        <text className="cl-node-value" x={x0 - 8} y={y(d.previous) + 4} textAnchor="end">{w < 400 ? `${d.previous}%` : `${d.name} ${d.previous}%`}</text><text className="cl-node-value" x={x1 + 8} y={y(d.current) + 4}>{w < 400 ? `${d.current}%` : `${d.current}% ${d.name}`}</text>
      </g>)}</>; }}</Svg>{node}</div>;
}

/** #24 Bump: rank by quarter (1 at the top); end labels name each line. */
export function Bump({ data, periods, label }: { data: { name: string; ranks: number[] }[]; periods: string[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const n = data.length;
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => { const pw = w - L - 64, x = (i: number) => L + i / (periods.length - 1) * pw, y = (r: number) => 16 + (r - 1) / (n - 1) * (H - 32);
    return <>{Array.from({ length: n }, (_, k) => <text key={k} className="cl-tick" x={L - 10} y={y(k + 1) + 4} textAnchor="end" aria-hidden="true">#{k + 1}</text>)}
      {periods.map((p, i) => <text key={p} className="cl-xlabel" x={x(i)} y={H + 24} textAnchor="middle" aria-hidden="true">{p}</text>)}
      {data.map((d, k) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ranks ${d.ranks.join(', ')}`} {...bind(<TipContent title={d.name} color={CATEGORICAL[k]} rows={periods.map((p, i) => [p, `#${d.ranks[i]}`] as [string, string])} />, `bp${k}`)}>
        <path d={pathOf(d.ranks.map((r, i) => [x(i), y(r)]))} fill="none" stroke={CATEGORICAL[k]} strokeWidth={3} />{d.ranks.map((r, i) => <circle key={i} cx={x(i)} cy={y(r)} r={5} fill={CATEGORICAL[k]} />)}
        <text className="cl-node-value" x={x(periods.length - 1) + 10} y={y(d.ranks[d.ranks.length - 1]) + 4}>{d.name}</text></g>)}</>; }}</Svg>{node}</div>;
}

/** #41 Streamgraph: d3 wiggle stack (centred baseline) of three teams across months. */
export function Streamgraph({ data, keys, label }: { data: Record<string, number | string>[]; keys: string[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const layers = stack<Record<string, number | string>>().keys(keys).offset(stackOffsetWiggle).order(stackOrderInsideOut)(data);
  const lo = Math.min(...layers.flatMap(l => l.map(p => p[0]))), hi = Math.max(...layers.flatMap(l => l.map(p => p[1])));
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => { const pw = w - 16, x = (i: number) => 8 + i / (data.length - 1) * pw, y = lin(lo, hi, H - 8, 8), every = labelInterval(pw / (data.length - 1), 36, data.length, [1, 3, 6, 12]);
    return <>{layers.map(l => <path key={l.key} className="cl-mark" d={area<[number, number]>().x((_, i) => x(i)).y0(p => y(p[0])).y1(p => y(p[1])).curve(curveBasis)(l as never) ?? ''} fill={CATEGORICAL[keys.indexOf(l.key)]} fillOpacity={0.8}
      tabIndex={0} role="img" aria-label={`${l.key}: ${data.map(d => d[l.key]).join(', ')} hours`} {...bind(<TipContent title={l.key} color={CATEGORICAL[keys.indexOf(l.key)]} rows={[['Total', `${data.reduce((s, d) => s + (d[l.key] as number), 0)} h`], ['Peak', `${Math.max(...data.map(d => d[l.key] as number))} h`]]} />, `st${l.key}`)} />)}
      {data.map((d, i) => i % every === 0 && <text key={i} className="cl-xlabel" x={x(i)} y={H + 24} textAnchor="middle" aria-hidden="true">{d.name}</text>)}</>; }}</Svg>{node}</div>;
}

/** #46 Horizon: deviation folded into two 10-unit bands per sign; darker = larger magnitude; negatives mirrored in negative colour. */
export function Horizon({ data, label, band = 10 }: { data: { name: string; value: number }[]; label: string; band?: number }) {
  const { container, bind, node } = useChartTip();
  const BH = 64;
  return <div ref={container} className="ds-chart"><Svg label={label} height={BH + 34}>{w => { const pw = w - 16, x = (i: number) => 8 + i / (data.length - 1) * pw, every = labelInterval(pw / (data.length - 1), 36, data.length, [1, 3, 6, 12]);
    const layer = (sign: 1 | -1, k: number) => area<{ value: number }>().x((_, i) => x(i)).y0(BH).y1(d => BH - Math.max(0, Math.min(band, sign * d.value - k * band)) / band * BH).curve(curveMonotoneX)(data) ?? '';
    return <><rect x={8} y={0} width={pw} height={BH} fill={TRACK} aria-hidden="true" />
      {[1, -1].flatMap(s => [0, 1].map(k => <path key={`${s}${k}`} d={layer(s as 1 | -1, k)} fill={s > 0 ? POS : NEG} fillOpacity={0.45 + k * 0.4} aria-hidden="true" />))}
      {data.map((d, i) => <rect key={i} className="cl-hit" x={x(i) - pw / data.length / 2} y={0} width={pw / data.length} height={BH} tabIndex={0} role="img" aria-label={`${d.name}: ${d.value > 0 ? '+' : ''}${d.value}% vs plan`} {...bind(<TipContent title={d.name} rows={[['Deviation', `${d.value > 0 ? '+' : ''}${d.value}%`]]} />, `hz${i}`)} />)}
      {data.map((d, i) => i % every === 0 && <text key={i} className="cl-xlabel" x={x(i)} y={BH + 24} textAnchor="middle" aria-hidden="true">{d.name}</text>)}</>; }}</Svg>{node}</div>;
}

/** #32 Violin: mirrored kernel density per machine in equal bands (half-width = 45% of the band). */
export function Violin({ data, label }: { data: { name: string; points: { x: number; y: number }[] }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const ys = data[0]?.points.map(p => p.x) ?? [0, 1], yt = niceDomain(ys[0], ys[ys.length - 1]), yMax = Math.max(...data.flatMap(d => d.points.map(p => p.y)));
  return <div ref={container} className="ds-chart"><Svg label={label}>{w => { const pw = w - L - 8, bw = pw / data.length, y = lin(yt[0], last(yt), H, 0);
    return <><YTicks ticks={yt} y={y} format={v => `${v}`} /><Baseline x={L} w={pw} />
      {data.map((d, i) => { const cx = mid(i, data.length, L, pw), hw = (v: number) => v / yMax * bw * 0.45;
        return <path key={d.name} className="cl-mark" d={pathOf([...d.points.map(p => [cx + hw(p.y), y(p.x)] as [number, number]), ...d.points.map(p => [cx - hw(p.y), y(p.x)] as [number, number]).reverse()]) + 'Z'} fill={CATEGORICAL[i % 4]} fillOpacity={0.7}
          tabIndex={0} role="img" aria-label={`${d.name} cycle-time distribution`} {...bind(<TipContent title={d.name} rows={[['Mode', `${fmt1(d.points.reduce((a, b) => b.y > a.y ? b : a).x)} s`]]} />, `vi${i}`)} />; })}
      <BandLabels names={data.map(d => d.name)} x0={L} pw={pw} /></>; }}</Svg>{node}</div>;
}

/** #34 Ridgeline: one density curve per machine on a shared x scale, rows overlapping by 40%. */
export function Ridgeline({ data, label }: { data: { name: string; points: { x: number; y: number }[] }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const xs = data[0]?.points.map(p => p.x) ?? [0, 1], xt = niceDomain(xs[0], xs[xs.length - 1]), yMax = Math.max(...data.flatMap(d => d.points.map(p => p.y))), rowH = (H - 20) / data.length;
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 54}>{w => { const LB = w < 400 ? 70 : 96, pw = w - LB - 12, x = lin(xt[0], last(xt), LB, LB + pw), every = labelInterval(pw / (xt.length - 1), 36, xt.length);
    return <>{data.map((d, i) => { const base = 20 + (i + 1) * rowH, hgt = rowH * 1.6;
        return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name} density`} {...bind(<TipContent title={d.name} rows={[['Mode', `${fmt1(d.points.reduce((a, b) => b.y > a.y ? b : a).x)} s`]]} />, `rl${i}`)}>
          <path d={pathOf([[x(d.points[0].x), base], ...d.points.map(p => [x(p.x), base - p.y / yMax * hgt] as [number, number]), [x(d.points[d.points.length - 1].x), base]]) + 'Z'} fill={CATEGORICAL[i % 4]} fillOpacity={0.55} stroke={CATEGORICAL[i % 4]} strokeWidth={1.5} />
          <text className="cl-row-label" x={0} y={base - 4}>{d.name}</text></g>; })}
      <line className="cl-baseline" x1={LB} x2={LB + pw} y1={H + 0.5} y2={H + 0.5} />
      {xt.map((t, i) => i % every === 0 && <text key={t} className="cl-tick" x={x(t)} y={H + 22} textAnchor="middle" aria-hidden="true">{t}</text>)}
      <text className="cl-axis-title" x={LB + pw / 2} y={H + 48} textAnchor="middle" aria-hidden="true">Cycle time · s</text></>; }}</Svg>{node}</div>;
}

/** #36 Density: smooth kernel estimate of inspection duration. */
export function DensityPlot({ data, label }: { data: { x: number; y: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const xt = niceDomain(data[0].x, data[data.length - 1].x), yMax = Math.max(...data.map(p => p.y)), yt = niceDomain(0, yMax);
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 54}>{w => <Frame w={w} xt={xt} yt={yt} yFmt={v => v.toFixed(2)} xTitle="Inspection duration · min">{(x, y) => <>
    <path className="cl-mark" d={pathOf([[x(data[0].x), H], ...data.map(p => [x(p.x), y(p.y)] as [number, number]), [x(data[data.length - 1].x), H]]) + 'Z'} fill={CATEGORICAL[0]} fillOpacity={0.25} stroke={CATEGORICAL[0]} strokeWidth={2}
      tabIndex={0} role="img" aria-label={`Density peaks at ${fmt1(data.reduce((a, b) => b.y > a.y ? b : a).x)} minutes`} {...bind(<TipContent title="Inspection duration" rows={[['Peak', `${fmt1(data.reduce((a, b) => b.y > a.y ? b : a).x)} min`]]} />, 'dn')} /></>}</Frame>}</Svg>{node}</div>;
}

/** #35 Hexbin: regular hexagons in a square plot (bins stay regular, so the plot keeps its aspect). */
export function Hexbin({ data, label }: { data: { name: string; skill: number; output: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 40}>{w => { const s = Math.min(w - L - 16, H), x0 = L + (w - L - 16 - s) / 2, x = lin(35, 105, x0, x0 + s), y = lin(35, 105, H, H - s);
    const hb = hexbin<{ name: string; skill: number; output: number }>().x(d => x(d.skill)).y(d => y(d.output)).radius(s / 18), cells = hb(data), max = Math.max(...cells.map(c => c.length));
    return <><YTicks ticks={[40, 60, 80, 100]} y={y} x={x0 - 10} format={v => `${v}%`} />
      {[40, 60, 80, 100].map(t => <text key={t} className="cl-tick" x={x(t)} y={H + 22} textAnchor="middle" aria-hidden="true">{t}%</text>)}
      {cells.map((c, i) => <g key={i} className="cl-mark" tabIndex={0} role="img" aria-label={`${c.length} line${c.length > 1 ? 's' : ''}: ${c.map(p => p.name).join(', ')}`} {...bind(<TipContent title={`${c.length} line${c.length > 1 ? 's' : ''}`} rows={c.slice(0, 4).map(p => [p.name, `${p.skill}% / ${p.output}%`] as [string, string])} />, `hx${i}`)}>
        <path transform={`translate(${c.x},${c.y})`} d={hb.hexagon()} fill={SEQUENTIAL[Math.min(4, Math.round(c.length / max * 4))]} stroke={CARD} />
        {s > 220 && <text className="cl-inlabel" x={c.x} y={c.y + 4} textAnchor="middle">{c.length}</text>}</g>)}</>; }}</Svg>{node}</div>;
}

/** #62 Contour: isotherms of a 48 × 36 sensor field (d3-contour); the field keeps its 4:3 aspect. */
export function Contour({ field, label }: { field: { width: number; height: number; values: number[] }; label: string }) {
  const { container, bind, node } = useChartTip();
  const iso = contours().size([field.width, field.height]).thresholds([30, 40, 50, 60, 70])(field.values);
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 34}>{w => { const fw = Math.min(w - L - 8, H * 4 / 3), fh = fw * 3 / 4, x0 = L + (w - L - 8 - fw) / 2, x = lin(0, field.width, x0, x0 + fw), y = lin(0, field.height, (H - fh) / 2, (H - fh) / 2 + fh);
    const ring = (r: number[][]) => r.map(([a, c], i) => `${i ? 'L' : 'M'}${x(a).toFixed(1)},${y(c).toFixed(1)}`).join('') + 'Z';
    return <><rect x={x0} y={y(0)} width={fw} height={fh} fill={TRACK} aria-hidden="true" />
      {iso.map((d, i) => <path key={d.value} className="cl-mark" d={d.coordinates.flatMap(p => p.map(ring)).join(' ')} fill={SEQUENTIAL[i]} fillRule="evenodd" stroke={SEQUENTIAL[4]} strokeWidth={1}
        tabIndex={0} role="img" aria-label={`${d.value} °C isotherm`} {...bind(<TipContent title={`${d.value} °C isotherm`} rows={[['Enclosed', `≥ ${d.value} °C`]]} />, `co${i}`)} />)}
      {[0, 12, 24, 36, 48].map(v => <text key={v} className="cl-tick" x={x(v)} y={y(field.height) + 18} textAnchor="middle" aria-hidden="true">{v}</text>)}</>; }}</Svg>{node}</div>;
}

/* ═══ Hierarchy and network ═══════════════════════════════════════ */

/** #17 Treemap: squarified cost rectangles, laid out again at each width so areas stay proportional. */
export function Treemap({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const total = data.reduce((s, d) => s + d.value, 0);
  return <div ref={container} className="ds-chart"><Svg label={label} height={264}>{w => { const t = treemap<{ name: string; value?: number; children?: unknown[] }>().tile(treemapSquarify).size([w, 258]).padding(3)(hierarchy<{ name: string; value?: number; children?: unknown[] }>({ name: 'Cost', children: data } as never).sum(d => d.value ?? 0));
    return <g transform="translate(0,3)">{t.leaves().map((d, i) => { const rw = d.x1 - d.x0, rh = d.y1 - d.y0;
      return <g key={d.data.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.data.name}: ₹${d.value} lakh (${((d.value ?? 0) / total * 100).toFixed(1)}%)`} {...bind(<TipContent title={d.data.name} color={CATEGORICAL[i]} rows={[['Cost', `₹${d.value} lakh`], ['Share', `${((d.value ?? 0) / total * 100).toFixed(1)}%`]]} />, `tm${i}`)}>
        <rect x={d.x0} y={d.y0} width={rw} height={rh} rx={3} fill={CATEGORICAL[i]} fillOpacity={0.85} />
        {fits(d.data.name, rw, 12) && rh > 32 && <text className="cl-inlabel" x={d.x0 + 8} y={d.y0 + 20}>{d.data.name}</text>}{fits(d.data.name, rw, 12) && rh > 50 && <text className="cl-inlabel" x={d.x0 + 8} y={d.y0 + 38}>₹{d.value}L</text>}</g>; })}</g>; }}</Svg>{node}</div>;
}

/** #51 Circle packing: department circles containing team circles (area = people); square, never stretched. */
export function CirclePacking({ data, label }: { data: HNode; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 280 * grow(w)}>{w => { const g = grow(w), s = square(w0(w), 270) * g, p = pack<HNode>().size([s, s]).padding(4)(rootOf(data));
    return <g transform={`translate(${(w - s) / 2},${(280 * g - s) / 2})`}>{p.descendants().map((d, i) => <g key={i} className="cl-mark" tabIndex={d.depth ? 0 : -1} role="img" aria-label={`${d.data.name}: ${d.value} people`} {...bind(<TipContent title={d.data.name} rows={[['People', fmtInt(d.value ?? 0)]]} />, `cp${i}`)}>
      <circle cx={d.x} cy={d.y} r={d.r} fill={d.depth ? branch(d) : TRACK} fillOpacity={d.depth === 1 ? 0.25 : d.depth === 2 ? 0.8 : 0.5} stroke={d.depth === 1 ? branch(d) : 'none'} />
      {d.depth === 2 && d.r > 22 && <text className="cl-inlabel" x={d.x} y={d.y + 4} textAnchor="middle">{d.data.name}</text>}</g>)}</g>; }}</Svg>{node}</div>;
}

/** #55 Icicle: factory → departments → teams; widths ∝ people across the full width. */
export function Icicle({ data, label }: { data: HNode; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={264}>{w => { const t = partition<HNode>().size([w, 258])(rootOf(data));
    return <g transform="translate(0,3)">{t.descendants().map((d, i) => { const rw = d.x1 - d.x0;
      return <g key={i} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.data.name}: ${d.value} people`} {...bind(<TipContent title={d.data.name} rows={[['People', fmtInt(d.value ?? 0)]]} />, `ic${i}`)}>
        <rect x={d.x0 + 1} y={d.y0 + 1} width={Math.max(0, rw - 2)} height={d.y1 - d.y0 - 2} rx={2} fill={d.depth ? branch(d) : TRACK} fillOpacity={d.depth === 2 ? 0.6 : 0.9} />
        {fits(d.data.name, rw, 8) && <><text className="cl-inlabel" x={(d.x0 + d.x1) / 2} y={(d.y0 + d.y1) / 2 - 2} textAnchor="middle">{d.data.name}</text><text className="cl-inlabel" x={(d.x0 + d.x1) / 2} y={(d.y0 + d.y1) / 2 + 14} textAnchor="middle">{d.value}</text></>}</g>; })}</g>; }}</Svg>{node}</div>;
}

/** #53 Dendrogram: left-to-right cluster layout; depth spreads across the width. */
export function Dendrogram({ data, label }: { data: HNode; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={264}>{w => { const pad = w < 400 ? 76 : 96, t = cluster<HNode>().size([240, w - 70 - pad])(rootOf(data));
    return <g transform="translate(70,12)">{t.links().map((l, i) => <path key={i} d={`M${l.source.y},${l.source.x}H${(l.source.y + l.target.y) / 2}V${l.target.x}H${l.target.y}`} fill="none" stroke={GUIDE} strokeWidth={1.5} aria-hidden="true" />)}
      {t.descendants().map((d, i) => <g key={i} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.data.name}: ${d.value} people`} {...bind(<TipContent title={d.data.name} rows={[['People', fmtInt(d.value ?? 0)]]} />, `dg${i}`)}>
        <circle cx={d.y} cy={d.x} r={5} fill={d.depth ? branch(d) : INK} /><text className="cl-node-value" x={d.children ? d.y - 9 : d.y + 9} y={d.x + 4} textAnchor={d.children ? 'end' : 'start'}>{d.data.name}</text></g>)}</g>; }}</Svg>{node}</div>;
}

/** #16 Radial network: teams on a circle; link width ∝ shared hours, node area ∝ total hours. Square, never stretched. */
export function RadialNetwork({ names, matrix, label }: { names: string[]; matrix: number[][]; label: string }) {
  const { container, bind, node } = useChartTip();
  const tot = matrix.map(r => r.reduce((a, b) => a + b, 0)), mx = Math.max(...matrix.flat()), mt = Math.max(...tot);
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 280 * grow(w)}>{w => { const g = grow(w), R = (square(w0(w), 260) / 2 - 40) * g, p = (i: number) => [Math.sin(i / names.length * 2 * Math.PI) * R, -Math.cos(i / names.length * 2 * Math.PI) * R];
    return <g transform={`translate(${w / 2},${140 * g})`}>{matrix.flatMap((r, i) => r.map((v, j) => j > i && v ? <line key={`${i}-${j}`} x1={p(i)[0]} y1={p(i)[1]} x2={p(j)[0]} y2={p(j)[1]} stroke={GUIDE} strokeWidth={1 + v / mx * 9} aria-hidden="true" /> : null))}
      {names.map((n, i) => <g key={n} className="cl-mark" tabIndex={0} role="img" aria-label={`${n}: ${tot[i]} collaboration hours`} {...bind(<TipContent title={n} color={CATEGORICAL[i]} rows={names.map((m, j) => j !== i ? [m, `${matrix[i][j]} h`] as [string, string] : null).filter(Boolean) as [string, string][]} />, `nw${i}`)}>
        <circle cx={p(i)[0]} cy={p(i)[1]} r={8 + Math.sqrt(tot[i] / mt) * 14} fill={CATEGORICAL[i]} /><text className="cl-node-label" x={p(i)[0]} y={p(i)[1] + (p(i)[1] > 0 ? 40 : -30)} textAnchor="middle">{n}</text></g>)}</g>; }}</Svg>{node}</div>;
}

/** #52 Parallel coordinates: four metric axes (evenly spaced), one polyline per line. */
export function ParallelCoordinates({ data, axes, label }: { data: Record<string, number | string>[]; axes: { key: string; label: string }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const dom = axes.map(a => { const v = data.map(d => d[a.key] as number); return [Math.floor(Math.min(...v) / 10) * 10, Math.ceil(Math.max(...v) / 10) * 10] as [number, number]; });
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 34}>{w => { const x = (i: number) => 28 + i / (axes.length - 1) * (w - 56), y = (k: number, v: number) => lin(dom[k][0], dom[k][1], H - 8, 8)(v);
    return <>{axes.map((a, k) => <g key={a.key} aria-hidden="true"><line x1={x(k)} x2={x(k)} y1={8} y2={H - 8} stroke={GUIDE} /><text className="cl-xlabel" x={x(k)} y={H + 24} textAnchor="middle">{a.label}</text><text className="cl-tick" x={x(k) + 4} y={14}>{dom[k][1]}</text><text className="cl-tick" x={x(k) + 4} y={H - 10}>{dom[k][0]}</text></g>)}
      {data.map((d, i) => <path key={i} className="cl-mark" d={pathOf(axes.map((a, k) => [x(k), y(k, d[a.key] as number)]))} fill="none" stroke={CATEGORICAL[i % 4]} strokeWidth={2} strokeOpacity={0.75}
        tabIndex={0} role="img" aria-label={`${d.name}: ${axes.map(a => `${a.label} ${d[a.key]}`).join(', ')}`} {...bind(<TipContent title={String(d.name)} rows={axes.map(a => [a.label, `${d[a.key]}`] as [string, string])} />, `pc${i}`)} />)}</>; }}</Svg>{node}</div>;
}

/** #54 Alluvial: cohorts flowing between skill states at three checkpoints (d3-sankey, flows conserved). */
type AN = { name: string; stage: number }; type AL = { source: number; target: number; value: number };
export function Alluvial({ data, stages, label }: { data: { name: string; stages: string[]; value: number }[]; stages: string[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const nodes: AN[] = [], idx = (stage: number, name: string) => { let i = nodes.findIndex(n => n.stage === stage && n.name === name); if (i < 0) { nodes.push({ name, stage }); i = nodes.length - 1; } return i; };
  const links: AL[] = []; data.forEach(c => c.stages.slice(0, -1).forEach((s, k) => links.push({ source: idx(k, s), target: idx(k + 1, c.stages[k + 1]), value: c.value })));
  data.forEach(c => idx(c.stages.length - 1, c.stages[c.stages.length - 1]));
  const states = [...new Set(nodes.map(n => n.name))];
  return <div ref={container} className="ds-chart"><Svg label={label} height={H + 30}>{w => { const g = sankey<AN, AL>().nodeWidth(10).nodePadding(14).nodeSort(null).extent([[0, 4], [w, H - 4]])({ nodes: nodes.map(n => ({ ...n })), links: links.map(l => ({ ...l })) });
    const col = (n: SankeyNode<AN, AL>) => CATEGORICAL[states.indexOf(n.name) % 8];
    return <>{g.links.map((l: SankeyLink<AN, AL>, i) => <path key={i} className="cl-mark cl-ribbon" d={sankeyLinkHorizontal()(l) ?? ''} fill="none" stroke={col(l.source as SankeyNode<AN, AL>)} strokeOpacity={0.35} strokeWidth={Math.max(1, l.width ?? 1)}
      tabIndex={0} role="img" aria-label={`${(l.source as AN).name} → ${(l.target as AN).name}: ${l.value} people`} {...bind(<TipContent title={`${(l.source as AN).name} → ${(l.target as AN).name}`} rows={[['People', `${l.value}`]]} />, `al${i}`)} />)}
      {g.nodes.map((n, i) => { const right = (n.x0 ?? 0) > w / 2 + 20, tx = right ? (n.x0 ?? 0) - 6 : (n.x1 ?? 0) + 6;
        return <g key={i} aria-hidden="true"><rect x={n.x0} y={n.y0} width={(n.x1 ?? 0) - (n.x0 ?? 0)} height={Math.max(1, (n.y1 ?? 0) - (n.y0 ?? 0))} rx={2} fill={col(n)} /><text className="cl-node-label" x={tx} y={((n.y0 ?? 0) + (n.y1 ?? 0)) / 2 + 4} textAnchor={right ? 'end' : 'start'}>{w < 420 && n.name.length > 6 ? n.name.slice(0, 4) + '.' : n.name}</text></g>; })}
      {stages.map((s, k) => <text key={s} className="cl-xlabel" x={k === 0 ? 0 : k === stages.length - 1 ? w : w / 2} y={H + 22} textAnchor={k === 0 ? 'start' : k === stages.length - 1 ? 'end' : 'middle'} aria-hidden="true">{s}</text>)}</>; }}</Svg>{node}</div>;
}

/** #56 Arc diagram: teams on a baseline (even spacing), semicircular arcs above; width ∝ hours. Arcs stay circular at every width. */
export function ArcDiagram({ names, links, label }: { names: string[]; links: { source: number; target: number; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const mx = Math.max(...links.map(l => l.value));
  return <div ref={container} className="ds-chart"><Svg label={label} height={220}>{w => { const x = (i: number) => 40 + i / (names.length - 1) * (w - 80), base = 180;
    return <>{links.map((l, i) => { const a = x(l.source), b = x(l.target), r = (b - a) / 2, ry = Math.min(r, base - 12); // height capped to the drawing: wide arcs become half-ellipses, endpoints stay exact
      return <path key={i} className="cl-mark" d={`M${a},${base} A${r},${ry} 0 0 1 ${b},${base}`} fill="none" stroke={CATEGORICAL[l.source]} strokeOpacity={0.6} strokeWidth={1 + l.value / mx * 8}
        tabIndex={0} role="img" aria-label={`${names[l.source]} and ${names[l.target]}: ${l.value} hours`} {...bind(<TipContent title={`${names[l.source]} ↔ ${names[l.target]}`} rows={[['Hours / week', `${l.value}`]]} />, `ar${i}`)} />; })}
      {names.map((n, i) => <g key={n} aria-hidden="true"><circle cx={x(i)} cy={base} r={7} fill={CATEGORICAL[i]} /><text className="cl-node-label" x={x(i)} y={base + 28} textAnchor="middle">{n}</text></g>)}</>; }}</Svg>{node}</div>;
}

/** #57 Ternary: barycentric points in an equilateral triangle (always equilateral — sized from the width). */
export function Ternary({ data, axes, label }: { data: { name: string; a: number; b: number; c: number }[]; axes: [string, string, string]; label: string }) {
  const { container, bind, node } = useChartTip();
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 290 * grow(w)}>{w => { const s = Math.min(w0(w) - 60, 300) * grow(w), h = s * Math.sqrt(3) / 2, ox = (w - s) / 2, oy = 20 + h;
    const P = (a: number, b: number, c: number) => { const t = a + b + c; return [ox + (b / t + c / t / 2) * s, oy - c / t * h] as [number, number]; };
    // Point names are placed greedily and skipped where they would collide (every point keeps its tooltip and accessible name).
    const placed: [number, number, number][] = [], fits = (x: number, y: number, n: string) => { const w2 = n.length * 7 + 4; if (placed.some(([px, py, pw2]) => x < px + pw2 && px < x + w2 && Math.abs(py - y) < 15)) return false; placed.push([x, y, w2]); return true; };
    return <>{[0.2, 0.4, 0.6, 0.8].map(f => <path key={f} d={pathOf([P(f, 1 - f, 0), P(f, 0, 1 - f)]) + pathOf([P(0, f, 1 - f), P(1 - f, f, 0)]).replace('M', ' M') + pathOf([P(1 - f, 0, f), P(0, 1 - f, f)]).replace('M', ' M')} stroke={GUIDE} fill="none" aria-hidden="true" />)}
      <path d={pathOf([P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)]) + 'Z'} fill="none" stroke={INK} strokeWidth={1.5} aria-hidden="true" />
      <text className="cl-node-label" x={P(1, 0, 0)[0] - 4} y={oy + 20} textAnchor="start" aria-hidden="true">{axes[0]}</text><text className="cl-node-label" x={P(0, 1, 0)[0] + 4} y={oy + 20} textAnchor="end" aria-hidden="true">{axes[1]}</text><text className="cl-node-label" x={P(0, 0, 1)[0]} y={12} textAnchor="middle" aria-hidden="true">{axes[2]}</text>
      {data.map((d, i) => <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${axes[0]} ${d.a}%, ${axes[1]} ${d.b}%, ${axes[2]} ${d.c}%`} {...bind(<TipContent title={d.name} rows={[[axes[0], `${d.a}%`], [axes[1], `${d.b}%`], [axes[2], `${d.c}%`]]} />, `te${i}`)}>
        <circle cx={P(d.a, d.b, d.c)[0]} cy={P(d.a, d.b, d.c)[1]} r={6} fill={CATEGORICAL[i % 8]} />{s > 240 && fits(P(d.a, d.b, d.c)[0] + 9, P(d.a, d.b, d.c)[1], d.name) && <text className="cl-node-value" x={P(d.a, d.b, d.c)[0] + 9} y={P(d.a, d.b, d.c)[1] + 4}>{d.name}</text>}</g>)}</>; }}</Svg>{node}</div>;
}

/* ═══ Geographic ═══════════════════════════════════════════════════ */

const MAP = india as { viewBox: string; shapes: { name: string; d: string; cx: number; cy: number }[] };
const [, , MW, MH] = MAP.viewBox.split(' ').map(Number);
const byName = Object.fromEntries(MAP.shapes.map(s => [s.name, s]));

/** #58 Flow map: transfers as curved arrows between projected state centroids; map keeps its proportions (fit, never stretched). */
export function FlowMap({ data, label }: { data: { source: string; target: string; value: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const mx = Math.max(...data.map(d => d.value));
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 290 * grow(w)}>{w => { const k = Math.min((w0(w) - 16) / MW, 280 / MH) * grow(w), tx = (w - MW * k) / 2, used = new Set(data.flatMap(d => [d.source, d.target]));
    return <g transform={`translate(${tx},5) scale(${k})`}>
      {MAP.shapes.map(s => <path key={s.name} d={s.d} fill={TRACK} stroke={CARD} strokeWidth={0.8 / k} fillRule="evenodd" aria-hidden="true" />)}
      {data.map((d, i) => { const a = byName[d.source], b = byName[d.target], dx = b.cx - a.cx, dy = b.cy - a.cy;
        return <path key={i} className="cl-mark" d={`M${a.cx},${a.cy}Q${(a.cx + b.cx) / 2 - dy * 0.18},${(a.cy + b.cy) / 2 + dx * 0.18} ${b.cx},${b.cy}`} fill="none" stroke={CATEGORICAL[3]} strokeOpacity={0.85} strokeWidth={(1 + d.value / mx * 4) / k}
          tabIndex={0} role="img" aria-label={`${d.source} → ${d.target}: ${d.value} transfers`} {...bind(<TipContent title={`${d.source} → ${d.target}`} rows={[['Transfers / quarter', `${d.value}`]]} />, `fm${i}`)} />; })}
      {[...used].map(n => <circle key={n} cx={byName[n].cx} cy={byName[n].cy} r={4 / k} fill={INK} aria-hidden="true" />)}</g>; }}</Svg>{node}</div>;
}

/** #59 Tile cartogram: one tile per office on a 3 × 5 grid; tile area ∝ headcount (side ∝ √value). */
export function Cartogram({ data, label }: { data: { name: string; short: string; value: number; row: number; col: number }[]; label: string }) {
  const { container, bind, node } = useChartTip();
  const mx = Math.max(...data.map(d => d.value));
  return <div ref={container} className="ds-chart"><Svg label={label} height={w => 290 * grow(w)}>{w => { const cell = Math.min((w0(w) - 12) / 3, 56) * grow(w), left = (w - cell * 3) / 2, top = (290 * grow(w) - cell * 5) / 2;
    return <>{data.map((d, i) => { const side = Math.sqrt(d.value / mx) * (cell - 4), x = left + d.col * cell + (cell - side) / 2, y = top + d.row * cell + (cell - side) / 2;
      return <g key={d.name} className="cl-mark" tabIndex={0} role="img" aria-label={`${d.name}: ${d.value} people`} {...bind(<TipContent title={d.name} rows={[['People', `${d.value}`]]} />, `ct${i}`)}>
        <rect x={x} y={y} width={side} height={side} rx={2} fill={CATEGORICAL[0]} fillOpacity={0.8} /><text className="cl-inlabel" x={x + side / 2} y={y + side / 2 + 4} textAnchor="middle">{d.short}</text></g>; })}</>; }}</Svg>{node}</div>;
}

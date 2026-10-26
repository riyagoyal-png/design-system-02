import { useMemo, useState, type ReactNode } from 'react';
import { ChartEmpty, fmtCompact, fmtInt, fmtPct, heatCell, heatColor, niceTicks, normalize, TipContent, useChartTip, useWidth } from './core';

export interface Series { key: string; label: string; color: string }

/* ── Y axis (§7.3) ───────────────────────────────────────────────── */
function YAxis({ ticks, height }: { ticks: number[]; height: number }) {
  const max = ticks[ticks.length - 1];
  return (
    <div className="ds-axis-y" style={{ height }} aria-hidden="true">
      {ticks.map(t => <span key={t} style={{ bottom: `${(t / max) * 100}%` }}>{fmtCompact(t)}</span>)}
    </div>
  );
}
/** Smallest label interval (1, 2, 3, 4, 6, 12 …) that gives each visible label `need` px; every mark stays plotted. */
export function labelInterval(spacing: number, need: number, n: number, steps = [1, 2, 3, 4, 6, 12, 24]) {
  for (const k of steps) if (k >= n || spacing * k >= need) return k;
  return Math.ceil(n / 4);
}
/** Room a category label needs: its longest word at 14px (≈7.5px a glyph), 24–72px; labels may wrap to 2 lines. */
const labelNeed = (labels: string[]) => Math.min(72, Math.max(24, Math.max(...labels.flatMap(l => l.split(/\s+/)).map(w => w.length)) * 7.5));
/** Narrowest band (bar ≥ 8px at 50%); below it the band row scrolls horizontally instead of squeezing marks. */
export const MIN_BAND = 16;

/**
  Category-band layout shared by vertical bar charts (Figma: Chart / Bar chart › Bands slot › Chart / Band).
  Each band owns its mark, optional value label and X label, so they cannot drift apart; bands share the plot equally.
*/
function useBands(n: number, labels: string[]) {
  const { ref, w } = useWidth<HTMLDivElement>();
  const band = n ? w / n : w;
  const scroll = n > 0 && band < MIN_BAND;
  const every = labelInterval(Math.max(band, MIN_BAND), labelNeed(labels.length ? labels : ['']), n);
  return { ref, w, band, scroll, every };
}
function BandRow({ bandsRef, scroll, n, label, children }: { bandsRef: React.RefObject<HTMLDivElement | null>; scroll: boolean; n: number; label: string; children: ReactNode }) {
  return (
    <div ref={bandsRef} className={`ds-bands${scroll ? ' ds-bands--scroll' : ''}`} {...(scroll ? { role: 'region', 'aria-label': `${label} (scrolls horizontally)`, tabIndex: 0 } : {})}>
      <div className="ds-bands__track" style={scroll ? { minWidth: n * MIN_BAND } : undefined}>{children}</div>
    </div>
  );
}
function Band({ height, label, showLabel, span = 1, edge, value, valuePct, children }: { height: number; label: string; showLabel: boolean; span?: number; edge?: 'start' | 'end'; value?: string; valuePct?: number; children: ReactNode }) {
  return (
    <div className="ds-band">
      <div className="ds-band__plot" style={{ height }}>
        {children}
        {value !== undefined && <span className="ds-band__value" style={{ bottom: `calc(${valuePct ?? 0}% + 4px)` }} aria-hidden="true">{value}</span>}
      </div>
      {/* A label shown every k-th band may use the k bands it stands for, centred on its own mark (edge labels align inward). */}
      <span className={`ds-band__label${span > 1 && edge ? ` ds-band__label--${edge}` : ''}`} aria-hidden="true" style={span > 1 ? { width: `${(edge ? span / 2 + 0.5 : span) * 100}%` } : undefined}>{showLabel ? label : ''}</span>
    </div>
  );
}

/**
  §7.4 vertical bars (stacked) + §7.5 trend overlay [OBSERVED].
  Band = equal share of the plot; bar 74% of band (max 74, min 6) — Figma "Quality Snapshot"; segments abut (no gap); trend 3px dashed 8/8.
  Labels wrap to 2 lines, then thin to every k-th band when narrow; below 16px a band row scrolls instead of squeezing.
*/
export function BarChart({ data, series, trend, height = 300, label, stacked = true, showValues = false }: {
  data: { x: string; values: Record<string, number> }[]; series: Series[]; trend?: { label: string; values: number[]; format: (n: number) => string };
  height?: number; label: string; stacked?: boolean; showValues?: boolean;
}) {
  const { container, bind, node } = useChartTip();
  const { ref, scroll, every, band } = useBands(data.length, data.map(d => d.x));
  const trendEvery = labelInterval(band, 56, data.length); // §7.5 data labels need ~56px a band
  const totals = data.map(d => series.reduce((s, se) => s + (d.values[se.key] ?? 0), 0));
  const ticks = niceTicks(Math.max(...totals, 0));
  const max = ticks[ticks.length - 1];
  const tMax = trend ? Math.max(...trend.values) * 1.25 : 1;
  if (!data.length) return <ChartEmpty height={height} />;
  return (
    <div ref={container} className="ds-chart" role="group" aria-label={label}>
      <div className="ds-chart__plotrow">
        <YAxis ticks={ticks} height={height} />
        <BandRow bandsRef={ref} scroll={scroll} n={data.length} label={label}>
          {data.map((d, i) => (
            <Band key={`${d.x}${i}`} height={height} label={d.x} showLabel={i % every === 0} span={every} edge={i === 0 ? 'start' : i + every >= data.length ? 'end' : undefined} value={showValues ? fmtCompact(totals[i]) : undefined} valuePct={(totals[i] / max) * 100}>
              <button type="button" className="ds-bar" style={{ height: `${(totals[i] / max) * 100}%` }}
                aria-label={`${d.x}: ${series.map(s => `${fmtInt(d.values[s.key] ?? 0)} ${s.label.toLowerCase()}`).join(', ')}`}
                {...bind(<TipContent title={d.x} rows={series.map(s => [s.label, fmtInt(d.values[s.key] ?? 0)] as [string, string]).concat(trend ? [[trend.label, trend.format(trend.values[i])]] : [])} />, `b${i}`)}>
                {(stacked ? [...series].reverse() : series).map(s => {
                  const v = d.values[s.key] ?? 0;
                  return v > 0 ? <span key={s.key} className="ds-bar__seg" style={{ flexGrow: v, background: s.color }} /> : null;
                })}
              </button>
            </Band>
          ))}
          {trend && (
            <div className="ds-bands__overlay" style={{ height }} aria-hidden="true">
              <svg className="ds-trend" viewBox={`0 0 ${data.length * 100} 1000`} preserveAspectRatio="none">
                <polyline points={trend.values.map((v, i) => `${i * 100 + 50},${1000 - (v / tMax) * 1000}`).join(' ')} fill="none" stroke="var(--ds-chart-trend)" strokeWidth="2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
              </svg>
              {data.length <= 16 && trend.values.map((v, i) => (
                <span key={i} className="ds-trend__pt" style={{ left: `${((i + 0.5) / data.length) * 100}%`, bottom: `${(v / tMax) * 100}%` }}>
                  {i % trendEvery === 0 && <span className="ds-trend__label">{trend.format(v)}</span>}
                </span>
              ))}
            </div>
          )}
        </BandRow>
      </div>
      {node}
    </div>
  );
}

/** §7.4 grouped bars [EXTENSION]: up to 3 series per band, 4px inside the group, the group at 50% of the band (max 222). */
export function GroupedBarChart({ data, series, height = 300, label, showValues = false }: { data: { x: string; values: Record<string, number> }[]; series: Series[]; height?: number; label: string; showValues?: boolean }) {
  const { container, bind, node } = useChartTip();
  const { ref, scroll, every } = useBands(data.length, data.map(d => d.x));
  const shown = series.slice(0, 3);
  const ticks = niceTicks(Math.max(0, ...data.flatMap(d => shown.map(s => d.values[s.key] ?? 0))));
  const max = ticks[ticks.length - 1];
  if (!data.length) return <ChartEmpty height={height} />;
  return (
    <div ref={container} className="ds-chart" role="group" aria-label={label}>
      <div className="ds-chart__plotrow">
        <YAxis ticks={ticks} height={height} />
        <BandRow bandsRef={ref} scroll={scroll} n={data.length} label={label}>
          {data.map((d, i) => {
            const top = Math.max(0, ...shown.map(s => d.values[s.key] ?? 0));
            return (
              <Band key={`${d.x}${i}`} height={height} label={d.x} showLabel={i % every === 0} span={every} edge={i === 0 ? 'start' : i + every >= data.length ? 'end' : undefined} value={showValues ? fmtCompact(top) : undefined} valuePct={(top / max) * 100}>
                <div className="ds-bar-group" style={{ minWidth: `min(${shown.length * 6 + (shown.length - 1) * 4}px, calc(100% - 4px))` }}>
                  {shown.map(s => (
                    <button key={s.key} type="button" className="ds-bar ds-bar--single" style={{ height: `${((d.values[s.key] ?? 0) / max) * 100}%`, background: s.color }}
                      aria-label={`${d.x}, ${s.label}: ${fmtInt(d.values[s.key] ?? 0)}`}
                      {...bind(<TipContent title={d.x} sub={s.label} color={s.color} rows={[[s.label, fmtInt(d.values[s.key] ?? 0)]]} />, `g${i}${s.key}`)} />
                  ))}
                </div>
              </Band>
            );
          })}
        </BandRow>
      </div>
      {node}
    </div>
  );
}

/**
  §7.4 horizontal bars [EXTENSION]: 20px bars, 12px gap, 154px label column, value label in small-strong.
  Bar = value / axis max of the track (Figma: H-bar row Track grid [value : axis max − value]); the axis max keeps 25% headroom
  for the value text. Below 400px the rows stack (label above a full-width bar) — Figma layout=stacked.
*/
export function HBarChart({ data, color = 'var(--ds-chart-cat-1)', label, format = fmtInt, axisMax }: { data: { label: string; sub?: string; value: number }[]; color?: string; label: string; format?: (n: number) => string; axisMax?: number }) {
  const { container, bind, node } = useChartTip();
  const { ref, w } = useWidth<HTMLDivElement>();
  const max = axisMax ?? Math.max(...data.map(d => d.value), 1) * 1.25;
  if (!data.length) return <ChartEmpty height={200} />;
  return (
    <div ref={container} className="ds-chart" role="group" aria-label={label}>
      <div ref={ref} className={`ds-hbar${w < 400 ? ' ds-hbar--stacked' : ''}`}>
        {data.map((d, i) => (
          <div className="ds-hbar__row" key={d.label}>
            <div className="ds-hbar__label"><span className="ds-ts-body-strong ds-truncate">{d.label}</span>{d.sub && <span className="ds-ts-small ds-truncate">{d.sub}</span>}</div>
            <div className="ds-hbar__track" style={{ gridTemplateColumns: `minmax(0, ${Math.min(d.value, max)}fr) minmax(0, ${Math.max(0, max - d.value)}fr)` }}>
              <button type="button" className="ds-hbar__bar" style={{ background: color }} aria-label={`${d.label}: ${format(d.value)}`}
                {...bind(<TipContent title={d.label} rows={[['Value', format(d.value)]]} />, `h${i}`)} />
              <span className="ds-ts-small-strong">{format(d.value)}</span>
            </div>
          </div>
        ))}
      </div>
      {node}
    </div>
  );
}

/** §7.5 standalone line / area chart [EXTENSION]: 2px strokes; points on hover/focus (always when ≤ 12); guide line + rich tooltip for all series at x. */
export function LineChart({ x, series, height = 300, label, area }: { x: string[]; series: (Series & { values: number[] })[]; height?: number; label: string; area?: boolean }) {
  const { container, bind, node } = useChartTip();
  const { ref, w } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...series.flatMap(s => s.values)));
  const max = ticks[ticks.length - 1];
  const n = x.length;
  const px = (i: number) => (n === 1 ? w / 2 : (i / (n - 1)) * w);
  const py = (v: number) => height - (v / max) * height;
  const showPts = n <= 12;
  // Calendar-meaningful steps (monthly → quarterly → half-year), matching the Figma rule: < 36px a point shows quarterly labels.
  const every = labelInterval(n > 1 ? w / (n - 1) : w, 36, n, [1, 3, 6, 12, 24]);
  if (!n) return <ChartEmpty height={height} />;
  return (
    <div ref={container} className="ds-chart" role="group" aria-label={label}>
      <div className="ds-chart__plotrow">
        <YAxis ticks={ticks} height={height} />
        <div ref={ref} className="ds-chart__plot ds-chart__plot--svg" style={{ height }} onPointerLeave={() => setHover(null)}>
          <svg width={w} height={height} aria-hidden="true">
            <defs>
              {series.map(s => (
                <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.12" /><stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {area && series.map(s => <path key={s.key} d={`M${px(0)},${height} ${s.values.map((v, i) => `L${px(i)},${py(v)}`).join(' ')} L${px(n - 1)},${height} Z`} fill={`url(#area-${s.key})`} />)}
            {series.map(s => <polyline key={s.key} points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />)}
            {hover !== null && <line x1={px(hover)} x2={px(hover)} y1="0" y2={height} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />}
            {series.map(s => s.values.map((v, i) => (showPts || hover === i) && <circle key={`${s.key}${i}`} cx={px(i)} cy={py(v)} r="3" fill={s.color} />))}
          </svg>
          {x.map((xl, i) => {
            const b = bind(<TipContent title={xl} rows={series.map(s => [s.label, fmtInt(s.values[i])] as [string, string])} />, `l${i}`);
            return (
              <button key={`${xl}${i}`} type="button" className="ds-line-hit" style={{ left: Math.max(0, px(i) - Math.max(6, w / n / 2)), width: Math.min(w, px(i) + Math.max(6, w / n / 2)) - Math.max(0, px(i) - Math.max(6, w / n / 2)) }}
                aria-label={`${xl}: ${series.map(s => `${s.label} ${fmtInt(s.values[i])}`).join(', ')}`} aria-describedby={b['aria-describedby']}
                onPointerEnter={e => { setHover(i); b.onPointerEnter(e); }} onPointerLeave={b.onPointerLeave}
                onFocus={e => { setHover(i); b.onFocus(e); }} onBlur={() => { setHover(null); b.onBlur(); }} />
            );
          })}
        </div>
      </div>
      <div className="ds-axis-x ds-axis-x--line" aria-hidden="true" style={{ marginInlineStart: 38 }}>
        {x.map((xl, i) => <span key={`${xl}${i}`} style={{ left: px(i) }}>{i % every === 0 ? xl : ''}</span>)}
      </div>
      {node}
    </div>
  );
}

/** §7.6 donut (DEOC "Defect Distribution"): 180px, 32px ring, 12 o'clock clockwise, segments abut; legend repeats every value. */
export function Donut({ data, label, center }: { data: { label: string; value: number; color: string }[]; label: string; center?: { value: string; caption: string } }) {
  const { container, bind, node } = useChartTip();
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 74, SW = 32, C = 2 * Math.PI * R;
  const gap = 0;
  const [active, setActive] = useState<number | null>(null);
  const tipFor = (d: { label: string; value: number; color: string }) => <TipContent title={d.label} color={d.color} rows={[['Value', `${fmtInt(d.value)} (${fmtPct((d.value / total) * 100)})`]]} />;
  let acc = 0;
  if (!total) return <ChartEmpty height={180} />;
  return (
    <div ref={container} className="ds-donut" role="group" aria-label={label}>
      <div className="ds-donut__ring">
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--ds-chart-track)" strokeWidth={SW} />
        </svg>
        <svg viewBox="0 0 180 180" className="ds-donut__segs" aria-hidden="true">
          {data.map((d, i) => {
            const len = (d.value / total) * C;
            const seg = (
              <circle key={d.label} className={`ds-donut__seg${active === i ? ' is-active' : ''}`} cx="90" cy="90" r={R} fill="none" stroke={d.color} strokeWidth={SW}
                strokeDasharray={`${Math.max(0, len - gap)} ${C - Math.max(0, len - gap)}`} strokeDashoffset={-acc} transform="rotate(-90 90 90)"
                {...bind(tipFor(d), `d${i}`)} onPointerEnter={e => { setActive(i); bind(tipFor(d), `d${i}`).onPointerEnter(e); }} onPointerLeave={() => { setActive(null); bind(tipFor(d), `d${i}`).onPointerLeave(); }} />
            );
            acc += len;
            return seg;
          })}
        </svg>
        {center && <div className="ds-donut__center"><span className="ds-ts-kpi-value">{center.value}</span><span className="ds-ts-small">{center.caption}</span></div>}
      </div>
      <ul className="ds-donut__legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <button type="button" className="ds-donut__row" {...bind(tipFor(d), `dl${i}`)}
              onFocus={e => { setActive(i); bind(tipFor(d), `dl${i}`).onFocus(e); }} onBlur={() => { setActive(null); bind(tipFor(d), `dl${i}`).onBlur(); }}>
              <span><span className="ds-legend__mark" style={{ background: d.color }} aria-hidden="true" />{d.label}</span>
              <span>{fmtInt(d.value)} ({fmtPct((d.value / total) * 100)})</span>
            </button>
          </li>
        ))}
      </ul>
      {node}
    </div>
  );
}

/** §7.7 heatmap: grid, row labels, full-bleed heat cells with snapped fills and contrast-safe text. */
export function Heatmap({ rows, cols, values, format = fmtPct, reversed, label, rowLabel = 'Row', tipFor }: {
  rows: string[]; cols: string[]; values: number[][]; format?: (n: number) => string; reversed?: boolean; label: string; rowLabel?: string;
  /** Custom rich-tooltip content for a cell (§7.9); defaults to value + relative position. */
  tipFor?: (i: number, j: number, color: string) => ReactNode;
}) {
  const { container, bind, node } = useChartTip();
  const norm = useMemo(() => normalize(values.flat()), [values]);
  return (
    <div ref={container} className="ds-heatmap-wrap">
      <div className="ds-heatmap" role="table" aria-label={label} style={{ gridTemplateColumns: `minmax(140px, 1.2fr) repeat(${cols.length}, minmax(64px, 1fr))` }}>
        <div role="row" className="ds-heatmap__row ds-heatmap__row--head">
          <span role="columnheader" className="ds-heatmap__head ds-heatmap__head--first">{rowLabel}</span>
          {cols.map(c => <span role="columnheader" key={c} className="ds-heatmap__head">{c}</span>)}
        </div>
        {rows.map((r, i) => (
          <div role="row" className="ds-heatmap__row" key={`${r}${i}`}>
            <span role="rowheader" className="ds-heatmap__label">{r}</span>
            {cols.map((c, j) => {
              const v = values[i][j];
              const cell = heatCell(norm(v), reversed);
              return (
                <span role="cell" key={c} className="ds-heatmap__cellwrap">
                  <button type="button" className={`ds-heat-cell${cell.ink ? ' ds-heat-cell--ink' : ''}`} style={{ background: cell.fill }}
                    aria-label={`${r}, ${c}: ${format(v)}`}
                    {...bind(tipFor ? tipFor(i, j, cell.fill) : <TipContent title={r} sub={c} color={cell.fill} rows={[['Value', format(v)], ['Relative position', `${Math.round(norm(v) * 100)}%`]]} />, `hm${i}-${j}`)}>
                    {format(v)}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {node}
    </div>
  );
}

/** §7.8 bubble matrix (Figma "Line - Product Defect Matrix"): area = volume (diameter 10–36px), color = rate on the heat scale. */
export function BubbleMatrix({ rows, cols, volume, rate, label, reversed, rateLabel = 'Rate', volumeLabel = 'Volume', tipFor }: {
  rows: { label: string; sub?: string }[]; cols: string[]; volume: number[][]; rate: number[][]; label: string; reversed?: boolean; rateLabel?: string; volumeLabel?: string;
  /** Custom rich-tooltip content for a bubble (§7.9). Cells with volume 0 draw no bubble. */
  tipFor?: (i: number, j: number, color: string) => ReactNode;
}) {
  const { container, bind, node } = useChartTip();
  const vmax = Math.max(...volume.flat());
  const norm = normalize(rate.flat().filter((_, k) => volume.flat()[k] > 0));
  const rowH = rows.length > 6 ? 64 : 88;   // DEOC: denser rows past six lines
  return (
    <div ref={container} className="ds-bubble" role="group" aria-label={label}>
      {rows.map((r, i) => (
        <div className="ds-bubble__row" key={`${r.label}${i}`} style={{ height: rowH, gridTemplateColumns: `154px repeat(${cols.length}, minmax(0, 1fr))` }}>
          <div className="ds-bubble__label"><span>{r.label}</span>{r.sub && <span>{r.sub}</span>}</div>
          {cols.map((c, j) => {
            if (!(volume[i][j] > 0)) return <span className="ds-bubble__cell" key={`${c}${j}`} />;
            const d = 14 + Math.sqrt(volume[i][j] / vmax) * 40;
            const p = reversed ? 1 - norm(rate[i][j]) : norm(rate[i][j]);
            return (
              <span className="ds-bubble__cell" key={`${c}${j}`}>
                <button type="button" className="ds-bubble__dot" style={{ width: d, height: d, background: heatColor(p) }}
                  aria-label={`${r.label}, ${c}: ${volumeLabel.toLowerCase()} ${fmtInt(volume[i][j])}, ${rateLabel.toLowerCase()} ${fmtPct(rate[i][j])}`}
                  {...bind(tipFor ? tipFor(i, j, heatColor(p)) : <TipContent title={r.label} sub={c} color={heatColor(p)} rows={[[volumeLabel, fmtInt(volume[i][j])], [rateLabel, fmtPct(rate[i][j])]]} />, `bm${i}-${j}`)} />
              </span>
            );
          })}
        </div>
      ))}
      <div className="ds-bubble__row ds-bubble__axis" style={{ gridTemplateColumns: `154px repeat(${cols.length}, minmax(0, 1fr))` }} aria-hidden="true">
        <span />{cols.map((c, j) => <span key={`${c}${j}`} className="ds-ts-axis-caption ds-clamp-2">{c}</span>)}
      </div>
      {node}
    </div>
  );
}

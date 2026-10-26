import { useState, type ReactNode } from 'react';
import { BarChart, BubbleMatrix, Donut, GroupedBarChart, HBarChart, Heatmap, LineChart } from '../../charts/Charts';
import { ChartData, ChartEmpty, fmtInt, fmtPct, heatCell, heatColor, Legend, TipContent } from '../../charts/core';
import { DashCard, StatusCard } from '../../components/ds/Cards';
import { Progress, SegBar } from '../../components/ds/Display';
import { Tabs } from '../../components/ds/Nav';
import { Select } from '../../components/ds/Select';
import { CodeBlock, DocSection, Grid, Preview, Prov, SpecSource, SpecTable, type SpecRow } from '../kit';
import { DEFECT_DIST, HEAT_COLS, HEAT_ROWS, HEAT_VALUES, LINE_DEFECTS, MATRIX_COLS, MATRIX_POINTS, MATRIX_ROWS, QUALITY, fmtIN } from '../../apps/vision/data';

const CAT = ['var(--ds-chart-cat-1)', 'var(--ds-chart-cat-2)', 'var(--ds-chart-cat-3)', 'var(--ds-chart-cat-4)'];
const GOOD = { key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)' };
const BAD = { key: 'bad', label: 'Bad Products', color: 'var(--ds-chart-negative)' };
const pct = (v: number) => (v >= 10 ? `${v}%` : `${v.toFixed(1)}%`);
/** Defect-category shares used by the Analytics example (src/apps/vision/Analytics.tsx). */
const SPLIT = [0.333, 0.306, 0.222, 0.139];

function ChartDocPage({ intro, tag, refs, chart, empty, data, spec, code, extra, responsive }: {
  intro: string; tag: 'OBSERVED' | 'EXTENSION'; refs: string[]; chart: ReactNode; empty?: ReactNode; data?: ReactNode; spec: SpecRow[]; code: string; extra?: ReactNode; responsive: string;
}) {
  return (
    <div className="doc-page">
      <div className="doc-meta"><Prov tag={tag} /><span className="ds-text-small">Spec: {refs.map(r => `§${r}`).join(' · ')}</span></div>
      <p className="ds-text-body doc-lead">{intro}</p>
      <DocSection id="preview" title="Live chart" description="Hover or Tab to a mark for its tooltip; Escape closes it. The tooltip stays while the pointer is over it (SC 1.4.13).">{chart}</DocSection>
      {data && <DocSection id="data" title="Accessible data-table alternative">{data}</DocSection>}
      {extra}
      <DocSection id="spec" title="Styling (resolved tokens)"><SpecTable caption="Chart specification" rows={spec} /></DocSection>
      <DocSection id="responsive" title="Responsive behavior"><p className="ds-text-body">{responsive}</p></DocSection>
      {empty && <DocSection id="empty" title="Empty state"><Preview surface="card">{empty}</Preview></DocSection>}
      <DocSection id="code" title="Implementation"><CodeBlock code={code} title="React usage (this showcase's SVG/HTML chart)" /></DocSection>
      <div className="doc-stack">{refs.map(r => <SpecSource key={r} num={r} />)}</div>
    </div>
  );
}

function HeatRamp() {
  return <div className="doc-heatramp" aria-label="Heat scale with text-contrast switch" role="img">
    {Array.from({ length: 21 }, (_, i) => i / 20).map(t => { const c = heatCell(t); return <span key={t} style={{ background: c.fill }} className={c.ink ? 'ds-heat-cell--ink' : undefined}>{t.toFixed(2)}</span>; })}
  </div>;
}

/* ── Foundations ─────────────────────────────────────────────────── */
export function ChartFoundationsPage() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Charts live in dashboard cards, with no horizontal gridlines, transparent plots, a 28px y-axis column with no axis line and a 1px border-subtle baseline (as DEOC). Colors encode meaning only: good / bad, running / stopped, categories in chart-cat-1…4 order, and the five-stop heat scale for defect rates. Every chart has an accessible name, a tooltip on hover and focus, and a data-table alternative. No chart library is used: marks are plain SVG/HTML styled only by §7 tokens.</p>
      <DocSection id="palettes" title="Palettes (§7.2)">
        <Grid min={240}>
          <div className="doc-palette"><b className="ds-text-body-strong">Categorical (in order, R-13)</b><div className="doc-palette__row">{CAT.map(c => <span key={c} style={{ background: c }} />)}</div><code className="ds-text-small">--ds-chart-cat-1 … 4</code></div>
          <div className="doc-palette"><b className="ds-text-body-strong">Chart-library categories 5–8 [EXT]</b><div className="doc-palette__row">{['#34d399', '#fb7185', '#93c5fd', '#f59e0b'].map(c => <span key={c} style={{ background: c }} />)}</div><code className="ds-text-small">literals in charts/library/scales.ts; not in §7.2 (see QA)</code></div>
          <div className="doc-palette"><b className="ds-text-body-strong">Binary quality</b><div className="doc-palette__row"><span style={{ background: 'var(--ds-chart-positive)' }} /><span style={{ background: 'var(--ds-chart-negative)' }} /></div><code className="ds-text-small">--ds-chart-positive · --ds-chart-negative</code></div>
          <div className="doc-palette"><b className="ds-text-body-strong">Running / stopped</b><div className="doc-palette__row"><span style={{ background: 'var(--ds-chart-running)' }} /><span style={{ background: 'var(--ds-chart-stopped)' }} /></div><code className="ds-text-small">--ds-chart-running · --ds-chart-stopped</code></div>
          <div className="doc-palette"><b className="ds-text-body-strong">Heat scale (5 stops)</b><div className="doc-palette__row">{[0, 1, 2, 3, 4].map(i => <span key={i} style={{ background: `var(--ds-heat-${i})` }} />)}</div><code className="ds-text-small">--ds-heat-0 … 4 · #003e3a #116035 #597730 #d18732 #ff5825</code></div>
          <div className="doc-palette"><b className="ds-text-body-strong">Trend</b><div className="doc-palette__row"><span style={{ background: 'var(--ds-chart-trend)' }} /></div><code className="ds-text-small">--ds-chart-trend (white)</code></div>
        </Grid>
        <HeatRamp />
        <p className="ds-text-small">Heat scale (good → bad), interpolated in RGB between the five stops. Colour is a pure function of the value, so equal values always get equal colours (R-25). Cell text switches to text-on-bright at ≥ 0.6 of the scale because white fails 4.5:1 on the orange end (§7.2, R-21); the current implementation switches at 0.59 and snaps 0.55–0.59 (QA findings).</p>
      </DocSection>
      <DocSection id="formatting" title="Number formatting (§7.1)">
        <SpecTable caption="Formatting" rows={[{ property: 'Thousands (system, en-GB)', value: fmtInt(123456) }, { property: 'Thousands (screens, en-IN)', value: fmtIN(123456) }, { property: 'Defect rates', value: `${pct(10)} · ${pct(6.5)}` }, { property: 'Compact axes', value: '10k · 20k · 60k' }, { property: 'Dates', value: '10 Apr 2024 14:32 · 10 Apr, 08:14 AM' }]} />
        <p className="ds-text-small">§7.1 sets en-GB grouping for the system and leaves the screens' Indian grouping (“1,23,456”) as a product locale decision; the application examples use en-IN in tables and tooltips.</p>
      </DocSection>
      <DocSection id="axes" title="Axes (§7.3)"><SpecSource num="7.3" title="Axis table" /></DocSection>
      <SpecSource num="7.1" />
      <SpecSource num="7.2" />
    </div>
  );
}

/** Extra bands for the responsiveness demo: Quality Snapshot rows repeated with line suffixes. */
const qualityBands = (n: number) => Array.from({ length: n }, (_, i) => { const d = QUALITY[i % QUALITY.length]; return { ...d, x: n > QUALITY.length ? `${d.x} ${i + 1}` : d.x }; });

export function VerticalBarPage({ stacked }: { stacked?: boolean }) {
  const [n, setN] = useState('6');
  const [trend, setTrend] = useState(true);
  const rows = n === '0' ? [] : qualityBands(+n);
  const data = rows.map(d => ({ x: d.x, values: { good: d.good, bad: d.bad } }));
  const series = stacked ? [GOOD, BAD] : [GOOD];
  return (
    <ChartDocPage tag="OBSERVED" refs={['7.4', '7.5']}
      intro={stacked
        ? 'Quality Snapshot (Analytics): good products at the bottom, bad on top, segments abut with no gap, radius 4 on the top corners. The defect-rate trend is a 3px white line dashed 8 / 8 on its own scale, with 10px white points at band centres and a value label 14px above each point.'
        : 'Vertical bars in equal-width bands: the bar is 60% of its band (max 74px, min 6px); 28px y-axis column with 7 ticks rounded to a nice step; centred x labels 10px below the baseline; no horizontal gridlines.'}
      chart={
        <DashCard title="Quality Snapshot" right={<>
          <Legend kind="swatch" items={[...series.map(s => ({ label: s.label, color: s.color })), ...(trend && stacked ? [{ label: 'Defect rate', color: 'var(--ds-chart-trend)', dashed: true }] : [])]} />
          <Select variant="filter" label="Bands" value={n} onChange={setN} className="ds-select--180" searchable={false} options={[{ value: '0', label: 'No data' }, { value: '6', label: '6 factories' }, { value: '14', label: '14 bands' }, { value: '30', label: '30 bands' }]} />
          {stacked && <Tabs idBase="trend" size="sm" label="Overlay" value={trend ? 'on' : 'off'} onChange={v => setTrend(v === 'on')} tabs={[{ value: 'on', label: 'Trend' }, { value: 'off', label: 'Bars only' }]} />}
        </>}>
          <BarChart label={stacked ? 'Good and bad products by factory with defect rate' : 'Good products by factory'} data={data} series={series} trend={trend && stacked ? { label: 'Defect rate', values: rows.map(d => d.rate), format: v => `${v}%` } : undefined} />
        </DashCard>
      }
      data={<ChartData caption="Quality snapshot" head={['Factory', 'Good products', 'Bad products', 'Defect rate']} rows={QUALITY.map(d => [d.x, d.good, d.bad, `${d.rate}%`])} />}
      empty={<ChartEmpty />}
      spec={[
        { property: 'Plot height', value: '300px (Analytics)' }, { property: 'Bar width', value: '74% of band · max 74 · min 6' }, { property: 'Stacked segments', value: 'no gap (the previous system used 2px)' },
        { property: 'Series', token: '--ds-chart-positive + --ds-chart-negative' }, { property: 'Axis line / baseline', token: '--ds-chart-axis + --ds-chart-baseline' },
        { property: 'Y labels', token: '--ds-color-text-axis' }, { property: 'X labels', token: '--ds-color-text-primary' },
        { property: 'Top corners', token: '--ds-radius-xs' }, { property: 'Trend line', token: '--ds-chart-trend', note: ' 3px, dashed 8 8; points 10px' }, { property: 'Height animation', token: '--ds-duration-slow' },
      ]}
      responsive="Bands share the plot equally. Labels wrap to two lines, then thin to every k-th band when a band is too narrow; trend value labels thin below ~56px a band, and trend points are hidden above 16 bands. Below 16px a band the band row scrolls horizontally instead of squeezing marks. Dashboard pairs stack below 1280px."
      code={`<BarChart label="Good and bad products by factory" data={data}\n  series={[{ key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)' }, { key: 'bad', label: 'Bad Products', color: 'var(--ds-chart-negative)' }]}\n  trend={{ label: 'Defect rate', values: rates, format: v => \`\${v}%\` }} />`} />
  );
}

export function HorizontalBarPage() {
  const rows = LINE_DEFECTS.slice(0, 5).map(r => ({ label: r.line, sub: r.product, value: Math.round(r.analysed * r.total / 100) }));
  return (
    <ChartDocPage tag="EXTENSION" refs={['7.4']}
      intro="Horizontal bars [EXTENSION]: 20px bars 12px apart, a 154px label column (line name + product) and the value after the bar in small-strong. The axis maximum keeps 25% headroom over the largest value so the label fits."
      chart={<DashCard title="Bad Products by Line" subtitle="Products analysed × total defect %"><HBarChart label="Bad products by line" data={rows} format={fmtIN} /></DashCard>}
      data={<ChartData caption="Bad products by line" head={['Line', 'Product', 'Bad products']} rows={rows.map(r => [r.label, r.sub, fmtIN(r.value)])} />}
      empty={<ChartEmpty height={200} />}
      spec={[{ property: 'Bar height / gap', value: '20px / 12px' }, { property: 'Label column', value: '154px' }, { property: 'Bar color', token: '--ds-chart-cat-1' }, { property: 'Bar end radius', token: '--ds-radius-xs' }, { property: 'Axis max', value: '1.25 × largest value' }]}
      responsive="The label column stays 154px and bars scale to the remaining width; below 400px each row stacks (label above a full-width track). Labels truncate; the full text stays in the bar's accessible name and tooltip."
      code={`<HBarChart label="Bad products by line" data={[{ label: 'Bottle Line-1', sub: 'Vim Dishwash 500 ml Pouch', value: 12346 }, …]} format={fmtIN} />`} />
  );
}

export function GroupedBarPage() {
  const series = DEFECT_DIST.slice(0, 3).map((d, i) => ({ key: `c${i}`, label: d.label, color: d.color }));
  const data = QUALITY.slice(0, 3).map(q => ({ x: q.x, values: Object.fromEntries(series.map((s, i) => [s.key, Math.round(q.bad * SPLIT[i])])) }));
  return (
    <ChartDocPage tag="EXTENSION" refs={['7.4']}
      intro="Grouped bars [EXTENSION]: up to 3 series per band, 4px apart inside the group; the group is 74% of the band (max 222px). Categorical colors in order, as in the Defect Distribution donut."
      chart={<DashCard title="Defects by Category" subtitle="Bad products per factory" right={<Legend items={series.map(s => ({ label: s.label, color: s.color }))} />}><GroupedBarChart label="Defects by category per factory" data={data} series={series} /></DashCard>}
      data={<ChartData caption="Defects by category" head={['Factory', ...series.map(s => s.label)]} rows={data.map(d => [d.x, ...series.map(s => d.values[s.key])])} />}
      empty={<ChartEmpty />}
      spec={[{ property: 'Series colors', token: '--ds-chart-cat-1 + --ds-chart-cat-2 + --ds-chart-cat-3' }, { property: 'Gap in group', token: '--ds-space-1' }, { property: 'Group width', value: '74% of band · max 222px' }]}
      responsive="Groups shrink with the band; below 16px a band the row scrolls. With many bands on narrow cards prefer the stacked chart."
      code={`<GroupedBarChart label="Defects by category per factory" data={data} series={series} />`} />
  );
}

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
/** The Analytics "Time Series" view (src/apps/vision/Analytics.tsx). */
const WEEKLY = [
  { ...GOOD, values: [218, 224, 230, 226, 231, 228, 236, 234].map(v => v * 1000) },
  { ...BAD, values: [21, 19, 18, 20, 17, 18, 16, 18].map(v => v * 1000) },
];

export function LinePage({ area }: { area?: boolean }) {
  return (
    <ChartDocPage tag="EXTENSION" refs={['7.5']}
      intro={area
        ? 'Area chart [EXTENSION]: the line chart with each series filled by its color. §7.5 specifies area fills at 16% opacity; the current LineChart draws a 12% → 0% vertical gradient (QA findings).'
        : 'Standalone line chart [EXTENSION] (Analytics “Time Series” view): 2px solid lines in their series colors; points show on hover / focus (always with 12 points or fewer); a 1px guide line and a rich tooltip listing every series at that x.'}
      chart={<DashCard title="Quality Snapshot" subtitle="Good and bad products per week" right={<Legend items={WEEKLY.map(s => ({ label: s.label, color: s.color }))} />}><LineChart label="Good and bad products per week" x={WEEKS} series={WEEKLY} area={area} /></DashCard>}
      data={<ChartData caption="Products per week" head={['Week', ...WEEKLY.map(s => s.label)]} rows={WEEKS.map((w, i) => [w, ...WEEKLY.map(s => s.values[i])])} />}
      empty={<ChartEmpty />}
      spec={[{ property: 'Stroke', value: '2px solid, series colors' }, { property: 'Points', value: '6px, on hover/focus (always ≤ 12 points)' }, { property: 'Guide line', value: '1px white / 20 %' }, { property: 'Plot height', value: '300px' }, ...(area ? [{ property: 'Area fill', value: '§7.5: 16% · implemented: 12% → 0%' }] : [])]}
      responsive="The plot measures its container and redraws; x labels thin to calendar-meaningful steps (every 3rd, 6th, 12th) when points are closer than 36px."
      code={`<LineChart label="Good and bad products per week" x={weeks} series={[{ key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)', values }]}${area ? ' area' : ''} />`} />
  );
}

export function DonutPage() {
  const total = DEFECT_DIST.reduce((s, d) => s + d.value, 0);
  return (
    <ChartDocPage tag="OBSERVED" refs={['7.6']}
      intro="Defect Distribution (DEOC dashboard): a 180px donut with a 32px ring (180 viewBox, radius 74, stroke 32) over a full track, segments clockwise from 12 o'clock with no gaps. Segments and legend swatches both use chart-cat-1…4 (R-13). The legend repeats every value, so nothing is hover-only; legend rows are the keyboard targets and highlight their segment."
      chart={<DashCard title="Defect Distribution"><Donut label="Defects by category" data={DEFECT_DIST} /></DashCard>}
      data={<ChartData caption="Defects by category" head={['Category', 'Defects', 'Share']} rows={DEFECT_DIST.map(d => [d.label, d.value, fmtPct((d.value / total) * 100)])} />}
      empty={<ChartEmpty height={230} />}
      spec={[{ property: 'Size / ring', value: '180px / 32px' }, { property: 'Track', token: '--ds-chart-track' }, { property: 'Segments + swatches', token: '--ds-chart-cat-1 + --ds-chart-cat-2 + --ds-chart-cat-3 + --ds-chart-cat-4' }, { property: 'Swatch', value: '24 × 16, radius 4' }, { property: 'Legend label', token: '--ds-color-text-tertiary', note: ' 14/500' }, { property: 'Legend value', token: '--ds-color-text-muted', note: ' 14/500, end-aligned' }, { property: 'Segment animation', token: '--ds-duration-chart' }]}
      responsive="The legend sits beside the donut (gap 20) in the fixed 594px card and wraps below it when the card is narrow; the pair stacks below 1280px."
      code={`<Donut label="Defects by category" data={[{ label: 'Primary - Front', value: 1561, color: 'var(--ds-chart-cat-1)' }, …]} />`} />
  );
}

export function HeatmapPage() {
  const [rev, setRev] = useState(false);
  return (
    <ChartDocPage tag="OBSERVED" refs={['7.7']}
      intro="Defect Rate by Category & Factory (Analytics): a flush card; header row on surface-table-header with 14/600 uppercase labels; a first column with 28px start padding; full-bleed heat cells with 14/600 white values; rows 40px. Colour is a pure function of the value (R-25): the Lotus row reads 10% in every column and is one colour. Hover brightens the cell (brightness 1.25); focus uses the on-color ring."
      chart={<DashCard flush title="Defect Rate by Category & Factory" subtitle={rev ? 'High = good (stops reversed)' : 'High = bad'} right={<Tabs idBase="hm" size="sm" label="Scale direction" value={rev ? 'good' : 'bad'} onChange={v => setRev(v === 'good')} tabs={[{ value: 'bad', label: 'High = bad' }, { value: 'good', label: 'High = good' }]} />}>
        <Heatmap label="Defect rate by factory and category" rows={HEAT_ROWS} cols={HEAT_COLS} values={HEAT_VALUES} reversed={rev} rowLabel="Factory" format={pct} /></DashCard>}
      data={<ChartData caption="Defect rate by factory and category" head={['Factory', ...HEAT_COLS]} rows={HEAT_ROWS.map((r, i) => [r, ...HEAT_VALUES[i].map(pct)])} />}
      spec={[{ property: 'Row min height', token: '--ds-size-heat-row' }, { property: 'Header fill', token: '--ds-color-surface-table-header' }, { property: 'Dividers', token: '--ds-color-border-divider' }, { property: 'Stops', token: '--ds-heat-0 + --ds-heat-1 + --ds-heat-2 + --ds-heat-3 + --ds-heat-4' }, { property: 'Text on bright cells', token: '--ds-color-text-on-bright', note: ' ≥ 0.6 of the scale' }, { property: 'Focus on color', token: '--ds-color-focus-ring-on-color' }]}
      responsive="The grid keeps a 520px minimum and scrolls horizontally inside the card on narrow screens."
      extra={<DocSection id="contrast" title="Text contrast along the scale" description="Rendered by heatCell(): white text up to 0.55, text-on-bright from 0.59, with 0.55–0.59 snapped to the nearer edge. §7.2 / R-21 state the switch at 0.6 (QA findings)."><HeatRamp /></DocSection>}
      code={`<Heatmap label="Defect rate by factory and category" rows={factories} cols={categories} values={rates} rowLabel="Factory" format={pct} />`} />
  );
}

export function BubblePage() {
  const at = (i: number, j: number, k: 2 | 3) => MATRIX_POINTS.find(p => p[0] === i && p[1] === j)?.[k] ?? 0;
  const volume = MATRIX_ROWS.map((_, i) => MATRIX_COLS.map((_, j) => at(i, j, 2)));
  const rate = MATRIX_ROWS.map((_, i) => MATRIX_COLS.map((_, j) => at(i, j, 3)));
  return (
    <ChartDocPage tag="OBSERVED" refs={['7.8']}
      intro="Line - Product Defect Matrix (Analytics): one row per line (88px, label in a 154px column), one column per product. Bubble area encodes products analysed — diameter 10 + √(v / max) × 26, so 10–36px — and colour encodes the defect rate on the heat scale, normalised over the bubbles shown. Cells with zero volume draw no bubble. Bubbles carry no text, so no contrast switch is needed."
      chart={<DashCard title="Line - Product Defect Matrix" subtitle="Size = products analysed · colour = defect rate"><BubbleMatrix label="Defect rate by line and product" rows={MATRIX_ROWS.map(label => ({ label }))} cols={MATRIX_COLS} volume={volume} rate={rate} rateLabel="Overall Defect %" volumeLabel="Total Products Analyzed" /></DashCard>}
      data={<ChartData caption="Products analysed and defect rate" head={['Line', 'Product', 'Products analysed', 'Defect %']} rows={MATRIX_POINTS.map(([i, j, v, p]) => [MATRIX_ROWS[i], MATRIX_COLS[j], fmtIN(v), `${p.toFixed(1)}%`])} />}
      spec={[{ property: 'Row height', value: '88px' }, { property: 'Label column', value: '154px' }, { property: 'Diameter', value: '10 + √(v / max) × 26 px (10–36)' }, { property: 'Ring', token: '--ds-chart-bubble-stroke', note: ' 2px' }, { property: 'Row label', token: '--ds-color-text-chart-strong' }, { property: 'Product axis', token: '--ds-color-text-chart-subtle', note: ' 11px, 2-line clamp' }, { property: 'Hover', value: 'transform: scale(1.1)' }, { property: 'Focus', token: '--ds-color-focus-ring' }]}
      responsive="Columns are equal grid tracks with a 480px row minimum; the matrix scrolls horizontally in narrow cards."
      code={`<BubbleMatrix label="Defect rate by line and product" rows={lines} cols={products} volume={analysed} rate={defectRate} rateLabel="Overall Defect %" volumeLabel="Total Products Analyzed" />`} />
  );
}

export function ProgressVizPage() {
  return (
    <ChartDocPage tag="OBSERVED" refs={['5.34', '5.26']}
      intro="Status cards (Analytics) use the large segmented bar: 40px, radius 12 at the ends, no gaps and no numbers — the legend carries the counts. The medium segmented bar (20px, radius 6, 2px gaps, counts in ink) is preserved from the previous system. The 4px progress bar is the factory-card well (Factories). Empty segments are omitted."
      chart={<div className="doc-stack"><StatusCard title="Camera Status" running={123} stopped={5}><p className="ds-text-body-muted doc-pad">Offline cameras are listed here (§5.26).</p></StatusCard>
        <Preview surface="card"><div className="doc-stack doc-full"><SegBar segments={[{ value: 21, color: 'var(--ds-chart-running)', label: 'lines running' }, { value: 7, color: 'var(--ds-chart-stopped)', label: 'lines stopped' }]} /><Progress value={100} tone="success" label="Factory 1 lines active" /><Progress value={50} tone="error" label="Factory 2 lines active" /></div></Preview></div>}
      spec={[{ property: 'Segmented bar lg', token: '--ds-size-control + --ds-radius-track', note: ' no gaps' }, { property: 'Segmented bar md', value: '20px · radius 6 · no gaps · min 28px' }, { property: 'Count text (md)', token: '--ds-color-text-on-bright' }, { property: 'Progress track', token: '--ds-color-track', note: ' 4px' }, { property: 'Progress fill (success)', token: '--ds-gradient-progress-success' }]}
      responsive="Full width at every breakpoint; md segment numbers hide below the 28px minimum (the counts stay in the accessible name)."
      code={`<SegBar size="lg" segments={[{ value: 123, color: 'var(--ds-chart-running)', label: 'running' }, …]} />\n<Progress value={100} tone="success" label="Factory 1 lines active" />`} />
  );
}

export function TooltipsLegendsPage() {
  const analysed = 123456, rate = HEAT_VALUES[0][0], bad = Math.round(analysed * rate / 100);
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">The rich chart tooltip (§7.9) is anchored 12px right and below the mark, flips at the container edges, is hoverable and closes on Escape: gradient-tooltip fill, 1px glass border, radius 8, padding 12, 314px wide (342 for long lists). Legends come in three styles (§7.10): swatch (default), swatch with count (status cards) and dot (compact).</p>
      <DocSection id="tooltip" title="Rich tooltip (static render, Analytics heatmap)">
        <Preview surface="card"><div className="ds-chart-tip doc-static-tip" role="presentation"><TipContent title={HEAT_ROWS[0]} sub={HEAT_COLS[0]} color={heatColor(1)} rows={[['Overall Defect %', pct(rate)], ['Total Products Analyzed', fmtIN(analysed)], ['Bad Products', fmtIN(bad)]]} list={{ title: 'Product Distribution', items: ['Vim Dishwash 500 ml Pouch', 'Lifebuoy Handwash Refill 185 ml', 'Lifebuoy Handwash Refill 500 ml', 'Comfort After Wash 200 ml'].map((p, k) => [p, fmtIN(Math.round(bad * SPLIT[k]))] as [string, string]) }} /></div></Preview>
      </DocSection>
      <DocSection id="legends" title="Legends">
        <Grid min={260}>
          <div className="doc-cell"><div className="doc-cell__stage"><Legend items={[{ label: 'Good Products', color: 'var(--ds-chart-positive)' }, { label: 'Bad Products', color: 'var(--ds-chart-negative)' }]} /></div><p className="doc-cell__label">swatch · 24×16 · card header</p></div>
          <div className="doc-cell"><div className="doc-cell__stage"><Legend kind="dot" items={[{ label: 'Running', color: 'var(--ds-chart-running)' }, { label: 'Stopped', color: 'var(--ds-chart-stopped)' }]} /></div><p className="doc-cell__label">dot · 12px · compact headers</p></div>
          <div className="doc-cell"><div className="doc-cell__stage"><Legend kind="line" items={[{ label: 'Defect rate', color: 'var(--ds-chart-trend)' }]} /></div><p className="doc-cell__label">line · trend overlay</p></div>
          <div className="doc-cell"><div className="doc-cell__stage"><Legend items={DEFECT_DIST.slice(0, 2).map(d => ({ label: d.label, color: d.color, value: fmtInt(d.value) }))} /></div><p className="doc-cell__label">with values</p></div>
        </Grid>
      </DocSection>
      <DocSection id="spec" title="Tooltip styling"><SpecTable caption="Tooltip" rows={[{ property: 'Width', token: '--ds-size-tooltip', note: ' (342px wide variant)' }, { property: 'Fill / border', token: '--ds-gradient-tooltip + --ds-color-border-glass' }, { property: 'Radius / padding', token: '--ds-radius-sm + --ds-space-3' }, { property: 'Divider', token: '--ds-color-border-tooltip-divider' }, { property: 'Text strong / muted', token: '--ds-color-text-tooltip + --ds-color-text-tooltip-muted' }, { property: 'Shadow', token: '--ds-shadow-tooltip' }, { property: 'Z-index', token: '--ds-z-tooltip' }]} /></DocSection>
      <SpecSource num="7.9" />
      <SpecSource num="7.10" />
    </div>
  );
}

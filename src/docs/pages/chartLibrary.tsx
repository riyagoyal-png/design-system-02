import { useMemo, useState, type ReactNode } from 'react';
import { BarChart, Donut, Heatmap } from '../../charts/Charts';
import { Legend } from '../../charts/core';
import { DashCard } from '../../components/ds/Cards';
import { Badge } from '../../components/ds/Display';
import { SearchInput } from '../../components/ds/Field';
import { Switch } from '../../components/ds/Choice';
import { Select } from '../../components/ds/Select';
import { Tabs } from '../../components/ds/Nav';
import { href } from '../../lib/router';
import { DocSection, Prov, SpecTable } from '../kit';
import { CATEGORIES, CHARTS, CHOOSING, type ChartEntry } from '../../charts/library/registry';
import { costs, DAYS, departments, flow, heatTeams, heatValues, histogram, inspectionTimes, inventory, monthly, offices, pareto, ratings, scatter, control, controlLimits } from '../../charts/library/data';
import { CATEGORICAL } from '../../charts/library/scales';
import { CATALOG } from '../../charts/library/catalog';
import { HowToCustomize } from '../../charts/library/HowToCustomize';
import { Choropleth, ControlChart, ForecastChart, Histogram, ParetoChart, Pie, RangePlot, SankeyChart, ScatterPlot, ShapeLegend, StepChart } from '../../charts/library/LibraryCharts';

const FIGMA_LABEL: Record<ChartEntry['figma'], string> = { existing: 'Existing component', extension: 'Extension', native: 'Native component', template: 'Editable template' };

/** Live cards: each owns only controls that change the rendered data. */
function LiveChart({ id, legends }: { id: string; legends: boolean }): { right?: ReactNode; body: ReactNode } {
  const [measure, setMeasure] = useState('actual');
  const [cats, setCats] = useState('6');
  const [bin, setBin] = useState('4');
  const [shape, setShape] = useState<'donut' | 'pie'>('donut');
  const [days, setDays] = useState('7');
  const [band, setBand] = useState(true);
  const [fc, setFc] = useState(true);
  const [limits, setLimits] = useState(true);
  const [tx, setTx] = useState('75');
  const [ty, setTy] = useState('75');
  const L = (items: { label: string; color: string; dashed?: boolean }[], kind?: 'swatch' | 'line') => legends ? <Legend items={items} kind={kind} /> : null;
  switch (id) {
    case 'column': {
      const data = departments.slice(0, cats === '0' ? 0 : +cats).map(d => ({ x: d.name, values: { v: measure === 'actual' ? d.actual : d.plan } }));
      return { right: <>{L([{ label: measure === 'actual' ? 'Actual people' : 'Planned people', color: CATEGORICAL[0] }])}
        <Select variant="filter" label="Measure" className="ds-select--160" value={measure} onChange={setMeasure} searchable={false} options={[{ value: 'actual', label: 'Actual' }, { value: 'plan', label: 'Plan' }]} />
        <Select variant="filter" label="Categories" className="ds-select--160" value={cats} onChange={setCats} searchable={false} options={[{ value: '6', label: '6 departments' }, { value: '4', label: '4 departments' }, { value: '0', label: 'No data' }]} /></>,
        body: <BarChart label="Staff by department" data={data} series={[{ key: 'v', label: 'People', color: CATEGORICAL[0] }]} stacked={false} /> };
    }
    case 'histogram': return { right: <Select variant="filter" label="Bin width" className="ds-select--160" value={bin} onChange={setBin} searchable={false} options={[{ value: '4', label: '4 min bins' }, { value: '8', label: '8 min bins' }]} />,
      body: <Histogram label="Inspection duration histogram" unit="min" bins={histogram(inspectionTimes, 8, 48, +bin)} /> };
    case 'pie': {
      const data = costs.map((c, i) => ({ label: c.name, value: c.value, color: CATEGORICAL[i] }));
      return { right: <Tabs idBase="cl-pie" variant="accent" label="Shape" value={shape} onChange={setShape} tabs={[{ value: 'donut', label: 'Donut (default)' }, { value: 'pie', label: 'Pie' }]} />,
        body: shape === 'pie' ? <Pie label="Operating cost shares" data={data} /> : <Donut label="Operating cost shares" data={data} center={{ value: '₹1,000L', caption: 'Total cost' }} /> };
    }
    case 'heatmap': { const n = +days; return { right: <Select variant="filter" label="Days" className="ds-select--160" value={days} onChange={setDays} searchable={false} options={[{ value: '7', label: 'All week' }, { value: '5', label: 'Weekdays' }]} />,
      body: <Heatmap label="First-pass quality by team and day" rowLabel="Team" rows={heatTeams} cols={DAYS.slice(0, n)} values={heatValues.map(r => r.slice(0, n))} format={v => `${v}%`} reversed /> }; }
    case 'dumbbell': return { right: L([{ label: 'Previous', color: CATEGORICAL[0] }, { label: 'Current', color: CATEGORICAL[3] }]), body: <RangePlot label="Department ratings, previous vs current" style="dumbbell" max={5} rows={ratings} /> };
    case 'lollipop': return { right: L([{ label: 'Current rating · /5', color: CATEGORICAL[3] }]), body: <RangePlot label="Current department ratings" style="lollipop" max={5} rows={ratings.map(r => ({ name: r.name, current: r.current }))} /> };
    case 'dot': return { right: L([{ label: 'People', color: CATEGORICAL[0] }]), body: <RangePlot label="Headcount by department" style="dot" max={200} format={v => `${Math.round(v)}`} rows={departments.map(d => ({ name: d.name, current: d.actual }))} /> };
    case 'combination': return { right: <>{L([{ label: 'Actual', color: CATEGORICAL[0] }, ...(fc ? [{ label: 'Forecast', color: CATEGORICAL[1], dashed: true }] : []), ...(band ? [{ label: '95% band', color: CATEGORICAL[1] }] : [])])}
        <Switch label="Forecast" checked={fc} onChange={setFc} /><Switch label="Band" checked={band} onChange={setBand} /></>,
      body: <ForecastChart label="Output vs forecast with prediction band" data={monthly} showBand={band} showForecast={fc} /> };
    case 'step': return { right: L([{ label: 'Inventory · pallets', color: CATEGORICAL[0] }]), body: <StepChart label="Month-end pallet inventory" data={inventory} /> };
    case 'control': return { right: <>{L([{ label: 'Measurement', color: CATEGORICAL[0] }, ...(limits ? [{ label: '3σ limits', color: 'var(--ds-color-warning-text)', dashed: true }] : [])])}<Switch label="Limits" checked={limits} onChange={setLimits} /></>,
      body: <ControlChart label="Fill weight control chart" data={control} limits={controlLimits} showLimits={limits} /> };
    case 'pareto': return { right: L([{ label: 'Defects', color: CATEGORICAL[0] }, { label: 'Cumulative %', color: CATEGORICAL[3], dashed: true }]), body: <ParetoChart label="Defects by cause with cumulative share" data={pareto} /> };
    case 'sankey': return { body: <SankeyChart label="Headcount flow from teams to departments to shifts" unit="people" nodes={flow.nodes} links={flow.links} /> };
    case 'choropleth': return { right: <Badge tone="warning" size="sm">Internal reference geometry</Badge>, body: <Choropleth label="Synthetic headcount by state" values={offices} /> };
    case 'scatter': return { right: <>{legends && <ShapeLegend groups={['Shift A', 'Shift B', 'Shift C']} />}
        <Select variant="filter" label="Skill cutoff" className="ds-select--160" value={tx} onChange={setTx} searchable={false} options={['60', '70', '75', '80'].map(v => ({ value: v, label: `Skill ${v}%` }))} />
        <Select variant="filter" label="Output cutoff" className="ds-select--160" value={ty} onChange={setTy} searchable={false} options={['60', '70', '75', '80'].map(v => ({ value: v, label: `Output ${v}%` }))} /></>,
      body: <ScatterPlot label="Skill coverage vs output attainment" points={scatter} groups={['Shift A', 'Shift B', 'Shift C']} tx={+tx} ty={+ty} /> };
    default: { const r = CATALOG[id]?.(); return { right: legends ? r?.legend : undefined, body: r?.body ?? null }; }
  }
}
function LiveCard({ entry, legends }: { entry: ChartEntry; legends: boolean }) {
  const { right, body } = LiveChart({ id: entry.id, legends });
  return <div className="cl-card-wrap" id={`chart-${entry.id}`}>
    <DashCard title={`${entry.n}. ${entry.name}`} subtitle={entry.description} right={right}>{body}</DashCard>
    <p className="ds-text-small cl-card-meta"><Prov tag="EXTENSION" /> Figma: <b>{entry.figmaName}</b> · {FIGMA_LABEL[entry.figma]}{entry.route && <> · <a className="ds-link" href={href(entry.route)}>Full page</a></>} · <a className="ds-link" href={href('/charts/playground') + '?chart=' + entry.id}>Playground</a></p>
    <HowToCustomize id={entry.id} collapsible />
  </div>;
}

const DIFFS: SpecRowLike[] = [
  { property: 'Narrow cards', value: 'React: every chart re-lays out from the measured width (label thinning, compact layouts, legend wrapping). Figma cannot react to width, so the same decisions are bound to the “Chart width” variable modes (≥ 640 · 560–639 · 480–559 · 400–479 · < 400 px): one mode switch on a card or parent frame applies them. The matrix lists, per chart, the width below which the switch is needed.' },
  { property: 'Values', value: 'React: computed from data on every render. Figma: values are set once as paddings, grid-track ratios or arcs; layout (not the value) follows the container. Vector templates need regeneration when data changes.' },
  { property: 'Column / grouped / stacked', value: 'Both: each category band owns its bar and X label and gets an equal share; the bar is 74% of its band (6–74px); stacked segments abut with no gap. React adds a horizontal scroll below 16px a band; Figma uses the Bands slot (duplicate / delete / reorder Chart / Band).' },
  { property: 'Horizontal bar', value: 'Both: bar = value ÷ axis max of a 2-column track grid (React: axis max = 1.25 × the largest value, so the value label fits down to 400 px); below 400px the rows stack (Figma: the “< 400 px” Chart width mode sets layout=stacked).' },
  { property: 'Dumbbell / lollipop / dot', value: 'Both: positions are fractions of the track. Figma: the Range row Track is a 3-column grid with previous and current anchors, so dots hold their value at any width.' },
  { property: 'Vector templates', value: 'React re-lays out from data at every width. Figma templates are imported from the same renderer: marks scale inside a Plot area, labels and points keep their size on anchors, and charts whose narrow layout differs carry a hidden Compact composition (shown below its breakpoint). New data means regenerating the template.' },
  { property: 'Sankey', value: 'React: d3-sankey runs on each width. Figma: one layout from the same algorithm with Scale constraints — resizes correctly from 320 to 880px card width; new data needs the paths regenerated.' },
  { property: 'Scatter', value: 'React: thresholds are live controls. Figma: points and reference lines live in a freeform slot with Scale constraints, so their data positions hold at any width; new points need Scale constraints too.' },
  { property: 'Choropleth', value: 'Same India geometry (internal reference, redistribution unverified); fills use the chart-library sequential scale in both (not a §7.2 palette).' },
  { property: 'Hover', value: 'React: the §7.9 rich tooltip (gradient-tooltip, 314px) on hover and keyboard focus. Figma: tooltips are composed from Chart / Tooltip instances.' },
];
type SpecRowLike = { property: string; value: string };

export function ChartLibraryPage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [width, setWidth] = useState('full');
  const [legends, setLegends] = useState(true);
  const list = useMemo(() => CHARTS.filter(c => (cat === 'all' || c.category === cat) && (status === 'all' || c.status === status) && `${c.name} ${c.id} ${c.description}`.toLowerCase().includes(q.trim().toLowerCase())), [q, cat, status]);
  const live = CHARTS.filter(c => c.status === 'live').length, page = CHARTS.filter(c => c.status === 'page').length;
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">All {CHARTS.length} chart types — the 63 from the Pulse chart library plus the Vision Automation bubble matrix — mapped to this system with the same names and categories as the Figma library (page 07). They draw with the §7.12 chart-library primitives on the same chart core (ticks, tooltip, formatting) as the Analytics screen, and the core charts they reuse (bars, donut, heatmap, bubble matrix) carry its restyle: 2px white trend lines dashed 6 / 5, a 180px donut with a 32px ring and no segment gaps, chart-cat-1…4 for categories (R-13), and the five-stop heat scale (#003e3a → #ff5825) whose colour is a pure function of the value (R-25). Categories 5–8, the sequential ramp and the guide line come from the chart library's own scales and are not defined in §7.2. Pulse is the structural reference, not the visual one. {live} render live here and {page} have their own pages; every one has a Figma asset on page 07.</p>
      <div className="cl-controls" role="group" aria-label="Chart library filters">
        <SearchInput value={q} onValueChange={setQ} label="Search chart types" placeholder="Search chart types…" width="md" />
        <Select variant="filter" label="Category" className="ds-select--200" value={cat} onChange={setCat} searchable={false} options={[{ value: 'all', label: 'All categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />
        <Select variant="filter" label="Status" className="ds-select--180" value={status} onChange={setStatus} searchable={false} options={[{ value: 'all', label: 'All statuses' }, { value: 'live', label: 'Live here' }, { value: 'page', label: 'On its own page' }]} />
        <Select variant="filter" label="Preview width" className="ds-select--180" value={width} onChange={setWidth} searchable={false} options={[{ value: 'full', label: 'Full width' }, { value: '640', label: '640 px card' }, { value: '360', label: '360 px card' }]} />
        <Switch label="Legends" checked={legends} onChange={setLegends} />
      </div>
      <p className="ds-text-small" role="status" aria-live="polite">{list.length} of {CHARTS.length} charts</p>
      {CATEGORIES.map(c => { const items = list.filter(i => i.category === c); if (!items.length) return null;
        return <DocSection key={c} id={`cat-${c.toLowerCase().replace(/[^a-z]+/g, '-')}`} title={c}>
          <div className={`cl-grid cl-grid--${width}`}>
            {items.map(e => <LiveCard key={e.id} entry={e} legends={legends} />)}
          </div>
        </DocSection>; })}
      {!list.length && <div className="ds-empty"><p className="ds-text-card-title">No charts match</p><p className="ds-text-body-muted">Try another name, category or status.</p></div>}
      <DocSection id="choosing" title="Choosing a chart by data structure"><SpecTable caption="Data structure → chart family" rows={CHOOSING.map(([property, value]) => ({ property, value }))} /></DocSection>
      <p className="ds-text-body">Resize any chart and edit its data in the <a className="ds-link" href={href('/charts/playground')}>Chart Responsiveness Playground</a>, which also holds the coverage matrix for all {CHARTS.length} charts.</p>
      <DocSection id="parity" title="Figma ↔ React differences"><SpecTable caption="Native Figma vs functional React" rows={DIFFS} /></DocSection>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, GroupedBarChart, HBarChart, LineChart } from '../../charts/Charts';
import { Legend } from '../../charts/core';
import { DashCard } from '../../components/ds/Cards';
import { Badge, InlineAlert } from '../../components/ds/Display';
import { Button } from '../../components/ds/Button';
import { Switch } from '../../components/ds/Choice';
import { Select } from '../../components/ds/Select';
import { href } from '../../lib/router';
import { DocSection } from '../kit';
import { CHARTS } from '../../charts/library/registry';
import { CAP_LABEL, COVERAGE, RESP_LABEL, coverageTotals, figmaUrl, modeSteps, type Cap, type RespClass } from '../../charts/library/coverage';
import { HowToCustomize } from '../../charts/library/HowToCustomize';
import { flow, MONTHS, scatter, seeded } from '../../charts/library/data';
import { CATEGORICAL } from '../../charts/library/scales';
import { SankeyChart, ScatterPlot, ShapeLegend } from '../../charts/library/LibraryCharts';
import { CATALOG } from '../../charts/library/catalog';
import { exportChartSvg } from '../../charts/library/exportSvg';

/** Charts with live data controls (batch 1); every other chart renders its fixture through the shared catalog. */
const INTERACTIVE = [
  { value: 'column', label: 'Vertical bar' },
  { value: 'grouped', label: 'Grouped bar' },
  { value: 'stacked', label: 'Stacked bar + trend' },
  { value: 'horizontal', label: 'Horizontal bar' },
  { value: 'line', label: 'Line (monthly)' },
  { value: 'scatter', label: 'Scatter / quadrant' },
  { value: 'sankey', label: 'Sankey' },
];
const CHOICES = [...INTERACTIVE, ...CHARTS.filter(c => !INTERACTIVE.some(i => i.value === c.id)).map(c => ({ value: c.id, label: `${c.n}. ${c.name}` }))];
const PRESETS = [1200, 800, 560, 360, 320];
const LONG = ['Assembly', 'Packaging', 'Quality assurance', 'Maintenance', 'Warehouse', 'Logistics', 'Procurement', 'Engineering services', 'Finance', 'People operations', 'Customer support', 'Research', 'Utilities', 'Security', 'Training', 'Facilities',
  'Sales', 'Marketing', 'Legal', 'IT', 'Planning', 'Dispatch', 'Tooling', 'Safety'];
const SHORT = LONG.map(l => l.split(' ').map(w => w[0].toUpperCase() + w.slice(1, w.length > 4 ? 3 : w.length)).join('').slice(0, 4));
const SERIES = [{ key: 'a', label: 'Actual', color: CATEGORICAL[0] }, { key: 'b', label: 'Plan', color: CATEGORICAL[1] }, { key: 'c', label: 'Prior year', color: CATEGORICAL[2] }];
const CLASS_TONE: Record<RespClass, 'success' | 'info' | 'warning' | 'neutral' | 'error'> = { native: 'success', composition: 'info', template: 'warning', fixed: 'neutral' };

/** Deterministic values per category index, so add / remove / reorder keep each category's data. */
function valuesFor(i: number) {
  const r = seeded(1000 + i * 7919);
  for (let k = 0; k < 4; k++) r(); // the LCG's first draws track the seed closely; skip them
  return { a: Math.round(40 + r() * 160), b: Math.round(40 + r() * 160), c: Math.round(40 + r() * 160) };
}

interface Measures { text: string[] }
/** Reads the rendered DOM: band equality, bar ↔ label alignment, overflow, label interval. */
function measure(root: HTMLElement): Measures {
  const out: string[] = [];
  const bands = [...root.querySelectorAll<HTMLElement>('.ds-band')];
  if (bands.length) {
    const ws = bands.map(b => b.getBoundingClientRect().width);
    const offs = bands.map(b => {
      const m = b.querySelector('.ds-bar, .ds-bar-group')!.getBoundingClientRect(); const l = b.querySelector('.ds-band__label')!.getBoundingClientRect();
      return Math.abs(m.left + m.width / 2 - (l.left + l.width / 2));
    });
    const marks = bands.map(b => b.querySelector('.ds-bar, .ds-bar-group')!.getBoundingClientRect().width);
    const shown = bands.filter(b => b.querySelector('.ds-band__label')!.textContent).length;
    out.push(`${bands.length} bands · ${Math.min(...ws).toFixed(1)}–${Math.max(...ws).toFixed(1)} px each`);
    out.push(`Marks ${Math.round(Math.min(...marks))}–${Math.round(Math.max(...marks))} px · bar ↔ label offset ${Math.max(...offs).toFixed(1)} px`);
    out.push(`Labels shown ${shown} of ${bands.length}${shown < bands.length ? ' (reduced tick frequency)' : ''}`);
    const sc = root.querySelector('.ds-bands--scroll');
    out.push(sc ? 'Below 16 px a band — the band row scrolls horizontally (Y axis stays)' : 'No horizontal scroll');
  }
  const rows = [...root.querySelectorAll<HTMLElement>('.ds-hbar__row')];
  if (rows.length) {
    const st = root.querySelector('.ds-hbar--stacked');
    const f = rows.map(r => r.querySelector('.ds-hbar__bar')!.getBoundingClientRect().width / r.querySelector('.ds-hbar__track')!.getBoundingClientRect().width);
    out.push(`${rows.length} rows · ${st ? 'stacked layout (< 400 px)' : 'inline layout'}`);
    out.push(`Bar ÷ track: ${f.map(x => `${(x * 100).toFixed(1)}%`).join(' ')}`);
  }
  const xl = root.querySelectorAll('.ds-axis-x--line span');
  if (xl.length) out.push(`${xl.length} points plotted · ${[...xl].filter(s => s.textContent).length} month labels shown`);
  const chart = root.querySelector<HTMLElement>('.ds-chart');
  if (chart) out.push(chart.scrollWidth > chart.clientWidth + 1 ? `Overflow ${chart.scrollWidth - chart.clientWidth} px` : 'No overflow');
  return { text: out };
}

export function ChartPlaygroundPage() {
  // Deep link: #/charts/playground?chart=sankey&w=360 (used by QA and for sharing a state)
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const [chart, setChart] = useState(() => CHARTS.some(c => c.id === q.get('chart')) ? q.get('chart')! : 'column');
  const [width, setWidth] = useState(() => Math.min(1200, Math.max(280, Number(q.get('w')) || 800)));
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: 7 }, (_, i) => i));
  const [nSeries, setNSeries] = useState('3');
  const [long, setLong] = useState(false);
  const [values, setValues] = useState(false);
  const [months, setMonths] = useState('12');
  const [m, setM] = useState<Measures>({ text: [] });
  // Dataset editor (charts regenerated from data): the JSON the renderer receives, keyed to its chart so a switch never feeds one chart another's data.
  const [applied, setApplied] = useState<{ chart: string; data: unknown } | null>(null);
  const [draft, setDraft] = useState('');
  const [dataError, setDataError] = useState('');
  const fixture = CATALOG[chart]?.fixture;
  const dataset = applied?.chart === chart ? applied.data : null;
  useEffect(() => { setApplied(null); setDataError(''); setDraft(fixture === undefined ? '' : JSON.stringify(fixture, null, 1)); }, [chart, fixture]);
  // Follow later deep links too (same page, only the hash query changes).
  useEffect(() => {
    const on = () => { const p = new URLSearchParams(window.location.hash.split('?')[1] ?? ''); const c = p.get('chart'), w = Number(p.get('w'));
      if (c && CHARTS.some(x => x.id === c)) setChart(c); if (w) setWidth(Math.min(1200, Math.max(280, w))); };
    window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on);
  }, []);
  const stage = useRef<HTMLDivElement>(null);

  const names = long ? LONG : SHORT;
  const cats = order.map(i => ({ i, x: names[i] }));
  const series = SERIES.slice(0, +nSeries);
  const entry = CHARTS.find(c => c.id === chart)!;
  const cov = COVERAGE[chart];
  const totals = coverageTotals();

  const body = useMemo(() => {
    switch (chart) {
      case 'column': return <BarChart label="Headcount by department" stacked={false} showValues={values} series={[SERIES[0]]} data={cats.map(c => ({ x: c.x, values: { a: valuesFor(c.i).a } }))} />;
      case 'grouped': return <GroupedBarChart label="Headcount by department and series" showValues={values} series={series} data={cats.map(c => ({ x: c.x, values: valuesFor(c.i) }))} />;
      case 'stacked': return <BarChart label="Headcount composition by department" showValues={values} series={series} data={cats.map(c => ({ x: c.x, values: valuesFor(c.i) }))}
        trend={{ label: 'Share of plan', values: cats.map(c => { const v = valuesFor(c.i); return v.a / (v.a + v.b) * 100; }), format: v => `${v.toFixed(0)}%` }} />;
      case 'horizontal': return <HBarChart label="Headcount by department" data={cats.map(c => ({ label: c.x, sub: `Site ${['North', 'East', 'West'][c.i % 3]}`, value: valuesFor(c.i).a }))} />;
      case 'line': { const n = +months; const x = Array.from({ length: n }, (_, i) => MONTHS[i % 12] + (n > 12 ? ` ${Math.floor(i / 12) + 1}` : ''));
        return <LineChart label="Monthly output by series" x={x} series={series.map((s, k) => ({ ...s, values: x.map((_, i) => Math.round(80 + k * 25 + i * 3 + 10 * Math.sin(i / 2 + k))) }))} />; }
      case 'scatter': return <ScatterPlot label="Skill coverage vs output attainment" points={scatter.slice(0, Math.max(3, order.length * 2))} groups={['Shift A', 'Shift B', 'Shift C']} tx={75} ty={75} />;
      case 'sankey': return <SankeyChart label="Headcount flow from teams to departments to shifts" unit="people" nodes={flow.nodes} links={flow.links} />;
      default: return CATALOG[chart]?.(dataset ?? undefined).body ?? null;
    }
  }, [chart, cats, series, values, months, order.length, dataset]);

  // Regeneration hook: the template import script reads the rendered chart through the same exporter as the download button.
  useEffect(() => { (window as unknown as { __exportChartSvg?: () => unknown }).__exportChartSvg = () => stage.current && exportChartSvg(stage.current); }, []);
  const applyData = () => { try { setApplied({ chart, data: JSON.parse(draft) }); setDataError(''); } catch (e) { setDataError(`Not valid JSON: ${(e as Error).message}`); } };
  const resetData = () => { setApplied(null); setDataError(''); setDraft(JSON.stringify(fixture, null, 1)); };
  const download = () => { const x = stage.current && exportChartSvg(stage.current); if (!x) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([x.svg], { type: 'image/svg+xml' })); a.download = `${chart}-${width}px.svg`; a.click(); URL.revokeObjectURL(a.href); };

  useEffect(() => {
    const t = window.setTimeout(() => { if (stage.current) setM(measure(stage.current)); }, 120);
    return () => window.clearTimeout(t);
  }, [body, width]);

  const categorical = ['column', 'grouped', 'stacked', 'horizontal'].includes(chart);
  const add = () => setOrder(o => o.length >= 24 ? o : [...o, [...Array(24).keys()].find(i => !o.includes(i))!]);
  const remove = () => setOrder(o => o.length <= 1 ? o : o.slice(0, -1));
  const swap = () => setOrder(o => o.length < 2 ? o : [o[1], o[0], ...o.slice(2)]);
  const legend = chart === 'grouped' || chart === 'stacked' || chart === 'line' ? <Legend items={series.map(s => ({ label: s.label, color: s.color }))} />
    : chart === 'scatter' ? <ShapeLegend groups={['Shift A', 'Shift B', 'Shift C']} /> : INTERACTIVE.some(c => c.value === chart) ? null : CATALOG[chart]?.(dataset ?? undefined).legend;

  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Pick a chart, change the space it gets and the data it holds, and watch the geometry respond. These React charts recompute from data at every width; the Figma components behave the same way through their slots, Fill sizing and constraints, except where a chart is marked as a template — there, data changes need the geometry regenerated.</p>

      <div className="cl-controls" role="group" aria-label="Playground controls">
        <Select variant="filter" label="Chart" className="ds-select--200" value={chart} onChange={setChart} options={CHOICES} />
        <div className="pg-width">
          <label className="ds-text-small" htmlFor="pg-width">Container width <b>{width} px</b></label>
          <input id="pg-width" className="pg-range" type="range" min={280} max={1200} step={10} value={width} onChange={e => setWidth(+e.target.value)} />
        </div>
        <div className="pg-presets" role="group" aria-label="Width presets">
          {PRESETS.map(p => <Button key={p} size="sm" variant={p === width ? 'tonal' : 'ghost'} aria-pressed={p === width} onClick={() => setWidth(p)}>{p}</Button>)}
        </div>
      </div>
      <div className="cl-controls" role="group" aria-label="Data controls">
        {(categorical || chart === 'scatter') && <>
          <span className="ds-text-small" role="status" aria-live="polite">{order.length} {chart === 'scatter' ? `categories → ${Math.max(3, order.length * 2)} points` : 'categories'}</span>
          <Button size="sm" variant="secondary" onClick={add} disabled={order.length >= 24}>Add category</Button>
          <Button size="sm" variant="secondary" onClick={remove} disabled={order.length <= 1}>Remove category</Button>
          {categorical && <Button size="sm" variant="ghost" onClick={swap} disabled={order.length < 2}>Swap first two</Button>}
        </>}
        {(chart === 'grouped' || chart === 'stacked' || chart === 'line') &&
          <Select variant="filter" label="Series" className="ds-select--160" value={nSeries} onChange={setNSeries} searchable={false} options={[{ value: '1', label: '1 series' }, { value: '2', label: '2 series' }, { value: '3', label: '3 series' }]} />}
        {chart === 'line' && <Select variant="filter" label="Points" className="ds-select--160" value={months} onChange={setMonths} searchable={false} options={[{ value: '6', label: '6 months' }, { value: '12', label: '12 months' }, { value: '24', label: '24 months' }]} />}
        {categorical && <Switch label="Long labels" checked={long} onChange={setLong} />}
        {['column', 'grouped', 'stacked'].includes(chart) && <Switch label="Data labels" checked={values} onChange={setValues} />}
      </div>

      {fixture !== undefined && !INTERACTIVE.some(c => c.value === chart) && (
        <details className="pg-dataset">
          <summary className="ds-text-small"><b>Dataset</b> — edit the data, apply, then download the SVG to regenerate the Figma template</summary>
          <label className="ds-sr-only" htmlFor="pg-data">Dataset as JSON</label>
          <textarea id="pg-data" className="pg-data" data-testid="pg-data" spellCheck={false} value={draft} onChange={e => setDraft(e.target.value)} rows={10} />
          {dataError && <p className="ds-text-small pg-data-error" role="alert">{dataError}</p>}
          <div className="cl-controls">
            <Button size="sm" variant="secondary" onClick={applyData} data-testid="pg-apply">Apply data</Button>
            <Button size="sm" variant="ghost" onClick={resetData} disabled={dataset === null}>Reset to fixture</Button>
            <Button size="sm" variant="ghost" onClick={download}>Download SVG for Figma</Button>
            <span className="ds-text-small" role="status">{dataset === null ? 'Showing the fixture' : 'Showing your data'}</span>
          </div>
        </details>
      )}

      <div className="pg-stage-wrap">
        <div ref={stage} className="pg-stage" style={{ width }} data-testid="pg-stage">
          <DashCard title={entry.name} subtitle={`${width} px container`} right={legend}>{body}</DashCard>
        </div>
      </div>

      <div className="pg-readout">
        <div>
          <p className="ds-text-card-title">Measured from the rendered chart</p>
          <ul className="pg-list" data-testid="pg-measures">{m.text.map(t => <li key={t} className="ds-text-small">{t}</li>)}</ul>
        </div>
        <div>
          <p className="ds-text-card-title">Figma</p>
          <p className="ds-text-small"><Badge tone={CLASS_TONE[cov.cls]} size="sm">{RESP_LABEL[cov.cls]}</Badge></p>
          <p className="ds-text-small"><b>Asset:</b> <a className="ds-link" href={figmaUrl(cov.node)} target="_blank" rel="noreferrer">{entry.figmaName}</a></p>
          <HowToCustomize id={chart} />
        </div>
      </div>

      <DocSection id="regeneration" title="Regenerating a Figma template from new data" description="41 charts draw shapes computed from data, so new data means a new drawing. The import script regenerates 37 of them in place (the 33 vector templates plus combination, step, control and Sankey). Line and area cards are not automated yet (see their notes), and the stacked-bar trend line and the Pareto cumulative line are redrawn by hand. This workflow was run end-to-end on the treemap (a sixth category added), streamgraph (values changed), alluvial (a fifth cohort) and sunburst (a new team) — the Figma cards kept their identity and everything below was verified; the four cards were then regenerated again from their default data, together with icicle, circle packing, tile cartogram and hexbin, to apply the Medium-weight fix.">
        <ol className="pg-steps">
          <li className="ds-text-small"><b>Change the data.</b> Pick the chart above, open <i>Dataset</i>, edit the JSON (add or remove items, change values) and press <i>Apply data</i>. The chart re-renders exactly as the template will.</li>
          <li className="ds-text-small"><b>Export.</b> Press <i>Download SVG for Figma</i> at 640 px (and at 320 px for charts with a compact layout). The SVG carries the resolved colours, type and text anchors.</li>
          <li className="ds-text-small"><b>Import in place.</b> The template import script — <code>tools/figma-template-import</code> in this repository (export → build → paste into a Figma plugin-API run; see its README) — replaces only the drawing inside the existing card: the card instance, its title, subtitle and legend stay untouched. It needs a maintainer with edit access to the library file and a Figma plugin-API runner; designers can prepare and download the data but cannot run it from Figma alone.</li>
          <li className="ds-text-small"><b>What the script restores:</b> colour variables on every fill and stroke, library text styles on every label (each label’s font weight is read from the SVG, so Medium labels get the Medium chart styles instead of falling back to Regular), label and point anchors (so text never stretches), Chart width bindings for wide / compact and month layers, and the tile-label thresholds for treemap / icicle.</li>
          <li className="ds-text-small"><b>Verified on all four samples:</b> card id, component, title, subtitle and legend identical before and after; every label editable; 0 unstyled texts; 0 unbound paints; 0 broken anchors; strict audit passed at 1200 → 320 px.</li>
        </ol>
        <InlineAlert tone="warning" title="Exporting an SVG directly into Figma does not preserve the design system">Dragging or pasting the downloaded SVG straight onto the canvas loses the variable bindings, the text styles and the resize / Chart width behaviour. Always regenerate through the import script; use a direct drop only as a starting point for the manual cleanup below.</InlineAlert>
        <p className="ds-text-small"><b>Without the script</b> (dragging the SVG straight onto the canvas) the drawing arrives as raw vectors — in a measured drop 9 of 9 paints were unbound hex values, 5 of 5 texts had no text style (and medium weights fell back to Regular), shapes sat in 5 nested groups and every layer had Scale constraints, so labels squash when the card resizes. Cleanup by hand: ungroup; bind each colour to its chart variable (select matching layers → Fill → variable); apply the chart text styles; wrap labels and points in 0-width anchor frames or set their constraints to Left/Right; rename breakpoint layers “(hide below N)” / “(show below N)” and bind their visibility to the Chart width variables. Text edits made inside the old drawing do not carry over — re-apply them after regenerating.</p>
      </DocSection>

      <DocSection id="coverage" title="Capability matrix — all 64 charts" description="What each Figma asset can actually do. Measured on the real Figma assets at 1200 · 800 · 640 · 560 · 480 · 400 · 360 · 320 px, each width checked as placed and with the matching Chart width mode: nothing spills past the card content box, no labels collide or truncate, no layer is empty, every paint is bound to a colour variable and every text uses a text style. “Partly” always has a note; open a chart above for its full “How to customize”.">
        <ul className="pg-totals" data-testid="pg-totals">
          <li className="ds-text-small"><b>{totals.charts}</b> charts · <b>{totals.autoResize.yes}</b> resize automatically, <b>{totals.autoResize.partial}</b> keep a fixed-size drawing</li>
          <li className="ds-text-small"><b>{totals.noModeNeeded}</b> need no width-mode switch · <b>{totals.modeNeeded}</b> need the Chart width mode below a stated width</li>
          <li className="ds-text-small">Add / remove categories in Figma: <b>{totals.categories.yes}</b> yes · <b>{totals.categories.partial}</b> partly · <b>{totals.categories.no}</b> no</li>
          <li className="ds-text-small">Edit values → geometry in Figma: <b>{totals.values.yes}</b> yes · <b>{totals.values.partial}</b> partly · <b>{totals.values.no}</b> no</li>
          <li className="ds-text-small">Regenerate from the Showcase on new data: <b>{totals.regen.yes}</b> yes · <b>{totals.regen.partial}</b> partly · <b>{totals.regen.no}</b> no</li>
        </ul>
        <div className="ds-table-region" role="region" aria-label="Chart capability matrix" tabIndex={0}>
          <table className="ds-table pg-matrix">
            <caption className="ds-sr-only">Figma capabilities for every chart</caption>
            <thead><tr>{['#', 'Chart', 'Figma asset', 'Class', 'Resizes automatically', 'Manual width-mode switch', 'Add / remove categories in Figma', 'Edit values → geometry in Figma', 'Regenerate from Showcase on new data', 'Editable text & colours', 'Compact + desktop verified', 'Showcase'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>
              {CHARTS.map(c => { const v = COVERAGE[c.id];
                const cap = (x: Cap, note?: string, invert = false) => <><Badge tone={x === 'partial' ? 'warning' : (x === 'yes') !== invert ? 'success' : 'neutral'} size="sm">{CAP_LABEL[x]}</Badge>{note && x !== 'yes' && !invert ? <span className="ds-text-small pg-note">{note}</span> : null}</>;
                return <tr key={c.id}>
                  <td className="ds-num">{c.n}</td><th scope="row">{c.name}</th>
                  <td><a className="ds-link" href={figmaUrl(v.node)} target="_blank" rel="noreferrer">{c.figmaName}</a></td>
                  <td><Badge tone={CLASS_TONE[v.cls]} size="sm">{RESP_LABEL[v.cls]}</Badge></td>
                  <td>{cap(v.autoResize, v.notes.resize)}</td>
                  <td>{v.modeBelow === null ? <Badge tone="success" size="sm">Not needed</Badge> : <><Badge tone="warning" size="sm">Below {v.modeBelow} px</Badge><span className="ds-text-small pg-note">{modeSteps(v.modeBelow).map(([w, m]) => `${w.replace(' card', '')} → “${m}”`).join(' · ')}</span></>}</td>
                  <td>{cap(v.categories, v.notes.categories)}</td>
                  <td>{cap(v.values, v.notes.values)}</td>
                  <td>{cap(v.regen, undefined, true)}{v.regen === 'partial' && v.notes.regen ? <span className="ds-text-small pg-note">{v.notes.regen}</span> : null}</td>
                  <td>{cap(v.textColor)}</td>
                  <td>{cap(v.layouts)}</td>
                  <td>{c.status === 'live' ? <a className="ds-link" href={href('/charts/library')}>Chart Library</a> : <a className="ds-link" href={href(c.route!)}>Own page</a>} · <a className="ds-link" href={href('/charts/playground') + '?chart=' + c.id}>Playground</a></td>
                </tr>; })}
            </tbody>
          </table>
        </div>
      </DocSection>
    </div>
  );
}

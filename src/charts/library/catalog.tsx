// One renderer per chart id with its Pulse fixture data. Shared by the Chart Library gallery and the Responsiveness Playground,
// so every chart is exercised through the same code path the gallery shows.
import type { ReactNode } from 'react';
import { BarChart, BubbleMatrix, Donut, GroupedBarChart, HBarChart, Heatmap, LineChart } from '../Charts';
import { Legend } from '../core';
import { CATEGORICAL } from './scales';
import * as D from './data';
import { Choropleth, ControlChart, ForecastChart, Histogram, ParetoChart, Pie, RangePlot, SankeyChart, ScatterPlot, ShapeLegend, StepChart } from './LibraryCharts';
import * as M from './MoreCharts';

export interface Rendered { body: ReactNode; legend?: ReactNode }
/** A renderer; charts whose Figma asset is regenerated from data also carry their editable fixture (Playground → Dataset). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Entry = ((data?: any) => Rendered) & { fixture?: unknown };
const ds = <T,>(fixture: T, render: (d: T) => Rendered): Entry => Object.assign((d?: T) => render(d ?? fixture), { fixture });
const cumulative = (rows: { name: string; count: number }[]) => { const t = rows.reduce((a, r) => a + r.count, 0); let run = 0; return rows.map(r => ({ ...r, cumulative: (run += r.count) / t * 100 })); };
const leg = (items: [string, string][], kind?: 'swatch' | 'line') => <Legend kind={kind} items={items.map(([label, color]) => ({ label, color }))} />;
const C = CATEGORICAL;

export const CATALOG: Record<string, Entry> = {
  column: () => ({ body: <BarChart label="Staff by department" stacked={false} series={[{ key: 'v', label: 'People', color: C[0] }]} data={D.departments.map(d => ({ x: d.name, values: { v: d.actual } }))} />, legend: leg([['Actual people', C[0]]]) }),
  horizontal: () => ({ body: <HBarChart label="Headcount by department" data={D.departments.map(d => ({ label: d.name, value: d.actual }))} /> }),
  stacked: () => ({ body: <BarChart label="Headcount composition by department" series={[{ key: 'a', label: 'Actual', color: C[0] }, { key: 'g', label: 'Gap to plan', color: C[1] }]} data={D.departments.map(d => ({ x: d.name, values: { a: d.actual, g: d.plan - d.actual } }))} />, legend: leg([['Actual', C[0]], ['Gap to plan', C[1]]]) }),
  grouped: () => ({ body: <GroupedBarChart label="Actual vs plan by department" series={[{ key: 'a', label: 'Actual', color: C[0] }, { key: 'p', label: 'Plan', color: C[1] }]} data={D.departments.map(d => ({ x: d.name, values: { a: d.actual, p: d.plan } }))} />, legend: leg([['Actual', C[0]], ['Plan', C[1]]]) }),
  line: ds({ months: D.MONTHS, output: D.monthly.map(m => m.output) }, d => ({ body: <LineChart label="Monthly output" x={d.months} series={[{ key: 'o', label: 'Output', color: C[0], values: d.output }]} />, legend: leg([['Output', C[0]]]) })),
  area: ds({ months: D.MONTHS, output: D.monthly.map(m => m.output) }, d => ({ body: <LineChart area label="Monthly output volume" x={d.months} series={[{ key: 'o', label: 'Output', color: C[0], values: d.output }]} />, legend: leg([['Output', C[0]]]) })),
  combination: ds(D.monthly, d => ({ body: <ForecastChart label="Output vs forecast with prediction band" data={d} showBand showForecast />, legend: leg([['Actual', C[0]], ['Forecast', C[1]]]) })),
  pie: ds(D.costs, d => ({ body: <Pie label="Operating cost shares" data={d.map((c, i) => ({ label: c.name, value: c.value, color: C[i % 8] }))} /> })),
  donut: ds(D.costs, d => ({ body: <Donut label="Operating cost shares" data={d.map((c, i) => ({ label: c.name, value: c.value, color: C[i % 8] }))} center={{ value: `₹${d.reduce((a, c) => a + c.value, 0).toLocaleString('en-IN')}L`, caption: 'Total cost' }} /> })),
  nested: ds(D.hierarchyData, d => ({ body: <M.NestedDonut label="Departments (inner) and teams (outer)" data={d} />, legend: leg((d.children ?? []).map((c, i) => [c.name, C[i % 8]] as [string, string])) })),
  radar: ds(D.capabilities, d => ({ body: <M.Radar label="Capability scores vs benchmark" data={d} />, legend: leg([['Actual', C[0]], ['Benchmark', C[1]]]) })),
  scatter: () => ({ body: <ScatterPlot label="Skill coverage vs output attainment" points={D.scatter} groups={['Shift A', 'Shift B', 'Shift C']} tx={75} ty={75} />, legend: <ShapeLegend groups={['Shift A', 'Shift B', 'Shift C']} /> }),
  quadrant: ds(D.projects, d => ({ body: <M.Quadrant label="Initiatives by effort and impact" data={d} /> })),
  heatmap: () => ({ body: <Heatmap label="First-pass quality by team and day" rowLabel="Team" rows={D.heatTeams} cols={D.DAYS} values={D.heatValues} format={v => `${v}%`} reversed /> }),
  choropleth: () => ({ body: <Choropleth label="Synthetic headcount by state" values={D.offices} /> }),
  network: ds({ names: D.teams, matrix: D.collaborations }, d => ({ body: <M.RadialNetwork label="Collaboration hours between teams" names={d.names} matrix={d.matrix} /> })),
  treemap: ds(D.costs, d => ({ body: <M.Treemap label="Operating cost treemap" data={d} /> })),
  waterfall: () => ({ body: <M.Waterfall label="Quarterly revenue bridge" data={D.waterfall} />, legend: leg([['Total', C[0]], ['Increase', 'var(--ds-chart-positive)'], ['Decrease', 'var(--ds-chart-negative)']]) }),
  funnel: () => ({ body: <M.Funnel label="Recruitment funnel" data={D.funnel} /> }),
  bullet: () => ({ body: <M.Bullet label="Performance against target by department" data={D.bullets} /> }),
  dumbbell: () => ({ body: <RangePlot label="Department ratings, previous vs current" style="dumbbell" max={5} rows={D.ratings} />, legend: leg([['Previous', C[0]], ['Current', C[3]]]) }),
  lollipop: () => ({ body: <RangePlot label="Current department ratings" style="lollipop" max={5} rows={D.ratings.map(r => ({ name: r.name, current: r.current }))} /> }),
  slope: ds(D.slope, d => ({ body: <M.Slopegraph label="Certification rate, 2023 vs 2024" data={d} /> })),
  bump: ds({ periods: ['Q1', 'Q2', 'Q3', 'Q4'], data: D.ranks }, d => ({ body: <M.Bump label="Regional rank by quarter" data={d.data} periods={d.periods} /> })),
  pareto: ds(D.pareto.map(({ name, count }) => ({ name, count })), d => ({ body: <ParetoChart label="Defects by cause with cumulative share" data={cumulative(d)} />, legend: leg([['Defects', C[0]], ['Cumulative %', C[3]]]) })),
  tornado: () => ({ body: <M.Diverging kind="tornado" label="Revenue sensitivity, low vs high scenario" left="Low" right="High" data={D.sensitivities.map(s => ({ name: s.name, l: s.low, r: s.high }))} />, legend: leg([['Low scenario', 'var(--ds-chart-negative)'], ['High scenario', 'var(--ds-chart-positive)']]) }),
  population: () => ({ body: <M.Diverging kind="pyramid" label="Workforce age by gender" left="Women" right="Men" data={D.population.map(p => ({ name: p.name, l: p.women, r: p.men }))} />, legend: leg([['Women', C[1]], ['Men', C[0]]]) }),
  marimekko: ds({ series: ['Skilled', 'Trainee', 'Contract'], data: D.segments }, d => ({ body: <M.Marimekko label="Plant size and workforce mix" data={d.data} series={d.series} />, legend: leg(d.series.map((x, i) => [x, C[i % 8]] as [string, string])) })),
  gauge: ds(D.gauge, d => ({ body: <M.Gauge label="Training completion against target" actual={d.actual} target={d.target} /> })),
  histogram: () => ({ body: <Histogram label="Inspection duration histogram" unit="min" bins={D.histogram(D.inspectionTimes, 8, 48, 4)} /> }),
  box: () => ({ body: <M.BoxPlot label="Machine cycle times" data={D.boxes} /> }),
  violin: ds(D.densities, d => ({ body: <M.Violin label="Machine cycle-time distributions" data={d} /> })),
  beeswarm: ds(D.machines, d => ({ body: <M.Beeswarm label="Individual cycle times by machine" data={d} /> })),
  ridgeline: ds(D.densities, d => ({ body: <M.Ridgeline label="Cycle-time densities by machine" data={d} /> })),
  hexbin: ds(D.scatter, d => ({ body: <M.Hexbin label="Skill vs output, hexagonal bins" data={d} /> })),
  density: ds(D.inspectionDensity, d => ({ body: <M.DensityPlot label="Inspection duration density" data={d} /> })),
  dot: () => ({ body: <RangePlot label="Headcount by department" style="dot" max={200} format={v => `${Math.round(v)}`} rows={D.departments.map(d => ({ name: d.name, current: d.actual }))} /> }),
  qq: ds(D.qq, d => ({ body: <M.QQPlot label="Inspection times vs a normal distribution" data={d} /> })),
  error: () => ({ body: <M.ErrorBars label="Average cycle time with 95% intervals" data={D.estimates} /> }),
  candlestick: () => ({ body: <M.PriceChart kind="candle" label="Daily price candles" data={D.ohlc} />, legend: leg([['Rising', 'var(--ds-chart-positive)'], ['Falling', 'var(--ds-chart-negative)']]) }),
  stream: ds({ keys: ['process', 'packing', 'logistics'], data: D.streams }, d => ({ body: <M.Streamgraph label="Overtime hours by team" data={d.data} keys={d.keys} />, legend: leg(d.keys.map((k, i) => [k, C[i % 8]] as [string, string])) })),
  gantt: () => ({ body: <M.Gantt label="Project schedule" data={D.schedule} /> }),
  control: ds({ limits: D.controlLimits, data: D.control }, d => ({ body: <ControlChart label="Fill weight control chart" data={d.data} limits={d.limits} showLimits /> })),
  ohlc: () => ({ body: <M.PriceChart kind="ohlc" label="Daily OHLC" data={D.ohlc} />, legend: leg([['Rising', 'var(--ds-chart-positive)'], ['Falling', 'var(--ds-chart-negative)']]) }),
  step: ds(D.inventory, d => ({ body: <StepChart label="Month-end pallet inventory" data={d} /> })),
  horizon: ds(D.horizonValues, d => ({ body: <M.Horizon label="Demand deviation from plan" data={d} />, legend: leg([['Above plan', 'var(--ds-chart-positive)'], ['Below plan', 'var(--ds-chart-negative)']]) })),
  timeline: ds(D.events, d => ({ body: <M.EventTimeline label="September programme milestones" data={d} /> })),
  sankey: ds(D.flow, d => ({ body: <SankeyChart label="Headcount flow from teams to departments to shifts" unit="people" nodes={d.nodes} links={d.links} /> })),
  chord: ds({ names: D.teams, matrix: D.collaborations }, d => ({ body: <M.Chord label="Collaboration between teams" names={d.names} matrix={d.matrix} /> })),
  sunburst: ds(D.hierarchyData, d => ({ body: <M.Sunburst label="Factory, departments and teams" data={d} /> })),
  packing: ds(D.hierarchyData, d => ({ body: <M.CirclePacking label="Team sizes within departments" data={d} /> })),
  parallel: ds(D.parallel, d => ({ body: <M.ParallelCoordinates label="Production lines across four metrics" data={d} axes={[{ key: 'quality', label: 'Quality' }, { key: 'speed', label: 'Speed' }, { key: 'cost', label: 'Cost' }, { key: 'skill', label: 'Skill' }]} /> })),
  dendrogram: ds(D.hierarchyData, d => ({ body: <M.Dendrogram label="Organisation structure" data={d} /> })),
  alluvial: ds({ stages: ['Month 0', 'Month 6', 'Month 12'], data: D.cohorts }, d => ({ body: <M.Alluvial label="Training cohorts across skill checkpoints" data={d.data} stages={d.stages} /> })),
  icicle: ds(D.hierarchyData, d => ({ body: <M.Icicle label="Factory hierarchy by people" data={d} /> })),
  arc: ds({ names: D.teams, links: D.arcLinks }, d => ({ body: <M.ArcDiagram label="Team relationships" names={d.names} links={d.links} /> })),
  ternary: ds({ axes: ['Resin', 'Filler', 'Additive'] as [string, string, string], data: D.ternary }, d => ({ body: <M.Ternary label="Formulation blends" data={d.data} axes={d.axes} /> })),
  flowmap: ds(D.transfers, d => ({ body: <M.FlowMap label="Transfers between regional offices (internal reference geometry)" data={d} /> })),
  cartogram: ds(D.officeTiles, d => ({ body: <M.Cartogram label="Headcount by office (tile cartogram)" data={d} /> })),
  waffle: ds(D.waffleData, d => ({ body: <M.Waffle label="Training progress, 100 people" data={d} />, legend: leg(d.map((w, i) => [w.name, C[i % 8]] as [string, string])) })),
  rose: ds(D.rose, d => ({ body: <M.PolarRose label="Wind observations by direction" data={d} /> })),
  contour: ds(D.field, d => ({ body: <M.Contour label="Factory temperature isotherms" field={d} /> })),
  'quadrant-bubble': ds({ categories: D.employeeCategories, thresholds: D.riskThresholds, data: D.performanceRisk }, d => ({ body: <M.QuadrantBubble label="Team performance vs attrition risk; bubble area = team size" data={d.data} thresholds={d.thresholds} categories={d.categories} />, legend: leg(d.categories.map((c, i) => [c, C[i % 8]] as [string, string])) })),
  bubble: () => ({ body: <BubbleMatrix label="Volume and rate by team and day" rows={D.heatTeams.map(t => ({ label: t, sub: 'Team' }))} cols={D.DAYS.slice(0, 5)} volume={D.heatValues.map(r => r.slice(0, 5).map(v => v * 3))} rate={D.heatValues.map(r => r.slice(0, 5))} rateLabel="Pass rate" volumeLabel="Units" /> }),
};

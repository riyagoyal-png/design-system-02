// The 64-entry chart inventory (63 Pulse types + the DEOC Bubble matrix) (Pulse chartRegistry.js order and names), with Figma and showcase coverage.
// One row per source chart; nothing here renders, so the gallery, QA and parity docs share one source.

export const CATEGORIES = ['Comparison & Performance', 'Statistical & Distribution', 'Time Series & Forecasting', 'Relationships & Hierarchies', 'Geographic & Specialized', 'Advanced Combinations'] as const;
export type Category = typeof CATEGORIES[number];
/** existing = already in the library before this work · extension = variant of an existing family · native = new native component · template = editable vector template */
export type FigmaKind = 'existing' | 'extension' | 'native' | 'template';
export interface ChartEntry {
  n: number; id: string; name: string; category: Category; description: string;
  figma: FigmaKind; figmaName: string;
  /** live = rendered in the Chart Library page · page = rendered on an existing showcase page */
  status: 'live' | 'page'; route?: string; batch: number;
}
const C = CATEGORIES;
const row = (n: number, id: string, name: string, cat: number, description: string, figma: FigmaKind, figmaName: string, status: ChartEntry['status'], batch: number, route?: string): ChartEntry =>
  ({ n, id, name, category: C[cat], description, figma, figmaName, status, batch, route });

export const CHARTS: ChartEntry[] = [
  row(1, 'column', 'Vertical Bar / Column Chart', 0, 'Compare staffing across departments.', 'existing', 'Chart / Bar chart · single (Bands slot)', 'live', 1),
  row(2, 'horizontal', 'Horizontal Bar Chart', 0, 'Rank department headcounts along a common scale.', 'existing', 'Chart / H-bar chart', 'page', 0, '/charts/horizontal-bar'),
  row(3, 'stacked', 'Stacked Bar Chart', 0, 'See workforce composition within each department.', 'existing', 'Chart / Bar chart · stacked', 'page', 0, '/charts/stacked-bar'),
  row(4, 'grouped', 'Grouped Bar Chart', 0, 'Compare actual staffing with planned capacity.', 'existing', 'Chart / Bar chart · grouped', 'page', 0, '/charts/grouped-bar'),
  row(5, 'line', 'Line Chart', 2, 'Track monthly production output over time.', 'existing', 'Chart / Line chart · line', 'page', 0, '/charts/line'),
  row(6, 'area', 'Area Chart', 2, 'Show the volume of monthly production.', 'existing', 'Chart / Line chart · area', 'page', 0, '/charts/area'),
  row(7, 'combination', 'Combination Chart (Line + Area Band)', 2, 'Compare output with a forecast and uncertainty band.', 'extension', 'Template · Line + forecast band', 'live', 1),
  row(8, 'pie', 'Pie Chart', 0, 'Show each category’s share of operating costs (documented alternative — prefer Donut, §7.6).', 'extension', 'Chart / Pie (alternative)', 'live', 1),
  row(9, 'donut', 'Donut Chart', 0, 'Compare cost shares around a total.', 'existing', 'Chart / Donut chart', 'page', 0, '/charts/donut'),
  row(10, 'nested', 'Multi-ring / Nested Donut Chart', 3, 'Connect department totals to their constituent teams.', 'template', 'Template · Nested donut', 'live', 5),
  row(11, 'radar', 'Radar / Spider Chart', 0, 'Compare six capability scores with a benchmark.', 'template', 'Template · Radar', 'live', 2),
  row(12, 'scatter', 'Scatter Plot / Quadrant Matrix', 3, 'Explore skill coverage and output attainment by line.', 'native', 'Chart / Scatter plot (freeform slot)', 'live', 1),
  row(13, 'quadrant', 'Four-Quadrant Chart', 0, 'Prioritize initiatives by impact and effort.', 'template', 'Template · Four-quadrant', 'live', 2),
  row(14, 'heatmap', 'Heatmap-style Tile Grid', 1, 'Compare first-pass quality across days and teams.', 'existing', 'Chart / Heatmap (Grid slot)', 'live', 1),
  row(15, 'choropleth', 'Choropleth Map', 4, 'Compare synthetic headcount by Indian state.', 'native', '_Map / India states (restricted · not published)', 'live', 1),
  row(16, 'network', 'Radial Network / Bubble Diagram', 3, 'See the strength of cross-team collaboration.', 'template', 'Template · Radial network', 'live', 5),
  row(17, 'treemap', 'Treemap', 3, 'Compare operating costs using proportional rectangles.', 'template', 'Template · Treemap', 'live', 5),
  row(18, 'waterfall', 'Waterfall Chart', 0, 'Explain the contributions to quarterly revenue.', 'native', 'Chart / Bar · floating (Bands slot)', 'live', 2),
  row(19, 'funnel', 'Funnel Chart', 0, 'Follow candidates through the recruitment pipeline.', 'native', 'Chart / H-bar row · centered', 'live', 2),
  row(20, 'bullet', 'Bullet Chart', 0, 'Measure performance against department targets.', 'native', 'Chart / H-bar row · bullet (Row plot)', 'live', 2),
  row(21, 'dumbbell', 'Dumbbell Chart', 0, 'Compare previous and current department ratings.', 'native', 'Chart / Range row · dumbbell', 'live', 1),
  row(22, 'lollipop', 'Lollipop Chart', 0, 'Compare current ratings with a compact mark.', 'native', 'Chart / Range row · lollipop', 'live', 1),
  row(23, 'slope', 'Slopegraph', 0, 'Show certification changes between two years.', 'template', 'Template · Slopegraph', 'live', 2),
  row(24, 'bump', 'Bump Chart', 0, 'Track changing regional ranks across quarters.', 'template', 'Template · Bump', 'live', 2),
  row(25, 'pareto', 'Pareto Chart', 0, 'Identify the defects responsible for most losses.', 'extension', 'Template · Pareto (Bar chart + cumulative line)', 'live', 1),
  row(26, 'tornado', 'Tornado Chart', 0, 'Compare low and high revenue sensitivity scenarios.', 'native', 'Chart / H-bar row · diverging', 'live', 2),
  row(27, 'population', 'Population Pyramid', 0, 'Compare workforce age distributions by gender.', 'native', 'Chart / H-bar row · diverging (pyramid)', 'live', 2),
  row(28, 'marimekko', 'Marimekko Chart', 0, 'Show plant size and workforce mix simultaneously.', 'template', 'Template · Marimekko', 'live', 2),
  row(29, 'gauge', 'Gauge Chart', 0, 'Read training completion against a target.', 'template', 'Template · Gauge', 'live', 2),
  row(30, 'histogram', 'Histogram', 1, 'See the frequency distribution of inspection times.', 'existing', 'Chart / Bar chart · single (histogram)', 'live', 1),
  row(31, 'box', 'Box-and-Whisker Plot', 1, 'Compare medians, variation and machine-time outliers.', 'native', 'Chart / Bar · box (Bands slot)', 'live', 3),
  row(32, 'violin', 'Violin Plot', 1, 'Compare the full shape of machine cycle-time distributions.', 'template', 'Template · Violin', 'live', 3),
  row(33, 'beeswarm', 'Beeswarm Plot', 1, 'Show individual cycle times without overlapping marks.', 'template', 'Template · Beeswarm', 'live', 3),
  row(34, 'ridgeline', 'Ridgeline Plot', 1, 'Compare overlapping machine-time density curves.', 'template', 'Template · Ridgeline', 'live', 3),
  row(35, 'hexbin', 'Hexbin Plot', 1, 'Aggregate production lines into two-dimensional bins.', 'template', 'Template · Hexbin', 'live', 3),
  row(36, 'density', 'Density Plot', 1, 'Estimate the smooth distribution of inspection duration.', 'template', 'Template · Density', 'live', 3),
  row(37, 'dot', 'Dot Plot', 0, 'Compare department headcounts with position alone.', 'native', 'Chart / Range row · dot', 'live', 1),
  row(38, 'qq', 'Q–Q Plot', 1, 'Compare inspection times with a normal distribution.', 'template', 'Template · Q–Q', 'live', 3),
  row(39, 'error', 'Error Bar Chart', 1, 'Compare average cycle times and confidence intervals.', 'native', 'Chart / Bar · interval (Bands slot)', 'live', 3),
  row(40, 'candlestick', 'Candlestick Chart', 2, 'Read daily open, high, low and close prices.', 'native', 'Chart / Bar · candle (Bands slot)', 'live', 4),
  row(41, 'stream', 'Streamgraph', 2, 'Compare changing overtime volumes across teams.', 'template', 'Template · Streamgraph', 'live', 4),
  row(42, 'gantt', 'Gantt Chart', 2, 'Review project timing, overlap and completion.', 'native', 'Chart / H-bar row · span (Row plot)', 'live', 4),
  row(43, 'control', 'Control Chart', 2, 'Distinguish process variation from control-limit breaches.', 'extension', 'Template · Control chart', 'live', 1),
  row(44, 'ohlc', 'OHLC Chart', 2, 'Read high-low ranges with open and close ticks.', 'native', 'Chart / Bar · ohlc (Bands slot)', 'live', 4),
  row(45, 'step', 'Step Chart', 2, 'Follow discrete changes in pallet inventory.', 'extension', 'Template · Step chart', 'live', 1),
  row(46, 'horizon', 'Horizon Chart', 2, 'Fold demand deviations into compact magnitude bands.', 'template', 'Template · Horizon', 'live', 4),
  row(47, 'timeline', 'Event Timeline', 2, 'Place production milestones on a dated sequence.', 'template', 'Template · Event timeline', 'live', 4),
  row(48, 'sankey', 'Sankey Diagram', 3, 'Follow headcount flows from teams to shifts.', 'template', 'Template · Sankey (+ Chart / Flow node)', 'live', 1),
  row(49, 'chord', 'Chord Diagram', 3, 'Compare weighted relationships between teams.', 'template', 'Template · Chord', 'live', 5),
  row(50, 'sunburst', 'Sunburst Chart', 3, 'Explore factory, department and team proportions.', 'template', 'Template · Sunburst', 'live', 5),
  row(51, 'packing', 'Circle Packing Chart', 3, 'See nested team sizes within departments.', 'template', 'Template · Circle packing', 'live', 5),
  row(52, 'parallel', 'Parallel Coordinates Plot', 3, 'Compare production lines across four metrics.', 'template', 'Template · Parallel coordinates', 'live', 5),
  row(53, 'dendrogram', 'Dendrogram', 3, 'Follow the factory’s organizational branching structure.', 'template', 'Template · Dendrogram', 'live', 5),
  row(54, 'alluvial', 'Alluvial Diagram', 3, 'Track training cohorts across skill-state checkpoints.', 'template', 'Template · Alluvial', 'live', 5),
  row(55, 'icicle', 'Icicle Chart', 3, 'Read hierarchy depth and proportional team sizes.', 'template', 'Template · Icicle (clipping tiles)', 'live', 5),
  row(56, 'arc', 'Arc Diagram', 3, 'Compare team relationships along a shared baseline.', 'template', 'Template · Arc diagram', 'live', 5),
  row(57, 'ternary', 'Ternary Plot', 4, 'Compare formulations containing three ingredients.', 'template', 'Template · Ternary', 'live', 6),
  row(58, 'flowmap', 'Flow Map', 4, 'Follow transfers between regional offices.', 'template', 'Template · Flow map', 'live', 6),
  row(59, 'cartogram', 'Cartogram', 4, 'Resize regional areas to represent headcounts.', 'template', 'Template · Tile cartogram', 'live', 6),
  row(60, 'waffle', 'Waffle Chart', 4, 'Read training progress as 100 individual units.', 'template', 'Template · Waffle', 'live', 6),
  row(61, 'rose', 'Polar Area / Rose Chart', 4, 'Compare directional wind frequencies by sector area.', 'template', 'Template · Polar rose', 'live', 6),
  row(62, 'contour', 'Contour Plot', 4, 'Locate factory hotspots with temperature isotherms.', 'template', 'Template · Contour', 'live', 6),
  row(63, 'quadrant-bubble', 'Quadrant + Bubble Chart', 5, 'Prioritize team retention using performance, risk and team size.', 'template', 'Template · Quadrant + bubble', 'live', 7),
  row(64, 'bubble', 'Bubble Matrix', 0, 'Compare volume (size) and rate (colour) across two categories (DEOC §7.8; not in the Pulse list).', 'existing', 'Chart / Bubble matrix (Grid slot)', 'page', 0, '/charts/bubble'),
];

/** Which family to reach for, by data structure. */
export const CHOOSING: [string, string][] = [
  ['One measure across categories', 'Column / horizontal bar; dot or lollipop when bars feel heavy'],
  ['Before vs after per category', 'Dumbbell; slopegraph for two time points'],
  ['Parts of a whole (≤ 6 parts)', 'Donut (default); pie only where a product requires it'],
  ['Change over time', 'Line or area; step for discrete changes; forecast band for uncertainty'],
  ['Process stability', 'Control chart with centre line and 3σ limits'],
  ['Few causes dominate', 'Pareto (sorted bars + cumulative %)'],
  ['Distribution of one measure', 'Histogram; density, box or violin to compare groups'],
  ['Two measures per item', 'Scatter (with reference lines for quadrants)'],
  ['Two categories × one rate', 'Heatmap grid'],
  ['Flows between stages', 'Sankey (conserved flow); alluvial for cohorts over time'],
  ['Values by region', 'Choropleth (sequential scale); cartogram when area should encode the value'],
];

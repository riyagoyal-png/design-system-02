// Capability matrix for all 64 chart assets (63 Pulse types + DEOC Bubble matrix) — what each Figma asset can actually do.
// Measured on real Figma instances (page 07, DEOC file 017yqxpMET1CNJeEhFL4bp) at 1200 · 800 · 640 · 560 · 480 · 400 · 360 · 320 px,
// each width checked twice: as placed (default "≥ 640 px" mode) and with the matching Chart width mode — spill past the card
// content box, label collisions, truncated text, empty layers, unbound paints, unstyled text, distorted marks.

/** Responsiveness class, as agreed for the chart library. */
export type RespClass = 'native' | 'composition' | 'template' | 'fixed';
export const RESP_LABEL: Record<RespClass, string> = {
  native: 'Native component',
  composition: 'Editable composition',
  template: 'Template (regenerated from data)',
  fixed: 'Fixed-reference visualization',
};

/** yes = works directly in Figma · partial = works with a manual step (see the note) · no = not possible in Figma. */
export type Cap = 'yes' | 'partial' | 'no';
export const CAP_LABEL: Record<Cap, string> = { yes: 'Yes', partial: 'Partly', no: 'No' };

export interface Coverage {
  cls: RespClass;
  /** Figma node (card, component or example) on page 07. */
  node: string;
  /** Resizes automatically within the supported range (320–1200 px cards). */
  autoResize: Cap;
  /** Narrowest card width that works without touching anything; below it, set the card's Chart width mode. null = never needed. */
  modeBelow: number | null;
  /** Add / remove data categories directly in Figma. */
  categories: Cap;
  /** Type numeric values and have the geometry follow, directly in Figma. */
  values: Cap;
  /** New data needs the drawing regenerated from the Showcase (partial = only part of the chart). */
  regen: Cap;
  /** Labels, titles and colours editable in place (text styles + colour variables). */
  textColor: Cap;
  /** Compact (320 px) and desktop (1200 px) layouts verified on the Figma asset. */
  layouts: Cap;
  /** Short notes behind every "Partly" / "No". */
  notes: { categories: string; values: string; resize?: string; regen?: string };
  howTo: HowTo;
}
export interface HowTo { resize: string; labels: string; categories: string; values: string; data: string; compact: string }

export const FIGMA_FILE = 'https://www.figma.com/design/017yqxpMET1CNJeEhFL4bp/DEOC';
export const figmaUrl = (node: string) => `${FIGMA_FILE}?node-id=${node.replace(':', '-')}`;

/* ── Building blocks for the designer instructions ─────────────────────────────────────────── */
const RESIZE_FILL = 'Drag the card to any width from 320 to 1200 px; bars, rows and gridlines re-flow on their own.';
const RESIZE_STRETCH = 'Drag the card to any width from 320 to 1200 px; the drawing stretches horizontally while labels and points keep their size.';
const RESIZE_SQUARE = 'Drag the card to any width; the drawing stays square and grows with the card up to about 367 px, then centres. Text keeps its size.';
const LABELS = 'Double-click any title, label or value to edit it — every text uses a library text style. Change a colour by picking another chart variable (chart/cat-1 … cat-8, positive, negative) in the Fill panel.';
const LABELS_TPL = `${LABELS} Text edits inside the drawing are replaced when the drawing is regenerated; the card title, subtitle and legend are kept.`;
const REGEN = 'Yes. In the Showcase open Charts → Playground, pick the chart, open “Dataset”, edit the JSON and press “Apply data”, then “Download SVG for Figma”. The template import script (tools/figma-template-import in the Showcase repo, run by the design-system maintainer through the Figma plugin API) replaces only the drawing inside this card — title, subtitle, legend and the card itself are kept — and re-applies colour variables, text styles (including Medium weights), label anchors and width-mode bindings. Do not drag the SVG straight onto the canvas: a direct SVG import does not preserve variable bindings, text styles or the resize / width-mode behaviour (see the regeneration notes for the manual cleanup).';
const LINE_REGEN_NOTE = 'Not automated: series can’t be edited in an instance and the importer can’t rebuild these cards yet.';
const LINE_REGEN = 'Not yet. The series shapes belong to the Line chart component (Figma blocks vector edits in an instance), and the import script can’t rebuild line / area cards because the Showcase draws their axes in HTML, which the SVG export does not capture. Until the exporter is extended, new line data needs a maintainer to rebuild the card. Titles, labels, colours and the Series 2 / 3 toggles stay editable.';
const NO_REGEN = 'No — edit the data directly in Figma as described above.';
/** Chart width modes (Figma variable collection "Chart width"), widest first: [lowest card width, mode name]. */
export const WIDTH_MODES: [number, string][] = [[640, '≥ 640 px'], [560, '560–639 px'], [480, '480–559 px'], [400, '400–479 px'], [320, '< 400 px']];
/** Which mode to select at each card width below `bp`: [card widths, mode name]. Wider cards keep the default “≥ 640 px”. */
export const modeSteps = (bp: number): [string, string][] => WIDTH_MODES.slice(1).filter(([lo]) => lo < bp)
  .map(([lo, name], i, a) => { const hi = Math.min(bp, i === 0 ? WIDTH_MODES.find(([l]) => l > lo)![0] : a[i - 1][0]) - 1; return [`${lo}–${hi} px card`, name]; });
const mode = (bp: number | null) => bp === null
  ? 'Nothing to do — it already fits every card width from 320 px.'
  : `From ${bp} px up, leave the default “≥ 640 px” mode. Narrower than ${bp} px, select the card (or a parent frame, to switch every chart inside) → right panel → Layer → Apply variable mode → Chart width, and pick: ${modeSteps(bp).map(([w, m]) => `${w} → “${m}”`).join('; ')}. That one switch hides the extra labels, wraps the legend and swaps in any compact layout.`;

const BAND_VALUES = 'Each bar segment’s height is its top padding inside the 300 px plot: padding = 300 × (1 − value ÷ axis max). Type the new padding, then update the value label text. Data labels and trend points are separate layers.';
const ROW_VALUES = 'Each row’s Track is a 2-column grid: set the first column to the value and the second to (axis max − value) — the bar redraws immediately. Keep the axis max ≥ 1.3 × the largest value so the value label fits down to 400 px. Update the value text to match.';

const base = { autoResize: 'yes' as Cap, textColor: 'yes' as Cap, layouts: 'yes' as Cap };
const band = (node: string, modeBelow: number | null, extra: Partial<Coverage> & { valuesNote?: string; catNote?: string; regenNote?: string } = {}): Coverage => ({
  ...base, cls: 'native', node, modeBelow, categories: 'yes', values: 'partial', regen: 'no',
  notes: { categories: extra.catNote ?? 'Duplicate or delete a Chart / Band in the Bands slot.', values: extra.valuesNote ?? 'Set as pixel paddings (value ÷ axis max × plot height).', regen: extra.regenNote },
  howTo: { resize: RESIZE_FILL, labels: LABELS, categories: 'Select a bar and duplicate (⌘D) or delete its Chart / Band in the Bands slot; the other bands share the width equally. Rename the X label in the band’s Label property.', values: BAND_VALUES, data: NO_REGEN, compact: mode(modeBelow) },
  ...extra });
const rows = (node: string, modeBelow: number | null, layout: string): Coverage => ({
  ...base, cls: 'native', node, modeBelow, categories: 'yes', values: 'yes', regen: 'no',
  notes: { categories: 'Duplicate or delete a row in the Rows slot.', values: 'Typed as Track grid ratios.' },
  howTo: { resize: RESIZE_FILL, labels: LABELS, categories: `Duplicate (⌘D) or delete a Chart / H-bar row (layout=${layout}) in the Rows slot; drag to reorder.`, values: ROW_VALUES, data: NO_REGEN, compact: mode(modeBelow) } });
const range = (node: string, style: string): Coverage => ({
  ...base, cls: 'native', node, modeBelow: null, categories: 'yes', values: 'yes', regen: 'no',
  notes: { categories: 'Duplicate or delete a Range row in the Row plot.', values: 'Typed as Track grid ratios.' },
  howTo: { resize: RESIZE_FILL, labels: LABELS, categories: `Duplicate or delete a Chart / Range row (style=${style}) inside the Row plot’s Rows slot.`, values: 'Each row’s Track grid has previous / gap / current columns: type the values as column ratios on the 0–max scale; the marks and connector follow.', data: NO_REGEN, compact: mode(null) } });
const tpl = (node: string, modeBelow: number | null, kind: 'stretch' | 'square' = 'stretch', resizeNote?: string): Coverage => ({
  ...base, cls: 'template', node, modeBelow, categories: 'no', values: 'no', regen: 'yes',
  notes: { categories: 'Categories are drawn geometry — regenerate.', values: 'Shapes are vectors — regenerate.', resize: resizeNote },
  howTo: { resize: resizeNote ?? (kind === 'square' ? RESIZE_SQUARE : RESIZE_STRETCH), labels: LABELS_TPL, categories: 'Not in Figma — add or remove categories in the Showcase dataset and regenerate.', values: 'Not in Figma — the shapes are vectors computed from the data. Change values in the Showcase dataset and regenerate.', data: REGEN, compact: mode(modeBelow) } });

export const COVERAGE: Record<string, Coverage> = {
  column: band('99:3832', 560),
  horizontal: { ...rows('65:3445', 400, 'inline'), howTo: { ...rows('65:3445', 400, 'inline').howTo, compact: `${mode(400)} In “< 400 px” every row switches to layout=stacked (label above a full-width bar).` } },
  stacked: band('65:2523', 480, { categories: 'partial', regen: 'partial', catNote: 'Bands are native; the trend polyline must be redrawn.', valuesNote: 'Segments as paddings; trend line redrawn.', regenNote: 'Trend line only, redrawn by hand.',
    howTo: { resize: RESIZE_FILL, labels: LABELS, categories: 'Duplicate or delete a Chart / Band; then redraw the trend polyline by hand through the new trend points.', values: `${BAND_VALUES} Move each Trend point by its lane padding; the dashed line between points is a vector to redraw.`, data: 'Only the trend line: redraw the dashed line by hand through the moved Trend points (the import script does not do partial redraws). Bars are edited directly.', compact: `${mode(480)} Alternate trend-point labels hide in narrow modes.` } }),
  grouped: band('65:2710', 360, { howTo: { resize: RESIZE_FILL, labels: LABELS, categories: 'Duplicate or delete a Chart / Band; toggle “Bar 3” for a third series. Bars keep at least 6 px, so up to 7 groups × 3 series fit a 320 px card.', values: BAND_VALUES, data: NO_REGEN, compact: mode(360) } }),
  line: { ...base, cls: 'composition', node: '65:3166', modeBelow: 400, categories: 'no', values: 'no', regen: 'partial',
    notes: { categories: 'Series are vectors inside the Line chart component.', values: 'Vectors can’t be edited in an instance.', regen: LINE_REGEN_NOTE },
    howTo: { resize: RESIZE_STRETCH, labels: LABELS, categories: 'Not in Figma — the series are vectors inside the Line chart component, which Figma does not let an instance edit. Month labels are 12 fixed cells you can retype.', values: 'Not in Figma (same reason). Use Series 2 / Series 3 to show or hide lines.', data: LINE_REGEN, compact: `${mode(400)} Below 560 px only the quarter months (Jan, Apr, Jul, Oct) show.` } },
  area: { ...base, cls: 'composition', node: '65:2948', modeBelow: 400, categories: 'no', values: 'no', regen: 'partial',
    notes: { categories: 'Series are vectors inside the Line chart component.', values: 'Vectors can’t be edited in an instance.', regen: LINE_REGEN_NOTE },
    howTo: { resize: RESIZE_STRETCH, labels: LABELS, categories: 'As line chart.', values: 'As line chart.', data: LINE_REGEN, compact: `${mode(400)} Below 560 px only the quarter months show.` } },
  combination: tpl('103:4076', 560),
  pie: { ...base, cls: 'composition', node: '100:4593', autoResize: 'partial', modeBelow: null, categories: 'partial', values: 'partial', regen: 'no',
    notes: { categories: 'Duplicate a segment and set its angles.', values: 'Arc sweep % in the Arc panel.', resize: 'Fixed 180 px square; the card around it resizes.' },
    howTo: { resize: 'The pie is a fixed 180 px square that fits every card width; the card around it resizes.', labels: LABELS, categories: 'Duplicate a segment (ellipse arc) in the Segments slot and add a legend row; then re-chain the start angles.', values: 'Select a segment → Arc panel: set Sweep to the share (%) and Start to where the previous segment ends.', data: NO_REGEN, compact: mode(null) } },
  donut: { ...base, cls: 'composition', node: '65:3360', modeBelow: null, categories: 'partial', values: 'partial', regen: 'no',
    notes: { categories: 'Duplicate a segment and a legend row.', values: 'Arc sweep % in the Arc panel.' },
    howTo: { resize: 'The ring stays square; layout=beside / below moves the legend.', labels: LABELS, categories: 'Duplicate a segment in Donut Segments and a row in the Legend slot; re-chain the start angles.', values: 'Select a segment → Arc panel: Sweep = share (%), Start = end of the previous segment. Update the legend value.', data: NO_REGEN, compact: mode(null) } },
  nested: tpl('163:10272', null, 'square'),
  radar: tpl('167:10728', null, 'square'),
  scatter: { ...base, cls: 'composition', node: '107:4635', modeBelow: null, categories: 'yes', values: 'partial', regen: 'no',
    notes: { categories: 'Duplicate or delete a Chart / Point.', values: 'Position = value as a fraction of the plot.' },
    howTo: { resize: RESIZE_STRETCH, labels: LABELS, categories: 'Duplicate (⌘D) or delete a Chart / Point in the Plot slot; swap its shape variant per group.', values: 'Move a point so x = plot width × (value − min) ÷ (max − min), and likewise for y; points keep their position as the card resizes.', data: NO_REGEN, compact: mode(null) } },
  quadrant: tpl('167:11013', 560),
  heatmap: { ...base, cls: 'native', node: '65:3518', modeBelow: null, categories: 'yes', values: 'partial', regen: 'no',
    notes: { categories: 'Duplicate rows / cells.', values: 'Choose the colour step per cell.' },
    howTo: { resize: RESIZE_FILL, labels: LABELS, categories: 'Duplicate or delete a row in the Grid slot; for a new column duplicate one cell in every row and the header.', values: 'Type the cell value, then pick its colour step variant (1–5) by the legend thresholds.', data: NO_REGEN, compact: mode(null) } },
  choropleth: { ...base, cls: 'fixed', node: '107:4423', autoResize: 'partial', modeBelow: null, categories: 'no', values: 'partial', regen: 'no',
    notes: { categories: 'Geography is a fixed internal reference.', values: 'Pick a sequential step per region.', resize: 'Map fixed at 268 px, centred.' },
    howTo: { resize: 'The map stays 268 px wide and centred; the card and legend resize around it.', labels: LABELS, categories: 'Not possible — the region shapes are internal reference geometry with unverified redistribution rights. The map component is excluded from the published library (underscore-prefixed); use this card only inside the library file until licensed geometry replaces it.', values: 'Select a region and choose its sequential colour variable (chart/seq-1 … seq-5) for its value band.', data: 'No — the geometry is fixed; values are colours.', compact: mode(null) } },
  network: tpl('167:10958', null, 'square'),
  treemap: (c => ({ ...c, howTo: { ...c.howTo, compact: c.howTo.compact + ' Tile labels that would not fit their tile hide automatically in that mode.' } }))(tpl('161:10160', 640)),
  waterfall: band('146:8232', 400, { valuesNote: 'Paddings; connectors moved by hand.', howTo: { resize: RESIZE_FILL, labels: LABELS, categories: 'Duplicate or delete a Chart / Band (Mark kind = floating) and its connector line in the Annotations slot.', values: `${BAND_VALUES} A floating bar has a bottom padding (running total) too; move its connector to the new level.`, data: NO_REGEN, compact: mode(400) } }),
  funnel: rows('148:9098', null, 'centered'),
  bullet: rows('148:9569', 360, 'bullet'),
  dumbbell: range('100:4498', 'dumbbell'),
  lollipop: range('100:4397', 'lollipop'),
  slope: tpl('156:9927', null),
  bump: tpl('156:10023', null),
  pareto: { ...tpl('103:4426', 360), cls: 'template', categories: 'partial', values: 'partial', regen: 'partial',
    notes: { categories: 'Bars are native; the cumulative line is a vector.', values: 'Bars as paddings; line redrawn.', regen: 'Cumulative line only, redrawn by hand.' },
    howTo: { resize: RESIZE_FILL, labels: LABELS_TPL, categories: 'Bars: duplicate or delete a Chart / Band. The cumulative line and its points must be redrawn by hand.', values: `${BAND_VALUES} The cumulative % line is a vector — redraw it by hand.`, data: 'Only the cumulative line: redraw it by hand through the new cumulative points (the import script does not do partial redraws). Bars are edited directly.', compact: mode(360) } },
  tornado: rows('148:9231', 360, 'diverging'),
  population: rows('148:9400', null, 'diverging'),
  marimekko: tpl('163:10728', 360),
  gauge: tpl('163:10389', null, 'square'),
  histogram: band('100:3739', null, { catNote: 'Duplicate or delete a bin band; update the edge ticks.' }),
  box: band('146:35433', null, { valuesNote: 'Five paddings (whiskers, box, median); outliers moved by hand.' }),
  violin: tpl('156:10239', null),
  beeswarm: tpl('168:11180', null),
  ridgeline: tpl('160:10812', null),
  hexbin: tpl('166:10831', 480, 'square', 'The wide drawing fills cards ≥ 640 px (grows up to 1.35×); narrower cards use the compact drawing, which grows from 272 px up to 367 px. Text keeps its size.'),
  density: tpl('156:10311', null),
  dot: range('100:4397', 'dot'),
  qq: tpl('168:10729', null),
  error: band('146:8480', null, { valuesNote: 'Interval set as paddings.' }),
  candlestick: band('146:8705', 360, { valuesNote: 'Open/close/high/low as paddings.' }),
  stream: tpl('156:9825', 480),
  gantt: rows('148:9720', 360, 'span'),
  control: tpl('103:4289', 560),
  ohlc: band('146:9113', 360, { valuesNote: 'Open/close/high/low as paddings.' }),
  step: tpl('103:4206', 560),
  horizon: tpl('156:10139', 480),
  timeline: tpl('172:11501', 560),
  sankey: tpl('103:4791', null),
  chord: tpl('167:10903', null, 'square'),
  sunburst: tpl('163:10333', null, 'square'),
  packing: tpl('163:10614', null, 'square'),
  parallel: tpl('156:10400', null),
  dendrogram: tpl('157:10097', null),
  alluvial: tpl('160:11188', 360),
  icicle: (c => ({ ...c, howTo: { ...c.howTo, compact: c.howTo.compact + ' Tile labels that would not fit their tile hide automatically in that mode.' } }))(tpl('161:10255', 640)),
  arc: tpl('160:11084', 480),
  ternary: tpl('163:10672', null, 'square'),
  flowmap: tpl('170:11206', null, 'square'),
  cartogram: tpl('164:10601', null, 'square'),
  waffle: tpl('164:10355', 480, 'square'),
  rose: tpl('167:10825', null, 'square'),
  contour: tpl('164:10673', 560, 'square', 'The wide drawing fills cards ≥ 640 px (grows up to 1.35×); narrower cards use the compact drawing, which grows from 272 px up to 367 px. Text keeps its size.'),
  'quadrant-bubble': tpl('172:11286', 400),
  bubble: { ...base, cls: 'native', node: '65:3635', modeBelow: null, categories: 'yes', values: 'partial', regen: 'no',
    notes: { categories: 'Duplicate rows / cells.', values: 'Diameter as padding + colour step.' },
    howTo: { resize: RESIZE_FILL, labels: LABELS, categories: 'Duplicate or delete a row in the Grid slot; for a column add one Chart / Bubble per row and a header label (headers wrap to two lines on narrow cards).', values: 'Set the bubble diameter (2 × padding) so its area is proportional to volume, and pick the colour step for the rate.', data: NO_REGEN, compact: mode(null) } },
};

/** Totals for the QA report, derived from the matrix (never typed by hand). */
export function coverageTotals() {
  const v = Object.values(COVERAGE), n = (f: (c: Coverage) => boolean) => v.filter(f).length;
  return {
    charts: v.length,
    autoResize: { yes: n(c => c.autoResize === 'yes'), partial: n(c => c.autoResize === 'partial') },
    noModeNeeded: n(c => c.modeBelow === null), modeNeeded: n(c => c.modeBelow !== null),
    categories: { yes: n(c => c.categories === 'yes'), partial: n(c => c.categories === 'partial'), no: n(c => c.categories === 'no') },
    values: { yes: n(c => c.values === 'yes'), partial: n(c => c.values === 'partial'), no: n(c => c.values === 'no') },
    regen: { yes: n(c => c.regen === 'yes'), partial: n(c => c.regen === 'partial'), no: n(c => c.regen === 'no') },
    layouts: n(c => c.layouts === 'yes'),
  };
}

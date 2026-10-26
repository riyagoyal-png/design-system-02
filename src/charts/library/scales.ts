// Chart Library color scales. Literals here are spec-stated §7.2 values that have no CSS token
// (allow-listed in scripts/check-tokens.mjs). They match the Figma aliases one-for-one.

/** §7.2 categorical, then the categorical extension (categories 5–8) and "Other". Figma: chart/cat-1…8, chart/other. */
export const CATEGORICAL = [
  'var(--ds-chart-cat-1)', 'var(--ds-chart-cat-2)', 'var(--ds-chart-cat-3)', 'var(--ds-chart-cat-4)',
  '#34d399', '#fb7185', '#93c5fd', '#f59e0b',
];
export const OTHER = '#64748b';

/** §7.2 "Sequential neutral" rgba(59,130,246, 0.15 → 1.0), 5 steps. Figma: chart/seq/0…4 (blue-500 at 20/30/40/60/100%). */
export const SEQUENTIAL = ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.4)', 'rgba(59,130,246,0.6)', 'rgb(59,130,246)'];
/** Step for a value on [min, max] (equal intervals), as used in Figma: round(t × 4). */
export const seqStep = (v: number, min: number, max: number) => Math.min(4, Math.max(0, Math.round(((v - min) / (max - min || 1)) * 4)));

/** §7.5 guide / reference line rgba(255,255,255,0.2). Figma: chart/guide. */
export const GUIDE = 'rgba(255,255,255,0.2)';

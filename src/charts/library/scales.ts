// Chart Library color scales. Literals here are spec-stated §7.2 values that have no CSS token
// (allow-listed in scripts/check-tokens.mjs). They match the Figma aliases one-for-one.

/** §7.2 categorical, then the categorical extension and "Other". Figma: chart/line-1…10, chart/other. */
export const CATEGORICAL = [
  ...Array.from({ length: 10 }, (_, i) => `var(--ds-chart-cat-${i + 1})`),
];
export const OTHER = '#64748b';

/** §7.2 "Sequential neutral" rgba(59,130,246, 0.15 → 1.0), 5 steps. Figma: chart/seq/0…4 (blue-500 at 20/30/40/60/100%). */
export const SEQUENTIAL = ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.4)', 'rgba(59,130,246,0.6)', 'rgb(59,130,246)'];
/** Step for a value on [min, max] (equal intervals), as used in Figma: round(t × 4). */
export const seqStep = (v: number, min: number, max: number) => Math.min(4, Math.max(0, Math.round(((v - min) / (max - min || 1)) * 4)));

/** §7.5 guide / reference line rgba(255,255,255,0.2). Figma: chart/guide. */
export const GUIDE = 'rgba(255,255,255,0.2)';

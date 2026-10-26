// Synthetic fixtures for the Chart Library, ported from the Pulse Dashboard chart library
// (src/components/chart-library/data/*.js, read-only reference). Values and seeds are identical,
// so the showcase and the Figma library render the same data.

/** Pulse statistics.js — linear congruential generator, (state + 0.5) / 2^32. */
export function seeded(seed = 4271) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return (state + 0.5) / 4294967296; };
}
/** Pulse statistics.js — Box–Muller normal samples rounded to 0.1. */
export function normalSamples(center: number, deviation: number, n: number, seed: number) {
  const random = seeded(seed);
  return Array.from({ length: n }, () => Math.round((center + deviation * Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random())) * 10) / 10);
}
/** Equal-width bins; the last bin is closed on the right (Pulse statistics.js). */
export function histogram(values: number[], start: number, stop: number, step: number) {
  const n = Math.ceil((stop - start) / step);
  return Array.from({ length: n }, (_, i) => {
    const low = start + i * step, high = low + step;
    return { low, high, value: values.filter(v => v >= low && (i === n - 1 ? v <= high : v < high)).length };
  });
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const departments = [
  { name: 'Packing', actual: 186, plan: 200 }, { name: 'Process', actual: 154, plan: 160 }, { name: 'Quality', actual: 72, plan: 80 },
  { name: 'Warehouse', actual: 98, plan: 105 }, { name: 'Utilities', actual: 54, plan: 60 }, { name: 'Engineering', actual: 86, plan: 90 },
];
export const monthly = [82, 86, 84, 91, 96, 93, 99, 105, 101, 112, 116, 120].map((output, i) => ({
  name: MONTHS[i], output, forecast: 84 + i * 3, low: 78 + i * 3 - i * 0.4, high: 90 + i * 3 + i * 0.4,
}));
export const costs = [{ name: 'Materials', value: 420 }, { name: 'People', value: 270 }, { name: 'Energy', value: 155 }, { name: 'Maintenance', value: 90 }, { name: 'Logistics', value: 65 }];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const heatTeams = ['Packing', 'Process', 'Quality', 'Utilities', 'Warehouse'];
export const heatValues = heatTeams.map((_, row) => DAYS.map((_, col) => [88, 94, 82, 96, 90, 86, 98][(col + row * 2) % 7] + (row % 2)));
export const ratings = [
  { name: 'Packing', previous: 3.1, current: 3.8 }, { name: 'Process', previous: 3.5, current: 3.9 }, { name: 'Quality', previous: 3.8, current: 4.2 },
  { name: 'Utilities', previous: 3.3, current: 3.7 }, { name: 'Engineering', previous: 3.7, current: 4.1 },
];
const defectCounts = [48, 32, 24, 16, 10, 6];
const defectTotal = defectCounts.reduce((a, b) => a + b, 0);
export const pareto = ['Seal', 'Label', 'Fill', 'Cap', 'Carton', 'Other'].map((name, i) => ({ name, count: defectCounts[i], cumulative: defectCounts.slice(0, i + 1).reduce((a, b) => a + b, 0) / defectTotal * 100 }));
export const controlLimits = { mean: 50, lower: 46.4, upper: 53.6 };
export const control = normalSamples(50, 1.15, 24, 98).map((value, i) => ({ sample: i + 1, value: i === 17 ? 54.2 : value }));
export const inventory = [120, 120, 95, 95, 155, 155, 130, 130, 105, 165, 165, 142].map((value, i) => ({ name: MONTHS[i], value }));
export const inspectionTimes = normalSamples(26, 6.2, 180, 827).map(v => Math.max(9, Math.min(47, v)));
const scatterRandom = seeded(6721);
export const scatter = Array.from({ length: 28 }, (_, i) => ({ name: `Line ${String(i + 1).padStart(2, '0')}`, skill: Math.round(42 + scatterRandom() * 53), output: Math.round(48 + scatterRandom() * 50), group: i % 3 }));
export const flow = {
  nodes: ['Operations', 'Support', 'Packing', 'Process', 'Quality', 'Day shift', 'Night shift'].map(name => ({ name })),
  links: [
    { source: 0, target: 2, value: 60 }, { source: 0, target: 3, value: 40 }, { source: 1, target: 3, value: 20 }, { source: 1, target: 4, value: 30 },
    { source: 2, target: 5, value: 40 }, { source: 2, target: 6, value: 20 }, { source: 3, target: 5, value: 35 }, { source: 3, target: 6, value: 25 },
    { source: 4, target: 5, value: 20 }, { source: 4, target: 6, value: 10 },
  ],
};
export const offices: Record<string, number> = {
  Rajasthan: 320, 'Uttar Pradesh': 460, Bihar: 210, Gujarat: 280, 'Madhya Pradesh': 240, 'West Bengal': 190, Maharashtra: 380, Telangana: 150, Karnataka: 260, 'Tamil Nadu': 300,
};

/* ── Batches 2–6: the remaining Pulse fixtures (chartMockData.js, combinationMockData.js), values unchanged ── */
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const mean = (v: number[]) => sum(v) / v.length;
const quantile = (sorted: number[], p: number) => { const at = (sorted.length - 1) * p, lo = Math.floor(at); return sorted[lo] + (sorted[Math.ceil(at)] - sorted[lo]) * (at - lo); };
/** Tukey box statistics: whiskers at the last values inside 1.5 × IQR (Pulse statistics.js). */
export function boxStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25), median = quantile(sorted, 0.5), q3 = quantile(sorted, 0.75), iqr = q3 - q1;
  const inside = sorted.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
  return { q1, median, q3, low: inside[0], high: inside[inside.length - 1], outliers: sorted.filter(v => !inside.includes(v)) };
}
/** Gaussian kernel density on an even grid (Pulse statistics.js). */
export function density(values: number[], from: number, to: number, bandwidth = 2.8, steps = 60) {
  return Array.from({ length: steps + 1 }, (_, i) => { const x = from + (to - from) * i / steps; return { x, y: mean(values.map(v => Math.exp(-0.5 * ((x - v) / bandwidth) ** 2) / (bandwidth * Math.sqrt(2 * Math.PI)))) }; });
}
/** Inverse standard normal (Acklam), for Q–Q plotting positions (i + .5) / n. */
export function normalQuantile(p: number): number {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const poly = (k: number[], x: number) => k.reduce((v, c0) => v * x + c0, 0);
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); return poly(c, q) / (poly(d, q) * q + 1); }
  if (p > 0.97575) return -normalQuantile(1 - p);
  const q = p - 0.5, r = q * q; return poly(a, r) * q / (poly(b, r) * r + 1);
}

export const capabilities = ['Safety', 'Quality', 'Delivery', 'Skills', 'Efficiency', 'Teamwork'].map((name, i) => ({ name, actual: [92, 86, 81, 76, 84, 90][i], benchmark: [85, 90, 85, 80, 88, 85][i] }));
export const projects = [
  { name: 'Safety audit', effort: 25, impact: 91 }, { name: 'Shift handover', effort: 30, impact: 78 }, { name: 'Line upgrade', effort: 82, impact: 94 }, { name: 'Automation', effort: 86, impact: 84 },
  { name: 'Label refresh', effort: 24, impact: 29 }, { name: 'Storage labels', effort: 32, impact: 35 }, { name: 'Legacy migration', effort: 81, impact: 31 }, { name: 'Custom reports', effort: 76, impact: 23 },
];
export const waterfall = [
  { name: 'Opening', value: 240, total: true }, { name: 'Volume', value: 64 }, { name: 'Pricing', value: 32 },
  { name: 'Returns', value: -18 }, { name: 'Energy', value: -26 }, { name: 'Closing', value: 292, total: true },
];
export const funnel = ['Applied', 'Screened', 'Interviewed', 'Offered', 'Joined'].map((name, i) => ({ name, value: [960, 480, 220, 100, 68][i] }));
export const bullets = ['Packing', 'Process', 'Quality', 'Warehouse'].map((name, i) => ({ name, actual: [84, 92, 78, 88][i], target: [90, 90, 85, 92][i] }));
export const slope = ['Packing', 'Process', 'Quality', 'Utilities'].map((name, i) => ({ name, previous: [72, 80, 86, 67][i], current: [84, 88, 93, 76][i] }));
export const ranks = [{ name: 'North', ranks: [1, 2, 1, 3] }, { name: 'South', ranks: [2, 1, 3, 1] }, { name: 'East', ranks: [3, 4, 2, 2] }, { name: 'West', ranks: [4, 3, 4, 4] }];
export const sensitivities = ['Demand', 'Material', 'Energy', 'Yield', 'Freight'].map((name, i) => ({ name, low: [-36, -28, -20, -16, -10][i], high: [42, 30, 23, 18, 12][i] }));
export const population = ['18–24', '25–34', '35–44', '45–54', '55–64'].map((name, i) => ({ name, women: [42, 96, 81, 52, 18][i], men: [56, 125, 104, 68, 28][i] }));
export const segments = [{ name: 'Plant A', width: 40, mix: [55, 30, 15] }, { name: 'Plant B', width: 35, mix: [38, 42, 20] }, { name: 'Plant C', width: 25, mix: [25, 35, 40] }];
export const machines = ['Press A', 'Press B', 'Filler C', 'Packer D'].map((name, i) => ({ name, values: [...normalSamples(23 + i * 2, 2.2 + i * 0.65, 55, 711 + i), ...(i === 1 ? [43] : [])] }));
export const boxes = machines.map(m => ({ name: m.name, ...boxStats(m.values) }));
export const densities = machines.map(m => ({ name: m.name, points: density(m.values, 10, 46) }));
export const inspectionDensity = density(inspectionTimes, 4, 52, 3);
export const qq = [...inspectionTimes].sort((a, b) => a - b).map((value, i) => ({ expected: normalQuantile((i + 0.5) / inspectionTimes.length), value }));
export const estimates = ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'].map((name, i) => ({ name, value: [24, 28, 26, 31, 29][i], error: [2.1, 3.2, 1.8, 2.7, 2.4][i] }));
export const ohlc = [102, 105, 103, 109, 112, 108, 110, 116, 114, 119, 117, 122].map((close, i, closes) => {
  const open = i ? closes[i - 1] : 100;
  return { name: 'Sep ' + String(i + 1).padStart(2, '0'), open, close, high: Math.max(open, close) + [3, 4, 2][i % 3], low: Math.min(open, close) - [2, 3, 4][i % 3] };
});
export const streams = MONTHS.map((name, i) => ({ name, process: [24, 32, 35, 27, 22, 29, 36, 42, 38, 30, 26, 33][i], packing: [18, 22, 28, 34, 38, 32, 26, 21, 27, 36, 40, 31][i], logistics: [12, 16, 13, 18, 23, 27, 22, 18, 14, 19, 24, 28][i] }));
export const schedule = [
  { name: 'Scope', start: 0, end: 5, progress: 1 }, { name: 'Design', start: 4, end: 12, progress: 1 }, { name: 'Procurement', start: 10, end: 23, progress: 0.75 },
  { name: 'Installation', start: 22, end: 33, progress: 0.35 }, { name: 'Validation', start: 32, end: 40, progress: 0 },
];
export const horizonValues = MONTHS.map((name, i) => ({ name, value: [4, 9, 15, 7, -4, -11, -17, -6, 3, 12, 18, 8][i] }));
export const events = [
  { day: 2, name: 'Kickoff', date: '02 Sep', detail: 'Production improvement programme begins' }, { day: 9, name: 'Audit', date: '09 Sep', detail: 'Safety and quality baseline signed off' },
  { day: 17, name: 'Pilot', date: '17 Sep', detail: 'New packing process starts on Line A' }, { day: 24, name: 'Review', date: '24 Sep', detail: 'Pilot results reviewed by operations' },
  { day: 29, name: 'Rollout', date: '29 Sep', detail: 'Approved process released to all shifts' },
];
export const teams = ['Process', 'Packing', 'Quality', 'Planning'];
export const collaborations = [[0, 24, 18, 12], [24, 0, 30, 16], [18, 30, 0, 22], [12, 16, 22, 0]];
export interface HNode { name: string; value?: number; children?: HNode[] }
export const hierarchyData: HNode = {
  name: 'Factory', children: [
    { name: 'Operations', children: [{ name: 'Process', value: 180 }, { name: 'Packing', value: 140 }, { name: 'Utilities', value: 60 }] },
    { name: 'Support', children: [{ name: 'Quality', value: 80 }, { name: 'Planning', value: 55 }, { name: 'Engineering', value: 85 }] },
  ],
};
export const parallel = Array.from({ length: 9 }, (_, i) => ({ name: 'Line ' + (i + 1), quality: [96, 88, 92, 97, 84, 90, 93, 86, 95][i], speed: [72, 91, 83, 88, 96, 78, 86, 93, 80][i], cost: [58, 72, 64, 77, 51, 81, 69, 56, 74][i], skill: [85, 76, 89, 94, 70, 82, 91, 75, 88][i] }));
export const cohorts = [
  { name: 'Apprentice', stages: ['Entry', 'Developing', 'Certified'], value: 38 }, { name: 'Experienced', stages: ['Entry', 'Certified', 'Advanced'], value: 27 },
  { name: 'Specialist', stages: ['Certified', 'Advanced', 'Advanced'], value: 21 }, { name: 'Reskill', stages: ['Developing', 'Developing', 'Certified'], value: 14 },
];
export const arcLinks = [{ source: 0, target: 1, value: 24 }, { source: 0, target: 2, value: 18 }, { source: 0, target: 3, value: 12 }, { source: 1, target: 2, value: 30 }, { source: 1, target: 3, value: 16 }, { source: 2, target: 3, value: 22 }];
export const ternary = [
  { name: 'Blend A', a: 65, b: 20, c: 15 }, { name: 'Blend B', a: 35, b: 45, c: 20 }, { name: 'Blend C', a: 20, b: 25, c: 55 },
  { name: 'Blend D', a: 40, b: 30, c: 30 }, { name: 'Blend E', a: 25, b: 60, c: 15 }, { name: 'Blend F', a: 50, b: 15, c: 35 },
];
export const officeTiles = [
  { name: 'Rajasthan', short: 'RJ', value: 320, row: 1, col: 0 }, { name: 'Uttar Pradesh', short: 'UP', value: 460, row: 1, col: 1 }, { name: 'Bihar', short: 'BR', value: 210, row: 1, col: 2 },
  { name: 'Gujarat', short: 'GJ', value: 280, row: 2, col: 0 }, { name: 'Madhya Pradesh', short: 'MP', value: 240, row: 2, col: 1 }, { name: 'West Bengal', short: 'WB', value: 190, row: 2, col: 2 },
  { name: 'Maharashtra', short: 'MH', value: 380, row: 3, col: 0 }, { name: 'Telangana', short: 'TS', value: 150, row: 3, col: 1 }, { name: 'Karnataka', short: 'KA', value: 260, row: 4, col: 0 },
  { name: 'Tamil Nadu', short: 'TN', value: 300, row: 4, col: 1 },
];
export const transfers = [
  { source: 'Rajasthan', target: 'Maharashtra', value: 42 }, { source: 'Uttar Pradesh', target: 'Gujarat', value: 28 }, { source: 'Maharashtra', target: 'Karnataka', value: 35 },
  { source: 'Karnataka', target: 'Tamil Nadu', value: 24 }, { source: 'Bihar', target: 'West Bengal', value: 18 },
];
export const waffleData = [{ name: 'Certified', value: 68 }, { name: 'In training', value: 22 }, { name: 'Not started', value: 10 }];
export const rose = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((name, i) => ({ name, value: [12, 24, 38, 28, 18, 9, 15, 21][i] }));
export const field = { width: 48, height: 36, values: Array.from({ length: 48 * 36 }, (_, i) => {
  const x = i % 48, y = Math.floor(i / 48);
  return 24 + 55 * Math.exp(-((x - 16) ** 2 / 65 + (y - 14) ** 2 / 42)) + 42 * Math.exp(-((x - 34) ** 2 / 38 + (y - 23) ** 2 / 30));
}) };
export const gauge = { actual: 78, target: 85 };
export const employeeCategories = ['Operations', 'Specialist', 'Support'];
export const performanceRisk = [
  { name: 'Packing A', performance: 38, risk: 72, size: 84, category: 0 }, { name: 'Packing B', performance: 53, risk: 57, size: 56, category: 0 },
  { name: 'Process A', performance: 81, risk: 68, size: 112, category: 0 }, { name: 'Process B', performance: 88, risk: 29, size: 70, category: 0 },
  { name: 'Quality A', performance: 76, risk: 54, size: 42, category: 1 }, { name: 'Quality B', performance: 59, risk: 22, size: 28, category: 1 },
  { name: 'Engineering', performance: 91, risk: 78, size: 35, category: 1 }, { name: 'Laboratory', performance: 46, risk: 43, size: 21, category: 1 },
  { name: 'Planning', performance: 32, risk: 24, size: 49, category: 2 }, { name: 'Logistics', performance: 66, risk: 76, size: 63, category: 2 },
  { name: 'Utilities', performance: 78, risk: 18, size: 35, category: 2 }, { name: 'Services', performance: 42, risk: 61, size: 28, category: 2 },
];
export const riskThresholds = { performance: 70, risk: 40 };

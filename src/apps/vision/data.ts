/*
  Sample data for the eight application examples, taken from the Figma frames (F3mlhgMw589Hs49rxXSFXR).
  Where a frame's analytics contradict themselves (bad products equal to products analysed, a donut that sums to 147 %,
  a tooltip whose defect % does not match its counts), the derived values are recomputed so every number agrees (§11 R-13, R-25).
  Rows the frames only show collapsed (Factories 2–4 on the Cameras page, user pages 2–3) are filled to match the counts shown.
*/
import type { Tone } from '../../components/ds/Display';
import type { Person } from '../../components/ds/Inputs2';

export const asset = (f: string) => `${import.meta.env.BASE_URL}assets/${f}`;
export const USER = { name: 'Rishav Raj Sinha', role: 'HUL Admin', src: asset('avatar-sample.jpg') };
export const fmtIN = (n: number) => n.toLocaleString('en-IN');

/* ── Factories (frame 2) ───────────────────────────────────────── */
export interface Factory { id: string; name: string; city: string; status: { tone: Tone; label: string }; lines: number; linesOf: number; cameras: number; admin: string }
export const FACTORIES: Factory[] = [
  { id: 'f1', name: 'Factory 1', city: 'Mumbai, MH', status: { tone: 'success', label: 'Active' }, lines: 6, linesOf: 6, cameras: 24, admin: 'Rahul Sharma' },
  { id: 'f2', name: 'Factory 2', city: 'Mumbai, MH', status: { tone: 'warning', label: 'Warning' }, lines: 2, linesOf: 4, cameras: 24, admin: 'Rahul Sharma' },
  { id: 'f3', name: 'Factory 3', city: 'Mumbai, MH', status: { tone: 'success', label: 'Active' }, lines: 4, linesOf: 4, cameras: 24, admin: 'Rahul Sharma' },
  { id: 'f4', name: 'Factory 4', city: 'Mumbai, MH', status: { tone: 'success', label: 'Active' }, lines: 5, linesOf: 6, cameras: 24, admin: 'Rahul Sharma' },
  { id: 'f5', name: 'Factory 5', city: 'Mumbai, MH', status: { tone: 'error', label: 'Offline' }, lines: 0, linesOf: 4, cameras: 24, admin: 'Rahul Sharma' },
  { id: 'f6', name: 'Factory 6', city: 'Mumbai, MH', status: { tone: 'success', label: 'Active' }, lines: 3, linesOf: 63, cameras: 24, admin: 'Rahul Sharma' },
];
/** [PRODUCT DECISION] observed in frame 2: the bar is green at ≥ 75 % of lines active, otherwise the stopped color. */
export const utilTone = (f: Factory) => (f.linesOf && f.lines / f.linesOf >= 0.75 ? 'success' : 'error') as 'success' | 'error';

/* ── Cameras (frame 4) ─────────────────────────────────────────── */
export interface Camera { id: string; name: string; serial: string; ip: string; status: { tone: Tone; label: string }; installed: string; lastActive: string }
export interface Line { id: string; name: string; cameras: Camera[] }
export interface Site { id: string; name: string; count: number; lines: Line[] }
const cam = (f: number, l: number, c: number, n: number): Camera => ({
  id: `f${f}l${l}c${c}`, name: `Line ${l} • Camera ${c}`, serial: `SN${123455 + n}`, ip: `192.168.${f * 10}.${n}`,
  status: { tone: 'success', label: 'Active' }, installed: '10 Apr 2024 14:32', lastActive: '10 Apr 2024 14:32',
});
const lines = (f: number, n: number, perLine: number): Line[] =>
  Array.from({ length: n }, (_, i) => ({ id: `f${f}l${i + 1}`, name: `Line ${i + 1}`, cameras: Array.from({ length: perLine }, (_, j) => cam(f, i + 1, j + 1, i * perLine + j + 1)) }));
export const SITES: Site[] = [
  // The frame lists two lines under Factory 1 while its count pill reads 12 (recorded in FIGMA_EXTRACTION.md); both kept as drawn.
  { id: 's1', name: 'Factory 1', count: 12, lines: lines(1, 2, 2) },
  { id: 's2', name: 'Factory 2', count: 6, lines: lines(2, 3, 2) },
  { id: 's3', name: 'Factory 3', count: 6, lines: lines(3, 3, 2) },
  { id: 's4', name: 'Factory 4', count: 6, lines: lines(4, 3, 2) },
];

/* ── Users (frame 6) ───────────────────────────────────────────── */
export type Role = 'HUL Admin' | 'Factory Admin' | 'Factory Operator' | 'Factory Quality Supervisor';
export const ROLES: Role[] = ['HUL Admin', 'Factory Admin', 'Factory Operator', 'Factory Quality Supervisor'];
export const ROLE_COLOR = { 'HUL Admin': 'purple', 'Factory Admin': 'blue', 'Factory Operator': 'green', 'Factory Quality Supervisor': 'amber' } as const;
export interface User { id: string; name: string; email: string; role: Role; factory: string; lines: string; status: { tone: Tone; label: string }; lastActive: string }
const FIG_PAGE: [string, Role][] = [
  ['Anita Sharma', 'HUL Admin'], ['Rohan Kumar', 'Factory Admin'], ['Rohan Kumar', 'Factory Operator'], ['Rohan Kumar', 'Factory Quality Supervisor'],
  ['Anita Sharma', 'HUL Admin'], ['Rohan Kumar', 'Factory Admin'], ['Rohan Kumar', 'Factory Operator'], ['Rohan Kumar', 'Factory Quality Supervisor'],
];
// Pages 2–3 complete the role counts shown on the tabs (3 HUL Admins, 8 Factory Admins, 10 Operators, 3 Supervisors).
const REST: Role[] = ['HUL Admin', ...Array(6).fill('Factory Admin'), ...Array(8).fill('Factory Operator'), 'Factory Quality Supervisor'];
export const USERS: User[] = [...FIG_PAGE, ...REST.map((r, i) => [i % 2 ? 'Anita Sharma' : 'Rohan Kumar', r] as [string, Role])].map(([name, role], i) => ({
  id: `u${i + 1}`, name, email: `${name.toLowerCase().replace(' ', '.')}@hul.com`, role,
  factory: role === 'HUL Admin' ? 'All Factories' : 'Factory 1 - Haridwar', lines: 'All Lines',
  status: { tone: 'success', label: 'Active' }, lastActive: '10 Apr 2024 14:32',
}));

/* ── People in the admin picker (frame 3) ──────────────────────── */
export const PICKER_PEOPLE: Person[] = [
  { id: 'p1', name: 'Priya Nair', email: 'priya.nair@unilever.com', code: 'EMP-8841', online: true },
  { id: 'p2', name: 'Anita Sharma', email: 'anita.sharma@hul.com', code: 'EMP-8842', online: true },
  { id: 'p3', name: 'Rohan Kumar', email: 'rohan.kumar@hul.com', code: 'EMP-8843', online: true },
];

/* ── Products (frame 8) ────────────────────────────────────────── */
export interface Product { id: string; name: string; size: string; barcode: string; cld: string; cbu: string; status: { tone: Tone; label: string }; updated: string }
export const PRODUCTS: Product[] = Array.from({ length: 24 }, (_, i) => ({
  id: `p${i + 1}`, name: 'Dove Nourishing Bodywash', size: '825 ml', barcode: '8901030875397', cld: '18901030875394', cbu: `BWC24041${String(i + 1).padStart(2, '0')}`,
  status: { tone: 'success', label: 'Active' }, updated: '10 Apr 2024 14:32',
}));

/* ── Live View (frame 1) ───────────────────────────────────────── */
export const LIVE = {
  sku: 'Dove Nourishing Bodywash 825 ml', line: 'Bottle Line 3',
  barcodes: [
    { label: 'Primary Barcode', value: '8901030875397' }, { label: 'Secondary Barcode', value: '9300632560289' },
    { label: 'Tertiary CBU', value: '18901030875394' }, { label: 'Tertiary CLD', value: '18901030875394' },
  ],
  cameras: [
    { title: 'Front Label Match', sub: 'Camera 1', src: asset('feed-front-label.png'), status: { tone: 'success' as Tone, label: 'Matched' }, detected: '“nourishing bodywash”' },
    { title: 'Product Barcode', sub: 'Camera 2', src: asset('feed-product-barcode.png'), status: { tone: 'success' as Tone, label: 'Matched' }, detected: '“8901030875397”' },
    { title: 'Secondary - Carton', sub: 'Camera 3', src: asset('feed-secondary-carton.png'), status: { tone: 'success' as Tone, label: 'Matched' }, detected: 'Mfg - “24/07/2023” , Exp - “23/07/2026”' },
    { title: 'CLD / Packing Check', sub: 'Camera 4', src: asset('feed-cld-packing.png'), status: { tone: 'error' as Tone, label: 'Error' }, detected: 'failed to read due to scratches', error: true },
  ],
};

/* ── Analytics (frame 7) ───────────────────────────────────────── */
// Bars: total analysed and the defect rate printed above each bar; bad = total × rate, so bars, trend and labels agree.
export const QUALITY = [
  { x: 'Lotus', total: 52000, rate: 10 }, { x: 'Herbal', total: 30000, rate: 6 }, { x: 'RHP', total: 27000, rate: 5.5 },
  { x: 'Herbal', total: 30500, rate: 12 }, { x: 'Lotus', total: 53000, rate: 6.5 }, { x: 'RHP', total: 42000, rate: 8 },
].map((d, i) => ({ key: `q${i}`, x: d.x, rate: d.rate, bad: Math.round(d.total * d.rate / 100), good: d.total - Math.round(d.total * d.rate / 100) }));

export const MATRIX_ROWS = ['Bottle Line-1', 'Bottle Line-1', 'Bottle Line-1', 'Bottle Line-2', 'Bottle Line-3', 'Norden-1'];
export const MATRIX_COLS = ['Vim Dishwash 500 ml Pouch', 'Comfort After Wash 200 ml', 'Lifebuoy Handwash Refill 185 ml', 'Comfort After Wash 200 ml', 'Vim Dishwash 500 ml Pouch', 'Vim Dishwash 500 ml Pouch', 'Surf Excel Matic 1 kg', 'Vim Dishwash 500 ml Pouch', 'Rin Advanced 500 g'];
// [row, col, analysed, defect %] — positions follow the frame; sizes and colors follow the values.
export const MATRIX_POINTS: [number, number, number, number][] = [
  [0, 1, 40000, 1.0], [0, 7, 180000, 7.5], [1, 6, 160000, 6.8], [2, 3, 30000, 1.1], [3, 4, 90000, 2.6],
  [4, 0, 20000, 0.8], [4, 9, 260000, 9.8], [5, 1, 120000, 9.5], [5, 8, 70000, 6.0],
].map(([r, c, v, p]) => [r, c - 1 < 0 ? 0 : c - 1, v, p] as [number, number, number, number]);

export const DEFECT_DIST = [
  { label: 'Primary - Front', value: 1561, color: 'var(--ds-chart-cat-1)' },
  { label: 'Primary - Back', value: 1844, color: 'var(--ds-chart-cat-2)' },
  { label: 'Carton', value: 1061, color: 'var(--ds-chart-cat-3)' },
  { label: 'CLD Packing', value: 843, color: 'var(--ds-chart-cat-4)' },
];

export const HEAT_ROWS = ['Lotus', 'Herbal', 'RHP', 'RHP', 'RHP', 'RHP', 'RHP'];
export const HEAT_COLS = ['Primary - Front', 'Primary - Back', 'Carton', 'CLD Packing'];
export const HEAT_VALUES = [[10, 10, 10, 10], [7, 7, 7, 7], [1.5, 1.5, 1.5, 1.5], [1.5, 1.5, 1.5, 1.5], [1.5, 1.5, 1.5, 1.5], [1.5, 1.5, 1.5, 1.5], [1.5, 1.5, 1.5, 1.5]];

export interface LineDefect { line: string; product: string; factory: string; analysed: number; front: number; back: number; carton: number; cld: number; issue: string; total: number }
const LD: [string, string, string, number, number, string][] = [
  ['Bottle Line-1', 'Vim Dishwash 500 ml Pouch', 'Lotus', 123456, 10, 'Filling'], ['Bottle Line-2', 'Comfort After Wash 200 ml', 'Herbal', 234567, 7, 'Labeling'],
  ['Bottle Line-3', 'Lifebuoy Handwash Refill 185 ml', 'RHP', 345678, 1.5, 'CLD Packing'], ['Norden-1', 'Comfort After Wash 200 ml', 'RHP', 456789, 1.5, 'Filling'],
  ['Norden-2', 'Vim Dishwash 500 ml Pouch', 'RHP', 567890, 1.5, 'Labeling'], ['Bottle Line-1', 'Whole Wheat Bread 500 g Pack', 'Lotus', 123456, 10, 'Filling'],
  ['Bottle Line-2', 'Vim Dishwash 500 ml Pouch', 'Herbal', 234567, 7, 'Labeling'], ['Bottle Line-3', 'Organic Spinach 250 g Bag', 'RHP', 345678, 1.5, 'CLD Packing'],
  ['Norden-1', 'Almond Milk 1 L Carton', 'RHP', 456789, 1.5, 'Filling'], ['Norden-2', 'Fresh Lemonade 1 L Bottle', 'RHP', 567890, 1.5, 'Labeling'],
];
export const LINE_DEFECTS: LineDefect[] = LD.map(([line, product, factory, analysed, rate, issue]) => ({ line, product, factory, analysed, front: rate, back: rate, carton: rate, cld: rate, issue, total: rate }));

export const LINE_STATUS = { running: 123, stopped: 5, rows: [
  ['Bottle Line-1', 'Lotus', 'Vim Dishwash 500 ml Pouch'], ['Bottle Line-2', 'Herbal', 'Comfort After Wash 200 ml'], ['Bottle Line-3', 'RHP', 'Lifebuoy Handwash Refill 185 ml'],
  ['Norden-1', 'RHP', 'Comfort After Wash 200 ml'], ['Norden-2', 'RHP', 'Vim Dishwash 500 ml Pouch'],
].map(([line, factory, product]) => ({ line, factory, product, since: '10 Apr, 08:14 AM' })) };
export const CAMERA_STATUS = { running: 123, stopped: 5, rows: [
  ['Camera 1', 'Bottle Line-1', 'Lotus'], ['Camera 2', 'Bottle Line-2', 'Herbal'], ['Camera 3', 'Bottle Line-3', 'RHP'], ['Camera 4', 'Norden-1', 'RHP'], ['Camera 5', 'Norden-2', 'RHP'],
].map(([camera, line, factory]) => ({ camera, line, factory, since: '10 Apr, 08:14 AM' })) };
export const DEVICE_STATUS = { running: 123, stopped: 5, rows: [
  ['DEV-001', 'Lotus'], ['DEV-002', 'Herbal'], ['DEV-003', 'RHP'], ['DEV-004', 'RHP'],
].map(([device, factory]) => ({ device, factory, since: '10 Apr, 08:14 AM' })) };

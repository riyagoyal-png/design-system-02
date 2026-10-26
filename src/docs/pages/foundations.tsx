import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, BadgeCheck, BarChart3, Cctv, CheckCircle2, Copy as CopyIcon, Cpu, Factory, History, Package, Percent, ScanSearch, Server, Users, Video, Workflow, type LucideIcon } from 'lucide-react';
import { section, spec } from '../../lib/spec';
import { resolveToken, useDensity } from '../../lib/tokens';
import { copyText } from '../../lib/copy';
import { Cell, CodeBlock, DocSection, Grid, Preview, SpecCode, SpecSource, SpecTable } from '../kit';
import { SpecMd } from './start';
import { SearchInput, TextInput } from '../../components/ds/Field';
import { Button } from '../../components/ds/Button';
import { KpiCard } from '../../components/ds/Cards';
import { Dot, HealthTile, IconTile, Illustration, Status, Tag } from '../../components/ds/Display';
import { DataTable, type Column } from '../../components/ds/Table';
import { Icon } from '../../components/ds/Icon';
import { Select } from '../../components/ds/Select';
import * as FI from '../../components/ds/figmaIcons';
import { FACTORIES, ROLE_COLOR, USERS, type User } from '../../apps/vision/data';

/* ── Colors ─────────────────────────────────────────────────────── */
const isColor = (v: string) => /^(#|rgba?\(|linear-gradient|radial-gradient)/.test(v.trim());
function groupOf(name: string): string {
  if (/^--ds-gradient-|^--ds-color-glow-/.test(name)) return 'Gradients & ambient glows';
  if (/^--ds-tag-|^--ds-heat-/.test(name)) return 'Component-specific: tags & heat scale';
  if (/^--ds-chart-/.test(name)) return 'Chart';
  if (/success|warning|error|critical|alert-count|info-/.test(name)) return 'Status';
  if (/stepper|avatar|detect|logo|attach|radio|callout|media|tooltip|scrollbar|skeleton/.test(name)) return 'Component-specific';
  if (/^--ds-color-(overlay|scrim)|^--ds-overlay/.test(name)) return 'Overlays';
  if (/^--ds-color-(bg|surface)/.test(name)) return 'Semantic: backgrounds & surfaces';
  if (/^--ds-color-text|^--ds-color-link|^--ds-color-icon/.test(name)) return 'Semantic: text & icons';
  if (/^--ds-color-border/.test(name)) return 'Semantic: borders & dividers';
  return 'Semantic: brand & interactive';
}
const COLOR_GROUPS = ['Gradients & ambient glows', 'Semantic: backgrounds & surfaces', 'Semantic: text & icons', 'Semantic: borders & dividers', 'Semantic: brand & interactive', 'Status', 'Overlays', 'Chart', 'Component-specific', 'Component-specific: tags & heat scale'];

function Swatch({ name, value, use, primitive }: { name: string; value: string; use: string; primitive?: boolean }) {
  return (
    <button type="button" className="doc-swatch" onClick={() => copyText(primitive ? value : `var(${name})`, primitive ? 'Value copied' : 'Token copied')}>
      <span className="doc-swatch__chip"><span style={{ background: primitive ? value : `var(${name})` }} /></span>
      <span className="doc-swatch__text">
        <code className="doc-swatch__name">{name}</code>
        <span className="doc-swatch__value">{value}</span>
        {use && <span className="doc-swatch__use">{use}</span>}
      </span>
      <span className="doc-swatch__copy"><CopyIcon size={14} aria-hidden="true" /><span className="ds-sr-only">Copy {primitive ? 'value' : 'token'}</span></span>
    </button>
  );
}

/** §11 rows that change a Figma color for contrast (rendered verbatim from the spec, backticks stripped). */
const AA_LOG = (section('11')?.body ?? '').split('\n').filter(l => /^\| R-0[34678] /.test(l))
  .map(l => l.split('|').slice(1, 4).map(c => c.trim().replace(/`/g, '')));

export function ColorsPage() {
  const [q, setQ] = useState('');
  const tokens = Object.entries(spec.declared).filter(([n, v]) => n.startsWith('--ds-color') || n.startsWith('--ds-chart') || n.startsWith('--ds-tag') || n.startsWith('--ds-heat') || n.startsWith('--ds-gradient') || (n === '--ds-overlay-blur' ? false : isColor(v)));
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const groups = COLOR_GROUPS.map(g => ({ g, items: tokens.filter(([n]) => groupOf(n) === g).filter(([n, v]) => !q || match(n) || match(v) || match(spec.tokenDocs[n]?.use ?? '')) }));
  const prim = spec.primitives.filter(p => !p.name.startsWith('--ds-') && (!q || match(p.name) || match(p.value) || match(p.use)));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Every color in the system: deep navy lit from within, translucent white glass, one blue accent and glowing status. Components use <b>semantic tokens</b> only; primitives are reference labels for traceability and are not emitted as custom properties (§2.1 — except the tag, heat and chart-category palettes). Gradients are listed first; where each may be used is on the Gradients &amp; Effects page. Click a swatch to copy its token (or a primitive's value).</p>
      <div className="doc-toolbar"><SearchInput value={q} onValueChange={setQ} label="Filter colors" placeholder="Filter by name, value or use" width="md" />
        <span className="ds-text-small" role="status">{groups.reduce((s, g) => s + g.items.length, 0) + prim.length} colors</span></div>
      {groups.filter(g => g.items.length).map(g => (
        <DocSection key={g.g} id={g.g.replace(/\W+/g, '-').toLowerCase()} title={g.g}>
          <div className="doc-swatches">{g.items.map(([n, v]) => <Swatch key={n} name={n} value={v} use={spec.tokenDocs[n]?.use ?? `Declared in §3 (${spec.declaredGroup[n] ?? 'token file'})`} />)}</div>
        </DocSection>
      ))}
      {prim.length > 0 && (
        <DocSection id="primitives" title="Primitives (reference labels)" description="Raw values behind the semantic tokens. Never reference these in component code.">
          {[...new Set(prim.map(p => p.group))].map(gr => (
            <div key={gr} className="doc-stack-sm"><h3 className="ds-text-subgroup-title">{gr}</h3>
              <div className="doc-swatches">{prim.filter(p => p.group === gr).map(p => <Swatch key={p.name} name={p.name} value={p.value} use={p.use} primitive />)}</div></div>
          ))}
        </DocSection>
      )}
      <DocSection id="aa" title="Accessibility adjustments to Figma values" description="Where a Figma color fails WCAG AA it was replaced; each change is logged in §11 and awaits designer approval in §15.1.">
        <div className="ds-table-region doc-table" role="region" aria-label="Accessibility adjustments" tabIndex={0}>
          <table className="ds-table"><caption className="ds-sr-only">Accessibility adjustments (§11)</caption>
            <thead><tr><th scope="col" className="ds-col-shrink">ID</th><th scope="col">Finding in the Figma screens</th><th scope="col">Resolution</th></tr></thead>
            <tbody>{AA_LOG.map(([id, f, r]) => <tr key={id}><th scope="row" className="ds-col-shrink">{id}</th><td>{f}</td><td>{r}</td></tr>)}</tbody>
          </table>
        </div>
      </DocSection>
      <SpecSource num="2.2" />
    </div>
  );
}

/* ── Typography ─────────────────────────────────────────────────── */
export function TypographyPage() {
  const [sample, setSample] = useState('Dove Nourishing Bodywash 825 ml');
  const scale = Object.entries(spec.declared).filter(([n]) => n.startsWith('--ds-font-size-'));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Inter only. DEOC's scale: 10 / 11 / 12 / 14 / 16 / 20 / 24 (D-10). No other size may be used. Weights 400–700. Headings tighten tracking, uppercase labels open it (+0.3 to +0.55px); KPI and metric numbers are bold, −0.65px and tabular.</p>
      <DocSection id="scale" title="Type scale">
        <div className="doc-scale">{scale.map(([n, v]) => (
          <div key={n} className="doc-scale__row"><code className="doc-token-static">{n}</code><span className="doc-scale__px">{v} · {parseFloat(v) / 16}rem</span>
            <span style={{ fontSize: `var(${n})`, lineHeight: `var(${n.replace('font-size', 'line-height')})` }} className="doc-scale__sample">Aa Inter {v}</span></div>
        ))}</div>
      </DocSection>
      <DocSection id="styles" title="Named text styles" description="Rendered with the .ds-ts-* classes generated from the §2.3 table. Edit the sample text to test wrapping and translations.">
        <div className="doc-narrow-xl"><label className="ds-field__label" htmlFor="ts-sample">Sample text</label><TextInput id="ts-sample" value={sample} onChange={e => setSample(e.target.value)} /></div>
        <div className="ds-table-region doc-table" role="region" aria-label="Text styles" tabIndex={0}>
          <table className="ds-table">
            <caption className="ds-sr-only">Named text styles</caption>
            <thead><tr><th scope="col">Style</th><th scope="col">Sample</th><th scope="col" className="ds-col-shrink">Size / LH</th><th scope="col" className="ds-col-shrink">Weight</th><th scope="col" className="ds-col-shrink">Tracking</th><th scope="col" className="ds-col-shrink">Color</th><th scope="col">Usage</th></tr></thead>
            <tbody>{spec.textStyles.map(t => (
              <tr key={t.name}>
                <th scope="row"><button type="button" className="doc-token" onClick={() => copyText(`.ds-ts-${t.name}`, 'Class copied')}>{t.name}</button></th>
                <td><span className={`ds-ts-${t.name}`}>{t.transform === 'UPPERCASE' ? sample.slice(0, 32) : sample}</span></td>
                <td className="ds-col-shrink">{t.size} / {t.lineHeight}</td><td className="ds-col-shrink">{t.weight}</td><td className="ds-col-shrink">{t.tracking}{t.transform !== '—' ? ` · ${t.transform}` : ''}</td>
                <td className="ds-col-shrink">{t.color}</td><td className="doc-usage">{t.usage}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </DocSection>
      <DocSection id="rem" title="Text scaling, rem and long content"><SpecSource num="Text scaling, rem units and long content" title="Rules" /></DocSection>
      <CodeBlock lang="css" title="Font loading (§2.3)" code={`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');\n--ds-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`} />
    </div>
  );
}

/* ── Spacing ────────────────────────────────────────────────────── */
export function SpacingPage() {
  useDensity();
  const prim = Object.keys(spec.declared).filter(n => /^--ds-space-\d/.test(n));
  const sem = Object.keys(spec.declared).filter(n => /^--ds-space-[a-z]/.test(n));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Base unit 4px with 2px half-steps (2, 6, 10, 14). Use gap between siblings, padding inside containers, margin only for the 4px trigger → menu offset and the 2px nudge of validation text. Calm density: 24px card and cell padding, 20px section gaps, 40px form rows.</p>
      <DocSection id="scale" title="Primitive scale">
        <div className="doc-ruler">{prim.map(n => (
          <button type="button" key={n} className="doc-ruler__row" onClick={() => copyText(`var(${n})`, 'Token copied')}>
            <code>{n}</code><span className="doc-ruler__bar" style={{ width: `var(${n})` }} /><span className="ds-text-small">{resolveToken(n)}</span>
          </button>
        ))}</div>
      </DocSection>
      <DocSection id="semantic" title="Semantic spacing" description="Values follow the density mode where §2.13 says so.">
        <SpecTable caption="Semantic spacing" rows={sem.map(n => ({ property: spec.tokenDocs[n]?.use || n, token: n }))} />
      </DocSection>
      <DocSection id="examples" title="Real examples">
        <Grid min={300}>
          <Measured label="KPI / dashboard card padding (space-card-xl)" pad="--ds-space-card-xl"><KpiCard label="Total Factories" value={FACTORIES.length} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} /></Measured>
          <Measured label="Side-panel card padding (space-card)" pad="--ds-space-card"><span className="ds-text-body">Reference barcodes</span></Measured>
          <Measured label="Table cell padding (cell-y × cell-x)" pad="--ds-space-cell-y" padX="--ds-space-cell-x"><span className="ds-text-body">Cell content</span></Measured>
          <Measured label="Page gutter (page-gutter)" pad="--ds-space-page-gutter"><span className="ds-text-body">Page content</span></Measured>
          <div className="doc-gapdemo"><p className="ds-text-small">Form: label gap {resolveToken('--ds-space-form-label')} · row gap {resolveToken('--ds-space-form-row')} · column gap {resolveToken('--ds-space-form-col')}</p>
            <div className="ds-form-grid doc-outline-children"><div className="ds-field"><span className="ds-field__label">Factory name</span><TextInput aria-label="Factory name" /></div><div className="ds-field"><span className="ds-field__label">Location</span><TextInput aria-label="Location" /></div><div className="ds-field ds-span-2"><span className="ds-field__label">Factory admin</span><TextInput aria-label="Factory admin" /></div></div></div>
        </Grid>
      </DocSection>
      <SpecSource num="2.4" />
    </div>
  );
}
function Measured({ label, pad, padX, children }: { label: string; pad: string; padX?: string; children: ReactNode }) {
  return (
    <div className="doc-measured">
      <p className="ds-text-small">{label}: {resolveToken(pad)}{padX ? ` × ${resolveToken(padX)}` : ''}</p>
      <div className="doc-measured__box" style={{ padding: padX ? `var(${pad}) var(${padX})` : `var(${pad})` }}><div className="doc-measured__inner">{children}</div></div>
    </div>
  );
}

/* ── Radii ──────────────────────────────────────────────────────── */
export function RadiiPage() {
  const radii = Object.keys(spec.declared).filter(n => n.startsWith('--ds-radius-'));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Radius is assigned by role: panels 24 (shell panels, KPI cards, camera tiles), cards 16, nested groups and nav items 16, controls 12 (buttons, inputs, menus, modals), tracks and wells 12, small parts 8, chips 6, micro 4, pills full. Inner radius is never larger than its container's. Slide panels and the mobile top bar are edge-attached (no radius).</p>
      <DocSection id="scale" title="Radius scale">
        <div className="doc-radii">{radii.map(n => (
          <button type="button" key={n} className="doc-radius" onClick={() => copyText(`var(${n})`, 'Token copied')}>
            <span className="doc-radius__shape" style={{ borderRadius: `var(${n})` }} />
            <code>{n}</code><span className="ds-text-small">{spec.declared[n]}</span><span className="doc-swatch__use">{spec.tokenDocs[n]?.use}</span>
          </button>
        ))}</div>
      </DocSection>
      <DocSection id="concentric" title="Concentric nesting in practice" description="Panels (24) hold cards (16), which hold wells and controls (12), which hold small parts (8, 4).">
        <Preview><div className="doc-concentric"><div className="doc-concentric__panel"><span className="ds-text-small">panel 24</span><div className="doc-concentric__card"><span className="ds-text-small">card 16</span><div className="doc-concentric__well"><span className="ds-text-small">track / well 12</span><Button size="sm">control 12</Button></div></div></div></div></Preview>
      </DocSection>
      <SpecSource num="2.5" />
    </div>
  );
}

/* ── Borders ────────────────────────────────────────────────────── */
export function BordersPage() {
  const borders = Object.keys(spec.declared).filter(n => n.startsWith('--ds-color-border'));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Glass surfaces carry a hairline white border in one colour, <code>border-edge</code> (white/2%, D-8): the light catching the glass edge, never a divider. Cards draw it with <code>shadow-edge</code> so it never changes their size. Dividers (<code>border-track</code>, <code>border-faint</code>, <code>border-divider</code>) separate a header from content inside one component. Every border is 1px; 2px only for the stepper connector and presence-dot ring; 4px only for detection frames on camera feeds. No decorative lines.</p>
      <DocSection id="widths" title="Widths"><SpecTable caption="Border widths" rows={[{ property: 'Default (every border)', token: '--ds-border-width' }, { property: 'Emphasis (stepper connector, presence ring)', token: '--ds-border-width-emphasis' }, { property: 'Detection frame', token: '--ds-border-width-detect' }]} /></DocSection>
      <DocSection id="colors" title="Border colors on a card surface">
        <div className="doc-borders">{borders.map(n => (
          <button type="button" key={n} className="doc-border" style={{ borderColor: `var(${n})` }} onClick={() => copyText(`var(${n})`, 'Token copied')}>
            <code>{n}</code><span className="ds-text-small">{spec.declared[n]}</span><span className="doc-swatch__use">{spec.tokenDocs[n]?.use}</span>
          </button>
        ))}</div>
      </DocSection>
      <SpecSource num="2.6" />
    </div>
  );
}

/* ── Shadows & elevation ───────────────────────────────────────── */
export function ShadowsPage() {
  const shadows = Object.keys(spec.declared).filter(n => n.startsWith('--ds-shadow-'));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Depth comes from stacking thin glass layers, each with a soft black drop shadow; overlays are the only opaque surfaces. Colored shadows (glows) are reserved for status dots, the primary button, the current step and the avatar orb — see Gradients &amp; Effects. Every surface below is identical except for its shadow token.</p>
      <DocSection id="shadows" title="Shadow tokens">
        <div className="doc-shadows">{shadows.map(n => (
          <div key={n} className="doc-shadow">
            <div className="doc-shadow__surface" style={{ boxShadow: `var(${n})` }} />
            <button type="button" className="doc-token" onClick={() => copyText(`var(${n})`, 'Token copied')}>{n}</button>
            <code className="doc-shadow__value">{spec.declared[n]}</code>
            <span className="doc-swatch__use">{spec.tokenDocs[n]?.use}</span>
          </div>
        ))}</div>
      </DocSection>
      <DocSection id="elevation" title="Elevation levels"><SpecSource num="Elevation levels" title="Elevation table" /></DocSection>
      <DocSection id="focus" title="Focus indicators" description="Outline-based, never box-shadow; ≥ 3:1 on every surface.">
        <Grid min={200}>
          <div className="doc-cell"><div className="doc-cell__stage"><Button className="is-focus-visible">focus-ring</Button></div><p className="doc-cell__label">2px, offset 2 · buttons, links, nav items</p></div>
          <div className="doc-cell"><div className="doc-cell__stage"><TextInput className="is-focus-visible" aria-label="Tight" defaultValue="focus-ring-field" /></div><p className="doc-cell__label">1px, offset 0 · fields, tabs, toggles</p></div>
          <div className="doc-cell"><div className="doc-cell__stage"><div className="doc-inset-demo is-focus-visible">focus-ring-inset</div></div><p className="doc-cell__label">offset −2 · clipped items</p></div>
          <div className="doc-cell"><div className="doc-cell__stage"><span className="ds-heat-cell is-focus-visible doc-heat-demo">3.42%</span></div><p className="doc-cell__label">on-color · white on data fills</p></div>
        </Grid>
      </DocSection>
      <DocSection id="z" title="Z-index"><SpecTable caption="Z-index" rows={Object.keys(spec.declared).filter(n => n.startsWith('--ds-z-')).map(n => ({ property: spec.tokenDocs[n]?.use || n, token: n }))} /></DocSection>
      <SpecSource num="2.7" />
    </div>
  );
}

/* ── Motion ─────────────────────────────────────────────────────── */
export function MotionPage() {
  const [run, setRun] = useState(false);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const durations = Object.keys(spec.declared).filter(n => n.startsWith('--ds-duration-'));
  const eases = Object.keys(spec.declared).filter(n => n.startsWith('--ds-ease-'));
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Transitions are short and limited to color, background, border, opacity, box-shadow, filter, transform and chart sizes. Overlays appear instantly (a 150ms backdrop fade is optional); the "Live" indicator pulses. <code>prefers-reduced-motion: reduce</code> disables every transition and animation.</p>
      {reduced && <p className="doc-callout-note" role="status">Your system requests reduced motion, so the demos below jump instead of animating — that is the documented behavior.</p>}
      <Button variant="secondary" onClick={() => setRun(r => !r)}>{run ? 'Reset' : 'Play transitions'}</Button>
      <DocSection id="durations" title="Durations (standard easing)">
        <div className="doc-motion">{durations.map(n => (
          <div key={n} className="doc-motion__row"><code>{n}</code><span className="ds-text-small">{spec.declared[n]}</span>
            <span className="doc-motion__track"><span className={`doc-motion__dot${run ? ' is-run' : ''}`} style={{ transitionDuration: `var(${n})`, transitionTimingFunction: 'var(--ds-ease-standard)' }} /></span></div>
        ))}</div>
      </DocSection>
      <DocSection id="easing" title="Easing (300ms)">
        <div className="doc-motion">{eases.map(n => (
          <div key={n} className="doc-motion__row"><code>{n}</code><span className="ds-text-small">{spec.declared[n]}</span>
            <span className="doc-motion__track"><span className={`doc-motion__dot${run ? ' is-run' : ''}`} style={{ transitionDuration: 'var(--ds-duration-slow)', transitionTimingFunction: `var(${n})` }} /></span></div>
        ))}</div>
      </DocSection>
      <SpecSource num="2.9" />
    </div>
  );
}

/* ── Iconography & assets ───────────────────────────────────────── */
/** §2.11-B fallback column (Lucide names) → Lucide components. */
const LUCIDE: Record<string, LucideIcon> = { video: Video, factory: Factory, 'badge-check': BadgeCheck, server: Server, cctv: Cctv, workflow: Workflow, 'bar-chart-3': BarChart3, package: Package, users: Users, history: History, 'scan-search': ScanSearch, percent: Percent };
/** §2.11-E usage table, drawn with the Figma glyphs: label, glyphs, render size, color token, spec box. */
const OUTLINE: [string, LucideIcon[], number, string, string][] = [
  ['Row actions (copy, edit, delete)', [FI.Copy, FI.Edit, FI.Trash], 24, '--ds-color-icon', '24 inside a 32px button · icon → text-primary on hover'],
  ['Select chevron', [FI.ChevronSelect], 18, '--ds-color-icon-chevron', '18 · stroke 1.35 · icon-chevron'],
  ['Disclosure chevron', [FI.ChevronDisclosure], 32, '--ds-color-icon-chevron', '32 · stroke 2 · flips when open'],
  ['Close (×)', [FI.Close], 10, '--ds-color-text-muted', '10 · text-muted'],
  ['Back arrow (leading)', [FI.ArrowBack], 20, '--ds-color-text-primary', '20 · currentColor'],
  ['Plus in primary button', [FI.Plus], 14, '--ds-color-text-on-brand', '14 · stroke 1.47 · white'],
  ['Plus in subtle button / link', [FI.PlusLarge, FI.Plus], 16, '--ds-color-link', '16 / 14 · stroke 1.47 · currentColor'],
  ['Search', [FI.Search], 12, '--ds-color-text-muted', '18 box · text-muted'],
  ['Upload', [FI.Upload], 32, '--ds-color-text-muted', '32 · text-muted'],
  ['Camera-tile glyphs (camera, tag, package, QR)', [FI.Camera, FI.Tag, FI.Package, FI.QrCode], 16, '--ds-color-link', '14–16 · stroke 1.2–1.33 · link'],
  ['Location, video (entity card)', [FI.MapPin, FI.Video], 14, '--ds-color-icon', '14 · stroke 1.17 · icon'],
  ['Expand (camera tile)', [FI.Expand], 16, '--ds-color-icon', '16 · stroke 1.33 · icon'],
  ['Logout', [FI.Logout], 20, '--ds-color-danger', '20 · filled · danger'],
];
const HEALTH_GAP = [['Production Line', Workflow, 'Workflow'], ['Cameras', Cctv, 'Cctv'], ['Devices', Cpu, 'Cpu']] as const;

export function IconographyPage() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Two families with separate roles, never mixed: glossy navy → royal-blue 3D illustrations for identity (navigation, page and panel titles, KPIs, entity icons), and thin outline icons in slate for actions and controls. Illustrations come only from the registry; never generate, trace or imitate them in code — until a commissioned asset exists, use the icon-tile fallback.</p>
      <DocSection id="registry" title="Illustration registry (§2.11-B)" description={<>Rendered with <code>&lt;Illustration name="illus.…" /&gt;</code> from <code>public/assets/</code>. Sprites show every frame. Decorative (<code>alt=""</code>) when a text label is adjacent.</>}>
        <div className="doc-assets">{spec.registry.map(a => (
          <div key={a.name} className="doc-asset">
            <div className="doc-asset__pair">{a.frames
              ? Array.from({ length: a.frames }, (_, i) => <Illustration key={i} name={a.name} frames={a.frames} frame={i} size={48} />)
              : <Illustration name={a.name} size={56} />}</div>
            <code>{a.name}</code>
            <span className="ds-text-small">{a.file} · {a.master}{a.frames ? ` · sprite, ${a.frames} frames` : ''} · display {a.display}</span>
            <span className="doc-swatch__use">{a.purpose}</span>
            <div className="ds-cluster">{a.fallback.split(/,\s*/).filter(f => LUCIDE[f]).map(f => <IconTile key={f} icon={LUCIDE[f]} size={28} />)}<span className="ds-text-small">fallback: {a.fallback}</span></div>
          </div>
        ))}</div>
      </DocSection>
      <DocSection id="crops" title="Crops used by the screens" description={<>A crop reproduces a Figma image-fill transform exactly: the image sits in an <code>overflow: hidden</code> box at width W, height H, offset L, T (percentages of the box). Shown at 52, 36 and 24px.</>}>
        <div className="doc-assets">{spec.crops.map(c => (
          <div key={c.id} className="doc-asset">
            <div className="doc-asset__pair">{[52, 36, 24].map(s => <Illustration key={s} name={`illus.${c.asset}`} crop={c.id} size={s} />)}</div>
            <code>crop="{c.id}"</code>
            <span className="ds-text-small">illus.{c.asset} · W {c.w} · H {c.h} · L {c.l} · T {c.t}</span>
            <span className="doc-swatch__use">{c.where}</span>
          </div>
        ))}</div>
        <CodeBlock title="React (this project)" code={`import { Illustration } from './components/ds/Display';\n\n<Illustration name="illus.camera" size={36} />\n<Illustration name="illus.facility-set" crop="factory" size={52} />\n<Illustration name="illus.facility-set" frames={4} frame={3} size={40} />`} />
      </DocSection>
      <DocSection id="fallback" title="Icon-tile fallback (§2.11-D)" description="brand-tint-10 fill, 1px brand-tint-20 border, link-colored outline glyph: 40px, 28px (camera-tile header) or the 20px health tile. Status variants use the matching tints. No emoji, no flat circles.">
        <div className="ds-cluster"><IconTile icon={Package} /><IconTile icon={Video} size={28} /><HealthTile icon={Cctv} /><IconTile icon={CheckCircle2} tone="success" /><IconTile icon={AlertTriangle} tone="warning" /><IconTile icon={AlertCircle} tone="error" /></div>
      </DocSection>
      <DocSection id="figma-icons" title={`Figma functional icons (${FI.FIGMA_ICONS.length})`} description={<>Exact Figma path data with baked colors replaced by <code>currentColor</code>, generated into <code>src/components/ds/figmaIcons.ts</code> by <code>scripts/build-figma-icons.mjs</code>. Typed as <code>LucideIcon</code>, so <code>Icon</code>, button leading/trailing slots and <code>IconButton</code> accept them.</>}>
        <div className="doc-icons">{FI.FIGMA_ICONS.map(i => (
          <div key={i.name} className="doc-icon"><span className="doc-icon__glyph"><Icon icon={FI[i.name]} size={Math.max(i.w, i.h)} /></span><b className="ds-text-body-strong">{i.name}</b><span className="ds-text-small">{i.w} × {i.h} · {i.layer}</span></div>
        ))}</div>
      </DocSection>
      <DocSection id="outline" title="Outline UI icon usage (§2.11-E)" description="Decorative (aria-hidden); the accessible name is on the control. Meaningful icons reach 3:1.">
        <div className="doc-icons">{OUTLINE.map(([l, gs, s, c, d]) => (
          <div key={l} className="doc-icon"><span className="doc-icon__glyph">{gs.map((G, i) => <Icon key={i} icon={G} size={s} color={`var(${c})`} />)}</span><b className="ds-text-body-strong">{l}</b><span className="ds-text-small">{d}</span></div>
        ))}</div>
      </DocSection>
      <DocSection id="gap" title="Known gap: System Health glyphs" description="The three System Health icons could not be exported from Figma (one export returned 404, two were empty groups). Lucide outline icons stand in at the same size inside the 20px health tile until the assets exist (§15.2).">
        <div className="doc-icons">{HEALTH_GAP.map(([l, G, n]) => (
          <div key={l} className="doc-icon"><span className="doc-icon__glyph"><HealthTile icon={G} /></span><b className="ds-text-body-strong">{l}</b><span className="ds-text-small">Lucide {n} · fallback</span></div>
        ))}</div>
      </DocSection>
      <SpecSource num="2.11" />
    </div>
  );
}

/* ── Density ────────────────────────────────────────────────────── */
/** Tokens redefined by the §2.13 compact block, read from the spec. */
const COMPACT = [...(section('2.13')?.body ?? '').matchAll(/(--ds-[a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()] as const);
const USER_COLS: Column<User>[] = [
  { key: 'name', header: 'Name', render: u => u.name },
  { key: 'role', header: 'Role', render: u => <Tag color={ROLE_COLOR[u.role]}>{u.role}</Tag> },
  { key: 'factory', header: 'Factory', render: u => u.factory },
  { key: 'status', header: 'Status', render: u => <Status tone={u.status.tone}>{u.status.label}</Status> },
];
export function DensityPage() {
  const density = useDensity();
  const set = (d: string) => { if (d === 'compact') document.documentElement.dataset.density = 'compact'; else delete document.documentElement.dataset.density; try { localStorage.setItem('ds-density', d); } catch { /* ignore */ } };
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">The default density is the one in the eight screens. <b>Compact</b> is derived mechanically for data-heavy back-office pages: control sizes shrink by 4px, table rows step down (72 → 56, header 56 → 44), card padding steps down one spacing step. Type, colors, radii, shadows and icon sizes never change, and no new values are introduced. Set <code>data-density="compact"</code> on &lt;html&gt; or a region; never mix densities inside one card. The switch here sets it on &lt;html&gt;, so every page of the showcase follows it.</p>
      <div className="ds-cluster"><span className="ds-field__label" id="dens">Density</span>
        <Select variant="filter" labelId="dens" value={density === 'compact' ? 'compact' : 'dense'} onChange={set} options={[{ value: 'dense', label: 'Default (the screens)' }, { value: 'compact', label: 'Compact' }]} className="ds-select--200" /></div>
      <DocSection id="live" title="Live preview">
        <Preview>
          <div className="doc-stack doc-full">
            <div className="ds-kpi-row"><KpiCard label="Total Factories" value={FACTORIES.length} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} /><KpiCard label="Active Factories" value={FACTORIES.filter(f => f.status.tone === 'success').length} icon={<Illustration name="illus.facility-set" crop="factory-active" size={52} />} /></div>
            <div className="ds-cluster"><Button leading={FI.Plus}>Add factory</Button><Button variant="secondary" size="sm">Export</Button><TextInput aria-label="Factory name" placeholder="Enter factory name" /></div>
            <section className="ds-table-card"><DataTable caption="Density demo" rowHeader="name" rowKey={u => u.id} rows={USERS.slice(0, 3)} columns={USER_COLS} /></section>
          </div>
        </Preview>
      </DocSection>
      <DocSection id="tokens" title="Tokens that change" description="Every token redefined by the compact block; the resolved value follows the current mode.">
        <SpecTable caption="Density tokens" rows={COMPACT.map(([n, v]) => ({ property: n.replace('--ds-', ''), token: n, note: ` · compact ${v}` }))} />
      </DocSection>
      <SpecCode num="2.13" />
      <SpecSource num="2.13" />
    </div>
  );
}

/* ── Responsive ─────────────────────────────────────────────────── */
const APPS = [['live-view', 'Live View'], ['factories', 'Factories'], ['add-factory', 'Add New Factory'], ['cameras', 'Cameras'], ['add-cameras', 'Add Cameras'], ['users', 'User Management'], ['analytics', 'Analytics'], ['add-product', 'Add Product']];
export function ResponsivePage() {
  const [w, setW] = useState(window.innerWidth);
  const [frame, setFrame] = useState('390');
  const [app, setApp] = useState('live-view');
  useEffect(() => { const on = () => setW(window.innerWidth); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
  const bp = w < 640 ? 'xs' : w < 1024 ? 'sm' : w < 1280 ? 'md' : w < 1600 ? 'lg' : 'xl';
  const fw = +frame;
  const scale = Math.min(1, 900 / fw);
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">The eight screens are drawn at 1920 × 1021. At ≥ 1024px the sidebar is visible; below 1024 the shell loses its padding and radii, a 56px top bar appears and the sidebar opens as a start-edge drawer. Tables keep their columns and scroll inside their card. Every target is ≥ 24 × 24px; at <code>xs</code> and <code>sm</code> icon buttons grow to 40px hit areas.</p>
      <p className="ds-text-body">Your viewport: <b className="ds-text-body-strong">{w}px</b> → breakpoint <b className="ds-text-body-strong">{bp}</b>.</p>
      <DocSection id="breakpoints" title="Breakpoints"><SpecMd nums={['8.1']} heading={false} /></DocSection>
      <DocSection id="frames" title="The eight screens at real widths" description="Each frame loads an application example in an iframe at the chosen width, so its media queries respond exactly as on a device. Widths are the §13 QA widths plus the 1920 design width.">
        <div className="ds-cluster">
          <Select variant="filter" label="Width" value={frame} onChange={setFrame} options={['390', '768', '1024', '1440', '1680', '1920'].map(v => ({ value: v, label: `${v}px` }))} className="ds-select--160" />
          <Select variant="filter" label="Screen" value={app} onChange={setApp} options={APPS.map(([v, l]) => ({ value: v, label: l }))} className="ds-select--220" />
        </div>
        <div className="doc-device" style={{ width: fw * scale, height: 720 * scale }}>
          <iframe title={`${app} at ${fw}px`} src={`${window.location.pathname}#/apps/${app}?frame=1`} style={{ width: fw, height: 720, transform: `scale(${scale})` }} />
        </div>
      </DocSection>
      <SpecSource num="8" title="All responsive rules" />
      <SpecSource num="8.9" title="Internationalization & RTL" />
    </div>
  );
}

/* ── Gradients & effects ────────────────────────────────────────── */
const EFFECT_TOKENS = ['--ds-color-glow-brand', '--ds-color-glow-success', '--ds-blur-ambient', '--ds-color-scrim', '--ds-overlay-blur'];
const GLOW_SHADOWS = ['--ds-shadow-status-success', '--ds-shadow-status-warning', '--ds-shadow-status-error', '--ds-shadow-button-primary', '--ds-shadow-stepper-active', '--ds-shadow-avatar-orb'];
export function EffectsPage() {
  const grads = Object.keys(spec.declared).filter(n => n.startsWith('--ds-gradient-'));
  const use = (n: string) => spec.tokenDocs[n]?.use || `Declared in §3 (${spec.declaredGroup[n] ?? 'token file'}); no §2.2 row`;
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">The glass language. The viewport is a horizontal navy gradient with two soft ambient glows; containers are translucent white gradients with a hairline white border (one colour, <code>border-edge</code>) and a soft black shadow; wells inside cards are a faint blue tint; overlays are the only opaque surfaces. Blue is the only hue carried by a gradient (primary button, current nav item). Every gradient, glow and blur has a fixed list of places it may appear — nothing else glows, and no structural surface uses <code>backdrop-filter</code>.</p>
      <DocSection id="gradients" title={`Gradient tokens (${grads.length})`} description="Each token painted over the app gradient, as it sits in the product. Click to copy.">
        <div className="doc-gradients">{grads.map(n => (
          <button type="button" key={n} className="doc-gradient" onClick={() => copyText(`var(${n})`, 'Token copied')}>
            <span className="doc-gradient__chip"><span style={{ background: `var(${n})` }} /></span>
            <code>{n}</code><code className="doc-shadow__value">{spec.declared[n]}</code>
            <span className="doc-swatch__use">{use(n)}</span>
          </button>
        ))}</div>
      </DocSection>
      <DocSection id="where" title="Where gradients belong"><SpecMd nums={['Gradients and where they belong']} heading={false} /></DocSection>
      <DocSection id="glass" title="The glass stack" description="Page → shell panel → card → well, each one step lighter. None of these layers blurs what is behind it.">
        <Preview><div className="doc-concentric"><div className="doc-concentric__panel"><span className="ds-text-small">Shell · gradient-glass-strong · shadow-shell + shadow-edge</span>
          <div className="doc-concentric__card"><span className="ds-text-small">Card · gradient-glass · shadow-surface (shadow-glass + shadow-edge)</span>
            <div className="doc-concentric__well"><span className="ds-text-small">Well · surface-nested</span><Button leading={FI.Plus}>Primary action</Button></div></div></div></div></Preview>
      </DocSection>
      <DocSection id="glow" title="Glow">
        <SpecMd nums={['Glow rules']} heading={false} />
        <Grid min={240}>
          <Cell label="Status halos · shadow-status-*"><div className="ds-cluster"><Dot tone="success" label="Healthy" /><Dot tone="warning" label="Warning" /><Dot tone="error" label="Stopped" /></div></Cell>
          <Cell label="Primary button · gradient-button-primary + shadow-button-primary"><Button trailing={FI.ChevronRight}>Next: Configuration</Button></Cell>
          <Cell label="Current nav item · gradient-nav-active + shadow-card"><span className="ds-nav__item doc-nav-demo" aria-current="true"><span className="ds-nav__icon"><Illustration name="illus.facility-set" crop="factory" size={24} /></span><span className="ds-nav__text">Factories</span></span></Cell>
          <Cell label="Ambient glows · glow-brand, glow-success, blur-ambient"><div className="doc-ambient" /></Cell>
        </Grid>
        <SpecTable caption="Glow shadows" rows={GLOW_SHADOWS.map(n => ({ property: use(n), token: n }))} />
      </DocSection>
      <DocSection id="blur" title="Blur" description="backdrop-filter appears only on the overlay scrim (R-09, D-5).">
        <SpecMd nums={['Blur rules']} heading={false} />
        <Preview><div className="doc-scrim-demo">
          <div className="ds-kpi-row"><KpiCard label="Total Factories" value={FACTORIES.length} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} /><KpiCard label="Total Lines" value={FACTORIES.reduce((s, f) => s + f.linesOf, 0)} icon={<Illustration name="illus.conveyor-line" crop="conveyor" size={52} />} /></div>
          <div className="doc-scrim-demo__layer" aria-hidden="true"><span className="ds-text-body-strong">scrim + overlay-blur</span></div>
        </div></Preview>
        <SpecTable caption="Effect tokens" rows={EFFECT_TOKENS.map(n => ({ property: use(n), token: n }))} />
        <CodeBlock lang="css" title="Do / don't" code={`/* Do: blur only the overlay backdrop (§5 overlay blueprint) */\n.ds-overlay__backdrop { background: var(--ds-color-scrim); backdrop-filter: blur(var(--ds-overlay-blur)); }\n\n/* Do: ambient glows blur themselves, not what is behind them */\n.ds-shell::before { background: var(--ds-color-glow-brand); filter: blur(var(--ds-blur-ambient)); }\n\n/* Don't: blur structural glass (sidebar, panels, cards, fields) — R-09 */\n.my-card { backdrop-filter: blur(16px); }`} />
      </DocSection>
      <SpecSource num="2.7" />
    </div>
  );
}

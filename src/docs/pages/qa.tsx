import { useEffect, useMemo, useState } from 'react';
import { spec } from '../../lib/spec';
import { href } from '../../lib/router';
import { COMPONENT_DOCS } from '../registry';
import { DocSection } from '../kit';
import { Badge, Status } from '../../components/ds/Display';
import { Button } from '../../components/ds/Button';

interface QaReport {
  generatedAt: string; browser: string; routes: number;
  axe: Record<string, { violations: { id: string; impact: string; nodes: number; help: string }[] }>;
  overflow: Record<string, number[]>; consoleErrors: Record<string, string[]>;
  tokens?: { undefinedRefs: string[]; checkedFiles: number; hexLiterals: string[] };
  interactions?: { generatedAt: string; results: { name: string; ok: boolean; detail: string }[] };
}

/** Manual findings: places where DESIGN_SYSTEM.md is internally inconsistent or incomplete, or where this implementation deviates from it. */
const FINDINGS: { id: string; where: string; finding: string; showcase: string }[] = [
  { id: 'F-1', where: '§7.1 / §7.2 vs src/charts/library/scales.ts, Charts.tsx', finding: '§7.2 defines only chart-cat-1…4, binary, running/stopped, heat and trend. The chart library adds categories 5–8 (#34d399, #fb7185, #93c5fd, #f59e0b), a blue sequential ramp and a white/20 % guide line, and labels them "§7.2 spec literals", but none is in this spec. Category 5 equals chart-running and category 6 equals the form-error red (R-05), breaking §7.1 "never use a status color as a category color".', showcase: 'Literals are allow-listed in check-tokens; the Chart Foundations page labels categories 5–8 as a chart-library extension, not §7.2.' },
  { id: 'F-2', where: '§7.5 Line / area [EXTENSION]', finding: 'Area fills are specified at 16 % opacity; LineChart draws a 12 % → 0 % vertical gradient.', showcase: 'Not changed; the Area chart page states both values.' },
  { id: 'F-3', where: '§7.2 Heat scale, R-25', finding: 'The spec does not say what range the heat scale spans. Heatmap normalises over all visible cells and BubbleMatrix over its non-empty cells, so "colour is a pure function of the value" holds only inside one chart: the same defect % can differ in colour between the heatmap and the matrix on Analytics, and changes with filters.', showcase: 'Documented on the Heatmap and Bubble matrix pages; a fixed domain (e.g. 0–10 %) would need a spec decision.' },
  { id: 'F-4', where: '§7.1 Number formatting', finding: 'The system format is en-GB, with Indian grouping left as a product locale decision. The application examples use en-IN (fmtIN) in tables and rich tooltips while the chart core (fmtInt) formats donut legends and default tooltips in en-GB, so Analytics mixes "1,23,456" and "123,456".', showcase: 'Not changed; Chart Foundations shows both formats.' },
  { id: 'F-5', where: '§6.3, §5.6, §12.6 vs §2.8 --ds-size-search-lg', finding: 'Header search widths are given as 288–350 px (§6.3, §5.6, §12.6), "Figma 349" (§2.8), and the token is 360 px.', showcase: 'Uses the token (360) so the longest placeholder never clips.' },
  { id: 'F-6', where: '§5.46 Body, §5.44 Modal', finding: 'The §5.46 table puts form sections 24 px apart, but .ds-panel__body and .ds-modal use gap: 28px, a value with no §2.4 spacing token (literal in the spec CSS).', showcase: 'Uses the spec CSS as written (28px).' },
  { id: 'F-7', where: '§2.13 Density vs §3 :root', finding: 'The [data-density="compact"] block has the same specificity as :root and precedes it in the document; copied in spec order, :root wins and compact mode never applies. §2.13 also says control sizes shrink by 4 px, but --ds-size-control-sm stays 28px, and "compact" also names the §2.8 compact table variant (rows 48 / header 40) while compact density sets 56 / 44.', showcase: 'scripts/extract-spec.mjs emits the density block after :root; the interaction check verifies the 36px control minimum.' },
];

function contrast(a: string, b: string) {
  const parse = (c: string) => { const ctx = document.createElement('canvas').getContext('2d')!; ctx.fillStyle = c; const h = ctx.fillStyle as string; const m = /^#(..)(..)(..)$/.exec(h); return m ? [1, 2, 3].map(i => parseInt(m[i], 16)) : (h.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number); };
  const L = (rgb: number[]) => { const c = rgb.map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const [x, y] = [L(parse(a)), L(parse(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export function QaPage() {
  const [report, setReport] = useState<QaReport | null | 'none'>(null);
  const [assets, setAssets] = useState<Record<string, boolean>>({});
  const [tokenCheck, setTokenCheck] = useState<{ declared: number; unresolved: string[]; refs: number; undefinedRefs: string[] } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}qa-report.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : 'none')).then(setReport).catch(() => setReport('none'));
    spec.registry.forEach(a => { const img = new Image(); img.onload = () => setAssets(s => ({ ...s, [a.file]: true })); img.onerror = () => setAssets(s => ({ ...s, [a.file]: false })); img.src = `${import.meta.env.BASE_URL}assets/${a.file}`; });
  }, []);

  const runTokens = () => {
    const root = getComputedStyle(document.documentElement);
    const declared = Object.keys(spec.declared);
    const unresolved = declared.filter(n => !root.getPropertyValue(n).trim());
    const refs = new Set<string>();
    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRuleList; try { rules = sheet.cssRules; } catch { continue; }
      const walk = (list: CSSRuleList) => { for (const r of [...list]) { if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules); (r.cssText.match(/var\((--ds-[a-z0-9-]+)/g) ?? []).forEach(m => refs.add(m.slice(4))); } };
      walk(rules);
    }
    document.querySelectorAll<HTMLElement>('[style*="--ds-"]').forEach(el => (el.getAttribute('style')!.match(/var\((--ds-[a-z0-9-]+)/g) ?? []).forEach(m => refs.add(m.slice(4))));
    const knobs = ['--ds-table-max-height', '--ds-table-min-width', '--ds-cell-max'];
    setTokenCheck({ declared: declared.length, unresolved, refs: refs.size, undefinedRefs: [...refs].filter(r => !knobs.includes(r) && !root.getPropertyValue(r).trim()) });
  };
  useEffect(runTokens, []);

  const sections5 = spec.sections.filter(s => s.level === 3 && /^5\.\d+$/.test(s.num ?? '') && +(s.num!.split('.')[1]) <= 51);
  const covered = new Set(COMPONENT_DOCS.flatMap(d => d.refs));
  const pairs: [string, string, string, number][] = useMemo(() => {
    const r = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return ([
      ['text-primary on surface-base', '--ds-color-text-primary', '--ds-color-surface-base', 4.5], ['text-secondary on surface-base', '--ds-color-text-secondary', '--ds-color-surface-base', 4.5],
      ['text-muted on surface-raised', '--ds-color-text-muted', '--ds-color-surface-raised', 4.5], ['text-tertiary on icon-tile (lightest solid)', '--ds-color-text-tertiary', '--ds-color-surface-icon-tile', 4.5],
      ['link on surface-base', '--ds-color-link', '--ds-color-surface-base', 4.5], ['white on brand-strong', '--ds-color-text-on-brand', '--ds-color-brand-strong', 4.5],
      ['error-text on surface-base', '--ds-color-error-text', '--ds-color-surface-base', 4.5], ['danger-text on surface-base', '--ds-color-danger-text', '--ds-color-surface-base', 4.5],
      ['boundary-mode border vs surface-base (opt-in)', '--ds-color-border-control-strong', '--ds-color-surface-base', 3], ['focus ring vs surface-base', '--ds-color-focus-ring', '--ds-color-surface-base', 3],
      ['white on tag-green (R-06)', '--ds-color-text-primary', '--ds-tag-green', 4.5], ['white on tag-amber (R-06)', '--ds-color-text-primary', '--ds-tag-amber', 4.5],
    ] as const).map(([l, f, b, min]) => [l, r(f), r(b), +contrast(r(f), r(b)).toFixed(2) >= min ? contrast(r(f), r(b)) : -contrast(r(f), r(b))] as [string, string, string, number]);
  }, []);

  const rep = report && report !== 'none' ? report : null;
  const axeFor = (path: string) => rep?.axe?.[path];

  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Every status below reflects what this project actually renders or measured. Coverage comes from the fields each component page provides; accessibility results come from the last automated browser run (<code>npm run check:browser</code>); token, asset and contrast checks run live in your browser now.</p>

      <DocSection id="coverage" title="Component coverage matrix" description={`${COMPONENT_DOCS.length} component pages covering ${[...covered].filter(r => /^5\.\d+$/.test(r)).length} of ${sections5.length} §5 component sections.`}>
        <div className="ds-table-region doc-table" role="region" aria-label="Coverage matrix" tabIndex={0}>
          <table className="ds-table qa-matrix">
            <caption className="ds-sr-only">Component coverage</caption>
            <thead><tr><th scope="col">Component</th><th scope="col">Specification</th><th scope="col">Live preview</th><th scope="col">Variants</th><th scope="col">States</th><th scope="col">Anatomy</th><th scope="col">Playground</th><th scope="col">QA (axe)</th></tr></thead>
            <tbody>{COMPONENT_DOCS.map(d => {
              const ax = axeFor(d.path);
              const specOk = d.refs.every(r => spec.sections.some(s => s.num === r));
              return (
                <tr key={d.path}>
                  <th scope="row"><a className="ds-row-link" href={href(d.path)}>{d.title}</a><span className="ds-text-small doc-block">§{d.refs.join(' · §')}{d.derivedCss ? ' · derived CSS' : ''}</span></th>
                  <td><Mark ok={specOk} /></td><td><Mark ok /></td>
                  <td>{d.variants ? <Mark ok /> : d.noVariants ? <NA why={`None in spec: ${d.noVariants}`} /> : <Mark na />}</td><td>{d.states ? <Mark ok /> : d.staticComponent ? <NA why={`Static: ${d.staticComponent}`} /> : <Mark na />}</td>
                  <td>{d.anatomy ? <Mark ok /> : <Mark na />}</td><td>{d.playground ? <Mark ok /> : <Mark na />}</td>
                  <td>{!rep ? <Badge tone="neutral" size="sm">Not run</Badge> : !ax ? <Badge tone="neutral" size="sm">No data</Badge> : ax.violations.length ? <Badge tone="error" size="sm">{`${ax.violations.length} issue${ax.violations.length > 1 ? 's' : ''}`}</Badge> : <Badge tone="success" size="sm">0 violations</Badge>}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        <p className="ds-text-small">"n/a" means the area does not apply: the component is static per §5.54, or the spec defines no variants for it (the reason is shown). "—" would mean not implemented. Variants a reader might expect but the spec does not define are listed as unsupported on each page rather than invented.</p>
      </DocSection>

      <DocSection id="spec-coverage" title="§5 sections without a dedicated page">
        {sections5.filter(s => !covered.has(s.num!)).length === 0
          ? <Status tone="success">Every §5.1–5.51 component section has a page.</Status>
          : <ul className="doc-list">{sections5.filter(s => !covered.has(s.num!)).map(s => <li key={s.num}>§{s.title}</li>)}</ul>}
      </DocSection>

      <DocSection id="tokens" title="Live token check" description="Every declared token must resolve in the browser, and every var(--ds-*) used by the loaded stylesheets and inline styles must be declared.">
        {tokenCheck && (
          <ul className="doc-list">
            <li><Mark ok={!tokenCheck.unresolved.length} /> {tokenCheck.declared} tokens declared in §3; {tokenCheck.unresolved.length} unresolved {tokenCheck.unresolved.length ? `(${tokenCheck.unresolved.join(', ')})` : ''}</li>
            <li><Mark ok={!tokenCheck.undefinedRefs.length} /> {tokenCheck.refs} distinct var(--ds-*) references in loaded CSS; {tokenCheck.undefinedRefs.length} undefined {tokenCheck.undefinedRefs.length ? `(${tokenCheck.undefinedRefs.join(', ')})` : ''}</li>
            {rep?.tokens && <li><Mark ok={!rep.tokens.undefinedRefs.length && !rep.tokens.hexLiterals.length} /> Static scan of {rep.tokens.checkedFiles} source files: {rep.tokens.undefinedRefs.length} undefined refs, {rep.tokens.hexLiterals.length} hex literals outside allowed files</li>}
          </ul>
        )}
        <Button variant="secondary" size="sm" onClick={runTokens}>Re-run token check</Button>
      </DocSection>

      <DocSection id="contrast" title="Live contrast spot-check" description="Computed from the resolved token values with the WCAG formula.">
        <div className="ds-table-region doc-table" role="region" aria-label="Contrast" tabIndex={0}>
          <table className="ds-table"><caption className="ds-sr-only">Contrast pairs</caption>
            <thead><tr><th scope="col">Pair</th><th scope="col">Foreground</th><th scope="col">Background</th><th scope="col" className="ds-num">Ratio</th></tr></thead>
            <tbody>{pairs.map(([l, f, b, r]) => <tr key={l}><th scope="row">{l}</th><td><span className="doc-swatch-inline" style={{ background: f }} />{f}</td><td><span className="doc-swatch-inline" style={{ background: b }} />{b}</td><td className="ds-num"><span className={r > 0 ? 'ds-c-success' : 'ds-c-error'}>{Math.abs(r).toFixed(2)}:1 {r > 0 ? 'pass' : 'FAIL'}</span></td></tr>)}</tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="assets" title="Asset check (§2.11 registry)">
        <ul className="doc-assetcheck">{spec.registry.map(a => <li key={a.name}>{assets[a.file] === undefined ? <Badge tone="neutral" size="sm">checking</Badge> : assets[a.file] ? <Badge tone="success" size="sm">loaded</Badge> : <Badge tone="error" size="sm">missing → fallback</Badge>}<code>{a.name}</code><span className="ds-text-small">{a.file}</span></li>)}</ul>
      </DocSection>

      <DocSection id="automated" title="Automated browser run" description="axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on every route, horizontal-overflow detection at 390px and 1440px, and console errors. Produced by scripts/check-browser.mjs against the production build.">
        {report === null ? <p className="ds-text-body-muted">Loading…</p> : report === 'none' || !report.axe ? <p className="ds-text-body-muted">No report found. Run <code>npm run qa</code> to generate public/qa-report.json.</p> : (
          <>
            <p className="ds-text-body">Run {new Date(report.generatedAt).toLocaleString('en-GB')} · {report.browser} · {report.routes} routes.</p>
            <div className="ds-table-region doc-table" role="region" aria-label="Automated results" tabIndex={0}>
              <table className="ds-table"><caption className="ds-sr-only">Automated results per route</caption>
                <thead><tr><th scope="col">Route</th><th scope="col" className="ds-num">axe violations</th><th scope="col">Rules</th><th scope="col">Overflow (px at 390 / 768 / 1024 / 1440 / 1680)</th><th scope="col" className="ds-num">Console errors</th></tr></thead>
                <tbody>{Object.keys(report.axe).map(p => {
                  const v = report.axe[p].violations; const o = report.overflow[p] ?? []; const c = report.consoleErrors[p] ?? [];
                  return <tr key={p}><th scope="row"><a className="ds-row-link" href={href(p)}>{p}</a></th><td className="ds-num"><span className={v.length ? 'ds-c-error' : 'ds-c-success'}>{v.length}</span></td>
                    <td className="doc-usage">{v.map(x => `${x.id} (${x.impact}, ${x.nodes})`).join(', ') || '—'}</td><td>{o.map(n => (n > 0 ? `+${n}` : '0')).join(' / ') || '—'}</td><td className="ds-num">{c.length}</td></tr>;
                })}</tbody>
              </table>
            </div>
          </>
        )}
      </DocSection>

      <DocSection id="interactions" title="Scripted interaction checks" description="scripts/check-interactions.mjs drives the production build with a real browser to verify the §5.55 behavior contracts: keyboard, focus movement and restoration, inertness, validation, timing, density and RTL.">
        {!rep?.interactions ? <p className="ds-text-body-muted">Not run. Use <code>npm run qa</code>.</p> : (
          <>
            <p className="ds-text-body">{rep.interactions.results.filter(r => r.ok).length} of {rep.interactions.results.length} passed · {new Date(rep.interactions.generatedAt).toLocaleString('en-GB')}</p>
            <ul className="doc-assetcheck">{rep.interactions.results.map(r => <li key={r.name}><Mark ok={r.ok} /><span className="ds-text-body">{r.name}</span></li>)}</ul>
          </>
        )}
      </DocSection>

      <DocSection id="findings" title="Specification findings" description="Inconsistencies or gaps in DESIGN_SYSTEM.md, and places where this implementation deviates from it, verified against the spec and the source. The showcase does not change the spec; it records how each one is handled.">
        <div className="ds-table-region doc-table" role="region" aria-label="Findings" tabIndex={0}>
          <table className="ds-table"><caption className="ds-sr-only">Specification findings</caption>
            <thead><tr><th scope="col" className="ds-col-shrink">ID</th><th scope="col">Where</th><th scope="col">Finding</th><th scope="col">Showcase resolution</th></tr></thead>
            <tbody>{FINDINGS.map(f => <tr key={f.id}><th scope="row" className="ds-col-shrink">{f.id}</th><td>{f.where}</td><td className="doc-usage">{f.finding}</td><td className="doc-usage">{f.showcase}</td></tr>)}</tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="decisions" title="Open design decisions (§15.1)" description="Rendered as specified; awaiting designer approval.">
        <ul className="doc-list">{spec.decisions.map(d => <li key={d.id}><b>{d.id}</b> {d.decision} — <span className="ds-muted">{d.recommendation}</span></li>)}</ul>
      </DocSection>
    </div>
  );
}

function NA({ why }: { why: string }) {
  return <span className="qa-na">n/a<span className="doc-note">{why.length > 70 ? why.slice(0, 67) + '…' : why}</span></span>;
}

function Mark({ ok, na }: { ok?: boolean; na?: boolean }) {
  if (na) return <span className="qa-na" aria-label="Not provided">—</span>;
  return ok ? <span className="qa-ok"><span className="ds-dot ds-dot--sm ds-dot--success" aria-hidden="true" />Yes</span> : <span className="qa-bad"><span className="ds-dot ds-dot--sm ds-dot--error" aria-hidden="true" />No</span>;
}

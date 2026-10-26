import { useMemo } from 'react';
import { marked } from 'marked';
import { section, spec } from '../../lib/spec';
import { CodeBlock, DocSection, wrapTables } from '../kit';
import { href } from '../../lib/router';

/** Renders spec sections verbatim (markdown → HTML) so the guidance stays identical to DESIGN_SYSTEM.md. */
export function SpecMd({ nums, heading = true }: { nums: string[]; heading?: boolean }) {
  const html = useMemo(() => nums.map(n => {
    const s = section(n);
    return s ? (heading ? `<h2>${s.num ? '§' : ''}${s.title}</h2>` : '') + wrapTables(marked.parse(s.body.replace(/```(html|css)\n[\s\S]*?```/g, ''), { async: false }) as string) : '';
  }).join(''), [nums, heading]);
  return <div className="doc-md doc-md--open" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function IntroductionPage() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">This is the interactive implementation of <b>DESIGN_SYSTEM.md</b> — the Vision Automation design language of the Unilever DEOC vision-inspection console. Deep navy lit from within, translucent glass cards with hairline white edges, one blue accent, glowing status and glossy 3D illustrations, on a strict type and spacing scale. Every color, size, radius, gradient and shadow on this site comes from the specification's token file; the showcase itself is built with the components it documents.</p>
      <div className="doc-intro-grid">
        {[
          ['Foundations', 'Color, gradients and effects, type, spacing, radii, borders, shadows, motion, illustrations and icons, density and responsive rules.', '/foundations/colors'],
          ['Components', 'Every §5 component with live previews, variants, forced states, anatomy, specs and playgrounds.', '/components/buttons'],
          ['Data visualization', 'Stacked bars with trend, bubble matrix, donut, heatmap and tooltips drawn only with §7 tokens.', '/charts/foundations'],
          ['Layout patterns', 'Shell, page header, KPI rows, entity grids, collapsible sections, tables, dashboards, drawers and modals.', '/layouts/shell'],
          ['Application examples', 'The eight Figma screens rebuilt from the system: Live View, Factories, Add New Factory, Cameras, Add Cameras, User Management, Analytics, Add Product.', '/apps'],
          ['Visual QA', 'Coverage matrix, live token and asset checks, automated accessibility results and spec findings.', '/qa'],
        ].map(([t, d, p]) => (
          <a key={t} className="ds-dash-card doc-intro-card" href={href(p)}><span className="ds-text-card-title">{t}</span><span className="ds-text-body-muted">{d}</span></a>
        ))}
      </div>
      <DocSection id="source" title="Source of truth">
        <p className="ds-text-body">The specification lives in <code>spec/DESIGN_SYSTEM.md</code> ({spec.lineCount.toLocaleString('en-GB')} lines). It was reconstructed from eight Figma frames that had no published styles, variables or component library. <code>scripts/extract-spec.mjs</code> (<code>npm run spec</code>) copies its token file, base CSS and component blueprints, in document order, into <code>src/generated/ds.css</code>, plus the token, text-style, illustration-registry, crop and section data the pages render. Change the spec, re-run, and the showcase follows; nothing may restyle a component outside the spec.</p>
      </DocSection>
      <DocSection id="hybrid" title="Structure from the previous system, visuals from Figma">
        <p className="ds-text-body">Type scale, 4px spacing grid, control heights, component anatomy, behavior and accessibility are carried over from the previous DEOC system; surfaces, color, depth, status and charts come from the Figma screens. Where they conflict, the hybrid rule (D-0) decides: old scales and token names are kept, Figma values are adopted where they already sit on an existing scale, off-scale values are normalized to the nearest step (§11), and every change is logged in <code>DESIGN_SYSTEM_DIFF.md</code>.</p>
      </DocSection>
      <SpecMd nums={['0.1', '0.2', '0.4', '0.6']} />
    </div>
  );
}

export function PrinciplesPage() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">The ten principles that define the identity of the system. When a case is not covered by a token or a component, decide it by these — and by the decision hierarchy on the Rules page.</p>
      <SpecMd nums={['1']} />
    </div>
  );
}

export function HowToUsePage() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">To build a screen in this language you need these things from the specification, in this order. The showcase project is a working example of each step.</p>
      <DocSection id="steps" title="Adopting the system">
        <ol className="doc-list doc-list--num">
          <li><b>Tokens.</b> Copy the §3 <code>:root</code> block into your global stylesheet (or use <code>src/generated/ds.css</code>). Every color, gradient, shadow, radius, spacing, size and type value in components must come from it.</li>
          <li><b>Base CSS.</b> Copy §4: box-sizing, Inter, the app-gradient background, scrollbars, the single focus-visible rule, boundary mode, reduced motion, RTL icon flipping.</li>
          <li><b>Assets.</b> Use the registered 3D illustrations (§2.11-B) through <code>Illustration</code>, with the documented crops; outline icons come from the Figma glyph set in <code>src/components/ds/figmaIcons.ts</code>. Never draw look-alike illustrations.</li>
          <li><b>Components.</b> Build each component to its §5 spec. The blueprints are HTML + CSS; this project's React versions are in <code>src/components/ds</code>.</li>
          <li><b>Layouts.</b> Compose pages from the §6 patterns; the eight application examples (§12) show each one in context.</li>
          <li><b>Verify.</b> Run the §13 checklist (this project automates it: <code>npm run qa</code>).</li>
        </ol>
      </DocSection>
      <DocSection id="tokens" title="Using tokens in code">
        <CodeBlock lang="css" title="CSS — a glass card" code={`.my-card {\n  padding: var(--ds-space-card-lg);\n  border-radius: var(--ds-radius-card);\n  background: var(--ds-gradient-glass);\n  border: var(--ds-border-width) solid var(--ds-color-border-glass);\n  box-shadow: var(--ds-shadow-glass);\n  color: var(--ds-color-text-secondary);\n}\n.my-card__well {\n  border-radius: var(--ds-radius-track);\n  background: var(--ds-color-surface-nested);\n}`} />
        <CodeBlock title="React (this project)" code={`import { Button } from './components/ds/Button';\nimport { KpiCard } from './components/ds/Cards';\nimport { Illustration } from './components/ds/Display';\nimport { Plus } from './components/ds/figmaIcons';\n\n<KpiCard label="Total Factories" value="6" icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} />\n<Button leading={Plus}>Add factory</Button>`} />
      </DocSection>
      <DocSection id="density" title="Density and contrast modes">
        <CodeBlock lang="html" title="HTML" code={`<html data-density="compact">   <!-- §2.13: derived compact mode; default is the screens' density -->\n<html data-contrast="more">     <!-- §9.3 boundary mode (also automatic under prefers-contrast: more) -->`} />
      </DocSection>
      <SpecMd nums={['0.3', '0.5']} />
    </div>
  );
}

export function RulesPage() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">The mandatory implementation rules, every conflict between the Figma screens and the system with its resolution, and the decisions still awaiting designer approval.</p>
      <SpecMd nums={['10', '11', '15.1', '15.2']} />
    </div>
  );
}

// Adoption check: proves an application uses this design system and nothing else (DESIGN.md §9).
// Usage: node scripts/check-adoption.mjs <app-root> [--verbose]
// Fails when the app's copy of ds.css / text-styles.css differs from this repo, when the app defines its own
// --ds-* tokens, references undeclared tokens, or styles with raw type, colour, radius or shadow values.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const app = process.argv[2] && path.resolve(process.argv[2]);
const verbose = process.argv.includes('--verbose');
if (!app || !fs.existsSync(app)) { console.error('usage: node scripts/check-adoption.mjs <app-root> [--verbose]'); process.exit(2); }
const ds = path.resolve(import.meta.dirname, '..');
const SKIP = new Set(['node_modules', 'dist', 'build', '.git', 'qa-output', 'coverage']);
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (SKIP.has(f)) continue;
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|jsx?|css|html)$/.test(f)) files.push(p);
  }
})(app);
const rel = p => path.relative(app, p).split(path.sep).join('/');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).digest('hex');

// 1. The two stylesheets are copied verbatim, never hand-edited.
const results = [];
for (const name of ['ds.css', 'text-styles.css']) {
  const copies = files.filter(f => path.basename(f) === name);
  const ok = copies.length > 0 && copies.every(c => hash(c) === hash(path.join(ds, 'src/generated', name)));
  results.push({ check: `${name} present and identical to the design system`, fail: ok ? [] : [copies.length ? `${copies.map(rel)} differs (re-copy it)` : 'missing'] });
}
const isDsFile = f => ['ds.css', 'text-styles.css'].includes(path.basename(f));

// 2–7. Source scans (the copied stylesheets are excluded).
const declared = new Set([...fs.readFileSync(path.join(ds, 'src/generated/ds.css'), 'utf8').matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map(m => m[1]));
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const RULES = [
  ['no --ds-* token defined outside ds.css', /(?<![\w-])(--ds-[a-z0-9-]+)\s*:(?!\s*['"])/g, m => !/^--ds-(table-max-height|table-min-width|cell-max|tree-depth)$/.test(m[1])],
  ['every var(--ds-*) is declared', /var\((--ds-[a-z0-9-]+)\)/g, m => !declared.has(m[1])],
  ['no colour literals', /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![-\w])|rgba?\(\s*\d|hsla?\(\s*\d/g, () => true],
  ['no Tailwind type sizes (use .ds-ts-*)', /(?<![\w-])(?:[a-z]+:)*text-(?:2xs|xs|sm|base|lg|xl|[2-9]xl|\[\d[^\]]*\])(?![\w-])/g, () => true],
  ['no Tailwind font weights (use .ds-ts-*)', /(?<![\w-])font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?![\w-])/g, () => true],
  ['no Tailwind palette colours', new RegExp(`(?<![\\w-])(?:[a-z]+:)*(?:bg|text|border|ring|outline|divide|from|via|to|fill|stroke|shadow|placeholder|accent|caret|decoration)-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?(?![\\w-])`, 'g'), () => true],
  // The preset (DESIGN.md §5) names radii after DS tokens (rounded-card, rounded-full…); Tailwind-only sizes are flagged.
  ['no Tailwind radius utilities (use rounded-<ds radius>)', /(?<![\w-])(?:[a-z]+:)*rounded(?:-[trbl]{1,2})?(?:-(?:md|lg|xl|2xl|3xl))?(?![\w-])/g, () => true],
  ['no shadow utilities (components carry their own)', /(?<![\w-])(?:[a-z]+:)*shadow(?:-[a-z0-9]+)*(?![\w-])/g, m => !m[0].endsWith('shadow-none')],
  ['no literal font-size / line-height / letter-spacing', /(?:font-size|line-height|letter-spacing|fontSize|lineHeight|letterSpacing)\s*:\s*['"]?-?\d*\.?\d+(?:px|rem|em)?['"]?/g, m => !/:\s*['"]?-?[01]['"]?$/.test(m[0])],
  // DESIGN.md §10.1: guessed pixel boxes overflow when DS components change size; use the scale, a --ds-size-* token or a component.
  ['no arbitrary px sizes or spacing (w-[66px], ml-[22px]…)', /(?<![\w-])(?:[a-z]+:)*-?(?:w|min-w|max-w|h|min-h|max-h|size|basis|top|left|right|bottom|inset(?:-[xy])?|start|end|gap(?:-[xy])?|space-[xy]|p[xytrblse]?|m[xytrblse]?|translate-[xy])-\[\d*\.?\d+px\](?![\w-])/g, () => true],
];
for (const [check, re, keep] of RULES) {
  const fail = [];
  for (const f of files) {
    if (isDsFile(f)) continue;
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => {
      // Comments are skipped; `ds-allow: <reason>` on a line exempts content data such as third-party brand colours.
      if (/^\s*(\/\/|\*|\/\*|<!--)/.test(l) || /ds-allow:\s*\S/.test(l)) return;
      for (const m of l.matchAll(re)) if (keep(m)) fail.push(`${rel(f)}:${i + 1}: ${m[0]}`);
    });
  }
  results.push({ check, fail });
}

let failed = 0;
for (const r of results) {
  const n = r.fail.length; if (n) failed++;
  console.log(`${n ? 'FAIL' : 'ok  '}  ${r.check}${n ? ` — ${n}` : ''}`);
  if (n) {
    if (verbose) r.fail.forEach(x => console.log('        ' + x));
    else {
      const byFile = {};
      for (const x of r.fail) { const f = x.split(':')[0]; byFile[f] = (byFile[f] || 0) + 1; }
      Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([f, c]) => console.log(`        ${c.toString().padStart(5)}  ${f}`));
    }
  }
}
console.log(failed ? `\n${failed} of ${results.length} checks failed (--verbose lists every hit)` : `\nall ${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;

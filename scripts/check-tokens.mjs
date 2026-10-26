// Static token check: every var(--ds-*) used in src/ must be declared in the spec's :root (or be a documented
// per-instance knob), and color literals may only appear in files that mirror spec-stated values.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const spec = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/spec.json'), 'utf8'));
const declared = new Set(Object.keys(spec.declared));
const KNOBS = new Set(['--ds-table-max-height', '--ds-table-min-width', '--ds-cell-max']);
// Files allowed to contain color literals, and why.
const ALLOW = {
  'src/generated/ds.css': 'verbatim spec CSS',
  'src/charts/core.tsx': 'heat-stop values mirrored from --ds-heat-0…4 for RGB interpolation (§7.2)',
  'src/charts/Charts.tsx': '§7.5 guide line rgba(255,255,255,0.2) (spec literal)',
  'src/charts/library/scales.ts': '§7.2 categorical extension and "Other" swatch (spec literals, no tokens exist)',
  'src/docs/pages/charts.tsx': '§7.2 categorical extension swatches and guide literal (spec literals)',
  'src/styles/showcase.css': '§5.4 split-button divider rgba(255,255,255,0.2) (spec literal)',
};
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(f)) files.push(p); } })(path.join(root, 'src'));
const undefinedRefs = [], hexLiterals = [];
for (const f of files) {
  const rel = path.relative(root, f).split(path.sep).join('/');
  const text = fs.readFileSync(f, 'utf8');
  // Skip names assembled at runtime (`--ds-chart-cat-${i}`, `--ds-size-panel-{size}` in prose); every other reference must be declared.
  for (const m of text.matchAll(/var\((--ds-[a-z0-9-]+)(.?)/g)) if (!declared.has(m[1]) && !KNOBS.has(m[1]) && !(m[1].endsWith('-') && /[$\{]/.test(m[2]))) undefinedRefs.push(`${rel}: ${m[1]}`);
  // Token names quoted as strings (doc spec rows, getPropertyValue) must be declared too, or the docs show stale names.
  if (rel.endsWith('.tsx') || rel.endsWith('.ts')) for (const m of text.matchAll(/(--ds-[a-z0-9-]*[a-z0-9])(.?)/g)) if (!declared.has(m[1]) && !KNOBS.has(m[1]) && !/[-$\{]/.test(m[2]) && !text.slice(m.index - 4, m.index).includes('var(') && text[m.index - 1] !== '^' && !text.slice(m.index - 12, m.index).includes('startsWith(')) undefinedRefs.push(`${rel}: ${m[1]} (named)`);
  if (!(rel in ALLOW)) for (const m of text.matchAll(/#[0-9a-fA-F]{6}\b|rgba?\(\s*\d/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    const ctx = text.split('\n')[line - 1];
    if (/^\s*(\/\/|\*|\/\*)/.test(ctx)) continue;
    // Documentation pages quote spec values in prose (notes, summaries); only styling contexts count there.
    if (rel.startsWith('src/docs/') && !/style=|background:|color:\s*['"]?#/.test(ctx)) continue;
    hexLiterals.push(`${rel}:${line}: ${m[0]}`);
  }
}
const out = { undefinedRefs: [...new Set(undefinedRefs)], hexLiterals, checkedFiles: files.length, allowedLiteralFiles: ALLOW };
console.log(`check-tokens: ${files.length} files · ${out.undefinedRefs.length} undefined var() refs · ${hexLiterals.length} color literals outside allowed files`);
out.undefinedRefs.forEach(r => console.log('  undefined', r));
hexLiterals.forEach(r => console.log('  literal  ', r));
const reportPath = path.join(root, 'public/qa-report.json');
const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {};
report.tokens = out;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 1));
if (fs.existsSync(path.join(root, 'dist'))) fs.writeFileSync(path.join(root, 'dist/qa-report.json'), JSON.stringify(report, null, 1));
process.exitCode = out.undefinedRefs.length || hexLiterals.length ? 1 : 0;

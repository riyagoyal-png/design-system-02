// Embeds src/generated/ds.css and text-styles.css verbatim in DESIGN.md (Appendix A),
// between <!-- BEGIN name --> / <!-- END name --> markers, so the guide never travels
// without the stylesheets. Run after extract-spec.mjs (npm run spec does both).
import fs from 'node:fs';

const doc = 'DESIGN.md';
let s = fs.readFileSync(doc, 'utf8').replace(/\r\n/g, '\n');
for (const name of ['ds.css', 'text-styles.css']) {
  const css = fs.readFileSync(`src/generated/${name}`, 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');
  const re = new RegExp(`<!-- BEGIN ${name.replace('.', '\\.')} -->\\n(?:[\\s\\S]*?\\n)?<!-- END ${name.replace('.', '\\.')} -->`);
  if (!re.test(s)) throw new Error(`DESIGN.md has no ${name} markers`);
  s = s.replace(re, () => `<!-- BEGIN ${name} -->\n\`\`\`\`css\n${css}\n\`\`\`\`\n<!-- END ${name} -->`);
}
fs.writeFileSync(doc, s);
console.log('DESIGN.md: Appendix A refreshed');

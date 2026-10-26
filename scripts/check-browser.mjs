// Real-browser QA against the production build (vite preview):
//  - axe-core (WCAG 2.0 / 2.1 / 2.2 A + AA rule tags) on every route
//  - horizontal page overflow at 390, 768, 1024, 1440 and 1680px
//  - console errors per route
//  - full-page screenshots in qa-output/screenshots
// Uses an installed Chrome or Edge through playwright-core (no browser download).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const PORT = 4177;
const WIDTHS = [390, 768, 1024, 1440, 1680];
const BASE = `http://localhost:${PORT}/`;
const shots = path.join(root, 'qa-output', 'screenshots');
fs.mkdirSync(shots, { recursive: true });

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = candidates.find(p => fs.existsSync(p));
if (!executablePath) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

const server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'pipe' });
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('preview server did not start')), 20000);
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) { clearTimeout(t); res(); } });
});

const browser = await chromium.launch({ executablePath, headless: true });
const axeSource = fs.readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
const report = { generatedAt: new Date().toISOString(), browser: path.basename(executablePath), routes: 0, axe: {}, overflow: {}, consoleErrors: {} };
const existing = path.join(root, 'public/qa-report.json');
if (fs.existsSync(existing)) report.tokens = JSON.parse(fs.readFileSync(existing, 'utf8')).tokens;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); else if (m.text().startsWith('overflow culprit')) console.log('    ' + m.text()); });
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  await page.goto(BASE);
  await page.waitForFunction(() => Array.isArray(window.__DS_ROUTES__));
  const routes = await page.evaluate(() => window.__DS_ROUTES__);
  report.routes = routes.length;
  const only = process.argv[2];

  for (const r of routes) {
    if (only && !r.includes(only)) continue;
    errors = [];
    const slug = r === '/' ? 'home' : r.slice(1).replace(/\//g, '_');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}#${r}`);
    await page.waitForTimeout(700);
    await page.evaluate(src => { if (!window.axe) { const s = document.createElement('script'); s.textContent = src; document.head.appendChild(s); } }, axeSource);
    const res = await page.evaluate(async () => {
      const out = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
      return out.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 3).map(n => n.target.join(' ')) }));
    });
    const overflow = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(250);
      overflow.push(await page.evaluate(() => {
        const doc = document.scrollingElement.scrollWidth - window.innerWidth;
        const c = document.querySelector('.ds-page-content');
        const inner = c ? c.scrollWidth - c.clientWidth : 0;
        const n = Math.max(0, doc, inner);
        // Name the widest element past the right edge so a regression is actionable.
        if (n > 0) {
          const edge = c ? c.getBoundingClientRect().right : window.innerWidth;
          const el = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > edge + 1 && !e.closest('.ds-table-region, [hidden]'))
            .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
          if (el) console.warn(`overflow culprit: ${el.tagName.toLowerCase()}.${String(el.getAttribute('class') || '').replace(/\s+/g, '.')} ${Math.round(el.getBoundingClientRect().width)}px`);
        }
        return n;
      }));
      await page.screenshot({ path: path.join(shots, `${slug}@${w}.png`), fullPage: false });
    }
    report.axe[r] = { violations: res };
    report.overflow[r] = overflow;
    report.consoleErrors[r] = [...new Set(errors)];
    console.log(`${r.padEnd(34)} axe ${String(res.length).padStart(2)}  overflow ${overflow.join('/')}  console ${errors.length}${res.length ? '  ' + res.map(v => `${v.id}(${v.nodes})`).join(' ') : ''}`);
  }
} finally {
  await browser.close();
  server.kill();
}
const json = JSON.stringify(report, null, 1);
fs.writeFileSync(path.join(root, 'public/qa-report.json'), json);
if (fs.existsSync(path.join(root, 'dist'))) fs.writeFileSync(path.join(root, 'dist/qa-report.json'), json);
fs.writeFileSync(path.join(root, 'qa-output/qa-report.json'), json);
const total = Object.values(report.axe).reduce((s, a) => s + a.violations.length, 0);
console.log(`\n${report.routes} routes · ${total} axe violations · ${Object.values(report.overflow).filter(o => o.some(n => n > 0)).length} routes with page overflow · ${Object.values(report.consoleErrors).filter(e => e.length).length} routes with console errors`);

// Visual QA of the eight application examples at the Figma frame size (1920 × 1021) against the production build.
// Writes qa-output/apps/<route>.png (and public/app-shots/<route>.jpg thumbnails); compare them with the Figma screenshots listed in FIGMA_EXTRACTION.md.
// Usage: npm run build && node scripts/shoot-apps.mjs [route…]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const PORT = 4175;
const out = path.join(root, 'qa-output', 'apps');
fs.mkdirSync(out, { recursive: true });
const thumbs = path.join(root, 'public', 'app-shots');
fs.mkdirSync(thumbs, { recursive: true });
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['live-view', 'factories', 'add-factory', 'cameras', 'add-cameras', 'users', 'analytics', 'add-product', 'product-master'];
const exe = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .filter(Boolean).find(p => fs.existsSync(p));
if (!exe) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

const server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'pipe' });
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('preview server did not start')), 20000);
  server.stdout.on('data', d => { if (String(d).includes(String(PORT))) { clearTimeout(t); res(); } });
});
const browser = await chromium.launch({ executablePath: exe, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1021 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  for (const r of ROUTES) {
    await page.goto(`http://localhost:${PORT}/#/apps/${r}?frame=1`);
    await page.waitForTimeout(900);
    const full = r === 'analytics';
    await page.screenshot({ path: path.join(out, `${r}.png`), fullPage: false });
    // Thumbnail for the Application Examples index (public/app-shots, served with the showcase).
    await page.screenshot({ path: path.join(thumbs, `${r}.jpg`), type: 'jpeg', quality: 60, fullPage: false });
    if (full) {
      // Analytics is a 3110px frame: also capture the whole scrolled content.
      const h = await page.evaluate(() => { const m = document.querySelector('#app-main'); return m ? m.scrollHeight + 140 : 3110; });
      await page.setViewportSize({ width: 1920, height: Math.max(1021, h) });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, `${r}-full.png`) });
      await page.setViewportSize({ width: 1920, height: 1021 });
    }
    console.log(`${r}: ${errors.length ? errors.splice(0).join(' | ') : 'ok'}`);
  }
} finally {
  await browser.close();
  server.kill();
}

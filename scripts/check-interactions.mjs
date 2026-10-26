// Scripted interaction checks against the production build: verifies the §5.55 behavior contracts that a static
// accessibility scan cannot (keyboard, focus movement and restoration, inertness, validation, timing).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const PORT = 4178;
const BASE = `http://localhost:${PORT}/#`;
const exe = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].filter(Boolean).find(p => fs.existsSync(p));
const server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'pipe' });
await new Promise(r => server.stdout.on('data', d => String(d).includes(String(PORT)) && r()));
const browser = await chromium.launch({ executablePath: exe });
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
p.on('pageerror', e => pageErrors.push(String(e)));
const shots = path.join(root, 'qa-output', 'screenshots');
fs.mkdirSync(shots, { recursive: true });
const shot = n => p.screenshot({ path: path.join(shots, `interaction_${n}.png`) });
const focused = () => p.evaluate(() => { const a = document.activeElement; return `${a.tagName.toLowerCase()} "${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40)}"`; });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const go = async r => { await p.goto(BASE + r); await p.waitForTimeout(600); };

try {
  // Select / listbox (§5.10) — the first non-searchable select in the preview (searchable ones move focus into their search box)
  await go('/components/dropdowns');
  let trig = null;
  for (const c of await p.locator('.doc-preview [role="combobox"]').all()) {
    await c.focus(); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150);
    if (await c.evaluate(e => e === document.activeElement)) { trig = c; break; }
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  }
  check('Select opens with ArrowDown and sets aria-activedescendant', trig && (await trig.getAttribute('aria-expanded')) === 'true' && !!(await trig.getAttribute('aria-activedescendant')));
  await p.keyboard.press('ArrowDown'); await shot('select_open');
  const picked = trig ? (await p.locator('#' + (await trig.getAttribute('aria-activedescendant'))).textContent()).trim() : '';
  await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  check('Enter selects and closes; focus stays on the trigger', trig && (await trig.getAttribute('aria-expanded')) === 'false' && (await trig.textContent()).includes(picked), picked);
  if (trig) { await trig.focus(); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Escape'); await p.waitForTimeout(100); }
  check('Escape closes without changing the value', trig && (await trig.getAttribute('aria-expanded')) === 'false' && (await trig.textContent()).includes(picked));

  // Slide panel: validation, inert, discard, focus restore (§5.44, §5.46, §5.55) — User Management (frame 6)
  await go('/apps/users');
  const opener = p.locator('.ds-topbar, .ds-page-header').getByRole('button', { name: 'Add user' }).first();
  await opener.click(); await p.waitForTimeout(300);
  check('Panel moves focus to the first field', (await focused()).startsWith('input'), await focused());
  check('Everything outside the panel is inert', await p.evaluate(() => [...document.querySelectorAll('[data-inert-scope]')].every(e => e.inert)));
  await p.locator('.ds-panel__footer').getByRole('button', { name: 'Add user' }).click(); await p.waitForTimeout(200);
  check('Submit shows every required-field error', (await p.locator('.ds-panel .ds-field__error').count()) === 3);
  check('Focus moves to the first invalid field', (await p.evaluate(() => document.activeElement.getAttribute('aria-invalid'))) === 'true');
  await shot('panel_errors');
  await p.keyboard.type('Test Person'); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  check('Escape with unsaved edits asks to discard (Keep Editing focused)', (await p.locator('[role="alertdialog"]').count()) === 1 && (await focused()).includes('Keep Editing'));
  await shot('discard');
  await p.getByRole('button', { name: 'Discard' }).click(); await p.waitForTimeout(300);
  check('Closing restores focus to the opener and clears inert', (await focused()).includes('Add user') && await p.evaluate(() => [...document.querySelectorAll('[data-inert-scope]')].every(e => !e.inert)), await focused());
  await opener.click(); await p.waitForTimeout(300);
  await p.mouse.click(20, 500); await p.waitForTimeout(200);
  check('Backdrop click never closes (R-12)', (await p.locator('.ds-panel').count()) === 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  // Pagination and role tabs (§5.40, §5.39)
  await p.getByRole('button', { name: 'Page 3' }).click(); await p.waitForTimeout(150);
  check('Pagination changes the rows and keeps focus on the page button', (await p.locator('.ds-pagination__summary').textContent()).includes('17 – 24') && (await focused()).includes('Page 3'));
  await shot('table');

  // Confirmation dialog (§5.45)
  await p.locator('tbody').getByRole('button', { name: /^Delete / }).first().click(); await p.waitForTimeout(200);
  check('Confirmation is an alertdialog with Cancel focused', (await p.locator('[role="alertdialog"]').count()) === 1 && (await focused()).includes('Cancel'));
  await shot('confirm');
  await p.locator('[role="alertdialog"]').getByRole('button', { name: 'Delete' }).click(); await p.waitForTimeout(300);
  check('Delete removes the user (23 remain)', (await p.locator('.ds-pagination__summary').textContent()).includes('23'));

  // Table sort (§5.41) — Product Master (frame 8)
  await go('/apps/product-master');
  await p.locator('th button.ds-th-sort', { hasText: 'CBU code' }).click(); await p.waitForTimeout(150);
  check('Sorting sets aria-sort on that column only', (await p.locator('th[aria-sort]').count()) === 1);

  // Stepper validation (§5.36) — Add New Factory (frame 3)
  await go('/apps/factories');
  await p.getByRole('button', { name: 'Add factory' }).first().click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'Next: Configuration' }).click(); await p.waitForTimeout(200);
  check('Step 1 blocks on invalid fields and focuses the first one', (await p.locator('.ds-panel .ds-field__error').count()) === 4 && (await p.evaluate(() => document.activeElement.getAttribute('aria-invalid'))) === 'true');
  await shot('stepper_errors');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  // Modal (§5.45) — Add Cameras (frame 5)
  await go('/apps/add-cameras');
  check('Add Cameras opens as a modal dialog', (await p.locator('[role="dialog"][aria-modal="true"]').count()) >= 1);
  await shot('modal');

  // Tooltip (§5.49)
  await go('/components/icon-buttons');
  await p.keyboard.press('Tab');
  await p.locator('.doc-preview .ds-icon-btn').first().focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(150);
  check('Tooltip shows immediately on keyboard focus', (await p.locator('.ds-tooltip:not([hidden])').count()) === 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  check('Escape hides the tooltip without moving focus', (await p.locator('.ds-tooltip:not([hidden])').count()) === 0 && (await focused()).startsWith('button'));

  // Chart tooltip by keyboard (§7.9)
  await go('/charts/stacked-bar');
  await p.locator('.ds-bar').nth(3).focus(); await p.waitForTimeout(150);
  check('Chart mark shows the rich tooltip on focus', (await p.locator('.ds-chart-tip[role="tooltip"]').count()) === 1);
  await shot('chart_tooltip');

  // Toasts (§5.48)
  await go('/components/toasts');
  await p.getByRole('button', { name: 'Toast with Undo' }).click(); await p.waitForTimeout(3000);
  check('A toast with an action does not time out', (await p.locator('.ds-toast-region .ds-toast').count()) === 1);
  await p.getByRole('button', { name: 'Neutral toast' }).click(); await p.mouse.move(0, 0); await p.waitForTimeout(2900);
  check('A neutral toast is gone after 2500ms', (await p.locator('.ds-toast-region .ds-toast').count()) === 0);

  // Date range (§5.16)
  await go('/components/date-pickers');
  const dateTrig = p.locator('.doc-preview [aria-haspopup="dialog"]').first();
  await dateTrig.click(); await p.waitForTimeout(200);
  check('Popover moves focus to "From"', (await p.evaluate(() => document.activeElement.type)) === 'date');
  await p.locator('.ds-popover input[type=date]').nth(1).fill('2000-01-01'); await p.waitForTimeout(100);
  check('From > To shows the error and aria-disables Apply', (await p.locator('.ds-popover [role=alert]').count()) === 1 && (await p.locator('.ds-popover').getByRole('button', { name: 'Apply' }).getAttribute('aria-disabled')) === 'true');
  await shot('date_invalid');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  check('Escape discards the draft and returns focus to the trigger', (await p.locator('.ds-popover').count()) === 0 && await dateTrig.evaluate(e => e === document.activeElement));

  // Tabs (§5.39)
  await go('/components/tabs');
  const tabs = p.locator('.doc-preview').first().locator('[role=tab]');
  const nextTab = (await tabs.nth(1).textContent()).trim();
  await tabs.first().focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(100);
  check('ArrowRight moves and activates the next tab', (await tabs.nth(1).evaluate(e => e === document.activeElement)) && (await tabs.nth(1).getAttribute('aria-selected')) === 'true', nextTab);

  // Radio cards (§5.13)
  await go('/components/radio-cards');
  const radios = p.locator('.doc-preview').first().locator('[role=radio]');
  await radios.first().focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(100);
  check('Radio cards: arrow keys move and select', (await radios.nth(1).getAttribute('aria-checked')) === 'true' && await radios.nth(1).evaluate(e => e === document.activeElement));

  // Density (§2.13)
  await go('/foundations/density');
  await p.evaluate(() => document.documentElement.setAttribute('data-density', 'compact')); await p.waitForTimeout(150);
  const h = await p.evaluate(() => getComputedStyle(document.querySelector('.doc-preview .ds-btn')).getPropertyValue('--ds-size-control').trim());
  await p.evaluate(() => document.documentElement.removeAttribute('data-density'));
  check('Compact density lowers the control size token to 36px', h === '36px', h);

  // RTL (§8.9)
  await p.evaluate(() => document.documentElement.setAttribute('dir', 'rtl')); await p.waitForTimeout(150);
  const sideX = await p.evaluate(() => document.querySelector('.docs-rail').getBoundingClientRect().x);
  await shot('rtl');
  await p.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));
  check('RTL places the navigation on the start (right) edge', sideX > 700, `x=${Math.round(sideX)}`);

  check('No uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
} finally {
  await browser.close();
  server.kill();
}
const passed = results.filter(r => r.ok).length;
console.log(`\n${passed}/${results.length} interaction checks passed`);
const reportPath = path.join(root, 'public/qa-report.json');
const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {};
report.interactions = { generatedAt: new Date().toISOString(), results };
for (const f of [reportPath, path.join(root, 'dist/qa-report.json'), path.join(root, 'qa-output/qa-report.json')]) if (fs.existsSync(path.dirname(f))) fs.writeFileSync(f, JSON.stringify(report, null, 1));
process.exitCode = passed === results.length ? 0 : 1;

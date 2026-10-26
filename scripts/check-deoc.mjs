// DEOC parity: every component of this design system must render exactly like the DEOC app in its Design System 02.
// Opens the running DEOC app (DEOC_URL, default http://localhost:8443/) in DS 02, finds each DEOC component on its real
// page, renders the matching ds-* markup next to it inside a shadow root styled by src/generated/ds.css (read from disk,
// so this checks the spec as it is now), and compares the computed styles property by property.
//
//   node scripts/check-deoc.mjs            all pairs
//   node scripts/check-deoc.mjs kpi table  only pairs whose id contains one of the words
//
// Needs DEOC's dev server and an installed Chrome or Edge (CHROME_PATH overrides).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const BASE = process.env.DEOC_URL ?? 'http://localhost:8443/';
const css = fs.readFileSync(path.join(root, 'src/generated/ds.css'), 'utf8')
  .replace(/^:root\b/gm, ':host').replace(/^(html, )?body\b/gm, ':host');

const ALL = ['color', 'backgroundColor', 'backgroundImage', 'boxShadow', 'borderTopWidth', 'borderTopColor', 'borderTopStyle', 'borderBottomWidth', 'borderBottomColor',
  'borderLeftWidth', 'borderLeftColor', 'borderTopLeftRadius', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'fontWeight', 'lineHeight',
  'letterSpacing', 'textTransform', 'rowGap', 'columnGap', 'opacity', 'height'];
const VISUAL = ['color', 'backgroundColor', 'backgroundImage', 'boxShadow', 'borderTopWidth', 'borderTopColor', 'borderTopLeftRadius', 'opacity'];
const BOX = ['backgroundColor', 'backgroundImage', 'boxShadow', 'borderTopWidth', 'borderTopColor', 'borderTopLeftRadius', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap', 'height'];
const TEXT = ['color', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform'];
const without = (list, ...drop) => list.filter(k => !drop.includes(k));

// d: expression evaluated in the DEOC page with helpers (q, all, txt, has, P); html: ds markup; s: selector inside it; w: host width ('deoc' = DEOC element width)
const P = (row, sel) => `P(${JSON.stringify(row)}, ${JSON.stringify(sel)})`;
const tableHtml = (cls = '') => `<div class="ds-table-region ${cls}"><table class="ds-table"><thead><tr><th>Camera ID</th><th>IP Address</th></tr></thead><tbody><tr><th scope="row">CAM01 - L01</th><td>192.168.1.111</td></tr></tbody></table></div>`;
const section = (nested, title = 'Bottle Line - 1', count = 2) => `<section class="ds-section-card${nested ? ' ds-section-card--nested' : ''}"><div class="ds-section-card__heading"><h2 class="ds-section-card__h"><button class="ds-section-card__toggle" aria-expanded="true"><span class="ds-text-subgroup-title">${title}</span><span class="ds-count">${count}</span><span class="ds-section-card__chev"><svg width="24" height="24"></svg></span></button></h2>${nested ? '<button class="ds-btn ds-btn--section" style="width:180px"><svg width="16" height="16"></svg>Add Camera</button>' : ''}</div><div id="b" class="ds-section-card__body${nested ? ' ds-section-card__body--flush' : ''}"><div style="height:40px"></div></div></section>`;
const kpi = '<button class="ds-kpi"><span class="ds-kpi__icon"></span><span class="ds-kpi__text"><span class="ds-kpi__label">Total Cameras</span><span class="ds-kpi__value">72</span></span></button>';
const nav = '<nav class="ds-nav"><div class="ds-nav__section"><span class="ds-nav__label">General</span><a class="ds-nav__item" aria-current="page" href="#"><span class="ds-nav__icon"></span><span class="ds-nav__text">Cameras</span></a><a class="ds-nav__item" href="#"><span class="ds-nav__icon"></span><span class="ds-nav__text">Factories</span></a></div></nav>';
const tabs = '<div class="ds-tabs" role="tablist"><button class="ds-tab" role="tab" aria-selected="true"><span class="ds-tab__label">All Users</span><span class="ds-tab__count">(24)</span></button><button class="ds-tab" role="tab" aria-selected="false">Admins</button></div>';
const toggle = '<div class="ds-toggle" role="radiogroup"><button class="ds-toggle__opt" role="radio" aria-checked="true"><span class="ds-dot ds-dot--sm ds-dot--success"></span>Active</button><button class="ds-toggle__opt" role="radio" aria-checked="false"><span class="ds-dot ds-dot--sm ds-dot--error"></span>Inactive</button></div>';
const pagination = '<div class="ds-pagination"><p class="ds-pagination__summary">Showing <strong>1 – 8</strong> of <strong>24</strong> products</p><div class="ds-pagination__pages"><button class="ds-page-btn" aria-current="page">1</button><button class="ds-page-btn">2</button></div></div>';
const filter = (label = 'All Factories', wrap = '') => `<div class="${wrap}"><div class="ds-select"><button class="ds-select__trigger ds-select__trigger--filter"><span class="ds-select__value"><svg class="ds-select__lead"></svg><span>${label}</span></span><span class="ds-select__icon"></span></button></div></div>`;
const search = (wrap = '') => `<div class="${wrap}"><div class="ds-search"><span class="ds-search__icon"></span><input class="ds-input ds-search__input" placeholder="Search"></div></div>`;
const badge = (tone, glass = false) => `<span class="ds-badge ds-badge--${tone}${glass ? ' ds-badge--glass' : ''}"><span class="ds-badge__dot"></span>${tone === 'success' ? 'Active' : 'Inactive'}</span>`;
const entity = `<article class="ds-entity ds-entity--link"><div class="ds-entity__header"><div class="ds-entity__lead"><span class="ds-entity__icon"></span><div class="ds-entity__titles"><h3 class="ds-text-card-title">Lotus</h3><span class="ds-entity__place"><svg width="14" height="14"></svg>Mumbai</span></div></div>${badge('success', true)}</div>
  <div class="ds-entity__well"><div class="ds-entity__wellrow"><span class="ds-entity__value"><b class="ds-text-metric-value">6</b><span class="ds-text-body-muted">/ 6 lines active</span></span><span class="ds-entity__meta"><svg width="14" height="12"></svg>24 cameras</span></div><div class="ds-progress ds-progress--success"><span style="width:100%"></span></div></div>
  <div class="ds-entity__footer"><div class="ds-entity__who"><span class="ds-avatar ds-avatar--neutral">RS</span><span><b>Rishav</b><span class="ds-entity__role">Plant Manager</span></span></div><button class="ds-btn ds-btn--subtle">View factory<svg width="14" height="14"></svg></button></div></article>`;
const media = `<button class="ds-media-card" style="height:300px;width:100%"><div class="ds-media-card__head"><span class="ds-media-card__titles"><span class="ds-icon-tile ds-icon-tile--sm"></span><span class="ds-media-card__title">Front Label</span></span>${badge('success')}<span class="ds-media-card__expand"><svg width="16" height="16"></svg></span></div><div class="ds-media-card__media"></div><div class="ds-media-card__foot"><p class="ds-media-card__detail">Detected : <em>"x"</em></p></div></button>`;
const panelCard = '<section class="ds-panel-card"><h2 class="ds-panel-card__label">Reference Barcodes</h2><dl class="ds-fieldlist"><div><dt>Primary Barcode</dt><dd>8901030875397</dd></div><div><dt>Tertiary CLD</dt><dd>1</dd></div></dl></section>';
const strip = '<section class="ds-strip ds-strip--stacked"><div class="ds-strip__lead"><p class="ds-strip__eyebrow"><span class="ds-dot ds-dot--sm ds-dot--brand"></span>Bottle Line 3</p><h2 class="ds-strip__title">Dove</h2></div></section>';
const dash = (flush = false) => `<section class="ds-dash-card${flush ? ' ds-dash-card--flush' : ''}"><div class="ds-dash-card__header"><div><h2 class="ds-dash-card__title">Quality Snapshot</h2></div><div class="ds-dash-card__right"><ul class="ds-legend"><li><i class="ds-legend__mark"></i>Good Products</li></ul></div></div><div class="ds-dash-card__body"><div class="ds-chart"><div class="ds-chart__plotrow"><div class="ds-axis-y" style="height:300px"><span>10k</span></div><div class="ds-chart__plot" style="height:300px"></div></div></div></div></section>`;
const statusCard = `<section class="ds-dash-card ds-status-card"><div class="ds-dash-card__header"><h2 class="ds-dash-card__title">Line Status</h2><div class="ds-legend-dots"><span class="ds-legend-dot"><i></i>Running</span></div></div><div><div class="ds-segbar"><span class="ds-segbar__seg" style="flex-grow:3">3</span></div></div><div class="ds-status-card__well">${tableHtml('ds-table-region--capped')}</div></section>`;
const heat = '<div class="ds-heatmap" style="grid-template-columns:repeat(5,1fr)"><div class="ds-heatmap__row"><span class="ds-heatmap__head ds-heatmap__head--first">Factory</span><span class="ds-heatmap__head">CLD</span></div><div class="ds-heatmap__row"><span class="ds-heatmap__label">Lotus</span><span class="ds-heatmap__cellwrap"><button class="ds-heat-cell" style="background:#116035">1.2%</button></span></div></div>';
const panel = (stepper) => `<div class="ds-panel ds-panel--xl"><div class="ds-panel__header"><div class="ds-panel__titlerow"><div class="ds-panel__titlegroup"><span class="ds-panel__icon"></span><h2 class="ds-text-dialog-title">Add New Factory</h2></div><button class="ds-icon-btn ds-icon-btn--close"></button></div>${stepper ? `<ol class="ds-stepper"><li class="ds-step" aria-current="step"><span class="ds-step__index">1</span><span class="ds-step__text"><span class="ds-step__title">Basic Details</span><span class="ds-step__sub">In progress</span></span></li><li class="ds-step"><span class="ds-step__index">2</span><span class="ds-step__text"><span class="ds-step__title">Configuration</span><span class="ds-step__sub">Lines</span></span></li><li class="ds-step"><span class="ds-step__index">3</span><span class="ds-step__text"><span class="ds-step__title">Review</span><span class="ds-step__sub">Summary</span></span></li></ol>` : ''}</div><div class="ds-panel__body"></div><div class="ds-panel__footer"><button class="ds-btn ds-btn--secondary">Back</button><button class="ds-btn ds-btn--primary">Next</button></div></div>`;
const field = '<div class="ds-field"><label class="ds-field__label">Factory Name<span class="ds-field__req">*</span></label><input class="ds-input" placeholder="Enter factory name"><p class="ds-field__error">Required.</p></div>';
const menu = (multi) => `<div class="ds-select" style="position:relative"><div class="ds-menu" style="position:static"><ul class="ds-menu__list"><li class="ds-menu__option${multi ? ' ds-menu__option--multi' : ''}" aria-selected="true">${multi ? '<span class="ds-check__box"></span>' : ''}North</li><li class="ds-menu__option${multi ? ' ds-menu__option--multi' : ''}" aria-selected="false">${multi ? '<span class="ds-check__box"></span>' : ''}South</li>${multi ? '<li class="ds-menu__action">Add New Machine</li>' : ''}</ul></div></div>`;
const attach = '<div class="ds-attach"><div class="ds-attach__field"><input class="ds-attach__input" placeholder="e.g. 8901030875397"></div><button class="ds-attach__btn"><svg width="18" height="18"></svg>Upload</button></div>';
const tip = '<div class="ds-chart-tip" style="position:static"><div class="ds-chart-tip__head"><span class="ds-chart-tip__dot"></span><b>Lotus</b><span class="ds-tip-x">×</span><b>CLD</b></div><div class="ds-chart-tip__rows"><div class="ds-chart-tip__row"><span>Overall</span><span>1%</span></div></div><div class="ds-chart-tip__divider"></div></div>';
const picker = '<div style="position:relative"><div class="ds-picker" style="position:static"><ul class="ds-picker__list"><li class="ds-picker-row" aria-selected="false"><span class="ds-avatar">AS</span><span class="ds-picker-row__text"><span class="ds-picker-row__line1">Anita Sharma<span class="ds-chip">EMP-8841</span></span><span class="ds-picker-row__line2">anita@x.com</span></span></li></ul><button class="ds-picker-footer">Add User</button></div></div>';

const PAIRS = [
  // ── Parity page (DEOC components rendered in isolation) ──
  { id: 'btn-primary', scene: 'parity', d: P('btn-primary', 'button'), html: '<button class="ds-btn ds-btn--primary">Add Camera</button>' },
  { id: 'btn-secondary', scene: 'parity', d: P('btn-secondary', 'button'), html: '<button class="ds-btn ds-btn--secondary">Cancel</button>' },
  { id: 'btn-subtle', scene: 'parity', d: P('btn-subtle', 'button'), html: '<button class="ds-btn ds-btn--subtle">View factory</button>' },
  { id: 'btn-section', scene: 'parity', d: P('btn-section-action', 'button'), html: '<button class="ds-btn ds-btn--section"><svg width="16" height="16"></svg>Add Camera</button>' },
  { id: 'btn-ghost', scene: 'parity', d: P('btn-ghost', 'button'), html: '<button class="ds-btn ds-btn--ghost">Clear</button>' },
  { id: 'kpi', scene: 'parity', d: P('kpi', 'button'), html: kpi, s: '.ds-kpi', w: 'deoc' },
  { id: 'kpi-label', scene: 'parity', d: P('kpi-label', 'p'), html: kpi, s: '.ds-kpi__label', props: TEXT },
  { id: 'kpi-value', scene: 'parity', d: P('kpi', 'p + p'), html: kpi, s: '.ds-kpi__value', props: TEXT },
  { id: 'section', scene: 'parity', d: P('accordion', 'section'), html: section(false, 'Lotus - Mumbai', 12), s: 'section', props: without(BOX, 'height') },
  { id: 'section-heading', scene: 'parity', d: P('accordion', 'section > div'), html: section(false, 'Lotus - Mumbai', 12), s: '.ds-section-card__heading', w: 'deoc' },
  { id: 'section-title', scene: 'parity', d: P('accordion', 'section button > span > span'), html: section(false, 'Lotus - Mumbai', 12), s: '.ds-section-card__toggle > span', props: TEXT },
  { id: 'section-nested', scene: 'parity', d: P('accordion-nested', 'section'), html: section(true), s: 'section', props: without(BOX, 'height') },
  { id: 'count-pill', scene: 'parity', d: P('count-pill', 'span'), html: '<div style="display:flex"><span class="ds-count">12</span></div>', s: '.ds-count', props: without(ALL, 'height') },
  { id: 'table-th', scene: 'parity', d: P('table-header', 'thead th'), html: tableHtml(), s: 'thead th', props: without(ALL, 'backgroundColor') },
  { id: 'table-header-fill', scene: 'parity', d: P('table-header', 'thead tr'), html: tableHtml(), s: 'thead th', props: ['backgroundColor'] },
  { id: 'table-td-first', scene: 'parity', d: P('table-cell', 'tbody td'), html: tableHtml(), s: 'tbody th', props: without(ALL, 'color', 'fontWeight') },
  { id: 'table-td', scene: 'parity', d: P('table-cell', 'tbody td ~ td:not([aria-hidden])'), html: tableHtml(), s: 'tbody td' },
  { id: 'nav-active-skin', scene: 'parity', d: P('nav-active', '.skin-nav-active'), html: nav, s: '[aria-current]', props: ['backgroundColor', 'backgroundImage', 'boxShadow', 'borderTopLeftRadius'] },
  { id: 'nav-active', scene: 'parity', d: P('nav-active-text', 'button'), html: nav, s: '[aria-current]', props: without(ALL, 'backgroundImage', 'boxShadow') },
  { id: 'nav-idle', scene: 'parity', d: P('nav-idle', 'button'), html: nav, s: 'a:not([aria-current])' },
  { id: 'badge-success', scene: 'parity', d: P('badge-success', 'span'), html: badge('success'), s: '.ds-badge' },
  { id: 'badge-dot', scene: 'parity', d: P('badge-success', 'span > span'), html: badge('success'), s: '.ds-badge__dot' },
  { id: 'search-input', scene: 'parity', d: P('search-input', 'input'), html: search(), s: 'input' },
  { id: 'select-filter', scene: 'parity', d: P('select-trigger', 'button'), html: filter(), s: 'button', w: 'deoc' },
  { id: 'tabs-track', scene: 'parity', d: P('tabs-track', '[role=tablist]'), html: tabs, s: '.ds-tabs' },
  { id: 'tab-selected', scene: 'parity', d: P('tab-selected', '[aria-selected=true]'), html: tabs, s: '[aria-selected=true]' },
  { id: 'toggle-track', scene: 'parity', d: P('toggle-track', '[role=radiogroup]'), html: toggle, s: '.ds-toggle', w: 'deoc' },
  { id: 'toggle-selected', scene: 'parity', d: P('toggle-selected', '[aria-checked=true]'), html: toggle, s: '[aria-checked=true]', w: 'deoc' },
  { id: 'toggle-dot', scene: 'parity', d: P('toggle-selected', '[aria-checked=true] > span'), html: toggle, s: '[aria-checked=true] .ds-dot' },
  { id: 'pagination', scene: 'parity', d: P('pagination-current', 'div'), html: pagination, s: '.ds-pagination', w: 'deoc', props: without(ALL, 'rowGap', 'columnGap') },
  { id: 'pagination-summary', scene: 'parity', d: P('pagination-current', 'p'), html: pagination, s: '.ds-pagination__summary' },
  { id: 'pagination-strong', scene: 'parity', d: P('pagination-current', 'p span'), html: pagination, s: '.ds-pagination__summary strong', props: TEXT },
  { id: 'page-current', scene: 'parity', d: P('pagination-current', 'button[aria-current]'), html: pagination, s: '[aria-current]' },
  { id: 'page-idle', scene: 'parity', d: P('pagination-current', 'button[aria-label="Page 2"]'), html: pagination, s: '.ds-page-btn:not([aria-current])' },

  // ── Live View ──
  { id: 'shell-main', scene: 'live-view', d: `q('header').parentElement.parentElement`, html: '<div class="ds-main"></div>', s: '.ds-main', props: VISUAL },
  { id: 'shell', scene: 'live-view', d: `q('aside').parentElement.parentElement`, html: '<div class="ds-shell" style="height:200px"></div>', s: '.ds-shell', props: ['paddingTop', 'paddingLeft', 'columnGap', 'backgroundColor'] },
  { id: 'sidebar', scene: 'live-view', d: `q('aside').parentElement`, html: '<div class="ds-sidebar" style="position:static"></div>', s: '.ds-sidebar', props: [...VISUAL, 'width'] },
  { id: 'sidebar-inner', scene: 'live-view', d: `q('aside')`, html: '<div class="ds-sidebar__inner"></div>', s: '.ds-sidebar__inner', props: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] },
  { id: 'sidebar-brand', scene: 'live-view', d: `q('aside > div > div')`, html: '<div class="ds-sidebar__brand"></div>', s: 'div', props: ['paddingTop', 'paddingLeft', 'width'] },
  { id: 'sidebar-name', scene: 'live-view', d: `txt('p', 'Unilever')`, html: '<span class="ds-sidebar__name">Unilever</span>', s: 'span', props: TEXT },
  { id: 'sidebar-tagline', scene: 'live-view', d: `txt('p', 'Vision Automation')`, html: '<span class="ds-sidebar__tagline">Vision Automation</span>', s: 'span', props: TEXT },
  { id: 'nav-label', scene: 'live-view', d: `txt('span', 'General')`, html: nav, s: '.ds-nav__label', props: [...TEXT, 'paddingLeft'] },
  { id: 'user-card', scene: 'live-view', d: `txt('p', 'HUL Admin').closest('[class*="rounded-panel"]')`, html: '<div class="ds-user-card"><div class="ds-user-card__row"></div></div>', s: '.ds-user-card', props: without(BOX, 'height') },
  { id: 'user-name', scene: 'live-view', d: `txt('p', 'Rishav Raj Sinha')`, html: '<span class="ds-user-card__name">Rishav Raj Sinha</span>', s: 'span', props: TEXT },
  { id: 'page-header', scene: 'live-view', d: `q('header')`, html: '<header class="ds-page-header"><div class="ds-page-header__lead"><h1 class="ds-text-page-title">Dove</h1></div></header>', s: 'header', props: [...VISUAL, 'paddingLeft', 'paddingRight', 'height'] },
  { id: 'page-title', scene: 'live-view', d: `q('h1')`, html: '<h1 class="ds-text-page-title">Dove</h1>', s: 'h1', props: TEXT },
  { id: 'header-filter', scene: 'live-view', d: `q('header button[aria-haspopup=listbox]')`, html: filter('Lotus', 'ds-page-header__actions'), s: 'button', w: 'deoc' },
  { id: 'live-pill', scene: 'live-view', d: `txt('span', 'Live')`, html: '<span class="ds-live"><span class="ds-live__dot"></span>Live</span>', s: '.ds-live' },
  { id: 'live-dot', scene: 'live-view', d: `txt('span', 'Live').firstElementChild`, html: '<span class="ds-live"><span class="ds-live__dot"></span>Live</span>', s: '.ds-live__dot' },
  { id: 'media-card', scene: 'live-view', d: `q('button[aria-label*="Click to expand"]')`, html: media, s: '.ds-media-card', w: 'deoc', props: without(BOX, 'height') },
  { id: 'media-head', scene: 'live-view', d: `q('button[aria-label*="Click to expand"] > div')`, html: media, s: '.ds-media-card__head', w: 'deoc' },
  { id: 'media-title', scene: 'live-view', d: `q('button[aria-label*="Click to expand"] > div > div > span > span')`, html: media, s: '.ds-media-card__title', w: `q('button[aria-label*="Click to expand"]')`, props: TEXT },
  { id: 'media-icon', scene: 'live-view', d: `q('button[aria-label*="Click to expand"] > div > div > div')`, html: media, s: '.ds-icon-tile', props: BOX },
  { id: 'media-foot', scene: 'live-view', d: `q('button[aria-label*="Click to expand"] > div:nth-child(3)')`, html: media, s: '.ds-media-card__foot', w: 'deoc', props: without(BOX, 'backgroundImage', 'rowGap', 'columnGap') },
  { id: 'media-detail', scene: 'live-view', d: `q('button[aria-label*="Click to expand"] > div:nth-child(3) p')`, html: media, s: '.ds-media-card__detail', props: TEXT },
  { id: 'media-feed', scene: 'live-view', d: `q('button[aria-label*="Click to expand"] > div:nth-child(2)')`, html: media, s: '.ds-media-card__media', props: ['backgroundColor'] },
  { id: 'side-card', scene: 'live-view', d: `q('aside[aria-label="Running SKU"] > section:nth-child(2)')`, html: panelCard, s: '.ds-panel-card', w: 'deoc', props: without(BOX, 'height') },
  { id: 'side-label', scene: 'live-view', d: `txt('h2', 'Reference Barcodes')`, html: panelCard, s: '.ds-panel-card__label', props: TEXT },
  { id: 'side-row', scene: 'live-view', d: `q('aside[aria-label="Running SKU"] dl > div')`, html: panelCard, s: '.ds-fieldlist > div', w: 'deoc' },
  { id: 'side-dt', scene: 'live-view', d: `q('aside[aria-label="Running SKU"] dt')`, html: panelCard, s: 'dt', props: TEXT },
  { id: 'side-dd', scene: 'live-view', d: `q('aside[aria-label="Running SKU"] dd')`, html: panelCard, s: 'dd', props: TEXT },
  { id: 'side-eyebrow', scene: 'live-view', d: `q('aside[aria-label="Running SKU"] section span.text-text-link')`, html: strip, s: '.ds-strip__eyebrow', props: TEXT },
  { id: 'side-title', scene: 'live-view', d: `q('aside[aria-label="Running SKU"] section p')`, html: strip, s: '.ds-strip__title', props: TEXT },

  // ── Factories ──
  { id: 'kpi-row', scene: 'cameras', d: `q('.p-page > div')`, html: `<div class="ds-kpi-row">${kpi}${kpi}</div>`, s: '.ds-kpi-row', props: ['columnGap'] },
  { id: 'section-title-grid', scene: 'factories', d: `q('section > h2')`, html: '<h2 class="ds-section-title">Active Operational Units<span class="ds-section-title__dot"></span>6</h2>', s: 'h2', props: [...TEXT, 'columnGap', 'paddingLeft'] },
  { id: 'entity', scene: 'factories', d: `q('.card-entity')`, html: entity, s: '.ds-entity', w: 'deoc', props: without(ALL, 'height') },
  { id: 'entity-header', scene: 'factories', d: `q('.card-entity > div')`, html: entity, s: '.ds-entity__header', w: 'deoc' },
  { id: 'entity-title', scene: 'factories', d: `q('.card-entity h3')`, html: entity, s: 'h3', props: TEXT },
  { id: 'entity-place', scene: 'factories', d: `q('.card-entity h3 + span')`, html: entity, s: '.ds-entity__place', props: [...TEXT, 'columnGap'] },
  { id: 'badge-glass', scene: 'factories', d: `q('.card-entity span.skin-control')`, html: entity, s: '.ds-badge' },
  { id: 'entity-well', scene: 'factories', d: `q('.card-entity .skin-elevated')`, html: entity, s: '.ds-entity__well', w: 'deoc' },
  { id: 'entity-metric', scene: 'factories', d: `q('.card-entity .skin-elevated span span')`, html: entity, s: '.ds-text-metric-value', props: TEXT },
  { id: 'progress', scene: 'factories', d: `q('.card-entity [role=progressbar]')`, html: entity, s: '.ds-progress', props: BOX },
  { id: 'avatar-neutral', scene: 'factories', d: `q('.card-entity .bg-surface-avatar')`, html: entity, s: '.ds-avatar' },
  { id: 'entity-owner', scene: 'factories', d: `q('.card-entity .bg-surface-avatar + span > span')`, html: entity, s: '.ds-entity__who b', props: TEXT },
  { id: 'entity-role', scene: 'factories', d: `q('.card-entity .text-brand')`, html: entity, s: '.ds-entity__role', props: TEXT },
  { id: 'entity-button', scene: 'factories', d: `q('.card-entity button')`, html: entity, s: '.ds-entity__footer .ds-btn' },
  { id: 'header-search', scene: 'factories', d: `q('header input')`, html: search('ds-page-header__actions'), s: 'input', w: 'deoc' },

  // ── Cameras ──
  { id: 'section-stack', scene: 'cameras', d: `q('section').parentElement`, html: `<div class="ds-section-stack">${section(false)}${section(false)}</div>`, s: '.ds-section-stack', props: ['rowGap'] },
  { id: 'section-body', scene: 'cameras', d: `q('section > div:nth-child(2)')`, html: section(false), s: '.ds-section-card__body', props: ['paddingTop', 'paddingLeft', 'rowGap'] },
  { id: 'nested-heading', scene: 'cameras', d: `q('section section > div')`, html: section(true), s: '.ds-section-card__heading', w: 'deoc' },
  { id: 'nested-title', scene: 'cameras', d: `q('section section button > span > span')`, html: section(true), s: '.ds-section-card__toggle > span', props: TEXT },
  { id: 'section-action', scene: 'cameras', d: `q('section section > div > button:last-child')`, html: section(true), s: '.ds-btn--section' },
  { id: 'row-actions', scene: 'cameras', d: `q('button[aria-label^="Edit "]').parentElement`, html: '<div class="ds-row-actions"><button class="ds-icon-btn ds-icon-btn--sm"></button><button class="ds-icon-btn ds-icon-btn--sm"></button></div>', s: '.ds-row-actions', props: ['columnGap'] },
  { id: 'icon-btn-sm', scene: 'cameras', d: `q('button[aria-label^="Edit "]')`, html: '<button class="ds-icon-btn ds-icon-btn--sm"></button>', s: 'button', props: without(ALL, 'color') },
  { id: 'status-dot', scene: 'cameras', d: `q('tbody [role=img][aria-label=Active]')`, html: '<span class="ds-dot ds-dot--success"></span>', s: '.ds-dot' },
  { id: 'kpi-ball', scene: 'cameras', d: `q('.p-page button span.absolute')`, html: '<span class="ds-kpi__icon"><span class="ds-kpi__ball"></span></span>', s: '.ds-kpi__ball' },

  // ── Product Master ──
  { id: 'table-card', scene: 'product-master', d: `q('.edge-float')`, html: `<div class="ds-table-card">${tableHtml()}</div>`, s: '.ds-table-card', props: without(BOX, 'height') },
  { id: 'th-sort', scene: 'factory-detail', d: `q('thead th button')`, html: '<table class="ds-table"><thead><tr><th aria-sort="ascending"><button class="ds-th-sort">Product<svg width="14" height="14"></svg></button></th></tr></thead></table>', s: '.ds-th-sort', props: [...TEXT, 'columnGap'] },

  // ── User Management ──
  { id: 'tag', scene: 'user-management', d: `q('tbody td span[style*="background"]')`, html: '<table class="ds-table"><tbody><tr><th>Anita</th><td><span class="ds-tag ds-tag--purple">HUL Admin</span></td></tr></tbody></table>', s: '.ds-tag', props: without(ALL, 'backgroundColor') },
  { id: 'tab-count', scene: 'user-management', d: `q('[role=tab][aria-selected=true] span + span')`, html: tabs, s: '.ds-tab__count', props: TEXT },

  // ── Dashboard ──
  { id: 'dash-card', scene: 'dashboard', d: `txt('h2', 'Quality Snapshot').closest('section')`, html: dash(), s: '.ds-dash-card', w: 'deoc', props: without(ALL, 'height') },
  { id: 'dash-title', scene: 'dashboard', d: `txt('h2', 'Quality Snapshot')`, html: dash(), s: '.ds-dash-card__title', props: TEXT },
  { id: 'legend-item', text: true, scene: 'dashboard', d: `txt('span', 'Good Products')`, html: dash(), s: '.ds-legend li', props: without(TEXT, 'color').concat('columnGap') },
  { id: 'legend-label', scene: 'dashboard', d: `txt('span', 'Good Products').lastElementChild`, html: dash(), s: '.ds-legend li', props: ['color'] },
  { id: 'legend-row', scene: 'dashboard', d: `txt('span', 'Good Products').parentElement`, html: dash(), s: '.ds-legend', props: ['columnGap'] },
  { id: 'axis-y', scene: 'dashboard', d: `txt('h2', 'Quality Snapshot').closest('section').querySelector('.w-7 span')`, html: dash(), s: '.ds-axis-y span', props: TEXT },
  { id: 'chart-plot', scene: 'dashboard', d: `txt('h2', 'Quality Snapshot').closest('section').querySelector('.relative.flex-1')`, html: dash(), s: '.ds-chart__plot', props: ['borderBottomWidth', 'borderBottomColor', 'borderLeftWidth'] },
  { id: 'tabs-accent', scene: 'dashboard', d: `q('[role=tablist][aria-label="Chart view"]')`, html: '<div class="ds-tabs ds-tabs--accent" role="tablist"><button class="ds-tab" role="tab" aria-selected="true">Time Series</button><button class="ds-tab" role="tab">Factory Wise</button></div>', s: '.ds-tabs', w: 'deoc' },
  { id: 'tab-accent', scene: 'dashboard', d: `q('[role=tablist][aria-label="Chart view"] [aria-selected=true]')`, html: '<div class="ds-tabs ds-tabs--accent" role="tablist"><button class="ds-tab" role="tab" aria-selected="true">Time Series</button><button class="ds-tab" role="tab">Factory Wise</button></div>', s: '[aria-selected=true]', w: 'deoc', props: without(ALL, 'fontSize', 'lineHeight', 'letterSpacing') },
  { id: 'heat-head', scene: 'dashboard', d: `txt('span', 'FACTORY')`, html: heat, s: '.ds-heatmap__head--first', props: without(ALL, 'height', 'backgroundColor', 'textTransform') },
  { id: 'heat-label', scene: 'dashboard', d: `txt('h2', 'Defect Rate by Category & Factory').closest('section').querySelector('.grid.h-10 > span')`, html: heat, s: '.ds-heatmap__label', props: without(ALL, 'height', 'paddingRight') },
  { id: 'heat-cell', scene: 'dashboard', d: `txt('h2', 'Defect Rate by Category & Factory').closest('section').querySelector('.grid.h-10 > button')`, html: heat, s: '.ds-heat-cell', props: without(ALL, 'backgroundColor', 'height', 'paddingLeft', 'paddingRight') },
  { id: 'donut-legend', scene: 'dashboard', d: `txt('h2', 'Defect Distribution').closest('section').querySelector('svg + div')`, html: '<div class="ds-donut"><div class="ds-donut__legend"><span>a</span><span>b</span></div></div>', s: '.ds-donut__legend', props: ['rowGap'] },
  { id: 'donut-ring', scene: 'dashboard', d: `txt('h2', 'Defect Distribution').closest('section').querySelector('svg')`, html: '<div class="ds-donut"><div class="ds-donut__ring"></div></div>', s: '.ds-donut__ring', props: ['height', 'width'] },
  { id: 'flush-card', scene: 'dashboard', d: `txt('h2', 'Line Wise Defects').closest('section')`, html: dash(true), s: '.ds-dash-card', w: 'deoc', props: without(ALL, 'height') },
  { id: 'flush-body', scene: 'dashboard', d: `txt('h2', 'Line Wise Defects').closest('section').lastElementChild`, html: dash(true), s: '.ds-dash-card__body', props: ['borderTopWidth', 'borderTopColor'] },
  { id: 'status-card', scene: 'dashboard', d: `txt('h2', 'Line Status').closest('section')`, html: statusCard, s: '.ds-status-card', w: 'deoc', props: without(ALL, 'height') },
  { id: 'status-legend', text: true, scene: 'dashboard', d: `txt('span', 'Running') && [...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Running' && e.className.includes('tertiary')).parentElement`, html: statusCard, s: '.ds-legend-dot', props: without(TEXT, 'color').concat('columnGap') },
  { id: 'status-legend-label', scene: 'dashboard', d: `[...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Running' && e.className.includes('tertiary'))`, html: statusCard, s: '.ds-legend-dot', props: ['color'] },
  { id: 'segbar', scene: 'dashboard', d: `q('[role=img][aria-label*="running"]')`, html: statusCard, s: '.ds-segbar', props: BOX },
  { id: 'segbar-seg', scene: 'dashboard', d: `q('[role=img][aria-label*="running"] > div')`, html: statusCard, s: '.ds-segbar__seg', props: TEXT },
  { id: 'status-well', scene: 'dashboard', d: `txt('h2', 'Line Status').closest('section').lastElementChild`, html: statusCard, s: '.ds-status-card__well', props: ['borderTopWidth', 'borderTopColor'] },
  { id: 'pinned-th', scene: 'dashboard', d: `txt('h2', 'Line Status').closest('section').querySelector('thead tr')`, html: statusCard, s: 'thead th', props: ['backgroundImage', 'backgroundColor'] },

  // ── Overlays ──
  { id: 'scrim', scene: 'factories-add', d: `q('[role=dialog] > div')`, html: '<div class="ds-overlay__backdrop"></div>', s: 'div', props: ['backgroundColor', 'backdropFilter'] },
  { id: 'panel', scene: 'factories-add', d: `q('[role=dialog] > div:nth-child(2)')`, html: panel(true), s: '.ds-panel', w: 'deoc', props: without(ALL, 'height') },
  { id: 'panel-header', scene: 'factories-add', d: `q('[role=dialog] > div:nth-child(2) > div')`, html: panel(true), s: '.ds-panel__header', w: 'deoc' },
  { id: 'panel-title', scene: 'factories-add', d: `q('[role=dialog] h2')`, html: panel(true), s: 'h2', props: TEXT },
  { id: 'panel-close', scene: 'factories-add', d: `q('button[aria-label="Close panel"]')`, html: panel(true), s: '.ds-icon-btn--close', props: without(ALL, 'color') },
  { id: 'panel-footer', scene: 'factories-add', d: `q('[role=dialog] > div:nth-child(2) > div:last-child')`, html: panel(true), s: '.ds-panel__footer', w: 'deoc', props: without(ALL, 'height', 'rowGap', 'columnGap') },
  { id: 'panel-body', scene: 'factories-add', d: `q('[role=dialog] > div:nth-child(2) > div:nth-child(2)')`, html: panel(true), s: '.ds-panel__body', props: ['paddingTop', 'paddingLeft', 'backgroundImage', 'backgroundColor'] },
  { id: 'step-current', scene: 'factories-add', d: `q('[aria-current=step]')`, html: panel(true), s: '.ds-step[aria-current] .ds-step__index' },
  { id: 'step-idle', scene: 'factories-add', d: `q('ol li:nth-child(2) span')`, html: panel(true), s: '.ds-step:nth-child(2) .ds-step__index', props: without(ALL, 'opacity') },
  { id: 'step-idle-group', scene: 'factories-add', d: `q('ol li:nth-child(2) > div')`, html: panel(true), s: '.ds-step:nth-child(2) .ds-step__text', props: ['opacity'] },
  { id: 'step-title', scene: 'factories-add', d: `q('ol li span[aria-current] + div span')`, html: panel(true), s: '.ds-step[aria-current] .ds-step__title', props: TEXT },
  { id: 'step-sub', scene: 'factories-add', d: `q('ol li span[aria-current] + div span + span')`, html: panel(true), s: '.ds-step[aria-current] .ds-step__sub', props: TEXT },
  { id: 'step-idle-title', scene: 'factories-add', d: `q('ol li:nth-child(2) > div > div span')`, html: panel(true), s: '.ds-step:nth-child(2) .ds-step__title', props: TEXT },
  { id: 'step-idle-sub', scene: 'factories-add', d: `q('ol li:nth-child(2) > div > div span + span')`, html: panel(true), s: '.ds-step:nth-child(2) .ds-step__sub', props: TEXT },
  { id: 'field', scene: 'factories-add', d: `q('label[for=af-name]').parentElement`, html: field, s: '.ds-field', props: ['rowGap'] },
  { id: 'field-label', scene: 'factories-add', d: `q('label[for=af-name]')`, html: field, s: '.ds-field__label', props: TEXT },
  { id: 'field-req', scene: 'factories-add', d: `q('label[for=af-name] span')`, html: field, s: '.ds-field__req', props: ['color'] },
  { id: 'input', scene: 'factories-add', d: `q('#af-name')`, html: field, s: '.ds-input' },
  { id: 'form-select', scene: 'factories-add', d: `txt('span', 'Enter region name').closest('button')`, html: filter('Enter region name'), s: 'button', w: 'deoc' },
  { id: 'picker-trigger', scene: 'factories-add', d: `txt('span', 'Choose user').closest('button')`, html: '<div class="ds-select ds-select--rich"><button class="ds-select__trigger ds-select__trigger--field"><span class="ds-select__value ds-select__value--placeholder">Choose user</span></button></div>', s: 'button', w: 'deoc', props: without(ALL, 'color', 'borderTopLeftRadius') },
  { id: 'link-action', scene: 'factories-add', d: `txt('button', 'Add New User')`, html: '<button class="ds-link-action"><svg width="14" height="14"></svg>Add New User</button>', s: 'button' },
  { id: 'menu', scene: 'region-menu', d: `q('[role=listbox]').parentElement`, html: menu(false), s: '.ds-menu', props: without(ALL, 'height') },
  { id: 'menu-option', scene: 'region-menu', d: `q('[role=option]:not([aria-selected=true])')`, html: menu(false), s: '[aria-selected=false]' },
  { id: 'picker', scene: 'picker', d: `q('.shadow-picker')`, html: picker, s: '.ds-picker', props: without(ALL, 'height', 'rowGap', 'columnGap') },
  { id: 'picker-row', scene: 'picker', d: `q('.shadow-picker li')`, html: picker, s: '.ds-picker-row', w: 'deoc', props: without(ALL, 'rowGap', 'columnGap') },
  { id: 'picker-avatar', scene: 'picker', d: `q('.shadow-picker li div div')`, html: picker, s: '.ds-avatar' },
  { id: 'picker-name', scene: 'picker', d: `q('.shadow-picker li span.text-white')`, html: picker, s: '.ds-picker-row__line1', props: TEXT },
  { id: 'picker-footer', scene: 'picker', d: `txt('button', 'Add User')`, html: picker, s: '.ds-picker-footer', w: 'deoc' },
  { id: 'attach-field', scene: 'product-master-add', d: `q('[role=dialog] input[placeholder^="e.g. 8901"]').parentElement`, html: attach, s: '.ds-attach__field', w: 'deoc' },
  { id: 'attach-input', scene: 'product-master-add', d: `q('[role=dialog] input[placeholder^="e.g. 8901"]')`, html: attach, s: '.ds-attach__input', props: [...TEXT, 'backgroundColor'] },
  { id: 'attach-btn', scene: 'product-master-add', d: `q('[role=dialog] input[placeholder^="e.g. 8901"]').parentElement.nextElementSibling`, html: attach, s: '.ds-attach__btn' },
  { id: 'status-toggle-form', scene: 'product-master-add', d: `q('[role=dialog] [role=radiogroup]')`, html: toggle, s: '.ds-toggle', w: 'deoc' },
  { id: 'multi-trigger', scene: 'line-add', d: `txt('span', 'Select the machines on this line').closest('button')`, html: '<div class="ds-select"><button class="ds-select__trigger ds-select__trigger--field"><span class="ds-select__value ds-select__value--placeholder">Select</span></button></div>', s: 'button', w: 'deoc', props: without(ALL, 'color') },
  { id: 'multi-menu', scene: 'line-menu', d: `q('[role=listbox][aria-multiselectable]').parentElement`, html: menu(true), s: '.ds-menu', props: without(ALL, 'height') },
  { id: 'multi-option', scene: 'line-menu', d: `q('[role=listbox][aria-multiselectable] [role=option]')`, html: menu(true), s: '.ds-menu__option--multi', w: 'deoc' },
  { id: 'checkbox', scene: 'line-menu', d: `q('[role=listbox][aria-multiselectable] [role=option] span')`, html: menu(true), s: '.ds-menu__option:not([aria-selected=true]) .ds-check__box' },
  { id: 'menu-action', scene: 'line-menu', d: `txt('li', 'Add New Machine')`, html: menu(true), s: '.ds-menu__action', w: 'deoc' },
  { id: 'dialog', scene: 'delete-dialog', d: `q('[role=dialog] > div:nth-child(2) > div')`, html: '<div class="ds-dialog"><div class="ds-dialog__text"><h2 class="ds-text-dialog-title">Delete?</h2><p class="ds-text-body-muted">x</p></div><div class="ds-dialog__actions"><button class="ds-btn ds-btn--secondary">Cancel</button><button class="ds-btn ds-btn--danger">Delete</button></div></div>', s: '.ds-dialog', props: without(ALL, 'height') },
  { id: 'btn-danger', scene: 'delete-dialog', d: `q('[role=dialog] button:last-child')`, html: '<button class="ds-btn ds-btn--danger">Delete Line</button>', s: 'button' },
  { id: 'popover', scene: 'date-popover', d: `q('[role=dialog][aria-label="Choose date range"]')`, html: '<div style="position:relative"><div class="ds-popover" style="position:static"></div></div>', s: '.ds-popover', props: without(ALL, 'height') },
  { id: 'viewer', scene: 'viewer', d: `q('[role=dialog] > div:nth-child(2) > div')`, html: '<div class="ds-viewer"><div class="ds-media-card__head"><span class="ds-media-card__titles"><h2 class="ds-media-card__title">Cam</h2><span class="ds-media-card__sub">Camera 1</span></span></div><div class="ds-viewer__media"></div></div>', s: '.ds-viewer', props: without(ALL, 'height') },
  { id: 'viewer-head', scene: 'viewer', d: `q('[role=dialog] > div:nth-child(2) > div > div')`, html: '<div class="ds-viewer"><div class="ds-media-card__head"><span class="ds-media-card__titles"><h2 class="ds-media-card__title">Cam</h2></span></div></div>', s: '.ds-media-card__head', w: 'deoc', props: without(ALL, 'height', 'rowGap', 'columnGap') },
  { id: 'viewer-title', scene: 'viewer', d: `q('[role=dialog] > div:nth-child(2) > div > div span.text-heading')`, html: '<div class="ds-viewer"><div class="ds-media-card__head"><h2 class="ds-media-card__title">Cam</h2></div></div>', s: '.ds-media-card__title', props: TEXT },
  { id: 'menu-selected', scene: 'status-menu', d: `q('header [role=option][aria-selected=true]')`, html: menu(false), s: '[aria-selected=true]', w: 'deoc' },
  { id: 'chart-tip', scene: 'heat-tip', d: `q('[role=tooltip]')`, html: tip, s: '.ds-chart-tip', props: without(ALL, 'height') },
  { id: 'chart-tip-head', scene: 'heat-tip', d: `q('[role=tooltip] > div')`, html: tip, s: '.ds-chart-tip__head', props: without(ALL, 'height', 'color', 'fontWeight') },
  { id: 'chart-tip-rows', scene: 'heat-tip', d: `q('[role=tooltip] dl')`, html: tip, s: '.ds-chart-tip__rows', props: without(ALL, 'height', 'color') },
  { id: 'toast', scene: 'toast', d: `q('[role=status]')`, html: '<div class="ds-toast">Copied</div>', s: '.ds-toast', props: without(ALL, 'height', 'rowGap', 'columnGap') },
];

// ── Scenes ──
const goNav = (label) => async page => { await page.getByRole('button', { name: label, exact: true }).first().click(); await page.waitForTimeout(250); };
const click = (name) => async page => { await page.getByRole('button', { name, exact: true }).first().click(); await page.waitForTimeout(250); };
const seq = (...steps) => async page => { for (const s of steps) await s(page); };
const SCENES = {
  'parity': { url: `${BASE}?ds-parity` },
  'live-view': {},
  'factories': { go: goNav('Factories') },
  'cameras': { go: goNav('Cameras') },
  'product-master': { go: goNav('Product Master') },
  'user-management': { go: goNav('User Management') },
  'dashboard': { go: goNav('Dashboard') },
  'factories-add': { go: seq(goNav('Factories'), click('Add factory')) },
  'region-menu': { go: seq(goNav('Factories'), click('Add factory'), async p => { await p.getByText('Enter region name').click(); await p.waitForTimeout(200); }) },
  'picker': { go: seq(goNav('Factories'), click('Add factory'), async p => { await p.getByText('Choose user').click(); await p.waitForTimeout(200); }) },
  'product-master-add': { go: seq(goNav('Product Master'), click('Add Product')) },
  'factory-detail': { go: seq(goNav('Factories'), async p => { await p.getByRole('button', { name: /View factory/ }).first().click(); await p.waitForTimeout(250); }) },
  'line-add': { go: seq(goNav('Factories'), async p => { await p.getByRole('button', { name: /View factory/ }).first().click(); await p.waitForTimeout(250); }, click('Add Line')) },
  'line-menu': { go: seq(goNav('Factories'), async p => { await p.getByRole('button', { name: /View factory/ }).first().click(); await p.waitForTimeout(250); }, click('Add Line'), async p => { await p.getByText('Select the machines on this line').click(); await p.waitForTimeout(200); }) },
  'delete-dialog': { go: seq(goNav('Factories'), async p => { await p.getByRole('button', { name: /View factory/ }).first().click(); await p.waitForTimeout(250); await p.getByRole('button', { name: /^Delete / }).first().click(); await p.waitForTimeout(200); }) },
  'date-popover': { go: seq(goNav('Activity Log'), async p => { await p.locator('header button[aria-haspopup=dialog]').click(); await p.waitForTimeout(200); }) },
  'viewer': { go: async p => { await p.locator('button[aria-label*="Click to expand"]').first().click(); await p.waitForTimeout(250); } },
  'status-menu': { go: seq(goNav('Factories'), async p => { await p.locator('header button[aria-haspopup=listbox]').first().click(); await p.waitForTimeout(200); }) },
  'heat-tip': { go: seq(goNav('Dashboard'), async p => { await p.getByRole('button', { name: /, .*: \d/ }).first().focus(); await p.waitForTimeout(200); }) },
  'toast': { go: seq(goNav('User Management'), async p => { await p.context().grantPermissions(['clipboard-read', 'clipboard-write']); await p.getByRole('button', { name: /^Copy login details/ }).first().click(); await p.waitForTimeout(200); }) },
};

/** In the page: canonical colours, Tailwind's transparent placeholder shadows dropped, huge radii read as "full" */
function measure({ pair, KEYS, css }) {
  const toRgba = (s) => s
    .replace(/oklab\(([-\d.e]+) ([-\d.e]+) ([-\d.e]+)(?: \/ ([\d.]+))?\)/g, (_, L, a, b, al) => {
      const [l, m, s2] = [(+L + 0.3963377774 * a + 0.2158037573 * b) ** 3, (+L - 0.1055613458 * a - 0.0638541728 * b) ** 3, (+L - 0.0894841775 * a - 1.291485548 * b) ** 3];
      const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s2, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s2, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s2];
      const c = lin.map(x => Math.round(255 * Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055))));
      return `rgba(${c.join(',')},${+(+(al ?? 1)).toFixed(3)})`;
    })
    .replace(/rgba?\((\d+), ?(\d+), ?(\d+)(?:, ?([\d.]+))?\)/g, (_, r, g, b, al) => `rgba(${r},${g},${b},${+(+(al ?? 1)).toFixed(3)})`);
  const norm = (k, v) => {
    let s = toRgba(String(v));
    if (k === 'boxShadow') s = s.split(/,(?![^(]*\))/).map(x => x.trim()).filter(x => !/^rgba\(0,0,0,0\) 0px 0px 0px 0px$/.test(x) && !/^rgba\([^)]*,0\)/.test(x)).join(', ') || 'none';
    if (k === 'borderTopLeftRadius' && parseFloat(s) >= 9999) s = 'full';
    if (/^border(Top|Bottom|Left)(Color|Style)$/.test(k)) { const w = k.replace(/Color|Style/, 'Width'); if (window.__w?.[w] === '0px') s = '—'; }
    if ((k === 'rowGap' || k === 'columnGap') && s === 'normal') s = '0px';
    if (k === 'height' || k === 'width') s = `${Math.round(parseFloat(s))}px`;
    return s;
  };
  const q = (sel, r = document) => r.querySelector(sel);
  const txt = (sel, t) => [...document.querySelectorAll(sel)].find(e => e.textContent.trim() === t);
  const P = (row, sel) => document.querySelector(`[data-parity="${row}"] [data-side="deoc"]`)?.querySelector(sel);
  let deoc;
  try { deoc = new Function('q', 'txt', 'P', `return (${pair.d})`)(q, txt, P); } catch (e) { return { error: `DEOC locator threw: ${e.message}` }; }
  if (!deoc) return { error: 'DEOC element not found' };
  document.getElementById('ds02-host')?.remove();
  const host = document.createElement('div');
  host.id = 'ds02-host';
  const sized = pair.w === 'deoc' ? deoc : pair.w ? new Function('q', 'txt', 'P', `return (${pair.w})`)(q, txt, P) : null;
  const width = sized ? sized.getBoundingClientRect().width : 600;
  host.style.cssText = `position:absolute;left:0;top:0;z-index:99999;width:${width}px`;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${css}</style><div>${pair.html}</div>`;
  const ref = shadow.querySelector('div').querySelector(pair.s ?? ':scope > *');
  if (!ref) return { error: `ds element not found: ${pair.s}` };
  const read = (el) => {
    const cs = getComputedStyle(el);
    const raw = Object.fromEntries(KEYS.map(k => [k, k === 'height' || k === 'width' ? `${el.getBoundingClientRect()[k]}px` : cs[k]]));
    window.__w = raw;
    return Object.fromEntries(KEYS.map(k => [k, norm(k, raw[k])]));
  };
  // Text properties only mean something on an element that holds text itself (containers just inherit them)
  const ownText = [...deoc.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const keys = pair.text || ownText ? KEYS : KEYS.filter(k => !['color', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform'].includes(k));
  return { keys, deoc: read(deoc), ds: read(ref) };
}

const filters = process.argv.slice(2);
const pairs = PAIRS.filter(p => !filters.length || filters.some(f => p.id.includes(f)));
const BROWSERS = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const executablePath = BROWSERS.find(p => fs.existsSync(p));
if (!executablePath) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }
const browser = await chromium.launch({ executablePath, headless: true });

let failed = 0;
for (const scene of [...new Set(pairs.map(p => p.scene))]) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1021 }, reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-10-15T10:00:00'));
  await page.addInitScript(() => { try { localStorage.setItem('deoc-design-system', '02'); } catch {} });
  await page.goto(SCENES[scene].url ?? BASE, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*,*::before,*::after{transition-duration:0s!important;animation-play-state:paused!important}' });
  await page.mouse.move(1919, 1020);
  try { await SCENES[scene].go?.(page); } catch (e) { console.log(`FAIL scene ${scene}: ${e.message.split('\n')[0]}`); failed++; await page.close(); continue; }
  await page.mouse.move(1919, 1020);
  for (const pair of pairs.filter(p => p.scene === scene)) {
    const KEYS = pair.props ?? ALL;
    const r = await page.evaluate(measure, { pair, KEYS, css });
    if (r.error) { console.log(`FAIL ${pair.id}: ${r.error}`); failed++; continue; }
    const diffs = r.keys.filter(k => r.deoc[k] !== r.ds[k]);
    console.log(`${diffs.length ? 'FAIL' : 'pass'} ${pair.id}`);
    for (const k of diffs) console.log(`       ${k}: DEOC ${r.deoc[k]}\n       ${' '.repeat(k.length)}  ds   ${r.ds[k]}`);
    if (diffs.length) failed++;
  }
  await page.close();
}
await browser.close();
console.log(`\n${pairs.length - failed}/${pairs.length} components match DEOC Design System 02`);
process.exitCode = failed ? 1 : 0;

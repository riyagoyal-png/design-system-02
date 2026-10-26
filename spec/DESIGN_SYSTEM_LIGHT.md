# DESIGN_SYSTEM_LIGHT.md — Vision Automation, light theme

> The light version of the Vision Automation design system. **Source:** the DEOC light Live View frame in Figma (file `F3mlhgMw589Hs49rxXSFXR`, node `614:11997`, "Figma Make App", 1920 × 911).
> **Scope:** colour only — every colour, gradient, border, shadow, glow and chart token gets a light value here. Type, spacing, sizes, radii, motion and component anatomy are unchanged and stay defined in `spec/DESIGN_SYSTEM.md` (the dark, default theme).
> **How it is built:** `scripts/extract-spec.mjs` appends every CSS block of this file after the dark system in `src/generated/ds.css`. Light mode is on when `<html data-theme="light">` is set; nothing else changes in markup.

---

## Contents

1. [How to use it](#1-how-to-use-it)
2. [What the Figma frame shows](#2-what-the-figma-frame-shows)
3. [Light colour tokens](#3-light-colour-tokens) — surfaces · text · borders · brand · status · overlays · data visualization · shadows
4. [Complete light token file](#4-complete-light-token-file)
5. [Component adjustments](#5-component-adjustments)
6. [Component-by-component colour map](#6-component-by-component-colour-map)
7. [Accessibility notes](#7-accessibility-notes)
8. [Open decisions](#8-open-decisions)

---

## 1. How to use it

```html
<html data-theme="light">   <!-- light theme; omit the attribute (or use "dark") for the default dark theme -->
```

- Components keep their classes. Every component colour reads a semantic token, and this file redefines those tokens under `[data-theme="light"]`.
- Never write a light-only colour in a component. If a component needs a colour the token set does not have, add the token to both themes.
- The camera feed well (`surface-media`) stays dark in light mode, as in the frame: a video feed reads best on near-black.
- The showcase has a **Theme** switch in the page header (Dark / Light) that sets the attribute on `<html>`.

## 2. What the Figma frame shows

Values read from the node properties of `614:11997` (OBSERVED). Everything not visible in the frame is derived from these by the rules in §3 (DERIVED).

| Element (Figma node) | Light value | Token it sets |
|---|---|---|
| Page background (`614:11997`) | `#f4f8ff` | `color-bg-app`, `gradient-app` |
| Sidebar and main panel (`614:12001`, `614:12091`) | fill `#fcfcfe`, 1 px `#edf2f8` border, `0 4px 12px rgba(0,0,0,0.06)`, radius 24 | `gradient-glass-strong`, `border-edge`, `shadow-sidebar`, `shadow-shell` |
| Camera tiles (`614:12130`) and side-panel cards (`614:12222`) | fill `#fefefe`, 1 px `#f3f6f9` border, `0 4px 12px rgba(0,0,0,0.06)` / `0 4px 6px rgba(0,0,0,0.06)` | `gradient-glass`, `shadow-glass` |
| Page title, tile titles, SKU title | `#111827` | `text-primary` |
| Barcode values, user name | `#1f2636` | `text-strong` (new) |
| Filter values, "Live", detected value, health labels | `#475569` | `text-secondary`, `text-emphasis` |
| Nav items, nav group labels, user role | `#77879d` | `text-muted` |
| Card section labels, barcode labels | `#8a99ae` | `text-tertiary` (same as dark) |
| Brand name, current nav label, eyebrow | gradient `#2563eb → #1d4ed8` (rendered as `brand-strong`) | `brand-strong` |
| Tagline "Vision Automation" | `#3b82f6` | `brand` |
| Current nav item | wash `84deg, rgba(33,88,225,0.09) 15% → 0.05 95% → 0`, 1 px `rgba(59,130,246,0.10)` border | `gradient-nav-active`, `nav-active-border` (new) |
| Logo tile border | `rgba(147,197,253,0.30)` | `border-logo` |
| User card | fill `#ffffff`, 1 px `rgba(148,163,184,0.20)`, `2px 2px 24px rgba(0,0,0,0.12)`, glow hidden | `user-card-*` (new) |
| "Live" pill | fill `#f7f8fa`, 1 px `#e8eff5` | `surface-control`, `border-track` |
| Header filter selects (`614:12102`) | fill `#fdfdff`, 1 px `rgba(107,114,128,0.08)`, drop shadow `0 2px 5px rgba(0,0,0,0.08)` | `surface-field`, `border-control`, `shadow-control` |
| Primary button (`614:12123`) | unchanged: `#2563eb → #1d4ed8`, `brand` border, blue drop glow, white label | brand tokens (same) |
| Status pills, camera icon tiles | unchanged: `success-*`, `info-*` tints | status tokens (same) |
| Camera feed well | unchanged `#0b0e13`, image at 50 % | `surface-media` (same) |
| Ambient glows (`614:11999`, `614:12000`) | hidden | `glow-brand`, `glow-success` → transparent |

## 3. Light colour tokens

Rules used to derive the values the frame does not show:

1. **Surfaces** are near-white, one step apart: page `#f4f8ff` → shell `#fcfcfe` → card `#fefefe` → overlays `#ffffff`. Wells and nested groups use a faint blue-grey `#f4f7fc` (the light counterpart of the ice-blue well).
2. **Translucent white overlays become translucent slate** (`rgba(15,23,42,·)`), at roughly the same alpha: a 5 % white hover becomes a 4 % slate hover.
3. **Borders** use the frame's `#edf2f8` as the one edge colour (D-8 holds: change one token to retune every hairline).
4. **Shadows** become soft, neutral and short: the frame's `0 4px 12px rgba(0,0,0,0.06)` is the card shadow; floating layers use slate at 12–18 %. Glows (status dots, primary button, current step) keep their colour.
5. **Brand, status, categorical, heat and tag colours stay the same**, as the frame shows for the primary button, pills and icon tiles. Blue text that was a light tint on dark (`brand-text`, `link`, `info-text`) moves to the deeper blues.
6. **White-on-dark marks** (trend line, trend points) become ink `#111827`.

### 3.1 Surfaces

| Token | Dark | Light | Source |
|---|---|---|---|
| `--ds-color-bg-app` | `#0b1020` | `#f4f8ff` | OBSERVED |
| `--ds-gradient-app` | navy horizontal gradient | `linear-gradient(90deg, #f4f8ff 0%, #f4f8ff 100%)` (flat) | OBSERVED |
| `--ds-color-glow-brand` | blue/10 % | `transparent` | OBSERVED (hidden) |
| `--ds-color-glow-success` | green/8 % | `transparent` | OBSERVED (hidden) |
| `--ds-gradient-glass` | CTA-blue glass | `linear-gradient(180deg, #fefefe 0%, #fefefe 100%)` | OBSERVED (cards) |
| `--ds-gradient-glass-strong` | | `linear-gradient(180deg, #fcfcfe 0%, #fcfcfe 100%)` | OBSERVED (shell) |
| `--ds-gradient-glass-up` | | `linear-gradient(0deg, #f9fbfe 0%, #fefefe 100%)` | DERIVED |
| `--ds-gradient-glass-kpi` | | `linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)` | DERIVED |
| `--ds-gradient-toggle` | | `linear-gradient(180deg, #f1f5fb 0%, #ebf0f8 100%)` | DERIVED |
| `--ds-gradient-toggle-active` | | `linear-gradient(180deg, rgba(59,130,246,0.16) 0%, rgba(37,99,235,0.08) 100%)` | DERIVED |
| `--ds-gradient-table-header-pinned` | | `linear-gradient(rgba(37,99,235,0.03) 0 0), #fefefe` | DERIVED |
| `--ds-color-surface-base` | `#0f172a` | `#ffffff` | DERIVED |
| `--ds-color-surface-raised` | `#0c1325` | `#ffffff` | DERIVED |
| `--ds-color-surface-field` (new) | — | `#fdfdff` | OBSERVED (header selects) |
| `--ds-gradient-dialog` | | `linear-gradient(180deg, #ffffff 0%, #f8fafd 100%)` | DERIVED |
| `--ds-gradient-tooltip` | | `linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%)` | DERIVED |
| `--ds-color-surface-nested` | ice/4 % | `#f4f7fc` | DERIVED |
| `--ds-color-surface-nested-hover` | ice/8 % | `#ebf1fa` | DERIVED |
| `--ds-color-surface-control` | white/4 % | `#f7f8fa` | OBSERVED (Live pill) |
| `--ds-color-surface-control-hover` | white/7 % | `#eef1f5` | DERIVED |
| `--ds-color-surface-hover` | white/5 % | `rgba(15,23,42,0.04)` | DERIVED |
| `--ds-color-surface-hover-subtle` | white/3 % | `rgba(15,23,42,0.025)` | DERIVED |
| `--ds-color-surface-row-hover` | white/2 % | `rgba(15,23,42,0.02)` | DERIVED |
| `--ds-color-surface-selected` | ice/8 % | `rgba(59,130,246,0.08)` | DERIVED |
| `--ds-color-surface-table-header` | white/2 % | `#f7f9fc` | DERIVED |
| `--ds-color-surface-table-header-pinned` | `#151c2e` | `#f7f9fc` | DERIVED |
| `--ds-color-surface-media` | `#0b0e13` | `#0b0e13` | OBSERVED (unchanged) |
| `--ds-color-surface-sunken-button` | `#121620` | `#f1f4f8` | DERIVED |
| `--ds-color-surface-entity-icon` | `#1a2535` | `#eef3fb` | DERIVED |
| `--ds-color-surface-icon-tile` | `#1e293b` | `#eef2f7` | DERIVED |
| `--ds-color-surface-avatar` | `#18202d` | `#eef2f7` | DERIVED |
| `--ds-color-avatar-inner` | `#121622` | `#121622` | OBSERVED (unchanged) |
| `--ds-color-track` | white/8 % | `#e6ebf2` | DERIVED |
| `--ds-color-user-card` (new) | — | `#ffffff` | OBSERVED |

### 3.2 Text

| Token | Dark | Light | Source |
|---|---|---|---|
| `--ds-color-text-primary` | `#ffffff` | `#111827` | OBSERVED |
| `--ds-color-text-strong` (new) | — | `#1f2636` | OBSERVED (barcode values, user name) |
| `--ds-color-text-emphasis` | `#e2e8f0` | `#475569` | OBSERVED (filter values) |
| `--ds-color-text-secondary` | `#cbd5e1` | `#475569` | OBSERVED (detected value, health labels) |
| `--ds-color-text-muted` | `#94a3b8` | `#77879d` | OBSERVED (nav, roles) |
| `--ds-color-text-tertiary` | `#8a99ae` | `#8a99ae` | OBSERVED (unchanged) |
| `--ds-color-text-placeholder` | slate-300/60 % | `#94a3b8` | DERIVED |
| `--ds-color-text-faint` | `#475569` | `#cbd5e1` | DERIVED (decorative only) |
| `--ds-color-text-on-brand` | `#ffffff` | `#ffffff` | OBSERVED |
| `--ds-color-text-on-bright` | `#0b0f14` | `#0b0f14` | same |
| `--ds-color-text-chart-subtle` | `#9eacba` | `#64748b` | DERIVED |
| `--ds-color-text-chart-strong` | `#f4f7fa` | `#111827` | DERIVED |
| `--ds-color-text-tooltip` | `#f4f6f8` | `#111827` | DERIVED |
| `--ds-color-text-tooltip-muted` | `#aeb8c5` | `#64748b` | DERIVED |
| `--ds-color-text-axis` | white/60 % | `rgba(15,23,42,0.55)` | DERIVED |
| `--ds-color-icon` | `#64748b` | `#64748b` | same |
| `--ds-color-icon-chevron` | `#6b7280` | `#6b7280` | OBSERVED |

### 3.3 Borders

| Token | Dark | Light | Source |
|---|---|---|---|
| `--ds-color-border-edge` | white/2 % | `#edf2f8` | OBSERVED (the one hairline) |
| `--ds-color-border-hairline` … `-control` (aliases) | → edge | → edge | OBSERVED |
| `--ds-color-border-track` | → edge | `#e8eff5` | OBSERVED (Live pill) |
| `--ds-color-border-control` | → edge | `rgba(107,114,128,0.08)` | OBSERVED (filter selects) |
| `--ds-color-border-strong` | white/8 % | `#dfe5ee` | DERIVED |
| `--ds-color-border-control-hover` | white/20 % | `#cbd5e1` | DERIVED |
| `--ds-color-border-control-strong` | `#6b7280` | `#6b7280` | same |
| `--ds-color-border-on-brand` | white/30 % | white/30 % | same |
| `--ds-color-border-divider` | `#292e33` | `#e5eaf1` | DERIVED |
| `--ds-color-border-tooltip-divider` | | `#e5eaf1` | DERIVED |
| `--ds-color-border-avatar` | `#334155` | `#cbd5e1` | DERIVED |
| `--ds-color-border-logo` | `#333333` | `rgba(147,197,253,0.30)` | OBSERVED |
| `--ds-color-border-user-card` (new) | — | `rgba(148,163,184,0.20)` | OBSERVED |
| `--ds-color-nav-active-border` (new) | — | `rgba(59,130,246,0.10)` | OBSERVED |
| `--ds-color-scrollbar` / `-hover` | white/12 % / 20 % | slate/15 % / 25 % | DERIVED |
| `--ds-color-skeleton` | white/6 % | slate/6 % | DERIVED |

### 3.4 Brand & interactive

| Token | Dark | Light | Source |
|---|---|---|---|
| `--ds-color-brand`, `-strong`, `-stronger`, primary gradients, brand tints, avatar gradients, focus ring | | unchanged | OBSERVED (primary button, tagline) |
| `--ds-gradient-nav-active` | blue wash + white sheen | `linear-gradient(84deg, rgba(33,88,225,0.09) 15%, rgba(33,88,225,0.05) 95%, rgba(33,88,225,0) 132%)` | OBSERVED |
| `--ds-color-brand-text` | `#93c5fd` | `#1d4ed8` | DERIVED |
| `--ds-color-link` | `#60a5fa` | `#2563eb` | DERIVED |
| `--ds-color-link-hover` | `#93c5fd` | `#1d4ed8` | DERIVED |
| `--ds-color-stepper-track` | `#1f2636` | `#e2e8f0` | DERIVED |
| `--ds-gradient-stepper-active` | brand/60 % → `#1f2636` | brand/60 % → `#e2e8f0` | DERIVED |
| `--ds-gradient-sheen` | | unchanged (unused) | — |
| `--ds-color-focus-ring-on-color` | `#ffffff` | `#ffffff` | same |

### 3.5 Status

Every status token keeps its dark value (OBSERVED: the frame's "Matched" and "Active" pills use `success-bg`, `success-border` and `success-text` unchanged). `--ds-color-info-text` moves from `#93c5fd` to `#1d4ed8` (DERIVED, readable on white). Row tints (`row-warning`, `row-critical`) and `alert-count` are unchanged.

### 3.6 Overlays

| Token | Dark | Light |
|---|---|---|
| `--ds-color-scrim` | black/50 % | `rgba(15,23,42,0.30)` |
| `--ds-overlay-blur` | 4px | 4px |

### 3.7 Data visualization

Categorical (`chart-cat-1…4`), heat (`heat-0…4`), tag and status-chart colours are unchanged, so a chart means the same in both themes. Changes:

| Token | Dark | Light |
|---|---|---|
| `--ds-chart-trend` | `#ffffff` | `#111827` |
| `--ds-chart-baseline` | white/6 % | `rgba(15,23,42,0.08)` |
| `--ds-chart-axis` | `#292e33` | `#e5eaf1` |
| `--ds-chart-bubble-stroke` | `#151c22` | `#ffffff` |
| `--ds-chart-track` | → `color-track` | → `color-track` (`#e6ebf2`) |

### 3.8 Shadows & effects

| Token | Light | Source |
|---|---|---|
| `--ds-shadow-glass` | `0 4px 12px 0 rgba(0,0,0,0.06)` | OBSERVED (cards, tiles) |
| `--ds-shadow-glass-soft` | `0 4px 12px -4px rgba(0,0,0,0.06)` | DERIVED |
| `--ds-shadow-control` | `0 2px 5px 0 rgba(0,0,0,0.08)` | OBSERVED (filter selects) |
| `--ds-shadow-field` | `0 1px 2px 0 rgba(15,23,42,0.04)` | DERIVED |
| `--ds-shadow-xs` | `0 1px 2px 0 rgba(15,23,42,0.05)` | DERIVED |
| `--ds-shadow-highlight` | `inset 0 1px 0 0 rgba(255,255,255,0.60)` | DERIVED |
| `--ds-shadow-card` | `0 2px 12px 0 rgba(15,23,42,0.06), 0 1px 3px 0 rgba(15,23,42,0.04)` | DERIVED |
| `--ds-shadow-float-drop` | `0 12px 28px -8px rgba(15,23,42,0.12), 0 4px 10px -2px rgba(15,23,42,0.06)` | DERIVED |
| `--ds-shadow-kpi-lift` | `0 1px 2px 0 rgba(15,23,42,0.03)` | DERIVED |
| `--ds-shadow-sidebar` | `0 4px 12px 0 rgba(0,0,0,0.06)` | OBSERVED |
| `--ds-shadow-shell` | `0 4px 12px 0 rgba(0,0,0,0.06)` | OBSERVED |
| `--ds-shadow-drawer` / `-mirrored` | `∓12px 0 32px 0 rgba(15,23,42,0.12), ∓1px 0 0 0 #edf2f8` | DERIVED |
| `--ds-shadow-modal` | `0 24px 48px -12px rgba(15,23,42,0.18)` | DERIVED |
| `--ds-shadow-elevated` | `0 4px 24px rgba(15,23,42,0.12)` | DERIVED |
| `--ds-shadow-tooltip` | `0 8px 24px 0 rgba(15,23,42,0.12)` | DERIVED |
| `--ds-shadow-button-primary` | unchanged | OBSERVED |
| `--ds-shadow-close` | `inset 0 1px 2px 0 rgba(15,23,42,0.08)` | DERIVED |
| `--ds-shadow-stepper-active` | unchanged | — |
| `--ds-shadow-stepper-idle` | `inset 0 1px 2px 0 rgba(15,23,42,0.08)` | DERIVED |
| `--ds-shadow-avatar`, `-avatar-orb`, `-status-*` | unchanged | — |
| `--ds-shadow-header-scrolled` / `-footer-scrolled` | `0 ±8px 16px -8px rgba(15,23,42,0.12)` | DERIVED |
| `--ds-shadow-user-card` (new) | `2px 2px 24px 0 rgba(0,0,0,0.12)` | OBSERVED |
| `--ds-shadow-edge`, `-edge-bottom`, `-surface`, `-float` | same formulas; resolve to the light edge colour | — |

## 4. Complete light token file

Every colour, gradient and shadow token of `spec/DESIGN_SYSTEM.md` §3 is redeclared here, including the ones whose value does not change, so this block alone is the complete light palette.

```css
[data-theme="light"] {
  color-scheme: light;

  /* ── Surfaces ─────────────────────────────────────────── */
  --ds-color-bg-app: #f4f8ff;
  --ds-gradient-app: linear-gradient(90deg, #f4f8ff 0%, #f4f8ff 100%);
  --ds-color-glow-brand: transparent;
  --ds-color-glow-success: transparent;
  --ds-gradient-glass: linear-gradient(180deg, #fefefe 0%, #fefefe 100%);
  --ds-gradient-glass-strong: linear-gradient(180deg, #fcfcfe 0%, #fcfcfe 100%);
  --ds-gradient-glass-up: linear-gradient(0deg, #f9fbfe 0%, #fefefe 100%);
  --ds-gradient-glass-kpi: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  --ds-gradient-edge-control: linear-gradient(var(--ds-color-border-control), var(--ds-color-border-control));
  --ds-gradient-toggle: linear-gradient(180deg, #f1f5fb 0%, #ebf0f8 100%);
  --ds-gradient-toggle-active: linear-gradient(180deg, rgba(59,130,246,0.16) 0%, rgba(37,99,235,0.08) 100%);
  --ds-gradient-table-header-pinned: linear-gradient(rgba(37,99,235,0.03) 0 0), #fefefe;
  --ds-color-surface-base: #ffffff;
  --ds-color-surface-raised: #ffffff;
  --ds-color-surface-field: #fdfdff;
  --ds-gradient-dialog: linear-gradient(180deg, #ffffff 0%, #f8fafd 100%);
  --ds-gradient-tooltip: linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%);
  --ds-color-surface-nested: #f4f7fc;
  --ds-color-surface-nested-hover: #ebf1fa;
  --ds-color-surface-control: #f7f8fa;
  --ds-color-surface-control-hover: #eef1f5;
  --ds-color-surface-hover: rgba(15,23,42,0.04);
  --ds-color-surface-hover-subtle: rgba(15,23,42,0.025);
  --ds-color-surface-row-hover: rgba(15,23,42,0.02);
  --ds-color-surface-selected: rgba(59,130,246,0.08);
  --ds-color-surface-table-header: #f7f9fc;
  --ds-color-surface-table-header-pinned: #f7f9fc;
  --ds-color-surface-media: #0b0e13;
  --ds-color-surface-sunken-button: #f1f4f8;
  --ds-color-surface-entity-icon: #eef3fb;
  --ds-color-surface-icon-tile: #eef2f7;
  --ds-color-surface-avatar: #eef2f7;
  --ds-color-avatar-inner: #121622;
  --ds-color-track: #e6ebf2;
  --ds-color-user-card: #ffffff;

  /* ── Text ─────────────────────────────────────────────── */
  --ds-color-text-primary: #111827;
  --ds-color-text-strong: #1f2636;
  --ds-color-text-emphasis: #475569;
  --ds-color-text-secondary: #475569;
  --ds-color-text-muted: #77879d;
  --ds-color-text-tertiary: #8a99ae;
  --ds-color-text-placeholder: #94a3b8;
  --ds-color-text-faint: #cbd5e1;
  --ds-color-text-on-brand: #ffffff;
  --ds-color-text-on-bright: #0b0f14;
  --ds-color-text-chart-subtle: #64748b;
  --ds-color-text-chart-strong: #111827;
  --ds-color-text-tooltip: #111827;
  --ds-color-text-tooltip-muted: #64748b;
  --ds-color-text-axis: rgba(15,23,42,0.55);
  --ds-color-icon: #64748b;
  --ds-color-icon-chevron: #6b7280;

  /* ── Borders ──────────────────────────────────────────── */
  --ds-color-border-edge: #edf2f8;
  --ds-color-border-hairline: var(--ds-color-border-edge);
  --ds-color-border-glass: var(--ds-color-border-edge);
  --ds-color-border-track: #e8eff5;
  --ds-color-border-faint: var(--ds-color-border-edge);
  --ds-color-border-subtle: var(--ds-color-border-edge);
  --ds-color-border-control: rgba(107,114,128,0.08);
  --ds-color-border-strong: #dfe5ee;
  --ds-color-border-control-hover: #cbd5e1;
  --ds-color-border-control-strong: #6b7280;
  --ds-color-border-on-brand: rgba(255,255,255,0.30);
  --ds-color-border-divider: #e5eaf1;
  --ds-color-border-tooltip-divider: #e5eaf1;
  --ds-color-border-avatar: #cbd5e1;
  --ds-color-border-logo: rgba(147,197,253,0.30);
  --ds-color-border-user-card: rgba(148,163,184,0.20);
  --ds-color-nav-active-border: rgba(59,130,246,0.10);
  --ds-color-scrollbar: rgba(15,23,42,0.15);
  --ds-color-scrollbar-hover: rgba(15,23,42,0.25);
  --ds-color-skeleton: rgba(15,23,42,0.06);

  /* ── Brand ────────────────────────────────────────────── */
  --ds-color-brand: #3b82f6;
  --ds-color-brand-strong: #2563eb;
  --ds-color-brand-stronger: #1d4ed8;
  --ds-gradient-button-primary: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  --ds-gradient-button-primary-hover: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  --ds-gradient-nav-active: linear-gradient(84deg, rgba(33,88,225,0.09) 15%, rgba(33,88,225,0.05) 95%, rgba(33,88,225,0) 132%);
  --ds-gradient-sheen: linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.30) 50%, rgba(96,165,250,0) 100%);
  --ds-color-brand-text: #1d4ed8;
  --ds-color-link: #2563eb;
  --ds-color-link-hover: #1d4ed8;
  --ds-color-brand-tint-10: rgba(59,130,246,0.10);
  --ds-color-brand-tint-20: rgba(59,130,246,0.20);
  --ds-color-brand-tint-30: rgba(59,130,246,0.30);
  --ds-color-brand-border-hover: rgba(59,130,246,0.40);
  --ds-color-brand-avatar-border: rgba(147,197,253,0.30);
  --ds-gradient-brand-ring: linear-gradient(45deg, #3b82f6 0%, #818cf8 100%);
  --ds-gradient-brand-avatar: linear-gradient(45deg, #1d4ed8 0%, #6366f1 100%);
  --ds-color-stepper-track: #e2e8f0;
  --ds-color-stepper-active-border: rgba(37,99,235,0.40);
  --ds-gradient-stepper-active: linear-gradient(90deg, rgba(59,130,246,0.60) 0%, #e2e8f0 100%);
  --ds-color-focus-ring: #3b82f6;
  --ds-color-focus-ring-on-color: #ffffff;

  /* ── Status ───────────────────────────────────────────── */
  --ds-color-success-text: #34d399;
  --ds-color-success-glow: #10b981;
  --ds-color-success-bg: rgba(16,185,129,0.10);
  --ds-color-success-border: rgba(16,185,129,0.20);
  --ds-gradient-progress-success: linear-gradient(90deg, #34d399 0%, #10b981 100%);
  --ds-color-warning-text: #fbbf24;
  --ds-color-warning-bg: rgba(251,191,36,0.10);
  --ds-color-warning-border: rgba(251,191,36,0.20);
  --ds-color-danger: #ff5825;
  --ds-color-danger-text: #ff7043;
  --ds-color-danger-bg: rgba(255,88,37,0.10);
  --ds-color-danger-bg-hover: rgba(255,88,37,0.20);
  --ds-color-danger-border: rgba(255,88,37,0.20);
  --ds-color-error: #fb7185;
  --ds-color-error-text: #fb7185;
  --ds-color-live: #d33434;
  --ds-color-live-halo: rgba(211,52,52,0.40);
  --ds-color-info-text: #1d4ed8;
  --ds-color-info-bg: rgba(59,130,246,0.10);
  --ds-color-info-border: rgba(59,130,246,0.20);
  --ds-color-row-warning: rgba(251,191,36,0.03);
  --ds-color-row-critical: rgba(255,88,37,0.03);
  --ds-color-alert-count: #fb7185;

  /* ── Overlays ─────────────────────────────────────────── */
  --ds-color-scrim: rgba(15,23,42,0.30);
  --ds-overlay-blur: 4px;

  /* ── Data visualization ───────────────────────────────── */
  --ds-chart-cat-1: #016ffe;
  --ds-chart-cat-2: #8b34fd;
  --ds-chart-cat-3: #fbb645;
  --ds-chart-cat-4: #00bac9;
  --ds-chart-positive: var(--ds-color-success-glow);
  --ds-chart-negative: var(--ds-color-danger);
  --ds-chart-running: var(--ds-color-success-text);
  --ds-chart-stopped: var(--ds-color-danger);
  --ds-chart-trend: #111827;
  --ds-chart-track: var(--ds-color-track);
  --ds-chart-baseline: rgba(15,23,42,0.08);
  --ds-chart-axis: #e5eaf1;
  --ds-chart-bubble-stroke: #ffffff;
  --ds-heat-0: #003e3a;
  --ds-heat-1: #116035;
  --ds-heat-2: #597730;
  --ds-heat-3: #d18732;
  --ds-heat-4: #ff5825;
  --ds-tag-purple: #4d3f9d;
  --ds-tag-blue: #3f779d;
  --ds-tag-green: #457e32;
  --ds-tag-amber: #95693c;
  --ds-tag-rose: #9d3f5a;

  /* ── Shadows & effects ────────────────────────────────── */
  --ds-shadow-glass: 0 4px 12px 0 rgba(0,0,0,0.06);
  --ds-shadow-glass-soft: 0 4px 12px -4px rgba(0,0,0,0.06);
  --ds-shadow-control: 0 2px 5px 0 rgba(0,0,0,0.08);
  --ds-shadow-field: 0 1px 2px 0 rgba(15,23,42,0.04);
  --ds-shadow-xs: 0 1px 2px 0 rgba(15,23,42,0.05);
  --ds-shadow-highlight: inset 0 1px 0 0 rgba(255,255,255,0.60);
  --ds-shadow-card: 0 2px 12px 0 rgba(15,23,42,0.06), 0 1px 3px 0 rgba(15,23,42,0.04);
  --ds-shadow-float-drop: 0 12px 28px -8px rgba(15,23,42,0.12), 0 4px 10px -2px rgba(15,23,42,0.06);
  --ds-shadow-float: var(--ds-shadow-float-drop), var(--ds-shadow-edge);
  --ds-shadow-kpi-lift: 0 1px 2px 0 rgba(15,23,42,0.03);
  --ds-shadow-edge: inset 0 0 0 1px var(--ds-color-border-edge);
  --ds-shadow-edge-bottom: inset 0 -1px 0 0 var(--ds-color-border-edge);
  --ds-shadow-surface: var(--ds-shadow-glass), var(--ds-shadow-edge);
  --ds-shadow-sidebar: 0 4px 12px 0 rgba(0,0,0,0.06);
  --ds-shadow-shell: 0 4px 12px 0 rgba(0,0,0,0.06);
  --ds-shadow-drawer: -12px 0 32px 0 rgba(15,23,42,0.12), -1px 0 0 0 #edf2f8;
  --ds-shadow-drawer-mirrored: 12px 0 32px 0 rgba(15,23,42,0.12), 1px 0 0 0 #edf2f8;
  --ds-shadow-modal: 0 24px 48px -12px rgba(15,23,42,0.18);
  --ds-shadow-elevated: 0 4px 24px rgba(15,23,42,0.12);
  --ds-shadow-tooltip: 0 8px 24px 0 rgba(15,23,42,0.12);
  --ds-shadow-button-primary: 0 4px 7px 0 rgba(37,99,235,0.35), inset 0 1px 0 0 rgba(255,255,255,0.28);
  --ds-shadow-close: inset 0 1px 2px 0 rgba(15,23,42,0.08);
  --ds-shadow-stepper-active: 0 0 0 2px rgba(59,130,246,0.20), 0 0 20px -2px rgba(37,99,235,0.45), inset 0 1px 1px 1px rgba(255,255,255,0.35);
  --ds-shadow-stepper-idle: inset 0 1px 2px 0 rgba(15,23,42,0.08);
  --ds-shadow-avatar: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10);
  --ds-shadow-avatar-orb: 0 7px 10px -2px rgba(59,130,246,0.30), 0 3px 4px -3px rgba(59,130,246,0.30);
  --ds-shadow-header-scrolled: 0 8px 16px -8px rgba(15,23,42,0.12);
  --ds-shadow-footer-scrolled: 0 -8px 16px -8px rgba(15,23,42,0.12);
  --ds-shadow-status-success: 0 0 10px 0 #10b981, 0 0 2px 0 #34d399;
  --ds-shadow-status-warning: 0 0 10px 0 #fbbf24, 0 0 2px 0 #fbbf24;
  --ds-shadow-status-error: 0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825;
  --ds-shadow-user-card: 2px 2px 24px 0 rgba(0,0,0,0.12);
  --ds-error-ring: 0 0 0 1px var(--ds-color-error);
}
```

## 5. Component adjustments

Most components need nothing beyond the tokens. These rules cover what the light frame draws differently from the dark one, still using tokens only:

| Component | Light treatment (frame) |
|---|---|
| Sidebar (§5.37) | `gradient-glass-strong` fill like the main panel (`#fcfcfe`) and the 1 px edge |
| Brand name, current nav label, eyebrow | `brand-strong` text (the frame paints the `#2563eb → #1d4ed8` gradient into the text) |
| Brand tagline | `brand` text |
| Current nav item | `gradient-nav-active` wash with a 1 px `nav-active-border` ring instead of `shadow-card` |
| User card | `user-card` fill, `border-user-card`, `shadow-user-card`; the blue glow behind it is hidden |
| Barcode values, user name | `text-strong` |
| Header filter selects and header search | `surface-field` fill with the `border-control` stroke and `shadow-control` (the dark header puts them on the card surface) |
| Camera tile header divider | `border-edge` (the frame's divider is invisible white/2 %) |
| Brand logo | the blue-gradient Unilever mark (`public/assets/logo-unilever-light.svg`, exported from the frame) replaces the white one |

```css
[data-theme="light"] .ds-sidebar { background: var(--ds-gradient-glass-strong); box-shadow: var(--ds-shadow-sidebar), var(--ds-shadow-edge); }
[data-theme="light"] .ds-sidebar__name, [data-theme="light"] .ds-strip__eyebrow { color: var(--ds-color-brand-strong); }
[data-theme="light"] .ds-sidebar__tagline { color: var(--ds-color-brand); }
[data-theme="light"] .ds-nav__item[aria-current="page"] { color: var(--ds-color-brand-strong); box-shadow: inset 0 0 0 1px var(--ds-color-nav-active-border); }
[data-theme="light"] .ds-user-card { background: var(--ds-color-user-card); border-color: var(--ds-color-border-user-card); box-shadow: var(--ds-shadow-user-card); }
[data-theme="light"] .ds-user-card::before { content: none; }
[data-theme="light"] .ds-user-card__name, [data-theme="light"] .ds-fieldlist dd, [data-theme="light"] .ds-strip__fields dd { color: var(--ds-color-text-strong); }
[data-theme="light"] .ds-page-header__actions .ds-select__trigger--filter,
[data-theme="light"] .ds-page-header__actions .ds-search__input { background: var(--ds-color-surface-field); box-shadow: var(--ds-shadow-control), inset 0 0 0 1px var(--ds-color-border-control); }
[data-theme="light"] .ds-media-card__head { border-bottom-color: var(--ds-color-border-edge); }
[data-theme="light"] .ds-sidebar__logo img[src$="logo-unilever.svg"] { content: url("/assets/logo-unilever-light.svg"); }
[data-theme="light"] .ds-trend__label { text-shadow: 0 1px 3px rgba(255,255,255,0.9); }
```

## 6. Component-by-component colour map

What each component reads in light mode (dark-mode anatomy and states are unchanged; see `DESIGN_SYSTEM.md` §5).

| § | Component | Fill | Border / edge | Text | Shadow |
|---|---|---|---|---|---|
| 5.1 | Button — primary | `#2563eb → #1d4ed8` | `#3b82f6` | `#ffffff` | blue glow (unchanged) |
| 5.1 | Button — secondary | `#fefefe` | `rgba(107,114,128,0.08)` | `#475569` | `shadow-field` |
| 5.1 | Button — subtle / section | `#f7f8fa` (hover `#eef1f5`) | `#edf2f8` | `#475569` | — |
| 5.1 | Button — ghost | transparent (hover slate/4 %) | — | `#77879d` → `#111827` | — |
| 5.1 | Button — tonal / danger | brand / danger tints (unchanged) | | `#1d4ed8` / `#ff7043` | — |
| 5.2 | Icon button / close | transparent / `#f1f4f8` | — / `#edf2f8` | `#77879d` | — / inset `shadow-close` |
| 5.5 | Input, textarea, attach field | `#fefefe` | `#edf2f8` (inset edge) | `#111827`, placeholder `#94a3b8` | `shadow-field` |
| 5.8 | Field label · required · error | — | — | `#77879d` · `#fb7185` · `#fb7185` | — |
| 5.9 | Select — filter (page header) | `#fdfdff` | `rgba(107,114,128,0.08)` | `#475569` | `0 2px 5px rgba(0,0,0,0.08)` |
| 5.9 | Select — filter (in forms) / field | `#fefefe` | `#edf2f8` | `#475569` / `#111827` | `shadow-control` / `shadow-field` |
| 5.10 | Menu · option · selected | `#ffffff` · — · slate/4 % | float edge `#edf2f8` | `#77879d` → `#111827` | `shadow-float` |
| 5.12 | Checkbox | — (checked `#2563eb`) | `#cbd5e1` | — | — |
| 5.13 | Radio card | transparent (selected `#f4f7fc`) | `#cbd5e1` (selected `#2563eb`) | `#94a3b8` (selected `#111827`) | — |
| 5.14 / 5.39 | Toggle / tabs track · selected | `#f1f5fb → #ebf0f8` · blue/16 → 8 % | `#edf2f8` | `#77879d` · `#111827` | — |
| 5.17 | Dropzone | `#fefefe` | dashed `rgba(107,114,128,0.08)`, hover `#3b82f6` | `#475569`, hint `#94a3b8` | — |
| 5.19 | Rich picker | `#ffffff`, rows divided by `rgba(107,114,128,0.08)`, footer `#f4f7fc` | | `#111827` / `#77879d`, footer `#2563eb` | `shadow-float` |
| 5.22 | Stepper | current `#2563eb`; idle `#f1f4f8` | `#dfe5ee` | `#111827` / `#2563eb` / `#475569` / `#8a99ae` | active glow / inset idle |
| 5.23 | KPI card | `#ffffff → #fbfcff` | `#edf2f8` | label `#77879d`, value `#111827` | `0 4px 12px rgba(0,0,0,0.06)` |
| 5.24 | Entity card · well | `#fefefe` · `#f4f7fc` | `#edf2f8` | `#111827`, `#77879d`, role `#3b82f6` | `shadow-surface` |
| 5.25 / 5.26 | Dashboard / status card | `#fefefe` | `#edf2f8` | title `#111827`, subtitle `#64748b` | `shadow-surface` |
| 5.27 | Badge — tinted | status tints (unchanged) | status borders | status text (unchanged) | — |
| 5.27 | Badge — glass / Live pill | `#fefefe` / `#f7f8fa` | `#edf2f8` / `#e8eff5` | status text / `#111827` | `shadow-control` / — |
| 5.29 | Tag | solid tag colours (unchanged) | — | `#111827` → **white on tags** (see §7) | — |
| 5.30 | Count pill | `#f7f8fa` | `#edf2f8` | `#475569` | — |
| 5.31 | Info chip | blue/10 % | blue/20 % | `#1d4ed8` | — |
| 5.32 | Avatar — neutral / brand / photo | `#eef2f7` / brand gradient / ring | `#cbd5e1` | `#475569` / white | — / `shadow-avatar` |
| 5.34 | Progress / segmented bar | track `#e6ebf2`; fills unchanged | — | `#0b0f14` | — |
| 5.35 | Side-panel cards | `#fefefe` | `#edf2f8` | label `#8a99ae`, values `#1f2636`, title `#111827` | `0 4px 12px rgba(0,0,0,0.06)` |
| 5.36 | Camera tile | `#fefefe`, feed `#0b0e13` | `#edf2f8` (hover blue/40 %) | title `#111827`, detected `#475569` | `0 4px 12px rgba(0,0,0,0.06)` |
| 5.37 | Sidebar · current item · user card | `#fcfcfe` · blue wash · `#ffffff` | `#edf2f8` · blue/10 % · slate-400/20 % | `#77879d` · `#2563eb` · `#1f2636` | soft shell · — · `2px 2px 24px rgba(0,0,0,0.12)` |
| 5.38 | Page header | none | none | `#111827` | scrolled: slate/12 % |
| 5.40 | Pagination | `#f9fbfe → #fefefe`; buttons `#f7f8fa`, current `#2563eb` | `#edf2f8` | `#77879d`, numbers `#111827` | current `shadow-card` |
| 5.41 | Table · header · row hover | — · `#f7f9fc` · slate/2 % | — | header `#77879d`, first column `#111827`, cells `#475569` | pinned: slate/12 % |
| 5.42 / 5.43 | Table card / section card · nested | `#fefefe` · `#f4f7fc` | `#edf2f8` | `#111827` | `shadow-float-drop` / `shadow-glass-soft` |
| 5.44 / 5.45 | Overlay · modal · dialog | scrim slate/30 % · `#ffffff → #f8fafd` | `#edf2f8` | `#111827` / `#77879d` | `shadow-modal` |
| 5.46 | Slide panel | body `#f4f8ff`, header `#fefefe`, footer `#f9fbfe → #fefefe` | `#edf2f8` | `#111827` | `-12px 0 32px slate/12 %` |
| 5.47 / 5.48 | Popover / toast | `#ffffff` | `#edf2f8` | `#111827` | `shadow-float` / `shadow-elevated` |
| 5.49 / 7.9 | Tooltips | `#ffffff → #f6f8fc` | `#edf2f8` | `#111827`, labels `#64748b` | `0 8px 24px slate/12 %` |
| 7 | Charts | track `#e6ebf2`, baseline `#edf2f8` | axis `#e5eaf1` | axis `slate/55 %`, labels `#111827`, trend `#111827` | — |

## 7. Accessibility notes

The frame keeps several dark-theme colours that are too light for text on white. They are reproduced as drawn (the reference is final), and listed here so a product can opt into the AA alternatives:

| Use | Frame colour | Contrast on `#fefefe` | AA alternative (≥ 4.5:1) |
|---|---|---|---|
| Success pill text "Matched / Active" | `#34d399` | 1.9:1 | `#047857` |
| Danger text | `#ff7043` | 2.8:1 | `#c2410c` |
| Warning text | `#fbbf24` | 1.7:1 | `#b45309` |
| Validation / required | `#fb7185` | 2.7:1 | `#be123c` |
| Muted text (nav, roles) | `#77879d` | 3.6:1 | `#64748b` |
| Tertiary text (section labels) | `#8a99ae` | 2.9:1 | `#64748b` |
| Brand tagline / role | `#3b82f6` | 3.6:1 | `#2563eb` |

Non-text marks (dots, bars, heat cells, the focus ring `#3b82f6` at 3.6:1) meet the 3:1 minimum. The focus ring, keyboard behaviour and every other §9 rule of `DESIGN_SYSTEM.md` apply unchanged.

## 8. Open decisions

- **AA text colours** (§7): adopt the alternatives for production, or keep the frame's colours? Recommended: adopt them for status text and validation; keep the frame's greys only if the design review accepts 3.6:1.
- **Screens beyond Live View**: the light frame covers the shell, header, camera tiles, side-panel cards and status pills. Every other component's light colours are derived (§3 rules) and should be reviewed against light frames when they exist.
- **DEOC**: the DEOC app has no light theme yet. It can adopt this palette the same way it mirrors the dark tokens (a `[data-theme='light']` block of `--ds2-*` values).

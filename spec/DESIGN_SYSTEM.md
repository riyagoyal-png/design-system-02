# DESIGN_SYSTEM.md — Vision Automation Design Language

> The canonical, implementation-ready specification of the **Vision Automation** design system (Unilever DEOC vision-inspection console).
> It was reconstructed from eight Figma screens (file `F3mlhgMw589Hs49rxXSFXR`, nodes listed in §0.6) that had no published styles, variables or component library.
> Structure (type scale, spacing grid, component anatomy, behavior, accessibility) is carried over from the previous DEOC system; the visual language (surfaces, color, depth, status, charts) comes from the Figma screens.
> **Reference implementation (D-10, 2026-10-24):** the DEOC application (`DEOC App Main View Prototype`) rendered in its default **Design System 02** is final. Every value in this file — card styling, colours, shadows, effects, type, spacing and sizes — matches what that app renders. Where the Figma frames and DEOC disagree, DEOC wins; `npm run check:deoc` proves the match component by component (§13).
> **This file is the single source of truth.** `scripts/extract-spec.mjs` copies every CSS block below, in document order, into `src/generated/ds.css`. Nothing in the showcase may restyle a component outside this file.

---

## Table of contents

0. [How to read this document](#0-how-to-read-this-document)
1. [Design language in one page](#1-design-language-in-one-page)
2. [Foundations](#2-foundations) — 2.1 Color primitives · 2.2 Semantic color tokens · 2.3 Typography · 2.4 Spacing · 2.5 Radii · 2.6 Borders · 2.7 Shadows, effects & elevation · 2.8 Size tokens · 2.9 Motion · 2.10 Z-index · 2.11 Iconography & asset registry · 2.12 Imagery · 2.13 Density modes
3. [Complete token file](#3-complete-token-file)
4. [Base / global CSS](#4-base--global-css)
5. [Component specifications](#5-component-specifications)
6. [Page layout patterns](#6-page-layout-patterns)
7. [Data visualization system](#7-data-visualization-system)
8. [Responsive rules](#8-responsive-rules)
9. [Accessibility rules (WCAG 2.2 AA)](#9-accessibility-rules-wcag-22-aa)
10. [Implementation rules](#10-implementation-rules)
11. [Inconsistency resolution log](#11-inconsistency-resolution-log)
12. [Worked examples (the eight screens)](#12-worked-examples-the-eight-screens)
13. [Final QA checklist](#13-final-qa-checklist)
14. [Changelog](#14-changelog)
15. [Open decisions & known gaps](#15-open-decisions--known-gaps)

---

## 0. How to read this document

### 0.1 Layers

| Layer | Contains | Where | Strength |
|---|---|---|---|
| **L1 · Foundations** | Color, gradients, effects, type, spacing, radii, borders, shadows, sizes, motion, focus, iconography | §2, §3, §4 | **MUST**. Never invent a value; use a token. |
| **L2 · Components** | Anatomy, dimensions, states, behavior and accessibility of each reusable component | §5, §7 | **MUST** match when the component is used. |
| **L3 · Layout patterns** | Shell, page header, toolbars, KPI rows, tables, dashboards, forms, drawers, modals | §6 | **SHOULD**. Deviate only for content or workflow reasons, using L1/L2 parts. |
| **L4 · Product decisions** | Choices specific to the DEOC product (which filters exist, labels, page order) | marked **[PRODUCT DECISION]** | **MAY**. Reference only. |
| **L5 · Extensions** | Patterns the eight screens do not show, derived from the language so nobody invents their own | marked **[EXTENSION]** | **MAY**. Build it this way if you need it. |

Keywords follow RFC 2119 (**MUST**, **SHOULD**, **MAY**).

### 0.2 Provenance tags

| Tag | Meaning |
|---|---|
| **[OBSERVED]** | Read from the Figma node properties (fills, strokes, effects, auto-layout, text styles). Exact values. Untagged values are OBSERVED. |
| **[PRESERVED]** | Structural value carried over unchanged from the previous DEOC system (type steps, spacing grid, control heights, behavior, accessibility), because the Figma screens do not contradict it. |
| **[STANDARDIZED]** | The Figma screens disagree with each other, or a Figma value fails accessibility. One value was chosen on its merits; the reason is in §11. |
| **[EXTENSION]** | Not present in the eight screens. Derived from the extracted language. |
| **[INFERRED]** | A value Figma cannot provide (hover, focus, error states; opaque fallbacks). Chosen to sit within the observed language and listed in §15.2. |

### 0.3 Conventions

- Dimensions are CSS pixels at 1 rem = 16 px. "Height" of a control is its outer border-box height (`box-sizing: border-box` everywhere).
- `rgba(255,255,255,0.03)` is written **white/3%**; `rgba(0,0,0,0.5)` is **black/50%**.
- Weights: 400 regular, 500 medium, 600 semibold, 700 bold.
- **Token shorthand:** in tables a bare name stands for its custom property: `text-muted` → `--ds-color-text-muted`, `shadow-glass` → `--ds-shadow-glass`, `radius-card` → `--ds-radius-card`, `space-6` → `--ds-space-6`, `gradient-glass` → `--ds-gradient-glass`.
- Token names use `--ds-`; classes use `ds-`.
- Contrast ratios are WCAG 2.x ratios **computed on the composited surface**: translucent layers are flattened onto the lightest point of the app gradient (`#0f172a`) before measuring (§9.1).
- The system is **dark-only**. There is no light theme.

### 0.4 Reference rule (D-10 supersedes the hybrid rule D-0)

The first version reconciled the Figma frames with the previous system's scales ("hybrid", D-0). Since 2026-10-24 the **DEOC app in Design System 02 is the reference**, and the rule is simpler:

1. Visual tokens (colour, gradient, shadow, radius, blur) are defined here once; DEOC mirrors them (`npm run ds:sync` in DEOC), so they are identical by construction.
2. **Structure** (padding, gaps, control and row heights, type sizes and weights) and **composition** (which tokens a component combines, whether an edge is a border or an inset shadow) follow DEOC's components exactly, even where a Figma frame measured differently.
3. The handful of DEOC values that sit off the 2 px grid (25 px entity-card padding, 13 px tooltip padding, 9 px tooltip radius, 5 px toggle-track padding, 3 × 13 px count-pill padding) are adopted as-is and listed in §11.
4. The type scale is DEOC's: 10/11/12/14/16/20/24 px. The former 18 px `subheading` and 28 px `display` steps are removed (DEOC never uses them).

### 0.5 What this document excludes

Business logic, live data, authentication and back-end contracts. Example copy in quotes illustrates tone and format only.

### 0.6 Figma sources

| # | Node | Screen | Notes |
|---|---|---|---|
| 1 | `459:11379` | Live View | 2 × 2 camera grid, KPI side panel, "Live" header badge |
| 2 | `452:10239` | Factories | KPI row, factory (entity) cards |
| 3 | `489:11729` | Add New Factory (step 1) | Drawer, stepper, open user picker |
| 4 | `491:12471` | Cameras | Nested collapsible sections with tables |
| 5 | `491:13200` | Add Cameras | Modal over the Add Factory drawer (step 2) |
| 6 | `491:14493` | User Management | Role tabs, role tags, table, pagination |
| 7 | `496:16402` | Analytics | KPI row, stacked bars + trend, bubble matrix, donut, heatmap, three status cards |
| 8 | `495:15510` | Add Product | Drawer with uploads and status toggle over Product Master |

Extraction details, missing assets and uncertain values are recorded in `FIGMA_EXTRACTION.md`.

---

## 1. Design language in one page

These ten principles are the identity to preserve.

1. **Deep navy, lit from within.** The page is a horizontal navy gradient (`#0b1020 → #0f172a → #020617`) with two soft ambient glows: blue at the top-left, green at the bottom-right. Nothing is pure black and nothing is flat grey.
2. **Glass, not slabs.** Containers are translucent white gradients (white/3% → white/1%) with a hairline white border (2–7%) and a soft black drop shadow. Depth comes from stacking these thin layers, not from opaque fills.
3. **Three depths.** *Shell* panels (sidebar, main panel) → *cards* inside them → *wells* inside cards (a faint blue tint, `rgba(172,195,255,0.04)`). Each level is one step lighter. Overlays (drawers, modals, menus, tooltips) are the only opaque surfaces.
4. **One accent, one gradient.** Blue is the only brand hue. The primary action is a top-lit gradient (`#2563eb → #1d4ed8`) with a 1 px inner highlight and a soft blue drop glow. The selected navigation item uses a faint diagonal blue wash. No other gradient carries color.
5. **Glowing status.** State is a 6–10 px dot with a halo (`0 0 10px <color>`) plus a label, in a pill. Green = healthy/matched/active, amber = warning, orange-red `#ff5825` = error/stopped/offline. The same status always looks the same.
6. **Illustrated identity, outline actions.** Navigation, headers and KPIs use glossy navy/blue 3D illustrations; controls use thin outline icons in slate.
7. **Strict type.** Inter on one scale (10–24 px): 24 px page titles, 20 px card titles and KPI values, 14 px body. Headings tighten tracking; uppercase labels open it.
8. **Dense, calm layout.** 40 px controls, 44 px table rows, 16 px gutters and KPI padding, 20–25 px card padding. Space separates groups; lines appear only inside components.
9. **Restraint.** Glow is reserved for status dots, the primary action and the active step; gradients only for the surfaces listed in §2.7. No decorative lines, no extra glassmorphism, no blur on structural surfaces.
10. **Visible, safe interaction.** Every focusable element shows a blue outline (2 px on buttons and links, 1 px on fields and toggles). Overlays never close on a backdrop click; Escape closes them unless there are unsaved edits.

---

## 2. Foundations

### 2.1 Color primitives

Primitive names are **reference labels** for traceability; they are not emitted as custom properties. Components read only the semantic tokens of §2.2 (exceptions: `--ds-tag-*`, `--ds-heat-*` and `--ds-chart-cat-*` are real tokens because components reference the palette directly).

#### Navy surfaces (darkest → lightest)

| Primitive | HEX | Figma usage |
|---|---|---|
| `navy-1000` | `#020617` | End of the app / drawer gradient (right edge) |
| `navy-975` | `#0b0e13` | Camera viewport (media well) behind feeds |
| `navy-960` | `#0b1020` | Start of the app / drawer gradient (left edge) |
| `navy-950` | `#0c1325` | Opaque floating list (user picker menu) |
| `navy-900` | `#0f172a` | Middle stop of the app gradient (55 %) |
| `navy-890` | `#101527` | End of the modal and chart-tooltip gradients |
| `navy-880` | `#121620` | Sunken square: inactive stepper index, presence-dot ring |
| `navy-875` | `#121622` | Photo-avatar inner fill |
| `navy-860` | `#171f31` | Start of the chart-tooltip gradient |
| `navy-850` | `#182032` | Start of the modal gradient |
| `navy-845` | `#18202d` | Initials avatar (neutral) |
| `navy-840` | `#1a2535` | Entity icon box (factory card) |
| `navy-830` | `#1e293b` | System-health icon tile |
| `navy-820` | `#1f2636` | Stepper connector track |
| `navy-800` | `#292e33` | Table / heatmap dividers, chart axis line |
| `navy-750` | `#333333` | Logo tile outline |
| `navy-700` | `#334155` | Neutral avatar outline |

#### Translucent layers

| Primitive | Value | Figma usage |
|---|---|---|
| `white-1` | `rgba(255,255,255,0.01)` | Bottom stop of every glass gradient |
| `white-2` | `rgba(255,255,255,0.02)` | KPI card border, table header fill, subtle-button border |
| `white-3` | `rgba(255,255,255,0.03)` | Top stop of glass gradients; card and field borders |
| `white-4` | `rgba(255,255,255,0.04)` | Main-panel gradient top; count pill / subtle button fill; tab-track border |
| `white-5` | `rgba(255,255,255,0.05)` | Close-button fill |
| `white-6` | `rgba(255,255,255,0.06)` | Count pill border, close-button border, icon box border |
| `white-7` | `rgba(255,255,255,0.07)` | Select-trigger and secondary-button border; top inner highlight |
| `white-8` | `rgba(255,255,255,0.08)` | Progress track; inactive stepper index border |
| `white-20` | `rgba(255,255,255,0.20)` | Toggle option outline |
| `ice-4` | `rgba(172,195,255,0.04)` | Wells, nested groups, selected tab pill, picker rows |

#### Text neutrals

| Primitive | HEX | Figma usage |
|---|---|---|
| `white` | `#ffffff` | Titles, numbers, active labels |
| `slate-50` | `#f4f6f8` | Tooltip values |
| `slate-75` | `#f4f7fa` | Matrix row labels |
| `slate-200` | `#e2e8f0` | Select values, secondary-button labels |
| `slate-300` | `#cbd5e1` | Secondary text: cells, form labels, field values |
| `slate-350` | `#aeb8c5` | Tooltip labels |
| `slate-375` | `#9eacba` | Chart subtitles and axis captions |
| `slate-400` | `#94a3b8` | Muted text: KPI labels, headers, meta, inactive nav |
| `slate-450` | `#8a99ae` | **[STANDARDIZED]** Tertiary text (Figma `#64748b` lifted to pass AA, R-03) |
| `slate-500` | `#64748b` | Outline action icons (and Figma's tertiary text, not used for text here) |
| `gray-500` | `#6b7280` | Chevrons |
| `slate-600` | `#475569` | Decorative separators only |

#### Brand blue

| Primitive | HEX | Figma usage |
|---|---|---|
| `blue-300` | `#93c5fd` | Info chip text; active-step border (40 %) |
| `blue-400` | `#60a5fa` | Eyebrow text, links, camera header glyphs |
| `blue-500` | `#3b82f6` | CTA border, brand dot, icon-tile tint base, focus ring |
| `blue-600` | `#2563eb` | Primary gradient top, active page, active step |
| `blue-700` | `#1d4ed8` | Primary gradient bottom; avatar gradient start |
| `blue-nav` | `rgba(33,88,225,·)` | Selected-nav wash (22.5 % → 12.5 % → 0) |
| `indigo-400` | `#818cf8` | Photo-avatar ring end |
| `indigo-500` | `#6366f1` | Initials-avatar gradient end |

#### Status

| Primitive | HEX | Figma usage |
|---|---|---|
| `green-400` | `#34d399` | Success text and dot; running segment; progress gradient start |
| `green-500` | `#10b981` | Success glow; "good products"; completed step; presence dot |
| `amber-400` | `#fbbf24` | Warning text, dot and glow |
| `orange-500` | `#ff5825` | Error / stopped / offline dot, glow, bars, detection frame |
| `orange-400` | `#ff7043` | **[STANDARDIZED]** Error text on tinted pills (R-04) |
| `rose-400` | `#fb7185` | Required asterisk; validation (R-05) |
| `red-live` | `#d33434` | "Live" indicator core (halo at 40 %) |

#### Categorical, tag and heat primitives

| Primitive | HEX | Role |
|---|---|---|
| `--ds-chart-cat-1` | `#016ffe` | Donut segment 1 |
| `--ds-chart-cat-2` | `#8b34fd` | Donut segment 2 |
| `--ds-chart-cat-3` | `#fbb645` | Donut segment 3 |
| `--ds-chart-cat-4` | `#00bac9` | Donut segment 4 |
| `--ds-tag-purple` | `#4d3f9d` | Role tag "HUL Admin" |
| `--ds-tag-blue` | `#3f779d` | Role tag "Factory Admin" |
| `--ds-tag-green` | `#457e32` | Role tag "Factory Operator" (Figma `#569d3f`, darkened for AA, R-06) |
| `--ds-tag-amber` | `#95693c` | Role tag "Factory Quality Supervisor" (Figma `#9d6f3f`, R-06) |
| `--ds-tag-rose` | `#9d3f5a` | **[EXTENSION]** fifth category |
| `--ds-heat-0` | `#003e3a` | Heat scale stop 0.00 |
| `--ds-heat-1` | `#116035` | Heat scale stop 0.25 |
| `--ds-heat-2` | `#597730` | Heat scale stop 0.50 |
| `--ds-heat-3` | `#d18732` | Heat scale stop 0.75 |
| `--ds-heat-4` | `#ff5825` | Heat scale stop 1.00 |

### 2.2 Semantic color tokens

**Always use these in components.** Each token has one job.

#### Backgrounds & surfaces

| Token | Value | Use exactly for |
|---|---|---|
| `--ds-color-bg-app` | `#0b1020` | Solid fallback of the app background; `theme-color` |
| `--ds-gradient-app` | `linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%)` | The viewport behind the shell; slide-panel body |
| `--ds-color-glow-brand` | `rgba(59,130,246,0.10)` | Ambient glow, top-left of the viewport (420 px) |
| `--ds-color-glow-success` | `rgba(52,211,153,0.08)` | Ambient glow, bottom-right of the viewport (360 px) |
| `--ds-gradient-glass` | `linear-gradient(180deg, brand-strong/2.5% 0%, brand-strong/1% 100%)` (CTA blue `#2563eb`; white glass greyed the navy) | **Every glass surface**: sidebar, cards, fields, select triggers, secondary buttons, tab tracks, glass badges, table section bodies |
| `--ds-gradient-glass-strong` | `linear-gradient(180deg, brand-strong/5% 0%, brand-strong/1% 100%)` | Main content panel; media-card header and footer bars |
| `--ds-gradient-glass-up` | `linear-gradient(0deg, brand-strong/2.5% 0%, brand-strong/1% 100%)` | Footers that sit at the bottom edge (slide-panel footer, pagination) |
| `--ds-gradient-glass-kpi` | `linear-gradient(180deg, brand-strong/2.5% 0%, brand-strong/1% 100%)` | KPI cards only |
| `--ds-gradient-edge-control` | solid `border-edge` | 1 px stroke on header filter selects (drawn on `::before`); solid since D-8 so it matches every other border |
| `--ds-gradient-toggle` | `linear-gradient(180deg, brand-strong/6% 0%, brand-strong/2% 100%)` | Track of every toggle: segmented tabs (all variants) and the binary status toggle (D-9) |
| `--ds-gradient-toggle-active` | `linear-gradient(180deg, brand/42% 0%, brand-strong/18% 100%)` | The selected option inside a toggle track (D-9) |
| `--ds-gradient-table-header-pinned` | `brand-strong/7%` over `gradient-app` (viewport-fixed) over `bg-app` | Sticky table header: opaque so rows scroll out of sight, but reads like the see-through 2 % header on glass. Use as `background` (D-9) |
| `--ds-color-surface-base` | `#0f172a` | Opaque base where translucency is impossible: mobile top bar, mobile drawer, sticky table header base |
| `--ds-color-surface-raised` | `#0c1325` | Opaque floating lists: dropdown menus, rich picker, popovers, toasts |
| `--ds-gradient-dialog` | `linear-gradient(180deg, #182032 0%, #101527 100%)` | Modals and confirmation dialogs |
| `--ds-gradient-tooltip` | `linear-gradient(180deg, #171f31 0%, #101527 100%)` | Label tooltips and rich chart tooltips |
| `--ds-color-surface-nested` | `rgba(172,195,255,0.04)` | Wells inside cards, nested collapsible groups, selected tab pill, picker rows |
| `--ds-color-surface-nested-hover` | `rgba(172,195,255,0.08)` | **[INFERRED]** Hover of nested rows and picker rows |
| `--ds-color-surface-control` | `rgba(255,255,255,0.04)` | Subtle button fill, count pill, page buttons |
| `--ds-color-surface-control-hover` | `rgba(255,255,255,0.07)` | **[INFERRED]** Hover of `surface-control` |
| `--ds-color-surface-hover` | `rgba(255,255,255,0.05)` | Hover fill: ghost and icon buttons, menu options, inactive nav items, close button |
| `--ds-color-surface-hover-subtle` | `rgba(255,255,255,0.03)` | Hover of inactive tabs |
| `--ds-color-surface-row-hover` | `rgba(255,255,255,0.02)` | Hover of non-clickable table rows |
| `--ds-color-surface-selected` | `rgba(172,195,255,0.08)` | Selected option in a menu |
| `--ds-color-surface-table-header` | `rgba(255,255,255,0.02)` | Table and heatmap header rows |
| `--ds-color-surface-table-header-pinned` | `#151c2e` | **[INFERRED]** Flat fallback for the sticky header; components use `gradient-table-header-pinned` (D-9) |
| `--ds-color-surface-media` | `#0b0e13` | Camera viewport behind feeds |
| `--ds-color-surface-sunken-button` | `#121620` | Inactive stepper index |
| `--ds-color-surface-entity-icon` | `#1a2535` | Unused since entity-card icons sit without a tile (D-9; kept for compatibility) |
| `--ds-color-surface-icon-tile` | `#1e293b` | Unused since health rows show the icon alone (kept for compatibility) |
| `--ds-color-surface-avatar` | `#18202d` | Initials avatar (neutral) |
| `--ds-color-avatar-inner` | `#121622` | Photo-avatar inner fill |
| `--ds-color-track` | `rgba(255,255,255,0.08)` | Progress-bar track, switch track |
| `--ds-color-scrim` | `rgba(0,0,0,0.50)` | Backdrop behind drawers and modals |

#### Text

| Token | Value | Use exactly for |
|---|---|---|
| `--ds-color-text-primary` | `#ffffff` | Titles, numbers, active labels, first table column |
| `--ds-color-text-emphasis` | `#e2e8f0` | Select-trigger values, secondary and subtle button labels |
| `--ds-color-text-secondary` | `#cbd5e1` | Table values, form labels, field values, detected values, body copy |
| `--ds-color-text-muted` | `#94a3b8` | KPI labels, table headers, meta, inactive nav and tabs, descriptions |
| `--ds-color-text-tertiary` | `#8a99ae` | **[STANDARDIZED]** Quietest readable text: counts in tabs, section labels, barcode labels, step subtitles, helper notes (≥ 4.72:1) |
| `--ds-color-text-placeholder` | `rgba(203,213,225,0.60)` | Placeholders (Figma used 50 %; raised to 60 % for 4.57:1, R-07) |
| `--ds-color-text-faint` | `#475569` | Decorative separators only (`aria-hidden`) |
| `--ds-color-text-on-brand` | `#ffffff` | Text on blue fills |
| `--ds-color-text-on-bright` | `#0b0f14` | Text on bright chart fills (heat cells ≥ 0.59, bar segments) |
| `--ds-color-text-chart-subtle` | `#9eacba` | Chart subtitles, axis captions |
| `--ds-color-text-chart-strong` | `#f4f7fa` | Matrix row labels |
| `--ds-color-text-tooltip` | `#f4f6f8` | Strong values in tooltips |
| `--ds-color-text-tooltip-muted` | `#aeb8c5` | Labels in tooltips |
| `--ds-color-text-axis` | `rgba(255,255,255,0.60)` | Y-axis tick labels |
| `--ds-color-icon` | `#64748b` | Outline action icons (3.1–3.8:1, meets the 3:1 non-text minimum) |
| `--ds-color-icon-chevron` | `#6b7280` | Chevrons |

#### Borders & dividers

| Token | Value | Use exactly for |
|---|---|---|
| `--ds-color-border-edge` | `rgba(255,255,255,0.02)` | **The one border colour** (Figma 452:10257 KPI card): every card, panel and section edge, card-header dividers, menus, fields, select triggers, pills |
| `--ds-color-border-hairline` | `var(--ds-color-border-edge)` | KPI card outline, subtle-button outline |
| `--ds-color-border-glass` | `var(--ds-color-border-edge)` | Glass cards, fields, glass badges, dropzones, picker rows |
| `--ds-color-border-track` | `var(--ds-color-border-edge)` | Tab track, card-header bottom divider, pagination top divider |
| `--ds-color-border-faint` | `var(--ds-color-border-edge)` | Section dividers, drawer edge |
| `--ds-color-border-subtle` | `var(--ds-color-border-edge)` | Count pill, close button, entity icon box, modal/drawer header dividers |
| `--ds-color-border-control` | `var(--ds-color-border-edge)` | Select triggers, secondary buttons |
| `--ds-color-border-strong` | `rgba(255,255,255,0.08)` | Inactive stepper index |
| `--ds-color-border-control-hover` | `rgba(255,255,255,0.20)` | Toggle / radio-card options; hover outline of controls |
| `--ds-color-border-control-strong` | `#6b7280` | Unchecked checkbox; boundary mode (§9.3) |
| `--ds-color-border-on-brand` | `rgba(255,255,255,0.30)` | Top edge of the current page button |
| `--ds-color-border-divider` | `#292e33` | Table header bottom, heatmap and analytics-table column dividers, chart axis line |
| `--ds-color-border-tooltip-divider` | `rgba(57,67,75,0.40)` | Divider inside tooltips |
**One border colour (D-8).** Figma draws hairline borders at white/2–7 %. Every one of them now resolves to `--ds-color-border-edge` (the KPI-card border, white/2 %) so cards, sections, tables, menus and controls read the same; change that one token to retune them all. The role names above are kept as aliases so components still say what a border is for. Stronger borders (`border-strong`, `border-control-hover`, `border-on-brand`, `border-divider`) are unchanged.
| `--ds-color-border-avatar` | `#334155` | Neutral avatar outline |
| `--ds-color-border-logo` | `#333333` | Logo tile outline |
| `--ds-color-scrollbar` | `rgba(255,255,255,0.12)` | Scrollbar thumb (hover: `--ds-color-scrollbar-hover`, white/20 %) |
| `--ds-color-skeleton` | `rgba(255,255,255,0.06)` | Skeleton bars |

#### Brand & interactive

| Token | Value | Use exactly for |
|---|---|---|
| `--ds-color-brand` | `#3b82f6` | Focus ring, primary-button border, brand dots, checked controls. **Not as small text** (4.05:1 on cards) |
| `--ds-color-brand-strong` | `#2563eb` | Current page, active step, checked fill, accent tab |
| `--ds-color-brand-stronger` | `#1d4ed8` | Bottom of the primary gradient |
| `--ds-gradient-button-primary` | `linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)` | Primary button fill |
| `--ds-gradient-button-primary-hover` | `linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)` | **[INFERRED]** Primary button hover |
| `--ds-gradient-nav-active` | `linear-gradient(101deg, rgba(33,88,225,0.225) 0%, rgba(33,88,225,0.125) 43%, rgba(33,88,225,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.039) 0%, rgba(255,255,255,0.012) 100%)` | Current sidebar item only |
| `--ds-gradient-stepper-active` | `linear-gradient(90deg, rgba(59,130,246,0.60) 0%, #1f2636 100%)` | Connector after the current / completed step |
| `--ds-gradient-progress-success` | `linear-gradient(90deg, #34d399 0%, #10b981 100%)` | Fill of healthy progress bars |
| `--ds-gradient-sheen` | `linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.30) 50%, rgba(96,165,250,0) 100%)` | 1 px top edge of slide panels |
| `--ds-color-brand-text` | `#93c5fd` | Info chip text |
| `--ds-color-link` | `#60a5fa` | Blue text: links, link actions, eyebrows, roles under names, active step subtitle |
| `--ds-color-link-hover` | `#93c5fd` | Hover of link text |
| `--ds-color-brand-tint-10` | `rgba(59,130,246,0.10)` | Icon tile and info chip fill |
| `--ds-color-brand-tint-20` | `rgba(59,130,246,0.20)` | Icon tile and info chip border; tonal button; user-card glow |
| `--ds-color-brand-tint-30` | `rgba(59,130,246,0.30)` | Tonal button hover |
| `--ds-color-brand-border-hover` | `rgba(59,130,246,0.40)` | Clickable media-card hover outline |
| `--ds-color-brand-avatar-border` | `rgba(147,197,253,0.30)` | Initials-avatar outline |
| `--ds-gradient-brand-ring` | `linear-gradient(45deg, #3b82f6 0%, #818cf8 100%)` | Photo-avatar ring |
| `--ds-gradient-brand-avatar` | `linear-gradient(45deg, #1d4ed8 0%, #6366f1 100%)` | Initials avatar (brand) |
| `--ds-color-focus-ring` | `#3b82f6` | All focus outlines |
| `--ds-color-focus-ring-on-color` | `#ffffff` | Focus on data-colored fills |

#### Status (semantic)

| Token | Value | Use exactly for |
|---|---|---|
| `--ds-color-success-text` | `#34d399` | Success text, dot core |
| `--ds-color-success-glow` | `#10b981` | Success halo, completed step fill, presence dot |
| `--ds-color-success-bg` | `rgba(16,185,129,0.10)` | Success pill fill |
| `--ds-color-success-border` | `rgba(16,185,129,0.20)` | Success pill outline |
| `--ds-color-warning-text` | `#fbbf24` | Warning text, dot core and halo |
| `--ds-color-warning-bg` | `rgba(251,191,36,0.10)` | Warning pill fill |
| `--ds-color-warning-border` | `rgba(251,191,36,0.20)` | Warning pill outline |
| `--ds-color-danger` | `#ff5825` | Error / stopped / offline dot, halo, bars, detection frames |
| `--ds-color-danger-text` | `#ff7043` | Error-status text on tinted and glass surfaces (R-04) |
| `--ds-color-danger-bg` | `rgba(255,88,37,0.10)` | Error pill fill, danger button |
| `--ds-color-danger-bg-hover` | `rgba(255,88,37,0.20)` | **[INFERRED]** Danger button hover |
| `--ds-color-danger-border` | `rgba(255,88,37,0.20)` | Error pill outline |
| `--ds-color-error` | `#fb7185` | Field error ring and validation (form errors, not system state) |
| `--ds-color-error-text` | `#fb7185` | Required asterisk, validation messages |
| `--ds-color-live` | `#d33434` | "Live" indicator core |
| `--ds-color-live-halo` | `rgba(211,52,52,0.40)` | "Live" indicator rings |
| `--ds-color-info-text` | `#93c5fd` | **[EXTENSION]** Informational text |
| `--ds-color-info-bg` | `rgba(59,130,246,0.10)` | **[EXTENSION]** Info pill fill |
| `--ds-color-info-border` | `rgba(59,130,246,0.20)` | **[EXTENSION]** Info pill outline |
| `--ds-color-row-warning` | `rgba(251,191,36,0.03)` | **[EXTENSION]** Warning row tint |
| `--ds-color-row-critical` | `rgba(255,88,37,0.03)` | **[EXTENSION]** Stopped / failed row tint |
| `--ds-color-alert-count` | `#fb7185` | Non-zero alert counts in cells |

#### Overlays

| Token | Value | Use exactly for |
|---|---|---|
| `--ds-color-scrim` | `rgba(0,0,0,0.50)` | Backdrop behind modals **and** slide panels (one value in every frame) |
| `--ds-overlay-blur` | `4px` | `backdrop-filter: blur()` on that backdrop |
| `--ds-blur-ambient` | `60px` | `filter: blur()` of the two ambient page glows (§6.1) |

#### Disabled

There is no disabled color. Disabled controls keep their colors and get **`opacity: 0.4`** plus `pointer-events: none` (or `cursor: not-allowed` when they stay focusable via `aria-disabled`). [PRESERVED]

### 2.3 Typography

#### Font family

```
--ds-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Weights 400, 500, 600, 700, loaded from Google Fonts. There is no monospace face: barcodes, IDs and IP addresses use Inter with `letter-spacing: 0.55px` (`field-value`).

#### Type scale

| Scale token | Size | Default line height | Role |
|---|---|---|---|
| `--ds-font-size-caption` | 10px | 14px | Tooltip rows, info chips |
| `--ds-font-size-micro` | 11px | 14px | Tooltip header, dense axis captions |
| `--ds-font-size-label` | 12px | 16px | Form labels, KPI labels, table headers, meta, step text, small buttons |
| `--ds-font-size-body` | 14px | 20px | Default text, cells, inputs, buttons, badges |
| `--ds-font-size-value` | 16px | 22px | Data labels, person names in cards, identifier values, compact section titles |
| `--ds-font-size-heading` | 20px | 28px | Card, dialog, group and media titles; KPI and metric values |
| `--ds-font-size-title` | 24px | 32px | Page titles |

The scale is DEOC's: 10/11/12/14/16/20/24 px (D-10). The former 18 px `subheading` and 28 px `display` steps were removed because DEOC never renders them. No other size may be used.

#### Named text styles

Every text element uses one of these styles. `.ds-ts-<name>` utility classes are generated from this table.

| Style token | Family | Size | Weight | Line height | Letter spacing | Transform | Color token | Usage |
|---|---|---|---|---|---|---|---|---|
| `page-title` | Inter | 24px | 600 | 32px | -0.35px | — | text-primary | The page `<h1>` in the header |
| `dialog-title` | Inter | 20px | 700 | 28px | -0.5px | — | text-primary | Slide-panel and confirm-dialog titles |
| `modal-title` | Inter | 14px | 400 | 18px | 0 | — | text-primary | Compact modal title and form-section headers ("Add Cameras", "User Details") |
| `card-title` | Inter | 20px | 600 | 24px | -0.4px | — | text-primary | Dashboard and status-card titles |
| `entity-title` | Inter | 20px | 600 | 28px | -0.4px | — | text-primary | Entity-card names (factory cards) |
| `media-title` | Inter | 20px | 600 | 26px | -0.25px | — | text-primary | Camera tile titles (16 px on tiles narrower than 420 px) |
| `group-title` | Inter | 20px | 700 | 24px | -0.5px | — | text-primary | Collapsible section and table-card titles |
| `subgroup-title` | Inter | 16px | 700 | 22px | -0.5px | — | text-primary | Compact nested sections [PRESERVED] |
| `summary-title` | Inter | 20px | 700 | 28px | -0.5px | — | text-primary | Summary-strip title (running SKU) |
| `kpi-value` | Inter | 20px | 700 | 28px | -0.65px | — | text-primary | KPI value |
| `kpi-label` | Inter | 12px | 700 | 16px | +0.55px | UPPERCASE | text-muted | KPI label |
| `metric-value` | Inter | 20px | 700 | 28px | -0.65px | — | text-primary | Inline metric in an entity card ("6") |
| `metric-denominator` | Inter | 14px | 400 | 20px | 0 | — | text-muted | "/ 6 lines active" |
| `metric-label` | Inter | 12px | 500 | 18px | +0.4px | UPPERCASE | text-muted | Labels above stacked metrics [PRESERVED] |
| `section-title` | Inter | 20px | 500 | 28px | -0.35px | — | text-tertiary | Title of a page section above a card grid ("Active Operational Units • 6"; Figma `#64748b` lifted, R-03) |
| `section-label` | Inter | 12px | 700 | 16px | +0.55px | UPPERCASE | text-tertiary | Card section labels ("REFERENCE BARCODES") |
| `field-label` | Inter | 12px | 500 | 16px | 0 | — | text-tertiary | Label above a read-only value |
| `field-value` | Inter | 16px | 400 | 22px | +0.5px | — | text-primary | Read-only identifiers (barcodes) |
| `eyebrow` | Inter | 12px | 400 | 18px | +0.55px | — | link | Context label above a summary title, after an 8 px brand dot |
| `body` | Inter | 14px | 400 | 20px | 0 | — | text-secondary | Default paragraph text |
| `body-muted` | Inter | 14px | 400 | 20px | 0 | — | text-muted | Descriptions, "Showing …", empty states |
| `body-strong` | Inter | 14px | 500 | 20px | 0 | — | text-primary | Names, primary values |
| `body-emphasis` | Inter | 14px | 600 | 20px | 0 | — | text-primary | Emphasized values |
| `small` | Inter | 12px | 400 | 16px | 0 | — | text-muted | Meta lines |
| `small-strong` | Inter | 12px | 600 | 16px | 0 | — | text-secondary | Compact labels, callout titles |
| `caption` | Inter | 10px | 400 | 14px | 0 | — | text-tertiary | Smallest annotations |
| `table-header` | Inter | 12px | 600 | 16px | +0.3px | UPPERCASE | text-muted | `<th>` |
| `table-cell-primary` | Inter | 14px | 500 | 20px | 0 | — | text-primary | First column |
| `table-cell` | Inter | 14px | 400 | 20px | 0 | — | text-secondary | Other columns |
| `form-label` | Inter | 12px | 500 | 16px | 0 | — | text-muted | Field labels (drawers, pages) |
| `form-label-caps` | Inter | 12px | 500 | 16px | +0.55px | UPPERCASE | text-muted | Field labels in compact modals |
| `input-text` | Inter | 14px | 400 | 20px | 0 | — | text-primary | Typed values |
| `placeholder` | Inter | 14px | 400 | 20px | 0 | — | text-placeholder | Placeholders |
| `validation` | Inter | 12px | 400 | 16px | 0 | — | error-text | Field errors |
| `helper` | Inter | 12px | 400 | 16px | 0 | — | text-tertiary | Hints, autosave notes |
| `button-sm` | Inter | 12px | 600 | 16px | 0 | — | per variant | Small buttons |
| `button-md` | Inter | 14px | 600 | 20px | 0 | — | per variant | Buttons (every variant) |
| `button-lg` | Inter | 16px | 600 | 22px | 0 | — | per variant | Large buttons |
| `badge` | Inter | 14px | 600 | 20px | 0 | — | per status | Status pill |
| `badge-sm` | Inter | 12px | 600 | 16px | 0 | — | per status | Small status pill |
| `tag` | Inter | 14px | 500 | 20px | 0 | — | text-primary | Role tag |
| `count-pill` | Inter | 14px | 700 | 18px | 0 | — | text-secondary | Count next to a title |
| `nav-item` | Inter | 14px | 500 | 20px | 0 | — | text-muted | Sidebar items (primary when current) |
| `nav-section` | Inter | 12px | 400 | 16px | 0 | — | text-muted | Sidebar group labels |
| `tab` | Inter | 14px | 400 | 20px | 0 | — | text-muted | Segmented tabs (primary when selected) |
| `tab-count` | Inter | 12px | 400 | 16px | 0 | — | text-tertiary | "(24)" after a tab label |
| `link-action` | Inter | 14px | 600 | 20px | 0 | — | brand | Inline actions ("+ Add New User"); `link` on hover |
| `step-title` | Inter | 12px | 700 | 16px | +0.3px | — | text-primary | Current step title |
| `step-sub` | Inter | 12px | 500 | 16px | 0 | — | link | Current step status ("In progress") |
| `media-detail` | Inter | 14px | 600 | 16px | 0 | — | text-secondary | Camera footer ("Detected : …"; value italic 400) |
| `avatar-initials` | Inter | 14px | 500 | 16px | 0 | — | text-secondary | Neutral avatar initials |
| `legend` | Inter | 14px | 500 | 22px | 0 | — | text-tertiary | Chart legends (values in text-muted) |
| `legend-sm` | Inter | 12px | 500 | 16px | 0 | — | text-tertiary | Compact legends |
| `axis-y` | Inter | 12px | 400 | 24px | -0.4px | — | text-axis | Y-axis ticks |
| `axis-x` | Inter | 14px | 400 | 24px | -0.4px | — | text-primary | X-axis categories |
| `axis-caption` | Inter | 11px | 400 | 14px | 0 | — | text-chart-subtle | Dense categorical axis labels (2-line clamp) |
| `data-label` | Inter | 16px | 400 | 22px | -0.4px | — | text-primary | Labels on chart points |
| `tooltip-title` | Inter | 11px | 700 | 13px | 0 | — | text-tooltip | Tooltip header |
| `tooltip-body` | Inter | 10px | 400 | 12px | 0 | — | text-tooltip-muted | Tooltip rows |
| `heat-cell` | Inter | 14px | 600 | 20px | -0.4px | — | text-primary | Heatmap cells |
| `bar-segment` | Inter | 12px | 600 | 1 (12px) | 0 | — | text-on-bright | Numbers inside segmented bars |
| `toast` | Inter | 14px | 400 | 20px | 0 | — | text-primary | Toast message |

**Typography rules** [PRESERVED]

- Headings (≥ 16 px, 600/700) use negative tracking from the table. Body text uses 0.
- UPPERCASE text always has positive tracking (+0.3 to +0.55 px) and weight ≥ 500.
- Numbers in KPI and metric styles are bold with -0.65 px tracking and `font-variant-numeric: tabular-nums`.
- Italic appears only for detected values in camera footers.
- Never write an inline font size; use a style or a scale token.

#### Text scaling and long content [PRESERVED]

Implement in px or rem (value ÷ 16), never mixed within a category. Controls, rows and cards use **minimum** heights so enlarged text grows them. Never truncate KPI values and labels, form labels, validation, status labels, button labels, dialog titles or column headers. Card and group titles wrap (2 lines before the card grows). Select values, identifier cells and nav labels may truncate, with the full text available in a tooltip or accessible name. Use `overflow-wrap: anywhere` on containers that may receive long IDs, e-mails or URLs.

### 2.4 Spacing

Base unit **4 px**, with 2 px half-steps (2, 6, 10, 14) inside components. [PRESERVED]

| Token | Value | Typical use |
|---|---|---|
| `--ds-space-0-5` | 2px | Title → subtitle in tight stacks |
| `--ds-space-1` | 4px | Menu offset, nav item gap, picker gap |
| `--ds-space-1-5` | 6px | Label → control, badge dot gap, page-button gap |
| `--ds-space-2` | 8px | Icon → label in buttons |
| `--ds-space-2-5` | 10px | Page icon → title |
| `--ds-space-3` | 12px | Header action gap, avatar → name, toggle option gap |
| `--ds-space-3-5` | 14px | Title → count pill, nav item padding, picker row padding |
| `--ds-space-4` | 16px | KPI icon → text, card stack gap, page-header controls |
| `--ds-space-5` | 20px | Side-panel card padding, page-section gap, shell gap |
| `--ds-space-6` | 24px | Dashboard-card padding, dialog and drawer padding |
| `--ds-space-8` | 32px | Empty-state padding |
| `--ds-space-10` | 40px | Form row gap |
| `--ds-space-12` | 48px | Drawer title row → stepper |
| `--ds-space-16` | 64px | Empty-state padding inside charts |

#### Semantic spacing (use these names in layouts)

| Token | Value | Applies to | Kind |
|---|---|---|---|
| `--ds-space-page-gutter` | 16px | Left/right/bottom padding of page content; page header horizontal padding | padding |
| `--ds-space-page-top` | 8px | Header → first content row (tight: the header has no fill or divider) | padding |
| `--ds-space-shell-padding` | 16px | Viewport → shell panels [PRESERVED] | padding |
| `--ds-space-shell-gap` | 20px | Sidebar → main panel | gap |
| `--ds-space-section` | 20px | Between vertically stacked page sections | gap |
| `--ds-space-grid` | 16px | Between KPI cards, camera tiles and side-panel cards | gap |
| `--ds-space-grid-lg` | 20px | Between entity and dashboard cards; monitor grid → side panel | gap |
| `--ds-space-stack` | 12px | Between collapsible sections, and between nested groups inside one | gap |
| `--ds-space-card` | 16px | KPI cards, summary strip, collapsible-section body | padding |
| `--ds-space-card-lg` | 20px | Side-panel cards | padding |
| `--ds-space-card-xl` | 24px | Dashboard cards, modals, drawer body | padding |
| `--ds-space-card-entity` | 25px | Entity and status cards (24 px plus the 1 px inset edge, as DEOC's `Card`) | padding |
| `--ds-space-card-gap` | 20px | Between sections inside an entity card | gap |
| `--ds-space-chart-gap` | 20px | Dashboard-card title row → content [PRESERVED] | gap |
| `--ds-space-header-actions` | 12px | Between controls in headers [PRESERVED] | gap |
| `--ds-space-form-label` | 6px | Label → control [PRESERVED] | gap |
| `--ds-space-form-col` | 20px | Between form columns [PRESERVED] | gap |
| `--ds-space-form-row` | 40px | Between form rows | gap |
| `--ds-space-form-section` | 24px | Form-section header → first row | gap |
| `--ds-space-icon-text` | 8px | Icon → label (buttons, menus, dot legends) [PRESERVED] | gap |
| `--ds-space-icon-text-lg` | 12px | 24–40 px icon → text, swatch → label [PRESERVED] | gap |
| `--ds-space-cell-x` | 16px | Table cell horizontal padding | padding |
| `--ds-space-cell-y` | 12px | Table cell vertical padding (rows also have a minimum height) | padding |

**Margin vs padding vs gap** [PRESERVED]: gap between siblings (default); padding inside containers; margin only for the 4 px trigger → menu offset and the 2 px nudge of validation text.

### 2.5 Radii

| Token | Value | Applies to |
|---|---|---|
| `--ds-radius-xs` | 4px | Role tags, info chips, checkboxes, legend swatches, bar tops |
| `--ds-radius-chip` | 6px | Page buttons, segmented status bar, skeletons |
| `--ds-radius-sm` | 8px | Tab pills, close and icon buttons, stepper indices, toggle options, radio cards, logo tile, attach fields, multi-select menus, pickers, popovers, toasts |
| `--ds-radius-control` | 12px | Buttons, inputs, select triggers, dropzones, single-select menus, modals |
| `--ds-radius-track` | 12px | Tab tracks, wells inside cards, icon tiles, segmented status bar |
| `--ds-radius-nested` | 16px | Sidebar nav items, nested groups inside a collapsible section |
| `--ds-radius-card` | 16px | Content cards inside the main panel: entity, dashboard, table and section cards, side-panel cards; confirm dialogs |
| `--ds-radius-panel` | 24px | Shell panels (sidebar, main panel), KPI cards, camera tiles, sidebar user card |
| `--ds-radius-viewer` | 32px | Expanded camera viewer |
| `--ds-radius-full` | 9999px | Badges, count pills, dots, avatars, progress bars |

**Radius hierarchy.** Radius is assigned by role. *Panels* (24) hold *cards* (16), which hold *wells and controls* (12), which hold *small parts* (8, 4). Inner radius is never larger than its container's. KPI cards and camera tiles are panel-weight objects: they sit directly on the main panel as primary objects and share the 24 px corner (OBSERVED in frames 1, 2, 7, 8). Slide panels and the mobile top bar are edge-attached and have no radius.

### 2.6 Borders

| Token | Value | Applies to |
|---|---|---|
| `--ds-border-width` | 1px | Every border |
| `--ds-border-width-emphasis` | 2px | Stepper connector, presence-dot ring |
| `--ds-border-width-detect` | 2px | Detection frame on camera feeds |

**Glass surfaces carry a hairline border** (white/2–7 %) — unlike the previous system, where cards had none. Every hairline border resolves to one colour, `border-edge` (white/2 %, the KPI card); cards and panels draw it with `shadow-edge` (§2.7, D-8). The border is the light catching the glass edge; it is never a divider. Dividers (`border-track`, `border-faint`, `border-divider`) separate a header from content inside one component. There are no decorative lines.

### 2.7 Shadows, effects & elevation

#### Shadow tokens

| Token | Value | Applies to |
|---|---|---|
| `--ds-shadow-glass` | `0 12px 28px 0 rgba(0,0,0,0.20)` | KPI cards, content cards (through `shadow-surface`), camera tiles |
| `--ds-shadow-glass-soft` | `0 12px 28px -10px rgba(0,0,0,0.20)` | Collapsible section cards |
| `--ds-shadow-control` | `0 10px 24px 0 rgba(0,0,0,0.15)` | Single-select triggers, glass badges |
| `--ds-shadow-field` | `0 10px 24px -10px rgba(0,0,0,0.15)` | Inputs, textareas, field selects, secondary buttons, attach buttons (fields add `shadow-edge` as their border) |
| `--ds-shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Extra lift under field select and picker triggers |
| `--ds-shadow-highlight` | `inset 0 1px 0 0 rgba(255,255,255,0.07)` | Top inner highlight (Figma "IS 2") |
| `--ds-shadow-card` | `0 2px 36px 0 rgba(0,0,0,0.12), 0 2px 12px 0 rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.07)` | Current nav item, current page button, raised role tags (Figma style "IS 2") |
| `--ds-shadow-float-drop` | `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40)` | The drop part of `shadow-float`; table cards pair it with `shadow-edge` drawn above their content |
| `--ds-shadow-float` | `shadow-float-drop` + `shadow-edge` | Menus, popovers (Figma style "IS Effect") |
| `--ds-shadow-kpi-lift` | `0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)` | Extra lift under KPI cards (Figma 452:10257 ":shadow" layer) |
| `--ds-shadow-sidebar` | `0 28px 56px 0 rgba(0,0,0,0.40)` | Sidebar panel |
| `--ds-shadow-shell` | `0 28px 64px -16px rgba(0,0,0,0.40)` | Main content panel |
| `--ds-shadow-drawer` | `-18px 0 45px 0 rgba(0,0,0,0.80), -1px 0 0 0 rgba(255,255,255,0.07)` | Slide panel (cast left) |
| `--ds-shadow-drawer-mirrored` | `18px 0 45px 0 rgba(0,0,0,0.80), 1px 0 0 0 rgba(255,255,255,0.07)` | Mobile sidebar drawer; slide panels in RTL |
| `--ds-shadow-modal` | `0 25px 50px -12px rgba(0,0,0,0.40)` | Modals and confirm dialogs |
| `--ds-shadow-elevated` | `0 4px 40px rgba(0,0,0,0.50)` | Toasts |
| `--ds-shadow-tooltip` | `0 12px 28px 0 rgba(0,0,0,0.20)` | Label and chart tooltips |
| `--ds-shadow-button-primary` | `0 4px 7px 0 rgba(37,99,235,0.35), inset 0 1px 0 0 rgba(255,255,255,0.28)` | Primary button: blue drop glow + top highlight |
| `--ds-shadow-close` | `inset 0 2px 4px 0 rgba(0,0,0,0.60), 0 1px 0 0 rgba(255,255,255,0.04)` | Close buttons (debossed) |
| `--ds-shadow-stepper-active` | `0 0 0 2px rgba(59,130,246,0.20), 0 0 20px -2px rgba(37,99,235,0.45), inset 0 1px 1px 1px rgba(255,255,255,0.35)` | Current step index |
| `--ds-shadow-stepper-idle` | `inset 0 2px 4px 0 rgba(0,0,0,0.60)` | Upcoming step index |
| `--ds-shadow-avatar` | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` | Brand (initials) avatar in pickers |
| `--ds-shadow-avatar-orb` | `0 7px 10px -2px rgba(59,130,246,0.30), 0 3px 4px -3px rgba(59,130,246,0.30)` | Unused (DEOC's photo avatar has no glow); kept for compatibility |
| `--ds-shadow-header-scrolled` | `0 8px 16px -6px rgba(0,0,0,0.60)` | Panel header, pinned table header while content is scrolled [PRESERVED] |
| `--ds-shadow-footer-scrolled` | `0 -8px 16px -6px rgba(0,0,0,0.60)` | Slide-panel footer while more content sits below the fold (D-9) |
| `--ds-shadow-status-success` | `0 0 10px 0 #10b981, 0 0 2px 0 #34d399` | Success dot halo |
| `--ds-shadow-status-warning` | `0 0 10px 0 #fbbf24, 0 0 2px 0 #fbbf24` | Warning dot halo |
| `--ds-shadow-status-error` | `0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825` | Error / stopped / offline dot halo |

#### Edge tokens

A glass card's border is drawn as a 1 px **inset** shadow, so it never changes the box size and combines with the drop shadow in one `box-shadow`. Cards whose content runs edge to edge (camera tiles, table cards, flush dashboard cards) draw the edge on a `::after` layer above the content, as Figma layers it; otherwise the header strip or the feed would cover it.

| Token | Value | Applies to |
|---|---|---|
| `--ds-shadow-edge` | `inset 0 0 0 1px border-edge` | Every card, panel, section, table card, camera tile, menu and the main panel |
| `--ds-shadow-edge-bottom` | `inset 0 -1px 0 0 border-edge` | Bottom hairline (no longer used by the page header, which has no divider) |
| `--ds-shadow-surface` | `shadow-glass` + `shadow-edge` | **The content-card surface**, defined once: entity, dashboard, status and side-panel cards, summary strip. Camera tiles use `shadow-glass` with the edge on `::after` |

#### Gradients and where they belong

| Gradient | Allowed on | Never on |
|---|---|---|
| `gradient-app` | Viewport, slide-panel body | Cards, controls |
| `gradient-glass` / `-strong` / `-up` / `-kpi` | The glass surfaces listed in §2.2 | Text, icons, data marks |
| `gradient-button-primary` | Primary buttons only | Links, tabs, badges |
| `gradient-nav-active` | The current sidebar item only | Tabs, rows, cards |
| `gradient-dialog`, `gradient-tooltip` | Modals, dialogs, tooltips | Inline surfaces |
| `gradient-brand-ring`, `gradient-brand-avatar` | Avatars only | Anything else |
| `gradient-sheen` | Unused (DEOC's slide panels have no sheen); kept for compatibility | Anything |
| `gradient-progress-success` | Healthy progress bars only | Other bars |
| `gradient-stepper-active` | Stepper connectors after the current / completed step | Anything else |

#### Glow rules

Glow (a colored, unoffset shadow) is reserved for: status dots (`shadow-status-*`), the primary button (`shadow-button-primary`), the current step (`shadow-stepper-active`), detection frames in the camera viewer, the user-card halo (`brand-tint-20`, 20 px blur) and the two ambient page glows. Nothing else glows.

#### Blur rules

`backdrop-filter` is used **only** on the scrim behind overlays (`--ds-overlay-blur`, 4 px). The Figma layers also set 12–24 px background blur on glass panels; over the smooth page gradient that blur is visually indistinguishable, costs GPU time and turns each panel into a containing block that breaks fixed-position popups. It is therefore omitted (R-09). Ambient glows use `filter: blur(var(--ds-blur-ambient))` (60 px).

#### Elevation levels

| Level | Name | Surface | Shadow | Examples |
|---|---|---|---|---|
| 0 | Page | `gradient-app` + ambient glows | none | Viewport |
| 1 | Shell | `gradient-glass` / `gradient-glass-strong`; main panel edge `shadow-edge` | `shadow-sidebar` / `shadow-shell` | Sidebar, main panel |
| 2 | Card | `gradient-glass` + an edge token | `shadow-glass` (+ `shadow-kpi-lift` on KPIs) / `shadow-float-drop` (table cards) | KPI, entity, dashboard, status, table cards, camera tiles |
| 2a | Well | `surface-nested` | none | Metric well, nested group, picker rows |
| 3 | Float | `surface-raised` / `gradient-tooltip` | `shadow-float` / `shadow-tooltip` | Menus, popovers, tooltips |
| 4 | Overlay | `gradient-app` / `gradient-dialog` over `scrim` | `shadow-drawer` / `shadow-modal` | Slide panels, modals |
| 5 | Notification | `surface-raised` | `shadow-elevated` | Toasts |

#### Focus indicators [PRESERVED]

Focus uses the CSS `outline` (it follows the radius and survives forced-colors mode).

| Style | Spec | Applies to |
|---|---|---|
| `focus-ring` | `outline: 2px solid var(--ds-color-focus-ring); outline-offset: 2px` | Buttons, links, nav items, pagination, collapsible headers, checkboxes, switches, chart marks |
| `focus-ring-field` | `outline: 1px solid var(--ds-color-focus-ring); outline-offset: 0` | Fields, select triggers, tabs, toggle options, radio cards (DEOC's `ring-1`) |
| `focus-ring-inset` | same, offset -2px | Elements clipped by `overflow: hidden`: menu options, row links, scroll regions |
| `focus-ring-on-color` | `outline: 2px solid #ffffff; outline-offset: -2px` | Data-colored fills (heat cells) |

The ring (`#3b82f6`) measures 4.05–4.85:1 against every surface (≥ 3:1 required). `outline: none` is allowed only as `:focus:not(:focus-visible)` or on an input whose wrapper draws the same ring via `:focus-within`.

### 2.8 Size tokens

| Token | Value | Applies to |
|---|---|---|
| `--ds-size-control` | 40px | Height of inputs, select triggers, menu options; buttons are 40 px of padding + text plus their 1 px border (42 px when bordered) |
| `--ds-size-control-sm` | 28px | Small icon buttons (row actions) |
| `--ds-size-control-lg` | 48px | Large buttons [PRESERVED] |
| `--ds-size-icon-button` | 36px | Default icon button, drawer close [PRESERVED] |
| `--ds-size-icon-button-compact` | 32px | Modal close |
| `--ds-size-pagination-button` | 32px | Page buttons, stepper indices [PRESERVED] |
| `--ds-size-page-header` | 76px | Page header minimum height [PRESERVED] |
| `--ds-size-section-header` | 60px | Collapsible section header height |
| `--ds-size-table-row` | 44px | Table body row minimum height (12 + 20 + 12) |
| `--ds-size-table-header` | 40px | Table header row minimum height (12 + 16 + 12) |
| `--ds-size-table-row-compact` | 40px | Compact table body row |
| `--ds-size-table-header-compact` | 36px | Compact table header row |
| `--ds-size-heat-row` | 40px | Heatmap body row |
| `--ds-size-kpi-card` | 76px | KPI card minimum height (16 + 44 + 16) |
| `--ds-size-kpi-icon` | 40px | KPI illustration |
| `--ds-size-entity-icon` | 40px | Entity icon box, drawer title illustration |
| `--ds-size-page-icon` | 36px | Page-header illustration |
| `--ds-size-avatar-sm` | 32px | Photo avatar |
| `--ds-size-avatar-md` | 36px | Neutral (initials) avatar in entity cards |
| `--ds-size-avatar-lg` | 40px | Brand avatar in pickers |
| `--ds-size-nav-item` | 44px | Sidebar item [PRESERVED] |
| `--ds-size-nav-icon` | 24px | Sidebar illustration [PRESERVED] |
| `--ds-size-action-icon` | 24px | Row action glyph |
| `--ds-size-ui-icon` | 16px | Pagination chevrons, expand, header glyphs |
| `--ds-size-ui-icon-sm` | 14px | Button icons, location, video |
| `--ds-size-search-icon` | 18px | Search and chevron boxes [PRESERVED] |
| `--ds-size-media-icon` | 28px | Camera-tile icon tile |
| `--ds-size-sidebar-collapsed` | 76px | Collapsed sidebar rail [PRESERVED] |
| `--ds-size-sidebar-expanded` | 256px | Sidebar (default, persistent) [PRESERVED] |
| `--ds-size-aside` | 340px | Right-hand side panel of monitoring views |
| `--ds-size-status-dot` | 10px | Status dot (md) [PRESERVED] |
| `--ds-size-status-dot-sm` | 8px | Status dot (sm), eyebrow dot, toggle dot [PRESERVED] |
| `--ds-size-badge-dot` | 6px | Dot inside a badge [PRESERVED] |
| `--ds-size-checkbox` | 16px | Checkbox [PRESERVED] |
| `--ds-size-menu-max-height` | 260px | Option list max height [PRESERVED] |
| `--ds-size-picker-max-height` | 280px | Rich picker max height [PRESERVED] |
| `--ds-size-dialog` | 440px | Confirm dialog maximum width [PRESERVED] |
| `--ds-size-modal` | 720px | Form modal maximum width |
| `--ds-size-panel-sm` | 480px | Slide panel sizes (maximum widths) [PRESERVED] |
| `--ds-size-panel-md` | 560px | |
| `--ds-size-panel-lg` | 680px | |
| `--ds-size-panel-xl` | 820px | Multi-step and two-column forms |
| `--ds-size-popover-date` | 360px | Date-range popover [PRESERVED] |
| `--ds-size-tooltip` | 314px | Rich chart tooltip (342 px for long lists) [PRESERVED] |
| `--ds-size-search-sm` | 288px | Header search [PRESERVED] |
| `--ds-size-search-md` | 320px | |
| `--ds-size-search-lg` | 360px | Longest placeholder ("Search users by name, email, role or factory"; Figma 349, widened so the placeholder never clips) |
| `--ds-size-filter` | 180px | Header filter select (160/200 also valid) [PRESERVED] |
| `--ds-size-filter-date` | 240px | Date-range trigger [PRESERVED] |
| `--ds-size-header-button` | 180px | Optional minimum width of header/footer primary buttons [PRESERVED] |

**Dimension types** [PRESERVED]: *fixed* (icons, dots, avatars, icon buttons, page buttons), *minimum* (controls, rows, headers, cards — implement `min-height`), *maximum* (overlays and text measure — `width: min(<value>, 100%)`), *content-driven* (cards in grids, button widths, chart heights).

### 2.9 Motion [PRESERVED]

| Token | Value | Applies to |
|---|---|---|
| `--ds-duration-fast` | 150ms | Color, background, border, opacity, shadow transitions |
| `--ds-duration-base` | 200ms | Scrolled-header shadow, sidebar label fade |
| `--ds-duration-slow` | 300ms | Sidebar width, bar heights |
| `--ds-duration-chart` | 500ms | Donut segments, progress widths |
| `--ds-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default |
| `--ds-ease-emphasized` | `cubic-bezier(0.22, 1, 0.36, 1)` | Sidebar collapse/expand |

Overlays appear instantly; a 150 ms backdrop fade is optional. The "Live" indicator pulses (1.6 s) [EXTENSION]. `prefers-reduced-motion: reduce` disables every transition and animation. Hover brightening uses `filter: brightness(1.1)`; heat cells `inset` outline; bubbles `scale(1.1)`.

### 2.10 Z-index [PRESERVED]

| Token | Value | Layer |
|---|---|---|
| `--ds-z-header` | 10 | Page header, pinned table header, panel header |
| `--ds-z-tooltip` | 30 | Chart tooltips |
| `--ds-z-sidebar` | 40 | Sidebar slot |
| `--ds-z-menu` | 50 | Menus, popovers |
| `--ds-z-overlay` | 50 | Modals, slide panels (over the whole shell, R-12) |
| `--ds-z-toast` | 60 | Toasts |
| `--ds-z-label-tooltip` | 70 | Label tooltips (rendered in a body-level layer) |

### 2.11 Iconography & asset registry

Two icon families. **Never mix their roles.**

| Family | Role |
|---|---|
| **A. 3D illustrations** | Identity: navigation, page and panel titles, KPIs, entity icons |
| **B. Outline UI icons** | Actions and controls: edit, delete, copy, chevrons, close, search, upload |

#### A. 3D illustration style

Glossy navy → royal-blue clay renders (≈ `#1e3a8a → #2563eb`) with cyan-blue lights, three-quarter view, transparent background, soft contact shadow, at most one secondary object plus a status coin (green = positive, red = negative, blue = neutral, amber = attention). No text inside new illustrations. Masters ≥ 1024 px preferred.

#### B. Asset registry (source illustrations)

Files live in `public/assets/`. They were exported from the Figma image fills (FIGMA_EXTRACTION.md lists node IDs and hashes). **Crops** reproduce the Figma image-fill transform exactly: the image is placed inside an `overflow: hidden` box at `width W`, `height H`, offset `left L`, `top T` (percentages of the box).

| Semantic name | Depicts | Intended purpose | Asset reference | Master size | Display sizes | Fallback (outline icon in icon tile) |
|---|---|---|---|---|---|---|
| `illus.camera` | Wall-mounted camera, blue lens | Live View and Cameras nav, camera pages, Add Cameras modal | `illus-camera.png` | 1374×1145 | 24 (nav), 32 (modal), 36 (page) | `video` |
| `illus.facility-set` (sprite, 4 frames) | 1 factory · 2 factory + check coin · 3 devices · 4 camera | Factories nav and KPIs; drawer title; "Cameras/Devices online" (frame 4, zoomed crop) | `illus-facility-set.png` | 2171×724 | 24, 36, 40, 52 | `factory`, `badge-check`, `server`, `cctv` |
| `illus.conveyor-line` | Conveyor with boxes under a scanner | Lines KPI | `illus-conveyor-line.png` | 256×257 | 52 | `workflow` |
| `illus.analytics-board` | Board with bars, trend and pie | Analytics nav and page | `illus-analytics-board.png` | 511×465 | 24, 36 | `bar-chart-3` |
| `illus.catalog-item` | Box with clipboard | Product Master nav, Add Product title | `illus-catalog-item.png` | 247×272 | 24, 36 | `package` |
| `illus.user-group` | Three people, user card, gear | User Management nav and page | `illus-user-group.png` | 1374×1145 | 24, 36 | `users` |
| `illus.activity-document` | Document with timeline and clock | Activity Log nav | `illus-activity-document.png` | 215×232 | 24 | `history` |
| `illus.items-analyzed` | Box with magnifier and chart | "Products analysed" KPI | `illus-items-analyzed.png` | 1254×1254 | 52 | `scan-search` |
| `illus.defect-rate` | Damaged box + red % coin | "Defect %" KPI | `illus-defect-rate.png` | 1254×1254 | 52 | `percent` |

**Crops used by the screens** (OBSERVED):

| Crop id | Asset | W | H | L | T | Where |
|---|---|---|---|---|---|---|
| `factory` | facility-set | 406.55% | 135.58% | -5.99% | -17.79% | Factories nav, Total factories KPI, drawer title, entity icon |
| `factory-active` | facility-set | 406.55% | 135.58% | -105.99% | -17.79% | Active factories KPI |
| `camera-zoom` | facility-set | 439.47% | 146.56% | -333% | -23.48% | Cameras online / Devices online KPI |
| `conveyor` | conveyor-line | 104% | 100.39% | -2.3% | -0.2% | Total lines / Lines running KPI |

```css
.ds-illus { display: block; object-fit: contain; flex-shrink: 0; }
.ds-sprite { position: relative; display: block; overflow: hidden; flex-shrink: 0; }
.ds-sprite img { position: absolute; max-width: none; }
```

Not illustrations: the brand logo (`logo-unilever.svg`, 23 × 24 inside a 40 px tile), user photos (`avatar-sample.jpg` is the Figma sample) and camera feeds (`feed-*.png`, sample media).

#### C. Rules for new illustrations

Reuse an existing asset whose object fits first. Never generate, trace or imitate illustrations in code; until a commissioned asset exists use the icon-tile fallback. One file per frame for new work; register it in the table above before use. Illustrations are decorative (`alt=""`) when a text label is adjacent.

#### D. Fallback: icon tile

A box with `brand-tint-10` fill and a 1 px `brand-tint-20` border holding a `link`-colored outline glyph: 40 px (radius 12, glyph 20), 28 px (radius 12, glyph 14–16 — the camera-tile header icon, OBSERVED), or 20 px **health tile** (`surface-icon-tile`, radius 6, glyph 12, OBSERVED). Status variants use the matching `*-bg`, `*-border` and text color. No emoji, no flat circles.

#### E. Outline UI icons

The Figma glyphs are shipped as `src/components/ds/figmaIcons.ts` (exact path data, color replaced by `currentColor`, generated by `scripts/build-figma-icons.mjs`). Where Figma has no glyph (e.g. the three system-health icons were exported empty), Lucide outline icons are used at the same size and stroke.

| Use | Box | Stroke | Color |
|---|---|---|---|
| Row actions (copy, edit, delete) | 24 inside a 32 px button | Figma glyphs | `icon` → `text-primary` on hover |
| Select chevron | 18 | 1.35 | `icon-chevron` |
| Disclosure chevron | 32 | 2 | `icon-chevron`; flips when open |
| Close (×) | 10 | — | `text-muted` |
| Back arrow (leading) | 20 | — | `currentColor` |
| Plus in primary button | 14 | 1.47 | white |
| Plus in subtle button / link | 16 / 14 | 1.47 | `currentColor` |
| Chevron in primary button (next) | 14 | 1.35 | white, pointing inline-end |
| Search | 18 box | — | `text-muted` |
| Upload | 32 | — | `text-muted` |
| Camera / tag / package / QR (camera tiles) | 14–16 | 1.2–1.33 | `link` |
| Location, video (entity card) | 14 | 1.17 | `icon` |
| Expand (camera tile) | 16 | 1.33 | `icon` |
| Logout | 20 | filled | `text-muted` at 60 % |

Icons are decorative (`aria-hidden`); the accessible name is on the control. Meaningful icons reach 3:1.

### 2.12 Imagery

- Camera feeds sit on `surface-media` at **50 % opacity** (OBSERVED: images at opacity 0.5 or under a black/50 % overlay), `object-fit: cover`.
- Detection frames (expanded viewer): `--ds-border-width-detect` (2 px) solid `danger` (failed) or `success-glow` (matched), radius 4, with a 20 px glow of the same colour at 30 %.
- Avatars: a photo inside a 1 px `gradient-brand-ring` ring with an `avatar-inner` fill, or initials (§5.32).

### 2.13 Density modes [PRESERVED · EXTENSION]

The default density is DEOC's. A **compact** mode is derived mechanically for data-heavy back-office pages: control sizes shrink by 4 px, table rows step down (44 → 40, header 40 → 36), card padding steps down one spacing step. Type, colors, radii, shadows and icon sizes never change. Set `data-density="compact"` on `<html>` or a region; never mix densities inside one card.

```css
[data-density="compact"] {
  --ds-size-control: 36px;  --ds-size-control-sm: 28px;  --ds-size-control-lg: 44px;
  --ds-size-icon-button: 32px;  --ds-size-pagination-button: 28px;
  --ds-size-table-row: 40px;  --ds-size-table-header: 36px;
  --ds-size-section-header: 52px;  --ds-size-nav-item: 40px;
  --ds-space-cell-x: 12px;  --ds-space-cell-y: 10px;
  --ds-space-card: 12px;  --ds-space-card-lg: 16px;  --ds-space-card-xl: 20px;  --ds-space-card-entity: 21px;
  --ds-space-form-row: 24px;  --ds-space-grid: 12px;  --ds-space-grid-lg: 16px;
}
```

---

## 3. Complete token file

Copy this verbatim into the global stylesheet. **Every value used by a component comes from here.** Naming: `--ds-<category>-<role>[-<variant>]`; categories are `color`, `gradient`, `font`, `line-height`, `tracking`, `space`, `radius`, `border`, `shadow`, `blur`, `size`, `duration`, `ease`, `z`, `focus`, `chart`, `heat`, `tag`, `overlay`, `error-ring`. Roles are semantic. The per-instance knobs `--ds-table-max-height`, `--ds-table-min-width` and `--ds-cell-max` are intentionally undeclared (fallbacks in §5.41).

```css
:root {
  color-scheme: dark;

  /* ── Font ─────────────────────────────────────────────── */
  --ds-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ds-font-weight-regular: 400;
  --ds-font-weight-medium: 500;
  --ds-font-weight-semibold: 600;
  --ds-font-weight-bold: 700;

  --ds-font-size-caption: 10px;    --ds-line-height-caption: 14px;
  --ds-font-size-micro: 11px;      --ds-line-height-micro: 14px;
  --ds-font-size-label: 12px;      --ds-line-height-label: 16px;
  --ds-font-size-body: 14px;       --ds-line-height-body: 20px;
  --ds-font-size-value: 16px;      --ds-line-height-value: 22px;
  --ds-font-size-heading: 20px;    --ds-line-height-heading: 28px;
  --ds-font-size-title: 24px;      --ds-line-height-title: 32px;

  --ds-tracking-title: -0.35px;
  --ds-tracking-heading: -0.5px;
  --ds-tracking-card-title: -0.4px;
  --ds-tracking-media-title: -0.25px;
  --ds-tracking-number: -0.65px;
  --ds-tracking-tight: -0.4px;
  --ds-tracking-upper: 0.55px;
  --ds-tracking-upper-sm: 0.4px;
  --ds-tracking-table-header: 0.3px;
  --ds-tracking-identifier: 0.55px;
  --ds-tracking-field: 0.5px;   /* read-only identifier values (DEOC barcodes) */

  /* ── Color: page & glass surfaces ─────────────────────── */
  --ds-color-bg-app: #0b1020;
  --ds-gradient-app: linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%);
  --ds-color-glow-brand: rgba(59,130,246,0.10);
  --ds-color-glow-success: rgba(52,211,153,0.08);
  --ds-gradient-glass: linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%);   /* CTA-blue glass (brand-strong #2563eb): white glass greyed the navy */
  --ds-gradient-glass-strong: linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.01) 100%);
  --ds-gradient-glass-up: linear-gradient(0deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%);
  --ds-gradient-glass-kpi: linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%);
  --ds-gradient-edge-control: linear-gradient(var(--ds-color-border-edge), var(--ds-color-border-edge));   /* 1 px stroke in the one border colour (D-8) */
  --ds-gradient-toggle: linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%);   /* every toggle track (D-9) */
  --ds-gradient-toggle-active: linear-gradient(180deg, rgba(59,130,246,0.42) 0%, rgba(37,99,235,0.18) 100%);   /* selected toggle option (D-9) */
  --ds-gradient-table-header-pinned: linear-gradient(rgba(37,99,235,0.07) 0 0), var(--ds-gradient-app) fixed, var(--ds-color-bg-app);   /* opaque sticky header (D-9); a `background` value */
  --ds-color-surface-base: #0f172a;
  --ds-color-surface-raised: #0c1325;
  --ds-gradient-dialog: linear-gradient(180deg, #182032 0%, #101527 100%);
  --ds-gradient-tooltip: linear-gradient(180deg, #171f31 0%, #101527 100%);
  --ds-color-surface-nested: rgba(172,195,255,0.04);
  --ds-color-surface-nested-hover: rgba(172,195,255,0.08);
  --ds-color-surface-control: rgba(255,255,255,0.04);
  --ds-color-surface-control-hover: rgba(255,255,255,0.07);
  --ds-color-surface-hover: rgba(255,255,255,0.05);
  --ds-color-surface-hover-subtle: rgba(255,255,255,0.03);
  --ds-color-surface-row-hover: rgba(255,255,255,0.02);
  --ds-color-surface-selected: rgba(172,195,255,0.08);
  --ds-color-surface-table-header: rgba(255,255,255,0.02);
  --ds-color-surface-table-header-pinned: #151c2e;
  --ds-color-surface-media: #0b0e13;
  --ds-color-surface-sunken-button: #121620;
  --ds-color-surface-entity-icon: #1a2535;
  --ds-color-surface-icon-tile: #1e293b;
  --ds-color-surface-avatar: #18202d;
  --ds-color-avatar-inner: #121622;
  --ds-color-track: rgba(255,255,255,0.08);

  /* ── Color: text ──────────────────────────────────────── */
  --ds-color-text-primary: #ffffff;
  --ds-color-text-emphasis: #e2e8f0;
  --ds-color-text-secondary: #cbd5e1;
  --ds-color-text-muted: #94a3b8;
  --ds-color-text-tertiary: #8a99ae;
  --ds-color-text-placeholder: rgba(203,213,225,0.60);
  --ds-color-text-faint: #475569;
  --ds-color-text-on-brand: #ffffff;
  --ds-color-text-on-bright: #0b0f14;
  --ds-color-text-chart-subtle: #9eacba;
  --ds-color-text-chart-strong: #f4f7fa;
  --ds-color-text-tooltip: #f4f6f8;
  --ds-color-text-tooltip-muted: #aeb8c5;
  --ds-color-text-axis: rgba(255,255,255,0.60);
  --ds-color-icon: #64748b;
  --ds-color-icon-chevron: #6b7280;

  /* ── Color: borders ───────────────────────────────────── */
  --ds-color-border-edge: rgba(255,255,255,0.02);  /* the one hairline border colour (D-8): the KPI-card border */
  --ds-color-border-hairline: var(--ds-color-border-edge);
  --ds-color-border-glass: var(--ds-color-border-edge);
  --ds-color-border-track: var(--ds-color-border-edge);
  --ds-color-border-faint: var(--ds-color-border-edge);
  --ds-color-border-subtle: var(--ds-color-border-edge);
  --ds-color-border-control: var(--ds-color-border-edge);
  --ds-color-border-strong: rgba(255,255,255,0.08);
  --ds-color-border-control-hover: rgba(255,255,255,0.20);
  --ds-color-border-control-strong: #6b7280;
  --ds-color-border-on-brand: rgba(255,255,255,0.30);
  --ds-color-border-divider: #292e33;
  --ds-color-border-tooltip-divider: rgba(57,67,75,0.40);
  --ds-color-border-avatar: #334155;
  --ds-color-border-logo: #333333;
  --ds-color-scrollbar: rgba(255,255,255,0.12);
  --ds-color-scrollbar-hover: rgba(255,255,255,0.20);
  --ds-color-skeleton: rgba(255,255,255,0.06);

  /* ── Color: brand ─────────────────────────────────────── */
  --ds-color-brand: #3b82f6;
  --ds-color-brand-strong: #2563eb;
  --ds-color-brand-stronger: #1d4ed8;
  --ds-gradient-button-primary: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  --ds-gradient-button-primary-hover: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  --ds-gradient-nav-active: linear-gradient(101deg, rgba(33,88,225,0.225) 0%, rgba(33,88,225,0.125) 43%, rgba(33,88,225,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.039) 0%, rgba(255,255,255,0.012) 100%);
  --ds-gradient-sheen: linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.30) 50%, rgba(96,165,250,0) 100%);
  --ds-color-brand-text: #93c5fd;
  --ds-color-link: #60a5fa;
  --ds-color-link-hover: #93c5fd;
  --ds-color-brand-tint-10: rgba(59,130,246,0.10);
  --ds-color-brand-tint-20: rgba(59,130,246,0.20);
  --ds-color-brand-tint-30: rgba(59,130,246,0.30);
  --ds-color-brand-border-hover: rgba(59,130,246,0.40);
  --ds-color-brand-avatar-border: rgba(147,197,253,0.30);
  --ds-gradient-brand-ring: linear-gradient(45deg, #3b82f6 0%, #818cf8 100%);
  --ds-gradient-brand-avatar: linear-gradient(45deg, #1d4ed8 0%, #6366f1 100%);
  --ds-color-stepper-track: #1f2636;
  --ds-color-stepper-active-border: rgba(147,197,253,0.40);
  --ds-gradient-stepper-active: linear-gradient(90deg, rgba(59,130,246,0.60) 0%, #1f2636 100%);
  --ds-color-focus-ring: #3b82f6;
  --ds-color-focus-ring-on-color: #ffffff;

  /* ── Color: status ────────────────────────────────────── */
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
  --ds-color-info-text: #93c5fd;
  --ds-color-info-bg: rgba(59,130,246,0.10);
  --ds-color-info-border: rgba(59,130,246,0.20);
  --ds-color-row-warning: rgba(251,191,36,0.03);
  --ds-color-row-critical: rgba(255,88,37,0.03);
  --ds-color-alert-count: #fb7185;

  /* ── Color: overlays ──────────────────────────────────── */
  --ds-color-scrim: rgba(0,0,0,0.50);
  --ds-overlay-blur: 4px;

  /* ── Color: data visualization ────────────────────────── */
  --ds-chart-cat-1: #016ffe;
  --ds-chart-cat-2: #8b34fd;
  --ds-chart-cat-3: #fbb645;
  --ds-chart-cat-4: #00bac9;
  --ds-chart-positive: var(--ds-color-success-glow);
  --ds-chart-negative: var(--ds-color-danger);
  --ds-chart-running: var(--ds-color-success-text);
  --ds-chart-stopped: var(--ds-color-danger);
  --ds-chart-trend: #ffffff;
  --ds-chart-track: var(--ds-color-track);
  --ds-chart-baseline: rgba(255,255,255,0.06);
  --ds-chart-axis: var(--ds-color-border-divider);
  --ds-chart-bubble-stroke: #151c22;
  --ds-heat-0: #003e3a;
  --ds-heat-1: #116035;
  --ds-heat-2: #597730;
  --ds-heat-3: #d18732;
  --ds-heat-4: #ff5825;

  /* ── Color: tags (solid, white text) ──────────────────── */
  --ds-tag-purple: #4d3f9d;
  --ds-tag-blue: #3f779d;
  --ds-tag-green: #457e32;
  --ds-tag-amber: #95693c;
  --ds-tag-rose: #9d3f5a;

  /* ── Spacing ──────────────────────────────────────────── */
  --ds-space-0-5: 2px;
  --ds-space-1: 4px;
  --ds-space-1-5: 6px;
  --ds-space-2: 8px;
  --ds-space-2-5: 10px;
  --ds-space-3: 12px;
  --ds-space-3-5: 14px;
  --ds-space-4: 16px;
  --ds-space-5: 20px;
  --ds-space-6: 24px;
  --ds-space-8: 32px;
  --ds-space-10: 40px;
  --ds-space-12: 48px;
  --ds-space-16: 64px;

  --ds-space-page-gutter: 16px;
  --ds-space-page-top: 8px;
  --ds-space-shell-padding: 16px;
  --ds-space-shell-gap: 20px;
  --ds-space-section: 20px;
  --ds-space-grid: 16px;
  --ds-space-grid-lg: 20px;
  --ds-space-stack: 12px;
  --ds-space-card: 16px;
  --ds-space-card-lg: 20px;
  --ds-space-card-xl: 24px;
  --ds-space-card-entity: 25px;   /* 24 + the 1 px inset edge (DEOC Card) */
  --ds-space-card-gap: 20px;
  --ds-space-chart-gap: 20px;
  --ds-space-header-actions: 12px;
  --ds-space-form-label: 6px;
  --ds-space-form-col: 20px;
  --ds-space-form-row: 40px;
  --ds-space-form-section: 24px;
  --ds-space-icon-text: 8px;
  --ds-space-icon-text-lg: 12px;
  --ds-space-cell-x: 16px;
  --ds-space-cell-y: 12px;

  /* ── Radii ────────────────────────────────────────────── */
  --ds-radius-xs: 4px;
  --ds-radius-chip: 6px;
  --ds-radius-sm: 8px;
  --ds-radius-control: 12px;
  --ds-radius-track: 12px;
  --ds-radius-nested: 16px;
  --ds-radius-card: 16px;
  --ds-radius-panel: 24px;
  --ds-radius-viewer: 32px;   /* expanded camera viewer (DEOC) */
  --ds-radius-full: 9999px;

  /* ── Shadows & effects ────────────────────────────────── */
  --ds-shadow-glass: 0 12px 28px 0 rgba(0,0,0,0.20);
  --ds-shadow-glass-soft: 0 12px 28px -10px rgba(0,0,0,0.20);
  --ds-shadow-control: 0 10px 24px 0 rgba(0,0,0,0.15);
  --ds-shadow-field: 0 10px 24px -10px rgba(0,0,0,0.15);
  --ds-shadow-xs: 0 1px 2px 0 rgba(0,0,0,0.05);
  --ds-shadow-highlight: inset 0 1px 0 0 rgba(255,255,255,0.07);
  --ds-shadow-card: 0 2px 36px 0 rgba(0,0,0,0.12), 0 2px 12px 0 rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.07);
  --ds-shadow-float-drop: 0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40);
  --ds-shadow-float: var(--ds-shadow-float-drop), var(--ds-shadow-edge);
  --ds-shadow-kpi-lift: 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10);
  --ds-shadow-edge: inset 0 0 0 1px var(--ds-color-border-edge);
  --ds-shadow-edge-bottom: inset 0 -1px 0 0 var(--ds-color-border-edge);
  --ds-shadow-surface: var(--ds-shadow-glass), var(--ds-shadow-edge);  /* the content-card surface: entity, dashboard, status, side-panel cards */
  --ds-shadow-sidebar: 0 28px 56px 0 rgba(0,0,0,0.40);
  --ds-shadow-shell: 0 28px 64px -16px rgba(0,0,0,0.40);
  --ds-shadow-drawer: -18px 0 45px 0 rgba(0,0,0,0.80), -1px 0 0 0 rgba(255,255,255,0.07);
  --ds-shadow-drawer-mirrored: 18px 0 45px 0 rgba(0,0,0,0.80), 1px 0 0 0 rgba(255,255,255,0.07);
  --ds-shadow-modal: 0 25px 50px -12px rgba(0,0,0,0.40);
  --ds-shadow-elevated: 0 4px 40px rgba(0,0,0,0.50);
  --ds-shadow-tooltip: 0 12px 28px 0 rgba(0,0,0,0.20);
  --ds-shadow-button-primary: 0 4px 7px 0 rgba(37,99,235,0.35), inset 0 1px 0 0 rgba(255,255,255,0.28);
  --ds-shadow-close: inset 0 2px 4px 0 rgba(0,0,0,0.60), 0 1px 0 0 rgba(255,255,255,0.04);
  --ds-shadow-stepper-active: 0 0 0 2px rgba(59,130,246,0.20), 0 0 20px -2px rgba(37,99,235,0.45), inset 0 1px 1px 1px rgba(255,255,255,0.35);
  --ds-shadow-stepper-idle: inset 0 2px 4px 0 rgba(0,0,0,0.60);
  --ds-shadow-avatar: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10);
  --ds-shadow-avatar-orb: 0 7px 10px -2px rgba(59,130,246,0.30), 0 3px 4px -3px rgba(59,130,246,0.30);
  --ds-shadow-header-scrolled: 0 8px 16px -6px rgba(0,0,0,0.60);
  --ds-shadow-footer-scrolled: 0 -8px 16px -6px rgba(0,0,0,0.60);
  --ds-shadow-status-success: 0 0 10px 0 #10b981, 0 0 2px 0 #34d399;
  --ds-shadow-status-warning: 0 0 10px 0 #fbbf24, 0 0 2px 0 #fbbf24;
  --ds-shadow-status-error: 0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825;
  --ds-blur-ambient: 60px;

  /* Focus (rendered with outline, §2.7) */
  --ds-focus-width: 2px;
  --ds-focus-width-field: 1px;   /* fields, triggers, tabs, toggles (DEOC ring-1) */
  --ds-focus-offset: 2px;
  --ds-focus-offset-tight: 0px;
  --ds-focus-offset-inset: -2px;
  --ds-error-ring: 0 0 0 1px var(--ds-color-error);

  /* ── Sizes ────────────────────────────────────────────── */
  --ds-size-control: 40px;
  --ds-size-control-sm: 28px;
  --ds-size-control-lg: 48px;
  --ds-size-icon-button: 36px;
  --ds-size-icon-button-compact: 32px;
  --ds-size-pagination-button: 32px;
  --ds-size-page-header: 76px;
  --ds-size-section-header: 60px;
  --ds-size-table-row: 44px;
  --ds-size-table-header: 40px;
  --ds-size-table-row-compact: 40px;
  --ds-size-table-header-compact: 36px;
  --ds-size-heat-row: 40px;
  --ds-size-kpi-card: 76px;
  --ds-size-kpi-icon: 40px;
  --ds-size-entity-icon: 40px;
  --ds-size-page-icon: 36px;
  --ds-size-avatar-sm: 32px;
  --ds-size-avatar-md: 36px;
  --ds-size-avatar-lg: 40px;
  --ds-border-width: 1px;
  --ds-border-width-emphasis: 2px;
  --ds-border-width-detect: 2px;
  --ds-size-nav-item: 44px;
  --ds-size-nav-icon: 24px;
  --ds-size-action-icon: 24px;
  --ds-size-ui-icon: 16px;
  --ds-size-ui-icon-sm: 14px;
  --ds-size-search-icon: 18px;
  --ds-size-media-icon: 28px;
  --ds-size-sidebar-collapsed: 76px;
  --ds-size-sidebar-expanded: 256px;
  --ds-size-aside: 340px;
  --ds-size-status-dot: 10px;
  --ds-size-status-dot-sm: 8px;
  --ds-size-badge-dot: 6px;
  --ds-size-checkbox: 16px;
  --ds-size-menu-max-height: 260px;
  --ds-size-picker-max-height: 280px;
  --ds-size-dialog: 440px;
  --ds-size-modal: 720px;
  --ds-size-panel-sm: 480px;
  --ds-size-panel-md: 560px;
  --ds-size-panel-lg: 680px;
  --ds-size-panel-xl: 820px;
  --ds-size-popover-date: 360px;
  --ds-size-tooltip: 314px;
  --ds-size-filter: 180px;
  --ds-size-filter-sm: 160px;
  --ds-size-filter-lg: 200px;
  --ds-size-filter-date: 240px;
  --ds-size-search-sm: 288px;
  --ds-size-search-md: 320px;
  --ds-size-search-lg: 360px;
  --ds-size-header-button: 180px;

  /* ── Motion ───────────────────────────────────────────── */
  --ds-duration-fast: 150ms;
  --ds-duration-base: 200ms;
  --ds-duration-slow: 300ms;
  --ds-duration-chart: 500ms;
  --ds-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ds-ease-emphasized: cubic-bezier(0.22, 1, 0.36, 1);

  /* ── Z-index ──────────────────────────────────────────── */
  --ds-z-header: 10;
  --ds-z-tooltip: 30;
  --ds-z-sidebar: 40;
  --ds-z-menu: 50;
  --ds-z-overlay: 50;
  --ds-z-toast: 60;
  --ds-z-label-tooltip: 70;
}
```

---

## 4. Base / global CSS

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; }

/* Subtle scrollbars: thin, faint thumb, no track */
* { scrollbar-width: thin; scrollbar-color: var(--ds-color-scrollbar) transparent; }
@supports not (scrollbar-color: auto) {
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--ds-color-scrollbar); border-radius: var(--ds-radius-full); }
  ::-webkit-scrollbar-thumb:hover { background: var(--ds-color-scrollbar-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
}

html, body { height: 100%; }
body {
  margin: 0;
  font-family: var(--ds-font-family);
  font-size: var(--ds-font-size-body);
  line-height: var(--ds-line-height-body);
  color: var(--ds-color-text-secondary);
  background: var(--ds-color-bg-app) var(--ds-gradient-app) fixed;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, p, dl, dd, ol, ul, figure { margin: 0; }
ul, ol { padding: 0; list-style: none; }
button, input, select, textarea { font: inherit; color: inherit; }
button { background: none; border: 0; padding: 0; cursor: pointer; }
img, svg { display: block; }
[hidden] { display: none !important; }  /* component display rules must never reveal hidden content */

/* Focus: one reliable indicator everywhere (§2.7). */
:focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
:focus:not(:focus-visible) { outline: none; }  /* the only permitted outline removal */
input:focus-visible, textarea:focus-visible, select:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }

/* Direction-aware icons (§8.9) */
.ds-icon--dir:dir(rtl) { transform: scaleX(-1); }

/* Increased-contrast boundary mode (§9.3): glass edges are 2–7 % white; this raises every control edge to 3:1. */
@media (prefers-contrast: more) {
  :is(.ds-input, .ds-select__trigger, .ds-attach__field, .ds-tabs, .ds-tab[aria-selected="true"], .ds-radio-card, .ds-toggle__opt, .ds-nav__item[aria-current="page"], .ds-btn--secondary, .ds-btn--subtle, .ds-btn--ghost, .ds-dropzone) {
    border: 1px solid var(--ds-color-border-control-strong);
  }
}
[data-contrast="more"] :is(.ds-input, .ds-select__trigger, .ds-attach__field, .ds-tabs, .ds-tab[aria-selected="true"], .ds-radio-card, .ds-toggle__opt, .ds-nav__item[aria-current="page"], .ds-btn--secondary, .ds-btn--subtle, .ds-btn--ghost, .ds-dropzone) {
  border: 1px solid var(--ds-color-border-control-strong);
}

@media (forced-colors: active) {
  .ds-dot, .ds-badge__dot, .ds-live__dot { forced-color-adjust: none; }
}

.ds-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* Browser autofill would paint fields light; repaint them on the opaque base */
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--ds-color-text-primary);
  caret-color: var(--ds-color-text-primary);
  box-shadow: inset 0 0 0 1000px var(--ds-color-surface-base);
  transition: background-color 99999s ease-out;
}

input[type="date"], .ds-popover { color-scheme: dark; }
input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0ms !important; animation-duration: 0ms !important; animation-iteration-count: 1 !important; }
}

/* Text-style helpers that components use directly (the full set is .ds-ts-<name>, generated from §2.3) */
.ds-text-page-title   { font-size: var(--ds-font-size-title); font-weight: 600; line-height: 32px; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-primary); }
.ds-text-dialog-title { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: 28px; letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-text-card-title   { font-size: var(--ds-font-size-heading); font-weight: 600; line-height: 24px; letter-spacing: var(--ds-tracking-card-title); color: var(--ds-color-text-primary); }
.ds-text-group-title  { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: 24px; letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-text-subgroup-title { font-size: var(--ds-font-size-value); font-weight: 700; line-height: 22px; letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-text-kpi-value    { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: 28px; letter-spacing: var(--ds-tracking-number); color: var(--ds-color-text-primary); }
.ds-text-kpi-label    { font-size: var(--ds-font-size-label); font-weight: 700; line-height: 16px; letter-spacing: var(--ds-tracking-upper); color: var(--ds-color-text-muted); text-transform: uppercase; }
.ds-text-metric-value { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: 28px; letter-spacing: var(--ds-tracking-number); color: var(--ds-color-text-primary); }
.ds-text-metric-label { font-size: var(--ds-font-size-label); font-weight: 500; line-height: 18px; letter-spacing: var(--ds-tracking-upper-sm); color: var(--ds-color-text-muted); text-transform: uppercase; }
.ds-text-body         { font-size: var(--ds-font-size-body); font-weight: 400; line-height: 20px; color: var(--ds-color-text-secondary); }
.ds-text-body-muted   { font-size: var(--ds-font-size-body); font-weight: 400; line-height: 20px; color: var(--ds-color-text-muted); }
.ds-text-body-strong  { font-size: var(--ds-font-size-body); font-weight: 500; line-height: 20px; color: var(--ds-color-text-primary); }
.ds-text-small        { font-size: var(--ds-font-size-label); font-weight: 400; line-height: 16px; color: var(--ds-color-text-muted); }
.ds-text-caption      { font-size: var(--ds-font-size-caption); font-weight: 400; line-height: 14px; color: var(--ds-color-text-tertiary); }
.ds-text-validation   { font-size: var(--ds-font-size-label); font-weight: 400; line-height: 16px; color: var(--ds-color-error-text); }
.ds-truncate          { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.ds-clamp-2           { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Small layout helpers built from tokens */
.ds-cluster { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ds-space-3); }
.ds-muted { color: var(--ds-color-text-muted); }
.ds-contents { display: contents; }
.ds-rot90 { transform: rotate(90deg); }
.ds-c-success { color: var(--ds-color-success-text) !important; }
.ds-c-warning { color: var(--ds-color-warning-text) !important; }
.ds-c-alert   { color: var(--ds-color-alert-count) !important; }
.ds-c-error   { color: var(--ds-color-danger-text) !important; }
```

---

## 5. Component specifications

**Layer L2.** When a component is used, its visuals, states and accessibility MUST match this section. Each entry lists **Purpose · Figma source · Anatomy & visual spec · Variants · States · Behavior · CSS**. CSS uses only §3 tokens and relies on the §4 base (including the global focus outline). Anatomy and behavior are [PRESERVED] from the previous system unless a Figma source shows otherwise.

### Universal state matrix

| State | Treatment |
|---|---|
| Default | As specified per component |
| Hover | One step lighter: glass → `surface-hover` overlay or brighter border (`border-control-hover`); clickable cards `brightness(1.1)`. Never a color change on status elements |
| Focus-visible | 2 px `focus-ring` outline on buttons and links, 1 px `focus-ring-field` on fields and toggles (§2.7) — never removed |
| Active / pressed | Same as hover; primary button keeps its gradient |
| Selected / current | Navigation: `gradient-nav-active` + `shadow-card`; tabs and toggles: `gradient-toggle-active` pill + primary text; menu options: `surface-hover` + primary text; picker rows: `surface-selected`; pages: `brand-strong` |
| Disabled | `opacity: 0.4` + `pointer-events: none` (or `aria-disabled` + `cursor: not-allowed`) |
| Error | Fields: 1 px `error` ring + `validation` message; status: `danger` pill |
| Loading | Spinner in place of the leading icon (`aria-busy`), skeletons in place of content |
| Empty | §5.51 empty state inside the container |

### 5.1 Button

**Purpose** Trigger an action. **Figma** "CTA" (primary: Line Changeover, Add camera, Add user, Next, Save product, Add Camera), "Dropdown → Options" used as buttons (Back, Cancel, Skip, Export), "Secondary CTA" (View factory, Add Camera to Line).

| Part | Spec |
|---|---|
| Container | padding `space-2-5` `space-4` (10 × 16), radius `radius-control` (12). Bordered variants (primary, secondary, subtle, danger) add a 1 px border, so they are 42 px tall; borderless variants (tonal, ghost, section) are 40 px |
| Label | `button-md` 14/600 in every variant |
| Leading icon | 14 px (plus, changeover) or 20 px (back arrow); gap `space-2` |
| Trailing icon | 14 px chevron pointing inline-end (Next / Save) |

| Variant | Fill | Border | Text | Shadow | Figma |
|---|---|---|---|---|---|
| **primary** | `gradient-button-primary` | `brand` | `text-on-brand` | `shadow-button-primary` | OBSERVED |
| **secondary** | `gradient-glass` | `border-control` | `text-emphasis` | `shadow-field` | OBSERVED (Back, Cancel, Skip, Export) |
| **subtle** | `surface-control` | `border-hairline` | `text-emphasis` | none | OBSERVED (View factory) |
| **section** | `surface-control` | none (`inset 0 0 0 1px border-hairline`) | `text-emphasis` | — | DEOC section-header action ("Add Camera" on a line) |
| **tonal** | `brand-tint-20` | none | `brand-text` | none | EXTENSION |
| **ghost** | transparent | none | `text-muted` | none | EXTENSION |
| **danger** | `danger-bg` | `danger-border` | `danger-text` | none | EXTENSION |

Sizes: **sm** padding 6 × 12 (`button-sm`, 28 px + border), **md** padding 10 × 16 (default), **lg** padding 12 × 20 (`button-lg`, 46 px + border). Optional minimum width `size-header-button` (180) for header and footer primaries (OBSERVED: every primary in the screens is 180 px wide).

**States.** Hover: primary → `gradient-button-primary-hover`; secondary → `border-control-hover`; subtle and section → `surface-control-hover`; tonal → `brand-tint-30`; ghost → `surface-hover` + primary text; danger → `danger-bg-hover`. Loading: spinner replaces the leading icon, `aria-busy="true"`, clicks ignored. Disabled: 0.4.

**Behavior.** Native `<button type="button">`. One primary per view region. Icon-only buttons use §5.2.

```css
.ds-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--ds-space-2);
  padding: var(--ds-space-2-5) var(--ds-space-4);
  border: 0; border-radius: var(--ds-radius-control);
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600;
  white-space: normal; text-align: center; cursor: pointer;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard),
              color var(--ds-duration-fast) var(--ds-ease-standard), box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}
.ds-btn:disabled { opacity: 0.4; pointer-events: none; }
.ds-btn[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }
.ds-btn--sm { padding: var(--ds-space-1-5) var(--ds-space-3); font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-btn--lg { padding: var(--ds-space-3) var(--ds-space-5); font-size: var(--ds-font-size-value); line-height: 22px; }
.ds-btn--minw { min-width: var(--ds-size-header-button); }

.ds-btn--primary { background: var(--ds-gradient-button-primary); border: 1px solid var(--ds-color-brand); color: var(--ds-color-text-on-brand); box-shadow: var(--ds-shadow-button-primary); }
.ds-btn--primary:hover { background: var(--ds-gradient-button-primary-hover); }
.ds-btn--secondary { background: var(--ds-gradient-glass); border: 1px solid var(--ds-color-border-control); color: var(--ds-color-text-emphasis); box-shadow: var(--ds-shadow-field); }
.ds-btn--secondary:hover { border-color: var(--ds-color-border-control-hover); }
.ds-btn--subtle { background: var(--ds-color-surface-control); border: 1px solid var(--ds-color-border-hairline); color: var(--ds-color-text-emphasis); }
.ds-btn--subtle:hover { background: var(--ds-color-surface-control-hover); }
.ds-btn--section { background: var(--ds-color-surface-control); box-shadow: inset 0 0 0 1px var(--ds-color-border-hairline); color: var(--ds-color-text-emphasis); }
.ds-btn--section:hover { background: var(--ds-color-surface-control-hover); }
.ds-btn--tonal { background: var(--ds-color-brand-tint-20); color: var(--ds-color-brand-text); }
.ds-btn--tonal:hover { background: var(--ds-color-brand-tint-30); }
.ds-btn--ghost { background: transparent; color: var(--ds-color-text-muted); }
.ds-btn--ghost:hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-btn--danger { background: var(--ds-color-danger-bg); border: 1px solid var(--ds-color-danger-border); color: var(--ds-color-danger-text); }
.ds-btn--danger:hover { background: var(--ds-color-danger-bg-hover); }

.ds-spinner { width: 16px; height: 16px; animation: ds-spin 1s linear infinite; }
@keyframes ds-spin { to { transform: rotate(360deg); } }
```

### 5.2 Icon button

**Purpose** An icon-only action with an `aria-label` and a label tooltip. **Figma** row actions (copy, edit, delete — 24 px glyphs, 48 px apart), close buttons in drawers (36) and modals (32), sidebar collapse (24).

| Variant | Box | Glyph | Fill / border | Color |
|---|---|---|---|---|
| default | 36 (`size-icon-button`), radius `radius-sm` | 20 | transparent | `text-muted` → `text-primary` + `surface-hover` on hover |
| compact | 32 (`size-icon-button-compact`) | 24 (row actions) | transparent | same |
| sm | 28 | 20 (row actions) | transparent | same |
| close | 36 (32 when compact) | 10 × | `surface-sunken-button` fill, `border-subtle`, `shadow-close` (debossed) | `text-muted` |

Row actions are `sm` buttons in a `ds-row-actions` cluster with `space-3` gaps. Focus: 2 px ring with no offset. Disabled: 0.4.

```css
.ds-icon-btn {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: var(--ds-size-icon-button); height: var(--ds-size-icon-button);
  border-radius: var(--ds-radius-sm); color: var(--ds-color-text-muted); background: transparent;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard), color var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast);
}
.ds-icon-btn--compact { width: var(--ds-size-icon-button-compact); height: var(--ds-size-icon-button-compact); }
.ds-icon-btn--sm { width: var(--ds-size-control-sm); height: var(--ds-size-control-sm); }
.ds-icon-btn:hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-icon-btn:focus-visible { outline-offset: 0; }
.ds-icon-btn:disabled { opacity: 0.4; pointer-events: none; }
.ds-icon-btn--close { background: var(--ds-color-surface-sunken-button); border: 1px solid var(--ds-color-border-subtle); box-shadow: var(--ds-shadow-close); color: var(--ds-color-text-muted); }
.ds-icon-btn--close:hover { border-color: var(--ds-color-border-control-hover); color: var(--ds-color-text-primary); }
.ds-icon-btn--open { color: var(--ds-color-link); }
```

### 5.3 Link action

**Purpose** An inline text action ("+ Add New User"). **DEOC** below the admin field: 14/600, 14 px plus icon, `brand` (`#3b82f6`), `link` on hover (D-10 supersedes R-08).

```css
.ds-link-action { display: inline-flex; align-items: center; gap: var(--ds-space-2); align-self: flex-start;
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600; color: var(--ds-color-brand); border-radius: var(--ds-radius-xs);
  transition: color var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-link-action:hover { color: var(--ds-color-link); }
```

### 5.4 Action group

**Purpose** A row of related actions. Header actions: filters → primary, `space-header-actions` (12) apart (OBSERVED in every header). Footer actions: secondary at the inline-start, helper text + primary at the inline-end (OBSERVED in drawer footers). Modal actions: secondary (120 px) then primary (180 px), 16 px apart, aligned inline-end (OBSERVED). **[EXTENSION]** split button: a primary whose menu toggle shares its edge.

```css
.ds-action-row { display: flex; align-items: center; justify-content: flex-end; gap: var(--ds-space-4); flex-wrap: wrap; }
.ds-split { display: inline-flex; }
.ds-split > .ds-btn:first-child { border-start-end-radius: 0; border-end-end-radius: 0; }
.ds-split__toggle { width: var(--ds-size-control); padding: 0; border-start-start-radius: 0; border-end-start-radius: 0; border-inline-start-color: var(--ds-color-border-on-brand); }
```

### 5.5 Text input

**Purpose** Single-line text entry. **Figma** every drawer and modal field ("Input"): glass fill, white/3 % border, 12 px radius, soft drop shadow, 16 px horizontal padding, 40 px tall, placeholder `#cbd5e1` at 50 % (raised to 60 %, R-07).

| Part | Spec |
|---|---|
| Field | padding `space-2-5` `space-4` (40 px tall), no border: the 1 px edge is `shadow-edge` next to `shadow-field`; radius `radius-control`, `gradient-glass` |
| Value | `input-text` 14/400 `text-primary` |
| Placeholder | `text-placeholder` |
| Suffix / trailing button | 12 px `text-muted` suffix, or a 24 px hit-area trailing button 12 px from the edge |

**States.** Hover: no change. Focus: `focus-ring-field` (1 px brand). Error (`aria-invalid`): 1 px `error` ring + message (§5.8). Disabled: 0.4.

```css
.ds-input {
  width: 100%; padding: var(--ds-space-2-5) var(--ds-space-4);
  border: 0; border-radius: var(--ds-radius-control);
  background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-field), var(--ds-shadow-edge);
  font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-primary);
  transition: box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}
.ds-input::placeholder { color: var(--ds-color-text-placeholder); opacity: 1; }
.ds-input:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-input[aria-invalid="true"] { box-shadow: var(--ds-error-ring), var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-input:disabled { opacity: 0.4; }
.ds-input-wrap { position: relative; }
.ds-input--suffix { padding-inline-end: var(--ds-space-12); }
.ds-input__suffix { position: absolute; inset-inline-end: 16px; top: 50%; transform: translateY(-50%); pointer-events: none;
  font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-muted); }
.ds-input--trailing { padding-inline-end: 44px; }
.ds-input__trailing { position: absolute; inset-inline-end: 12px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-xs); color: var(--ds-color-text-muted); opacity: 0.7; }
.ds-input__trailing:hover, .ds-input__trailing[aria-pressed="true"] { color: var(--ds-color-text-primary); opacity: 1; }
.ds-input--date { padding: 0 var(--ds-space-3); color-scheme: dark; }
```

### 5.6 Search input

**Purpose** Filter a list. **Figma** header search ("Filter factories or units…", 288 px; "Search users by name, email, role or factory", 350 px) and the full-width table search: §5.5 field with a 16 px search glyph (`size-ui-icon`, 60 % opacity, same as filter lead icons) 16 px from the inline-start and 40 px start padding.

```css
.ds-search { position: relative; }
.ds-search__icon { position: absolute; inset-inline-start: var(--ds-space-4); top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--ds-color-text-muted); opacity: 0.6;
  width: var(--ds-size-ui-icon); height: var(--ds-size-ui-icon); display: flex; align-items: center; justify-content: center; }
.ds-search__input { padding-inline-start: var(--ds-space-10); padding-inline-end: var(--ds-space-4); }
.ds-search--sm { width: var(--ds-size-search-sm); max-width: 100%; }
.ds-search--md { width: var(--ds-size-search-md); max-width: 100%; }
.ds-search--lg { width: var(--ds-size-search-lg); max-width: 100%; }
.ds-search--full { width: 100%; }
.ds-search:has(.ds-search__clear) .ds-search__input { padding-inline-end: 44px; }
.ds-search__clear { inset-inline-end: 9px; }
```

### 5.7 Textarea

**Figma** "Notes (optional)": §5.5 field, 80 px minimum (10 px top padding, value aligned to the top).

```css
.ds-textarea { height: auto; min-height: 80px; padding: var(--ds-space-2-5) var(--ds-space-4); resize: vertical; }
```

### 5.8 Form field (label + control + message)

**DEOC** labels above controls with 6 px gap; drawers use sentence-case `form-label` in `text-muted`; compact modals use `form-label-caps` (uppercase, `text-muted`). Required marker `*` in `error-text` (`#fb7185`, OBSERVED). Help text and errors are 12 px below the control.

| Part | Spec |
|---|---|
| Label | `form-label` (variant `--caps`: `form-label-caps`) |
| Required | ` *` in `error-text`, plus `aria-required` on the control |
| Help | `helper` (`text-tertiary`) |
| Error | `validation`, linked with `aria-describedby`; the control gets `aria-invalid` |

```css
.ds-field { display: flex; flex-direction: column; gap: var(--ds-space-form-label); min-width: 0; }
.ds-field__label { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 500; color: var(--ds-color-text-muted); }
.ds-field--caps .ds-field__label { color: var(--ds-color-text-muted); text-transform: uppercase; letter-spacing: var(--ds-tracking-upper); }
.ds-field__req { color: var(--ds-color-error-text); margin-inline-start: 2px; }
.ds-field__help { font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-tertiary); margin-top: 2px; }
.ds-field__error { font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-error-text); margin-top: 2px; }
.ds-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--ds-space-form-col); row-gap: var(--ds-space-form-row); }
.ds-form-grid--1 { grid-template-columns: minmax(0, 1fr); }
.ds-form-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ds-form-grid > .ds-span-2 { grid-column: span 2; }
.ds-form-grid > .ds-span-all { grid-column: 1 / -1; }
.ds-form-section { display: flex; flex-direction: column; gap: var(--ds-space-form-section); }
.ds-form-section__title { padding-bottom: var(--ds-space-4); border-bottom: 1px solid var(--ds-color-border-subtle);
  font-size: var(--ds-font-size-body); line-height: 18px; font-weight: 400; color: var(--ds-color-text-primary); }
@media (max-width: 1023px) {
  .ds-form-grid, .ds-form-grid--3 { grid-template-columns: minmax(0, 1fr); }
  .ds-form-grid > .ds-span-2 { grid-column: auto; }
}
```

### 5.9 Select (single choice)

**Purpose** Choose one option. **Figma** header filters ("Factory 1 (Main)", "All Status", "Today") and form selects ("Enter region name", "e.g. - Line 1").

| Variant | Trigger | Value |
|---|---|---|
| **filter** (headers, toolbars, and DEOC's single-choice form selects) | `gradient-glass`, 1 px `gradient-edge-control` stroke drawn on `::before` (no border), `shadow-control`; hover `gradient-glass-strong`, padding 10 12 10 16, radius 12 | `text-emphasis` 14/400; placeholder `text-placeholder` |
| **field** (multi-select and picker triggers) | §5.5 field plus `shadow-xs`, padding 10 14 10 16 | `text-primary` 14/400; placeholder `text-placeholder` |

Chevron 18 px `icon-chevron`, rotates 180° when open. Default filter width `size-filter` (180). **States** hover `gradient-glass-strong` (filter) / none (field); focus `focus-ring-field`; open: `aria-expanded="true"`; error: 1 px `error` ring.

```css
.ds-select { position: relative; min-width: 0; }
.ds-select__trigger {
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-2);
  width: 100%; border: 0; border-radius: var(--ds-radius-control);
  font-size: var(--ds-font-size-body); line-height: 20px; text-align: start;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.ds-select__trigger--filter { position: relative; padding: var(--ds-space-2-5) var(--ds-space-3) var(--ds-space-2-5) var(--ds-space-4); background: var(--ds-gradient-glass);
  box-shadow: var(--ds-shadow-control); color: var(--ds-color-text-emphasis); }
.ds-select__trigger--filter:hover { background: var(--ds-gradient-glass-strong); }
.ds-select__trigger--filter::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: var(--ds-gradient-edge-control); pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); }  /* 1 px stroke inside the box (DEOC edge-control) */
.ds-select__trigger--field { padding: var(--ds-space-2-5) var(--ds-space-3-5) var(--ds-space-2-5) var(--ds-space-4); background: var(--ds-gradient-glass);
  box-shadow: var(--ds-shadow-field), var(--ds-shadow-edge), var(--ds-shadow-xs); color: var(--ds-color-text-primary); }
.ds-select__trigger:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-select__trigger[aria-invalid="true"] { box-shadow: var(--ds-error-ring), var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-select__trigger:disabled { opacity: 0.4; pointer-events: none; }
.ds-select__value { display: flex; align-items: center; gap: var(--ds-space-2); min-width: 0; }
.ds-select__value--placeholder { color: var(--ds-color-text-placeholder); }
.ds-select__lead { flex-shrink: 0; width: var(--ds-size-ui-icon); height: var(--ds-size-ui-icon); color: var(--ds-color-text-muted); opacity: 0.6; }  /* filter lead line icon; a selected status dot takes its place */
.ds-select__chevron { flex-shrink: 0; color: var(--ds-color-icon-chevron); transition: transform var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-select__trigger[aria-expanded="true"] .ds-select__chevron { transform: rotate(180deg); }
.ds-select__icon { flex-shrink: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: var(--ds-color-icon-chevron); }
.ds-select--160 { min-width: var(--ds-size-filter-sm); } .ds-select--180 { min-width: var(--ds-size-filter); }
.ds-select--200 { min-width: var(--ds-size-filter-lg); } .ds-select--240 { min-width: var(--ds-size-filter-date); }
.ds-select--w180 { width: var(--ds-size-filter); }
```

### 5.10 Dropdown menu (listbox)

**Purpose** The floating option list of a select, multi-select or command menu. **DEOC** `Dropdown` / `MultiSelect`: an opaque `surface-raised` panel with no border (the edge is part of `shadow-float`), radius 12 for single-select and 8 for multi-select menus.

| Part | Spec |
|---|---|
| Panel | `surface-raised`, no border, radius `radius-control` (multi-select: `radius-sm`), `shadow-float`, 4 px below the trigger |
| Option | padding 10 16 (40 px), 14/400 `text-muted`; hover / active-descendant and selected: `surface-hover` + primary (no check mark) |
| Action row | pinned to the bottom of the list, top border `border-subtle`, menu fill, padding 10 16, `brand-text` 14/500 with a 16 px plus icon; primary on hover |
| Search | 8 px padding, divider `border-subtle` |

```css
.ds-menu { position: absolute; z-index: var(--ds-z-menu); top: 100%; inset-inline-start: 0; margin-top: var(--ds-space-1); width: 100%;
  background: var(--ds-color-surface-raised); border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-shadow-float); overflow: hidden; }
.ds-menu:has(.ds-menu__option--multi) { border-radius: var(--ds-radius-sm); }
.ds-menu--wide { width: max-content; min-width: 100%; max-width: min(420px, 90vw); }
.ds-menu--up { top: auto; bottom: 100%; margin-top: 0; margin-bottom: var(--ds-space-1); }
.ds-menu__search { padding: var(--ds-space-2); border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-menu__list { max-height: var(--ds-size-menu-max-height); overflow-y: auto; }
.ds-menu__option { display: flex; align-items: center; gap: var(--ds-space-2); padding: var(--ds-space-2-5) var(--ds-space-4);
  cursor: pointer; font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-menu__option:hover, .ds-menu__option.is-active { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-menu:focus-within .ds-menu__option.is-active { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-inset); }
.ds-menu__option[aria-selected="true"] { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-menu__option[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }
.ds-menu__check { display: none; }  /* DEOC marks the selected option by its fill only */
.ds-menu__empty { padding: var(--ds-space-2-5) var(--ds-space-4); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-muted); }
.ds-menu__action { position: sticky; bottom: 0; display: flex; align-items: center; gap: var(--ds-space-2); width: 100%; padding: var(--ds-space-2-5) var(--ds-space-4);
  border-top: 1px solid var(--ds-color-border-subtle); background: var(--ds-color-surface-raised);
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 500; color: var(--ds-color-brand-text); text-align: start; }
.ds-menu__list > .ds-menu__action:first-child { border-top: 0; }
.ds-menu__action:hover { color: var(--ds-color-text-primary); }
.ds-menu__action:focus-visible { outline-offset: var(--ds-focus-offset-inset); }
```

### 5.11 Multi-select

**Purpose** Choose several options. **DEOC** `MultiSelect`: a §5.9 field trigger showing the joined labels; options carry a 16 px checkbox with a 12 px gap, stay `text-secondary` and have no selected fill (the checkbox carries the state); hover `surface-hover`; the menu stays open while toggling.

```css
.ds-menu__option--multi, .ds-menu__option--multi[aria-selected="true"] { gap: var(--ds-space-3); background: transparent; color: var(--ds-color-text-secondary); }
.ds-menu__option--multi:hover { background: var(--ds-color-surface-hover); }
.ds-menu__option--multi .ds-check__box { pointer-events: none; }
.ds-menu__option[aria-selected="true"] .ds-check__box { background: var(--ds-color-brand-strong); border-color: var(--ds-color-brand); }
```

### 5.12 Checkbox [EXTENSION]

16 px box, radius 4, 1 px `border-control-hover` (white/20 %, as DEOC; boundary mode §9.3 raises it). Checked / indeterminate: `brand-strong` fill, `brand` border, white mark. Label 14/400 `text-secondary`, 12 px gap. The native input sits invisibly over the box.

```css
.ds-check { position: relative; display: inline-flex; align-items: center; gap: var(--ds-space-3); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-secondary); cursor: pointer; }
.ds-check input { position: absolute; inset-inline-start: 0; top: 50%; width: var(--ds-size-checkbox); height: var(--ds-size-checkbox); margin: 0; transform: translateY(-50%); opacity: 0; cursor: inherit; }
.ds-check__box { width: var(--ds-size-checkbox); height: var(--ds-size-checkbox); border-radius: var(--ds-radius-xs); border: 1px solid var(--ds-color-border-control-hover);
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background-color var(--ds-duration-fast), border-color var(--ds-duration-fast); }
.ds-check__box svg { display: none; }
.ds-check input:checked + .ds-check__box, .ds-check input:indeterminate + .ds-check__box { background: var(--ds-color-brand-strong); border-color: var(--ds-color-brand); }
.ds-check input:checked + .ds-check__box svg, .ds-check input:indeterminate + .ds-check__box svg { display: block; }
.ds-check input:focus-visible + .ds-check__box { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
.ds-check:has(input:disabled) { opacity: 0.4; cursor: not-allowed; }
```

### 5.13 Radio cards

**Purpose** Choose one of 2–4 visible options. **DEOC** `RadioCards`: 1 px `border-control-hover` (white/20 %), radius 8, padding 10 16, 14/400 label in `text-placeholder`; selected: `brand-strong` border, `surface-nested` fill, primary text. Hover changes nothing. Each card has a 20 px radio glyph.

```css
.ds-radio-group { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
.ds-radio-group--vertical { flex-direction: column; }
.ds-radio-card { flex: 1 1 0; min-width: 0; display: flex; align-items: center; gap: var(--ds-space-2);
  padding: var(--ds-space-2-5) var(--ds-space-4); border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-control-hover);
  background: transparent; color: var(--ds-color-text-placeholder); font-size: var(--ds-font-size-body); line-height: 20px; text-align: start;
  transition: border-color var(--ds-duration-fast), background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-radio-card[aria-checked="true"] { background: var(--ds-color-surface-nested); border-color: var(--ds-color-brand-strong); color: var(--ds-color-text-primary); }
.ds-radio-card:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-radio-glyph { flex-shrink: 0; color: var(--ds-color-text-muted); }
.ds-radio-card[aria-checked="true"] .ds-radio-glyph { color: var(--ds-color-brand); }
.ds-radio-group[aria-disabled="true"] .ds-radio-card { opacity: 0.4; cursor: not-allowed; }
```

### 5.14 Binary status toggle

**Purpose** Set an on/off status with labeled, colored options. **Figma** "Status" in Add Product: two equal options 12 px apart, each centred with an 8 px glowing dot (success / error) and a 14/400 label. Behaves as a radio group (`role="radiogroup"`, arrows move and select). The options sit in one toggle track, styled like segmented tabs (D-9): `gradient-toggle` track, 1 px `border-subtle`, radius 12, 5 px padding (DEOC; 48 px overall); options padding 8 16, radius 8, 14/500, 6 px dot gap, no border; selected = `gradient-toggle-active` + primary label (the dot carries the on/off colour); hover = `surface-hover-subtle` + primary label.

```css
.ds-toggle { display: flex; padding: 5px; border-radius: var(--ds-radius-track);   /* 5 px: DEOC toggle track (§11) */
  background: var(--ds-gradient-toggle); border: 1px solid var(--ds-color-border-subtle); }
.ds-toggle__opt { flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: var(--ds-space-1-5); padding: var(--ds-space-2) var(--ds-space-4);
  border-radius: var(--ds-radius-sm); background: transparent;
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 500; color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-toggle__opt:hover { background: var(--ds-color-surface-hover-subtle); color: var(--ds-color-text-primary); }
.ds-toggle__opt[aria-checked="true"] { background: var(--ds-gradient-toggle-active); color: var(--ds-color-text-primary); }
.ds-toggle__opt:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-toggle[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }
```

### 5.15 Switch [EXTENSION]

36 × 20 track (`color-track`), 16 px thumb (`text-muted`); on: `brand-strong` track, white thumb. `role="switch"`, instant apply, label 12 px to the inline-end.

```css
.ds-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; border-radius: var(--ds-radius-full);
  background: var(--ds-color-track); box-shadow: var(--ds-shadow-close); transition: background-color var(--ds-duration-fast); }
.ds-switch[aria-checked="true"] { background: var(--ds-color-brand-strong); box-shadow: none; }
.ds-switch__thumb { position: absolute; top: 2px; inset-inline-start: 2px; width: 16px; height: 16px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-text-muted); transition: transform var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-switch[aria-checked="true"] .ds-switch__thumb { transform: translateX(16px); background: var(--ds-color-text-primary); }
.ds-switch:dir(rtl)[aria-checked="true"] .ds-switch__thumb { transform: translateX(-16px); }
.ds-switch:disabled { opacity: 0.4; cursor: not-allowed; }
.ds-switch-row { display: inline-flex; align-items: center; gap: var(--ds-space-3); cursor: pointer; }
```

### 5.16 Date range picker

**Purpose** Choose a period. **Figma** the Analytics "Today" filter is a §5.9 filter select of presets (Today, Last 7 days, Last 8 weeks …). A custom range opens a §5.47 popover with two date inputs and Apply / Clear [PRESERVED]. Trigger: filter select with an 18 px calendar glyph; width `size-filter-date`.

### 5.17 File upload (dropzone)

**Purpose** Attach a reference image. **DEOC** `FileUpload`: a glass box (`gradient-glass`, 1 px **dashed** `border-control`, radius 12, no shadow), 24 px padding, centred 32 px upload glyph (`text-muted`, 60 % opacity), 8 px gap, title "Upload Reference" 14/500 `text-secondary`, hint 12/400 `text-placeholder` 2 px under the title, with "•" separators.

**States** hover / drag-over: `brand` border; error: `error` border + message; filled: thumbnail row with file name and remove button. Keyboard: the zone is a button that opens the file dialog; Enter/Space activate.

```css
.ds-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ds-space-2); padding: var(--ds-space-6); text-align: center; cursor: pointer; width: 100%;
  border: 1px dashed var(--ds-color-border-control); border-radius: var(--ds-radius-control); background: var(--ds-gradient-glass);
  transition: border-color var(--ds-duration-fast); overflow-wrap: anywhere; }
.ds-dropzone:hover, .ds-dropzone.is-dragover { border-color: var(--ds-color-brand); }
.ds-dropzone:focus-visible { outline: none; border-color: var(--ds-color-brand); }  /* replacement indicator, as DEOC */
.ds-dropzone[aria-invalid="true"] { border-color: var(--ds-color-error); }
.ds-dropzone__icon { display: flex; color: var(--ds-color-text-muted); opacity: 0.6; }
.ds-dropzone__title { font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-dropzone__hint { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-placeholder); }
.ds-dropzone__title + .ds-dropzone__hint { margin-top: calc(var(--ds-space-0-5) - var(--ds-space-2)); }
.ds-file-list { display: flex; flex-direction: column; gap: var(--ds-space-2); margin-top: var(--ds-space-2); }
.ds-file-list li { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding: var(--ds-space-2) var(--ds-space-3);
  border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-nested); font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-secondary); overflow-wrap: anywhere; }
.ds-file-list img { width: 32px; height: 32px; border-radius: var(--ds-radius-xs); object-fit: cover; }
```

### 5.18 Field with attach button [PRESERVED]

A §5.5 field (radius 8) holding a thumbnail and the value, followed by an "Upload" / "Replace" button (40 px, radius 8, `surface-control` fill, 1 px `border-glass`, `shadow-field`, 14/500 `text-secondary`, 80 % opacity on hover); the wrapper draws the focus ring with `:focus-within`.

```css
.ds-attach { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
.ds-attach__field { flex: 1 1 240px; min-width: 0; min-height: var(--ds-size-control); display: flex; align-items: center; gap: var(--ds-space-2-5);
  padding: 0 var(--ds-space-4); border: 0; border-radius: var(--ds-radius-sm); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-attach__field:has([aria-invalid="true"]), .ds-attach__field--error { box-shadow: var(--ds-error-ring), var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-attach__field:focus-within { outline: var(--ds-focus-width-field) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-tight); }
.ds-attach__input { flex: 1; min-width: 0; background: transparent; border: 0; font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-primary); }
.ds-attach__input:focus-visible { outline: none; }  /* the wrapper draws the ring (replacement, §2.7) */
.ds-attach__input::placeholder { color: var(--ds-color-text-placeholder); }
.ds-attach__thumb { position: relative; flex-shrink: 0; width: 20px; height: 20px; padding: 3px; }
.ds-attach__thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--ds-radius-xs); opacity: 0.6; }
.ds-attach__clear { position: absolute; top: -6px; inset-inline-end: -6px; width: 14px; height: 14px; border-radius: var(--ds-radius-full);
  display: flex; align-items: center; justify-content: center; background: var(--ds-color-surface-raised); border: 1px solid var(--ds-color-border-subtle); color: var(--ds-color-text-muted); }
.ds-attach__btn { height: var(--ds-size-control); display: inline-flex; align-items: center; gap: var(--ds-space-1-5); padding: var(--ds-space-2) var(--ds-space-3-5);
  border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-glass); background: var(--ds-color-surface-control); box-shadow: var(--ds-shadow-field);
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 500; color: var(--ds-color-text-secondary); white-space: nowrap; transition: opacity var(--ds-duration-fast); }
.ds-attach__btn:hover { opacity: 0.8; }
```

### 5.19 Rich picker (entity select with avatar rows)

**Purpose** Choose a person or entity with identity details. **DEOC** "Factory Admin / Plant Manager" (`AdminPicker`): the trigger is a §5.9 field trigger ("Choose user"; 12 px block padding once a person is chosen); the open list is an opaque `surface-raised` panel (radius 8, `shadow-float`, 4 px below the trigger) of rows separated by 1 px `border-control` lines, padding 14 14 14 16, `surface-hover-subtle` on hover, `surface-selected` when chosen: a 40 px brand avatar (`shadow-avatar`), name 12/600 primary + an info chip (employee ID) + the role in 10 px `text-tertiary`, and an e-mail line (11 px mail glyph + 12/400 muted). A footer row "+ Add User" (`surface-nested`, `brand` text) closes the list.

```css
.ds-picker { position: absolute; z-index: var(--ds-z-menu); top: 100%; inset-inline-start: 0; width: 100%; margin-top: var(--ds-space-1);
  display: flex; flex-direction: column; padding: 0; background: var(--ds-color-surface-raised);
  border-radius: var(--ds-radius-sm); box-shadow: var(--ds-shadow-float); overflow: hidden; }
.ds-picker__list { max-height: var(--ds-size-picker-max-height); overflow-y: auto; }
.ds-picker-row { display: flex; align-items: center; gap: var(--ds-space-3-5); width: 100%; padding: var(--ds-space-3-5) var(--ds-space-3-5) var(--ds-space-3-5) var(--ds-space-4);
  background: transparent; border-bottom: 1px solid var(--ds-color-border-control); cursor: pointer; text-align: start;
  transition: background-color var(--ds-duration-fast); }
.ds-picker-row:hover, .ds-picker-row.is-active { background: var(--ds-color-surface-hover-subtle); }
.ds-picker-row[aria-selected="true"] { background: var(--ds-color-surface-selected); }
.ds-picker__list:focus-within .ds-picker-row.is-active { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-inset); }
.ds-picker-row__text { display: flex; flex-direction: column; gap: 1.5px; min-width: 0; }
.ds-picker-row__line1 { display: flex; align-items: center; gap: var(--ds-space-2); flex-wrap: wrap; font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 600; color: var(--ds-color-text-primary); }
.ds-picker-row__line2 { display: flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-muted); min-width: 0; }
.ds-picker-footer { display: flex; align-items: center; justify-content: center; gap: var(--ds-space-2); width: 100%; padding: var(--ds-space-2-5) 0;
  background: var(--ds-color-surface-nested); border: 0;
  border-end-start-radius: var(--ds-radius-sm); border-end-end-radius: var(--ds-radius-sm);
  font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-brand); transition: background-color var(--ds-duration-fast); }
.ds-picker-footer:hover { background: var(--ds-color-surface-nested-hover); }
.ds-rich-row { display: flex; align-items: center; gap: var(--ds-space-3-5); min-width: 0; text-align: start; }
.ds-select--rich .ds-select__trigger { gap: var(--ds-space-3); }
.ds-select--rich .ds-select__trigger:has(.ds-rich-row) { padding-block: var(--ds-space-3); }
```

### 5.20 Inline callout [EXTENSION]

A neutral note inside forms: `surface-nested` fill, 1 px `border-glass`, radius 8, padding 14. Title `small-strong`, body 12 px `text-muted`.

```css
.ds-callout { display: flex; flex-direction: column; gap: var(--ds-space-1); padding: var(--ds-space-3-5); border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-nested); border: 1px solid var(--ds-color-border-glass); }
.ds-callout__title { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 600; color: inherit; }
.ds-callout:not([class*="--"]) .ds-callout__title { color: var(--ds-color-text-secondary); }
.ds-callout__body { font-size: var(--ds-font-size-label); line-height: 1.45; color: var(--ds-color-text-secondary); }
.ds-callout:not([class*="--"]) .ds-callout__body { color: var(--ds-color-text-muted); }
```

### 5.21 Inline alert [EXTENSION]

The callout tinted with a status pill's fill and border, a 16 px status icon and an optional dismiss button; `role="alert"` for errors, `status` otherwise.

```css
.ds-callout--error, .ds-callout--success, .ds-callout--warning, .ds-callout--info { flex-direction: row; align-items: flex-start; gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-3-5); }
.ds-callout--error { background: var(--ds-color-danger-bg); border-color: var(--ds-color-danger-border); color: var(--ds-color-danger-text); }
.ds-callout--success { background: var(--ds-color-success-bg); border-color: var(--ds-color-success-border); color: var(--ds-color-success-text); }
.ds-callout--warning { background: var(--ds-color-warning-bg); border-color: var(--ds-color-warning-border); color: var(--ds-color-warning-text); }
.ds-callout--info { background: var(--ds-color-info-bg); border-color: var(--ds-color-info-border); color: var(--ds-color-info-text); }
.ds-callout__content { display: flex; flex-direction: column; gap: var(--ds-space-1); min-width: 0; flex: 1; }
.ds-callout__dismiss { margin-inline-start: auto; }
```

### 5.22 Stepper (multi-step progress)

**Purpose** Show progress through a multi-step flow. **Figma** drawer headers of frames 3 and 5.

| Step state | Index (32 px, radius 8) | Title (12 px) | Subtitle (12 px) | Connector (2 px, 16 px inset) |
|---|---|---|---|---|
| Completed | `success-glow` fill, white tick (16) | 700 +0.3 `text-primary` | "Completed", 500 `success-text` | `gradient-stepper-active` |
| Current | `brand-strong`, border `stepper-active-border`, `shadow-stepper-active`, 12/600 white number | 700 +0.3 `text-primary` | "In progress", 500 `link` | `gradient-stepper-active` |
| Upcoming | `surface-sunken-button`, 1 px `border-strong`, `shadow-stepper-idle`, 12/500 `text-muted` number | 500 `text-secondary` | 400 `text-tertiary` | `stepper-track` |

As in DEOC, the whole upcoming step (index and text, not the connector) is dimmed: 50 % for the next step, 40 % for later ones (D-10 supersedes R-10; the dimmed text is below 4.5:1, see §15.2). `<ol aria-label="Progress">`, current step `aria-current="step"`, completed steps carry a visually hidden "(completed)". At `xs` only the indices and the current title are shown.

```css
.ds-stepper { display: flex; align-items: center; }
.ds-step { display: flex; align-items: center; flex: 1 1 0; min-width: 0; }
.ds-step:last-child { flex: 0 0 auto; }
.ds-step:not(:last-child)::after { content: ""; flex: 1; height: var(--ds-border-width-emphasis); min-width: var(--ds-space-4); margin: 0 var(--ds-space-4); background: var(--ds-color-stepper-track); }
.ds-step[aria-current="step"]:not(:last-child)::after, .ds-step--done:not(:last-child)::after { background: var(--ds-gradient-stepper-active); }
.ds-step__index { flex-shrink: 0; width: var(--ds-size-pagination-button); height: var(--ds-size-pagination-button); display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-sunken-button); border: 1px solid var(--ds-color-border-strong); box-shadow: var(--ds-shadow-stepper-idle);
  font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 500; color: var(--ds-color-text-muted); }
.ds-step[aria-current] ~ .ds-step :is(.ds-step__index, .ds-step__text) { opacity: 0.5; }
.ds-step[aria-current] ~ .ds-step ~ .ds-step :is(.ds-step__index, .ds-step__text) { opacity: 0.4; }
.ds-step[aria-current="step"] .ds-step__index { background: var(--ds-color-brand-strong); border-color: var(--ds-color-stepper-active-border); color: var(--ds-color-text-on-brand); font-weight: 600; box-shadow: var(--ds-shadow-stepper-active); }
.ds-step--done .ds-step__index { background: var(--ds-color-success-glow); border-color: var(--ds-color-stepper-active-border); color: var(--ds-color-text-on-brand); box-shadow: var(--ds-shadow-stepper-active); }
.ds-step__text { display: flex; flex-direction: column; min-width: 0; padding-inline-start: var(--ds-space-3); font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-step__title { font-weight: 500; color: var(--ds-color-text-secondary); white-space: nowrap; }
.ds-step__sub { color: var(--ds-color-text-tertiary); white-space: nowrap; }
.ds-step[aria-current="step"] .ds-step__title, .ds-step--done .ds-step__title { font-weight: 700; letter-spacing: 0.3px; color: var(--ds-color-text-primary); }
.ds-step[aria-current="step"] .ds-step__sub { font-weight: 500; color: var(--ds-color-link); }
.ds-step--done .ds-step__sub { font-weight: 500; color: var(--ds-color-success-text); }
@media (max-width: 639px) {
  .ds-step:not([aria-current]) .ds-step__text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
}
```

### 5.23 KPI card

**Purpose** One headline metric. **DEOC** `KPICard`: glass KPI gradient, radius 24, 16 px padding, 40 px 3D illustration, 12 px gap, label `kpi-label` (12/700 uppercase) directly above the value `kpi-value` (20/700); both truncate on one line. Rows of 3–6 cards, 16 px apart.

| Part | Spec |
|---|---|
| Container | min-height `size-kpi-card` (76), padding `space-card` (16), radius `radius-panel`, `gradient-glass-kpi`, `shadow-glass` + `shadow-kpi-lift` + `shadow-edge` |
| Icon | 40 × 40 illustration (crop per §2.11-B), decorative |
| Label | `kpi-label`, one line with ellipsis (full text in the accessible name) |
| Value | `kpi-value`, tabular numbers; "a / b" ratios keep spaces as written |

**Variants** static (default); **clickable** (a `<button>` that sets a page filter, as the Cameras KPIs; pressed state with an inset 1 px `brand` ring is an [EXTENSION]); optional status ball (14 px, status fill and glow) and delta line [EXTENSION]. **States** clickable hover `brightness(1.1)`.

```css
.ds-kpi-row { display: flex; gap: var(--ds-space-grid); width: 100%; }
.ds-kpi-row > * { flex: 1 1 0; min-width: 0; }
.ds-kpi { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; min-height: var(--ds-size-kpi-card);
  padding: var(--ds-space-card); border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass-kpi);
  box-shadow: var(--ds-shadow-glass), var(--ds-shadow-kpi-lift), var(--ds-shadow-edge); text-align: start; color: inherit; transition: filter var(--ds-duration-fast); }
button.ds-kpi { cursor: pointer; }
button.ds-kpi:hover { filter: brightness(1.1); }
button.ds-kpi[aria-pressed="true"] { box-shadow: var(--ds-shadow-glass), var(--ds-shadow-kpi-lift), inset 0 0 0 1px var(--ds-color-brand); }
.ds-kpi__icon { position: relative; width: var(--ds-size-kpi-icon); height: var(--ds-size-kpi-icon); flex-shrink: 0; }
.ds-kpi__text { display: flex; flex-direction: column; min-width: 0; }
.ds-kpi__label { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 700; letter-spacing: var(--ds-tracking-upper); text-transform: uppercase;
  color: var(--ds-color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-kpi__value { font-size: var(--ds-font-size-heading); line-height: 28px; font-weight: 700; letter-spacing: var(--ds-tracking-number);
  color: var(--ds-color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.ds-kpi__ball { position: absolute; inset-inline-end: 0; bottom: 0; width: 14px; height: 14px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-success-glow); box-shadow: var(--ds-shadow-status-success); }
.ds-kpi__ball--error { background: var(--ds-color-danger); box-shadow: var(--ds-shadow-status-error); }
.ds-kpi__delta { font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-kpi__delta--up { color: var(--ds-color-success-text); } .ds-kpi__delta--down { color: var(--ds-color-danger-text); }
@media (max-width: 1279px) { .ds-kpi-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr)); } }
```

### 5.24 Entity card (content card)

**Purpose** Summarize one record (a factory) with its status, a headline metric and an owner. **DEOC** `FactoryCard` on `Card`: glass card (`shadow-surface`), radius 16, 25 px padding (`space-card-entity`), sections 20 px apart.

| Section | Spec |
|---|---|
| **Header** | vertically centred: 40 px 3D crop with no tile behind it; 12 px gap; name `entity-title` (20/600/28); 4 px below, a 14 px location glyph + 14/400 `text-muted` place. Status pill (§5.27, **glass** appearance) at the inline-end |
| **Metric well** | `surface-nested`, radius `radius-track`, padding 16, gap 8: value `metric-value` (20/700) + 6 px + denominator `metric-denominator` ("/ 6 lines active"); at the inline-end a 14 px video glyph + "24 cameras" (`text-muted`); below, a 4 px progress bar (§5.34) |
| **Footer** | 36 px neutral avatar, 10 px gap, owner 16/500 `text-secondary` over role 12/400 `brand`; at the inline-end a **subtle** button "View factory" (padding 9 16 9 12, 40 px tall) with a trailing chevron |

In DEOC the whole card opens the record on click (`brightness(1.1)` on hover); the footer button is the keyboard-reachable control. **Variants** status (active / warning / offline) changes only the pill and the progress tone (offline: empty track). Inactive records keep full contrast; only the pill carries the state. **States** button hover / focus as §5.1.

```css
.ds-entity { display: flex; flex-direction: column; gap: var(--ds-space-card-gap); min-width: 0; padding: var(--ds-space-card-entity);
  border-radius: var(--ds-radius-card); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); transition: filter var(--ds-duration-fast); }
.ds-entity--link { cursor: pointer; }
.ds-entity--link:hover { filter: brightness(1.1); }
.ds-entity__header { display: flex; justify-content: space-between; align-items: center; gap: var(--ds-space-3); }
.ds-entity__header .ds-text-card-title { line-height: 28px; }
.ds-entity__lead { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; }
.ds-entity__icon { position: relative; width: var(--ds-size-entity-icon); height: var(--ds-size-entity-icon); flex-shrink: 0; overflow: hidden; }
.ds-entity__titles { display: flex; flex-direction: column; gap: var(--ds-space-1); min-width: 0; }
.ds-entity__place { display: flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-font-size-body); line-height: 16px; color: var(--ds-color-text-muted); }
.ds-entity__place svg { color: var(--ds-color-icon); flex-shrink: 0; }
.ds-entity__well { display: flex; flex-direction: column; gap: var(--ds-space-2); padding: var(--ds-space-4); border-radius: var(--ds-radius-track); background: var(--ds-color-surface-nested); }
.ds-entity__wellrow { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; }
.ds-entity__value { display: flex; align-items: baseline; gap: var(--ds-space-1-5); }
.ds-entity__meta { display: flex; align-items: center; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-muted); }
.ds-entity__meta svg { color: var(--ds-color-icon); }
.ds-entity__footer { display: flex; justify-content: space-between; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap; }
.ds-entity__who { display: flex; align-items: center; gap: var(--ds-space-2-5); min-width: 0; }
.ds-entity__who b { display: block; font-size: var(--ds-font-size-value); line-height: 22px; font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-entity__role { display: block; font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-brand); margin-top: var(--ds-space-0-5); }
.ds-entity__footer .ds-btn { padding: 9px var(--ds-space-4) 9px var(--ds-space-3); }   /* 40 px with its border (DEOC) */
.ds-entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(400px, 100%), 1fr)); gap: var(--ds-space-grid-lg); }
```

### 5.25 Dashboard card (chart / data container)

**Purpose** Hold a chart or a table with a title row. **DEOC** dashboard cards ("Quality Snapshot", "Defect Distribution", "Line - Product Defect Matrix", "Line Wise Defects"): the content-card surface (`gradient-glass` + `shadow-surface`), radius 16, 24 px padding, title row 40 px high, 20 px to content.

| Part | Spec |
|---|---|
| Title | `card-title` (20/600/24) |
| Subtitle | 14/400 `text-chart-subtle`, 5 px below |
| Controls | legend, filters, segmented tabs at the inline-end, 19–24 px apart → `space-5` |
| Body | chart or table; **flush** variant puts a table edge-to-edge under a `border-subtle` line |

```css
.ds-dash-card { position: relative; display: flex; flex-direction: column; gap: var(--ds-space-chart-gap); min-width: 0;
  padding: var(--ds-space-card-xl); border-radius: var(--ds-radius-card); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); }
.ds-dash-card--flush { padding: var(--ds-space-card-xl) 0 0; overflow: hidden; }
.ds-dash-card--flush > .ds-dash-card__header { padding: 0 var(--ds-space-card-xl); }
.ds-dash-card--flush > .ds-dash-card__body { border-top: 1px solid var(--ds-color-border-subtle); }
.ds-dash-card__header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--ds-space-4); min-height: var(--ds-size-control); }
.ds-dash-card__title { font-size: var(--ds-font-size-heading); line-height: 24px; font-weight: 600; letter-spacing: var(--ds-tracking-card-title); color: var(--ds-color-text-primary); overflow-wrap: anywhere; }
.ds-dash-card__subtitle { font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-chart-subtle); margin-top: 5px; }
.ds-dash-card__right { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: var(--ds-space-5); }
.ds-dash-row { display: flex; gap: var(--ds-space-grid-lg); align-items: stretch; }
.ds-dash-row > * { min-width: 0; }
```

### 5.26 Status card (status bar + list)

**Purpose** Running vs stopped counts with the stopped items listed. **DEOC** `StatusCard` ("Line Status", "Camera Status", "Device Status"): a `Card` (25 px padding, `shadow-surface`), 20 px between parts: a 40 px header row with the title and a dot legend (12 px dots, `legend-sm` labels, 20 px apart); a 20 px segmented bar with the counts in it (§5.34, md); then a table (§5.41) edge to edge under a `border-subtle` line, capped at five rows under a pinned header.

```css
.ds-status-card { gap: var(--ds-space-card-gap); padding: var(--ds-space-card-entity); overflow: hidden; }
.ds-status-card__well { flex: 1; min-height: 0; margin: 0 calc(-1 * var(--ds-space-card-entity)) calc(-1 * var(--ds-space-card-entity)); border-top: 1px solid var(--ds-color-border-subtle); }
.ds-legend-counts { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-4); }
.ds-legend-counts span { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-body); line-height: 22px; font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-legend-counts i { width: 24px; height: 16px; border-radius: var(--ds-radius-xs); }
.ds-legend-counts b { font-weight: 500; color: var(--ds-color-text-muted); font-variant-numeric: tabular-nums; }
```

### 5.27 Badge (status pill)

**Purpose** Show the state of a record. **DEOC** `Badge` with Active / Inactive / Stopped / Matched / Not Matched / Running labels. Pill radius, 4 px 12 px padding inside a 1 px border (30 px tall), 6 px dot, 6 px gap, `badge` 14/600/20. Badge dots do not glow, except the error dot of a glass badge (the bare status dot, §5.28, always glows).

| Tone | Text | Dot / halo | Tinted fill / border | Labels in the screens |
|---|---|---|---|---|
| success | `success-text` | `success-text`, no halo | `success-bg` / `success-border` | Active, Matched, Running |
| warning [EXT] | `warning-text` | `warning-text`, no halo | `warning-bg` / `warning-border` | — |
| error | `danger-text` | `danger-text`, no halo (glass appearance: `danger` / `shadow-status-error`) | `danger-bg` / `danger-border` | Inactive, Stopped, Not Matched |
| info [EXT] | `info-text` | `brand` | `info-bg` / `info-border` | — |
| neutral [EXT] | `text-secondary` | `text-muted` | `surface-control` / `border-subtle` | — |

**Appearances.** **tinted** (default; camera tiles, health rows, chart controls) and **glass** (`gradient-glass` fill, `border-glass`, `shadow-control`; inside entity cards and table cells, where a tint would compete with the row) — both OBSERVED; the tone and label never change between them. **Sizes** md (default), sm (12/600, 2 × 8 padding, dot without halo). **Live indicator**: a glass pill (padding 5 11, `border-track`) with a 10 px `live-halo` dot around a 4 px `live` core and a white 14/600/18 label; it does not pulse.

```css
.ds-badge { display: inline-flex; align-items: center; gap: var(--ds-space-1-5); padding: var(--ds-space-1) var(--ds-space-3); border: 1px solid; border-radius: var(--ds-radius-full);
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600; white-space: nowrap; }
.ds-badge--sm { padding: var(--ds-space-0-5) var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-badge__dot { width: var(--ds-size-badge-dot); height: var(--ds-size-badge-dot); border-radius: var(--ds-radius-full); flex-shrink: 0; background: currentColor; }
.ds-badge--success { background: var(--ds-color-success-bg); border-color: var(--ds-color-success-border); color: var(--ds-color-success-text); }
.ds-badge--warning { background: var(--ds-color-warning-bg); border-color: var(--ds-color-warning-border); color: var(--ds-color-warning-text); }
.ds-badge--error { background: var(--ds-color-danger-bg); border-color: var(--ds-color-danger-border); color: var(--ds-color-danger-text); }
.ds-badge--glass.ds-badge--error .ds-badge__dot { background: var(--ds-color-danger); box-shadow: var(--ds-shadow-status-error); }
.ds-badge--info { background: var(--ds-color-info-bg); border-color: var(--ds-color-info-border); color: var(--ds-color-info-text); }
.ds-badge--info .ds-badge__dot { background: var(--ds-color-brand); }
.ds-badge--neutral { background: var(--ds-color-surface-control); border-color: var(--ds-color-border-subtle); color: var(--ds-color-text-secondary); }
.ds-badge--neutral .ds-badge__dot { background: var(--ds-color-text-muted); }
.ds-badge--glass { background: var(--ds-gradient-glass); border-color: var(--ds-color-border-glass); box-shadow: var(--ds-shadow-control); }
.ds-badge--sm .ds-badge__dot { box-shadow: none; }

.ds-live { display: inline-flex; align-items: center; gap: var(--ds-space-1-5); padding: 5px 11px; border-radius: var(--ds-radius-full);
  background: var(--ds-gradient-glass); border: 1px solid var(--ds-color-border-track); font-size: var(--ds-font-size-body); line-height: 18px; font-weight: 600; color: var(--ds-color-text-primary); }
.ds-live__dot { position: relative; width: var(--ds-size-status-dot); height: var(--ds-size-status-dot); border-radius: var(--ds-radius-full); background: var(--ds-color-live-halo); flex-shrink: 0; }
.ds-live__dot::after { content: ""; position: absolute; inset: 3px; border-radius: inherit; background: var(--ds-color-live); }
```

### 5.28 Status dot

A bare glowing dot for dense contexts (10 / 8 px), always next to a text label (or `role="img"` with `aria-label`). Same tones as §5.27.

```css
.ds-dot { display: inline-block; width: var(--ds-size-status-dot); height: var(--ds-size-status-dot); border-radius: var(--ds-radius-full); flex-shrink: 0; }
.ds-dot--sm { width: var(--ds-size-status-dot-sm); height: var(--ds-size-status-dot-sm); }
.ds-dot--success { background: var(--ds-color-success-text); box-shadow: var(--ds-shadow-status-success); }
.ds-dot--warning { background: var(--ds-color-warning-text); box-shadow: var(--ds-shadow-status-warning); }
.ds-dot--error   { background: var(--ds-color-danger); box-shadow: var(--ds-shadow-status-error); }
.ds-dot--brand   { background: var(--ds-color-brand); }
.ds-status { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-secondary); }
```

### 5.29 Tag (solid category)

**Purpose** A category with a fixed color (user roles). **Figma** "Overlay" in the Role column (frame 6): radius 4, padding 6 12, `tag` 14/500 white on a solid fill. Map categories to colors once per product, in a stable order (purple, blue, green, amber, rose).

```css
.ds-tag { display: inline-block; padding: var(--ds-space-1-5) var(--ds-space-3); border-radius: var(--ds-radius-xs); font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 500;
  color: var(--ds-color-text-primary); white-space: nowrap; }
.ds-tag--purple { background: var(--ds-tag-purple); } .ds-tag--blue { background: var(--ds-tag-blue); }
.ds-tag--green  { background: var(--ds-tag-green); }  .ds-tag--amber { background: var(--ds-tag-amber); }
.ds-tag--rose   { background: var(--ds-tag-rose); }
.ds-tag--raised { box-shadow: var(--ds-shadow-card); }
```

### 5.30 Count pill

**DEOC** `CountPill` beside "Factory 1", "Line 1": `surface-control` fill, 1 px `border-subtle`, pill radius, padding 3 13 (26 px tall), `count-pill` 14/700/18. The table-card header uses a 12 px variant (`ds-count--sm`, padding 2 12).

```css
.ds-count { display: inline-block; padding: 3px 13px; border-radius: var(--ds-radius-full); background: var(--ds-color-surface-control);
  border: 1px solid var(--ds-color-border-subtle); font-size: var(--ds-font-size-body); line-height: 18px; font-weight: 700; color: var(--ds-color-text-secondary); font-variant-numeric: tabular-nums; }
.ds-count--sm { padding: var(--ds-space-0-5) var(--ds-space-3); font-size: var(--ds-font-size-label); }
```

### 5.31 Info chip

**DEOC** employee ID in the user picker ("EMP-8841"): `brand-tint-10` fill, 1 px `brand-tint-20`, radius 4, padding 3 9, 10/15 `brand-text`.

```css
.ds-chip { display: inline-block; padding: 3px 9px; border-radius: var(--ds-radius-xs); background: var(--ds-color-brand-tint-10); border: 1px solid var(--ds-color-brand-tint-20);
  font-size: var(--ds-font-size-caption); line-height: 15px; color: var(--ds-color-brand-text); white-space: nowrap; }
```

### 5.32 Avatar

| Variant | Size | Spec | Figma |
|---|---|---|---|
| **brand** | 40 | `gradient-brand-avatar`, 1 px `brand-avatar-border`, `shadow-avatar`, initials 12/700 white | user picker |
| **neutral** | 36 | `surface-avatar`, 1 px `border-avatar`, initials `avatar-initials` 14/500 | factory card owner |
| **photo** | 32 | 1 px `gradient-brand-ring` ring, `avatar-inner` fill, photo `object-fit: cover`, no glow | sidebar user card |
| **presence** | + 12 px dot | `success-glow` dot, 2 px `surface-sunken-button` ring, bottom inline-end | user picker |

Decorative (`aria-hidden`) when the name is adjacent.

```css
.ds-avatar { position: relative; width: var(--ds-size-avatar-lg); height: var(--ds-size-avatar-lg); flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-full);
  background: var(--ds-gradient-brand-avatar); border: 1px solid var(--ds-color-brand-avatar-border); box-shadow: var(--ds-shadow-avatar); font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 700; color: var(--ds-color-text-primary); }
.ds-avatar--neutral { width: var(--ds-size-avatar-md); height: var(--ds-size-avatar-md); box-shadow: none; background: var(--ds-color-surface-avatar); border-color: var(--ds-color-border-avatar);
  font-size: var(--ds-font-size-body); font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-avatar--photo { width: var(--ds-size-avatar-sm); height: var(--ds-size-avatar-sm); padding: 1px; background: var(--ds-gradient-brand-ring); border: 0; box-shadow: none; }
.ds-avatar--photo > span { width: 100%; height: 100%; border-radius: var(--ds-radius-full); background: var(--ds-color-avatar-inner);
  display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-avatar--photo img { width: 100%; height: 100%; object-fit: cover; }
.ds-avatar__presence { position: absolute; inset-inline-end: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-success-glow); border: var(--ds-border-width-emphasis) solid var(--ds-color-surface-sunken-button); }
```

### 5.33 Metric indicator (inline value)

A value with an optional denominator and label. **Figma** factory well: "6" (`metric-value`) + "/ 6 lines active" (`metric-denominator`). Stacked variant (label above, centred) [PRESERVED].

```css
.ds-metric { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-1); text-align: center; }
.ds-metric--inline { flex-direction: row; align-items: baseline; gap: var(--ds-space-1-5); text-align: start; }
.ds-metric__value { display: flex; align-items: baseline; gap: var(--ds-space-1-5); }
.ds-metric__value b { font-size: var(--ds-font-size-heading); line-height: 28px; font-weight: 700; letter-spacing: var(--ds-tracking-number); color: var(--ds-color-text-primary); font-variant-numeric: tabular-nums; }
.ds-metric__value span { font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 400; color: var(--ds-color-text-muted); }
```

### 5.34 Progress & segmented status bar

| Component | Spec | Figma |
|---|---|---|
| **Progress bar** | 4 px track `color-track`, pill radius; fill: success → `gradient-progress-success`, error → `danger`, warning → `warning-text`, brand → `brand` | factory well |
| **Segmented bar (md)** | 20 px, radius 6, no gaps, non-empty segments min 28 px with `bar-segment` numbers | status cards (DEOC) |
| **Segmented bar (lg)** | 40 px, radius 12 at the ends, no gaps, no numbers (the legend carries the counts) | [EXTENSION] |

`role="progressbar"` with `aria-valuenow` / `aria-label`; segmented bars are `role="img"` with an `aria-label` listing every count.

```css
.ds-progress { height: 4px; border-radius: var(--ds-radius-full); background: var(--ds-color-track); overflow: hidden; }
.ds-progress > span { display: block; height: 100%; background: var(--ds-color-brand); border-radius: inherit; transition: width var(--ds-duration-chart) var(--ds-ease-standard); }
.ds-progress--success > span { background: var(--ds-gradient-progress-success); }
.ds-progress--warning > span { background: var(--ds-color-warning-text); }
.ds-progress--error > span { background: var(--ds-color-danger); }
.ds-progress-row { display: flex; align-items: center; gap: var(--ds-space-2); }
.ds-progress-row .ds-progress { flex: 1; }
.ds-progress-row b { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 600; color: var(--ds-color-text-secondary); font-variant-numeric: tabular-nums; }
.ds-segbar { display: flex; height: 20px; border-radius: var(--ds-radius-chip); overflow: hidden; }
.ds-segbar__seg { flex-basis: 0; min-width: 28px; display: flex; align-items: center; justify-content: center; overflow: hidden;
  font-size: var(--ds-font-size-label); line-height: 1; font-weight: 600; color: var(--ds-color-text-on-bright); transition: flex-grow var(--ds-duration-chart); }
.ds-segbar--lg { height: var(--ds-size-control); gap: 0; border-radius: var(--ds-radius-track); }
.ds-segbar--lg .ds-segbar__seg { min-width: 12px; font-size: 0; }
```

### 5.35 Summary strip

**Purpose** Identify the record a page is about. **Figma** Live View side panel: "Running SKU Card" (eyebrow "Bottle Line 3" after an 8 px brand dot, title "Dove Nourishing Bodywash 825 ml" in `summary-title`), "Barcodes Card" (section label + label/value rows with `border-faint` dividers) and "System Health Card" (rows: 20 px icon with no tile + 14 px label, status pill at the end). Cards: the content-card surface (`gradient-glass` + `shadow-surface`), radius 16, padding 20 (`space-card-lg`), 12–16 px internal gap, 16 px apart. Section labels are `section-label` (12/700); barcode rows are 12 px apart with `border-faint` dividers; values are `field-value` (16/400/22, +0.5 px). The horizontal strip of the previous system remains as the **inline** layout [PRESERVED].

```css
.ds-strip { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-5); padding: var(--ds-space-card);
  border-radius: var(--ds-radius-card); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); }
.ds-strip--stacked { flex-direction: column; align-items: stretch; gap: var(--ds-space-3); }
.ds-strip--stacked .ds-strip__lead { flex: none; min-width: 0; }
.ds-strip__lead { display: flex; flex-direction: column; gap: var(--ds-space-3); flex: 1 1 180px; min-width: 180px; }
.ds-strip__eyebrow { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: 18px; letter-spacing: var(--ds-tracking-identifier); color: var(--ds-color-link); }
.ds-strip__title { font-size: var(--ds-font-size-heading); line-height: 28px; font-weight: 700; letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-strip__divider { align-self: stretch; width: 1px; background: var(--ds-color-border-faint); }
.ds-strip__fields { display: flex; flex-wrap: wrap; gap: var(--ds-space-5); justify-content: space-between; flex: 999 1 480px; }
.ds-strip__fields dt { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-strip__fields dd { margin-top: var(--ds-space-1); font-size: var(--ds-font-size-value); line-height: 22px; letter-spacing: var(--ds-tracking-field); color: var(--ds-color-text-primary); overflow-wrap: anywhere; }
.ds-panel-card { display: flex; flex-direction: column; gap: var(--ds-space-4); padding: var(--ds-space-card-lg); border-radius: var(--ds-radius-card);
  background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); }
.ds-panel-card__label { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 700; letter-spacing: var(--ds-tracking-upper); text-transform: uppercase; color: var(--ds-color-text-tertiary); }
.ds-fieldlist { display: flex; flex-direction: column; }
.ds-fieldlist > div { display: flex; flex-direction: column; gap: var(--ds-space-1); padding: var(--ds-space-3) 0; border-bottom: 1px solid var(--ds-color-border-faint); }
.ds-fieldlist > div:last-child { border-bottom: 0; padding-bottom: 0; }
.ds-fieldlist dt { font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-fieldlist dd { font-size: var(--ds-font-size-value); line-height: 22px; letter-spacing: var(--ds-tracking-field); color: var(--ds-color-text-primary); overflow-wrap: anywhere; }
.ds-health-row { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.ds-health-row__label { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-secondary); }
.ds-health-tile { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; 
  color: var(--ds-color-text-muted); }  /* icon only, no tile (the grey tile read as an empty square) */
```

### 5.36 Media card (camera tile) & media viewer

**Purpose** Show a live camera feed with its inspection result. **DEOC** `CameraPanel`: radius 24, clipped, a 1 px transparent border (brand/40 % on hover), header and footer bars around the feed (`surface-media`). The tile uses `gradient-glass` and `shadow-glass`, with `shadow-edge` drawn above the feed; the header and footer show the card colour and the header keeps a `border-track` divider.

| Part | Spec |
|---|---|
| Header | padding 14 24 15; wraps (12 px column, 8 px row gap); 28 px icon tile (`brand-tint-10`, 1 px `brand-tint-20`, radius 12) with a 16 px glyph; 12 px gap; title `media-title` (20/600/26; 16 px when the tile is narrower than 420 px); at the end a status pill (tinted) and a 16 px expand glyph 12 px apart |
| Media | flexible height, `surface-media`, image `object-fit: cover` at 50 % opacity |
| Footer | padding 14 24; `media-detail` "Detected : " + italic 400 value; failed reads color the value `danger-text` |

**Interactive variant** the tile is a single button that opens the viewer (its border turns `brand-border-hover`). The **viewer** (`CameraExpandedModal`): radius 32, `min(90vw, 900px)`, `surface-media`, `shadow-modal`; header padding 20 32 on `surface-raised` with a 2 px `border-subtle` divider, a 48 px icon tile (radius 20, 2 px `brand-tint-20` border), title 20/700 −0.5 + camera 16 px `text-muted`, status pill and a 36 px close button; a "Detected" row (padding 12 32, 14 px `text-muted`, value 500 primary); the frame at `object-fit: contain` (min 460 px) with a 2 px detection frame (radius 4, 20 px glow).

```css
.ds-media-card { position: relative; display: flex; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden; text-align: start; color: inherit; container-type: inline-size;
  border: 1px solid transparent; border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-glass); transition: border-color var(--ds-duration-fast); }
.ds-media-card::after { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; box-shadow: var(--ds-shadow-edge); }  /* edge above the full-bleed feed */
button.ds-media-card:hover { border-color: var(--ds-color-brand-border-hover); }
.ds-media-card__head, .ds-media-card__foot { position: relative; z-index: 1; display: flex; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-3-5) var(--ds-space-6); }
.ds-media-card__head { flex-wrap: wrap; row-gap: var(--ds-space-2); padding-bottom: 15px; border-bottom: 1px solid var(--ds-color-border-track); }
.ds-media-card__titles { display: flex; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap; flex: 1; min-width: 0; }
.ds-media-card__title { font-size: var(--ds-font-size-heading); line-height: 26px; font-weight: 600; letter-spacing: var(--ds-tracking-media-title); color: var(--ds-color-text-primary); }
@container (max-width: 419px) { .ds-media-card__title { font-size: var(--ds-font-size-value); } }
.ds-media-card__sub { font-size: var(--ds-font-size-body); line-height: 16px; color: var(--ds-color-text-muted); }
.ds-media-card__expand { display: inline-flex; padding: var(--ds-space-1); color: var(--ds-color-icon); flex-shrink: 0; border-radius: var(--ds-radius-xs); }
.ds-media-card__expand:hover { color: var(--ds-color-text-primary); }
.ds-media-card__media { position: relative; flex: 1; min-height: 160px; overflow: hidden; background: var(--ds-color-surface-media); }
.ds-media-card__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
.ds-media-card__detail { min-width: 0; font-size: var(--ds-font-size-body); line-height: 16px; font-weight: 600; color: var(--ds-color-text-secondary); }
.ds-media-card__detail em { font-style: italic; font-weight: 400; }
.ds-media-card__detail--error em { color: var(--ds-color-danger-text); }
.ds-detect { position: absolute; border: var(--ds-border-width-detect) solid var(--ds-color-danger); border-radius: var(--ds-radius-xs); pointer-events: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--ds-color-danger) 30%, transparent); }
.ds-detect--positive { border-color: var(--ds-color-success-glow); box-shadow: 0 0 20px color-mix(in srgb, var(--ds-color-success-glow) 30%, transparent); }
.ds-icon-tile { width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--ds-radius-track); background: var(--ds-color-brand-tint-10);
  border: 1px solid var(--ds-color-brand-tint-20); display: flex; align-items: center; justify-content: center; color: var(--ds-color-link); }
.ds-icon-tile--sm { width: var(--ds-size-media-icon); height: var(--ds-size-media-icon); padding: 1px; border-radius: var(--ds-radius-track); }
.ds-icon-tile--32 { width: 32px; height: 32px; border-radius: var(--ds-radius-sm); }
.ds-icon-tile--success { background: var(--ds-color-success-bg); border-color: var(--ds-color-success-border); color: var(--ds-color-success-text); }
.ds-icon-tile--warning { background: var(--ds-color-warning-bg); border-color: var(--ds-color-warning-border); color: var(--ds-color-warning-text); }
.ds-icon-tile--error { background: var(--ds-color-danger-bg); border-color: var(--ds-color-danger-border); color: var(--ds-color-danger-text); }
.ds-media-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(300px, 1fr); gap: var(--ds-space-grid); }
@media (max-width: 1023px) { .ds-media-grid { grid-template-columns: minmax(0, 1fr); } }
.ds-viewer { position: relative; width: min(90vw, 900px); max-height: 90vh; max-width: calc(100% - 32px); display: flex; flex-direction: column; border-radius: var(--ds-radius-viewer); overflow: hidden;
  background: var(--ds-color-surface-media); box-shadow: var(--ds-shadow-modal); }
.ds-viewer > .ds-media-card__head { padding: var(--ds-space-5) var(--ds-space-8); gap: var(--ds-space-4); background: var(--ds-color-surface-raised); border-bottom: var(--ds-border-width-emphasis) solid var(--ds-color-border-subtle); }
.ds-viewer .ds-media-card__title { font-size: var(--ds-font-size-heading); line-height: 28px; font-weight: 700; letter-spacing: var(--ds-tracking-heading); }
.ds-viewer .ds-media-card__sub { font-size: var(--ds-font-size-value); line-height: 22px; }
.ds-viewer .ds-media-card__expand { width: var(--ds-size-icon-button); height: var(--ds-size-icon-button); padding: 0; align-items: center; justify-content: center; border-radius: var(--ds-radius-control); color: var(--ds-color-text-muted); }
.ds-viewer .ds-media-card__expand:hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-viewer > .ds-media-card__foot { padding: var(--ds-space-3) var(--ds-space-8); border-bottom: 1px solid var(--ds-color-border-subtle); order: 1; }
.ds-viewer > .ds-viewer__media { order: 2; }
.ds-viewer__media { position: relative; flex: 1; min-height: 460px; background: var(--ds-color-surface-media); }
.ds-viewer__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
```

### 5.37 Sidebar navigation

**Purpose** Primary navigation. **DEOC** `Sidebar`: a 256 px glass panel (`gradient-glass`, radius 24, `shadow-sidebar`, no border, 16 px inset from the viewport, padding 17 10), brand row, two labelled groups, user card pinned to the bottom.

| Part | Spec |
|---|---|
| Brand row | 236 px wide, padding 4 6; 40 px logo tile (radius 8, 1 px `border-logo`) with the 23 × 24 logo; 12 px gap; product 14/600 -0.35 primary over tagline 10/16.5 `text-muted`; no collapse button by default (opt-in with `collapsible`) |
| Group label | `nav-section`, padding 0 14, 4 px above the items |
| Item | padding 10 14 (44 px with the 24 px illustration), radius `radius-nested`, 12 px gap, `nav-item`; items 4 px apart; groups 16 px apart; nav starts 20 px below the brand row; focus ring without offset |
| Current item | `gradient-nav-active`, `shadow-card`, label `text-primary` (weight stays 500, OBSERVED); `aria-current="page"` |
| Hover | `surface-hover`, label primary |
| User card | radius `radius-panel`, `gradient-glass`, 1 px `border-glass`, no shadow, padding 10; a 128 px `brand-tint-20` glow blurred 20 px behind the top; row 214 px: 32 px photo avatar, name 14/600/18 -0.35 + role 12 `text-muted`; logout icon (20 px, `text-muted` at 60 %, full opacity and primary on hover) |

**Variants** **expanded** (default and the only variant products use: always open, no toggle) and, opt-in via `collapsible`, **collapsed** — a 76 px rail that overlays content at 256 px on hover or keyboard focus, labels fading in 75 ms later [PRESERVED]. The collapse button switches between them and is a toggle (`aria-pressed`). Below 1024 px the sidebar becomes a drawer opened from the top bar (§8.2).

```css
.ds-sidebar-slot { position: relative; width: var(--ds-size-sidebar-expanded); flex-shrink: 0; z-index: var(--ds-z-sidebar); transition: width var(--ds-duration-slow) var(--ds-ease-emphasized); }
.ds-sidebar-slot:has(.ds-sidebar--collapsed) { width: var(--ds-size-sidebar-collapsed); }
.ds-sidebar { position: absolute; top: 0; bottom: 0; inset-inline-start: 0; width: var(--ds-size-sidebar-expanded); overflow: hidden;
  border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-sidebar);
  transition: width var(--ds-duration-slow) var(--ds-ease-emphasized); }
.ds-sidebar--collapsed { width: var(--ds-size-sidebar-collapsed); background: var(--ds-color-surface-base) var(--ds-gradient-glass); }  /* opaque: the rail expands over content */
.ds-sidebar--collapsed:hover, .ds-sidebar--collapsed:has(:focus-visible) { width: var(--ds-size-sidebar-expanded); }
.ds-sidebar__inner { display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 17px var(--ds-space-2-5); }
.ds-sidebar__fade { transition: opacity var(--ds-duration-base); white-space: nowrap; }
.ds-sidebar--collapsed .ds-sidebar__fade { opacity: 0; }
.ds-sidebar--collapsed:hover .ds-sidebar__fade, .ds-sidebar--collapsed:has(:focus-visible) .ds-sidebar__fade { opacity: 1; transition-delay: 75ms; }
.ds-sidebar__scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; margin-inline: calc(-1 * var(--ds-space-2-5)); padding-inline: var(--ds-space-2-5); }  /* bleeds into the inner padding so the current item's shadow is not clipped */
.ds-sidebar__brand { display: flex; align-items: center; gap: var(--ds-space-3); width: 236px; padding: var(--ds-space-1) var(--ds-space-1-5); }
.ds-sidebar__logo { width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-logo);
  display: flex; align-items: center; justify-content: center; }
.ds-sidebar__logo img { width: 23px; height: 24px; }
.ds-sidebar__name { display: block; font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-primary); }
.ds-sidebar__tagline { display: block; font-size: var(--ds-font-size-caption); line-height: 16.5px; color: var(--ds-color-text-muted); }
.ds-sidebar__toggle { margin-inline-start: auto; width: 24px; height: 24px; border-radius: var(--ds-radius-xs); display: inline-flex; align-items: center; justify-content: center; color: var(--ds-color-icon); flex-shrink: 0; }
.ds-sidebar__toggle:hover { color: var(--ds-color-text-primary); background: var(--ds-color-surface-hover); }
.ds-nav { margin-top: var(--ds-space-5); display: flex; flex-direction: column; gap: var(--ds-space-4); }
.ds-nav__section { display: flex; flex-direction: column; gap: var(--ds-space-1); }
.ds-nav__label { padding: 0 var(--ds-space-3-5); font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-muted); }
.ds-nav__item { position: relative; display: flex; align-items: center; width: 100%; min-height: var(--ds-size-nav-item); padding: var(--ds-space-2-5) var(--ds-space-3-5); border-radius: var(--ds-radius-nested);
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 500; color: var(--ds-color-text-muted); text-align: start; text-decoration: none;
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-nav__item:hover { color: var(--ds-color-text-primary); background: var(--ds-color-surface-hover); }
.ds-nav__item:focus-visible { outline-offset: 0; }
.ds-nav__item[aria-current="page"] { color: var(--ds-color-text-primary); background: var(--ds-gradient-nav-active); box-shadow: var(--ds-shadow-card); }
.ds-nav__icon { position: relative; width: var(--ds-size-nav-icon); height: var(--ds-size-nav-icon); flex-shrink: 0; overflow: hidden; }
.ds-nav__text { padding-inline-start: var(--ds-space-3); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ds-user-card { position: relative; margin-top: var(--ds-space-3); padding: var(--ds-space-2-5); border-radius: var(--ds-radius-panel); border: 1px solid var(--ds-color-border-glass);
  background: var(--ds-gradient-glass); overflow: hidden; }
.ds-user-card::before { content: ""; position: absolute; width: 128px; height: 128px; left: 50%; top: -48px; transform: translateX(-50%); border-radius: 50%;
  background: var(--ds-color-brand-tint-20); filter: blur(20px); pointer-events: none; }
.ds-user-card__row { position: relative; display: flex; align-items: center; gap: var(--ds-space-2); width: 214px; }
.ds-user-card__who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--ds-space-0-5); }
.ds-user-card__name { font-size: var(--ds-font-size-body); line-height: 18px; font-weight: 600; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-primary); }
.ds-user-card__role { font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-muted); }
.ds-user-card__out { color: var(--ds-color-text-muted); opacity: 0.6; transition: opacity var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-user-card__out:hover { color: var(--ds-color-text-primary); opacity: 1; background: transparent; }
@media (prefers-reduced-motion: reduce) { .ds-sidebar, .ds-sidebar-slot { transition: none; } }
```

### 5.38 Page header

**Purpose** Title the page and hold its global actions. **DEOC** `PageHeader`: height 76, padding 0 16 (`space-page-gutter`), no fill and no bottom divider (it sits flat on the page; `shadow-header-scrolled` appears only while content scrolls under it); title block = 36 px illustration + 10 px + `page-title` (24/600, D-9); an optional status pill 12 px after the title ("Live"); actions (search, filters, primary) at the end, 12 px apart.

Variants: with breadcrumb / back button / description [PRESERVED]. On narrow screens actions wrap below the title.

```css
.ds-page-header { position: relative; z-index: var(--ds-z-header); flex-shrink: 0; min-height: var(--ds-size-page-header); padding: var(--ds-space-3) var(--ds-space-page-gutter);
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-4); flex-wrap: wrap;
  box-shadow: none; transition: box-shadow var(--ds-duration-base); }
.ds-page-header--scrolled { box-shadow: var(--ds-shadow-header-scrolled); }
.ds-page-header__lead { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; flex-wrap: wrap; }
.ds-page-header__title { display: flex; align-items: center; gap: var(--ds-space-2-5); min-width: 0; }
.ds-page-header__icon { position: relative; width: var(--ds-size-page-icon); height: var(--ds-size-page-icon); flex-shrink: 0; overflow: hidden; }
.ds-page-header__titles { display: flex; flex-direction: column; gap: var(--ds-space-0-5); min-width: 0; }
.ds-page-header__titles h1 { overflow-wrap: anywhere; }
.ds-page-header__actions { display: flex; align-items: center; gap: var(--ds-space-header-actions); flex-wrap: wrap; }
/* Header filters and search wear the content-card surface (gradient-glass + shadow-surface) instead of the control stroke */
.ds-page-header__actions .ds-select__trigger--filter, .ds-page-header__actions .ds-search__input { background: var(--ds-gradient-glass); border-color: transparent; box-shadow: var(--ds-shadow-surface); }
.ds-page-header__actions .ds-select__trigger--filter::before { content: none; }
.ds-breadcrumb ol { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-breadcrumb a { color: var(--ds-color-text-muted); text-decoration: none; border-radius: var(--ds-radius-xs); transition: color var(--ds-duration-fast); }
.ds-breadcrumb a:hover { color: var(--ds-color-text-primary); }
.ds-breadcrumb li[aria-hidden] { color: var(--ds-color-text-faint); }
```

### 5.39 Segmented tabs

**Purpose** Switch between views of the same content. **Figma** role tabs (frame 6) and chart view switches ("Time Series | Factory Wise", "Factory Wise | Product Wise | Line Wise", frame 7): a toggle track (`gradient-toggle`, 1 px `border-subtle`, radius 12, no shadow, 5 px padding inside the border, as DEOC); tabs radius 8, padding 10 20 (sm: 6 20), `tab` 14/400/20; selected: `gradient-toggle-active` pill + primary text (weight unchanged); hover: `surface-hover-subtle` + primary text; count `tab-count` 4 px after the label.

**Variants** **raised** (default), **sm** (chart controls), **accent** (DEOC chart and table view switches: a 40 px track with equal-width 600-weight tabs, padding 0 12, tracking −0.4). **Behavior** `role="tablist"`, roving tabindex, arrows move and activate, Home/End [PRESERVED].

```css
.ds-tabs { display: inline-flex; max-width: 100%; overflow-x: auto; padding: 5px; border-radius: var(--ds-radius-track);   /* 5 px: DEOC toggle track (§11) */
  background: var(--ds-gradient-toggle); border: 1px solid var(--ds-color-border-subtle); }
.ds-tab { display: flex; align-items: center; justify-content: center; gap: var(--ds-space-1); white-space: nowrap;
  padding: var(--ds-space-2-5) var(--ds-space-5); border-radius: var(--ds-radius-sm); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-tab:hover { background: var(--ds-color-surface-hover-subtle); color: var(--ds-color-text-primary); }
.ds-tab[aria-selected="true"] { background: var(--ds-gradient-toggle-active); color: var(--ds-color-text-primary); }
.ds-tab:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-tab__label { display: inline-grid; }
.ds-tab__count { font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-tertiary); }
.ds-tab[aria-selected="true"] .ds-tab__count { color: var(--ds-color-text-muted); }
.ds-tabs--sm .ds-tab { padding: var(--ds-space-1-5) var(--ds-space-5); }
.ds-tabs--accent { display: inline-grid; grid-auto-flow: column; grid-auto-columns: 1fr; height: var(--ds-size-control); }
.ds-tabs--accent .ds-tab { padding: 0 var(--ds-space-3); font-weight: 600; letter-spacing: var(--ds-tracking-tight); }
.ds-tabpanel:focus-visible { outline-offset: var(--ds-focus-offset); }
.ds-cluster > .ds-tabs, .ds-page-header__actions > .ds-tabs { flex-shrink: 0; }
```

### 5.40 Pagination

**Purpose** Page through a long list. **DEOC** `Pagination`: glass footer (`gradient-glass-up`), 1 px `border-subtle` top divider, padding 12 16; summary "Showing **1 – 8** of **24** users" 14/400/20 `text-muted` with white 500 numbers; 32 px page buttons 6 px apart, radius 6, `surface-control` + 1 px `border-faint`, 12/500 `text-muted`; current page `brand-strong` with a 1 px white/30 % border and `shadow-card`; prev / next chevrons 16 px, disabled at 0.4.

First, last, current ±1 and "…" when there are more than 7 pages; compact "Page n of m" at `xs` [PRESERVED].

```css
.ds-pagination { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; padding: var(--ds-space-3) var(--ds-space-4);
  border-top: 1px solid var(--ds-color-border-subtle); background: var(--ds-gradient-glass-up); }
.ds-pagination__summary { font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-muted); }
.ds-pagination__summary strong { font-weight: 500; color: var(--ds-color-text-primary); }
.ds-pagination__pages { display: flex; align-items: center; gap: var(--ds-space-1-5); }
.ds-page-btn { width: var(--ds-size-pagination-button); height: var(--ds-size-pagination-button); padding: 0; display: flex; align-items: center; justify-content: center;
  border-radius: var(--ds-radius-chip); border: 1px solid var(--ds-color-border-faint); background: var(--ds-color-surface-control); color: var(--ds-color-text-muted);
  font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 500; transition: color var(--ds-duration-fast), border-color var(--ds-duration-fast); }
.ds-page-btn:hover { color: var(--ds-color-text-primary); border-color: var(--ds-color-border-control-hover); }
.ds-page-btn:focus-visible { outline-offset: 0; }
.ds-page-btn[aria-current="page"] { background: var(--ds-color-brand-strong); border-color: var(--ds-color-border-on-brand); color: var(--ds-color-text-primary); box-shadow: var(--ds-shadow-card); }
.ds-page-btn:disabled { opacity: 0.4; pointer-events: none; }
.ds-page-btn--ellipsis { cursor: default; border-color: transparent; background: transparent; }
.ds-pagination__compact { display: none; font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-muted); padding: 0 var(--ds-space-2); }
@media (max-width: 639px) {
  .ds-page-btn--num, .ds-page-btn--ellipsis { display: none; }
  .ds-pagination__compact { display: inline; }
}
```

### 5.41 Data table

**Purpose** Compare records. **Figma** user, camera and product tables (frames 4, 6, 8) and the analytics tables (frame 7).

#### Visual spec

| Part | Default (management tables) | Compact (dashboard tables) |
|---|---|---|
| Header row | `surface-table-header`, no divider below, `table-header` 12/600/16 uppercase +0.3 (40 px) | min-height 36, same fill and type |
| Body row | no dividers, no zebra; 44 px for one line of text | min-height 40 |
| Cell padding | `space-cell-y` `space-cell-x` (12 × 16) | same |
| Cells | first column `table-cell-primary` (14/500 white); others `table-cell` (14/400 `text-secondary`) | same; column dividers `border-divider` |
| Row actions | 28 px `sm` icon buttons with 20 px glyphs, 12 px apart, end-aligned | — |

#### Alignment rules [PRESERVED]

Text start-aligned; numbers end-aligned with tabular figures; status pills and short codes may be centred in compact tables (OBSERVED); actions end-aligned.

#### Column widths

Content-driven with `table-layout: auto`. DEOC spreads the leftover width evenly between columns (it shrinks content columns to fit and puts an empty spacer cell between each pair); an implementation MAY do the same. Identifier cells may truncate (`ds-cell-truncate`, max `--ds-cell-max`, default 240 px) with a tooltip.

#### Overflow and truncation

The table sits in a horizontally scrollable region (`ds-table-region`, focusable, labelled). Never let a table widen the page.

#### Sticky header

Inside a capped region (`ds-table-region--capped`, max `--ds-table-max-height`) the header pins with the opaque `gradient-table-header-pinned` (D-9) and gains `shadow-header-scrolled` while scrolled.

#### Sorting

Sortable headers hold a button with a 14 px sort glyph (Figma "SVG" beside product-table headers); `aria-sort` on the `th`; the sorted column's label turns `text-secondary`.

#### Row actions

Copy, edit, delete (frame 6) or edit, delete (frames 4, 8), each with an `aria-label` naming the row ("Edit Anita Sharma"). Destructive actions confirm (§5.45).

#### Row activation (opening a record)

When a row opens a record, the first cell holds a link (`ds-row-link`); the whole row may also be clickable (`ds-row-clickable`, `surface-hover`).

#### Selection [EXTENSION]

A 48 px checkbox column; selected rows `brand-tint-10`; a bulk bar replaces the card header while rows are selected.

#### Status tints & empty state

Warning rows `row-warning`, stopped rows `row-critical` [EXTENSION]. Empty: one full-width cell with a §5.51 message, 48 px vertical padding.

```css
.ds-table-region { width: 100%; overflow-x: auto; }
.ds-table-region--capped { overflow-y: auto; max-height: var(--ds-table-max-height, 494px); scroll-padding-top: var(--ds-size-table-header); }
.ds-table-region:focus-visible { outline-offset: var(--ds-focus-offset-inset); }
.ds-table { width: 100%; min-width: var(--ds-table-min-width, 0); border-collapse: separate; border-spacing: 0; table-layout: auto; }
.ds-table th, .ds-table td { padding: var(--ds-space-cell-y) var(--ds-space-cell-x); text-align: start; vertical-align: middle; }
.ds-table thead th { height: var(--ds-size-table-header); background: var(--ds-color-surface-table-header); white-space: nowrap;
  font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 600; letter-spacing: var(--ds-tracking-table-header); text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-table tbody td, .ds-table tbody th { height: var(--ds-size-table-row); font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 400; }
.ds-table tbody th { font-weight: 500; }
.ds-table tbody td { color: var(--ds-color-text-secondary); }
.ds-table tbody td * { font-weight: 400; }   /* DEOC: everything in a secondary cell is regular weight, tags included */
.ds-table tbody th { color: var(--ds-color-text-primary); }
.ds-table tbody tr { transition: background-color var(--ds-duration-fast); }
.ds-table tbody tr:hover { background: var(--ds-color-surface-row-hover); }
.ds-table tbody tr.ds-row-clickable { cursor: pointer; }
.ds-table tbody tr.ds-row-clickable:hover { background: var(--ds-color-surface-hover); }
.ds-table tbody tr.ds-row-warning { background: var(--ds-color-row-warning); }
.ds-table tbody tr.ds-row-critical { background: var(--ds-color-row-critical); }
.ds-table tbody tr[aria-selected="true"], .ds-table tbody tr.is-selected { background: var(--ds-color-brand-tint-10); }
.ds-table-region--capped thead th { position: sticky; top: 0; z-index: var(--ds-z-header); background: var(--ds-gradient-table-header-pinned); transition: box-shadow var(--ds-duration-base); }
.ds-table-region--scrolled thead th { box-shadow: var(--ds-shadow-header-scrolled); }
.ds-table--compact thead th { height: var(--ds-size-table-header-compact); letter-spacing: var(--ds-tracking-table-header); }
.ds-table--compact tbody td, .ds-table--compact tbody th { height: var(--ds-size-table-row-compact); }
.ds-table--grid th + th, .ds-table--grid td + td, .ds-table--grid th + td { border-inline-start: 1px solid var(--ds-color-border-divider); }
.ds-table .ds-col-shrink { width: 1%; white-space: nowrap; }
.ds-table .ds-num { text-align: end; font-variant-numeric: tabular-nums; }
.ds-table .ds-right { text-align: end; }
.ds-table .ds-center { text-align: center; }
.ds-table .ds-col-check { width: 48px; text-align: center; padding-inline: var(--ds-space-4); }
.ds-table .ds-col-check .ds-check { vertical-align: middle; }
.ds-row-link { color: inherit; font-weight: inherit; text-decoration: none; border-radius: var(--ds-radius-xs); }
.ds-row-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.ds-row-link:focus-visible { outline-offset: var(--ds-focus-offset-tight); }
.ds-th-sort { display: inline-flex; align-items: center; gap: var(--ds-space-1-5); font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; border-radius: var(--ds-radius-xs); }
.ds-th-sort:hover { color: var(--ds-color-text-primary); }
.ds-th-sort:focus-visible { outline-offset: var(--ds-focus-offset-tight); }
th[aria-sort] .ds-th-sort { color: var(--ds-color-text-secondary); }
th[aria-sort="descending"] .ds-th-sort svg { transform: rotate(180deg); }
.ds-num .ds-th-sort { flex-direction: row-reverse; }
.ds-row-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--ds-space-3); }
.ds-row-actions--menu { position: relative; }
.ds-cell-truncate { display: block; max-width: var(--ds-cell-max, 240px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-cell-stack { display: flex; flex-direction: column; }
.ds-cell-thumb { width: 40px; height: 40px; border-radius: var(--ds-radius-sm); object-fit: cover; background: var(--ds-color-surface-media); }
.ds-table-empty { padding: var(--ds-space-12) var(--ds-space-4) !important; text-align: center !important; color: var(--ds-color-text-muted) !important; }
.ds-bulkbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding: var(--ds-space-3) var(--ds-space-6);
  border-bottom: 1px solid var(--ds-color-border-faint); background: var(--ds-color-brand-tint-10); }
.ds-bulkbar__actions { display: flex; gap: var(--ds-space-2); }
```

### 5.42 Table card & table section header

**Purpose** A titled container for one table. **DEOC** `TableCard` and the factory-detail "Lines" card: radius 16, glass fill, `shadow-float-drop` with `shadow-edge` drawn above the content; optional header (`group-title` + small count pill 14 px apart, padding 16, `border-faint` divider), toolbar row [EXTENSION], table, pagination.

```css
.ds-table-card { position: relative; display: flex; flex-direction: column; flex-shrink: 0; min-width: 0; border-radius: var(--ds-radius-card); overflow: hidden;
  background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-float-drop); }
.ds-table-card::after { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; box-shadow: var(--ds-shadow-edge); }
.ds-table-card__header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--ds-space-3);
  padding: var(--ds-space-4); border-bottom: 1px solid var(--ds-color-border-faint); }
.ds-table-card__title { display: flex; align-items: center; gap: var(--ds-space-3-5); min-width: 0; }
.ds-table-card__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-4); }
.ds-table-card__toolbar > .ds-search { flex: 1 1 320px; }
```

### 5.43 Collapsible section (grouped list)

**Purpose** Group records by a parent (factories → lines → cameras). **DEOC** `CollapsibleSection` on the Cameras and Interface Devices pages.

| Level | Container | Header | Body |
|---|---|---|---|
| **Section** (factory) | radius 16, `gradient-glass`, `shadow-glass-soft` + `shadow-edge` | height 60, padding 0 16, `subgroup-title` (16/700) + count pill (14 px), 24 px disclosure chevron 24 px after the count (flips when open), `border-faint` divider when open | padding 16, nested groups 12 px apart |
| **Nested group** (line) | `surface-nested`, radius 16, no border, no shadow | height 60, padding 0 16, 24 px chevron at the **start** (24 px gap to the title), action (**section** button "Add Camera", 180 px) at the end | an edge-to-edge default table |

Sections stack 12 px apart (`space-stack`). Header toggle is a `<button aria-expanded aria-controls>` inside an `h2`/`h3`. Collapsed sections show only the header.

```css
.ds-section-stack { display: flex; flex-direction: column; gap: var(--ds-space-stack); }
.ds-section-card { border-radius: var(--ds-radius-card); overflow: clip; background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-glass-soft), var(--ds-shadow-edge); }
.ds-section-card--nested { border-radius: var(--ds-radius-nested); background: var(--ds-color-surface-nested); border: 0; box-shadow: none; }
.ds-section-card__heading { display: flex; align-items: center; gap: var(--ds-space-4); min-height: var(--ds-size-section-header); padding: 0 var(--ds-space-4); }
.ds-section-card__heading:has(+ [id]:not([hidden])) { border-bottom: 1px solid var(--ds-color-border-faint); }
.ds-section-card__h { flex: 1; min-width: 0; display: flex; }
.ds-section-card__toggle { flex: 1; min-width: 0; display: flex; align-items: center; gap: var(--ds-space-3-5); text-align: start; border-radius: var(--ds-radius-sm); }
.ds-section-card__chev { display: inline-flex; flex-shrink: 0; margin-inline-start: calc(var(--ds-space-6) - var(--ds-space-3-5)); color: var(--ds-color-icon-chevron); transition: transform var(--ds-duration-fast); }
.ds-section-card__toggle[aria-expanded="true"] .ds-section-card__chev { transform: scaleY(-1); }
.ds-section-card--nested .ds-section-card__chev { margin-inline: 0 calc(var(--ds-space-6) - var(--ds-space-3-5)); order: -1; }
.ds-section-card__body { padding: var(--ds-space-card); display: flex; flex-direction: column; gap: var(--ds-space-stack); }
.ds-section-card__body--flush { padding: 0; }
```

### 5.44 Overlay & modal

**Purpose** A focused task over the page. **Figma** "Add Cameras" (frame 5): the scrim is black/50 % with a 4 px backdrop blur (same in every overlay frame); the modal is `gradient-dialog`, radius 12, padding 24, sections 28 px apart, no border; header: 32 px illustration + `modal-title`, 32 px close, 20 px bottom padding over a white/5 % divider; form rows 40 px apart, columns 20 px; actions end-aligned (secondary 120 px, primary 180 px, 16 px apart). Width `size-modal` (718 → 720).

**Behavior** [PRESERVED]: `role="dialog" aria-modal="true" aria-labelledby`; focus moves to the first field (or the title); focus is trapped; Escape closes unless there are unsaved edits (then a §5.45 discard confirmation); **backdrop clicks never close**; focus returns to the opener. Overlays and their scrim cover the whole shell, sidebar included (R-12).

```css
.ds-overlay { position: absolute; inset: 0; z-index: var(--ds-z-overlay); display: flex; align-items: center; justify-content: center; }
.ds-overlay:focus { outline: none; } /* the root takes focus only so Escape still works after a click on the scrim */
.ds-overlay__backdrop { position: absolute; inset: 0; background: var(--ds-color-scrim); backdrop-filter: blur(var(--ds-overlay-blur)); -webkit-backdrop-filter: blur(var(--ds-overlay-blur)); }
.ds-overlay--panel { justify-content: flex-end; align-items: stretch; }
.ds-overlay--fixed { position: fixed; }
@media (max-width: 1023px) { .ds-overlay { position: fixed; } }
.ds-modal { position: relative; width: min(var(--ds-size-modal), calc(100% - 32px)); max-height: calc(100% - 48px); display: flex; flex-direction: column; gap: 28px;
  padding: var(--ds-space-card-xl); border-radius: var(--ds-radius-control); background: var(--ds-gradient-dialog); box-shadow: var(--ds-shadow-modal); overflow-y: auto; }
.ds-modal--sm { width: min(var(--ds-size-dialog), calc(100% - 32px)); }
.ds-modal__header { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding-bottom: var(--ds-space-5); border-bottom: 1px solid var(--ds-color-border-faint); }
.ds-modal__titlegroup { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; }
.ds-modal__title { font-size: var(--ds-font-size-body); line-height: 18px; font-weight: 400; color: var(--ds-color-text-primary); }
.ds-modal__body { display: flex; flex-direction: column; gap: var(--ds-space-form-row); }
.ds-modal__footer { display: flex; justify-content: flex-end; gap: var(--ds-space-4); flex-wrap: wrap; }
.ds-modal__footer > .ds-btn--secondary { min-width: 120px; }
```

### 5.45 Confirmation dialog [PRESERVED]

A small modal (`size-dialog`) for destructive or discarding actions (DEOC `ConfirmDialog`): `gradient-dialog`, radius 16, 1 px `border-subtle`, `shadow-modal` + `shadow-highlight`, padding 24, 24 px gap; `dialog-title`, a `body-muted` message 8 px below, Cancel (secondary) and the action (danger or primary) 12 px apart. `role="alertdialog"`; initial focus on Cancel; Escape = Cancel.

```css
.ds-dialog { position: relative; width: min(var(--ds-size-dialog), calc(100% - 32px)); max-height: calc(100% - 48px); overflow-y: auto; display: flex; flex-direction: column; gap: var(--ds-space-6);
  padding: var(--ds-space-6); border-radius: var(--ds-radius-card); border: 1px solid var(--ds-color-border-subtle); background: var(--ds-gradient-dialog); box-shadow: var(--ds-shadow-modal), var(--ds-shadow-highlight); }
.ds-dialog__text { display: flex; flex-direction: column; gap: var(--ds-space-2); }
.ds-dialog__actions { display: flex; justify-content: flex-end; gap: var(--ds-space-3); }
```

### 5.46 Slide panel (drawer)

**Purpose** Create or edit a record without leaving the list. **DEOC** `SlidePanel`: 480–820 px, full height, attached to the viewport's inline-end; body `gradient-app`; 1 px `border-subtle` start edge; `shadow-drawer`; no top sheen.

| Part | Spec |
|---|---|
| Header | `gradient-glass`, 1 px `border-subtle` divider, padding 20 24 (28 24 33 when a stepper follows); title row = optional back button (36) + illustration (24 px; 32–40 px for crops) + 12 px + `dialog-title` and a 36 px close button; optional stepper 48 px below |
| Body | scrolls; padding 24; form sections 24 px apart; rows 40 px |
| Footer | `gradient-glass-up`, 1 px `border-edge` divider, `shadow-footer-scrolled` while more content sits below the fold (D-9), padding 20 24; secondary "Back"/"Cancel" with a 20 px back arrow at the start; helper text (12 px `text-tertiary`, e.g. "Auto-saved draft 12s ago") and a 180 px primary with a trailing chevron at the end |

Sizes `sm` 480 · `md` 560 · `lg` 680 · `xl` 820 (maximum widths, `min(<size>, 100%)`). Behavior as §5.44; the header shadow appears while the body is scrolled, the footer shadow while more of the body sits below.

```css
.ds-panel { position: relative; display: flex; flex-direction: column; height: 100%; max-width: 100%;
  background: var(--ds-color-bg-app) var(--ds-gradient-app); border-inline-start: 1px solid var(--ds-color-border-subtle); box-shadow: var(--ds-shadow-drawer); }
.ds-panel:dir(rtl) { box-shadow: var(--ds-shadow-drawer-mirrored); }
.ds-panel--sm { width: min(var(--ds-size-panel-sm), 100%); } .ds-panel--md { width: min(var(--ds-size-panel-md), 100%); }
.ds-panel--lg { width: min(var(--ds-size-panel-lg), 100%); } .ds-panel--xl { width: min(var(--ds-size-panel-xl), 100%); }
.ds-panel__header { position: relative; z-index: var(--ds-z-header); flex-shrink: 0; padding: var(--ds-space-5) var(--ds-space-6); display: flex; flex-direction: column; gap: var(--ds-space-12);
  background: var(--ds-gradient-glass); border-bottom: 1px solid var(--ds-color-border-subtle); transition: box-shadow var(--ds-duration-base); }
.ds-panel__header:has(> :nth-child(2)) { padding: 28px var(--ds-space-6) 33px; }   /* with a stepper (DEOC) */
.ds-panel__header--scrolled { box-shadow: var(--ds-shadow-header-scrolled); }
.ds-panel__titlerow { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.ds-panel__titlegroup { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; }
.ds-panel__titles { display: flex; flex-direction: column; gap: var(--ds-space-0-5); min-width: 0; }
.ds-panel__icon { position: relative; width: var(--ds-size-entity-icon); height: var(--ds-size-entity-icon); flex-shrink: 0; overflow: hidden; }
.ds-panel__body { flex: 1; overflow-y: auto; padding: var(--ds-space-6); display: flex; flex-direction: column; gap: 28px; }
.ds-panel__footer { position: relative; z-index: 1; flex-shrink: 0; transition: box-shadow var(--ds-duration-base); padding: var(--ds-space-5) var(--ds-space-6); border-top: 1px solid var(--ds-color-border-subtle); background: var(--ds-gradient-glass-up);
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; }
.ds-panel__footer--more { box-shadow: var(--ds-shadow-footer-scrolled); }
.ds-panel__footer-end { display: flex; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap; justify-content: flex-end; }
.ds-panel__note { font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-tertiary); }
```

### 5.47 Popover [PRESERVED · restyled]

An anchored floating panel (DEOC date-range popover): `surface-raised`, no border, radius 8, `shadow-float`, padding 16, gap 16, 4 px below the trigger. Escape closes and returns focus; outside click closes (no data is lost).

```css
.ds-popover { position: absolute; z-index: var(--ds-z-menu); top: 100%; inset-inline-end: 0; margin-top: var(--ds-space-1); width: min(var(--ds-size-popover-date), calc(100vw - 32px));
  display: flex; flex-direction: column; gap: var(--ds-space-4); padding: var(--ds-space-4); border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-raised); box-shadow: var(--ds-shadow-float); }
.ds-popover .ds-form-grid { column-gap: var(--ds-space-3); row-gap: var(--ds-space-4); }
.ds-popover__footer { display: flex; justify-content: space-between; gap: var(--ds-space-3); }
.ds-popover--start { right: auto; inset-inline-start: 0; }
.ds-popover--sm { width: min(280px, calc(100vw - 32px)); }
```

### 5.48 Toast [PRESERVED · restyled]

A short confirmation at the top centre of the main panel: `surface-raised`, 1 px `border-subtle`, radius 8, `shadow-elevated`, padding 10 16, `toast` 14 px; optional action and close; `role="status"` (errors: `alert`); 4 s, paused on hover and focus.

```css
.ds-toast-region { position: absolute; z-index: var(--ds-z-toast); top: var(--ds-space-6); left: 50%; transform: translateX(-50%); width: max-content; max-width: calc(100% - 32px); pointer-events: none;
  display: flex; flex-direction: column; gap: var(--ds-space-2); align-items: center; }
.ds-toast { display: flex; align-items: center; gap: var(--ds-space-2); max-width: min(480px, calc(100% - 32px)); pointer-events: auto;
  padding: var(--ds-space-2-5) var(--ds-space-4); border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-subtle);
  background: var(--ds-color-surface-raised); box-shadow: var(--ds-shadow-elevated); font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-primary); }
.ds-toast--success svg { color: var(--ds-color-success-text); flex-shrink: 0; }
.ds-toast--error svg { color: var(--ds-color-danger-text); flex-shrink: 0; }
.ds-toast__action { margin-inline-start: var(--ds-space-2); }
@media (max-width: 639px) { .ds-toast-region { top: auto; bottom: var(--ds-space-4); width: calc(100% - 32px); } }
```

### 5.49 Tooltips

**Label tooltip** names icon-only buttons and recovers truncated text: `gradient-tooltip`, 1 px `border-glass`, radius 8, `shadow-tooltip`, padding 6 10, 12/16 `text-tooltip`, max 280 px. Shown on hover (after 300 ms) and on keyboard focus, dismissed with Escape, never covering its trigger; rendered in a body-level layer (`z-label-tooltip`) [PRESERVED].

**Rich chart tooltip** (§7.9) uses the same surface (OBSERVED on the heatmap and matrix hover states).

```css
.ds-tooltip { position: fixed; z-index: var(--ds-z-label-tooltip); max-width: 280px; padding: var(--ds-space-1-5) var(--ds-space-2-5); border-radius: var(--ds-radius-sm);
  background: var(--ds-gradient-tooltip); border: 1px solid var(--ds-color-border-glass); box-shadow: var(--ds-shadow-tooltip);
  font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-tooltip); pointer-events: auto; overflow-wrap: anywhere; }
.ds-tooltip[hidden] { display: none; }
.ds-tooltip--static { position: relative; display: inline-block; }
```

### 5.50 Loading states [PRESERVED]

Skeleton bars (`skeleton`, radius 6, 1.5 s pulse) in place of text and charts; a 16 px spinner inside buttons; never a full-page spinner.

```css
.ds-skeleton { background: var(--ds-color-skeleton); border-radius: var(--ds-radius-chip); animation: ds-pulse 1.5s ease-in-out infinite; }
.ds-skeleton--bar { display: inline-block; vertical-align: middle; }
@keyframes ds-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
```

### 5.51 Empty states [PRESERVED]

Centered inside the container: optional 40 px icon tile or illustration, optional `card-title`, a `body-muted` message, optional action. Variants: inline (48 px padding), first-use (64 / 24), chart (64 / 0).

```css
.ds-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ds-space-3); padding: var(--ds-space-12) var(--ds-space-4);
  text-align: center; font-size: var(--ds-font-size-body); line-height: 20px; color: var(--ds-color-text-muted); }
.ds-empty--first-use { padding: var(--ds-space-16) var(--ds-space-6); }
.ds-empty--chart { padding: var(--ds-space-16) 0; }
```

### 5.52 Component contract matrix

| Component | Element / role | Keyboard | Accessible name | Required states |
|---|---|---|---|---|
| Button | `button` | Enter, Space | label text | hover, focus, disabled, loading |
| Icon button | `button` | Enter, Space | `aria-label` + tooltip | hover, focus, disabled |
| Text input / textarea | `input` / `textarea` | native | `<label for>` | hover, focus, error, disabled |
| Select | `button` + `listbox` | ↑ ↓ Home End, type-ahead, Enter, Esc | label | open, selected, error |
| Multi-select | `button` + `listbox[aria-multiselectable]` | Space toggles | label | as select |
| Rich picker | `combobox` + `listbox` | as select | label | open, active row, selected |
| Checkbox / switch | `input[type=checkbox]` / `button[role=switch]` | Space | label | checked, focus, disabled |
| Radio cards / toggle | `radiogroup` + `radio` | arrows, Space | group label | checked, focus, disabled |
| Dropzone | `button` + hidden file input | Enter, Space | title text | hover, drag-over, error, filled |
| Tabs | `tablist` / `tab` | arrows, Home, End | label / text | selected, focus |
| Pagination | `nav` + buttons | Tab | "Page n", "Next page" | current, disabled |
| Collapsible | `button[aria-expanded]` in a heading | Enter, Space | heading text | expanded |
| Modal / drawer | `dialog[aria-modal]` | Tab trap, Esc | `aria-labelledby` | open, dirty |
| Confirm | `alertdialog` | Tab trap, Esc | title | — |
| Toast | `status` / `alert` | — | message | — |
| Tooltip | `tooltip` (`aria-describedby`/name) | Esc dismisses | — | visible |
| Table | `table` in a focusable region | Tab, scroll | caption / `aria-label` | sorted, selected, empty |
| Chart marks | `button` / focusable SVG | Tab, Enter | value text | hover, focus, tooltip |

### 5.53 Supplementary blueprints

All component CSS is inline in its own section above; there is no separate derived stylesheet in this system.

### 5.54 Anatomy, variants & states index

| § | Component | Variants | Sizes | States beyond default |
|---|---|---|---|---|
| 5.1 | Button | primary, secondary, subtle, tonal, ghost, danger | sm, md, lg | hover, focus, disabled, loading |
| 5.2 | Icon button | default, close, open | sm 28, compact 32, md 36 | hover, focus, disabled |
| 5.5 | Text input | plain, suffix, trailing button | md | hover, focus, error, disabled, read-only |
| 5.9 | Select | filter, field, rich | md | hover, open, focus, error, disabled |
| 5.13 | Radio cards | horizontal, vertical | md | hover, checked, focus, disabled |
| 5.14 | Binary toggle | on/off | md | checked, focus, disabled |
| 5.17 | Dropzone | empty, filled | — | hover, drag-over, error |
| 5.22 | Stepper | — | — | completed, current, upcoming |
| 5.23 | KPI card | static, toggle | — | hover, pressed |
| 5.24 | Entity card | active, warning, offline | — | button states |
| 5.27 | Badge | tinted, glass, live; success, warning, error, info, neutral | sm, md | — |
| 5.29 | Tag | purple, blue, green, amber, rose, raised | — | — |
| 5.32 | Avatar | brand, neutral, photo, presence | 32, 40 | — |
| 5.34 | Progress / segbar | success, warning, error, brand; md, lg | — | — |
| 5.36 | Media card | static, interactive; detection frame | — | hover, focus |
| 5.37 | Sidebar | expanded, collapsed, drawer | — | hover, current, focus |
| 5.39 | Tabs | raised, sm, accent | — | hover, selected, focus |
| 5.41 | Table | default, compact, grid | — | hover, clickable, selected, sorted, empty |
| 5.43 | Collapsible | section, nested | — | expanded, collapsed |
| 5.44 | Modal | form, sm | — | dirty |
| 5.46 | Slide panel | sm, md, lg, xl | — | scrolled, dirty |

### 5.55 Behavior specifications for scripted components [PRESERVED]

#### Select, multi-select and rich picker (combobox + listbox)

Click or Enter/Space/↓ opens the list and moves the active descendant to the selected option (or the first). ↑/↓ move, Home/End jump, printable characters type-ahead. Enter/Space selects (single: closes and returns focus to the trigger). Escape closes without changing the value. Tab closes and moves on. Outside click closes. The list flips upward when there is no room below. A searchable list filters as you type and announces "N results". Rich picker footer actions ("+ Add User") are the last focusable row.

#### Command menu ("More actions", `role="menu"`)

↑/↓ cycle items, Enter activates, Escape closes and returns focus.

#### Segmented tabs

Arrows move **and** activate (wrapping, mirrored in RTL), Home/End jump; only the selected tab is in the tab order.

#### Overlays: modal, confirmation dialog, slide panel, viewer, mobile drawer

Open: focus the first field (forms) or the title. Tab cycles within. Escape closes when clean; when dirty, a discard confirmation opens. Backdrop clicks never close. Close returns focus to the opener (or the page `h1` if the opener is gone). Body scroll is locked while open.

#### Popovers (date range and generic)

Escape and outside click close; Apply commits; focus returns to the trigger.

#### Tooltips

Hover (300 ms delay) or focus shows; Escape hides; the pointer may move onto the tooltip; truncation tooltips appear only when text is actually truncated.

#### Toasts

Announced politely; auto-dismiss after 4 s unless hovered or focused; never steal focus.

#### Collapsible section

Enter/Space toggles; the body is removed from the accessibility tree when collapsed (`hidden`).

#### Sidebar

Collapse toggle is `aria-pressed`; in the collapsed rail, focus or hover expands it; current page link has `aria-current="page"`.

#### Data table

The scroll region is focusable when it overflows; sort buttons announce the new order; row actions name their row.

#### Choice controls (radio cards, binary toggle, switch)

Radio groups: arrows move and select; switch: Space toggles and applies immediately.

#### File upload and field with attach

The dropzone is a button; drag-and-drop is an enhancement; accepted types and size limits are validated with a visible message; selected files can be removed by keyboard.

#### Forms (every container)

Validate on submit and on blur after the first submit; focus the first invalid field; required fields carry `aria-required`; messages are linked with `aria-describedby`; "Auto-saved draft" notes are `role="status"`.

---

## 6. Page layout patterns

**Layer L3.** Defaults with acceptable variants.

### 6.0 Spacing relationships (apply to every layout)

Viewport → shell 16; sidebar → main 20; header → content 8; content gutter 16; page sections 20–32 (DEOC: 20 on dashboards and grouped lists, 24 on list pages, 32 above a card grid); KPI cards 16 apart; entity and dashboard cards 20 apart; tiles and side-panel cards 16 apart; collapsible sections 12 apart; inside cards 20–25. A larger gap always separates more independent groups.

### 6.1 Application shell

**Figma** every frame (1920 × 1021): viewport `gradient-app` with a 420 px blue glow at (-120, -120) and a 360 px green glow at the bottom-right; 16 px padding; the 256 px sidebar and the main panel (radius 24, `gradient-glass-strong`, `shadow-shell` + `shadow-edge`) 20 px apart (DEOC `AppShell`). The main panel holds the page header and the scrolling content. Overlays (drawers, modals) cover the whole viewport in the screens, including the sidebar — they are positioned against the shell, not the main panel (R-12).

```css
.ds-shell { position: relative; display: flex; gap: var(--ds-space-shell-gap); width: 100%; height: 100dvh; padding: var(--ds-space-shell-padding);
  background: var(--ds-color-bg-app) var(--ds-gradient-app); overflow: hidden; isolation: isolate; }
.ds-shell::before, .ds-shell::after { content: ""; position: absolute; z-index: -1; border-radius: var(--ds-radius-full); filter: blur(var(--ds-blur-ambient)); pointer-events: none; }
.ds-shell::before { width: 420px; height: 420px; left: -120px; top: -120px; background: var(--ds-color-glow-brand); }
.ds-shell::after { width: 360px; height: 360px; right: -40px; bottom: -40px; background: var(--ds-color-glow-success); }
.ds-main { position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0;
  border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass-strong); box-shadow: var(--ds-shadow-shell), var(--ds-shadow-edge); overflow: hidden; }
.ds-page-content { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: var(--ds-space-section);
  padding: var(--ds-space-page-top) var(--ds-space-page-gutter) var(--ds-space-page-gutter); }
.ds-page-content > * { flex-shrink: 0; }
.ds-topbar { display: none; }
@media (max-width: 1023px) {
  .ds-shell { padding: 0; gap: 0; flex-direction: column; }
  .ds-main { border-radius: 0; border: 0; box-shadow: none; }
  .ds-topbar { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); min-height: 56px; padding: 0 var(--ds-space-4);
    background: var(--ds-color-surface-base); border-bottom: 1px solid var(--ds-color-border-faint); }
}
```

### 6.2 Page header

Title at the start (DEOC shows no page illustration; a 36 px back button leads detail pages), global controls at the end in the order **search → filters → primary action**. A status pill may follow the title (Live View). One primary per header.

### 6.3 Filters

Page-wide filters live in the header (search 288–350 px, selects 180 px). Filters that scope one card live in that card's header (Analytics "Primary Back", "Last 8 weeks", "Products") or in a toolbar row above its table (Product Master). Role filters that partition a list are segmented tabs with counts (User Management) with the export action at the end of the same row.

### 6.4 Metrics

A full-width row of KPI cards, 16 px apart (`space-grid`), all equal width (3–6). Values are short; ratios use "a / b". Below 1280 px the row becomes an auto-fill grid (min 260 px).

### 6.5 Card grids

Entity cards in a 3-column grid at desktop (20 px gaps), auto-fill (min 400 px) below. Camera tiles in a 2 × 2 grid with 16 px gaps that fills the remaining height. A grid may be introduced by a **section title** (`section-title`, a 6 px `text-faint` dot and the count), 16 px above the grid (OBSERVED, frame 2).

```css
.ds-section-title { display: flex; align-items: center; gap: var(--ds-space-3); padding: 0 var(--ds-space-1); margin-bottom: var(--ds-space-4);
  font-size: var(--ds-font-size-heading); line-height: 28px; font-weight: 500; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-tertiary); }
.ds-section-title__dot { width: var(--ds-size-badge-dot); height: var(--ds-size-badge-dot); border-radius: var(--ds-radius-full); background: var(--ds-color-text-faint); }
@media (min-width: 1280px) { .ds-entity-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
```

### 6.6 List / management page

Header (search, filters, primary) → optional tab row → table card (table + pagination), 24 px apart. Rows 44 px (52 with row actions).

### 6.7 Grouped list page

Header → KPI row → a stack of collapsible sections (12 px apart), each holding nested groups (12 px apart) with tables. The first section starts expanded with its first group expanded.

### 6.8 Detail page

Header with a back button → KPI row → table card with a header (title + count) and pagination, 24 px apart (DEOC factory detail).

### 6.9 Dashboard

Header with page-wide filters → KPI row (12 px above the first card) → stacked dashboard cards, 20 px apart: a full-width chart, a full-width matrix, a pair (fixed 594 px donut card + flexible heatmap card), a full-width table, then three status cards (flex 578 / 534 / 418). Below 1280 px pairs stack.

### 6.10 Forms

Forms live in slide panels (multi-field, multi-step: Add Factory, Add Product) or modals (one compact step: Add Cameras). Two or three equal columns, 20 px apart, rows 40 px apart; full-width rows for pickers, uploads and notes. Sections start with a `modal-title` header over a divider. Footer: Back / Cancel at the start; helper note + primary at the end.

### 6.11 Monitoring view

**Figma** Live View: header (title + Live pill; factory and line selects; "Line Changeover" primary) → content row: a 2 × 2 camera grid (16 px gaps) filling the height, and a 340 px side panel of stacked cards (summary strip, reference barcodes, system health) 16 px apart, 20 px from the grid.

```css
.ds-monitor { display: flex; gap: var(--ds-space-grid-lg); min-height: 0; flex: 1; }
.ds-monitor > .ds-media-grid { flex: 1; min-width: 0; }
.ds-monitor__aside { width: var(--ds-size-aside); flex-shrink: 0; display: flex; flex-direction: column; gap: var(--ds-space-grid); }
@media (max-width: 1279px) { .ds-monitor { flex-direction: column; } .ds-monitor__aside { width: 100%; } }
```

### 6.12 Mapping product needs to patterns

| Need | Pattern |
|---|---|
| Watch a running line | §6.11 monitoring view |
| Browse sites | §6.5 entity-card grid under a KPI row |
| Manage equipment by hierarchy | §6.7 grouped list |
| Manage users / products | §6.6 list page |
| Analyse quality | §6.9 dashboard |
| Create a multi-part record | §5.46 slide panel with stepper |
| Add one child record mid-flow | §5.44 modal over the panel |

---

## 7. Data visualization system

### 7.1 General rules

Charts live in dashboard cards (§5.25). Every chart has a title, a legend when it has more than one series, readable axes, a tooltip on hover **and** focus, and an accessible data table alternative. Colors encode meaning only: good = `chart-positive`, bad = `chart-negative`, running = `chart-running`, stopped = `chart-stopped`; categories use `chart-cat-1…4` in order. Never use a status color as a category color. Numbers use en-GB grouping in the system (the screens show Indian grouping "1,23,456" — a product locale decision).

### 7.2 Color palettes

| Palette | Tokens | Use |
|---|---|---|
| Binary quality | `chart-positive` `#10b981` / `chart-negative` `#ff5825` | Good vs bad products |
| Running / stopped | `chart-running` `#34d399` / `chart-stopped` `#ff5825` | Status bars and legends |
| Categorical | `chart-cat-1…4` | Donut and category series (OBSERVED in the donut; R-13) |
| Heat scale | `heat-0 … heat-4` | Defect-rate heatmap and bubble colors (5 stops, interpolated in RGB) |
| Trend | `chart-trend` (white) | Dashed trend line and its points |

Heat cells use white text up to 0.55 of the scale and `text-on-bright` from 0.59 (white fails 4.5:1 on orange, §9.1); values between 0.55 and 0.59, where neither text colour reaches 4.5:1, snap their fill to the nearer edge.

### 7.3 Axes

Y axis: 28 px column, 7 ticks (0 → max rounded to a nice step, e.g. 10k), `axis-y` labels, no vertical axis line. Baseline: 1 px `border-subtle`. X axis: centred `axis-x` category labels, 10 px below the baseline; dense categorical axes use `axis-caption` (2-line clamp). No horizontal gridlines.

### 7.4 Bar charts (vertical, stacked)

**DEOC** "Quality Snapshot": equal bands, bars 60 % of the band (6–74 px), top corners radius 4, **no gap** between stacked segments, good at the bottom and bad on top; the plot is 300 px tall. Grouped and horizontal bars are [EXTENSION] with the same marks.

### 7.5 Line / trend charts

**DEOC** the defect-rate trend over the stacked bars: 2 px white line dashed 6 / 5 on its own scale (max × 1.25), 10 px white points at band centres, `data-label` value labels 14 px above each point with a dark text shadow (labels hidden past 16 points). Standalone line and area charts are [EXTENSION]: 2 px solid series lines in category colors, area fills at 16 % opacity.

### 7.6 Donut / pie

**DEOC** "Defect Distribution": 180 px donut, 32 px ring on a `chart-track` circle, segments in `chart-cat-1…4` clockwise from 12 o'clock; legend beside it (rows 20 px apart, 24 px to the values): 24 × 16 swatch (radius 4), label 14/500 `text-tertiary`, value "1,561 (29%)" 14/500 `text-muted` end-aligned. The card is 594 px wide; when the heatmap beside it is tall the legend stacks under the donut (rows 12 px apart). The legend **repeats every value** so the chart never relies on color alone. Hover / focus a segment or legend row to highlight it.

### 7.7 Heatmap

**DEOC** "Defect Rate by Category & Factory": a flush card (`border-subtle` under the title row); header row `surface-table-header` with no divider below, 14/600/24 uppercase `text-muted` labels (−0.4); first column 28 px start padding, 14/600 white labels, `border-divider` at its end; cells filled with the heat color, 14/600 white values; row height `size-heat-row` (40). Hover: `brightness(1.25)`; focus: inset white ring; both show the rich tooltip.

### 7.8 Bubble matrix

**DEOC** "Line - Product Defect Matrix": rows of 88 px (64 px past six rows), line label 14/600 `text-chart-strong` over the factory in 12 px `text-chart-subtle` in a 154 px column, 16 px to the plot, one bubble per product column; bubble **area** encodes volume (diameter 14–54 px) and color the defect rate on the heat scale; no ring; product axis of 11 px 2-line captions 4 px below. Hover / focus: `scale(1.1)` and the rich tooltip. Header: title (`card-title`), subtitle, a status pill and a period select.

### 7.9 Rich chart tooltip

**DEOC** `ChartTooltip`: `gradient-tooltip`, 1 px `border-glass`, radius 9, padding 13, width 314 (342 for long lists), `shadow-tooltip`, 10 px between blocks. Header: 11 px colored marker + bold title (`tooltip-title`) "×" bold second dimension; metrics rows (`tooltip-body`: label `text-tooltip-muted`, value `text-tooltip`); a 1 px `border-tooltip-divider`; a titled list ("Defect Distribution" / "Product Distribution") with values end-aligned.

```css
.ds-chart-tip { position: absolute; z-index: var(--ds-z-tooltip); width: var(--ds-size-tooltip); pointer-events: none;
  display: flex; flex-direction: column; gap: var(--ds-space-2-5); padding: 13px; border-radius: 9px;   /* DEOC ChartTooltip (§11) */
  background: var(--ds-gradient-tooltip); border: 1px solid var(--ds-color-border-glass); box-shadow: var(--ds-shadow-tooltip); }
.ds-chart-tip--wide { width: 342px; }
.ds-chart-tip__head { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-micro); line-height: 13px; }
.ds-chart-tip__head b { font-weight: 700; color: var(--ds-color-text-tooltip); }
.ds-chart-tip__rows { display: flex; flex-direction: column; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-caption); line-height: 12px; }
.ds-chart-tip__row { display: flex; justify-content: space-between; gap: var(--ds-space-3); color: var(--ds-color-text-tooltip-muted); }
.ds-chart-tip__row > :last-child { color: var(--ds-color-text-tooltip); }
.ds-chart-tip__divider { height: 1px; background: var(--ds-color-border-tooltip-divider); }
.ds-chart-tip__dot { width: 11px; height: 11px; border-radius: var(--ds-radius-full); flex-shrink: 0; }
.ds-tip-x, .ds-tip-sub { color: var(--ds-color-text-tooltip-muted); }
.ds-chart-tip__item > :first-child { min-width: 0; color: var(--ds-color-text-tooltip); }
.ds-chart-tip__item > :last-child { color: var(--ds-color-text-tooltip-muted); white-space: nowrap; }
```

### 7.10 Legends

**Swatch** (default): 24 × 16 swatch radius 4, 12 px to a 14/500/22 `text-tertiary` label, items 24 px apart. **Swatch with count**: label `text-tertiary`, count `text-muted`. **Dot** (compact, status cards): 12 px dot, 8 px to a 12/500 `text-tertiary` label, items 20 px apart. Legends sit in the card header at the inline-end (OBSERVED) or beside the chart (donut).

### 7.11 Data labels

`data-label` (16/400 white with `0 1px 3px rgba(0,0,0,0.8)`) on trend points; `bar-segment` numbers inside md segmented bars. Never label every bar when a tooltip carries the value.

### 7.12 Visualization controls

View switches are `accent` segmented tabs (40 px); scoped filters are filter selects (180 px); a chart's status (data freshness) is a tinted badge. Controls sit in the card header, before the legend.

```css
.ds-chart { position: relative; width: 100%; min-width: 0; }
.ds-chart__plotrow { display: flex; gap: var(--ds-space-2-5); }
.ds-axis-y { position: relative; width: 28px; flex-shrink: 0; }
.ds-axis-y span { position: absolute; inset-inline-end: var(--ds-space-2); transform: translateY(50%); font-size: var(--ds-font-size-label); line-height: 24px; letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-axis); font-variant-numeric: tabular-nums; }
.ds-chart__plot { position: relative; flex: 1; min-width: 0; display: flex; align-items: flex-end; border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-chart__band { flex: 1; min-width: 0; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.ds-bands { flex: 1; min-width: 0; }
.ds-bands--scroll { overflow-x: auto; padding-bottom: var(--ds-space-2); }
.ds-bands--scroll:focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
.ds-bands__track { position: relative; display: flex; }
.ds-band { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; }
.ds-band__plot { position: relative; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-band__value { position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: var(--ds-font-size-label); line-height: 16px; letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-primary); font-variant-numeric: tabular-nums; pointer-events: none; }
.ds-band__label { margin-top: var(--ds-space-2-5); min-height: 24px; padding-inline: 2px; text-align: center; font-size: var(--ds-font-size-body); line-height: 20px; letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-primary); overflow-wrap: break-word; display: -webkit-box; flex-shrink: 0; align-self: center; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.ds-band__label--start { align-self: flex-start; text-align: start; }
.ds-band__label--end { align-self: flex-end; text-align: end; }
.ds-bands__overlay { position: absolute; inset-inline: 0; top: 0; pointer-events: none; }
.ds-bar { display: flex; flex-direction: column; width: 60%; max-width: 74px; min-width: 6px; padding: 0; border: 0; background: transparent;
  border-radius: var(--ds-radius-xs) var(--ds-radius-xs) 0 0; overflow: hidden; cursor: pointer; transition: height var(--ds-duration-slow) var(--ds-ease-standard); }
.ds-bar:focus-visible { outline-offset: var(--ds-focus-offset); overflow: visible; }
.ds-bar__seg { flex-basis: 0; min-height: 1px; transition: filter var(--ds-duration-fast); }
.ds-bar:hover .ds-bar__seg { filter: brightness(1.1); }
.ds-bar--single { width: 100%; max-width: none; min-width: 0; flex: 1; }
.ds-bar-group { display: flex; align-items: flex-end; gap: var(--ds-space-1); width: 74%; max-width: 222px; min-width: 6px; height: 100%; }
.ds-axis-x { display: flex; margin-top: var(--ds-space-2-5); margin-inline-start: calc(28px + var(--ds-space-2-5)); }
.ds-axis-x span { flex: 1; min-width: 0; text-align: center; font-size: var(--ds-font-size-body); line-height: 24px; letter-spacing: var(--ds-tracking-tight); color: var(--ds-color-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-axis-x--line { position: relative; height: 24px; }
.ds-axis-x--line span { position: absolute; transform: translateX(-50%); flex: none; }
.ds-trend { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.ds-trend__pt { position: absolute; width: 10px; height: 10px; margin-inline-start: -5px; margin-bottom: -5px; border-radius: var(--ds-radius-full); background: var(--ds-chart-trend); pointer-events: none; }
.ds-trend__label { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: var(--ds-font-size-value); line-height: 22px;
  letter-spacing: var(--ds-tracking-tight); color: var(--ds-color-text-primary); text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
.ds-chart__plot--svg { display: block; }
.ds-chart__plot--svg svg { display: block; overflow: visible; }
.ds-line-hit { position: absolute; top: 0; bottom: 0; background: transparent; border: 0; padding: 0; cursor: crosshair; }
.ds-line-hit:focus-visible { outline-offset: var(--ds-focus-offset-inset); }
.ds-hbar { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.ds-hbar__row { display: grid; grid-template-columns: 154px minmax(0, 1fr); align-items: center; gap: var(--ds-space-3); }
.ds-hbar__label { display: flex; flex-direction: column; min-width: 0; }
.ds-hbar__track { display: grid; align-items: center; column-gap: var(--ds-space-2); min-width: 0; }
.ds-hbar__track > .ds-ts-small-strong { white-space: nowrap; }
.ds-hbar__bar { width: 100%; height: 20px; min-width: 6px; border: 0; padding: 0; border-radius: 0 var(--ds-radius-xs) var(--ds-radius-xs) 0; cursor: pointer;
  transition: width var(--ds-duration-slow) var(--ds-ease-standard), filter var(--ds-duration-fast); }
.ds-hbar__bar:hover { filter: brightness(1.1); }
.ds-hbar--stacked .ds-hbar__row { grid-template-columns: minmax(0, 1fr); gap: var(--ds-space-2); }
.ds-legend { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-6); }
.ds-legend li, .ds-legend__item { display: inline-flex; align-items: center; gap: var(--ds-space-3); font-size: var(--ds-font-size-body); line-height: 22px; font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-legend__mark { width: 24px; height: 16px; border-radius: var(--ds-radius-xs); flex-shrink: 0; }
.ds-legend__value { margin-inline-start: var(--ds-space-3); color: var(--ds-color-text-muted); }
.ds-legend--dot { gap: var(--ds-space-5); }
.ds-legend--dot li { gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: 16px; }
.ds-legend--dot .ds-legend__mark { width: 12px; height: 12px; border-radius: var(--ds-radius-full); }
.ds-legend-dots { display: flex; flex-wrap: wrap; gap: var(--ds-space-5); }
.ds-legend-dot { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: 16px; font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-legend-dot i { width: 12px; height: 12px; border-radius: var(--ds-radius-full); }
.ds-donut { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--ds-space-6); }
.ds-donut__ring { position: relative; width: 180px; height: 180px; flex-shrink: 0; max-width: 100%; }
.ds-donut__ring svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.ds-donut__seg { transition: stroke-dasharray var(--ds-duration-chart) var(--ds-ease-standard), filter var(--ds-duration-fast); cursor: pointer; }
.ds-donut__seg.is-active, .ds-donut__seg:hover { filter: brightness(1.15); }
.ds-donut__center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ds-donut__legend { flex: 1 1 240px; max-width: 320px; display: flex; flex-direction: column; gap: var(--ds-space-5); min-width: 0; }
.ds-donut__row { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: var(--ds-space-6); padding: var(--ds-space-0-5) 0; border-radius: var(--ds-radius-xs);
  font-size: var(--ds-font-size-body); line-height: 22px; font-weight: 500; color: var(--ds-color-text-tertiary); text-align: start; }
.ds-donut__row > span:first-child { display: inline-flex; align-items: center; gap: var(--ds-space-3); white-space: nowrap; }
.ds-donut__row > span:last-child { color: var(--ds-color-text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ds-heatmap-wrap { position: relative; overflow-x: auto; }
.ds-heatmap { display: grid; min-width: 520px; }
.ds-heatmap__row { display: contents; }
.ds-heatmap__head { background: var(--ds-color-surface-table-header); padding: var(--ds-space-2) 0; text-align: center;
  font-size: var(--ds-font-size-body); line-height: 24px; font-weight: 600; letter-spacing: var(--ds-tracking-tight); text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-heatmap__head--first { text-align: start; padding-inline-start: 28px; border-inline-end: 1px solid var(--ds-color-border-divider); }
.ds-heatmap__label { display: flex; align-items: center; min-height: var(--ds-size-heat-row); padding-inline: 28px var(--ds-space-3); border-inline-end: 1px solid var(--ds-color-border-divider);
  font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600; letter-spacing: var(--ds-tracking-tight); color: var(--ds-color-text-primary); }
.ds-heatmap__cellwrap { display: flex; min-height: var(--ds-size-heat-row); }
.ds-heat-cell { flex: 1; border: 0; padding: 0 var(--ds-space-1); font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600; letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-primary); cursor: pointer; font-variant-numeric: tabular-nums; transition: filter var(--ds-duration-fast); }
.ds-heat-cell:hover { filter: brightness(1.25); }
.ds-heat-cell:focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring-on-color); outline-offset: var(--ds-focus-offset-inset); }
.ds-bubble { position: relative; padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-2); overflow-x: auto; }
.ds-bubble__row { display: grid; align-items: center; column-gap: var(--ds-space-4); min-width: 480px; }
.ds-bubble__label { display: flex; flex-direction: column; min-width: 0; }
.ds-bubble__label span:first-child { font-size: var(--ds-font-size-body); line-height: 20px; font-weight: 600; color: var(--ds-color-text-chart-strong); }
.ds-bubble__label span:last-child { font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-chart-subtle); }
.ds-bubble__cell { display: flex; align-items: center; justify-content: center; }
.ds-bubble__dot { border: 0; padding: 0; border-radius: var(--ds-radius-full); cursor: pointer; transition: transform var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-bubble__dot:hover { transform: scale(1.1); }
.ds-bubble__axis { height: auto; padding-top: var(--ds-space-1); }
.ds-bubble__axis span { text-align: center; padding: 0 var(--ds-space-1); font-size: var(--ds-font-size-micro); line-height: 14px; color: var(--ds-color-text-chart-subtle); }
.ds-chart-data { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-3); }
.ds-chart-data > div { width: 100%; }
@media (prefers-reduced-motion: reduce) { .ds-bar, .ds-hbar__bar, .ds-donut__seg, .ds-segbar__seg, .ds-progress > span, .ds-live__dot { transition: none; animation: none; } }
```

#### Chart library primitives

The chart library (64 chart types, `src/charts/library`) draws SVG with these classes; every color is a §3 token.

```css
.cl-svg { position: relative; width: 100%; min-width: 0; }
.cl-svg svg { display: block; overflow: visible; }
.cl-tick { font-size: var(--ds-font-size-label); letter-spacing: var(--ds-tracking-tight); fill: var(--ds-color-text-axis); font-variant-numeric: tabular-nums; }
.cl-xlabel { font-size: var(--ds-font-size-body); letter-spacing: var(--ds-tracking-tight); fill: var(--ds-color-text-primary); }
.cl-axis-title { font-size: var(--ds-font-size-micro); fill: var(--ds-color-text-chart-subtle); }
.cl-row-label, .cl-node-label { font-size: var(--ds-font-size-body); font-weight: 600; fill: var(--ds-color-text-primary); }
.cl-node-value { font-size: var(--ds-font-size-label); fill: var(--ds-color-text-muted); }
.cl-baseline { stroke: var(--ds-chart-baseline); stroke-width: 1; }
.cl-axisline { stroke: var(--ds-chart-axis); stroke-width: 1; }
.cl-gridline { stroke: var(--ds-chart-baseline); stroke-width: 1; }
.cl-ref { stroke: var(--ds-color-text-axis); stroke-width: 1; stroke-dasharray: 4 4; opacity: 0.6; }
.cl-ref--limit { stroke: var(--ds-color-warning-text); opacity: 1; }
.cl-ref-label { font-size: var(--ds-font-size-micro); fill: var(--ds-color-text-muted); }
.cl-mark { cursor: pointer; outline: none; }
.cl-mark:focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
.cl-hit { fill: transparent; cursor: crosshair; outline: none; }
.cl-hit:focus-visible { stroke: var(--ds-color-focus-ring); stroke-width: var(--ds-focus-width); }
.cl-ribbon:hover, .cl-ribbon:focus-visible { stroke-opacity: 0.6; }
.cl-region { stroke: var(--ds-color-surface-base); stroke-width: 1.5; }
.cl-region:hover, .cl-region:focus-visible { stroke: var(--ds-color-text-primary); }
.cl-map { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-4); }
.cl-map__svg { width: 100%; max-width: 300px; height: auto; display: block; }
.cl-seq-legend { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: 16px; color: var(--ds-color-text-muted); flex-wrap: wrap; }
.cl-seq-legend__ramp { display: inline-flex; gap: 2px; }
.cl-seq-legend i { display: inline-block; width: 20px; height: 12px; border-radius: 2px; }
.cl-seq-legend__nd { display: inline-flex; align-items: center; gap: var(--ds-space-2); margin-inline-start: var(--ds-space-3); }
.cl-seq-legend__nd i { width: 12px; background: var(--ds-chart-track); }
.cl-controls { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-3); }
.cl-grid { display: grid; gap: var(--ds-space-5); grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 1fr)); align-items: start; }
.cl-grid--640 { grid-template-columns: repeat(auto-fill, 640px); max-width: 100%; }
.cl-grid--360 { grid-template-columns: repeat(auto-fill, 360px); }
.cl-grid--640 > *, .cl-grid--360 > * { min-width: 0; max-width: 100%; }
.cl-card-wrap { display: flex; flex-direction: column; gap: var(--ds-space-2); min-width: 0; }
.cl-card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-2); }
.cl-stub { display: flex; flex-direction: column; gap: var(--ds-space-2); align-items: flex-start; }
.cl-inlabel { font-size: var(--ds-font-size-label); font-weight: 500; letter-spacing: -0.2px; fill: var(--ds-color-text-primary); pointer-events: none; }
.cl-center-value { font-size: var(--ds-font-size-heading); font-weight: 600; letter-spacing: var(--ds-tracking-tight); fill: var(--ds-color-text-primary); font-variant-numeric: tabular-nums; }
.cl-center-value--lg { font-size: 32px; }
```

---

## 8. Responsive rules

### 8.1 Breakpoints [PRESERVED]

| Name | Range | Shell |
|---|---|---|
| `xs` | < 640 | top bar + drawer; single column; tables scroll |
| `sm` | 640–1023 | top bar + drawer; 2-column grids |
| `md` | 1024–1279 | sidebar; KPI rows become grids; dashboard pairs stack |
| `lg` | 1280–1599 | full layout |
| `xl` | ≥ 1600 | full layout (the screens are drawn at 1920) |

### 8.2 Shell

At ≥ 1024 the sidebar is visible (expanded by default, collapsible). Below 1024 the shell loses its padding and radii, a 56 px top bar (logo, page title, menu button) appears, and the sidebar opens as a start-edge drawer (`shadow-drawer-mirrored`, 256 px, scrim).

### 8.3 Page header

Actions wrap below the title when they no longer fit; the search shrinks before wrapping; the primary action stays last.

### 8.4 Grids

KPI rows → auto-fill (min 260); entity grid min 400 → 1 column at `xs`; camera grid 2 × 2 → 1 column below 1024; the monitoring side panel moves below the grid below 1280; forms → one column below 1024.

### 8.5 Tables

Tables keep their columns and scroll horizontally inside their card; pagination switches to "Page n of m" at `xs`.

### 8.6 Overlays

Slide panels are `min(size, 100%)` wide; modals are `min(720, 100% − 32)` with an internal scroll; below 1024 overlays cover the viewport.

### 8.7 Text wrapping & truncation

As §2.3: titles wrap, identifiers truncate with recovery, nothing meaningful is clipped.

### 8.8 Touch targets

Every target is ≥ 24 × 24 px (SC 2.5.8); at `xs` and `sm`, icon buttons grow to 40 px hit areas.

### 8.9 Internationalization & right-to-left

Layout uses logical properties (`inline-start/end`), directional icons flip, numbers stay LTR, tooltips and drawers mirror.

---

## 9. Accessibility rules (WCAG 2.2 AA)

### 9.1 Text contrast

Measured on composited surfaces (app gradient + panel glass + card glass, lightest point `#0f172a`):

| Text token | On panel | On card | On well | Status |
|---|---|---|---|---|
| `text-primary` | 16.21 | 14.89 | 13.69 | AA |
| `text-secondary` | 10.9 | 10.0 | 9.2 | AA |
| `text-muted` | 6.32 | 5.81 | 5.34 | AA |
| `text-tertiary` (`#8a99ae`) | 5.59 | 5.14 | 4.72 | AA (Figma `#64748b`: 3.13–3.41, fails → R-03) |
| `link` | 6.37 | 5.86 | 5.38 | AA (`#3b82f6`: 4.05 on card, fails → R-08) |
| `danger-text` on `danger-bg` | 5.28 | 4.87 | 4.50 | AA (`#ff5825`: 4.25, fails → R-04) |
| `success-text` on `success-bg` | — | 6.59 | — | AA |
| `warning-text` on `warning-bg` | — | 7.23 | — | AA |
| placeholder (60 %) | 4.57 | — | — | AA (50 %: 3.64, fails → R-07) |
| white on tags | purple 8.36 · blue 4.84 · green 4.90 · amber 4.81 | | | AA (Figma green 3.34 / amber 4.39 fail → R-06) |
| white on `brand-strong` | 5.17 | | | AA |

The live QA page recomputes these against the rendered page.

### 9.2 Non-text contrast (SC 1.4.11)

Focus ring ≥ 4.05:1 everywhere. Status dots carry a label. Glass control edges (2–7 % white) are **below 3:1 by design** — controls are identified by their fill, shadow, position and labels (SC 1.4.11 does not require a visible boundary when the control is identifiable); boundary mode (§9.3) adds 3:1 edges. Icons meet 3:1 on panels and cards.

### 9.3 Increased-contrast mode

`prefers-contrast: more` or `data-contrast="more"` adds a 1 px `border-control-strong` (3:1) edge to fields, triggers, tabs, toggles, radio cards, secondary/subtle/ghost buttons, dropzones and the current nav item.

### 9.4 Status, color and meaning

Every status shows a text label; charts repeat values in legends, tooltips and data tables; heat cells print their value.

### 9.5 Keyboard

Everything reachable and operable by keyboard in a logical order; skip link to the main content; no keyboard traps except intentional dialog traps with Escape.

### 9.6 Semantics, truncation, motion

Landmarks (`nav`, `main`, `header`); one `h1` per page; tables with headers and captions; reduced motion honoured; truncated text recoverable.

### 9.7 Target size (SC 2.5.8)

Minimum 24 × 24 for every target (row actions are 32 × 32).

### 9.8 Accessibility issue register

| ID | Issue | Resolution |
|---|---|---|
| A-1 | Figma tertiary text fails AA | Lifted to `#8a99ae` (R-03) |
| A-2 | Figma error text on tint fails AA | `danger-text` `#ff7043` (R-04) |
| A-3 | Figma 50 % placeholder fails AA | 60 % (R-07) |
| A-4 | Figma green / amber tags fail AA | Darkened (R-06) |
| A-5 | Figma dims upcoming steps to 40–50 % | Only the index is dimmed (R-10) |
| A-6 | Glass control edges below 3:1 | Accepted with boundary mode (§9.3) |

---

## 10. Implementation rules

### 10.1 Mandatory rules

1. Use tokens for every color, gradient, shadow, radius, spacing, size and type value. Never hardcode a value in a component.
2. No isolated visual decisions: reuse an existing token or variant; if none fits, add a token or a documented variant here first.
3. Preserve geometry: control heights, paddings and radii come from §2.
4. Restraint: gradients and glows only where §2.7 allows them; no backdrop blur on structural surfaces.
5. Semantic consistency: a status always uses the same tone, dot and label style.
6. Component-first: never rebuild a card, button, input or badge with ad-hoc CSS.
7. No undocumented exceptions: every deviation is a variant or a logged exception (§11).
8. Accessibility rules in §9 override visual fidelity.
9. Overlays never close on a backdrop click.
10. The system is dark-only.

### 10.2 Decision hierarchy

Accessibility → this specification → the eight Figma screens → the previous DEOC system → product convention.

### 10.3 Defaults and when to deviate

Use the defaults in §6. Deviate only when content length, data volume or a workflow requires it, and only with existing components and tokens.

---

## 11. Inconsistency resolution log

| ID | Finding in the Figma screens | Resolution |
|---|---|---|
| R-01 | Typography larger than the previous scale (28 px titles and KPI values, 24 px card titles, 14 px KPI labels and table headers) | Hybrid rule (D-0): 24 and 14 are existing steps → adopted; 28 added as the named `display` exception (D-1) |
| R-02 | Off-scale text sizes: 13 px health labels, 22 px matrix title, 18 px barcode values with +0.5 tracking | 13 → 14; 22 → 24 (`card-title`); 18 kept (existing step) with the identifier tracking +0.55 |
| R-03 | Tertiary text `#64748b` fails AA on every surface | `text-tertiary` `#8a99ae`; `#64748b` kept for icons |
| R-04 | `#ff5825` text on its 10 % tint is 4.25:1 | Text uses `danger-text` `#ff7043`; dots, glows, bars and frames keep `#ff5825` |
| R-05 | Two reds: required asterisk `#fb7185`, status error `#ff5825` | Kept separate on purpose: `error` (form validation) vs `danger` (system state) |
| R-29 | **D-10 (2026-10-24):** this system and the DEOC app (Design System 02) disagreed on structure and composition: 24 px gutters vs 16, 72 px rows vs 44, 28 px KPI values vs 20, 14 px KPI labels and table headers vs 12, glowing badge dots, a sheen on slide panels, bordered menus, etc. | DEOC is final. Every component now renders DEOC's computed styles; `npm run check:deoc` compares 160+ component pairs on DEOC's real pages. R-01 (28 px `display`), R-02 (18 px barcode values), R-08 (link-coloured link actions), R-10 (only the upcoming index dimmed) and R-11 are superseded |
| R-30 | DEOC uses a few values off the 2 px grid: 25 px entity/status-card padding (24 + the 1 px inset edge), 13 px chart-tooltip padding and 9 px radius, 5 px toggle-track padding, 3 × 13 px count-pill padding, 3 × 9 px info-chip padding, 15 px media-header bottom padding, 32 px viewer radius | Adopted as-is (`--ds-space-card-entity`, `--ds-radius-viewer`, literals marked in the CSS) so the two products are pixel-identical |
| R-31 | DEOC inconsistencies: factory-detail pagination (radius 8, 400 weight) differs from the shared `Pagination` (radius 6, 500); the Factories KPI row is 20 px apart, every other KPI row 16; single-select menus are radius 12, multi-select menus and pickers 8 | The shared component wins (radius 6 / 500, 16 px KPI gaps); menu radii follow DEOC per menu type |
| R-06 | Role tags green `#569d3f` and amber `#9d6f3f` fail AA with white text | `#457e32` and `#95693c` |
| R-07 | Placeholder at 50 % fails AA | 60 % |
| R-08 | `#3b82f6` used as small text ("Factory Admin", "Add New User") | `link` `#60a5fa` |
| R-09 | 12–24 px background blur on glass panels | Omitted (indistinguishable over the gradient; breaks fixed popups; costly) |
| R-10 | Upcoming steps at 40 % and 50 % opacity (inconsistent, and fails AA) | Index at 50 %, text at full opacity in muted colors |
| R-11 | Nested line groups at radius 24 inside 16 px sections | 16 (`radius-nested`) |
| R-12 | Overlays cover the sidebar in the screens; the previous system contained them in the main panel | Follow the screens: the scrim covers the shell |
| R-13 | Donut segments use `#016ffe / #8b34fd / #fbb645 / #00bac9` but the legend swatches use `#3b82f6 / #4d3f9d / #9d6f3f / #3f779d`; two legend rows say "Primary - Front"; percentages total 147 % | Segments and swatches both use `chart-cat-1…4`; demo data uses distinct labels and percentages that sum to 100 % |
| R-14 | Status pills appear tinted (component default) and glass (instance override) | Both kept as documented appearances; tone and label never change |
| R-15 | Product Master list (frame 8 background) and the Add Factory step-2 drawer header (frame 5) still use the previous style (`#1d2328` cards, sunken `#161a1e` inputs, `#15191c` header) | Treated as not yet migrated; rendered with the new tokens |
| R-16 | Camera tile 4 has a 1 px white/6 % border and a different shadow; tiles 1–3 have none | All tiles use the entity-card surface: `shadow-glass` + `shadow-edge` (revised 2026-10-21, R-28) |
| R-17 | Collapsible headers padded 32 px (Factory 1) and 24 px (Factories 2–4) | 24 |
| R-18 | Table cards: `shadow-float` (frame 6) vs `shadow-glass-soft` (frame 4 sections) | Table card = float; collapsible section = glass-soft |
| R-19 | Status-option labels `#8e9296` and dropzone hints `#8e9296` (a neutral grey outside the slate ramp) | `text-muted` |
| R-20 | Secondary button label `#d1d5db` (subtle) vs `#e2e8f0` (secondary) | Both `text-emphasis` |
| R-21 | Heat cells: white text on orange (2.9–3.9:1) | White up to 0.55, `text-on-bright` from 0.59, fills between snap to the nearer edge (§7.7) |
| R-22 | Sidebar nav lists "Lines" in frames 5 and 8 only | Product decision: rendered as in each frame |
| R-23 | Stepper completed subtitle in `#10b981` vs success text `#34d399` elsewhere | `success-text` |
| R-24 | Analytics table headers use -0.4 px tracking on uppercase text | +0.3 (uppercase rule, §2.3) |
| R-25 | Heat cells with equal values (e.g. Lotus 10 % in all four columns) are painted different colours, so colour does not encode the value | Colour is a pure function of the value on the `--ds-heat-0…4` scale; equal values get equal colours |
| R-26 | "Bad Products" equals "Products An." in every Line Wise Defects row, contradicting the defect % columns | Bad = analysed × total defect %, so the table is internally consistent (demo data only) |
| R-27 | The Add Product drawer labels its first section "User Details" (copied from the user form) | Kept as drawn; flagged for the designer |
| R-28 | Card borders were described in the prose (white/2–5 %) but missing from the CSS; dashboard and camera cards used a different surface (`shadow-card` / `shadow-float` with a top highlight) from the factory cards; the table-card inner shadow had spread 0 instead of Figma's 1 | Edge tokens (§2.7) on every card and panel; dashboard, status and camera cards share the entity-card surface; status cards use the entity layout with the table in a well; one border colour (D-8) |

---

## 12. Worked examples (the eight screens)

Each screen is implemented in the showcase under **Application Examples** using only §5 components and §3 tokens.

### 12.1 Live View (459:11379)

Shell → header (camera illustration, "Dove Nourishing Bodywash 825 ml", Live pill; factory and line filter selects; "Line Changeover" primary with the changeover glyph) → monitoring view: 2 × 2 media cards (Matched / Error pills, detection frame on camera 4, "Detected : …" footers) + side panel (summary strip, reference barcodes field list, system health rows).

### 12.2 Factories (452:10239)

Header (search 288, status filter, "Add factory") → 4 KPI cards → "Active Operational Units • 6" section title → 3-column entity-card grid (Active, Warning, Offline).

### 12.3 Add New Factory (489:11729)

Factories page under the scrim → xl slide panel: stepper (Basic Details current), fields (name; location + region select), rich picker open with three people and "+ Add User", footer (Back, autosave note, "Next: Configuration").

### 12.4 Cameras (491:12471)

Header (search, two filters, "Add camera") → collapsible sections per factory; Factory 1 open with Line 1 (open, table of two cameras with edit / delete) and Line 2 (collapsed), each with "Add Camera to Line".

### 12.5 Add Cameras (491:13200)

Add Factory panel (step 2 current, step 1 completed) under a second scrim → modal "Add Cameras": eight caps-label fields in two columns (two selects), Skip + Add Camera.

### 12.6 User Management (491:14493)

Header (search 350, factory and status filters, "Add user") → role tabs with counts + Export → table card (role tags, glass status pills, copy / edit / delete) with pagination.

### 12.7 Analytics (496:16402)

Header (search, period, factory and line filters) → 6 KPI cards → Quality Snapshot (stacked bars + trend, legend, select, sm tabs) → defect matrix (bubbles + tooltip) → donut + heatmap (with tooltip) → line-wise table (sm tabs) → three status cards.

### 12.8 Add Product (495:15510)

Product Master list under the scrim → xl slide panel: section "User Details", name + status toggle, three barcode fields, two dropzones, notes, footer (Cancel, "Save product").

---

## 13. Final QA checklist

- Every component renders exactly like the DEOC app in Design System 02 (`npm run check:deoc`, needs DEOC's dev server on `DEOC_URL`, default `http://localhost:8443/`).
- Every `var(--ds-*)` resolves to a §3 token; no color literals outside the generated CSS (`npm run check:tokens`).
- Every route renders without console errors, horizontal overflow (390 / 768 / 1024 / 1440 / 1680) or axe violations (`npm run check:browser`).
- Scripted behaviors pass (`npm run check:interactions`): selects, multi-select, rich picker, tabs, pagination, collapsibles, modal and drawer focus/Escape/backdrop rules, toasts, tooltips, chart tooltips, form validation.
- Text contrast on composited surfaces meets §9.1.
- The eight application examples match their frames at 1920 × 1021 (layout, hierarchy, padding, colors, effects).

---

## 14. Changelog

### Revision 4 — 2026-10-24

Matched to the DEOC app's default Design System 02, which is final (D-10). Colours, gradients and shadows were already shared tokens; this revision aligns everything else.

- **Type:** scale is 10/11/12/14/16/20/24 (`subheading` 18 and `display` 28 removed). KPI value 20/28, KPI label 12, card titles 20, table headers 12/600, secondary cells 400, form labels `text-muted`, input values `text-primary`, tabs and badges 20 px line height, barcode values 16/22 +0.5.
- **Spacing and sizes:** page gutter 16, shell gap 20, KPI padding 16 (icon 40, card 76 px), side-panel cards 20, entity and status cards 25, cells 12 × 16 (rows 44, header 40), section header 60 with 16 px padding, sections 12 apart, toggle and tab tracks 5 px padding, accent tabs 40 px.
- **Composition:** fields and field selects draw their edge as `shadow-edge` (no border) and focus with a 1 px ring; buttons are padding-based (42 px bordered, 40 px borderless) with a new `section` variant; menus, pickers and popovers lose their border; selected options use `surface-hover` with no check; badge dots glow only on glass error pills; the Live pill does not pulse; slide panels lose the sheen; confirm dialogs gain radius 16 and a border; close buttons are sunken; page buttons radius 6; pagination 12 × 16 padding; table headers lose their divider; the logout icon is muted; photo avatars lose the orb glow, brand avatars gain `shadow-avatar`.
- **Charts:** donut 180 px with a 32 px ring, bars 60 % of the band, trend 2 px dashed 6 / 5, no y-axis line, `border-subtle` baselines, bubbles 14–54 px with no ring, heat cells always white text with a brightness hover, status cards use a dot legend, a 20 px bar with counts and an edge-to-edge table.
- **Tokens added:** `--ds-space-card-entity`, `--ds-size-avatar-md`, `--ds-radius-viewer`, `--ds-shadow-xs`, `--ds-shadow-avatar`, `--ds-focus-width-field`, `--ds-tracking-field`. DEOC mirrors visual tokens: run `npm run ds:sync` in DEOC after this change.

### Revision 3 — 2026-10-21

Synced to the DEOC app's final screens (D-9).

- Toggles: segmented tabs (raised, sm, accent) and the binary status toggle share one track, `gradient-toggle` with a 1 px `border-subtle` and no shadow; the selected option is `gradient-toggle-active`. Accent tabs drop the `surface-sunken-button` track and `brand-strong` pill; status options drop their own borders.
- Sticky table headers use `gradient-table-header-pinned`, so a pinned header reads like the see-through 2 % header on glass.
- Slide-panel footer gains `shadow-footer-scrolled` while more content sits below.
- Page title is 24/32 (`title`); `display` 28 px is left to KPI values.
- Entity-card icons sit without a tile (`surface-entity-icon` unused).

### Revision 2 — 2026-10-21

Card edges and shadows re-checked against Figma (452:10239 Factories, 438:8449 camera tile, 155:6597 table card, 491:12558 section).

- Added `border-edge` (white/2 %, the KPI card) as the one hairline border colour; `border-hairline / -glass / -track / -faint / -subtle / -control` alias it (D-8). Added `shadow-edge` / `shadow-edge-bottom`; every card, panel and the page header now draws its border (R-28).
- Added `shadow-kpi-lift` (the KPI ":shadow" layer), `shadow-float-drop` (`shadow-float` = drop + `shadow-edge`) and `shadow-surface`, the one content-card surface (`shadow-glass` + `shadow-edge`).
- Dashboard, status and camera cards use the entity-card surface; status cards use the entity layout with the table in a well; camera tiles drop the glass header/footer tint and the top highlight (R-16, R-28).
- Card-header dividers (section, table card, camera tile) use `border-edge`.
- The filter-select gradient stroke is a solid `border-edge` stroke.

### Revision 1 — 2026-10-15

Initial specification of the Vision Automation system: visual foundations reconstructed from the eight DEOC Figma screens; structure, behavior and accessibility carried over from the previous DEOC system under the hybrid rule.

---

## 15. Open decisions & known gaps

### 15.1 Decisions requiring designer approval

| ID | Decision | Recommendation | Reference |
|---|---|---|---|
| D-0 | Hybrid rule for conflicts between the previous scales and the Figma screens | Approved by the product owner (2026-10-15) | §0.4 |
| D-1 | Add `display` 28 px for page titles and KPI values | Keep for KPI values; page titles moved to 24 px `title` (D-9) | §2.3 |
| D-2 | Tertiary text `#8a99ae` instead of `#64748b` | Adopt in Figma | R-03 |
| D-3 | Separate `danger-text` `#ff7043` for status text | Adopt in Figma | R-04 |
| D-4 | Darker green / amber role tags | Adopt in Figma | R-06 |
| D-5 | No backdrop blur on glass panels | Remove from Figma layers too | R-09 |
| D-6 | Donut palette and legend mismatch | Use `chart-cat-1…4` for both | R-13 |
| D-7 | Hover / focus / error / selected states are not drawn in the screens | Approve the INFERRED states (§15.2) | §5 |
| D-8 | One hairline border colour, `border-edge` = white/2 % (the KPI card), instead of Figma's white/2–7 % | Approved by the product owner (2026-10-21) | §2.2, §2.7 |
| D-9 | The DEOC app is final: gradient toggle track and selected option, tinted pinned table header, panel footer shadow, 24 px page title, entity icon without a tile | Approved by the product owner (2026-10-21) | §2.1, §2.3, §5.14, §5.24, §5.38, §5.39, §5.41, §5.46 |

### 15.2 Known issues by category

- **Inferred values**: all hover, focus, pressed, error and selected states; the opaque sticky-header tint (`gradient-table-header-pinned`); menu shadow (`shadow-float`); modal shadow (taken from another layer in the file); primary hover gradient; status-toggle selected state.
- **Missing Figma assets**: the three System Health glyphs (one export returned 404, two were empty groups) → Lucide fallbacks (`workflow`, `cctv`, `cpu`); no separate frame-3 ("devices") crop of the facility sprite is used in the screens.
- **Not in the screens** (extensions): checkbox, switch, date-range popover, toast, empty, loading, confirm dialog, line/area/horizontal/grouped charts, breadcrumbs.
- **Data**: sample values follow the screens' labels and are internally consistent (R-13, R-26), except two counts kept exactly as drawn: Factory 1's camera count pill (12) and Product Master's total (126 products over a 24-row list). The screens' analytical numbers are not reproduced where they contradict each other.

### 15.3 Confirmed accessibility limitations

Glass control edges are below 3:1 by default (boundary mode available). Screen-reader testing was not performed; automated axe checks and scripted keyboard checks were.

### 15.4 Validation report

See `QA_REPORT.md` for the results of `npm run qa` and the visual comparison against the eight frames.

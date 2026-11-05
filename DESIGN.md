# DESIGN.md: Vision Automation Design System 02 (DS-02)

The complete, self-contained guide for building an application in DS-02, or for moving an existing application onto it. **This one file is enough.** It holds the rules, the failures of earlier ports and how to avoid them, every token and component with its actual values, the page patterns, a check you can run inside your own repo, and (Appendix A) the two stylesheets that implement all of it.

> Matches spec revision 8 (2026-11-05). The source of truth is `spec/DESIGN_SYSTEM.md` in the Design-System-02 repo; Part C and Appendix A are generated from, or checked against, it. If you have that repo, its showcase (`npm run dev`) shows every component live.

**If you are an AI agent or a developer about to start:** read Part A and Part B completely before writing code. Then follow Part D step by step. Part C is the reference you look values up in; you do not type its values into CSS (rule 1).

---

## Contents

**Part A: Read first**
- [A1. The gate: do this before anything else](#a1-the-gate-do-this-before-anything-else)
- [A2. The rules](#a2-the-rules)
- [A3. What it should look like](#a3-what-it-should-look-like)

**Part B: Why earlier ports failed**
- [B1. Sightshark, first port](#b1-sightshark-first-port)
- [B2. Sightshark, second port: what still went wrong](#b2-sightshark-second-port-what-still-went-wrong)
- [B3. HUL Sarthi](#b3-hul-sarthi)
- [B4. What was wrong with the previous DESIGN.md](#b4-what-was-wrong-with-the-previous-designmd)

**Part C: Specification**
- [C1. Design language](#c1-design-language)
- [C2. Foundations and tokens](#c2-foundations-and-tokens)
- [C3. Components](#c3-components)
- [C4. Page layouts, charts, responsive, accessibility](#c4-page-layouts-charts-responsive-accessibility)

**Part D: Adoption procedure**
- [D1. Install](#d1-install)
- [D2. Delete the old system](#d2-delete-the-old-system)
- [D3. Tailwind](#d3-tailwind)
- [D4. Themes](#d4-themes)
- [D5. Typography: choosing a text style](#d5-typography-choosing-a-text-style)
- [D6. Surfaces: choosing a card](#d6-surfaces-choosing-a-card)
- [D7. Component replacement map](#d7-component-replacement-map)
- [D8. Page rules](#d8-page-rules)
- [D9. Spacing and sizing](#d9-spacing-and-sizing)
- [D10. Icons and imagery](#d10-icons-and-imagery)
- [D11. Verification](#d11-verification)
- [D12. Migration order](#d12-migration-order)
- [D13. Brief for whoever does the work](#d13-brief-for-whoever-does-the-work)
- [D14. Keeping the app in sync](#d14-keeping-the-app-in-sync)

**Appendix A:** `ds.css` and `text-styles.css`, verbatim

---

# Part A: Read first

## A1. The gate: do this before anything else

DS-02 is **two stylesheets plus markup that uses their classes**. Every surface, border, gradient, shadow, radius and type size comes from those stylesheets. Nothing visual is written by hand in the app.

1. **Extract the stylesheets** from Appendix A of this file into the app (exact command in [D1](#d1-install)). Don't retype them, don't edit them, and don't "adapt" them to the app.
2. **Confirm they loaded:** in the browser, `getComputedStyle(document.body).backgroundImage` must contain `linear-gradient`, and `getComputedStyle(document.documentElement).getPropertyValue('--ds-gradient-glass')` must be non-empty.
3. **If you can't do 1 and 2, stop.** Don't fall back to recreating tokens from Part C, and don't recolour the existing UI. That is exactly how both earlier failures happened (Part B).

## A2. The rules

1. **Copy, don't transcribe.** The app uses Appendix A's `ds.css` and `text-styles.css` byte for byte. Never retype a token or a component rule, and never edit the copies.
2. **Replace, never merge, and never remap.** Delete the app's previous tokens, theme files, component CSS and Tailwind palette (D2). Never write CSS that targets an old utility class to make it look like DS-02 (`.dark .bg-white {…}`, `.border-gray-200 {…}`). That keeps the old markup and produces a third, accidental design.
3. **Same name ≠ same design.** Many class and token names (`--ds-radius-card`, `.ds-tabs`, "§5.39") also existed in older systems, and a comment that says "Design-System-02" proves nothing. Judge by the stylesheet in use and the rendered screen.
4. **Markup comes from components.** If Part C has a component for the job, render its markup (or the React component). Never rebuild a card, button, tab, input, badge, table or modal from Tailwind utilities.
5. **Type comes only from text styles.** Every piece of text you place gets one `.ds-ts-*` class (D5), or sits inside a component that sets it. No `text-sm`, `font-semibold`, `font-size: 13px`.
6. **Colour, border, radius, shadow and gradient come only from DS classes.** No hex, `rgb()`, Tailwind palette (`bg-white`, `border-gray-200`, `text-slate-400`), `shadow-*`, `rounded-xl`, `bg-gradient-to-*` or inline `linear-gradient`.
7. **No lines between things.** Cards have no CSS `border`. Their edge is a white/2 % inset hairline that `ds.css` draws, which you can barely see. Space separates groups; dividers appear only inside a component (a table's rows, a header strip). If you can clearly see a line around a card, it's wrong.
8. **Spacing and sizes come from the scale.** Gaps, paddings and heights use the spacing scale and size tokens (directly or through the D3 preset). Never fix a pixel width to make things line up.
9. **One look per role.** A status always uses the same badge variant everywhere in the app. The same goes for a page title, a primary action and a card type. Don't vary `size`/`appearance` props by screen (B2).
10. **Missing something? Change the spec, not the app.** If no component or token fits, stop and propose an addition to `spec/DESIGN_SYSTEM.md` (D14). Don't invent a value locally.
11. **Accessibility contracts are part of each component.** Keyboard, focus and ARIA behaviour (C4) are required, not polish.
12. **Done means the D11 checks pass and the screen looks like A3.**

## A3. What it should look like

Use this to judge a screen at a glance, before any tooling.

| Right | Wrong (seen in earlier ports) |
|---|---|
| Page: a deep navy horizontal gradient (`#0b1020 → #0f172a → #020617`) with a faint blue glow top-left and a faint green glow bottom-right | Flat grey (`#15191c`) or flat navy, no glows |
| Cards: translucent glass, barely lighter than the page, soft dark drop shadow, **edge almost invisible** | Cards outlined by a visible 1 px grey or white line |
| Card fill: the same faint glass gradient on every card | Pastel tints (pink, orange, green, blue) fading to white, or multiplied into muddy dark blocks |
| Nested areas inside a card: a faint blue well (`rgba(172,195,255,0.04)`), no border | Bordered inner boxes, `bg-gray-50` panels |
| One accent: blue. Primary button is a top-lit blue gradient with a soft blue glow | Several brand blues, flat `bg-blue-600` buttons |
| Status: a pill with a glowing dot and a label; same variant everywhere | Badges of different sizes and styles for the same status |
| Type: Inter, 24 px page titles, 20 px card titles and KPI values, 14 px body | 13/15/18/28 px text, mixed weights |
| Controls 40 px high, table rows 44 px, 16 px gutters | Ad hoc heights and paddings |
| Overlays (modal, drawer, menu, tooltip) are the only opaque surfaces | Opaque cards, translucent menus |

---

# Part B: Why earlier ports failed

Each port shipped something that *claimed* DS-02 and didn't look like it. Every row below is a rule in Part A or a check in D11, because each of these went unnoticed until someone looked at the screen.

## B1. Sightshark, first port

| Trap | What happened | Prevented by |
|---|---|---|
| Hand-written token layer | 292 `--ds-*` tokens retyped into `index.html`, all carrying the *previous* system's grey values (`#15191c` app, `#1d2328` cards, 20 px card radius, an 18 px type step). None of DS-02's gradients existed. | A1, rule 1 |
| Same names, old component CSS | `.ds-tabs` was the old sunken track with a raised grey pill; DS-02's tabs are a glass toggle track with a blue-washed selection. Same class, different component. | rules 1, 3 |
| Tailwind remapped instead of markup migrated | The Tailwind config redefined `slate`/`gray`/`red` as old grey tints and `text-xs` as 12 px. About 1,900 type utilities and 3,500 palette utilities kept rendering, so nothing looked broken, but no card title became 20 px and no surface became glass. | rule 2, D3 |
| Generic card kept | One `Card` (`glass-card`) for everything. DS-02 has distinct card types with different padding and title styles. | rule 4, D6 |
| No check | Nothing compared the app with the system. | D11 |

## B2. Sightshark, second port: what still went wrong

The second port copied `ds.css` and the components, and passed the automated check. These issues were still found by eye, screen by screen:

| Issue | Cause | Rule now |
|---|---|---|
| Status tags looked different on each screen | Every screen used the DS `Badge`, but with different `size` and `appearance` props (glass `md` on overview cards, tinted `sm` in rows, `md` in a wizard). | Rule 9: one variant per role. Status tags are `Badge size="sm"` (tinted) everywhere; `appearance="glass"` only on top of images or video. |
| Filter labels cut off ("Has Camera: An…") | A row count ("21 of 21 assets") sat in the filter toolbar and took its width. | Counts go in the table footer: "Showing 1 – 12 of 21 assets (filtered from N)". Never in the toolbar (D8). |
| Rows misaligned | Fixed widths (`w-[66px]`) around badges and labels. | Rule 8; put the variable part at the row's end (D9). |
| Layout changed between builds | Tailwind layout utilities on the same element as a DS class that sets layout (`ds-menu__option flex-col`). | D3: wrap inside instead. |
| In-page "← Back" links and breadcrumbs | Sub-pages invented their own navigation. | D8: sub-pages show "‹ Parent / Title" in the top header. |
| Large unreachable code restyled | Effort spent on files not imported from the entry point. | D12 step 0: list dead files first; ask the owner. |
| Forms converted to slide panels against product intent | The guide's default overrode a product decision. | D8: product decisions recorded in the spec win; Polaris keeps full-page centred forms. |
| Gaps reported by implementers, not in the spec | Monospace / identifier text, more than four categorical chart colours, a danger-zone card, a selected list-row state, a warning inline text style. | Rule 10. Still open: raise them as spec additions before using. |

## B3. HUL Sarthi

HUL received **only the previous DESIGN.md**: no stylesheets, no components, no spec, no check script. The guide said "this guide does not repeat values; see the spec", so there were no values to use. Measured with the adoption check: `ds.css` and `text-styles.css` missing, 65 token definitions outside `ds.css`, 7,915 colour literals, 5,898 palette utilities, 1,929 type-size utilities. What was built instead:

| What was done | Result on screen | Prevented by |
|---|---|---|
| 58 `--ds-*` tokens hand-written in `dark.css`, 7 more in `index.css`, with guessed values (`radius-control: 12px`, `border-subtle` = white/2 % in one file and `#edf2f8` in the other) | Near-DS colours, wrong radii and edges | A1, rule 1 |
| A dark "theme" that **remaps the old light Tailwind classes** (`:where(.dark) .bg-white { background: glass }`, `.border-gray-200 → white/8 %`) instead of migrating 136 files | All 2,217 border utilities (378 × `border-gray-200`, 176 × `border-gray-300`, …) became **visible white lines** around every card, input and row. DS-02 cards have no CSS border (rule 7). | rules 2, 6, 7 |
| Inline pastel card gradients (`linear-gradient(180deg, #FDE8E8 0%, #FFFFFF 100%)` ×31) and 42 `bg-gradient-to-*` kept, then "fixed" with `[style*="linear-gradient"] { background-blend-mode: multiply }` | **Muddy, tinted card backgrounds** of different colours; DS-02 has one glass gradient for all cards | rule 6, D6 |
| Tabs rebuilt as `.seg-tabs` with a 1 px border and hand-typed sizes | Close to DS tabs, but bordered and off-scale | rule 4 |
| Old `tailwind.config.js` kept (custom `blue.600 = #1F36C7`) and a second Inter link added | Two brand blues; duplicate font load | D2, D3 |
| `.dark` class toggle with light as the original design | Two half-designs; light mode is not DS-02 light | D4 |
| No check run (the script lives in the DS repo) | Nobody measured the gap | D11 now has checks you run inside the app |

## B4. What was wrong with the previous DESIGN.md

The guide itself caused much of the above. This version fixes each point:

| Previous DESIGN.md | Consequence | Now |
|---|---|---|
| "This guide does not repeat values" and pointed to `spec/`, the showcase and `check:adoption`, none of which travel with the file | Shared alone, it was unusable; implementers guessed values | Self-contained: values in Part C, the stylesheets in Appendix A |
| Step 1 was "copy the files in §2", with no hard stop when they weren't available | Implementers carried on and hand-wrote tokens | The gate (A1): stop if the stylesheets aren't loaded |
| Said cards have "**no border**", while the spec gives every glass card a white/2 % inset hairline | Ambiguity; some built no edge, others real borders | Rule 7 and C2 state exactly how the edge is drawn, and that it's never a CSS border |
| Warned against remapping in `tailwind.config` only | Remapping through CSS selectors on utility classes (HUL `dark.css`) wasn't recognised as the same trap | Rule 2 forbids any CSS targeting old utility classes; D11 greps for it |
| Assumed a desktop app with a sidebar | No guidance for a top-navbar or handheld flow | D8: use the shell; if navigation genuinely differs, raise a spec addition, don't restyle the old navbar |
| No picture of right vs wrong | Visible borders and pastel cards weren't recognised as wrong | A3 |
| Didn't cover light-first apps with a dark toggle | A partial dark mode was layered on top of the light design | D4 |
| No rule on using one variant per role | Same component, different looks per screen | Rule 9 |
| Verification needed the DS repo | Not run in HUL | D11 has grep checks that run in any repo |

---

# Part C: Specification

Values are listed so you can **check** a screen and **pick** the right component; `ds.css` (Appendix A) already implements every one of them. Where Part C and Appendix A ever disagree, Appendix A wins: report the difference so the spec can be fixed.

## C1. Design language

1. **Deep navy, lit from within.** Page = horizontal navy gradient `#0b1020 → #0f172a (55%) → #020617` plus two blurred ambient glows (blue top-left, green bottom-right). Nothing pure black, nothing flat grey.
2. **Glass, not slabs.** Containers are near-invisible gradients of CTA blue `#2563eb` at 2.5% → 1% alpha (not white), with a 1px edge in white/2% drawn as an inset shadow, plus a soft black drop shadow. Depth comes from stacking thin layers, not opaque fills.
3. **Three depths.** Shell panels (sidebar, main panel) → cards inside them → wells inside cards (`rgba(172,195,255,0.04)`). Only overlays (menus, popovers, dialogs, drawers, tooltips, toasts) are opaque.
4. **One accent, one gradient.** Blue is the only brand hue. Primary button = `linear-gradient(180deg, #2563eb, #1d4ed8)` + 1px inner highlight + soft blue drop glow. Current nav item = faint diagonal blue wash. No other gradient carries colour (exceptions listed under Gradients).
5. **Glowing status.** State = 6–10px dot with a halo (`0 0 10px <colour>`) + label, in a pill. Green = healthy/matched/active, amber = warning, orange-red `#ff5825` = error/stopped/offline.
6. **Illustrated identity, outline actions.** Navigation, headers and KPIs use glossy navy/blue 3D illustrations; controls use thin outline icons in slate.
7. **Strict type.** Inter only, sizes 10/11/12/14/16/20/24px. 24 page titles, 20 card titles and KPI values, 14 body. Headings tighten tracking; uppercase labels open it.
8. **Dense, calm layout.** 40px controls, 44px table rows, 16px gutters and KPI padding, 20–25px card padding. Space separates groups; lines appear only inside components.
9. **Restraint.** Glow only on status dots, primary button, current step (plus the few listed below). No decorative lines, no extra glassmorphism, no blur on structural surfaces.
10. **Visible, safe interaction.** Every focusable element shows a blue outline (2px on buttons/links, 1px on fields/toggles). Overlays never close on backdrop click; Escape closes unless there are unsaved edits.

## C2. Foundations and tokens

### Theme switching

- Dark is the default (`:root { color-scheme: dark }`). Light is on when `<html data-theme="light">` is set (omit the attribute or use `"dark"` for dark). Light sets `color-scheme: light`.
- Light redefines colour, gradient, border, shadow and chart tokens only. Type, spacing, sizes, radii, motion, z-index and component anatomy are identical in both themes.
- Never write a theme-specific colour in a component; if a colour is missing, add a token to both themes.
- Density is separate: `data-density="compact"` on `<html>` or a region (see Density).
- In the tables below, "same" in the Light column means the light block redeclares the identical value. "—" means the token does not exist in that theme.

### Colour: page and glass surfaces

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-color-bg-app` | `#0b1020` | `#f4f8ff` | Solid fallback under the app gradient; `theme-color` |
| `--ds-gradient-app` | `linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%)` | `linear-gradient(90deg, #f4f8ff 0%, #f4f8ff 100%)` | Viewport behind the shell; slide-panel body |
| `--ds-color-glow-brand` | `rgba(59,130,246,0.10)` | `transparent` | Ambient glow top-left (420px) |
| `--ds-color-glow-success` | `rgba(52,211,153,0.08)` | `transparent` | Ambient glow bottom-right (360px) |
| `--ds-gradient-glass` | `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` | `linear-gradient(180deg, #fefefe 0%, #fefefe 100%)` | Every glass surface: sidebar, cards, fields, select triggers, tertiary buttons, glass badges, table bodies |
| `--ds-gradient-glass-strong` | `linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.01) 100%)` | `linear-gradient(180deg, #fcfcfe 0%, #fcfcfe 100%)` | Main content panel; media-card header/footer bars; light sidebar |
| `--ds-gradient-glass-up` | `linear-gradient(0deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` | `linear-gradient(0deg, #f9fbfe 0%, #fefefe 100%)` | Bottom-edge footers (slide-panel footer, pagination) |
| `--ds-gradient-glass-kpi` | `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` | `linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)` | KPI cards only |
| `--ds-gradient-edge-control` | `linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))` | `linear-gradient(rgba(107,114,128,0.08), rgba(107,114,128,0.08))` | 1px stroke of header filter selects (drawn on `::before`) |
| `--ds-gradient-toggle` | `linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)` | `linear-gradient(180deg, #f1f5fb 0%, #ebf0f8 100%)` | Track of segmented tabs and binary toggle |
| `--ds-gradient-toggle-active` | `linear-gradient(180deg, rgba(59,130,246,0.42) 0%, rgba(37,99,235,0.18) 100%)` | `linear-gradient(180deg, rgba(59,130,246,0.16) 0%, rgba(37,99,235,0.08) 100%)` | Selected option inside a toggle track |
| `--ds-gradient-table-header-pinned` | `linear-gradient(rgba(37,99,235,0.07) 0 0), linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%) fixed, #0b1020` | `linear-gradient(rgba(37,99,235,0.03) 0 0), #fefefe` | Sticky table header (a full `background` value; opaque) |
| `--ds-color-surface-base` | `#0f172a` | `#ffffff` | Opaque base: mobile top bar, mobile drawer, collapsed sidebar rail, autofill repaint |
| `--ds-color-surface-raised` | `#0c1325` | `#ffffff` | Opaque floating lists: menus, rich picker, popovers, toasts |
| `--ds-color-surface-field` | — | `#fdfdff` | Light only: header filter selects and header search |
| `--ds-gradient-dialog` | `linear-gradient(180deg, #182032 0%, #101527 100%)` | `linear-gradient(180deg, #ffffff 0%, #f8fafd 100%)` | Modals, confirm dialogs |
| `--ds-gradient-tooltip` | `linear-gradient(180deg, #171f31 0%, #101527 100%)` | `linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%)` | Label tooltips, chart tooltips |
| `--ds-color-surface-nested` | `rgba(172,195,255,0.04)` | `#f4f7fc` | Wells in cards, nested groups, selected tab pill, picker rows |
| `--ds-color-surface-nested-hover` | `rgba(172,195,255,0.08)` | `#ebf1fa` | Hover of nested/picker rows |
| `--ds-color-surface-control` | `rgba(255,255,255,0.04)` | `#f7f8fa` | Subtle button fill, count pill, page buttons, Live pill |
| `--ds-color-surface-control-hover` | `rgba(255,255,255,0.07)` | `#eef1f5` | Hover of surface-control |
| `--ds-color-surface-hover` | `rgba(255,255,255,0.05)` | `rgba(15,23,42,0.04)` | Hover of ghost/icon buttons, menu options, inactive nav, close button |
| `--ds-color-surface-hover-subtle` | `rgba(255,255,255,0.03)` | `rgba(15,23,42,0.025)` | Hover of inactive tabs |
| `--ds-color-surface-row-hover` | `rgba(255,255,255,0.02)` | `rgba(15,23,42,0.02)` | Hover of non-clickable table rows |
| `--ds-color-surface-selected` | `rgba(172,195,255,0.08)` | `rgba(59,130,246,0.08)` | Selected menu option |
| `--ds-color-surface-table-header` | `rgba(255,255,255,0.02)` | `#f7f9fc` | Table and heatmap header rows |
| `--ds-color-surface-table-header-pinned` | `#151c2e` | `#f7f9fc` | Flat fallback for sticky header (components use the gradient) |
| `--ds-color-surface-media` | `#0b0e13` | `#0b0e13` | Camera viewport (stays dark in light) |
| `--ds-color-surface-sunken-button` | `#121620` | `#f1f4f8` | Close button, inactive stepper index |
| `--ds-color-surface-entity-icon` | `#1a2535` | `#eef3fb` | Legacy (entity icons now sit without a tile) |
| `--ds-color-surface-icon-tile` | `#1e293b` | `#eef2f7` | 20px health tile; otherwise legacy |
| `--ds-color-surface-avatar` | `#18202d` | `#eef2f7` | Initials avatar (neutral) |
| `--ds-color-avatar-inner` | `#121622` | `#121622` | Photo-avatar inner fill |
| `--ds-color-track` | `rgba(255,255,255,0.08)` | `#e6ebf2` | Progress-bar track, switch track |
| `--ds-color-user-card` | — | `#ffffff` | Light only: sidebar user card fill |

### Colour: text and icons

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-color-text-primary` | `#ffffff` | `#111827` | Titles, numbers, active labels, first table column, typed values |
| `--ds-color-text-strong` | — | `#1f2636` | Light only: barcode values, user name, field-list values |
| `--ds-color-text-emphasis` | `#e2e8f0` | `#475569` | Select values, tertiary/subtle button labels |
| `--ds-color-text-secondary` | `#cbd5e1` | `#475569` | Body copy, table values, field values; `body` default colour |
| `--ds-color-text-muted` | `#94a3b8` | `#77879d` | KPI labels, table headers, meta, inactive nav/tabs, descriptions |
| `--ds-color-text-tertiary` | `#8a99ae` | `#8a99ae` | Quietest readable text: tab counts, section labels, helper notes (≥4.72:1) |
| `--ds-color-text-placeholder` | `rgba(203,213,225,0.60)` | `#94a3b8` | Placeholders |
| `--ds-color-text-faint` | `#475569` | `#cbd5e1` | Decorative separators only (`aria-hidden`) |
| `--ds-color-text-on-brand` | `#ffffff` | `#ffffff` | Text on blue fills |
| `--ds-color-text-on-bright` | `#0b0f14` | `#0b0f14` | Text on bright chart fills (heat ≥0.59, bar segments) |
| `--ds-color-text-chart-subtle` | `#9eacba` | `#64748b` | Chart subtitles, axis captions |
| `--ds-color-text-chart-strong` | `#f4f7fa` | `#111827` | Matrix row labels |
| `--ds-color-text-tooltip` | `#f4f6f8` | `#111827` | Strong tooltip values |
| `--ds-color-text-tooltip-muted` | `#aeb8c5` | `#64748b` | Tooltip labels |
| `--ds-color-text-axis` | `rgba(255,255,255,0.60)` | `rgba(15,23,42,0.55)` | Y-axis ticks |
| `--ds-color-icon` | `#64748b` | `#64748b` | Outline action icons (3:1 non-text) |
| `--ds-color-icon-chevron` | `#6b7280` | `#6b7280` | Chevrons |

### Colour: borders and dividers

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-color-border-edge` | `rgba(255,255,255,0.02)` | `#edf2f8` | **The one hairline colour.** Every card/panel/section edge, menus, fields, pills |
| `--ds-color-border-hairline` | `rgba(255,255,255,0.02)` (alias of edge) | `#edf2f8` (alias) | KPI outline, subtle-button outline |
| `--ds-color-border-glass` | `rgba(255,255,255,0.02)` (alias) | `#edf2f8` (alias) | Glass cards, fields, badges, dropzones, picker rows, tooltips |
| `--ds-color-border-track` | `rgba(255,255,255,0.02)` (alias) | `#e8eff5` | Tab track, card-header divider, pagination top divider, Live pill |
| `--ds-color-border-faint` | `rgba(255,255,255,0.02)` (alias) | `#edf2f8` (alias) | Section dividers, drawer edge |
| `--ds-color-border-subtle` | `rgba(255,255,255,0.02)` (alias) | `#edf2f8` (alias) | Count pill, close button, modal/drawer header dividers, toggle tracks |
| `--ds-color-border-control` | `rgba(255,255,255,0.02)` (alias) | `rgba(107,114,128,0.08)` | Select triggers, tertiary buttons |
| `--ds-color-border-strong` | `rgba(255,255,255,0.08)` | `#dfe5ee` | Inactive stepper index |
| `--ds-color-border-control-hover` | `rgba(255,255,255,0.20)` | `#cbd5e1` | Toggle/radio-card options, checkbox, hover outline of controls |
| `--ds-color-border-control-strong` | `#6b7280` | `#6b7280` | Unchecked checkbox; increased-contrast mode |
| `--ds-color-border-on-brand` | `rgba(255,255,255,0.30)` | `rgba(255,255,255,0.30)` | Top edge of current page button; split-button divider |
| `--ds-color-border-divider` | `#292e33` | `#e5eaf1` | Table header bottom, heatmap/analytics column dividers, chart axis |
| `--ds-color-border-tooltip-divider` | `rgba(57,67,75,0.40)` | `#e5eaf1` | Divider inside tooltips |
| `--ds-color-border-avatar` | `#334155` | `#cbd5e1` | Neutral avatar outline |
| `--ds-color-border-logo` | `#333333` | `rgba(147,197,253,0.30)` | Logo tile outline |
| `--ds-color-border-user-card` | — | `rgba(148,163,184,0.20)` | Light only: user card border |
| `--ds-color-nav-active-border` | — | `rgba(59,130,246,0.10)` | Light only: current nav item inset outline |
| `--ds-color-scrollbar` | `rgba(255,255,255,0.12)` | `rgba(15,23,42,0.15)` | Scrollbar thumb |
| `--ds-color-scrollbar-hover` | `rgba(255,255,255,0.20)` | `rgba(15,23,42,0.25)` | Scrollbar thumb hover |
| `--ds-color-skeleton` | `rgba(255,255,255,0.06)` | `rgba(15,23,42,0.06)` | Skeleton bars |

### Colour: brand, link and interactive

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-color-brand` | `#3b82f6` | same | Focus ring, primary border, brand dots, checked controls, link-action text. Not for small body text (4.05:1) |
| `--ds-color-brand-strong` | `#2563eb` | same | Current page, active step, checked fill, accent tab |
| `--ds-color-brand-stronger` | `#1d4ed8` | same | Bottom of primary gradient |
| `--ds-gradient-button-primary` | `linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)` | same | Primary button fill only |
| `--ds-gradient-button-primary-hover` | `linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)` | same | Primary button hover |
| `--ds-gradient-nav-active` | `linear-gradient(101deg, rgba(33,88,225,0.225) 0%, rgba(33,88,225,0.125) 43%, rgba(33,88,225,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.039) 0%, rgba(255,255,255,0.012) 100%)` | `linear-gradient(84deg, rgba(33,88,225,0.09) 15%, rgba(33,88,225,0.05) 95%, rgba(33,88,225,0) 132%)` | Current sidebar item only |
| `--ds-gradient-sheen` | `linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.30) 50%, rgba(96,165,250,0) 100%)` | same | Unused; kept for compatibility |
| `--ds-color-brand-text` | `#93c5fd` | `#1d4ed8` | Info chip text, tonal button label |
| `--ds-color-link` | `#60a5fa` | `#2563eb` | Links, eyebrows, roles under names, active step subtitle, secondary button label |
| `--ds-color-link-hover` | `#93c5fd` | `#1d4ed8` | Link hover |
| `--ds-color-brand-tint-10` | `rgba(59,130,246,0.10)` | same | Icon tile fill, info chip fill, secondary button |
| `--ds-color-brand-tint-20` | `rgba(59,130,246,0.20)` | same | Tonal button, secondary hover, user-card glow |
| `--ds-color-brand-tint-30` | `rgba(59,130,246,0.30)` | same | Tonal button hover |
| `--ds-color-brand-border-hover` | `rgba(59,130,246,0.40)` | same | Clickable media-card hover outline |
| `--ds-color-brand-avatar-border` | `rgba(147,197,253,0.30)` | same | Initials-avatar outline |
| `--ds-gradient-brand-ring` | `linear-gradient(45deg, #3b82f6 0%, #818cf8 100%)` | same | Photo-avatar ring |
| `--ds-gradient-brand-avatar` | `linear-gradient(45deg, #1d4ed8 0%, #6366f1 100%)` | same | Initials avatar (brand) |
| `--ds-color-stepper-track` | `#1f2636` | `#e2e8f0` | Stepper connector track |
| `--ds-color-stepper-active-border` | `rgba(147,197,253,0.40)` | `rgba(37,99,235,0.40)` | Active step border |
| `--ds-gradient-stepper-active` | `linear-gradient(90deg, rgba(59,130,246,0.60) 0%, #1f2636 100%)` | `linear-gradient(90deg, rgba(59,130,246,0.60) 0%, #e2e8f0 100%)` | Connector after current/completed step |
| `--ds-color-focus-ring` | `#3b82f6` | same | All focus outlines |
| `--ds-color-focus-ring-on-color` | `#ffffff` | same | Focus on data-coloured fills (heat cells) |

### Colour: status

Status colours are identical in both themes except `info-text`.

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-color-success-text` | `#34d399` | same | Success text, dot core |
| `--ds-color-success-glow` | `#10b981` | same | Success halo, completed step, presence dot |
| `--ds-color-success-bg` | `rgba(16,185,129,0.10)` | same | Success pill fill |
| `--ds-color-success-border` | `rgba(16,185,129,0.20)` | same | Success pill outline |
| `--ds-gradient-progress-success` | `linear-gradient(90deg, #34d399 0%, #10b981 100%)` | same | Healthy progress fill only |
| `--ds-color-warning-text` | `#fbbf24` | same | Warning text, dot, halo |
| `--ds-color-warning-bg` | `rgba(251,191,36,0.10)` | same | Warning pill fill |
| `--ds-color-warning-border` | `rgba(251,191,36,0.20)` | same | Warning pill outline |
| `--ds-color-danger` | `#ff5825` | same | Error/stopped/offline dot, halo, bars, detection frames |
| `--ds-color-danger-text` | `#ff7043` | same | Error-status text on tinted/glass surfaces |
| `--ds-color-danger-bg` | `rgba(255,88,37,0.10)` | same | Error pill fill, danger button |
| `--ds-color-danger-bg-hover` | `rgba(255,88,37,0.20)` | same | Danger button hover |
| `--ds-color-danger-border` | `rgba(255,88,37,0.20)` | same | Error pill outline, danger button border |
| `--ds-color-error` | `#fb7185` | same | Field error ring (form validation, not system state) |
| `--ds-color-error-text` | `#fb7185` | same | Required asterisk, validation messages |
| `--ds-color-live` | `#d33434` | same | "Live" dot core |
| `--ds-color-live-halo` | `rgba(211,52,52,0.40)` | same | "Live" dot ring |
| `--ds-color-info-text` | `#93c5fd` | `#1d4ed8` | Informational text |
| `--ds-color-info-bg` | `rgba(59,130,246,0.10)` | same | Info pill fill |
| `--ds-color-info-border` | `rgba(59,130,246,0.20)` | same | Info pill outline |
| `--ds-color-row-warning` | `rgba(251,191,36,0.03)` | same | Warning row tint |
| `--ds-color-row-critical` | `rgba(255,88,37,0.03)` | same | Stopped/failed row tint |
| `--ds-color-alert-count` | `#fb7185` | same | Non-zero alert counts in cells |
| `--ds-error-ring` | `0 0 0 1px #fb7185` | same | Box-shadow layer on invalid fields (prepended to field shadows) |

### Colour: overlays

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-color-scrim` | `rgba(0,0,0,0.50)` | `rgba(15,23,42,0.30)` | Backdrop behind modals and slide panels |
| `--ds-overlay-blur` | `4px` | `4px` | `backdrop-filter: blur()` on the scrim only |
| `--ds-blur-ambient` | `60px` | (not redeclared; glows are transparent) | `filter: blur()` on the two ambient glows |

Disabled has no colour: disabled controls keep their colours and get `opacity: 0.4` plus `pointer-events: none` (or `cursor: not-allowed` when kept focusable with `aria-disabled`).

### Colour: data visualisation, heat and tags

All identical in both themes except where shown.

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-chart-cat-1` | `#60a5fa` | same | Categorical series 1 · Sky |
| `--ds-chart-cat-2` | `#2563eb` | same | Categorical series 2 · Royal blue |
| `--ds-chart-cat-3` | `#6366f1` | same | Categorical series 3 · Indigo |
| `--ds-chart-cat-4` | `#4b10a3` | same | Categorical series 4 · Purple |
| `--ds-chart-cat-5` | `#f383a3` | same | Categorical series 5 · Pink |
| `--ds-chart-cat-6` | `#23b9ac` | same | Categorical series 6 · Teal |
| `--ds-chart-cat-7` | `#ad77c2` | same | Categorical series 7 · Mauve |
| `--ds-chart-cat-8` | `#6aa760` | same | Categorical series 8 · Green |
| `--ds-chart-cat-9` | `#da825d` | same | Categorical series 9 · Terracotta |
| `--ds-chart-cat-10` | `#1397bb` | same | Categorical series 10 · Ocean blue |
| `--ds-chart-status-red` | `#e5575f` | same | Status red: stopped · failed · error |
| `--ds-chart-status-yellow` | `#e8b94a` | same | Status yellow: attention · no plan · warning |
| `--ds-chart-positive` | `#10b981` | same | Positive bars/marks |
| `--ds-chart-negative` | `#ff5825` | same | Negative bars/marks |
| `--ds-chart-running` | `#34d399` | same | Running segment |
| `--ds-chart-stopped` | `#ff5825` | same | Stopped segment |
| `--ds-chart-trend` | `#ffffff` | `#111827` | Trend line and points |
| `--ds-chart-track` | `rgba(255,255,255,0.08)` | `#e6ebf2` | Bar/progress track |
| `--ds-chart-baseline` | `rgba(255,255,255,0.06)` | `rgba(15,23,42,0.08)` | Grid/baseline lines |
| `--ds-chart-axis` | `#292e33` | `#e5eaf1` | Axis line |
| `--ds-chart-bubble-stroke` | `#151c22` | `#ffffff` | Bubble outline |
| `--ds-heat-0` | `#003e3a` | same | Heat stop 0.00 |
| `--ds-heat-1` | `#116035` | same | Heat stop 0.25 |
| `--ds-heat-2` | `#597730` | same | Heat stop 0.50 |
| `--ds-heat-3` | `#d18732` | same | Heat stop 0.75 |
| `--ds-heat-4` | `#ff5825` | same | Heat stop 1.00 |
| `--ds-tag-purple` | `#4d3f9d` | same | Role tag (white text) |
| `--ds-tag-blue` | `#3f779d` | same | Role tag |
| `--ds-tag-green` | `#457e32` | same | Role tag |
| `--ds-tag-amber` | `#95693c` | same | Role tag |
| `--ds-tag-rose` | `#9d3f5a` | same | Role tag, fifth category |

### Typography

Font: `--ds-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;` loaded from Google Fonts, weights 400/500/600/700 plus 400 italic. No monospace face: IDs, barcodes and IPs use Inter with positive tracking.

| Token | Value |
|---|---|
| `--ds-font-weight-regular` | 400 |
| `--ds-font-weight-medium` | 500 |
| `--ds-font-weight-semibold` | 600 |
| `--ds-font-weight-bold` | 700 |
| `--ds-font-size-caption` / `--ds-line-height-caption` | 10px / 14px |
| `--ds-font-size-micro` / `--ds-line-height-micro` | 11px / 14px |
| `--ds-font-size-label` / `--ds-line-height-label` | 12px / 16px |
| `--ds-font-size-body` / `--ds-line-height-body` | 14px / 20px |
| `--ds-font-size-value` / `--ds-line-height-value` | 16px / 22px |
| `--ds-font-size-heading` / `--ds-line-height-heading` | 20px / 28px |
| `--ds-font-size-title` / `--ds-line-height-title` | 24px / 32px |
| `--ds-leading-12`, `--ds-leading-13`, `--ds-leading-15`, `--ds-leading-16`, `--ds-leading-16-5` | 12px, 13px, 15px, 16px, 16.5px (alternate leadings; only where a component names one) |
| `--ds-leading-18`, `--ds-leading-22`, `--ds-leading-24`, `--ds-leading-26`, `--ds-leading-28` | 18px, 22px, 24px, 26px, 28px |
| `--ds-tracking-title` | -0.35px |
| `--ds-tracking-heading` | -0.5px |
| `--ds-tracking-card-title` | -0.4px |
| `--ds-tracking-media-title` | -0.25px |
| `--ds-tracking-number` | -0.65px |
| `--ds-tracking-tight` | -0.4px |
| `--ds-tracking-chart-label` | -0.2px |
| `--ds-tracking-upper` | 0.55px |
| `--ds-tracking-upper-sm` | 0.4px |
| `--ds-tracking-step` | 0.3px |
| `--ds-tracking-table-header` | 0.3px |
| `--ds-tracking-identifier` | 0.55px |
| `--ds-tracking-field` | 0.5px |

No other font sizes exist (no 13, 15, 18 or 28px). Never write an inline font size.

#### Text styles (`.ds-ts-*`)

Every class also sets `font-family: var(--ds-font-family)`. Colours resolve per theme via the token. "per variant/status" = the class sets no colour; the component does.

| Class | Size / line-height | Weight | Tracking | Case | Colour token | Role |
|---|---|---|---|---|---|---|
| `.ds-ts-page-title` | 24 / 32 | 600 | -0.35px | — | text-primary | Page `<h1>` |
| `.ds-ts-dialog-title` | 20 / 28 | 700 | -0.5px | — | text-primary | Slide-panel, confirm-dialog titles |
| `.ds-ts-modal-title` | 14 / 18 | 400 | 0 | — | text-primary | Compact modal title, form-section headers |
| `.ds-ts-card-title` | 20 / 24 | 600 | -0.4px | — | text-primary | Dashboard/status card titles |
| `.ds-ts-entity-title` | 20 / 28 | 600 | -0.4px | — | text-primary | Entity-card names |
| `.ds-ts-media-title` | 20 / 26 | 600 | -0.25px | — | text-primary | Camera tile titles (16px under 420px wide) |
| `.ds-ts-group-title` | 20 / 24 | 700 | -0.5px | — | text-primary | Collapsible section, table-card titles |
| `.ds-ts-subgroup-title` | 16 / 22 | 700 | -0.5px | — | text-primary | Compact nested sections |
| `.ds-ts-summary-title` | 20 / 28 | 700 | -0.5px | — | text-primary | Summary-strip title |
| `.ds-ts-kpi-value` | 20 / 28 | 700 | -0.65px | — | text-primary | KPI value (tabular-nums) |
| `.ds-ts-kpi-label` | 12 / 16 | 700 | +0.55px | UPPER | text-muted | KPI label |
| `.ds-ts-metric-value` | 20 / 28 | 700 | -0.65px | — | text-primary | Inline metric in entity card |
| `.ds-ts-metric-denominator` | 14 / 20 | 400 | 0 | — | text-muted | "/ 6 lines active" |
| `.ds-ts-metric-label` | 12 / 18 | 500 | +0.4px | UPPER | text-muted | Labels above stacked metrics |
| `.ds-ts-section-title` | 20 / 28 | 500 | -0.35px | — | text-tertiary | Page-section title above a card grid |
| `.ds-ts-section-label` | 12 / 16 | 700 | +0.55px | UPPER | text-tertiary | Card section labels |
| `.ds-ts-field-label` | 12 / 16 | 500 | 0 | — | text-tertiary | Label above read-only value |
| `.ds-ts-field-value` | 16 / 22 | 400 | +0.5px | — | text-primary | Read-only identifiers (barcodes) |
| `.ds-ts-eyebrow` | 12 / 18 | 400 | +0.55px | — | link | Context label above summary title, after 8px brand dot |
| `.ds-ts-body` | 14 / 20 | 400 | 0 | — | text-secondary | Paragraphs |
| `.ds-ts-body-muted` | 14 / 20 | 400 | 0 | — | text-muted | Descriptions, "Showing …", empty states |
| `.ds-ts-body-strong` | 14 / 20 | 500 | 0 | — | text-primary | Names, primary values |
| `.ds-ts-body-emphasis` | 14 / 20 | 600 | 0 | — | text-primary | Emphasised values |
| `.ds-ts-small` | 12 / 16 | 400 | 0 | — | text-muted | Meta lines |
| `.ds-ts-small-strong` | 12 / 16 | 600 | 0 | — | text-secondary | Compact labels, callout titles |
| `.ds-ts-caption` | 10 / 14 | 400 | 0 | — | text-tertiary | Smallest annotations |
| `.ds-ts-table-header` | 12 / 16 | 600 | +0.3px | UPPER | text-muted | `<th>` |
| `.ds-ts-table-cell-primary` | 14 / 20 | 500 | 0 | — | text-primary | First column |
| `.ds-ts-table-cell` | 14 / 20 | 400 | 0 | — | text-secondary | Other columns |
| `.ds-ts-form-label` | 12 / 16 | 500 | 0 | — | text-muted | Field labels (drawers, pages) |
| `.ds-ts-form-label-caps` | 12 / 16 | 500 | +0.55px | UPPER | text-muted | Field labels in compact modals |
| `.ds-ts-input-text` | 14 / 20 | 400 | 0 | — | text-primary | Typed values |
| `.ds-ts-placeholder` | 14 / 20 | 400 | 0 | — | text-placeholder | Placeholders |
| `.ds-ts-validation` | 12 / 16 | 400 | 0 | — | error-text | Field errors |
| `.ds-ts-helper` | 12 / 16 | 400 | 0 | — | text-tertiary | Hints, autosave notes |
| `.ds-ts-button-sm` | 12 / 16 | 600 | 0 | — | per variant | Small buttons |
| `.ds-ts-button-md` | 14 / 20 | 600 | 0 | — | per variant | Buttons |
| `.ds-ts-button-lg` | 16 / 22 | 600 | 0 | — | per variant | Large buttons |
| `.ds-ts-badge` | 14 / 20 | 600 | 0 | — | per status | Status pill |
| `.ds-ts-badge-sm` | 12 / 16 | 600 | 0 | — | per status | Small status pill |
| `.ds-ts-tag` | 14 / 20 | 500 | 0 | — | text-primary | Role tag |
| `.ds-ts-count-pill` | 14 / 18 | 700 | 0 | — | text-secondary | Count next to a title |
| `.ds-ts-nav-item` | 14 / 20 | 500 | 0 | — | text-muted | Sidebar items (primary when current) |
| `.ds-ts-nav-section` | 12 / 16 | 400 | 0 | — | text-muted | Sidebar group labels |
| `.ds-ts-tab` | 14 / 20 | 400 | 0 | — | text-muted | Segmented tabs (primary when selected) |
| `.ds-ts-tab-count` | 12 / 16 | 400 | 0 | — | text-tertiary | "(24)" after a tab label |
| `.ds-ts-link-action` | 14 / 20 | 600 | 0 | — | brand (`#3b82f6`); link on hover | Inline actions ("+ Add New User") |
| `.ds-ts-step-title` | 12 / 16 | 700 | +0.3px | — | text-primary | Current step title |
| `.ds-ts-step-sub` | 12 / 16 | 500 | 0 | — | link | Current step status |
| `.ds-ts-media-detail` | 14 / 16 | 600 | 0 | — | text-secondary | Camera footer (value italic 400) |
| `.ds-ts-avatar-initials` | 14 / 16 | 500 | 0 | — | text-secondary | Neutral avatar initials |
| `.ds-ts-legend` | 14 / 22 | 500 | 0 | — | text-tertiary | Chart legends (values text-muted) |
| `.ds-ts-legend-sm` | 12 / 16 | 500 | 0 | — | text-tertiary | Compact legends |
| `.ds-ts-axis-y` | 12 / 24 | 400 | -0.4px | — | text-axis | Y-axis ticks |
| `.ds-ts-axis-x` | 14 / 24 | 400 | -0.4px | — | text-primary | X-axis categories |
| `.ds-ts-axis-caption` | 11 / 14 | 400 | 0 | — | text-chart-subtle | Dense axis labels (2-line clamp) |
| `.ds-ts-data-label` | 16 / 22 | 400 | -0.4px | — | text-primary | Labels on chart points |
| `.ds-ts-tooltip-title` | 11 / 13 | 700 | 0 | — | text-tooltip | Tooltip header |
| `.ds-ts-tooltip-body` | 10 / 12 | 400 | 0 | — | text-tooltip-muted | Tooltip rows |
| `.ds-ts-heat-cell` | 14 / 20 | 600 | -0.4px | — | text-primary | Heatmap cells |
| `.ds-ts-bar-segment` | 12 / 1 (12px) | 600 | 0 | — | text-on-bright | Numbers inside segmented bars |
| `.ds-ts-toast` | 14 / 20 | 400 | 0 | — | text-primary | Toast message |

Rules: headings (≥16px, 600/700) use negative tracking; body uses 0. Uppercase always has positive tracking (+0.3 to +0.55px) and weight ≥500. KPI/metric numbers are bold, -0.65px, `font-variant-numeric: tabular-nums`. Italic only for detected values in camera footers. Controls, rows and cards use min-height so enlarged text grows them. Never truncate KPI values/labels, form labels, validation, status labels, button labels, dialog titles or column headers; titles wrap (2 lines). Select values, identifier cells and nav labels may truncate with the full text in a tooltip/accessible name. Use `overflow-wrap: anywhere` where long IDs/e-mails/URLs may land.

### Spacing

Base unit 4px with 2px half-steps inside components. Same in both themes. Gap between siblings by default; padding inside containers; margin only for the 4px trigger → menu offset and the 2px nudge of validation text.

| Token | Value | Used for |
|---|---|---|
| `--ds-space-0-5` | 2px | Title → subtitle in tight stacks |
| `--ds-space-1` | 4px | Menu offset, nav item gap |
| `--ds-space-1-5` | 6px | Label → control, badge dot gap |
| `--ds-space-2` | 8px | Icon → label in buttons |
| `--ds-space-2-5` | 10px | Page icon → title |
| `--ds-space-3` | 12px | Header action gap, avatar → name |
| `--ds-space-3-5` | 14px | Title → count pill, nav item padding |
| `--ds-space-4` | 16px | KPI icon → text, card stack gap |
| `--ds-space-5` | 20px | Side-panel card padding, section gap |
| `--ds-space-6` | 24px | Dashboard card, dialog, drawer padding |
| `--ds-space-8` | 32px | Empty-state padding |
| `--ds-space-10` | 40px | Form row gap |
| `--ds-space-12` | 48px | Drawer title row → stepper |
| `--ds-space-16` | 64px | Empty state inside charts |
| `--ds-space-page-gutter` | 16px | Page content left/right/bottom padding |
| `--ds-space-page-top` | 8px | Header → first content row |
| `--ds-space-shell-padding` | 16px | Viewport → shell panels |
| `--ds-space-shell-gap` | 20px | Sidebar → main panel |
| `--ds-space-section` | 20px | Between stacked page sections |
| `--ds-space-grid` | 16px | Between KPI cards, camera tiles, side-panel cards |
| `--ds-space-grid-lg` | 20px | Between entity/dashboard cards |
| `--ds-space-stack` | 12px | Between collapsible sections / nested groups |
| `--ds-space-card` | 16px | KPI card, summary strip, collapsible body padding |
| `--ds-space-card-lg` | 20px | Side-panel card padding |
| `--ds-space-card-xl` | 24px | Dashboard cards, modals, drawer body padding |
| `--ds-space-card-entity` | 25px | Entity/status card padding (24 + 1px inset edge) |
| `--ds-space-card-gap` | 20px | Between sections inside an entity card |
| `--ds-space-chart-gap` | 20px | Dashboard-card title row → content |
| `--ds-space-header-actions` | 12px | Between header controls |
| `--ds-space-form-label` | 6px | Label → control |
| `--ds-space-form-col` | 20px | Between form columns |
| `--ds-space-form-row` | 40px | Between form rows |
| `--ds-space-form-section` | 24px | Form-section header → first row |
| `--ds-space-icon-text` | 8px | Icon → label |
| `--ds-space-icon-text-lg` | 12px | 24–40px icon → text |
| `--ds-space-cell-x` | 16px | Table cell horizontal padding |
| `--ds-space-cell-y` | 12px | Table cell vertical padding |

### Radii

Same in both themes. Hierarchy: panels (24) hold cards (16) hold wells/controls (12) hold small parts (8, 4). Inner radius never exceeds its container's. Slide panels and the mobile top bar are edge-attached with no radius.

| Token | Value | Used for |
|---|---|---|
| `--ds-radius-xs` | 4px | Role tags, info chips, checkboxes, legend swatches, bar tops, detection frames |
| `--ds-radius-chip` | 6px | Page buttons, skeletons, 20px health tile |
| `--ds-radius-sm` | 8px | Tab pills, close/icon buttons, stepper indices, toggle options, radio cards, logo tile, attach fields, multi-select menus, pickers, popovers, toasts |
| `--ds-radius-control` | 12px | Buttons, inputs, select triggers, dropzones, single-select menus, modals |
| `--ds-radius-track` | 12px | Tab tracks, wells, icon tiles, segmented status bar |
| `--ds-radius-nested` | 16px | Sidebar nav items, nested groups |
| `--ds-radius-card` | 16px | Content cards (entity, dashboard, table, section, side-panel), confirm dialogs |
| `--ds-radius-panel` | 24px | Sidebar, main panel, KPI cards, camera tiles, sidebar user card |
| `--ds-radius-viewer` | 32px | Expanded camera viewer |
| `--ds-radius-full` | 9999px | Badges, count pills, dots, avatars, progress bars |

### Borders and card edges

| Token | Value | Used for |
|---|---|---|
| `--ds-border-width` | 1px | Every border |
| `--ds-border-width-emphasis` | 2px | Stepper connector, presence-dot ring |
| `--ds-border-width-detect` | 2px | Detection frame on camera feeds |

**How card and panel edges are drawn (mandatory):**

- Cards, panels, sections, KPI cards, camera tiles, table cards, menus and the main panel have **no CSS `border`**. Their edge is a 1px **inset box-shadow** in `--ds-color-border-edge`: `--ds-shadow-edge: inset 0 0 0 1px rgba(255,255,255,0.02)` (dark) / `inset 0 0 0 1px #edf2f8` (light). It does not change the box size and is combined with the drop shadow in one `box-shadow` list.
- The edge is white at **2%**, i.e. barely visible. Do not raise it to 5–10%, do not use `rgba(255,255,255,0.08)` for card edges (that value is only `border-strong`, the inactive stepper index).
- Full-bleed cards (camera tiles, table cards) draw the edge on `::after { content:""; position:absolute; inset:0; z-index:2; border-radius:inherit; pointer-events:none; box-shadow: var(--ds-shadow-edge); }` so content does not cover it.
- Small controls (tertiary/subtle buttons, close button, toggle tracks, count pills, tooltips, dialog, user card) do use `border: 1px solid` but always in an edge alias (`border-control`, `border-subtle`, `border-glass`, `border-track`), which in dark all resolve to the same white/2%. Inputs and select triggers use the inset `shadow-edge` instead of a border.
- Hover/strong outlines are separate: `border-control-hover` (white/20%) for toggle/radio options and control hover, `brand-border-hover` (blue/40%) for clickable media cards, `inset 0 0 0 1px #3b82f6` for a pressed KPI.
- The edge is light catching glass, never a divider. Dividers (`border-track`, `border-faint`, `border-divider`) only separate a header from content inside one component. No decorative lines.
- Increased contrast (`prefers-contrast: more` or `[data-contrast="more"]`): inputs, select triggers, attach fields, tab tracks, selected tab, radio cards, toggle options, current nav item, tertiary/subtle/ghost buttons and dropzones get `border: 1px solid #6b7280`.

Resolved surface recipes (dark):

| Surface | background | box-shadow (resolved) |
|---|---|---|
| Content card (entity, dashboard, status, side-panel, summary strip) | `--ds-gradient-glass` | `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| KPI card | `--ds-gradient-glass-kpi` | `0 12px 28px 0 rgba(0,0,0,0.20), 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Section card (collapsible) | `--ds-gradient-glass` | `0 12px 28px -10px rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Table card | `--ds-gradient-glass` | `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40)`; edge on `::after` |
| Camera tile | `--ds-gradient-glass` | `0 12px 28px 0 rgba(0,0,0,0.20)`; edge on `::after` |
| Main panel | `--ds-gradient-glass-strong` | `0 28px 64px -16px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Sidebar (dark) | `--ds-gradient-glass` | `0 28px 56px 0 rgba(0,0,0,0.40)` (no edge) |
| Sidebar (light) | `--ds-gradient-glass-strong` | `0 4px 12px 0 rgba(0,0,0,0.06), inset 0 0 0 1px #edf2f8` |
| Input / select trigger | `--ds-gradient-glass` | `0 10px 24px -10px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.02)` (+ `0 1px 2px 0 rgba(0,0,0,0.05)` on select triggers; invalid prepends `0 0 0 1px #fb7185`) |
| Menu / popover | `--ds-color-surface-raised` | `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Confirm dialog | `--ds-gradient-dialog`, `border: 1px solid` border-subtle | `0 25px 50px -12px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.07)` |

### Shadows

| Token | Dark value | Light value | Used for |
|---|---|---|---|
| `--ds-shadow-glass` | `0 12px 28px 0 rgba(0,0,0,0.20)` | `0 4px 12px 0 rgba(0,0,0,0.06)` | KPI, content cards, camera tiles |
| `--ds-shadow-glass-soft` | `0 12px 28px -10px rgba(0,0,0,0.20)` | `0 4px 12px -4px rgba(0,0,0,0.06)` | Collapsible section cards |
| `--ds-shadow-control` | `0 10px 24px 0 rgba(0,0,0,0.15)` | `0 2px 5px 0 rgba(0,0,0,0.08)` | Single-select triggers, glass badges, light header filters |
| `--ds-shadow-field` | `0 10px 24px -10px rgba(0,0,0,0.15)` | `0 1px 2px 0 rgba(15,23,42,0.04)` | Inputs, textareas, field selects, tertiary/attach buttons |
| `--ds-shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | `0 1px 2px 0 rgba(15,23,42,0.05)` | Extra lift under select/picker triggers |
| `--ds-shadow-highlight` | `inset 0 1px 0 0 rgba(255,255,255,0.07)` | `inset 0 1px 0 0 rgba(255,255,255,0.60)` | Top inner highlight (dialogs) |
| `--ds-shadow-card` | `0 2px 36px 0 rgba(0,0,0,0.12), 0 2px 12px 0 rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.07)` | `0 2px 12px 0 rgba(15,23,42,0.06), 0 1px 3px 0 rgba(15,23,42,0.04)` | Current nav item, current page button, raised role tags (not cards) |
| `--ds-shadow-float-drop` | `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40)` | `0 12px 28px -8px rgba(15,23,42,0.12), 0 4px 10px -2px rgba(15,23,42,0.06)` | Drop part of float; table cards |
| `--ds-shadow-float` | float-drop + edge → dark: `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)` | light: `0 12px 28px -8px rgba(15,23,42,0.12), 0 4px 10px -2px rgba(15,23,42,0.06), inset 0 0 0 1px #edf2f8` | Menus, popovers |
| `--ds-shadow-kpi-lift` | `0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)` | `0 1px 2px 0 rgba(15,23,42,0.03)` | Extra lift under KPI cards |
| `--ds-shadow-edge` | `inset 0 0 0 1px rgba(255,255,255,0.02)` | `inset 0 0 0 1px #edf2f8` | Edge of every card/panel/section/menu |
| `--ds-shadow-edge-bottom` | `inset 0 -1px 0 0 rgba(255,255,255,0.02)` | `inset 0 -1px 0 0 #edf2f8` | Bottom hairline (rarely used) |
| `--ds-shadow-surface` | glass + edge → `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` | `0 4px 12px 0 rgba(0,0,0,0.06), inset 0 0 0 1px #edf2f8` | The content-card surface; header filters/search |
| `--ds-shadow-sidebar` | `0 28px 56px 0 rgba(0,0,0,0.40)` | `0 4px 12px 0 rgba(0,0,0,0.06)` | Sidebar |
| `--ds-shadow-shell` | `0 28px 64px -16px rgba(0,0,0,0.40)` | `0 4px 12px 0 rgba(0,0,0,0.06)` | Main panel |
| `--ds-shadow-drawer` | `-18px 0 45px 0 rgba(0,0,0,0.80), -1px 0 0 0 rgba(255,255,255,0.07)` | `-12px 0 32px 0 rgba(15,23,42,0.12), -1px 0 0 0 #edf2f8` | Slide panel (casts left) |
| `--ds-shadow-drawer-mirrored` | `18px 0 45px 0 rgba(0,0,0,0.80), 1px 0 0 0 rgba(255,255,255,0.07)` | `12px 0 32px 0 rgba(15,23,42,0.12), 1px 0 0 0 #edf2f8` | Mobile nav drawer; RTL slide panel |
| `--ds-shadow-modal` | `0 25px 50px -12px rgba(0,0,0,0.40)` | `0 24px 48px -12px rgba(15,23,42,0.18)` | Modals, confirm dialogs |
| `--ds-shadow-elevated` | `0 4px 40px rgba(0,0,0,0.50)` | `0 4px 24px rgba(15,23,42,0.12)` | Toasts |
| `--ds-shadow-tooltip` | `0 12px 28px 0 rgba(0,0,0,0.20)` | `0 8px 24px 0 rgba(15,23,42,0.12)` | Label and chart tooltips |
| `--ds-shadow-button-primary` | `0 4px 7px 0 rgba(37,99,235,0.35), inset 0 1px 0 0 rgba(255,255,255,0.28)` | same | Primary button glow + highlight |
| `--ds-shadow-close` | `inset 0 2px 4px 0 rgba(0,0,0,0.60), 0 1px 0 0 rgba(255,255,255,0.04)` | `inset 0 1px 2px 0 rgba(15,23,42,0.08)` | Close buttons (debossed) |
| `--ds-shadow-stepper-active` | `0 0 0 2px rgba(59,130,246,0.20), 0 0 20px -2px rgba(37,99,235,0.45), inset 0 1px 1px 1px rgba(255,255,255,0.35)` | same | Current step index |
| `--ds-shadow-stepper-idle` | `inset 0 2px 4px 0 rgba(0,0,0,0.60)` | `inset 0 1px 2px 0 rgba(15,23,42,0.08)` | Upcoming step index |
| `--ds-shadow-avatar` | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` | same | Brand avatar in pickers |
| `--ds-shadow-avatar-orb` | `0 7px 10px -2px rgba(59,130,246,0.30), 0 3px 4px -3px rgba(59,130,246,0.30)` | same | Unused; compatibility |
| `--ds-shadow-header-scrolled` | `0 8px 16px -6px rgba(0,0,0,0.60)` | `0 8px 16px -8px rgba(15,23,42,0.12)` | Panel header / pinned table header while scrolled |
| `--ds-shadow-footer-scrolled` | `0 -8px 16px -6px rgba(0,0,0,0.60)` | `0 -8px 16px -8px rgba(15,23,42,0.12)` | Slide-panel footer with content below the fold |
| `--ds-shadow-status-success` | `0 0 10px 0 #10b981, 0 0 2px 0 #34d399` | same | Success dot halo |
| `--ds-shadow-status-warning` | `0 0 10px 0 #fbbf24, 0 0 2px 0 #fbbf24` | same | Warning dot halo |
| `--ds-shadow-status-error` | `0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825` | same | Error/stopped/offline dot halo |
| `--ds-shadow-user-card` | — | `2px 2px 24px 0 rgba(0,0,0,0.12)` | Light only: sidebar user card |

### Gradients: allowed and forbidden

| Gradient | Allowed on | Never on |
|---|---|---|
| `gradient-app` | Viewport (`body`), slide-panel body | Cards, controls |
| `gradient-glass`, `-strong`, `-up`, `-kpi` | The glass surfaces listed in the surfaces table | Text, icons, data marks |
| `gradient-toggle`, `-toggle-active` | Toggle tracks and their selected option | Anything else |
| `gradient-table-header-pinned` | Sticky table header | Anything else |
| `gradient-button-primary` (+ hover) | Primary buttons only | Links, tabs, badges |
| `gradient-nav-active` | Current sidebar item only | Tabs, rows, cards |
| `gradient-dialog`, `gradient-tooltip` | Modals, dialogs, tooltips | Inline surfaces |
| `gradient-brand-ring`, `gradient-brand-avatar` | Avatars only | Anything else |
| `gradient-progress-success` | Healthy progress bars only | Other bars |
| `gradient-stepper-active` | Connectors after current/completed step | Anything else |
| `gradient-sheen` | Nowhere (unused) | Anything |

Do not invent card gradients. A card's fill is `--ds-gradient-glass` (blue 2.5% → 1%) and nothing else; no coloured, radial or diagonal card washes, no gradient borders.

### Glow, blur and ambient light

- **Glow** (coloured, unoffset shadow) is allowed only on: status dots (`shadow-status-*`), the primary button (`shadow-button-primary`), the current step (`shadow-stepper-active`), detection frames in the camera viewer (20px glow of the frame colour at 30%), the sidebar user-card halo (128px circle of `brand-tint-20`, 20px blur, dark only; removed in light) and the two ambient page glows. Nothing else glows.
- **Blur**: `backdrop-filter` only on the overlay scrim (`blur(4px)`). No backdrop blur on glass panels or cards (it adds GPU cost and breaks fixed-position popups). Ambient glows use `filter: blur(60px)`.
- **Ambient glows** are drawn by the shell, not by `body`:

```css
.ds-shell { position: relative; /* … */ }
.ds-shell::before, .ds-shell::after { content: ""; position: absolute; z-index: -1; border-radius: 9999px; filter: blur(var(--ds-blur-ambient)); pointer-events: none; }
.ds-shell::before { width: 420px; height: 420px; left: -120px; top: -120px; background: var(--ds-color-glow-brand); }   /* rgba(59,130,246,0.10) */
.ds-shell::after  { width: 360px; height: 360px; right: -40px; bottom: -40px; background: var(--ds-color-glow-success); } /* rgba(52,211,153,0.08) */
```

Light theme sets both glow colours to `transparent`.

### Elevation levels

| Level | Name | Surface | Shadow | Examples |
|---|---|---|---|---|
| 0 | Page | `gradient-app` + ambient glows | none | Viewport |
| 1 | Shell | `gradient-glass` (sidebar) / `gradient-glass-strong` (main panel) | `shadow-sidebar` / `shadow-shell` + `shadow-edge` (main panel) | Sidebar, main panel |
| 2 | Card | `gradient-glass` / `-kpi` + edge | `shadow-glass` (+ `shadow-kpi-lift` on KPIs) or `shadow-float-drop` (table cards) | KPI, entity, dashboard, status, table cards, camera tiles |
| 2a | Well | `surface-nested` | none | Metric well, nested group, picker rows |
| 3 | Float | `surface-raised` / `gradient-tooltip` | `shadow-float` / `shadow-tooltip` | Menus, popovers, tooltips |
| 4 | Overlay | `gradient-app` / `gradient-dialog` over `scrim` | `shadow-drawer` / `shadow-modal` | Slide panels, modals |
| 5 | Notification | `surface-raised` | `shadow-elevated` | Toasts |

### Focus

Focus uses `outline` (follows radius, survives forced colours). Ring colour `#3b82f6` in both themes (4.05–4.85:1 on every surface).

| Token | Value |
|---|---|
| `--ds-focus-width` | 2px |
| `--ds-focus-width-field` | 1px |
| `--ds-focus-offset` | 2px |
| `--ds-focus-offset-tight` | 0px |
| `--ds-focus-offset-inset` | -2px |

| Style | Spec | Applies to |
|---|---|---|
| Default | `outline: 2px solid #3b82f6; outline-offset: 2px` | Buttons, links, nav items, pagination, collapsible headers, checkboxes, switches, chart marks |
| Field | `outline: 1px solid #3b82f6; outline-offset: 0` | Inputs, textareas, selects, select triggers, tabs, toggle options, radio cards |
| Inset | `outline: 2px solid #3b82f6; outline-offset: -2px` | Elements clipped by `overflow: hidden`: menu options, picker rows, row links, scroll regions |
| Icon button | default width, `outline-offset: 0` | Icon buttons |
| On colour | `outline: 2px solid #ffffff; outline-offset: -2px` | Data-coloured fills (heat cells) |

`outline: none` is allowed only as `:focus:not(:focus-visible)` or on an input whose wrapper draws the same ring via `:focus-within`.

### Sizes

Same in both themes (compact density overrides some; see Density). Kinds: fixed (icons, dots, avatars, icon/page buttons), minimum (controls, rows, headers, cards: use `min-height`), maximum (overlays: `width: min(<value>, 100%)`), content-driven (grid cards, button widths, charts).

| Token | Value | Used for |
|---|---|---|
| `--ds-size-control` | 40px | Inputs, select triggers, menu options; buttons = padding + text + 1px border (42px bordered) |
| `--ds-size-control-sm` | 28px | Small icon buttons (row actions) |
| `--ds-size-control-lg` | 48px | Large buttons |
| `--ds-size-icon-button` | 36px | Default icon button, drawer close |
| `--ds-size-icon-button-compact` | 32px | Modal close |
| `--ds-size-pagination-button` | 32px | Page buttons, stepper indices |
| `--ds-size-page-header` | 76px | Page header min-height |
| `--ds-size-section-header` | 60px | Collapsible section header |
| `--ds-size-table-row` | 44px | Table body row min-height |
| `--ds-size-table-header` | 40px | Table header row min-height |
| `--ds-size-table-row-compact` | 40px | Compact body row |
| `--ds-size-table-header-compact` | 36px | Compact header row |
| `--ds-size-heat-row` | 40px | Heatmap row |
| `--ds-size-kpi-card` | 76px | KPI card min-height |
| `--ds-size-kpi-icon` | 40px | KPI illustration |
| `--ds-size-entity-icon` | 40px | Entity icon, drawer title illustration |
| `--ds-size-page-icon` | 36px | Page-header illustration |
| `--ds-size-avatar-sm` | 32px | Photo avatar |
| `--ds-size-avatar-md` | 36px | Initials avatar in entity cards |
| `--ds-size-avatar-lg` | 40px | Brand avatar in pickers |
| `--ds-size-nav-item` | 44px | Sidebar item |
| `--ds-size-nav-icon` | 24px | Sidebar illustration |
| `--ds-size-action-icon` | 24px | Row action glyph |
| `--ds-size-ui-icon` | 16px | Pagination chevrons, expand, header glyphs |
| `--ds-size-ui-icon-sm` | 14px | Button icons |
| `--ds-size-search-icon` | 18px | Search and chevron boxes |
| `--ds-size-media-icon` | 28px | Camera-tile icon tile |
| `--ds-size-sidebar-collapsed` | 76px | Collapsed sidebar rail |
| `--ds-size-sidebar-expanded` | 256px | Sidebar |
| `--ds-size-aside` | 340px | Right side panel of monitoring views |
| `--ds-size-status-dot` | 10px | Status dot (md) |
| `--ds-size-status-dot-sm` | 8px | Status dot (sm), eyebrow dot |
| `--ds-size-badge-dot` | 6px | Dot inside a badge |
| `--ds-size-checkbox` | 16px | Checkbox |
| `--ds-size-menu-max-height` | 260px | Option list max-height |
| `--ds-size-feed-max-height` | 380px | Notification feed list |
| `--ds-size-picker-max-height` | 280px | Rich picker max-height |
| `--ds-size-dialog` | 440px | Confirm dialog max-width |
| `--ds-size-modal` | 720px | Form modal max-width |
| `--ds-size-panel-sm` | 480px | Slide panel max-width |
| `--ds-size-panel-md` | 560px | Slide panel max-width |
| `--ds-size-panel-lg` | 680px | Slide panel max-width |
| `--ds-size-panel-xl` | 820px | Multi-step and two-column form panels |
| `--ds-size-form-column` | 820px | Full-page form column |
| `--ds-size-form-column-wide` | 980px | Wide full-page form column |
| `--ds-size-form-guide` | 480px | Form guide column |
| `--ds-size-popover-date` | 360px | Date-range popover |
| `--ds-size-tooltip` | 314px | Rich chart tooltip (342 for long lists) |
| `--ds-size-filter` | 180px | Header filter select |
| `--ds-size-filter-sm` | 160px | Narrow filter select |
| `--ds-size-filter-lg` | 200px | Wide filter select |
| `--ds-size-filter-date` | 240px | Date-range trigger |
| `--ds-size-search-sm` | 288px | Header search |
| `--ds-size-search-md` | 320px | Header search |
| `--ds-size-search-lg` | 360px | Header search, longest placeholder |
| `--ds-size-header-button` | 180px | Optional min-width of header/footer primary buttons |

### Motion

| Token | Value | Used for |
|---|---|---|
| `--ds-duration-fast` | 150ms | Colour, background, border, opacity, shadow, filter |
| `--ds-duration-base` | 200ms | Scrolled-header shadow, sidebar label fade |
| `--ds-duration-slow` | 300ms | Sidebar width, bar heights |
| `--ds-duration-chart` | 500ms | Donut segments, progress widths |
| `--ds-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default |
| `--ds-ease-emphasized` | `cubic-bezier(0.22, 1, 0.36, 1)` | Sidebar collapse/expand |

Overlays appear instantly (optional 150ms backdrop fade). "Live" dot pulses at 1.6s. Spinner: `rotate(360deg)` over 1s linear infinite. Hover brightening on clickable cards = `filter: brightness(1.1)`; heat cells use an inset outline; bubbles `scale(1.1)`. `prefers-reduced-motion: reduce` sets every transition and animation duration to 0ms.

### Z-index

| Token | Value | Layer |
|---|---|---|
| `--ds-z-header` | 10 | Page header, pinned table header, panel header |
| `--ds-z-tooltip` | 30 | Chart tooltips |
| `--ds-z-sidebar` | 40 | Sidebar slot |
| `--ds-z-menu` | 50 | Menus, popovers |
| `--ds-z-overlay` | 50 | Modals, slide panels (above the whole shell) |
| `--ds-z-toast` | 60 | Toasts |
| `--ds-z-label-tooltip` | 70 | Label tooltips (body-level layer) |

### Iconography

Two families; never swap roles.

| Family | Role | Style |
|---|---|---|
| 3D illustrations | Identity: navigation, page/panel titles, KPIs, entity icons | Glossy navy → royal-blue clay renders (about `#1e3a8a → #2563eb`), cyan-blue lights, three-quarter view, transparent background, soft contact shadow, at most one secondary object plus a status coin (green positive, red negative, blue neutral, amber attention). No text. PNG masters ≥1024px. Decorative (`alt=""`) when a label is adjacent |
| Outline UI icons | Actions and controls | Thin outline, `currentColor`; Lucide where no Figma glyph exists, same size/stroke. `aria-hidden`; name lives on the control |

Illustrations are images, never drawn or imitated in code. Sprite crops: `.ds-sprite { position:relative; display:block; overflow:hidden; flex-shrink:0 } .ds-sprite img { position:absolute; max-width:none }` with the image sized/offset in percentages; plain `.ds-illus { display:block; object-fit:contain; flex-shrink:0 }`. Display sizes: 24 (nav), 32 (modal), 36 (page header), 40 (entity/drawer), 52 (KPI).

Fallback when no illustration exists — **icon tile**: `brand-tint-10` fill (`rgba(59,130,246,0.10)`), 1px transparent border (no visible border), `link`-coloured outline glyph. Sizes: 40px tile (radius 12, glyph 20), 28px tile (radius 12, glyph 14–16), 20px health tile (`surface-icon-tile`, radius 6, glyph 12). Status variants use the matching `*-bg` fill and text colour. No emoji, no flat circles.

| Outline icon use | Box | Stroke | Colour |
|---|---|---|---|
| Row actions (copy, edit, delete) | 24 in a 32px button | Figma glyph | `icon` → `text-primary` on hover |
| Select chevron | 18 | 1.35 | `icon-chevron` |
| Disclosure chevron | 32 | 2 | `icon-chevron`, flips when open |
| Close (×) | 10 | — | `text-muted` |
| Back arrow | 20 | — | `currentColor` |
| Plus in primary button | 14 | 1.47 | white |
| Plus in subtle button / link | 16 / 14 | 1.47 | `currentColor` |
| Chevron in primary (next) | 14 | 1.35 | white, points inline-end |
| Search | 18 box | — | `text-muted` at 60% opacity |
| Upload | 32 | — | `text-muted` |
| Camera/tag/package/QR on camera tiles | 14–16 | 1.2–1.33 | `link` |
| Location, video (entity card) | 14 | 1.17 | `icon` |
| Expand (camera tile) | 16 | 1.33 | `icon` |
| Logout | 20 | filled | `text-muted` at 60% |

Direction-aware icons (`.ds-icon--dir`) mirror in RTL with `transform: scaleX(-1)`.

### Imagery

- Camera feeds sit on `surface-media` (`#0b0e13`, both themes) at 50% opacity, `object-fit: cover`.
- Detection frames: 2px solid `danger` (`#ff5825`, failed) or `success-glow` (`#10b981`, matched), radius 4, plus a 20px glow of the same colour at 30%.
- Avatars: photo inside a 1px `gradient-brand-ring` ring over `avatar-inner` fill, or initials (neutral `surface-avatar` with `border-avatar`, or brand `gradient-brand-avatar`).

### Density

Default density is the standard one. Compact is for data-heavy back-office pages; set `data-density="compact"` on `<html>` or a region. Never mix densities inside one card. Type, colours, radii, shadows and icon sizes never change.

| Token | Default | Compact |
|---|---|---|
| `--ds-size-control` | 40px | 36px |
| `--ds-size-control-sm` | 28px | 28px |
| `--ds-size-control-lg` | 48px | 44px |
| `--ds-size-icon-button` | 36px | 32px |
| `--ds-size-pagination-button` | 32px | 28px |
| `--ds-size-table-row` | 44px | 40px |
| `--ds-size-table-header` | 40px | 36px |
| `--ds-size-section-header` | 60px | 52px |
| `--ds-size-nav-item` | 44px | 40px |
| `--ds-space-cell-x` / `-cell-y` | 16 / 12px | 12 / 10px |
| `--ds-space-card` / `-card-lg` / `-card-xl` / `-card-entity` | 16 / 20 / 24 / 25px | 12 / 16 / 20 / 21px |
| `--ds-space-form-row` | 40px | 24px |
| `--ds-space-grid` / `-grid-lg` | 16 / 20px | 12 / 16px |

### Base and global CSS

Font loading (first line of the stylesheet):

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
```

Reset and globals (verbatim from the compiled stylesheet; `:root` tokens and the `[data-theme="light"]` block precede this):

```css
*, *::before, *::after { box-sizing: border-box; }

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
  font-size: var(--ds-font-size-body);          /* 14px */
  line-height: var(--ds-line-height-body);      /* 20px */
  color: var(--ds-color-text-secondary);        /* #cbd5e1 dark, #475569 light */
  background: var(--ds-color-bg-app) var(--ds-gradient-app) fixed;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, p, dl, dd, ol, ul, figure { margin: 0; }
ul, ol { padding: 0; list-style: none; }
button, input, select, textarea { font: inherit; color: inherit; }
button { background: none; border: 0; padding: 0; cursor: pointer; }
a:where([class]) { color: inherit; text-decoration: none; }   /* prose links keep the browser underline */
img, svg { display: block; }
[hidden] { display: none !important; }

:focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
:focus:not(:focus-visible) { outline: none; }
input:focus-visible, textarea:focus-visible, select:focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }

.ds-icon--dir:dir(rtl) { transform: scaleX(-1); }

@media (forced-colors: active) { .ds-dot, .ds-badge__dot, .ds-live__dot { forced-color-adjust: none; } }

.ds-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* Autofill would paint fields light; repaint on the opaque base */
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
```

Plus the increased-contrast rule described under Borders. The body itself carries only the app gradient; the ambient glows come from the shell pseudo-elements. Token naming: `--ds-<category>-<role>[-<variant>]`. The per-instance knobs `--ds-table-max-height`, `--ds-table-min-width` and `--ds-cell-max` are intentionally undeclared (components supply fallbacks).

## C3. Components

### Universal state matrix

Values below are the default dark theme (`:root`). `[data-theme="light"]` only remaps tokens; component CSS is identical. `[data-density="compact"]` shrinks `size-control` 40→36, `size-icon-button` 36→32, `space-card` 16→12, `space-card-xl` 24→20, `space-card-entity` 25→21. Every `:hover` / `:focus-visible` rule is also mirrored on `.is-hover` / `.is-focus-visible` / `.is-active` for static demos.

The one hairline colour (D-8): `border-edge` = `rgba(255,255,255,0.02)`. `border-hairline`, `border-glass`, `border-track`, `border-faint`, `border-subtle`, `border-control` are all aliases of it, so they're effectively invisible on navy. Glass surfaces draw it with `shadow-edge` = `inset 0 0 0 1px rgba(255,255,255,0.02)`, not a CSS `border`.

| State | Treatment (resolved) |
|---|---|
| Default | As specified per component |
| Hover | One step lighter. Glass → `surface-hover` `rgba(255,255,255,0.05)` or `border-control-hover` `rgba(255,255,255,0.20)`. Clickable cards → `filter: brightness(1.1)`. Never change the colour of a status element |
| Focus-visible | Global: `outline: 2px solid #3b82f6; outline-offset: 2px` (`focus-width`, `focus-ring`, `focus-offset`). Fields, triggers, toggles, radio cards: `outline-width: 1px; outline-offset: 0` (`focus-width-field`, `focus-offset-tight`). Menu rows: offset `-2px` (`focus-offset-inset`). Never removed (only `:focus:not(:focus-visible)` drops it) |
| Active / pressed | Same as hover. Primary keeps its gradient |
| Selected / current | Nav: `gradient-nav-active` + `shadow-card`. Tabs and toggles: `gradient-toggle-active` = `linear-gradient(180deg, rgba(59,130,246,0.42) 0%, rgba(37,99,235,0.18) 100%)` + `#ffffff` text. Menu options: `rgba(255,255,255,0.05)` + `#ffffff`. Picker rows: `surface-selected` `rgba(172,195,255,0.08)`. Pagination: `brand-strong` `#2563eb` |
| Disabled | `opacity: 0.4` + `pointer-events: none`, or `aria-disabled="true"` + `cursor: not-allowed` (stays focusable) |
| Error | Fields: `box-shadow: 0 0 0 1px #fb7185` (`error-ring`) prepended to the field shadows, plus a `validation` message (12/400/16 `#fb7185`). Status: `danger` pill |
| Loading | 16 px spinner replaces the leading icon, `aria-busy="true"`, clicks ignored. Skeletons (`rgba(255,255,255,0.06)`) replace content |
| Empty | §5.51 empty state inside the container |

Global base: Inter (400/500/600/700), body 14/20 `text-secondary` `#cbd5e1`, page background `#0b1020` + `linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%) fixed`. `box-sizing: border-box` everywhere. Icons are Lucide outline, 1.5 px stroke, `currentColor`, `aria-hidden`.

---

#### 5.1 Button
Use for: triggering an action (Save, Add camera, Next, Back, Export). Not for: icon-only actions (§5.2) or inline text actions (§5.3).
React: `<Button variant="primary|secondary|tertiary|subtle|tonal|ghost|danger" size="sm|md|lg" leading={Icon} trailing={Icon} loading softDisabled minWidth>`. Class: `.ds-btn` + `.ds-btn--{variant}` [+ `.ds-btn--sm|--lg`] [+ `.ds-btn--minw`]. `section` exists as a class only (`.ds-btn--section`).
| Part | Spec |
|---|---|
| Box | `inline-flex`, centred, gap `space-2` = 8px. Padding md `space-2-5 space-4` = 10px 16px; sm 6px 12px; lg 12px 20px. Radius `radius-control` = 12px. Height md: 40px borderless / 42px with 1px border; sm 28 / 30; lg 46 / 48. `--minw`: `min-width: 180px` (`size-header-button`), used on every header and footer primary |
| Fill | Per variant (see Variants) |
| Edge / border | Base `border: 0`. Bordered variants add `1px solid` (see Variants). `section` uses `box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02)`, no border |
| Shadow | primary `shadow-button-primary` = `0 4px 7px 0 rgba(37,99,235,0.35), inset 0 1px 0 0 rgba(255,255,255,0.28)`. tertiary `shadow-field` = `0 10px 24px -10px rgba(0,0,0,0.15)`. Others none |
| Text | `button-md` 14/600/20 (`.ds-ts-button-md`). sm `button-sm` 12/600/16. lg `button-lg` 16/600/22. `white-space: normal`, centred |
| Icon | Leading 14px (plus, changeover); 20px for back arrows and on `lg`; 16px on `subtle` md. Trailing 14px chevron. Gap 8px. `currentColor` |
| States | Hover per variant (below). Focus 2px `#3b82f6` outline, 2px offset. Disabled `opacity: 0.4; pointer-events: none` (`:disabled`) or `[aria-disabled="true"]` 0.4 + `not-allowed`. Loading: 16px spinner (`.ds-spinner`, 3px stroke, `currentColor`, 1s linear rotate) replaces leading icon, `aria-busy="true"` + `aria-disabled="true"`, trailing icon hidden. Transition 150ms `cubic-bezier(0.4,0,0.2,1)` on background, border, colour, shadow |
| Variants | **primary**: fill `linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)`, border `1px solid #3b82f6`, text `#ffffff`; hover fill `linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)`. **secondary** (light-blue CTA, row quick actions): fill `brand-tint-10` `rgba(59,130,246,0.10)`, border `1px solid transparent`, text `link` `#60a5fa`; hover `rgba(59,130,246,0.20)`. **tertiary** (Back, Cancel, Skip, Export): fill `gradient-glass` = `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)`, border `1px solid rgba(255,255,255,0.02)`, text `text-emphasis` `#e2e8f0`, `shadow-field`; hover border `rgba(255,255,255,0.20)`. **subtle** (View factory): fill `surface-control` `rgba(255,255,255,0.04)`, border `1px solid rgba(255,255,255,0.02)`, text `#e2e8f0`; hover fill `rgba(255,255,255,0.07)`. **section** (section-header action): fill `rgba(255,255,255,0.04)`, inset 1px `rgba(255,255,255,0.02)` shadow, text `#e2e8f0`; hover `rgba(255,255,255,0.07)`. **tonal**: fill `rgba(59,130,246,0.20)`, no border, text `brand-text` `#93c5fd`; hover `rgba(59,130,246,0.30)`. **ghost**: transparent, no border, text `text-muted` `#94a3b8`; hover fill `rgba(255,255,255,0.05)` + `#ffffff`. **danger**: fill `danger-bg` `rgba(255,88,37,0.10)`, border `1px solid rgba(255,88,37,0.20)`, text `danger-text` `#ff7043`; hover `rgba(255,88,37,0.20)` |

Markup:
```html
<button type="button" class="ds-btn ds-btn--primary ds-btn--minw">
  <svg aria-hidden="true" width="14" height="14"><!-- plus --></svg>
  <span>Add camera</span>
</button>
<button type="button" class="ds-btn ds-btn--tertiary" aria-busy="true" aria-disabled="true">
  <svg class="ds-spinner" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4" stroke-dashoffset="10" fill="none"/></svg>
  <span>Export</span>
</button>
```
Common mistakes:
- Making tertiary/subtle borders visible (e.g. `border-white/10`). The border is `rgba(255,255,255,0.02)`, which is effectively invisible; the button reads as a faint glass slab.
- Using a flat `bg-blue-600` primary, or forgetting the `1px #3b82f6` border and the inset top highlight in `shadow-button-primary`.
- Using `rounded-lg` (8px) or `rounded-full`. Every button size uses a 12px radius.

#### 5.2 Icon button
Use for: icon-only actions (row copy/edit/delete, drawer and modal close, sidebar collapse). Must have `aria-label` and a label tooltip. Not for: actions with a visible label.
React: `<IconButton icon={Icon} label="Edit" size="md|compact|sm" variant="close" tooltip iconSize>`. Class: `.ds-icon-btn` [+ `--compact|--sm`] [+ `--close`] [+ `--open`].
| Part | Spec |
|---|---|
| Box | md 36×36 (`size-icon-button`), compact 32×32, sm 28×28 (`size-control-sm`). Radius `radius-sm` = 8px. `inline-flex`, centred, `flex-shrink: 0` |
| Fill | transparent. close: `surface-sunken-button` `#121620` |
| Edge / border | none. close: `1px solid rgba(255,255,255,0.02)` (`border-subtle`) |
| Shadow | none. close: `shadow-close` = `inset 0 2px 4px 0 rgba(0,0,0,0.60), 0 1px 0 0 rgba(255,255,255,0.04)` (debossed) |
| Text | — |
| Icon | md 20px, compact 24px (row actions), sm 16px in React (spec table: 20), close 10px at 2px stroke. Stroke 1.5. Colour `text-muted` `#94a3b8`; `--open` uses `link` `#60a5fa` |
| States | Hover fill `rgba(255,255,255,0.05)` + icon `#ffffff`. close hover: border `rgba(255,255,255,0.20)` + `#ffffff`. Focus 2px `#3b82f6` outline, **offset 0**. Disabled 0.4 + `pointer-events: none` |
| Variants | Row actions sit in `.ds-row-actions` (flex, end-aligned, gap 12px) as `sm` buttons |

Markup:
```html
<div class="ds-row-actions">
  <button type="button" class="ds-icon-btn ds-icon-btn--sm" aria-label="Edit Line 1"><svg aria-hidden="true" width="16" height="16"/></button>
</div>
<button type="button" class="ds-icon-btn ds-icon-btn--close" aria-label="Close"><svg aria-hidden="true" width="10" height="10"/></button>
```
Common mistakes:
- Giving default icon buttons a visible border or a filled circle. Only `close` has a fill, and it is a sunken (inset-shadow) square with an 8px radius.
- Shipping without `aria-label` and tooltip.
- Adding focus offset 2px (it is 0 here).

#### 5.3 Link action
Use for: inline text actions ("+ Add New User") and related-record links in text or cells. Not for: primary actions.
React: `<LinkAction icon={Plus}>Add New User</LinkAction>`. Class: `.ds-link-action`; record link `.ds-entity-link`.
| Part | Spec |
|---|---|
| Box | `inline-flex`, gap 8px, `align-self: flex-start`, radius 4px (`radius-xs`, for the focus ring only). No padding |
| Fill | none |
| Edge / border | none |
| Shadow | none |
| Text | `link-action` 14/600/20, colour `brand` `#3b82f6`. `.ds-entity-link`: 500 weight, `link` `#60a5fa`, no underline |
| Icon | 14px plus, `currentColor` |
| States | Hover `link` `#60a5fa` (150ms colour transition). `.ds-entity-link` hover `link-hover` `#93c5fd` + underline, `text-underline-offset: 3px`. Focus 2px ring |
| Variants | `.ds-spin` (1s linear rotation, off under reduced motion) for a running-state glyph |

Markup:
```html
<button type="button" class="ds-link-action"><svg aria-hidden="true" width="14" height="14"/><span>Add New User</span></button>
<a class="ds-entity-link" href="/factories/12">Factory 12</a>
```
Common mistakes:
- Underlining the link action, or giving it button padding or a fill.
- Using `#60a5fa` at rest. Rest is `#3b82f6`; `#60a5fa` is the hover colour.

#### 5.4 Action group
Use for: rows of related actions (header, footer, modal). Not for: segmented choices (§5.14 / tabs).
React: no component; compose `<Button>`s. Class: `.ds-action-row`, `.ds-split` + `.ds-split__toggle`.
| Part | Spec |
|---|---|
| Box | `.ds-action-row`: flex, `justify-content: flex-end`, gap 16px, wraps. Header actions: filters → primary, 12px apart (`space-header-actions`). Drawer footer: tertiary at the inline-start; helper text + primary at the inline-end. Modal: tertiary (`min-width: 120px`) then primary (180px), 16px apart, end-aligned |
| Fill / Edge / Shadow | From the buttons inside |
| Variants | **Split button** `.ds-split` (`inline-flex`): first `.ds-btn` loses its inline-end radii. `.ds-split__toggle` is 40px wide, `padding: 0`, loses its inline-start radii, inline-start border `border-on-brand` `rgba(255,255,255,0.30)` |

Markup:
```html
<div class="ds-action-row">
  <button type="button" class="ds-btn ds-btn--tertiary">Cancel</button>
  <button type="button" class="ds-btn ds-btn--primary ds-btn--minw">Save</button>
</div>
<div class="ds-split">
  <button type="button" class="ds-btn ds-btn--primary">Export</button>
  <button type="button" class="ds-btn ds-btn--primary ds-split__toggle" aria-haspopup="menu" aria-expanded="false" aria-label="More export options"><svg aria-hidden="true"/></button>
</div>
```
Common mistakes:
- Using more than one primary per region.
- Using 8px gaps in modal footers (they are 16px) or 16px in header actions (they are 12px).

#### 5.5 Text input
Use for: single-line text entry. Not for: choosing from a list (§5.9).
React: `<TextInput type suffix="mm">` (password gets an eye toggle). Usually wrapped in `<Field>`. Class: `.ds-input` [+ `--suffix|--trailing|--date`], wrapper `.ds-input-wrap`.
| Part | Spec |
|---|---|
| Box | `width: 100%`, padding 10px 16px → 40px tall. Radius 12px (`radius-control`). `--suffix`: inline-end padding 48px. `--trailing`: inline-end padding 44px. `--date`: padding 0 12px, `color-scheme: dark` |
| Fill | `gradient-glass` = `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | `border: 0`. 1px edge = `shadow-edge` `inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Shadow | `box-shadow: 0 10px 24px -10px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.02)` (`shadow-field`, `shadow-edge`) |
| Text | `input-text` 14/400/20 `#ffffff`. Placeholder `text-placeholder` `rgba(203,213,225,0.60)`, `opacity: 1` |
| Icon | Suffix: 12/16 `#94a3b8`, absolutely positioned 16px from the inline-end, `pointer-events: none`. Trailing button: 24×24, 12px from the inline-end, radius 4px, `#94a3b8` at 0.7 opacity → `#ffffff` at 1 on hover or `aria-pressed="true"`; 18px eye glyph |
| States | Hover: no change. Focus: `1px solid #3b82f6` outline, offset 0. Error `[aria-invalid="true"]`: `box-shadow: 0 0 0 1px #fb7185, 0 10px 24px -10px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.02)`. Disabled 0.4. Autofill is repainted with `inset 0 0 0 1000px #0f172a` and `#ffffff` text |
| Variants | Increased contrast (`prefers-contrast: more` or `[data-contrast="more"]`): `border: 1px solid #6b7280` |

Markup:
```html
<div class="ds-input-wrap">
  <input id="w" class="ds-input ds-input--suffix" type="text" aria-describedby="w-msg" />
  <span class="ds-input__suffix" aria-hidden="true">mm</span>
</div>
```
Common mistakes:
- Adding `border border-white/10`. There's no CSS border, only a 2%-white inset shadow.
- Using a solid `bg-slate-800` or white-glass fill. The fill is a near-transparent **blue** (`#2563eb`) gradient.
- Using a 2px focus ring with offset. Fields use 1px, offset 0.

#### 5.6 Search input
Use for: filtering a list (header search, full-width table search). Not for: global command search with results (that is a §5.10 grouped menu).
React: `<SearchInput value onValueChange label="Search users" width="sm|md|lg|full">`. Class: `.ds-search` [+ `--sm|--md|--lg|--full`] > `.ds-search__icon` + `input.ds-input.ds-search__input` [+ `.ds-input__trailing.ds-search__clear`].
| Part | Spec |
|---|---|
| Box | §5.5 field. Input padding: inline-start 40px (`space-10`), inline-end 16px (44px when a clear button is present). Widths: sm 288px, md 320px, lg 360px, full 100%. Each also gets `max-width: 100%` |
| Fill / Edge / Shadow | As §5.5. In the **page header** actions they use the card surface instead: `gradient-glass` + `shadow-surface` (`0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)`), border transparent |
| Text | 14/400 `#ffffff`; placeholder `rgba(203,213,225,0.60)` |
| Icon | 16px search glyph (`size-ui-icon`, 1.75 stroke), 16px from the inline-start, vertically centred, `#94a3b8` at 0.6 opacity, `pointer-events: none`. Clear: 14px X in a 24px trailing button, 9px from the inline-end |
| States | As §5.5. Escape clears. `input[type="search"]` native cancel button hidden |

Markup:
```html
<div class="ds-search ds-search--sm">
  <span class="ds-search__icon"><svg aria-hidden="true" width="16" height="16"/></span>
  <input class="ds-input ds-search__input" type="search" aria-label="Filter factories" placeholder="Filter factories or units…" />
  <button type="button" class="ds-input__trailing ds-search__clear" aria-label="Clear search"><svg aria-hidden="true" width="14" height="14"/></button>
</div>
```
Common mistakes:
- Using a full-opacity white icon or an 18–20px glyph. It is 16px, slate, at 60% opacity.
- Rounding the input fully (`rounded-full`). It is 12px.

#### 5.7 Textarea
Use for: multi-line notes ("Notes (optional)"). Not for: single values.
React: `<Textarea rows={3}>`. Class: `.ds-input.ds-textarea`.
| Part | Spec |
|---|---|
| Box | `.ds-input` plus `height: auto; min-height: 80px; padding: 10px 16px; resize: vertical`. Value is top-aligned |
| Fill / Edge / Shadow / Text / States | Identical to §5.5 |

Markup:
```html
<textarea id="notes" class="ds-input ds-textarea" rows="3" placeholder="Add notes"></textarea>
```
Common mistakes:
- Giving it a different surface or a visible border from the input.
- Using a fixed height that can't be resized.

#### 5.8 Form field (label + control + message)
Use for: every labelled control in drawers, modals and full-page forms. Not for: read-only label/value lists (`.ds-fieldlist`).
React: `<Field label="Region" required help="…" error="…" caps><TextInput/></Field>` (wires `id`, `aria-invalid`, `aria-describedby`, `aria-required`). Class: `.ds-field` [+ `--caps`], grid `.ds-form-grid` [+ `--1|--3`], `.ds-form-section`.
| Part | Spec |
|---|---|
| Box | Column flex, gap 6px (`space-form-label`), `min-width: 0` |
| Label | `form-label` 12/500/16 `text-muted` `#94a3b8`. `--caps`: uppercase, `letter-spacing: 0.55px` (`form-label-caps`, used in compact modals) |
| Required | ` *` in `error-text` `#fb7185`, 2px inline-start margin, `aria-hidden`; the control gets `required` + `aria-required="true"` |
| Help | `helper` 12/400/16 `text-tertiary` `#8a99ae`, `margin-top: 2px` (so 8px below the control) |
| Error | `validation` 12/400/16 `#fb7185`, `margin-top: 2px`, `role="alert"`, linked by `aria-describedby`; the control gets `aria-invalid="true"` |
| Grid | `.ds-form-grid`: 2 equal columns, column gap 20px (`space-form-col`), row gap **40px** (`space-form-row`; 24px in compact density). `--1` one column, `--3` three. `.ds-span-2`, `.ds-span-all`. Below 1024px everything is one column |
| Section | `.ds-form-section`: column, gap 24px. `__title`: 14/400/18 `#ffffff`, `padding-bottom: 16px`, `border-bottom: 1px solid rgba(255,255,255,0.02)` |

Markup:
```html
<div class="ds-field">
  <label class="ds-field__label" for="region" id="region-label">Region<span class="ds-field__req" aria-hidden="true"> *</span></label>
  <input id="region" class="ds-input" required aria-required="true" aria-invalid="true" aria-describedby="region-msg" />
  <p class="ds-field__error" id="region-msg" role="alert">Enter a region name.</p>
</div>
```
Common mistakes:
- Using a white or 14px label. Labels are 12/500 slate `#94a3b8`.
- Using a tight 16px row gap in drawers. Form rows are 40px apart.
- Using red-500 for errors. Errors are rose `#fb7185`.

#### 5.9 Select (single choice)
Use for: choosing one option (header filters, form selects, date presets). Not for: several values (§5.11) or people (§5.19).
React: `<Select variant="filter|field" options value onChange placeholder leadIcon searchable action wideMenu>` (React default `variant="field"`). Class: `.ds-select` [+ `--160|--180|--200|--240|--w180`] > `button.ds-select__trigger.ds-select__trigger--{filter|field}`.
| Part | Spec |
|---|---|
| Box | Trigger: flex, `justify-content: space-between`, gap 8px, `width: 100%`, radius 12px, `border: 0`. filter padding 10px 12px 10px 16px; field padding 10px 14px 10px 16px. Both 40px tall. Widths: `--160` min 160px, `--180` min 180px (default filter width), `--200` min 200px, `--240` min 240px (date), `--w180` fixed 180px |
| Fill | `gradient-glass` `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)`; filter hover `gradient-glass-strong` `linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | filter: 1px stroke drawn by `::before` (`inset: 0; padding: 1px; background: linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))`, masked with `mask-composite: exclude`), no CSS border. field: `shadow-edge` inset `rgba(255,255,255,0.02)` |
| Shadow | filter: `shadow-control` `0 10px 24px 0 rgba(0,0,0,0.15)`. field: `0 10px 24px -10px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.02), 0 1px 2px 0 rgba(0,0,0,0.05)` |
| Text | 14/400/20, `text-align: start`. filter value `text-emphasis` `#e2e8f0`; field value `#ffffff`; placeholder `rgba(203,213,225,0.60)`. Value truncates |
| Icon | Chevron: 18×18 box, 7.2×3.6 path, 1.35px round stroke, `icon-chevron` `#6b7280`; rotates 180° when `aria-expanded="true"` (150ms). Optional lead icon `.ds-select__lead` 16px `#94a3b8` at 0.6 opacity (a selected status dot replaces it). `.ds-select__icon` 18px box for calendar glyph |
| States | Hover: filter → glass-strong; field → none. Focus 1px `#3b82f6`, offset 0. Open `aria-expanded="true"`. Error: `0 0 0 1px #fb7185` + field shadows. Disabled 0.4 + `pointer-events: none` |
| Variants | **filter**: headers, toolbars, DEOC single-choice form selects. **field**: multi-select and picker triggers. **In page-header actions**, the filter drops the `::before` stroke and uses `gradient-glass` + `shadow-surface` (`0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)`) |

Markup:
```html
<div class="ds-select ds-select--180">
  <button type="button" class="ds-select__trigger ds-select__trigger--filter" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="st-list" aria-label="Status: All Status">
    <span class="ds-select__value ds-truncate">All Status</span>
    <svg class="ds-select__chevron" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M5.4 7.2 9 10.8l3.6-3.6" stroke="#6b7280" stroke-width="1.35" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
</div>
```
Common mistakes:
- Using a native `<select>` or a visible `border-white/10` border. The stroke is a 2%-white 1px mask on `::before`.
- Using a white or lucide `ChevronDown` at 16–20px. Use the 18px grey `#6b7280` chevron with a thin 1.35px stroke.
- Using an opaque dark fill such as `bg-slate-900`.

#### 5.10 Dropdown menu (listbox)
Use for: the floating option list of a select, multi-select or command menu ("More actions", `role="menu"`). Not for: rich content (§5.47 popover).
React: rendered by `<Select>` / `<MultiSelect>`. Class: `.ds-menu` [+ `--wide|--up|--end`] > `.ds-menu__search`, `ul.ds-menu__list` > `li.ds-menu__option` [+ `--multi|--danger`], `.ds-menu__action`, `.ds-menu__empty`, `.ds-menu__group`.
| Part | Spec |
|---|---|
| Box | `position: absolute; top: 100%; margin-top: 4px; width: 100%`, z-index 50, `overflow: hidden`. Radius 12px (single-select); 8px when it has multi options. List `max-height: 260px`, scrolls. `--wide`: `width: max-content; min-width: 100%; max-width: min(420px, 90vw)`. `--up`: opens above with 4px margin. `--end`: anchored inline-end, `min-width: 180px` |
| Fill | `surface-raised` `#0c1325` (opaque) |
| Edge / border | none (edge is inside `shadow-float`) |
| Shadow | `shadow-float` = `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Text | Option: padding 10px 16px (40px), gap 8px, 14/400/20 `text-muted` `#94a3b8`. Group heading: 12/700/16, uppercase, 0.55px tracking, `#8a99ae`, padding 10px 16px 4px. Empty: 10px 16px, 14/20 `#94a3b8` |
| Icon | No selected check mark (`.ds-menu__check { display: none }`); the fill marks selection. Status options show an 8px dot. Action row: 16px plus |
| States | Hover / active-descendant (`.is-active`) / `aria-selected="true"`: fill `rgba(255,255,255,0.05)` + `#ffffff` text. Keyboard active row: 2px `#3b82f6` outline, offset -2px. `aria-disabled` 0.4 + `not-allowed`. Danger option: `#ff7043`, hover fill `rgba(255,88,37,0.10)` |
| Variants | **Search** row: padding 8px, `border-bottom: 1px solid rgba(255,255,255,0.02)`, holds a §5.6 search (shown when there are more than 5 options). **Action row** `.ds-menu__action`: `position: sticky; bottom: 0`, padding 10px 16px, `border-top: 1px solid rgba(255,255,255,0.02)`, fill `#0c1325`, 14/500 `brand-text` `#93c5fd` → `#ffffff` on hover |

Markup:
```html
<div class="ds-menu">
  <ul class="ds-menu__list" role="listbox" id="st-list" aria-label="Status">
    <li id="o-all" role="option" aria-selected="true" class="ds-menu__option">All Status</li>
    <li id="o-act" role="option" aria-selected="false" class="ds-menu__option is-active"><span class="ds-dot ds-dot--sm ds-dot--success" aria-hidden="true"></span>Active</li>
  </ul>
  <button type="button" class="ds-menu__action"><svg aria-hidden="true" width="16" height="16"/>Add region</button>
</div>
```
Common mistakes:
- Using a translucent or blurred glass menu. It is opaque `#0c1325` with a heavy drop shadow.
- Adding a check mark or brand-blue fill for the selected option. Selection is a 5%-white fill with white text.
- Adding a `border` around the panel.

#### 5.11 Multi-select
Use for: choosing several options from a list. Not for: free-text values (chips field) or a single choice.
React: `<MultiSelect options value={string[]} onChange>` (always the `field` trigger; shows joined labels, or "N selected" when they don't fit). Class: trigger `.ds-select__trigger--field`; options `li.ds-menu__option.ds-menu__option--multi` containing `.ds-check__box`.
| Part | Spec |
|---|---|
| Box | Trigger as §5.9 field. Menu radius 8px. Option gap 12px, padding 10px 16px |
| Fill | Option transparent, even when selected |
| Edge / border | Box: 16×16, radius 4px, `1px solid border-control-hover` `rgba(255,255,255,0.20)` |
| Shadow | Menu `shadow-float` (as §5.10) |
| Text | Option 14/400/20 `text-secondary` `#cbd5e1` (selected stays `#cbd5e1`) |
| Icon | Selected box: fill `brand-strong` `#2563eb`, border `#3b82f6`, white 10×8 check (1.6px stroke) |
| States | Hover fill `rgba(255,255,255,0.05)`. The menu stays open while toggling. `aria-multiselectable="true"` on the list |
| Variants | **Chips field** `.ds-input.ds-chips-field`: wrapping flex, gap 6px, `min-height: 40px`, `padding-block: 6px`, `height: auto`; focus ring on the field via `:focus-within` (1px `#3b82f6`); inner `.ds-chips-field__input` 28px tall, transparent, `min-width: 120px`. Removable chip `.ds-chip.ds-chip--removable` (gap 4px). **Toggle chip** `button.ds-chip.ds-chip--toggle[aria-pressed]`: off `rgba(255,255,255,0.04)` + border `rgba(255,255,255,0.02)` + `#94a3b8` (hover `#ffffff`); on `rgba(59,130,246,0.10)` + border `rgba(59,130,246,0.20)` + `#93c5fd`; focus offset 2px. Base chip: padding 3px 9px, radius 4px, fill `rgba(59,130,246,0.10)`, `1px solid transparent` |

Markup:
```html
<ul class="ds-menu__list" role="listbox" aria-multiselectable="true" aria-label="Lines">
  <li role="option" aria-selected="true" class="ds-menu__option ds-menu__option--multi">
    <span class="ds-check__box" aria-hidden="true"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></span>Line 1
  </li>
</ul>
```
Common mistakes:
- Highlighting selected rows with a fill. Only the checkbox shows state.
- Closing the menu after each toggle.
- Using a 12px menu radius. Multi menus are 8px.

#### 5.12 Checkbox
Use for: independent on/off options and table row selection. Not for: settings that apply instantly (§5.15) or exclusive choice (§5.13).
React: `<Checkbox checked indeterminate onChange disabled label>{children}</Checkbox>`. Class: `label.ds-check` > `input[type=checkbox]` + `.ds-check__box`.
| Part | Spec |
|---|---|
| Box | 16×16 (`size-checkbox`), radius 4px (`radius-xs`). Row gap 12px. The native input is absolutely positioned over the box with `opacity: 0` |
| Fill | unchecked transparent; checked / indeterminate `brand-strong` `#2563eb` |
| Edge / border | `1px solid rgba(255,255,255,0.20)` (`border-control-hover`); checked `#3b82f6` |
| Shadow | none |
| Text | Label 14/400/20 `text-secondary` `#cbd5e1` |
| Icon | Check 10×8, path `M1 4l2.5 2.5L9 1`, 1.6px stroke, `#ffffff`. Indeterminate: `M1 4h8` bar. Hidden until checked |
| States | Focus: 2px `#3b82f6` outline, 2px offset, on the **box** (`input:focus-visible + .ds-check__box`). Disabled: whole label 0.4 + `not-allowed`. Transition 150ms on background and border. Increased contrast raises the edge |

Markup:
```html
<label class="ds-check">
  <input type="checkbox" checked />
  <span class="ds-check__box" aria-hidden="true"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  <span>Send alerts</span>
</label>
```
Common mistakes:
- Using a browser-default or `accent-color` checkbox, or an 18–20px box.
- Using a 2px border or a 2px radius.

#### 5.13 Radio cards
Use for: one choice from 2–4 visible options. Not for: on/off status with coloured dots (§5.14) or long lists (§5.9).
React: `<RadioCards options={[{value,label}]} value onChange label|labelId vertical disabled>` (roving tabindex; arrows move and select). Class: `.ds-radio-group[role=radiogroup]` [+ `--vertical`] > `button.ds-radio-card[role=radio][aria-checked]` > `svg.ds-radio-glyph`.
| Part | Spec |
|---|---|
| Box | Group: flex wrap, gap 12px. Card: `flex: 1 1 0`, gap 8px, padding 10px 16px, radius 8px (`radius-sm`), 42px tall including the border |
| Fill | transparent; checked `surface-nested` `rgba(172,195,255,0.04)` |
| Edge / border | `1px solid rgba(255,255,255,0.20)` (`border-control-hover`); checked `brand-strong` `#2563eb` |
| Shadow | none |
| Text | 14/400/20 `text-placeholder` `rgba(203,213,225,0.60)`; checked `#ffffff` |
| Icon | 20px glyph: ring r=7.25, 1.5px stroke; when checked adds a filled r=4 dot. Colour `#94a3b8`; checked `brand` `#3b82f6` |
| States | Hover: **no change**. Focus 1px `#3b82f6`, offset 0. Disabled (group `aria-disabled`): cards 0.4 + `not-allowed`. 150ms transitions |

Markup:
```html
<div class="ds-radio-group" role="radiogroup" aria-labelledby="type-label">
  <button type="button" role="radio" aria-checked="true" tabindex="0" class="ds-radio-card">
    <svg class="ds-radio-glyph" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="4" fill="currentColor"/></svg>
    <span>Fixed</span>
  </button>
  <button type="button" role="radio" aria-checked="false" tabindex="-1" class="ds-radio-card">…</button>
</div>
```
Common mistakes:
- Using a 2%-white edge here. Radio cards are one of the few places with a visible 20%-white border.
- Filling the selected card with brand blue. It's a 4% blue-white tint with a `#2563eb` border.
- Adding a hover fill.

#### 5.14 Binary status toggle
Use for: setting an on/off status with labelled, coloured options (Active / Inactive). Not for: view switching (segmented tabs §5.39) or 3+ options (§5.13).
React: `<BinaryToggle options={[{value,label,dot:'success'|'error'|'warning'}]} value onChange label|labelId disabled>`. Class: `.ds-toggle[role=radiogroup]` > `button.ds-toggle__opt[role=radio][aria-checked]` [+ `--off` for the error option].
| Part | Spec |
|---|---|
| Box | Track: flex, padding **5px**, radius 12px (`radius-track`), 48px overall. Options: `flex: 1 1 0`, centred, gap 6px, padding 8px 16px (36px), radius 8px |
| Fill | Track `gradient-toggle` = `linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)`. Option transparent; selected `gradient-toggle-active` = `linear-gradient(180deg, rgba(59,130,246,0.42) 0%, rgba(37,99,235,0.18) 100%)` |
| Edge / border | Track `1px solid rgba(255,255,255,0.02)` (`border-subtle`, invisible in practice). Options: none |
| Shadow | none |
| Text | Option 14/500/20 `#94a3b8`; selected and hover `#ffffff` |
| Icon | 8px status dot (`.ds-dot.ds-dot--sm.ds-dot--success|error`) with glow: success `#34d399` + `0 0 10px 0 #10b981, 0 0 2px 0 #34d399`; error `#ff5825` + `0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825` |
| States | Hover option: `surface-hover-subtle` `rgba(255,255,255,0.03)` + `#ffffff`. Focus 1px `#3b82f6`, offset 0. Disabled: track `aria-disabled` 0.4 + `not-allowed`. Arrows move and select (roving tabindex) |

Markup:
```html
<div class="ds-toggle" role="radiogroup" aria-labelledby="status-label">
  <button type="button" role="radio" aria-checked="true" tabindex="0" class="ds-toggle__opt"><span class="ds-dot ds-dot--sm ds-dot--success" aria-hidden="true"></span>Active</button>
  <button type="button" role="radio" aria-checked="false" tabindex="-1" class="ds-toggle__opt ds-toggle__opt--off"><span class="ds-dot ds-dot--sm ds-dot--error" aria-hidden="true"></span>Inactive</button>
</div>
```
Common mistakes:
- Drawing a visible track border (`border-white/10`) or giving the selected pill its own border. Both are borderless in practice.
- Filling the selected pill with green or red. The pill is always the blue toggle gradient; only the dot carries the status.
- Using 4px track padding or a pill radius. The track is 5px padding / 12px radius; options are 8px radius.

#### 5.15 Switch
Use for: instantly applied settings. Not for: form values submitted later (§5.12).
React: `<Switch checked onChange label disabled>`. Class: `label.ds-switch-row` > `button.ds-switch[role=switch][aria-checked]` > `.ds-switch__thumb`.
| Part | Spec |
|---|---|
| Box | Track 36×20, radius 9999px. Thumb 16×16, `top: 2px; inset-inline-start: 2px`, round. Row: `inline-flex`, gap 12px |
| Fill | Off: track `color-track` `rgba(255,255,255,0.08)`, thumb `#94a3b8`. On: track `brand-strong` `#2563eb`, thumb `text-primary` `#ffffff` |
| Edge / border | none |
| Shadow | Off track `shadow-close` = `inset 0 2px 4px 0 rgba(0,0,0,0.60), 0 1px 0 0 rgba(255,255,255,0.04)`; on: none |
| Text | Label `.ds-text-body` 14/400/20 `#cbd5e1` |
| States | On: thumb `translateX(16px)` (RTL −16px), 150ms standard ease. Focus 2px `#3b82f6`. Disabled 0.4 + `not-allowed` |

Markup:
```html
<label class="ds-switch-row">
  <button type="button" role="switch" aria-checked="true" class="ds-switch"><span class="ds-switch__thumb" aria-hidden="true"></span></button>
  <span class="ds-text-body">Email alerts</span>
</label>
```
Common mistakes:
- Using a 44×24 iOS-style switch or a green "on" track.
- Using a flat off-track. It is inset (debossed) with `shadow-close`.

#### 5.16 Date range picker
Use for: choosing a period. Presets (Today, Last 7 days, Last 8 weeks) use a §5.9 filter select; a custom range opens a popover. Not for: a single date (use `.ds-input--date`).
React: `<DateRangePicker from to onChange label>`. Class: `.ds-select.ds-select--240` > `button.ds-select__trigger.ds-select__trigger--filter[aria-haspopup=dialog]` + `.ds-select__icon`; popover holds a `.ds-form-grid` of two `input.ds-input.ds-input--date`.
| Part | Spec |
|---|---|
| Box | Trigger as §5.9 filter, min-width 240px (`size-filter-date`). Popover (§5.47) width 360px; inside, form grid gaps column 12px / row 16px |
| Fill / Edge / Shadow | Trigger as §5.9 filter |
| Text | Value "12 Mar 2026 - 18 Mar 2026" / "From …" / "Until …" / "All Dates", 14/400 `#e2e8f0` |
| Icon | Calendar glyph in an 18px `.ds-select__icon` box (16px, stroke 1), `#6b7280`; replaces the chevron |
| States | Invalid range (from > to): `aria-invalid` on "To", rose `validation` message, Apply soft-disabled. Footer: ghost sm "Clear", primary sm "Apply" |

Markup:
```html
<div class="ds-select ds-select--240">
  <button type="button" class="ds-select__trigger ds-select__trigger--filter" aria-haspopup="dialog" aria-expanded="false" aria-controls="dr-pop" aria-label="Date range: All Dates">
    <span class="ds-select__value ds-truncate">All Dates</span>
    <span class="ds-select__icon"><svg aria-hidden="true" width="16" height="16"/></span>
  </button>
</div>
```
Common mistakes:
- Opening a full calendar library with light styling. Use native `type="date"` inputs with `color-scheme: dark` in a popover.
- Showing both chevron and calendar. The calendar replaces the chevron.

#### 5.17 File upload (dropzone)
Use for: attaching a reference image. Not for: a value that can be typed or extracted (§5.18).
React: `<FileUpload title="Upload Reference" accept={['image/jpeg','image/png']} maxMb={5} multiple labelledBy>`. Class: `.ds-dropzone[role=button]` > `.ds-dropzone__icon`, `.ds-dropzone__title`, `.ds-dropzone__hint`; list `ul.ds-file-list`.
| Part | Spec |
|---|---|
| Box | Column flex, centred, gap 8px, padding 24px, `width: 100%`, radius 12px |
| Fill | `gradient-glass` `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | `1px dashed rgba(255,255,255,0.02)` (`border-control`; a CSS border, dashed) |
| Shadow | none |
| Text | Title 14/500/20 `#cbd5e1`. Hint 12/400/16 `rgba(203,213,225,0.60)`, wrapping row with gap 6px and "•" separators, 2px below the title (`margin-top: -6px` offsets the 8px gap) |
| Icon | 32px upload glyph, `#94a3b8` at 0.6 opacity |
| States | Hover / `.is-dragover` / focus-visible: border `#3b82f6` (focus replaces the outline: `outline: none`). Error `[aria-invalid="true"]`: border `#fb7185` + `.ds-field__error` message. Busy: title "Uploading…", `aria-busy`. Enter/Space open the file dialog; the file input sits outside the button (`.ds-sr-only`). Increased contrast: border `#6b7280` |
| Variants | Filled: `.ds-file-list` (column, gap 8px, `margin-top: 8px`); each `li` padding 8px 12px, radius 8px, fill `rgba(172,195,255,0.04)`, 12/16 `#cbd5e1`, 32×32 thumbnail (radius 4px, `object-fit: cover`) and an `sm` icon button "Remove" |

Markup:
```html
<div class="ds-dropzone" role="button" tabindex="0" aria-describedby="ref-label">
  <span class="ds-dropzone__icon"><svg aria-hidden="true" width="32" height="32"/></span>
  <p class="ds-dropzone__title">Upload Reference</p>
  <p class="ds-dropzone__hint"><span>Drag and drop an image, or click to browse</span><span aria-hidden="true">•</span><span>JPG, PNG (Max 5 MB)</span></p>
</div>
<input type="file" class="ds-sr-only" tabindex="-1" aria-hidden="true" accept="image/jpeg,image/png" />
```
Common mistakes:
- Using a bright `border-dashed border-slate-500`. The dash is 2% white at rest and turns `#3b82f6` on hover.
- Nesting the `<input type=file>` inside the `role=button` element.

#### 5.18 Field with attach button
Use for: a value that can be typed or extracted from a photo (barcode). Not for: plain uploads (§5.17).
React: `<AttachField id value onValueChange error>`. Class: `.ds-attach` > `.ds-attach__field` (> `.ds-attach__thumb` + `input.ds-attach__input`) + `button.ds-attach__btn`.
| Part | Spec |
|---|---|
| Box | Wrapper flex wrap, gap 12px. Field: `flex: 1 1 240px`, `min-height: 40px`, padding 0 16px, gap 10px, **radius 8px**. Button: height 40px, padding 8px 14px, gap 6px, radius 8px. Thumb 20×20 with 3px padding; clear dot 14×14 at `top: -6px; inset-inline-end: -6px` |
| Fill | Field `gradient-glass` (as §5.5). Button `surface-control` `rgba(255,255,255,0.04)`. Clear dot `#0c1325` |
| Edge / border | Field: no border, `shadow-edge` inset `rgba(255,255,255,0.02)`. Button: `1px solid rgba(255,255,255,0.02)` (`border-glass`). Clear dot `1px solid rgba(255,255,255,0.02)` |
| Shadow | Field `0 10px 24px -10px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.02)`. Button `0 10px 24px -10px rgba(0,0,0,0.15)` |
| Text | Input 14/20 `#ffffff`, placeholder `rgba(203,213,225,0.60)`. Button 14/500/20 `#cbd5e1`, nowrap |
| Icon | Button 18px image-plus glyph. Thumbnail at 0.6 opacity, radius 4px |
| States | Focus: wrapper `:focus-within` draws 1px `#3b82f6` outline, offset 0 (the inner input has none). Error (`:has([aria-invalid])` or `--error`): `0 0 0 1px #fb7185` + field shadows. Button hover `opacity: 0.8`. Busy: placeholder "Scanning…" |

Markup:
```html
<div class="ds-attach">
  <div class="ds-attach__field">
    <input id="code" class="ds-attach__input" placeholder="Type the code or upload a photo" />
  </div>
  <button type="button" class="ds-attach__btn" aria-label="Upload photo for code"><svg aria-hidden="true" width="18" height="18"/>Upload</button>
</div>
```
Common mistakes:
- Using a 12px radius. This field and its button are 8px.
- Putting the focus ring on the inner input instead of the wrapper.

#### 5.19 Rich picker (entity select with avatar rows)
Use for: choosing a person or entity with identity details (Factory Admin). Not for: plain text options (§5.9).
React: `<RichPicker people={[{id,name,role,email,code,online}]} value onChange placeholder="Choose user" actionLabel="Add User" onAdd>`. Class: `.ds-select.ds-select--rich` > field trigger; panel `.ds-picker` > `ul.ds-menu__list.ds-picker__list` > `li.ds-picker-row` + `button.ds-picker-footer`.
| Part | Spec |
|---|---|
| Box | Trigger: §5.9 field, gap 12px; 12px block padding once a person is chosen. Panel: absolute, `top: 100%; margin-top: 4px; width: 100%`, z 50, radius 8px, `overflow: hidden`, list `max-height: 280px`. Row: gap 14px, padding 14px 14px 14px 16px. Footer: padding 10px 0, centred, gap 8px, bottom radii 8px |
| Fill | Panel `#0c1325`. Row transparent. Footer `surface-nested` `rgba(172,195,255,0.04)` → hover `rgba(172,195,255,0.08)` |
| Edge / border | Panel none. Rows `border-bottom: 1px solid rgba(255,255,255,0.02)` (`border-control`) |
| Shadow | Panel `shadow-float` = `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)`. Avatar `shadow-avatar` `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` |
| Text | Line 1: name 12/600/16 `#ffffff`, gap 8px, then an info chip (employee ID: padding 3px 9px, radius 4px, `rgba(59,130,246,0.10)`) and the role in `.ds-ts-caption` 10/400/14 `#8a99ae`. Line 2: 12/16 `#94a3b8`, truncates. Lines 1.5px apart. Footer 14/20 `brand` `#3b82f6` |
| Icon | 40px brand avatar (`linear-gradient(45deg, #1d4ed8 0%, #6366f1 100%)`, `1px solid rgba(147,197,253,0.30)`, initials 12/700 `#ffffff`). 11px mail glyph on line 2. 16px plus-square in the footer |
| States | Row hover / active `surface-hover-subtle` `rgba(255,255,255,0.03)`. `aria-selected="true"` `surface-selected` `rgba(172,195,255,0.08)`. Keyboard active: 2px `#3b82f6` outline, offset -2px. Search row when more than 5 people. Accessible name: "Name, role, email" |

Markup:
```html
<div class="ds-picker">
  <ul class="ds-menu__list ds-picker__list" role="listbox" aria-label="Factory Admin">
    <li role="option" aria-selected="false" class="ds-picker-row">
      <span class="ds-rich-row">
        <span class="ds-avatar" aria-hidden="true">RG</span>
        <span class="ds-picker-row__text">
          <span class="ds-picker-row__line1">Riya Goyal<span class="ds-chip">EMP-104</span><span class="ds-ts-caption">Plant Manager</span></span>
          <span class="ds-picker-row__line2"><svg aria-hidden="true" width="11" height="11"/><span class="ds-truncate">riya@example.com</span></span>
        </span>
      </span>
    </li>
  </ul>
  <button type="button" class="ds-picker-footer"><svg aria-hidden="true" width="16" height="16"/>Add User</button>
</div>
```
Common mistakes:
- Using 14px names and 32px grey avatars. Names are 12/600; avatars are 40px brand gradient circles.
- Using a 12px panel radius or a visible divider. The panel is 8px and the dividers are 2% white.

#### 5.20 Inline callout
Use for: a neutral note inside a form. Not for: status messages (§5.21) or transient feedback (toast).
React: `<Callout title="…">body</Callout>`. Class: `.ds-callout` > `.ds-callout__title` + `.ds-callout__body`.
| Part | Spec |
|---|---|
| Box | Column flex, gap 4px, padding 14px, radius 8px |
| Fill | `surface-nested` `rgba(172,195,255,0.04)` |
| Edge / border | `1px solid rgba(255,255,255,0.02)` (`border-glass`) |
| Shadow | none |
| Text | Title `small-strong` 12/600/16 `#cbd5e1`. Body 12px, line-height 1.45, `#94a3b8` |

Markup:
```html
<div class="ds-callout"><p class="ds-callout__title">Camera placement</p><p class="ds-callout__body">Mount within 2 m of the line.</p></div>
```
Common mistakes:
- Using a blue info tint for a neutral note.
- Setting the body at 14px.

#### 5.21 Inline alert
Use for: persistent status messages inside a container (errors, warnings, success, info). Not for: transient confirmations (toast).
React: `<InlineAlert tone="info|success|warning|error" title onDismiss>`. Class: `.ds-callout.ds-callout--{tone}` > icon + `.ds-callout__content` (> title + body) + `.ds-callout__dismiss`.
| Part | Spec |
|---|---|
| Box | Row flex, `align-items: flex-start`, gap 8px, padding 12px 14px, radius 8px. Content column gap 4px. Dismiss pushed to the inline-end |
| Fill | error `rgba(255,88,37,0.10)`; success `rgba(16,185,129,0.10)`; warning `rgba(251,191,36,0.10)`; info `rgba(59,130,246,0.10)` |
| Edge / border | 1px solid: error `rgba(255,88,37,0.20)`; success `rgba(16,185,129,0.20)`; warning `rgba(251,191,36,0.20)`; info `rgba(59,130,246,0.20)` |
| Shadow | none |
| Text | Title 12/600/16 and body 12px/1.45 in the tone text colour: error `#ff7043`, success `#34d399`, warning `#fbbf24`, info `#93c5fd` |
| Icon | 16px: info (in `#3b82f6`), check-circle, alert-triangle, alert-circle (`currentColor`). Dismiss: `sm` icon button |
| States | `role="alert"` for error, `role="status"` otherwise |

Markup:
```html
<div class="ds-callout ds-callout--error" role="alert">
  <svg aria-hidden="true" width="16" height="16"/>
  <div class="ds-callout__content"><p class="ds-callout__title">Stream offline</p><p class="ds-callout__body">Camera 3 stopped at 14:02.</p></div>
  <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-callout__dismiss" aria-label="Dismiss"><svg aria-hidden="true"/></button>
</div>
```
Common mistakes:
- Using Tailwind `red-500`. The danger tone is orange-red `#ff5825` / `#ff7043`, and warnings are amber `#fbbf24`.
- Using opaque fills. Fills are 10% tints.

#### 5.22 Stepper (multi-step progress)
Use for: progress through a multi-step flow (drawer headers, full-page forms). Not for: navigation between independent views (tabs).
React: `<Stepper steps={[{title, sub}]} current={index}>`. Class: `ol.ds-stepper[aria-label=Progress]` > `li.ds-step` [+ `--done`] [`aria-current="step"`] > `.ds-step__index` + `.ds-step__text` (> `__title` + `__sub`).
| Part | Spec |
|---|---|
| Box | Step: flex, `flex: 1 1 0` (last: auto). Index 32×32 (`size-pagination-button`), radius 8px, centred. Text block: 12px inline-start padding, 12/16. Connector `::after`: `flex: 1`, height 2px, `min-width: 16px`, margin 0 16px |
| Fill | Upcoming index `surface-sunken-button` `#121620`. Current `brand-strong` `#2563eb`. Done `success-glow` `#10b981`. Connector `stepper-track` `#1f2636`; after the current and done steps `linear-gradient(90deg, rgba(59,130,246,0.60) 0%, #1f2636 100%)` |
| Edge / border | Upcoming `1px solid border-strong` `rgba(255,255,255,0.08)`. Current and done `1px solid rgba(147,197,253,0.40)` (`stepper-active-border`) |
| Shadow | Upcoming `inset 0 2px 4px 0 rgba(0,0,0,0.60)`. Current and done `0 0 0 2px rgba(59,130,246,0.20), 0 0 20px -2px rgba(37,99,235,0.45), inset 0 1px 1px 1px rgba(255,255,255,0.35)` |
| Text | Index number 12/500 `#94a3b8`; current 12/600 `#ffffff`. Title: upcoming 12/500 `#cbd5e1`; current and done 12/700, `letter-spacing: 0.3px`, `#ffffff`. Sub: upcoming 12/400 `#8a99ae`; current "In progress" 12/500 `link` `#60a5fa`; done "Completed" 12/500 `#34d399`. All nowrap |
| Icon | Done: 16px white tick in place of the number |
| States | Next step (index and text, not the connector) at opacity 0.5, later steps 0.4. Done steps get a visually hidden "(completed)". Below 640px only the current step's text is shown |

Markup:
```html
<ol class="ds-stepper" aria-label="Progress">
  <li class="ds-step ds-step--done"><span class="ds-step__index"><svg aria-hidden="true" width="16" height="16"/></span><span class="ds-step__text"><span class="ds-step__title">Details<span class="ds-sr-only"> (completed)</span></span><span class="ds-step__sub">Completed</span></span></li>
  <li class="ds-step" aria-current="step"><span class="ds-step__index">2</span><span class="ds-step__text"><span class="ds-step__title">Cameras</span><span class="ds-step__sub">In progress</span></span></li>
  <li class="ds-step"><span class="ds-step__index">3</span><span class="ds-step__text"><span class="ds-step__title">Review</span><span class="ds-step__sub">Confirm setup</span></span></li>
</ol>
```
Common mistakes:
- Using round step circles. Indices are 32px squares with an 8px radius.
- Drawing a flat 1px grey connector. It is 2px, and active segments fade blue → track.
- Leaving upcoming steps at full opacity.

#### 5.23 KPI card
Use for: one headline metric in a row of 3–6. Not for: records (§5.24) or charts (§5.25).
React: `<KpiCard label value icon={<img/>} ball="success|error" delta={{dir,text}} pressed onToggle>` (with `onToggle` it renders a `<button aria-pressed>`). Class: `.ds-kpi-row` > `.ds-kpi` > `.ds-kpi__icon` + `.ds-kpi__text` (> `__label` + `__value` [+ `__delta`]).
| Part | Spec |
|---|---|
| Box | Flex, `align-items: center`, gap 12px, `min-height: 76px` (`size-kpi-card`), padding 16px (`space-card`), **radius 24px** (`radius-panel`). Row: flex, gap 16px, children `flex: 1 1 0`; below 1280px `grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr))` |
| Fill | `gradient-glass-kpi` = `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | No CSS border. `inset 0 0 0 1px rgba(255,255,255,0.02)` via `shadow-edge` |
| Shadow | `box-shadow: 0 12px 28px 0 rgba(0,0,0,0.20), 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.02)` (`shadow-glass`, `shadow-kpi-lift`, `shadow-edge`) |
| Text | Label `kpi-label` 12/700/16, uppercase, 0.55px tracking, `#94a3b8`, one line with ellipsis. Value `kpi-value` 20/700/28, −0.65px tracking, `#ffffff`, `tabular-nums`, ellipsis. Label sits directly above the value (no gap) |
| Icon | 40×40 3D illustration (`size-kpi-icon`), decorative, no tile behind it. Optional status ball: 14px at the icon's bottom-right; success `#10b981` + `0 0 10px 0 #10b981, 0 0 2px 0 #34d399`; error `#ff5825` + `0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825` |
| States | Clickable (`button.ds-kpi`): hover `filter: brightness(1.1)`; `aria-pressed="true"` swaps the edge for `inset 0 0 0 1px #3b82f6` |
| Variants | Delta line `.ds-kpi__delta` 12/16: up `#34d399`, down `#ff7043` |

Markup:
```html
<div class="ds-kpi-row">
  <div class="ds-kpi">
    <div class="ds-kpi__icon" aria-hidden="true"><img class="ds-illus" src="camera.png" alt="" width="40" height="40" /></div>
    <div class="ds-kpi__text"><p class="ds-kpi__label">Active cameras</p><p class="ds-kpi__value">24 / 26</p></div>
  </div>
</div>
```
Common mistakes:
- Using a 1px `border-white/10` and a 16px radius. KPI cards have **no border** (2%-white inset only) and a **24px** radius.
- Using a pastel → white or `from-blue-500/20 to-transparent` gradient. The fill is a near-invisible 2.5% → 1% `#2563eb` gradient over the navy page.
- Putting the icon in a coloured square tile, or stacking the value above the label.

#### 5.24 Entity card (content card)
Use for: summarising one record (a factory) with status, a headline metric and an owner. Not for: single metrics (§5.23).
React: `<EntityCard title location icon status={{tone,label}} metric={{value,of,unit,tone}} meta={{icon,text}} owner role actionLabel onAction headingLevel>`. Class: `article.ds-entity` [+ `--link`] > `__header`, `__well`, `__footer`; grid `.ds-entity-grid` [+ `--4`].
| Part | Spec |
|---|---|
| Box | Column flex, gap 20px (`space-card-gap`), padding **25px** (`space-card-entity` = 24 + 1px edge), radius **16px** (`radius-card`). Grid: `repeat(auto-fill, minmax(min(400px, 100%), 1fr))`, gap 20px |
| Fill | `gradient-glass` = `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | No CSS border. `inset 0 0 0 1px rgba(255,255,255,0.02)` inside `shadow-surface` |
| Shadow | `shadow-surface` = `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Text | Name `entity-title` 20/600/28, −0.4px, `#ffffff`. Place 14px/16px `#94a3b8`, 4px below the name. Metric value `metric-value` 20/700/28, −0.65px, `#ffffff`; denominator 14/400/20 `#94a3b8`, 6px after it, baseline-aligned. Meta 14/20 `#94a3b8`. Owner 16/500/22 `#cbd5e1`; role 12/16 `brand` `#3b82f6`, 2px below |
| Icon | Header: 40×40 3D crop (no tile behind it), 12px gap. Location 14px and meta video 14px glyphs in `icon` `#64748b`. Footer avatar: 36px neutral (`#18202d` fill, `1px solid #334155`, initials 14/500 `#cbd5e1`), gap 10px |
| States | `--link` (whole card opens the record): `cursor: pointer`, hover `brightness(1.1)`. The footer button is the keyboard-reachable control |
| Variants | **Header**: space-between, centred; glass status pill (§5.27) at the inline-end. **Metric well** `__well`: `surface-nested` `rgba(172,195,255,0.04)`, radius 12px, padding 16px, gap 8px; contains a value row and a 4px progress bar (track `rgba(255,255,255,0.08)`, fill success `linear-gradient(90deg, #34d399 0%, #10b981 100%)`, warning `#fbbf24`, error `#ff5825`, radius 9999px). **Footer**: owner + **subtle** button "View factory" with padding 9px 16px 9px 12px (40px with border) and a trailing 14px chevron. **Counts variant**: `dl.ds-entity__stats` grid (gap 12px) of `.ds-entity__stat` boxes (`rgba(172,195,255,0.04)`, radius 12px, padding 16px; 12px below 640px) with `kpi-label` above `kpi-value`; also available standalone as `.ds-stat-tile`. **`--4` grid**: 1 col, 2 from 768px, 4 from 1536px. Status changes only the pill and the progress tone |

Markup:
```html
<article class="ds-entity">
  <div class="ds-entity__header">
    <div class="ds-entity__lead">
      <span class="ds-entity__icon" aria-hidden="true"><img class="ds-illus" src="factory.png" alt="" /></span>
      <span class="ds-entity__titles"><h3 class="ds-text-card-title">Factory 1</h3><span class="ds-entity__place"><svg aria-hidden="true" width="14" height="14"/>Pune</span></span>
    </div>
    <span class="ds-badge ds-badge--success ds-badge--glass"><span class="ds-badge__dot" aria-hidden="true"></span><span>Active</span></span>
  </div>
  <div class="ds-entity__well">
    <div class="ds-entity__wellrow">
      <span class="ds-entity__value" aria-label="4 of 6 lines active"><b class="ds-text-metric-value">4</b><span class="ds-text-body-muted">/ 6 lines active</span></span>
      <span class="ds-entity__meta"><svg aria-hidden="true" width="14" height="14"/>24 cameras</span>
    </div>
    <div class="ds-progress-row"><div class="ds-progress ds-progress--success" role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100" aria-label="Factory 1: 4 of 6 lines active"><span style="width:67%"></span></div></div>
  </div>
  <div class="ds-entity__footer">
    <span class="ds-entity__who"><span class="ds-avatar ds-avatar--neutral" aria-hidden="true">AK</span><span><b>Anil Kumar</b><span class="ds-entity__role">Plant Manager</span></span></span>
    <button type="button" class="ds-btn ds-btn--subtle" aria-label="View factory: Factory 1">View factory<svg aria-hidden="true" width="14" height="14"/></button>
  </div>
</article>
```
Common mistakes:
- Adding `border border-white/10` or using a 24px radius. Entity cards are borderless (2%-white inset) with a 16px radius and 25px padding.
- Using a `from-slate-800 to-slate-900` or pastel gradient card. The fill is the same near-transparent blue glass as fields.
- Putting the 3D icon on a coloured tile, or dimming inactive records. Only the pill changes.

#### 5.25 Dashboard card (chart / data container)
Use for: holding a chart or table with a title row ("Quality Snapshot", "Defect Distribution"). Not for: single metrics (§5.23).
React: `<DashCard title subtitle right={controls} flush id>`. Class: `section.ds-dash-card` [+ `--flush`] > `__header` (> title block + `__right`) + `__body`; row `.ds-dash-row`.
| Part | Spec |
|---|---|
| Box | Column flex, gap 20px (`space-chart-gap`), padding **24px** (`space-card-xl`), radius **16px**. Header: flex, space-between, wraps, gap 16px, `min-height: 40px`. Controls `__right`: gap 20px, end-aligned. `.ds-dash-row`: flex, gap 20px, stretch |
| Fill | `gradient-glass` = `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | No CSS border; `inset 0 0 0 1px rgba(255,255,255,0.02)` via `shadow-surface` |
| Shadow | `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Text | Title `card-title` 20/600/24, −0.4px, `#ffffff`, `h2`. Subtitle 14/400/20 `text-chart-subtle` `#9eacba`, 5px below |
| Variants | **flush**: padding 24px 0 0, `overflow: hidden`; header keeps 24px side padding; body gets `border-top: 1px solid rgba(255,255,255,0.02)` and the table runs edge to edge. A header `.ds-link-action` is centred with the controls |

Markup:
```html
<section class="ds-dash-card" aria-labelledby="qs">
  <div class="ds-dash-card__header">
    <div><h2 class="ds-dash-card__title" id="qs">Quality Snapshot</h2><p class="ds-dash-card__subtitle">Last 7 days</p></div>
    <div class="ds-dash-card__right"><!-- legend, filter, tabs --></div>
  </div>
  <div class="ds-dash-card__body"><!-- chart --></div>
</section>
```
Common mistakes:
- Wrapping the chart in a nested bordered panel. The body sits directly on the card.
- Using 16px card padding or a 24px radius. Dashboard cards are 24px padding / 16px radius.

#### 5.26 Status card (status bar + list)
Use for: running vs stopped counts with the stopped items listed ("Line Status", "Camera Status"). Not for: trends (charts).
React: `<StatusCard title running={n} stopped={n}>{table}</StatusCard>`. Class: `section.ds-dash-card.ds-status-card` > `.ds-dash-card__header` (> title + `.ds-legend-dots`) + segbar + `.ds-status-card__well`.
| Part | Spec |
|---|---|
| Box | §5.25 surface, but padding **25px** (`space-card-entity`), gap 20px, `overflow: hidden`. Header 40px min. Well: `flex: 1`, negative margins `0 -25px -25px` so the table runs edge to edge |
| Fill | `gradient-glass` (as §5.25) |
| Edge / border | Card: `shadow-edge` inset 2% white only. Well `border-top: 1px solid rgba(255,255,255,0.02)` |
| Shadow | `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Text | Title as §5.25. Legend `.ds-legend-dots`: flex wrap, gap 20px; items 12/500/16 `#8a99ae` (`legend-sm`), gap 8px |
| Icon | Legend dots 12×12 round: running `#34d399`, stopped `#ff5825` |
| Variants | Segmented bar (§5.34 md): height 20px, radius 6px, `overflow: hidden`; segments `flex-grow: value`, `min-width: 28px`, counts 12/600 line-height 1 `text-on-bright` `#0b0f14` in the segment; colours running `#34d399`, stopped `#ff5825`; `role="img"` + `aria-label="18 running, 2 stopped"`. Table (§5.41) capped at five rows under a pinned header |

Markup:
```html
<section class="ds-dash-card ds-status-card" aria-labelledby="ls">
  <div class="ds-dash-card__header">
    <h2 class="ds-dash-card__title" id="ls">Line Status</h2>
    <div class="ds-legend-dots"><span class="ds-legend-dot"><i style="background:#34d399" aria-hidden="true"></i>Running</span><span class="ds-legend-dot"><i style="background:#ff5825" aria-hidden="true"></i>Stopped</span></div>
  </div>
  <div class="ds-segbar" role="img" aria-label="18 running, 2 stopped"><span class="ds-segbar__seg" style="flex-grow:18;background:#34d399">18</span><span class="ds-segbar__seg" style="flex-grow:2;background:#ff5825">2</span></div>
  <div class="ds-status-card__well"><!-- table --></div>
</section>
```
Common mistakes:
- Using Tailwind green-500 / red-500. Running is `#34d399`, stopped is `#ff5825`, and the counts are near-black on the segment.
- Indenting the table inside the card padding. It must run edge to edge under a divider.

#### 5.27 Badge (status pill)
Use for: the state of a record (Active, Inactive, Stopped, Matched, Not Matched, Running) and the "Live" indicator. Not for: categories (tag §5.29), counts (§5.30) or a bare dot (§5.28).
React: `<Badge tone="success|warning|error|info|neutral" size="md|sm" appearance="tinted|glass">Label</Badge>`; `<LiveBadge>Live</LiveBadge>`. Class: `.ds-badge.ds-badge--{tone}` [+ `--sm`] [+ `--glass`] > `.ds-badge__dot` + label; `.ds-live` > `.ds-live__dot`.
| Part | Spec |
|---|---|
| Box | `inline-flex`, gap 6px, padding 4px 12px, radius 9999px, nowrap; 30px tall (20 + 8 + 2 border). sm: padding 2px 8px (22px). Dot 6×6 round (`size-badge-dot`) |
| Fill | Tinted: success `rgba(16,185,129,0.10)`; warning `rgba(251,191,36,0.10)`; error `rgba(255,88,37,0.10)`; info `rgba(59,130,246,0.10)`; neutral `rgba(255,255,255,0.04)`. Glass: `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | `1px solid transparent`. **No visible border** in any tone (product decision 2026-11-03) |
| Shadow | Tinted none. Glass `shadow-control` `0 10px 24px 0 rgba(0,0,0,0.15)` |
| Text | `badge` 14/600/20 (sm: `badge-sm` 12/600/16). Colour: success `#34d399`, warning `#fbbf24`, error `#ff7043`, info `#93c5fd`, neutral `#cbd5e1` |
| Icon | Dot = `currentColor`, except info `#3b82f6` and neutral `#94a3b8`. No glow, except **glass + error**: dot `#ff5825` + `0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825`. sm dots never glow |
| States | Static. Never changes colour on hover. Forced colours: dot keeps its colour (`forced-color-adjust: none`) |
| Variants | **tinted** (the app default: use `sm` for every status in rows, cards and headers, D8). **glass** only on top of images or video. The spec and showcase still show glass in entity cards and table cells; don't mix the two in one app (rule 9). Tone and label never change between them. **Live** `.ds-live`: padding 5px 9px, radius 9999px, glass fill, `1px solid rgba(255,255,255,0.02)` (`border-track`), 12/600/18 `#ffffff`, gap 6px; dot 8px `live-halo` `rgba(211,52,52,0.40)` with a 4px `live` `#d33434` core (`::after`, `inset: 3px`). It does not pulse |

Markup:
```html
<span class="ds-badge ds-badge--error ds-badge--glass"><span class="ds-badge__dot" aria-hidden="true"></span><span>Inactive</span></span>
<span class="ds-badge ds-badge--success"><span class="ds-badge__dot" aria-hidden="true"></span><span>Running</span></span>
<span class="ds-live"><span class="ds-live__dot" aria-hidden="true"></span><span>Live</span></span>
```
Common mistakes:
- Adding a visible tone border (`border-green-500/30`). Badges carry tone through fill and text only.
- Using `text-xs font-medium` (12/500) with `px-2 py-0.5`. The md badge is 14/600 with 4px 12px padding.
- Using red-500 or emerald-500 for error and success. Error is `#ff7043` text on `rgba(255,88,37,0.10)`; success is `#34d399` on `rgba(16,185,129,0.10)`.

---

### Components (continued)

Values below are resolved from the generated stylesheet (`ds.css`), dark theme (the default). Notation: `token = value`. Font is Inter throughout.

**Read this first — values that hand-rebuilt versions keep getting wrong**

| Thing | Exact value | Consequence |
|---|---|---|
| Every "hairline" border token (`border-edge`, `border-subtle`, `border-faint`, `border-glass`, `border-track`, `border-control`, `border-hairline`) | all = `rgba(255,255,255,0.02)` | A "1px border-subtle" is effectively invisible. Never substitute `border-white/10`, `slate-700`, `#334155`, etc. |
| `shadow-edge` | `inset 0 0 0 1px rgba(255,255,255,0.02)` | Cards draw their edge with this inset shadow, **not** a CSS `border`. |
| `gradient-glass` (card fill) | `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` | Near-transparent blue tint over the navy app background. Never a pastel, never a gradient to white, never opaque `#1e293b`. |
| `gradient-glass-strong` (main panel) | `linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.01) 100%)` | |
| `gradient-glass-up` (footers) | `linear-gradient(0deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` | |
| `shadow-glass` | `0 12px 28px 0 rgba(0,0,0,0.20)` | |
| `shadow-surface` (content-card surface) | `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` | = `shadow-glass` + `shadow-edge` |
| `shadow-card` (raised pill / current item) | `0 2px 36px 0 rgba(0,0,0,0.12), 0 2px 12px 0 rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.07)` | |
| `bg-app` / `gradient-app` | `#0b1020` / `linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%)` | |
| Default focus ring | `outline: 2px solid #3b82f6; outline-offset: 2px` (fields/tabs: 1px, offset 0) | `:focus:not(:focus-visible) { outline: none }` is the only permitted removal. |
| Motion | `duration-fast 150ms`, `base 200ms`, `slow 300ms`, `chart 500ms`; `ease-standard cubic-bezier(0.4,0,0.2,1)`, `ease-emphasized cubic-bezier(0.22,1,0.36,1)` | All transitions drop to 0 ms under `prefers-reduced-motion: reduce`. |

---

#### 5.28 Status dot
Use for: a bare status indicator in dense contexts, always next to a text label. Not for: status on its own without text (use a badge, §5.27).
React: `<Status tone="success|warning|error" size="sm|md">Running</Status>` (dot + label); `<Dot tone="…" size="sm|md" label="Running">` (standalone, `role="img"`). Class: `.ds-dot` + `--sm` / `--success|--warning|--error|--brand|--neutral`; wrapper `.ds-status`.
| Part | Spec |
|---|---|
| Box | `size-status-dot` = 10 × 10 px; `--sm` `size-status-dot-sm` = 8 × 8 px; radius `radius-full` = 9999px; `flex-shrink: 0` |
| Fill | success `success-text` = `#34d399`; warning `warning-text` = `#fbbf24`; error `danger` = `#ff5825`; brand `brand` = `#3b82f6`; neutral `text-muted` = `#94a3b8` |
| Edge / border | none |
| Shadow (glow) | success `shadow-status-success` = `0 0 10px 0 #10b981, 0 0 2px 0 #34d399`; warning `0 0 10px 0 #fbbf24, 0 0 2px 0 #fbbf24`; error `0 0 10px 0 #ff5825, 0 0 2px 0 #ff5825`; brand and neutral: no glow |
| Text (`.ds-status`) | inline-flex, gap `space-2` = 8px, 14px/20px 400, `text-secondary` = `#cbd5e1` |
| States | static; `forced-colors: active` keeps the fill (`forced-color-adjust: none`) |
| Variants | `--sm` 8 px (default in `<Status>`); md 10 px |
Markup:
```html
<span class="ds-status"><span class="ds-dot ds-dot--success ds-dot--sm" aria-hidden="true"></span><span>Running</span></span>
<span class="ds-dot ds-dot--error" role="img" aria-label="Stopped"></span>
```
Common mistakes:
- Adding a ring/border or a glow to neutral (offline/stopped) — neutral and brand have no glow.
- Using `danger-text #ff7043` for the error dot; the dot is `danger #ff5825`.

#### 5.29 Tag (solid category)
Use for: a fixed-colour category such as a user role. Not for: status (use a badge).
React: `<Tag color="purple|blue|green|amber|rose" raised>Admin</Tag>`; helper `tagColorFor(categories, cat)` assigns colours in stable order purple → blue → green → amber → rose. Class: `.ds-tag` + `--{colour}` + `--raised`.
| Part | Spec |
|---|---|
| Box | padding `space-1-5 space-3` = 6px 12px (32 px tall); radius `radius-xs` = 4px; `white-space: nowrap` |
| Fill | `tag-purple` = `#4d3f9d`; `tag-blue` = `#3f779d`; `tag-green` = `#457e32`; `tag-amber` = `#95693c`; `tag-rose` = `#9d3f5a` (solid, opaque) |
| Edge / border | none |
| Shadow | none; `--raised` = `shadow-card` (see top table) |
| Text | `.ds-ts-tag` 14px/20px 500, `text-primary` = `#ffffff` (inside a table secondary cell weight is forced to 400) |
| States | static |
| Variants | 5 colours; `--raised` adds `shadow-card` |
Markup:
```html
<span class="ds-tag ds-tag--purple">Admin</span>
```
Common mistakes:
- Pastel tinted fill with coloured text (that is a badge); tags are solid with white text.
- Using Tailwind green/amber — the tag colours are darkened for 4.8:1 contrast with white.

#### 5.30 Count pill
Use for: a count beside a section, group or table title ("Factory 1 (12)"). Not for: status.
React: `<CountPill label="12 cameras">12</CountPill>`. Class: `.ds-count`, `.ds-count--sm` (table-card header).
| Part | Spec |
|---|---|
| Box | padding 3px 13px → 26 px tall; `--sm` padding `space-0-5 space-3` = 2px 12px; radius `radius-full` = 9999px |
| Fill | `surface-control` = `rgba(255,255,255,0.04)` |
| Edge / border | `border: 1px solid border-subtle` = `rgba(255,255,255,0.02)` (barely visible by design) |
| Shadow | none |
| Text | `.ds-ts-count-pill` 14px / line-height 18px / 700, `text-secondary` = `#cbd5e1`, `tabular-nums`; `--sm` 12px |
| States | static |
| Variants | md (26 px), sm (12 px text) |
Markup:
```html
<span class="ds-count" aria-label="12 cameras">12</span>
```
Common mistakes:
- Visible grey border (`#334155`) or brand-blue fill.
- Weight 500/600 instead of 700.

#### 5.31 Info chip
Use for: a short identifier on a row (employee ID "EMP-8841"). Not for: filters or removable chips (§5.11 chips field).
React: `<Chip>EMP-8841</Chip>`. Class: `.ds-chip`.
| Part | Spec |
|---|---|
| Box | padding 3px 9px; radius `radius-xs` = 4px; nowrap |
| Fill | `brand-tint-10` = `rgba(59,130,246,0.10)` |
| Edge / border | `1px solid transparent` (ds.css) — no visible stroke |
| Shadow | none |
| Text | 10px / line-height 15px / 400, `brand-text` = `#93c5fd` |
| States | static |
Markup:
```html
<span class="ds-chip">EMP-8841</span>
```
Common mistakes:
- Adding a visible brand border (see Discrepancies).
- Uppercase / bold text; it is regular 10 px.

#### 5.32 Avatar
Use for: a person in pickers, cards and the sidebar user card. Not for: entities (use an icon tile).
React: `<Avatar name="Anita Sharma" variant="brand|neutral|photo" src presence decorative>`; initials = first letters of the first two words. Class: `.ds-avatar` + `--neutral` / `--photo`; `.ds-avatar__presence`.
| Part | Spec |
|---|---|
| Box | brand `size-avatar-lg` = 40px; neutral `size-avatar-md` = 36px; photo `size-avatar-sm` = 32px with 1px padding; radius 9999px |
| Fill | brand `gradient-brand-avatar` = `linear-gradient(45deg, #1d4ed8 0%, #6366f1 100%)`; neutral `surface-avatar` = `#18202d`; photo ring `gradient-brand-ring` = `linear-gradient(45deg, #3b82f6 0%, #818cf8 100%)` around an inner disc `avatar-inner` = `#121622` |
| Edge / border | brand `1px solid brand-avatar-border` = `rgba(147,197,253,0.30)`; neutral `1px solid border-avatar` = `#334155`; photo no border (the 1px gradient padding is the ring) |
| Shadow | brand `shadow-avatar` = `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`; neutral/photo none |
| Text | brand 12px/16px 700 `#ffffff`; neutral 14px 500 `text-secondary` = `#cbd5e1`; photo initials 12px/16px |
| Icon | photo `<img>` `object-fit: cover` filling the inner disc |
| States | static |
| Variants | presence dot: 12 × 12 px, `success-glow` = `#10b981`, `2px solid surface-sunken-button` = `#121620`, at bottom/inline-end −1px |
Markup:
```html
<span class="ds-avatar" aria-hidden="true">AS</span>
<span class="ds-avatar ds-avatar--photo" aria-hidden="true"><span><img src="u.jpg" alt=""></span><span class="ds-avatar__presence"></span></span>
```
Common mistakes:
- Flat blue circle; brand avatar is a 45° blue→indigo gradient with a 30 % light-blue border.
- Not marking it `aria-hidden` when the name is adjacent (`role="img" aria-label` otherwise).

#### 5.33 Metric indicator (inline value)
Use for: a value with optional denominator ("6 / 6 lines active") inside a card. Not for: page-level KPIs (§5.23).
React: `<Metric value={6} of={6} unit="lines active" label="Lines" inline tone="success|warning|alert">`. Class: `.ds-metric`, `.ds-metric--inline`, `.ds-metric__value`.
| Part | Spec |
|---|---|
| Box | stacked: column, centred, gap `space-1` = 4px; inline: row, baseline, gap 6px, start-aligned; value row gap `space-1-5` = 6px |
| Fill / edge / shadow | none |
| Text | value `<b>` = `metric-value` 20px/28px 700, tracking −0.65px, `#ffffff`, tabular-nums; denominator `<span>` 14px/20px 400 `text-muted` = `#94a3b8`; label `metric-label` 12px/18px 500 +0.4px UPPERCASE `#94a3b8` |
| States | tone colours the value: success `#34d399`, warning `#fbbf24`, alert `alert-count` = `#fb7185` |
Markup:
```html
<div class="ds-metric ds-metric--inline"><span class="ds-metric__value" aria-label="6 of 6 lines active"><b>6</b><span>/ 6 lines active</span></span></div>
```
Common mistakes:
- Same weight for value and denominator; the value is 700, the denominator 400 muted.

#### 5.34 Progress & segmented status bar
Use for: progress toward a target (progress bar); distribution of counts across statuses (segmented bar). Not for: charts with axes.
React: `<Progress value={72} tone="brand|success|warning|error" label="Line OEE" showValue>`; `<SegBar segments={[{value, color, label}]} size="md|lg" label>`. Class: `.ds-progress` + `--success|--warning|--error`, `.ds-progress-row`; `.ds-segbar`, `.ds-segbar--lg`, `.ds-segbar__seg`.
| Part | Spec |
|---|---|
| Box | progress: track height 4px, radius 9999px, `overflow: hidden`; row gap 8px; segbar md: height 20px, radius `radius-chip` = 6px, no gaps, segment `min-width: 28px`; segbar lg: height `size-control` = 40px, radius `radius-track` = 12px, segment `min-width: 12px` |
| Fill | track `color-track` = `rgba(255,255,255,0.08)`; progress fill default `brand` = `#3b82f6`; success `gradient-progress-success` = `linear-gradient(90deg, #34d399 0%, #10b981 100%)`; warning `#fbbf24`; error `#ff5825`; segments: inline `background` per segment (e.g. `chart-running #34d399`, `chart-stopped #ff5825`), width via `flex-grow: value` |
| Edge / border | none |
| Shadow | none |
| Text | progress value `<b>` 12px/16px 600 `text-secondary` `#cbd5e1` tabular-nums; segment numbers `bar-segment` 12px, line-height 1, 600, `text-on-bright` = `#0b0f14`; lg segments hide numbers (`font-size: 0`) |
| States | fill animates width 500ms `ease-standard`; segments animate `flex-grow` 500ms |
| Variants | progress tones; segbar md (numbers) / lg (no numbers; legend carries the counts) |
Markup:
```html
<div class="ds-progress-row"><div class="ds-progress ds-progress--success" role="progressbar" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100" aria-label="Line OEE"><span style="width:72%"></span></div><b aria-hidden="true">72%</b></div>
<div class="ds-segbar" role="img" aria-label="12 running, 3 stopped"><span class="ds-segbar__seg" style="flex-grow:12;background:#34d399">12</span><span class="ds-segbar__seg" style="flex-grow:3;background:#ff5825">3</span></div>
```
Common mistakes:
- 8 px rounded track or gaps between segments; progress is 4 px and segments touch.
- White numbers on bright segments; they are `#0b0f14`.

#### 5.35 Summary strip (and side-panel cards)
Use for: identifying the record a page is about (running SKU), plus side-panel cards of read-only fields and system health. Not for: KPIs.
React: `<SummaryStrip eyebrow="Bottle Line 3" title="…" fields={[{label,value}]} statuses={[{label,tone,value}]} layout="inline|stacked">`; `<PanelCard label="Reference barcodes">`; `<FieldList items>`; `<HealthRow icon label status>`. Class: `.ds-strip` (+`--stacked`), `.ds-panel-card`, `.ds-fieldlist`, `.ds-health-row`.
| Part | Spec |
|---|---|
| Box | strip: flex-wrap, gap `space-5` = 20px, padding `space-card` = 16px, radius `radius-card` = 16px; lead column gap 12px, `flex: 1 1 180px`; fields `flex: 999 1 480px`, gap 20px; stacked: column, gap 12px. Panel card: column, gap `space-4` = 16px, padding `space-card-lg` = 20px, radius 16px. Field-list rows: padding 12px 0, gap 4px. Health row: space-between, gap 12px |
| Fill | `gradient-glass` = `linear-gradient(180deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)` |
| Edge / border | no CSS border on the card; edge via `shadow-edge` inside `shadow-surface`. Inline divider between lead and fields: 1px wide, `border-faint` = `rgba(255,255,255,0.02)`. Field-list rows: `border-bottom: 1px solid rgba(255,255,255,0.02)`, none on the last |
| Shadow | `shadow-surface` = `0 12px 28px 0 rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Text | eyebrow 12px/18px +0.55px `link` = `#60a5fa`, after an 8 px brand dot, gap 8px; title `summary-title` 20px/28px 700 −0.5px `#ffffff` (2-line clamp + tooltip); `dt` 12px/16px 500 `text-tertiary` = `#8a99ae`; `dd` `field-value` 16px/22px 400 +0.5px `#ffffff`, 4px below, `overflow-wrap: anywhere`; panel label `section-label` 12px/16px 700 +0.55px UPPERCASE `#8a99ae`; health label 14px/20px `#cbd5e1` |
| Icon | health icon: 20 × 20 box, 16 px glyph, `text-muted` `#94a3b8`, **no tile** |
| States | static |
| Variants | inline (fields beside title, divider shown) / stacked (side panel, no divider) |
Markup:
```html
<section class="ds-strip ds-strip--stacked" aria-labelledby="s1">
  <div class="ds-strip__lead"><p class="ds-strip__eyebrow"><span class="ds-dot ds-dot--sm ds-dot--brand" aria-hidden="true"></span>Bottle Line 3</p><h2 class="ds-strip__title" id="s1">Dove Nourishing Bodywash 825 ml</h2></div>
  <dl class="ds-strip__fields"><div><dt>SKU</dt><dd>67024981</dd></div></dl>
</section>
<section class="ds-panel-card" aria-labelledby="p1"><h2 class="ds-panel-card__label" id="p1">Reference barcodes</h2>
  <dl class="ds-fieldlist"><div><dt>EAN</dt><dd>8710447348352</dd></div></dl></section>
```
Common mistakes:
- Grey square tile behind health icons (removed deliberately).
- Visible 1px slate border around the card; use the inset 2 % edge shadow.

#### 5.36 Media card (camera tile) & media viewer
Use for: a live camera feed with its inspection result; the viewer opens it full size. Not for: static images in content.
React: `<MediaCard title sub src icon status={{tone,label}} detected detectedError frame={{left,top,width,height,tone}} onOpen>`; `<MediaViewer open onClose title sub badge src footer>`. Class: `.ds-media-card` (+ `button.ds-media-card` interactive), `__head`, `__media`, `__foot`, `.ds-detect`, `.ds-viewer`, `.ds-media-grid`.
| Part | Spec |
|---|---|
| Box | card: column, radius `radius-panel` = 24px, `overflow: hidden`, container query host. Head/foot padding `space-3-5 space-6` = 14px 24px (head bottom 15px), gap 12px; head wraps with row-gap 8px. Media: `flex: 1`, min-height 160px. Grid: 2 columns, rows `minmax(300px, 1fr)`, gap `space-grid` = 16px. Viewer: `min(90vw, 900px)`, max-height 90vh, radius `radius-viewer` = 32px; viewer head padding 20px 32px, gap 16px; detected row padding 12px 32px; frame min-height 460px |
| Fill | card `gradient-glass` (see top); media well `surface-media` = `#0b0e13`; feed image `object-fit: cover` at `opacity: 0.5`; viewer body `#0b0e13`, viewer head `surface-raised` = `#0c1325`, viewer image `object-fit: contain` |
| Edge / border | card `border: 1px solid transparent`; edge drawn by `::after` (z-index 2, above the feed) with `shadow-edge` = `inset 0 0 0 1px rgba(255,255,255,0.02)`; head `border-bottom: 1px solid border-track` = `rgba(255,255,255,0.02)`; viewer head `border-bottom: 2px solid rgba(255,255,255,0.02)`; viewer detected row `border-bottom: 1px solid rgba(255,255,255,0.02)` |
| Shadow | card `shadow-glass` = `0 12px 28px 0 rgba(0,0,0,0.20)`; viewer `shadow-modal` = `0 25px 50px -12px rgba(0,0,0,0.40)` |
| Text | title `media-title` 20px/26px 600 −0.25px `#ffffff` (16px when tile < 420px); sub 14px/16px `#94a3b8`; footer `media-detail` 14px/16px 600 `#cbd5e1` "Detected : " + `<em>` italic 400; error value `danger-text` = `#ff7043`. Viewer title 20px/28px 700 −0.5px; viewer sub 16px/22px |
| Icon | header tile 28 × 28 (`size-media-icon`), radius 12px, fill `brand-tint-10` `rgba(59,130,246,0.10)`, transparent 1px border, 16 px glyph `link` `#60a5fa`; expand glyph 16px `icon` = `#64748b`, padding 4px, radius 4px; viewer close 36 × 36, radius 12px, `#94a3b8` |
| States | `button.ds-media-card:hover` border → `brand-border-hover` = `rgba(59,130,246,0.40)` (150ms); expand hover `#ffffff`; viewer close hover bg `surface-hover` = `rgba(255,255,255,0.05)` + `#ffffff` |
| Variants | detection frame `.ds-detect`: 2px solid `danger #ff5825`, radius 4px, `box-shadow: 0 0 20px color-mix(in srgb, #ff5825 30%, transparent)`; `--positive` `#10b981`; `--warning` `#fbbf24`; `--drawing` dashed; label tab 12px/16px 700 `#0b0f14` on the frame colour, 2px above the frame |
Markup:
```html
<article class="ds-media-card" aria-labelledby="c1">
  <div class="ds-media-card__head"><span class="ds-icon-tile ds-icon-tile--sm" aria-hidden="true"><svg width="16" height="16"/></span>
    <span class="ds-media-card__titles"><h2 class="ds-media-card__title" id="c1">Cap Inspection</h2><span class="ds-media-card__sub">Camera 2</span></span>
    <span class="ds-badge ds-badge--success">Pass</span>
    <button type="button" class="ds-media-card__expand" aria-label="Expand Cap Inspection"><svg width="16" height="16"/></button></div>
  <div class="ds-media-card__media"><img src="feed.jpg" alt="Cap Inspection camera feed"><span class="ds-detect" style="left:30%;top:20%;width:20%;height:30%" aria-hidden="true"></span></div>
  <div class="ds-media-card__foot"><p class="ds-media-card__detail">Detected : <em>Cap OK</em></p></div>
</article>
```
Common mistakes:
- Feed at full opacity or `contain` in the tile (tile is `cover` at 50 %; viewer is `contain` at 100 %).
- Edge drawn with `border` on the card so the image covers it; the edge is an `::after` overlay.

#### 5.37 Sidebar navigation
Use for: primary navigation in the app shell. Not for: in-page section switching (use tabs).
React: `<Sidebar product tagline logo sections={[{label, items:[{id,label,icon,href}]}]} current onSelect user={{name,role,src}} collapsible collapsed onToggleCollapsed>`; `<NavItem>`. Class: `.ds-sidebar-slot` > `nav.ds-sidebar` (+`--collapsed`) > `.ds-sidebar__inner` > `.ds-sidebar__scroll` (brand + `.ds-nav`) + `.ds-user-card`.
| Part | Spec |
|---|---|
| Box | width `size-sidebar-expanded` = 256px (collapsed rail 76px); radius `radius-panel` = 24px; inner padding 17px 10px; brand row 236px wide, padding 4px 6px, gap 12px; nav starts 20px below brand; groups 16px apart; items 4px apart; group label padding 0 14px. Item: min-height `size-nav-item` = 44px, padding 10px 14px, radius `radius-nested` = 16px; icon 24px; label padding-start 12px. User card: margin-top 12px, padding 10px, radius 24px; row 214px, gap 8px |
| Fill | sidebar `gradient-glass`; collapsed: `#0f172a` under the glass (opaque); logo tile transparent; current item `gradient-nav-active` = `linear-gradient(101deg, rgba(33,88,225,0.225) 0%, rgba(33,88,225,0.125) 43%, rgba(33,88,225,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.039) 0%, rgba(255,255,255,0.012) 100%)`; user card `gradient-glass` with a 128 × 128 `brand-tint-20` = `rgba(59,130,246,0.20)` circle blurred 20px, centred at top −48px |
| Edge / border | sidebar: none; logo tile `1px solid border-logo` = `#333333`, radius 8px, 40 × 40; user card `1px solid border-glass` = `rgba(255,255,255,0.02)` |
| Shadow | sidebar `shadow-sidebar` = `0 28px 56px 0 rgba(0,0,0,0.40)`; current item `shadow-card`; user card none |
| Text | product 14px/20px 600 −0.35px `#ffffff`; tagline 10px/16.5px `#94a3b8`; group label `nav-section` 12px/16px 400 `#94a3b8`; item `nav-item` 14px/20px 500 `#94a3b8` (ellipsis + tooltip on truncation); user name 14px/18px 600 −0.35px `#ffffff`; role 12px/16px `#94a3b8` |
| Icon | nav illustration 24 × 24; logo 23 × 24; logout 20px glyph in a 28px button, `#94a3b8` at opacity 0.6; collapse toggle 24 × 24, radius 4px, `icon` `#64748b` |
| States | item hover: bg `surface-hover` = `rgba(255,255,255,0.05)`, label `#ffffff`; current (`aria-current="page"`): nav-active gradient + `shadow-card`, label `#ffffff`, weight stays 500; focus-visible ring offset 0; logout hover opacity 1, `#ffffff`; transitions 150ms |
| Variants | expanded (default, products use this); `collapsible` → collapsed 76px rail that widens to 256px over content on hover or `:focus-visible` inside (300ms `ease-emphasized`), labels fade in after 75ms; below 1024px it renders inside the nav drawer (§6.1) |
Markup:
```html
<div class="ds-sidebar-slot"><nav class="ds-sidebar" aria-label="Primary"><div class="ds-sidebar__inner">
  <div class="ds-sidebar__scroll">
    <div class="ds-sidebar__brand"><span class="ds-sidebar__logo" aria-hidden="true"><img src="logo.svg" alt=""></span><span class="ds-sidebar__fade"><span class="ds-sidebar__name">Vision</span><span class="ds-sidebar__tagline">Automation</span></span></div>
    <div class="ds-nav"><div class="ds-nav__section"><p class="ds-nav__label ds-sidebar__fade">Monitor</p>
      <a class="ds-nav__item" href="/live" aria-current="page"><span class="ds-nav__icon" aria-hidden="true"><img src="live.png" alt=""></span><span class="ds-nav__text ds-sidebar__fade">Live View</span></a></div></div>
  </div>
  <div class="ds-user-card"><div class="ds-user-card__row"><span class="ds-avatar ds-avatar--photo" aria-hidden="true"><span>AS</span></span>
    <span class="ds-sidebar__fade ds-user-card__who"><span class="ds-user-card__name">Anita Sharma</span><span class="ds-user-card__role">Admin</span></span>
    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-user-card__out" aria-label="Log out"><svg width="20" height="20"/></button></div></div>
</div></nav></div>
```
Common mistakes:
- Solid blue pill for the current item, or bolding it; it is a faint left-to-right blue gradient + `shadow-card`, weight 500.
- A right-hand border on the sidebar; it is a floating glass panel 16px from the viewport, 20px from the main panel, no border.

#### 5.38 Page header
Use for: titling a page and holding its global controls (search → filters → primary). Not for: card or section titles.
React: `<PageHeader title icon status back={{label,onBack}} parent={{label,href|onClick}} breadcrumb description actions scrolled>`. Class: `header.ds-page-header` (+`--scrolled`), `__lead`, `__title`, `__icon`, `__titles`, `__actions`, `__parent`, `__sep`; `.ds-breadcrumb`.
| Part | Spec |
|---|---|
| Box | min-height `size-page-header` = 76px; padding `space-3 space-page-gutter` = 12px 16px; space-between, gap 16px, wraps; lead gap 12px (back button / title / status pill); title gap 10px (36px illustration + h1); titles column gap 2px; actions gap `space-header-actions` = 12px, wrap |
| Fill | none (sits flat on the main panel) |
| Edge / border | none, no bottom divider |
| Shadow | none; `--scrolled` (content scrolled under it) `shadow-header-scrolled` = `0 8px 16px -6px rgba(0,0,0,0.60)`, 200ms |
| Text | h1 `page-title` 24px/32px 600 −0.35px `#ffffff`, `overflow-wrap: anywhere`, `tabindex="-1"`; parent link `#94a3b8` (hover `#cbd5e1`); separator "/" `text-faint` = `#475569`, margin 0 8px; description `body-muted` 14px/20px `#94a3b8`; breadcrumb 12px/16px, links `#94a3b8` hover `#ffffff`, separators `#475569`, gap 6px |
| Icon | page illustration 36 × 36 (`size-page-icon`); back button = 36px icon button with a 24px arrow |
| States | header filters and search inside `__actions` swap their control stroke for the card surface: background `gradient-glass`, `border-color: transparent`, `box-shadow: shadow-surface` |
| Variants | plain; with back button; sub-page (back + "Parent / Title"); with breadcrumb; with description; with status pill |
Markup:
```html
<header class="ds-page-header"><div class="ds-page-header__lead">
  <div class="ds-page-header__title"><span class="ds-page-header__icon" aria-hidden="true"><img src="live.png" alt=""></span>
    <div class="ds-page-header__titles"><h1 class="ds-text-page-title" tabindex="-1">Live View</h1></div></div>
  <span class="ds-live"><span class="ds-live__dot" aria-hidden="true"></span>Live</span></div>
  <div class="ds-page-header__actions"><!-- search, filter selects (180px), primary (180px) --></div>
</header>
```
Common mistakes:
- A filled bar with a bottom border; the header has no fill and no divider until content scrolls under it.
- Two primary buttons; one primary per header, always last.

#### 5.39 Segmented tabs
Use for: switching views of the same content (role filters with counts, chart view switches). Not for: navigation between pages.
React: `<Tabs tabs={[{value,label,count}]} value onChange label="Roles" variant="raised|accent" size="md|sm" idBase controls>`; `<TabPanel idBase value>`. Class: `.ds-tabs` (+`--sm`, `--accent`) > `button.ds-tab` > `.ds-tab__label` + `.ds-tab__count`.
| Part | Spec |
|---|---|
| Box | track height `size-control` = 40px (sm 28px), padding 2px, radius `radius-track` = 12px, `overflow-x: auto`; tab padding 0 20px (sm 0 16px; accent 0 12px), radius `radius-sm` = 8px, gap 4px; accent = equal-width grid columns |
| Fill | track `gradient-toggle` = `linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)`; selected tab `gradient-toggle-active` = `linear-gradient(180deg, rgba(59,130,246,0.42) 0%, rgba(37,99,235,0.18) 100%)` |
| Edge / border | track `1px solid border-subtle` = `rgba(255,255,255,0.02)`; tabs none |
| Shadow | none |
| Text | `tab` 14px/20px 400 `#94a3b8`; selected `#ffffff` (weight unchanged); accent 600, tracking −0.4px; count `tab-count` 12px/16px `#8a99ae` ("(24)", en-GB grouping), `#94a3b8` when selected |
| States | hover bg `surface-hover-subtle` = `rgba(255,255,255,0.03)` + `#ffffff`; focus-visible outline 1px `#3b82f6` offset 0; selected = gradient pill; 150ms |
| Variants | raised (default, counts allowed), sm (chart controls), accent (40px, equal widths, 600 weight, no counts) |
Markup:
```html
<div class="ds-tabs" role="tablist" aria-label="Roles">
  <button type="button" role="tab" id="r-tab-all" aria-selected="true" aria-controls="r-panel" tabindex="0" class="ds-tab"><span class="ds-tab__label">All</span><span class="ds-tab__count">(24)</span></button>
  <button type="button" role="tab" id="r-tab-admin" aria-selected="false" aria-controls="r-panel" tabindex="-1" class="ds-tab"><span class="ds-tab__label">Admin</span><span class="ds-tab__count">(3)</span></button>
</div>
<div role="tabpanel" id="r-panel" aria-labelledby="r-tab-all" tabindex="0" class="ds-tabpanel">…</div>
```
Common mistakes:
- Underline tabs or a 32/36px track; the track is exactly 40px so it lines up with fields and filter selects.
- Bolding the selected tab (raised variant keeps 400).

#### 5.40 Pagination
Use for: paging a long table inside a table card. Not for: infinite feeds.
React: `<Pagination page pageSize total noun="users" onPage>`; `pageList(page, pages)` → first, last, current ±1 with "…" once pages > 7. Class: `.ds-pagination`, `__summary`, `__pages`, `.ds-page-btn` (+`--num`, `--ellipsis`), `__compact`.
| Part | Spec |
|---|---|
| Box | padding `space-3 space-4` = 12px 16px; space-between, gap 12px, wraps; buttons `size-pagination-button` = 32 × 32, 6px apart, radius `radius-chip` = 6px |
| Fill | bar `gradient-glass-up` = `linear-gradient(0deg, rgba(37,99,235,0.025) 0%, rgba(37,99,235,0.01) 100%)`; button `surface-control` = `rgba(255,255,255,0.04)`; current `brand-strong` = `#2563eb` |
| Edge / border | bar `border-top: 1px solid rgba(255,255,255,0.02)`; button `1px solid border-faint` = `rgba(255,255,255,0.02)`; current `1px solid border-on-brand` = `rgba(255,255,255,0.30)` |
| Shadow | current `shadow-card` |
| Text | summary 14px/20px `#94a3b8` with `<strong>` 500 `#ffffff` ("Showing **1 – 8** of **24** users"); buttons 12px/16px 500 `#94a3b8`; current `#ffffff` |
| Icon | prev/next chevrons 16px, flip in RTL |
| States | hover `#ffffff` + border `border-control-hover` = `rgba(255,255,255,0.20)`; disabled opacity 0.4, no pointer events; focus-visible offset 0; ellipsis transparent, no border |
| Variants | < 640px: numbered buttons and ellipses hide; "Page n of m" text (12px `#94a3b8`) shows between prev/next |
Markup:
```html
<div class="ds-pagination"><p class="ds-pagination__summary">Showing <strong>1 – 8</strong> of <strong>24</strong> users</p>
  <nav aria-label="Pagination"><div class="ds-pagination__pages">
    <button type="button" class="ds-page-btn" aria-label="Previous page" disabled>‹</button>
    <span class="ds-pagination__compact">Page 1 of 3</span>
    <button type="button" class="ds-page-btn ds-page-btn--num" aria-current="page" aria-label="Page 1">1</button>
    <button type="button" class="ds-page-btn ds-page-btn--num" aria-label="Page 2">2</button>
    <button type="button" class="ds-page-btn" aria-label="Next page">›</button></div></nav>
  <p class="ds-sr-only" role="status">Page 1 of 3</p></div>
```
Common mistakes:
- Pagination outside the card; it is the card's glass footer.
- Current page as plain blue text; it is a filled `#2563eb` button with a 30 % white border and `shadow-card`.

#### 5.41 Data table
Use for: comparing records. Not for: layout, or a single record's fields (use a field list).
React: `<DataTable columns={[{key,header,render,sortable,align:'num'|'end'|'center',shrink,minWidth,hiddenHeader}]} rows rowKey rowHeader="name" caption sort onSort selectable selected onSelect rowName maxHeight minWidth loading empty rowTone onRowActivate variant="default|compact|grid">`. Class: `.ds-table-region` (+`--capped`, `--scrolled`) > `table.ds-table` (+`--compact`, `--grid`).
| Part | Spec |
|---|---|
| Box | region `overflow-x: auto`, focusable (`tabindex="0"`, labelled); capped max-height `--ds-table-max-height` default 494px. Cells padding `space-cell-y space-cell-x` = 12px 16px. Header row height 40px (compact 36px); body row 44px (compact 40px; 52px with 28px row actions). Check column 48px. `border-collapse: separate; border-spacing: 0; table-layout: auto` |
| Fill | header `surface-table-header` = `rgba(255,255,255,0.02)`; pinned header (capped region) `gradient-table-header-pinned` = `linear-gradient(rgba(37,99,235,0.07) 0 0), var(--ds-gradient-app) fixed, #0b1020` (opaque); body rows transparent, **no zebra** |
| Edge / border | none — no row dividers, no divider below the header; `--grid` only: `border-inline-start: 1px solid border-divider` = `#292e33` between columns |
| Shadow | pinned header while scrolled `0 8px 16px -6px rgba(0,0,0,0.60)` |
| Text | `th` `table-header` 12px/16px 600 +0.3px UPPERCASE `#94a3b8`, nowrap; first column (`th scope="row"`) `table-cell-primary` 14px/20px 500 `#ffffff`; other cells `table-cell` 14px/20px 400 `#cbd5e1` (all descendants forced to 400) |
| Icon | sort glyph 14px, 6px after the label (rotates 180° for descending); row actions 28px `sm` icon buttons with 20px glyphs, 12px apart, end-aligned |
| States | row hover `surface-row-hover` = `rgba(255,255,255,0.02)`; clickable row hover `surface-hover` = `rgba(255,255,255,0.05)` + pointer; selected `brand-tint-10` = `rgba(59,130,246,0.10)`; warning row `row-warning` = `rgba(251,191,36,0.03)`; critical `row-critical` = `rgba(255,88,37,0.03)`; sorted column label `#cbd5e1`, sort button hover `#ffffff`; region focus ring inset −2px; row link hover underline offset 3px |
| Variants | default; compact (dashboard: 36/40px); grid (compact + column dividers). Alignment: text start; numbers `.ds-num` end + tabular-nums; status pills may centre in compact; actions end. Truncate identifiers `.ds-cell-truncate` max 240px + tooltip. Empty: one full-width cell, padding 48px 16px, centred `#94a3b8`. Loading: 5 skeleton rows. Bulk bar (selection): padding 12px 24px, `brand-tint-10` fill, bottom `1px rgba(255,255,255,0.02)` |
Markup:
```html
<div class="ds-table-region" role="region" aria-label="Users" tabindex="0">
  <table class="ds-table"><caption class="ds-sr-only">Users, sorted by Name ascending</caption>
    <thead><tr><th scope="col" aria-sort="ascending"><button type="button" class="ds-th-sort">Name<svg width="14" height="14"/></button></th><th scope="col">Role</th><th scope="col" class="ds-num">Lines</th><th scope="col" class="ds-right"><span class="ds-sr-only">Actions</span></th></tr></thead>
    <tbody><tr><th scope="row">Anita Sharma</th><td><span class="ds-tag ds-tag--purple">Admin</span></td><td class="ds-num">6</td>
      <td class="ds-right"><div class="ds-row-actions"><button type="button" class="ds-icon-btn ds-icon-btn--sm" aria-label="Edit Anita Sharma"><svg width="20" height="20"/></button></div></td></tr></tbody>
  </table></div>
```
Common mistakes:
- `divide-y` row borders and a header underline; the table has none.
- Zebra striping, or a `slate-800` header; the header is 2 % white.
- Letting the table widen the page instead of scrolling inside its region.

#### 5.42 Table card & table section header
Use for: a titled container holding one table (+ toolbar, + pagination). Not for: multiple tables (use collapsible sections).
React: `<TableCard title titleId count actions bulk>{table}{pagination}</TableCard>`. Class: `section.ds-table-card`, `__header`, `__title`, `__toolbar`.
| Part | Spec |
|---|---|
| Box | column, radius `radius-card` = 16px, `overflow: hidden`; header padding 16px, space-between, gap 12px, title gap 14px (title + `ds-count--sm`); toolbar padding 16px, gap 12px, search `flex: 1 1 320px` |
| Fill | `gradient-glass` |
| Edge / border | no CSS border; `::after` overlay (z-index 2, above content) with `shadow-edge` = `inset 0 0 0 1px rgba(255,255,255,0.02)`; header `border-bottom: 1px solid rgba(255,255,255,0.02)` |
| Shadow | `shadow-float-drop` = `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40)` |
| Text | title `group-title` 20px/24px 700 −0.5px `#ffffff`; count `.ds-count--sm` |
| States | header replaced by the bulk bar while rows are selected |
Markup:
```html
<section class="ds-table-card" aria-labelledby="t1">
  <div class="ds-table-card__header"><div class="ds-table-card__title"><h2 class="ds-text-group-title" id="t1">Lines</h2><span class="ds-count ds-count--sm">8</span></div><div class="ds-cluster"><!-- actions --></div></div>
  <!-- .ds-table-region … --><!-- .ds-pagination … -->
</section>
```
Common mistakes:
- `border border-slate-700 rounded-xl`; the card edge is the 2 % inset shadow overlay.
- Using the lighter content-card shadow; table cards use the deeper `shadow-float-drop`.

#### 5.43 Collapsible section (grouped list) & tree
Use for: grouping records by a parent (factory → line → cameras). Not for: FAQs/accordions of prose.
React: `<Collapsible title count open onToggle action nested headingLevel={2|3}>`. Class: `.ds-section-stack` > `section.ds-section-card` (+`--nested`) > `.ds-section-card__heading` > `h2.ds-section-card__h` > `button.ds-section-card__toggle`; `.ds-section-card__body` (+`--flush`). Tree: `.ds-tree` > `.ds-tree-row`.
| Part | Spec |
|---|---|
| Box | stack gap `space-stack` = 12px. Header min-height `size-section-header` = 60px, padding 0 16px, gap 16px; toggle gap 14px (title → count), chevron 24px with 10px extra margin (24px total from count). Body padding `space-card` = 16px, gap 12px; nested body flush (0). Section radius 16px; nested radius `radius-nested` = 16px |
| Fill | section `gradient-glass`; nested `surface-nested` = `rgba(172,195,255,0.04)` |
| Edge / border | section: no CSS border, edge via `shadow-edge`; heading `border-bottom: 1px solid rgba(255,255,255,0.02)` only when the body is open; nested: none |
| Shadow | section `shadow-glass-soft, shadow-edge` = `0 12px 28px -10px rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.02)`; nested none |
| Text | section title `subgroup-title` 16px/22px 700 −0.5px `#ffffff`; count = `.ds-count` (26px pill) |
| Icon | disclosure chevron 24px `icon-chevron` = `#6b7280`, after the count; flips `scaleY(-1)` when open (150ms); nested: chevron at the **start**, 24px gap to the title |
| States | expanded / collapsed (body `hidden`); toggle radius 8px for the focus ring |
| Variants | section; nested (line group with an end action, e.g. 180px "Add Camera" button). Tree [ext]: rows min-height 28px, radius 8px, padding 4px 8px + 20px per depth level (`--ds-tree-depth`), gap 8px; hover `rgba(255,255,255,0.05)`; focused row `surface-selected` = `rgba(172,195,255,0.08)`; toggle 16px rotates 90° open; clear button appears on hover/focus |
Markup:
```html
<div class="ds-section-stack"><section class="ds-section-card">
  <div class="ds-section-card__heading"><h2 class="ds-section-card__h"><button type="button" class="ds-section-card__toggle" aria-expanded="true" aria-controls="f1"><span class="ds-text-subgroup-title">Factory 1</span><span class="ds-count">12</span><span class="ds-section-card__chev" aria-hidden="true"><svg width="24" height="24"/></span></button></h2></div>
  <div id="f1" class="ds-section-card__body"><section class="ds-section-card ds-section-card--nested">…</section></div>
</section></div>
```
Common mistakes:
- Nested groups with a border or shadow; they are a flat 4 % blue-white wash.
- Divider shown on collapsed sections; it appears only when the body is open.

#### 5.44 Overlay & modal
Use for: one compact focused step (e.g. "Add Cameras") over the page. Not for: multi-field/multi-step create flows (use a slide panel).
React: `<Modal open onClose title icon footer size="md|sm" dirty initialFocus>`. Class: `.ds-overlay` > `.ds-overlay__backdrop` + `.ds-modal` (+`--sm`) > `__header` (`__titlegroup` + close) + `__body` + `__footer`.
| Part | Spec |
|---|---|
| Box | overlay `position: absolute; inset: 0` on the shell (fixed below 1024px), z-index 50, centred. Modal width `min(size-modal = 720px, 100% − 32px)` (sm `size-dialog` = 440px), max-height `100% − 48px`, internal scroll; padding `space-card-xl` = 24px; sections 28px apart; radius `radius-control` = 12px. Header padding-bottom 20px, title group gap 12px (32px illustration). Body gap `space-form-row` = 40px (form grid columns 20px apart). Footer end-aligned, gap 16px, tertiary min-width 120px, primary 180px |
| Fill | scrim `scrim` = `rgba(0,0,0,0.50)` + `backdrop-filter: blur(4px)`; modal `gradient-dialog` = `linear-gradient(180deg, #182032 0%, #101527 100%)` (opaque) |
| Edge / border | modal none; header `border-bottom: 1px solid border-faint` = `rgba(255,255,255,0.02)` |
| Shadow | `shadow-modal` = `0 25px 50px -12px rgba(0,0,0,0.40)` |
| Text | title `modal-title` 14px/18px 400 `#ffffff` |
| Icon | close = 32px compact `close` icon button: bg `surface-sunken-button` = `#121620`, 1px `rgba(255,255,255,0.02)`, `shadow-close` = `inset 0 2px 4px 0 rgba(0,0,0,0.60), 0 1px 0 0 rgba(255,255,255,0.04)`, radius 8px, glyph `#94a3b8` (hover border `rgba(255,255,255,0.20)`, glyph `#ffffff`) |
| States | dirty → Escape/close opens a discard confirmation; backdrop clicks never close |
Markup:
```html
<div class="ds-overlay" role="dialog" aria-modal="true" aria-labelledby="m1" tabindex="-1">
  <div class="ds-overlay__backdrop" aria-hidden="true"></div>
  <div class="ds-modal"><div class="ds-modal__header"><div class="ds-modal__titlegroup"><img src="camera.png" alt="" width="32" height="32"><h2 id="m1" class="ds-modal__title">Add Cameras</h2></div>
    <button type="button" class="ds-icon-btn ds-icon-btn--close ds-icon-btn--compact" aria-label="Close"><svg width="16" height="16"/></button></div>
    <div class="ds-modal__body">…</div>
    <div class="ds-modal__footer"><button class="ds-btn ds-btn--tertiary">Cancel</button><button class="ds-btn ds-btn--primary">Add</button></div></div>
</div>
```
Common mistakes:
- Large bold modal title; the compact modal title is 14px regular.
- Overlay mounted inside the main panel so the sidebar stays uncovered; overlays cover the whole shell.
- Closing on backdrop click.

#### 5.45 Confirmation dialog
Use for: destructive or discarding actions. Not for: forms.
React: `<ConfirmDialog open title message confirmLabel onCancel onConfirm tone="danger|primary">`. Class: `.ds-overlay[role=alertdialog]` > `.ds-dialog` > `__text` + `__actions`.
| Part | Spec |
|---|---|
| Box | width `min(440px, 100% − 32px)`, max-height `100% − 48px`; padding 24px; gap 24px; radius `radius-card` = 16px; text gap 8px; actions end-aligned, gap 12px |
| Fill | `gradient-dialog` = `linear-gradient(180deg, #182032 0%, #101527 100%)`; same scrim as §5.44 |
| Edge / border | `1px solid border-subtle` = `rgba(255,255,255,0.02)` |
| Shadow | `shadow-modal, shadow-highlight` = `0 25px 50px -12px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.07)` |
| Text | title `dialog-title` 20px/28px 700 −0.5px `#ffffff`; message `body-muted` 14px/20px `#94a3b8` |
| States | initial focus on Cancel; Escape = Cancel |
| Variants | action `ds-btn--danger` (default) or `--primary` |
Markup:
```html
<div class="ds-overlay" role="alertdialog" aria-modal="true" aria-labelledby="d1" aria-describedby="d2" tabindex="-1">
  <div class="ds-overlay__backdrop" aria-hidden="true"></div>
  <div class="ds-dialog"><div class="ds-dialog__text"><h2 id="d1" class="ds-text-dialog-title">Delete user?</h2><p id="d2" class="ds-text-body-muted">This can't be undone.</p></div>
    <div class="ds-dialog__actions"><button class="ds-btn ds-btn--tertiary">Cancel</button><button class="ds-btn ds-btn--danger">Delete</button></div></div>
</div>
```
Common mistakes:
- Focusing the destructive button first.
- Radius 12 like the modal; the confirm dialog is 16.

#### 5.46 Slide panel (drawer)
Use for: creating or editing a record without leaving the list (multi-field, multi-step). Not for: one-field confirmations.
React: `<SlidePanel open onClose title subtitle icon footer size="sm|md|lg|xl" dirty subheader={<Stepper/>} onBack initialFocus>`. Class: `.ds-overlay.ds-overlay--panel` > `aside.ds-panel.ds-panel--{size}` > `__header` (+`--scrolled`) + `__body` + `__footer` (+`--more`).
| Part | Spec |
|---|---|
| Box | full height at the inline-end; width `min(size, 100%)`: sm 480 · md 560 · lg 680 · xl 820px. Header padding 20px 24px (28px 24px 33px with a stepper), stepper 48px below the title row; title group gap 12px; titles gap 2px. Body scrolls, padding 24px, gap 28px, form rows 40px apart. Footer padding 20px 24px, space-between, gap 12px |
| Fill | panel `bg-app` + `gradient-app` (`#0b1020` / `linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%)`); header `gradient-glass`; footer `gradient-glass-up` |
| Edge / border | `border-inline-start: 1px solid rgba(255,255,255,0.02)`; header `border-bottom` and footer `border-top` 1px `rgba(255,255,255,0.02)` |
| Shadow | `shadow-drawer` = `-18px 0 45px 0 rgba(0,0,0,0.80), -1px 0 0 0 rgba(255,255,255,0.07)` (RTL: mirrored `18px …, 1px …`); header while body scrolled `0 8px 16px -6px rgba(0,0,0,0.60)`; footer while more below `0 -8px 16px -6px rgba(0,0,0,0.60)` |
| Text | title `dialog-title` 20px/28px 700 −0.5px `#ffffff`; subtitle `body-muted`; footer note 12px/16px `text-tertiary` `#8a99ae` (`role="status"` for autosave) |
| Icon | illustration 40 × 40 box (`size-entity-icon`, artwork 24px or 32–40px crops); back and close 36px icon buttons (close = `close` variant) |
| States | header/footer shadows by scroll position (200ms); dirty → discard confirmation |
| Variants | sizes sm/md/lg/xl; with stepper; with back button. Footer: tertiary Back/Cancel (20px back arrow) at start; helper note + 180px primary with trailing chevron at end |
Markup:
```html
<div class="ds-overlay ds-overlay--panel" role="dialog" aria-modal="true" aria-labelledby="p1" tabindex="-1">
  <div class="ds-overlay__backdrop" aria-hidden="true"></div>
  <aside class="ds-panel ds-panel--md">
    <div class="ds-panel__header"><div class="ds-panel__titlerow"><div class="ds-panel__titlegroup"><span class="ds-panel__icon" aria-hidden="true"><img src="factory.png" alt=""></span><div class="ds-panel__titles"><h2 id="p1" class="ds-text-dialog-title">Add New Factory</h2></div></div>
      <button type="button" class="ds-icon-btn ds-icon-btn--close" aria-label="Close panel"><svg width="16" height="16"/></button></div></div>
    <div class="ds-panel__body">…</div>
    <div class="ds-panel__footer"><button class="ds-btn ds-btn--tertiary">Cancel</button><div class="ds-panel__footer-end"><span class="ds-panel__note" role="status">Auto-saved draft 12s ago</span><button class="ds-btn ds-btn--primary">Next</button></div></div>
  </aside>
</div>
```
Common mistakes:
- White or `slate-900` panel body; it repeats the app gradient.
- Permanent header/footer shadows; they appear only by scroll position.

#### 5.47 Popover & notification feed
Use for: anchored non-modal panels (date range, notifications). Not for: menus of actions (§5.10) or modal tasks.
React: `<Popover open onClose anchorRef label align="start|end" width="date|sm" feed footer>`. Class: `.ds-popover` (+`--start`, `--sm`, `--feed`), `__footer`; feed `.ds-feed__head`, `__list`, `__item` (+`--unread`), `.ds-badge-count`.
| Part | Spec |
|---|---|
| Box | absolute, `top: 100%`, 4px below the trigger, end-aligned (start with `--start`); width `min(360px, 100vw − 32px)` (sm 280px); padding 16px; gap 16px; radius `radius-sm` = 8px; z-index 50. Feed: padding 0; head padding 12px 16px; list max-height 380px; items padding 12px 16px, gap 12px |
| Fill | `surface-raised` = `#0c1325`; feed unread item `surface-selected` = `rgba(172,195,255,0.08)` |
| Edge / border | none on the popover; feed head bottom / foot top `1px solid rgba(255,255,255,0.02)` |
| Shadow | `shadow-float` = `0 16px 36px -8px rgba(0,0,0,0.55), 0 4px 12px -2px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)` |
| Text | feed title `body-emphasis` 14px 600 `#ffffff`; unread item title `body-strong` 14px 500 `#ffffff`, read `body-muted`; body `small` 12px `#94a3b8`; time `caption` 10px `#8a99ae` |
| Icon | feed item 28px status icon tile; header bell badge `.ds-badge-count`: min 16 × 16, radius 9999px, `live` = `#d33434`, 10px/14px 600 `#ffffff` |
| States | feed item hover `rgba(255,255,255,0.05)`; dismiss button visible on hover/focus-within only |
Markup:
```html
<div class="ds-popover" role="dialog" aria-label="Date range">… <div class="ds-popover__footer"><button class="ds-btn ds-btn--tertiary">Clear</button><button class="ds-btn ds-btn--primary">Apply</button></div></div>
```
Common mistakes:
- Visible border; the popover edge is the inset 2 % ring inside `shadow-float`.
- Using `danger` red for the count badge (white on `#ff5825` fails AA; use `#d33434`).

#### 5.48 Toast
Use for: short confirmations after an action. Not for: errors that need a decision (use an inline alert or dialog).
React: `toast(message, { tone: 'neutral'|'error', action: { label, onAction } })` with one `<ToastRegion/>` in the shell. Class: `.ds-toast-region` > `.ds-toast` (+`--success`, `--error`), `.ds-toast__action`.
| Part | Spec |
|---|---|
| Box | region: absolute, top 24px, horizontally centred in the main panel, column gap 8px, z-index 60; toast max-width `min(480px, 100% − 32px)`, padding 10px 16px, gap 8px, radius 8px |
| Fill | `surface-raised` = `#0c1325` |
| Edge / border | `1px solid rgba(255,255,255,0.02)` |
| Shadow | `shadow-elevated` = `0 4px 40px rgba(0,0,0,0.50)` |
| Text | `toast` 14px/20px 400 `#ffffff` |
| Icon | 16px; success `#34d399`, error `#ff7043` |
| States | auto-dismiss, paused on hover/focus; with an action it stays until acted on or dismissed (14px close in a 28px icon button) |
| Variants | < 640px: region moves to bottom 16px, width `100% − 32px` |
Markup:
```html
<div class="ds-toast-region" role="status" aria-live="polite"><div class="ds-toast"><span>User added</span></div></div>
```
Common mistakes:
- Bottom-right corner placement on desktop; toasts sit top-centre of the main panel.
- Stealing focus or using `role="alert"` for non-errors.

#### 5.49 Tooltips
Use for: naming icon-only buttons and recovering truncated text. Not for: essential instructions.
React: `<Tooltip content placement="top|bottom|right" describe onlyWhenTruncated><button…/></Tooltip>` (portal to `body`, 8px from the trigger, 4px viewport margin, flips). Class: `.ds-tooltip[role=tooltip]`.
| Part | Spec |
|---|---|
| Box | `position: fixed`, z-index 70; max-width 280px; padding 6px 10px; radius 8px |
| Fill | `gradient-tooltip` = `linear-gradient(180deg, #171f31 0%, #101527 100%)` |
| Edge / border | `1px solid border-glass` = `rgba(255,255,255,0.02)` |
| Shadow | `shadow-tooltip` = `0 12px 28px 0 rgba(0,0,0,0.20)` |
| Text | 12px/16px `text-tooltip` = `#f4f6f8`, `overflow-wrap: anywhere` |
| States | show after 300ms hover or on keyboard focus; Escape hides; pointer may move onto it; truncation tooltips only when text is actually truncated |
Markup:
```html
<button type="button" class="ds-icon-btn" aria-label="Edit" aria-describedby="tt1">…</button>
<div id="tt1" role="tooltip" class="ds-tooltip" hidden>Edit</div>
```
Common mistakes:
- Black `#000` tooltip with an arrow; it is the navy tooltip gradient, no arrow.

#### 5.50 Loading states
Use for: placeholders while text, tables and charts load. Not for: full-page spinners (never).
React: `<Skeleton w="100%" h={12}>`; `DataTable loading`. Class: `.ds-skeleton`, `.ds-skeleton--bar`.
| Part | Spec |
|---|---|
| Box | radius `radius-chip` = 6px; size per content (table cells: 140 / 80 × 12px) |
| Fill | `skeleton` = `rgba(255,255,255,0.06)` |
| Edge / shadow | none |
| States | `ds-pulse` 1.5s ease-in-out infinite, opacity 0.5 → 1 → 0.5 |
| Variants | 16px spinner inside buttons only |
Markup:
```html
<span class="ds-skeleton ds-skeleton--bar" style="width:140px;height:12px" aria-hidden="true"></span>
```
Common mistakes:
- Shimmer gradients or `slate-700` blocks; the skeleton is 6 % white pulsing.

#### 5.51 Empty states
Use for: no data, no results, first use. Not for: errors.
React: `<EmptyState title message action icon variant="inline|first-use|chart">`. Class: `.ds-empty` + `--first-use` / `--chart`.
| Part | Spec |
|---|---|
| Box | column, centred, gap 12px; inline padding 48px 16px; first-use 64px 24px; chart 64px 0 |
| Fill / edge / shadow | none (sits inside its container) |
| Text | optional `card-title` 20px/24px 600 −0.4px `#ffffff`; message 14px/20px `#94a3b8` centred |
| Icon | optional 40px icon tile (radius 12px, `brand-tint-10` fill, `#60a5fa` glyph 20px) or illustration |
Markup:
```html
<div class="ds-empty ds-empty--inline"><p>No records match your filters.</p><button class="ds-btn ds-btn--secondary">Clear filters</button></div>
```
Common mistakes:
- Wrapping the empty state in its own bordered card inside the card.

#### 5.52 Component contract matrix
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
| Tooltip | `tooltip` (`aria-describedby` / name) | Esc dismisses | — | visible |
| Table | `table` in a focusable region | Tab, scroll | caption / `aria-label` | sorted, selected, empty |
| Chart marks | `button` / focusable SVG | Tab, Enter | value text | hover, focus, tooltip |

#### 5.53 Supplementary blueprints
All component CSS is inline in its own section; there is no separate derived stylesheet.

#### 5.54 Anatomy, variants & states index
| § | Component | Variants | Sizes | States beyond default |
|---|---|---|---|---|
| 5.1 | Button | primary, secondary, tertiary, subtle, tonal, ghost, danger | sm, md, lg | hover, focus, disabled, loading |
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
| 5.32 | Avatar | brand, neutral, photo, presence | 32, 36, 40 | — |
| 5.34 | Progress / segbar | success, warning, error, brand; md, lg | — | — |
| 5.36 | Media card | static, interactive; detection frame | — | hover, focus |
| 5.37 | Sidebar | expanded, collapsed, drawer | — | hover, current, focus |
| 5.39 | Tabs | raised, sm, accent | — | hover, selected, focus |
| 5.41 | Table | default, compact, grid | — | hover, clickable, selected, sorted, empty |
| 5.43 | Collapsible | section, nested | — | expanded, collapsed |
| 5.44 | Modal | form, sm | — | dirty |
| 5.46 | Slide panel | sm, md, lg, xl | — | scrolled, dirty |

#### 5.55 Behaviour specifications for scripted components
| Component | Behaviour |
|---|---|
| Select / multi-select / rich picker | Click or Enter/Space/↓ opens and moves the active descendant to the selected option (or first). ↑/↓ move, Home/End jump, printable characters type-ahead. Enter/Space selects (single: closes, focus returns to trigger). Escape closes without change. Tab closes and moves on. Outside click closes. List flips upward when no room below. Searchable lists filter as you type and announce "N results". Rich picker footer actions ("+ Add User") are the last focusable row. |
| Command menu (`role="menu"`) | ↑/↓ cycle, Enter activates, Escape closes and returns focus. |
| Segmented tabs | Arrows move **and** activate (wrapping, mirrored in RTL); Home/End jump; only the selected tab is in the tab order (roving tabindex). |
| Overlays (modal, confirm, slide panel, viewer, mobile drawer) | On open focus the first field (forms) or the title (confirm: Cancel; viewer: close). Tab cycles within. Escape closes when clean; when dirty a "Discard changes?" confirmation opens (Keep Editing focused). Backdrop clicks never close. Close returns focus to the opener, or the page `h1` (`tabindex="-1"`) if the opener is gone. Body scroll locked; every `[data-inert-scope]` is `inert` while open. |
| Popovers | Escape and outside click close; Apply commits; focus returns to the trigger. |
| Tooltips | Hover (300ms) or keyboard focus shows; Escape hides; pointer may move onto the tooltip; truncation tooltips only when text is truncated. |
| Toasts | Announced politely (`role="status"`, errors `alert`); auto-dismiss unless hovered or focused; never steal focus. |
| Collapsible section | Enter/Space toggles; collapsed body is `hidden` (removed from the accessibility tree). |
| Sidebar | Collapse toggle uses `aria-pressed`; collapsed rail expands on hover or focus; current link `aria-current="page"`. |
| Data table | Scroll region focusable when it overflows; sort buttons announce the new order (live region "Sorted by Name, ascending"); row actions name their row ("Edit Anita Sharma"); row click ignores clicks on links/buttons/inputs and text selection. |
| Choice controls | Radio groups: arrows move and select. Switch: Space toggles and applies immediately. |
| File upload / attach | Dropzone is a button; drag-and-drop is an enhancement; type and size validated with a visible message; selected files removable by keyboard. |
| Forms | Validate on submit, then on blur after the first submit; focus the first invalid field; required fields `aria-required`; messages linked by `aria-describedby`; "Auto-saved draft" notes are `role="status"`. |

---

## C4. Page layouts, charts, responsive, accessibility

### Page layouts

#### 6.0 Spacing relationships (every layout)
| Relationship | Value | Token |
|---|---|---|
| Viewport → shell content (shell padding) | 16px | `space-shell-padding` |
| Sidebar → main panel | 20px | `space-shell-gap` |
| Page header → content (content top padding) | 8px | `space-page-top` |
| Content side and bottom gutter | 16px | `space-page-gutter` |
| Page sections (content flex gap) | 20px default; 24px on list/detail pages; 32px above a card grid | `space-section` = 20px |
| KPI cards apart | 16px | `space-grid` |
| Entity and dashboard cards apart | 20px | `space-grid-lg` / `space-card-gap` |
| Camera tiles, side-panel cards apart | 16px | `space-grid` |
| Collapsible sections apart | 12px | `space-stack` |
| Inside cards | 16 / 20 / 24 / 25px | `space-card` / `-lg` / `-xl` / `-entity` |
| Form columns / rows / sections | 20 / 40 / 24px | `space-form-col` / `-row` / `-section` |
Rule: a larger gap always separates more independent groups.

#### 6.1 Application shell
When: every application page.
| Part | Spec |
|---|---|
| `.ds-shell` | flex row, `100dvh`, padding 16px, gap 20px, background `#0b1020` + `gradient-app`, `overflow: hidden`, `isolation: isolate`; `#ds-overlay-host` |
| Ambient glows | `::before` 420 × 420 circle at left/top −120px, `glow-brand` = `rgba(59,130,246,0.10)`; `::after` 360 × 360 at right/bottom −40px, `glow-success` = `rgba(52,211,153,0.08)`; both `filter: blur(60px)`, z-index −1 |
| Sidebar rail | 256px glass panel (§5.37) |
| `.ds-main` | flex column, `flex: 1`, radius 24px, `gradient-glass-strong` = `linear-gradient(180deg, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.01) 100%)`, `box-shadow: shadow-shell, shadow-edge` = `0 28px 64px -16px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.02)`, `overflow: hidden`, no CSS border |
| Page header | §5.38, inside `.ds-shell__content` |
| `main.ds-page-content` | `flex: 1`, `overflow: auto` (only the content scrolls), column, gap 20px, padding 8px 16px 16px; children `flex-shrink: 0` |
| Skip link | absolute, hidden at top −100px, shows at 16px/16px on focus with glass fill, padding 8px 12px, radius 8px |
| Below 1024px | shell padding 0, gap 0, column; rail hidden; main radius 0, no shadow; `.ds-topbar` 56px tall, padding 0 16px, `surface-base` `#0f172a`, bottom `1px rgba(255,255,255,0.02)` with menu button, product name, avatar; sidebar opens in `.ds-overlay--nav-drawer` (fixed, start edge, `min(256px, 100%)`, `#0f172a`, `shadow-drawer-mirrored` = `18px 0 45px 0 rgba(0,0,0,0.80), 1px 0 0 0 rgba(255,255,255,0.07)`, scrim) |
Shell markup:
```html
<div class="ds-shell" id="ds-overlay-host">
  <a class="ds-skip-link" href="#app-main">Skip to content</a>
  <div class="ds-shell__rail" data-inert-scope><!-- .ds-sidebar-slot (§5.37) --></div>
  <div class="ds-main" id="ds-main">
    <div class="ds-topbar" data-inert-scope><button type="button" class="ds-icon-btn" aria-label="Open navigation" aria-expanded="false" aria-controls="app-drawer">☰</button><span class="ds-sidebar__name">Vision</span><span class="ds-avatar ds-avatar--photo" aria-hidden="true"><span>AS</span></span></div>
    <div class="ds-shell__content" data-inert-scope>
      <header class="ds-page-header">…</header>
      <main id="app-main" tabindex="-1" class="ds-page-content">…</main>
    </div>
    <div class="ds-toast-region" role="status" aria-live="polite"></div>
  </div>
  <!-- overlays portal here; drawer: <div class="ds-overlay ds-overlay--nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation" id="app-drawer"><div class="ds-overlay__backdrop" aria-hidden="true"></div><div class="ds-nav-drawer">…</div></div> -->
</div>
```

#### 6.2–6.11 Patterns
| Pattern | When | Structure | Spacing / sizes |
|---|---|---|---|
| 6.2 Page header | every page | title at start (36px back button leads detail pages; optional status pill); controls at end: **search → filters → primary** | one primary; actions 12px apart |
| 6.3 Filters | scoping data | page-wide in header (search 288–350px, selects 180px); card-scoped in the card header or a toolbar row above its table; role partitions = segmented tabs with counts, export at the end of that row | toolbar padding 16px, gap 12px |
| 6.4 Metrics | summary numbers | full-width `.ds-kpi-row` of 3–6 equal KPI cards | gap 16px; < 1280px → `grid repeat(auto-fill, minmax(min(260px,100%), 1fr))` |
| 6.5 Card grids | browsing sites/entities | `.ds-entity-grid` auto-fill `minmax(min(400px,100%), 1fr)`, `--3` = 3 columns ≥ 1280px; camera tiles 2 × 2 filling height; optional section title above | entity gap 20px; camera gap 16px; section title 16px above grid: 20px/28px 500 −0.35px `#8a99ae`, 6px `#475569` dot, gap 12px |
| 6.6 List / management | users, products | header → optional tab row → table card (table + pagination) | sections 24px apart; rows 44px (52 with row actions) |
| 6.7 Grouped list | equipment by hierarchy | header → KPI row → stack of collapsible sections, each with nested groups holding tables; first section and its first group open | sections and groups 12px apart |
| 6.8 Detail page | one record | header with back button → KPI row → table card (title + count + pagination) | 24px apart |
| 6.9 Dashboard | analysis | header with page-wide filters → KPI row → stacked dashboard cards: full-width chart, full-width matrix, pair (fixed 594px donut card + flexible heatmap, `.ds-dash-row`), full-width table, three status cards (flex 578 / 534 / 418) | KPI row 12px above first card; cards 20px apart; pairs stack < 1280px |
| 6.10 Forms | create/edit | slide panel (multi-field/multi-step) or modal (one compact step); `.ds-form-grid` 2 (or 3) equal columns; full-width rows for pickers, uploads, notes; sections start with a `modal-title` header over a 1px `rgba(255,255,255,0.02)` divider (16px below); footer: Back/Cancel at start, note + primary at end | columns 20px, rows 40px, sections 24px; one column < 1024px |
| 6.10 Full-page form [ext] | create flows needing the whole panel (Polaris Factory: every create/edit) | sidebar and page header hidden; top bar (min-height 76px, padding 16px 24px, gap 16px) with Back + centred stepper; centred scrolling column; footer bar; setup-guide panel at end ≥ 1024px | column max 820px (`--wide` 980px), gap 24px, scroll padding 32px 24px; footer padding 20px 24px, top `1px rgba(255,255,255,0.02)`, `gradient-glass-up`; guide 36% width max 480px, padding 32px, gap 24px, `surface-nested` `rgba(172,195,255,0.04)`, start border 1px `rgba(255,255,255,0.02)` |
| 6.11 Monitoring view | watching a running line | header (title + Live pill; factory and line selects; primary) → `.ds-monitor`: 2 × 2 `.ds-media-grid` filling height + 340px aside of stacked cards (summary strip, barcodes, system health) | grid gap 16px; aside 20px from grid; aside cards 16px apart; < 1280px aside moves below (full width) |

#### 6.12 Mapping needs to patterns
| Need | Pattern |
|---|---|
| Watch a running line | 6.11 monitoring view |
| Browse sites | 6.5 entity-card grid under a KPI row |
| Manage equipment by hierarchy | 6.7 grouped list |
| Manage users / products | 6.6 list page |
| Analyse quality | 6.9 dashboard |
| Create a multi-part record | 5.46 slide panel with stepper |
| Add one child record mid-flow | 5.44 modal over the panel |

---

### Charts

#### General rules
- Charts live in dashboard cards. Every chart has a title, a legend when > 1 series, readable axes, a tooltip on hover **and** focus, and an accessible data-table alternative.
- Colour encodes meaning only. Never use a status colour as a category colour. Numbers: en-GB grouping ("1,561").
- Never label every bar when a tooltip carries the value.

#### Palettes
| Palette | Tokens = values | Use |
|---|---|---|
| Binary quality | `chart-positive` = `#10b981`; `chart-negative` = `#ff5825` | good vs bad |
| Running / stopped | `chart-running` = `#34d399`; `chart-stopped` = `#ff5825` | status bars, legends |
| Categorical (in order) | `chart-cat-1` `#60a5fa`, `-2` `#2563eb`, `-3` `#6366f1`, `-4` `#4b10a3`, `-5` `#f383a3`, `-6` `#23b9ac`, `-7` `#ad77c2`, `-8` `#6aa760`, `-9` `#da825d`, `-10` `#1397bb` | donut, category series, shifts (A/B/C = 1/2/3) |
| Status | `chart-status-red` `#e5575f` (stopped/failed/error), `chart-status-yellow` `#e8b94a` (attention/no plan/warning) | status series only, never a category |
| Heat (5 stops, RGB interpolation) | `heat-0` `#003e3a`, `heat-1` `#116035`, `heat-2` `#597730`, `heat-3` `#d18732`, `heat-4` `#ff5825` | heatmap cells, bubble colour |
| Trend | `chart-trend` = `#ffffff` | dashed trend line + points |
| Track / baseline / axis line | `chart-track` `rgba(255,255,255,0.08)`; `chart-baseline` `rgba(255,255,255,0.06)`; `chart-axis` `#292e33` | |
Heat cell text: `#ffffff` up to 0.55 of the scale, `text-on-bright` `#0b0f14` from 0.59; values between snap their fill to the nearer edge.

#### Axes, marks and labels
| Element | Spec |
|---|---|
| Y axis | 28px column, 7 ticks (0 → nice max, e.g. 10k), labels `axis-y` 12px/24px −0.4px `text-axis` = `rgba(255,255,255,0.60)`, tabular, right-aligned 8px from plot; no vertical axis line |
| Baseline | 1px `rgba(255,255,255,0.02)` (`border-subtle`) under the plot |
| X axis | centred `axis-x` 14px/24px −0.4px `#ffffff`, 10px below baseline, ellipsis; dense axes `axis-caption` 11px/14px `#9eacba`, 2-line clamp |
| Gridlines | none horizontally (library `cl-gridline` = 1px `rgba(255,255,255,0.06)` only when a chart type needs it) |
| Stacked bars | equal bands; bar 60% of band, 6–74px; top corners 4px; no gap between segments; good at bottom, bad on top; plot 300px tall; hover `brightness(1.1)` |
| Trend line | 2px `#ffffff`, dash 6/5, own scale (max × 1.25); 10px white points at band centres; labels `data-label` 16px/22px `#ffffff`, `text-shadow: 0 1px 3px rgba(0,0,0,0.8)`, 14px above the point; hidden past 16 points |
| Line/area [ext] | 2px solid series in category colours; area fill 16% opacity |
| Donut | 180px, 32px ring on a `chart-track` circle; segments cat-1…10 clockwise from 12 o'clock; hover/active `brightness(1.15)`; legend beside it, rows 20px apart (12px when stacked under), 24px between label and value |
| Heatmap | flush card; header row `rgba(255,255,255,0.02)`, 14px/24px 600 −0.4px UPPERCASE `#94a3b8`, padding 8px 0; first column 28px start padding, 14px 600 `#ffffff`, end border 1px `#292e33`; cells 40px rows, 14px 600 `#ffffff` values; hover `brightness(1.25)`; focus 2px inset `#ffffff` ring; min-width 520px with horizontal scroll |
| Bubble matrix | rows 88px (64px past six rows); label column 154px: line 14px 600 `#f4f7fa` over factory 12px `#9eacba`; 16px to plot; bubble **area** encodes volume (diameter 14–54px), colour = heat scale, no ring; axis captions 11px 2-line, 4px below; hover/focus `scale(1.1)` |
| Horizontal bars | label column 154px, 12px gap; bar 20px tall, end corners 4px, min 6px |
| Reference line | 1px dashed 4/4 `rgba(255,255,255,0.60)` at 0.6 opacity; limit line `#fbbf24` full opacity |
| Mark focus | 2px solid `#3b82f6` outline offset 2px (on coloured fills `#ffffff` inset) |

#### Rich chart tooltip
| Part | Spec |
|---|---|
| Box | absolute, z-index 30, width 314px (`--wide` 342px), padding 13px, radius 9px, gap 10px, `pointer-events: none` |
| Fill / edge / shadow | `gradient-tooltip` = `linear-gradient(180deg, #171f31 0%, #101527 100%)`; `1px solid rgba(255,255,255,0.02)`; `0 12px 28px 0 rgba(0,0,0,0.20)` |
| Header | 11px coloured marker dot + bold title `tooltip-title` 11px/13px 700 `#f4f6f8`, "×" second dimension in `#aeb8c5`, gap 8px |
| Rows | `tooltip-body` 10px/12px, gap 6px; label `text-tooltip-muted` `#aeb8c5`, value `#f4f6f8`, space-between, gap 12px |
| Divider | 1px `border-tooltip-divider` = `rgba(57,67,75,0.40)` |
| List | titled list ("Defect Distribution") with values end-aligned |

#### Legends and controls
| Element | Spec |
|---|---|
| Swatch legend (default) | 24 × 16 swatch, radius 4px; 12px to label `legend` 14px/22px 500 `#8a99ae`; items 24px apart; value (with count) `#94a3b8`, 12px after |
| Dot legend (compact) | 12px dot, 8px to 12px/16px 500 `#8a99ae` label; items 20px apart |
| Sequential legend | 20 × 12 ramp swatches (radius 2px), 2px apart, 12px/16px `#94a3b8`; "no data" swatch `chart-track` |
| Placement | card header at the inline end, or beside the chart (donut); legends repeat every value |
| Controls | view switches = `accent` segmented tabs (40px); scoped filters = 180px filter selects; data freshness = tinted badge; controls before the legend in the card header |
| Reduced motion | bars, donut segments, segbar, progress, live dot: no transition/animation |

---

### Responsive

#### Breakpoints
| Name | Range | Shell |
|---|---|---|
| `xs` | < 640px | top bar + drawer; single column; tables scroll |
| `sm` | 640–1023px | top bar + drawer; 2-column grids |
| `md` | 1024–1279px | sidebar; KPI rows become grids; dashboard pairs stack |
| `lg` | 1280–1599px | full layout |
| `xl` | ≥ 1600px | full layout (designs drawn at 1920) |

#### Per-area rules
| Area | Rule |
|---|---|
| Shell | ≥ 1024px: sidebar visible (expanded). < 1024px: shell padding 0, no radii/shadow on main, 56px top bar (menu, product, avatar), sidebar as start-edge drawer (256px, `shadow-drawer-mirrored`, scrim); overlays become `position: fixed` |
| Page header | actions wrap below the title; search shrinks before wrapping; primary stays last. < 640px: 56px tall (top bar too), 8px block padding, always the soft card shadow `shadow-glass-soft`; sub-pages show back button + own title only (no "Parent /"), title at 20/28 |
| Full height | app frames use `min-h-[100dvh]`, never `min-h-screen` (100vh hides bottom-aligned content behind a fixed bottom bar on mobile); content above a fixed bottom bar gets padding ≥ the bar's height |
| Spacing | < 640px the semantic spacing tokens step down (gutter stays 16, section 16, grid 10/12, card 12/14/16/17, card gap 12, form 12/20/16, cell 12/10, KPI card 64): see D9 |
| KPI row | < 1280px → auto-fill grid, min 260px |
| Entity grid | auto-fill min 400px → 1 column at `xs`; 3 columns ≥ 1280px |
| Camera grid | 2 × 2 → 1 column < 1024px |
| Monitoring aside | moves below the grid < 1280px |
| Forms | form grids → 1 column < 1024px; full-page form guide panel only ≥ 1024px |
| Tables | keep their columns, scroll horizontally inside the card; pagination → "Page n of m" < 640px |
| Overlays | slide panels `min(size, 100%)`; modals `min(720px, 100% − 32px)` with internal scroll; < 1024px overlays cover the viewport |
| Toasts | < 640px: bottom 16px, full width minus 32px |
| Text | titles wrap; identifiers truncate with tooltip recovery; nothing meaningful is clipped |
| Touch targets | every target ≥ 24 × 24px; at `xs`/`sm` icon buttons should grow to 40px hit areas |
| RTL | logical properties (`inline-start/end`) everywhere; directional icons flip (`.ds-icon--dir`); numbers stay LTR; tooltips and drawers mirror |

---

### Accessibility

| Rule | Concrete requirement |
|---|---|
| Text contrast (WCAG 2.2 AA) | Measured on the composited navy (lightest `#0f172a`). On cards: `text-primary #ffffff` 14.89; `text-secondary #cbd5e1` 10.0; `text-muted #94a3b8` 5.81; `text-tertiary #8a99ae` 5.14 (Figma `#64748b` fails); `link #60a5fa` 5.86 (`#3b82f6` fails as text); `danger-text #ff7043` on `danger-bg` 4.87 (`#ff5825` fails as text); placeholder `rgba(203,213,225,0.60)` 4.57 (50% fails); white on tags purple 8.36 / blue 4.84 / green 4.90 / amber 4.81; white on `brand-strong #2563eb` 5.17 |
| Non-text contrast | Focus ring ≥ 4.05:1 everywhere. Status dots always carry a label. Glass control edges (2–7% white) are below 3:1 by design; controls are identified by fill, shadow, position and labels. Icons ≥ 3:1 on panels and cards |
| Increased-contrast mode | `@media (prefers-contrast: more)` or `[data-contrast="more"]` adds `border: 1px solid border-control-strong` = `#6b7280` to inputs, select triggers, attach fields, tab tracks, selected tab, radio cards, toggle options, current nav item, tertiary/subtle/ghost buttons, dropzones |
| Status and colour | Every status shows a text label; charts repeat values in legends, tooltips and data tables; heat cells print their value |
| Keyboard | Everything reachable and operable in logical order; skip link to main content; no traps except dialog traps that Escape closes |
| Focus indicator | `:focus-visible` = 2px solid `#3b82f6`, offset 2px (fields/tabs 1px, offset 0; inset −2px in scroll regions and feed rows; `#ffffff` on coloured fills). Never remove without replacement |
| Semantics | Landmarks `nav`, `main`, `header`; exactly one `h1` per page (`tabindex="-1"`, focus fallback); tables with header cells (`scope`) and captions; collapsible toggles are buttons inside headings |
| Truncation | Truncated text is recoverable (tooltip shown only when actually truncated) |
| Motion | Honour `prefers-reduced-motion: reduce` (all durations → 0) |
| Target size (SC 2.5.8) | Minimum 24 × 24px for every target |
| Forced colours | Status dots keep their fill (`forced-color-adjust: none`) |

---

---

# Part D: Adoption procedure

## D1. Install

1. **Extract the stylesheets** from Appendix A. From the app's root, with this DESIGN.md beside it (works on Windows, macOS and Linux):

   ```bash
   node -e "const fs=require('fs'),s=fs.readFileSync('DESIGN.md','utf8').replace(/\r\n/g,'\n');fs.mkdirSync('src/styles/ds',{recursive:true});for(const n of ['ds.css','text-styles.css']){const b=s.split('<!-- BEGIN '+n+' -->\n')[1].split('\n<!-- END '+n+' -->')[0].split('\n');fs.writeFileSync('src/styles/ds/'+n,b.slice(1,-1).join('\n')+'\n')}"
   ```

   If you have the Design-System-02 repo, copying `src/generated/ds.css` and `src/generated/text-styles.css` gives the same files.

2. **Load them once, first**, before any app CSS:

   ```ts
   // main.tsx: the very first imports
   import './styles/ds/ds.css';
   import './styles/ds/text-styles.css';
   ```

   `ds.css` loads Inter, sets the reset, the body background (`gradient-app`) and the focus ring. Don't add another font link or body background.

3. **Pass the gate** (A1 step 2).

4. **React components (optional but recommended).** With the DS repo available, copy `src/components/ds/` as is (needs `react`, `react-dom`, `lucide-react`; built on lucide 0.468, so after copying run `tsc` and fix renamed icons in the copied files only). `Display.tsx` imports `spec` for illustrations: add `src/generated/spec.json` and a two-line `src/lib/spec.ts`: `import { crops, registry } from '../generated/spec.json'; export const spec = { crops, registry };`. Without the repo, write the markup shown for each component in C3; the stylesheet does all the styling.

5. **Assets (optional).** `public/figma/icons/` for `figmaIcons`, `public/assets/illus-*` for illustrations (D10).

6. **Delete the old system** (D2), **install the Tailwind preset** (D3), **set the theme** (D4), then **build the shell** (C4 shell markup) and migrate screens (D12).

## D2. Delete the old system

Each item must reach zero before you migrate screens. Expect the app to look broken for a moment: every element that wasn't on the system now shows up, and you replace it from D5 to D7.

- [ ] Every `--ds-*:` **definition** outside the copied `ds.css` (`:root` blocks, `.dark` blocks, `<style>` in `index.html`, theme files).
- [ ] Every hand-written rule for a `.ds-*` class, and every look-alike (`.seg-tabs`, `.glass-card`).
- [ ] **Every CSS rule that targets a utility class** (`.bg-white`, `.dark .border-gray-200`, `[class*="text-gray"]`, `[style*="linear-gradient"]`). These are remaps (rule 2).
- [ ] Theme CSS files built on the old design (`dark.css`, `theme.css`) and any `ThemeContext` that writes colours.
- [ ] The old Tailwind theme: palette entries, `fontSize`, `fontFamily`, `borderRadius`, `boxShadow`, custom colours.
- [ ] Extra font links (Google Fonts `Inter`, `Poppins`…).
- [ ] Inline style colours, gradients and shadows in components (`style={{ background: 'linear-gradient(…)' }}`).

## D3. Tailwind

Tailwind may stay **for layout only**: flex, grid, position, display, overflow, width and height. Everything visual comes from DS classes. Replace the app's Tailwind config with this preset. It *replaces* (doesn't extend) the visual scales, so palette, type, radius and shadow utilities stop generating CSS and the D11 checks flag them.

```js
// tailwind.config.js (or `tailwind.config = {...}` with the CDN build)
const v = name => `var(--ds-${name})`;
const SPACE = { 0: '0', px: '1px', 0.5: v('space-0-5'), 1: v('space-1'), 1.5: v('space-1-5'), 2: v('space-2'), 2.5: v('space-2-5'),
  3: v('space-3'), 3.5: v('space-3-5'), 4: v('space-4'), 5: v('space-5'), 6: v('space-6'), 8: v('space-8'), 10: v('space-10'),
  12: v('space-12'), 16: v('space-16') };

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: { preflight: false },            // ds.css carries the reset
  theme: {
    colors: { transparent: 'transparent', current: 'currentColor', inherit: 'inherit' },
    textColor: {                                 // for icons and inline spans inside DS components only
      transparent: 'transparent', current: 'currentColor', inherit: 'inherit',
      primary: v('color-text-primary'), secondary: v('color-text-secondary'), muted: v('color-text-muted'),
      tertiary: v('color-text-tertiary'), faint: v('color-text-faint'), link: v('color-link'), icon: v('color-icon'),
      success: v('color-success-text'), warning: v('color-warning-text'), danger: v('color-danger-text'), error: v('color-error-text'),
    },
    borderColor: { transparent: 'transparent', DEFAULT: v('color-border-subtle'), subtle: v('color-border-subtle'),
      strong: v('color-border-strong'), divider: v('color-border-divider') },
    fontSize: {}, fontWeight: {}, letterSpacing: {}, lineHeight: {}, fontFamily: {},   // type = .ds-ts-* only
    borderRadius: { none: '0', xs: v('radius-xs'), chip: v('radius-chip'), sm: v('radius-sm'), control: v('radius-control'),
      track: v('radius-track'), nested: v('radius-nested'), card: v('radius-card'), panel: v('radius-panel'), full: v('radius-full') },
    boxShadow: { none: 'none' },
    backgroundImage: {},                          // no bg-gradient-to-*
    padding: SPACE, margin: { ...SPACE, auto: 'auto' }, gap: SPACE, space: SPACE, inset: { ...SPACE, auto: 'auto', full: '100%' },
    extend: {
      width:  { control: v('size-control'), aside: v('size-aside'), filter: v('size-filter') },
      height: { control: v('size-control'), 'control-sm': v('size-control-sm'), row: v('size-table-row') },
      zIndex: { header: v('z-header'), sidebar: v('z-sidebar'), menu: v('z-menu'), overlay: v('z-overlay'), toast: v('z-toast') },
    },
  },
};
```

Allowed: `flex items-center gap-3`, `grid grid-cols-3 gap-4`, `min-w-0`, `truncate`, `w-full`, `rounded-card`, `text-muted` on an icon.
Not allowed: `text-sm`, `font-medium`, `bg-white`, `bg-slate-800`, `text-gray-400`, `border`, `border-gray-200`, `divide-y`, `rounded-xl`, `shadow-lg`, `bg-gradient-to-b`, `bg-[#0f172a]`, `text-[13px]`.

**Borders in Tailwind.** `border` / `border-b` utilities are allowed only for a divider *inside* your own layout glue, and only with `border-divider`. A card, panel, input, table or badge never gets a border utility; its edge is in `ds.css`.

**Don't override a DS component's own layout on the same element.** If a `ds-*` class sets `display`, `flex-direction`, `align-items`, `gap` or `padding` (menu options, callouts, badges, buttons, tabs), don't add utilities that set the same property beside it (`<a class="ds-menu__option flex-col">`). Which one wins depends on stylesheet order. Put a wrapper inside: `<a class="ds-menu__option"><span class="flex flex-col gap-2 w-full">…</span></a>`.

Off-scale spacing (`p-7`, `gap-9`) no longer exists. Pick the nearest scale step, or the component's own spacing.

## D4. Themes

- **Dark is the default.** Nothing to set.
- **Light** is a full DS-02 theme compiled into `ds.css`: set `<html data-theme="light">`. Its values are in C2.
- A theme toggle sets or removes that one attribute (and stores the choice). That's the whole implementation.
- **An app that was light and had a `.dark` class toggle** (HUL): delete the dark stylesheet and the light styling, migrate the markup to DS components once, then switch with `data-theme`. Don't keep `dark:` variants or a `.dark` remap file; they are a second design.

## D5. Typography: choosing a text style

One family (Inter) and seven sizes: **10 / 11 / 12 / 14 / 16 / 20 / 24 px**. There is no 13, 15, 18 or 28. Text gets its size, weight, line height, tracking, case **and colour** from one `.ds-ts-*` class (full table in C2). Choose by the text's **role**, never by the size the old app used:

| Role | Class |
|---|---|
| Page title (the `h1` in the page header) | `ds-ts-page-title` |
| Dialog / slide-panel title | `ds-ts-dialog-title` |
| Modal title (small, in the modal head) | `ds-ts-modal-title` |
| Dashboard / chart card title | `ds-ts-card-title` |
| Entity card name (factory, line) | `ds-ts-entity-title` |
| Camera / media tile title | `ds-ts-media-title` |
| Group heading in a grouped list / sub-group | `ds-ts-group-title` / `ds-ts-subgroup-title` |
| Summary-strip title (the record the page is about) | `ds-ts-summary-title` |
| Section heading inside a page / section eyebrow label | `ds-ts-section-title` / `ds-ts-section-label` |
| KPI value / KPI label | `ds-ts-kpi-value` / `ds-ts-kpi-label` |
| Inline metric value / denominator / label | `ds-ts-metric-value` / `ds-ts-metric-denominator` / `ds-ts-metric-label` |
| Read-only field label / value (detail lists) | `ds-ts-field-label` / `ds-ts-field-value` |
| Coloured eyebrow above a title | `ds-ts-eyebrow` |
| Body text: default / muted / strong / emphasis | `ds-ts-body` / `ds-ts-body-muted` / `ds-ts-body-strong` / `ds-ts-body-emphasis` |
| Secondary small text / small strong | `ds-ts-small` / `ds-ts-small-strong` |
| Caption (timestamps, footnotes) | `ds-ts-caption` |
| Table header / primary cell / cell | `ds-ts-table-header` / `ds-ts-table-cell-primary` / `ds-ts-table-cell` |
| Form label / uppercase form label / helper / validation | `ds-ts-form-label` / `ds-ts-form-label-caps` / `ds-ts-helper` / `ds-ts-validation` |
| Input value / placeholder | `ds-ts-input-text` / `ds-ts-placeholder` |
| Inline text action ("+ Add user") | `ds-ts-link-action` |
| Navigation item / navigation section label | `ds-ts-nav-item` / `ds-ts-nav-section` |
| Tab label / tab count | `ds-ts-tab` / `ds-ts-tab-count` |
| Stepper title / sub-label | `ds-ts-step-title` / `ds-ts-step-sub` |
| Tag / count pill / avatar initials / toast | `ds-ts-tag` / `ds-ts-count-pill` / `ds-ts-avatar-initials` / `ds-ts-toast` |
| Media tile detail line | `ds-ts-media-detail` |
| Chart: legend / small legend / y-axis / x-axis / axis caption / data label | `ds-ts-legend` / `ds-ts-legend-sm` / `ds-ts-axis-y` / `ds-ts-axis-x` / `ds-ts-axis-caption` / `ds-ts-data-label` |
| Chart tooltip title / body, heat-map cell | `ds-ts-tooltip-title` / `ds-ts-tooltip-body` / `ds-ts-heat-cell` |

**Inside a DS component you add no text class.** Buttons, tabs, KPI cards, tables and the rest style their own text.

**Legacy utilities have no 1:1 replacement**, because the old app used one size for many roles:

| Old markup | Usually becomes |
|---|---|
| `text-2xl font-bold` page heading | `ds-ts-page-title` (in the page header) |
| `text-lg/xl font-semibold` card heading | `ds-ts-card-title` (dashboard card) or `ds-ts-entity-title` (entity card) |
| `text-sm text-gray-500` description | `ds-ts-body-muted` |
| `text-sm font-medium text-gray-900` | `ds-ts-body-strong` |
| `text-xs uppercase tracking-wide text-gray-500` | `ds-ts-section-label` or `ds-ts-kpi-label` |
| `text-xs text-gray-500` metadata | `ds-ts-small` or `ds-ts-caption` |
| `text-xs` / `text-sm` form label | `ds-ts-form-label` (via the form field) |
| `text-2xl font-bold` number in a stat card | `ds-ts-kpi-value` (via the KPI card) |
| `text-xs text-red-500` error | `ds-ts-validation` (via the form field) |

`.ds-text-*` classes are an older short set kept for compatibility; use `.ds-ts-*` in new code.

## D6. Surfaces: choosing a card

Three depths of glass on the navy page, each a step lighter. Overlays are the only opaque surfaces (values in C2):

| Depth | What | Surface |
|---|---|---|
| 0 · Page | `body` | `gradient-app` + two ambient glows (set by `ds.css`) |
| 1 · Shell | sidebar, main panel | `.ds-sidebar`, `.ds-main` |
| 2 · Card | every card inside the main panel | `gradient-glass` + `shadow-surface` (drop shadow + white/2 % inset edge), `radius-card` 16 px. **No CSS border, no tint.** |
| 3 · Well | nested area inside a card | `surface-nested` (`rgba(172,195,255,0.04)`), `radius-nested`, no edge |
| Overlay | modal, drawer, menu, tooltip, popover | `gradient-dialog`, `surface-raised`, `gradient-tooltip` |

There is **no generic card** and **no coloured card**. Pick the card by what it holds:

| It holds… | Use | Class | C3 |
|---|---|---|---|
| One number with an icon (stat tile) | `KpiCard` in `.ds-kpi-row` | `.ds-kpi` | 5.23 |
| One record: name, status, a few metrics | `EntityCard` in `.ds-entity-grid` | `.ds-entity` | 5.24 |
| A chart, or a titled block of data | `DashCard` in `.ds-dash-row` | `.ds-dash-card` | 5.25 |
| A status bar plus a list | `StatusCard` | `.ds-status-card` | 5.26 |
| The record a page is about (title + key fields) | `SummaryStrip` | `.ds-strip` | 5.35 |
| A side block: label + rows / field list / health rows; a small centred form (sign in) | `PanelCard` with `FieldList` / `HealthRow` | `.ds-panel-card` | 5.35 |
| A camera feed | `MediaCard` in `.ds-media-grid` | `.ds-media-card` | 5.36 |
| A table with a header row | `TableCard` | `.ds-table-card` | 5.42 |
| A collapsible group | `Collapsible` | `.ds-section-card` | 5.43 |

A status-coloured card (red for failures, green for OK) is never a card fill: put a `Badge`, status dot or `InlineAlert` *inside* a normal card. A form section is `.ds-form-section` (C4 forms). An empty placeholder is `EmptyState`. Anything else is a new variant: rule 10.

## D7. Component replacement map

Every component, its React export, root class, and what it replaces in a typical existing app (examples from Sightshark and HUL). Values and markup for each are in C3.

### Actions

| C3 | Component | React | Root class · variants | Replaces |
|---|---|---|---|---|
| 5.1 | Button | `Button` | `.ds-btn` · `--primary` `--secondary` `--subtle` `--tonal` `--ghost` `--danger` `--section` · `--sm` `--lg` | `ui/Button`, `<button className="bg-blue-600 …">` |
| 5.2 | Icon button | `IconButton` | `.ds-icon-btn` · `--close` `--open` `--sm` `--compact` | icon-only buttons, "×" close |
| 5.3 | Link action | `LinkAction` | `.ds-link-action` | "+ Add …" text buttons |
| 5.4 | Action group | — | `.ds-action-row` | button rows in headers and footers |

### Inputs

| C3 | Component | React | Root class | Replaces |
|---|---|---|---|---|
| 5.5 | Text input | `TextInput` | `.ds-input` (`--suffix`, `--trailing`) in `.ds-input-wrap` | `<input className="border rounded …">` |
| 5.6 | Search input | `SearchInput` | `.ds-search` · `--sm` `--md` `--lg` `--full` | search boxes |
| 5.7 | Textarea | `Textarea` | `.ds-textarea` | raw textareas |
| 5.8 | Form field | `Field` | `.ds-field` (`--caps`) | label + input + error wrappers |
| 5.9 | Select | `Select` | `.ds-select` (`--rich`) | custom selects, native `<select>` |
| 5.10 | Dropdown menu | (inside `Select`) | `.ds-menu` | ad-hoc dropdowns, "more actions" menus |
| 5.11 | Multi-select | `MultiSelect` | `.ds-select` + `.ds-menu` | multi-choice dropdowns |
| 5.12 | Checkbox | `Checkbox` | `.ds-check` | raw checkboxes |
| 5.13 | Radio cards | `RadioCards` | `.ds-radio-group` > `.ds-radio-card` | radio lists, option tiles, restyled `input[type=radio]` |
| 5.14 | Binary toggle | `BinaryToggle` | `.ds-toggle` | Active/Inactive pickers |
| 5.15 | Switch | `Switch` | `.ds-switch` | on/off toggles |
| 5.16 | Date range picker | `DateRangePicker` | `.ds-input--date` + `.ds-popover` | date pickers |
| 5.17 | File upload | `FileUpload` | `.ds-dropzone` | upload areas |
| 5.18 | Attach field | `AttachField` | `.ds-attach` | input + browse button |
| 5.19 | Rich picker | `RichPicker` | `.ds-picker` | searchable selects, user/entity pickers |

### Feedback and status

| C3 | Component | React | Root class | Replaces |
|---|---|---|---|---|
| 5.20 | Inline callout | `Callout` | `.ds-callout` | info boxes |
| 5.21 | Inline alert | `InlineAlert` | `.ds-callout--{info,success,warning,error}` | coloured alert boxes (`bg-red-50 border-red-200`) |
| 5.27 | Badge | `Badge`, `LiveBadge` | `.ds-badge` · `--success` `--warning` `--error` `--info` `--neutral` · `--glass` `--sm`; `.ds-live` | status pills |
| 5.28 | Status dot | `Dot`, `Status` | `.ds-dot`, `.ds-status` | coloured dots |
| 5.29 | Tag | `Tag` | `.ds-tag` · `--purple` `--green` `--rose` `--raised`… | role / category chips |
| 5.30 | Count pill | `CountPill` | `.ds-count` (`--sm`) | "(12)" counters |
| 5.31 | Info chip | `Chip` | `.ds-chip` | code / ID chips |
| 5.32 | Avatar | `Avatar` | `.ds-avatar` · `--neutral` `--photo` | initials circles |
| 5.33 | Metric | `Metric` | `.ds-metric` (`--inline`) | "12 / 40" inline values |
| 5.34 | Progress, segmented bar | `Progress`, `SegBar` | `.ds-progress`, `.ds-segbar` | progress bars, stacked status bars |
| 5.48 | Toast | `ToastRegion` | `.ds-toast-region` > `.ds-toast` | toast providers |
| 5.49 | Tooltip | `Tooltip` | `.ds-tooltip` | `title=` on icon buttons, custom tooltips |
| 5.50 | Loading | `Skeleton`, `Spinner` | `.ds-skeleton`, `.ds-spinner` | spinners, shimmer blocks |
| 5.51 | Empty state | `EmptyState` | `.ds-empty` | empty placeholders |

### Containers and cards (choose with D6)

| C3 | Component | React | Root class | Replaces |
|---|---|---|---|---|
| 5.22 | Stepper | `Stepper` | `.ds-stepper` > `.ds-step` | wizard step indicators |
| 5.23 | KPI card | `KpiCard` | `.ds-kpi` in `.ds-kpi-row` | stat tiles, pastel summary cards |
| 5.24 | Entity card | `EntityCard` | `.ds-entity` in `.ds-entity-grid` | record tiles |
| 5.25 | Dashboard card | `DashCard` | `.ds-dash-card` in `.ds-dash-row` | `Card` around charts and data |
| 5.26 | Status card | `StatusCard` | `.ds-status-card` | health / uptime summaries |
| 5.35 | Summary strip, panel card | `SummaryStrip`, `PanelCard`, `FieldList`, `HealthRow` | `.ds-strip`, `.ds-panel-card`, `.ds-fieldlist`, `.ds-health-row` | detail headers, key/value lists |
| 5.36 | Media card, viewer | `MediaCard`, `MediaViewer` | `.ds-media-card`, `.ds-viewer` | camera feeds, image previews |
| 5.42 | Table card | `TableCard` | `.ds-table-card` | card wrapping a table + toolbar |
| 5.43 | Collapsible | `Collapsible` | `.ds-section-card` (`--nested`) | accordions, grouped settings |

### Navigation

| C3 | Component | React | Root class | Replaces |
|---|---|---|---|---|
| 5.37 | Sidebar | `Sidebar`, `NavItem` | `.ds-sidebar`, `.ds-nav` | side navigation |
| 5.38 | Page header, breadcrumb | `PageHeader`, `Breadcrumb` | `.ds-page-header`, `.ds-breadcrumb` | top headers, title rows, breadcrumbs |
| 5.39 | Segmented tabs | `Tabs`, `TabPanel` | `.ds-tabs` > `.ds-tab` · `--sm` `--accent` | tab bars, pill toggles, `.seg-tabs` |
| 5.40 | Pagination | `Pagination` | `.ds-pagination` | pagers, row counts |

### Data

| C3 | Component | React | Root class | Replaces |
|---|---|---|---|---|
| 5.41 | Data table | `DataTable` | `.ds-table-region` > `.ds-table` · `--compact` `--grid` | raw `<table>` with `divide-y` |
| C4 | Charts | `src/charts/` (DS repo) | `.ds-chart`, `.ds-donut`, `.ds-heatmap`… | chart libraries (keep one only if restyled with chart tokens) |

### Overlays

| C3 | Component | React | Root class | Replaces |
|---|---|---|---|---|
| 5.44 | Modal | `Modal` | `.ds-overlay` > `.ds-modal` (`--sm`) | modals |
| 5.45 | Confirmation dialog | `ConfirmDialog` | `.ds-dialog` | confirm popups |
| 5.46 | Slide panel | `SlidePanel` | `.ds-panel` · `--sm` `--lg` | drawers, side forms |
| 5.47 | Popover | `Popover` | `.ds-popover` | floating panels |

When you write markup without the React component, copy the C3 markup exactly, ARIA attributes included.

## D8. Page rules

Every page uses one of the C4 layout patterns.

| Page type | Pattern | Building blocks |
|---|---|---|
| App frame | Shell | `.ds-shell` > sidebar + `.ds-main` |
| Any page top | Page header | `PageHeader` (illustration, title, breadcrumb, actions) |
| Overview / home | Metrics + dashboard | `.ds-kpi-row` of `KpiCard`, then `.ds-dash-row` of `DashCard` |
| Browse records | Card grid | KPI row + `.ds-entity-grid` of `EntityCard` |
| Manage records | List page | `Tabs` + filters + `TableCard` > `DataTable` + `Pagination` |
| Hierarchy | Grouped list | `Collapsible` sections with nested `DataTable` |
| Detail page | Detail | `SummaryStrip` + `Tabs` + `PanelCard` / `DashCard` |
| Analytics | Dashboard | KPI row + `DashCard` charts |
| Create / edit | Form | `SlidePanel` (+ `Stepper`) with `.ds-form-grid` of `Field`s; a mid-flow child record opens in a `Modal` |
| Live monitoring | Monitor | `.ds-monitor`: `.ds-media-grid` of `MediaCard` beside `PanelCard`s |
| Sign in | Sign-in page | Below |

**Sign-in page.** No shell or header; everything is centred on the page gradient, in this order:

1. **App mark and name**, centred above the card, 12 px apart (`gap-3`): the `.ds-sidebar__logo` tile at 64 px with the mark at 40 px, then the product name in `ds-ts-page-title`. No tagline or sub-line.
2. **One `.ds-panel-card`**, `max-width: var(--ds-size-panel-md)` (560 px), wide enough for each account name to fit on one line. It holds:
   - "Sign in" `<h1>` in `ds-ts-page-title`, `mb-2` before the first field. No subtitle.
   - The form: `Field` + `TextInput` for email and password, 24 px apart (`gap-6`); an error `InlineAlert` if sign-in fails; a full-width primary `Button size="lg"` with `mt-4` above it.
   - **"Sign in as"** (prototypes with demo accounts), `mt-4` above: a `.ds-field__label` heading a `role="group"`, then a 2 × 2 grid (`grid-cols-2 gap-3`) of account cards. Each is a `button.ds-menu__option.ds-section-card--nested` with a small icon tile and the role name in `ds-ts-body-strong` (`min-w-0 truncate`). No role descriptions, no password hint. Clicking signs in as that role.
   - Footer: `© <year> <Product>` in `ds-ts-caption`, no disclaimer.

Reference: Polaris Factory `src/LoginPage.tsx` (roles: Factory Admin `ShieldCheck`, Integration Engineer `Network`, Application Engineer `AppWindow`, Viewer `Eye`).

**One search per screen.** If the header has a global search, list pages don't add their own; narrow lists with tabs and filter selects.

**One toolbar row.** On a list or browse page one row holds, in order: tabs, then filter dropdowns (left-aligned), then the page's primary CTA at the far end. Never the CTA alone above the filters, never in the top header. Page order: header → toolbar row → KPI row → content. A page-level CTA is the default button size; `sm` is for actions inside a panel, row or dialog.

**Row counts go below the table.** The table footer reads "Showing 1 – 12 of 21 assets", adding "(filtered from N)" when filters narrow the list, and shows even on a single page. Never put a count in the toolbar: it squeezes the filters.

**Status tags: one variant.** `Badge size="sm"` (tinted, with dot) for every status in rows, cards and headers. `appearance="glass"` only on top of images or video, where a tinted pill wouldn't read.

**Sub-pages.** Anything opened from another page that isn't a modal (detail, drill-down, even a URL-parameter view) shows "‹ Parent / Title" in the top header: back button, parent in `text-muted`, "/", title. On phones (< 640px) `ds.css` hides the parent and "/" (`.ds-page-header__parent`, `.ds-page-header__sep`), leaving "‹ Title"; keep rendering both, the CSS decides. Never an in-page breadcrumb or "← Back" link. Modals, slide panels and full-page forms keep their own close/back controls.

**Forms.** Default: a `SlidePanel` with a `Stepper` for several steps. A product decision recorded in the spec overrides this (Polaris Factory keeps every form full-page and centred).

**Navigation that doesn't fit the shell** (a top navbar, a handheld scanning flow, a kiosk): keep the shell and its main panel; below 1024 px the shell already shows a top bar with a menu drawer. If that still doesn't fit the product, propose a spec addition (rule 10). Don't restyle the old navbar with DS colours.

## D9. Spacing and sizing

A larger gap always separates more independent things.

**Mobile (< 640px).** `ds.css` steps the semantic spacing tokens down on phones (spec §8.10):

| Token | Desktop | Phone |
|---|---|---|
| `--ds-space-page-gutter` | 16 | 16 (unchanged) |
| `--ds-space-section` | 20 | 16 |
| `--ds-space-grid` / `-grid-lg` | 16 / 20 | 10 / 12 |
| `--ds-space-stack` | 12 | 8 |
| `--ds-space-card` / `-lg` / `-xl` / `-entity` | 16 / 20 / 24 / 25 | 12 / 14 / 16 / 17 |
| `--ds-space-card-gap`, `--ds-space-chart-gap` | 20 | 12 |
| `--ds-space-header-actions` | 12 | 8 |
| `--ds-space-form-col` / `-row` / `-section` | 20 / 40 / 24 | 12 / 20 / 16 |
| `--ds-space-cell-x` / `-y` | 16 / 12 | 12 / 10 |
| `--ds-size-page-header`, `--ds-size-kpi-card` | 76, 76 | 56, 64 |

On phones the page header always shows `--ds-shadow-glass-soft`, the same soft shadow as cards (desktop: no shadow until content scrolls under it). Don't add another shadow on a sticky wrapper; toggle `.ds-page-header--scrolled` on the header instead.

So page padding, section gaps and grid gaps **must use these tokens** (`px-[var(--ds-space-page-gutter)]`, `gap-[var(--ds-space-section)]`, `gap-[var(--ds-space-grid)]`), not fixed `px-4` / `gap-5`, or they stay at desktop size on a phone. DS components already use them.

**Between blocks** (the shell and DS grids apply these):

| Between | Gap | Token / class |
|---|---|---|
| Page sections (KPI row → cards → table) | 20 | `--ds-space-section` (`gap-5`) |
| KPI cards | 16 | `.ds-kpi-row` |
| Entity and dashboard cards | 20 | `.ds-entity-grid`, `.ds-dash-row` |
| Collapsible sections | 12 | `--ds-space-stack` (`gap-3`) |
| Stacked items inside a card | 12 | `--ds-space-stack` (`gap-3`) |
| Form fields: columns / rows | 20 / 24 | `.ds-form-grid` |

**Inside a row or cell:**

| Between | Gap | Utility |
|---|---|---|
| Title and its sub-line (stacked) | 2–4 | `gap-0.5` / `gap-1` |
| Label and its control | 6 | `.ds-field` does it |
| Icon and its label | 8 (12 for 20 px+ icons) | `gap-2` (`gap-3`) |
| Inline items: text, badge, chip, count | 8 | `gap-2` |
| Groups of actions or controls in a toolbar | 12 | `gap-3` / `.ds-cluster` |
| Row text and its trailing status / chevron | ≥ 12 | `gap-3`, status at the row's end |

**Sizing:**

- **Never fix a width to align things** (`w-[66px]`). Put the variable-width part at the row's **end**, or use a grid with `auto` columns.
- **Truncate with the DS:** `.ds-cell-truncate` in tables (240 px default; override with `--ds-cell-max`), or `truncate` + `min-w-0` inside a flex row. Not `max-w-[180px]`.
- **No arbitrary values** (`w-[…px]`, `ml-[22px]`, `min-h-[600px]`). Use a scale step, a `--ds-size-*` token or a component.
- **Fixed sizes come from tokens:** controls `--ds-size-control*`, icons `--ds-size-ui-icon*`, panels `--ds-size-panel-*`, scroll caps `--ds-size-menu-max-height` / `--ds-size-picker-max-height`.

## D10. Icons and imagery

- **Controls** use thin outline icons in `--ds-color-icon` (`lucide-react`, or `figmaIcons`), sized `--ds-size-ui-icon` / `-sm`. Render through `Icon` so direction-aware icons flip in RTL.
- **Navigation, page headers and KPIs** use glossy 3D illustrations (`Illustration`, `public/assets/illus-*`). Don't mix outline icons in there, and don't put illustrations in controls.
- **Brand and vendor logos** are content and keep their colours; mark such colour data `// ds-allow: third-party brand colour`.
- **Never recolour images with CSS filters** to fit the theme (`filter: brightness(0) invert(1)`, SVG colour-matrix filters). Use a correct asset.

## D11. Verification

### Checks you run inside the app (no DS repo needed)

Run from the app root. Each command must print **nothing** (except lines marked `ds-allow:`):

```bash
# 1. Tokens are defined only in ds.css
grep -rnE --include=*.css --include=*.scss --include=*.html -e '--ds-[a-z0-9-]+\s*:' src | grep -v 'styles/ds/ds.css'
# 2. No CSS that targets utility classes (remaps)
grep -rnE '(^|[ ,>~+(])\.(bg|text|border|from|via|to|divide|ring|shadow|rounded)-[a-z]' src --include=*.css --include=*.scss
grep -rnE '\[(class|style)\*=' src --include=*.css --include=*.scss
# 3. No colour literals in components and styles
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' src --include=*.tsx --include=*.ts --include=*.jsx --include=*.css | grep -v 'styles/ds/' | grep -v 'ds-allow:'
# 4. No Tailwind visual utilities
grep -rnoE '(^|[^-a-zA-Z0-9_])(text-(xs|sm|base|lg|[2-9]?xl)|font-(thin|light|normal|medium|semibold|bold|extrabold)|(bg|text|border|ring|divide|from|via|to)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-[0-9]+)?(/[0-9]+)?|shadow(-(sm|md|lg|xl|2xl|inner))?|rounded(-(sm|md|lg|xl|2xl|3xl))?|bg-gradient-to-[a-z]+)([^-a-zA-Z0-9_/]|$)' src --include=*.tsx --include=*.jsx
# 5. No inline gradients, shadows or font sizes
grep -rnE "linear-gradient|radial-gradient|boxShadow|fontSize|font-size" src --include=*.tsx --include=*.jsx
# 6. No arbitrary sizes
grep -rnoE '\b[a-z-]+-\[[0-9.]+(px|rem)\]' src --include=*.tsx --include=*.jsx
# 7. The stylesheets are untouched (compare with Appendix A: re-extract to a temp dir and diff)
```

Check 4 doesn't catch bare `border` / `border-b` utilities; search for those too and review each against D3's border rule. Check 7: run the D1 command with `src/styles/ds` replaced by a temp folder, then `diff -r` the two folders.

### The full check (with the DS repo)

```bash
npm run check:adoption -- ../path/to/app            # summary per check
npm run check:adoption -- ../path/to/app --verbose  # every hit with file:line
```

It checks: stylesheets present and identical; no token defined elsewhere; every `var(--ds-*)` exists; no colour literals; no Tailwind type sizes, weights, palette colours, radii or shadows; no px font sizes; no arbitrary sizes. `ds-allow: <reason>` exempts a line; use it only for content data (brand colours), never UI.

### A screen is done when

- [ ] The checks pass for its files.
- [ ] It uses a D8 pattern, and every card, tab, button, field, table and overlay on it is a D7 component.
- [ ] Every text node has a `.ds-ts-*` class or sits inside a DS component.
- [ ] It passes A3 by eye: no visible lines around cards, no tinted cards, one badge variant, glass surfaces on the navy gradient.
- [ ] With the DS repo: side by side with the matching showcase page at 1440 px, surfaces, type, spacing and states match.
- [ ] Keyboard pass: Tab through everything; arrows in tabs and selects; Escape closes overlays.
- [ ] It works at 390 px and 768 px wide with no horizontal page scroll.

## D12. Migration order

0. **List dead code**: files not reachable from the entry point. Don't restyle them; ask the owner whether to delete.
1. **Foundation:** extract the stylesheets (D1), delete the old system (D2), install the preset (D3), set the theme (D4). Checks 1–2 and 7 pass.
2. **Shell:** sidebar, main panel, page header. Every page now sits in the right frame.
3. **Shared components:** rewrite each app wrapper (`Button`, `Card`, `Input`, `Segmented`, `Modal`…) as a re-export of, or thin adapter over, the DS component. Delete wrappers that add nothing. This one step fixes every screen that uses them.
4. **Screens, one at a time**, in order of traffic: pick the D8 pattern, replace markup with D7 components, set text classes (D5), and run the D11 checks on the screen's files until clean.
5. **Leftovers:** colour literals in data, charts and one-off pages, until the whole app passes.

## D13. Brief for whoever does the work

Paste this when handing a migration to a developer or an AI agent, **with this DESIGN.md file attached**:

> Adopt the Vision Automation design system DS-02 in `<app path>`, following the attached DESIGN.md exactly.
> 1. Read Part A and Part B in full first.
> 2. Extract `ds.css` and `text-styles.css` from Appendix A with the D1 command, load them first, and pass the A1 gate. If you can't, stop and report; don't recreate tokens or restyle the existing UI.
> 3. **Delete** the app's existing tokens, theme files, CSS that targets utility classes, legacy surface classes and Tailwind theme (D2). Install the D3 preset: Tailwind is for layout only.
> 4. Replace every card, tab, button, input, select, table, badge, modal and drawer with the D7 component, choosing cards by D6 and pages by D8. No CSS borders, tints or gradients on cards.
> 5. Give every text node a `.ds-ts-*` class chosen by **role** (D5).
> 6. Done = every D11 check prints nothing and each screen passes A3. Report the check output, don't summarise it.
> If something has no component or token, stop and propose a spec addition. Don't invent a value.

## D14. Keeping the app in sync

When the design system changes:

1. In the Design-System-02 repo: change `spec/DESIGN_SYSTEM.md`, run `npm run build` (this regenerates `ds.css`, `text-styles.css` and Appendix A of this file), `npm run check:tokens` and, with DEOC running, `npm run check:deoc`. Update Part C and the revision line at the top if values changed.
2. Re-extract the stylesheets into each app (D1) and re-copy changed files in `src/components/ds/`.
3. Run the D11 checks. Check 7 fails until the copies match, so a stale app can't go unnoticed.

The changelog (spec §14) says what changed in each revision.

---

# Appendix A: the stylesheets

These are `src/generated/ds.css` and `src/generated/text-styles.css` from the Design-System-02 repo, embedded verbatim by `scripts/build-design-md.mjs`. **Don't read them to learn the system** (Parts C and D do that) **and don't edit them.** Extract them with the D1 command.

<!-- BEGIN ds.css -->
````css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
/* GENERATED by scripts/extract-spec.mjs from spec/DESIGN_SYSTEM.md — do not edit.
   65 css blocks, 89 rules mirrored to .is-hover/.is-focus-visible/.is-active. */

/* ── spec line 772 · B. Asset registry (source illustrations) ── */
.ds-illus { display: block; object-fit: contain; flex-shrink: 0; }
.ds-sprite { position: relative; display: block; overflow: hidden; flex-shrink: 0; }
.ds-sprite img { position: absolute; max-width: none; }

/* ── spec line 839 · 3. Complete token file ── */
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
  /* Alternate leadings: DEOC sets some steps on a tighter or looser line (D-10, §11). Use only where a component spec names one. */
  --ds-leading-12: 12px; --ds-leading-13: 13px; --ds-leading-15: 15px; --ds-leading-16: 16px; --ds-leading-18: 18px;
  --ds-leading-22: 22px; --ds-leading-24: 24px; --ds-leading-26: 26px; --ds-leading-28: 28px; --ds-leading-16-5: 16.5px;

  --ds-tracking-title: -0.35px;
  --ds-tracking-heading: -0.5px;
  --ds-tracking-card-title: -0.4px;
  --ds-tracking-media-title: -0.25px;
  --ds-tracking-number: -0.65px;
  --ds-tracking-tight: -0.4px;
  --ds-tracking-upper: 0.55px;
  --ds-tracking-upper-sm: 0.4px;
  --ds-tracking-step: 0.3px;
  --ds-tracking-chart-label: -0.2px;
  --ds-tracking-table-header: 0.3px;
  --ds-tracking-identifier: 0.55px;
  --ds-tracking-field: 0.5px;   /* read-only identifier values (DEOC barcodes) */

  /* ── Color: page & glass surfaces ─────────────────────── */
  --ds-color-bg-app: #0b1020;
  --ds-gradient-app: linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%);
  --ds-color-glow-brand: rgba(59,130,246,0.10);
  --ds-color-glow-success: rgba(106,167,96,0.08);
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
  --ds-color-success-text: #6aa760;
  --ds-color-success-glow: #6aa760;
  --ds-color-success-bg: rgba(106,167,96,0.10);
  --ds-color-success-border: rgba(106,167,96,0.20);
  --ds-gradient-progress-success: linear-gradient(90deg, #6aa760 0%, #6aa760 100%);
  --ds-color-warning-text: #e8b94a;
  --ds-color-warning-bg: rgba(232,185,74,0.10);
  --ds-color-warning-border: rgba(232,185,74,0.20);
  --ds-color-danger: #e5575f;
  --ds-color-danger-text: #e5575f;
  --ds-color-danger-bg: rgba(229,87,95,0.10);
  --ds-color-danger-bg-hover: rgba(229,87,95,0.20);
  --ds-color-danger-border: rgba(229,87,95,0.20);
  --ds-color-error: #fb7185;
  --ds-color-error-text: #fb7185;
  --ds-color-live: #d33434;
  --ds-color-live-halo: rgba(211,52,52,0.40);
  --ds-color-info-text: #93c5fd;
  --ds-color-info-bg: rgba(59,130,246,0.10);
  --ds-color-info-border: rgba(59,130,246,0.20);
  --ds-color-row-warning: rgba(232,185,74,0.03);
  --ds-color-row-critical: rgba(229,87,95,0.03);
  --ds-color-alert-count: #fb7185;

  /* ── Color: overlays ──────────────────────────────────── */
  --ds-color-scrim: rgba(0,0,0,0.50);
  --ds-overlay-blur: 4px;

  /* ── Color: data visualization ────────────────────────── */
  --ds-chart-cat-1: #60a5fa;
  --ds-chart-cat-2: #2563eb;
  --ds-chart-cat-3: #6366f1;
  --ds-chart-cat-4: #4b10a3;
  --ds-chart-cat-5: #f383a3;
  --ds-chart-cat-6: #23b9ac;
  --ds-chart-cat-7: #ad77c2;
  --ds-chart-cat-8: #6aa760;
  --ds-chart-cat-9: #da825d;
  --ds-chart-cat-10: #1397bb;
  --ds-chart-status-red: #e5575f;
  --ds-chart-status-yellow: #e8b94a;
  --ds-chart-positive: var(--ds-color-success-glow);
  --ds-chart-negative: var(--ds-chart-status-red);
  --ds-chart-running: var(--ds-color-success-text);
  --ds-chart-stopped: var(--ds-chart-status-red);
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
  --ds-shadow-status-success: 0 0 10px 0 #6aa760, 0 0 2px 0 #6aa760;
  --ds-shadow-status-warning: 0 0 10px 0 #e8b94a, 0 0 2px 0 #e8b94a;
  --ds-shadow-status-error: 0 0 10px 0 #e5575f, 0 0 2px 0 #e5575f;
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
  --ds-size-feed-max-height: 380px;   /* notification feed list (§5.47 extension) */
  --ds-size-picker-max-height: 280px;
  --ds-size-dialog: 440px;
  --ds-size-modal: 720px;
  --ds-size-panel-sm: 480px;
  --ds-size-panel-md: 560px;
  --ds-size-panel-lg: 680px;
  --ds-size-panel-xl: 820px;
  --ds-size-form-column: 820px;       /* full-page form column (§6.10 extension) */
  --ds-size-form-column-wide: 980px;
  --ds-size-form-guide: 480px;
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

/* ── spec line 821 · 2.13 Density modes [PRESERVED · EXTENSION] ── */
[data-density="compact"] {
  --ds-size-control: 36px;  --ds-size-control-sm: 28px;  --ds-size-control-lg: 44px;
  --ds-size-icon-button: 32px;  --ds-size-pagination-button: 28px;
  --ds-size-table-row: 40px;  --ds-size-table-header: 36px;
  --ds-size-section-header: 52px;  --ds-size-nav-item: 40px;
  --ds-space-cell-x: 12px;  --ds-space-cell-y: 10px;
  --ds-space-card: 12px;  --ds-space-card-lg: 16px;  --ds-space-card-xl: 20px;  --ds-space-card-entity: 21px;
  --ds-space-form-row: 24px;  --ds-space-grid: 12px;  --ds-space-grid-lg: 16px;
}

/* ── spec line 1214 · 4. Base / global CSS ── */

*, *::before, *::after { box-sizing: border-box; }

/* Subtle scrollbars: thin, faint thumb, no track */
* { scrollbar-width: thin; scrollbar-color: var(--ds-color-scrollbar) transparent; }
@supports not (scrollbar-color: auto) {
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--ds-color-scrollbar); border-radius: var(--ds-radius-full); }
  ::-webkit-scrollbar-thumb:hover, ::-webkit-scrollbar-thumb.is-hover { background: var(--ds-color-scrollbar-hover); }
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
a:where([class]) { color: inherit; text-decoration: none; }  /* component links (tabs, nav items, link actions, menu rows) style themselves; prose links keep the browser underline */
img, svg { display: block; }
[hidden] { display: none !important; }  /* component display rules must never reveal hidden content */

/* Focus: one reliable indicator everywhere (§2.7). */
:focus-visible, .is-focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
:focus:not(:focus-visible) { outline: none; }  /* the only permitted outline removal */
input:focus-visible, textarea:focus-visible, select:focus-visible, input.is-focus-visible, textarea.is-focus-visible, select.is-focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }

/* Direction-aware icons (§8.9) */
.ds-icon--dir:dir(rtl) { transform: scaleX(-1); }

/* Increased-contrast boundary mode (§9.3): glass edges are 2–7 % white; this raises every control edge to 3:1. */
@media (prefers-contrast: more) {
  :is(.ds-input, .ds-select__trigger, .ds-attach__field, .ds-tabs, .ds-tab[aria-selected="true"], .ds-radio-card, .ds-toggle__opt, .ds-nav__item[aria-current="page"], .ds-btn--tertiary, .ds-btn--subtle, .ds-btn--ghost, .ds-dropzone) {
    border: 1px solid var(--ds-color-border-control-strong);
  }
}
[data-contrast="more"] :is(.ds-input, .ds-select__trigger, .ds-attach__field, .ds-tabs, .ds-tab[aria-selected="true"], .ds-radio-card, .ds-toggle__opt, .ds-nav__item[aria-current="page"], .ds-btn--tertiary, .ds-btn--subtle, .ds-btn--ghost, .ds-dropzone) {
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
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill.is-hover {
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
.ds-text-page-title   { font-size: var(--ds-font-size-title); font-weight: 600; line-height: var(--ds-line-height-title); letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-primary); }
.ds-text-dialog-title { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: var(--ds-line-height-heading); letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-text-card-title   { font-size: var(--ds-font-size-heading); font-weight: 600; line-height: var(--ds-leading-24); letter-spacing: var(--ds-tracking-card-title); color: var(--ds-color-text-primary); }
.ds-text-group-title  { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: var(--ds-leading-24); letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-text-subgroup-title { font-size: var(--ds-font-size-value); font-weight: 700; line-height: var(--ds-line-height-value); letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-text-kpi-value    { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: var(--ds-line-height-heading); letter-spacing: var(--ds-tracking-number); color: var(--ds-color-text-primary); }
.ds-text-kpi-label    { font-size: var(--ds-font-size-label); font-weight: 700; line-height: var(--ds-line-height-label); letter-spacing: var(--ds-tracking-upper); color: var(--ds-color-text-muted); text-transform: uppercase; }
.ds-text-metric-value { font-size: var(--ds-font-size-heading); font-weight: 700; line-height: var(--ds-line-height-heading); letter-spacing: var(--ds-tracking-number); color: var(--ds-color-text-primary); }
.ds-text-metric-label { font-size: var(--ds-font-size-label); font-weight: 500; line-height: var(--ds-leading-18); letter-spacing: var(--ds-tracking-upper-sm); color: var(--ds-color-text-muted); text-transform: uppercase; }
.ds-text-body         { font-size: var(--ds-font-size-body); font-weight: 400; line-height: var(--ds-line-height-body); color: var(--ds-color-text-secondary); }
.ds-text-body-muted   { font-size: var(--ds-font-size-body); font-weight: 400; line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted); }
.ds-text-body-strong  { font-size: var(--ds-font-size-body); font-weight: 500; line-height: var(--ds-line-height-body); color: var(--ds-color-text-primary); }
.ds-text-small        { font-size: var(--ds-font-size-label); font-weight: 400; line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); }
.ds-text-caption      { font-size: var(--ds-font-size-caption); font-weight: 400; line-height: var(--ds-line-height-caption); color: var(--ds-color-text-tertiary); }
.ds-text-validation   { font-size: var(--ds-font-size-label); font-weight: 400; line-height: var(--ds-line-height-label); color: var(--ds-color-error-text); }
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

/* ── spec line 1369 · 5.1 Button ── */
.ds-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--ds-space-2);
  padding: var(--ds-space-2-5) var(--ds-space-4);
  border: 0; border-radius: var(--ds-radius-control);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600;
  white-space: normal; text-align: center; cursor: pointer;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast) var(--ds-ease-standard),
              color var(--ds-duration-fast) var(--ds-ease-standard), box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}
.ds-btn:disabled { opacity: 0.4; pointer-events: none; }
.ds-btn[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }
.ds-btn--sm { padding: var(--ds-space-1-5) var(--ds-space-3); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-btn--lg { padding: var(--ds-space-3) var(--ds-space-5); font-size: var(--ds-font-size-value); line-height: var(--ds-line-height-value); }
.ds-btn--minw { min-width: var(--ds-size-header-button); }

.ds-btn--primary { background: var(--ds-gradient-button-primary); border: 1px solid var(--ds-color-brand); color: var(--ds-color-text-on-brand); box-shadow: var(--ds-shadow-button-primary); }
.ds-btn--primary:hover, .ds-btn--primary.is-hover { background: var(--ds-gradient-button-primary-hover); }
.ds-btn--secondary { background: var(--ds-color-brand-tint-10); border: 1px solid transparent; color: var(--ds-color-link); }
.ds-btn--secondary:hover, .ds-btn--secondary.is-hover { background: var(--ds-color-brand-tint-20); }
.ds-btn--tertiary { background: var(--ds-gradient-glass); border: 1px solid var(--ds-color-border-control); color: var(--ds-color-text-emphasis); box-shadow: var(--ds-shadow-field); }
.ds-btn--tertiary:hover, .ds-btn--tertiary.is-hover { border-color: var(--ds-color-border-control-hover); }
.ds-btn--subtle { background: var(--ds-color-surface-control); border: 1px solid var(--ds-color-border-hairline); color: var(--ds-color-text-emphasis); }
.ds-btn--subtle:hover, .ds-btn--subtle.is-hover { background: var(--ds-color-surface-control-hover); }
.ds-btn--section { background: var(--ds-color-surface-control); box-shadow: inset 0 0 0 1px var(--ds-color-border-hairline); color: var(--ds-color-text-emphasis); }
.ds-btn--section:hover, .ds-btn--section.is-hover { background: var(--ds-color-surface-control-hover); }
.ds-btn--tonal { background: var(--ds-color-brand-tint-20); color: var(--ds-color-brand-text); }
.ds-btn--tonal:hover, .ds-btn--tonal.is-hover { background: var(--ds-color-brand-tint-30); }
.ds-btn--ghost { background: transparent; color: var(--ds-color-text-muted); }
.ds-btn--ghost:hover, .ds-btn--ghost.is-hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-btn--danger { background: var(--ds-color-danger-bg); border: 1px solid var(--ds-color-danger-border); color: var(--ds-color-danger-text); }
.ds-btn--danger:hover, .ds-btn--danger.is-hover { background: var(--ds-color-danger-bg-hover); }

/* Floating add button [EXTENSION] */
.ds-fab { position: fixed; right: var(--ds-space-4); bottom: calc(96px + env(safe-area-inset-bottom, 0px)); z-index: var(--ds-z-sidebar);
  width: 56px; height: 56px; padding: 0; border-radius: var(--ds-radius-full); box-shadow: var(--ds-shadow-float); }
.ds-fab svg { width: 24px; height: 24px; }

.ds-spinner { width: 16px; height: 16px; animation: ds-spin 1s linear infinite; }
@keyframes ds-spin { to { transform: rotate(360deg); } }

/* ── spec line 1424 · 5.2 Icon button ── */
.ds-icon-btn {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: var(--ds-size-icon-button); height: var(--ds-size-icon-button);
  border-radius: var(--ds-radius-sm); color: var(--ds-color-text-muted); background: transparent;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard), color var(--ds-duration-fast) var(--ds-ease-standard), border-color var(--ds-duration-fast);
}
.ds-icon-btn--compact { width: var(--ds-size-icon-button-compact); height: var(--ds-size-icon-button-compact); }
.ds-icon-btn--sm { width: var(--ds-size-control-sm); height: var(--ds-size-control-sm); }
.ds-icon-btn:hover, .ds-icon-btn.is-hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-icon-btn:focus-visible, .ds-icon-btn.is-focus-visible { outline-offset: 0; }
.ds-icon-btn:disabled { opacity: 0.4; pointer-events: none; }
.ds-icon-btn--close { background: var(--ds-color-surface-sunken-button); border: 1px solid var(--ds-color-border-subtle); box-shadow: var(--ds-shadow-close); color: var(--ds-color-text-muted); }
.ds-icon-btn--close:hover, .ds-icon-btn--close.is-hover { border-color: var(--ds-color-border-control-hover); color: var(--ds-color-text-primary); }
.ds-icon-btn--open { color: var(--ds-color-link); }

/* ── spec line 1445 · 5.3 Link action ── */
.ds-link-action { display: inline-flex; align-items: center; gap: var(--ds-space-2); align-self: flex-start;
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600; color: var(--ds-color-brand); border-radius: var(--ds-radius-xs);
  transition: color var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-link-action:hover, .ds-link-action.is-hover { color: var(--ds-color-link); }
/* [EXTENSION] a related record named inside text or a table cell: link colour, medium weight, underline on hover (R-08 link colour). */
.ds-entity-link { color: var(--ds-color-link); font-weight: 500; text-decoration: none; border-radius: var(--ds-radius-xs); transition: color var(--ds-duration-fast); }
.ds-entity-link:hover, .ds-entity-link.is-hover, .ds-entity-link.is-hover { color: var(--ds-color-link-hover); text-decoration: underline; text-underline-offset: 3px; }
.ds-table tbody td .ds-entity-link { font-weight: 500; }
/* A running-state glyph (deployment steps): the spinner's rotation, reduced-motion safe. */
.ds-spin { animation: ds-spin 1s linear infinite; }
@media (prefers-reduced-motion: reduce) { .ds-spin { animation: none; } }

/* ── spec line 1463 · 5.4 Action group ── */
.ds-action-row { display: flex; align-items: center; justify-content: flex-end; gap: var(--ds-space-4); flex-wrap: wrap; }
.ds-split { display: inline-flex; }
.ds-split > .ds-btn:first-child { border-start-end-radius: 0; border-end-end-radius: 0; }
.ds-split__toggle { width: var(--ds-size-control); padding: 0; border-start-start-radius: 0; border-end-start-radius: 0; border-inline-start-color: var(--ds-color-border-on-brand); }

/* ── spec line 1483 · 5.5 Text input ── */
.ds-input {
  width: 100%; padding: var(--ds-space-2-5) var(--ds-space-4);
  border: 0; border-radius: var(--ds-radius-control);
  background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-field), var(--ds-shadow-edge);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-primary);
  transition: box-shadow var(--ds-duration-fast) var(--ds-ease-standard);
}
.ds-input::placeholder { color: var(--ds-color-text-placeholder); opacity: 1; }
.ds-input:focus-visible, .ds-input.is-focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-input[aria-invalid="true"] { box-shadow: var(--ds-error-ring), var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-input:disabled { opacity: 0.4; }
.ds-input-wrap { position: relative; }
.ds-input--suffix { padding-inline-end: var(--ds-space-12); }
.ds-input__suffix { position: absolute; inset-inline-end: 16px; top: 50%; transform: translateY(-50%); pointer-events: none;
  font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); }
.ds-input--trailing { padding-inline-end: 44px; }
.ds-input__trailing { position: absolute; inset-inline-end: 12px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-xs); color: var(--ds-color-text-muted); opacity: 0.7; }
.ds-input__trailing:hover, .ds-input__trailing[aria-pressed="true"], .ds-input__trailing.is-hover { color: var(--ds-color-text-primary); opacity: 1; }
.ds-input--date { padding: 0 var(--ds-space-3); color-scheme: dark; }

/* ── spec line 1510 · 5.6 Search input ── */
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

/* ── spec line 1527 · 5.7 Textarea ── */
.ds-textarea { height: auto; min-height: 80px; padding: var(--ds-space-2-5) var(--ds-space-4); resize: vertical; }

/* ── spec line 1542 · 5.8 Form field (label + control + message) ── */
.ds-field { display: flex; flex-direction: column; gap: var(--ds-space-form-label); min-width: 0; }
.ds-field__label { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 500; color: var(--ds-color-text-muted); }
.ds-field--caps .ds-field__label { color: var(--ds-color-text-muted); text-transform: uppercase; letter-spacing: var(--ds-tracking-upper); }
.ds-field__req { color: var(--ds-color-error-text); margin-inline-start: var(--ds-space-0-5); }
.ds-field__help { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-tertiary); margin-top: var(--ds-space-0-5); }
.ds-field__error { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-error-text); margin-top: var(--ds-space-0-5); }
.ds-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--ds-space-form-col); row-gap: var(--ds-space-form-row); }
.ds-form-grid--1 { grid-template-columns: minmax(0, 1fr); }
.ds-form-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ds-form-grid > .ds-span-2 { grid-column: span 2; }
.ds-form-grid > .ds-span-all { grid-column: 1 / -1; }
.ds-form-section { display: flex; flex-direction: column; gap: var(--ds-space-form-section); }
.ds-form-section__title { padding-bottom: var(--ds-space-4); border-bottom: 1px solid var(--ds-color-border-subtle);
  font-size: var(--ds-font-size-body); line-height: var(--ds-leading-18); font-weight: 400; color: var(--ds-color-text-primary); }
@media (max-width: 1023px) {
  .ds-form-grid, .ds-form-grid--3 { grid-template-columns: minmax(0, 1fr); }
  .ds-form-grid > .ds-span-2 { grid-column: auto; }
}

/* ── spec line 1574 · 5.9 Select (single choice) ── */
.ds-select { position: relative; min-width: 0; }
.ds-select__trigger {
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-2);
  width: 100%; border: 0; border-radius: var(--ds-radius-control);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); text-align: start;
  transition: background-color var(--ds-duration-fast) var(--ds-ease-standard);
}
.ds-select__trigger--filter { position: relative; padding: var(--ds-space-2-5) var(--ds-space-3) var(--ds-space-2-5) var(--ds-space-4); background: var(--ds-gradient-glass);
  box-shadow: var(--ds-shadow-control); color: var(--ds-color-text-emphasis); }
.ds-select__trigger--filter:hover, .ds-select__trigger--filter.is-hover { background: var(--ds-gradient-glass-strong); }
.ds-select__trigger--filter::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: var(--ds-gradient-edge-control); pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); }  /* 1 px stroke inside the box (DEOC edge-control) */
.ds-select__trigger--field { padding: var(--ds-space-2-5) var(--ds-space-3-5) var(--ds-space-2-5) var(--ds-space-4); background: var(--ds-gradient-glass);
  box-shadow: var(--ds-shadow-field), var(--ds-shadow-edge), var(--ds-shadow-xs); color: var(--ds-color-text-primary); }
.ds-select__trigger:focus-visible, .ds-select__trigger.is-focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
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

/* ── spec line 1614 · 5.10 Dropdown menu (listbox) ── */
.ds-menu { position: absolute; z-index: var(--ds-z-menu); top: 100%; inset-inline-start: 0; margin-top: var(--ds-space-1); width: 100%;
  background: var(--ds-color-surface-raised); border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-shadow-float); overflow: hidden; }
.ds-menu:has(.ds-menu__option--multi) { border-radius: var(--ds-radius-sm); }
.ds-menu--wide { width: max-content; min-width: 100%; max-width: min(420px, 90vw); }
.ds-menu--up { top: auto; bottom: 100%; margin-top: 0; margin-bottom: var(--ds-space-1); }
.ds-menu__search { padding: var(--ds-space-2); border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-menu__list { max-height: var(--ds-size-menu-max-height); overflow-y: auto; }
.ds-menu__option { display: flex; align-items: center; gap: var(--ds-space-2); padding: var(--ds-space-2-5) var(--ds-space-4);
  cursor: pointer; font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-menu__option:hover, .ds-menu__option.is-active, .ds-menu__option.is-hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-menu:focus-within .ds-menu__option.is-active, .ds-menu.is-focus-visible .ds-menu__option.is-active { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-inset); }
.ds-menu__option[aria-selected="true"] { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-menu__option[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }
.ds-menu__check { display: none; }  /* DEOC marks the selected option by its fill only */
.ds-menu__empty { padding: var(--ds-space-2-5) var(--ds-space-4); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted); }
/* [EXTENSION] grouped results (global search): a section-label heading per group; two-line options (label + sub). */
.ds-menu__group { padding: var(--ds-space-2-5) var(--ds-space-4) var(--ds-space-1); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label);
  font-weight: 700; letter-spacing: var(--ds-tracking-upper); text-transform: uppercase; color: var(--ds-color-text-tertiary); }
.ds-menu__option-text { display: flex; flex-direction: column; min-width: 0; }
.ds-menu__option-text > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* [EXTENSION] command menu ("More actions", role=menu, §5.55): anchored to the trigger's inline-end, a destructive item in danger text. */
.ds-menu--end { inset-inline-start: auto; inset-inline-end: 0; min-width: var(--ds-size-header-button); }
.ds-menu__option--danger { color: var(--ds-color-danger-text); }
.ds-menu__option--danger:hover, .ds-menu__option--danger.is-hover, .ds-menu__option--danger.is-hover { color: var(--ds-color-danger-text); background: var(--ds-color-danger-bg); }
.ds-menu__option:disabled { opacity: 0.4; cursor: not-allowed; }
button.ds-menu__option { width: 100%; text-align: start; }
.ds-menu__action { position: sticky; bottom: 0; display: flex; align-items: center; gap: var(--ds-space-2); width: 100%; padding: var(--ds-space-2-5) var(--ds-space-4);
  border-top: 1px solid var(--ds-color-border-subtle); background: var(--ds-color-surface-raised);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 500; color: var(--ds-color-brand-text); text-align: start; }
.ds-menu__list > .ds-menu__action:first-child { border-top: 0; }
.ds-menu__action:hover, .ds-menu__action.is-hover { color: var(--ds-color-text-primary); }
.ds-menu__action:focus-visible, .ds-menu__action.is-focus-visible { outline-offset: var(--ds-focus-offset-inset); }

/* ── spec line 1655 · 5.11 Multi-select ── */
.ds-menu__option--multi, .ds-menu__option--multi[aria-selected="true"] { gap: var(--ds-space-3); background: transparent; color: var(--ds-color-text-secondary); }
.ds-menu__option--multi:hover, .ds-menu__option--multi.is-hover { background: var(--ds-color-surface-hover); }
.ds-menu__option--multi .ds-check__box { pointer-events: none; }
.ds-menu__option[aria-selected="true"] .ds-check__box { background: var(--ds-color-brand-strong); border-color: var(--ds-color-brand); }

/* ── spec line 1666 · Chips field [EXTENSION] ── */
.ds-chips-field { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-1-5); height: auto; min-height: var(--ds-size-control); padding-block: var(--ds-space-1-5); cursor: text; }
.ds-chips-field:focus-within, .ds-chips-field.is-focus-visible { outline: var(--ds-focus-width-field) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-tight); }
.ds-chips-field__input { flex: 1; min-width: 120px; height: var(--ds-size-control-sm); padding: 0 var(--ds-space-1); border: 0; background: transparent;
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-primary); }
.ds-chips-field__input:focus-visible, .ds-chips-field__input.is-focus-visible { outline: none; }
.ds-chips-field__input::placeholder { color: var(--ds-color-text-placeholder); }
.ds-chip--removable { display: inline-flex; align-items: center; gap: var(--ds-space-1); }
.ds-chip--removable button { display: inline-flex; border-radius: var(--ds-radius-xs); color: inherit; }
.ds-chip--removable button:hover, .ds-chip--removable button.is-hover { color: var(--ds-color-text-primary); }
/* [EXTENSION] toggle chip: a button[aria-pressed] filter or option chip. Off is the neutral control surface; on is the brand chip. */
.ds-chip--toggle { cursor: pointer; background: var(--ds-color-surface-control); border-color: var(--ds-color-border-subtle); color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-chip--toggle:hover, .ds-chip--toggle.is-hover, .ds-chip--toggle.is-hover { color: var(--ds-color-text-primary); }
.ds-chip--toggle[aria-pressed="true"] { background: var(--ds-color-brand-tint-10); border-color: var(--ds-color-brand-tint-20); color: var(--ds-color-brand-text); }
.ds-chip--toggle:focus-visible, .ds-chip--toggle.is-focus-visible, .ds-chip--toggle.is-focus-visible { outline-offset: var(--ds-focus-offset); }

/* ── spec line 1688 · 5.12 Checkbox [EXTENSION] ── */
.ds-check { position: relative; display: inline-flex; align-items: center; gap: var(--ds-space-3); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-secondary); cursor: pointer; }
.ds-check input { position: absolute; inset-inline-start: 0; top: 50%; width: var(--ds-size-checkbox); height: var(--ds-size-checkbox); margin: 0; transform: translateY(-50%); opacity: 0; cursor: inherit; }
.ds-check__box { width: var(--ds-size-checkbox); height: var(--ds-size-checkbox); border-radius: var(--ds-radius-xs); border: 1px solid var(--ds-color-border-control-hover);
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background-color var(--ds-duration-fast), border-color var(--ds-duration-fast); }
.ds-check__box svg { display: none; }
.ds-check input:checked + .ds-check__box, .ds-check input:indeterminate + .ds-check__box { background: var(--ds-color-brand-strong); border-color: var(--ds-color-brand); }
.ds-check input:checked + .ds-check__box svg, .ds-check input:indeterminate + .ds-check__box svg { display: block; }
.ds-check input:focus-visible + .ds-check__box, .ds-check input.is-focus-visible + .ds-check__box { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
.ds-check:has(input:disabled) { opacity: 0.4; cursor: not-allowed; }

/* ── spec line 1704 · 5.13 Radio cards ── */
.ds-radio-group { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
.ds-radio-group--vertical { flex-direction: column; }
.ds-radio-card { flex: 1 1 0; min-width: 0; display: flex; align-items: center; gap: var(--ds-space-2);
  padding: var(--ds-space-2-5) var(--ds-space-4); border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-control-hover);
  background: transparent; color: var(--ds-color-text-placeholder); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); text-align: start;
  transition: border-color var(--ds-duration-fast), background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-radio-card[aria-checked="true"] { background: var(--ds-color-surface-nested); border-color: var(--ds-color-brand-strong); color: var(--ds-color-text-primary); }
.ds-radio-card:focus-visible, .ds-radio-card.is-focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-radio-glyph { flex-shrink: 0; color: var(--ds-color-text-muted); }
.ds-radio-card[aria-checked="true"] .ds-radio-glyph { color: var(--ds-color-brand); }
.ds-radio-group[aria-disabled="true"] .ds-radio-card { opacity: 0.4; cursor: not-allowed; }

/* ── spec line 1722 · 5.14 Binary status toggle ── */
.ds-toggle { display: flex; padding: 5px; border-radius: var(--ds-radius-track);   /* 5 px: DEOC toggle track (§11) */
  background: var(--ds-gradient-toggle); border: 1px solid var(--ds-color-border-subtle); }
.ds-toggle__opt { flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: var(--ds-space-1-5); padding: var(--ds-space-2) var(--ds-space-4);
  border-radius: var(--ds-radius-sm); background: transparent;
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 500; color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-toggle__opt:hover, .ds-toggle__opt.is-hover { background: var(--ds-color-surface-hover-subtle); color: var(--ds-color-text-primary); }
.ds-toggle__opt[aria-checked="true"] { background: var(--ds-gradient-toggle-active); color: var(--ds-color-text-primary); }
.ds-toggle__opt:focus-visible, .ds-toggle__opt.is-focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-toggle[aria-disabled="true"] { opacity: 0.4; cursor: not-allowed; }

/* ── spec line 1739 · 5.15 Switch [EXTENSION] ── */
.ds-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; border-radius: var(--ds-radius-full);
  background: var(--ds-color-track); box-shadow: var(--ds-shadow-close); transition: background-color var(--ds-duration-fast); }
.ds-switch[aria-checked="true"] { background: var(--ds-color-brand-strong); box-shadow: none; }
.ds-switch__thumb { position: absolute; top: 2px; inset-inline-start: 2px; width: 16px; height: 16px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-text-muted); transition: transform var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-switch[aria-checked="true"] .ds-switch__thumb { transform: translateX(16px); background: var(--ds-color-text-primary); }
.ds-switch:dir(rtl)[aria-checked="true"] .ds-switch__thumb { transform: translateX(-16px); }
.ds-switch:disabled { opacity: 0.4; cursor: not-allowed; }
.ds-switch-row { display: inline-flex; align-items: center; gap: var(--ds-space-3); cursor: pointer; }

/* ── spec line 1761 · 5.17 File upload (dropzone) ── */
.ds-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ds-space-2); padding: var(--ds-space-6); text-align: center; cursor: pointer; width: 100%;
  border: 1px dashed var(--ds-color-border-control); border-radius: var(--ds-radius-control); background: var(--ds-gradient-glass);
  transition: border-color var(--ds-duration-fast); overflow-wrap: anywhere; }
.ds-dropzone:hover, .ds-dropzone.is-dragover, .ds-dropzone.is-hover { border-color: var(--ds-color-brand); }
.ds-dropzone:focus-visible, .ds-dropzone.is-focus-visible { outline: none; border-color: var(--ds-color-brand); }  /* replacement indicator, as DEOC */
.ds-dropzone[aria-invalid="true"] { border-color: var(--ds-color-error); }
.ds-dropzone__icon { display: flex; color: var(--ds-color-text-muted); opacity: 0.6; }
.ds-dropzone__title { font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-dropzone__hint { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-placeholder); }
.ds-dropzone__title + .ds-dropzone__hint { margin-top: calc(var(--ds-space-0-5) - var(--ds-space-2)); }
.ds-file-list { display: flex; flex-direction: column; gap: var(--ds-space-2); margin-top: var(--ds-space-2); }
.ds-file-list li { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding: var(--ds-space-2) var(--ds-space-3);
  border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-nested); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-secondary); overflow-wrap: anywhere; }
.ds-file-list img { width: 32px; height: 32px; border-radius: var(--ds-radius-xs); object-fit: cover; }

/* ── spec line 1782 · 5.18 Field with attach button [PRESERVED] ── */
.ds-attach { display: flex; flex-wrap: wrap; gap: var(--ds-space-3); }
.ds-attach__field { flex: 1 1 240px; min-width: 0; min-height: var(--ds-size-control); display: flex; align-items: center; gap: var(--ds-space-2-5);
  padding: 0 var(--ds-space-4); border: 0; border-radius: var(--ds-radius-sm); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-attach__field:has([aria-invalid="true"]), .ds-attach__field--error { box-shadow: var(--ds-error-ring), var(--ds-shadow-field), var(--ds-shadow-edge); }
.ds-attach__field:focus-within, .ds-attach__field.is-focus-visible { outline: var(--ds-focus-width-field) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-tight); }
.ds-attach__input { flex: 1; min-width: 0; background: transparent; border: 0; font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-primary); }
.ds-attach__input:focus-visible, .ds-attach__input.is-focus-visible { outline: none; }  /* the wrapper draws the ring (replacement, §2.7) */
.ds-attach__input::placeholder { color: var(--ds-color-text-placeholder); }
.ds-attach__thumb { position: relative; flex-shrink: 0; width: 20px; height: 20px; padding: 3px; }
.ds-attach__thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--ds-radius-xs); opacity: 0.6; }
.ds-attach__clear { position: absolute; top: -6px; inset-inline-end: -6px; width: 14px; height: 14px; border-radius: var(--ds-radius-full);
  display: flex; align-items: center; justify-content: center; background: var(--ds-color-surface-raised); border: 1px solid var(--ds-color-border-subtle); color: var(--ds-color-text-muted); }
.ds-attach__btn { height: var(--ds-size-control); display: inline-flex; align-items: center; gap: var(--ds-space-1-5); padding: var(--ds-space-2) var(--ds-space-3-5);
  border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-glass); background: var(--ds-color-surface-control); box-shadow: var(--ds-shadow-field);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 500; color: var(--ds-color-text-secondary); white-space: nowrap; transition: opacity var(--ds-duration-fast); }
.ds-attach__btn:hover, .ds-attach__btn.is-hover { opacity: 0.8; }

/* ── spec line 1805 · 5.19 Rich picker (entity select with avatar rows) ── */
.ds-picker { position: absolute; z-index: var(--ds-z-menu); top: 100%; inset-inline-start: 0; width: 100%; margin-top: var(--ds-space-1);
  display: flex; flex-direction: column; padding: 0; background: var(--ds-color-surface-raised);
  border-radius: var(--ds-radius-sm); box-shadow: var(--ds-shadow-float); overflow: hidden; }
.ds-picker__list { max-height: var(--ds-size-picker-max-height); overflow-y: auto; }
.ds-picker-row { display: flex; align-items: center; gap: var(--ds-space-3-5); width: 100%; padding: var(--ds-space-3-5) var(--ds-space-3-5) var(--ds-space-3-5) var(--ds-space-4);
  background: transparent; border-bottom: 1px solid var(--ds-color-border-control); cursor: pointer; text-align: start;
  transition: background-color var(--ds-duration-fast); }
.ds-picker-row:hover, .ds-picker-row.is-active, .ds-picker-row.is-hover { background: var(--ds-color-surface-hover-subtle); }
.ds-picker-row[aria-selected="true"] { background: var(--ds-color-surface-selected); }
.ds-picker__list:focus-within .ds-picker-row.is-active, .ds-picker__list.is-focus-visible .ds-picker-row.is-active { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset-inset); }
.ds-picker-row__text { display: flex; flex-direction: column; gap: 1.5px; min-width: 0; }
.ds-picker-row__line1 { display: flex; align-items: center; gap: var(--ds-space-2); flex-wrap: wrap; font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 600; color: var(--ds-color-text-primary); }
.ds-picker-row__line2 { display: flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); min-width: 0; }
.ds-picker-footer { display: flex; align-items: center; justify-content: center; gap: var(--ds-space-2); width: 100%; padding: var(--ds-space-2-5) 0;
  background: var(--ds-color-surface-nested); border: 0;
  border-end-start-radius: var(--ds-radius-sm); border-end-end-radius: var(--ds-radius-sm);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-brand); transition: background-color var(--ds-duration-fast); }
.ds-picker-footer:hover, .ds-picker-footer.is-hover { background: var(--ds-color-surface-nested-hover); }
.ds-rich-row { display: flex; align-items: center; gap: var(--ds-space-3-5); min-width: 0; text-align: start; }
.ds-select--rich .ds-select__trigger { gap: var(--ds-space-3); }
.ds-select--rich .ds-select__trigger:has(.ds-rich-row) { padding-block: var(--ds-space-3); }

/* ── spec line 1833 · 5.20 Inline callout [EXTENSION] ── */
.ds-callout { display: flex; flex-direction: column; gap: var(--ds-space-1); padding: var(--ds-space-3-5); border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-nested); border: 1px solid var(--ds-color-border-glass); }
.ds-callout__title { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 600; color: inherit; }
.ds-callout:not([class*="--"]) .ds-callout__title { color: var(--ds-color-text-secondary); }
.ds-callout__body { font-size: var(--ds-font-size-label); line-height: 1.45; color: var(--ds-color-text-secondary); }
.ds-callout:not([class*="--"]) .ds-callout__body { color: var(--ds-color-text-muted); }

/* ── spec line 1846 · 5.21 Inline alert [EXTENSION] ── */
.ds-callout--error, .ds-callout--success, .ds-callout--warning, .ds-callout--info { flex-direction: row; align-items: flex-start; gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-3-5); }
.ds-callout--error { background: var(--ds-color-danger-bg); border-color: var(--ds-color-danger-border); color: var(--ds-color-danger-text); }
.ds-callout--success { background: var(--ds-color-success-bg); border-color: var(--ds-color-success-border); color: var(--ds-color-success-text); }
.ds-callout--warning { background: var(--ds-color-warning-bg); border-color: var(--ds-color-warning-border); color: var(--ds-color-warning-text); }
.ds-callout--info { background: var(--ds-color-info-bg); border-color: var(--ds-color-info-border); color: var(--ds-color-info-text); }
.ds-callout__content { display: flex; flex-direction: column; gap: var(--ds-space-1); min-width: 0; flex: 1; }
.ds-callout__dismiss { margin-inline-start: auto; }

/* ── spec line 1868 · 5.22 Stepper (multi-step progress) ── */
.ds-stepper { display: flex; align-items: center; }
.ds-step { display: flex; align-items: center; flex: 1 1 0; min-width: 0; }
.ds-step:last-child { flex: 0 0 auto; }
.ds-step:not(:last-child)::after { content: ""; flex: 1; height: var(--ds-border-width-emphasis); min-width: var(--ds-space-4); margin: 0 var(--ds-space-4); background: var(--ds-color-stepper-track); }
.ds-step[aria-current="step"]:not(:last-child)::after, .ds-step--done:not(:last-child)::after { background: var(--ds-gradient-stepper-active); }
.ds-step__index { flex-shrink: 0; width: var(--ds-size-pagination-button); height: var(--ds-size-pagination-button); display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-sunken-button); border: 1px solid var(--ds-color-border-strong); box-shadow: var(--ds-shadow-stepper-idle);
  font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 500; color: var(--ds-color-text-muted); }
.ds-step[aria-current] ~ .ds-step :is(.ds-step__index, .ds-step__text) { opacity: 0.5; }
.ds-step[aria-current] ~ .ds-step ~ .ds-step :is(.ds-step__index, .ds-step__text) { opacity: 0.4; }
.ds-step[aria-current="step"] .ds-step__index { background: var(--ds-color-brand-strong); border-color: var(--ds-color-stepper-active-border); color: var(--ds-color-text-on-brand); font-weight: 600; box-shadow: var(--ds-shadow-stepper-active); }
.ds-step--done .ds-step__index { background: var(--ds-color-success-glow); border-color: var(--ds-color-stepper-active-border); color: var(--ds-color-text-on-brand); box-shadow: var(--ds-shadow-stepper-active); }
.ds-step__text { display: flex; flex-direction: column; min-width: 0; padding-inline-start: var(--ds-space-3); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-step__title { font-weight: 500; color: var(--ds-color-text-secondary); white-space: nowrap; }
.ds-step__sub { color: var(--ds-color-text-tertiary); white-space: nowrap; }
.ds-step[aria-current="step"] .ds-step__title, .ds-step--done .ds-step__title { font-weight: 700; letter-spacing: var(--ds-tracking-step); color: var(--ds-color-text-primary); }
.ds-step[aria-current="step"] .ds-step__sub { font-weight: 500; color: var(--ds-color-link); }
.ds-step--done .ds-step__sub { font-weight: 500; color: var(--ds-color-success-text); }
@media (max-width: 639px) {
  .ds-step:not([aria-current]) .ds-step__text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
}

/* ── spec line 1905 · 5.23 KPI card ── */
.ds-kpi-row { display: flex; gap: var(--ds-space-grid); width: 100%; }
.ds-kpi-row > * { flex: 1 1 0; min-width: 0; }
.ds-kpi { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; min-height: var(--ds-size-kpi-card);
  padding: var(--ds-space-card); border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass-kpi);
  box-shadow: var(--ds-shadow-glass), var(--ds-shadow-kpi-lift), var(--ds-shadow-edge); text-align: start; color: inherit; transition: filter var(--ds-duration-fast); }
button.ds-kpi { cursor: pointer; }
button.ds-kpi:hover, button.ds-kpi.is-hover { filter: brightness(1.1); }
button.ds-kpi[aria-pressed="true"] { box-shadow: var(--ds-shadow-glass), var(--ds-shadow-kpi-lift), inset 0 0 0 1px var(--ds-color-brand); }
.ds-kpi__icon { position: relative; width: var(--ds-size-kpi-icon); height: var(--ds-size-kpi-icon); flex-shrink: 0; }
.ds-kpi__text { display: flex; flex-direction: column; min-width: 0; }
.ds-kpi__label { margin-block-end: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 700; letter-spacing: var(--ds-tracking-upper); text-transform: uppercase;
  color: var(--ds-color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-kpi__value { font-size: var(--ds-font-size-heading); line-height: var(--ds-line-height-heading); font-weight: 700; letter-spacing: var(--ds-tracking-number);
  color: var(--ds-color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.ds-kpi__ball { position: absolute; inset-inline-end: 0; bottom: 0; width: 14px; height: 14px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-success-glow); box-shadow: var(--ds-shadow-status-success); }
.ds-kpi__ball--error { background: var(--ds-color-danger); box-shadow: var(--ds-shadow-status-error); }
.ds-kpi__delta { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-kpi__delta--up { color: var(--ds-color-success-text); } .ds-kpi__delta--down { color: var(--ds-color-danger-text); }
@media (max-width: 1279px) { .ds-kpi-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr)); } }

/* ── spec line 1940 · 5.24 Entity card (content card) ── */
.ds-entity { display: flex; flex-direction: column; gap: var(--ds-space-card-gap); min-width: 0; padding: var(--ds-space-card-entity);
  border-radius: var(--ds-radius-card); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); transition: filter var(--ds-duration-fast); }
.ds-entity--link { cursor: pointer; }
.ds-entity--link:hover, .ds-entity--link.is-hover { filter: brightness(1.1); }
.ds-entity__header { display: flex; justify-content: space-between; align-items: center; gap: var(--ds-space-3); }
.ds-entity__header .ds-text-card-title { line-height: var(--ds-leading-28); }
.ds-entity__lead { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; }
.ds-entity__icon { position: relative; width: var(--ds-size-entity-icon); height: var(--ds-size-entity-icon); flex-shrink: 0; overflow: hidden; }
.ds-entity__titles { display: flex; flex-direction: column; gap: var(--ds-space-1); min-width: 0; }
.ds-entity__place { display: flex; align-items: center; gap: var(--ds-space-1); font-size: var(--ds-font-size-body); line-height: var(--ds-leading-16); color: var(--ds-color-text-muted); }
.ds-entity__place svg { color: var(--ds-color-icon); flex-shrink: 0; }
.ds-entity__well { display: flex; flex-direction: column; gap: var(--ds-space-2); padding: var(--ds-space-4); border-radius: var(--ds-radius-track); background: var(--ds-color-surface-nested); }
.ds-entity__wellrow { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; }
.ds-entity__value { display: flex; align-items: baseline; gap: var(--ds-space-1-5); }
.ds-entity__meta { display: flex; align-items: center; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted); }
.ds-entity__meta svg { color: var(--ds-color-icon); }
.ds-entity__footer { display: flex; justify-content: space-between; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap; }
.ds-entity__who { display: flex; align-items: center; gap: var(--ds-space-2-5); min-width: 0; }
.ds-entity__who b { display: block; font-size: var(--ds-font-size-value); line-height: var(--ds-line-height-value); font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-entity__role { display: block; font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-brand); margin-top: var(--ds-space-0-5); }
.ds-entity__footer .ds-btn { padding: 9px var(--ds-space-4) 9px var(--ds-space-3); }   /* 40 px with its border (DEOC) */
.ds-entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(400px, 100%), 1fr)); gap: var(--ds-space-grid-lg); }
.ds-entity__stats { display: grid; gap: var(--ds-space-3); margin-top: auto; }
.ds-entity__stat, .ds-stat-tile { display: flex; flex-direction: column; justify-content: space-between; gap: var(--ds-space-1); min-width: 0; padding: var(--ds-space-4);
  border-radius: var(--ds-radius-track); background: var(--ds-color-surface-nested); }
@media (max-width: 639px) { .ds-entity__stat, .ds-stat-tile { padding: var(--ds-space-3); } }
.ds-entity-grid--4 { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 768px) { .ds-entity-grid--4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1536px) { .ds-entity-grid--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* ── spec line 1985 · 5.25 Dashboard card (chart / data container) ── */
.ds-dash-card { position: relative; display: flex; flex-direction: column; gap: var(--ds-space-chart-gap); min-width: 0;
  padding: var(--ds-space-card-xl); border-radius: var(--ds-radius-card); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); }
.ds-dash-card--flush { padding: var(--ds-space-card-xl) 0 0; overflow: hidden; }
.ds-dash-card--flush > .ds-dash-card__header { padding: 0 var(--ds-space-card-xl); }
.ds-dash-card--flush > .ds-dash-card__body { border-top: 1px solid var(--ds-color-border-subtle); }
.ds-dash-card__header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--ds-space-4); min-height: var(--ds-size-control); }
.ds-dash-card__title { font-size: var(--ds-font-size-heading); line-height: var(--ds-leading-24); font-weight: 600; letter-spacing: var(--ds-tracking-card-title); color: var(--ds-color-text-primary); overflow-wrap: anywhere; }
.ds-dash-card__subtitle { font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-chart-subtle); margin-top: 5px; }
.ds-dash-card__right { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: var(--ds-space-5); }
.ds-dash-card__right > .ds-link-action { align-self: center; }   /* a header link sits on the same centre line as the controls beside it */
.ds-dash-row { display: flex; gap: var(--ds-space-grid-lg); align-items: stretch; }
.ds-dash-row > * { min-width: 0; }

/* ── spec line 2004 · 5.26 Status card (status bar + list) ── */
.ds-status-card { gap: var(--ds-space-card-gap); padding: var(--ds-space-card-entity); overflow: hidden; }
.ds-status-card__well { flex: 1; min-height: 0; margin: 0 calc(-1 * var(--ds-space-card-entity)) calc(-1 * var(--ds-space-card-entity)); border-top: 1px solid var(--ds-color-border-subtle); }
.ds-legend-counts { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-4); }
.ds-legend-counts span { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-body); line-height: var(--ds-leading-22); font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-legend-counts i { width: 24px; height: 16px; border-radius: var(--ds-radius-xs); }
.ds-legend-counts b { font-weight: 500; color: var(--ds-color-text-muted); font-variant-numeric: tabular-nums; }

/* ── spec line 2027 · 5.27 Badge (status pill) ── */
.ds-badge { display: inline-flex; align-items: center; gap: var(--ds-space-1-5); padding: var(--ds-space-1) var(--ds-space-3); border: 1px solid transparent; border-radius: var(--ds-radius-full);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600; white-space: nowrap; }
.ds-badge--sm { padding: var(--ds-space-0-5) var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-badge__dot { width: var(--ds-size-badge-dot); height: var(--ds-size-badge-dot); border-radius: var(--ds-radius-full); flex-shrink: 0; background: currentColor; }
.ds-badge--success { background: var(--ds-color-success-bg); color: var(--ds-color-success-text); }
.ds-badge--warning { background: var(--ds-color-warning-bg); color: var(--ds-color-warning-text); }
.ds-badge--error { background: var(--ds-color-danger-bg); color: var(--ds-color-danger-text); }
.ds-badge--glass.ds-badge--error .ds-badge__dot { background: var(--ds-color-danger); box-shadow: var(--ds-shadow-status-error); }
.ds-badge--info { background: var(--ds-color-info-bg); color: var(--ds-color-info-text); }
.ds-badge--info .ds-badge__dot { background: var(--ds-color-brand); }
.ds-badge--neutral { background: var(--ds-color-surface-control); color: var(--ds-color-text-secondary); }
.ds-badge--neutral .ds-badge__dot { background: var(--ds-color-text-muted); }
.ds-badge--glass { background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-control); }
.ds-badge--sm .ds-badge__dot { box-shadow: none; }

.ds-live { display: inline-flex; align-items: center; gap: var(--ds-space-1-5); padding: 5px 11px; border-radius: var(--ds-radius-full);
  background: var(--ds-gradient-glass); border: 1px solid var(--ds-color-border-track); font-size: var(--ds-font-size-body); line-height: var(--ds-leading-18); font-weight: 600; color: var(--ds-color-text-primary); }
.ds-live__dot { position: relative; width: var(--ds-size-status-dot); height: var(--ds-size-status-dot); border-radius: var(--ds-radius-full); background: var(--ds-color-live-halo); flex-shrink: 0; }
.ds-live__dot::after { content: ""; position: absolute; inset: 3px; border-radius: inherit; background: var(--ds-color-live); }

/* ── spec line 2053 · 5.28 Status dot ── */
.ds-dot { display: inline-block; width: var(--ds-size-status-dot); height: var(--ds-size-status-dot); border-radius: var(--ds-radius-full); flex-shrink: 0; }
.ds-dot--sm { width: var(--ds-size-status-dot-sm); height: var(--ds-size-status-dot-sm); }
.ds-dot--success { background: var(--ds-color-success-text); box-shadow: var(--ds-shadow-status-success); }
.ds-dot--warning { background: var(--ds-color-warning-text); box-shadow: var(--ds-shadow-status-warning); }
.ds-dot--error   { background: var(--ds-color-danger); box-shadow: var(--ds-shadow-status-error); }
.ds-dot--brand   { background: var(--ds-color-brand); }
.ds-dot--neutral { background: var(--ds-color-text-muted); }   /* offline / stopped: no glow */
.ds-status { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-secondary); }

/* ── spec line 2068 · 5.29 Tag (solid category) ── */
.ds-tag { display: inline-block; padding: var(--ds-space-1-5) var(--ds-space-3); border-radius: var(--ds-radius-xs); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 500;
  color: var(--ds-color-text-primary); white-space: nowrap; }
.ds-tag--purple { background: var(--ds-tag-purple); } .ds-tag--blue { background: var(--ds-tag-blue); }
.ds-tag--green  { background: var(--ds-tag-green); }  .ds-tag--amber { background: var(--ds-tag-amber); }
.ds-tag--rose   { background: var(--ds-tag-rose); }
.ds-tag--raised { box-shadow: var(--ds-shadow-card); }

/* ── spec line 2081 · 5.30 Count pill ── */
.ds-count { display: inline-block; padding: 3px 13px; border-radius: var(--ds-radius-full); background: var(--ds-color-surface-control);
  border: 1px solid var(--ds-color-border-subtle); font-size: var(--ds-font-size-body); line-height: var(--ds-leading-18); font-weight: 700; color: var(--ds-color-text-secondary); font-variant-numeric: tabular-nums; }
.ds-count--sm { padding: var(--ds-space-0-5) var(--ds-space-3); font-size: var(--ds-font-size-label); }

/* ── spec line 2091 · 5.31 Info chip ── */
.ds-chip { display: inline-block; padding: 3px 9px; border-radius: var(--ds-radius-xs); background: var(--ds-color-brand-tint-10); border: 1px solid transparent;
  font-size: var(--ds-font-size-caption); line-height: var(--ds-leading-15); color: var(--ds-color-brand-text); white-space: nowrap; }

/* ── spec line 2107 · 5.32 Avatar ── */
.ds-avatar { position: relative; width: var(--ds-size-avatar-lg); height: var(--ds-size-avatar-lg); flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-full);
  background: var(--ds-gradient-brand-avatar); border: 1px solid var(--ds-color-brand-avatar-border); box-shadow: var(--ds-shadow-avatar); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 700; color: var(--ds-color-text-primary); }
.ds-avatar--neutral { width: var(--ds-size-avatar-md); height: var(--ds-size-avatar-md); box-shadow: none; background: var(--ds-color-surface-avatar); border-color: var(--ds-color-border-avatar);
  font-size: var(--ds-font-size-body); font-weight: 500; color: var(--ds-color-text-secondary); }
.ds-avatar--photo { width: var(--ds-size-avatar-sm); height: var(--ds-size-avatar-sm); padding: 1px; background: var(--ds-gradient-brand-ring); border: 0; box-shadow: none; }
.ds-avatar--photo > span { width: 100%; height: 100%; border-radius: var(--ds-radius-full); background: var(--ds-color-avatar-inner);
  display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-avatar--photo img { width: 100%; height: 100%; object-fit: cover; }
.ds-avatar__presence { position: absolute; inset-inline-end: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-success-glow); border: var(--ds-border-width-emphasis) solid var(--ds-color-surface-sunken-button); }

/* ── spec line 2124 · 5.33 Metric indicator (inline value) ── */
.ds-metric { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-1); text-align: center; }
.ds-metric--inline { flex-direction: row; align-items: baseline; gap: var(--ds-space-1-5); text-align: start; }
.ds-metric__value { display: flex; align-items: baseline; gap: var(--ds-space-1-5); }
.ds-metric__value b { font-size: var(--ds-font-size-heading); line-height: var(--ds-line-height-heading); font-weight: 700; letter-spacing: var(--ds-tracking-number); color: var(--ds-color-text-primary); font-variant-numeric: tabular-nums; }
.ds-metric__value span { font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 400; color: var(--ds-color-text-muted); }

/* ── spec line 2142 · 5.34 Progress & segmented status bar ── */
.ds-progress { height: 4px; border-radius: var(--ds-radius-full); background: var(--ds-color-track); overflow: hidden; }
.ds-progress > span { display: block; height: 100%; background: var(--ds-color-brand); border-radius: inherit; transition: width var(--ds-duration-chart) var(--ds-ease-standard); }
.ds-progress--success > span { background: var(--ds-gradient-progress-success); }
.ds-progress--warning > span { background: var(--ds-color-warning-text); }
.ds-progress--error > span { background: var(--ds-color-danger); }
.ds-progress-row { display: flex; align-items: center; gap: var(--ds-space-2); }
.ds-progress-row .ds-progress { flex: 1; }
.ds-progress-row b { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 600; color: var(--ds-color-text-secondary); font-variant-numeric: tabular-nums; }
.ds-segbar { display: flex; height: 20px; border-radius: var(--ds-radius-chip); overflow: hidden; }
.ds-segbar__seg { flex-basis: 0; min-width: 28px; display: flex; align-items: center; justify-content: center; overflow: hidden;
  font-size: var(--ds-font-size-label); line-height: 1; font-weight: 600; color: var(--ds-color-text-on-bright); transition: flex-grow var(--ds-duration-chart); }
.ds-segbar--lg { height: var(--ds-size-control); gap: 0; border-radius: var(--ds-radius-track); }
.ds-segbar--lg .ds-segbar__seg { min-width: 12px; font-size: 0; }

/* ── spec line 2162 · 5.35 Summary strip ── */
.ds-strip { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-5); padding: var(--ds-space-card);
  border-radius: var(--ds-radius-card); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); }
.ds-strip--stacked { flex-direction: column; align-items: stretch; gap: var(--ds-space-3); }
.ds-strip--stacked .ds-strip__lead { flex: none; min-width: 0; }
.ds-strip__lead { display: flex; flex-direction: column; gap: var(--ds-space-3); flex: 1 1 180px; min-width: 180px; }
.ds-strip__eyebrow { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: var(--ds-leading-18); letter-spacing: var(--ds-tracking-identifier); color: var(--ds-color-link); }
.ds-strip__title { font-size: var(--ds-font-size-heading); line-height: var(--ds-line-height-heading); font-weight: 700; letter-spacing: var(--ds-tracking-heading); color: var(--ds-color-text-primary); }
.ds-strip__divider { align-self: stretch; width: 1px; background: var(--ds-color-border-faint); }
.ds-strip__fields { display: flex; flex-wrap: wrap; gap: var(--ds-space-5); justify-content: space-between; flex: 999 1 480px; }
.ds-strip__fields dt { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-strip__fields dd { margin-top: var(--ds-space-1); font-size: var(--ds-font-size-value); line-height: var(--ds-line-height-value); letter-spacing: var(--ds-tracking-field); color: var(--ds-color-text-primary); overflow-wrap: anywhere; }
.ds-panel-card { display: flex; flex-direction: column; gap: var(--ds-space-4); padding: var(--ds-space-card-lg); border-radius: var(--ds-radius-card);
  background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-surface); }
.ds-panel-card__label { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 700; letter-spacing: var(--ds-tracking-upper); text-transform: uppercase; color: var(--ds-color-text-tertiary); }
.ds-fieldlist { display: flex; flex-direction: column; }
.ds-fieldlist > div { display: flex; flex-direction: column; gap: var(--ds-space-1); padding: var(--ds-space-3) 0; border-bottom: 1px solid var(--ds-color-border-faint); }
.ds-fieldlist > div:last-child { border-bottom: 0; padding-bottom: 0; }
.ds-fieldlist dt { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-fieldlist dd { font-size: var(--ds-font-size-value); line-height: var(--ds-line-height-value); letter-spacing: var(--ds-tracking-field); color: var(--ds-color-text-primary); overflow-wrap: anywhere; }
.ds-health-row { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.ds-health-row__label { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-secondary); }
.ds-health-tile { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; 
  color: var(--ds-color-text-muted); }  /* icon only, no tile (the grey tile read as an empty square) */

/* ── spec line 2200 · 5.36 Media card (camera tile) & media viewer ── */
.ds-media-card { position: relative; display: flex; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden; text-align: start; color: inherit; container-type: inline-size;
  border: 1px solid transparent; border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-glass); transition: border-color var(--ds-duration-fast); }
.ds-media-card::after { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; box-shadow: var(--ds-shadow-edge); }  /* edge above the full-bleed feed */
button.ds-media-card:hover, button.ds-media-card.is-hover { border-color: var(--ds-color-brand-border-hover); }
.ds-media-card__head, .ds-media-card__foot { position: relative; z-index: 1; display: flex; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-3-5) var(--ds-space-6); }
.ds-media-card__head { flex-wrap: wrap; row-gap: var(--ds-space-2); padding-bottom: 15px; border-bottom: 1px solid var(--ds-color-border-track); }
.ds-media-card__titles { display: flex; align-items: center; gap: var(--ds-space-3); flex-wrap: wrap; flex: 1; min-width: 0; }
.ds-media-card__title { font-size: var(--ds-font-size-heading); line-height: var(--ds-leading-26); font-weight: 600; letter-spacing: var(--ds-tracking-media-title); color: var(--ds-color-text-primary); }
@container (max-width: 419px) { .ds-media-card__title { font-size: var(--ds-font-size-value); } }
.ds-media-card__sub { font-size: var(--ds-font-size-body); line-height: var(--ds-leading-16); color: var(--ds-color-text-muted); }
.ds-media-card__expand { display: inline-flex; padding: var(--ds-space-1); color: var(--ds-color-icon); flex-shrink: 0; border-radius: var(--ds-radius-xs); }
.ds-media-card__expand:hover, .ds-media-card__expand.is-hover { color: var(--ds-color-text-primary); }
.ds-media-card__media { position: relative; flex: 1; min-height: 160px; overflow: hidden; background: var(--ds-color-surface-media); }
.ds-media-card__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
.ds-media-card__detail { min-width: 0; font-size: var(--ds-font-size-body); line-height: var(--ds-leading-16); font-weight: 600; color: var(--ds-color-text-secondary); }
.ds-media-card__detail em { font-style: italic; font-weight: 400; }
.ds-media-card__detail--error em { color: var(--ds-color-danger-text); }
.ds-detect { position: absolute; border: var(--ds-border-width-detect) solid var(--ds-color-danger); border-radius: var(--ds-radius-xs); pointer-events: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--ds-color-danger) 30%, transparent); }
.ds-detect--positive { border-color: var(--ds-color-success-glow); box-shadow: 0 0 20px color-mix(in srgb, var(--ds-color-success-glow) 30%, transparent); }
/* [EXTENSION] a warning frame, a dashed frame while it is being drawn, and the frame's label tab (inspection-zone editor). */
.ds-detect--warning { border-color: var(--ds-color-warning-text); box-shadow: 0 0 20px color-mix(in srgb, var(--ds-color-warning-text) 30%, transparent); }
.ds-detect--drawing { border-style: dashed; }
.ds-detect__label { position: absolute; bottom: 100%; inset-inline-start: calc(-1 * var(--ds-border-width-detect)); margin-bottom: var(--ds-space-0-5); padding: 0 var(--ds-space-1);
  border-radius: var(--ds-radius-xs); background: var(--ds-color-danger); white-space: nowrap;
  font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 700; color: var(--ds-color-text-on-bright); }
.ds-detect--positive .ds-detect__label { background: var(--ds-color-success-glow); }
.ds-detect--warning .ds-detect__label { background: var(--ds-color-warning-text); }
.ds-detect__label--inside { bottom: auto; top: var(--ds-space-1); inset-inline-start: var(--ds-space-1); margin: 0; }
.ds-icon-tile { width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--ds-radius-track); background: var(--ds-color-brand-tint-10);
  border: 1px solid transparent; display: flex; align-items: center; justify-content: center; color: var(--ds-color-link); }
.ds-icon-tile--sm { width: var(--ds-size-media-icon); height: var(--ds-size-media-icon); padding: 1px; border-radius: var(--ds-radius-track); }
.ds-icon-tile--32 { width: 32px; height: 32px; border-radius: var(--ds-radius-sm); }
.ds-icon-tile--success { background: var(--ds-color-success-bg); color: var(--ds-color-success-text); }
.ds-icon-tile--warning { background: var(--ds-color-warning-bg); color: var(--ds-color-warning-text); }
.ds-icon-tile--error { background: var(--ds-color-danger-bg); color: var(--ds-color-danger-text); }
.ds-media-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(300px, 1fr); gap: var(--ds-space-grid); }
@media (max-width: 1023px) { .ds-media-grid { grid-template-columns: minmax(0, 1fr); } }
.ds-viewer { position: relative; width: min(90vw, 900px); max-height: 90vh; max-width: calc(100% - 32px); display: flex; flex-direction: column; border-radius: var(--ds-radius-viewer); overflow: hidden;
  background: var(--ds-color-surface-media); box-shadow: var(--ds-shadow-modal); }
.ds-viewer > .ds-media-card__head { padding: var(--ds-space-5) var(--ds-space-8); gap: var(--ds-space-4); background: var(--ds-color-surface-raised); border-bottom: var(--ds-border-width-emphasis) solid var(--ds-color-border-subtle); }
.ds-viewer .ds-media-card__title { font-size: var(--ds-font-size-heading); line-height: var(--ds-line-height-heading); font-weight: 700; letter-spacing: var(--ds-tracking-heading); }
.ds-viewer .ds-media-card__sub { font-size: var(--ds-font-size-value); line-height: var(--ds-line-height-value); }
.ds-viewer .ds-media-card__expand { width: var(--ds-size-icon-button); height: var(--ds-size-icon-button); padding: 0; align-items: center; justify-content: center; border-radius: var(--ds-radius-control); color: var(--ds-color-text-muted); }
.ds-viewer .ds-media-card__expand:hover, .ds-viewer .ds-media-card__expand.is-hover { background: var(--ds-color-surface-hover); color: var(--ds-color-text-primary); }
.ds-viewer > .ds-media-card__foot { padding: var(--ds-space-3) var(--ds-space-8); border-bottom: 1px solid var(--ds-color-border-subtle); order: 1; }
.ds-viewer > .ds-viewer__media { order: 2; }
.ds-viewer__media { position: relative; flex: 1; min-height: 460px; background: var(--ds-color-surface-media); }
.ds-viewer__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }

/* ── spec line 2267 · 5.37 Sidebar navigation ── */
.ds-sidebar-slot { position: relative; width: var(--ds-size-sidebar-expanded); flex-shrink: 0; z-index: var(--ds-z-sidebar); transition: width var(--ds-duration-slow) var(--ds-ease-emphasized); }
.ds-sidebar-slot:has(.ds-sidebar--collapsed) { width: var(--ds-size-sidebar-collapsed); }
.ds-sidebar { position: absolute; top: 0; bottom: 0; inset-inline-start: 0; width: var(--ds-size-sidebar-expanded); overflow: hidden;
  border-radius: var(--ds-radius-panel); background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-sidebar);
  transition: width var(--ds-duration-slow) var(--ds-ease-emphasized); }
.ds-sidebar--collapsed { width: var(--ds-size-sidebar-collapsed); background: var(--ds-color-surface-base) var(--ds-gradient-glass); }  /* opaque: the rail expands over content */
.ds-sidebar--collapsed:hover, .ds-sidebar--collapsed:has(:focus-visible), .ds-sidebar--collapsed.is-hover, .ds-sidebar--collapsed:has(.is-focus-visible) { width: var(--ds-size-sidebar-expanded); }
.ds-sidebar__inner { display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 17px var(--ds-space-2-5); }
.ds-sidebar__fade { transition: opacity var(--ds-duration-base); white-space: nowrap; }
.ds-sidebar--collapsed .ds-sidebar__fade { opacity: 0; }
.ds-sidebar--collapsed:hover .ds-sidebar__fade, .ds-sidebar--collapsed:has(:focus-visible) .ds-sidebar__fade, .ds-sidebar--collapsed.is-hover .ds-sidebar__fade, .ds-sidebar--collapsed:has(.is-focus-visible) .ds-sidebar__fade { opacity: 1; transition-delay: 75ms; }
.ds-sidebar__scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; margin-inline: calc(-1 * var(--ds-space-2-5)); padding-inline: var(--ds-space-2-5); }  /* bleeds into the inner padding so the current item's shadow is not clipped */
.ds-sidebar__brand { display: flex; align-items: center; gap: var(--ds-space-3); width: 236px; padding: var(--ds-space-1) var(--ds-space-1-5); }
.ds-sidebar__logo { width: 40px; height: 40px; flex-shrink: 0; border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-logo);
  display: flex; align-items: center; justify-content: center; }
.ds-sidebar__logo img { width: 23px; height: 24px; }
.ds-sidebar__name { display: block; font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-primary); }
.ds-sidebar__tagline { display: block; font-size: var(--ds-font-size-caption); line-height: var(--ds-leading-16-5); color: var(--ds-color-text-muted); }
.ds-sidebar__toggle { margin-inline-start: auto; width: 24px; height: 24px; border-radius: var(--ds-radius-xs); display: inline-flex; align-items: center; justify-content: center; color: var(--ds-color-icon); flex-shrink: 0; }
.ds-sidebar__toggle:hover, .ds-sidebar__toggle.is-hover { color: var(--ds-color-text-primary); background: var(--ds-color-surface-hover); }
.ds-nav { margin-top: var(--ds-space-5); display: flex; flex-direction: column; gap: var(--ds-space-4); }
.ds-nav__section { display: flex; flex-direction: column; gap: var(--ds-space-1); }
.ds-nav__label { padding: 0 var(--ds-space-3-5); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); }
.ds-nav__item { position: relative; display: flex; align-items: center; width: 100%; min-height: var(--ds-size-nav-item); padding: var(--ds-space-2-5) var(--ds-space-3-5); border-radius: var(--ds-radius-nested);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 500; color: var(--ds-color-text-muted); text-align: start; text-decoration: none;
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-nav__item:hover, .ds-nav__item.is-hover { color: var(--ds-color-text-primary); background: var(--ds-color-surface-hover); }
.ds-nav__item:focus-visible, .ds-nav__item.is-focus-visible { outline-offset: 0; }
.ds-nav__item[aria-current="page"] { color: var(--ds-color-text-primary); background: var(--ds-gradient-nav-active); box-shadow: var(--ds-shadow-card); }
.ds-nav__icon { position: relative; width: var(--ds-size-nav-icon); height: var(--ds-size-nav-icon); flex-shrink: 0; overflow: hidden; }
.ds-nav__text { padding-inline-start: var(--ds-space-3); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ds-user-card { position: relative; margin-top: var(--ds-space-3); padding: var(--ds-space-2-5); border-radius: var(--ds-radius-panel); border: 1px solid var(--ds-color-border-glass);
  background: var(--ds-gradient-glass); overflow: hidden; }
.ds-user-card::before { content: ""; position: absolute; width: 128px; height: 128px; left: 50%; top: -48px; transform: translateX(-50%); border-radius: 50%;
  background: var(--ds-color-brand-tint-20); filter: blur(20px); pointer-events: none; }
.ds-user-card__row { position: relative; display: flex; align-items: center; gap: var(--ds-space-2); width: 214px; }
.ds-user-card__who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--ds-space-0-5); }
.ds-user-card__name { font-size: var(--ds-font-size-body); line-height: var(--ds-leading-18); font-weight: 600; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-primary); }
.ds-user-card__role { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); }
.ds-user-card__out { color: var(--ds-color-text-muted); opacity: 0.6; transition: opacity var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-user-card__out:hover, .ds-user-card__out.is-hover { color: var(--ds-color-text-primary); opacity: 1; background: transparent; }
@media (prefers-reduced-motion: reduce) { .ds-sidebar, .ds-sidebar-slot { transition: none; } }

/* ── spec line 2318 · 5.38 Page header ── */
.ds-page-header { position: relative; z-index: var(--ds-z-header); flex-shrink: 0; min-height: var(--ds-size-page-header); padding: var(--ds-space-3) var(--ds-space-page-gutter);
  display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-4); flex-wrap: wrap;
  box-shadow: none; transition: box-shadow var(--ds-duration-base); }
.ds-page-header--scrolled { box-shadow: var(--ds-shadow-header-scrolled); }
.ds-page-header__lead { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; flex-wrap: wrap; }
.ds-page-header__title { display: flex; align-items: center; gap: var(--ds-space-2-5); min-width: 0; }
.ds-page-header__icon { position: relative; width: var(--ds-size-page-icon); height: var(--ds-size-page-icon); flex-shrink: 0; overflow: hidden; }
.ds-page-header__titles { display: flex; flex-direction: column; gap: var(--ds-space-0-5); min-width: 0; }
.ds-page-header__titles h1 { overflow-wrap: anywhere; }
.ds-page-header__parent { color: var(--ds-color-text-muted); }
.ds-page-header__parent:hover, .ds-page-header__parent.is-hover { color: var(--ds-color-text-secondary); }
.ds-page-header__sep { margin: 0 var(--ds-space-2); color: var(--ds-color-text-faint); }
.ds-page-header__actions { display: flex; align-items: center; gap: var(--ds-space-header-actions); flex-wrap: wrap; }
/* Header filters and search wear the content-card surface (gradient-glass + shadow-surface) instead of the control stroke */
.ds-page-header__actions .ds-select__trigger--filter, .ds-page-header__actions .ds-search__input { background: var(--ds-gradient-glass); border-color: transparent; box-shadow: var(--ds-shadow-surface); }
.ds-page-header__actions .ds-select__trigger--filter::before { content: none; }
.ds-breadcrumb ol { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-breadcrumb a { color: var(--ds-color-text-muted); text-decoration: none; border-radius: var(--ds-radius-xs); transition: color var(--ds-duration-fast); }
.ds-breadcrumb a:hover, .ds-breadcrumb a.is-hover { color: var(--ds-color-text-primary); }
.ds-breadcrumb li[aria-hidden] { color: var(--ds-color-text-faint); }

/* ── spec line 2347 · 5.39 Segmented tabs ── */
.ds-tabs { display: inline-flex; box-sizing: border-box; height: var(--ds-size-control); max-width: 100%; overflow-x: auto; padding: var(--ds-space-0-5); border-radius: var(--ds-radius-track);
  background: var(--ds-gradient-toggle); border: 1px solid var(--ds-color-border-subtle); }   /* same height as a field or filter select, so a tab row lines up with the filters beside it */
.ds-tab { display: flex; align-items: center; justify-content: center; gap: var(--ds-space-1); white-space: nowrap;
  padding: 0 var(--ds-space-5); border-radius: var(--ds-radius-sm); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted);
  transition: background-color var(--ds-duration-fast), color var(--ds-duration-fast); }
.ds-tab:hover, .ds-tab.is-hover { background: var(--ds-color-surface-hover-subtle); color: var(--ds-color-text-primary); }
.ds-tab[aria-selected="true"] { background: var(--ds-gradient-toggle-active); color: var(--ds-color-text-primary); }
.ds-tab:focus-visible, .ds-tab.is-focus-visible { outline-width: var(--ds-focus-width-field); outline-offset: var(--ds-focus-offset-tight); }
.ds-tab__label { display: inline-grid; }
.ds-tab__count { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-tertiary); }
.ds-tab[aria-selected="true"] .ds-tab__count { color: var(--ds-color-text-muted); }
.ds-tabs--sm { height: var(--ds-size-control-sm); }
.ds-tabs--sm .ds-tab { padding: 0 var(--ds-space-4); }
.ds-tabs--accent { display: inline-grid; grid-auto-flow: column; grid-auto-columns: 1fr; height: var(--ds-size-control); }
.ds-tabs--accent .ds-tab { padding: 0 var(--ds-space-3); font-weight: 600; letter-spacing: var(--ds-tracking-tight); }
.ds-tabpanel:focus-visible, .ds-tabpanel.is-focus-visible { outline-offset: var(--ds-focus-offset); }
.ds-cluster > .ds-tabs, .ds-page-header__actions > .ds-tabs { flex-shrink: 0; }

/* ── spec line 2373 · 5.40 Pagination ── */
.ds-pagination { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); flex-wrap: wrap; padding: var(--ds-space-3) var(--ds-space-4);
  border-top: 1px solid var(--ds-color-border-subtle); background: var(--ds-gradient-glass-up); }
.ds-pagination__summary { font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted); }
.ds-pagination__summary strong { font-weight: 500; color: var(--ds-color-text-primary); }
.ds-pagination__pages { display: flex; align-items: center; gap: var(--ds-space-1-5); }
.ds-page-btn { width: var(--ds-size-pagination-button); height: var(--ds-size-pagination-button); padding: 0; display: flex; align-items: center; justify-content: center;
  border-radius: var(--ds-radius-chip); border: 1px solid var(--ds-color-border-faint); background: var(--ds-color-surface-control); color: var(--ds-color-text-muted);
  font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 500; transition: color var(--ds-duration-fast), border-color var(--ds-duration-fast); }
.ds-page-btn:hover, .ds-page-btn.is-hover { color: var(--ds-color-text-primary); border-color: var(--ds-color-border-control-hover); }
.ds-page-btn:focus-visible, .ds-page-btn.is-focus-visible { outline-offset: 0; }
.ds-page-btn[aria-current="page"] { background: var(--ds-color-brand-strong); border-color: var(--ds-color-border-on-brand); color: var(--ds-color-text-primary); box-shadow: var(--ds-shadow-card); }
.ds-page-btn:disabled { opacity: 0.4; pointer-events: none; }
.ds-page-btn--ellipsis { cursor: default; border-color: transparent; background: transparent; }
.ds-pagination__compact { display: none; font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); padding: 0 var(--ds-space-2); }
@media (max-width: 639px) {
  .ds-page-btn--num, .ds-page-btn--ellipsis { display: none; }
  .ds-pagination__compact { display: inline; }
}

/* ── spec line 2444 · Status tints & empty state ── */
.ds-table-region { width: 100%; overflow-x: auto; }
.ds-table-region--capped { overflow-y: auto; max-height: var(--ds-table-max-height, 494px); scroll-padding-top: var(--ds-size-table-header); }
.ds-table-region:focus-visible, .ds-table-region.is-focus-visible { outline-offset: var(--ds-focus-offset-inset); }
.ds-table { width: 100%; min-width: var(--ds-table-min-width, 0); border-collapse: separate; border-spacing: 0; table-layout: auto; }
.ds-table th, .ds-table td { padding: var(--ds-space-cell-y) var(--ds-space-cell-x); text-align: start; vertical-align: middle; }
.ds-table thead th { height: var(--ds-size-table-header); background: var(--ds-color-surface-table-header); white-space: nowrap;
  font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 600; letter-spacing: var(--ds-tracking-table-header); text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-table tbody td, .ds-table tbody th { height: var(--ds-size-table-row); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 400; }
.ds-table tbody th { font-weight: 500; }
.ds-table tbody td { color: var(--ds-color-text-secondary); }
.ds-table tbody td * { font-weight: 400; }   /* DEOC: everything in a secondary cell is regular weight, tags included */
.ds-table tbody th { color: var(--ds-color-text-primary); }
.ds-table tbody tr { transition: background-color var(--ds-duration-fast); }
.ds-table tbody tr:hover, .ds-table tbody tr.is-hover { background: var(--ds-color-surface-row-hover); }
.ds-table tbody tr.ds-row-clickable { cursor: pointer; }
.ds-table tbody tr.ds-row-clickable:hover, .ds-table tbody tr.ds-row-clickable.is-hover { background: var(--ds-color-surface-hover); }
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
.ds-row-link:hover, .ds-row-link.is-hover { text-decoration: underline; text-underline-offset: 3px; }
.ds-row-link:focus-visible, .ds-row-link.is-focus-visible { outline-offset: var(--ds-focus-offset-tight); }
.ds-th-sort { display: inline-flex; align-items: center; gap: var(--ds-space-1-5); font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; border-radius: var(--ds-radius-xs); }
.ds-th-sort:hover, .ds-th-sort.is-hover { color: var(--ds-color-text-primary); }
.ds-th-sort:focus-visible, .ds-th-sort.is-focus-visible { outline-offset: var(--ds-focus-offset-tight); }
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

/* ── spec line 2499 · 5.42 Table card & table section header ── */
.ds-table-card { position: relative; display: flex; flex-direction: column; flex-shrink: 0; min-width: 0; border-radius: var(--ds-radius-card); overflow: hidden;
  background: var(--ds-gradient-glass); box-shadow: var(--ds-shadow-float-drop); }
.ds-table-card::after { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; box-shadow: var(--ds-shadow-edge); }
.ds-table-card__header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--ds-space-3);
  padding: var(--ds-space-4); border-bottom: 1px solid var(--ds-color-border-faint); }
.ds-table-card__title { display: flex; align-items: center; gap: var(--ds-space-3-5); min-width: 0; }
.ds-table-card__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-4); }
.ds-table-card__toolbar > .ds-search { flex: 1 1 320px; }

/* ── spec line 2521 · 5.43 Collapsible section (grouped list) ── */
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

/* ── spec line 2540 · Tree [EXTENSION] ── */
.ds-tree { display: flex; flex-direction: column; gap: var(--ds-space-0-5); }
.ds-tree-row { display: flex; align-items: center; gap: var(--ds-space-2); min-height: var(--ds-size-control-sm); border-radius: var(--ds-radius-sm);
  padding: var(--ds-space-1) var(--ds-space-2) var(--ds-space-1) calc(var(--ds-space-2) + var(--ds-tree-depth, 0) * var(--ds-space-5));
  transition: background-color var(--ds-duration-fast); }
.ds-tree-row:hover, .ds-tree-row.is-hover, .ds-tree-row.is-hover { background: var(--ds-color-surface-hover); }
.ds-tree-row--focused { background: var(--ds-color-surface-selected); }
.ds-tree-row__toggle, .ds-tree-row__spacer { width: var(--ds-size-ui-icon); height: var(--ds-size-ui-icon); flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  color: var(--ds-color-icon-chevron); border-radius: var(--ds-radius-xs); }
.ds-tree-row__toggle svg { transition: transform var(--ds-duration-fast); }
.ds-tree-row__toggle[aria-expanded="true"] svg { transform: rotate(90deg); }
.ds-tree-row__icon { flex-shrink: 0; color: var(--ds-color-icon); }
.ds-tree-row--container .ds-tree-row__icon { color: var(--ds-color-link); }
.ds-tree-row__label { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: var(--ds-space-2); text-align: start; }
.ds-tree-row__label > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-tree-row__end { display: flex; align-items: center; gap: var(--ds-space-1-5); flex-shrink: 0; }
.ds-tree-row__clear { opacity: 0; }
.ds-tree-row:hover .ds-tree-row__clear, .ds-tree-row:focus-within .ds-tree-row__clear, .ds-tree-row.is-hover .ds-tree-row__clear, .ds-tree-row.is-focus-visible .ds-tree-row__clear { opacity: 1; }
.ds-tree__heading { padding: var(--ds-space-2) var(--ds-space-2) var(--ds-space-0-5) calc(var(--ds-space-2) + var(--ds-tree-depth, 0) * var(--ds-space-5)); }
@media (prefers-reduced-motion: reduce) { .ds-tree-row__toggle svg { transition: none; } }

/* ── spec line 2568 · 5.44 Overlay & modal ── */
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
.ds-modal__title { font-size: var(--ds-font-size-body); line-height: var(--ds-leading-18); font-weight: 400; color: var(--ds-color-text-primary); }
.ds-modal__body { display: flex; flex-direction: column; gap: var(--ds-space-form-row); }
.ds-modal__footer { display: flex; justify-content: flex-end; gap: var(--ds-space-4); flex-wrap: wrap; }
.ds-modal__footer > .ds-btn--tertiary { min-width: 120px; }

/* ── spec line 2590 · 5.45 Confirmation dialog [PRESERVED] ── */
.ds-dialog { position: relative; width: min(var(--ds-size-dialog), calc(100% - 32px)); max-height: calc(100% - 48px); overflow-y: auto; display: flex; flex-direction: column; gap: var(--ds-space-6);
  padding: var(--ds-space-6); border-radius: var(--ds-radius-card); border: 1px solid var(--ds-color-border-subtle); background: var(--ds-gradient-dialog); box-shadow: var(--ds-shadow-modal), var(--ds-shadow-highlight); }
.ds-dialog__text { display: flex; flex-direction: column; gap: var(--ds-space-2); }
.ds-dialog__actions { display: flex; justify-content: flex-end; gap: var(--ds-space-3); }

/* ── spec line 2609 · 5.46 Slide panel (drawer) ── */
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
.ds-panel__note { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-tertiary); }

/* ── spec line 2635 · 5.47 Popover [PRESERVED · restyled] ── */
.ds-popover { position: absolute; z-index: var(--ds-z-menu); top: 100%; inset-inline-end: 0; margin-top: var(--ds-space-1); width: min(var(--ds-size-popover-date), calc(100vw - 32px));
  display: flex; flex-direction: column; gap: var(--ds-space-4); padding: var(--ds-space-4); border-radius: var(--ds-radius-sm);
  background: var(--ds-color-surface-raised); box-shadow: var(--ds-shadow-float); }
.ds-popover .ds-form-grid { column-gap: var(--ds-space-3); row-gap: var(--ds-space-4); }
.ds-popover__footer { display: flex; justify-content: space-between; gap: var(--ds-space-3); }
.ds-popover--start { right: auto; inset-inline-start: 0; }
.ds-popover--sm { width: min(280px, calc(100vw - 32px)); }

/* ── spec line 2649 · Notification feed [EXTENSION] ── */
.ds-popover--feed { padding: 0; gap: 0; overflow: hidden; }
.ds-feed__head { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); padding: var(--ds-space-3) var(--ds-space-4);
  border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-feed__list { max-height: var(--ds-size-feed-max-height); overflow-y: auto; }
.ds-feed__item { display: flex; gap: var(--ds-space-3); width: 100%; padding: var(--ds-space-3) var(--ds-space-4); text-align: start; cursor: pointer;
  transition: background-color var(--ds-duration-fast); }
.ds-feed__item:hover, .ds-feed__item.is-hover, .ds-feed__item.is-hover { background: var(--ds-color-surface-hover); }
.ds-feed__item:focus-visible, .ds-feed__item.is-focus-visible, .ds-feed__item.is-focus-visible { outline-offset: var(--ds-focus-offset-inset); }
.ds-feed__item--unread { background: var(--ds-color-surface-selected); }
.ds-feed__text { display: flex; flex-direction: column; gap: var(--ds-space-0-5); flex: 1; min-width: 0; }
.ds-feed__dismiss { opacity: 0; }
.ds-feed__item:hover .ds-feed__dismiss, .ds-feed__item:focus-within .ds-feed__dismiss, .ds-feed__item.is-hover .ds-feed__dismiss, .ds-feed__item.is-focus-visible .ds-feed__dismiss { opacity: 1; }
.ds-feed__empty { padding: var(--ds-space-10) var(--ds-space-4); text-align: center; }
.ds-feed__foot { display: flex; justify-content: center; padding: var(--ds-space-2) var(--ds-space-4); border-top: 1px solid var(--ds-color-border-subtle); }
.ds-badge-count { position: absolute; top: var(--ds-space-1); inset-inline-end: var(--ds-space-1); min-width: var(--ds-space-4); height: var(--ds-space-4); padding: 0 var(--ds-space-1);
  display: flex; align-items: center; justify-content: center; border-radius: var(--ds-radius-full); background: var(--ds-color-live);  /* white on live is 4.9:1; on danger it fails AA */
  font-size: var(--ds-font-size-caption); line-height: var(--ds-line-height-caption); font-weight: 600; color: var(--ds-color-text-on-brand); }

/* ── spec line 2673 · 5.48 Toast [PRESERVED · restyled] ── */
.ds-toast-region { position: absolute; z-index: var(--ds-z-toast); top: var(--ds-space-6); left: 50%; transform: translateX(-50%); width: max-content; max-width: calc(100% - 32px); pointer-events: none;
  display: flex; flex-direction: column; gap: var(--ds-space-2); align-items: center; }
.ds-toast { display: flex; align-items: center; gap: var(--ds-space-2); max-width: min(480px, calc(100% - 32px)); pointer-events: auto;
  padding: var(--ds-space-2-5) var(--ds-space-4); border-radius: var(--ds-radius-sm); border: 1px solid var(--ds-color-border-subtle);
  background: var(--ds-color-surface-raised); box-shadow: var(--ds-shadow-elevated); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-primary); }
.ds-toast--success svg { color: var(--ds-color-success-text); flex-shrink: 0; }
.ds-toast--error svg { color: var(--ds-color-danger-text); flex-shrink: 0; }
.ds-toast__action { margin-inline-start: var(--ds-space-2); }
@media (max-width: 639px) { .ds-toast-region { top: auto; bottom: var(--ds-space-4); width: calc(100% - 32px); } }

/* ── spec line 2691 · 5.49 Tooltips ── */
.ds-tooltip { position: fixed; z-index: var(--ds-z-label-tooltip); max-width: 280px; padding: var(--ds-space-1-5) var(--ds-space-2-5); border-radius: var(--ds-radius-sm);
  background: var(--ds-gradient-tooltip); border: 1px solid var(--ds-color-border-glass); box-shadow: var(--ds-shadow-tooltip);
  font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-tooltip); pointer-events: auto; overflow-wrap: anywhere; }
.ds-tooltip[hidden] { display: none; }
.ds-tooltip--static { position: relative; display: inline-block; }

/* ── spec line 2703 · 5.50 Loading states [PRESERVED] ── */
.ds-skeleton { background: var(--ds-color-skeleton); border-radius: var(--ds-radius-chip); animation: ds-pulse 1.5s ease-in-out infinite; }
.ds-skeleton--bar { display: inline-block; vertical-align: middle; }
@keyframes ds-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

/* ── spec line 2713 · 5.51 Empty states [PRESERVED] ── */
.ds-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ds-space-3); padding: var(--ds-space-12) var(--ds-space-4);
  text-align: center; font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); color: var(--ds-color-text-muted); }
.ds-empty--first-use { padding: var(--ds-space-16) var(--ds-space-6); }
.ds-empty--chart { padding: var(--ds-space-16) 0; }

/* ── spec line 2841 · 6.1 Application shell ── */
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
/* Shell parts: the sidebar rail, the header + content column, the skip link and the navigation drawer (§8.2). */
.ds-shell__rail { display: flex; }
.ds-shell__content { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.ds-shell__content > .ds-page-content:focus { outline: none; }
.ds-page-header h1:focus { outline: none; }  /* the h1 is the overlay focus fallback (tabindex -1); only keyboard focus shows a ring */
.ds-page-header h1:focus-visible, .ds-page-header h1.is-focus-visible { outline-offset: var(--ds-focus-offset); }
.ds-skip-link { position: absolute; left: var(--ds-space-4); top: -100px; z-index: var(--ds-z-toast); }
.ds-skip-link:focus { top: var(--ds-space-4); }
.ds-skip-link:focus-visible, .ds-skip-link.is-focus-visible { padding: var(--ds-space-2) var(--ds-space-3); border-radius: var(--ds-radius-sm); background: var(--ds-gradient-glass); color: var(--ds-color-text-primary); }
.ds-overlay--nav-drawer { position: fixed; justify-content: flex-start; align-items: stretch; padding: 0; }
.ds-overlay--nav-drawer .ds-overlay__backdrop { background: var(--ds-color-scrim); }
.ds-nav-drawer { position: relative; display: flex; flex-direction: column; width: min(var(--ds-size-sidebar-expanded), 100%); height: 100%;
  background: var(--ds-color-surface-base); box-shadow: var(--ds-shadow-drawer-mirrored); }
.ds-nav-drawer .ds-sidebar-slot { width: 100%; flex: 1; }
.ds-nav-drawer .ds-sidebar { position: static; height: 100%; border-radius: 0; box-shadow: none; }
.ds-nav-drawer__close { display: flex; justify-content: flex-end; padding: var(--ds-space-2) var(--ds-space-2) 0; }
@media (max-width: 1023px) {
  .ds-shell { padding: 0; gap: 0; flex-direction: column; }
  .ds-shell__rail { display: none; }
  .ds-main { border-radius: 0; border: 0; box-shadow: none; }
  .ds-topbar { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); min-height: 56px; padding: 0 var(--ds-space-4);
    background: var(--ds-color-surface-base); border-bottom: 1px solid var(--ds-color-border-faint); }
}

/* ── spec line 2896 · 6.5 Card grids ── */
.ds-section-title { display: flex; align-items: center; gap: var(--ds-space-3); padding: 0 var(--ds-space-1); margin-bottom: var(--ds-space-4);
  font-size: var(--ds-font-size-heading); line-height: var(--ds-line-height-heading); font-weight: 500; letter-spacing: var(--ds-tracking-title); color: var(--ds-color-text-tertiary); }
.ds-section-title__dot { width: var(--ds-size-badge-dot); height: var(--ds-size-badge-dot); border-radius: var(--ds-radius-full); background: var(--ds-color-text-faint); }
@media (min-width: 1280px) { .ds-entity-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* ── spec line 2927 · Full-page form [EXTENSION] ── */
.ds-form-page { display: flex; height: 100%; overflow: hidden; }
.ds-form-page__main { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.ds-form-page__bar { display: flex; align-items: center; gap: var(--ds-space-4); min-height: var(--ds-size-page-header); padding: var(--ds-space-4) var(--ds-space-6); flex-shrink: 0; }
.ds-form-page__steps { flex: 1; min-width: 0; overflow-x: auto; display: flex; justify-content: center; }
.ds-form-page__scroll { flex: 1; overflow-y: auto; display: flex; justify-content: center; padding: var(--ds-space-8) var(--ds-space-6); }
.ds-form-page__column { width: 100%; max-width: var(--ds-size-form-column); display: flex; flex-direction: column; gap: var(--ds-space-6); }
.ds-form-page--wide .ds-form-page__column, .ds-form-page--wide .ds-form-page__footer > * { max-width: var(--ds-size-form-column-wide); }
.ds-form-page__footer { flex-shrink: 0; display: flex; justify-content: center; padding: var(--ds-space-5) var(--ds-space-6);
  border-top: 1px solid var(--ds-color-border-subtle); background: var(--ds-gradient-glass-up); }
.ds-form-page__footer > * { width: 100%; max-width: var(--ds-size-form-column); }
.ds-form-page__guide { display: none; flex-direction: column; gap: var(--ds-space-6); width: 36%; max-width: var(--ds-size-form-guide); flex-shrink: 0; overflow-y: auto;
  padding: var(--ds-space-8); background: var(--ds-color-surface-nested); border-inline-start: 1px solid var(--ds-color-border-subtle); }
@media (min-width: 1024px) { .ds-form-page__guide { display: flex; } }
.ds-step__btn { display: flex; align-items: center; border-radius: var(--ds-radius-sm); }
.ds-step__btn:disabled { cursor: default; }

/* ── spec line 2949 · 6.11 Monitoring view ── */
.ds-monitor { display: flex; gap: var(--ds-space-grid-lg); min-height: 0; flex: 1; }
.ds-monitor > .ds-media-grid { flex: 1; min-width: 0; }
.ds-monitor__aside { width: var(--ds-size-aside); flex-shrink: 0; display: flex; flex-direction: column; gap: var(--ds-space-grid); }
@media (max-width: 1279px) { .ds-monitor { flex-direction: column; } .ds-monitor__aside { width: 100%; } }

/* ── spec line 3016 · 7.9 Rich chart tooltip ── */
.ds-chart-tip { position: absolute; z-index: var(--ds-z-tooltip); width: var(--ds-size-tooltip); pointer-events: none;
  display: flex; flex-direction: column; gap: var(--ds-space-2-5); padding: 13px; border-radius: 9px;   /* DEOC ChartTooltip (§11) */
  background: var(--ds-gradient-tooltip); border: 1px solid var(--ds-color-border-glass); box-shadow: var(--ds-shadow-tooltip); }
.ds-chart-tip--wide { width: 342px; }
.ds-chart-tip__head { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-micro); line-height: var(--ds-leading-13); }
.ds-chart-tip__head b { font-weight: 700; color: var(--ds-color-text-tooltip); }
.ds-chart-tip__rows { display: flex; flex-direction: column; gap: var(--ds-space-1-5); font-size: var(--ds-font-size-caption); line-height: var(--ds-leading-12); }
.ds-chart-tip__row { display: flex; justify-content: space-between; gap: var(--ds-space-3); color: var(--ds-color-text-tooltip-muted); }
.ds-chart-tip__row > :last-child { color: var(--ds-color-text-tooltip); }
.ds-chart-tip__divider { height: 1px; background: var(--ds-color-border-tooltip-divider); }
.ds-chart-tip__dot { width: 11px; height: 11px; border-radius: var(--ds-radius-full); flex-shrink: 0; }
.ds-tip-x, .ds-tip-sub { color: var(--ds-color-text-tooltip-muted); }
.ds-chart-tip__item > :first-child { min-width: 0; color: var(--ds-color-text-tooltip); }
.ds-chart-tip__item > :last-child { color: var(--ds-color-text-tooltip-muted); white-space: nowrap; }

/* ── spec line 3045 · 7.12 Visualization controls ── */
.ds-chart { position: relative; width: 100%; min-width: 0; }
.ds-chart__plotrow { display: flex; gap: var(--ds-space-2-5); }
.ds-axis-y { position: relative; width: 28px; flex-shrink: 0; }
.ds-axis-y span { position: absolute; inset-inline-end: var(--ds-space-2); transform: translateY(50%); font-size: var(--ds-font-size-label); line-height: var(--ds-leading-24); letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-axis); font-variant-numeric: tabular-nums; }
.ds-chart__plot { position: relative; flex: 1; min-width: 0; display: flex; align-items: flex-end; border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-chart__band { flex: 1; min-width: 0; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.ds-bands { flex: 1; min-width: 0; }
.ds-bands--scroll { overflow-x: auto; padding-bottom: var(--ds-space-2); }
.ds-bands--scroll:focus-visible, .ds-bands--scroll.is-focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
.ds-bands__track { position: relative; display: flex; }
.ds-band { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; }
.ds-band__plot { position: relative; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid var(--ds-color-border-subtle); }
.ds-band__value { position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-primary); font-variant-numeric: tabular-nums; pointer-events: none; }
.ds-band__label { margin-top: var(--ds-space-2-5); min-height: 24px; padding-inline: var(--ds-space-0-5); text-align: center; font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-primary); overflow-wrap: break-word; display: -webkit-box; flex-shrink: 0; align-self: center; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.ds-band__label--start { align-self: flex-start; text-align: start; }
.ds-band__label--end { align-self: flex-end; text-align: end; }
.ds-bands__overlay { position: absolute; inset-inline: 0; top: 0; pointer-events: none; }
.ds-bar { display: flex; flex-direction: column; width: 60%; max-width: 74px; min-width: 6px; padding: 0; border: 0; background: transparent;
  border-radius: var(--ds-radius-xs) var(--ds-radius-xs) 0 0; overflow: hidden; cursor: pointer; transition: height var(--ds-duration-slow) var(--ds-ease-standard); }
.ds-bar:focus-visible, .ds-bar.is-focus-visible { outline-offset: var(--ds-focus-offset); overflow: visible; }
.ds-bar__seg { flex-basis: 0; min-height: 1px; transition: filter var(--ds-duration-fast); }
.ds-bar:hover .ds-bar__seg, .ds-bar.is-hover .ds-bar__seg { filter: brightness(1.1); }
.ds-bar--single { width: 100%; max-width: none; min-width: 0; flex: 1; }
.ds-bar-group { display: flex; align-items: flex-end; gap: var(--ds-space-1); width: 74%; max-width: 222px; min-width: 6px; height: 100%; }
.ds-axis-x { display: flex; margin-top: var(--ds-space-2-5); margin-inline-start: calc(28px + var(--ds-space-2-5)); }
.ds-axis-x span { flex: 1; min-width: 0; text-align: center; font-size: var(--ds-font-size-body); line-height: var(--ds-leading-24); letter-spacing: var(--ds-tracking-tight); color: var(--ds-color-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-axis-x--line { position: relative; height: 24px; }
.ds-axis-x--line span { position: absolute; transform: translateX(-50%); flex: none; }
.ds-trend { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.ds-trend__pt { position: absolute; width: 10px; height: 10px; margin-inline-start: -5px; margin-bottom: -5px; border-radius: var(--ds-radius-full); background: var(--ds-chart-trend); pointer-events: none; }
.ds-trend__label { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: var(--ds-font-size-value); line-height: var(--ds-line-height-value);
  letter-spacing: var(--ds-tracking-tight); color: var(--ds-color-text-primary); text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
.ds-chart__plot--svg { display: block; }
.ds-chart__plot--svg svg { display: block; overflow: visible; }
.ds-line-hit { position: absolute; top: 0; bottom: 0; background: transparent; border: 0; padding: 0; cursor: crosshair; }
.ds-line-hit:focus-visible, .ds-line-hit.is-focus-visible { outline-offset: var(--ds-focus-offset-inset); }
.ds-hbar { display: flex; flex-direction: column; gap: var(--ds-space-3); }
.ds-hbar__row { display: grid; grid-template-columns: 154px minmax(0, 1fr); align-items: center; gap: var(--ds-space-3); }
.ds-hbar__label { display: flex; flex-direction: column; min-width: 0; }
.ds-hbar__track { display: grid; align-items: center; column-gap: var(--ds-space-2); min-width: 0; }
.ds-hbar__track > .ds-ts-small-strong { white-space: nowrap; }
.ds-hbar__bar { width: 100%; height: 20px; min-width: 6px; border: 0; padding: 0; border-radius: 0 var(--ds-radius-xs) var(--ds-radius-xs) 0; cursor: pointer;
  transition: width var(--ds-duration-slow) var(--ds-ease-standard), filter var(--ds-duration-fast); }
.ds-hbar__bar:hover, .ds-hbar__bar.is-hover { filter: brightness(1.1); }
.ds-hbar--stacked .ds-hbar__row { grid-template-columns: minmax(0, 1fr); gap: var(--ds-space-2); }
.ds-legend { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-6); }
.ds-legend li, .ds-legend__item { display: inline-flex; align-items: center; gap: var(--ds-space-3); font-size: var(--ds-font-size-body); line-height: var(--ds-leading-22); font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-legend__mark { width: 24px; height: 16px; border-radius: var(--ds-radius-xs); flex-shrink: 0; }
.ds-legend__value { margin-inline-start: var(--ds-space-3); color: var(--ds-color-text-muted); }
.ds-legend--dot { gap: var(--ds-space-5); }
.ds-legend--dot li { gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); }
.ds-legend--dot .ds-legend__mark { width: 12px; height: 12px; border-radius: var(--ds-radius-full); }
.ds-legend-dots { display: flex; flex-wrap: wrap; gap: var(--ds-space-5); }
.ds-legend-dot { display: inline-flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); font-weight: 500; color: var(--ds-color-text-tertiary); }
.ds-legend-dot i { width: 12px; height: 12px; border-radius: var(--ds-radius-full); }
.ds-donut { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--ds-space-6); }
.ds-donut__ring { position: relative; width: 180px; height: 180px; flex-shrink: 0; max-width: 100%; }
.ds-donut__ring svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.ds-donut__seg { transition: stroke-dasharray var(--ds-duration-chart) var(--ds-ease-standard), filter var(--ds-duration-fast); cursor: pointer; }
.ds-donut__seg.is-active, .ds-donut__seg:hover, .ds-donut__seg.is-hover { filter: brightness(1.15); }
.ds-donut__center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ds-donut__legend { flex: 1 1 240px; max-width: 320px; display: flex; flex-direction: column; gap: var(--ds-space-5); min-width: 0; }
.ds-donut__row { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: var(--ds-space-6); padding: var(--ds-space-0-5) 0; border-radius: var(--ds-radius-xs);
  font-size: var(--ds-font-size-body); line-height: var(--ds-leading-22); font-weight: 500; color: var(--ds-color-text-tertiary); text-align: start; }
.ds-donut__row > span:first-child { display: inline-flex; align-items: center; gap: var(--ds-space-3); white-space: nowrap; }
.ds-donut__row > span:last-child { color: var(--ds-color-text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ds-heatmap-wrap { position: relative; overflow-x: auto; }
.ds-heatmap { display: grid; min-width: 520px; }
.ds-heatmap__row { display: contents; }
.ds-heatmap__head { background: var(--ds-color-surface-table-header); padding: var(--ds-space-2) 0; text-align: center;
  font-size: var(--ds-font-size-body); line-height: var(--ds-leading-24); font-weight: 600; letter-spacing: var(--ds-tracking-tight); text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-heatmap__head--first { text-align: start; padding-inline-start: 28px; border-inline-end: 1px solid var(--ds-color-border-divider); }
.ds-heatmap__label { display: flex; align-items: center; min-height: var(--ds-size-heat-row); padding-inline: 28px var(--ds-space-3); border-inline-end: 1px solid var(--ds-color-border-divider);
  font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600; letter-spacing: var(--ds-tracking-tight); color: var(--ds-color-text-primary); }
.ds-heatmap__cellwrap { display: flex; min-height: var(--ds-size-heat-row); }
.ds-heat-cell { flex: 1; border: 0; padding: 0 var(--ds-space-1); font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600; letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-color-text-primary); cursor: pointer; font-variant-numeric: tabular-nums; transition: filter var(--ds-duration-fast); }
.ds-heat-cell:hover, .ds-heat-cell.is-hover { filter: brightness(1.25); }
.ds-heat-cell:focus-visible, .ds-heat-cell.is-focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring-on-color); outline-offset: var(--ds-focus-offset-inset); }
.ds-bubble { position: relative; padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-2); overflow-x: auto; }
.ds-bubble__row { display: grid; align-items: center; column-gap: var(--ds-space-4); min-width: 480px; }
.ds-bubble__label { display: flex; flex-direction: column; min-width: 0; }
.ds-bubble__label span:first-child { font-size: var(--ds-font-size-body); line-height: var(--ds-line-height-body); font-weight: 600; color: var(--ds-color-text-chart-strong); }
.ds-bubble__label span:last-child { font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-chart-subtle); }
.ds-bubble__cell { display: flex; align-items: center; justify-content: center; }
.ds-bubble__dot { border: 0; padding: 0; border-radius: var(--ds-radius-full); cursor: pointer; transition: transform var(--ds-duration-fast) var(--ds-ease-standard); }
.ds-bubble__dot:hover, .ds-bubble__dot.is-hover { transform: scale(1.1); }
.ds-bubble__axis { height: auto; padding-top: var(--ds-space-1); }
.ds-bubble__axis span { text-align: center; padding: 0 var(--ds-space-1); font-size: var(--ds-font-size-micro); line-height: var(--ds-line-height-micro); color: var(--ds-color-text-chart-subtle); }
.ds-chart-data { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-3); }
.ds-chart-data > div { width: 100%; }
@media (prefers-reduced-motion: reduce) { .ds-bar, .ds-hbar__bar, .ds-donut__seg, .ds-segbar__seg, .ds-progress > span, .ds-live__dot { transition: none; animation: none; } }

/* ── spec line 3148 · Chart library primitives ── */
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
.cl-mark:focus-visible, .cl-mark.is-focus-visible { outline: var(--ds-focus-width) solid var(--ds-color-focus-ring); outline-offset: var(--ds-focus-offset); }
.cl-hit { fill: transparent; cursor: crosshair; outline: none; }
.cl-hit:focus-visible, .cl-hit.is-focus-visible { stroke: var(--ds-color-focus-ring); stroke-width: var(--ds-focus-width); }
.cl-ribbon:hover, .cl-ribbon:focus-visible, .cl-ribbon.is-hover, .cl-ribbon.is-focus-visible { stroke-opacity: 0.6; }
.cl-region { stroke: var(--ds-color-surface-base); stroke-width: 1.5; }
.cl-region:hover, .cl-region:focus-visible, .cl-region.is-hover, .cl-region.is-focus-visible { stroke: var(--ds-color-text-primary); }
.cl-map { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-4); }
.cl-map__svg { width: 100%; max-width: 300px; height: auto; display: block; }
.cl-seq-legend { display: flex; align-items: center; gap: var(--ds-space-2); font-size: var(--ds-font-size-label); line-height: var(--ds-line-height-label); color: var(--ds-color-text-muted); flex-wrap: wrap; }
.cl-seq-legend__ramp { display: inline-flex; gap: var(--ds-space-0-5); }
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
.cl-inlabel { font-size: var(--ds-font-size-label); font-weight: 500; letter-spacing: var(--ds-tracking-chart-label); fill: var(--ds-color-text-primary); pointer-events: none; }
.cl-center-value { font-size: var(--ds-font-size-heading); font-weight: 600; letter-spacing: var(--ds-tracking-tight); fill: var(--ds-color-text-primary); font-variant-numeric: tabular-nums; }
.cl-center-value--lg { font-size: var(--ds-font-size-title); }

/* ── spec line 3255 · 8.10 Mobile spacing (`xs`) [EXTENSION] ── */
@media (max-width: 639px) {
  :root {
    --ds-space-section: 16px;
    --ds-space-grid: 10px;  --ds-space-grid-lg: 12px;
    --ds-space-stack: 8px;
    --ds-space-card: 12px;  --ds-space-card-lg: 14px;  --ds-space-card-xl: 16px;  --ds-space-card-entity: 17px;
    --ds-space-card-gap: 12px;  --ds-space-chart-gap: 12px;
    --ds-space-header-actions: 8px;
    --ds-space-form-col: 12px;  --ds-space-form-row: 20px;  --ds-space-form-section: 16px;
    --ds-space-cell-x: 12px;  --ds-space-cell-y: 10px;
    --ds-size-page-header: 56px;  --ds-size-kpi-card: 64px;
  }
  .ds-page-header { padding-block: var(--ds-space-2); box-shadow: var(--ds-shadow-glass-soft); }
  .ds-topbar { min-height: var(--ds-size-page-header); }
  .ds-page-header__parent, .ds-page-header__sep { display: none; }
  .ds-page-header .ds-ts-page-title { font-size: var(--ds-font-size-heading); line-height: var(--ds-line-height-heading); }
}

/* ── light spec line 221 ── */
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
  --ds-color-success-text: #6aa760;
  --ds-color-success-glow: #6aa760;
  --ds-color-success-bg: rgba(106,167,96,0.10);
  --ds-color-success-border: rgba(106,167,96,0.20);
  --ds-gradient-progress-success: linear-gradient(90deg, #6aa760 0%, #6aa760 100%);
  --ds-color-warning-text: #e8b94a;
  --ds-color-warning-bg: rgba(232,185,74,0.10);
  --ds-color-warning-border: rgba(232,185,74,0.20);
  --ds-color-danger: #e5575f;
  --ds-color-danger-text: #e5575f;
  --ds-color-danger-bg: rgba(229,87,95,0.10);
  --ds-color-danger-bg-hover: rgba(229,87,95,0.20);
  --ds-color-danger-border: rgba(229,87,95,0.20);
  --ds-color-error: #fb7185;
  --ds-color-error-text: #fb7185;
  --ds-color-live: #d33434;
  --ds-color-live-halo: rgba(211,52,52,0.40);
  --ds-color-info-text: #1d4ed8;
  --ds-color-info-bg: rgba(59,130,246,0.10);
  --ds-color-info-border: rgba(59,130,246,0.20);
  --ds-color-row-warning: rgba(232,185,74,0.03);
  --ds-color-row-critical: rgba(229,87,95,0.03);
  --ds-color-alert-count: #fb7185;

  /* ── Overlays ─────────────────────────────────────────── */
  --ds-color-scrim: rgba(15,23,42,0.30);
  --ds-overlay-blur: 4px;

  /* ── Data visualization ───────────────────────────────── */
  --ds-chart-cat-1: #60a5fa;
  --ds-chart-cat-2: #2563eb;
  --ds-chart-cat-3: #6366f1;
  --ds-chart-cat-4: #4b10a3;
  --ds-chart-cat-5: #f383a3;
  --ds-chart-cat-6: #23b9ac;
  --ds-chart-cat-7: #ad77c2;
  --ds-chart-cat-8: #6aa760;
  --ds-chart-cat-9: #da825d;
  --ds-chart-cat-10: #1397bb;
  --ds-chart-status-red: #e5575f;
  --ds-chart-status-yellow: #e8b94a;
  --ds-chart-positive: var(--ds-color-success-glow);
  --ds-chart-negative: var(--ds-chart-status-red);
  --ds-chart-running: var(--ds-color-success-text);
  --ds-chart-stopped: var(--ds-chart-status-red);
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
  --ds-shadow-status-success: 0 0 10px 0 #6aa760, 0 0 2px 0 #6aa760;
  --ds-shadow-status-warning: 0 0 10px 0 #e8b94a, 0 0 2px 0 #e8b94a;
  --ds-shadow-status-error: 0 0 10px 0 #e5575f, 0 0 2px 0 #e5575f;
  --ds-shadow-user-card: 2px 2px 24px 0 rgba(0,0,0,0.12);
  --ds-error-ring: 0 0 0 1px var(--ds-color-error);
}

/* ── light spec line 442 ── */
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
````
<!-- END ds.css -->

<!-- BEGIN text-styles.css -->
````css
/* GENERATED from the §2.3 "Named text styles" table — do not edit. */
.ds-ts-page-title { font-family: var(--ds-font-family); font-size: 24px; font-weight: 600; line-height: 32px; letter-spacing: -0.35px; color: var(--ds-color-text-primary); }
.ds-ts-dialog-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 700; line-height: 28px; letter-spacing: -0.5px; color: var(--ds-color-text-primary); }
.ds-ts-modal-title { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 18px; color: var(--ds-color-text-primary); }
.ds-ts-card-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 600; line-height: 24px; letter-spacing: -0.4px; color: var(--ds-color-text-primary); }
.ds-ts-entity-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 600; line-height: 28px; letter-spacing: -0.4px; color: var(--ds-color-text-primary); }
.ds-ts-media-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 600; line-height: 26px; letter-spacing: -0.25px; color: var(--ds-color-text-primary); }
.ds-ts-group-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 700; line-height: 24px; letter-spacing: -0.5px; color: var(--ds-color-text-primary); }
.ds-ts-subgroup-title { font-family: var(--ds-font-family); font-size: 16px; font-weight: 700; line-height: 22px; letter-spacing: -0.5px; color: var(--ds-color-text-primary); }
.ds-ts-summary-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 700; line-height: 28px; letter-spacing: -0.5px; color: var(--ds-color-text-primary); }
.ds-ts-kpi-value { font-family: var(--ds-font-family); font-size: 20px; font-weight: 700; line-height: 28px; letter-spacing: -0.65px; color: var(--ds-color-text-primary); }
.ds-ts-kpi-label { font-family: var(--ds-font-family); font-size: 12px; font-weight: 700; line-height: 16px; letter-spacing: 0.55px; text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-ts-metric-value { font-family: var(--ds-font-family); font-size: 20px; font-weight: 700; line-height: 28px; letter-spacing: -0.65px; color: var(--ds-color-text-primary); }
.ds-ts-metric-denominator { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-muted); }
.ds-ts-metric-label { font-family: var(--ds-font-family); font-size: 12px; font-weight: 500; line-height: 18px; letter-spacing: 0.4px; text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-ts-section-title { font-family: var(--ds-font-family); font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: -0.35px; color: var(--ds-color-text-tertiary); }
.ds-ts-section-label { font-family: var(--ds-font-family); font-size: 12px; font-weight: 700; line-height: 16px; letter-spacing: 0.55px; text-transform: uppercase; color: var(--ds-color-text-tertiary); }
.ds-ts-field-label { font-family: var(--ds-font-family); font-size: 12px; font-weight: 500; line-height: 16px; color: var(--ds-color-text-tertiary); }
.ds-ts-field-value { font-family: var(--ds-font-family); font-size: 16px; font-weight: 400; line-height: 22px; letter-spacing: 0.5px; color: var(--ds-color-text-primary); }
.ds-ts-eyebrow { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 18px; letter-spacing: 0.55px; color: var(--ds-color-link); }
.ds-ts-body { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-secondary); }
.ds-ts-body-muted { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-muted); }
.ds-ts-body-strong { font-family: var(--ds-font-family); font-size: 14px; font-weight: 500; line-height: 20px; color: var(--ds-color-text-primary); }
.ds-ts-body-emphasis { font-family: var(--ds-font-family); font-size: 14px; font-weight: 600; line-height: 20px; color: var(--ds-color-text-primary); }
.ds-ts-small { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 16px; color: var(--ds-color-text-muted); }
.ds-ts-small-strong { font-family: var(--ds-font-family); font-size: 12px; font-weight: 600; line-height: 16px; color: var(--ds-color-text-secondary); }
.ds-ts-caption { font-family: var(--ds-font-family); font-size: 10px; font-weight: 400; line-height: 14px; color: var(--ds-color-text-tertiary); }
.ds-ts-table-header { font-family: var(--ds-font-family); font-size: 12px; font-weight: 600; line-height: 16px; letter-spacing: 0.3px; text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-ts-table-cell-primary { font-family: var(--ds-font-family); font-size: 14px; font-weight: 500; line-height: 20px; color: var(--ds-color-text-primary); }
.ds-ts-table-cell { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-secondary); }
.ds-ts-form-label { font-family: var(--ds-font-family); font-size: 12px; font-weight: 500; line-height: 16px; color: var(--ds-color-text-muted); }
.ds-ts-form-label-caps { font-family: var(--ds-font-family); font-size: 12px; font-weight: 500; line-height: 16px; letter-spacing: 0.55px; text-transform: uppercase; color: var(--ds-color-text-muted); }
.ds-ts-input-text { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-primary); }
.ds-ts-placeholder { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-placeholder); }
.ds-ts-validation { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 16px; color: var(--ds-color-error-text); }
.ds-ts-helper { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 16px; color: var(--ds-color-text-tertiary); }
.ds-ts-button-sm { font-family: var(--ds-font-family); font-size: 12px; font-weight: 600; line-height: 16px; }
.ds-ts-button-md { font-family: var(--ds-font-family); font-size: 14px; font-weight: 600; line-height: 20px; }
.ds-ts-button-lg { font-family: var(--ds-font-family); font-size: 16px; font-weight: 600; line-height: 22px; }
.ds-ts-badge { font-family: var(--ds-font-family); font-size: 14px; font-weight: 600; line-height: 20px; }
.ds-ts-badge-sm { font-family: var(--ds-font-family); font-size: 12px; font-weight: 600; line-height: 16px; }
.ds-ts-tag { font-family: var(--ds-font-family); font-size: 14px; font-weight: 500; line-height: 20px; color: var(--ds-color-text-primary); }
.ds-ts-count-pill { font-family: var(--ds-font-family); font-size: 14px; font-weight: 700; line-height: 18px; color: var(--ds-color-text-secondary); }
.ds-ts-nav-item { font-family: var(--ds-font-family); font-size: 14px; font-weight: 500; line-height: 20px; color: var(--ds-color-text-muted); }
.ds-ts-nav-section { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 16px; color: var(--ds-color-text-muted); }
.ds-ts-tab { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-muted); }
.ds-ts-tab-count { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 16px; color: var(--ds-color-text-tertiary); }
.ds-ts-link-action { font-family: var(--ds-font-family); font-size: 14px; font-weight: 600; line-height: 20px; color: var(--ds-color-brand); }
.ds-ts-step-title { font-family: var(--ds-font-family); font-size: 12px; font-weight: 700; line-height: 16px; letter-spacing: 0.3px; color: var(--ds-color-text-primary); }
.ds-ts-step-sub { font-family: var(--ds-font-family); font-size: 12px; font-weight: 500; line-height: 16px; color: var(--ds-color-link); }
.ds-ts-media-detail { font-family: var(--ds-font-family); font-size: 14px; font-weight: 600; line-height: 16px; color: var(--ds-color-text-secondary); }
.ds-ts-avatar-initials { font-family: var(--ds-font-family); font-size: 14px; font-weight: 500; line-height: 16px; color: var(--ds-color-text-secondary); }
.ds-ts-legend { font-family: var(--ds-font-family); font-size: 14px; font-weight: 500; line-height: 22px; color: var(--ds-color-text-tertiary); }
.ds-ts-legend-sm { font-family: var(--ds-font-family); font-size: 12px; font-weight: 500; line-height: 16px; color: var(--ds-color-text-tertiary); }
.ds-ts-axis-y { font-family: var(--ds-font-family); font-size: 12px; font-weight: 400; line-height: 24px; letter-spacing: -0.4px; color: var(--ds-color-text-axis); }
.ds-ts-axis-x { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 24px; letter-spacing: -0.4px; color: var(--ds-color-text-primary); }
.ds-ts-axis-caption { font-family: var(--ds-font-family); font-size: 11px; font-weight: 400; line-height: 14px; color: var(--ds-color-text-chart-subtle); }
.ds-ts-data-label { font-family: var(--ds-font-family); font-size: 16px; font-weight: 400; line-height: 22px; letter-spacing: -0.4px; color: var(--ds-color-text-primary); }
.ds-ts-tooltip-title { font-family: var(--ds-font-family); font-size: 11px; font-weight: 700; line-height: 13px; color: var(--ds-color-text-tooltip); }
.ds-ts-tooltip-body { font-family: var(--ds-font-family); font-size: 10px; font-weight: 400; line-height: 12px; color: var(--ds-color-text-tooltip-muted); }
.ds-ts-heat-cell { font-family: var(--ds-font-family); font-size: 14px; font-weight: 600; line-height: 20px; letter-spacing: -0.4px; color: var(--ds-color-text-primary); }
.ds-ts-bar-segment { font-family: var(--ds-font-family); font-size: 12px; font-weight: 600; line-height: 1; color: var(--ds-color-text-on-bright); }
.ds-ts-toast { font-family: var(--ds-font-family); font-size: 14px; font-weight: 400; line-height: 20px; color: var(--ds-color-text-primary); }
````
<!-- END text-styles.css -->

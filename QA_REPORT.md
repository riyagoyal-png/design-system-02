# QA report

Run on 2026-10-15 against the production build (`vite preview`), headless Chrome via `playwright-core`. The raw results are in `public/qa-report.json` (also shown on the showcase's Quality page) and in `qa-output/`.

## Automated results

| Check | Command | Result |
|---|---|---|
| Spec extraction | `npm run spec` | 203 sections, 60 CSS blocks, 306 tokens, 61 text styles, 9 registry assets, 4 crops, 68 primitives |
| Typecheck | `npm run typecheck` | 0 errors |
| Production build | `npm run build` | Passes. One warning: the JS bundle is 1.64 MB minified (single chunk; see limitations) |
| Token scan | `npm run check:tokens` | 64 files · 0 undefined `var(--ds-*)` references · 0 token names quoted in docs that are undeclared · 0 colour literals outside the allow-listed spec-mirror files |
| Accessibility (axe-core, WCAG 2.0/2.1/2.2 A + AA tags) | `npm run check:browser` | 98 routes · **0 violations** |
| Horizontal overflow at 390 / 768 / 1024 / 1440 / 1680 px | `npm run check:browser` | 98 routes · **0 routes with overflow** at any width |
| Console errors | `npm run check:browser` | **0** on every route |
| Scripted interactions | `npm run check:interactions` | **29 / 29 passed** |

In the final `npm run qa` run, `check:browser` timed out once while waiting for the first page (30 s). The app booted normally when probed straight after, no port was in use, and an immediate rerun of `check:browser` and `check:interactions` produced the results above. If the timeout comes back on a slow machine, raise the wait in `scripts/check-browser.mjs`.

### Interaction checks (29)

- **Select:** ArrowDown opens it and sets `aria-activedescendant`; Enter selects and keeps focus; Escape closes without changing the value.
- **Slide panel (User Management):**
  - focus moves to the first field, and everything outside the panel is inert;
  - submit shows all 3 required errors and focuses the first invalid field;
  - Escape with unsaved edits asks to discard, with "Keep Editing" focused;
  - closing restores focus to the opener and clears inert;
  - a backdrop click never closes the panel (R-12).
- **Table:**
  - pagination changes rows and keeps focus on the page button;
  - delete confirmation is an alertdialog with Cancel focused, and deleting removes the row;
  - sorting sets `aria-sort` on one column only (Product Master).
- **Add New Factory:** step 1 blocks on invalid fields and focuses the first one.
- **Add Cameras:** opens as a modal dialog.
- **Tooltips:** they show on keyboard focus, and Escape hides them without moving focus. Chart marks show the rich tooltip on focus.
- **Toasts:** a toast with an action never times out; a neutral toast is gone after 2.5 s.
- **Date range:**
  - focus moves to "From";
  - From later than To shows an error and sets `aria-disabled` on Apply;
  - Escape discards the draft and returns focus to the trigger.
- **Tabs and radio cards:** arrow keys move and activate.
- **Compact density:** lowers the control minimum to 36 px.
- **RTL:** puts the navigation on the right edge.
- **Errors:** no uncaught page errors.

## Bugs found and fixed during QA

| Found by | Problem | Fix |
|---|---|---|
| Interactions | After a click on the scrim, Escape no longer closed a drawer or modal, because focus fell to `<body>` | Overlay roots are `tabIndex={-1}` and keep focus (spec: `.ds-overlay:focus { outline: none }`) |
| Interactions | Add New Factory step 1 and the User panel did not move focus to the first invalid field | Focus is moved after the error render, as in Add Product |
| Browser | Chart playground overflowed at 390–1024 px; its styles had been lost with the old `charts.css` | `pg-*` / `cl-*` rules restored in `showcase.css` using tokens |
| Browser | `/qa` threw when the report had no axe section yet | Partial reports are handled |
| Browser (axe) | Factories KPI row had `role="list"` without list items | Role removed |
| Browser (axe) | Dropzone accessible name omitted its visible hint text (WCAG 2.5.3) | The name comes from the visible title and hint; the field label is the description |
| Token scan (new rule) | Documentation pages named 9 tokens that no longer exist | Docs updated; the scan now fails on undeclared token names quoted as strings |
| Review | Duplicate React keys in bar and line charts when x labels repeat (Analytics data has two "Lotus" and two "Herbal" bars) | Keys include the index |
| Review | Table column `minWidth` had no effect (browsers ignore `min-width` on auto-layout cells) | `DataTable` also sets `width`, which acts as a minimum |
| Visual | Analytics donut legend labels wrapped; Line Wise Defects rows wrapped to 72 px | Legend labels nowrap; Line / Products / Main issue columns get minimum widths, so rows are a single 52 px line as in the frame |
| Spec review | Heat-cell text threshold stated as 0.6, but measured contrast against the new heat stops gives white ≥ 4.5:1 only up to 0.55 and `text-on-bright` from 0.59 | Spec aligned with the code (0.55 / 0.59, snapping between) |

## Visual comparison with the eight frames

Each screen was captured at 1920 × 1021 with `node scripts/shoot-apps.mjs` and compared side by side with the Figma screenshot of its frame. Analytics was also compared as a full-length capture.

| Frame | Result |
|---|---|
| 1 Live View | Matches: 2 × 2 feeds with detection frames, Live badge, KPI side panel, system health. Health glyphs are Lucide fallbacks (missing assets). |
| 2 Factories | Matches: KPI row with sprite crops, entity cards, status summary. |
| 3 Add New Factory | Matches: drawer over the whole shell, stepper, open user picker. |
| 4 Cameras | Matches. Nested-group radius is 16 instead of Figma's 24 (R-11). |
| 5 Add Cameras | Matches: modal over the step-2 drawer. |
| 6 User Management | Matches. The large search is 360 px instead of 349, so its placeholder never clips. |
| 7 Analytics | Matches in layout and hierarchy. Intentional differences: heat colours encode the value (R-25); "Bad Products" is computed from the defect rate (R-26); donut legend swatches match their segments (R-13); a "Show data table" link is added under the bar chart for accessibility; Device Status puts its legend under the title because the Figma legend collides with it. |
| 8 Add Product | Matches. The Product Master list behind the drawer is rebuilt in the new style (R-15). |

All frames share some deliberate differences:
- No backdrop blur on glass panels (R-09).
- Text colours that failed AA were lifted (R-03 … R-08).
- Every hover, focus and error state is inferred, because none is drawn in the frames (D-7).

## Limitations

- **Screen readers:** no screen-reader testing was done. Accessibility evidence is axe plus the scripted keyboard checks.
- **Narrow widths:** at 390 / 768 / 1024 / 1680 px, checks are automated (overflow, axe, console). Visual review at those widths was spot checks, not frame-by-frame, because the frames exist only at 1920.
- **Glass control edges:** below 3:1 by default; a boundary mode is available (spec §15.3).
- **Bundle size:** one 1.64 MB JS chunk, mostly the 64-type chart library and d3. Code-splitting the chart library page would remove the build warning.
- **Image sizes:** several Figma illustration PNGs are 1–1.4 MB (8.5 MB of assets in total). Re-encoding to WebP would cut load time; they were kept byte-identical to the Figma exports so the hashes in `FIGMA_EXTRACTION.md` hold.
- **Chart library demo data:** the generic 64-type chart library and playground still use their original non-domain sample data (departments etc.). Every other page uses Vision Automation data.
- **Open findings:** seven specification findings remain open on the Quality page (F-1 … F-7), for example the chart-library categorical extension colours that are not in §7.2, and the mixed en-GB / en-IN number formats in Analytics.

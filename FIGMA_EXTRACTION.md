# Figma extraction record

What was taken from the eight Figma reference frames, how it was taken, what is missing and which values are inferred. The authoritative values live in `spec/DESIGN_SYSTEM.md`; this file records their provenance.

- **File:** `F3mlhgMw589Hs49rxXSFXR` (read only — nothing was written, published or modified in Figma)
- **Method:** Figma MCP `get_design_context` (code + variables) and `get_screenshot` for each frame, then the child nodes of sparse responses; assets downloaded through the MCP asset URLs.
- **Frame size:** 1920 × 1021 (Analytics: 1920 × 3110)

## 1. Frame → implementation mapping

| # | Node | Frame | Route | Implementation |
|---|---|---|---|---|
| 1 | `459:11379` | Live View | `#/apps/live-view` | `src/apps/vision/LiveView.tsx` |
| 2 | `452:10239` | Factories | `#/apps/factories` | `src/apps/vision/Factories.tsx` |
| 3 | `489:11729` | Add New Factory drawer (step 1, picker open) | `#/apps/add-factory` | `AddFactoryPanel` in `Factories.tsx` |
| 4 | `491:12471` | Cameras | `#/apps/cameras` | `src/apps/vision/Cameras.tsx` |
| 5 | `491:13200` | Add Cameras modal (over step 2) | `#/apps/add-cameras` | `AddCamerasModal` in `Factories.tsx` |
| 6 | `491:14493` | User Management | `#/apps/users` | `src/apps/vision/Users.tsx` |
| 7 | `496:16402` | Analytics | `#/apps/analytics` | `src/apps/vision/Analytics.tsx` |
| 8 | `495:15510` | Add Product drawer over Product Master | `#/apps/add-product`, `#/apps/product-master` | `src/apps/vision/ProductMaster.tsx` |

Overlay frames (3, 5, 8) open in the state drawn, through their own routes. Append `?frame=1` to any route to hide the showcase-only "Back to Showcase" sidebar entry, so the sidebar matches the frame. `node scripts/shoot-apps.mjs` captures every route at 1920 × 1021 into `qa-output/apps/` for side-by-side comparison with the Figma screenshots.

## 2. Values extracted

The values below were read from the frames' layer styles. Each is defined in `spec/DESIGN_SYSTEM.md` §2–§3, tagged `[OBSERVED]`.

| Family | Values observed | Spec |
|---|---|---|
| App background | `linear-gradient(90deg, #0b1020 0%, #0f172a 55%, #020617 100%)`; ambient glows blue `rgba(59,130,246,0.10)` (top-left), green `rgba(52,211,153,0.08)` (bottom-right), 60 px blur | §2.7 |
| Glass surfaces | white 3 % → 1 % vertical gradient; KPI variant ends in `rgba(103,124,142,…)`; hairline borders white 2 %, 3 %, 7 % | §2.2, §2.7 |
| Wells | `rgba(172,195,255,0.04)`, hover 0.08 | §2.2 |
| Overlays | dialog gradient `#182032 → #101527`; tooltip `#171f31 → #101527`; scrim black 50 % + 4 px blur | §2.2, §2.7 |
| Brand | primary gradient `#2563eb → #1d4ed8`, inner highlight white 28 %, drop `rgba(37,99,235,0.35)`; nav active wash `rgba(33,88,225,…)` at 101° | §2.7 |
| Status | success `#34d399` / `#10b981`; warning `#fbbf24`; danger `#ff5825`; validation `#fb7185`; live `#d33434` | §2.2 |
| Text | white, `#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b` (tertiary, replaced — R-03) | §2.2 |
| Shadows | sidebar `0 28px 56px rgba(0,0,0,0.40)`; glass `0 12px 28px rgba(0,0,0,0.20)`; drawer `-18px 0 45px rgba(0,0,0,0.80)`; modal `0 25px 50px -12px rgba(0,0,0,0.40)`; status glows `0 0 10px <color>` | §2.6 |
| Charts | donut segments `#016ffe / #8b34fd / #fbb645 / #00bac9`; heat stops `#003e3a, #116035, #597730, #d18732, #ff5825`; bars `#10b981` / `#ff5825`; trend 3 px dashed 8 8 | §7.2 |
| Geometry | radii 4 / 6 / 8 / 12 / 16 / 24 / full; table row 72, header 56; KPI icon 52, KPI card min 102; page gutter 24; shell gap 12; section gap 20; form-row gap 40 | §2.4–§2.8 |
| Type | Inter; 28 px page titles and KPI values; 24 px card titles; 14 px KPI labels and table headers; uppercase labels +0.3 tracking | §2.3 |

How each value relates to the previous system (kept, adopted, normalised, added) is in `DESIGN_SYSTEM_DIFF.md`.

## 3. Assets

### 3.1 Raster illustrations and imagery (`public/assets/`)

SHA-256 prefixes identify the exact files downloaded from Figma.

| File | Bytes | SHA-256 (12) | Used for |
|---|---|---|---|
| `illus-camera.png` | 1,128,078 | `f954527b80b2` | Live View / Cameras nav, page and modal icons |
| `illus-facility-set.png` | 1,311,074 | `630df35b7d16` | 4-frame sprite: factory, factory + check, devices, camera (cropped, §3.2) |
| `illus-conveyor-line.png` | 74,065 | `a9173b6c1af4` | Lines KPI |
| `illus-analytics-board.png` | 229,688 | `a95de965b3c8` | Analytics nav and page |
| `illus-catalog-item.png` | 77,740 | `38fde1b4ceac` | Product Master nav, Add Product title |
| `illus-user-group.png` | 845,119 | `7f3af4a1f382` | User Management nav and page |
| `illus-activity-document.png` | 60,457 | `8c90ec28bd7f` | Activity Log nav |
| `illus-items-analyzed.png` | 1,052,182 | `c8a795a36c2b` | Products analysed KPI |
| `illus-defect-rate.png` | 1,080,608 | `989ce15b2665` | Defect % KPI |
| `logo-unilever.svg` | 44,814 | `41ec44dc82a4` | Sidebar product logo |
| `avatar-sample.jpg` | 36,719 | `3f7ac94ddfcf` | Signed-in user avatar |
| `feed-front-label.png` | 503,965 | `5fdf882557a7` | Live View camera feed 1 |
| `feed-product-barcode.png` | 447,499 | `8b6a729c0dad` | Live View camera feed 2 |
| `feed-secondary-carton.png` | 1,417,498 | `bc50e37821ab` | Live View camera feed 3 |
| `feed-cld-packing.png` | 493,090 | `342510918bd0` | Live View camera feed 4 |
| `product-thumb.png` | 22,820 | `fc7c465ae225` | Product Master front-label thumbnail |

### 3.2 Sprite crops

The screens show parts of shared sprites through oversized, offset image boxes. The same boxes are reproduced by `Illustration crop="…"` (spec §2.11 crops table, exposed as `spec.crops`):

| Crop | Asset | Width / height / left / top | Where |
|---|---|---|---|
| `factory` | facility-set | 406.55 % / 135.58 % / -5.99 % / -17.79 % | Factories nav, Total factories KPI, drawer title, entity icon |
| `factory-active` | facility-set | 406.55 % / 135.58 % / -105.99 % / -17.79 % | Active factories KPI |
| `camera-zoom` | facility-set | 439.47 % / 146.56 % / -333 % / -23.48 % | Cameras online / Devices online KPI |
| `conveyor` | conveyor-line | 104 % / 100.39 % / -2.3 % / -0.2 % | Total lines / Lines running KPI |

### 3.3 Vector icons

- 46 original SVG exports are kept in `public/figma/icons/` under frame-prefixed names (`f1__…` to `f8__…`). The prefixes avoid collisions between identically named layers in different frames.
- `scripts/build-figma-icons.mjs` turns 30 of them into React components (`src/components/ds/figmaIcons.ts`). Each one is typed as a Lucide icon and drawn in `currentColor`: ChevronSelect, SidebarToggle, Logout, Changeover, Camera, QrCode, Expand, Tag, Package, Video, Search, Plus, PlusLarge, PlusSquare, ChevronSmall, MapPin, Close, ChevronCompact, ArrowBack, Mail, ChevronDisclosure, Edit, Trash, Copy, Tick, Export, ChevronLeft, ChevronRight, Upload, Sort.
- The other 16 exports are chart marks (bubbles, lines, the product marker) or decorative groups. The chart components draw these themselves, so the files are kept only as a record.

### 3.4 Raster references (documentation only)

`public/figma/raster/` holds 5 rasterised glass layers (`f4__imgLinesDataTableSection`, `f6__imgBackgroundBorderShadow`, `f6__imgTactilePaginationFooter`, `f7__imgSegTabsBg`, `f8d__imgFixedTactileActionFooter`). Figma exported these layers as images. The UI rebuilds them in CSS and never displays the images.

## 4. Missing or unusable assets

| Asset | Problem | Substitute |
|---|---|---|
| System Health "Production Line" glyph (frame 1) | Export returned 404 | Lucide `Workflow` |
| System Health "Cameras" glyph (frame 1) | Export was an empty group | Lucide `Cctv` |
| System Health "Devices" glyph (frame 1) | Export was an empty group | Lucide `Cpu` |
| Facility sprite frame 3 ("devices") | No crop of it is used in any frame | Not used; it can be reached with a new crop entry |

## 5. Inferred values (not drawn in any frame)

These values are tagged `[INFERRED]` in the spec and listed in §15.2. Decision D-7 asks for designer approval of them.

- Every hover, focus, pressed, error and selected state.
- The opaque sticky table-header colour `#151c2e`.
- The menu shadow (reuses `shadow-float`) and the modal shadow (taken from another layer in the file).
- The primary hover gradient `#3b82f6 → #2563eb`.
- The selected state of the status toggle.
- Compact density.
- The extension components the screens never show: checkbox, switch, date range, toast, empty, loading, confirm dialog, breadcrumbs, line/area/horizontal/grouped charts.

## 6. Inconsistencies found in the frames

The frames contradict themselves in 27 places. Each one, with its resolution, is logged as R-01 … R-27 in `spec/DESIGN_SYSTEM.md` §11. The ones that change what a viewer sees:

- **R-03, R-04, R-06, R-07, R-08:** text colours that fail WCAG AA were replaced with the nearest passing value.
- **R-09:** background blur on glass panels was omitted.
- **R-13:** the donut's legend swatches don't match its segments, two rows share a label, and the percentages total 147 %.
- **R-15:** the Product Master list behind frame 8 still uses the previous visual style; it was rebuilt in the new one.
- **R-25:** heat cells with equal values are painted different colours.
- **R-26:** "Bad Products" equals "Products An." in every row.
- **R-27:** the Add Product drawer's first section is labelled "User Details".
- **R-22:** "Lines" appears in the sidebar of frames 5 and 8 only; each screen is rendered as drawn.

The sample data follows the frames' labels but is made internally consistent, so no analytical figure from the frames is reproduced where the frames contradict themselves.

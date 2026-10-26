# Component coverage

Measured, not declared. Browser probing of the production build visited every component page and recorded which documentation sections actually render; screen usage was found by scanning the eight screens' source for each component's JSX.

## Summary

| | Count |
|---|---|
| Component documentation pages | 49 |
| §5 sections they cover (component sections 5.1 – 5.51; 5.52 – 5.55 are cross-cutting rules) | 51 |
| Pages with live preview / anatomy / specification (tokens) / playground / implementation (usage) | 49 / 49 / 49 / 49 / 49 |
| Pages with behaviour & accessibility notes | 49 |
| Pages with a variants gallery (the rest: the spec defines no variants, and the page says so) | 37 |
| Pages with forced interactive states (the rest are static components, and the page says why) | 43 |
| Exported components / chart components used directly by the eight screens | 45 of 76 |

**Sizes** are shown inside the Variants section (e.g. Button sm / md / lg, Icon button sm / compact / md, Badge md / sm, Table default / compact / grid). **Examples** are the live preview plus the application screens listed below; there is no separate "Examples" section.

## Per page

Columns: preview · variants (incl. sizes) · states · anatomy · specification (tokens) · behaviour & a11y · playground · implementation (usage).

| Component | Spec | Provenance | Preview | Variants | States | Anatomy | Tokens | A11y | Playground | Usage |
|---|---|---|---|---|---|---|---|---|---|---|
| Buttons `#/components/buttons` | §5.1 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Icon Buttons `#/components/icon-buttons` | §5.2 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search Fields `#/components/search-fields` | §5.6 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Text Inputs `#/components/text-inputs` | §5.5, §5.8 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Textareas `#/components/textareas` | §5.7 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dropdowns & Selects `#/components/dropdowns` | §5.9, §5.10 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Multi-selects `#/components/multi-selects` | §5.11 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Date Pickers `#/components/date-pickers` | §5.16, §5.47 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Checkboxes `#/components/checkboxes` | §5.12 | EXTENSION | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Radio Buttons & Radio Cards `#/components/radio-cards` | §5.13 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Switches `#/components/switches` | §5.15 | EXTENSION | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Labels & Form Fields `#/components/labels` | §5.8 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Badges `#/components/badges` | §5.27 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tags `#/components/tags` | §5.29 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Status Indicators `#/components/status-indicators` | §5.28 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| KPI Cards `#/components/kpi-cards` | §5.23 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Metric Indicators & Metric Cards `#/components/metric-cards` | §5.33, §6.4 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Standard Cards (Entity Card) `#/components/standard-cards` | §5.24 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tables `#/components/tables` | §5.41 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pagination `#/components/pagination` | §5.40 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tabs & Segmented Controls `#/components/tabs` | §5.39 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Navigation Items & Sidebar `#/components/navigation-items` | §5.37 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Breadcrumbs `#/components/breadcrumbs` | §5.38 | EXTENSION | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Modals & Dialogs `#/components/modals` | §5.44, §5.45 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drawers & Slide Panels `#/components/drawers` | §5.46 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tooltips & Popovers `#/components/tooltips-popovers` | §5.49, §5.47 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Alerts `#/components/alerts` | §5.21 | EXTENSION | ✓ | ✓ | static | ✓ | ✓ | ✓ | ✓ | ✓ |
| Toasts `#/components/toasts` | §5.48 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| File Upload `#/components/file-upload` | §5.17 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading & Skeleton States `#/components/loading` | §5.50 | EXTENSION | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Empty States `#/components/empty-states` | §5.51 | EXTENSION | ✓ | ✓ | static | ✓ | ✓ | ✓ | ✓ | ✓ |
| Link Action `#/components/link-action` | §5.3 | STANDARDIZED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Action Group `#/components/action-group` | §5.4 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Binary Status Toggle `#/components/binary-toggle` | §5.14 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Field with Attach Button `#/components/field-with-attach` | §5.18 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rich Picker `#/components/rich-picker` | §5.19 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inline Callout `#/components/callout` | §5.20 | OBSERVED | ✓ | none defined | static | ✓ | ✓ | ✓ | ✓ | ✓ |
| Stepper `#/components/stepper` | §5.22 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard Card `#/components/dashboard-card` | §5.25 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Status Card `#/components/status-card` | §5.26 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Count Pill `#/components/count-pill` | §5.30 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Info Chip `#/components/info-chip` | §5.31 | PRESERVED | ✓ | none defined | static | ✓ | ✓ | ✓ | ✓ | ✓ |
| Avatar `#/components/avatar` | §5.32 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Progress & Status Bars `#/components/progress` | §5.34 | OBSERVED | ✓ | ✓ | static | ✓ | ✓ | ✓ | ✓ | ✓ |
| Summary Strip & Side-Panel Cards `#/components/summary-strip` | §5.35 | OBSERVED | ✓ | ✓ | static | ✓ | ✓ | ✓ | ✓ | ✓ |
| Media Card (Camera Tile) & Viewer `#/components/media-card` | §5.36 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Page Header `#/components/page-headers` | §5.38 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Table Card `#/components/table-card` | §5.42 | OBSERVED | ✓ | none defined | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Collapsible Section `#/components/collapsible-section` | §5.43 | OBSERVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Where components are used in the eight screens

Direct JSX use only; components composed inside others (e.g. `SegBar` inside `StatusCard`, `Avatar` inside `RichPicker`) are not counted again.

| Component | Source | Screens |
|---|---|---|
| `Button` | `Button.tsx` | Live View; Factories / Add Factory / Add Cameras; Cameras; Users; Product Master / Add Product |
| `IconButton` | `Button.tsx` | Shell; Cameras; Users; Product Master / Add Product |
| `LinkAction` | `Button.tsx` | Factories / Add Factory / Add Cameras |
| `KpiCard` | `Cards.tsx` | Factories / Add Factory / Add Cameras; Analytics; Product Master / Add Product |
| `EntityCard` | `Cards.tsx` | Factories / Add Factory / Add Cameras |
| `DashCard` | `Cards.tsx` | Analytics |
| `StatusCard` | `Cards.tsx` | Analytics |
| `SummaryStrip` | `Cards.tsx` | Live View |
| `PanelCard` | `Cards.tsx` | Live View |
| `FieldList` | `Cards.tsx` | Live View |
| `HealthRow` | `Cards.tsx` | Live View |
| `MediaCard` | `Cards.tsx` | Live View |
| `BinaryToggle` | `Choice.tsx` | Product Master / Add Product |
| `Badge` | `Display.tsx` | Live View; Cameras; Users; Analytics; Product Master / Add Product |
| `LiveBadge` | `Display.tsx` | Live View |
| `Tag` | `Display.tsx` | Users |
| `CountPill` | `Display.tsx` | Product Master / Add Product |
| `Avatar` | `Display.tsx` | Shell |
| `Illustration` | `Display.tsx` | Shell; Factories / Add Factory / Add Cameras; Cameras; Users; Analytics; Product Master / Add Product |
| `Stepper` | `Display.tsx` | Factories / Add Factory / Add Cameras |
| `Field` | `Field.tsx` | Factories / Add Factory / Add Cameras; Users; Product Master / Add Product |
| `TextInput` | `Field.tsx` | Factories / Add Factory / Add Cameras; Users; Product Master / Add Product |
| `SearchInput` | `Field.tsx` | Factories / Add Factory / Add Cameras; Cameras; Users; Analytics; Product Master / Add Product |
| `Textarea` | `Field.tsx` | Product Master / Add Product |
| `Icon` | `Icon.tsx` | Shell |
| `FileUpload` | `Inputs2.tsx` | Product Master / Add Product |
| `RichPicker` | `Inputs2.tsx` | Factories / Add Factory / Add Cameras |
| `Sidebar` | `Nav.tsx` | Shell |
| `PageHeader` | `Nav.tsx` | Shell |
| `Tabs` | `Nav.tsx` | Factories / Add Factory / Add Cameras; Users; Analytics |
| `Pagination` | `Nav.tsx` | Users; Product Master / Add Product |
| `Modal` | `Overlay.tsx` | Factories / Add Factory / Add Cameras |
| `ConfirmDialog` | `Overlay.tsx` | Live View; Cameras; Users; Product Master / Add Product |
| `SlidePanel` | `Overlay.tsx` | Factories / Add Factory / Add Cameras; Users; Product Master / Add Product |
| `MediaViewer` | `Overlay.tsx` | Live View |
| `Select` | `Select.tsx` | Live View; Factories / Add Factory / Add Cameras; Cameras; Users; Analytics; Product Master / Add Product |
| `DataTable` | `Table.tsx` | Factories / Add Factory / Add Cameras; Cameras; Users; Analytics; Product Master / Add Product |
| `TableCard` | `Table.tsx` | Users |
| `Collapsible` | `Table.tsx` | Cameras |
| `ToastRegion` | `Toast.tsx` | Shell |
| `BarChart` | `Charts.tsx` | Analytics |
| `LineChart` | `Charts.tsx` | Analytics |
| `Donut` | `Charts.tsx` | Analytics |
| `Heatmap` | `Charts.tsx` | Analytics |
| `BubbleMatrix` | `Charts.tsx` | Analytics |

Not used directly by any screen (documented as extensions or primitives, or used only inside other components): `Spinner`, `Checkbox`, `RadioCards`, `Switch`, `Status`, `Dot`, `Chip`, `Metric`, `SegBar`, `Progress`, `Skeleton`, `EmptyState`, `Callout`, `InlineAlert`, `IconTile`, `HealthTile`, `EmailLine`, `Chevron`, `CheckMark`, `IndeterminateMark`, `RadioGlyph`, `DateRangePicker`, `AttachField`, `NavItem`, `Breadcrumb`, `TabPanel`, `Popover`, `MultiSelect`, `Tooltip`, `GroupedBarChart`, `HBarChart`.

## Gaps

- Hover, focus, pressed, error and selected states are **inferred** (not drawn in Figma) for every component; decision D-7 asks for designer approval.
- Extension components (checkbox, switch, date range, toast, empty, loading, confirm dialog, breadcrumbs, line / area / horizontal / grouped charts) have no Figma reference; they are styled from the system's tokens only.
- Screen-reader testing was not performed; accessibility is verified by axe and scripted keyboard checks (see `QA_REPORT.md`).

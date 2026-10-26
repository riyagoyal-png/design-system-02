import type { ReactNode } from 'react';
import { ComponentPage, type ComponentDoc } from './ComponentPage';
import { actionGroupDoc, buttonDoc, iconButtonDoc, linkActionDoc } from './components/actions';
import { attachDoc, checkboxDoc, dateDoc, fieldDoc, multiSelectDoc, radioDoc, richPickerDoc, searchDoc, selectDoc, switchDoc, textareaDoc, textInputDoc, toggleDoc, uploadDoc } from './components/inputs';
import { alertDoc, avatarDoc, badgeDoc, calloutDoc, chipDoc, countDoc, emptyDoc, loadingDoc, metricDoc, progressDoc, statusDoc, stepperDoc, tagDoc } from './components/display';
import { dashCardDoc, entityDoc, kpiDoc, mediaDoc, statusCardDoc, stripDoc } from './components/cards';
import { breadcrumbDoc, navDoc, pageHeaderDoc, paginationDoc, tabsDoc } from './components/navigation';
import { collapsibleDoc, tableCardDoc, tableDoc } from './components/data';
import { drawerDoc, modalDoc, toastDoc, tooltipDoc } from './components/overlays';
import { HowToUsePage, IntroductionPage, PrinciplesPage, RulesPage } from './pages/start';
import { BordersPage, ColorsPage, DensityPage, EffectsPage, IconographyPage, MotionPage, RadiiPage, ResponsivePage, ShadowsPage, SpacingPage, TypographyPage } from './pages/foundations';
import { BubblePage, ChartFoundationsPage, DonutPage, GroupedBarPage, HeatmapPage, HorizontalBarPage, LinePage, ProgressVizPage, TooltipsLegendsPage, VerticalBarPage } from './pages/charts';
import { ChartLibraryPage } from './pages/chartLibrary';
import { ChartPlaygroundPage } from './pages/chartPlayground';
import { DashboardLayout, DetailLayout, FilterLayout, FormsLayout, HeaderLayout, KpiLayout, ModalWorkflowLayout, ShellLayout, TableLayout } from './pages/layouts';
import { QaPage } from './pages/qa';
import { AppsIndex } from './pages/apps';
import { EXTRAS } from './components/extras';
import { A11Y } from './components/a11y';

export interface NavItemDef { path: string; title: string; description: string; render: () => ReactNode; keywords?: string }
export interface NavGroup { label: string; items: NavItemDef[] }

/** Component docs in the order of the brief, followed by the other §5 components. */
export const COMPONENT_DOCS: ComponentDoc[] = [
  buttonDoc, iconButtonDoc, searchDoc, textInputDoc, textareaDoc, selectDoc, multiSelectDoc, dateDoc, checkboxDoc, radioDoc, switchDoc, fieldDoc,
  badgeDoc, tagDoc, statusDoc, kpiDoc, metricDoc, entityDoc, tableDoc, paginationDoc, tabsDoc, navDoc, breadcrumbDoc, modalDoc, drawerDoc, tooltipDoc,
  alertDoc, toastDoc, uploadDoc, loadingDoc, emptyDoc,
  // other documented components
  linkActionDoc, actionGroupDoc, toggleDoc, attachDoc, richPickerDoc, calloutDoc, stepperDoc, dashCardDoc, statusCardDoc, countDoc, chipDoc, avatarDoc,
  progressDoc, stripDoc, mediaDoc, pageHeaderDoc, tableCardDoc, collapsibleDoc,
];
const OTHER_START = COMPONENT_DOCS.indexOf(linkActionDoc);
// Anatomy, playgrounds and static/no-variant notes kept in extras.tsx are merged in (existing fields win).
for (const d of COMPONENT_DOCS) Object.assign(d, { ...EXTRAS[d.path], ...Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)) });
for (const d of COMPONENT_DOCS) d.behavior ??= A11Y[d.path];

const comp = (d: ComponentDoc): NavItemDef => ({ path: d.path, title: d.title, description: d.summary, render: () => <ComponentPage doc={d} />, keywords: d.refs.join(' ') });

export const NAV: NavGroup[] = [
  { label: 'Getting Started', items: [
    { path: '/', title: 'Introduction', description: 'What this showcase is and how it is built from DESIGN_SYSTEM.md.', render: () => <IntroductionPage /> },
    { path: '/start/principles', title: 'Design Principles', description: 'The ten principles that define the visual identity (§1).', render: () => <PrinciplesPage /> },
    { path: '/start/how-to-use', title: 'How to Use This System', description: 'Adopting the tokens, base CSS, components and layouts in a new product.', render: () => <HowToUsePage /> },
    { path: '/start/rules', title: 'Implementation Rules', description: 'The mandatory rules and decision hierarchy for developers and AI agents (§10).', render: () => <RulesPage /> },
  ] },
  { label: 'Foundations', items: [
    { path: '/foundations/colors', title: 'Colors', description: 'Semantic, status, chart and component colors, and the primitive reference labels.', render: () => <ColorsPage /> },
    { path: '/foundations/typography', title: 'Typography', description: 'Inter, the preserved scale plus the 28px display exception, and every named text style.', render: () => <TypographyPage /> },
    { path: '/foundations/spacing', title: 'Spacing', description: 'The 4px scale, semantic spacing and real examples.', render: () => <SpacingPage /> },
    { path: '/foundations/radii', title: 'Radii', description: 'Role-based radii: panel 24, card and nested 16, control 12, small 8, chip 6.', render: () => <RadiiPage /> },
    { path: '/foundations/borders', title: 'Borders', description: 'Hairline white borders (2–7 %) on glass, widths and colors.', render: () => <BordersPage /> },
    { path: '/foundations/effects', title: 'Gradients & Effects', description: 'App and glass gradients, glows, the primary button gradient and the blur rule.', render: () => <EffectsPage />, keywords: 'gradient glass glow blur backdrop' },
    { path: '/foundations/shadows', title: 'Shadows & Elevation', description: 'Shadow tokens, elevation levels, focus indicators and z-index.', render: () => <ShadowsPage /> },
    { path: '/foundations/motion', title: 'Motion', description: 'Durations and easing, with reduced-motion support.', render: () => <MotionPage /> },
    { path: '/foundations/iconography', title: 'Iconography', description: '3D illustrations with Figma crops, the Figma functional icon set and Lucide fallbacks.', render: () => <IconographyPage /> },
    { path: '/foundations/density', title: 'Density Modes', description: 'Default (the screens) and the derived compact mode.', render: () => <DensityPage /> },
    { path: '/foundations/responsive', title: 'Responsive Rules', description: 'Breakpoints, and the example apps rendered at real widths.', render: () => <ResponsivePage /> },
  ] },
  { label: 'Components', items: COMPONENT_DOCS.slice(0, OTHER_START).map(comp) },
  { label: 'Other Documented Components', items: COMPONENT_DOCS.slice(OTHER_START).map(comp) },
  { label: 'Data Visualization', items: [
    { path: '/charts/library', title: 'Chart Library (64 types)', description: 'All 64 chart types by category (63 Pulse + DEOC bubble matrix), with live charts, coverage status and Figma parity.', render: () => <ChartLibraryPage />, keywords: 'sankey scatter histogram pareto control step forecast pie dumbbell lollipop dot heatmap choropleth map' },
    { path: '/charts/playground', title: 'Chart Responsiveness Playground', description: 'Resize a chart, add or remove categories and series, and read the measured geometry; coverage matrix for all 64 charts.', render: () => <ChartPlaygroundPage />, keywords: 'responsive resize width categories coverage matrix playground' },
    { path: '/charts/foundations', title: 'Chart Foundations', description: 'Palettes, heat scale, axes and number formatting (§7.1–7.3).', render: () => <ChartFoundationsPage /> },
    { path: '/charts/vertical-bar', title: 'Vertical Bar Charts', description: 'Single-series vertical bars (§7.4).', render: () => <VerticalBarPage /> },
    { path: '/charts/horizontal-bar', title: 'Horizontal Bar Charts', description: 'Horizontal bars [EXTENSION] (§7.4).', render: () => <HorizontalBarPage /> },
    { path: '/charts/grouped-bar', title: 'Grouped Bar Charts', description: 'Grouped bars [EXTENSION] (§7.4).', render: () => <GroupedBarPage /> },
    { path: '/charts/stacked-bar', title: 'Stacked Bar Charts', description: 'Stacked bars with the trend overlay (§7.4, §7.5).', render: () => <VerticalBarPage stacked /> },
    { path: '/charts/line', title: 'Line Charts', description: 'Standalone line charts [EXTENSION] (§7.5).', render: () => <LinePage /> },
    { path: '/charts/area', title: 'Area Charts', description: 'Area charts [EXTENSION] (§7.5).', render: () => <LinePage area /> },
    { path: '/charts/donut', title: 'Donut Charts', description: 'Donuts with legends that repeat every value (§7.6).', render: () => <DonutPage /> },
    { path: '/charts/heatmap', title: 'Heatmaps', description: 'Heat cells with contrast-safe snapping (§7.7).', render: () => <HeatmapPage /> },
    { path: '/charts/bubble', title: 'Bubble Matrices', description: 'Size = volume, color = rate (§7.8).', render: () => <BubblePage /> },
    { path: '/charts/progress', title: 'Progress Visualizations', description: 'Segmented status bars and progress bars (§5.34).', render: () => <ProgressVizPage /> },
    { path: '/charts/tooltips-legends', title: 'Chart Tooltips & Legends', description: 'The rich tooltip and the three legend styles (§7.9, §7.10).', render: () => <TooltipsLegendsPage /> },
  ] },
  { label: 'Layout Patterns', items: [
    { path: '/layouts/shell', title: 'Application Shell', description: 'Sidebar rail + main panel (§6.1).', render: () => <ShellLayout /> },
    { path: '/layouts/page-headers', title: 'Page Headers', description: 'Header defaults and variants (§6.2).', render: () => <HeaderLayout /> },
    { path: '/layouts/filters', title: 'Filter Toolbars', description: 'Place filters by scope (§6.3).', render: () => <FilterLayout /> },
    { path: '/layouts/kpi-grids', title: 'KPI Grids', description: 'KPI rows and metric variants (§6.4).', render: () => <KpiLayout /> },
    { path: '/layouts/data-tables', title: 'Data Tables', description: 'List / management pages (§6.6, §6.7).', render: () => <TableLayout /> },
    { path: '/layouts/dashboards', title: 'Dashboard Layouts', description: 'Dashboard composition (§6.9).', render: () => <DashboardLayout /> },
    { path: '/layouts/forms', title: 'Forms', description: 'Form containers and invariants (§6.10).', render: () => <FormsLayout /> },
    { path: '/layouts/detail-pages', title: 'Detail Pages', description: 'One record and its children (§6.8).', render: () => <DetailLayout /> },
    { path: '/layouts/modal-workflows', title: 'Modal Workflows', description: 'Create, edit and delete flows with the overlay contract.', render: () => <ModalWorkflowLayout /> },
  ] },
  { label: 'Example Applications', items: [
    { path: '/apps', title: 'All Applications', description: 'The eight Figma reference screens, implemented interactively from the system.', render: () => <AppsIndex /> },
  ] },
  { label: 'Quality', items: [
    { path: '/qa', title: 'Visual QA', description: 'Coverage matrix, live checks, automated accessibility results and specification findings.', render: () => <QaPage /> },
  ] },
];

/** The eight Figma reference frames (file F3mlhgMw589Hs49rxXSFXR) and the routes that implement them. */
export const APPS = [
  { id: 'live-view', frame: '459:11379', title: 'Live View', description: 'Line monitor: camera feeds with detections, line KPIs, system health and the line-changeover confirmation.' },
  { id: 'factories', frame: '452:10239', title: 'Factories', description: 'Factory cards with utilisation, status summary, search and filters.' },
  { id: 'add-factory', frame: '489:11729', title: 'Add New Factory', description: 'Three-step slide panel: validated details, line and camera configuration, review.' },
  { id: 'cameras', frame: '491:12471', title: 'Cameras', description: 'Factories → lines → cameras in collapsible sections, with device status and delete confirmation.' },
  { id: 'add-cameras', frame: '491:13200', title: 'Add Cameras', description: 'Modal over the Add New Factory configuration step, with the rich user picker.' },
  { id: 'users', frame: '491:14493', title: 'User Management', description: 'Role tabs with counts, search, filters, pagination, add/edit panel and delete confirmation.' },
  { id: 'analytics', frame: '496:16402', title: 'Analytics', description: 'KPI row, quality snapshot with trend, defect matrix, donut, heatmap, line-wise table and status cards.' },
  { id: 'add-product', frame: '495:15510', title: 'Add Product', description: 'Product slide panel with reference upload, over the Product Master list.' },
  { id: 'product-master', frame: '495:15510 (background)', title: 'Product Master', description: 'The product list behind frame 8: KPIs, sortable table, filters and pagination (R-15).' },
];

export const ALL_ITEMS = NAV.flatMap(g => g.items);

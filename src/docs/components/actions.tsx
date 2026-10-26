import { useState } from 'react';
import { ArrowBack, ChevronRight, ChevronSmall, Changeover, Copy, Edit, Export, Plus, Trash } from '../../components/ds/figmaIcons';
import { Button, IconButton, LinkAction, type ButtonSize, type ButtonVariant } from '../../components/ds/Button';
import { SearchInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { toast } from '../../components/ds/Toast';
import { Cell, Grid, attrs } from '../kit';
import type { ComponentDoc } from '../ComponentPage';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'subtle', 'tonal', 'ghost', 'danger'];
const VARIANT_LABEL: Record<ButtonVariant, string> = { primary: 'Add camera', secondary: 'Export', subtle: 'View factory', tonal: 'Add Line', ghost: 'Clear', danger: 'Delete camera' };
const VARIANT_NOTE: Record<ButtonVariant, string> = {
  primary: 'gradient-button-primary · brand border · shadow-button-primary', secondary: 'gradient-glass · border-control · text-emphasis 500 · shadow-field',
  subtle: 'surface-control · border-hairline · text-emphasis', tonal: 'brand-tint-20 · brand-text [EXTENSION]', ghost: 'transparent · text-muted [EXTENSION]', danger: 'danger-bg · danger-border · danger-text [EXTENSION]',
};

function LoadingDemo() {
  const [busy, setBusy] = useState(false);
  return <Button loading={busy} trailing={ChevronRight} minWidth onClick={() => { setBusy(true); window.setTimeout(() => { setBusy(false); toast('Product saved'); }, 1500); }}>Save product</Button>;
}

export const buttonDoc: ComponentDoc = {
  path: '/components/buttons', title: 'Buttons', refs: ['5.1'], provenance: 'OBSERVED',
  summary: 'Triggers an action. One primary per view region; header and footer primaries take the optional 180px minimum width (every primary in the screens is 180px wide). Labels wrap instead of clipping and the width is content-driven.',
  preview: () => (
    <div className="ds-cluster">
      <Button leading={Plus} minWidth onClick={() => toast('The Add Cameras form opens here')}>Add camera</Button>
      <Button leading={Changeover} minWidth>Line Changeover</Button>
      <Button variant="secondary" leading={ArrowBack}>Back</Button>
      <Button variant="subtle" trailing={ChevronRight}>View factory</Button>
      <LoadingDemo />
    </div>
  ),
  variants: () => (
    <>
      <Grid min={200}>{VARIANTS.map(v => <Cell key={v} label={v} note={VARIANT_NOTE[v]}><Button variant={v}>{VARIANT_LABEL[v]}</Button></Cell>)}</Grid>
      <Grid min={200}>
        {(['sm', 'md', 'lg'] as ButtonSize[]).map(s => <Cell key={s} label={`size ${s}`} note={s === 'sm' ? 'min-height 28 · padding 0 12 · button-sm 12/16 600' : s === 'md' ? 'min-height 40 · padding 0 16 · button-md 14/20 600 (default)' : 'min-height 48 · padding 0 20 · button-lg 16/22 600'}><Button size={s} leading={Plus}>Add user</Button></Cell>)}
        <Cell label="Trailing chevron (Next / Save)" note="14px, points inline-end"><Button trailing={ChevronRight} minWidth>Next: Configuration</Button></Cell>
        <Cell label="Leading back arrow" note="20px glyph"><Button variant="secondary" leading={ArrowBack}>Cancel</Button></Cell>
        <Cell label="Optional 180px min-width" note="size-header-button"><Button minWidth leading={Plus}>Add Camera</Button></Cell>
        <Cell label="Long label wraps" note="Never clipped (§2.3)"><div className="doc-narrow"><Button variant="secondary">Export line-wise defects as spreadsheet</Button></div></Cell>
      </Grid>
    </>
  ),
  unsupported: ['outline / link-styled buttons (use §5.3 link action)', 'icon-only text buttons (use §5.2 icon button)', 'pill-shaped buttons'],
  states: () => (
    <Grid min={170}>
      {VARIANTS.flatMap(v => [
        <Cell key={v + 'd'} label={`${v} · default`}><Button variant={v}>{VARIANT_LABEL[v]}</Button></Cell>,
        <Cell key={v + 'h'} label={`${v} · hover`}><Button variant={v} className="is-hover">{VARIANT_LABEL[v]}</Button></Cell>,
        <Cell key={v + 'f'} label={`${v} · focus-visible`}><Button variant={v} className="is-focus-visible">{VARIANT_LABEL[v]}</Button></Cell>,
        <Cell key={v + 'x'} label={`${v} · disabled`} note="opacity 0.4"><Button variant={v} disabled>{VARIANT_LABEL[v]}</Button></Cell>,
      ])}
      <Cell label="primary · loading" note="aria-busy; 16px spinner replaces the leading icon; clicks ignored"><Button loading>Saving</Button></Cell>
      <Cell label="aria-disabled + reason" note="Stays focusable"><span className="doc-stack-sm"><Button softDisabled aria-describedby="why" trailing={ChevronRight}>Save product</Button><span id="why" className="ds-text-small">Upload both label references to save.</span></span></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <Button leading={Plus} trailing={ChevronRight} minWidth>Add camera</Button>,
    parts: [
      { part: 'container', label: 'Container', spec: 'min-height 40 (size-control) · padding 0 16 · 1px border · radius 12 (radius-control) · gap 8' },
      { part: 'leading', label: 'Leading icon', spec: '14px plus / changeover, 20px back arrow; currentColor' },
      { part: 'label', label: 'Label', spec: 'button-md 14/20 600 (secondary 500); wraps when constrained' },
      { part: 'trailing', label: 'Trailing icon', spec: '14px chevron pointing inline-end' },
    ],
  },
  spec: [
    { property: 'Min height (md / sm / lg)', token: '--ds-size-control + --ds-size-control-sm + --ds-size-control-lg' },
    { property: 'Horizontal padding (md / sm / lg)', token: '--ds-space-4 + --ds-space-3 + --ds-space-5' },
    { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Icon → label gap', token: '--ds-space-2' },
    { property: 'Typography (md)', token: '--ds-font-size-body + --ds-line-height-body', note: ' weight 600; secondary 500' },
    { property: 'Primary fill / hover', token: '--ds-gradient-button-primary + --ds-gradient-button-primary-hover' },
    { property: 'Primary border / text', token: '--ds-color-brand + --ds-color-text-on-brand' },
    { property: 'Primary glow', token: '--ds-shadow-button-primary' },
    { property: 'Secondary fill / shadow', token: '--ds-gradient-glass + --ds-shadow-field' },
    { property: 'Secondary border / hover / text', token: '--ds-color-border-control + --ds-color-border-control-hover + --ds-color-text-emphasis' },
    { property: 'Subtle fill / hover / border', token: '--ds-color-surface-control + --ds-color-surface-control-hover + --ds-color-border-hairline' },
    { property: 'Tonal fill / hover / text', token: '--ds-color-brand-tint-20 + --ds-color-brand-tint-30 + --ds-color-brand-text' },
    { property: 'Ghost text / hover fill', token: '--ds-color-text-muted + --ds-color-surface-hover' },
    { property: 'Danger fill / hover / border / text', token: '--ds-color-danger-bg + --ds-color-danger-bg-hover + --ds-color-danger-border + --ds-color-danger-text' },
    { property: 'Optional min width', token: '--ds-size-header-button' },
    { property: 'Transition', token: '--ds-duration-fast + --ds-ease-standard' },
    { property: 'Disabled', value: 'opacity 0.4', note: ' (§2.2 Disabled)' },
  ],
  playground: {
    controls: [
      { kind: 'select', key: 'variant', label: 'Variant', options: VARIANTS },
      { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
      { kind: 'text', key: 'label', label: 'Label' },
      { kind: 'select', key: 'icon', label: 'Icon', options: ['none', 'leading plus', 'leading back', 'trailing chevron'] },
      { kind: 'bool', key: 'disabled', label: 'Disabled' },
      { kind: 'bool', key: 'loading', label: 'Loading' },
      { kind: 'bool', key: 'minWidth', label: 'Min width 180' },
    ],
    initial: { variant: 'primary', size: 'md', label: 'Add camera', icon: 'leading plus', disabled: false, loading: false, minWidth: true },
    render: p => (
      <Button variant={p.variant as ButtonVariant} size={p.size as ButtonSize} disabled={!!p.disabled} loading={!!p.loading} minWidth={!!p.minWidth}
        leading={p.icon === 'leading plus' ? Plus : p.icon === 'leading back' ? ArrowBack : undefined} trailing={p.icon === 'trailing chevron' ? ChevronRight : undefined}>
        {String(p.label) || 'Action'}
      </Button>
    ),
    code: p => `<Button${attrs({ variant: p.variant !== 'primary' ? String(p.variant) : undefined, size: p.size !== 'md' ? String(p.size) : undefined })}${p.icon === 'leading plus' ? ' leading={Plus}' : p.icon === 'leading back' ? ' leading={ArrowBack}' : p.icon === 'trailing chevron' ? ' trailing={ChevronRight}' : ''}${attrs({ disabled: !!p.disabled, loading: !!p.loading, minWidth: !!p.minWidth })}>\n  ${p.label}\n</Button>`,
  },
  usage: `import { Button } from './components/ds/Button';\nimport { ArrowBack, ChevronRight, Plus } from './components/ds/figmaIcons';\n\n<Button leading={Plus} minWidth onClick={openAddCameras}>Add camera</Button>\n<Button variant="secondary" leading={ArrowBack} onClick={close}>Cancel</Button>\n<Button variant="subtle" trailing={ChevronRight}>View factory</Button>\n<Button loading>Saving</Button>\n<Button softDisabled aria-describedby="save-hint">Save product</Button>`,
  behavior: (
    <ul className="doc-list">
      <li>Native <code>&lt;button type="button"&gt;</code> unless it submits a form; Enter and Space activate (§5.52).</li>
      <li>Loading sets <code>aria-busy="true"</code> and ignores activation; <code>softDisabled</code> uses <code>aria-disabled</code> so a reason can be linked with <code>aria-describedby</code> and the button stays focusable (cursor not-allowed).</li>
      <li>Focus: 2px <code>focus-ring</code> outline, offset 2. Hover never changes the label colour of primary.</li>
      <li>One primary per view region. Footer pattern: secondary (Back / Cancel) at the inline-start, primary at the inline-end (§5.4).</li>
    </ul>
  ),
};

export const iconButtonDoc: ComponentDoc = {
  path: '/components/icon-buttons', title: 'Icon Buttons', refs: ['5.2'], provenance: 'OBSERVED',
  summary: 'Icon-only actions: row actions (copy, edit, delete), back, and the debossed close button of drawers (36) and modals (32). Every icon button has an aria-label (verb + object) and shows it in a tooltip on hover and keyboard focus.',
  preview: () => (
    <div className="ds-cluster">
      <span className="ds-row-actions">
        <IconButton icon={Copy} size="compact" label="Copy email of Anita Sharma" onClick={() => toast('Email copied')} />
        <IconButton icon={Edit} size="compact" label="Edit Anita Sharma" />
        <IconButton icon={Trash} size="compact" label="Delete Anita Sharma" />
      </span>
      <IconButton icon={ArrowBack} label="Back to Factories" />
      <IconButton label="Close Add New Factory" variant="close" />
    </div>
  ),
  variants: () => (
    <Grid min={190}>
      <Cell label="md · default" note="36 × 36 (size-icon-button), 20px glyph"><IconButton icon={ArrowBack} label="Back to Factories" /></Cell>
      <Cell label="compact · row action" note="32 × 32, 24px Figma glyph"><IconButton icon={Edit} size="compact" label="Edit Line 1 • Camera 1" /></Cell>
      <Cell label="sm" note="28 × 28, 16px glyph"><IconButton icon={Plus} size="sm" label="Add line" /></Cell>
      <Cell label="close · drawer" note="36 × 36, 10px ×, surface-hover + border-subtle + shadow-close"><IconButton label="Close Add New Factory" variant="close" tooltip={false} /></Cell>
      <Cell label="close · modal" note="32 × 32 (compact)"><IconButton label="Close Add Cameras" variant="close" size="compact" tooltip={false} /></Cell>
      <Cell label="open / view" note="link color (#60a5fa) for navigation"><IconButton icon={ChevronRight} label="Open Factory 1" className="ds-icon-btn--open" /></Cell>
    </Grid>
  ),
  states: () => (
    <Grid min={150}>
      <Cell label="default" note="icon (#64748b)"><IconButton icon={Edit} size="compact" label="Edit" tooltip={false} /></Cell>
      <Cell label="hover" note="text-primary + surface-hover"><IconButton icon={Edit} size="compact" label="Edit" className="is-hover" tooltip={false} /></Cell>
      <Cell label="focus-visible"><IconButton icon={Edit} size="compact" label="Edit" className="is-focus-visible" tooltip={false} /></Cell>
      <Cell label="disabled" note="opacity 0.4"><IconButton icon={Edit} size="compact" label="Edit" disabled tooltip={false} /></Cell>
      <Cell label="close · hover" note="border-control-hover + text-primary"><IconButton label="Close" variant="close" className="is-hover" tooltip={false} /></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <IconButton icon={Edit} size="compact" label="Edit Anita Sharma" tooltip={false} />,
    parts: [{ part: 'container', label: 'Hit area', spec: '32 × 32 compact (36 md, 28 sm) · radius 8 (radius-sm) · transparent · 24px glyph in icon (#64748b)' }],
  },
  spec: [
    { property: 'Size md / compact / sm', token: '--ds-size-icon-button + --ds-size-icon-button-compact + --ds-size-control-sm' },
    { property: 'Row-action glyph', token: '--ds-size-action-icon' },
    { property: 'Radius', token: '--ds-radius-sm' },
    { property: 'Icon color → hover', token: '--ds-color-icon + --ds-color-text-primary' },
    { property: 'Hover fill', token: '--ds-color-surface-hover' },
    { property: 'Close: fill / border / shadow', token: '--ds-color-surface-hover + --ds-color-border-subtle + --ds-shadow-close' },
    { property: 'Close: glyph / hover border', token: '--ds-color-text-muted + --ds-color-border-control-hover' },
    { property: 'Open variant', token: '--ds-color-link' },
    { property: 'Row-action gap', token: '--ds-space-4', note: ' (glyph centres 48px apart)' },
  ],
  playground: {
    controls: [
      { kind: 'select', key: 'size', label: 'Size', options: ['md', 'compact', 'sm'] },
      { kind: 'select', key: 'icon', label: 'Icon', options: ['edit', 'delete', 'copy', 'back', 'close'] },
      { kind: 'text', key: 'label', label: 'aria-label' },
      { kind: 'bool', key: 'disabled', label: 'Disabled' },
    ],
    initial: { size: 'compact', icon: 'edit', label: 'Edit Line 1 • Camera 1', disabled: false },
    render: p => p.icon === 'close'
      ? <IconButton variant="close" label={String(p.label) || 'Close'} size={p.size === 'compact' ? 'compact' : 'md'} disabled={!!p.disabled} />
      : <IconButton icon={{ edit: Edit, delete: Trash, copy: Copy, back: ArrowBack }[String(p.icon) as 'edit']} label={String(p.label) || 'Action'} size={p.size as 'sm'} disabled={!!p.disabled} />,
    code: p => p.icon === 'close' ? `<IconButton variant="close" label="${p.label}"${p.size === 'compact' ? ' size="compact"' : ''}${p.disabled ? ' disabled' : ''} />`
      : `<IconButton icon={${{ edit: 'Edit', delete: 'Trash', copy: 'Copy', back: 'ArrowBack' }[String(p.icon) as 'edit']}} label="${p.label}"${p.size !== 'md' ? ` size="${p.size}"` : ''}${p.disabled ? ' disabled' : ''} />`,
  },
  usage: `import { Copy, Edit, Trash } from './components/ds/figmaIcons';\n\n<span className="ds-row-actions">\n  <IconButton icon={Copy} size="compact" label={\`Copy email of \${u.name}\`} onClick={copy} />\n  <IconButton icon={Edit} size="compact" label={\`Edit \${u.name}\`} onClick={edit} />\n  <IconButton icon={Trash} size="compact" label={\`Delete \${u.name}\`} onClick={confirmDelete} />\n</span>\n<IconButton variant="close" label="Close Add New Factory" onClick={close} />`,
  behavior: (
    <ul className="doc-list">
      <li><code>aria-label</code> names the action and its object ("Edit Anita Sharma"); the same text appears in a label tooltip after 300ms hover or on focus, and Escape dismisses it (§5.49).</li>
      <li>Targets are at least 24 × 24; row actions are 32 × 32 (§9.7). Glyphs are decorative (<code>aria-hidden</code>).</li>
      <li>Destructive row actions open a confirmation dialog (§5.45).</li>
    </ul>
  ),
};

export const linkActionDoc: ComponentDoc = {
  path: '/components/link-action', title: 'Link Action', refs: ['5.3'], provenance: 'STANDARDIZED',
  summary: 'A low-weight inline action inside a form or picker ("+ Add New User", "+ Add User"). As in DEOC it is brand #3b82f6 and turns link #60a5fa on hover (D-10).',
  preview: () => <LinkAction icon={Plus} onClick={() => toast('The add-user form opens here')}>Add New User</LinkAction>,
  variants: () => (
    <Grid>
      <Cell label="with leading plus" note="14px plus, 8px gap"><LinkAction icon={Plus}>Add New User</LinkAction></Cell>
      <Cell label="text only"><LinkAction>View all cameras</LinkAction></Cell>
    </Grid>
  ),
  states: () => (
    <Grid min={160}>
      <Cell label="default" note="link"><LinkAction icon={Plus}>Add User</LinkAction></Cell>
      <Cell label="hover" note="link-hover"><LinkAction icon={Plus} className="is-hover">Add User</LinkAction></Cell>
      <Cell label="focus-visible"><LinkAction icon={Plus} className="is-focus-visible">Add User</LinkAction></Cell>
      <Cell label="disabled" note="opacity 0.4"><LinkAction icon={Plus} disabled className="doc-disabled">Add User</LinkAction></Cell>
    </Grid>
  ),
  anatomy: {
    render: () => <LinkAction icon={Plus}>Add New User</LinkAction>,
    parts: [
      { part: 'container', label: 'Action', spec: 'inline-flex, gap 8, radius 4 (focus outline follows it)' },
      { part: 'icon', label: 'Icon', spec: '14px plus, currentColor' },
      { part: 'label', label: 'Label', spec: 'link-action 14/20 600, link (#60a5fa)' },
    ],
  },
  spec: [
    { property: 'Text', token: '--ds-color-link', note: ' 14/20 600' },
    { property: 'Hover', token: '--ds-color-link-hover' },
    { property: 'Icon → label gap', token: '--ds-space-2' },
    { property: 'Focus radius', token: '--ds-radius-xs' },
    { property: 'Transition', token: '--ds-duration-fast + --ds-ease-standard' },
  ],
  playground: {
    controls: [{ kind: 'text', key: 'label', label: 'Label' }, { kind: 'bool', key: 'icon', label: 'Leading plus' }, { kind: 'bool', key: 'disabled', label: 'Disabled' }],
    initial: { label: 'Add New User', icon: true, disabled: false },
    render: p => <LinkAction icon={p.icon ? Plus : undefined} disabled={!!p.disabled} className={p.disabled ? 'doc-disabled' : undefined}>{String(p.label)}</LinkAction>,
    code: p => `<LinkAction${p.icon ? ' icon={Plus}' : ''}${p.disabled ? ' disabled' : ''}>${p.label}</LinkAction>`,
  },
  usage: `<LinkAction icon={Plus} onClick={openAddUser}>Add New User</LinkAction>`,
  behavior: <ul className="doc-list"><li>A <code>&lt;button&gt;</code> (it performs an action, it does not navigate); Enter and Space activate. Do not use brand blue (#3b82f6) for this text: it measures 4.05:1 on cards (§9.1).</li></ul>,
};

export const actionGroupDoc: ComponentDoc = {
  path: '/components/action-group', title: 'Action Group', refs: ['5.4'], provenance: 'OBSERVED',
  summary: 'Rows of related actions whose context sets gap, alignment and order: header (search → filters → primary, 12 apart), drawer footer (secondary at the start, helper + primary at the end), modal (secondary 120 then primary 180, 16 apart, end-aligned). The split button is an extension.',
  preview: () => (
    <div className="doc-stack doc-full">
      <div className="ds-page-header__actions">
        <SearchInput value="" onValueChange={() => {}} label="Filter factories or units" placeholder="Filter factories or units..." width="sm" />
        <Select variant="filter" className="ds-select--180" label="Status" value="All Status" onChange={() => {}} searchable={false} options={['All Status', 'Active', 'Warning', 'Offline'].map(v => ({ value: v, label: v }))} />
        <Button leading={Plus} minWidth>Add camera</Button>
      </div>
      <div className="ds-panel__footer">
        <Button variant="secondary" leading={ArrowBack}>Back</Button>
        <div className="ds-panel__footer-end"><p className="ds-panel__note" role="status">Auto-saved draft 12s ago</p><Button trailing={ChevronRight} minWidth>Next: Configuration</Button></div>
      </div>
    </div>
  ),
  variants: () => (
    <Grid min={300}>
      <Cell label="Header actions" note="gap 12 (space-header-actions)"><div className="ds-page-header__actions"><Button variant="secondary" leading={Export}>Export</Button><Button leading={Plus}>Add user</Button></div></Cell>
      <Cell label="Modal actions" note="secondary min 120, primary 180, gap 16, end"><div className="ds-modal__footer doc-full"><Button variant="secondary">Skip</Button><Button minWidth>Add Camera</Button></div></Cell>
      <Cell label="Confirmation dialog" note="gap 12, end (§5.45)"><div className="ds-dialog__actions doc-full"><Button variant="secondary">Cancel</Button><Button variant="danger">Delete</Button></div></Cell>
      <Cell label="Drawer footer" note="space-between; helper 12px text-tertiary"><div className="ds-panel__footer doc-full"><Button variant="secondary" leading={ArrowBack}>Cancel</Button><div className="ds-panel__footer-end"><Button trailing={ChevronRight} minWidth>Save product</Button></div></div></Cell>
      <Cell label="Row actions" note="32px buttons, gap 16, end"><span className="ds-row-actions"><IconButton icon={Copy} size="compact" label="Copy email" /><IconButton icon={Edit} size="compact" label="Edit user" /><IconButton icon={Trash} size="compact" label="Delete user" /></span></Cell>
      <Cell label="Split button [EXTENSION]" note="toggle 40 wide, border-on-brand divider"><div className="ds-split"><Button leading={Export}>Export</Button><button type="button" className="ds-btn ds-btn--primary ds-split__toggle" aria-label="More export options" aria-haspopup="menu"><ChevronSmall size={14} aria-hidden="true" /></button></div></Cell>
    </Grid>
  ),
  staticComponent: 'An action group has no states of its own; each member keeps its own states (§5.54).',
  anatomy: {
    render: () => (
      <div className="ds-panel__footer doc-narrow-xxl" data-part="container">
        <span data-part="secondary" className="ds-contents"><Button variant="secondary" leading={ArrowBack}>Back</Button></span>
        <div className="ds-panel__footer-end"><p className="ds-panel__note" data-part="note">Auto-saved draft 12s ago</p><span data-part="primary" className="ds-contents"><Button trailing={ChevronRight} minWidth>Next</Button></span></div>
      </div>
    ),
    parts: [
      { part: 'container', label: 'Drawer footer group', spec: 'space-between · gap 12 · padding 20 24 · gradient-glass-up · 1px border-faint top' },
      { part: 'secondary', label: 'Secondary (inline-start)', spec: 'Back / Cancel with a 20px back arrow' },
      { part: 'note', label: 'Helper text', spec: '12/16 text-tertiary ("Auto-saved draft …"), role=status' },
      { part: 'primary', label: 'Primary (inline-end)', spec: '180px min-width, trailing 14px chevron' },
    ],
  },
  spec: [
    { property: 'Header action gap', token: '--ds-space-header-actions' },
    { property: 'Modal action gap / row-action gap', token: '--ds-space-4' },
    { property: 'Confirm dialog / drawer footer gap', token: '--ds-space-3' },
    { property: 'Primary min width', token: '--ds-size-header-button' },
    { property: 'Modal secondary min width', value: '120px', note: ' (spec literal, §5.44)' },
    { property: 'Split toggle width / divider', token: '--ds-size-control + --ds-color-border-on-brand' },
  ],
  playground: {
    controls: [{ kind: 'select', key: 'ctx', label: 'Context', options: ['Header', 'Modal', 'Confirm dialog', 'Drawer footer', 'Row actions'] }],
    initial: { ctx: 'Modal' },
    render: p => p.ctx === 'Header' ? <div className="ds-page-header__actions"><Button variant="secondary" leading={Export}>Export</Button><Button leading={Plus} minWidth>Add user</Button></div>
      : p.ctx === 'Modal' ? <div className="ds-modal__footer doc-narrow-xxl"><Button variant="secondary">Skip</Button><Button minWidth>Add Camera</Button></div>
      : p.ctx === 'Confirm dialog' ? <div className="ds-dialog__actions doc-narrow-xl"><Button variant="secondary">Cancel</Button><Button variant="danger">Delete</Button></div>
      : p.ctx === 'Drawer footer' ? <div className="ds-panel__footer doc-narrow-xxl"><Button variant="secondary" leading={ArrowBack}>Back</Button><div className="ds-panel__footer-end"><Button trailing={ChevronRight} minWidth>Next</Button></div></div>
      : <span className="ds-row-actions"><IconButton icon={Copy} size="compact" label="Copy email" /><IconButton icon={Edit} size="compact" label="Edit user" /><IconButton icon={Trash} size="compact" label="Delete user" /></span>,
    code: p => p.ctx === 'Header' ? '<div className="ds-page-header__actions">\n  <Button variant="secondary" leading={Export}>Export</Button>\n  <Button leading={Plus} minWidth>Add user</Button>\n</div>'
      : p.ctx === 'Modal' ? '<div className="ds-modal__footer">\n  <Button variant="secondary">Skip</Button>\n  <Button minWidth>Add Camera</Button>\n</div>'
      : p.ctx === 'Confirm dialog' ? '<div className="ds-dialog__actions">\n  <Button variant="secondary">Cancel</Button>\n  <Button variant="danger">Delete</Button>\n</div>'
      : p.ctx === 'Drawer footer' ? '<div className="ds-panel__footer">\n  <Button variant="secondary" leading={ArrowBack}>Back</Button>\n  <div className="ds-panel__footer-end"><Button trailing={ChevronRight} minWidth>Next</Button></div>\n</div>'
      : '<span className="ds-row-actions">…three compact IconButtons…</span>',
  },
  usage: `<div className="ds-modal__footer">\n  <Button variant="secondary" onClick={onClose}>Skip</Button>\n  <Button minWidth onClick={submit}>Add Camera</Button>\n</div>`,
  behavior: <ul className="doc-list"><li>DOM order equals visual order (secondary before primary) so Tab follows reading order; groups wrap instead of overflowing.</li><li>The split toggle is a separate button with its own <code>aria-label</code> and <code>aria-haspopup="menu"</code>.</li></ul>,
};

import { useRef, useState } from 'react';
import { Info, SlidersHorizontal } from 'lucide-react';
import { Button, IconButton } from '../../components/ds/Button';
import { ConfirmDialog, Modal, Popover, SlidePanel } from '../../components/ds/Overlay';
import { Field, TextInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { RichPicker } from '../../components/ds/Inputs2';
import { Illustration, Stepper } from '../../components/ds/Display';
import { ArrowBack, ChevronRight, Trash } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';
import { Tooltip } from '../../components/ds/Tooltip';
import { Cell, Grid } from '../kit';
import type { ComponentDoc } from '../ComponentPage';
import { FACTORIES, PICKER_PEOPLE } from '../../apps/vision/data';

const opts = (xs: string[]) => xs.map(v => ({ value: v, label: v }));

/* Frame 5 · "Add Cameras" modal (shortened to two fields). */
function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [ip, setIp] = useState('');
  const [tried, setTried] = useState(false);
  const close = () => { setOpen(false); setId(''); setIp(''); setTried(false); };
  const ipErr = tried && !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip.trim()) ? 'Enter a valid IPv4 address.' : undefined;
  const idErr = tried && !id.trim() ? 'Enter the camera ID.' : undefined;
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Add Cameras</Button>
      <Modal open={open} onClose={close} title="Add Cameras" icon={<Illustration name="illus.camera" size={32} />} dirty={!!(id || ip)}
        footer={<><Button variant="secondary" onClick={close}>Skip</Button><Button minWidth onClick={() => { setTried(true); if (id.trim() && /^\d{1,3}(\.\d{1,3}){3}$/.test(ip.trim())) { close(); toast('Camera added'); } }}>Add Camera</Button></>}>
        <div className="ds-form-grid">
          <Field caps label="Camera ID" required error={idErr}><TextInput placeholder="e.g. - CAM01 - L01" value={id} onChange={e => setId(e.target.value)} /></Field>
          <Field caps label="Camera IP" required error={ipErr}><TextInput placeholder="e.g. - 192.168.1.101" inputMode="decimal" value={ip} onChange={e => setIp(e.target.value)} /></Field>
        </div>
      </Modal>
    </>
  );
}
function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" leading={Trash} onClick={() => setOpen(true)}>Delete user</Button>
      <ConfirmDialog open={open} title="Delete Anita Sharma?" message="Anita Sharma will lose access to every factory immediately. This can't be undone." confirmLabel="Delete user"
        onCancel={() => setOpen(false)} onConfirm={() => { setOpen(false); toast('Anita Sharma deleted', { action: { label: 'Undo', onAction: () => toast('Anita Sharma restored') } }); }} />
    </>
  );
}
export const StaticModal = () => (
  <div className="ds-modal doc-static-dialog" data-part="container">
    <div className="ds-modal__header" data-part="header"><div className="ds-modal__titlegroup"><Illustration name="illus.camera" size={32} /><p className="ds-modal__title">Add Cameras</p></div><span className="ds-icon-btn ds-icon-btn--close ds-icon-btn--compact" aria-hidden="true">×</span></div>
    <div className="ds-modal__body" data-part="body"><div className="ds-form-grid"><div className="ds-field ds-field--caps"><span className="ds-field__label">Camera ID</span><span className="ds-input doc-static-input" /></div><div className="ds-field ds-field--caps"><span className="ds-field__label">Camera IP</span><span className="ds-input doc-static-input" /></div></div></div>
    <div className="ds-modal__footer" data-part="footer"><span className="ds-btn ds-btn--secondary">Skip</span><span className="ds-btn ds-btn--primary ds-btn--minw">Add Camera</span></div>
  </div>
);
export const modalDoc: ComponentDoc = {
  path: '/components/modals', title: 'Modals & Dialogs', refs: ['5.44', '5.45'], provenance: 'STANDARDIZED',
  summary: 'Figma "Add Cameras": a black/50% scrim with a 4px backdrop blur that covers the whole shell, sidebar included (R-12); the modal is gradient-dialog, radius 12, padding 24, sections 28px apart, no border, shadow-modal. Header: 32px illustration + modal-title 14/18 400, a 32px close, 20px bottom padding over a white/5% divider; form rows 40px apart, columns 20; actions end-aligned (secondary 120, primary 180, 16 apart). Width 720 (sm 440). Backdrop clicks never close; Escape closes, or asks "Discard changes?" when there are unsaved edits. Confirmation dialogs (§5.45, DEOC ConfirmDialog) are 440px alertdialogs (radius 16, 1px border-subtle) with Cancel focused.',
  preview: () => <div className="ds-cluster"><ModalDemo /><ConfirmDemo /></div>,
  variants: () => (
    <Grid min={300}>
      <Cell label="form modal · md 720 (static render)"><StaticModal /></Cell>
      <Cell label="confirmation dialog · 440 [PRESERVED] (static render)">
        <div className="ds-dialog doc-static-dialog" role="presentation">
          <div className="ds-dialog__text"><p className="ds-text-dialog-title">Delete Anita Sharma?</p><p className="ds-text-body-muted">Anita Sharma will lose access to every factory immediately. This can't be undone.</p></div>
          <div className="ds-dialog__actions"><span className="ds-btn ds-btn--secondary">Cancel</span><span className="ds-btn ds-btn--danger">Delete user</span></div>
        </div>
      </Cell>
    </Grid>
  ),
  unsupported: ['closing on backdrop click (§5.44)', 'enter / exit slide or scale animations (overlays appear instantly, §2.9)', 'a bordered or 24px-radius modal (the Figma modal has no border, radius 12)'],
  spec: [
    { property: 'Scrim / blur', token: '--ds-color-scrim + --ds-overlay-blur' },
    { property: 'Modal width (md / sm)', token: '--ds-size-modal + --ds-size-dialog' },
    { property: 'Fill', token: '--ds-gradient-dialog' }, { property: 'Radius', token: '--ds-radius-control' },
    { property: 'Padding / section gap', token: '--ds-space-card-xl + 28px' }, { property: 'Shadow', token: '--ds-shadow-modal' },
    { property: 'Header divider / bottom padding', token: '--ds-color-border-faint + --ds-space-5' },
    { property: 'Title', token: '--ds-color-text-primary', note: ' modal-title 14/18 400; 32px illustration, 12px gap' },
    { property: 'Close button', token: '--ds-size-icon-button-compact + --ds-shadow-close' },
    { property: 'Form rows / columns', token: '--ds-space-form-row + --ds-space-form-col' },
    { property: 'Footer gap / primary min width', token: '--ds-space-4 + --ds-size-header-button', note: ' secondary min 120px' },
    { property: 'Confirm dialog padding / gap', token: '--ds-space-6' }, { property: 'Confirm dialog shadow', token: '--ds-shadow-modal + --ds-shadow-highlight' },
    { property: 'Z-index', token: '--ds-z-overlay' },
  ],
  behavior: <ul className="doc-list"><li>Overlays portal into <code>#ds-overlay-host</code> on the shell, so the scrim covers the sidebar too (R-12); below 1024px they are fixed to the viewport.</li><li><code>role="dialog" aria-modal="true" aria-labelledby</code> the title; everything outside is made <code>inert</code>. Initial focus goes to the first form field (or the first focusable element); Tab and Shift+Tab cycle inside.</li><li>Backdrop clicks never close. Escape closes when clean; when dirty it opens "Discard changes?" with Keep Editing focused.</li><li>Close returns focus to the opener, or to the page <code>h1</code> when the opener is gone.</li><li>Confirmation dialogs are <code>role="alertdialog"</code> with Cancel focused; Escape = Cancel.</li><li>Try it: open "Add Cameras", type an ID, press Escape.</li></ul>,
  usage: `<Modal open={open} onClose={close} title="Add Cameras" icon={<Illustration name="illus.camera" size={32} />} dirty={changed}\n  footer={<><Button variant="secondary" onClick={close}>Skip</Button><Button minWidth onClick={submit}>Add Camera</Button></>}>\n  <div className="ds-form-grid"><Field caps label="Camera ID" required>…</Field>…</div>\n</Modal>\n<ConfirmDialog open={open} title="Delete Anita Sharma?" message="…" confirmLabel="Delete user" onCancel={close} onConfirm={remove} />`,
};

/* Frame 3 · "Add New Factory" drawer: stepper, validation, auto-save note. */
const STEPS = [{ title: 'Basic Details', sub: 'In progress' }, { title: 'Configuration', sub: 'Lines & Sensors' }, { title: 'Review & Add', sub: 'Summary' }];
function PanelDemo() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [admin, setAdmin] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const nameErr = submitted && !name.trim() ? 'Enter the factory name.' : undefined;
  const regionErr = submitted && !region ? 'Choose a region.' : undefined;
  const reset = () => { setStep(0); setName(''); setRegion(null); setAdmin(null); setSubmitted(false); };
  const close = () => { setOpen(false); reset(); };
  const next = () => {
    setSubmitted(true);
    if (!name.trim() || !region) { window.setTimeout(() => document.querySelector<HTMLElement>('.ds-panel [aria-invalid="true"]')?.focus(), 0); return; }
    if (step < 2) { setStep(step + 1); setSubmitted(false); } else { close(); toast(`${name} added`); }
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Add factory</Button>
      <SlidePanel open={open} onClose={close} title="Add New Factory" size="xl" dirty={!!name || !!region || !!admin}
        subtitle={step > 0 ? 'Provision and integrate a new operational manufacturing unit.' : undefined}
        icon={<Illustration name="illus.facility-set" crop="factory" size={40} />} subheader={<Stepper current={step} steps={STEPS} />}
        footer={<>
          <Button variant="secondary" leading={ArrowBack} onClick={() => (step ? setStep(step - 1) : close())}>Back</Button>
          <div className="ds-panel__footer-end"><p className="ds-panel__note" role="status">Auto-saved draft 12s ago</p><Button trailing={ChevronRight} minWidth onClick={next}>{step === 0 ? 'Next: Configuration' : step === 1 ? 'Review & Add' : 'Add factory'}</Button></div>
        </>}>
        {step === 0 ? (
          <div className="ds-form-grid">
            <Field label="Factory Name" required error={nameErr} className="ds-span-all"><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Enter factory name" /></Field>
            <Field label="Location / City"><TextInput placeholder="Enter location" /></Field>
            <Field label="Assigned Region" required error={regionErr}><Select options={opts(['West', 'North', 'South', 'East'])} value={region} onChange={setRegion} placeholder="Enter region name" searchable={false} /></Field>
            <Field label="Factory Admin / Plant Manager" className="ds-span-all"><RichPicker people={PICKER_PEOPLE} value={admin} onChange={setAdmin} /></Field>
          </div>
        ) : <p className="ds-text-body-muted">{step === 1 ? 'Lines and their cameras for this factory.' : `Review ${name} before adding it.`}</p>}
      </SlidePanel>
    </>
  );
}
export const drawerDoc: ComponentDoc = {
  path: '/components/drawers', title: 'Drawers & Slide Panels', refs: ['5.46'], provenance: 'STANDARDIZED',
  summary: 'DEOC SlidePanel (Add New Factory, Add Product, Add Line): full height at the inline-end, edge-attached with no radius; body gradient-app, 1px border-subtle start edge, shadow-drawer, no sheen. Header: gradient-glass over a border-subtle divider, padding 20 24 (28 24 33 with a stepper), illustration + 12px + dialog-title 20/28 700 and a 36px close (sunken, debossed); optional stepper 48px below. Body padding 24, scrolls. Footer: gradient-glass-up, padding 20 24; Back / Cancel with a 20px arrow at the start, helper note (12px text-tertiary) + 180px primary with a trailing chevron at the end. Sizes 480 / 560 / 680 / 820 are maximums; the header gains a shadow while the body scrolls.',
  preview: () => <PanelDemo />,
  variants: () => (
    <Grid min={200}>
      {(['sm', 'md', 'lg', 'xl'] as const).map(s => <Cell key={s} label={s} note={{ sm: '480', md: '560 (default)', lg: '680', xl: '820 · multi-step and two-column forms (Figma)' }[s]}><PanelSize size={s} /></Cell>)}
    </Grid>
  ),
  spec: [
    { property: 'Widths (max)', token: '--ds-size-panel-sm + --ds-size-panel-md + --ds-size-panel-lg + --ds-size-panel-xl' },
    { property: 'Body fill', token: '--ds-color-bg-app + --ds-gradient-app' },
    { property: 'Start edge / shadow', token: '--ds-color-border-faint + --ds-shadow-drawer', note: ' RTL: shadow-drawer-mirrored' },
    { property: 'Header fill / divider', token: '--ds-gradient-glass + --ds-color-border-track' },
    { property: 'Header padding', token: '--ds-space-5 + --ds-space-6', note: ' (28 24 33 with a stepper)' },
    { property: 'Title illustration / close', token: '--ds-size-entity-icon + --ds-size-icon-button', note: ' title dialog-title 20/28 700' },
    { property: 'Title row → stepper', token: '--ds-space-12' },
    { property: 'Body padding / section gap', token: '--ds-space-6 + 28px' },
    { property: 'Footer fill / divider', token: '--ds-gradient-glass-up + --ds-color-border-faint' },
    { property: 'Footer padding', token: '--ds-space-5 + --ds-space-6' },
    { property: 'Footer note', token: '--ds-color-text-tertiary', note: ' 12/16' },
    { property: 'Scrim / scrolled header', token: '--ds-color-scrim + --ds-shadow-header-scrolled' },
    { property: 'Form grid', token: '--ds-space-form-col + --ds-space-form-row' },
  ],
  behavior: <ul className="doc-list"><li>Same overlay contract as §5.44: scrim over the whole shell, inert background, focus on the first form field, Tab trapped, backdrop clicks do nothing, Escape closes or asks to discard when dirty, focus returns to the opener.</li><li>On Next with empty required fields, errors appear and focus moves to the first invalid field.</li><li>The auto-save note is a polite <code>role="status"</code>.</li><li>Try it: open the panel, press "Next: Configuration" with empty fields, type a name, then press Escape.</li></ul>,
  usage: `<SlidePanel open={open} onClose={close} size="xl" title="Add New Factory" dirty={dirty}\n  icon={<Illustration name="illus.facility-set" crop="factory" size={40} />} subheader={<Stepper steps={steps} current={step} />}\n  footer={<><Button variant="secondary" leading={ArrowBack}>Back</Button><div className="ds-panel__footer-end"><p className="ds-panel__note">Auto-saved draft 12s ago</p><Button trailing={ChevronRight} minWidth>Next: Configuration</Button></div></>}>\n  <div className="ds-form-grid">…</div>\n</SlidePanel>`,
};
function PanelSize({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Open {size}</Button>
      <SlidePanel open={open} onClose={() => setOpen(false)} title="Add Product" icon={<Illustration name="illus.catalog-item" size={36} />} size={size}
        footer={<><Button variant="secondary" leading={ArrowBack} onClick={() => setOpen(false)}>Cancel</Button><Button trailing={ChevronRight} minWidth onClick={() => setOpen(false)}>Save product</Button></>}>
        <p className="ds-text-body-muted">This panel is <code>min(var(--ds-size-panel-{size}), 100%)</code> wide.</p>
      </SlidePanel>
    </>
  );
}

function PopoverDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const [factory, setFactory] = useState<string | null>(null);
  return (
    <div className="ds-select">
      <Button ref={ref} variant="secondary" leading={SlidersHorizontal} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(o => !o)}>Filters</Button>
      <Popover open={open} onClose={() => setOpen(false)} label="Filters" anchorRef={ref} align="start" width="sm"
        footer={<><Button variant="ghost" size="sm" onClick={() => { setFactory(null); setOpen(false); ref.current?.focus(); }}>Clear</Button><Button size="sm" onClick={() => { setOpen(false); ref.current?.focus(); toast('Filters applied'); }}>Apply</Button></>}>
        <Field label="Factory"><Select options={opts(FACTORIES.map(f => f.name))} value={factory} onChange={setFactory} placeholder="All factories" /></Field>
      </Popover>
    </div>
  );
}
export const tooltipDoc: ComponentDoc = {
  path: '/components/tooltips-popovers', title: 'Tooltips & Popovers', refs: ['5.49', '5.47'], provenance: 'STANDARDIZED', derivedCss: true,
  summary: 'Label tooltips name icon-only buttons and recover truncated text: gradient-tooltip, 1px border-glass, radius 8, shadow-tooltip, padding 6 10, 12/16 text-tooltip, max 280px. Shown after 300ms hover and immediately on keyboard focus, kept while the pointer is over them, dismissed with Escape (SC 1.4.13); rendered in a body-level layer (z-label-tooltip). Popovers (§5.47) hold small forms: surface-raised, no border, radius 8, shadow-float, padding 16, gap 16, 4px below the trigger; non-modal, closed by Escape or an outside click.',
  preview: () => (
    <div className="ds-cluster">
      <Tooltip content="Lines running out of total lines, across all factories."><button type="button" className="ds-btn ds-btn--ghost"><Info size={14} aria-hidden="true" />Hover or focus me</button></Tooltip>
      <IconButton icon={Trash} label="Delete Anita Sharma" size="compact" />
      <PopoverDemo />
    </div>
  ),
  variants: () => (
    <Grid min={280}>
      <Cell label="label tooltip (static render)"><span className="ds-tooltip ds-tooltip--static">Delete Anita Sharma</span></Cell>
      <Cell label="rich chart tooltip (§7.9) — see Data Visualization"><a className="ds-link-action" href="#/charts/tooltips-legends">Chart tooltips & legends</a></Cell>
      <Cell label="popover (form) [PRESERVED]"><PopoverDemo /></Cell>
    </Grid>
  ),
  unsupported: ['interactive content inside tooltips (use a popover)', 'tooltips as the only source of essential information on touch'],
  spec: [
    { property: 'Fill / border', token: '--ds-gradient-tooltip + --ds-color-border-glass' },
    { property: 'Text', token: '--ds-color-text-tooltip', note: ' 12/16' },
    { property: 'Radius / shadow', token: '--ds-radius-sm + --ds-shadow-tooltip' },
    { property: 'Padding', token: '--ds-space-1-5 + --ds-space-2-5' },
    { property: 'Max width', value: '280px' },
    { property: 'Show delay', value: '300ms on hover · immediate on focus' },
    { property: 'Z-index (label tooltip)', token: '--ds-z-label-tooltip' },
    { property: 'Popover fill / border', token: '--ds-color-surface-raised + --ds-color-border-glass' },
    { property: 'Popover radius / shadow', token: '--ds-radius-control + --ds-shadow-float' },
    { property: 'Popover padding / gap / offset', token: '--ds-space-4 + --ds-space-1' },
    { property: 'Popover width (date / sm)', token: '--ds-size-popover-date + 280px' },
    { property: 'Z-index (popover)', token: '--ds-z-menu' },
  ],
  behavior: <ul className="doc-list"><li>Tooltip: <code>role="tooltip"</code>, linked by <code>aria-describedby</code> (or used only as the visible name when the trigger already has an <code>aria-label</code>); <code>title</code> is never the only source.</li><li>Hover (300ms) or focus shows; Escape hides without moving focus; the pointer may move onto the tooltip; truncation tooltips appear only when text is actually truncated.</li><li>Popover: non-modal <code>role="dialog"</code> labelled by the trigger name; Escape and outside click close; Apply commits; focus returns to the trigger.</li></ul>,
  usage: `<Tooltip content="Delete Anita Sharma"><button aria-label="Delete Anita Sharma">…</button></Tooltip>\n<Popover open={open} onClose={close} label="Filters" anchorRef={triggerRef} width="sm" footer={…}>…</Popover>`,
};

export const toastDoc: ComponentDoc = {
  path: '/components/toasts', title: 'Toasts', refs: ['5.48'], provenance: 'STANDARDIZED',
  summary: 'A short confirmation at the top centre of the main panel (bottom at xs): surface-raised, 1px border-subtle, radius 8, shadow-elevated, padding 10 16, toast 14/20 text-primary, max 480px; optional action and close. Announced politely in a persistent role="status" region; one at a time, a new toast replaces the current one; paused on hover and focus. §5.48 sets a 4s timeout.',
  preview: () => (
    <div className="ds-cluster">
      <Button variant="secondary" onClick={() => toast('Factory 7 added')}>Neutral toast</Button>
      <Button variant="secondary" onClick={() => toast("Couldn't export users: network error", { tone: 'error' })}>Error toast</Button>
      <Button variant="secondary" onClick={() => toast('Anita Sharma deleted', { action: { label: 'Undo', onAction: () => toast('Anita Sharma restored') } })}>Toast with Undo</Button>
    </div>
  ),
  variants: () => (
    <Grid min={260}>
      <Cell label="neutral (static render)"><div className="ds-toast doc-static-toast">Factory 7 added</div></Cell>
      <Cell label="error (static render)"><div className="ds-toast ds-toast--error doc-static-toast"><Info size={16} aria-hidden="true" />Couldn't export users</div></Cell>
    </Grid>
  ),
  spec: [
    { property: 'Fill / border', token: '--ds-color-surface-raised + --ds-color-border-subtle' }, { property: 'Shadow', token: '--ds-shadow-elevated' },
    { property: 'Radius', token: '--ds-radius-sm' }, { property: 'Padding', token: '--ds-space-2-5 + --ds-space-4' },
    { property: 'Text', token: '--ds-color-text-primary', note: ' toast 14/20' }, { property: 'Error icon', token: '--ds-color-danger-text' },
    { property: 'Max width', value: '480px' }, { property: 'Offset from the panel top', token: '--ds-space-6' }, { property: 'Z-index', token: '--ds-z-toast' },
  ],
  behavior: <ul className="doc-list"><li>Text is inserted into a <code>role="status"</code> region that exists from page load, so it is announced politely; toasts never steal focus.</li><li>The timer pauses while the toast is hovered or focused. A toast with an action stays until it is used or dismissed (SC 2.2.1).</li></ul>,
  notes: <p className="ds-text-body-muted">Implementation note: the showcase <code>ToastRegion</code> times out after 2500ms (5000ms for errors) rather than the 4s in §5.48, announces errors through the same status region instead of <code>role="alert"</code>, and has no success tone although §5.48's CSS styles <code>.ds-toast--success</code>.</p>,
  usage: `toast('Factory 7 added');\ntoast("Couldn't export users", { tone: 'error' });\ntoast('Anita Sharma deleted', { action: { label: 'Undo', onAction: undo } });`,
};

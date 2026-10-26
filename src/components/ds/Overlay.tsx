import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Minimize2 } from 'lucide-react';
import { IconButton } from './Button';
import { Icon } from './Icon';

/*
  §5.44 / §5.55 overlay contract.
  - mounts on the shell (#ds-overlay-host) so the scrim covers the sidebar too (Figma, R-12); fixed to the viewport below 1024px (CSS);
  - everything outside the overlay is made inert ([data-inert-scope]);
  - focus moves to the initial target, Tab cycles inside, Escape closes unless dirty (then asks to discard);
  - backdrop clicks do nothing (R-21); focus returns to the opener, or to a fallback if the opener is gone.
*/
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let openCount = 0;

function setInert(on: boolean) {
  document.querySelectorAll<HTMLElement>('[data-inert-scope]').forEach(el => { el.inert = on; });
}

export function overlayHost(): HTMLElement {
  return document.getElementById('ds-overlay-host') ?? document.getElementById('ds-main') ?? document.body;
}

/** Resolve the host after mount: an overlay rendered open on first paint would otherwise portal to <body> before the shell exists. */
function useOverlayHost(open: boolean) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => { if (open) setHost(overlayHost()); }, [open]);
  return open ? host : null;
}

function useOverlay({ open, onRequestClose, dirty, initialFocus, rootRef, fallbackFocus }: {
  open: boolean; onRequestClose: () => void; dirty?: boolean; initialFocus?: RefObject<HTMLElement | null>; rootRef: RefObject<HTMLElement | null>; fallbackFocus?: () => HTMLElement | null;
}) {
  const opener = useRef<HTMLElement | null>(null);
  const [confirming, setConfirming] = useState(false);

  useLayoutEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    openCount++;
    setInert(true);
    // §5.55: forms focus their first field; otherwise the first focusable element (or the dialog itself).
    const target = initialFocus?.current ?? rootRef.current?.querySelector<HTMLElement>(':is(.ds-panel__body, .ds-modal__body) :is(input:not([type=file]):not([disabled]), textarea, [role=combobox], select)') ?? rootRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? rootRef.current;
    target?.focus();
    return () => {
      openCount--;
      if (openCount === 0) setInert(false);
      const o = opener.current;
      const back = o && o.isConnected ? o : fallbackFocus?.() ?? document.querySelector<HTMLElement>('h1[tabindex="-1"]');
      window.setTimeout(() => back?.focus(), 0);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (confirming) { setConfirming(false); return; }
      if (dirty) setConfirming(true); else onRequestClose();
      return;
    }
    if (e.key !== 'Tab' || !rootRef.current) return;
    const scope = (confirming ? rootRef.current.querySelector<HTMLElement>('[role="alertdialog"]') : null) ?? rootRef.current;
    const items = [...scope.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return { onKeyDown, confirming, setConfirming };
}

function DiscardConfirm({ onKeep, onDiscard }: { onKeep: () => void; onDiscard: () => void }) {
  const keep = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => { keep.current?.focus(); }, []);
  return (
    <div className="ds-overlay" role="alertdialog" aria-modal="true" aria-labelledby="discard-t" aria-describedby="discard-d">
      <div className="ds-overlay__backdrop" aria-hidden="true" />
      <div className="ds-dialog">
        <div className="ds-dialog__text">
          <h2 id="discard-t" className="ds-text-dialog-title">Discard changes?</h2>
          <p id="discard-d" className="ds-text-body-muted">Your edits haven't been saved.</p>
        </div>
        <div className="ds-dialog__actions">
          <button ref={keep} type="button" className="ds-btn ds-btn--secondary" onClick={onKeep}>Keep Editing</button>
          <button type="button" className="ds-btn ds-btn--danger" onClick={onDiscard}>Discard</button>
        </div>
      </div>
    </div>
  );
}

/** §5.44 form modal (Figma "Add Cameras"): gradient-dialog, radius 12, compact title with a 32px illustration, compact close. */
export function Modal({ open, onClose, title, icon, children, footer, size = 'md', dirty, initialFocus }: {
  open: boolean; onClose: () => void; title: string; icon?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md'; dirty?: boolean; initialFocus?: RefObject<HTMLElement | null>;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const host = useOverlayHost(open);
  const { onKeyDown, confirming, setConfirming } = useOverlay({ open: open && !!host, onRequestClose: onClose, dirty, rootRef: root, initialFocus });
  if (!open || !host) return null;
  return createPortal(
    <div ref={root} className="ds-overlay" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="ds-overlay__backdrop" aria-hidden="true" />
      <div className={`ds-modal${size === 'sm' ? ' ds-modal--sm' : ''}`} data-part="container">
        <div className="ds-modal__header" data-part="header">
          <div className="ds-modal__titlegroup">
            {icon}
            <h2 id={id} className="ds-modal__title">{title}</h2>
          </div>
          <IconButton label="Close" variant="close" size="compact" onClick={() => (dirty ? setConfirming(true) : onClose())} tooltip={false} />
        </div>
        <div className="ds-modal__body" data-part="body">{children}</div>
        {footer && <div className="ds-modal__footer" data-part="footer">{footer}</div>}
      </div>
      {confirming && <DiscardConfirm onKeep={() => setConfirming(false)} onDiscard={() => { setConfirming(false); onClose(); }} />}
    </div>,
    host,
  );
}

/** §5.45 confirmation dialog: alertdialog, Cancel autofocused, danger action. */
export function ConfirmDialog({ open, title, message, confirmLabel, onCancel, onConfirm, tone = 'danger', fallbackFocus }: {
  open: boolean; title: string; message: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; tone?: 'danger' | 'primary'; fallbackFocus?: () => HTMLElement | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const tid = useId(), did = useId();
  const host = useOverlayHost(open);
  const { onKeyDown } = useOverlay({ open: open && !!host, onRequestClose: onCancel, rootRef: root, initialFocus: cancel, fallbackFocus });
  if (!open || !host) return null;
  return createPortal(
    <div ref={root} className="ds-overlay" role="alertdialog" aria-modal="true" aria-labelledby={tid} aria-describedby={did} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="ds-overlay__backdrop" aria-hidden="true" />
      <div className="ds-dialog" data-part="container">
        <div className="ds-dialog__text" data-part="text">
          <h2 id={tid} className="ds-text-dialog-title">{title}</h2>
          <p id={did} className="ds-text-body-muted">{message}</p>
        </div>
        <div className="ds-dialog__actions" data-part="actions">
          <button ref={cancel} type="button" className="ds-btn ds-btn--secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className={`ds-btn ds-btn--${tone}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    host,
  );
}

/** §5.46 slide panel (drawer). */
export function SlidePanel({ open, onClose, title, subtitle, icon, children, footer, size = 'md', dirty, subheader, onBack, initialFocus, fallbackFocus }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; icon?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
  dirty?: boolean; subheader?: ReactNode; onBack?: () => void; initialFocus?: RefObject<HTMLElement | null>; fallbackFocus?: () => HTMLElement | null;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [more, setMore] = useState(false);
  const host = useOverlayHost(open);
  const { onKeyDown, confirming, setConfirming } = useOverlay({ open: open && !!host, onRequestClose: onClose, dirty, rootRef: root, initialFocus, fallbackFocus });
  useEffect(() => { if (!open) setScrolled(false); }, [open]);
  // Footer shadow while more of the body sits below the fold; re-checked on scroll, resize and content changes (steps)
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const update = () => setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update); resize.observe(el);
    const mutations = new MutationObserver(update); mutations.observe(el, { childList: true, subtree: true });
    return () => { el.removeEventListener('scroll', update); resize.disconnect(); mutations.disconnect(); };
  }, [open, host]);
  if (!open || !host) return null;
  return createPortal(
    <div ref={root} className="ds-overlay ds-overlay--panel" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="ds-overlay__backdrop" aria-hidden="true" />
      <aside className={`ds-panel ds-panel--${size}`} data-part="panel">
        <div className={`ds-panel__header${scrolled ? ' ds-panel__header--scrolled' : ''}`} data-part="header">
          <div className="ds-panel__titlerow">
            <div className="ds-panel__titlegroup">
              {onBack && <IconButton icon={ArrowLeft} label="Back" onClick={onBack} />}
              {icon && <span className="ds-panel__icon" aria-hidden="true">{icon}</span>}
              <div className="ds-panel__titles">
                <h2 id={id} className="ds-text-dialog-title">{title}</h2>
                {subtitle && <p className="ds-text-body-muted">{subtitle}</p>}
              </div>
            </div>
            <IconButton label="Close panel" variant="close" onClick={() => (dirty ? setConfirming(true) : onClose())} tooltip={false} />
          </div>
          {subheader}
        </div>
        <div ref={body} className="ds-panel__body" data-part="body" onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 0)}>{children}</div>
        {footer && <div className={`ds-panel__footer${more ? ' ds-panel__footer--more' : ''}`} data-part="footer">{footer}</div>}
      </aside>
      {confirming && <DiscardConfirm onKeep={() => setConfirming(false)} onDiscard={() => { setConfirming(false); onClose(); }} />}
    </div>,
    host,
  );
}

/** §5.36 media viewer: the camera frame at object-fit contain, with the tile's header. */
export function MediaViewer({ open, onClose, title, sub, badge, src, footer }: {
  open: boolean; onClose: () => void; title: string; sub: string; badge?: ReactNode; src: string; footer?: ReactNode;
}) {
  const hid = useId();
  const root = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const host = useOverlayHost(open);
  const { onKeyDown } = useOverlay({ open: open && !!host, onRequestClose: onClose, rootRef: root, initialFocus: closeRef });
  if (!open || !host) return null;
  return createPortal(
    <div ref={root} className="ds-overlay" role="dialog" aria-modal="true" aria-labelledby={hid} tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="ds-overlay__backdrop" aria-hidden="true" />
      <div className="ds-viewer">
        <div className="ds-media-card__head">
          <span className="ds-media-card__titles"><h2 id={hid} className="ds-media-card__title">{title}</h2><span className="ds-media-card__sub">{sub}</span></span>
          {badge}
          <button ref={closeRef} type="button" className="ds-media-card__expand" aria-label="Close full view" onClick={onClose}><Icon icon={Minimize2} size={16} /></button>
        </div>
        <div className="ds-viewer__media"><img src={src} alt={`${title}, ${sub}`} /></div>
        {footer && <div className="ds-media-card__foot">{footer}</div>}
      </div>
    </div>,
    host,
  );
}

/** §5.47 popover (non-modal): role="dialog", Escape and outside click close, focus returns to the trigger. */
export function Popover({ open, onClose, label, children, footer, anchorRef, align = 'end', width }: {
  open: boolean; onClose: (reason: 'escape' | 'outside') => void; label: string; children: ReactNode; footer?: ReactNode;
  anchorRef: RefObject<HTMLElement | null>; align?: 'start' | 'end'; width?: 'date' | 'sm';
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) onClose('outside');
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  return (
    <div ref={ref} className={`ds-popover${align === 'start' ? ' ds-popover--start' : ''}${width === 'sm' ? ' ds-popover--sm' : ''}`} role="dialog" aria-label={label}
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose('escape'); anchorRef.current?.focus(); } }}
      onBlur={e => { if (!ref.current?.contains(e.relatedTarget as Node) && e.relatedTarget && !anchorRef.current?.contains(e.relatedTarget as Node)) onClose('outside'); }}
      data-part="container">
      {children}
      {footer && <div className="ds-popover__footer">{footer}</div>}
    </div>
  );
}


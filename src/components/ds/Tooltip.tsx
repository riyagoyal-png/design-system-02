import { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/*
  §5.49 / §5.55 label tooltip.
  hidden → pending (300ms hover) → shown → leaving (100ms grace) → hidden.
  Focus shows immediately; blur hides; Escape hides without moving focus; hovering the tooltip keeps it (SC 1.4.13).
  The tooltip element stays in the DOM while hidden so aria-describedby always resolves.
*/
let hideCurrent: (() => void) | null = null;

export function Tooltip({ content, children, describe = true, onlyWhenTruncated = false, placement = 'top' }: {
  content: ReactNode; children: ReactElement<Record<string, unknown>>; describe?: boolean; onlyWhenTruncated?: boolean; placement?: 'top' | 'bottom' | 'right';
}) {
  const id = useId();
  const anchor = useRef<HTMLElement | null>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
  const timer = useRef<number | undefined>(undefined);
  const overTip = useRef(false);
  const overAnchor = useRef(false);

  const hide = useCallback(() => { window.clearTimeout(timer.current); setOpen(false); }, []);
  const show = useCallback(() => {
    const el = anchor.current;
    if (!el) return;
    if (onlyWhenTruncated) {
      const t = (el.querySelector('[data-truncate]') as HTMLElement | null) ?? el;
      if (t.scrollWidth <= t.clientWidth && t.scrollHeight <= t.clientHeight + 1) return;
    }
    if (hideCurrent && hideCurrent !== hide) hideCurrent();
    hideCurrent = hide;
    setOpen(true);
  }, [hide, onlyWhenTruncated]);

  useLayoutEffect(() => {
    if (!open || !anchor.current || !tip.current) return;
    const a = anchor.current.getBoundingClientRect();
    const t = tip.current.getBoundingClientRect();
    const gap = 8;
    let top = placement === 'bottom' ? a.bottom + gap : placement === 'right' ? a.top + (a.height - t.height) / 2 : a.top - t.height - gap;
    let left = placement === 'right' ? a.right + gap : a.left + (a.width - t.width) / 2;
    if (top < 4) top = a.bottom + gap; // flip below
    if (top + t.height > window.innerHeight - 4) top = a.top - t.height - gap;
    left = Math.max(4, Math.min(left, window.innerWidth - t.width - 4));
    setPos({ top, left });
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); hide(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, hide]);

  const scheduleLeave = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { if (!overTip.current && !overAnchor.current) hide(); }, 100);
  };

  const child = cloneElement(children, {
    ref: (el: HTMLElement | null) => { anchor.current = el; },
    'aria-describedby': describe ? [children.props['aria-describedby'], id].filter(Boolean).join(' ') : children.props['aria-describedby'],
    onPointerEnter: (e: React.PointerEvent) => {
      (children.props.onPointerEnter as ((e: React.PointerEvent) => void) | undefined)?.(e);
      if (e.pointerType === 'touch') return;
      overAnchor.current = true; window.clearTimeout(timer.current); timer.current = window.setTimeout(show, 300);
    },
    onPointerLeave: (e: React.PointerEvent) => { (children.props.onPointerLeave as ((e: React.PointerEvent) => void) | undefined)?.(e); overAnchor.current = false; scheduleLeave(); },
    onFocus: (e: React.FocusEvent) => {
      (children.props.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
      if ((e.target as HTMLElement).matches?.(':focus-visible')) show();
    },
    onBlur: (e: React.FocusEvent) => { (children.props.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e); hide(); },
  });

  return (
    <>
      {child}
      {createPortal(
        <div ref={tip} id={id} role="tooltip" className="ds-tooltip" hidden={!open} style={{ top: pos.top, left: pos.left }}
          onPointerEnter={() => { overTip.current = true; window.clearTimeout(timer.current); }}
          onPointerLeave={() => { overTip.current = false; scheduleLeave(); }}>
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}

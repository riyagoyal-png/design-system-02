import { useEffect, useRef, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Icon } from './Icon';

/*
  §5.48 / §5.55 toasts. One at a time; a new toast replaces the current one.
  2500ms (5000ms for errors); the timer pauses on hover or focus; toasts with an action never time out (SC 2.2.1).
  Text is inserted into a persistent role="status" region that exists from page load.
*/
export interface ToastOptions { tone?: 'neutral' | 'error'; action?: { label: string; onAction: () => void } }
interface ToastState extends ToastOptions { id: number; message: string }

type Listener = (t: ToastState | null) => void;
let listener: Listener | null = null;
let seq = 0;

export function toast(message: string, opts: ToastOptions = {}) {
  listener?.({ id: ++seq, message, ...opts });
}

export function ToastRegion() {
  const [current, setCurrent] = useState<ToastState | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const paused = useRef(false);

  const arm = (t: ToastState | null) => {
    window.clearTimeout(timer.current);
    if (!t || t.action || paused.current) return;
    timer.current = window.setTimeout(() => setCurrent(c => (c?.id === t.id ? null : c)), t.tone === 'error' ? 5000 : 2500);
  };

  useEffect(() => {
    listener = t => { setCurrent(t); arm(t); };
    return () => { listener = null; };
  }, []);

  const pause = () => { paused.current = true; window.clearTimeout(timer.current); };
  const resume = () => { paused.current = false; arm(current); };

  return (
    <div className="ds-toast-region" role="status" aria-live="polite">
      {current && (
        <div key={current.id} className={`ds-toast${current.tone === 'error' ? ' ds-toast--error' : ''}`}
          onPointerEnter={pause} onPointerLeave={resume} onFocus={pause} onBlur={resume}>
          {current.tone === 'error' && <Icon icon={AlertCircle} size={16} />}
          <span>{current.message}</span>
          {current.action && (
            <>
              <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm ds-toast__action"
                onClick={() => { current.action!.onAction(); setCurrent(null); }}>{current.action.label}</button>
              <button type="button" className="ds-icon-btn ds-icon-btn--sm" aria-label="Dismiss" onClick={() => setCurrent(null)}>
                <Icon icon={X} size={14} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

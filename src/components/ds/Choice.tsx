import { useEffect, useRef, type ReactNode } from 'react';
import { CheckMark, IndeterminateMark, RadioGlyph } from './Icon';

/** §5.12 Checkbox: native input visually hidden behind a 16px box. */
export function Checkbox({ checked, indeterminate, onChange, children, disabled, label, className = '', id }: {
  checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; children?: ReactNode; disabled?: boolean; label?: string; className?: string; id?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <label className={`ds-check ${className}`.trim()} data-part="container">
      <input ref={ref} id={id} type="checkbox" checked={checked} disabled={disabled} aria-label={children ? undefined : label} onChange={e => onChange(e.target.checked)} />
      <span className="ds-check__box" aria-hidden="true" data-part="box">{indeterminate ? <IndeterminateMark /> : <CheckMark />}</span>
      {children && <span data-part="label">{children}</span>}
    </label>
  );
}

/** Roving-tabindex keyboard for radio-like groups (§5.55): arrows move and select, wrapping; disabled skipped; RTL-aware. */
function useRoving<T extends string>(values: T[], value: T, onChange: (v: T) => void, disabled?: boolean) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'];
    const back = ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'];
    const i = values.indexOf(value);
    let n = -1;
    if (fwd.includes(e.key)) n = (i + 1) % values.length;
    else if (back.includes(e.key)) n = (i - 1 + values.length) % values.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = values.length - 1;
    if (n < 0) return;
    e.preventDefault();
    onChange(values[n]);
    refs.current[n]?.focus();
  };
  return { refs, onKeyDown };
}

/** §5.13 Radio cards. */
export function RadioCards<T extends string>({ options, value, onChange, label, labelId, disabled, vertical, forceClass }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label?: string; labelId?: string; disabled?: boolean; vertical?: boolean; forceClass?: Partial<Record<T, string>>;
}) {
  const { refs, onKeyDown } = useRoving(options.map(o => o.value), value, onChange, disabled);
  return (
    <div className={`ds-radio-group${vertical ? ' ds-radio-group--vertical' : ''}`} role="radiogroup" aria-label={label} aria-labelledby={labelId}
      aria-disabled={disabled || undefined} onKeyDown={onKeyDown} data-part="group">
      {options.map((o, i) => (
        <button key={o.value} ref={el => { refs.current[i] = el; }} type="button" role="radio" aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1} className={`ds-radio-card ${forceClass?.[o.value] ?? ''}`.trim()} data-part="card"
          onClick={() => !disabled && onChange(o.value)}>
          <RadioGlyph on={o.value === value} />
          <span data-part="label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** §5.14 Binary status toggle (radiogroup of two). */
export function BinaryToggle<T extends string>({ options, value, onChange, label, labelId, disabled, forceClass }: {
  options: { value: T; label: string; dot?: 'success' | 'error' | 'warning' }[]; value: T; onChange: (v: T) => void; label?: string; labelId?: string; disabled?: boolean; forceClass?: Partial<Record<T, string>>;
}) {
  const { refs, onKeyDown } = useRoving(options.map(o => o.value), value, onChange, disabled);
  return (
    <div className="ds-toggle" role="radiogroup" aria-label={label} aria-labelledby={labelId} onKeyDown={onKeyDown}
      aria-disabled={disabled || undefined} data-part="container">
      {options.map((o, i) => (
        <button key={o.value} ref={el => { refs.current[i] = el; }} type="button" role="radio" aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1} className={`ds-toggle__opt${o.dot === 'error' ? ' ds-toggle__opt--off' : ''} ${forceClass?.[o.value] ?? ''}`.trim()} data-part="option"
          onClick={() => !disabled && onChange(o.value)}>
          {o.dot && <span className={`ds-dot ds-dot--sm ds-dot--${o.dot}`} aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** §5.15 Switch: instant-apply setting; visible label. */
export function Switch({ checked, onChange, label, disabled, className = '' }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean; className?: string }) {
  return (
    <label className="ds-switch-row" data-part="container">
      <button type="button" role="switch" aria-checked={checked} disabled={disabled} className={`ds-switch ${className}`.trim()} data-part="track"
        onClick={() => onChange(!checked)}>
        <span className="ds-switch__thumb" aria-hidden="true" data-part="thumb" />
      </button>
      <span className="ds-text-body" data-part="label">{label}</span>
    </label>
  );
}

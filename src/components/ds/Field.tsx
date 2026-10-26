import { cloneElement, useId, useState, type ComponentProps, type ReactElement, type TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { Search } from './figmaIcons';
import { Icon } from './Icon';

/** §5.8 Form field: label → (6px) → control → helper or validation message (role="alert"). */
export function Field({ label, required, help, error, children, className = '', labelId, caps }: {
  label: string; required?: boolean; help?: string; error?: string; className?: string; labelId?: string; caps?: boolean;
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const controlId = (children.props.id as string | undefined) ?? `f${id}`;
  const msgId = `${controlId}-msg`;
  const control = cloneElement(children, {
    id: controlId,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error || help ? msgId : undefined,
    required: required || undefined,
    'aria-required': required ? 'true' : undefined,
    labelId: labelId ?? `${controlId}-label`,
  });
  return (
    <div className={`ds-field${caps ? ' ds-field--caps' : ''} ${className}`.trim()} data-part="container">
      <label className="ds-field__label" htmlFor={controlId} id={labelId ?? `${controlId}-label`} data-part="label">
        {label}{required && <span className="ds-field__req" aria-hidden="true"> *</span>}
      </label>
      {control}
      {error ? <p className="ds-field__error" id={msgId} role="alert" data-part="message">{error}</p>
        : help ? <p className="ds-field__help" id={msgId} data-part="message">{help}</p> : null}
    </div>
  );
}

type InputProps = ComponentProps<'input'> & { suffix?: string; labelId?: string };

/** §5.5 Text input: glass field (gradient-glass, border-glass, shadow-field). Suffix unit or password toggle. */
export function TextInput({ suffix, className = '', type = 'text', labelId: _l, ...rest }: InputProps) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  if (!suffix && !isPw) return <input className={`ds-input ${className}`.trim()} type={type} {...rest} />;
  return (
    <div className="ds-input-wrap">
      <input className={`ds-input ${suffix ? 'ds-input--suffix' : 'ds-input--trailing'} ${className}`.trim()} type={isPw && show ? 'text' : type} {...rest} />
      {suffix && <span className="ds-input__suffix" aria-hidden="true">{suffix}</span>}
      {isPw && (
        <button type="button" className="ds-input__trailing" aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(s => !s)}>
          <Icon icon={show ? EyeOff : Eye} size={18} color="var(--ds-color-text-muted)" />
        </button>
      )}
    </div>
  );
}

/** §5.6 Search input: 18px icon 14px from the start; type="search"; a clear button once there is text. */
export function SearchInput({ value, onValueChange, label, width, className = '', labelId: _l, ...rest }: {
  value: string; onValueChange: (v: string) => void; label?: string; width?: 'sm' | 'md' | 'lg' | 'full';
} & Omit<InputProps, 'value' | 'onChange'>) {
  return (
    <div className={`ds-search${width ? ` ds-search--${width}` : ''}`} data-part="container">
      <span className="ds-search__icon" data-part="icon"><Icon icon={Search} size={16} strokeWidth={1.75} /></span>
      <input className={`ds-input ds-search__input ${className}`.trim()} type="search" aria-label={label} value={value}
        onChange={e => onValueChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape' && value) { e.stopPropagation(); onValueChange(''); } }} data-part="field" {...rest} />
      {value && (
        <button type="button" className="ds-input__trailing ds-search__clear" aria-label="Clear search" onClick={() => onValueChange('')}>
          <Icon icon={X} size={14} color="var(--ds-color-text-muted)" />
        </button>
      )}
    </div>
  );
}

/** §5.7 Textarea. */
export function Textarea({ className = '', labelId: _l, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { labelId?: string }) {
  return <textarea className={`ds-input ds-textarea ${className}`.trim()} rows={3} {...rest} />;
}

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, Plus, Search, type LucideIcon } from 'lucide-react';
import { Chevron, CheckMark, Icon } from './Icon';
import { PlusSquare } from './figmaIcons';

export interface Option { value: string; label: string; dot?: 'success' | 'warning' | 'error'; disabled?: boolean; render?: ReactNode; searchText?: string }

interface Common {
  options: Option[];
  label?: string;          // aria-label when there is no visible <label>
  labelId?: string;        // id of a visible label (from Field)
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  'aria-invalid'?: 'true';
  'aria-describedby'?: string;
  action?: { label: string; onAction: () => void };
  searchable?: boolean;    // default: more than 5 options (§5.10)
  wideMenu?: boolean;
  className?: string;
  trigger?: (selected: Option[]) => ReactNode;
  icon?: ReactNode;        // replaces the chevron (date trigger)
  leadIcon?: LucideIcon;   // 16px line icon before the value (header filters); a selected status dot takes its place
  triggerClassName?: string; // e.g. forced .is-hover / .is-focus-visible in the docs
  rich?: boolean;          // §5.19 picker list (surface-nested rows, footer action)
  defaultOpen?: boolean;   // render open on mount (static state demos, Figma frame 3)
}

/*
  §5.9 / §5.10 / §5.55 select-only combobox + listbox.
  Focus stays on the trigger (or the search input); options are tracked with aria-activedescendant.
*/
function useListbox({ options, multiple, selected, onPick, searchable, action, defaultOpen }: {
  options: Option[]; multiple: boolean; selected: string[]; onPick: (v: string) => void; searchable: boolean; action?: Common['action']; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [up, setUp] = useState(false);
  const typeahead = useRef({ buf: '', t: 0 });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => (o.searchText ?? o.label).toLowerCase().includes(q)) : options;
  }, [options, query]);
  const enabled = (i: number) => i >= 0 && i < filtered.length && !filtered[i].disabled;
  const step = (from: number, d: number) => {
    let i = from;
    do { i += d; } while (i >= 0 && i < filtered.length && !enabled(i));
    return enabled(i) ? i : from;
  };
  const first = () => step(-1, 1);
  const last = () => step(filtered.length, -1);
  const openAt = (where: 'selected' | 'last') => {
    const si = filtered.findIndex(o => o.value === selected[0]);
    setOpen(true);
    setActive(where === 'last' ? (si >= 0 ? si : last()) : (si >= 0 ? si : first()));
  };
  const close = () => { setOpen(false); setQuery(''); setActive(-1); };

  const onKey = (e: React.KeyboardEvent, focusAction: () => void) => {
    const k = e.key;
    if (!open) {
      if (k === 'Enter' || k === ' ' || k === 'ArrowDown') { e.preventDefault(); openAt('selected'); }
      else if (k === 'ArrowUp') { e.preventDefault(); openAt('last'); }
      return false;
    }
    switch (k) {
      case 'ArrowDown': e.preventDefault(); setActive(a => step(a, 1)); break;
      case 'ArrowUp': e.preventDefault(); setActive(a => step(a, -1)); break;
      case 'Home': if (!searchable) { e.preventDefault(); setActive(first()); } break;
      case 'End': if (!searchable) { e.preventDefault(); setActive(last()); } break;
      case 'Enter': e.preventDefault(); if (enabled(active)) { onPick(filtered[active].value); if (!multiple) return true; } break;
      case ' ': if (!searchable) { e.preventDefault(); if (enabled(active)) { onPick(filtered[active].value); if (!multiple) return true; } } break;
      case 'Escape': e.preventDefault(); e.stopPropagation(); return true;
      case 'Tab': if (action) { e.preventDefault(); focusAction(); } else close(); break;
      default:
        if (!searchable && k.length === 1 && !e.metaKey && !e.ctrlKey) {
          const ta = typeahead.current;
          window.clearTimeout(ta.t);
          ta.buf += k.toLowerCase();
          ta.t = window.setTimeout(() => { ta.buf = ''; }, 500);
          const i = filtered.findIndex((o, idx) => !o.disabled && o.label.toLowerCase().startsWith(ta.buf) && (ta.buf.length > 1 || idx !== active));
          const j = i >= 0 ? i : filtered.findIndex(o => !o.disabled && o.label.toLowerCase().startsWith(ta.buf));
          if (j >= 0) setActive(j);
        }
    }
    return false;
  };
  useEffect(() => { if (open && query) setActive(first()); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps
  return { open, setOpen, query, setQuery, active, setActive, filtered, openAt, close, onKey, up, setUp };
}

function SelectBase({ options, multiple, selected, onPick, label, labelId, id, placeholder = 'Select…', disabled, action, searchable, wideMenu, className = '', trigger, icon, leadIcon, variant, triggerClassName = '', rich, defaultOpen, ...rest }: Common & {
  multiple: boolean; selected: string[]; onPick: (v: string) => void; variant: 'filter' | 'field';
}) {
  const { required: _req, ...aria } = rest as typeof rest & { required?: boolean };
  const uid = useId();
  const listId = `${uid}-list`;
  const wrap = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isSearchable = searchable ?? options.length > 5;
  const lb = useListbox({ options, multiple, selected, onPick, searchable: isSearchable, action, defaultOpen });
  const { open, active, filtered } = lb;

  const close = (refocus = true) => { lb.close(); if (refocus) triggerRef.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) lb.close(); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!open) return;
    if (isSearchable) searchRef.current?.focus();
    const r = triggerRef.current!.getBoundingClientRect();
    const scroller = triggerRef.current!.closest('.ds-page-content, .ds-panel__body, .ds-modal__body') as HTMLElement | null;
    const bottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;
    lb.setUp(bottom - r.bottom < 300 && r.top > 320);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (active < 0 || !listRef.current) return;
    (listRef.current.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const sel = options.filter(o => selected.includes(o.value));
  const activeId = open && active >= 0 && filtered[active] ? `${uid}-o-${filtered[active].value}` : undefined;
  const handleKey = (e: React.KeyboardEvent) => { if (lb.onKey(e, () => actionRef.current?.focus())) close(); };
  const pick = (v: string) => { onPick(v); if (!multiple) close(); };

  const lead = leadIcon && <Icon icon={leadIcon} size={16} strokeWidth={1.75} className="ds-select__lead" />;
  const value = trigger ? trigger(sel) : sel.length === 0
    ? <span className="ds-select__value ds-select__value--placeholder ds-truncate">{lead}{placeholder}</span>
    : multiple ? <MultiValue labels={sel.map(s => s.label)} />
    : <span className="ds-select__value ds-truncate">{sel[0].dot ? <span className={`ds-dot ds-dot--sm ds-dot--${sel[0].dot}`} aria-hidden="true" /> : lead}{sel[0].label}</span>;

  return (
    <div className={`ds-select ${className}`.trim()} ref={wrap}>
      <button ref={triggerRef} type="button" id={id} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-labelledby={label ? undefined : labelId} aria-label={label ? `${label}${sel.length ? `: ${sel.map(s => s.label).join(', ')}` : ''}` : undefined}
        aria-activedescendant={!isSearchable ? activeId : undefined} disabled={disabled}
        className={`ds-select__trigger ds-select__trigger--${variant} ${triggerClassName}`.trim()} data-part="trigger"
        onClick={() => (open ? close() : lb.openAt('selected'))} onKeyDown={handleKey} {...aria}>
        {value}
        {icon ?? <Chevron />}
      </button>
      {open && (
        <div className={rich ? `ds-picker${lb.up ? ' ds-menu--up' : ''}` : `ds-menu${wideMenu ? ' ds-menu--wide' : ''}${lb.up ? ' ds-menu--up' : ''}`} data-part="menu">
          {isSearchable && (
            <div className="ds-menu__search">
              <div className="ds-search">
                <span className="ds-search__icon"><Icon icon={Search} size={16} strokeWidth={1.75} /></span>
                <input ref={searchRef} className="ds-input ds-search__input" type="search" placeholder="Search…" aria-label={`Search ${label ?? 'options'}`}
                  role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={activeId}
                  value={lb.query} onChange={e => lb.setQuery(e.target.value)} onKeyDown={handleKey} />
              </div>
            </div>
          )}
          <ul className={rich ? 'ds-menu__list ds-picker__list' : 'ds-menu__list'} role="listbox" id={listId} ref={listRef} aria-multiselectable={multiple || undefined}
            aria-labelledby={labelId} aria-label={label}>
            {filtered.map((o, i) => {
              const isSel = selected.includes(o.value);
              return (
                <li key={o.value} id={`${uid}-o-${o.value}`} role="option" aria-selected={isSel} aria-disabled={o.disabled || undefined}
                  className={`${rich ? 'ds-picker-row' : 'ds-menu__option'}${multiple ? ' ds-menu__option--multi' : ''}${i === active ? ' is-active' : ''}`}
                  onPointerDown={e => e.preventDefault()} onPointerMove={() => !o.disabled && lb.setActive(i)}
                  onClick={() => !o.disabled && pick(o.value)} data-part="option">
                  {multiple && <span className="ds-check__box" aria-hidden="true">{isSel && <CheckMark />}</span>}
                  {o.dot && <span className={`ds-dot ds-dot--sm ds-dot--${o.dot}`} aria-hidden="true" />}
                  {o.render ?? o.label}
                  {!multiple && !rich && <span className="ds-menu__check"><Icon icon={Check} size={16} strokeWidth={2} /></span>}
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && <p className="ds-menu__empty" role="status">No matches</p>}
          {action && (
            <button ref={actionRef} type="button" className={rich ? 'ds-picker-footer' : 'ds-menu__action'}
              onClick={() => { action.onAction(); close(); }}
              onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); close(); } if (e.key === 'Tab') lb.close(); }}>
              <Icon icon={rich ? PlusSquare : Plus} size={16} />{action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** §5.11: joined labels when they fit on one line, otherwise "N selected". */
function MultiValue({ labels }: { labels: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(true);
  const joined = labels.join(', ');
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = joined;
    setFits(el.scrollWidth <= el.clientWidth);
  }, [joined]);
  return <span ref={ref} className="ds-select__value ds-truncate">{fits ? joined : `${labels.length} selected`}</span>;
}

export function Select({ value, onChange, variant = 'field', ...rest }: Common & { value: string | null; onChange: (v: string) => void; variant?: 'filter' | 'field' }) {
  return <SelectBase {...rest} variant={variant} multiple={false} selected={value ? [value] : []} onPick={onChange} />;
}

export function MultiSelect({ value, onChange, ...rest }: Common & { value: string[]; onChange: (v: string[]) => void }) {
  return <SelectBase {...rest} variant="field" multiple selected={value} onPick={v => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])} />;
}

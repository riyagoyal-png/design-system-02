import { useId, useRef, useState } from 'react';
import { Calendar, ImagePlus, X } from 'lucide-react';
import { Upload } from './figmaIcons';
import { Icon } from './Icon';
import { Button } from './Button';
import { Popover } from './Overlay';
import { Avatar, Chip, EmailLine } from './Display';
import { Select, type Option } from './Select';
import { toast } from './Toast';

const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export function rangeText(from: string, to: string) {
  if (from && to) return `${fmt(from)} - ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  if (to) return `Until ${fmt(to)}`;
  return 'All Dates';
}

/** §5.16 / §5.55 date range: raised trigger (aria-haspopup="dialog") + non-modal popover with a draft. */
export function DateRangePicker({ from, to, onChange, label = 'Date range', forceOpen }: { from: string; to: string; onChange: (f: string, t: string) => void; label?: string; forceOpen?: boolean }) {
  const [open, setOpen] = useState(!!forceOpen);
  const [draft, setDraft] = useState({ from, to });
  const trigger = useRef<HTMLButtonElement>(null);
  const pid = useId();
  const invalid = !!draft.from && !!draft.to && draft.from > draft.to;
  const errId = `${pid}-err`;
  const openIt = () => { setDraft({ from, to }); setOpen(true); };
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return (
    <div className="ds-select ds-select--240" data-part="container">
      <button ref={trigger} type="button" className="ds-select__trigger ds-select__trigger--filter" aria-haspopup="dialog" aria-expanded={open} aria-controls={pid}
        aria-label={`${label}: ${rangeText(from, to)}`} onClick={() => (open ? setOpen(false) : openIt())} data-part="trigger">
        <span className="ds-select__value ds-truncate">{rangeText(from, to)}</span>
        <span className="ds-select__icon"><Icon icon={Calendar} size={16} strokeWidth={1} /></span>
      </button>
      <div id={pid}>
        <Popover open={open} onClose={() => setOpen(false)} label="Choose date range" anchorRef={trigger}
          footer={<>
            <Button variant="ghost" size="sm" onClick={() => { onChange('', ''); close(); }}>Clear</Button>
            <Button size="sm" softDisabled={invalid} aria-describedby={invalid ? errId : undefined} onClick={() => { onChange(draft.from, draft.to); close(); }}>Apply</Button>
          </>}>
          <div className="ds-form-grid">
            <div className="ds-field">
              <label className="ds-field__label" htmlFor={`${pid}-f`}>From</label>
              <input id={`${pid}-f`} className="ds-input ds-input--date" type="date" value={draft.from} onChange={e => setDraft(d => ({ ...d, from: e.target.value }))} />
            </div>
            <div className="ds-field">
              <label className="ds-field__label" htmlFor={`${pid}-t`}>To</label>
              <input id={`${pid}-t`} className="ds-input ds-input--date" type="date" value={draft.to} aria-invalid={invalid || undefined} aria-describedby={invalid ? errId : undefined}
                onChange={e => setDraft(d => ({ ...d, to: e.target.value }))} />
            </div>
          </div>
          {invalid && <p className="ds-field__error" id={errId} role="alert">“From” must be on or before “To”.</p>}
        </Popover>
      </div>
    </div>
  );
}

/** §5.17 / §5.55 dropzone: role=button, Enter/Space/click open the picker; drag optional; type/size validation. Files stay local. */
export function FileUpload({ title = 'Upload Reference', accept = ['image/jpeg', 'image/png'], maxMb = 5, multiple, forceClass, labelledBy }: {
  title?: string; accept?: string[]; maxMb?: number; multiple?: boolean; forceClass?: string; labelledBy?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const hid = useId();
  const take = (list: FileList | null) => {
    if (!list?.length) return;
    const arr = [...list];
    const bad = arr.find(f => !accept.includes(f.type) || f.size > maxMb * 1024 * 1024);
    if (bad) { setError(`Use a JPG or PNG file up to ${maxMb} MB.`); return; }
    setError('');
    setBusy(true);
    window.setTimeout(() => { setBusy(false); setFiles(f => (multiple ? [...f, ...arr] : arr)); toast(`${arr.length === 1 ? arr[0].name : `${arr.length} files`} attached`); }, 600);
  };
  return (
    <div>
      <div ref={zone} className={`ds-dropzone${drag ? ' is-dragover' : ''} ${forceClass ?? ''}`.trim()} role="button" tabIndex={0} aria-describedby={[labelledBy, error && `${hid}-err`].filter(Boolean).join(' ') || undefined}
        /* name = the visible title + hint (WCAG 2.5.3 label-in-name); the field label describes it */
        aria-invalid={error ? 'true' : undefined} aria-busy={busy || undefined}
        onClick={() => input.current?.click()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragEnter={e => { e.preventDefault(); setDrag(true); }} onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files); }} data-part="container">
        <span className="ds-dropzone__icon" data-part="icon"><Icon icon={Upload} size={32} /></span>
        <p className="ds-dropzone__title" id={`${hid}-title`} data-part="title">{busy ? 'Uploading…' : title}</p>
        <p className="ds-dropzone__hint" id={`${hid}-hint`} data-part="hint"><span>Drag and drop an image, or click to browse</span><span aria-hidden="true">•</span><span>JPG, PNG (Max {maxMb} MB)</span></p>
      </div>
      {/* Outside the role="button" element: an input nested inside it is nested interactive content (axe nested-interactive). */}
      <input ref={input} type="file" className="ds-sr-only" tabIndex={-1} aria-hidden="true" accept={accept.join(',')} multiple={multiple}
        onChange={e => { take(e.target.files); e.target.value = ''; }} />
      {error && <p className="ds-field__error" id={`${hid}-err`} role="alert">{error}</p>}
      {files.length > 0 && (
        <ul className="ds-file-list">
          {files.map((f, i) => (
            <li key={`${f.name}${i}`}><span className="ds-cluster">{f.type.startsWith('image/') && <img src={URL.createObjectURL(f)} alt="" />}{f.name} · {(f.size / 1024).toFixed(0)} KB</span>
              <button type="button" className="ds-icon-btn ds-icon-btn--sm" aria-label={`Remove ${f.name}`}
                onClick={() => { setFiles(fs => fs.filter((_, j) => j !== i)); zone.current?.focus(); }}><Icon icon={X} size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** §5.18 field with attach button: the value can be typed or "extracted" from a local image (simulated). */
export function AttachField({ id, value, onValueChange, error, labelId: _l, ...aria }: {
  id?: string; value: string; onValueChange: (v: string) => void; error?: string; labelId?: string; 'aria-invalid'?: 'true'; 'aria-describedby'?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const pick = (f: File | undefined) => {
    if (!f) return;
    setThumb(URL.createObjectURL(f));
    setScanning(true);
    window.setTimeout(() => { setScanning(false); onValueChange('8901030875397'); toast('Code detected'); }, 900);
  };
  return (
    <div className="ds-attach" data-part="container">
      <div className={`ds-attach__field${error ? ' ds-attach__field--error' : ''}`} aria-busy={scanning || undefined} data-part="field">
        {thumb && (
          <span className="ds-attach__thumb">
            <img src={thumb} alt="" />
            <button type="button" className="ds-attach__clear" aria-label="Remove image" onClick={() => { setThumb(null); field.current?.focus(); }}><Icon icon={X} size={6} strokeWidth={2} /></button>
          </span>
        )}
        <input ref={field} id={id} className="ds-attach__input" value={value} onChange={e => onValueChange(e.target.value)}
          placeholder={scanning ? 'Scanning…' : 'Type the code or upload a photo'} {...aria} />
      </div>
      <button type="button" className="ds-attach__btn" aria-label={thumb ? 'Replace photo for code' : 'Upload photo for code'} onClick={() => input.current?.click()} data-part="button">
        <Icon icon={ImagePlus} size={18} />{thumb ? 'Replace' : 'Upload'}
      </button>
      <input ref={input} type="file" accept="image/*" className="ds-sr-only" tabIndex={-1} aria-hidden="true" onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

export interface Person { id: string; name: string; role?: string; email: string; code: string; online?: boolean }

/** §5.19 rich picker: listbox with rich options (accessible name = "Name, role, email"). */
export function RichPicker({ people, value, onChange, id, labelId, label, placeholder = 'Choose user', actionLabel = 'Add User', onAdd, ...aria }: {
  people: Person[]; value: string | null; onChange: (v: string) => void; id?: string; labelId?: string; label?: string; placeholder?: string;
  actionLabel?: string; onAdd?: () => void; defaultOpen?: boolean; 'aria-invalid'?: 'true'; 'aria-describedby'?: string;
}) {
  const options: Option[] = people.map(p => ({
    value: p.id, label: [p.name, p.role, p.email].filter(Boolean).join(', '), searchText: `${p.name} ${p.email} ${p.role ?? ''} ${p.code}`,
    render: <RichRow p={p} />,
  }));
  const sel = people.find(p => p.id === value);
  return (
    <Select id={id} labelId={labelId} label={label} options={options} value={value} onChange={onChange} placeholder={placeholder} searchable={people.length > 5} rich {...aria}
      className="ds-select--rich" trigger={() => (sel ? <RichRow p={sel} /> : <span className="ds-select__value">{placeholder}</span>)}
      action={{ label: actionLabel, onAction: onAdd ?? (() => toast('The add-user form opens here (product-specific)')) }} />
  );
}
function RichRow({ p }: { p: Person }) {
  return (
    <span className="ds-rich-row">
      <Avatar name={p.name} presence={p.online} />
      <span className="ds-picker-row__text">
        <span className="ds-picker-row__line1">{p.name}<Chip>{p.code}</Chip>{p.role && <span className="ds-ts-caption">{p.role}</span>}</span>
        <EmailLine email={p.email} />
      </span>
    </span>
  );
}

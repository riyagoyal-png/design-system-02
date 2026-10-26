import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { marked } from 'marked';
import { Copy } from 'lucide-react';
import { section } from '../lib/spec';
import { resolveToken, useDensity } from '../lib/tokens';
import { copyText } from '../lib/copy';
import { Icon } from '../components/ds/Icon';
import { Select } from '../components/ds/Select';
import { Checkbox } from '../components/ds/Choice';
import { Badge } from '../components/ds/Display';

/* ── Page scaffolding ───────────────────────────────────────────── */
export function DocSection({ title, id, children, description }: { title: string; id: string; children: ReactNode; description?: ReactNode }) {
  return (
    <section className="doc-section" aria-labelledby={`h-${id}`} id={id}>
      <div className="doc-section__head">
        <h2 className="ds-text-card-title" id={`h-${id}`}>{title}</h2>
        {description && <p className="ds-text-body-muted doc-section__desc">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function Prov({ tag }: { tag: 'OBSERVED' | 'PRESERVED' | 'INFERRED' | 'STANDARDIZED' | 'EXTENSION' | 'PRODUCT DECISION' | 'DERIVED CSS' | 'FALLBACK' | 'UNSUPPORTED' }) {
  const tone = tag === 'OBSERVED' ? 'success' : tag === 'STANDARDIZED' ? 'info' : tag === 'EXTENSION' ? 'warning' : tag === 'UNSUPPORTED' ? 'error' : 'neutral';
  return <Badge tone={tone} size="sm">{tag}</Badge>;
}

/** A preview surface. `surface` picks the documented background the component normally sits on. */
export function Preview({ children, surface = 'shell', label, center, pad = true, className = '' }: {
  children: ReactNode; surface?: 'shell' | 'card' | 'app' | 'overlay'; label?: string; center?: boolean; pad?: boolean; className?: string;
}) {
  return (
    <figure className={`doc-preview doc-preview--${surface}${center ? ' doc-preview--center' : ''}${pad ? '' : ' doc-preview--flush'} ${className}`.trim()}>
      <div className="doc-preview__stage">{children}</div>
      {label && <figcaption className="doc-preview__caption">{label}</figcaption>}
    </figure>
  );
}

export function Grid({ children, min = 220 }: { children: ReactNode; min?: number }) {
  return <div className="doc-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>;
}

export function Cell({ label, children, note }: { label: string; children: ReactNode; note?: ReactNode }) {
  return (
    <div className="doc-cell">
      <div className="doc-cell__stage">{children}</div>
      <p className="doc-cell__label">{label}</p>
      {note && <p className="doc-cell__note">{note}</p>}
    </div>
  );
}

/* ── Code ───────────────────────────────────────────────────────── */
export function CodeBlock({ code, lang = 'tsx', title }: { code: string; lang?: string; title?: string }) {
  return (
    <div className="doc-code">
      <div className="doc-code__bar">
        <span className="doc-code__lang">{title ?? lang}</span>
        <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={() => copyText(code, 'Code copied')}><Icon icon={Copy} size={14} />Copy</button>
      </div>
      <pre tabIndex={0} aria-label={`${title ?? lang} code`}><code>{code}</code></pre>
    </div>
  );
}

/** Code fences of a spec section (html/css), copied from DESIGN_SYSTEM.md. */
export function specFences(num: string): { lang: string; code: string }[] {
  const sec = section(num);
  if (!sec) return [];
  return [...sec.body.matchAll(/```(html|css)\n([\s\S]*?)```/g)].map(m => ({ lang: m[1], code: m[2].trim() }));
}
export function SpecCode({ num, filter }: { num: string; filter?: (code: string) => boolean }) {
  const fences = specFences(num).filter(f => !filter || filter(f.code));
  if (!fences.length) return <p className="ds-text-body-muted">§{num} has no blueprint code; the showcase CSS for it is derived from the spec table (src/styles/derived.css).</p>;
  return <div className="doc-stack">{fences.map((f, i) => <CodeBlock key={i} code={f.code} lang={f.lang} title={`DESIGN_SYSTEM.md §${num} · ${f.lang}`} />)}</div>;
}

/* ── Spec source (rendered markdown from the spec) ─────────────── */
/** Wide markdown tables scroll horizontally, so each becomes a focusable, labelled region (SC 2.1.1). */
export function wrapTables(html: string): string {
  let n = 0;
  return html.replace(/<table>/g, () => `<div class="doc-md-table" role="region" tabindex="0" aria-label="Specification table ${++n}"><table>`).replace(/<\/table>/g, '</table></div>');
}
export function SpecSource({ num, title = 'Specification text' }: { num: string; title?: string }) {
  const sec = section(num);
  const html = useMemo(() => (sec ? wrapTables(marked.parse(sec.body.replace(/```(html|css)\n[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n'), { async: false }) as string) : ''), [sec]);
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!sec) return null;
  return (
    <div className="doc-specsrc">
      <button type="button" className="doc-specsrc__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span>{title}: <b>§{sec.title}</b> (DESIGN_SYSTEM.md line {sec.line})</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id={id} hidden={!open} className="doc-md" dangerouslySetInnerHTML={{ __html: open ? html : '' }} />
    </div>
  );
}

/* ── Live spec table: resolved values computed from the browser ── */
export interface SpecRow { property: string; token?: string; value?: string; note?: string }
export function SpecTable({ rows, caption }: { rows: SpecRow[]; caption: string }) {
  useDensity();
  return (
    <div className="ds-table-region doc-table" role="region" aria-label={caption} tabIndex={0}>
      <table className="ds-table">
        <caption className="ds-sr-only">{caption}</caption>
        <thead><tr><th scope="col">Property</th><th scope="col">Design token</th><th scope="col">Resolved value</th></tr></thead>
        <tbody>
          {rows.map(r => {
            const tokens = r.token ? r.token.split(/\s*\+\s*/) : [];
            const resolved = r.value ?? tokens.map(t => (t.startsWith('--') ? resolveToken(t) || '⚠ undefined' : t)).join(' + ');
            return (
              <tr key={r.property + (r.token ?? '')}>
                <th scope="row">{r.property}{r.note && <span className="doc-note">{r.note}</span>}</th>
                <td>{tokens.length ? tokens.map(t => t.startsWith('--')
                  ? <button key={t} type="button" className="doc-token" onClick={() => copyText(`var(${t})`, 'Token copied')}>{t}<span className="ds-sr-only"> (copy)</span></button>
                  : <span key={t} className="doc-literal">{t}</span>) : <span className="doc-literal">spec literal</span>}</td>
                <td className="doc-resolved">{resolved.includes('rgba') || resolved.startsWith('#') ? <span className="doc-swatch-inline" style={{ background: resolved }} aria-hidden="true" /> : null}<code>{resolved}</code></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Anatomy overlay: numbered outlines on [data-part] elements ── */
export function Anatomy({ children, parts, surface = 'shell' }: { children: ReactNode; parts: { part: string; label: string; spec: string }[]; surface?: 'shell' | 'card' }) {
  const stage = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<{ n: number; x: number; y: number; w: number; h: number }[]>([]);
  const density = useDensity();
  const measure = () => {
    const s = stage.current;
    if (!s) return;
    const base = s.getBoundingClientRect();
    const out: typeof boxes = [];
    parts.forEach((p, i) => {
      const el = s.querySelector<HTMLElement>(`[data-part="${p.part}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      out.push({ n: i + 1, x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height });
    });
    setBoxes(out);
  };
  useLayoutEffect(measure, [density]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="doc-anatomy">
      <div className={`doc-preview doc-preview--${surface}`}>
        <div className="doc-anatomy__stage" ref={stage} inert>
          {children}
          {boxes.map(b => (
            <span key={b.n} className="doc-anatomy__box" style={{ left: b.x, top: b.y, width: b.w, height: b.h }} aria-hidden="true">
              <span className="doc-anatomy__num">{b.n}</span>
            </span>
          ))}
        </div>
      </div>
      <ol className="doc-anatomy__legend">
        {parts.map((p, i) => (
          <li key={p.part}><span className="doc-anatomy__num doc-anatomy__num--static" aria-hidden="true">{i + 1}</span>
            <span><b>{p.label}</b><span className="ds-text-small">{p.spec}</span>{!boxes.some(b => b.n === i + 1) && <span className="ds-text-small"> (not rendered in this configuration)</span>}</span></li>
        ))}
      </ol>
    </div>
  );
}

/* ── Playground ─────────────────────────────────────────────────── */
export type Control =
  | { kind: 'select'; key: string; label: string; options: string[] }
  | { kind: 'bool'; key: string; label: string }
  | { kind: 'text'; key: string; label: string };
export type Props = Record<string, string | boolean>;

export function Playground({ controls, initial, render, code, surface = 'shell' }: {
  controls: Control[]; initial: Props; render: (p: Props) => ReactNode; code: (p: Props) => string; surface?: 'shell' | 'card';
}) {
  const [p, setP] = useState<Props>(initial);
  const set = (k: string, v: string | boolean) => setP(o => ({ ...o, [k]: v }));
  const base = useId();
  return (
    <div className="doc-play">
      <div className="doc-play__controls" role="group" aria-label="Playground controls">
        {controls.map(c => (
          <div key={c.key} className="doc-play__control">
            {c.kind === 'select' && (
              <div className="ds-field">
                <span className="ds-field__label" id={`${base}-${c.key}`}>{c.label}</span>
                <Select labelId={`${base}-${c.key}`} options={c.options.map(o => ({ value: o, label: o }))} value={String(p[c.key])} onChange={v => set(c.key, v)} searchable={false} />
              </div>
            )}
            {c.kind === 'bool' && <Checkbox checked={!!p[c.key]} onChange={v => set(c.key, v)}>{c.label}</Checkbox>}
            {c.kind === 'text' && (
              <div className="ds-field">
                <label className="ds-field__label" htmlFor={`${base}-${c.key}`}>{c.label}</label>
                <input id={`${base}-${c.key}`} className="ds-input" value={String(p[c.key])} onChange={e => set(c.key, e.target.value)} />
              </div>
            )}
          </div>
        ))}
        <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={() => setP(initial)}>Reset</button>
      </div>
      <Preview surface={surface} center>{render(p)}</Preview>
      <CodeBlock code={code(p)} title="Generated usage (React)" />
    </div>
  );
}

/** Attribute helper for generated code. */
export function attrs(o: Record<string, string | boolean | undefined>) {
  return Object.entries(o).filter(([, v]) => v !== undefined && v !== false && v !== '').map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${v}"`)).join('');
}

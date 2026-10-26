import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Icon } from './Icon';
import { Mail, Tick } from './figmaIcons';
import { spec } from '../../lib/spec';

export type Tone = 'success' | 'warning' | 'error';

/** §5.27 Badge (status pill): tinted (default) or glass appearance; the tone and label never change between them. */
export function Badge({ tone, size = 'md', appearance = 'tinted', children }: {
  tone: Tone | 'info' | 'neutral'; size?: 'md' | 'sm'; appearance?: 'tinted' | 'glass'; children: ReactNode;
}) {
  return (
    <span className={`ds-badge ds-badge--${tone}${size === 'sm' ? ' ds-badge--sm' : ''}${appearance === 'glass' ? ' ds-badge--glass' : ''}`} data-part="container">
      <span className="ds-badge__dot" aria-hidden="true" data-part="dot" />
      <span data-part="label">{children}</span>
    </span>
  );
}

/** §5.27 "Live" indicator: glass pill with a compound red dot (pulses unless reduced motion). */
export function LiveBadge({ children = 'Live' }: { children?: ReactNode }) {
  return (
    <span className="ds-live" data-part="container">
      <span className="ds-live__dot" aria-hidden="true" data-part="dot" />
      <span data-part="label">{children}</span>
    </span>
  );
}

/** §5.28 Status dot with a visible label (a), or standalone with role="img" (b). */
export function Status({ tone, children, size = 'sm' }: { tone: Tone; children: ReactNode; size?: 'sm' | 'md' }) {
  return (
    <span className="ds-status" data-part="container">
      <span className={`ds-dot ds-dot--${tone}${size === 'sm' ? ' ds-dot--sm' : ''}`} aria-hidden="true" data-part="dot" />
      <span data-part="label">{children}</span>
    </span>
  );
}
export function Dot({ tone, size = 'md', label }: { tone: Tone; size?: 'sm' | 'md'; label?: string }) {
  return <span className={`ds-dot ds-dot--${tone}${size === 'sm' ? ' ds-dot--sm' : ''}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'} />;
}

export type TagColor = 'purple' | 'blue' | 'green' | 'amber' | 'rose';
export const TAG_ORDER: TagColor[] = ['purple', 'blue', 'green', 'amber', 'rose'];
/** §5.29 Tag (solid category). */
export function Tag({ color, raised, children }: { color: TagColor; raised?: boolean; children: ReactNode }) {
  return <span className={`ds-tag ds-tag--${color}${raised ? ' ds-tag--raised' : ''}`} data-part="container">{children}</span>;
}
/** Stable category → color mapping, assigned once per product (§5.29). */
export function tagColorFor(categories: string[], cat: string): TagColor {
  return TAG_ORDER[Math.max(0, categories.indexOf(cat)) % TAG_ORDER.length];
}

export function CountPill({ children, label }: { children: ReactNode; label?: string }) {
  return <span className="ds-count" aria-label={label} data-part="container">{children}</span>;
}
export function Chip({ children }: { children: ReactNode }) {
  return <span className="ds-chip" data-part="container">{children}</span>;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('');
}
/** §5.32 Avatar: brand 40 (pickers), neutral 32 (cards), photo 32 (user card); optional presence dot. */
export function Avatar({ name, variant = 'brand', src, decorative = true, presence }: {
  name: string; variant?: 'brand' | 'neutral' | 'photo'; src?: string; decorative?: boolean; presence?: boolean;
}) {
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': name };
  const dot = presence ? <span className="ds-avatar__presence" data-part="presence" /> : null;
  if (variant === 'photo') return <span className="ds-avatar ds-avatar--photo" data-part="container" {...a11y}><span>{src ? <img src={src} alt="" /> : initials(name)}</span>{dot}</span>;
  return <span className={`ds-avatar${variant === 'neutral' ? ' ds-avatar--neutral' : ''}`} data-part="container" {...a11y}>{initials(name)}{dot}</span>;
}

/** §5.33 Metric indicator: stacked (label above) or inline ("6 / 6 lines active"). */
export function Metric({ label, value, of, unit, tone, inline }: {
  label?: string; value: number | string; of?: number | string; unit?: string; tone?: 'success' | 'warning' | 'alert'; inline?: boolean;
}) {
  const color = tone === 'success' ? 'ds-c-success' : tone === 'warning' ? 'ds-c-warning' : tone === 'alert' ? 'ds-c-alert' : '';
  const denominator = of !== undefined ? `/ ${of}${unit ? ` ${unit}` : ''}` : unit;
  return (
    <div className={`ds-metric${inline ? ' ds-metric--inline' : ''}`} data-part="container">
      {label && <span className="ds-text-metric-label" data-part="label">{label}</span>}
      <span className="ds-metric__value" aria-label={of !== undefined ? `${value} of ${of}${unit ? ` ${unit}` : ''}` : undefined} data-part="value">
        <b className={color}>{value}</b>{denominator && <span data-part="denominator">{denominator}</span>}
      </span>
    </div>
  );
}

/** §5.34 Segmented status bar: md (20px, numbers, 2px gaps) or lg (40px, no numbers — the legend carries the counts). */
export function SegBar({ segments, label, size = 'md' }: { segments: { value: number; color: string; label: string }[]; label?: string; size?: 'md' | 'lg' }) {
  const nonEmpty = segments.filter(s => s.value > 0);
  return (
    <div className={`ds-segbar${size === 'lg' ? ' ds-segbar--lg' : ''}`} data-part="track" role="img" aria-label={label ?? segments.map(s => `${s.value} ${s.label}`).join(', ')}>
      {nonEmpty.map(s => (
        <span key={s.label} data-part="segment" className="ds-segbar__seg" style={{ flexGrow: s.value, background: s.color }}>{size === 'md' ? s.value : null}</span>
      ))}
    </div>
  );
}

/** §5.34 Progress bar (4px). Success fill is the Figma green gradient. */
export function Progress({ value, tone = 'brand', label, showValue = true }: { value: number; tone?: 'brand' | 'success' | 'warning' | 'error'; label: string; showValue?: boolean }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="ds-progress-row" data-part="container">
      <div data-part="track" className={`ds-progress ds-progress--${tone}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span data-part="fill" style={{ width: `${v}%` }} />
      </div>
      {showValue && <b aria-hidden="true" data-part="value">{Math.round(v)}%</b>}
    </div>
  );
}

/** §5.50 skeleton bar. */
export function Skeleton({ w = '100%', h = 12 }: { w?: string | number; h?: number }) {
  return <span className="ds-skeleton ds-skeleton--bar" style={{ width: w, height: h }} aria-hidden="true" />;
}

/** §5.51 empty state. */
export function EmptyState({ title, message, action, icon, variant = 'inline' }: { title?: string; message: string; action?: ReactNode; icon?: ReactNode; variant?: 'inline' | 'first-use' | 'chart' }) {
  return (
    <div className={`ds-empty ds-empty--${variant}`} data-part="container">
      {icon && <span data-part="icon" className="ds-contents">{icon}</span>}
      {title && <p className="ds-text-card-title" data-part="title">{title}</p>}
      <p className="ds-text-body-muted" data-part="message">{message}</p>
      {action && <span data-part="action" className="ds-contents">{action}</span>}
    </div>
  );
}

/** §5.20 callout, §5.21 inline alert [EXTENSION]. */
export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return <div className="ds-callout" data-part="container"><p className="ds-callout__title" data-part="title">{title}</p><p className="ds-callout__body" data-part="body">{children}</p></div>;
}
const ALERT_ICON: Record<string, LucideIcon> = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle };
export function InlineAlert({ tone, title, children, onDismiss }: { tone: 'info' | 'success' | 'warning' | 'error'; title?: string; children: ReactNode; onDismiss?: () => void }) {
  return (
    <div className={`ds-callout ds-callout--${tone}`} role={tone === 'error' ? 'alert' : 'status'} data-part="container">
      <Icon icon={ALERT_ICON[tone]} size={16} color={tone === 'info' ? 'var(--ds-color-brand)' : undefined} data-part="icon" />
      <div className="ds-callout__content" data-part="content">
        {title && <p className="ds-callout__title">{title}</p>}
        <p className="ds-callout__body">{children}</p>
      </div>
      {onDismiss && <button type="button" data-part="dismiss" className="ds-icon-btn ds-icon-btn--sm ds-callout__dismiss" aria-label="Dismiss" onClick={onDismiss}><Icon icon={X} size={14} /></button>}
    </div>
  );
}

/** §2.11-D icon tile: 40 (default), 32, 28 (camera tile header, OBSERVED). */
export function IconTile({ icon, size = 40, tone, label, glyph }: { icon: LucideIcon; size?: 40 | 32 | 28; tone?: Tone; label?: string; glyph?: number }) {
  const cls = `ds-icon-tile${size === 32 ? ' ds-icon-tile--32' : size === 28 ? ' ds-icon-tile--sm' : ''}${tone ? ` ds-icon-tile--${tone}` : ''}`;
  return <span className={cls} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}><Icon icon={icon} size={glyph ?? (size === 40 ? 20 : size === 32 ? 16 : 14)} /></span>;
}

/** §5.35 health-row icon: 20px box, 16px glyph, no tile (the grey tile read as an empty square). */
export function HealthTile({ icon }: { icon: LucideIcon }) {
  return <span className="ds-health-tile" aria-hidden="true"><Icon icon={icon} size={16} /></span>;
}

/**
  §2.11-B registry illustration, decorative. `crop` reproduces a Figma image-fill transform exactly
  (W × H at offset L, T inside an overflow-hidden box); `fit` is contain (default) or cover.
*/
export function Illustration({ name, size = 40, frame, frames, crop, fit = 'contain', className = '' }: {
  name: string; size?: number; frame?: number; frames?: number; crop?: string; fit?: 'contain' | 'cover'; className?: string;
}) {
  const c = crop ? spec.crops.find(x => x.id === crop) : undefined;
  const entry = spec.registry.find(r => r.name === (c ? `illus.${c.asset}` : name));
  if (!entry) return null;
  const src = `${import.meta.env.BASE_URL}assets/${entry.file}`;
  if (c) {
    return (
      <span className={`ds-sprite ${className}`.trim()} style={{ width: size, height: size }} aria-hidden="true">
        <img src={src} alt="" style={{ width: c.w, height: c.h, left: c.l, top: c.t }} />
      </span>
    );
  }
  if (frames && frame !== undefined) {
    return (
      <span className={`ds-sprite ${className}`.trim()} style={{ width: size, height: size }} aria-hidden="true">
        <img src={src} alt="" style={{ width: `${frames * 100}%`, height: '100%', left: `-${frame * 100}%`, top: 0 }} />
      </span>
    );
  }
  return <img className={`ds-illus ${className}`.trim()} src={src} alt="" aria-hidden="true" width={size} height={size} style={{ objectFit: fit }} />;
}

/** §5.22 Stepper: completed (tick, "Completed"), current ("In progress"), upcoming (own subtitle, dimmed index). */
export function Stepper({ steps, current }: { steps: { title: string; sub: string }[]; current: number }) {
  return (
    <ol className="ds-stepper" aria-label="Progress" data-part="list">
      {steps.map((s, i) => {
        const done = i < current, now = i === current;
        return (
          <li key={s.title} className={`ds-step${done ? ' ds-step--done' : ''}`} aria-current={now ? 'step' : undefined} data-part={i === current + 1 ? 'upcoming' : undefined}>
            <span className="ds-step__index" data-part={now ? 'index' : undefined}>{done ? <Icon icon={Tick} size={16} /> : i + 1}</span>
            <span className="ds-step__text" data-part={now ? 'text' : undefined}>
              <span className="ds-step__title">{s.title}{done && <span className="ds-sr-only"> (completed)</span>}</span>
              <span className="ds-step__sub">{done ? 'Completed' : now ? 'In progress' : s.sub}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function EmailLine({ email }: { email: string }) {
  return <span className="ds-picker-row__line2"><Icon icon={Mail} size={11} /><span className="ds-truncate">{email}</span></span>;
}

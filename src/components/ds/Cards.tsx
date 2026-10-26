import { useId, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, Badge, HealthTile, IconTile, Progress, SegBar, type Tone } from './Display';
import { Button } from './Button';
import { Icon } from './Icon';
import { ChevronRight, Expand, MapPin, Video } from './figmaIcons';
import { Tooltip } from './Tooltip';

/** §5.23 KPI card: 52px illustration, kpi-label, kpi-value. Optional toggle (filters the page), ball and delta [EXTENSION]. */
export function KpiCard({ label, value, icon, ball, delta, pressed, onToggle, className = '' }: {
  label: string; value: ReactNode; icon: ReactNode; ball?: 'success' | 'error'; delta?: { dir: 'up' | 'down'; text: string };
  pressed?: boolean; onToggle?: () => void; className?: string;
}) {
  const inner = (
    <>
      <div className="ds-kpi__icon" aria-hidden="true" data-part="icon">
        {icon}
        {ball && <span className={`ds-kpi__ball${ball === 'error' ? ' ds-kpi__ball--error' : ''}`} />}
      </div>
      <div className="ds-kpi__text" data-part="text">
        <p className="ds-kpi__label" data-part="label">{label}</p>
        <p className="ds-kpi__value" data-part="value">{value}</p>
        {delta && <p className={`ds-kpi__delta ds-kpi__delta--${delta.dir}`} data-part="delta">{delta.dir === 'up' ? '▲' : '▼'} {delta.text}</p>}
      </div>
    </>
  );
  return onToggle
    ? <button type="button" className={`ds-kpi ${className}`.trim()} aria-pressed={!!pressed} onClick={onToggle} data-part="container">{inner}</button>
    : <div className={`ds-kpi ${className}`.trim()} data-part="container">{inner}</div>;
}

/**
  §5.24 Entity card (Figma "Factory List"): header (icon box, name, location, glass status pill), metric well
  (value / denominator, meta, 4px progress) and footer (owner + role, subtle action button). The card itself is not interactive.
*/
export function EntityCard({ title, location, icon, status, metric, meta, owner, role, actionLabel = 'View', onAction, headingLevel = 3, className = '' }: {
  title: string; location?: string; icon: ReactNode; status: { tone: Tone; label: string };
  metric: { value: number; of: number; unit: string; tone?: 'success' | 'error' | 'warning' }; meta?: { icon?: LucideIcon; text: string };
  owner: string; role: string; actionLabel?: string; onAction?: () => void; headingLevel?: 2 | 3; className?: string;
}) {
  const H = `h${headingLevel}` as 'h3';
  const pct = metric.of > 0 ? (metric.value / metric.of) * 100 : 0;
  return (
    <article className={`ds-entity ${className}`.trim()} data-part="container">
      <div className="ds-entity__header" data-part="header">
        <div className="ds-entity__lead">
          <span className="ds-entity__icon" aria-hidden="true" data-part="icon">{icon}</span>
          <span className="ds-entity__titles">
            <H className="ds-text-card-title" data-part="title">{title}</H>
            {location && <span className="ds-entity__place"><Icon icon={MapPin} size={14} />{location}</span>}
          </span>
        </div>
        <Badge tone={status.tone} appearance="glass">{status.label}</Badge>
      </div>
      <div className="ds-entity__well" data-part="metrics">
        <div className="ds-entity__wellrow">
          <span className="ds-entity__value" aria-label={`${metric.value} of ${metric.of} ${metric.unit}`}>
            <b className="ds-text-metric-value">{metric.value}</b><span className="ds-text-body-muted">/ {metric.of} {metric.unit}</span>
          </span>
          {meta && <span className="ds-entity__meta"><Icon icon={meta.icon ?? Video} size={14} />{meta.text}</span>}
        </div>
        <Progress value={pct} tone={metric.tone ?? 'success'} label={`${title}: ${metric.value} of ${metric.of} ${metric.unit}`} showValue={false} />
      </div>
      <div className="ds-entity__footer" data-part="person">
        <span className="ds-entity__who">
          <Avatar name={owner} variant="neutral" />
          <span><b>{owner}</b><span className="ds-entity__role">{role}</span></span>
        </span>
        <Button variant="subtle" trailing={ChevronRight} onClick={onAction} aria-label={`${actionLabel}: ${title}`}>{actionLabel}</Button>
      </div>
    </article>
  );
}

/** §5.25 Dashboard card. */
export function DashCard({ title, subtitle, right, children, flush, className = '', id }: {
  title: string; subtitle?: string; right?: ReactNode; children: ReactNode; flush?: boolean; className?: string; id?: string;
}) {
  const uid = useId();
  const tid = id ?? uid;
  return (
    <section className={`ds-dash-card${flush ? ' ds-dash-card--flush' : ''} ${className}`.trim()} aria-labelledby={tid} data-part="container">
      <div className="ds-dash-card__header" data-part="header">
        <div>
          <h2 className="ds-dash-card__title" id={tid} data-part="title">{title}</h2>
          {subtitle && <p className="ds-dash-card__subtitle" data-part="subtitle">{subtitle}</p>}
        </div>
        {right && <div className="ds-dash-card__right" data-part="controls">{right}</div>}
      </div>
      <div className="ds-dash-card__body" data-part="body">{children}</div>
    </section>
  );
}

/** §5.26 Status card (DEOC StatusCard): title + dot legend, 20px segmented bar with the counts, table edge to edge under a divider. */
export function StatusCard({ title, running, stopped, children, className = '' }: { title: string; running: number; stopped: number; children: ReactNode; className?: string }) {
  const tid = useId();
  return (
    <section className={`ds-dash-card ds-status-card ${className}`.trim()} aria-labelledby={tid} data-part="container">
      <div className="ds-dash-card__header" data-part="header">
        <h2 className="ds-dash-card__title" id={tid}>{title}</h2>
        <div className="ds-legend-dots" data-part="legend">
          <span className="ds-legend-dot"><i style={{ background: 'var(--ds-chart-running)' }} aria-hidden="true" />Running</span>
          <span className="ds-legend-dot"><i style={{ background: 'var(--ds-chart-stopped)' }} aria-hidden="true" />Stopped</span>
        </div>
      </div>
      <div data-part="bar">
        <SegBar segments={[{ value: running, color: 'var(--ds-chart-running)', label: 'running' }, { value: stopped, color: 'var(--ds-chart-stopped)', label: 'stopped' }]} />
      </div>
      <div className="ds-status-card__well" data-part="table">{children}</div>
    </section>
  );
}

/** §5.35 Summary strip: inline (fields beside the title) or stacked (Live View side panel). */
export function SummaryStrip({ eyebrow, title, fields, statuses, layout = 'inline' }: {
  eyebrow: string; title: string; fields?: { label: string; value: string }[]; statuses?: { label: string; tone: Tone; value: string }[]; layout?: 'inline' | 'stacked';
}) {
  const tid = useId();
  return (
    <section className={`ds-strip${layout === 'stacked' ? ' ds-strip--stacked' : ''}`} aria-labelledby={tid} data-part="container">
      <div className="ds-strip__lead" data-part="lead">
        <p className="ds-strip__eyebrow"><span className="ds-dot ds-dot--sm ds-dot--brand" aria-hidden="true" />{eyebrow}</p>
        <Tooltip content={title} onlyWhenTruncated>
          <h2 className="ds-strip__title ds-clamp-2" id={tid} tabIndex={0} data-truncate="">{title}</h2>
        </Tooltip>
      </div>
      {(fields?.length || statuses?.length) ? (
        <>
          {layout === 'inline' && <span className="ds-strip__divider" aria-hidden="true" data-part="divider" />}
          <dl className="ds-strip__fields" data-part="fields">
            {fields?.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            {statuses?.map(s => (
              <div key={s.label}><dt>{s.label}</dt><dd><span className="ds-status"><span className={`ds-dot ds-dot--${s.tone}`} aria-hidden="true" />{s.value}</span></dd></div>
            ))}
          </dl>
        </>
      ) : null}
    </section>
  );
}

/** §5.35 side-panel card with a section label ("REFERENCE BARCODES", "SYSTEM HEALTH"). */
export function PanelCard({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className="ds-panel-card" aria-labelledby={id} data-part="container">
      <h2 className="ds-panel-card__label" id={id} data-part="label">{label}</h2>
      {children}
    </section>
  );
}
/** §5.35 read-only label / identifier rows with faint dividers. */
export function FieldList({ items }: { items: { label: string; value: string }[] }) {
  return <dl className="ds-fieldlist" data-part="list">{items.map(i => <div key={i.label}><dt>{i.label}</dt><dd>{i.value}</dd></div>)}</dl>;
}
/** §5.35 system-health row: 20px icon tile + label, tinted status pill. */
export function HealthRow({ icon, label, status }: { icon: LucideIcon; label: string; status: { tone: Tone; label: string } }) {
  return (
    <div className="ds-health-row" data-part="row">
      <span className="ds-health-row__label"><HealthTile icon={icon} />{label}</span>
      <Badge tone={status.tone}>{status.label}</Badge>
    </div>
  );
}

/**
  §5.36 Media card (Figma "Cameras" tile): glass header (icon tile, title, camera name, status pill, expand),
  feed at 50% opacity with an optional detection frame, glass footer "Detected : value".
*/
export function MediaCard({ title, sub, src, icon = Video, status, detected, detectedError, frame, onOpen, className = '' }: {
  title: string; sub: string; src: string; icon?: LucideIcon; status: { tone: Tone; label: string }; detected: string; detectedError?: boolean;
  frame?: { left: string; top: string; width: string; height: string; tone?: 'error' | 'success' }; onOpen?: () => void; className?: string;
}) {
  const tid = useId();
  return (
    <article className={`ds-media-card ${className}`.trim()} aria-labelledby={tid} data-part="container">
      <div className="ds-media-card__head" data-part="header">
        <IconTile icon={icon} size={28} glyph={16} />
        <span className="ds-media-card__titles">
          <h2 className="ds-media-card__title" id={tid}>{title}</h2>
          <span className="ds-media-card__sub">{sub}</span>
        </span>
        <Badge tone={status.tone}>{status.label}</Badge>
        {onOpen && <button type="button" className="ds-media-card__expand" aria-label={`Expand ${title}`} onClick={onOpen}><Icon icon={Expand} size={16} /></button>}
      </div>
      <div className="ds-media-card__media" data-part="media">
        <img src={src} alt={`${title} camera feed`} />
        {frame && <span className={`ds-detect${frame.tone === 'success' ? ' ds-detect--positive' : ''}`} style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }} aria-hidden="true" />}
      </div>
      <div className="ds-media-card__foot" data-part="footer">
        <p className={`ds-media-card__detail${detectedError ? ' ds-media-card__detail--error' : ''}`}>Detected : <em>{detected}</em></p>
      </div>
    </article>
  );
}

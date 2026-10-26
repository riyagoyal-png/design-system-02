import { useRef, useState, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ChevronLeft, ChevronRight, Logout, SidebarToggle } from './figmaIcons';
import { Icon } from './Icon';
import { IconButton } from './Button';
import { Tooltip } from './Tooltip';
import { Avatar } from './Display';

export interface NavEntry { id: string; label: string; icon: ReactNode; href?: string }

/** §5.37 nav item: label truncates with a tooltip in both states (R-57); current = pill + weight 600. */
export function NavItem({ item, current, onSelect, className = '' }: { item: NavEntry; current?: boolean; onSelect?: (id: string) => void; className?: string }) {
  const el = (
    <a className={`ds-nav__item ${className}`.trim()} href={item.href ?? '#'} aria-current={current ? 'page' : undefined}
      onClick={e => { if (onSelect) { e.preventDefault(); onSelect(item.id); } }} data-part="item">
      <span className="ds-nav__icon" aria-hidden="true" data-part="icon">{item.icon}</span>
      <span className="ds-nav__text ds-sidebar__fade" data-part="label" data-truncate="">{item.label}</span>
    </a>
  );
  return <Tooltip content={item.label} describe={false} placement="right">{el}</Tooltip>;
}

/**
  §5.37 sidebar: always expanded (256px, Figma), no toggle. Opt in with `collapsible` to show the brand-row toggle that
  collapses it to the 76px rail, which expands over content on hover or keyboard focus (previous system's behavior).
*/
export function Sidebar({ product, tagline, logo, sections, current, onSelect, user, collapsed, onToggleCollapsed, collapsible = false }: {
  product: string; tagline: string; logo: ReactNode; sections: { label: string; items: NavEntry[] }[]; current: string;
  onSelect?: (id: string) => void; user: { name: string; role: string; src?: string }; collapsed?: boolean; onToggleCollapsed?: () => void; collapsible?: boolean;
}) {
  const [own, setOwn] = useState(false);
  const isCollapsed = collapsed ?? own;
  const toggle = onToggleCollapsed ?? (() => setOwn(v => !v));
  return (
    <div className="ds-sidebar-slot">
      <nav className={`ds-sidebar${isCollapsed ? ' ds-sidebar--collapsed' : ''}`} aria-label="Primary">
        <div className="ds-sidebar__inner">
          <div className="ds-sidebar__scroll">
            <div className="ds-sidebar__brand" data-part="brand">
              <span className="ds-sidebar__logo" aria-hidden="true">{logo}</span>
              <span className="ds-sidebar__fade"><span className="ds-sidebar__name">{product}</span><span className="ds-sidebar__tagline">{tagline}</span></span>
              {collapsible && (
                <button type="button" className="ds-sidebar__toggle ds-sidebar__fade" aria-pressed={isCollapsed} aria-label={isCollapsed ? 'Keep navigation expanded' : 'Collapse navigation'} onClick={toggle}>
                  <Icon icon={SidebarToggle} size={16} className="ds-rot90" />
                </button>
              )}
            </div>
            <div className="ds-nav">
              {sections.map(s => (
                <div className="ds-nav__section" key={s.label}>
                  <p className="ds-nav__label ds-sidebar__fade">{s.label}</p>
                  {s.items.map(i => <NavItem key={i.id} item={i} current={i.id === current} onSelect={onSelect} />)}
                </div>
              ))}
            </div>
          </div>
          <div className="ds-user-card" data-part="user">
            <div className="ds-user-card__row">
              <Avatar name={user.name} variant="photo" src={user.src} />
              <span className="ds-sidebar__fade ds-user-card__who"><span className="ds-user-card__name">{user.name}</span><span className="ds-user-card__role">{user.role}</span></span>
              <IconButton icon={Logout} label="Log out" size="sm" iconSize={20} className="ds-sidebar__fade ds-user-card__out" />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

/** §5.38 page header: 36px illustration + page-title, optional status (e.g. Live) and global actions. h1 is the overlay focus fallback. */
export function PageHeader({ title, icon, status, back, breadcrumb, description, actions, scrolled }: {
  title: string; icon?: ReactNode; status?: ReactNode; back?: { label: string; onBack: () => void }; breadcrumb?: { label: string; href: string }[];
  description?: string; actions?: ReactNode; scrolled?: boolean;
}) {
  return (
    <header className={`ds-page-header${scrolled ? ' ds-page-header--scrolled' : ''}`} data-part="container">
      <div className="ds-page-header__lead" data-part="lead">
        {back && <IconButton icon={ArrowLeft} label={`Back to ${back.label}`} onClick={back.onBack} iconSize={24} />}
        <div className="ds-page-header__title">
          {icon && <span className="ds-page-header__icon" aria-hidden="true" data-part="icon">{icon}</span>}
          <div className="ds-page-header__titles">
            {breadcrumb && <Breadcrumb items={breadcrumb} />}
            <h1 className="ds-text-page-title" tabIndex={-1} data-part="title">{title}</h1>
            {description && <p className="ds-text-body-muted">{description}</p>}
          </div>
        </div>
        {status}
      </div>
      {actions && <div className="ds-page-header__actions" data-part="actions">{actions}</div>}
    </header>
  );
}

/** §5.38 breadcrumb [EXTENSION]: links in text-muted, "/" separators in text-faint, current page omitted. */
export function Breadcrumb({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav className="ds-breadcrumb" aria-label="Breadcrumb" data-part="container">
      <ol>
        {items.flatMap((it, i) => [
          i > 0 ? <li key={`s${i}`} aria-hidden="true" data-part={i === 1 ? 'separator' : undefined}>/</li> : null,
          <li key={it.href}><a href={it.href} data-part={i === 0 ? 'link' : undefined}>{it.label}</a></li>,
        ])}
      </ol>
    </nav>
  );
}

/** §5.39 segmented tabs: tablist, roving tabindex, arrows move AND activate (wrapping, RTL-aware). */
export function Tabs<T extends string>({ tabs, value, onChange, label, variant = 'raised', size = 'md', idBase, forceClass, controls }: {
  tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string; variant?: 'raised' | 'accent'; size?: 'md' | 'sm'; idBase: string; forceClass?: Partial<Record<T, string>>;
  /** id of the controlled region; pass `true` when a <TabPanel idBase> follows. Omitted when the tabs re-render a chart in place. */
  controls?: string | true;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const i = tabs.findIndex(t => t.value === value);
    let n = -1;
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = (i + 1) % tabs.length;
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    onChange(tabs[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div className={`ds-tabs${variant === 'accent' ? ' ds-tabs--accent' : ''}${size === 'sm' ? ' ds-tabs--sm' : ''}`} role="tablist" aria-label={label} onKeyDown={onKeyDown} data-part="track">
      {tabs.map((t, i) => (
        <button key={t.value} ref={el => { refs.current[i] = el; }} type="button" role="tab" id={`${idBase}-tab-${t.value}`}
          aria-selected={t.value === value} aria-controls={controls === true ? `${idBase}-panel` : controls} tabIndex={t.value === value ? 0 : -1}
          className={`ds-tab ${forceClass?.[t.value] ?? ''}`.trim()} onClick={() => onChange(t.value)} data-part="tab">
          <span className="ds-tab__label" data-label={t.label}>{t.label}</span>
          {t.count !== undefined && variant === 'raised' && <span className="ds-tab__count" data-part="count">({t.count.toLocaleString('en-GB')})</span>}
        </button>
      ))}
    </div>
  );
}
export function TabPanel({ idBase, value, children }: { idBase: string; value: string; children: ReactNode }) {
  return <div role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${value}`} tabIndex={0} className="ds-tabpanel">{children}</div>;
}

/** §5.40 pagination: first, last, current ±1 and "…" once there are more than 7 pages. */
export function pageList(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter(p => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => { if (i && p - sorted[i - 1] > 1) out.push('…'); out.push(p); });
  return out;
}
export function Pagination({ page, pageSize, total, noun, onPage }: { page: number; pageSize: number; total: number; noun: string; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const navRef = useRef<HTMLElement>(null);
  const go = (p: number) => {
    onPage(p);
    // §5.55: keep focus on the activated button; if it becomes disabled, focus the current page.
    window.setTimeout(() => {
      const active = document.activeElement as HTMLButtonElement | null;
      if (!active || active.disabled || !navRef.current?.contains(active)) navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    }, 0);
  };
  return (
    <div className="ds-pagination" data-part="container">
      <p className="ds-pagination__summary" data-part="summary">Showing <strong>{from} – {to}</strong> of <strong>{total.toLocaleString('en-GB')}</strong> {noun}</p>
      <nav ref={navRef} aria-label="Pagination">
        <div className="ds-pagination__pages" data-part="pages">
          <button type="button" className="ds-page-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><Icon icon={ChevronLeft} size={16} dir /></button>
          <span className="ds-pagination__compact">Page {page} of {pages}</span>
          {pageList(page, pages).map((p, i) => p === '…'
            ? <span key={`e${i}`} className="ds-page-btn ds-page-btn--ellipsis" aria-hidden="true">…</span>
            : <button key={p} type="button" className="ds-page-btn ds-page-btn--num" aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p}`} onClick={() => go(p)}>{p}</button>)}
          <button type="button" className="ds-page-btn" aria-label="Next page" disabled={page >= pages} onClick={() => go(page + 1)}><Icon icon={ChevronRight} size={16} dir /></button>
        </div>
      </nav>
      <p className="ds-sr-only" role="status">Page {page} of {pages}</p>
    </div>
  );
}

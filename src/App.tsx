import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Link2, Menu, X } from 'lucide-react';
import { useRoute, href } from './lib/router';
import { ALL_ITEMS, NAV } from './docs/registry';
import { PageHeader } from './components/ds/Nav';
import { SearchInput } from './components/ds/Field';
import { Select } from './components/ds/Select';
import { IconButton } from './components/ds/Button';
import { ToastRegion } from './components/ds/Toast';
import { Icon } from './components/ds/Icon';
import { copyText } from './lib/copy';
import { LiveViewApp } from './apps/vision/LiveView';
import { FactoriesApp } from './apps/vision/Factories';
import { CamerasApp } from './apps/vision/Cameras';
import { UsersApp } from './apps/vision/Users';
import { AnalyticsApp } from './apps/vision/Analytics';
import { ProductMasterApp } from './apps/vision/ProductMaster';

/** The eight Figma frames (§12). Each route renders the frame state; every control stays interactive. */
export const APP_ROUTES: Record<string, () => React.ReactNode> = {
  '/apps/live-view': () => <LiveViewApp />,
  '/apps/factories': () => <FactoriesApp />,
  '/apps/add-factory': () => <FactoriesApp key="add-factory" flow="add-factory" />,
  '/apps/cameras': () => <CamerasApp />,
  '/apps/add-cameras': () => <FactoriesApp key="add-cameras" flow="add-cameras" />,
  '/apps/users': () => <UsersApp />,
  '/apps/analytics': () => <AnalyticsApp />,
  '/apps/add-product': () => <ProductMasterApp key="add-product" adding />,
  '/apps/product-master': () => <ProductMasterApp />,
};

function useHtmlAttr(attr: 'data-density' | 'data-contrast' | 'data-theme' | 'dir', key: string, fallback: string) {
  const [v, setV] = useState(() => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } });
  useEffect(() => {
    const el = document.documentElement;
    if (attr === 'dir') el.setAttribute('dir', v);
    else if (v === fallback) el.removeAttribute(attr); else el.setAttribute(attr, v);
    try { localStorage.setItem(key, v); } catch { /* storage unavailable */ }
  }, [v, attr, key, fallback]);
  return [v, setV] as const;
}

function DocsNav({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  const [q, setQ] = useState('');
  const groups = useMemo(() => NAV.map(g => ({ ...g, items: g.items.filter(i => !q || `${i.title} ${i.keywords ?? ''} ${g.label}`.toLowerCase().includes(q.toLowerCase())) })).filter(g => g.items.length), [q]);
  const count = groups.reduce((s, g) => s + g.items.length, 0);
  return (
    <nav className="docs-nav" aria-label="Documentation">
      <div className="docs-nav__brand">
        <span className="ds-sidebar__logo" aria-hidden="true"><Icon icon={BookOpen} size={20} /></span>
        <span><span className="ds-sidebar__name">Design System</span><span className="ds-sidebar__tagline docs-block">Vision Automation</span></span>
      </div>
      <div className="docs-nav__search"><SearchInput value={q} onValueChange={setQ} label="Search the documentation" placeholder="Search components…" /></div>
      <p className="ds-sr-only" role="status">{q ? `${count} results` : ''}</p>
      <div className="docs-nav__scroll">
        {groups.map(g => (
          <div key={g.label} className="ds-nav__section">
            <p className="ds-nav__label docs-nav__group">{g.label}</p>
            <ul className="docs-nav__list">
              {g.items.map(i => (
                <li key={i.path}><a className="ds-nav__item docs-nav__item" href={href(i.path)} aria-current={i.path === path ? 'page' : undefined} onClick={onNavigate}><span className="ds-nav__text">{i.title}</span></a></li>
              ))}
            </ul>
          </div>
        ))}
        {!groups.length && <p className="ds-text-body-muted docs-nav__empty">No pages match "{q}".</p>}
      </div>
    </nav>
  );
}

// Route list for scripts/check-browser.mjs (automated QA visits every page).
(window as unknown as { __DS_ROUTES__: string[] }).__DS_ROUTES__ = [...ALL_ITEMS.map(i => i.path), ...Object.keys(APP_ROUTES)];

export default function App() {
  const path = useRoute();
  const [density, setDensity] = useHtmlAttr('data-density', 'ds-density', 'dense');
  const [contrast, setContrast] = useHtmlAttr('data-contrast', 'ds-contrast', 'default');
  const [dir, setDir] = useHtmlAttr('dir', 'ds-dir', 'ltr');
  const [theme, setTheme] = useHtmlAttr('data-theme', 'ds-theme', 'dark');
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const content = useRef<HTMLElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const item = ALL_ITEMS.find(i => i.path === path);

  useEffect(() => {
    if (APP_ROUTES[path]) return;
    content.current?.scrollTo({ top: 0 });
    setScrolled(false);
    document.title = `${item?.title ?? 'Not found'} · Vision Automation Design System`;
    const h1 = document.querySelector<HTMLElement>('#docs-content h1');
    if (h1 && document.activeElement !== document.body) h1.focus();
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!drawer) return;
    const scopes = document.querySelectorAll<HTMLElement>('[data-inert-scope]');
    scopes.forEach(s => { s.inert = true; });
    return () => { scopes.forEach(s => { s.inert = false; }); menuBtn.current?.focus(); };
  }, [drawer]);

  if (APP_ROUTES[path]) return <>{APP_ROUTES[path]()}</>;

  return (
    <div className="ds-shell docs-shell" id="ds-overlay-host">
      <a className="app-skip" href="#docs-content" onClick={e => { e.preventDefault(); document.getElementById('docs-content')?.focus(); }}>Skip to content</a>
      <aside className="docs-rail" data-inert-scope><DocsNav path={path} /></aside>
      <div className="ds-main" id="ds-main">
        <div className="ds-topbar" data-inert-scope>
          <button ref={menuBtn} type="button" className="ds-icon-btn" aria-label="Open navigation" aria-expanded={drawer} aria-controls="docs-drawer" onClick={() => setDrawer(true)}><Icon icon={Menu} size={20} /></button>
          <span className="ds-sidebar__name">Design System</span><span />
        </div>
        <div className="docs-main" data-inert-scope>
          <PageHeader title={item?.title ?? 'Page not found'} description={item?.description} scrolled={scrolled} actions={
            <div className="docs-utils">
              <Select variant="filter" label="Theme" className="ds-select--160" value={theme} onChange={setTheme} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} searchable={false} />
              <Select variant="filter" label="Density" className="ds-select--160" value={density} onChange={setDensity} options={[{ value: 'dense', label: 'Default density' }, { value: 'compact', label: 'Compact' }]} searchable={false} />
              <Select variant="filter" label="Contrast" className="ds-select--180" value={contrast} onChange={setContrast} options={[{ value: 'default', label: 'Default contrast' }, { value: 'more', label: 'Boundary mode' }]} searchable={false} />
              <Select variant="filter" label="Direction" className="ds-select--160" value={dir} onChange={setDir} options={[{ value: 'ltr', label: 'LTR' }, { value: 'rtl', label: 'RTL' }]} searchable={false} />
              <IconButton icon={Link2} label="Copy link to this page" onClick={() => copyText(window.location.href, 'Link copied')} />
            </div>
          } />
          <main id="docs-content" ref={content} className="ds-page-content docs-content" tabIndex={-1} onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 0)}>
            {item ? <Fragment key={path}>{item.render()}</Fragment> : <div className="ds-empty ds-empty--first-use"><p className="ds-text-card-title">Page not found</p><p className="ds-text-body-muted">No page exists at {path}.</p><a className="ds-btn ds-btn--primary" href={href('/')}>Go to Introduction</a></div>}
          </main>
        </div>
        <ToastRegion />
        {drawer && (
          <div className="ds-overlay app-drawer-overlay" role="dialog" aria-modal="true" aria-label="Navigation" id="docs-drawer" onKeyDown={e => { if (e.key === 'Escape') setDrawer(false); }}>
            <div className="ds-overlay__backdrop" aria-hidden="true" />
            <div className="app-drawer docs-drawer">
              <div className="app-drawer__close"><IconButton icon={X} label="Close navigation" onClick={() => setDrawer(false)} tooltip={false} /></div>
              <DocsNav path={path} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

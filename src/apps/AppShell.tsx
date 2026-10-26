import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { PageHeader, Sidebar, type NavEntry } from '../components/ds/Nav';
import { IconButton } from '../components/ds/Button';
import { Avatar } from '../components/ds/Display';
import { ToastRegion } from '../components/ds/Toast';
import { Icon } from '../components/ds/Icon';

/**
  §6.1 application shell: gradient viewport with ambient glows, 16px padding, 12px gap, 256px glass sidebar + glass main panel.
  Only the content scrolls; overlays mount on the shell (#ds-overlay-host) so their scrim also covers the sidebar (R-12).
  Below 1024px (§8.2) the sidebar becomes a start-edge drawer opened from a 56px top bar.
*/
export function AppShell({ product, tagline, logo, sections, current, onNavigate, title, icon, status, actions, back, description, children, user, overlays }: {
  product: string; tagline: string; logo: ReactNode; sections: { label: string; items: NavEntry[] }[]; current: string; onNavigate: (id: string) => void;
  title: string; icon?: ReactNode; status?: ReactNode; actions?: ReactNode; back?: { label: string; onBack: () => void }; description?: string; children: ReactNode;
  user: { name: string; role: string; src?: string }; overlays?: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const frame = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('frame') === '1';

  useEffect(() => { document.title = `${title} · ${product}`; }, [title, product]);
  useEffect(() => {
    if (!drawer) return;
    const scopes = document.querySelectorAll<HTMLElement>('[data-inert-scope]');
    scopes.forEach(s => { s.inert = true; });
    drawerRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    return () => { scopes.forEach(s => { s.inert = false; }); menuBtn.current?.focus(); };
  }, [drawer]);

  const nav = (id: string) => { setDrawer(false); if (id === '__showcase') window.location.hash = '#/apps'; else onNavigate(id); };
  const allSections = frame ? sections : [...sections, { label: 'Showcase', items: [{ id: '__showcase', label: 'Back to Showcase', icon: <Icon icon={ArrowLeft} size={24} dir /> }] }];

  return (
    <div className="ds-shell app-shell" id="ds-overlay-host">
      <a className="app-skip" href="#app-main" onClick={e => { e.preventDefault(); document.getElementById('app-main')?.focus(); }}>Skip to content</a>
      <div className="app-rail" data-inert-scope>
        <Sidebar product={product} tagline={tagline} logo={logo} sections={allSections} current={current} onSelect={nav} user={user} />
      </div>
      <div className="ds-main" id="ds-main">
        <div className="ds-topbar" data-inert-scope>
          <button ref={menuBtn} type="button" className="ds-icon-btn" aria-label="Open navigation" aria-expanded={drawer} aria-controls="app-drawer" onClick={() => setDrawer(true)}><Icon icon={Menu} size={20} /></button>
          <span className="ds-sidebar__name">{product}</span>
          <Avatar name={user.name} variant="photo" src={user.src} />
        </div>
        <div className="app-content" data-inert-scope>
          <PageHeader title={title} icon={icon} status={status} actions={actions} back={back} description={description} scrolled={scrolled} />
          <main id="app-main" tabIndex={-1} className="ds-page-content" onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 0)}>{children}</main>
        </div>
        <ToastRegion />
      </div>
      {overlays}
      {drawer && (
        <div className="ds-overlay ds-overlay--fixed app-drawer-overlay" role="dialog" aria-modal="true" aria-label="Navigation" id="app-drawer"
          onKeyDown={e => { if (e.key === 'Escape') setDrawer(false); }}>
          <div className="ds-overlay__backdrop" aria-hidden="true" />
          <div ref={drawerRef} className="app-drawer">
            <div className="app-drawer__close"><IconButton icon={ArrowLeft} label="Close navigation" onClick={() => setDrawer(false)} tooltip={false} /></div>
            <Sidebar product={product} tagline={tagline} logo={logo} sections={allSections} current={current} onSelect={nav} user={user} collapsible={false} />
          </div>
        </div>
      )}
    </div>
  );
}

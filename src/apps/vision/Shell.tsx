import type { ReactNode } from 'react';
import { AppShell } from '../AppShell';
import { Illustration } from '../../components/ds/Display';
import { toast } from '../../components/ds/Toast';
import { USER, asset } from './data';

export type VisionPage = 'live' | 'factories' | 'lines' | 'analytics' | 'product-master' | 'cameras' | 'users' | 'activity';

const ROUTE: Partial<Record<VisionPage, string>> = {
  live: '/apps/live-view', factories: '/apps/factories', analytics: '/apps/analytics',
  'product-master': '/apps/product-master', cameras: '/apps/cameras', users: '/apps/users',
};

/** Navigation illustrations exactly as placed in the Figma sidebar (24px; crop / fit per frame). */
export const NAV_ICON: Record<VisionPage, ReactNode> = {
  live: <Illustration name="illus.camera" size={24} />,
  factories: <Illustration name="illus.facility-set" crop="factory" size={24} />,
  lines: <Illustration name="illus.conveyor-line" size={24} />,
  analytics: <Illustration name="illus.analytics-board" size={24} />,
  'product-master': <Illustration name="illus.catalog-item" size={24} />,
  cameras: <Illustration name="illus.camera" size={24} />,
  users: <Illustration name="illus.user-group" size={24} fit="cover" />,
  activity: <Illustration name="illus.activity-document" size={24} />,
};
const LABEL: Record<VisionPage, string> = {
  live: 'Live View', factories: 'Factories', lines: 'Lines', analytics: 'Analytics', 'product-master': 'Product Master', cameras: 'Cameras', users: 'User Management', activity: 'Activity Log',
};
const entry = (id: VisionPage) => ({ id, label: LABEL[id], icon: NAV_ICON[id], href: ROUTE[id] ? `#${ROUTE[id]}` : undefined });

/** The DEOC shell. `withLines` reproduces frames 5 and 8, whose sidebar also lists "Lines" [PRODUCT DECISION, R-22]. */
export function VisionShell({ current, withLines, ...rest }: {
  current: VisionPage; withLines?: boolean; title: string; icon?: ReactNode; status?: ReactNode; actions?: ReactNode; children: ReactNode; overlays?: ReactNode;
}) {
  const general: VisionPage[] = withLines ? ['live', 'factories', 'lines', 'analytics'] : ['live', 'factories', 'analytics'];
  return (
    <AppShell product="Unilever" tagline="Vision Automation" logo={<img src={asset('logo-unilever.svg')} alt="" />}
      sections={[{ label: 'General', items: general.map(entry) }, { label: 'Admin', items: (['product-master', 'cameras', 'users', 'activity'] as VisionPage[]).map(entry) }]}
      current={current} user={USER}
      onNavigate={id => {
        const r = ROUTE[id as VisionPage];
        if (r) window.location.hash = `#${r}`;
        else toast(`${LABEL[id as VisionPage]} is not one of the eight reference screens`);
      }}
      {...rest} />
  );
}

import { href } from '../../lib/router';
import { APPS } from '../registry';
import { Prov } from '../kit';

/** Index of the eight Figma reference screens. Thumbnails come from `node scripts/shoot-apps.mjs` (public/app-shots). */
export function AppsIndex() {
  return (
    <div className="doc-page">
      <p className="ds-text-body doc-lead">Each Figma reference frame is implemented as an interactive screen built only from the system's tokens and components, with local demo data. Each opens full screen; the sidebar navigates between them.</p>
      <div className="app-index">{APPS.map(a => (
        <a key={a.id} className="app-index__card" href={href(`/apps/${a.id}`)}>
          <img className="app-index__shot" src={`${import.meta.env.BASE_URL}app-shots/${a.id}.jpg`} alt="" loading="lazy" onError={e => { e.currentTarget.hidden = true; }} />
          <span className="ds-text-card-title">{a.title}</span>
          <span className="ds-text-small">Figma node {a.frame}</span>
          <span className="ds-text-body-muted">{a.description}</span>
          <span className="ds-link-action">Open screen</span>
        </a>
      ))}</div>
      <Prov tag="PRODUCT DECISION" /><p className="ds-text-small">Where a frame is internally inconsistent, the screen follows the resolution log (R-01…R-27 in DESIGN_SYSTEM.md §11) and says so.</p>
    </div>
  );
}

import { useState } from 'react';
import { Cctv, Cpu, Factory, Workflow } from 'lucide-react';
import { VisionShell } from './Shell';
import { LIVE } from './data';
import { Button } from '../../components/ds/Button';
import { Select } from '../../components/ds/Select';
import { LiveBadge, Badge } from '../../components/ds/Display';
import { FieldList, HealthRow, MediaCard, PanelCard, SummaryStrip } from '../../components/ds/Cards';
import { ConfirmDialog, MediaViewer } from '../../components/ds/Overlay';
import { Camera, Changeover, Package, QrCode, Tag } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';

const FACTORY_OPTS = ['Factory 1 (Main)', 'Factory 2', 'Factory 3', 'Factory 4', 'Factory 5', 'Factory 6'].map(v => ({ value: v, label: v }));
const LINE_OPTS = ['Line 1 - Standard', 'Line 2 - Standard', 'Line 3 - High Speed', 'Line 4 - Standard'].map(v => ({ value: v, label: v }));
const ICONS = [Camera, QrCode, Tag, Package];

/** Frame 1 · Live View (459:11379): monitoring view — 2 × 2 camera tiles + side panel. */
export function LiveViewApp() {
  const [factory, setFactory] = useState('Factory 1 (Main)');
  const [line, setLine] = useState('Line 3 - High Speed');
  const [confirm, setConfirm] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const v = viewer === null ? null : LIVE.cameras[viewer];
  return (
    <VisionShell current="live" title={LIVE.sku} status={<LiveBadge />}
      actions={<>
        <Select variant="filter" leadIcon={Factory} className="ds-select--180" label="Factory" value={factory} onChange={setFactory} options={FACTORY_OPTS} searchable={false} />
        <Select variant="filter" leadIcon={Workflow} className="ds-select--180" label="Line" value={line} onChange={setLine} options={LINE_OPTS} searchable={false} />
        <Button leading={Changeover} onClick={() => setConfirm(true)}>Line Changeover</Button>
      </>}
      overlays={<>
        <ConfirmDialog open={confirm} tone="primary" title="Start line changeover?" message={`${line} at ${factory} stops inspecting “${LIVE.sku}” until the next SKU is loaded.`}
          confirmLabel="Start Changeover" onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); toast('Line changeover started'); }} />
        {v && <MediaViewer open onClose={() => setViewer(null)} title={v.title} sub={v.sub} src={v.src} badge={<Badge tone={v.status.tone}>{v.status.label}</Badge>}
          footer={<p className={`ds-media-card__detail${v.error ? ' ds-media-card__detail--error' : ''}`}>Detected : <em>{v.detected}</em></p>} />}
      </>}>
      <div className="ds-monitor">
        <div className="ds-media-grid">
          {LIVE.cameras.map((c, i) => (
            <MediaCard key={c.title} title={c.title} sub={c.sub} src={c.src} icon={ICONS[i]} status={c.status} detected={c.detected} detectedError={c.error}
              frame={c.error ? { left: '36%', top: '31%', width: '54%', height: '39%' } : undefined} onOpen={() => setViewer(i)} />
          ))}
        </div>
        <aside className="ds-monitor__aside" aria-label="Running SKU">
          <SummaryStrip layout="stacked" eyebrow={LIVE.line} title={LIVE.sku} />
          <PanelCard label="Reference Barcodes"><FieldList items={LIVE.barcodes} /></PanelCard>
          <PanelCard label="System Health">
            <HealthRow icon={Workflow} label="Production Line" status={{ tone: 'error', label: 'Stopped' }} />
            <HealthRow icon={Cctv} label="Cameras" status={{ tone: 'success', label: 'Active' }} />
            <HealthRow icon={Cpu} label="Devices" status={{ tone: 'success', label: 'Active' }} />
          </PanelCard>
        </aside>
      </div>
    </VisionShell>
  );
}

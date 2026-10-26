// "How to customize" for one chart's Figma asset — written for designers, generated from the capability matrix.
import { COVERAGE, modeSteps } from './coverage';

const ROWS: [keyof typeof COVERAGE[string]['howTo'], string][] = [
  ['resize', 'Resize'], ['labels', 'Labels and colours'], ['categories', 'Add or remove categories'],
  ['values', 'Change values'], ['data', 'New data → regenerate from the Showcase?'], ['compact', 'Compact layouts (manual step)'],
];

export function HowToCustomize({ id, collapsible = false }: { id: string; collapsible?: boolean }) {
  const c = COVERAGE[id];
  if (!c) return null;
  // Width-mode steps stay visible (outside the collapsed details) for the charts that need a manual Chart width switch.
  const modes = c.modeBelow !== null && <div className="cl-modes" aria-label="Chart width mode to select in Figma">
    <p className="ds-text-small"><b>Figma width mode needed below {c.modeBelow} px</b> — set the card’s “Chart width” mode:</p>
    <ul>{modeSteps(c.modeBelow).map(([w, m]) => <li key={m} className="ds-text-small">{w} → <b>{m}</b></li>)}<li className="ds-text-small">{c.modeBelow} px and wider → <b>≥ 640 px</b> (default)</li></ul>
  </div>;
  const list = <dl className="pg-howto">{ROWS.map(([k, t]) => <div key={k}><dt className="ds-text-small">{t}</dt><dd className="ds-text-small">{c.howTo[k]}</dd></div>)}</dl>;
  return collapsible
    ? <>{modes}<details className="cl-howto"><summary className="ds-text-small">How to customize in Figma</summary>{list}</details></>
    : <section aria-label="How to customize in Figma"><p className="ds-text-card-title">How to customize in Figma</p>{modes}{list}</section>;
}

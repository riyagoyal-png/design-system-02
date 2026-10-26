// Serialises a rendered chart as a self-contained SVG for the Figma templates: computed colours and type are inlined
// and every text records its anchor, so the importer can bind variables / text styles and pin labels on anchors.
// Used by the Playground's "Download SVG for Figma" button and by the template regeneration script (window.__exportChartSvg).

export interface ExportedSvg { W: number; H: number; svg: string; texts: { t: string | null; anchor: string; cx: number; w: number }[] }

/** The largest <svg> inside `root` (the chart drawing, not legend swatches). */
export function exportChartSvg(root: Element): ExportedSvg | null {
  const area = (e: Element) => { const r = e.getBoundingClientRect(); return r.width * r.height; };
  const svg = [...root.querySelectorAll('svg')].sort((a, b) => area(b) - area(a))[0];
  if (!svg) return null;
  const W = Math.round(svg.getBoundingClientRect().width), H = Math.round(svg.getBoundingClientRect().height);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const src = [...svg.querySelectorAll('*')], dst = [...clone.querySelectorAll('*')];
  const texts: ExportedSvg['texts'] = [];
  src.forEach((el, i) => {
    const d = dst[i], cs = getComputedStyle(el);
    for (const a of ['class', 'role', 'tabindex', 'aria-label', 'aria-hidden', 'aria-describedby', 'style']) d.removeAttribute(a);
    if (el.tagName === 'g' || el.tagName === 'defs' || el.tagName === 'marker') return;
    const fill = cs.fill, stroke = cs.stroke;
    d.setAttribute('fill', fill === 'none' || /, 0\)$/.test(fill) || el.tagName === 'line' || el.tagName === 'polyline' ? 'none' : fill);
    if (stroke && stroke !== 'none') { d.setAttribute('stroke', stroke); d.setAttribute('stroke-width', cs.strokeWidth); if (cs.strokeDasharray && cs.strokeDasharray !== 'none') d.setAttribute('stroke-dasharray', cs.strokeDasharray.replace(/px/g, '')); }
    const op = +cs.opacity * +(el.getAttribute('fill-opacity') ?? cs.fillOpacity ?? 1) * (stroke !== 'none' && fill === 'none' ? +(cs.strokeOpacity ?? 1) : 1);
    d.removeAttribute('fill-opacity'); d.removeAttribute('stroke-opacity'); d.removeAttribute('opacity');
    if (op < 0.999) d.setAttribute('opacity', op.toFixed(3));
    if (el.tagName === 'text') {
      d.setAttribute('font-family', 'Inter'); d.setAttribute('font-size', cs.fontSize.replace('px', '')); d.setAttribute('font-weight', cs.fontWeight);
      d.setAttribute('letter-spacing', cs.letterSpacing === 'normal' ? '0' : cs.letterSpacing.replace('px', ''));
      const b = (el as SVGTextElement).getBBox(); texts.push({ t: el.textContent, anchor: el.getAttribute('text-anchor') || 'start', cx: b.x + b.width / 2, w: b.width });
    }
  });
  clone.setAttribute('width', String(W)); clone.setAttribute('height', String(H)); clone.setAttribute('viewBox', `0 0 ${W} ${H}`); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return { W, H, svg: clone.outerHTML.replace(/<!--.*?-->/g, ''), texts };
}

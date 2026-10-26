import { useEffect, useState } from 'react';
import { spec } from './spec';

/** Resolve a custom property as the browser computes it right now (follows density mode). */
export function resolveToken(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Re-render when density changes so resolved values stay accurate. */
export function useDensity(): string {
  const [d, setD] = useState(() => document.documentElement.dataset.density ?? 'dense');
  useEffect(() => {
    const obs = new MutationObserver(() => setD(document.documentElement.dataset.density ?? 'dense'));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-density'] });
    return () => obs.disconnect();
  }, []);
  return d;
}

/** Expand spec shorthand ("surface-card", "shadow-card", "space-4") to a declared custom property. */
export function expandShorthand(short: string): string | null {
  const s = short.replace(/^--ds-/, '');
  const candidates = [`--ds-${s}`, `--ds-color-${s}`];
  return candidates.find(c => c in spec.declared) ?? null;
}

export const allTokens = Object.keys(spec.declared);

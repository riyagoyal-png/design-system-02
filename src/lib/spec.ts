import raw from '../generated/spec.json';

export interface SpecSection { id: string; num: string | null; level: number; title: string; line: number; body: string }
export interface TextStyle { name: string; family: string; size: string; weight: string; lineHeight: string; tracking: string; transform: string; color: string; usage: string }
export interface AssetEntry { name: string; note: string; frames: number; depicts: string; purpose: string; file: string; master: string; display: string; fallback: string }
export interface Primitive { group: string; name: string; value: string; use: string }

interface Spec {
  lineCount: number;
  cssBlocks: { line: number; section: string; css: string }[];
  sections: SpecSection[];
  declared: Record<string, string>;
  declaredGroup: Record<string, string>;
  tokenDocs: Record<string, { section: string; value: string; use: string }>;
  primitives: Primitive[];
  textStyles: TextStyle[];
  registry: AssetEntry[];
  crops: { id: string; asset: string; w: string; h: string; l: string; t: string; where: string }[];
  decisions: { id: string; decision: string; recommendation: string; ref: string }[];
}

export const spec = raw as unknown as Spec;

/** A §-numbered section (e.g. "5.23"), or a sub-heading by its exact title. */
export function section(numOrTitle: string): SpecSection | undefined {
  return spec.sections.find(s => s.num === numOrTitle) ?? spec.sections.find(s => s.title === numOrTitle || s.title.startsWith(numOrTitle));
}

/** Spec CSS blocks that belong to a section (by heading title prefix). */
export function cssFor(num: string): string[] {
  const sec = section(num);
  if (!sec) return [];
  return spec.cssBlocks.filter(b => b.section === sec.title).map(b => b.css.trim());
}

export function tokenUse(name: string): string {
  return spec.tokenDocs[name]?.use ?? '';
}

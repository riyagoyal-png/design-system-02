import type { ReactNode } from 'react';
import { Anatomy, CodeBlock, DocSection, Playground, Preview, Prov, SpecCode, SpecSource, SpecTable, type Control, type Props, type SpecRow } from './kit';

export type ProvTag = 'OBSERVED' | 'PRESERVED' | 'STANDARDIZED' | 'EXTENSION' | 'INFERRED' | 'PRODUCT DECISION';

/**
  A component documentation entry. Coverage in the Visual QA page is computed from which fields are present,
  so a component is only reported as having variants / states / a playground when the page really renders them.
*/
export interface ComponentDoc {
  path: string;
  title: string;
  refs: string[];                 // spec sections, first is primary
  summary: string;
  provenance: ProvTag;
  derivedCss?: boolean;           // true when the spec section has no CSS blueprint
  preview: () => ReactNode;
  previewSurface?: 'shell' | 'card';
  variants?: () => ReactNode;
  unsupported?: string[];         // variants a reader might expect that the spec does not define
  states?: () => ReactNode;
  anatomy?: { render: () => ReactNode; parts: { part: string; label: string; spec: string }[]; surface?: 'shell' | 'card' };
  spec?: SpecRow[];
  playground?: { controls: Control[]; initial: Props; render: (p: Props) => ReactNode; code: (p: Props) => string; surface?: 'shell' | 'card' };
  usage?: string;
  behavior?: ReactNode;
  /** Why the component has no interactive states (static per §5.54). */
  staticComponent?: string;
  /** Why no variants are shown (the spec defines none). */
  noVariants?: string;
  notes?: ReactNode;
}

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const surface = doc.previewSurface ?? 'shell';
  return (
    <div className="doc-page">
      <div className="doc-meta">
        <Prov tag={doc.provenance} />
        {doc.derivedCss && <Prov tag="DERIVED CSS" />}
        <span className="ds-text-small">Spec: {doc.refs.map(r => `§${r}`).join(' · ')}</span>
      </div>

      <DocSection id="preview" title="Live preview">
        <Preview surface={surface} center>{doc.preview()}</Preview>
      </DocSection>

      {doc.variants && (
        <DocSection id="variants" title="Variants" description="Every variant defined in the specification, side by side.">
          {doc.variants()}
          {doc.unsupported?.length ? (
            <div className="doc-unsupported">
              <Prov tag="UNSUPPORTED" />
              <p className="ds-text-body-muted">Not defined by the specification, so not rendered: {doc.unsupported.join('; ')}.</p>
            </div>
          ) : null}
        </DocSection>
      )}

      {!doc.variants && doc.noVariants && (
        <DocSection id="variants" title="Variants"><p className="ds-text-body-muted">No variants: {doc.noVariants}</p></DocSection>
      )}

      {!doc.states && doc.staticComponent && (
        <DocSection id="states" title="States"><p className="ds-text-body-muted">{doc.staticComponent}</p></DocSection>
      )}

      {doc.states && (
        <DocSection id="states" title="States" description="Hover and focus are forced with the .is-hover / .is-focus-visible mirror classes generated from the spec CSS, so they can be inspected without a pointer or keyboard.">
          {doc.states()}
        </DocSection>
      )}

      {doc.anatomy && (
        <DocSection id="anatomy" title="Anatomy" description="Numbered outlines are measured from the rendered component.">
          <Anatomy parts={doc.anatomy.parts} surface={doc.anatomy.surface}>{doc.anatomy.render()}</Anatomy>
        </DocSection>
      )}

      {doc.spec && (
        <DocSection id="spec" title="Specification" description="Resolved values are read from the browser's computed custom properties, so they follow the density mode.">
          <SpecTable rows={doc.spec} caption={`${doc.title} specification`} />
        </DocSection>
      )}

      {doc.behavior && <DocSection id="behavior" title="Behavior & accessibility">{doc.behavior}</DocSection>}

      {doc.playground && (
        <DocSection id="playground" title="Playground">
          <Playground {...doc.playground} />
        </DocSection>
      )}

      <DocSection id="code" title="Implementation">
        {doc.usage && <CodeBlock code={doc.usage} title="React usage (this showcase's component)" />}
        <SpecCode num={doc.refs[0]} />
      </DocSection>

      {doc.notes && <DocSection id="notes" title="Notes">{doc.notes}</DocSection>}

      <div className="doc-stack">{doc.refs.map(r => <SpecSource key={r} num={r} />)}</div>
    </div>
  );
}

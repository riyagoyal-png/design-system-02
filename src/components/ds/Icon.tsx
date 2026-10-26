import type { LucideIcon, LucideProps } from 'lucide-react';

/** §2.11-E: one outline set (Lucide), 1.5px stroke, round caps, currentColor, decorative. */
export function Icon({ icon: Glyph, size = 20, strokeWidth = 1.5, dir, ...rest }: { icon: LucideIcon; size?: number; dir?: boolean } & LucideProps) {
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" className={dir ? 'ds-icon--dir' : undefined} {...rest} />;
}

/** §5.9 select chevron: 18px box, 7.2 × 3.6 glyph, 1.35px round stroke, icon-chevron color. */
export function Chevron({ className = 'ds-select__chevron' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M5.4 7.2 9 10.8l3.6-3.6" stroke="var(--ds-color-icon-chevron)" strokeWidth="1.35" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** §5.11 check path (10×8). */
export function CheckMark() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true">
      <path d="M1 4l2.5 2.5L9 1" stroke="var(--ds-color-text-on-brand)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** §5.12 indeterminate bar: 8 × 1.6. */
export function IndeterminateMark() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true">
      <path d="M1 4h8" stroke="var(--ds-color-text-on-brand)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** §5.13 radio glyph (20px): filled ring when on, outline ring when off. */
export function RadioGlyph({ on }: { on: boolean }) {
  return (
    <svg className="ds-radio-glyph" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {on && <circle cx="10" cy="10" r="4" fill="currentColor" />}
    </svg>
  );
}

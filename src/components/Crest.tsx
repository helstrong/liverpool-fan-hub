// Fallback crest, shown only when the data source hasn't supplied a badge
// (sample mode, or a missing image). Points at the same bundled artwork the
// favicon and app icons use, so the club mark is identical everywhere rather
// than a lookalike drawn in SVG.
export default function Crest({ className }: { className?: string }) {
  return <img src="/crest.png" alt="" aria-hidden="true" className={`object-contain ${className ?? ''}`} />
}

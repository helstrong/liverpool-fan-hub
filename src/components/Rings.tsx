// The design's decorative motif: two oversized rings bleeding off the corners
// of the hero sections, in the club's accent pair. Sized in percentages rather
// than the design's fixed pixels so the spacing survives the app being
// responsive rather than a 390px frame. Purely decorative.
export default function Rings({ className = 'opacity-[0.14]' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -right-10 -top-14 aspect-square w-[55%] max-w-[220px] rounded-full border-[14px] border-lfc-yellow" />
      <div className="absolute -bottom-20 -left-12 aspect-square w-[42%] max-w-[170px] rounded-full border-[12px] border-lfc-teal" />
    </div>
  )
}

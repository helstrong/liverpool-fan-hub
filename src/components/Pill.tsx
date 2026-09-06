import type { ReactNode } from 'react'

// The filter/selector pill shared by Squad positions, Standings competitions and
// News sorting. Yellow when active — the club colour marks the current choice
// everywhere it's offered.
export default function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? 'bg-lfc-yellow text-lfc-maroon'
          : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.16]'
      }`}
    >
      {children}
    </button>
  )
}

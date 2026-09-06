import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-lfc-maroon p-4 ${className}`}>
      {children}
    </div>
  )
}

// Small caps, wide tracking, dimmed — the section label sits quietly above its
// content so the broadcast-scale numbers inside stay the loudest thing on screen.
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/55">
        {children}
      </h2>
      {action}
    </div>
  )
}

// The yellow "Full table →" affordance that sits opposite a SectionTitle. A
// class string rather than a component because it's worn by both plain anchors
// and react-router Links.
export const sectionLinkClass = 'shrink-0 text-[11px] font-semibold text-lfc-yellow hover:underline'

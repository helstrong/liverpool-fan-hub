import type { ReactNode } from 'react'

// The condensed, uppercase page title used across Fixtures / Table / Squad /
// News, with room for that page's own control (season picker, sort toggle).
export default function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
      <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-[0.02em]">
        {title}
      </h1>
      {children}
    </div>
  )
}

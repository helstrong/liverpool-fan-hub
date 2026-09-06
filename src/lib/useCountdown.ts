import { useEffect, useState } from 'react'

export interface Countdown {
  days: string
  hours: string
  minutes: string
  seconds: string
  /** True once kick-off has passed — the clock holds at zero rather than going negative. */
  started: boolean
}

// Drives the matchday countdown on the Home hero. Ticks once a second, but only
// while there's actually a date to count down to, so the offseason (no upcoming
// fixture) doesn't leave a timer running for nothing.
export function useCountdown(target?: string): Countdown | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target) return null
  const at = +new Date(target)
  if (!Number.isFinite(at)) return null

  const diff = Math.max(0, at - now)
  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    days: pad(Math.floor(diff / 86_400_000)),
    hours: pad(Math.floor(diff / 3_600_000) % 24),
    minutes: pad(Math.floor(diff / 60_000) % 60),
    seconds: pad(Math.floor(diff / 1000) % 60),
    started: diff === 0,
  }
}

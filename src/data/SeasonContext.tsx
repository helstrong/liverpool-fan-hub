import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { loadSeason } from './api'
import type { CompetitionStandings, SeasonData } from './api'
import { SEASON } from './config'
import { archivedSeasons } from './theSportsDb'

type Status = 'loading' | 'ready' | 'error'

interface SeasonContextValue {
  season: string
  setSeason: (s: string) => void
  seasons: string[]
  status: Status
  data: SeasonData | null
  error?: string
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

// A descending list of selectable seasons. Starts one season ahead of the
// current one so the upcoming campaign (with its preseason friendlies) is
// reachable before its table exists, then runs back through everything the
// data source actually archives — for the Premier League that is all the way
// to its first season in 1992-93.
function buildSeasons(from: string): string[] {
  const start = parseInt(from, 10)
  if (!Number.isFinite(start)) return [from]
  return [`${start + 1}-${start + 2}`, ...archivedSeasons(from)]
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState(SEASON)
  const [state, setState] = useState<{ status: Status; data: SeasonData | null; error?: string }>({
    status: 'loading',
    data: null,
  })
  const cache = useRef<Map<string, SeasonData>>(new Map())
  const seasons = useMemo(() => buildSeasons(SEASON), [])

  useEffect(() => {
    let cancelled = false

    const cached = cache.current.get(season)
    if (cached) {
      setState({ status: 'ready', data: cached })
      return
    }

    setState((s) => ({ ...s, status: 'loading' }))
    loadSeason(season)
      .then((data) => {
        if (cancelled) return
        cache.current.set(season, data)
        setState({ status: 'ready', data })
      })
      .catch((e) => {
        if (!cancelled) setState({ status: 'error', data: null, error: String(e?.message ?? e) })
      })

    return () => {
      cancelled = true
    }
  }, [season])

  return (
    <SeasonContext.Provider value={{ season, setSeason, seasons, ...state }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason(): SeasonContextValue {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within <SeasonProvider>')
  return ctx
}

// Tracks which competition tab/dropdown is active, defaulting to the first
// (Süper Lig, when present) and re-selecting it whenever the available
// competitions change — e.g. after switching season. Shared by any view that
// lets the user pick a competition (Standings page, Home's Table card).
export function useSelectedCompetition(
  competitions: CompetitionStandings[],
): [number | null, (id: number) => void] {
  const [id, setId] = useState<number | null>(null)

  useEffect(() => {
    if (!competitions.length) return
    if (id === null || !competitions.some((c) => c.competitionId === id)) {
      setId(competitions[0].competitionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitions])

  return [id, setId]
}

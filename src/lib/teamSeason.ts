import type { Fixture } from '../data/types'

export interface SplitRecord {
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
}

export interface TeamSeason {
  played: number
  overall: SplitRecord
  home: SplitRecord
  away: SplitRecord
  /** Every finished match, newest first. */
  results: Fixture[]
}

const empty = (): SplitRecord => ({ won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 })

const add = (rec: SplitRecord, scored: number, conceded: number) => {
  rec.gf += scored
  rec.ga += conceded
  if (scored > conceded) rec.won++
  else if (scored < conceded) rec.lost++
  else rec.drawn++
}

// One club's season in a competition, split by venue, derived from the fixture
// list the table was already built from. Used by the expandable table rows, so
// any club can be inspected — not just Liverpool.
export function teamSeason(events: Fixture[], teamId: string): TeamSeason {
  const overall = empty()
  const home = empty()
  const away = empty()
  const results: Fixture[] = []

  for (const f of events) {
    if (f.status !== 'finished' || f.homeScore === null || f.awayScore === null) continue
    const isHome = f.home.id === teamId
    const isAway = f.away.id === teamId
    if (!isHome && !isAway) continue

    const scored = isHome ? f.homeScore : f.awayScore
    const conceded = isHome ? f.awayScore : f.homeScore
    add(overall, scored, conceded)
    add(isHome ? home : away, scored, conceded)
    results.push(f)
  }

  results.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  return { played: overall.won + overall.drawn + overall.lost, overall, home, away, results }
}

import { CACHE_TTL_MS, CLUB_ID, IS_FREE_KEY, LEAGUE_ID, SEASON, USE_LIVE } from './config'
import {
  fetchClub,
  fetchCompetitionEvents,
  fetchCompetitionTables,
  fetchFixtures,
  fetchHeadToHead,
  fetchKits,
  fetchPlayerCareer,
  fetchPlayers,
  fetchSeasonFixtures,
  fetchStandings,
  roundRef,
} from './theSportsDb'
import type { CompetitionStandings, KnockoutStage, RoundRef } from './theSportsDb'
import { fetchNews } from './news'
import {
  club as sampleClub,
  fixtures as sampleFixtures,
  kits as sampleKits,
  news as sampleNews,
  players as samplePlayers,
  standings as sampleStandings,
} from './seed'
import type { AppData, Fixture, PlayerCareer } from './types'

export type { CompetitionStandings, KnockoutStage, RoundRef }
export { roundRef, fetchHeadToHead }

// The single entry point every screen reads from. Swap the data source by
// toggling VITE_USE_SAMPLE in .env — the return shape (AppData) never changes.

export { CLUB_ID, IS_FREE_KEY, LEAGUE_ID }

// Season-scoped on purpose: the cached payload holds standings for whichever
// season was current when it was written, but nothing in it records that. When
// the season rolls over (SEASON is derived from the date, so this happens on
// its own every July) an entry written under the old season would otherwise be
// served as if it were current — the hero stats and form card would show the
// previous campaign's final table while the season-scoped Table card, which
// doesn't read this cache, correctly showed the new one. Keying by season makes
// the rollover self-healing instead of a stale-until-TTL bug.
// v6: cached fixtures written before the UTC fix carry kick-off times that
// would still render in the wrong zone, so the old entries have to be retired
// rather than waited out.
const CACHE_KEY = `lfc-fan-hub:data:v6:${SEASON}`

function sampleData(): AppData {
  const byDateAsc = (a: Fixture, b: Fixture) => +new Date(a.date) - +new Date(b.date)
  const finished = [...sampleFixtures].filter((f) => f.status === 'finished').sort(byDateAsc)
  const upcoming = [...sampleFixtures].filter((f) => f.status !== 'finished').sort(byDateAsc)
  return {
    club: sampleClub,
    standings: sampleStandings,
    results: finished.reverse(),
    upcoming,
    players: samplePlayers,
    kits: sampleKits,
    news: sampleNews,
    live: false,
    warnings: [],
  }
}

// Guards against a stale cache crashing the app: if a future change to AppData's
// shape ships without bumping CACHE_KEY, an old cached object would be missing a
// field the new UI expects (e.g. reading .length on undefined) with nothing to
// catch it. Checking the arrays actually exist costs little and means a stale
// shape falls back to a fresh fetch instead of a blank page.
function isValidCache(v: unknown): v is AppData {
  if (!v || typeof v !== 'object') return false
  const d = v as Partial<AppData>
  return (
    Array.isArray(d.standings) &&
    Array.isArray(d.results) &&
    Array.isArray(d.upcoming) &&
    Array.isArray(d.players) &&
    Array.isArray(d.kits) &&
    Array.isArray(d.news)
  )
}

function readCache(): AppData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    if (Date.now() - t > CACHE_TTL_MS) return null
    return isValidCache(v) ? v : null
  } catch {
    return null
  }
}

function writeCache(data: AppData) {
  try {
    // The key now varies by season, so previous seasons' entries (and older
    // schema versions) would linger indefinitely. Drop them as we write.
    for (const key of Object.keys(localStorage))
      if (key.startsWith('lfc-fan-hub:data:') && key !== CACHE_KEY) localStorage.removeItem(key)

    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: data }))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

// Asks the server whether it's running on the free key. Cheap, and the only
// way the browser can know: the key itself never leaves the server.
async function fetchMeta(): Promise<{ freeTier: boolean }> {
  const res = await fetch('/api/meta')
  if (!res.ok) throw new Error(`meta: HTTP ${res.status}`)
  return res.json()
}

export async function loadAll(force = false): Promise<AppData> {
  if (!USE_LIVE) return sampleData()

  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  const [club, standings, fixtures, players, kits, news, meta] = await Promise.allSettled([
    fetchClub(),
    fetchStandings(),
    fetchFixtures(),
    fetchPlayers(),
    fetchKits(),
    fetchNews(),
    fetchMeta(),
  ])

  const warnings: string[] = []
  // Worth saying loudly: on the free key the data isn't wrong so much as
  // truncated — a five-row table and a couple of fixtures — which otherwise
  // just looks like the app being out of date.
  if (meta.status === 'fulfilled' && meta.value.freeTier)
    warnings.push(
      'Limited data — no SPORTSDB_KEY is set on the server, so it fell back to TheSportsDB’s free key, which caps the table to five rows and returns only a handful of fixtures. Note a .env file is not shipped to deployments: set SPORTSDB_KEY in the host’s environment.',
    )
  if (standings.status === 'rejected')
    warnings.push(`Standings unavailable — ${String(standings.reason?.message ?? standings.reason)}`)
  if (fixtures.status === 'rejected')
    warnings.push(`Fixtures unavailable — ${String(fixtures.reason?.message ?? fixtures.reason)}`)
  if (players.status === 'rejected')
    warnings.push(`Squad unavailable — ${String(players.reason?.message ?? players.reason)}`)
  if (news.status === 'rejected')
    warnings.push(`News unavailable — ${String(news.reason?.message ?? news.reason)}`)

  const data: AppData = {
    club: club.status === 'fulfilled' ? club.value : undefined,
    standings: standings.status === 'fulfilled' ? standings.value : [],
    results: fixtures.status === 'fulfilled' ? fixtures.value.results : [],
    upcoming: fixtures.status === 'fulfilled' ? fixtures.value.upcoming : [],
    players: players.status === 'fulfilled' ? players.value : [],
    kits: kits.status === 'fulfilled' ? kits.value : [],
    news: news.status === 'fulfilled' ? news.value : [],
    live: true,
    warnings,
  }

  // If nothing at all came back (provider down / rate-limited), fall back to the
  // bundled sample data so the app is never blank — but keep the warnings.
  if (!data.club && !data.standings.length && !data.results.length && !data.upcoming.length && !data.players.length)
    return { ...sampleData(), warnings: [...warnings, 'Live data unavailable — showing sample data.'] }

  writeCache(data)
  return data
}

// ---- season-scoped data (for the Table + Fixtures season selector) ------
// Independent of the once-loaded AppData: the Home dashboard stays on current
// rolling fixtures while these pages browse any season on demand.
export interface SeasonData {
  competitions: CompetitionStandings[]
  results: Fixture[]
  upcoming: Fixture[]
  warnings: string[]
}

export async function loadSeason(season: string): Promise<SeasonData> {
  if (!USE_LIVE) {
    const s = sampleData()
    return {
      competitions: [
        {
          competitionId: LEAGUE_ID,
          competitionName: 'Süper Lig',
          source: 'official',
          standings: s.standings,
          knockout: [],
          // Sample mode only carries Liverpool's own fixtures, which is enough
          // for the expandable rows to show something real rather than nothing.
          events: [...s.results, ...s.upcoming],
        },
      ],
      results: s.results,
      upcoming: s.upcoming,
      warnings: [],
    }
  }

  // Fetched once and shared: both the fixtures merge and the competition
  // tables (which compute standings from full results) read from this.
  const events = await fetchCompetitionEvents(season).catch(() => new Map<number, Fixture[]>())

  const [competitions, fixtures] = await Promise.allSettled([
    fetchCompetitionTables(season, events),
    fetchSeasonFixtures(season, events),
  ])

  const warnings: string[] = []
  if (competitions.status === 'rejected')
    warnings.push(`Standings unavailable — ${String(competitions.reason?.message ?? competitions.reason)}`)
  if (fixtures.status === 'rejected')
    warnings.push(`Fixtures unavailable — ${String(fixtures.reason?.message ?? fixtures.reason)}`)

  return {
    competitions: competitions.status === 'fulfilled' ? competitions.value : [],
    results: fixtures.status === 'fulfilled' ? fixtures.value.results : [],
    upcoming: fixtures.status === 'fulfilled' ? fixtures.value.upcoming : [],
    warnings,
  }
}

// ---- player career (on demand) ------------------------------------------
// Loaded only when a squad row is expanded, and memoised for the session so
// collapsing and reopening the same player doesn't refetch.
const careerCache = new Map<string, Promise<PlayerCareer>>()

export function loadPlayerCareer(playerId: string): Promise<PlayerCareer> {
  if (!USE_LIVE) return Promise.resolve({ spells: [], honours: [] })

  const hit = careerCache.get(playerId)
  if (hit) return hit

  const pending = fetchPlayerCareer(playerId).catch((e) => {
    // Don't cache a failure — a later expand should be able to retry.
    careerCache.delete(playerId)
    throw e
  })
  careerCache.set(playerId, pending)
  return pending
}

// ---- pure selectors -----------------------------------------------------
export const lastResult = (d: AppData): Fixture | undefined => d.results[0]
export const nextMatch = (d: AppData): Fixture | undefined => d.upcoming[0]
export const standingFor = (d: AppData, teamId: string) =>
  d.standings.find((s) => s.team.id === teamId)

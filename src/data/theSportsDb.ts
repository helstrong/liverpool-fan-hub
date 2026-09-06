import { LEAGUE_ID, SEASON, SPORTSDB_BASE, TEAM_ID } from './config'
import type {
  ClubProfile,
  Fixture,
  FixtureStatus,
  Kit,
  Player,
  PlayerCareer,
  PlayerHonour,
  PlayerSpell,
  Position,
  Standing,
  Team,
} from './types'

// Thin client for TheSportsDB (https://www.thesportsdb.com/), JSON API v1.
// Each exported function maps a raw response into our own domain types so the
// rest of the app never sees the provider's shape.
//
// Requests go to the same-origin proxy (SPORTSDB_BASE); the server injects the
// API key and forwards to TheSportsDB, so no key is ever present in the browser.

async function request(path: string, params: Record<string, string | number>): Promise<any> {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) qs.set(key, String(value))
  const url = `${SPORTSDB_BASE}/${path}?${qs.toString()}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

const shortCode = (name: string) => name.replace(/[^\p{L}]/gu, '').slice(0, 3).toUpperCase() || '???'

const toTeam = (id: unknown, name: string, badge?: string): Team => ({
  id: String(id ?? ''),
  name,
  short: shortCode(name),
  badge: badge || undefined,
})

// TheSportsDB returns most numbers as strings; normalise safely.
const num = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const score = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : num(v)
const clean = (v: unknown): string | undefined => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s || undefined
}

// ---- Standings (top 5 on the free tier) ---------------------------------
async function fetchOfficialTable(season: string): Promise<Standing[]> {
  const { table } = await request('lookuptable.php', { l: LEAGUE_ID, s: season })
  const rows: any[] = table ?? []
  return rows.map((r) => ({
    rank: num(r.intRank),
    team: toTeam(r.idTeam, r.strTeam, r.strBadge),
    played: num(r.intPlayed),
    won: num(r.intWin),
    drawn: num(r.intDraw),
    lost: num(r.intLoss),
    gf: num(r.intGoalsFor),
    ga: num(r.intGoalsAgainst),
    points: num(r.intPoints),
    form: clean(r.strForm),
  }))
}

export interface LeagueTable {
  standings: Standing[]
  source: 'official' | 'computed'
  note?: string
}

const LEAGUE_COMPUTED_NOTE =
  'Computed from results — the published table hadn’t caught up with the latest matches yet. Tiebreakers are simplified (points, then goal difference, then goals scored) and may differ from the official table.'

// TheSportsDB recomputes lookuptable.php on its own schedule and can sit days
// behind the results it is already serving: after a matchday the table still
// shows the pre-match standings. Rather than show a table the app's own results
// contradict, compare the two and recompute from the fixtures when the
// published one is behind.
export async function fetchLeagueTable(
  season: string = SEASON,
  leagueEvents?: Fixture[],
): Promise<LeagueTable> {
  const [official, events] = await Promise.all([
    fetchOfficialTable(season).catch(() => [] as Standing[]),
    leagueEvents ? Promise.resolve(leagueEvents) : fetchSeasonEvents(LEAGUE_ID, season),
  ])

  const computed = computeStandingsFromFixtures(events)
  if (!computed.length) return { standings: official, source: 'official' }
  if (!official.length) return { standings: computed, source: 'computed', note: LEAGUE_COMPUTED_NOTE }

  // Compared per team rather than in aggregate, so a table truncated by the
  // free tier (top 5 only) isn't mistaken for a stale one.
  const playedByTeam = new Map(computed.map((r) => [r.team.id, r.played]))
  const behind = official.some((o) => (playedByTeam.get(o.team.id) ?? 0) > o.played)

  return behind
    ? { standings: computed, source: 'computed', note: LEAGUE_COMPUTED_NOTE }
    : { standings: official, source: 'official' }
}

export async function fetchStandings(season: string = SEASON): Promise<Standing[]> {
  return (await fetchLeagueTable(season)).standings
}

// ---- Fixtures (rolling ~5 last + ~5 next on the free tier) ---------------

// TheSportsDB gives kick-off times in UTC but writes them without a timezone
// designator ("2026-08-30T18:30:00"). JavaScript reads a bare date-time as
// LOCAL time, so that 18:30 UTC kick-off rendered as 18:30 for a viewer in
// UTC+2 instead of 20:30 — and the countdown was wrong by the same offset.
// Marking it as UTC lets toLocaleString put it in whatever zone the viewer is
// actually in. (strTimeLocal exists but is local to the venue, not the viewer.)
function toUtcIso(x: any): string {
  const raw: string = x.strTimestamp || (x.dateEvent ? `${x.dateEvent}T${x.strTime || '00:00:00'}` : '')
  if (!raw) return ''
  const s = raw.trim().replace(' ', 'T')
  // Leave it alone if the feed ever does include a zone, so this can't double up.
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(s) ? s : `${s}Z`
}

function toFixture(x: any): Fixture {
  const homeScore = score(x.intHomeScore)
  const awayScore = score(x.intAwayScore)
  // "Match Finished" / "FT" or both scores present ⇒ finished; otherwise upcoming.
  const finished =
    /finished|ft|aet|pen/i.test(String(x.strStatus ?? '')) ||
    (homeScore !== null && awayScore !== null)
  const status: FixtureStatus = finished ? 'finished' : 'upcoming'
  const date = toUtcIso(x)
  return {
    id: String(x.idEvent),
    competition: x.strLeague ?? 'Süper Lig',
    date,
    home: toTeam(x.idHomeTeam, x.strHomeTeam, x.strHomeTeamBadge),
    away: toTeam(x.idAwayTeam, x.strAwayTeam, x.strAwayTeamBadge),
    homeScore,
    awayScore,
    status,
    venue: x.strVenue ?? '',
    round: clean(x.intRound),
    thumb: clean(x.strThumb),
  }
}

export async function fetchFixtures(): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const [last, next] = await Promise.all([
    request('eventslast.php', { id: TEAM_ID }), // returns { results: [...] }
    request('eventsnext.php', { id: TEAM_ID }), // returns { events: [...] }
  ])

  const results = ((last.results ?? last.events ?? []) as any[])
    .map(toFixture)
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const upcoming = ((next.events ?? []) as any[])
    .map(toFixture)
    .filter((f) => f.status !== 'finished')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  return { results, upcoming }
}

// Competitions Liverpool may play in a given season. eventsseason returns the
// whole competition, so we query each and keep every match (not just our
// team's) — the full list is also what lets us compute a standings table for
// competitions TheSportsDB doesn't supply one for (see fetchCompetitionTables).
const COMPETITIONS: { id: number; name: string }[] = [
  { id: LEAGUE_ID, name: 'Premier League' },
  { id: 4482, name: 'FA Cup' },
  { id: 4570, name: 'EFL Cup' },
  { id: 4480, name: 'UEFA Champions League' },
  { id: 4481, name: 'UEFA Europa League' },
  { id: 5071, name: 'UEFA Conference League' },
]

// Fetch every match of every candidate competition for a season, once. Shared
// by fetchSeasonFixtures (filters to our team) and fetchCompetitionTables
// (uses the full list to compute a table) so neither refetches the other's data.
async function fetchSeasonEvents(competitionId: number, season: string): Promise<Fixture[]> {
  return request('eventsseason.php', { id: competitionId, s: season })
    .then((r) => ((r.events ?? []) as any[]).map(toFixture))
    .catch(() => [] as Fixture[])
}

export async function fetchCompetitionEvents(season: string): Promise<Map<number, Fixture[]>> {
  const lists = await Promise.all(COMPETITIONS.map(({ id }) => fetchSeasonEvents(id, season)))
  return new Map(COMPETITIONS.map(({ id }, i) => [id, lists[i]]))
}

// A season "2025-2026" runs ~Jul 2025 → Jun 2026. Used to attribute rolling
// events (which include friendlies) to the selected season by date.
function seasonRange(season: string): [number, number] {
  const start = parseInt(season, 10)
  return [Date.UTC(start, 6, 1), Date.UTC(start + 1, 5, 30, 23, 59, 59)]
}

// Full season across every competition (league, cup, European) plus friendlies.
// Friendlies aren't reliably in eventsseason, so we fold in the team's rolling
// events that fall inside the season window and dedupe by id.
export async function fetchSeasonFixtures(
  season: string = SEASON,
  eventsByCompetition?: Map<number, Fixture[]>,
): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const team = String(TEAM_ID)
  const events = eventsByCompetition ?? (await fetchCompetitionEvents(season))

  const rollingRaw = await Promise.all(
    [
      request('eventslast.php', { id: TEAM_ID }).then((r) => (r.results ?? r.events ?? []) as any[]),
      request('eventsnext.php', { id: TEAM_ID }).then((r) => (r.events ?? []) as any[]),
    ].map((p) => p.catch(() => [] as any[])),
  )

  const byId = new Map<string, Fixture>()
  for (const list of events.values())
    for (const f of list) if (f.home.id === team || f.away.id === team) byId.set(f.id, f)

  // Rolling events (all competitions incl. friendlies) within the season window.
  const [from, to] = seasonRange(season)
  for (const raw of rollingRaw)
    for (const x of raw) {
      const f = toFixture(x)
      if (byId.has(f.id) || (f.home.id !== team && f.away.id !== team)) continue
      const t = +new Date(f.date)
      if (t >= from && t <= to) byId.set(f.id, f)
    }

  const all = [...byId.values()]
  const results = all
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const upcoming = all
    .filter((f) => f.status !== 'finished')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  return { results, upcoming }
}

// Builds a standings table from a set of finished matches. Used where
// TheSportsDB doesn't supply an official table (UEFA's Swiss-format single
// table) — real results, but tiebreakers are simplified (points → goal
// difference → goals scored) rather than UEFA's full tiebreak rules.
function computeStandingsFromFixtures(fixtures: Fixture[]): Standing[] {
  interface Row {
    team: Team
    played: number
    won: number
    drawn: number
    lost: number
    gf: number
    ga: number
    points: number
    // Kept with kick-off times so the form string can be ordered oldest →
    // newest, matching how TheSportsDB writes its own strForm.
    history: { at: number; result: 'W' | 'D' | 'L' }[]
  }
  const rows = new Map<string, Row>()
  const row = (team: Team): Row => {
    let r = rows.get(team.id)
    if (!r) {
      r = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, history: [] }
      rows.set(team.id, r)
    }
    return r
  }

  for (const f of fixtures) {
    if (f.status !== 'finished' || f.homeScore === null || f.awayScore === null) continue
    const home = row(f.home)
    const away = row(f.away)
    home.played++
    away.played++
    home.gf += f.homeScore
    home.ga += f.awayScore
    away.gf += f.awayScore
    away.ga += f.homeScore
    const at = +new Date(f.date)
    if (f.homeScore > f.awayScore) {
      home.won++
      away.lost++
      home.points += 3
      home.history.push({ at, result: 'W' })
      away.history.push({ at, result: 'L' })
    } else if (f.homeScore < f.awayScore) {
      away.won++
      home.lost++
      away.points += 3
      home.history.push({ at, result: 'L' })
      away.history.push({ at, result: 'W' })
    } else {
      home.drawn++
      away.drawn++
      home.points++
      away.points++
      home.history.push({ at, result: 'D' })
      away.history.push({ at, result: 'D' })
    }
  }

  const formOf = (history: Row['history']) =>
    [...history]
      .sort((a, b) => a.at - b.at)
      .slice(-5)
      .map((h) => h.result)
      .join('') || undefined

  return [...rows.values()]
    .sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf)
    .map(({ history, ...r }, i) => ({ rank: i + 1, ...r, form: formOf(history) }))
}

export interface KnockoutStage {
  round: RoundRef
  fixtures: Fixture[]
}

export interface CompetitionStandings {
  competitionId: number
  competitionName: string
  source: 'official' | 'computed' | 'unavailable'
  standings: Standing[]
  knockout: KnockoutStage[]
  note?: string
  /**
   * Every match in this competition this season, not just Liverpool's — the
   * same array already fetched to build the table, shared by reference so
   * expanding a table row can show that club's season without another request.
   */
  events: Fixture[]
}

// First season UEFA's club competitions used a single Swiss-format table
// instead of groups — a standalone table is only meaningful from here on.
const EURO_SINGLE_TABLE_FROM_YEAR = 2024

// England has two domestic cups and both are straight knockouts, so neither
// ever has a table — unlike the single Turkish Cup this was adapted from.
const DOMESTIC_CUP_IDS = new Set([4482, 4570])

// eventsseason returns every stage of the competition together — qualifying
// rounds, the 8-match Swiss league phase, and the knockout rounds — all in one
// list. TheSportsDB codes the league-phase matchdays as intRound 1-8; every
// knockout/qualifying stage uses a distinct, larger code (16, 32, 125, 150,
// 200, 400, ...). Only the league-phase matches make up the single table.
function isLeaguePhase(f: Fixture): boolean {
  const round = Number(f.round)
  return Number.isFinite(round) && round >= 1 && round <= 8
}

// Maps TheSportsDB's knockout round codes to a human stage name. Verified
// live across both the pre-2024 group-stage era and the post-2024 Swiss
// format — the codes for the business end (Ro16 onward) are stable across
// both, but the play-off round before it uses a different code per era
// (160 pre-2024, 32 post-2024), so both are mapped defensively.
// A round resolves to a translation id plus an optional number, rather than to
// finished English text — the data layer has no access to the active language,
// so the UI does the wording (see lib/useRoundLabel).
export interface RoundRef {
  id: 'matchday' | 'round' | 'qualifying' | 'playoff' | 'r16' | 'quarter' | 'semi' | 'final' | 'knockout'
  n?: string
}

const KNOCKOUT_STAGE_IDS: Record<string, RoundRef['id']> = {
  '400': 'qualifying',
  '160': 'playoff',
  '32': 'playoff',
  '16': 'r16',
  '125': 'quarter',
  '150': 'semi',
  '200': 'final',
}

// Resolves a fixture's round code into a human label appropriate to its
// competition: the Swiss-format league-phase matchday for UEFA competitions'
// rounds 1-8, a named knockout stage for UEFA/Turkish Cup knockout rounds, or
// a literal round number for anything else (domestic league, friendlies).
export function roundRef(fixture: Fixture): RoundRef | undefined {
  const round = fixture.round
  // '0' consistently means "not set" in this data (seen on friendlies and on
  // at least one cup fixture that was clearly a later round) — never show it.
  if (!round || round === '0') return undefined

  if (fixture.competition.startsWith('UEFA ')) {
    const n = Number(round)
    if (Number.isFinite(n) && n >= 1 && n <= 8) return { id: 'matchday', n: round }
    return { id: KNOCKOUT_STAGE_IDS[round] ?? 'knockout' }
  }

  if (/\b(FA Cup|EFL Cup|League Cup|Carabao)\b/i.test(fixture.competition)) {
    if (KNOCKOUT_STAGE_IDS[round]) return { id: KNOCKOUT_STAGE_IDS[round] }
    if (/^\d+$/.test(round)) return { id: 'round', n: round }
    return { id: 'knockout' }
  }

  return { id: 'round', n: round }
}

// Groups a team's own matches into knockout stages (Qualifying, Play-off,
// Round of 16, ...), ordered by when each stage was actually played.
function buildKnockoutStages(fixtures: Fixture[]): KnockoutStage[] {
  // Keyed by a composed id rather than by display text, so grouping no longer
  // depends on the label's wording.
  const byStage = new Map<string, KnockoutStage>()
  for (const f of fixtures) {
    const round = roundRef(f) ?? ({ id: 'knockout' } as RoundRef)
    const key = `${round.id}:${round.n ?? ''}`
    const stage = byStage.get(key) ?? { round, fixtures: [] }
    stage.fixtures.push(f)
    byStage.set(key, stage)
  }

  const stages = [...byStage.values()]
  for (const stage of stages) stage.fixtures.sort((a, b) => +new Date(a.date) - +new Date(b.date))
  stages.sort((a, b) => +new Date(a.fixtures[0].date) - +new Date(b.fixtures[0].date))
  return stages
}

// One entry per competition Liverpool actually played in the given season:
// the official Süper Lig table, a computed table for post-2024 UEFA
// competitions, or a short explanatory note where no table is possible
// (Turkish Cup is always a knockout; pre-2024 UEFA group stages can't be
// reconstructed from fixtures alone) — paired in both cases with Liverpool's
// actual knockout-stage results, since those are real regardless of format era.
export async function fetchCompetitionTables(
  season: string = SEASON,
  eventsByCompetition?: Map<number, Fixture[]>,
): Promise<CompetitionStandings[]> {
  const team = String(TEAM_ID)
  const events = eventsByCompetition ?? (await fetchCompetitionEvents(season))
  const seasonStartYear = parseInt(season, 10)
  const out: CompetitionStandings[] = []

  for (const { id, name } of COMPETITIONS) {
    const list = events.get(id) ?? []
    const own = list.filter((f) => f.home.id === team || f.away.id === team)
    if (!own.length) continue // Liverpool didn't play this one this season

    if (id === LEAGUE_ID) {
      // Reuses the season's events we already have rather than refetching them.
      const table = await fetchLeagueTable(season, list)
      out.push({
        competitionId: id,
        competitionName: name,
        source: table.source,
        standings: table.standings,
        knockout: [],
        events: list,
        note: table.note,
      })
      continue
    }

    if (DOMESTIC_CUP_IDS.has(id)) {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'unavailable',
        standings: [],
        knockout: buildKnockoutStages(own),
        events: list,
        note: 'Knockout competition — there is no league table.',
      })
      continue
    }

    const knockout = buildKnockoutStages(own.filter((f) => !isLeaguePhase(f)))

    if (Number.isFinite(seasonStartYear) && seasonStartYear >= EURO_SINGLE_TABLE_FROM_YEAR) {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'computed',
        standings: computeStandingsFromFixtures(list.filter(isLeaguePhase)),
        knockout,
        events: list,
        note: 'Computed from match results — not supplied by the data source. Tiebreakers are simplified (points, then goal difference, then goals scored) and may differ slightly from the official UEFA table.',
      })
    } else {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'unavailable',
        standings: [],
        knockout,
        events: list,
        note: 'Group-stage era — a single table isn’t available from this data source.',
      })
    }
  }

  return out
}

// ---- Head-to-head --------------------------------------------------------
// The Premier League archive is complete back to the competition's first
// season in 1992-93, so a head-to-head really can span the full 35 years.
// That is also why the fetch below is throttled: one request per season is
// 35 of them, and firing those at once invites a rate-limit rejection.
const ARCHIVE_START_YEAR = 1992
const HEAD_TO_HEAD_CONCURRENCY = 6

export function archivedSeasons(from: string = SEASON): string[] {
  const start = parseInt(from, 10)
  if (!Number.isFinite(start)) return [from]
  const out: string[] = []
  for (let year = start; year >= ARCHIVE_START_YEAR; year--) out.push(`${year}-${year + 1}`)
  return out
}

// Every completed meeting between Liverpool and one opponent in a given
// competition, newest first. One request per archived season; each is cached by
// the proxy, and a season that fails resolves to nothing rather than sinking
// the whole record.
export async function fetchHeadToHead(
  competitionId: number,
  opponentId: string,
): Promise<{ fixtures: Fixture[]; seasons: string[] }> {
  const team = String(TEAM_ID)
  const seasons = archivedSeasons()

  // Worked through in small waves rather than all at once. Each response is
  // cached by the proxy, so this is only slow the first time an opponent is
  // opened; after that the waves resolve from cache.
  const lists: Fixture[][] = []
  for (let i = 0; i < seasons.length; i += HEAD_TO_HEAD_CONCURRENCY) {
    const wave = seasons.slice(i, i + HEAD_TO_HEAD_CONCURRENCY)
    lists.push(...(await Promise.all(wave.map((s) => fetchSeasonEvents(competitionId, s)))))
  }

  const fixtures = lists
    .flat()
    .filter(
      (f) =>
        (f.home.id === team && f.away.id === opponentId) ||
        (f.away.id === team && f.home.id === opponentId),
    )
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return { fixtures, seasons }
}

// ---- Squad (bio only, ~10 players on the free tier) ---------------------
// lookup_all_players.php mixes coaching staff into the roster (e.g. Ismail
// Kartal, Dirk Kuyt) with no real strPosition, so they'd otherwise fall
// through to the Midfielder default below. Filter them out by role instead.
const isCoachingStaff = (p?: string): boolean => {
  const s = (p ?? '').toLowerCase()
  return s.includes('coach') || s.includes('manager')
}

const mapPosition = (p?: string): Position => {
  const s = (p ?? '').toLowerCase()
  if (s.includes('keeper') || s.includes('goal')) return 'Goalkeeper'
  // Check midfield first: "Defensive Midfield" contains "defen" but is a midfielder.
  if (s.includes('midfield')) return 'Midfielder'
  if (s.includes('back') || s.includes('defen') || s.includes('centre-b')) return 'Defender'
  if (s.includes('forward') || s.includes('wing') || s.includes('strik') || s.includes('attack'))
    return 'Forward'
  return 'Midfielder'
}

function ageFrom(dateBorn?: string): number {
  if (!dateBorn) return 0
  const born = new Date(dateBorn)
  if (Number.isNaN(+born)) return 0
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--
  return age > 0 ? age : 0
}

export async function fetchPlayers(): Promise<Player[]> {
  const { player } = await request('lookup_all_players.php', { id: TEAM_ID })
  const roster: any[] = (player ?? []).filter((p: any) => !isCoachingStaff(p.strPosition))
  return roster.map((p) => ({
    id: String(p.idPlayer),
    name: p.strPlayer,
    number: num(p.strNumber),
    position: mapPosition(p.strPosition),
    nationality: clean(p.strNationality) ?? '',
    age: ageFrom(p.dateBorn),
    photo: clean(p.strCutout) ?? clean(p.strThumb),
    foot: clean(p.strSide),
    height: clean(p.strHeight),
    weight: clean(p.strWeight),
    birthplace: clean(p.strBirthLocation),
    signing: clean(p.strSigning),
    // Already present on the roster response, so the bio costs no extra request.
    description: clean(p.strDescriptionEN),
  }))
}

// Career history for one player, fetched only when a squad row is expanded.
// Honours are grouped by trophy so a serial winner reads as "Premier League ×3"
// rather than three near-identical rows. lookupcontracts is deliberately not
// used: it returns a single row that duplicates the former-teams data with an
// empty wage field, so it isn't worth a third request.
export async function fetchPlayerCareer(playerId: string): Promise<PlayerCareer> {
  const [honoursRes, formerRes] = await Promise.allSettled([
    request('lookuphonours.php', { id: playerId }),
    request('lookupformerteams.php', { id: playerId }),
  ])

  const honourRows: any[] =
    (honoursRes.status === 'fulfilled' ? honoursRes.value?.honours : null) ?? []
  const formerRows: any[] =
    (formerRes.status === 'fulfilled' ? formerRes.value?.formerteams : null) ?? []

  const grouped = new Map<string, PlayerHonour>()
  for (const h of honourRows) {
    const honour = clean(h.strHonour)
    if (!honour) continue
    const key = `${honour}|${clean(h.strTeam) ?? ''}`
    const entry = grouped.get(key) ?? { honour, team: clean(h.strTeam), seasons: [] }
    const season = clean(h.strSeason)
    if (season && !entry.seasons.includes(season)) entry.seasons.push(season)
    grouped.set(key, entry)
  }

  const honours = [...grouped.values()]
    .map((h) => ({ ...h, seasons: h.seasons.sort() }))
    .sort((a, b) => b.seasons.length - a.seasons.length || a.honour.localeCompare(b.honour))

  const spells: PlayerSpell[] = formerRows
    .map((f) => ({
      team: (clean(f.strFormerTeam) ?? '').trim(),
      badge: clean(f.strBadge),
      joined: clean(f.strJoined),
      departed: clean(f.strDeparted),
      appearances: f.intAppearances != null ? num(f.intAppearances) : undefined,
      goals: f.intGoals != null ? num(f.intGoals) : undefined,
    }))
    .filter((s) => s.team)
    // Most recent spell first.
    .sort((a, b) => Number(b.joined ?? 0) - Number(a.joined ?? 0))

  return { spells, honours }
}

// ---- Club profile -------------------------------------------------------
export async function fetchClub(): Promise<ClubProfile> {
  const { teams } = await request('lookupteam.php', { id: TEAM_ID })
  const t = teams?.[0]
  if (!t) throw new Error('lookupteam: no team returned')

  const competitions = [t.strLeague, t.strLeague2, t.strLeague3].map(clean).filter(Boolean) as string[]
  const fanart = [t.strFanart1, t.strFanart2, t.strFanart3, t.strFanart4].map(clean).filter(Boolean) as string[]

  return {
    name: t.strTeam,
    altName: clean(t.strTeamAlternate),
    nicknames: clean(t.strKeywords),
    formedYear: clean(t.intFormedYear),
    stadium: clean(t.strStadium),
    capacity: clean(t.intStadiumCapacity),
    location: clean(t.strLocation),
    country: clean(t.strCountry),
    description: clean(t.strDescriptionEN),
    competitions,
    badge: clean(t.strBadge),
    logo: clean(t.strLogo),
    banner: clean(t.strBanner),
    fanart,
    website: clean(t.strWebsite),
    facebook: clean(t.strFacebook),
    twitter: clean(t.strTwitter),
    instagram: clean(t.strInstagram),
    youtube: clean(t.strYoutube),
  }
}

// ---- Kits / jerseys -----------------------------------------------------
export async function fetchKits(): Promise<Kit[]> {
  const { equipment } = await request('lookupequipment.php', { id: TEAM_ID })
  const rows: any[] = equipment ?? []
  return rows
    .map((e) => ({
      season: clean(e.strSeason) ?? '',
      type: clean(e.strType) ?? '',
      image: clean(e.strEquipment) ?? '',
    }))
    .filter((k) => k.image)
}

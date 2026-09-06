export type FixtureStatus = 'finished' | 'upcoming' | 'live'

export interface Team {
  id: string
  name: string
  short: string
  badge?: string // crest image URL
}

export interface Fixture {
  id: string
  competition: string
  date: string // ISO date-time
  home: Team
  away: Team
  homeScore: number | null
  awayScore: number | null
  status: FixtureStatus
  venue: string
  round?: string // matchday / round number
  thumb?: string // match poster image URL
}

export interface Standing {
  rank: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  points: number
  form?: string // last 5 results, e.g. "DWWLD"
}

export type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'

// The free tier carries player bio only (no match stats), so this is who they
// are rather than how they've performed.
export interface Player {
  id: string
  name: string
  number: number
  position: Position
  nationality: string
  age: number
  photo?: string // cutout/thumbnail image URL
  foot?: string // preferred side, e.g. "Right"
  height?: string // e.g. "173 cm"
  weight?: string // e.g. "148 lbs"
  birthplace?: string
  signing?: string // e.g. "on Loan (Al-Ahli)"
  description?: string
}

// Career history, loaded on demand when a squad row is expanded. This provider
// publishes no per-match statistics for this league, so "stats" here means
// career aggregates per club (appearances and goals) plus honours won — who a
// player has been, rather than how they've performed this season.
export interface PlayerSpell {
  team: string
  badge?: string
  joined?: string
  departed?: string
  appearances?: number
  goals?: number
}

export interface PlayerHonour {
  honour: string
  team?: string
  seasons: string[]
}

export interface PlayerCareer {
  spells: PlayerSpell[]
  honours: PlayerHonour[]
}

// Club identity / profile from lookupteam.
export interface ClubProfile {
  name: string
  altName?: string
  nicknames?: string
  formedYear?: string
  stadium?: string
  capacity?: string
  location?: string
  country?: string
  description?: string
  competitions?: string[] // leagues/cups the club plays in
  badge?: string
  logo?: string
  banner?: string
  fanart?: string[]
  website?: string
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
}

export interface Kit {
  season: string
  type: string // "1st", "2nd", ...
  image: string
}

// From a curated, trusted-source-filtered news feed — see server/news.js.
export interface NewsItem {
  title: string
  link: string
  source: string
  publishedAt: string | null // ISO date-time
}

// Everything the UI needs for one render, loaded together at app start.
export interface AppData {
  club?: ClubProfile
  standings: Standing[]
  results: Fixture[]
  upcoming: Fixture[]
  players: Player[]
  kits: Kit[]
  news: NewsItem[]
  live: boolean
  warnings: string[]
}
